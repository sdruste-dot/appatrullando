# APPatrullando la Ziudad

Juego de entrenamiento para el supuesto práctico de la oposición a Policía Local. Cada distrito es una escena ilustrada en tres pases: hay que detectar las infracciones de la Ley Orgánica 4/2015 de protección de la seguridad ciudadana, distinguirlas de lo que parece y no es, y resolver cada caso (vía, gravedad y artículo, y actuación).

**Jugar:** abre la app en el navegador e instálala.
- **iPhone o iPad (Safari):** Compartir → «Añadir a pantalla de inicio».
- **Mac (Safari):** Archivo → «Añadir al Dock».
- **Chrome o Edge:** el icono de instalar en la barra de direcciones.

Una vez instalada funciona sin conexión y se actualiza sola cuando hay versión nueva.

## Aviso

Herramienta **no oficial**. Las citas legales son literales del texto consolidado del BOE (última actualización publicada el 23-02-2021). El criterio de resolución de cada caso es del autor y no sustituye al estudio de la ley. El progreso se guarda solo en tu dispositivo.

## Estructura

- `index.html`: carcasa y estilos.
- `engine.js`: motor, lugares y kit de dibujo. No tiene contenido legal.
- `dlc/lopsc.json`: contenido (viñetas, soluciones y citas literales), generado y verificado por los scripts de la fábrica.
- `sw.js`: modo sin conexión. **La versión vive aquí (`const VER`) y al publicar se cambia solo esa línea:** el navegador solo detecta una versión nueva cuando cambia este archivo.
- `version.js`: nombre y autor.
- `manifest.webmanifest`: lo que hace que sea instalable.

## Licencia

© 2026 sdruste-dot · [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.es): puedes usarla, compartirla y adaptarla citando al autor y sin fines comerciales. Detalle en `LICENSE`.
