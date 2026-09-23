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
    storyHeading: 'Qué hace el modelo con tu pregunta',
    lead: 'El modelo convierte la pregunta en tokens y calcula cuál generará después.',
    idea: 'La inferencia usa pesos entrenados. El entrenamiento modifica esos pesos.',
    story: [
      { title: 'Así genera texto', text: 'El tokenizer convierte el texto en tokens. El modelo asigna una puntuación (logit) a cada opción y el muestreo elige el siguiente token. Repite el cálculo hasta terminar. El tokenizer convierte los tokens generados en texto. Usa el tokenizer y la plantilla de chat que corresponden al modelo.' },
      { title: 'Quién pone el modelo', text: 'Con una API, el proveedor ejecuta el modelo y te devuelve la respuesta. Si descargas los pesos, eliges el runtime, la GPU y cómo servirlo. El paquete suele incluir pesos, tokenizer, configuración, arquitectura y plantilla de chat. Que puedas descargar los pesos no significa que la licencia sea de código abierto: comprueba sus condiciones.' },
      { title: 'Herramientas habituales', text: 'Hugging Face reúne modelos y sus fichas. Transformers permite cargarlos y probarlos desde código. llama.cpp suele trabajar con archivos GGUF para ejecutar modelos. Ollama facilita ponerlos en marcha. vLLM organiza peticiones simultáneas.' },
    ],
    notebook: 'Notebook 01 · Primera inferencia, tokenizer y generación',
  },
  {
    id: '02', stage: 'fundamentos', title: 'Tamaño, parámetros y arquitectura', short: 'Tamaño y arquitectura', visual: 'architecture',
    storyHeading: 'Parámetros, capas y contexto',
    lead: 'Un modelo de 7B tiene unos siete mil millones de parámetros. Esa cifra, por sí sola, no te dice cómo responderá.',
    idea: 'Tamaño del modelo y longitud de contexto son cosas distintas.',
    story: [
      { title: 'Un bloque, repetido muchas veces', text: 'Un decoder apila bloques de atención y una red feed-forward. Las capas indican cuántas veces se repite el bloque; hidden size, la anchura de la representación. Las attention heads reparten el trabajo de atención y las KV heads influyen en la memoria que se conserva al generar.' },
      { title: 'Dense y MoE', text: 'En un modelo Dense participan sus bloques principales en cada token. En MoE, un router escoge algunos expertos. La memoria depende de los pesos que cargas; el cálculo por token depende también de los expertos activos.' },
      { title: 'El contexto tiene su propio límite', text: 'El prompt y la respuesta comparten ventana. Si el límite es 4.096 tokens y envías 3.800, quedan como mucho 296 para generar. Los tamaños 1B, 3B, 7B, 14B, 32B y 70B cuentan parámetros; no indican la longitud del contexto. Más parámetros suelen pedir más memoria y cálculo, pero no garantizan mejor calidad.' },
    ],
  },
  {
    id: '03', stage: 'fundamentos', title: 'Precisión y cuantización', short: 'Precisión y cuantización', visual: 'precision',
    storyHeading: 'Guardar los pesos con menos bits',
    lead: 'La cuantización representa los pesos con menos bits. Así ocupan menos; la calidad y la velocidad dependen del modelo y el hardware.',
    idea: 'Menos memoria para pesos no garantiza una respuesta más rápida.',
    story: [
      { title: 'La cuenta de los pesos', text: 'FP32 usa 4 bytes por parámetro; FP16/BF16, 2; FP8/INT8, cerca de 1; INT4, cerca de 0,5. Son cifras ideales: faltan escalas, metadatos, tensores que quedan sin cuantizar y memoria del runtime.' },
      { title: 'Formato, método y representación', text: 'GGUF es un formato de archivo con metadatos, habitual en llama.cpp. AWQ y GPTQ son métodos de cuantización posentrenamiento. FP8 es una representación numérica. Para cada variante hay que comprobar soporte del modelo, la GPU, el runtime y sus kernels.' },
      { title: 'Compáralas con tu tarea', text: 'Usa dos variantes del mismo modelo, los mismos prompts y el mismo muestreo. Mide memoria, calidad y tiempos. Una variante puede ahorrar VRAM y responder peor; otra puede ser más lenta por falta de kernels adecuados.' },
    ],
    notebook: 'Notebook 02 · Comparar dos variantes del mismo modelo',
  },
  {
    id: '04', stage: 'fundamentos', title: 'Estimar la VRAM', short: 'Estimar la VRAM', visual: 'memory',
    storyHeading: 'Qué más ocupa la GPU',
    lead: 'Parámetros × bytes estima el espacio de los pesos. La ejecución necesita memoria adicional.',
    idea: 'Memoria de pesos ≈ parámetros × bytes por parámetro.',
    story: [
      { title: 'Calcula los pesos', text: 'Un modelo 8B en FP16 ocupa unos 16 GB decimales (14,9 GiB) en pesos. Esa cifra no incluye el resto de la VRAM.' },
      { title: 'Suma la KV cache', text: 'Para un Transformer/GQA estándar, usa esta aproximación: 2 × capas × KV heads × dimensión de head × bytes por elemento × tokens residentes. Un contexto más largo o más secuencias activas suelen aumentar esta memoria.' },
      { title: 'Una cuenta para GQA', text: 'Supongamos 32 capas, 8 KV heads, dimensión 128 y FP16: son unos 128 KiB por token. Una secuencia de 4.096 tokens ocupa unos 512 MiB; ocho secuencias iguales, unos 4 GiB. MLA y la atención de ventana deslizante necesitan otra cuenta.' },
      { title: 'Memoria de ejecución', text: 'Suma activaciones, buffers, runtime, CUDA graphs y un margen de seguridad. También cuentan metadatos, pools reservados y ajustes de ejecución. Carga el modelo y mide con una carga parecida a la real.' },
    ],
    notebook: 'Notebook 03 · Calcular, cargar y comparar memoria teórica y observada',
  },
  {
    id: '05', stage: 'fundamentos', title: 'Elegir un modelo', short: 'Elegir un modelo', visual: 'decision',
    storyHeading: 'Qué comprobar en cada modelo',
    lead: 'Anota la tarea, el idioma y el contexto que necesitas antes de comparar modelos.',
    idea: 'Los benchmarks ayudan a buscar. Prueba los candidatos con ejemplos de tu trabajo.',
    story: [
      { title: 'Concreta la tarea', text: '«Responder en castellano preguntas de soporte con documentos de 3.000 tokens y citas» permite fijar idioma, calidad, contexto y posible uso de herramientas. Así puedes comparar respuestas con ejemplos representativos.' },
      { title: 'Comprueba el checkpoint', text: 'Mira parámetros y arquitectura Dense o MoE, licencia, precisión disponible, ficha del modelo, configuración, tokenizer y plantilla de chat. Verifica que modelo, GPU, runtime y kernels son compatibles. Calcula pesos, KV cache y margen antes de cargarlo.' },
      { title: 'Prueba y explica el descarte', text: 'Los benchmarks públicos ayudan a encontrar candidatos; lee cómo se midieron. Después prueba tu tarea. En grupos, elegid un caso de uso, una GPU y un contexto. Explicad qué modelo probaríais y por qué habéis descartado otro.' },
    ],
  },
  {
    id: '06', stage: 'servicio', title: 'Transformers, vLLM y servicio', short: 'Probar y servir', visual: 'serving',
    storyHeading: 'Qué pasa cuando llegan varias peticiones',
    lead: 'Un script genera respuestas. Un servidor reparte la GPU entre las peticiones que llegan a la vez.',
    idea: 'Cliente → API → planificador → motor de inferencia y GPU.',
    story: [
      { title: 'Prueba el modelo con Transformers', text: 'Transformers da acceso directo al checkpoint. Desde código puedes inspeccionar el tokenizer, las entradas y las salidas, y cambiar los parámetros de generación.' },
      { title: 'Sirve peticiones con vLLM', text: 'vLLM planifica las peticiones, gestiona la KV cache y forma lotes continuos. También ofrece una API que funciona con clientes de estilo OpenAI. Puedes usar Transformers durante el desarrollo y vLLM al servir el modelo.' },
      { title: 'Las peticiones comparten la GPU', text: 'Una petición nueva puede entrar mientras otras generan. Cuando una termina, deja sitio a la siguiente. El esquema explica el lote continuo; no muestra una mejora de rendimiento medida.' },
    ],
    notebook: 'Notebook 04 · Generar con vLLM y llamar a su endpoint',
  },
  {
    id: '07', stage: 'servicio', title: 'Métricas de rendimiento', short: 'Medir el servicio', visual: 'metrics',
    storyHeading: 'Tiempo de espera y capacidad',
    lead: 'Una persona nota la espera hasta el primer token. Quien opera el servicio mira además cuántas peticiones termina.',
    idea: 'Más trabajo total puede significar más espera para cada persona.',
    story: [
      { title: 'Cuánto espera cada persona', text: 'TTFT mide el tiempo hasta el primer token. ITL mide el intervalo entre tokens consecutivos. TPOT suele ser el tiempo medio por token de salida después del primero, cuando se usa esa definición. La latencia total acaba con el último token.' },
      { title: 'Cuánto termina el servicio', text: 'Los tokens de salida por segundo y las peticiones terminadas por segundo miden la capacidad total. Registra también concurrencia, longitud de cola y errores. Un throughput mayor puede venir con más espera.' },
      { title: 'Repite la misma prueba', text: 'Usa el mismo modelo, GPU, prompts, longitud de salida y parámetros de muestreo. Calienta el servicio, repite y comunica percentiles y errores. Prueba 1, 10 y 50 peticiones concurrentes como ejemplos; no son cifras de capacidad.' },
    ],
    notebook: 'Notebook 05 · Medir concurrencia y detectar cuándo la cola rompe el objetivo',
  },
  {
    id: '08', stage: 'servicio', title: 'Ajustar vLLM', short: 'Ajustar vLLM', visual: 'tuning',
    storyHeading: 'Compara cada cambio con la base',
    lead: 'Mide primero. Luego cambia uno o dos ajustes y repite la misma carga.',
    idea: 'Los valores adecuados dependen del modelo, la GPU y las peticiones.',
    story: [
      { title: 'Memoria y contexto', text: 'gpu-memory-utilization orienta el presupuesto de memoria de vLLM; max-model-len pone el límite de contexto. Una ventana mayor puede exigir más KV cache. Deja margen para buffers y ejecución.' },
      { title: 'Cuántas secuencias entran', text: 'max-num-seqs limita secuencias simultáneas y max-num-batched-tokens, tokens por lote. Más trabajo puede elevar el throughput y también la latencia o el uso de VRAM. La longitud real de prompts y respuestas cambia el resultado.' },
      { title: 'Reutiliza o divide el trabajo', text: 'Prefix caching sirve cuando se repite el comienzo del prompt. Chunked prefill divide un prompt largo y permite intercalarlo con decode. CUDA graphs pueden reducir el coste de lanzamiento, usando memoria extra. Cuantización, concurrencia y planificación también influyen. El soporte y los valores por defecto dependen de la versión, el modelo, la GPU y la carga.' },
    ],
    notebook: 'Notebook 06 · Cambiar uno o dos ajustes y comparar con la línea base',
  },
  {
    id: '09', stage: 'produccion', title: 'Servir el modelo en producción', short: 'Operar en producción', visual: 'production',
    storyHeading: 'Que el servicio siga respondiendo',
    lead: 'Si una réplica falla, las demás deben seguir atendiendo. Antes de publicar una versión, comprueba cómo responde.',
    idea: 'Clientes → pasarela API → servicio IA → enrutador → réplicas vLLM → GPU.',
    story: [
      { title: 'Cuándo puede recibir tráfico', text: 'El proceso puede estar vivo mientras el modelo sigue cargando. La señal de disponibilidad (readiness) debe esperar a la carga y al calentamiento. Usa comprobaciones de salud, réplicas para mantener el servicio si hace falta, despliegues graduales y una forma de volver a la versión anterior.' },
      { title: 'Arrancar una réplica lleva tiempo', text: 'Puedes dar más recursos a una réplica o añadir otras. Para escalar automáticamente, observa la cola, TTFT, errores, peticiones activas y uso de GPU. El planificador debe encontrar GPU; la nueva réplica tiene que cargar los pesos y calentar el modelo.' },
      { title: 'Medir y proteger', text: 'Observa TTFT, latencia, throughput, tokens, tiempo en cola, errores, solicitudes activas, VRAM, uso de GPU y coste. Prometheus/Grafana y OpenTelemetry son opciones. Añade autenticación, autorización, cuotas, límites de tasa, gestión de claves, aislamiento de red y auditoría. Evita registrar prompts sensibles sin una razón clara.' },
      { title: 'Publicar otra versión', text: 'El enrutador elige modelo, versión y réplica. Evalúa antes de publicar; prueba la versión nueva con una parte del tráfico o haz una prueba A/B cuando ayude. Prepara la vuelta atrás. Compara coste por petición terminada o token de salida con la misma calidad y SLO; incluye GPU reservadas aunque estén ociosas. Kubernetes es una opción de despliegue, no un requisito.' },
    ],
  },
  {
    id: '10', stage: 'produccion', title: 'Paralelismo en varias GPU', short: 'Paralelismo multi-GPU', visual: 'parallel',
    storyHeading: 'Elige qué vas a repartir',
    lead: '¿Qué te limita: la memoria, el cálculo, la longitud del contexto o el número de peticiones?',
    idea: 'TP, PP, DP, EP y CP resuelven problemas distintos; mover datos entre GPU también cuesta.',
    story: [
      { title: 'Repartir el modelo', text: 'Tensor Parallelism divide operaciones dentro de cada capa y requiere comunicación frecuente. Pipeline Parallelism coloca grupos de capas en distintas GPU: pasan activaciones entre etapas y pueden aparecer tiempos muertos si una etapa tarda más.' },
      { title: 'Repartir peticiones', text: 'Data Parallelism crea réplicas que atienden solicitudes distintas. Cada réplica debe tener memoria suficiente para el modelo o para su propio grupo multi-GPU. Añadir réplicas no reduce los pesos que necesita cada una.' },
      { title: 'Expertos y contextos largos', text: 'Expert Parallelism coloca expertos MoE en distintas GPU y envía tokens a los expertos elegidos. Context Parallelism reparte trabajo o estado de atención; prefill y decode pueden funcionar de forma distinta. Comprueba soporte en el modelo, backend y versión que vayas a usar.' },
      { title: 'La comunicación entre GPU tiene coste', text: 'NVLink, PCIe y red mueven datos a distinta velocidad. Un reparto útil en papel puede pasar demasiado tiempo comunicándose. Mide el resultado; no cuentes con una aceleración lineal.' },
    ],
    notebook: 'Notebook 07 · Demo guiada: TP=2 y EP si el hardware lo permite',
    footnote: 'Si no hay varias GPU para cada asistente, esta parte queda como demostración de los ponentes.',
  },
  {
    id: '11', stage: 'produccion', title: 'Ejercicio final: dimensionar', short: 'Dimensionar juntos', visual: 'sizing',
    storyHeading: 'Qué falta medir',
    lead: 'Caso hipotético: un modelo de unos 14B, una GPU de 24 GB y ocho peticiones activas como primer objetivo.',
    idea: 'La configuración sirve si cumple los objetivos de calidad, latencia, errores y memoria.',
    story: [
      { title: 'Cuánto ocupan los pesos', text: 'FP16/BF16 ocuparían unos 28 GB. Superan la tarjeta de 24 GB antes de arrancar el runtime. INT8 rondaría 14 GB e INT4, 7 GB. Son estimaciones ideales: no confirman que el modelo quepa ni que cumpla el objetivo.' },
      { title: 'Calcula la KV cache para la carga', text: 'Comprueba arquitectura y licencia, capas, KV heads y estado de atención del checkpoint. Estima la caché para 2.048 tokens de entrada, hasta 512 de salida y ocho peticiones. Verifica también la GPU, la cuantización, el runtime y la memoria libre.' },
      { title: 'Haz una prueba pequeña', text: 'Prueba un checkpoint cuantizado compatible, max-model-len 4096 y gpu-memory-utilization 0.85. Mide con 1, 4 y 8 peticiones activas. El objetivo del ejercicio es TTFT p95 menor de 2 segundos y menos de un 1 % de errores. Esta configuración no se ha medido.' },
      { title: 'Decide con los resultados', text: 'Si no cabe, prueba otra precisión o TP/PP. Si cabe pero no atiende la carga, valora réplicas DP. Para producción añade enrutamiento, disponibilidad, límites, autenticación, métricas, evaluación de versiones y vuelta atrás.' },
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
