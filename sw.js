/* Service worker: guarda la app entera en el dispositivo para que funcione sin conexión.
   Estrategia: todo se sirve desde la caché de la versión actual. Cuando se publica una versión
   nueva (version.js cambia), el navegador instala la nueva caché en segundo plano y la app
   muestra «Hay una versión nueva»; al aceptarla, se activa y se recarga. */
importScripts('version.js');
const CACHE = 'app-' + self.APP_VER;
const ASSETS = [
  './', 'index.html', 'engine.js', 'version.js', 'dlc/lopsc.json', 'manifest.webmanifest',
  'fonts/archivo-latin-400-normal.woff2', 'fonts/archivo-latin-600-normal.woff2', 'fonts/archivo-latin-800-normal.woff2',
  'fonts/archivo-narrow-latin-500-normal.woff2', 'fonts/archivo-narrow-latin-700-normal.woff2',
  'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png', 'icons/favicon-32.png'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS.map(u => new Request(u, {cache: 'reload'})))));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('app-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('message', e => { if (e.data === 'activar') self.skipWaiting(); });
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(c => c.match(req, {ignoreSearch: true}).then(hit => hit || fetch(req).then(res => {
    if (res.ok) c.put(req, res.clone());
    return res;
  }).catch(() => req.mode === 'navigate' ? c.match('index.html') : Response.error()))));
});
