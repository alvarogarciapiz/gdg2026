import React, { useEffect, useRef, useState } from 'react';
import { LockKeyhole, X, ArrowLeft, ExternalLink } from 'lucide-react';
import { sections } from './workshopData.js';

function Modal({ onClose, title, children, className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => { if (dialog.open) dialog.close(); };
  }, []);
  return <dialog ref={ref} className={`workshop-dialog ${className}`} onCancel={event => { event.preventDefault(); onClose(); }} aria-label={title}>
    <div className="dialog-heading"><h2>{title}</h2><button type="button" onClick={onClose} aria-label="Cerrar"><X size={20}/></button></div>
    {children}
  </dialog>;
}

export function LoginDialog({ onClose, onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async event => {
    event.preventDefault();
    setBusy(true); setError('');
    try { await onLogin(password); onClose(); }
    catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  };
  return <Modal title="Acceso de ponentes" onClose={onClose} className="login-dialog">
    <p>Introduce la contraseña del taller.</p>
    <form onSubmit={submit}>
      <label htmlFor="presenter-password">Contraseña</label>
      <input id="presenter-password" type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} autoFocus required />
      {error && <p className="form-error" role="alert">{error}</p>}
      <button type="submit" className="solid-button" disabled={busy}>{busy ? 'Comprobando…' : 'Entrar'}</button>
    </form>
  </Modal>;
}

export function AdminDialog({ onClose, unlocked, onSetLesson, onLogout }) {
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState('');
  const toggle = async section => {
    setBusy(section.id); setError('');
    try { await onSetLesson(Number(section.id), !unlocked.includes(Number(section.id))); }
    catch (failure) { setError(failure.message); }
    finally { setBusy(null); }
  };
  return <Modal title="Lecciones disponibles" onClose={onClose} className="admin-dialog">
    <p>Al abrir una lección también se abre para quienes siguen el taller.</p>
    <div className="admin-list">{sections.map(section => {
      const available = unlocked.includes(Number(section.id));
      return <div className="admin-lesson" key={section.id}>
        <span className="admin-number">{section.id}</span>
        <span>{section.title}</span>
        <button type="button" className={available ? 'is-open' : ''} aria-label={`${available ? 'Cerrar' : 'Abrir'} sección ${Number(section.id)}: ${section.title}`} aria-pressed={available} disabled={busy !== null} onClick={() => toggle(section)}>{busy === section.id ? 'Guardando…' : available ? 'Abierta' : 'Cerrada'}</button>
      </div>;
    })}</div>
    {error && <p className="form-error" role="alert">{error}</p>}
    <button type="button" className="admin-logout" onClick={() => { onLogout(); onClose(); }}>Salir del modo ponentes</button>
  </Modal>;
}

export function QrView({ onBack }) {
  return <main className="qr-page">
    <div className="qr-topline"><span>GDG Valladolid · VallaTech Summit 2026</span><button type="button" onClick={onBack}><ArrowLeft size={19}/> Volver al taller</button></div>
    <div className="qr-content"><p className="qr-eyebrow">Material del taller</p><h1>Inferencia de LLMs<br/>en local</h1><img src="/qr-gdg-lvrpiz.svg" alt="Código QR que lleva a gdg.lvrpiz.com"/><a href="https://gdg.lvrpiz.com" target="_blank" rel="noreferrer">gdg.lvrpiz.com <ExternalLink size={19} aria-hidden="true"/></a></div>
  </main>;
}

export function LockedView({ section, onMap }) {
  return <main className="locked-page">
    <div className="locked-content"><span className="locked-number">{section.id} / 11</span><LockKeyhole size={32} strokeWidth={1.5} aria-hidden="true"/><h1>{section.title}</h1><p>Esta lección se abrirá durante el taller.</p><button type="button" onClick={onMap}><ArrowLeft size={18}/> Volver al mapa</button></div>
  </main>;
}

export function ConnectionView({ status, error, onRetry }) {
  return <main className="locked-page">
    <div className="locked-content"><h1>{status === 'loading' ? 'Conectando con el taller…' : 'No se puede consultar el avance'}</h1>
      <p>{status === 'loading' ? 'Un momento.' : error || 'Revisa la conexión y vuelve a intentarlo.'}</p>
      {status === 'error' && <button type="button" onClick={() => onRetry().catch(() => {})}>Reintentar</button>}
    </div>
  </main>;
}
