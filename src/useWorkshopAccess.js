import { useCallback, useEffect, useState } from 'react';

const endpoint = 'https://pygfszldqbjuctlpttyf.supabase.co/functions/v1/workshop';
const sessionKey = 'gdg2026-presenter-session';
const browserKey = 'gdg2026-browser-id';
const localSite = ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);

function browserId() {
  try {
    let id = localStorage.getItem(browserKey);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(browserKey, id);
    }
    return id;
  } catch { return ''; }
}

function session() {
  try { return sessionStorage.getItem(sessionKey) || ''; } catch { return ''; }
}

function saveSession(token) {
  try {
    if (token) sessionStorage.setItem(sessionKey, token);
    else sessionStorage.removeItem(sessionKey);
  } catch { /* La sesión seguirá activa hasta cerrar esta pestaña. */ }
}

async function request(body) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    // En local no acumulamos los cinco fallos por navegador. El límite por red sigue en Supabase.
    const clientId = localSite && body?.action === 'login' ? crypto.randomUUID() : browserId();
    const response = await fetch(endpoint, {
      method: body ? 'POST' : 'GET',
      headers: { 'Content-Type': 'application/json', 'x-workshop-client': clientId, ...(session() ? { 'x-workshop-session': session() } : {}) },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
      cache: 'no-store',
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'No se ha podido conectar con el taller.');
    return data;
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('La conexión está tardando demasiado.');
    throw error;
  } finally { clearTimeout(timeout); }
}

export function useWorkshopAccess() {
  const [access, setAccess] = useState({ status: 'loading', unlocked: [], presenter: false, error: '' });
  const refresh = useCallback(async () => {
    try {
      const data = await request();
      if (session() && !data.presenter) saveSession('');
      setAccess({ status: 'ready', unlocked: data.unlocked || [], presenter: Boolean(data.presenter), error: '' });
      return data;
    } catch (error) {
      setAccess(old => ({ ...old, status: 'error', presenter: false, unlocked: [], error: error.message }));
      throw error;
    }
  }, []);

  useEffect(() => {
    refresh().catch(() => {});
    const timer = window.setInterval(() => refresh().catch(() => {}), 5000);
    const onVisible = () => { if (!document.hidden) refresh().catch(() => {}); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', onVisible); };
  }, [refresh]);

  const login = useCallback(async password => {
    const data = await request({ action: 'login', password });
    saveSession(data.token);
    setAccess({ status: 'ready', unlocked: data.unlocked || [], presenter: true, error: '' });
  }, []);

  const setLesson = useCallback(async (section, available) => {
    try {
      const data = await request({ action: 'setLesson', section, available });
      setAccess({ status: 'ready', unlocked: data.unlocked || [], presenter: true, error: '' });
      return data;
    } catch (error) {
      if (error.message.includes('caducado')) {
        saveSession('');
        setAccess(old => ({ ...old, presenter: false }));
      }
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try { await request({ action: 'logout' }); } catch { /* La sesión se borra del navegador igualmente. */ }
    saveSession('');
    setAccess(old => ({ ...old, presenter: false }));
  }, []);

  return { ...access, refresh, login, setLesson, logout };
}
