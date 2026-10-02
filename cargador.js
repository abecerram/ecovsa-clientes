/* ═══════════════════════════════════════════════════════════════════
   ECOVSA · CARGADOR (cargador.js · api 3.5.2)
   Cómo espera el sistema, igual en la computadora y en el celular:

   · Al ENTRAR a un módulo: cortina azul con el emblema que se arma (el
     globo, el símbolo y las dos flechas, como en la entrada del celular),
     las letras de ECOVSA y el nombre del módulo. Mientras llegan los datos
     las flechas giran; cuando todo está, la cortina se levanta y aparece
     la página ya pintada. Si los datos llegan en menos de medio segundo,
     solo hay un fundido corto (no parpadea).
   · DENTRO del módulo (cambiar de pestaña o de página del mismo módulo):
     sin cortina. Giran las flechas del emblema de la barra y corre una
     línea verde fina arriba mientras el servidor contesta.
   · ECOCARGA.logo(tamaño) da el emblema para las esperas de archivos
     (subidas, documentos): lo usan archivos.js y documento.js.

   Uso en una página de módulo, al principio del <body>:
     <script src="cargador.js" data-modulo="Mercadeo"></script>
   Se levanta sola cuando el puente termina de traer los datos.
   Con data-manual la página dice cuándo: ECOCARGA.listo().
   Reemplaza al camión rojo de Logística.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  if (window.ECOCARGA) return;
  var yo = document.currentScript;
  var BASE = yo && yo.src ? yo.src.replace(/[^\/]*$/, '') : '';
  var MOD = (yo && yo.getAttribute('data-modulo')) || '';
  var MANUAL = !!(yo && yo.hasAttribute('data-manual'));
  var SOLO = !!(yo && yo.hasAttribute('data-solo'));   /* solo el emblema (documentos y páginas del cliente) */
  var QUIETO = false; try { QUIETO = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  /* ── estilos: una sola vez ── */
  var css =
    '.eco-lg{position:relative;flex:none;border-radius:50%;background:#fff}' +
    '.eco-lg .p{position:absolute;left:8%;right:8%;top:15%;bottom:15%}' +
    '.eco-lg img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;-webkit-user-drag:none;user-select:none;transform-origin:49.375% 48.98%}' +
    '.eco-lg .fl{position:absolute;inset:0;transform-origin:49.375% 48.98%}' +
    '.eco-lg.arma .gl{animation:ecoGl .8s .05s cubic-bezier(.3,1.35,.5,1) both}' +
    '.eco-lg.arma .bi{animation:ecoBi .8s .45s cubic-bezier(.3,1.2,.5,1) both}' +
    '.eco-lg.arma .fa{animation:ecoFa 1s .7s cubic-bezier(.2,.9,.25,1.08) both}' +
    '.eco-lg.arma .fb{animation:ecoFb 1s .7s cubic-bezier(.2,.9,.25,1.08) both}' +
    '.eco-lg.gira .fl{animation:ecoVuelta 1.5s linear infinite}' +
    '.eco-lg.vuelta .fl{animation:ecoVuelta .9s cubic-bezier(.25,.7,.25,1) 1}' +
    '@keyframes ecoGl{from{opacity:0;transform:scale(.15) rotate(-120deg)}to{opacity:1;transform:none}}' +
    '@keyframes ecoBi{from{opacity:0;transform:scale(0) rotate(-360deg)}to{opacity:1;transform:none}}' +
    '@keyframes ecoFa{from{opacity:0;transform:rotate(-220deg) scale(.8)}to{opacity:1;transform:none}}' +
    '@keyframes ecoFb{from{opacity:0;transform:rotate(220deg) scale(.8)}to{opacity:1;transform:none}}' +
    '@keyframes ecoVuelta{to{transform:rotate(360deg)}}' +
    '@keyframes ecoAp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}' +
    /* la cortina */
    '#eco-cortina{position:fixed;inset:0;z-index:2147482000;display:flex;flex-direction:column;align-items:center;justify-content:center;' +
      'background:radial-gradient(circle at 50% 42%,#1a3f80 0,#0f2a57 55%,#0a1f45 100%);color:#fff;font-family:Archivo,system-ui,-apple-system,"Segoe UI",sans-serif;' +
      'transition:opacity .42s ease,transform .42s ease;padding:env(safe-area-inset-top,0) 16px env(safe-area-inset-bottom,0)}' +
    '#eco-cortina.fuera{opacity:0;transform:scale(1.035);pointer-events:none}' +
    '#eco-cortina.rapida{transition:opacity .18s ease}' +
    '#eco-cortina .eco-lg{width:128px;height:128px;box-shadow:0 0 0 10px rgba(255,255,255,.07),0 14px 40px rgba(0,0,0,.35)}' +
    '#eco-cortina .wm{display:block;width:118px;height:auto;margin-top:22px;animation:ecoAp .5s 1.25s both;-webkit-user-drag:none}' +
    '#eco-cortina .md{font-size:12.5px;letter-spacing:2.2px;text-transform:uppercase;color:#b9c6dd;margin-top:7px;font-weight:700;animation:ecoAp .5s 1.35s both}' +
    '#eco-cortina .ms{font-size:13px;color:#dfe7f5;margin-top:18px;min-height:18px;animation:ecoAp .4s 1.6s both;text-align:center}' +
    '#eco-cortina .ln{width:180px;max-width:60vw;height:3px;border-radius:3px;background:rgba(255,255,255,.14);margin-top:12px;overflow:hidden;animation:ecoAp .4s 1.6s both}' +
    '#eco-cortina .ln i{display:block;height:100%;width:34%;background:#8fd46a;border-radius:3px;animation:ecoIda 1.3s ease-in-out infinite}' +
    '@keyframes ecoIda{0%{transform:translateX(-110%)}100%{transform:translateX(310%)}}' +
    '@media (max-width:600px){#eco-cortina .eco-lg{width:112px;height:112px}}' +
    /* dentro del módulo: la línea de arriba y las flechas de la barra */
    '#eco-linea{position:fixed;left:0;top:0;height:3px;width:0;z-index:2147481000;background:linear-gradient(90deg,#8fd46a,#b8ff8a);box-shadow:0 0 8px rgba(143,212,106,.7);' +
      'transition:width .5s ease,opacity .3s ease;opacity:0;pointer-events:none}' +
    'html.eco-ocupado .tm-marca .tm-fl{animation:ecoVuelta 1.1s linear infinite!important}' +
    /* bloques grises con la forma de la página mientras llegan los datos */
    '.eco-sk{background:linear-gradient(90deg,#e7ecf3 0,#f3f6fa 40%,#e7ecf3 80%);background-size:300% 100%;animation:ecoSk 1.2s linear infinite;border-radius:10px}' +
    '@keyframes ecoSk{from{background-position:100% 0}to{background-position:0 0}}' +
    /* «Cargando…» de los módulos: con el emblema chico al lado */
    '.eco-esp{display:flex;align-items:center;gap:10px;justify-content:center;padding:18px;color:#5d6a80;font-size:13px;font-weight:600}' +
    '.eco-esp .eco-lg{width:30px;height:30px;box-shadow:0 0 0 1px #e1e6ee}' +
    '.cargando.eco-esp-in{display:flex;align-items:center;justify-content:center;gap:10px}.cargando.eco-esp-in::before{display:none!important}' +
    '.cargando.eco-esp-in>.eco-lg{width:26px;height:26px;box-shadow:0 0 0 1px #e1e6ee}' +
    '.eco-lg.eco-spin{width:64px;height:64px;margin:0 auto 14px;box-shadow:0 0 0 1px #e1e6ee,0 8px 24px rgba(15,33,64,.12);border:0!important;animation:none}' +
    '@media (prefers-reduced-motion:reduce){.eco-lg.arma img,.eco-lg.gira .fl,.eco-lg.vuelta .fl,#eco-cortina .ln i,.eco-sk{animation:none!important}' +
      '#eco-cortina .wm,#eco-cortina .md,#eco-cortina .ms,#eco-cortina .ln{animation:none}}';
  var st = document.createElement('style'); st.id = 'eco-cargador-css'; st.textContent = css;
  (document.head || document.documentElement).appendChild(st);

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  /* El emblema por piezas. arma: se arma al aparecer; gira: flechas girando. */
  function logo(px, op) {
    op = op || {};
    var cls = 'eco-lg' + (op.arma && !QUIETO ? ' arma' : '') + (op.gira && !QUIETO ? ' gira' : '');
    return '<div class="' + cls + '"' + (px ? ' style="width:' + px + 'px;height:' + px + 'px"' : '') + ' aria-hidden="true"><div class="p">' +
      '<img class="gl" src="' + BASE + 'entrada-globo.png" alt=""><img class="bi" src="' + BASE + 'entrada-bio.png" alt="">' +
      '<div class="fl"><img class="fa" src="' + BASE + 'entrada-flecha-a.png" alt=""><img class="fb" src="' + BASE + 'entrada-flecha-b.png" alt=""></div></div></div>';
  }

  /* ── la cortina ── */
  var C = null, t0 = 0, tGira = null, tMax = null, cerrando = false;
  function cortina(op) {
    op = op || {};
    var mod = op.modulo || MOD;
    if (C && C.parentNode && !cerrando) { if (op.mensaje) mensaje(op.mensaje); return; }
    if (C && C.parentNode) C.parentNode.removeChild(C);
    cerrando = false;
    C = document.createElement('div'); C.id = 'eco-cortina'; C.setAttribute('role', 'status'); C.setAttribute('aria-live', 'polite');
    C.innerHTML = logo(0, { arma: true }) +
      '<img class="wm" src="' + BASE + 'ecovsa-letras.png" alt="ECOVSA">' +
      (mod ? '<div class="md">' + esc(mod) + '</div>' : '') +
      '<div class="ms">' + esc(op.mensaje || 'Trayendo los datos…') + '</div><div class="ln"><i></i></div>';
    (document.body || document.documentElement).appendChild(C);
    t0 = Date.now();
    clearTimeout(tGira); clearTimeout(tMax);
    /* armado el emblema, las flechas siguen girando mientras se espera */
    tGira = setTimeout(function () { var l = C && C.querySelector('.eco-lg'); if (l && !QUIETO) { l.classList.remove('arma'); l.classList.add('gira'); } }, 1750);
    /* nunca se queda pegada: a los 25 s se levanta igual */
    tMax = setTimeout(function () { listo(); }, 25000);
  }
  function mensaje(t) { var m = C && C.querySelector('.ms'); if (m) m.textContent = t; }
  function listo(yaMismo) {
    if (!C || !C.parentNode || cerrando) return;
    cerrando = true; clearTimeout(tMax);
    var c = C, pasado = Date.now() - t0;
    var quitar = function (rapida) {
      clearTimeout(tGira);
      if (rapida) c.classList.add('rapida');
      c.classList.add('fuera');
      setTimeout(function () { if (c.parentNode) c.parentNode.removeChild(c); if (C === c) { C = null; cerrando = false; } }, rapida ? 220 : 480);
    };
    if (yaMismo || pasado < 450 || QUIETO) { quitar(true); return; }
    /* si el emblema no terminó de armarse, se espera a que termine; luego una última vuelta y se levanta */
    var falta = Math.max(0, 1600 - pasado);
    setTimeout(function () {
      var l = c.querySelector('.eco-lg');
      if (l) { l.classList.remove('arma', 'gira'); void l.offsetWidth; l.classList.add('vuelta'); }
      var ln = c.querySelector('.ln i'); if (ln) { ln.style.animation = 'none'; ln.style.width = '100%'; ln.style.transition = 'width .3s'; }
      setTimeout(function () { quitar(false); }, 380);
    }, falta);
  }

  /* ── dentro del módulo: línea verde y flechas de la barra ── */
  var L = null, pend = 0, tLinea = null, tocado = 0, lineaVisible = false;
  document.addEventListener('pointerdown', function () { tocado = Date.now(); }, true);
  document.addEventListener('keydown', function () { tocado = Date.now(); }, true);
  function linea() {
    if (!L) { L = document.createElement('div'); L.id = 'eco-linea'; (document.body || document.documentElement).appendChild(L); }
    return L;
  }
  function ocupado() {
    if (C && C.parentNode) return;               /* con la cortina puesta no hace falta */
    var l = linea(); lineaVisible = true;
    document.documentElement.classList.add('eco-ocupado');
    l.style.transition = 'none'; l.style.width = '0'; l.style.opacity = '1'; void l.offsetWidth;
    l.style.transition = ''; l.style.width = '62%';
    clearTimeout(tLinea); tLinea = setTimeout(function () { if (lineaVisible) l.style.width = '86%'; }, 900);
  }
  function desocupado() {
    clearTimeout(tLinea);
    document.documentElement.classList.remove('eco-ocupado');
    if (!lineaVisible || !L) return;
    lineaVisible = false; L.style.width = '100%';
    setTimeout(function () { if (!lineaVisible && L) L.style.opacity = '0'; }, 320);
  }
  /* Para pantallas que cargan sin el puente (o que quieren avisar solas) */
  function pestana() { ocupado(); }

  /* El puente avisa cada vez que empieza o termina una llamada. */
  var vistoAlgo = false, tOcupado = null;
  document.addEventListener('puente:estado', function (e) {
    var d = e.detail || {};
    var n = typeof d.pendientes === 'number' ? d.pendientes : (d.estado === 'cargando' || d.estado === 'guardando' ? 1 : 0);
    if (n > 0) vistoAlgo = true;
    /* la cortina de entrada se levanta sola cuando no queda nada pendiente
       (o cuando ya se pintó la copia guardada) */
    if (!MANUAL && C && C.parentNode && vistoAlgo && (n === 0 || d.estado === 'copia')) listo();
    if (n > 0 && pend === 0) {
      /* solo si lo pidió alguien: los refrescos de fondo no mueven nada */
      if (Date.now() - tocado < 1500) { clearTimeout(tOcupado); tOcupado = setTimeout(ocupado, 250); }
    }
    if (n === 0) { clearTimeout(tOcupado); desocupado(); }
    pend = n;
  });

  /* ── al abrir la página ── */
  function modoInterno() {
    /* dentro del mismo módulo (Mercadeo tiene varias páginas) no hay cortina */
    try {
      var ant = sessionStorage.getItem('eco_modulo') || '';
      var mismo = document.referrer && document.referrer.indexOf(location.origin) === 0;
      sessionStorage.setItem('eco_modulo', MOD);
      return !!(MOD && ant === MOD && mismo);
    } catch (e) { return false; }
  }
  if (yo && !SOLO) {
    if (MANUAL) cortina({});
    else if (!modoInterno()) {
      cortina({});
      /* páginas que no piden nada al abrir: se levanta sola */
      var alListo = function () { setTimeout(function () { if (!vistoAlgo) listo(); }, 700); };
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', alListo); else alListo();
    } else {
      /* página interna: la línea mientras llegan los datos */
      tocado = Date.now();
      var abrir = function () { setTimeout(function () { if (pend > 0) ocupado(); }, 250); };
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', abrir); else abrir();
    }
  }
  if (MANUAL) try { sessionStorage.setItem('eco_modulo', MOD); } catch (e) {}

  /* «Cargando…» de las pantallas: el emblema chico girando al lado del texto */
  function decorar(raiz) {
    if (!raiz || !raiz.querySelectorAll) return;
    var l = raiz.querySelectorAll('.cargando:not([data-eco])');
    for (var i = 0; i < l.length; i++) {
      var el = l[i]; el.setAttribute('data-eco', '1');
      if (String(el.textContent || '').length > 80) continue;
      el.classList.add('eco-esp-in'); el.insertAdjacentHTML('afterbegin', logo(0, { gira: true }));
    }
    /* los círculos que giraban (páginas del cliente): el emblema en su lugar */
    var sp = raiz.querySelectorAll('.carga .spin:not([data-eco]), #cargando .spin:not([data-eco])');
    for (var j = 0; j < sp.length; j++) {
      var s0 = sp[j]; s0.setAttribute('data-eco', '1');
      var t = document.createElement('div'); t.innerHTML = logo(0, { arma: true, gira: false });
      var lg = t.firstChild; lg.classList.add('eco-spin'); lg.setAttribute('data-eco', '1');
      s0.parentNode.replaceChild(lg, s0);
      (function (l) { setTimeout(function () { if (!QUIETO) { l.classList.remove('arma'); l.classList.add('gira'); } }, 1750); })(lg);
    }
  }
  function vigilar() {
    decorar(document.body);
    if (!window.MutationObserver) return;
    var pendiente = 0;
    new MutationObserver(function () { if (!pendiente) pendiente = requestAnimationFrame(function () { pendiente = 0; decorar(document.body); }); })
      .observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', vigilar); else if (document.body) vigilar();

  window.ECOCARGA = { cortina: cortina, listo: listo, mensaje: mensaje, logo: logo, pestana: pestana,
                      ocupado: ocupado, desocupado: desocupado, base: BASE };
})();

/* ═══════════════════════════════════════════════════════════════════
   VISTA RÁPIDA DE DOCUMENTOS (api 3.5.3)
   Recibos, actas, manifiestos, certificados, propuestas, contratos,
   solicitudes de pago, reportes de planta, cartas, arqueos e
   inspecciones se abren en una ventana sobre la misma página: se revisa
   sin salir y se cierra. «Abrir en pestaña ↗» los saca aparte. En el
   celular ocupa toda la pantalla. «Guardar en PDF» y WhatsApp siguen
   dentro del documento.
   Toma los enlaces solo: los <a href> a un documento y los window.open
   de un documento. Un enlace con data-vr="no" abre como siempre.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  if (window.VR) return;
  var yo = document.currentScript;
  try { if (window.top !== window) return; } catch (e) { return; }        /* dentro de otra ventana: nada */
  if (yo && yo.hasAttribute('data-solo')) return;                          /* páginas del cliente y documentos */
  var DOCS = { 'recibo.html': 'Recibo de visita', 'acta.html': 'Acta de entrega en planta', 'actasalida.html': 'Manifiesto de salida',
    'certificadovista.html': 'Certificado', 'propuesta.html': 'Propuesta', 'contrato.html': 'Contrato', 'solicitudvista.html': 'Solicitud de pago',
    'rplanta.html': 'Reporte de planta', 'carta.html': 'Carta', 'arqueo.html': 'Arqueo de caja menuda', 'inspeccionvista.html': 'Inspección técnica' };
  var RUTAS = { recibo: 'recibo.html', acta: 'acta.html', asalida: 'actasalida.html', vercert: 'certificadovista.html', propuesta: 'propuesta.html',
    contrato: 'contrato.html', vsolicitud: 'solicitudvista.html', rplanta: 'rplanta.html', carta: 'carta.html', arqueo: 'arqueo.html', vinspeccion: 'inspeccionvista.html' };
  function doc(url) {
    try {
      if (!url || typeof url !== 'string' || /^(javascript|mailto|tel|blob|data):/i.test(url)) return null;
      var u = new URL(url, location.href);
      if (u.origin !== location.origin) return null;
      var f = u.pathname.split('/').pop().toLowerCase(), p = String(u.searchParams.get('p') || '').toLowerCase();
      if ((f === '' || f === 'index.html') && RUTAS[p]) f = RUTAS[p];
      if (!DOCS[f]) return null;
      var id = u.searchParams.get('id') || u.searchParams.get('folio') || u.searchParams.get('cod') || '';
      if (f === 'rplanta.html' && u.searchParams.get('desde')) id = u.searchParams.get('desde') + ' al ' + (u.searchParams.get('hasta') || '');
      return { url: u.href, titulo: DOCS[f], id: id };
    } catch (e) { return null; }
  }
  var css =
    '.vr-velo{position:fixed;inset:0;background:rgba(10,25,50,.55);z-index:9600;display:flex;align-items:center;justify-content:center;padding:2vh 2vw;animation:vrIn .15s ease-out}' +
    '@keyframes vrIn{from{opacity:0}to{opacity:1}}' +
    '.vr-p{background:#fff;border-radius:16px;width:min(1000px,96vw);height:94vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 60px rgba(10,25,50,.35)}' +
    '.vr-h{display:flex;align-items:center;gap:10px;padding:10px 12px 10px 16px;border-bottom:1px solid #E3E8EF;font-family:inherit}' +
    '.vr-h .t{flex:1;min-width:0}.vr-h b{display:block;font-size:15px;font-weight:800;color:#14306B;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '.vr-h small{display:block;font-size:12px;color:#6B7A90;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '.vr-h button{border:1px solid #D9E1EA;background:#fff;color:#14306B;border-radius:10px;padding:8px 12px;font:700 13px inherit;font-family:inherit;cursor:pointer;white-space:nowrap}' +
    '.vr-h button.x{border-color:transparent;background:#EEF2F6}' +
    '.vr-b{position:relative;flex:1;background:#EEF2F6}.vr-b iframe{position:absolute;inset:0;width:100%;height:100%;border:0;background:#fff}' +
    '.vr-esp{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;color:#6B7A90;font:600 13px inherit;font-family:inherit;background:#EEF2F6}' +
    '@media(max-width:700px){.vr-velo{padding:0}.vr-p{width:100vw;height:100%;border-radius:0}.vr-h .ab span{display:none}}';
  var abiertoV = null, _open = window.open;
  function cerrar() { if (abiertoV) { abiertoV.remove(); abiertoV = null; document.removeEventListener('keydown', tecla); } }
  function tecla(e) { if (e.key === 'Escape') cerrar(); }
  function abrir(url, titulo, sub) {
    var d = doc(url) || { url: url, titulo: titulo || 'Documento', id: '' };
    cerrar();
    if (!document.getElementById('vr-css')) { var st = document.createElement('style'); st.id = 'vr-css'; st.textContent = css; document.head.appendChild(st); }
    var v = document.createElement('div'); v.className = 'vr-velo';
    var esc = function (s) { return String(s || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
    var lg = window.ECOCARGA && ECOCARGA.logo ? ECOCARGA.logo(46, { gira: true }) : '';
    v.innerHTML = '<div class="vr-p" role="dialog" aria-modal="true"><div class="vr-h"><div class="t"><b>' + esc(titulo || d.titulo) + '</b><small>' + esc(sub || d.id || 'Vista rápida') + '</small></div>' +
      '<button class="ab" type="button">↗<span> Abrir en pestaña</span></button><button class="x" type="button" aria-label="Cerrar">✕<span> Cerrar</span></button></div>' +
      '<div class="vr-b"><div class="vr-esp">' + lg + 'Abriendo el documento…</div><iframe title="Documento"></iframe></div></div>';
    v.addEventListener('click', function (e) { if (e.target === v) cerrar(); });
    v.querySelector('.x').onclick = cerrar;
    v.querySelector('.ab').onclick = function () { _open.call(window, d.url, '_blank'); cerrar(); };
    var f = v.querySelector('iframe');
    f.onload = function () { var e = v.querySelector('.vr-esp'); if (e) e.remove(); };
    f.src = d.url;
    document.body.appendChild(v); abiertoV = v;
    document.addEventListener('keydown', tecla);
    return v;
  }
  /* window.open de un documento → vista rápida */
  window.open = function (url, nombre, rasgos) {
    var d = doc(url);
    if (d && (!nombre || nombre === '_blank')) {
      abrir(d.url);
      return { closed: false, focus: function () {}, close: cerrar, location: { href: d.url } };
    }
    return _open.apply(window, arguments);
  };
  /* <a href> a un documento → vista rápida (Ctrl/⌘ o data-vr="no" abren como siempre) */
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a || a.getAttribute('data-vr') === 'no' || a.hasAttribute('download')) return;
    var d = doc(a.getAttribute('href'));
    if (!d) return;
    e.preventDefault(); abrir(d.url);
  });
  window.VR = { abrir: abrir, cerrar: cerrar, esDocumento: function (u) { return !!doc(u); },
                pestana: function (u) { return _open.call(window, u, '_blank'); } };
})();
