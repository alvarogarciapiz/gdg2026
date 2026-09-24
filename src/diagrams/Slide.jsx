import React, { useState } from 'react';

export const number = (n, digits = 1) => n.toLocaleString('es-ES', { maximumFractionDigits: digits });

export function Slide({ label, children, note, className = '' }) {
  return <section className={`workshop-support ${className}`} aria-label={label}>
    {children}
    {note && <p className="support-note">{note}</p>}
  </section>;
}

export function Asset({ src, alt, className = '', fallback }) {
  const [failed, setFailed] = useState(false);
  return failed ? <span className={className}>{fallback || alt}</span> : <img src={src} alt={alt} className={className} onError={() => setFailed(true)}/>;
}

export function Choice({ label, options, value, onChange }) {
  return <div className="support-choice" role="group" aria-label={label}>
    {options.map(option => <button type="button" key={option.value} aria-pressed={value === option.value} onClick={() => onChange(option.value)}>{option.label}</button>)}
  </div>;
}
