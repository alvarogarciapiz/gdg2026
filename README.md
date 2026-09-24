# Inferencia de LLMs en local

Web del taller de Eduardo Zapatero y Álvaro García Pizarro en VallaTech Summit 2026 (DevFest Valladolid), organizado por GDG Valladolid.

## Ejecutar

```bash
npm install
npm run dev
```

Vite mostrará la dirección local. Para comprobar la compilación:

```bash
npm run build
npm run preview
```

## Recorrer el taller

El mapa permite acercar, alejar y arrastrar. Las flechas del teclado eligen una sección; Intro la abre, `+` y `-` cambian el zoom y `0` ajusta el mapa. También hay una lista de secciones. En móvil, la lista es la vista inicial y se puede abrir el mapa visual.

El público ve las lecciones cerradas hasta que un ponente las abre. El icono de la llave, a la derecha del encabezado, abre el acceso de ponentes. Al entrar en una lección como ponente, esta se abre para todos. El botón **Lecciones** permite abrir o cerrar cada una manualmente; **QR** muestra `gdg.lvrpiz.com` y su código para proyectarlo. Si una lección se cierra mientras alguien la está leyendo, vuelve a mostrarse el candado en la siguiente actualización. La web consulta el estado compartido cada cinco segundos y al volver a la pestaña.

Las once secciones combinan ejemplos, cifras y esquemas para apoyar la explicación oral. No hay reproducción automática al entrar. Solo hay controles donde permiten comparar algo: la KV cache con una u ocho secuencias, las iteraciones de un lote continuo y el fallo de una réplica. Las URL `#/seccion/01` a `#/seccion/11` abren cada sección; las visitas se recuerdan durante la sesión.

El contenido se edita en `src/workshopData.js`. `src/Visuals.jsx` selecciona los apoyos visuales de `src/diagrams/`: `Fundamentals.jsx`, `Serving.jsx` y `Production.jsx`. `Slide.jsx` contiene los elementos compartidos y `diagrams.css` sus estilos. Los notebooks aparecen como llamadas a la práctica; este proyecto no los implementa.

En modo presentación, el título y el apoyo visual se ajustan al espacio disponible en escritorio. El botón «Explicación» vuelve a la vista de lectura de esa sección. En móvil, el contenido conserva el desplazamiento vertical. Las flechas y PageUp/PageDown cambian de sección. Escape vuelve al mapa. Los controles funcionan por teclado y en pantallas táctiles. Con movimiento reducido, se eliminan las transiciones y las iteraciones del lote se seleccionan manualmente. El modo presentación solo aparece tras el acceso de ponentes.

## Desplegar en Vercel

Importa este repositorio en Vercel. La configuración de `vercel.json` selecciona Vite, ejecuta `npm run build`, publica `dist` y sirve `index.html` para las rutas de la aplicación. El navegador usa la función de Supabase ya desplegada; Vercel no necesita credenciales ni variables de entorno.

El proyecto de Supabase es **gdg2026-workshop** (`pygfszldqbjuctlpttyf`). `supabase/schema.sql` define el estado compartido, las credenciales y las sesiones. `supabase/functions/workshop/index.ts` contiene la función pública de lectura y las operaciones de ponente; las tablas solo se consultan desde esa función con la clave secreta que Supabase le facilita. La contraseña se guarda allí como hash con sal, nunca en el código del navegador. Las sesiones duran doce horas en la pestaña. Cinco fallos bloquean ese navegador durante diez minutos en la web pública; hay un segundo límite de treinta fallos por red. En `localhost`, cada prueba de acceso usa un identificador temporal para que no se aplique el límite de cinco por navegador. El límite por red sigue activo. La web no puede leer la dirección MAC y el identificador de navegador se puede borrar con los datos del sitio, por lo que es un freno básico, no una identidad fuerte.

Para instalar el backend en otro proyecto de Supabase: aplica `supabase/schema.sql` en el editor SQL, configura una credencial con hash PBKDF2-SHA256 (180 000 iteraciones, sal aleatoria) en `presenter_credentials`, despliega la función `workshop` con `verify_jwt = false` y cambia la URL de `src/useWorkshopAccess.js`. La función usa `SUPABASE_URL` y `SUPABASE_SECRET_KEYS` que proporciona el proyecto. No pongas una clave secreta de Supabase en Vite ni en variables `VITE_*`. La contraseña corta es una elección deliberada para este taller; no sirve para proteger datos sensibles. El contenido está incluido en el JavaScript público, por lo que el candado controla la navegación de la interfaz, no la lectura del código descargado.

Supabase puede pausar un proyecto gratuito por inactividad. Comprueba que **gdg2026-workshop** sigue activo antes del evento y prueba desde un navegador sin sesión de ponente. Consulta la [política de pausa de proyectos gratuitos](https://supabase.com/docs/guides/platform/free-project-pausing).

`.env` y las variantes `.env.*` están en `.gitignore` (salvo `.env.example`). El token de administración y la contraseña de la base de datos local nunca deben subirse. Para regenerar el QR estático después de cambiar el dominio, edita `scripts/generate-qr.mjs` y ejecuta `npm run generate:qr`.

El icono de GDG se guarda en `public/gdg-icon.svg` y procede de [Google for Developers](https://developers.google.com/static/assets/img/icons/google-bracket.svg).

## Diagramas y animación

Se usan [Motion](https://motion.dev/docs/react) para transiciones breves y [Lucide](https://lucide.dev/guide/react) para iconos. Los esquemas son HTML/CSS editables. Las imágenes y el QR se sirven desde `public`. El control de acceso sí necesita el proyecto de Supabase.

Los cálculos ideales y los ejemplos conceptuales están identificados. El ejercicio final es una hipótesis sin benchmark; no se atribuye capacidad validada a ninguna GPU. Las explicaciones técnicas completas siguen disponibles en la vista de lectura.

Recursos oficiales utilizados, conservando sus proporciones:

- [NVIDIA: imagen de la GeForce RTX 4090](https://nvidianews.nvidia.com/file/nvidia-geforce-rtx-4090-gpu), en `public/rtx-4090.png`. Se usa para identificar el hardware, no como prueba de rendimiento.
- [Hugging Face: recursos de marca](https://huggingface.co/brand), en `public/huggingface-logo.svg`.
- [vLLM: media kit](https://github.com/vllm-project/media-kit), en `public/vllm-logo.svg`.
