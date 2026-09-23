import React, { useState } from 'react';

function Choice({options,value,onChange,label}) {
  return <div className="choice" role="group" aria-label={label}>{options.map(option => <button key={option.value} type="button" aria-pressed={value===option.value} onClick={()=>onChange(option.value)}>{option.label}</button>)}</div>;
}
function Slider({label,value,onChange,min,max,step=1,suffix=''}) {
  return <label className="slider-field"><span>{label}<strong>{Number(value).toLocaleString('es-ES')}{suffix}</strong></span><input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(Number(e.target.value))}/></label>;
}
function VisualShell({title,aside,children,dark=false}) {
  return <section className={'interactive-visual'+(dark?' visual-dark':'')} aria-label={title}><div className="visual-head"><div><span className="visual-eyebrow">EN UNA IMAGEN</span><h2>{title}</h2></div></div>{children}{aside&&<p className="visual-disclaimer">{aside}</p>}</section>;
}

const flowSteps = [
  {name:'Texto',detail:'La pregunta empieza como caracteres. Todavía no hay tokens.'},
  {name:'Tokenizer',detail:'El tokenizer convierte el texto en piezas que el modelo reconoce.'},
  {name:'Tokens',detail:'Los identificadores de token son la entrada numérica del modelo.'},
  {name:'Modelo',detail:'Los pesos calculan una distribución para el siguiente token.'},
  {name:'Logits',detail:'Cada posible token recibe una puntuación antes de elegir.'},
  {name:'Muestreo',detail:'La estrategia de generación decide qué token sale.'},
  {name:'Tokens nuevos',detail:'El token elegido se añade a la secuencia. El ciclo continúa.'},
  {name:'Texto',detail:'El tokenizer decodifica los tokens generados para mostrarlos.'},
];
function FlowVisual() {
  const [step,setStep]=useState(null),[mode,setMode]=useState('pesos');
  return <VisualShell title="Sigue un token" aside="El esquema muestra una generación, no un entrenamiento." dark>
    <Choice label="Dónde se ejecuta" options={[{value:'pesos',label:'Pesos cargados aquí'},{value:'api',label:'API de proveedor'}]} value={mode} onChange={setMode}/>
    <div className="flow-surface"><div className="flow-steps">{flowSteps.map((item,i)=><button type="button" key={i} aria-pressed={step===i} onClick={()=>setStep(i)}><span>{String(i+1).padStart(2,'0')}</span>{item.name}</button>)}</div><div className="flow-detail" aria-live="polite">{step===null?<><span>EL RECORRIDO</span><strong>Del texto al texto</strong><p>El modelo puntúa el siguiente token, se elige uno y el ciclo continúa. Puedes abrir cualquier paso para verlo mejor.</p></>:<><span>PASO {String(step+1).padStart(2,'0')}</span><strong>{flowSteps[step].name}</strong><p>{flowSteps[step].detail}</p></>}</div></div>
    <p className="visual-under">{mode==='api'?'La secuencia ocurre en la infraestructura del proveedor. Tú envías la petición y recibes la respuesta.':'El proceso y los pesos están en la infraestructura que tú operas.'}</p>
  </VisualShell>;
}

function ArchitectureVisual() {
  const [size,setSize]=useState(7),[kind,setKind]=useState('dense'),[input,setInput]=useState(2048),[output,setOutput]=useState(512);
  return <VisualShell title="Tres cifras que no conviene mezclar" aside="Memoria de pesos ideal en FP16/BF16. El selector MoE no asigna expertos activos: esa cifra depende del checkpoint.">
    <div className="visual-controls"><div><span className="control-label">PARÁMETROS TOTALES</span><Choice label="Parámetros en miles de millones" options={[1,3,7,14,32,70].map(n=>({value:n,label:`${n}B`}))} value={size} onChange={setSize}/></div><div><span className="control-label">ARQUITECTURA</span><Choice label="Arquitectura" options={[{value:'dense',label:'Dense'},{value:'moe',label:'MoE'}]} value={kind} onChange={setKind}/></div></div>
    <div className="arch-layout"><div className="arch-stack"><span>Entrada</span><span>Atención · cabezas Q/KV</span><span>{kind==='moe'?'Router → expertos elegidos':'Red feed-forward'}</span><span>Siguiente bloque × capas</span></div><div className="arch-readout"><small>SOLO PESOS · FP16/BF16</small><strong>≈{size*2} GB</strong><p>{kind==='moe'?'Los pesos residentes dependen del total cargado. El cálculo de un token depende de los expertos activos.':'Es una cuenta ideal. Más parámetros no garantizan mejor respuesta.'}</p></div></div>
    <div className="context-demo"><div className="context-fields"><Slider label="Prompt" value={input} onChange={setInput} min={256} max={3584} step={256} suffix=" tokens"/><Slider label="Salida prevista" value={output} onChange={setOutput} min={128} max={2048} step={128} suffix=" tokens"/></div><div className={'context-result'+(input+output>4096?' over':'')}><span>Ventana de ejemplo · 4.096 tokens</span><strong>{(input+output).toLocaleString('es-ES')} / 4.096</strong><small>{input+output>4096?'El prompt y la respuesta exceden esta ventana de ejemplo.':'Prompt y salida comparten la misma ventana.'}</small></div></div>
  </VisualShell>;
}

const formats={gguf:{name:'GGUF',kind:'Formato',text:'Archivo y metadatos para modelos, frecuente con llama.cpp. Comprueba la cuantización concreta del archivo.'},awq:{name:'AWQ',kind:'Método',text:'Cuantización posentrenamiento que tiene en cuenta activaciones. El soporte depende del motor y del checkpoint.'},gptq:{name:'GPTQ',kind:'Método',text:'Otra familia de cuantización posentrenamiento. No equivale a un formato universal.'},fp8:{name:'FP8',kind:'Representación',text:'Coma flotante de ocho bits. Necesita soporte de hardware y kernels para el caso concreto.'}};
function PrecisionVisual() {
  const [size,setSize]=useState(8);
  const bytes={'FP32':4,'FP16/BF16':2,'FP8/INT8':1,'INT4':0.5};
  return <VisualShell title="Los bits cambian el tamaño ideal" aside="Cuenta ideal de pesos. Faltan escalas, metadatos, tensores sin cuantizar y memoria del runtime. Menos bits no garantizan más velocidad.">
    <div className="visual-controls"><div><span className="control-label">TAMAÑO DEL MODELO</span><Choice label="Tamaño de modelo" options={[{value:8,label:'8B'},{value:14,label:'14B'}]} value={size} onChange={setSize}/></div></div>
    <div className="precision-bars">{Object.entries(bytes).map(([name,value])=><div className="precision-bar" key={name}><strong>{name}</strong><div><span style={{width:`${value/4*100}%`}}/></div><small>{value.toLocaleString('es-ES')} B/parámetro</small><b>≈{(size*value).toLocaleString('es-ES')} GB</b></div>)}</div>
    <div className="format-catalog"><span className="control-label">NO SON LA MISMA CLASE DE ETIQUETA</span><div>{Object.values(formats).map(item=><article key={item.name}><strong>{item.name}</strong><small>{item.kind}</small><p>{item.text}</p></article>)}</div></div>
  </VisualShell>;
}

function MemoryVisual() {
  const [size,setSize]=useState(8),[precision,setPrecision]=useState(2),[tokens,setTokens]=useState(4096),[seqs,setSeqs]=useState(1);
  const weights=size*precision,kvMiB=128*tokens*seqs/1024;
  return <VisualShell title="Haz tu primera cuenta de VRAM" dark aside="KV ilustrativa: 32 capas, 8 KV heads, dimensión 128 y FP16. No representa automáticamente al modelo elegido. Faltan buffers, runtime y margen.">
    <div className="memory-controls"><div><span className="control-label">MODELO</span><Choice label="Parámetros" options={[{value:8,label:'8B'},{value:14,label:'14B'}]} value={size} onChange={setSize}/></div><div><span className="control-label">PESOS</span><Choice label="Bytes por parámetro" options={[{value:2,label:'FP16 · 2 B'},{value:1,label:'INT8 · ≈1 B'},{value:0.5,label:'INT4 · ≈0,5 B'}]} value={precision} onChange={setPrecision}/></div></div>
    <div className="memory-controls sliders"><Slider label="Tokens residentes por secuencia" value={tokens} onChange={setTokens} min={1024} max={8192} step={1024}/><Slider label="Secuencias iguales" value={seqs} onChange={setSeqs} min={1} max={8}/></div>
    <div className="memory-outcome"><div><small>PESOS IDEALES</small><strong>≈{weights.toLocaleString('es-ES')} GB</strong></div><span>+</span><div><small>KV ILUSTRATIVA</small><strong>≈{kvMiB>=1024?(kvMiB/1024).toLocaleString('es-ES',{maximumFractionDigits:2})+' GiB':kvMiB.toLocaleString('es-ES')+' MiB'}</strong></div><span className="memory-not-total">≠ VRAM total</span></div>
    <div className="formula-strip">KV bytes ≈ 2 × capas × cabezas KV × dimensión × bytes × tokens residentes</div>
    <p className="visual-under">Con 4.096 tokens: ≈512 MiB para una secuencia; ≈4 GiB para ocho iguales en este ejemplo.</p>
  </VisualShell>;
}

const decisionChecks=[
  'Tarea, idioma y calidad descritos con ejemplos',
  'Contexto y herramientas que necesita la aplicación',
  'Licencia y ficha del checkpoint leídas',
  'Tokenizer, plantilla de chat y configuración revisados',
  'Runtime, GPU, kernels y precisión compatibles',
  'Pesos, KV cache, runtime y margen presupuestados',
  'Prueba propia frente a otro candidato',
];
function DecisionVisual() {
  const [caseId,setCaseId]=useState('soporte');
  return <VisualShell title="Construye una decisión defendible" aside="La lista no elige un modelo por ti. Indica qué falta comprobar antes de probar un candidato.">
    <div className="visual-controls"><div><span className="control-label">CASO DE TRABAJO</span><Choice label="Caso de uso" options={[{value:'soporte',label:'Soporte en castellano'},{value:'codigo',label:'Ayuda con código'}]} value={caseId} onChange={setCaseId}/></div></div>
    <div className="decision-layout"><div className="decision-situation"><small>NECESIDAD</small><p>{caseId==='soporte'?'Responder en castellano con documentos largos y citas comprobables.':'Explicar cambios en un repositorio y proponer código con ejemplos reales.'}</p><strong>Empieza aquí. Luego descarta con datos.</strong></div><ol className="decision-checks">{decisionChecks.map((item,i)=><li key={item}><span>{String(i+1).padStart(2,'0')}</span>{item}</li>)}</ol></div>
    <p className="visual-under">La prueba con tus propios ejemplos decide. Anota también por qué queda fuera el otro candidato.</p>
  </VisualShell>;
}

const requests=[{id:'A',start:1,end:3},{id:'B',start:2,end:4},{id:'C',start:3,end:5}];
function ServingVisual() {
  return <VisualShell title="Deja entrar otra petición" dark aside="Secuencia conceptual. Las duraciones y el rendimiento reales dependen de la carga y la configuración.">
    <div className="serving-path">{['Cliente','API','Scheduler','Motor + GPU'].map((part,i)=><React.Fragment key={part}><span>{part}</span>{i<3&&<b aria-hidden="true">→</b>}</React.Fragment>)}</div>
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
  return <VisualShell title="¿Qué parte de la espera estás midiendo?" aside="1, 10 y 50 son puntos de prueba de ejemplo. El dibujo no contiene tiempos medidos ni promete capacidad.">
    <Choice label="Métrica" options={Object.entries(metrics).map(([value,item])=>({value,label:value==='total'?'Total':value==='sistema'?'Sistema':item.name.split(' ')[0]}))} value={metric} onChange={setMetric}/>
    <div className="metric-scene"><div className="metric-track"><span className="metric-request">Petición</span><span className={'metric-wait'+(metric==='TTFT'?' highlighted':'')}>Cola + entrada</span><span className={'metric-first'+(['TTFT','total'].includes(metric)?' highlighted':'')}>1.º token</span><span className={'metric-stream'+(['ITL','TPOT','total'].includes(metric)?' highlighted':'')}>▮　▮　▮　▮</span><span className="metric-end">Fin</span></div><div className="metric-description" aria-live="polite"><small>{metric==='sistema'?'VISIÓN DE SISTEMA':'VISIÓN DE LA PETICIÓN'}</small><h3>{metrics[metric].name}</h3><p>{metrics[metric].text}</p></div></div>
    <div className="test-points"><span>Probar con</span><Choice label="Concurrencia de prueba" options={[1,10,50].map(n=>({value:n,label:`${n} ${n===1?'petición':'peticiones'}`}))} value={load} onChange={setLoad}/><small>{load===50?'Busca el punto donde la cola o los errores rompen el objetivo.':'Mantén iguales el modelo, la GPU, los prompts, las salidas y el muestreo.'}</small></div>
  </VisualShell>;
}

function TuningVisual() {
  const groups=[
    {number:'01',name:'Memoria y contexto',keys:'gpu-memory-utilization · max-model-len · KV cache',text:'Más contexto y caché piden más VRAM. Deja margen.'},
    {number:'02',name:'Planificador',keys:'max-num-seqs · max-num-batched-tokens · lotes continuos',text:'Más trabajo por iteración puede subir el throughput y la espera.'},
    {number:'03',name:'Trabajo repetido',keys:'Prefix caching · chunked prefill',text:'Los prefijos compartidos se reutilizan; los prompts largos se trocean.'},
    {number:'04',name:'Ejecución',keys:'CUDA graphs · cuantización',text:'Menos overhead o pesos menores pueden costar memoria o calidad.'},
  ];
  return <VisualShell title="Cuatro palancas, cuatro costes" aside="Ajustes y soporte dependen de la versión de vLLM, el modelo, la GPU y la carga. No existe una configuración universal.">
    <div className="tuning-overview">{groups.map(group=><article key={group.number}><span>{group.number}</span><h3>{group.name}</h3><small>{group.keys}</small><p>{group.text}</p></article>)}</div>
    <p className="visual-under">Guarda una línea base. Cambia una o dos cosas y compara TTFT, throughput, errores y VRAM con la misma carga.</p>
  </VisualShell>;
}

const operations={
  'Clientes':'Envían peticiones con identidades y cuotas distintas.',
  'API gateway':'Autentica, aplica límites y registra lo necesario sin exponer prompts sensibles.',
  'Servicio IA':'Valida la petición y añade lógica de producto antes de llegar al modelo.',
  'Router':'Elige modelo, versión y réplica disponible.',
  'Réplicas vLLM':'Atienden peticiones; solo reciben tráfico cuando están listas tras carga y warmup.',
  'GPU(s)':'Ejecutan la inferencia. Su uso y VRAM son señales, no el único estado de salud.',
};
function ProductionVisual() {
  const [node,setNode]=useState('Réplicas vLLM'),[scenario,setScenario]=useState('normal');
  const scenarioText={normal:'El router envía tráfico a réplicas listas. Vigila TTFT, cola, errores y VRAM.',carga:'Una réplica recién arrancada aún carga pesos. El health check puede pasar; readiness debe esperar.',fallo:'Una réplica falla. El router deja de enviarle tráfico y las demás absorben lo que puedan.',version:'Despliega una nueva versión a una parte del tráfico. Evalúa y conserva el camino de rollback.'};
  return <VisualShell title="Recorre el servicio de extremo a extremo" dark aside="Arquitectura conceptual. Kubernetes puede ayudar a desplegarla, pero no es un requisito.">
    <Choice label="Situación del servicio" options={[{value:'normal',label:'Normal'},{value:'carga',label:'Nueva réplica'},{value:'fallo',label:'Fallo'},{value:'version',label:'Nueva versión'}]} value={scenario} onChange={setScenario}/>
    <div className="production-flow">{Object.keys(operations).map((name,i)=><React.Fragment key={name}><button aria-pressed={node===name} onClick={()=>setNode(name)}>{name}</button>{i<5&&<span aria-hidden="true">→</span>}</React.Fragment>)}</div>
    <div className="production-detail"><div><small>PIEZA SELECCIONADA</small><strong>{node}</strong><p>{operations[node]}</p></div><div><small>QUÉ OCURRE AHORA</small><p aria-live="polite">{scenarioText[scenario]}</p></div></div>
    <div className="production-bottom">Medir: TTFT · cola · errores · peticiones activas · VRAM · coste</div>
  </VisualShell>;
}

const strategies={
  TP:{name:'Tensor Parallelism',a:'Operación / parte A',b:'Operación / parte B',link:'Comunicación frecuente',text:'Divide operaciones dentro de una capa. El enlace entre GPU importa.'},
  PP:{name:'Pipeline Parallelism',a:'Capas iniciales',b:'Capas finales',link:'Pasan activaciones',text:'Reparte capas. Burbujas o etapas desiguales pueden frenar el throughput.'},
  DP:{name:'Data Parallelism',a:'Réplica A',b:'Réplica B',link:'Peticiones distintas',text:'Cada réplica necesita suficiente memoria para su modelo o grupo multi-GPU.'},
  EP:{name:'Expert Parallelism',a:'Expertos A',b:'Expertos B',link:'Tokens enrutados',text:'Distribuye expertos MoE. El router envía tokens a los expertos elegidos.'},
  CP:{name:'Context Parallelism',a:'Contexto / parte A',b:'Contexto / parte B',link:'Atención repartida',text:'Reparte trabajo o estado para contextos largos. Distingue prefill y decode según soporte.'},
};
function ParallelVisual() {
  return <VisualShell title="¿Qué recurso se ha quedado corto?" aside="NVLink, PCIe y red tienen costes distintos. Ninguna estrategia garantiza aceleración lineal.">
    <div className="parallel-overview">{Object.entries(strategies).map(([key,item])=><article key={key}><div className="parallel-title"><b>{key}</b><strong>{item.name}</strong></div><div className="parallel-pair"><span>{item.a}</span><em>{item.link}</em><span>{item.b}</span></div><p>{item.text}</p></article>)}</div>
  </VisualShell>;
}

function SizingVisual() {
  const weights={'FP16/BF16':28,'INT8':14,'INT4':7};
  const criteria=['Calidad comprobada','TTFT p95 medido','Errores medidos','Margen de VRAM medido'];
  return <VisualShell title="14B en 24 GB: la cuenta no acaba en los pesos" dark aside="Ejercicio hipotético. Las cifras de pesos son ideales; ninguna variante se ha benchmarkeado aquí.">
    <div className="sizing-intro"><div><small>CHECKPOINT</small><strong>≈14B</strong></div><div><small>TARJETA</small><strong>24 GB</strong></div><div><small>CONTEXTO POR PETICIÓN</small><strong>2.048 + hasta 512</strong></div></div>
    <div className="sizing-weights">{Object.entries(weights).map(([name,value])=><div key={name} className={value>24?'over':''}><small>{name} · SOLO PESOS</small><strong>≈{value} GB</strong><p>{value>24?'Ya supera la tarjeta.':'Podría dejar margen, pero falta medir KV, runtime y buffers.'}</p></div>)}</div>
    <div className="sizing-hypothesis"><small>HIPÓTESIS INICIAL · SIN BENCHMARK</small><strong>Checkpoint cuantizado compatible · max-model-len 4096 · gpu-memory-utilization 0.85</strong><span>Probar 1 → 4 → 8 solicitudes activas</span></div>
    <div className="acceptance"><span className="control-label">PARA ACEPTARLA HAY QUE MEDIR</span><div>{criteria.map((label,i)=><span key={label}>{String(i+1).padStart(2,'0')} · {label}</span>)}</div><p>Objetivo didáctico: TTFT p95 &lt; 2 s y errores &lt; 1 %. Ninguna variante está validada todavía.</p></div>
  </VisualShell>;
}

const visuals={flow:FlowVisual,architecture:ArchitectureVisual,precision:PrecisionVisual,memory:MemoryVisual,decision:DecisionVisual,serving:ServingVisual,metrics:MetricsVisual,tuning:TuningVisual,production:ProductionVisual,parallel:ParallelVisual,sizing:SizingVisual};
export default function WorkshopVisual({type}) { const Component=visuals[type]; return Component?<Component/>:null; }
