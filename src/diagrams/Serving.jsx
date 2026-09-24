import React, { useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Slide, Asset } from './Slide';

const batches = [
  ['A', 'A', 'A', '', ''],
  ['B', 'B', '', '', ''],
  ['', 'C', 'C', 'C', 'C'],
  ['', '', 'D', 'D', ''],
];

export function ServingVisual() {
  const reduced = useReducedMotion();
  const [iteration, setIteration] = useState(-1);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing || reduced) return;
    const timer = window.setTimeout(() => {
      if (iteration >= 4) setPlaying(false);
      else setIteration(i => i + 1);
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [playing, iteration, reduced]);
  useEffect(() => { if (reduced) setPlaying(false); }, [reduced]);
  return <Slide label="Transformers y vLLM" note="Lote continuo: esquema de iteraciones, sin tiempos ni rendimiento medido. Una petición nueva puede entrar mientras otras siguen generando.">
    <div className="tool-comparison">
      <div><div className="tool-name"><Asset src="/huggingface-logo.svg" alt="Hugging Face"/><h2>Transformers</h2></div><p>Cargar el modelo y controlar la generación.</p></div>
      <div><div className="tool-name"><Asset src="/vllm-logo.svg" alt="" className="vllm-logo"/><h2>vLLM</h2></div><p>Atender peticiones y organizar el trabajo de la GPU.</p></div>
    </div>
    <div className="batch-heading"><h3>Lote continuo</h3>{reduced ? <button className="support-action" onClick={() => setIteration(i => (i + 1) % 5)}>Siguiente iteración</button> : <button className="support-action" onClick={() => { if (iteration >= 4 || iteration < 0) setIteration(0); setPlaying(p => !p); }}>{playing ? <Pause/> : iteration >= 4 ? <RotateCcw/> : <Play/>}{playing ? 'Pausar' : iteration >= 4 ? 'Repetir' : 'Ver iteraciones'}</button>}</div>
    <div className="batch-table" role="table" aria-label="Peticiones activas en cada iteración">
      <div role="row" className="batch-row batch-labels"><span role="columnheader">Petición</span>{[1,2,3,4,5].map((n,i) => <span role="columnheader" key={n} className={iteration === i ? 'current-iteration' : ''}>{n}</span>)}</div>
      {batches.map((row,r) => <div role="row" className="batch-row" key={r}><strong role="rowheader">{String.fromCharCode(65+r)}</strong>{row.map((value,c) => <span role="cell" key={c} className={`batch-cell ${value ? 'occupied' : ''} ${iteration === c ? 'current-iteration' : ''}`} aria-label={`Iteración ${c+1}: ${value ? 'activa' : 'sin trabajo'}`}>{value ? <i/> : '—'}</span>)}</div>)}
    </div>
    <p className="batch-explanation" aria-live="polite">{iteration < 0 ? 'B termina antes. C y D entran sin esperar a que termine A.' : ['A y B están generando.', 'Entra C; A y B siguen.', 'B termina. Entra D.', 'A termina. C y D siguen.', 'Solo C sigue generando.'][iteration]}</p>
  </Slide>;
}

export function MetricsVisual() {
  return <Slide label="Cuánto espera quien hace una petición" note="Esquema sin escala temporal. TPOT: tiempo medio por token de salida después del primero, cuando se usa esa definición.">
    <div className="latency-illustration"><div className="latency-events"><span>Petición</span><span>Primer token</span><span>Último token</span></div><div className="latency-track"><span className="latency-wait"/><span className="latency-token"/><span className="latency-generation">{[0,1,2,3,4].map(i=><i key={i}/>)}</span></div><div className="latency-labels"><strong>TTFT<small>Hasta el primer token</small></strong><strong>ITL<small>Entre tokens</small></strong></div><div className="total-latency">Latencia total</div></div>
    <div className="metric-comparison"><p><strong>Una persona</strong>Cuánto espera y cómo llega la respuesta.</p><p><strong>Todo el servicio</strong>Tokens y peticiones completadas por segundo.</p></div>
    <p className="support-line">Atender más peticiones puede aumentar la espera.</p>
  </Slide>;
}

export function TuningVisual() {
  return <Slide label="Qué ajustar en vLLM" note="Los valores y el soporte dependen de la versión, el modelo, la GPU y las peticiones. No hay una configuración óptima para todos los casos.">
    <div className="tuning-notes"><div><h2>Memoria</h2><p>Limita el contexto y deja margen.</p><code>max-model-len · gpu-memory-utilization</code></div><div><h2>Cola y latencia</h2><p>Ajusta cuántas secuencias y tokens procesa cada iteración.</p><code>max-num-seqs · max-num-batched-tokens</code></div><div><h2>Trabajo repetido</h2><p>Prueba prefix caching si las peticiones comparten prefijo.</p><span>Chunked prefill permite intercalar prompts largos con decode.</span></div></div>
    <p className="tuning-reminder">Prueba un cambio cada vez y compáralo con la línea base.</p>
  </Slide>;
}
