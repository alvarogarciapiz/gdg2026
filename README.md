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

Al abrir una sección aparece su diagrama principal y una explicación breve. Puedes cambiar algunas cifras y ejemplos con los controles. En modo presentación, usa las flechas para avanzar y Escape para volver al mapa. Las URL `#/seccion/01` a `#/seccion/11` abren cada sección; las visitas se recuerdan durante la sesión.

El contenido se edita en `src/workshopData.js`. Los esquemas interactivos están en `src/Visuals.jsx`. Los notebooks aparecen como llamadas a la práctica; este proyecto no los implementa.

En modo presentación, el título y el esquema comparten la primera pantalla. Se puede avanzar con las flechas cuando el foco no está en un control interactivo. Los notebooks figuran como transición entre secciones; sus contenidos no forman parte de esta web.

## Desplegar en Vercel

Importa este repositorio en Vercel. La configuración de `vercel.json` selecciona Vite, ejecuta `npm run build`, publica `dist` y sirve `index.html` para las rutas de la aplicación. No hacen falta variables de entorno.

El icono de GDG se guarda en `public/gdg-icon.svg` y procede de [Google for Developers](https://developers.google.com/static/assets/img/icons/google-bracket.svg).
