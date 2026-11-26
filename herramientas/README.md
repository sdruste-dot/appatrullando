# Herramientas de arte

Procedimiento completo en el proyecto: `arte/PROMPT_FONDOS.md`.

- `plano.py <lugar> [...]`: saca el plano de un lugar para la IA de imagen (sin personas, sin ambiente y sin textos, con colores de día, 2240×1560).
- `fondo.py entrada.jpg fondos/<lugar>.png [noche]`: convierte la imagen generada en el fondo del juego (blanco transparente, línea opaca; `noche` deja las líneas claras). Después: `fondo:'fondos/<lugar>.png'` en el lugar y añadir el archivo a `ASSETS` en `sw.js`.

Requisitos: playwright, Pillow y Chrome (variable `CHROME`).
