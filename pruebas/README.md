# Pruebas

Se pasan **antes de cada publicación**. Probar solo la parte tocada no basta: el 26-11-2026 se colaron dos regresiones así (las actualizaciones no llegaban y los botones del expediente dejaron de funcionar).

Requisitos: `pip install playwright` y Chrome (ruta en la variable `CHROME`; por defecto `/usr/bin/google-chrome`).

- `python3 pruebas/completa.py`: app, sin conexión, sincronización, patrulla y **resolución completa** (todas las viñetas de los tres distritos, en escritorio y en móvil, con clics reales). Tiene que acabar en `TODO CORRECTO`.
- `python3 pruebas/actualizacion.py HEAD~1`: una app instalada con la versión anterior recibe la actual. Pasarla cuando cambie `sw.js` o el registro del modo sin conexión.

Las pruebas trabajan sobre una copia temporal de la app con un gancho (`window.T`) que no existe en el repositorio. La carpeta `pruebas/` no forma parte de la app instalada.
