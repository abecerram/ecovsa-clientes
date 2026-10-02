/* ═══════════════════════════════════════════════════════════════════
   ECOVSA · archivos.js (api 3.5.1 · tarjeta de espera en la 3.5.2 · PDF escaneados y avisos en la 3.6 · subir al elegir en la 3.7.1)
   Lo que comparten las pantallas que suben documentos:
   · achica las fotos en el navegador (1800 px, JPG) antes de subirlas;
   · los PDF con texto se suben tal cual (hasta 10 MB); los escaneados de
     más de 1 MB se rearman con sus páginas como fotos livianas (api 3.6);
   · sube directo al espacio de archivos con la firma que da el servidor.
   Uso:
     ARCH.preparar(file).then(function (p) { ... p.meta = {nombre, mime, tamano} ... })
     ARCH.subir(urlFirmada, p, alAvanzar).then(...)
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  var MAX = 10 * 1024 * 1024, LADO = 1800, CALIDAD = 0.78;
  var TIPOS = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
  function kb(n) { n = Number(n) || 0; return n >= 1048576 ? (Math.round(n / 104857.6) / 10) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB'; }
  function nombreJpg(n) { return String(n || 'foto').replace(/\.[a-z0-9]{2,5}$/i, '') + '.jpg'; }
  function achicar(file) {
    return new Promise(function (ok, mal) {
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () {
        var w = img.naturalWidth, h = img.naturalHeight, k = Math.min(1, LADO / Math.max(w, h));
        var c = document.createElement('canvas'); c.width = Math.round(w * k); c.height = Math.round(h * k);
        var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        c.toBlob(function (b) {
          if (!b) { mal(new Error('No se pudo preparar la foto.')); return; }
          /* si la foto ya era liviana y la versión nueva pesa más, se queda la original */
          if (b.size >= file.size && file.type === 'image/jpeg') ok({ blob: file, meta: { nombre: file.name, mime: 'image/jpeg', tamano: file.size }, antes: file.size });
          else ok({ blob: b, meta: { nombre: nombreJpg(file.name), mime: 'image/jpeg', tamano: b.size }, antes: file.size });
        }, 'image/jpeg', CALIDAD);
      };
      img.onerror = function () { URL.revokeObjectURL(url); mal(new Error('Esa foto no se pudo abrir. Pruebe con otra o mándela en PDF.')); };
      img.src = url;
    });
  }
  /* ── api 3.6 · PDF escaneados: cada página es una foto; se rearma liviano ──
     Se usan pdf.js (para leer las páginas) y jsPDF (para armar el nuevo), que
     se bajan solo la primera vez que hace falta. Si algo falla, o el nuevo
     no queda al menos un 20 % más liviano, se sube el original. */
  var PDF_MIN = 1024 * 1024, PDF_LADO = 1650, PDF_CAL = 0.62, PDF_PAG = 40;
  var _libs = null;
  function cargarJs(src) { return new Promise(function (ok, mal) { var s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = function () { mal(new Error('sin ' + src)); }; document.head.appendChild(s); }); }
  function libsPdf() {
    if (_libs) return _libs;
    var B = 'https://cdnjs.cloudflare.com/ajax/libs/';
    _libs = (window.pdfjsLib ? Promise.resolve() : cargarJs(B + 'pdf.js/3.11.174/pdf.min.js'))
      .then(function () { return window.jspdf ? null : cargarJs(B + 'jspdf/2.5.1/jspdf.umd.min.js'); })
      .then(function () { window.pdfjsLib.GlobalWorkerOptions.workerSrc = B + 'pdf.js/3.11.174/pdf.worker.min.js'; });
    _libs.catch(function () { _libs = null; });
    return _libs;
  }
  function achicarPdf(file, alAvanzar) {
    return libsPdf().then(function () { return file.arrayBuffer(); }).then(function (buf) {
      return window.pdfjsLib.getDocument({ data: buf }).promise;
    }).then(function (doc) {
      if (doc.numPages > PDF_PAG) return null;
      /* ¿es escaneado? si las páginas casi no tienen texto, sí */
      var letras = 0, revisar = Math.min(doc.numPages, 3), cad = Promise.resolve();
      for (var i = 1; i <= revisar; i++) (function (n) { cad = cad.then(function () { return doc.getPage(n).then(function (pg) { return pg.getTextContent(); }).then(function (tc) { tc.items.forEach(function (it) { letras += String(it.str || '').replace(/\s/g, '').length; }); }); }); })(i);
      return cad.then(function () {
        if (letras > 40 * revisar) return null;          // tiene texto: se sube tal cual
        var pdf = null, n = 0, cad2 = Promise.resolve();
        for (var j = 1; j <= doc.numPages; j++) (function (k) {
          cad2 = cad2.then(function () { return doc.getPage(k); }).then(function (pg) {
            var v1 = pg.getViewport({ scale: 1 }), esc = Math.min(3, PDF_LADO / Math.max(v1.width, v1.height)), v = pg.getViewport({ scale: esc });
            var c = document.createElement('canvas'); c.width = Math.round(v.width); c.height = Math.round(v.height);
            var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
            return pg.render({ canvasContext: x, viewport: v }).promise.then(function () {
              var o = v1.width > v1.height ? 'l' : 'p';
              if (!pdf) pdf = new window.jspdf.jsPDF({ orientation: o, unit: 'pt', format: [v1.width, v1.height], compress: true });
              else pdf.addPage([v1.width, v1.height], o);
              pdf.addImage(c.toDataURL('image/jpeg', PDF_CAL), 'JPEG', 0, 0, v1.width, v1.height, undefined, 'FAST');
              n++; if (alAvanzar) alAvanzar(Math.round(n / doc.numPages * 100));
            });
          });
        })(j);
        return cad2.then(function () { return pdf ? pdf.output('blob') : null; });
      });
    }).then(function (b) {
      if (!b || b.size > file.size * 0.8) return null;
      return { blob: b, meta: { nombre: file.name, mime: 'application/pdf', tamano: b.size }, antes: file.size, achicado: true };
    }).catch(function (e) { console.warn('[archivos] PDF sin achicar: ' + ((e && e.message) || e)); return null; });
  }
  function preparar(file) {
    if (!file) return Promise.reject(new Error('Elija el archivo.'));
    var t = String(file.type || '').toLowerCase();
    if (!t && /\.pdf$/i.test(file.name)) t = 'application/pdf';
    if (TIPOS.indexOf(t) < 0 && !/^image\//.test(t)) return Promise.reject(new Error('Solo PDF o fotos (JPG, PNG).'));
    if (/^image\//.test(t)) return achicar(file).then(function (p) {
      if (p.meta.tamano > MAX) throw new Error('La foto sigue pesando más de 10 MB.');
      return p;
    });
    var tal = { blob: file, meta: { nombre: file.name, mime: 'application/pdf', tamano: file.size }, antes: file.size };
    if (file.size > 30 * 1024 * 1024) return Promise.reject(new Error('El PDF pesa ' + kb(file.size) + '. El máximo es 10 MB.'));
    if (file.size <= PDF_MIN) return Promise.resolve(tal);
    return achicarPdf(file).then(function (p) {
      var r = p || tal;
      if (r.meta.tamano > MAX) throw new Error('El PDF pesa ' + kb(r.meta.tamano) + (p ? ' aun achicado' : '') + '. El máximo es 10 MB.');
      return r;
    });
  }
  /* api 3.6 · lo que contesta Supabase, dicho en español y con el motivo */
  function motivoSubida(st, txt, p) {
    var j = null; try { j = JSON.parse(txt || ''); } catch (e) {}
    var m = String((j && (j.message || j.error)) || txt || ''), c = String((j && j.statusCode) || st);
    var tipo = (p && p.meta && p.meta.mime) || 'este tipo';
    if (/mime|invalid_mime|415/i.test(m + ' ' + c)) return 'Supabase no acepta ' + tipo + '. En Storage › documentos › Edit bucket, «Allowed MIME types» debe decir exactamente: image/jpeg, image/png, image/webp, application/pdf';
    if (/exceed|too large|maximum allowed size|413/i.test(m + ' ' + c)) return 'El archivo pasa el tamaño máximo del espacio documentos en Supabase (debe ser 10 MB).';
    if (/jwt|signature|expired|token|403|401/i.test(m + ' ' + c)) return 'Se venció el permiso para subir. Toque «Reintentar».';
    if (/bucket not found|related resource|not.?found|404/i.test(m + ' ' + c)) return 'No existe el espacio «documentos» en Supabase Storage (revise que el nombre esté escrito igual).';
    if (/duplicate|already exists|409/i.test(m + ' ' + c)) return 'Ese archivo ya estaba subido. Toque «Reintentar».';
    return 'Supabase no aceptó el archivo (' + st + (m ? ': ' + m.slice(0, 120) : '') + '). Intente de nuevo.';
  }
  /* PUT directo al bucket con la firma. Con XHR para poder mostrar el avance.
     ctrl (opcional): recibe ctrl.abortar() para cancelar la subida. */
  function subir(url, p, alAvanzar, ctrl) {
    return new Promise(function (ok, mal) {
      if (!url) { mal(new Error('El espacio de archivos no respondió. Intente de nuevo en un momento.')); return; }
      var x = new XMLHttpRequest();
      if (ctrl) ctrl.abortar = function () { try { x.abort(); } catch (e) {} };
      x.onabort = function () { var e = new Error('Subida cancelada.'); e.cancelada = true; mal(e); };
      x.open('PUT', url, true);
      x.setRequestHeader('content-type', p.meta.mime);
      x.setRequestHeader('x-upsert', 'true');
      if (x.upload && alAvanzar) x.upload.onprogress = function (e) { if (e.lengthComputable) alAvanzar(Math.round(e.loaded / e.total * 100)); };
      x.onload = function () { if (x.status >= 200 && x.status < 300) ok(true); else mal(new Error(motivoSubida(x.status, x.responseText, p))); };
      x.onerror = function () { mal(new Error('Se cortó la conexión mientras subía. Intente de nuevo.')); };
      x.send(p.blob);
    });
  }
  /* ═══ api 3.5.2 · La espera de un archivo ═══════════════════════════
     Una tarjeta con el emblema girando, el nombre, la barra con el
     porcentaje y los pasos (Preparando → Subiendo → Guardando → Listo).
     La pantalla no se bloquea: si se cierra la hoja, la subida sigue y se
     ve en una píldora abajo a la derecha. Si se corta, «Reintentar». */
  var CSS = '.arc-t{background:#fff;border:1px solid #e1e6ee;border-radius:14px;padding:12px 14px;box-shadow:0 6px 20px rgba(15,33,64,.1);margin:10px 0;font-family:inherit;color:#0f2140;text-align:left}' +
    '.arc-t .h{display:flex;gap:12px;align-items:center}.arc-t .tx{flex:1;min-width:0}' +
    '.arc-t .tx b{display:block;font-size:13.5px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.arc-t .tx small{display:block;color:#5d6a80;font-size:12px;margin-top:1px}' +
    '.arc-t .ic{width:40px;height:40px;flex:none;position:relative}.arc-t .ic .eco-lg{width:40px!important;height:40px!important;box-shadow:0 0 0 1px #e1e6ee}' +
    '.arc-t .ic .ok,.arc-t .ic .mal{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900}' +
    '.arc-t .ic .ok{background:#eaf6e4;color:#2f9e44}.arc-t .ic .mal{background:#fdecea;color:#d64045}' +
    '.arc-t .x{background:none;border:0;color:#5d6a80;font-family:inherit;font-weight:700;font-size:12.5px;cursor:pointer;padding:6px 8px;border-radius:8px}.arc-t .x:hover{background:#f3f5f8}' +
    '.arc-t .re{background:#14306b;color:#fff;border:0;border-radius:9px;font-family:inherit;font-weight:700;font-size:12.5px;padding:7px 12px;cursor:pointer}' +
    '.arc-t .bar{height:7px;border-radius:5px;background:#eef1f5;overflow:hidden;margin:11px 0 8px}.arc-t .bar i{display:block;height:100%;width:0;background:linear-gradient(90deg,#2f9e44,#8fd46a);border-radius:5px;transition:width .3s ease}' +
    '.arc-t .bar.ind i{width:35%;animation:arcIda 1.2s ease-in-out infinite}@keyframes arcIda{0%{transform:translateX(-110%)}100%{transform:translateX(300%)}}' +
    '.arc-t .ps{display:flex;gap:6px;flex-wrap:wrap}.arc-t .ps span{font-size:11px;font-weight:800;border-radius:6px;padding:3px 8px;background:#eef1f5;color:#8a96a8}' +
    '.arc-t .ps span.on{background:#e8f0fa;color:#1b4a86}.arc-t .ps span.ok{background:#eaf6e4;color:#1f7a3a}.arc-t .ps span.mal{background:#fdecea;color:#b3261e}' +
    '.arc-t.listo{border-color:#bfe3c4}.arc-t.error{border-color:#f3c3c5}' +
    '#arc-pildora{position:fixed;left:14px;bottom:calc(14px + env(safe-area-inset-bottom,0px));z-index:2147480000;background:#0f2a57;color:#fff;border-radius:30px;padding:7px 14px 7px 7px;display:flex;align-items:center;gap:10px;font:600 12.5px Archivo,system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.3);max-width:calc(100vw - 28px)}' +
    '#arc-pildora .eco-lg{width:30px!important;height:30px!important}#arc-pildora .ok{width:30px;height:30px;border-radius:50%;background:#2f9e44;display:flex;align-items:center;justify-content:center;font-weight:900}' +
    '#arc-pildora span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '@media (prefers-reduced-motion:reduce){.arc-t .bar.ind i{animation:none;width:100%}}';
  function css() { if (document.getElementById('arc-css')) return; var st = document.createElement('style'); st.id = 'arc-css'; st.textContent = CSS; document.head.appendChild(st); }
  function e_(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function emblema(gira) {
    if (window.ECOCARGA && ECOCARGA.logo) return ECOCARGA.logo(40, { gira: gira, arma: gira });
    return '<div style="width:40px;height:40px;border-radius:50%;border:3px solid #e1e6ee;border-top-color:#14306b;animation:ecoVuelta 1s linear infinite"></div>';
  }
  var ACTIVAS = [], tPil = null;
  function pildora() {
    var viva = ACTIVAS.filter(function (t) { return t.estado === 'trabajando' && !visible(t.el); })[0];
    var hecha = ACTIVAS.filter(function (t) { return t.estado === 'listo' && t.fuera && Date.now() - t.fin < 3500; })[0];
    var p = document.getElementById('arc-pildora');
    if (!viva && !hecha) {
      if (p) p.parentNode.removeChild(p);
      /* se deja de vigilar solo cuando ya no hay nada subiendo */
      if (!ACTIVAS.some(function (t) { return t.estado === 'trabajando' || (t.estado === 'listo' && Date.now() - t.fin < 3500); })) { clearInterval(tPil); tPil = null; }
      return;
    }
    if (!p) { p = document.createElement('div'); p.id = 'arc-pildora'; p.setAttribute('role', 'status'); document.body.appendChild(p); p._modo = ''; }
    if (viva) {
      if (p._modo !== 'v') { p.innerHTML = emblema(true) + '<span></span>'; p._modo = 'v'; }
      p.lastChild.textContent = (viva.pc ? 'Subiendo ' + viva.nombre + ' · ' + viva.pc + ' %' : (viva.texto || 'Subiendo') + ' · ' + viva.nombre + '…');
    } else if (p._modo !== 'h') { p.innerHTML = '<div class="ok">✓</div><span>' + e_(hecha.textoListo || (hecha.nombre + ' guardado')) + '</span>'; p._modo = 'h'; }
  }
  /* ¿la tarjeta se ve? Si la hoja se cerró (quitada, escondida o deslizada fuera), no */
  function visible(el) {
    if (!el || !el.isConnected || !(el.offsetWidth || el.offsetHeight)) return false;
    var r = el.getBoundingClientRect();
    if (r.bottom <= 0 || r.top >= innerHeight || r.right <= 0 || r.left >= innerWidth) return false;
    var x = Math.min(innerWidth - 1, Math.max(0, r.left + r.width / 2)), y = Math.min(innerHeight - 1, Math.max(0, r.top + Math.min(r.height / 2, 20)));
    var top = document.elementFromPoint(x, y);
    return !!(top && (top === el || el.contains(top)));
  }
  function vigilarPildora() { if (!tPil) tPil = setInterval(pildora, 400); }

  function tarjeta(host, op) {
    css(); op = op || {};
    var pasos = op.pasos || ['Preparando', 'Subiendo', 'Guardando', 'Listo'];
    var T = { nombre: op.nombre || 'archivo', estado: 'trabajando', pc: null, texto: '', el: null, fin: 0, fuera: false };
    var el = document.createElement('div'); el.className = 'arc-t'; el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite');
    el.innerHTML = '<div class="h"><div class="ic">' + emblema(true) + '</div><div class="tx"><b>' + e_(T.nombre) + '</b><small>' + e_(op.detalle || '') + '</small></div>' +
      (op.alCancelar ? '<button type="button" class="x">Cancelar</button>' : '') + '</div>' +
      '<div class="bar"><i></i></div><div class="ps">' + pasos.map(function (p) { return '<span>' + e_(p) + '</span>'; }).join('') + '</div>';
    T.el = el;
    if (host) { if (op.reemplazar) host.innerHTML = ''; host.appendChild(el); }
    var q = function (s) { return el.querySelector(s); };
    if (op.alCancelar) q('.x').onclick = function () { if (T.estado === 'trabajando') op.alCancelar(); };
    T.paso = function (i, txt) {
      var sp = el.querySelectorAll('.ps span');
      for (var k = 0; k < sp.length; k++) sp[k].className = k < i ? 'ok' : (k === i ? 'on' : '');
      if (txt) sp[i] && (sp[i].textContent = txt);
      q('.bar').classList.toggle('ind', i !== 1 || !T.pc);
      if (i === 1) q('.bar i').style.width = (T.pc || 0) + '%';
      T.texto = (sp[i] && sp[i].textContent) || ''; T.pc = i === 1 ? (T.pc || 0) : null;
    };
    T.avance = function (pc) {
      T.pc = pc; q('.bar').classList.remove('ind'); q('.bar i').style.width = pc + '%';
      var sp = el.querySelectorAll('.ps span'); if (sp[1]) sp[1].textContent = (pasos[1] || 'Subiendo') + ' ' + pc + ' %';
    };
    T.detalle = function (t) { q('.tx small').textContent = t || ''; };
    T.listo = function (t) {
      T.estado = 'listo'; T.fin = Date.now(); T.fuera = !visible(el); T.textoListo = t || '';
      el.classList.add('listo'); q('.ic').innerHTML = '<div class="ok">✓</div>';
      q('.bar').classList.remove('ind'); q('.bar i').style.width = '100%';
      var sp = el.querySelectorAll('.ps span'); for (var k = 0; k < sp.length; k++) sp[k].className = 'ok';
      if (sp.length) sp[sp.length - 1].textContent = (pasos[pasos.length - 1] || 'Listo') + ' ✓';
      if (t) T.detalle(t);
      var x = q('.x'); if (x) x.remove();
      pildora();
    };
    T.error = function (msg, reintentar) {
      T.estado = 'error'; el.classList.add('error'); q('.ic').innerHTML = '<div class="mal">!</div>';
      q('.bar').classList.remove('ind');
      var sp = el.querySelectorAll('.ps span'); for (var k = 0; k < sp.length; k++) if (sp[k].className === 'on') sp[k].className = 'mal';
      T.detalle(msg || 'No se pudo subir.');
      var x = q('.x'); if (x) x.remove();
      if (reintentar) { var b = document.createElement('button'); b.type = 'button'; b.className = 're'; b.textContent = 'Reintentar'; b.onclick = reintentar; q('.h').appendChild(b); }
      pildora();
    };
    T.quitar = function () { T.estado = 'fuera'; if (el.parentNode) el.parentNode.removeChild(el); pildora(); };
    ACTIVAS = ACTIVAS.filter(function (t) { return t.estado === 'trabajando' || (t.estado === 'listo' && Date.now() - t.fin < 4000); });
    ACTIVAS.push(T); vigilarPildora();
    return T;
  }

  /* Todo el camino de una subida con su tarjeta:
     op.host · op.file · op.pedir(meta) → {subida, archivoId} · op.registrar(archivoId) → respuesta ·
     op.alListo(respuesta) · op.alError(msg) · op.textoListo
     Con op.base64 (sin espacio de archivos): op.registrar(datosBase64) sube por el servidor. */
  function flujo(op) {
    var ctrl = {}, T = null, cancelada = false;
    var correr = function () {
      cancelada = false;
      if (T) T.quitar();
      T = tarjeta(op.host, { nombre: op.file.name, detalle: kb(op.file.size), reemplazar: op.reemplazar,
        pasos: /^image\//.test(op.file.type || '') ? ['Achicando la foto', 'Subiendo', 'Guardando', 'Listo'] : ['Preparando', 'Subiendo', 'Guardando', 'Listo'],
        alCancelar: function () { cancelada = true; if (ctrl.abortar) ctrl.abortar(); T.quitar(); if (op.alCancelar) op.alCancelar(); } });
      T.paso(0);
      var prep = op.leer ? op.leer(op.file) : preparar(op.file);
      return prep.then(function (p) {
        if (cancelada) throw Object.assign(new Error('cancelada'), { cancelada: true });
        if (p && p.meta && p.antes && p.meta.tamano < p.antes) T.detalle(kb(p.antes) + ' → ' + kb(p.meta.tamano));
        T.paso(1);
        if (op.base64) { T.paso(1); var sp = T.el.querySelectorAll('.ps span'); if (sp[1]) sp[1].textContent = 'Subiendo'; T.el.querySelector('.bar').classList.add('ind');
          return Promise.resolve(op.registrar(p)); }
        return Promise.resolve(op.pedir(p.meta)).then(function (r) {
          if (!r || !r.ok) throw new Error((r && r.error) || 'No se pudo preparar la subida.');
          if (!r.subida) throw new Error(r.almacenError || 'El espacio de archivos no respondió. Intente en un rato.');
          return subir(r.subida, p, T.avance, ctrl).then(function () { T.paso(2); return op.registrar(r.archivoId); });
        });
      }).then(function (r) {
        if (cancelada) return;
        if (r && r.ok === false) throw new Error(r.error || 'No se pudo registrar.');
        T.listo(op.textoListo || 'Guardado'); if (op.alListo) op.alListo(r, T);
      }).catch(function (e) {
        if (cancelada || (e && e.cancelada)) return;
        var m = (e && e.message) || 'No se pudo subir.';
        T.error(m, correr); if (op.alError) op.alError(m, T);
      });
    };
    correr();
    return { cancelar: function () { if (T && T.estado === 'trabajando') { cancelada = true; if (ctrl.abortar) ctrl.abortar(); T.quitar(); } }, tarjeta: function () { return T; } };
  }

  /* api 3.7.1 · Subir apenas se elige el archivo: mientras la persona llena el resto
     (número, fechas), el archivo ya va subiendo. Al tocar «Guardar» solo falta registrarlo.
     op.host · op.file · op.pedir(meta) → {subida, archivoId} · op.reemplazar
     Devuelve { listo() → Promise(archivoId), guardar(registrar, textoListo) → Promise(respuesta), cancelar(), tarjeta() } */
  function anticipar(op) {
    var ctrl = {}, T = null, cancelada = false, prom = null, id = '';
    var correr = function () {
      cancelada = false; id = '';
      if (T) T.quitar();
      T = tarjeta(op.host, { nombre: op.file.name, detalle: kb(op.file.size), reemplazar: op.reemplazar,
        pasos: /^image\//.test(op.file.type || '') ? ['Achicando la foto', 'Subiendo', 'Guardando', 'Listo'] : ['Preparando', 'Subiendo', 'Guardando', 'Listo'],
        alCancelar: function () { cancelada = true; if (ctrl.abortar) ctrl.abortar(); T.quitar(); if (op.alCancelar) op.alCancelar(); } });
      T.paso(0);
      prom = preparar(op.file).then(function (p) {
        if (cancelada) throw Object.assign(new Error('cancelada'), { cancelada: true });
        if (p && p.meta && p.antes && p.meta.tamano < p.antes) T.detalle(kb(p.antes) + ' → ' + kb(p.meta.tamano));
        T.paso(1);
        return Promise.resolve(op.pedir(p.meta)).then(function (r) {
          if (!r || !r.ok) throw new Error((r && r.error) || 'No se pudo preparar la subida.');
          if (!r.subida) throw new Error(r.almacenError || 'El espacio de archivos no respondió. Intente en un rato.');
          return subir(r.subida, p, T.avance, ctrl).then(function () { id = r.archivoId; T.paso(2, 'Subido · falta Guardar'); T.el.querySelector('.bar').classList.remove('ind'); T.el.querySelector('.bar i').style.width = '100%'; return r.archivoId; });
        });
      });
      prom.catch(function (e) {
        if (cancelada || (e && e.cancelada)) return;
        T.error((e && e.message) || 'No se pudo subir.', correr); if (op.alError) op.alError((e && e.message) || '', T);
      });
    };
    correr();
    return {
      listo: function () { return prom; },
      subido: function () { return !!id; },
      guardar: function (registrar, textoListo) {
        return prom.then(function (archivoId) {
          T.paso(2, 'Guardando');
          return Promise.resolve(registrar(archivoId)).then(function (r) {
            if (r && r.ok === false) throw new Error(r.error || 'No se pudo registrar.');
            T.listo(textoListo || 'Guardado'); return r;
          });
        }).catch(function (e) { if (!(e && e.cancelada)) T.error((e && e.message) || 'No se pudo guardar.'); throw e; });
      },
      cancelar: function () { if (T && T.estado === 'trabajando') { cancelada = true; if (ctrl.abortar) ctrl.abortar(); T.quitar(); } },
      tarjeta: function () { return T; }
    };
  }

  window.ARCH = { preparar: preparar, subir: subir, kb: kb, MAX: MAX, acepta: '.pdf,application/pdf,image/*', tarjeta: tarjeta, flujo: flujo, anticipar: anticipar };
})();
