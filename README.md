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

Cada sección tiene un esquema interactivo, explicación, pregunta para la sala y detalles desplegables. El modo presentación usa las flechas izquierda y derecha para avanzar; Escape vuelve al mapa. Las URL `#/seccion/01` a `#/seccion/11` abren cada sección directamente. El progreso de lectura se guarda durante la sesión del navegador.

El contenido se edita en `src/workshopData.js`. Los esquemas interactivos están en `src/Visuals.jsx`. Los notebooks aparecen como llamadas a la práctica; este proyecto no los implementa.

En modo presentación, la barra superior permite saltar entre la idea, el esquema, la explicación y la pregunta para la sala. Las flechas izquierda y derecha cambian de sección cuando el foco no está en un control interactivo. Escape vuelve al mapa.

## Desplegar en Vercel

Importa este repositorio en Vercel. La configuración de `vercel.json` selecciona Vite, ejecuta `npm run build`, publica `dist` y sirve `index.html` para las rutas de la aplicación. No hacen falta variables de entorno.

El icono de GDG se guarda en `public/gdg-icon.svg` y procede de [Google for Developers](https://developers.google.com/static/assets/img/icons/google-bracket.svg).
