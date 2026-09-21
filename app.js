/* ============================================================
   TaskFlow — lógica de la aplicación
   JavaScript puro, sin dependencias externas.
   ============================================================ */
(function () {
  'use strict';

  var CLAVE_TAREAS = 'taskflow.tareas.v1';
  var CLAVE_TEMA = 'taskflow.tema.v1';
  var PESO = { alta: 0, media: 1, baja: 2 };

  var estado = {
    tareas: [],
    filtro: 'todas',
    busqueda: '',
    orden: 'prioridad',
    editandoId: null
  };

  /* ---------- Utilidades ---------- */

  function $(sel) { return document.querySelector(sel); }
  function $$(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }

  function nuevoId() {
    return 't-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
  }

  function hoyISO() {
    var d = new Date();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var dia = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + dia;
  }

  function sumarDias(dias) {
    var d = new Date();
    d.setDate(d.getDate() + dias);
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var dia = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + dia;
  }

  function formatearFecha(iso) {
    if (!iso) return '';
    var p = iso.split('-');
    var d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
    var meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun',
                 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return d.getDate() + ' ' + meses[d.getMonth()] + ' ' + d.getFullYear();
  }

  function estaVencida(tarea) {
    return !!tarea.fecha && !tarea.hecha && tarea.fecha < hoyISO();
  }

  function escapar(texto) {
    return String(texto)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ---------- Datos de ejemplo ---------- */

  function tareasEjemplo() {
    return [
      {
        id: nuevoId(),
        titulo: 'Entregar reporte de la PWA',
        nota: 'Incluir capturas de pantalla y el enlace de GitHub Pages.',
        prioridad: 'alta',
        fecha: sumarDias(2),
        hecha: false,
        creada: Date.now()
      },
      {
        id: nuevoId(),
        titulo: 'Estudiar para el examen de Matemáticas',
        nota: 'Temas 4 a 7: funciones y derivadas.',
        prioridad: 'alta',
        fecha: sumarDias(5),
        hecha: false,
        creada: Date.now() - 1000
      },
      {
        id: nuevoId(),
        titulo: 'Leer el capítulo de Historia',
        nota: 'Páginas 88 a 112.',
        prioridad: 'media',
        fecha: sumarDias(7),
        hecha: false,
        creada: Date.now() - 2000
      },
      {
        id: nuevoId(),
        titulo: 'Comprar material para la maqueta',
        nota: 'Cartulina, pegamento y marcadores.',
        prioridad: 'baja',
        fecha: '',
        hecha: false,
        creada: Date.now() - 3000
      },
      {
        id: nuevoId(),
        titulo: 'Crear el repositorio taskflow-pwa',
        nota: 'Repositorio público en GitHub.',
        prioridad: 'media',
        fecha: sumarDias(-1),
        hecha: true,
        creada: Date.now() - 4000
      }
    ];
  }

  /* ---------- Persistencia ---------- */

  function cargar() {
    try {
      var crudo = localStorage.getItem(CLAVE_TAREAS);
      if (!crudo) {
        estado.tareas = tareasEjemplo();
        guardar();
        return;
      }
      var datos = JSON.parse(crudo);
      estado.tareas = Array.isArray(datos) ? datos.filter(esTareaValida) : tareasEjemplo();
    } catch (e) {
      estado.tareas = tareasEjemplo();
    }
  }

  function esTareaValida(t) {
    return t && typeof t.id === 'string' && typeof t.titulo === 'string';
  }

  function guardar() {
    try {
      localStorage.setItem(CLAVE_TAREAS, JSON.stringify(estado.tareas));
    } catch (e) {
      avisar('No se pudo guardar. El almacenamiento del navegador está lleno o bloqueado.');
    }
  }

  /* ---------- Tema claro / oscuro ---------- */

  function aplicarTema(tema) {
    document.documentElement.setAttribute('data-tema', tema);
    var oscuro = tema === 'dark';
    $('#iconoTema').textContent = oscuro ? '☀' : '☾';
    $('#btnTema').setAttribute('aria-pressed', oscuro ? 'true' : 'false');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', oscuro ? '#11161A' : '#1F6F5C');
    try { localStorage.setItem(CLAVE_TEMA, tema); } catch (e) {}
  }

  function temaInicial() {
    var guardado = null;
    try { guardado = localStorage.getItem(CLAVE_TEMA); } catch (e) {}
    if (guardado === 'dark' || guardado === 'light') return guardado;
    var prefiereOscuro = window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefiereOscuro ? 'dark' : 'light';
  }

  /* ---------- Filtrado y ordenado ---------- */

  function tareasVisibles() {
    var texto = estado.busqueda.trim().toLowerCase();

    var lista = estado.tareas.filter(function (t) {
      if (estado.filtro === 'pendientes' && t.hecha) return false;
      if (estado.filtro === 'completadas' && !t.hecha) return false;
      if (!texto) return true;
      return (t.titulo + ' ' + (t.nota || '')).toLowerCase().indexOf(texto) !== -1;
    });

    lista.sort(function (a, b) {
      if (estado.orden === 'prioridad') {
        if (PESO[a.prioridad] !== PESO[b.prioridad]) {
          return PESO[a.prioridad] - PESO[b.prioridad];
        }
        return compararFecha(a, b);
      }
      if (estado.orden === 'fecha') {
        var r = compararFecha(a, b);
        if (r !== 0) return r;
        return PESO[a.prioridad] - PESO[b.prioridad];
      }
      if (estado.orden === 'titulo') {
        return a.titulo.localeCompare(b.titulo, 'es', { sensitivity: 'base' });
      }
      return (b.creada || 0) - (a.creada || 0);
    });

    return lista;
  }

  function compararFecha(a, b) {
    if (!a.fecha && !b.fecha) return 0;
    if (!a.fecha) return 1;   // las tareas sin fecha van al final
    if (!b.fecha) return -1;
    return a.fecha < b.fecha ? -1 : (a.fecha > b.fecha ? 1 : 0);
  }

  /* ---------- Render ---------- */

  function render() {
    var lista = tareasVisibles();
    var cont = $('#lista');
    cont.innerHTML = '';

    lista.forEach(function (t) {
      cont.appendChild(crearTarjeta(t));
    });

    var vacio = $('#vacio');
    vacio.hidden = lista.length > 0;
    if (lista.length === 0) {
      if (estado.busqueda.trim()) {
        vacio.innerHTML = '<strong>Sin resultados para «' + escapar(estado.busqueda) + '».</strong>' +
          'Prueba con otra palabra o borra la búsqueda.';
      } else if (estado.filtro === 'completadas') {
        vacio.innerHTML = '<strong>Todavía no completas ninguna tarea.</strong>' +
          'Marca una casilla para moverla aquí.';
      } else if (estado.filtro === 'pendientes') {
        vacio.innerHTML = '<strong>Todo al día.</strong>No tienes tareas pendientes.';
      } else {
        vacio.innerHTML = '<strong>No hay nada aquí todavía.</strong>' +
          'Crea tu primera tarea con el botón <em>Nueva tarea</em>.';
      }
    }

    actualizarContadores();
  }

  function crearTarjeta(t) {
    var art = document.createElement('article');
    art.className = 'task' + (t.hecha ? ' is-done' : '');
    art.setAttribute('data-prioridad', t.prioridad);
    art.setAttribute('data-id', t.id);

    var meta = '<span class="badge badge--' + t.prioridad + '">Prioridad ' + t.prioridad + '</span>';
    if (t.fecha) {
      var vencida = estaVencida(t);
      meta += '<span class="badge ' + (vencida ? 'badge--vencida' : 'badge--fecha') + '">' +
        (vencida ? 'Vencida: ' : 'Vence: ') + formatearFecha(t.fecha) + '</span>';
    }
    if (t.hecha) {
      meta += '<span class="badge badge--fecha">Completada</span>';
    }

    art.innerHTML =
      '<input class="check" type="checkbox" data-accion="toggle"' +
        (t.hecha ? ' checked' : '') +
        ' aria-label="Marcar «' + escapar(t.titulo) + '» como completada">' +
      '<div class="task__body">' +
        '<h3 class="task__title">' + escapar(t.titulo) + '</h3>' +
        (t.nota ? '<p class="task__note">' + escapar(t.nota) + '</p>' : '') +
        '<div class="task__meta">' + meta + '</div>' +
      '</div>' +
      '<div class="task__tools">' +
        '<button class="tool" type="button" data-accion="editar" title="Editar tarea">' +
          '<span aria-hidden="true">✎</span><span class="sr-only">Editar</span></button>' +
        '<button class="tool tool--del" type="button" data-accion="borrar" title="Eliminar tarea">' +
          '<span aria-hidden="true">🗑</span><span class="sr-only">Eliminar</span></button>' +
      '</div>';

    return art;
  }

  function actualizarContadores() {
    var total = estado.tareas.length;
    var hechas = estado.tareas.filter(function (t) { return t.hecha; }).length;
    var pendientes = total - hechas;

    $('[data-contador="todas"]').textContent = total;
    $('[data-contador="pendientes"]').textContent = pendientes;
    $('[data-contador="completadas"]').textContent = hechas;

    var vencidas = estado.tareas.filter(estaVencida).length;
    var texto = pendientes === 0
      ? 'Sin tareas pendientes'
      : pendientes + (pendientes === 1 ? ' tarea pendiente' : ' tareas pendientes');
    if (vencidas > 0) {
      texto += ' · ' + vencidas + (vencidas === 1 ? ' vencida' : ' vencidas');
    }
    $('#resumen').textContent = texto;
    document.title = pendientes > 0
      ? '(' + pendientes + ') TaskFlow'
      : 'TaskFlow · Gestor de tareas';
  }

  /* ---------- Acciones sobre tareas ---------- */

  function buscarTarea(id) {
    for (var i = 0; i < estado.tareas.length; i++) {
      if (estado.tareas[i].id === id) return estado.tareas[i];
    }
    return null;
  }

  function alternarHecha(id) {
    var t = buscarTarea(id);
    if (!t) return;
    t.hecha = !t.hecha;
    guardar();
    render();
    avisar(t.hecha ? 'Tarea completada.' : 'Tarea marcada como pendiente.');
  }

  function borrarTarea(id) {
    var t = buscarTarea(id);
    if (!t) return;
    if (!window.confirm('¿Eliminar «' + t.titulo + '»? Esta acción no se puede deshacer.')) return;
    estado.tareas = estado.tareas.filter(function (x) { return x.id !== id; });
    guardar();
    render();
    avisar('Tarea eliminada.');
  }

  /* ---------- Modal ---------- */

  function abrirModal(id) {
    estado.editandoId = id || null;
    var t = id ? buscarTarea(id) : null;

    $('#modalTitulo').textContent = t ? 'Editar tarea' : 'Nueva tarea';
    $('#fTitulo').value = t ? t.titulo : '';
    $('#fNota').value = t ? (t.nota || '') : '';
    $('#fPrioridad').value = t ? t.prioridad : 'media';
    $('#fFecha').value = t ? (t.fecha || '') : '';
    $('#errTitulo').hidden = true;
    $('#btnGuardar').textContent = t ? 'Guardar cambios' : 'Guardar tarea';

    $('#modal').hidden = false;
    document.body.style.overflow = 'hidden';
    setTimeout(function () { $('#fTitulo').focus(); }, 40);
  }

  function cerrarModal() {
    $('#modal').hidden = true;
    document.body.style.overflow = '';
    estado.editandoId = null;
  }

  function guardarDesdeModal() {
    var titulo = $('#fTitulo').value.trim();
    if (!titulo) {
      $('#errTitulo').hidden = false;
      $('#fTitulo').focus();
      return;
    }

    var datos = {
      titulo: titulo,
      nota: $('#fNota').value.trim(),
      prioridad: $('#fPrioridad').value,
      fecha: $('#fFecha').value || ''
    };

    if (estado.editandoId) {
      var t = buscarTarea(estado.editandoId);
      if (t) {
        t.titulo = datos.titulo;
        t.nota = datos.nota;
        t.prioridad = datos.prioridad;
        t.fecha = datos.fecha;
      }
      avisar('Cambios guardados.');
    } else {
      estado.tareas.unshift({
        id: nuevoId(),
        titulo: datos.titulo,
        nota: datos.nota,
        prioridad: datos.prioridad,
        fecha: datos.fecha,
        hecha: false,
        creada: Date.now()
      });
      avisar('Tarea creada.');
    }

    guardar();
    cerrarModal();
    render();
  }

  /* ---------- Aviso emergente ---------- */

  var temporizadorAviso = null;
  function avisar(mensaje) {
    var caja = $('#aviso');
    caja.textContent = mensaje;
    caja.hidden = false;
    clearTimeout(temporizadorAviso);
    temporizadorAviso = setTimeout(function () { caja.hidden = true; }, 2200);
  }

  /* ---------- Estado de conexión ---------- */

  function actualizarRed() {
    var chip = $('#estadoRed');
    if (navigator.onLine) {
      chip.textContent = 'En línea';
      chip.className = 'chip chip--online';
    } else {
      chip.textContent = 'Sin conexión';
      chip.className = 'chip chip--offline';
    }
  }

  /* ---------- Eventos ---------- */

  function conectarEventos() {
    $('#btnTema').addEventListener('click', function () {
      var actual = document.documentElement.getAttribute('data-tema');
      aplicarTema(actual === 'dark' ? 'light' : 'dark');
    });

    $('#buscar').addEventListener('input', function (e) {
      estado.busqueda = e.target.value;
      $('#btnLimpiarBusqueda').hidden = !estado.busqueda;
      render();
    });

    $('#btnLimpiarBusqueda').addEventListener('click', function () {
      estado.busqueda = '';
      $('#buscar').value = '';
      $('#btnLimpiarBusqueda').hidden = true;
      $('#buscar').focus();
      render();
    });

    $$('.tab').forEach(function (btn) {
      btn.addEventListener('click', function () {
        estado.filtro = btn.getAttribute('data-filtro');
        $$('.tab').forEach(function (b) {
          var activo = b === btn;
          b.classList.toggle('is-active', activo);
          b.setAttribute('aria-pressed', activo ? 'true' : 'false');
        });
        render();
      });
    });

    $('#orden').addEventListener('change', function (e) {
      estado.orden = e.target.value;
      render();
    });

    $('#lista').addEventListener('click', function (e) {
      var boton = e.target.closest('[data-accion]');
      if (!boton) return;
      var tarjeta = boton.closest('.task');
      if (!tarjeta) return;
      var id = tarjeta.getAttribute('data-id');
      var accion = boton.getAttribute('data-accion');

      if (accion === 'toggle') alternarHecha(id);
      else if (accion === 'editar') abrirModal(id);
      else if (accion === 'borrar') borrarTarea(id);
    });

    $('#btnNueva').addEventListener('click', function () { abrirModal(null); });
    $('#btnCancelar').addEventListener('click', cerrarModal);
    $('#btnGuardar').addEventListener('click', guardarDesdeModal);

    $('#modal').addEventListener('click', function (e) {
      if (e.target.hasAttribute('data-cerrar')) cerrarModal();
    });

    $('#fTitulo').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') guardarDesdeModal();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !$('#modal').hidden) cerrarModal();
    });

    $('#btnReiniciar').addEventListener('click', function () {
      if (!window.confirm('Se borrarán tus tareas actuales y volverán las de ejemplo. ¿Continuar?')) return;
      estado.tareas = tareasEjemplo();
      guardar();
      render();
      avisar('Tareas de ejemplo restauradas.');
    });

    window.addEventListener('online', actualizarRed);
    window.addEventListener('offline', actualizarRed);
  }

  /* ---------- Service worker (ruta relativa) ---------- */

  function registrarSW() {
    if (!('serviceWorker' in navigator)) return;
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('./sw.js', { scope: './' })
        .then(function (reg) {
          console.log('TaskFlow: service worker registrado en', reg.scope);
        })
        .catch(function (err) {
          console.warn('TaskFlow: no se pudo registrar el service worker.', err);
        });
    });
  }

  /* ---------- Arranque ---------- */

  aplicarTema(temaInicial());
  cargar();
  conectarEventos();
  actualizarRed();
  render();
  registrarSW();
})();
