# TaskFlow — PWA de gestión de tareas

Aplicación web progresiva (PWA) hecha solo con **HTML, CSS y JavaScript puro**. Sin frameworks, sin backend y sin dependencias externas. Funciona sin conexión y guarda los datos en el propio dispositivo.

---

## 1. Archivos del proyecto

Todos van en la **raíz** del repositorio:

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

> Todas las rutas del proyecto son **relativas** (`./archivo`). Por eso la app funciona igual en `http://localhost` que en `https://usuario.github.io/taskflow-pwa/`.

---

## 2. Crear el repositorio en GitHub

1. Entra a <https://github.com> e inicia sesión.
2. Pulsa el botón **+** (arriba a la derecha) → **New repository**.
3. En **Repository name** escribe exactamente: `taskflow-pwa`
4. Marca **Public**. Una PWA en GitHub Pages necesita HTTPS público.
5. **No** marques *Add a README file* (ya tienes uno).
6. Pulsa **Create repository**.

---

## 3. Subir los archivos a la raíz del repositorio

### Opción A — desde el navegador (la más sencilla)

1. En la página del repositorio recién creado, pulsa **uploading an existing file**.
   Si ya tiene contenido: pestaña **Add file** → **Upload files**.
2. Arrastra **los 8 archivos** a la zona de carga. Súbelos sueltos, **no dentro de una carpeta ni en un .zip**.
3. En **Commit changes** escribe el mensaje: `Primera versión de TaskFlow`.
4. Pulsa **Commit changes**.

Al terminar deberías ver los archivos listados directamente en la raíz, no dentro de otra carpeta.

### Opción B — desde la terminal con Git

```bash
cd carpeta-donde-estan-los-archivos
git init
git add .
git commit -m "Primera versión de TaskFlow"
git branch -M main
git remote add origin https://github.com/USUARIO/taskflow-pwa.git
git push -u origin main
```

Sustituye `USUARIO` por tu nombre de usuario de GitHub.

---

## 4. Activar GitHub Pages

1. En el repositorio, abre la pestaña **Settings**.
2. En el menú lateral izquierdo pulsa **Pages**.
3. En **Source** elige **Deploy from a branch**.
4. En **Branch** selecciona **main** y, en la carpeta de al lado, **/(root)**.
5. Pulsa **Save**.
6. Espera entre 1 y 3 minutos. Recarga la página de **Settings → Pages**: aparecerá un recuadro verde con la URL.

---

## 5. Abrir la aplicación

Abre en el navegador:

```
https://USUARIO.github.io/taskflow-pwa/
```

Escribe la barra final `/`. Debes ver la lista con cinco tareas de ejemplo.

> Si ves un error 404, espera unos minutos más y vuelve a cargar con **Ctrl + F5**. Comprueba también que `index.html` esté en la raíz y escrito en minúsculas.

---

## 6. Probar en el celular

1. Abre esa misma URL en Chrome (Android) o Safari (iPhone).
2. Comprueba que la interfaz se adapta a la pantalla: una sola columna, botón **Nueva tarea** abajo a la derecha y el formulario subiendo desde el borde inferior.
3. Crea una tarea, márcala como completada y cambia entre los filtros.
4. Cierra la pestaña, vuelve a abrir la URL y verifica que tus tareas siguen ahí.

---

## 7. Instalar como PWA

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

---

## 8. Probar el modo sin conexión

1. Abre la app al menos una vez con internet para que el service worker guarde los archivos.
2. Activa el **modo avión** en el celular, o en el escritorio abre **F12 → Application → Service Workers** y marca **Offline**.
3. Cierra la app y vuelve a abrirla.
4. Debe cargar igual. La etiqueta de la barra superior cambiará a **Sin conexión**.
5. Crea y edita tareas sin internet: se guardan igual porque `localStorage` es local.

Para comprobar el caché: **F12 → Application → Cache Storage → taskflow-v1**. Deben aparecer los siete archivos.

---

## 9. Capturas para el reporte

Recomendadas, una por punto:

1. Pantalla principal en **modo claro** con las tareas de ejemplo.
2. Pantalla principal en **modo oscuro**.
3. Formulario **Nueva tarea** abierto.
4. Filtro **Completadas** activo.
5. **Búsqueda** escrita y mostrando resultados.
6. Vista en celular (o **F12 → Toggle device toolbar**, perfil Pixel o iPhone).
7. **Settings → Pages** con la URL publicada en verde.
8. La app instalada en la pantalla de inicio del teléfono.
9. **F12 → Application → Manifest** sin errores.
10. **F12 → Application → Cache Storage** con `taskflow-v1` lleno.
11. La app funcionando con **Offline** marcado.

Capturas: **Windows** `Win + Shift + S`; **macOS** `Cmd + Shift + 4`; **Android** volumen abajo + encendido.

---

## 10. Probarlo en tu computadora antes de subirlo

El service worker no funciona abriendo el archivo con doble clic (`file://`). Necesitas un servidor local:

```bash
# Con Python 3
python -m http.server 8000
```

Luego abre <http://localhost:8000>.

---

## 11. Actualizar la app después de un cambio

El navegador guarda la versión vieja en caché. Al modificar cualquier archivo, cambia la versión en `sw.js`:

```js
var VERSION = 'taskflow-v2';
```

Sube el cambio y recarga con **Ctrl + F5**.

---

## Licencia

Proyecto educativo de uso libre.
