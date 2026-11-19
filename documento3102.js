/* ═══════════════════════════════════════════════════════════════════
   ECOVSA · documento.js (api 3.5.1 · espera con el emblema en la 3.5.2)
   Piezas comunes de los documentos:
   · DOCE.membrete({...}): el encabezado de la hoja (logo, empresa, RUC,
     contacto, franja de la resolución y código del formulario).
       modo 'comercial' (recibo, actas, reportes, propuesta): ECOVSA
       modo 'legal' (contrato, certificado, solicitud de pago, arqueo,
       carta): la razón social
   · DOCE.ic(nombre): los íconos de la barra.
   · DOCE.fecha(v): «26 de septiembre de 2026» desde cualquier fecha,
     también las que llegan crudas («Tue Sep 01 2026 …»).
   Los datos de la empresa llegan del servidor (EMPRESA); si una página
   no los trae, se usan estos, que son los mismos.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  var BASE = { comercial: 'ECOVSA', razonSocial: 'ECOTERMO DE PANAMA S.A.', ruc: '1074020-1-552789', dv: '50',
    direccion: 'Distrito Panamá, Edif. P.H. Credicorp Bank, Piso 7', telefono: '310-2268', whatsapp: '6264-1647',
    correo: 'info@ecovsa.com', resolucion: 'Resolución Sanitaria N° 1519 del 10 de diciembre de 2025' };
  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var ABR = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function emp(e) { var o = {}; for (var k in BASE) o[k] = (e && e[k]) || BASE[k]; if (e && e.formulario) o.formulario = e.formulario; return o; }
  /* aaaa-mm-dd a partir de lo que venga */
  function iso(v) {
    if (!v) return '';
    if (v instanceof Date) return isNaN(v) ? '' : v.getFullYear() + '-' + ('0' + (v.getMonth() + 1)).slice(-2) + '-' + ('0' + v.getDate()).slice(-2);
    var s = String(v), m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
    if (m) return m[0];
    m = /^[A-Z][a-z]{2} ([A-Z][a-z]{2}) (\d{1,2}) (\d{4})/.exec(s);          // «Tue Sep 01 2026 20:41:13 GMT-0500»
    if (m && ABR[m[1]]) return m[3] + '-' + ('0' + ABR[m[1]]).slice(-2) + '-' + ('0' + m[2]).slice(-2);
    m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(s);                              // 01/09/2026
    if (m) return m[3] + '-' + ('0' + m[2]).slice(-2) + '-' + ('0' + m[1]).slice(-2);
    return '';
  }
  function fecha(v, corta) {
    var i = iso(v); if (!i) return String(v || '');
    var p = i.split('-');
    return corta ? p[2] + '/' + p[1] + '/' + p[0] : Number(p[2]) + ' de ' + MESES[Number(p[1]) - 1] + ' de ' + p[0];
  }
  var IC = {
    pdf: '<path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v7H6z"/>',
    wa: '<path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.4A8.4 8.4 0 1 1 21 11.5z"/>',
    correo: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    atras: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    bajar: '<path d="M12 4v12M7 11l5 5 5-5M4 20h16"/>',
    enlace: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'
  };
  function ic(n) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + (IC[n] || '') + '</svg>'; }
  function membrete(o) {
    o = o || {}; var e = emp(o.empresa), legal = o.modo === 'legal';
    /* api 3.17: o.linea cambia el servicio (desechos sólidos) y o.franja el texto de la franja */
    var serv = o.linea || 'Recolección, transporte y tratamiento de desechos hospitalarios';
    var lin1 = legal ? e.comercial + ' · ' + serv : serv;
    var lin2 = 'RUC ' + e.ruc + (e.dv ? ' DV ' + e.dv : '') + ' · ' + e.direccion;
    var lin3 = 'Tel. ' + e.telefono + (e.whatsapp ? ' · WhatsApp ' + e.whatsapp : '') + ' · ' + e.correo;
    return '<div class="dm"><img class="dm-logo" src="logo-ecovsa.png" alt="ECOVSA"><div class="dm-e"><b>' + esc(legal ? e.razonSocial : e.comercial) + '</b>' +
      '<span>' + esc(lin1) + '</span><span>' + esc(lin2) + '</span><span>' + esc(lin3) + '</span></div>' +
      (o.derecha ? '<div class="dm-r">' + o.derecha + '</div>' : '') + '</div>' +
      '<div class="dm-res"><span class="ok">' + esc(o.franja || 'Empresa registrada ante el Ministerio de Salud · ' + e.resolucion) + '</span>' +
      (o.codigo ? '<span>' + esc(o.codigo) + '</span>' : '') + '</div>';
  }
  /* api 3.5.2 · mientras se abre el documento: el emblema que se arma en
     lugar del «Cargando…» suelto (lo dibuja cargador.js). */
  var yoDoc = document.currentScript, RAIZ = yoDoc && yoDoc.src ? yoDoc.src.replace(/[^\/]*$/, '') : '';
  function esperaDoc() {
    if (!window.ECOCARGA || !document.body) return;
    var l = document.querySelectorAll('.aviso,.estado,#app>div,#cont>div,body>div');
    for (var i = 0; i < l.length; i++) {
      var el = l[i], t = String(el.textContent || '').trim();
      if (el.getAttribute('data-eco') || t.length > 90 || !/^(Cargando|Abriendo)\b/i.test(t)) continue;
      el.setAttribute('data-eco', '1');
      var g = el.querySelector('.gira,.spin'); if (g) g.parentNode.removeChild(g);
      el.insertAdjacentHTML('afterbegin', '<div class="doc-esp">' + ECOCARGA.logo(68, { arma: true }) + '</div>');
      (function (x) { setTimeout(function () { var lg = x.querySelector('.doc-esp .eco-lg'); if (lg) { lg.classList.remove('arma'); lg.classList.add('gira'); } }, 1750); })(el);
    }
  }
  function arrancarEspera() {
    if (!document.getElementById('doc-esp-css')) {
      var st = document.createElement('style'); st.id = 'doc-esp-css';
      st.textContent = '.doc-esp{display:flex;justify-content:center;margin:4px 0 14px}.doc-esp .eco-lg{box-shadow:0 0 0 1px #e1e6ee,0 8px 24px rgba(15,33,64,.1)}@media print{.doc-esp{display:none}}';
      document.head.appendChild(st);
    }
    if (window.ECOCARGA) { esperaDoc(); return; }
    var sc = document.createElement('script'); sc.src = RAIZ + 'cargador.js'; sc.setAttribute('data-solo', '');
    sc.onload = esperaDoc; document.head.appendChild(sc);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancarEspera); else arrancarEspera();

  window.DOCE = { membrete: membrete, ic: ic, fecha: fecha, iso: iso, esc: esc, empresa: emp };
})();
