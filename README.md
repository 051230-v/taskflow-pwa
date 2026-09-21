TaskFlow — gestión de tareas
Aplicación hecha con HTML, CSS y JavaScript puro. Sin frameworks, sin backend y sin dependencias externas. Funciona sin conexión y guarda los datos en el propio dispositivo.

Archivos del proyecto

Todos van en la raíz del repositorio:

| Archivo | Para qué sirve |
|---|---|
| `index.html` | Estructura de la página y contenedores de la interfaz. |
| `styles.css` | Estilos responsive mobile-first y los temas claro/oscuro. |
| `app.js` | Lógica: tareas, filtros, búsqueda, orden, localStorage y registro del service worker. |
| `manifest.json` | Metadatos de la PWA (nombre, colores, iconos, modo standalone). |
| `sw.js` | Service worker: guarda los archivos en caché para el modo sin conexión. |
| `icon.svg` | Icono de instalación (512×512). |
| `favicon.svg` | Icono de la pestaña del navegador. |
| `README.md` | Este documento. |

**Abrir la aplicación**
Abre en el navegador:
https://USUARIO.github.io/taskflow-pwa/
Probar en el celular
1. Abre esa misma URL en Chrome (Android) o Safari (iPhone).
2. Comprueba que la interfaz se adapta a la pantalla: una sola columna, botón **Nueva tarea** abajo a la derecha y el formulario subiendo desde el borde inferior.
3. Crea una tarea, márcala como completada y cambia entre los filtros.
4. Cierra la pestaña, vuelve a abrir la URL y verifica que tus tareas siguen ahí.

## Instalar

**Android (Chrome)**
1. Abre la URL.
2. Menú **⋮** → **Instalar aplicación** o **Añadir a pantalla de inicio**.
3. Confirma. El icono de TaskFlow aparecerá en el escritorio del teléfono.
4. Ábrelo: se ejecuta a pantalla completa, sin barra de direcciones.

**Escritorio (Chrome, Edge)**
1. Abre la URL.
2. Pulsa el icono de instalación (⊕ o una pantalla con flecha) al final de la barra de direcciones.
3. Pulsa **Instalar**. Se abrirá en su propia ventana.

**iPhone (Safari)**
1. Abre la URL.
2. Botón **Compartir** → **Añadir a pantalla de inicio** → **Añadir**.

## Probar el modo sin conexión

1. Abre la app al menos una vez con internet para que el service worker guarde los archivos.
2. Activa el **modo avión** en el celular, o en el escritorio abre **F12 → Application → Service Workers** y marca **Offline**.
3. Cierra la app y vuelve a abrirla.
4. Debe cargar igual. La etiqueta de la barra superior cambiará a **Sin conexión**.
5. Crea y edita tareas sin internet: se guardan igual porque `localStorage` es local.
