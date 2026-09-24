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

Las once secciones combinan ejemplos, cifras y esquemas para apoyar la explicación oral. No hay reproducción automática al entrar. Solo hay controles donde permiten comparar algo: la KV cache con una u ocho secuencias, las iteraciones de un lote continuo y el fallo de una réplica. Las URL `#/seccion/01` a `#/seccion/11` abren cada sección; las visitas se recuerdan durante la sesión.

El contenido se edita en `src/workshopData.js`. `src/Visuals.jsx` selecciona los apoyos visuales de `src/diagrams/`: `Fundamentals.jsx`, `Serving.jsx` y `Production.jsx`. `Slide.jsx` contiene los elementos compartidos y `diagrams.css` sus estilos. Los notebooks aparecen como llamadas a la práctica; este proyecto no los implementa.

En modo presentación, el título y el apoyo visual se ajustan al espacio disponible en escritorio. El botón «Explicación» vuelve a la vista de lectura de esa sección. En móvil, el contenido conserva el desplazamiento vertical. Las flechas y PageUp/PageDown cambian de sección. Escape vuelve al mapa. Los controles funcionan por teclado y en pantallas táctiles. Con movimiento reducido, se eliminan las transiciones y las iteraciones del lote se seleccionan manualmente.

## Desplegar en Vercel

Importa este repositorio en Vercel. La configuración de `vercel.json` selecciona Vite, ejecuta `npm run build`, publica `dist` y sirve `index.html` para las rutas de la aplicación. No hacen falta variables de entorno.

El icono de GDG se guarda en `public/gdg-icon.svg` y procede de [Google for Developers](https://developers.google.com/static/assets/img/icons/google-bracket.svg).

## Diagramas y animación

Se usan [Motion](https://motion.dev/docs/react) para transiciones breves y [Lucide](https://lucide.dev/guide/react) para iconos. Los esquemas son HTML/CSS editables. Las imágenes se sirven desde `public`; la web no necesita servicios externos ni claves API.

Los cálculos ideales y los ejemplos conceptuales están identificados. El ejercicio final es una hipótesis sin benchmark; no se atribuye capacidad validada a ninguna GPU. Las explicaciones técnicas completas siguen disponibles en la vista de lectura.

Recursos oficiales utilizados, conservando sus proporciones:

- [NVIDIA: imagen de la GeForce RTX 4090](https://nvidianews.nvidia.com/file/nvidia-geforce-rtx-4090-gpu), en `public/rtx-4090.png`. Se usa para identificar el hardware, no como prueba de rendimiento.
- [Hugging Face: recursos de marca](https://huggingface.co/brand), en `public/huggingface-logo.svg`.
- [vLLM: media kit](https://github.com/vllm-project/media-kit), en `public/vllm-logo.svg`.
