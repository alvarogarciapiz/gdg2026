import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Slide, Asset, Choice, number } from './Slide';

export function FlowVisual() {
  const stages = ['Tokenizer', 'Modelo', 'Logits', 'Respuesta'];
  const explanations = [
    'El tokenizer separa el texto y lo convierte en identificadores numéricos.',
    'El modelo usa sus pesos para calcular qué token podría venir ahora.',
    'Los logits puntúan las opciones. El muestreo escoge una.',
    'El token elegido vuelve al contexto. El proceso se repite hasta terminar.',
  ];
  const reduced = useReducedMotion();
  const [step, setStep] = useState(reduced ? 3 : 0);
  const [playing, setPlaying] = useState(!reduced);
  useEffect(() => {
    if (!playing || reduced) return;
    const timer = window.setTimeout(() => {
      if (step >= stages.length - 1) setPlaying(false);
      else setStep(value => value + 1);
    }, 1050);
    return () => window.clearTimeout(timer);
  }, [playing, step, reduced]);
  useEffect(() => { if (reduced) { setPlaying(false); setStep(3); } }, [reduced]);
  return <Slide label="Cómo genera texto un LLM" className="inference-support" note="Los cortes del tokenizer y las opciones de salida son ilustrativos. Cada modelo usa su propio vocabulario y puede producir otra respuesta.">
    <div className="flow-heading"><p className="support-line">La capital de España es…</p>{reduced ? <button className="support-action" onClick={() => setStep(value => (value + 1) % stages.length)}>Ver otro paso</button> : <button className="support-action" onClick={() => { if (step >= 3) { setStep(0); setPlaying(true); } else setPlaying(value => !value); }}>{playing ? <Pause/> : step >= 3 ? <RotateCcw/> : <Play/>}{playing ? 'Pausar' : step >= 3 ? 'Repetir' : 'Continuar'}</button>}</div>
    <div className="inference-sequence">
      <div className={`inference-stage ${step === 0 ? 'is-current' : ''}`}><span className="inference-stage-label">01 / Tokenizer</span><div className="token-pieces" aria-label="Ejemplo de fragmentos de texto"><span>La</span><span> capital</span><span> de</span><span> España</span><span> es</span></div><p>Texto convertido en tokens</p></div>
      <span className="inference-arrow" aria-hidden="true">→</span>
      <div className={`inference-stage inference-model ${step === 1 ? 'is-current' : ''}`}><span className="inference-stage-label">02 / Modelo</span><div className="model-stack" aria-hidden="true"><i/><i/><i/><i/></div><p>Pesos cargados en memoria</p></div>
      <span className="inference-arrow" aria-hidden="true">→</span>
      <div className={`inference-stage ${step === 2 ? 'is-current' : ''}`}><span className="inference-stage-label">03 / Logits y muestreo</span><div className="candidate-tokens" aria-label="Opciones ilustrativas para el siguiente token"><span><b>Madrid</b><i/></span><span><b>Sevilla</b><i/></span><span><b>otra opción</b><i/></span></div><p>Se elige el siguiente token</p></div>
    </div>
    <div className={`inference-answer ${step === 3 ? 'is-current' : ''}`}><span>Texto generado</span><strong>La capital de España es <em>Madrid.</em></strong><small>El token se añade al contexto y el modelo puede seguir.</small></div>
    <div className="flow-foot"><p aria-live="polite">{explanations[step]}</p><div><span>API: lo ejecuta el proveedor</span><span>Pesos: eliges runtime y GPU</span></div></div>
  </Slide>;
}

export function ArchitectureVisual() {
  return <Slide label="Comparación de modelos Dense y MoE" note="Bloques simplificados. En este MoE se ilustran 2 expertos activos de 4; la arquitectura real depende del checkpoint.">
    <div className="parameter-line"><strong>1B = mil millones de parámetros</strong><div aria-label="Tamaños habituales: 1B, 3B, 7B, 14B, 32B y 70B">{[1,3,7,14,32,70].map(n=><span key={n} className={n===7?'is-example':''}>{n}B</span>)}</div></div>
    <div className="architecture-pair">
      <div><h2>Dense</h2><div className="decoder-simple"><span>Atención</span><b aria-hidden="true">↓</b><span>Red feed-forward</span></div><p>Se aplica la red de cada bloque.</p></div>
      <div><h2>MoE</h2><div className="decoder-simple"><span>Atención</span><b aria-hidden="true">↓</b><span>Router</span><div className="simple-experts"><b>E1</b><span>E2</span><b>E3</b><span>E4</span></div></div><p>El router elige algunos expertos.</p></div>
    </div>
    <p className="architecture-conclusion">Pesos residentes: <strong>total cargado</strong>.<br/>Cálculo por token: depende también de los <strong>expertos activos</strong>.</p>
    <div className="context-strip"><span>El tamaño no fija el contexto</span><strong>Prompt + respuesta ≤ ventana del modelo</strong></div>
  </Slide>;
}

export function PrecisionVisual() {
  return <Slide label="Memoria ideal de pesos de un modelo 8B" note="Pesos ideales: faltan escalas, metadatos, tensores sin cuantizar y runtime. Menos bits no garantizan más velocidad.">
    <p className="support-kicker">Un modelo de 8B · solo pesos · cada cuadro representa un bit por parámetro</p>
    <div className="precision-figures">{[['FP32', '4 B', '32', 32], ['FP16 / BF16', '2 B', '16', 16], ['FP8 / INT8', '≈1 B', '8', 8], ['INT4', '≈0,5 B', '4', 4]].map(([name, bytes, gb, bits]) => <div key={name}><h2>{name}</h2><strong>{gb}<small> GB</small></strong><div className="precision-bitstrip" aria-hidden="true">{Array.from({length:bits},(_,i)=><i key={i}/>)}</div><div className="precision-bar" aria-hidden="true"><span style={{width:`${Number(gb)/32*100}%`}}/></div><p>{bytes} por parámetro</p></div>)}</div>
    <div className="format-definitions"><p><strong>GGUF</strong>Formato de archivo</p><p><strong>AWQ / GPTQ</strong>Métodos de cuantización</p><p><strong>FP8</strong>Representación numérica</p></div>
  </Slide>;
}

export function MemoryVisual() {
  const [sequences, setSequences] = useState(1);
  const reduced = useReducedMotion();
  const kvGiB = sequences * .5, kvGB = kvGiB * 2 ** 30 / 1e9;
  return <Slide label="Presupuesto de memoria de una GPU" className="memory-support" note="KV ilustrativa: 32 capas, 8 cabezas KV, dimensión 128, FP16 y 4.096 tokens/secuencia. No es una prueba en esta GPU. MLA y ventana deslizante requieren otra cuenta.">
    <div className="hardware-budget">
      <figure className="gpu-photo"><Asset src="/rtx-4090.png" alt="Tarjeta gráfica NVIDIA GeForce RTX 4090"/><figcaption>RTX 4090 · 24 GB <a href="https://nvidianews.nvidia.com/file/nvidia-geforce-rtx-4090-gpu" target="_blank" rel="noreferrer" aria-label="Fotografía de NVIDIA">NVIDIA ↗</a></figcaption></figure>
      <div className="memory-sum"><p className="support-kicker">Ejemplo: 8B en FP16</p><div><strong>16 <small>GB</small></strong><span>pesos ideales · ≈14,9 GiB</span></div><div className="kv-sum"><b>+</b><strong>{number(kvGiB)} <small>GiB</small></strong><span>KV cache · ≈{number(kvGB, 2)} GB</span></div><p>+ ejecución + margen</p></div>
    </div>
    <div className="memory-example-controls"><Choice label="Secuencias del ejemplo" value={sequences} onChange={setSequences} options={[{ value: 1, label: '1 secuencia' }, { value: 8, label: '8 secuencias' }]}/><div className="kv-sequences" aria-label={`${sequences} ${sequences===1?'secuencia activa':'secuencias activas'}, 4.096 tokens cada una`}>{Array.from({length:8},(_,i)=><span key={i} className={i<sequences?'is-active':''}/>)}</div><span>4.096 tokens por secuencia</span></div>
    <div className="memory-ruler" aria-label={`Referencia de 24 GB: 16 GB de pesos, ${number(kvGB,2)} GB de KV y ejecución pendiente de medir`}><span className="memory-weight-part">Pesos</span><motion.span className="memory-kv-part" initial={false} animate={{width:`${kvGB / 24 * 100}%`}} transition={{duration:reduced?0:.35}}/><span className="memory-unmeasured">Por medir</span></div>
    <div className="memory-ruler-labels"><span>0 GB</span><span>Referencia de 24 GB · el hueco no es memoria libre garantizada</span></div>
  </Slide>;
}

export function DecisionVisual() {
  return <Slide label="Qué comprobar al elegir un modelo" className="decision-support">
    <div className="decision-brief"><span>Un caso concreto</span><strong>Responder en castellano, con citas, sobre documentos de 3.000 tokens.</strong></div>
    <ol className="decision-path">
      <li><span>01</span><strong>Tarea</strong><p>Idioma, calidad, contexto y uso de herramientas.</p></li>
      <li><span>02</span><strong>Checkpoint</strong><p>Arquitectura, licencia, tokenizer y plantilla de chat.</p></li>
      <li><span>03</span><strong>GPU</strong><p>Pesos + KV cache; precisión, runtime y kernels compatibles.</p></li>
      <li><span>04</span><strong>Prueba</strong><p>Usa benchmarks para elegir candidatos. Decide con ejemplos tuyos.</p></li>
    </ol>
    <div className="model-card-reference"><Asset src="/huggingface-logo.svg" alt="Hugging Face"/><p>La ficha del modelo cuenta cómo se entrenó y qué exige. Comprueba las condiciones de cada benchmark.</p></div>
  </Slide>;
}
