export const event = {
  name: 'VallaTech Summit 2026',
  subtitle: 'DevFest Valladolid',
  date: '13 de noviembre de 2026',
  place: 'Escuela de Ingeniería Informática · Universidad de Valladolid',
  url: 'https://gdg.community.dev/events/details/google-gdg-valladolid-presents-vallatech-summit-2026-devfest-valladolid/',
};

export const stages = [
  { id: 'fundamentos', name: '01 / Fundamentos' },
  { id: 'servicio', name: '02 / Servicio' },
  { id: 'produccion', name: '03 / Producción' },
];

export const sections = [
  {
    id: '01', stage: 'fundamentos', title: '¿Qué significa ejecutar un LLM?', short: 'Ejecutar un LLM', visual: 'flow',
    storyHeading: 'Qué ocurre al pedir una respuesta',
    lead: 'Escribes una pregunta. El modelo no ve palabras: recibe tokens y calcula cuál puede venir después.',
    idea: 'En inferencia usamos pesos ya entrenados. Entrenar significa cambiar esos pesos.',
    story: [
      { title: 'Del prompt a la respuesta', text: 'El tokenizer convierte el texto en tokens. El modelo calcula puntuaciones (logits) para el siguiente token; el muestreo elige uno. El proceso se repite y el tokenizer convierte los tokens nuevos en texto. Hay que usar el tokenizer y la plantilla de chat del checkpoint: ambos afectan a lo que recibe el modelo.' },
      { title: 'Dónde se ejecuta', text: 'Con una API envías mensajes a un proveedor y recibes la respuesta. Con pesos descargados eliges el runtime, la GPU y cómo servir el modelo. El paquete incluye pesos, tokenizer, configuración, arquitectura y, normalmente, plantilla de chat. Que los pesos se puedan descargar no significa que la licencia sea de código abierto: hay que leerla.' },
      { title: 'Herramientas que usaremos', text: 'Hugging Face reúne checkpoints y fichas de modelos. Transformers sirve para cargarlos y experimentar desde código. llama.cpp se usa a menudo con GGUF para inferencia local; Ollama facilita arrancar modelos; vLLM ayuda a servir peticiones simultáneas.' },
    ],
    notebook: 'Notebook 01 · Primera inferencia, tokenizer y generación',
  },
  {
    id: '02', stage: 'fundamentos', title: 'Tamaño, parámetros y arquitectura', short: 'Tamaño y arquitectura', visual: 'architecture',
    storyHeading: 'Qué significan esas cifras',
    lead: 'Un modelo de 7B tiene unos siete mil millones de parámetros. Esa cifra, por sí sola, no te dice cómo responderá.',
    idea: 'Tamaño del modelo y longitud de contexto son cosas distintas.',
    story: [
      { title: 'Un bloque, repetido muchas veces', text: 'Un decoder apila bloques de atención y una red feed-forward. Las capas indican cuántas veces se repite el bloque; hidden size, la anchura de la representación. Las attention heads reparten el trabajo de atención y las KV heads influyen en la memoria que se conserva al generar.' },
      { title: 'Dense y MoE', text: 'En un modelo Dense participan sus bloques principales en cada token. En MoE, un router escoge algunos expertos. Para guardar el modelo importan todos los pesos cargados; para el cálculo por token importan, entre otras cosas, los expertos activos. Un 14B MoE no se puede evaluar como si fuera un 14B Dense.' },
      { title: 'El contexto tiene su propio límite', text: 'Prompt y respuesta comparten ventana. Si el límite es 4.096 tokens y envías 3.800, quedan como mucho 296 para generar. Los tamaños 1B, 3B, 7B, 14B, 32B y 70B hablan de parámetros, no de contexto. Más parámetros suelen pedir más memoria y cálculo, pero no garantizan mejor calidad.' },
    ],
  },
  {
    id: '03', stage: 'fundamentos', title: 'Precisión y cuantización', short: 'Precisión y cuantización', visual: 'precision',
    storyHeading: 'Qué cambia al usar menos bits',
    lead: 'Podemos guardar una aproximación de los pesos con menos bits. Ocupan menos; la calidad y la velocidad se comprueban.',
    idea: 'Menos memoria para pesos no garantiza una respuesta más rápida.',
    story: [
      { title: 'La cuenta de los pesos', text: 'FP32 usa 4 bytes por parámetro; FP16/BF16, 2; FP8/INT8, cerca de 1; INT4, cerca de 0,5. Son cifras ideales: faltan escalas, metadatos, tensores que quedan sin cuantizar y memoria del runtime.' },
      { title: 'No todas las etiquetas significan lo mismo', text: 'GGUF es un formato de archivo con metadatos, habitual en llama.cpp. AWQ y GPTQ son métodos de cuantización posentrenamiento. FP8 es una representación numérica. Para cada variante hay que comprobar soporte del modelo, la GPU, el runtime y sus kernels.' },
      { title: 'Compáralas con tu tarea', text: 'Usa dos variantes del mismo modelo, los mismos prompts y el mismo muestreo. Mide memoria, calidad y tiempos. Una variante puede ahorrar VRAM y responder peor; otra puede ser más lenta por falta de kernels adecuados.' },
    ],
    notebook: 'Notebook 02 · Comparar dos variantes del mismo modelo',
  },
  {
    id: '04', stage: 'fundamentos', title: 'Estimar la VRAM', short: 'Estimar la VRAM', visual: 'memory',
    storyHeading: 'La memoria que falta en la primera cuenta',
    lead: 'Multiplicar parámetros por bytes da un punto de partida. La GPU necesita espacio para más cosas.',
    idea: 'Memoria de pesos ≈ parámetros × bytes por parámetro.',
    story: [
      { title: 'Primero, los pesos', text: 'Un 8B en FP16 ocupa alrededor de 16 GB decimales, unos 14,9 GiB, solo en pesos. No es la VRAM total que verás ocupada.' },
      { title: 'Después, la KV cache', text: 'En un Transformer/GQA estándar puedes estimarla así: 2 × capas × KV heads × dimensión de head × bytes por elemento × tokens residentes. Cuanto más contexto y más secuencias activas, más memoria suele necesitar.' },
      { title: 'Un ejemplo ilustrativo', text: 'Con 32 capas, 8 KV heads, dimensión 128 y FP16 salen unos 128 KiB por token. Para 4.096 tokens son unos 512 MiB por secuencia; para ocho secuencias iguales, unos 4 GiB. La fórmula cambia con arquitecturas como MLA o atención de ventana deslizante.' },
      { title: 'Reserva sitio para ejecutar', text: 'Activaciones, buffers, runtime, CUDA graphs y margen de seguridad completan el presupuesto. También influyen metadatos, pools reservados y ajustes de ejecución. Carga el modelo y mide con una carga parecida a la real.' },
    ],
    notebook: 'Notebook 03 · Calcular, cargar y comparar memoria teórica y observada',
  },
  {
    id: '05', stage: 'fundamentos', title: 'Elegir un modelo', short: 'Elegir un modelo', visual: 'decision',
    storyHeading: 'Cómo hacer una lista corta',
    lead: 'Antes de mirar un ranking, escribe qué necesita hacer el modelo y con qué restricciones.',
    idea: 'Elige candidatos con datos públicos; decide con pruebas de tu caso.',
    story: [
      { title: 'Concreta la tarea', text: '«Responder en castellano preguntas de soporte con documentos de 3.000 tokens y citas» permite fijar idioma, calidad, contexto y posible uso de herramientas. Así puedes comparar respuestas con ejemplos representativos.' },
      { title: 'Comprueba el checkpoint', text: 'Mira parámetros y arquitectura Dense o MoE, licencia, precisión disponible, ficha del modelo, configuración, tokenizer y plantilla de chat. Verifica que modelo, GPU, runtime y kernels son compatibles. Calcula pesos, KV cache y margen antes de cargarlo.' },
      { title: 'Prueba y explica el descarte', text: 'Los benchmarks públicos ayudan a encontrar candidatos; lee cómo se midieron. Después prueba tu tarea. En grupos, elegid un caso de uso, una GPU y un contexto. Explicad qué modelo probaríais y por qué habéis descartado otro.' },
    ],
  },
  {
    id: '06', stage: 'servicio', title: 'Transformers, vLLM y servicio', short: 'Del modelo al servicio', visual: 'serving',
    storyHeading: 'Qué pasa cuando llegan varias peticiones',
    lead: 'Generar una respuesta desde un script es sencillo. Servir a varias personas a la vez exige ordenar el trabajo.',
    idea: 'Cliente → API → planificador → motor de inferencia y GPU.',
    story: [
      { title: 'Para investigar un modelo', text: 'Transformers da acceso directo al checkpoint y control sobre la generación desde código. Puedes inspeccionar el tokenizer, las entradas y las salidas mientras desarrollas.' },
      { title: 'Para exponer una API', text: 'vLLM incorpora planificación de peticiones, gestión de KV cache y lotes continuos. Puede ofrecer una API compatible con clientes de estilo OpenAI. Transformers y vLLM pueden usarse en distintos momentos del mismo proyecto.' },
      { title: 'Un lote que cambia mientras trabaja', text: 'Una petición nueva puede entrar mientras otras siguen generando; otra termina y deja sitio. El dibujo muestra cómo funciona el lote continuo. No contiene una mejora de rendimiento medida.' },
    ],
    notebook: 'Notebook 04 · Generar con vLLM y llamar a su endpoint',
  },
  {
    id: '07', stage: 'servicio', title: 'Métricas de rendimiento', short: 'Medir el servicio', visual: 'metrics',
    storyHeading: 'Qué medir y para quién',
    lead: 'Una persona nota la espera hasta el primer token. Quien opera el servicio mira además cuántas peticiones termina.',
    idea: 'Más trabajo total puede significar más espera para cada persona.',
    story: [
      { title: 'La experiencia de una persona', text: 'TTFT es el tiempo hasta el primer token. ITL mide el intervalo entre tokens consecutivos; TPOT suele ser el tiempo medio por token de salida después del primero, cuando se usa esa definición. La latencia total termina con el último token.' },
      { title: 'El trabajo del sistema', text: 'Los tokens de salida por segundo y las peticiones terminadas por segundo miden trabajo agregado. Añade concurrencia, longitud de la cola y errores. Un throughput mayor puede llegar acompañado de más espera.' },
      { title: 'Una prueba comparable', text: 'Mantén iguales modelo, GPU, prompts, longitudes de salida y parámetros de muestreo. Haz warmup, repite y publica percentiles y errores. Puedes probar 1, 10 y 50 peticiones concurrentes como puntos de exploración, nunca como promesa de capacidad.' },
    ],
    notebook: 'Notebook 05 · Medir concurrencia y detectar cuándo la cola rompe el objetivo',
  },
  {
    id: '08', stage: 'servicio', title: 'Ajustar vLLM', short: 'Ajustar vLLM', visual: 'tuning',
    storyHeading: 'Ajustar sin perder la referencia',
    lead: 'Guarda una primera medición. Después cambia uno o dos ajustes y compara con la misma carga.',
    idea: 'No existe un ajuste de vLLM que sea el mejor para todos los modelos y GPU.',
    story: [
      { title: 'Memoria y contexto', text: 'gpu-memory-utilization orienta el presupuesto de memoria de vLLM; max-model-len pone el límite de contexto. Una ventana mayor puede exigir más KV cache. Deja margen para buffers y ejecución.' },
      { title: 'Cuántas secuencias entran', text: 'max-num-seqs limita secuencias simultáneas y max-num-batched-tokens, tokens por lote. Más trabajo puede elevar el throughput y también la latencia o el uso de VRAM. La longitud real de prompts y respuestas cambia el resultado.' },
      { title: 'Trabajo que se puede ahorrar', text: 'Prefix caching sirve cuando se repite el comienzo del prompt. Chunked prefill divide un prompt largo y permite intercalarlo con decode. CUDA graphs pueden reducir el coste de lanzamiento, usando memoria extra. Cuantización, concurrencia y planificación también influyen. El soporte y los valores por defecto dependen de la versión, el modelo, la GPU y la carga.' },
    ],
    notebook: 'Notebook 06 · Cambiar uno o dos ajustes y comparar con la línea base',
  },
  {
    id: '09', stage: 'produccion', title: 'Servir el modelo en producción', short: 'Operar en producción', visual: 'production',
    storyHeading: 'Mantener el servicio en marcha',
    lead: 'Una réplica puede fallar y una versión nueva puede responder de otra forma. Ambas cosas hay que preverlas.',
    idea: 'Clientes → pasarela API → servicio IA → enrutador → réplicas vLLM → GPU.',
    story: [
      { title: 'Una réplica lista de verdad', text: 'El proceso puede estar vivo mientras el modelo sigue cargando. La señal de disponibilidad (readiness) debe esperar a la carga y al calentamiento. Usa comprobaciones de salud, varias réplicas cuando haga falta disponibilidad, despliegues graduales y una vía de vuelta a la versión anterior.' },
      { title: 'Escalar no es instantáneo', text: 'Puedes dar más recursos a una réplica o añadir otras. Para escalar automáticamente observa cola, TTFT, errores, peticiones activas y uso de GPU. El planificador debe encontrar GPU; arrancar otra réplica exige cargar pesos y calentar el modelo.' },
      { title: 'Medir y proteger', text: 'Observa TTFT, latencia, throughput, tokens, tiempo en cola, errores, solicitudes activas, VRAM, uso de GPU y coste. Prometheus/Grafana y OpenTelemetry son opciones. Añade autenticación, autorización, cuotas, límites de tasa, gestión de claves, aislamiento de red y auditoría. Evita registrar prompts sensibles sin una razón clara.' },
      { title: 'Publicar otra versión', text: 'El enrutador elige modelo, versión y réplica. Evalúa antes de publicar; prueba la versión nueva con una parte del tráfico o haz una prueba A/B cuando ayude. Prepara la vuelta atrás. Compara coste por petición terminada o token de salida con la misma calidad y SLO; incluye GPU reservadas aunque estén ociosas. Kubernetes es una opción de despliegue, no un requisito.' },
    ],
  },
  {
    id: '10', stage: 'produccion', title: 'Paralelismo en varias GPU', short: 'Paralelismo multi-GPU', visual: 'parallel',
    storyHeading: 'Elige qué vas a repartir',
    lead: 'Primero identifica el límite: ¿no cabe el modelo, falta cálculo, el contexto es demasiado largo o llegan demasiadas peticiones?',
    idea: 'TP, PP, DP, EP y CP resuelven problemas distintos; mover datos entre GPU también cuesta.',
    story: [
      { title: 'Repartir el modelo', text: 'Tensor Parallelism divide operaciones dentro de cada capa y requiere comunicación frecuente. Pipeline Parallelism coloca grupos de capas en distintas GPU: pasan activaciones entre etapas y pueden aparecer tiempos muertos si una etapa tarda más.' },
      { title: 'Repartir peticiones', text: 'Data Parallelism crea réplicas que atienden solicitudes distintas. Cada réplica debe tener memoria suficiente para el modelo o para su propio grupo multi-GPU. Añadir réplicas no reduce los pesos que necesita cada una.' },
      { title: 'Expertos y contextos largos', text: 'Expert Parallelism coloca expertos MoE en distintas GPU y envía tokens a los expertos elegidos. Context Parallelism reparte trabajo o estado de atención; prefill y decode pueden funcionar de forma distinta. Comprueba soporte en el modelo, backend y versión que vayas a usar.' },
      { title: 'El enlace entre GPU importa', text: 'NVLink, PCIe y red tienen costes de comunicación diferentes. Un reparto útil en papel puede pasar demasiado tiempo moviendo datos. Hay que medirlo; no cuentes con una aceleración lineal.' },
    ],
    notebook: 'Notebook 07 · Demo guiada: TP=2 y EP si el hardware lo permite',
    footnote: 'Si no hay varias GPU para cada asistente, esta parte queda como demostración de los ponentes.',
  },
  {
    id: '11', stage: 'produccion', title: 'Ejercicio final: dimensionar', short: 'Dimensionar juntos', visual: 'sizing',
    storyHeading: 'Qué comprobar antes de ponerlo en marcha',
    lead: 'Caso hipotético: un modelo de unos 14B, una GPU de 24 GB y ocho peticiones activas como primer objetivo.',
    idea: 'Solo aceptaremos la configuración si pasa las pruebas de calidad, latencia, errores y memoria.',
    story: [
      { title: 'Los pesos, antes de ejecutar', text: 'FP16/BF16 ocuparían unos 28 GB: ya superan la tarjeta de 24 GB. INT8 rondaría 14 GB e INT4, 7 GB. Son cuentas ideales; ninguna demuestra que el modelo quepa o cumpla el objetivo.' },
      { title: 'Lo que falta para calcular la caché', text: 'Comprueba arquitectura y licencia, capas, KV heads y tamaño del estado de atención del checkpoint. Con 2.048 tokens de entrada y hasta 512 de salida por petición, estima la KV cache para ocho solicitudes. Verifica GPU, cuantización, runtime y margen.' },
      { title: 'Un primer ensayo, sin validar', text: 'Prueba un checkpoint cuantizado compatible, max-model-len 4096 y gpu-memory-utilization 0.85. Mide con 1, 4 y 8 peticiones activas. El objetivo didáctico es TTFT p95 inferior a 2 segundos y menos de un 1 % de errores. No hemos benchmarkeado esta configuración.' },
      { title: 'Según lo que muestren las pruebas', text: 'Si no cabe, prueba otra precisión o TP/PP. Si cabe pero no hay capacidad para la carga, valora réplicas DP. Para producción añade router, readiness, límites, autenticación, observabilidad, evaluación de versiones y rollback.' },
    ],
    decisions: [
      'Verificar arquitectura y licencia del checkpoint.',
      'Calcular el peso ideal en FP16/BF16, INT8 e INT4.',
      'Estimar la KV cache con el contexto y la concurrencia previstos.',
      'Elegir contexto, runtime y primeros ajustes que probar.',
      'Definir la prueba de carga y las métricas que decidirán.',
      'Decidir cuándo hacen falta otra GPU, TP/PP o réplicas DP.',
      'Añadir controles de producción y observabilidad.',
    ],
  },
];

export const sectionById = Object.fromEntries(sections.map(section => [section.id, section]));
