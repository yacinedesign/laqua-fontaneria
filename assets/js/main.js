/* LAQUA Fontanería */
(function () {
  'use strict';
  var WHATSAPP = '34638652979';
  var root = document.documentElement;
  root.classList.add('js');

  function abrirWhatsApp(texto) {
    window.open('https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(texto), '_blank', 'noopener');
  }

  /* ---------- Abierto ahora (hora de Madrid, 7:00–22:00 todos los días) ---------- */
  function horaMadrid() {
    try {
      var p = new Intl.DateTimeFormat('es-ES', { timeZone: 'Europe/Madrid', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date());
      var h = 0, m = 0;
      p.forEach(function (x) { if (x.type === 'hour') h = +x.value; if (x.type === 'minute') m = +x.value; });
      return h % 24 + m / 60;
    } catch (e) { var d = new Date(); return d.getHours() + d.getMinutes() / 60; }
  }
  function pintarEstado() {
    var h = horaMadrid();
    var abierto = h >= 7 && h < 22;
    var estado = document.querySelector('[data-estado]');
    var txt = document.querySelector('[data-estado-texto]');
    var largo = document.querySelector('[data-estado-largo]');
    if (estado) estado.classList.toggle('abierto', abierto);
    if (txt) txt.textContent = abierto ? 'Abierto ahora · hasta las 22:00' : 'Cerrado ahora · abrimos a las 7:00';
    if (largo) largo.textContent = abierto ? 'Ahora mismo estamos atendiendo: escríbenos.' : 'Ahora estamos cerrados. Déjanos tu mensaje y te contestamos a partir de las 7:00.';
  }
  pintarEstado();
  setInterval(pintarEstado, 60000);

  /* ---------- Cabecera, menú y progreso ---------- */
  var cab = document.querySelector('[data-cabecera]');
  var prog = document.querySelector('.tuberia-progreso span');
  function alScroll() {
    var y = window.scrollY;
    if (cab) cab.classList.toggle('con-sombra', y > 10);
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (prog) prog.style.setProperty('--p', max > 0 ? Math.min(1, y / max) : 0);
  }
  window.addEventListener('scroll', alScroll, { passive: true });
  alScroll();

  var ham = document.querySelector('[data-hamburguesa]');
  var menu = document.querySelector('[data-menu]');
  if (ham && menu) {
    ham.addEventListener('click', function () {
      var abierto = menu.classList.toggle('abierto');
      ham.setAttribute('aria-expanded', abierto);
      document.body.style.overflow = abierto ? 'hidden' : '';
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        menu.classList.remove('abierto');
        ham.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  // Enlace activo del menú según la sección
  var enlaces = menu ? Array.prototype.slice.call(menu.querySelectorAll('a')) : [];
  if ('IntersectionObserver' in window && enlaces.length) {
    var obsMenu = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) {
          enlaces.forEach(function (a) { a.classList.toggle('activo', a.getAttribute('href') === '#' + e.target.id); });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    enlaces.forEach(function (a) { var s = document.querySelector(a.getAttribute('href')); if (s) obsMenu.observe(s); });
  }

  /* ---------- Desplazamiento suave en los enlaces internos ---------- */
  document.addEventListener('click', function (ev) {
    var a = ev.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href');
    if (id.length < 2) return;
    var destino = document.querySelector(id);
    if (!destino) return;
    ev.preventDefault();
    destino.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', id);
  });

  /* ---------- Onda al pulsar botones ---------- */
  document.addEventListener('pointerdown', function (ev) {
    var b = ev.target.closest('.boton');
    if (!b) return;
    var r = b.getBoundingClientRect();
    var s = Math.max(r.width, r.height);
    var o = document.createElement('span');
    o.className = 'onda';
    o.style.width = o.style.height = s + 'px';
    o.style.left = (ev.clientX - r.left - s / 2) + 'px';
    o.style.top = (ev.clientY - r.top - s / 2) + 'px';
    b.appendChild(o);
    setTimeout(function () { o.remove(); }, 700);
  });

  /* ---------- Revelar y contadores ---------- */
  function contar(el) {
    var fin = +el.getAttribute('data-contar');
    var pre = el.getAttribute('data-prefijo') || '';
    var t0 = null, dur = 1600;
    function paso(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / dur);
      var v = Math.round(fin * (1 - Math.pow(1 - k, 3)));
      el.textContent = pre + v;
      if (k < 1) requestAnimationFrame(paso);
    }
    requestAnimationFrame(paso);
    // por si el navegador frena las animaciones (pestaña en segundo plano)
    setTimeout(function () { el.textContent = pre + fin; }, dur + 300);
  }
  var reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        if (el.classList.contains('revelar')) el.classList.add('visto');
        if (el.hasAttribute('data-contar') && !reducido) contar(el);
        if (el.hasAttribute('data-proceso')) el.classList.add('lleno');
        obs.unobserve(el);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.revelar, [data-contar], [data-proceso]').forEach(function (el, i) {
      if (el.classList.contains('revelar')) {
        // pequeño escalonado entre hermanos
        var hermanos = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
        el.style.transitionDelay = Math.min(hermanos, 5) * 80 + 'ms';
      }
      obs.observe(el);
    });
  } else {
    document.querySelectorAll('.revelar').forEach(function (el) { el.classList.add('visto'); });
  }

  /* ---------- Reels en el móvil del hero ---------- */
  var reels = document.querySelector('[data-reels]');
  if (reels) {
    var fotos = reels.querySelectorAll('.movil__pantalla > img');
    var barras = reels.querySelector('[data-reels-barras]');
    var i = 0, DUR = 3200;
    fotos.forEach(function () { barras.appendChild(document.createElement('i')); });
    var bs = barras.querySelectorAll('i');
    function mostrar(n) {
      fotos.forEach(function (f, k) { f.classList.toggle('activa', k === n); });
      bs.forEach(function (b, k) {
        b.classList.remove('corriendo');
        b.classList.toggle('hecha', k < n);
      });
      void bs[n].offsetWidth;
      bs[n].style.setProperty('--dur', DUR + 'ms');
      bs[n].classList.add('corriendo');
    }
    mostrar(0);
    if (!reducido) {
      setInterval(function () { i = (i + 1) % fotos.length; mostrar(i); }, DUR);
    }
  }

  /* ---------- Asistente de averías ---------- */
  var diag = document.querySelector('[data-diag]');
  if (diag) {
    var datos = { averia: '', cuando: '', zona: '', consejo: '' };
    var claves = { 1: 'averia', 2: 'cuando', 3: 'zona' };
    var actual = 1;
    var vista = diag.querySelector('[data-vista]');
    var form = diag.querySelector('[data-diag-form]');

    function irA(n, enfocar) {
      actual = n;
      diag.querySelectorAll('[data-paso]').forEach(function (p) { p.classList.toggle('activo', +p.getAttribute('data-paso') === n); });
      diag.querySelectorAll('[data-paso-ind]').forEach(function (li) {
        var k = +li.getAttribute('data-paso-ind');
        li.classList.toggle('activo', k === n);
        li.classList.toggle('hecho', k < n);
      });
      if (n === 4) actualizarVista();
      if (enfocar) {
        var top = diag.getBoundingClientRect().top + window.scrollY - 100;
        if (Math.abs(window.scrollY - top) > 200) window.scrollTo({ top: top, behavior: 'smooth' });
      }
    }

    function mensaje() {
      var nombre = form.nombre.value.trim();
      var detalle = form.detalle.value.trim();
      var t = 'Hola Lautaro' + (nombre ? ', soy ' + nombre : '') + '.\n';
      t += datos.averia + (datos.zona ? ' en ' + datos.zona : '') + '.\n';
      if (datos.cuando) t += datos.cuando + '.\n';
      if (detalle) t += '\n' + detalle + '\n';
      t += '\n¿Me podéis dar presupuesto? Gracias.';
      return t;
    }
    function actualizarVista() { vista.textContent = mensaje(); }

    diag.querySelectorAll('[data-paso] .opciones button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var paso = +btn.closest('[data-paso]').getAttribute('data-paso');
        btn.parentElement.querySelectorAll('button').forEach(function (b) { b.classList.remove('elegido'); });
        btn.classList.add('elegido');
        datos[claves[paso]] = btn.getAttribute('data-valor');
        if (paso === 1) {
          datos.consejo = btn.getAttribute('data-consejo') || '';
          var caja = diag.querySelector('[data-consejo-caja]');
          caja.hidden = !datos.consejo;
          caja.querySelector('span').textContent = datos.consejo;
        }
        setTimeout(function () { irA(paso + 1, true); }, 220);
      });
    });
    diag.querySelectorAll('[data-atras]').forEach(function (b) {
      b.addEventListener('click', function () { irA(Math.max(1, actual - 1)); });
    });
    form.addEventListener('input', actualizarVista);
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (!form.nombre.value.trim()) { form.nombre.focus(); return; }
      abrirWhatsApp(mensaje());
    });
  }

  /* ---------- Formulario de contacto → WhatsApp ---------- */
  var fc = document.querySelector('[data-form-contacto]');
  if (fc) {
    fc.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var t = 'Hola Lautaro, soy ' + fc.nombre.value.trim() + ' (' + fc.zona.value + ').\n\n' + fc.mensaje.value.trim();
      if (fc.telefono.value.trim()) t += '\n\nMi teléfono: ' + fc.telefono.value.trim();
      abrirWhatsApp(t);
    });
  }

  /* ---------- Visor de la galería ---------- */
  var visor = document.querySelector('[data-visor]');
  var figs = Array.prototype.slice.call(document.querySelectorAll('[data-galeria] figure'));
  if (visor && figs.length) {
    var vi = 0;
    var vImg = visor.querySelector('img'), vCap = visor.querySelector('figcaption');
    function ver(n) {
      vi = (n + figs.length) % figs.length;
      var im = figs[vi].querySelector('img');
      vImg.src = im.src; vImg.alt = im.alt;
      vCap.textContent = figs[vi].querySelector('figcaption').textContent;
    }
    function cerrar() { visor.hidden = true; document.body.style.overflow = ''; }
    figs.forEach(function (f, k) {
      f.addEventListener('click', function () { ver(k); visor.hidden = false; document.body.style.overflow = 'hidden'; });
    });
    visor.querySelector('[data-visor-cerrar]').addEventListener('click', cerrar);
    visor.querySelector('[data-visor-ant]').addEventListener('click', function () { ver(vi - 1); });
    visor.querySelector('[data-visor-sig]').addEventListener('click', function () { ver(vi + 1); });
    visor.addEventListener('click', function (e) { if (e.target === visor) cerrar(); });
    document.addEventListener('keydown', function (e) {
      if (visor.hidden) return;
      if (e.key === 'Escape') cerrar();
      if (e.key === 'ArrowLeft') ver(vi - 1);
      if (e.key === 'ArrowRight') ver(vi + 1);
    });
  }

  var anio = document.querySelector('[data-anio]');
  if (anio) anio.textContent = new Date().getFullYear();
})();
