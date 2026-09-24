// Función pública para leer el avance del taller. Las escrituras exigen una sesión de ponente.
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'content-type, x-workshop-session, x-workshop-client, apikey, authorization',
  'Cache-Control': 'no-store',
};
const encoder = new TextEncoder();

function reply(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function bytesFromHex(hex: string) {
  if (!/^(?:[0-9a-f]{2})+$/i.test(hex)) throw new Error('Invalid stored salt');
  return new Uint8Array(hex.match(/.{2}/g)!.map((part) => parseInt(part, 16)));
}

function hex(bytes: ArrayBuffer) {
  return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function sha256(value: string) {
  return hex(await crypto.subtle.digest('SHA-256', encoder.encode(value)));
}

async function passwordMatches(candidate: string, salt: string, expected: string) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(candidate), 'PBKDF2', false, ['deriveBits']);
  const actual = hex(await crypto.subtle.deriveBits({
    name: 'PBKDF2', salt: bytesFromHex(salt), iterations: 180_000, hash: 'SHA-256',
  }, key, 256));
  if (actual.length !== expected.length) return false;
  let difference = 0;
  for (let i = 0; i < actual.length; i++) difference |= actual.charCodeAt(i) ^ expected.charCodeAt(i);
  return difference === 0;
}

function credentials() {
  const url = Deno.env.get('SUPABASE_URL');
  const keyMap = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}');
  const key = keyMap.default || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) throw new Error('Supabase credentials unavailable');
  return { url, key };
}

async function database(path: string, options: RequestInit = {}) {
  const { url, key } = credentials();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: key,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  if (!response.ok) throw new Error(`Database request failed (${response.status})`);
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function state() {
  const rows = await database('workshop_state?id=eq.1&select=unlocked,updated_at&limit=1');
  if (!Array.isArray(rows) || !rows[0]) throw new Error('Workshop state missing');
  return { unlocked: rows[0].unlocked || [], updatedAt: rows[0].updated_at };
}

async function sessionHash(request: Request) {
  const token = request.headers.get('x-workshop-session') || '';
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  const hash = await sha256(token);
  const rows = await database(`presenter_sessions?token_hash=eq.${hash}&select=expires_at&limit=1`);
  return Array.isArray(rows) && rows[0] && Date.parse(rows[0].expires_at) > Date.now() ? hash : null;
}

function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  try {
    if (request.method === 'GET') {
      const [workshop, presenter] = await Promise.all([state(), sessionHash(request)]);
      return reply({ ...workshop, presenter: Boolean(presenter) });
    }
    if (request.method !== 'POST') return reply({ error: 'Método no permitido.' }, 405);
    if (Number(request.headers.get('content-length') || '0') > 2048) return reply({ error: 'Solicitud demasiado grande.' }, 413);
    let data: Record<string, unknown>;
    try { data = await request.json(); } catch { return reply({ error: 'Solicitud no válida.' }, 400); }

    if (data.action === 'login') {
      const password = data.password;
      if (typeof password !== 'string' || !password || password.length > 128) return reply({ error: 'Contraseña no válida.' }, 400);
      const { key } = credentials();
      const network = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
      const visitor = request.headers.get('x-workshop-client') || '';
      const browser = /^[0-9a-f-]{36}$/i.test(visitor) ? visitor : `sin-id:${network}`;
      const browserHash = await sha256(`${key}:browser:${browser}`);
      const networkHash = await sha256(`${key}:network:${network}`);
      const attempts = async (hash: string, record: boolean) => Number(await database('rpc/presenter_attempt_count', {
        method: 'POST', body: JSON.stringify({ p_client_hash: hash, p_record: record }),
      }));
      const [browserCount, networkCount] = await Promise.all([attempts(browserHash, false), attempts(networkHash, false)]);
      if (browserCount >= 5) return reply({ error: 'Bien jugado. Este navegador ha agotado sus cinco intentos. Prueba dentro de diez minutos.' }, 429);
      if (networkCount >= 30) return reply({ error: 'Demasiados intentos desde esta red. Prueba dentro de diez minutos.' }, 429);
      const rows = await database('presenter_credentials?id=eq.1&select=salt,password_hash&limit=1');
      const record = Array.isArray(rows) ? rows[0] : null;
      if (!record || !(await passwordMatches(password, record.salt, record.password_hash))) {
        const [failedBrowserCount] = await Promise.all([attempts(browserHash, true), attempts(networkHash, true)]);
        if (failedBrowserCount >= 5) return reply({ error: 'Bien jugado. Este navegador ha agotado sus cinco intentos. Prueba dentro de diez minutos.' }, 429);
        return reply({ error: 'Contraseña incorrecta.' }, 401);
      }
      await database(`presenter_login_attempts?client_hash=eq.${browserHash}`, { method: 'DELETE' });
      const token = randomToken();
      await database('presenter_sessions', {
        method: 'POST',
        body: JSON.stringify({ token_hash: await sha256(token), expires_at: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString() }),
      });
      return reply({ token, ...(await state()), presenter: true });
    }

    const presenter = await sessionHash(request);
    if (!presenter) return reply({ error: 'La sesión de ponente ha caducado.' }, 401);
    if (data.action === 'logout') {
      await database(`presenter_sessions?token_hash=eq.${presenter}`, { method: 'DELETE' });
      return reply({ presenter: false });
    }
    if (data.action === 'setLesson') {
      if (!Number.isInteger(data.section) || Number(data.section) < 1 || Number(data.section) > 11 || typeof data.available !== 'boolean') {
        return reply({ error: 'Lección no válida.' }, 400);
      }
      await database('rpc/set_lesson_access', {
        method: 'POST', body: JSON.stringify({ p_section: data.section, p_available: data.available }),
      });
      return reply({ ...(await state()), presenter: true });
    }
    return reply({ error: 'Acción no válida.' }, 400);
  } catch (error) {
    console.error('Workshop API error', error instanceof Error ? error.message : 'Unknown');
    return reply({ error: 'No se ha podido conectar con el taller.' }, 503);
  }
});
