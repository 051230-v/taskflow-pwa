/* ============================================================
   TaskFlow — Service Worker
   Precachea todos los archivos y permite el uso sin conexión.
   Rutas relativas para que funcione en GitHub Pages
   (https://usuario.github.io/taskflow-pwa/).
   ============================================================ */

var VERSION = 'taskflow-v1';

/* Rutas relativas al ámbito del service worker.
   Como sw.js vive en la raíz del repo, './' apunta a /taskflow-pwa/ */
var ARCHIVOS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './icon.svg',
  './favicon.svg'
];

/* ---------- Instalación: guardar todo en caché ---------- */
self.addEventListener('install', function (evento) {
  evento.waitUntil(
    caches.open(VERSION).then(function (cache) {
      return cache.addAll(ARCHIVOS);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

/* ---------- Activación: borrar cachés viejas ---------- */
self.addEventListener('activate', function (evento) {
  evento.waitUntil(
    caches.keys().then(function (claves) {
      return Promise.all(claves.map(function (clave) {
        if (clave !== VERSION) return caches.delete(clave);
        return null;
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

/* ---------- Peticiones ---------- */
self.addEventListener('fetch', function (evento) {
  var peticion = evento.request;

  /* Solo gestionamos GET del mismo origen */
  if (peticion.method !== 'GET') return;
  if (new URL(peticion.url).origin !== self.location.origin) return;

  /* Navegación (abrir la app): red primero, caché si no hay conexión */
  if (peticion.mode === 'navigate') {
    evento.respondWith(
      fetch(peticion).then(function (respuesta) {
        var copia = respuesta.clone();
        caches.open(VERSION).then(function (cache) {
          cache.put('./index.html', copia);
        });
        return respuesta;
      }).catch(function () {
        return caches.match('./index.html').then(function (guardada) {
          return guardada || caches.match('./');
        });
      })
    );
    return;
  }

  /* Resto de archivos: caché primero, red como respaldo */
  evento.respondWith(
    caches.match(peticion).then(function (guardada) {
      if (guardada) return guardada;
      return fetch(peticion).then(function (respuesta) {
        if (respuesta && respuesta.status === 200 && respuesta.type === 'basic') {
          var copia = respuesta.clone();
          caches.open(VERSION).then(function (cache) {
            cache.put(peticion, copia);
          });
        }
        return respuesta;
      }).catch(function () {
        return guardada;
      });
    })
  );
});

/* ---------- Actualización inmediata bajo demanda ---------- */
self.addEventListener('message', function (evento) {
  if (evento.data === 'actualizar-ahora') self.skipWaiting();
});
