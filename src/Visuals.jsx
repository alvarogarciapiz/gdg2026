import React, { useEffect, useRef, useState } from 'react';

function Choice({options,value,onChange,label}) {
  return <div className="choice" role="group" aria-label={label}>{options.map(option => <button key={option.value} type="button" aria-pressed={value===option.value} onClick={()=>onChange(option.value)}>{option.label}</button>)}</div>;
}
function Slider({label,value,onChange,min,max,step=1,suffix=''}) {
  return <label className="slider-field"><span>{label}<strong>{Number(value).toLocaleString('es-ES')}{suffix}</strong></span><input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(Number(e.target.value))}/></label>;
}
function VisualShell({title,aside,children,dark=false}) {
  const ref=useRef(null),[visible,setVisible]=useState(false);
  useEffect(()=>{const observer=new IntersectionObserver(([entry])=>{if(entry.isIntersecting){setVisible(true);observer.disconnect();}},{threshold:.16});if(ref.current)observer.observe(ref.current);return()=>observer.disconnect();},[]);
  return <section ref={ref} className={'interactive-visual'+(dark?' visual-dark':'')+(visible?' is-visible':'')} aria-label={title}><div className="visual-head"><h2>{title}</h2></div>{children}{aside&&<p className="visual-disclaimer">{aside}</p>}</section>;
}

const flowSteps = ['Texto','Tokenizer','Tokens','Modelo','Logits','Muestreo','Tokens nuevos','Texto'];
function FlowVisual() {
  return <VisualShell title="La misma pregunta, dos maneras de ejecutarla" aside="Es un ejemplo de inferencia: los pesos se usan para responder, no se modifican. Ninguna ruta representa una llamada real." dark>
    <div className="flow-prompt"><span>PREGUNTA DE EJEMPLO</span><strong>«¿Por qué aparece CUDA out of memory?»</strong></div>
    <div className="flow-routes" aria-label="Comparación entre API y pesos propios">
      <div className="flow-route"><span className="flow-route-number">01</span><div><h3>API de un proveedor</h3><p>Envías el mensaje a un endpoint. El proveedor carga el modelo, usa su GPU y te devuelve la respuesta.</p></div><strong>Controlas la petición</strong></div>
      <div className="flow-route"><span className="flow-route-number">02</span><div><h3>Pesos en tu infraestructura</h3><p>Descargas el checkpoint, eliges runtime y GPU, y te ocupas de memoria, versiones y servicio.</p></div><strong>Controlas la ejecución</strong></div>
    </div>
    <div className="flow-engine"><div className="flow-engine-heading"><span>EN LOS DOS CASOS</span><strong>El modelo genera un token cada vez</strong></div><ol className="flow-steps">{flowSteps.map((name,i)=><li key={`${name}-${i}`} style={{'--step':i}}><small>{String(i+1).padStart(2,'0')}</small><span>{name}</span></li>)}</ol><div className="flow-output"><span>RESPUESTA ILUSTRATIVA</span><strong>«La GPU no tiene memoria disponible para esta carga.»</strong></div></div>
  </VisualShell>;
}

function ArchitectureVisual() {
  const [size,setSize]=useState(7),[kind,setKind]=useState('dense'),[input,setInput]=useState(2048),[output,setOutput]=useState(512);
  return <VisualShell title="Modelo, arquitectura y contexto" aside="Memoria ideal de pesos en FP16/BF16. Los expertos activos de un MoE dependen del checkpoint.">
    <div className="visual-controls"><div><span className="control-label">PARÁMETROS TOTALES</span><Choice label="Parámetros en miles de millones" options={[1,3,7,14,32,70].map(n=>({value:n,label:`${n}B`}))} value={size} onChange={setSize}/></div><div><span className="control-label">ARQUITECTURA</span><Choice label="Arquitectura" options={[{value:'dense',label:'Dense'},{value:'moe',label:'MoE'}]} value={kind} onChange={setKind}/></div></div>
    <div className="arch-layout"><div className="arch-stack"><span>Entrada</span><span>Atención · cabezas Q/KV</span><span>{kind==='moe'?'Router → expertos elegidos':'Red feed-forward'}</span><span>Siguiente bloque × capas</span></div><div className="arch-readout"><small>SOLO PESOS · FP16/BF16</small><strong>≈{size*2} GB</strong><p>{kind==='moe'?'Los pesos residentes dependen del total cargado. El cálculo de un token depende de los expertos activos.':'Es una cuenta ideal. Más parámetros no garantizan mejor respuesta.'}</p></div></div>
    <div className="context-demo"><div className="context-fields"><Slider label="Prompt" value={input} onChange={setInput} min={256} max={3584} step={256} suffix=" tokens"/><Slider label="Salida prevista" value={output} onChange={setOutput} min={128} max={2048} step={128} suffix=" tokens"/></div><div className={'context-result'+(input+output>4096?' over':'')}><span>Ventana de ejemplo · 4.096 tokens</span><strong>{(input+output).toLocaleString('es-ES')} / 4.096</strong><small>{input+output>4096?'El prompt y la respuesta exceden esta ventana de ejemplo.':'Prompt y salida comparten la misma ventana.'}</small></div></div>
  </VisualShell>;
}

const formats={gguf:{name:'GGUF',kind:'Formato',text:'Archivo y metadatos para modelos, frecuente con llama.cpp. Comprueba la cuantización concreta del archivo.'},awq:{name:'AWQ',kind:'Método',text:'Cuantización posentrenamiento que tiene en cuenta activaciones. El soporte depende del motor y del checkpoint.'},gptq:{name:'GPTQ',kind:'Método',text:'Otra familia de cuantización posentrenamiento. No equivale a un formato universal.'},fp8:{name:'FP8',kind:'Representación',text:'Coma flotante de ocho bits. Necesita soporte de hardware y kernels para el caso concreto.'}};
function PrecisionVisual() {
  const [size,setSize]=useState(8);
  const bytes={'FP32':4,'FP16/BF16':2,'FP8/INT8':1,'INT4':0.5};
  return <VisualShell title="Cuánto ocupan los pesos" aside="Cifras ideales: faltan escalas, metadatos, tensores sin cuantizar y runtime. Menos bits no garantizan más velocidad.">
    <div className="visual-controls"><div><span className="control-label">TAMAÑO DEL MODELO</span><Choice label="Tamaño de modelo" options={[{value:8,label:'8B'},{value:14,label:'14B'}]} value={size} onChange={setSize}/></div></div>
    <div className="precision-bars">{Object.entries(bytes).map(([name,value])=><div className="precision-bar" key={name}><strong>{name}</strong><div><span style={{width:`${value/4*100}%`}}/></div><small>{value.toLocaleString('es-ES')} B/parámetro</small><b>≈{(size*value).toLocaleString('es-ES')} GB</b></div>)}</div>
    <div className="format-catalog"><span className="control-label">NO SON LA MISMA CLASE DE ETIQUETA</span><div>{Object.values(formats).map(item=><article key={item.name}><strong>{item.name}</strong><small>{item.kind}</small><p>{item.text}</p></article>)}</div></div>
  </VisualShell>;
}

function MemoryVisual() {
  const [size,setSize]=useState(8),[precision,setPrecision]=useState(2),[tokens,setTokens]=useState(4096),[seqs,setSeqs]=useState(1);
  const weights=size*precision,kvMiB=128*tokens*seqs/1024;
  return <VisualShell title="Pesos y KV cache en la misma GPU" dark aside="KV ilustrativa: 32 capas, 8 KV heads, dimensión 128 y FP16. La cifra cambia con la arquitectura. Faltan buffers, runtime y margen.">
    <div className="memory-controls"><div><span className="control-label">MODELO</span><Choice label="Parámetros" options={[{value:8,label:'8B'},{value:14,label:'14B'}]} value={size} onChange={setSize}/></div><div><span className="control-label">PESOS</span><Choice label="Bytes por parámetro" options={[{value:2,label:'FP16 · 2 B'},{value:1,label:'INT8 · ≈1 B'},{value:0.5,label:'INT4 · ≈0,5 B'}]} value={precision} onChange={setPrecision}/></div></div>
    <div className="memory-controls sliders"><Slider label="Tokens residentes por secuencia" value={tokens} onChange={setTokens} min={1024} max={8192} step={1024}/><Slider label="Secuencias iguales" value={seqs} onChange={setSeqs} min={1} max={8}/></div>
    <div className="memory-outcome"><div><small>PESOS IDEALES</small><strong>≈{weights.toLocaleString('es-ES')} GB</strong></div><span>+</span><div><small>KV ILUSTRATIVA</small><strong>≈{kvMiB>=1024?(kvMiB/1024).toLocaleString('es-ES',{maximumFractionDigits:2})+' GiB':kvMiB.toLocaleString('es-ES')+' MiB'}</strong></div><span className="memory-not-total">≠ VRAM total</span></div>
    <div className="formula-strip">KV bytes ≈ 2 × capas × cabezas KV × dimensión × bytes × tokens residentes</div>
    <p className="visual-under">Con 4.096 tokens: ≈512 MiB para una secuencia; ≈4 GiB para ocho iguales en este ejemplo.</p>
  </VisualShell>;
}

const decisionSteps=[
  {name:'Define la tarea',detail:'Idioma, calidad, contexto y herramientas. Guarda ejemplos reales para probar.'},
  {name:'Revisa el checkpoint',detail:'Arquitectura, licencia, ficha, tokenizer, plantilla, precisión y compatibilidad.'},
  {name:'Mide y compara',detail:'Pesos + KV cache + runtime. Prueba tu tarea y explica por qué descartas otro modelo.'},
];
function DecisionVisual() {
  const [caseId,setCaseId]=useState('soporte');
  return <VisualShell title="Del caso de uso al checkpoint">
    <div className="visual-controls"><div><span className="control-label">CASO DE TRABAJO</span><Choice label="Caso de uso" options={[{value:'soporte',label:'Soporte en castellano'},{value:'codigo',label:'Ayuda con código'}]} value={caseId} onChange={setCaseId}/></div></div>
    <div className="decision-layout"><div className="decision-situation"><small>NECESIDAD</small><p>{caseId==='soporte'?'Responder en castellano con documentos de 3.000 tokens y citas comprobables.':'Explicar cambios en un repositorio y proponer código con ejemplos reales.'}</p></div><ol className="decision-checks">{decisionSteps.map((item,i)=><li key={item.name}><span>{String(i+1).padStart(2,'0')}</span><div><strong>{item.name}</strong><p>{item.detail}</p></div></li>)}</ol></div>
  </VisualShell>;
}

const requests=[{id:'A',start:1,end:3},{id:'B',start:2,end:4},{id:'C',start:3,end:5}];
function ServingVisual() {
  return <VisualShell title="Un lote que cambia en cada iteración" dark aside="El dibujo explica el mecanismo. No representa tiempos ni rendimiento medidos.">
    <div className="serving-path">{['Cliente','API','Planificador','Motor + GPU'].map((part,i)=><React.Fragment key={part}><span>{part}</span>{i<3&&<b aria-hidden="true">→</b>}</React.Fragment>)}</div>
    <div className="batch-interaction"><div className="batch-top"><div><small>LOTE CONTINUO</small><strong>Las peticiones entran y salen en distintas iteraciones</strong></div></div><div className="batch-grid"><div className="batch-times"><span></span>{[1,2,3,4,5].map(n=><span key={n}>t{n}</span>)}</div>{requests.map(req=><div className="batch-line" key={req.id}><strong>{req.id}</strong>{[1,2,3,4,5].map(n=><span className={n>=req.start&&n<=req.end?'occupied':''} key={n}>{n>=req.start&&n<=req.end?'●':''}</span>)}</div>)}</div><p>B entra mientras A sigue generando. A termina y deja sitio antes de que C acabe.</p></div>
  </VisualShell>;
}

const metrics={
  TTFT:{name:'Tiempo hasta el primer token',text:'Desde que sale la petición hasta que aparece el primer token. Incluye la espera en cola y el trabajo inicial.'},
  ITL:{name:'Intervalo entre tokens',text:'El tiempo que separa un token generado del siguiente. Un ritmo irregular se nota al leer una respuesta en streaming.'},
  TPOT:{name:'Tiempo medio por token',text:'Promedio por token de salida después del primero, cuando la herramienta utiliza esa definición.'},
  total:{name:'Latencia completa',text:'Desde el envío hasta el último token. Depende también de cuántos tokens tiene la respuesta.'},
  sistema:{name:'Trabajo del sistema',text:'Tokens de salida/s y peticiones terminadas/s miden trabajo agregado. Mira cola, concurrencia y errores al lado.'},
};
function MetricsVisual() {
  const [metric,setMetric]=useState('TTFT'),[load,setLoad]=useState(1);
  return <VisualShell title="La espera de una petición" aside="Las pruebas con 1, 10 y 50 peticiones son ejemplos, no cifras de capacidad.">
    <Choice label="Métrica" options={Object.entries(metrics).map(([value,item])=>({value,label:value==='total'?'Total':value==='sistema'?'Sistema':item.name.split(' ')[0]}))} value={metric} onChange={setMetric}/>
    <div className="metric-scene"><div className="metric-track"><span className="metric-request">Petición</span><span className={'metric-wait'+(metric==='TTFT'?' highlighted':'')}>Cola + entrada</span><span className={'metric-first'+(['TTFT','total'].includes(metric)?' highlighted':'')}>1.º token</span><span className={'metric-stream'+(['ITL','TPOT','total'].includes(metric)?' highlighted':'')}>▮　▮　▮　▮</span><span className="metric-end">Fin</span></div><div className="metric-description" aria-live="polite"><small>{metric==='sistema'?'VISIÓN DE SISTEMA':'VISIÓN DE LA PETICIÓN'}</small><h3>{metrics[metric].name}</h3><p>{metrics[metric].text}</p></div></div>
    <div className="test-points"><span>Probar con</span><Choice label="Concurrencia de prueba" options={[1,10,50].map(n=>({value:n,label:`${n} ${n===1?'petición':'peticiones'}`}))} value={load} onChange={setLoad}/><small>{load===50?'Busca el punto donde la cola o los errores rompen el objetivo.':'Mantén iguales el modelo, la GPU, los prompts, las salidas y el muestreo.'}</small></div>
  </VisualShell>;
}

function TuningVisual() {
  const groups=[
    {number:'01',name:'Memoria',keys:'gpu-memory-utilization · max-model-len',text:'Una ventana mayor puede pedir más KV cache.',measure:'VRAM'},
    {number:'02',name:'Planificador',keys:'max-num-seqs · max-num-batched-tokens',text:'Más secuencias cambian cola y latencia.',measure:'TTFT · cola'},
    {number:'03',name:'Prefill',keys:'prefix caching · chunked prefill',text:'Reutiliza prefijos o intercala prompts largos.',measure:'TTFT'},
    {number:'04',name:'Ejecución',keys:'CUDA graphs · cuantización',text:'Menos lanzamientos o pesos; revisa memoria y calidad.',measure:'VRAM · calidad'},
  ];
  return <VisualShell title="Qué cambia al ajustar vLLM" aside="Los ajustes disponibles dependen de la versión de vLLM, el modelo, la GPU y la carga.">
    <div className="tuning-overview">{groups.map((group,i)=><div className="tuning-lane" key={group.number} style={{'--step':i}}><div><span>{group.number}</span><h3>{group.name}</h3></div><code>{group.keys}</code><p>{group.text}</p><strong>{group.measure}</strong></div>)}</div>
    <div className="tuning-baseline"><span>ANTES Y DESPUÉS, CON LA MISMA CARGA</span><strong>TTFT · throughput · errores · VRAM</strong></div>
  </VisualShell>;
}

const replicaScenarios={
  normal:{a:['v1','Lista'],b:['v1','Lista'],detail:'El enrutador reparte peticiones entre las dos réplicas listas.'},
  carga:{a:['v1','Lista'],b:['v1','Cargando'],detail:'La nueva réplica todavía carga el modelo. No debe recibir tráfico hasta terminar el calentamiento.'},
  fallo:{a:['v1','Lista'],b:['v1','Fallida'],detail:'El enrutador deja de enviar peticiones a la réplica fallida. Comprueba si la otra soporta la cola.'},
  version:{a:['v1','Lista'],b:['v2','Prueba'],detail:'La versión nueva recibe una parte pequeña del tráfico. Compara resultados y conserva la opción de volver atrás.'},
};
function ProductionVisual() {
  const [scenario,setScenario]=useState('normal'),current=replicaScenarios[scenario];
  return <VisualShell title="Qué pasa entre el cliente y la GPU" dark aside="Arquitectura conceptual. Kubernetes puede servir para desplegarla, pero no es obligatorio.">
    <Choice label="Situación del servicio" options={[{value:'normal',label:'Normal'},{value:'carga',label:'Nueva réplica'},{value:'fallo',label:'Fallo'},{value:'version',label:'Nueva versión'}]} value={scenario} onChange={setScenario}/>
    <div className="production-flow" aria-label="Clientes, pasarela API, servicio IA, enrutador, réplicas vLLM y GPU">{['Clientes','Pasarela API','Servicio IA','Enrutador'].map(name=><React.Fragment key={name}><span>{name}</span><b aria-hidden="true">→</b></React.Fragment>)}<div className="production-replicas"><span>vLLM · A</span><span>vLLM · B</span></div><b aria-hidden="true">→</b><span>GPU</span></div>
    <div className="production-status" aria-live="polite"><div><small>RÉPLICA A</small><strong>{current.a[0]}</strong><span>{current.a[1]}</span></div><div className={current.b[1]==='Fallida'?'replica-failed':''}><small>RÉPLICA B</small><strong>{current.b[0]}</strong><span>{current.b[1]}</span></div><p>{current.detail}</p></div>
    <div className="production-bottom">Vigila TTFT · cola · errores · peticiones activas · VRAM · coste</div>
  </VisualShell>;
}

const strategies=[
  {key:'TP',name:'Dentro de una capa',a:'½ operación',b:'½ operación',link:'↔',cause:'Intercambio frecuente entre GPU'},
  {key:'PP',name:'Entre grupos de capas',a:'Capas 1–N',b:'Capas N–fin',link:'→',cause:'Pasan activaciones; puede haber esperas'},
  {key:'DP',name:'Entre peticiones',a:'Modelo completo · A',b:'Modelo completo · B',link:'∥',cause:'Dos réplicas; cada una debe caber'},
  {key:'EP',name:'Entre expertos MoE',a:'Expertos A',b:'Expertos B',link:'⇄',cause:'Los tokens viajan al experto elegido'},
  {key:'CP',name:'Para contextos largos',a:'Parte del contexto',b:'Otra parte',link:'↔',cause:'Depende del soporte en prefill y decode'},
];
function ParallelVisual() {
  return <VisualShell title="Cinco formas de repartir el trabajo" aside="NVLink, PCIe y red tienen costes distintos. Mide antes de esperar una mejora.">
    <div className="parallel-overview">{strategies.map((item,i)=><div className="parallel-lane" key={item.key} style={{'--step':i}}><div className="parallel-title"><b>{item.key}</b><strong>{item.name}</strong></div><div className="parallel-pair"><span><small>GPU 1</small>{item.a}</span><em aria-hidden="true">{item.link}</em><span><small>GPU 2</small>{item.b}</span></div><p>{item.cause}</p></div>)}</div>
  </VisualShell>;
}

function SizingVisual() {
  const weights={'FP16/BF16':28,'INT8':14,'INT4':7};
  const criteria=['Calidad comprobada','TTFT p95 medido','Errores medidos','Margen de VRAM medido'];
  return <VisualShell title="14B en una GPU de 24 GB" dark aside="Ejercicio hipotético. Las cifras de pesos son ideales; ninguna variante se ha probado aquí.">
    <div className="sizing-intro"><div><small>CHECKPOINT</small><strong>≈14B</strong></div><div><small>TARJETA</small><strong>24 GB</strong></div><div><small>CONTEXTO POR PETICIÓN</small><strong>2.048 + hasta 512</strong></div></div>
    <div className="sizing-weights">{Object.entries(weights).map(([name,value])=><div key={name} className={value>24?'over':''}><small>{name} · SOLO PESOS</small><strong>≈{value} GB</strong><p>{value>24?'Ya supera la tarjeta.':'Podría dejar margen, pero falta medir KV, runtime y buffers.'}</p></div>)}</div>
    <div className="sizing-hypothesis"><small>HIPÓTESIS INICIAL · SIN BENCHMARK</small><strong>Checkpoint cuantizado compatible · max-model-len 4096 · gpu-memory-utilization 0.85</strong><span>Probar 1 → 4 → 8 solicitudes activas</span></div>
    <div className="acceptance"><span className="control-label">PARA ACEPTARLA HAY QUE MEDIR</span><div>{criteria.map((label,i)=><span key={label}>{String(i+1).padStart(2,'0')} · {label}</span>)}</div><p>Objetivo didáctico: TTFT p95 &lt; 2 s y errores &lt; 1 %. Ninguna variante está validada todavía.</p></div>
  </VisualShell>;
}

const visuals={flow:FlowVisual,architecture:ArchitectureVisual,precision:PrecisionVisual,memory:MemoryVisual,decision:DecisionVisual,serving:ServingVisual,metrics:MetricsVisual,tuning:TuningVisual,production:ProductionVisual,parallel:ParallelVisual,sizing:SizingVisual};
export default function WorkshopVisual({type}) { const Component=visuals[type]; return Component?<Component/>:null; }
