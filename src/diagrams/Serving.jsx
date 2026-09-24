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
  const [iteration, setIteration] = useState(reduced ? 4 : 0);
  const [playing, setPlaying] = useState(!reduced);
  useEffect(() => {
    if (!playing || reduced) return;
    const timer = window.setTimeout(() => {
      if (iteration >= 4) setPlaying(false);
      else setIteration(i => i + 1);
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [playing, iteration, reduced]);
  useEffect(() => { if (reduced) { setPlaying(false); setIteration(4); } }, [reduced]);
  return <Slide label="Transformers y vLLM" note="Lote continuo: esquema de iteraciones, sin tiempos ni rendimiento medido. Una petición nueva puede entrar mientras otras siguen generando.">
    <div className="tool-comparison">
      <div><div className="tool-name"><Asset src="/huggingface-logo.svg" alt="Hugging Face"/><h2>Transformers</h2></div><p>Cargar el modelo y controlar la generación.</p></div>
      <div><div className="tool-name"><Asset src="/vllm-logo.svg" alt="" className="vllm-logo"/><h2>vLLM</h2></div><p>Atender peticiones y organizar el trabajo de la GPU.</p></div>
    </div>
    <div className="batch-heading"><h3>Lote continuo</h3>{reduced ? <button className="support-action" onClick={() => setIteration(i => (i + 1) % 5)}>Siguiente iteración</button> : <button className="support-action" onClick={() => { if (iteration >= 4) { setIteration(0); setPlaying(true); } else setPlaying(p => !p); }}>{playing ? <Pause/> : iteration >= 4 ? <RotateCcw/> : <Play/>}{playing ? 'Pausar' : iteration >= 4 ? 'Repetir' : 'Continuar'}</button>}</div>
    <div className="batch-table" role="table" aria-label="Peticiones activas en cada iteración">
      <div role="row" className="batch-row batch-labels"><span role="columnheader">Petición</span>{[1,2,3,4,5].map((n,i) => <span role="columnheader" key={n} className={iteration === i ? 'current-iteration' : ''}>{n}</span>)}</div>
      {batches.map((row,r) => <div role="row" className="batch-row" key={r}><strong role="rowheader">{String.fromCharCode(65+r)}</strong>{row.map((value,c) => <span role="cell" key={c} className={`batch-cell ${value ? 'occupied' : ''} ${iteration === c ? 'current-iteration' : ''}`} aria-label={`Iteración ${c+1}: ${value ? 'activa' : 'sin trabajo'}`}>{value ? <i/> : '—'}</span>)}</div>)}
    </div>
    <p className="batch-explanation" aria-live="polite">{iteration < 0 ? 'B termina antes. C y D entran sin esperar a que termine A.' : ['A y B están generando.', 'Entra C; A y B siguen.', 'B termina. Entra D.', 'A termina. C y D siguen.', 'Solo C sigue generando.'][iteration]}</p>
  </Slide>;
}

export function MetricsVisual() {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState(reduced ? 3 : 0);
  const [playing, setPlaying] = useState(!reduced);
  const explanation = [
    'La petición ya salió. La persona sigue esperando el primer token.',
    'Llega el primer token. Aquí termina el TTFT.',
    'Van llegando más tokens; el intervalo entre ellos es el ITL.',
    'La respuesta está completa. La latencia total incluye toda la espera.',
  ];
  useEffect(() => {
    if (!playing || reduced) return;
    const timer = window.setTimeout(() => {
      if (phase >= 3) setPlaying(false);
      else setPhase(value => value + 1);
    }, 1350);
    return () => window.clearTimeout(timer);
  }, [playing, phase, reduced]);
  useEffect(() => { if (reduced) { setPlaying(false); setPhase(3); } }, [reduced]);
  return <Slide label="Cuánto espera quien hace una petición" note="Esquema sin escala temporal. TPOT: tiempo medio por token de salida después del primero, cuando se usa esa definición.">
    <div className="batch-heading"><h3>Una respuesta, paso a paso</h3>{reduced ? <button className="support-action" onClick={() => setPhase(value => (value + 1) % 4)}>Siguiente paso</button> : <button className="support-action" onClick={() => { if (phase >= 3) { setPhase(0); setPlaying(true); } else setPlaying(value => !value); }}>{playing ? <Pause/> : phase >= 3 ? <RotateCcw/> : <Play/>}{playing ? 'Pausar' : phase >= 3 ? 'Repetir' : 'Continuar'}</button>}</div>
    <div className="latency-illustration"><div className="latency-events"><span>Petición</span><span>Primer token</span><span>Último token</span></div><div className="latency-track"><span className={'latency-wait '+(phase === 0 ? 'is-active' : '')}/><span className={'latency-token '+(phase === 1 ? 'is-active' : '')}/><span className="latency-generation">{[0,1,2,3,4].map(i=><i key={i} className={phase >= 2 && (phase === 3 || i < 3) ? 'is-active' : ''}/>)}</span></div><div className="latency-labels"><strong className={phase <= 1 && phase >= 0 ? 'is-active' : ''}>TTFT<small>Hasta el primer token</small></strong><strong className={phase === 2 ? 'is-active' : ''}>ITL<small>Entre tokens</small></strong></div><div className={'total-latency '+(phase === 3 ? 'is-active' : '')}>Latencia total</div></div>
    <p className="batch-explanation" aria-live="polite">{phase < 0 ? 'El primer token y los siguientes no miden lo mismo.' : explanation[phase]}</p>
    <div className="metric-comparison"><p><strong>Una persona</strong>Cuánto espera y cómo llega la respuesta.</p><p><strong>Todo el servicio</strong>Tokens y peticiones completadas por segundo.</p></div>
    <p className="support-line">Atender más peticiones puede aumentar la espera.</p>
  </Slide>;
}

export function TuningVisual() {
  return <Slide label="Qué ajustar en vLLM" note="Los valores y el soporte dependen de la versión, el modelo, la GPU y las peticiones. No hay una configuración óptima para todos los casos.">
    <div className="tuning-notes">
      <div><div><h2>Memoria</h2><code>max-model-len · gpu-memory-utilization</code></div><div className="tuning-sketch tuning-context" aria-hidden="true"><span>Pesos</span><span>KV</span><i>Margen</i></div><p>Más contexto puede ocupar más KV cache. Deja margen para ejecutar.</p></div>
      <div><div><h2>Cola</h2><code>max-num-seqs · max-num-batched-tokens</code></div><div className="tuning-sketch tuning-queue" aria-hidden="true"><span>GPU</span><span>GPU</span><span>Cola</span><span>Cola</span></div><p>Más secuencias pueden dar más throughput y también más espera.</p></div>
      <div><div><h2>Trabajo repetido</h2><code>prefix caching · chunked prefill</code></div><div className="tuning-sketch tuning-prefix" aria-hidden="true"><span><b>Prefijo</b><i>A</i></span><span><b>Prefijo</b><i>B</i></span></div><p>Reutiliza un comienzo compartido; divide prompts largos para intercalar trabajo.</p></div>
    </div>
    <p className="tuning-reminder">CUDA graphs pueden ahorrar tiempo de lanzamiento y usar más memoria. Cuantizar exige comprobar el soporte de los kernels.</p>
  </Slide>;
}
