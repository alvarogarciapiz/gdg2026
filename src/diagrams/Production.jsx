import React, { useState } from 'react';
import { Server, ArrowRight } from 'lucide-react';
import { Slide } from './Slide';

export function ProductionVisual() {
  const [failed, setFailed] = useState(false);
  return <Slide label="Servicio con dos réplicas" note="Arquitectura simplificada. Una réplica recibe tráfico después de cargar el modelo y completar el calentamiento. Kubernetes es una opción, no un requisito.">
    <ol className="service-chain">{['Clientes', 'Pasarela API', 'Servicio IA', 'Enrutador'].map(name => <li key={name}>{name}<ArrowRight aria-hidden="true"/></li>)}</ol>
    <div className="replica-layout"><div className="routing-caption">Modelo y versión<br/><strong>Réplicas disponibles</strong></div><div className="replica-connectors" aria-hidden="true"><i/><i className={failed ? 'unavailable' : ''}/></div><div className="simple-replicas"><div><Server aria-hidden="true"/><strong>vLLM · A</strong><span>GPU A · disponible</span></div><div className={failed ? 'replica-unavailable' : ''}><Server aria-hidden="true"/><strong>vLLM · B</strong><span>{failed ? 'Sin tráfico' : 'GPU B · disponible'}</span></div></div></div>
    <div className="failure-example"><button className="support-action" aria-pressed={failed} onClick={() => setFailed(x=>!x)}>{failed ? 'Restaurar réplica B' : 'Simular fallo de B'}</button><p aria-live="polite">{failed ? 'A necesita capacidad para asumir las peticiones. Una réplica nueva tarda en arrancar.' : 'El enrutador reparte las peticiones entre las réplicas listas.'}</p></div>
    <div className="operations-summary"><span>Acceso y cuotas</span><span>Colas, errores y coste</span><span>Evaluación y rollback</span></div>
  </Slide>;
}

const strategies = [
  ['TP', 'Operaciones', 'Parte de una capa', 'Parte de esa capa', '↔', 'Comunicación frecuente entre GPU.'],
  ['PP', 'Capas', 'Primeras capas', 'Siguientes capas', '→', 'Las etapas pueden quedarse esperando.'],
  ['DP', 'Peticiones', 'Modelo · petición A', 'Modelo · petición B', '∥', 'Cada réplica necesita alojar su modelo.'],
  ['EP', 'Expertos MoE', 'Expertos 1 y 2', 'Expertos 3 y 4', '↔', 'El router envía tokens a sus expertos.'],
  ['CP', 'Contexto', 'Parte del contexto', 'Parte del contexto', '↔', 'Prefill y decode dependen del backend.'],
];
export function ParallelVisual() {
  return <Slide label="Qué se reparte entre las GPU" note="Esquemas conceptuales. Comprueba soporte en modelo, backend y versión. NVLink, PCIe y red tienen costes distintos; no se presupone una aceleración lineal.">
    <div className="parallel-comparison">{strategies.map(([key,title,a,b,arrow,note])=><div className="parallel-comparison-row" key={key}><h2><strong>{key}</strong><span>{title}</span></h2><div className="gpu-partition"><span><small>GPU 1</small>{a}</span><b aria-hidden="true">{arrow}</b><span><small>GPU 2</small>{b}</span></div><p>{note}</p></div>)}</div>
  </Slide>;
}

export function SizingVisual() {
  return <Slide label="Ejercicio de dimensionamiento" note="Hipótesis sin benchmark. Verifica GPU, checkpoint, arquitectura, licencia, KV cache y soporte de cuantización. INT8 e INT4 no garantizan que quepa ni que cumpla el objetivo.">
    <div className="sizing-case"><strong>≈14B <span>parámetros</span></strong><strong>24 GB <span>en una GPU</span></strong></div>
    <div className="sizing-estimates">{[['FP16 / BF16','28','Supera la VRAM solo con los pesos.'],['INT8','≈14','Falta sumar KV cache y ejecución.'],['INT4','≈7','Falta sumar KV cache y ejecución.']].map(([label,n,note])=><div key={label}><span>{label}</span><strong>{n}<small> GB</small></strong><p>{note}</p></div>)}</div>
    <div className="sizing-assumptions"><strong>Supuestos del ejercicio</strong><span>8 peticiones · 2.048 tokens de entrada + hasta 512 de salida</span><span>TTFT p95 &lt; 2 s · errores &lt; 1 %</span></div>
    <div className="starting-hypothesis"><p><strong>Primera prueba</strong>Checkpoint cuantizado compatible · concurrencia 1, 4 y 8</p><code>max-model-len: 4096<br/>gpu-memory-utilization: 0.85</code></div>
  </Slide>;
}
