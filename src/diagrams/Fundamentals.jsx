import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Slide, Asset, Choice, number } from './Slide';

export function FlowVisual() {
  return <Slide label="Un ejemplo de generación" className="inference-support" note="Ejemplo de texto y tokens; no es la salida de un modelo conectado.">
    <div className="sentence-example"><span>La capital de España es</span> <strong>Madrid</strong><span>.</span></div>
    <p className="support-line">El modelo calcula el siguiente token. Lo añade y vuelve a calcular.</p>
    <ol className="plain-flow" aria-label="Proceso de inferencia">{['Texto', 'Tokenizer', 'Tokens', 'Modelo', 'Logits', 'Muestreo', 'Tokens nuevos', 'Texto'].map((name, i) => <li key={i}>{name}</li>)}</ol>
    <div className="responsibilities"><p><strong>Con una API</strong>El proveedor carga y ejecuta el modelo.</p><p><strong>Con los pesos</strong>Tú eliges el runtime y gestionas la GPU.</p></div>
  </Slide>;
}

export function ArchitectureVisual() {
  return <Slide label="Comparación de modelos Dense y MoE" note="Bloques simplificados. En este MoE se ilustran 2 expertos activos de 4; la arquitectura real depende del checkpoint.">
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
    <p className="support-kicker">Un modelo de 8B · solo pesos</p>
    <div className="precision-figures">{[['FP32', '4 B', '32'], ['FP16 / BF16', '2 B', '16'], ['FP8 / INT8', '≈1 B', '8'], ['INT4', '≈0,5 B', '4']].map(([name, bytes, gb]) => <div key={name}><h2>{name}</h2><strong>{gb}<small> GB</small></strong><p>{bytes} por parámetro</p></div>)}</div>
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
    <div className="memory-example-controls"><Choice label="Secuencias del ejemplo" value={sequences} onChange={setSequences} options={[{ value: 1, label: '1 secuencia' }, { value: 8, label: '8 secuencias' }]}/><span>4.096 tokens por secuencia</span></div>
    <div className="memory-ruler" aria-label={`Referencia de 24 GB: 16 GB de pesos, ${number(kvGB,2)} GB de KV y ejecución pendiente de medir`}><span className="memory-weight-part">Pesos</span><motion.span className="memory-kv-part" initial={false} animate={{width:`${kvGB / 24 * 100}%`}} transition={{duration:reduced?0:.35}}/><span className="memory-unmeasured">Por medir</span></div>
    <div className="memory-ruler-labels"><span>0 GB</span><span>Referencia de 24 GB · el hueco no es memoria libre garantizada</span></div>
  </Slide>;
}

export function DecisionVisual() {
  return <Slide label="Qué comprobar al elegir un modelo" className="decision-support">
    <div className="editorial-lines"><p>¿Resuelve <strong>tu tarea</strong>?</p><p>¿La licencia permite <strong>tu uso</strong>?</p><p>¿Cabe y funciona con <strong>tu hardware</strong>?</p></div>
    <div className="model-card-reference"><Asset src="/huggingface-logo.svg" alt="Hugging Face"/><p>Revisa la ficha, la configuración y la plantilla de chat.<br/><strong>Después, pruébalo con ejemplos tuyos.</strong></p></div>
  </Slide>;
}
