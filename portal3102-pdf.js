(function(w){'use strict';var RP={logo:'',firmaJpg:''};var num=v=>Number(v)||0;var hoyISO=()=>new Date().toLocaleDateString('en-CA',{timeZone:'America/Panama'});var ahoraHM=()=>new Date().toLocaleTimeString('es-PA',{timeZone:'America/Panama',hour:'2-digit',minute:'2-digit'});var recEmp_=()=>({});
function recPdfDe_(D, E){
  var J = window.jspdf && window.jspdf.jsPDF; if(!J) return null;
  E = E || recEmp_();
  var d = new J({ unit: "mm", format: "letter" }), W = 215.9, M = 18, X2 = W - M, y = 16;
  var NAVY = [20, 48, 107], GRIS = [94, 107, 126], LIN = [227, 232, 239], FON = [241, 244, 248];
  var col = function(c3){ d.setTextColor(c3[0], c3[1], c3[2]); };
  var txt = function(t, x, yy, o){ d.text(Array.isArray(t) ? t : String(t == null ? "" : t), x, yy, o || {}); };
  /* encabezado */
  if(RP.logo){ try{ d.addImage(RP.logo, "JPEG", M, y, 24, 23.7); }catch(e){} }
  var xT = RP.logo ? M + 28 : M;
  d.setFont("helvetica", "bold"); d.setFontSize(17); col(NAVY); txt(E.comercial, xT, y + 6);
  d.setFont("helvetica", "normal"); d.setFontSize(8.5); col(GRIS);
  txt("Recolección, transporte y disposición final de desechos hospitalarios", xT, y + 11);
  txt("RUC: " + E.ruc + " DV " + E.dv + " · Tel. " + E.telefono + " · " + E.correo, xT, y + 15);
  if(E.formulario) txt(E.formulario, xT, y + 19);
  d.setFont("helvetica", "bold"); d.setFontSize(7.5); col(GRIS); txt("COMPROBANTE OFICIAL", X2, y + 3, { align: "right" });
  d.setFontSize(15); col(NAVY); txt("Recibo de Visita", X2, y + 10, { align: "right" });
  d.setFontSize(13); var nr = String(D.recibo || "—"), wN = d.getTextWidth(nr) + 10;
  d.setFillColor(NAVY[0], NAVY[1], NAVY[2]); d.roundedRect(X2 - wN, y + 13, wN, 9, 2, 2, "F"); d.setTextColor(255, 255, 255); txt(nr, X2 - wN / 2, y + 19.3, { align: "center" });
  y += 28; d.setDrawColor(NAVY[0], NAVY[1], NAVY[2]); d.setLineWidth(1); d.line(M, y, X2, y);
  y += 6; d.setFillColor(245, 179, 1); d.rect(M, y - 3.5, 1.2, 5, "F");
  d.setFont("helvetica", "bold"); d.setFontSize(7.5); col(GRIS); txt("DESECHOS HOSPITALARIOS PELIGROSOS · DECRETO EJECUTIVO 111 DE 1999 · RESOLUCIÓN 1010 DE 2022", M + 4, y);
  var sec = function(t){ y += 7; d.setFillColor(FON[0], FON[1], FON[2]); d.roundedRect(M, y - 4.5, X2 - M, 7, 1.5, 1.5, "F"); d.setFont("helvetica", "bold"); d.setFontSize(9); col(NAVY); txt(t, M + 3, y); y += 5; };
  var cajas = function(a, b){ var w = (X2 - M - 4) / 2; [a, b].forEach(function(k, j){ var x = M + j * (w + 4);
      d.setDrawColor(LIN[0], LIN[1], LIN[2]); d.setLineWidth(0.3); d.roundedRect(x, y, w, 13, 1.5, 1.5, "S");
      d.setFont("helvetica", "bold"); d.setFontSize(6.8); col(GRIS); txt(k[0].toUpperCase(), x + 3, y + 4.5);
      d.setFontSize(10.5); col([17, 17, 17]); txt(d.splitTextToSize(String(k[1] || "—"), w - 6)[0], x + 3, y + 10); }); y += 15; };
  sec("1 · GENERADOR");
  cajas(["Establecimiento de salud", D.cliente], ["Contacto que atiende", D.contacto || "Enfermería / Personal Autorizado"]);
  sec("2 · DATOS DEL RETIRO");
  cajas(["Fecha de retiro", D.fecha], ["Horario (entrada / salida)", (D.horaInicio || "--:--") + " a " + (D.horaFinal || "--:--")]);
  cajas(["Vehículo asignado", D.vehiculo || "—"], ["Operador responsable", D.operador || ""]);
  sec("3 · DESECHOS RETIRADOS");
  var cx = [M, M + 62, X2 - 42, X2]; d.setFillColor(NAVY[0], NAVY[1], NAVY[2]); d.rect(M, y - 1, X2 - M, 7, "F");
  d.setFont("helvetica", "bold"); d.setFontSize(7.5); d.setTextColor(255, 255, 255);
  txt("CLASIFICACIÓN", cx[0] + 3, y + 3.6); txt("ENVASE", cx[1], y + 3.6); txt("CANTIDAD", cx[2] - 2, y + 3.6, { align: "right" }); txt("PESO (KG)", cx[3] - 3, y + 3.6, { align: "right" }); y += 6;
  var filas = [["Bioinfeccioso", "Bolsa roja", D.cantBolsas, D.kgBolsas, [192, 57, 43]], ["Anatomopatológico", "Bolsa roja rotulada", D.cantAnatomo, D.kgAnatomo, [142, 36, 170]], ["Punzocortante", "Recipiente rígido", D.cantPunzo, D.kgPunzo, [245, 179, 1]]]
    .filter(function(f){ return num(f[2]) > 0 || num(f[3]) > 0; });
  var tc = 0, tk = 0;
  filas.forEach(function(f){ y += 7; tc += num(f[2]); tk += num(f[3]);
    d.setFillColor(f[4][0], f[4][1], f[4][2]); d.rect(cx[0] + 3, y - 3, 3, 3, "F");
    d.setFont("helvetica", "normal"); d.setFontSize(9.5); col([17, 17, 17]); txt(f[0], cx[0] + 8, y); txt(f[1], cx[1], y); txt(num(f[2]), cx[2] - 2, y, { align: "right" });
    d.setFont("helvetica", "bold"); txt(num(f[3]).toFixed(2), cx[3] - 3, y, { align: "right" });
    d.setDrawColor(LIN[0], LIN[1], LIN[2]); d.setLineWidth(0.3); d.line(M, y + 2.5, X2, y + 2.5); });
  y += 4; d.setDrawColor(NAVY[0], NAVY[1], NAVY[2]); d.setLineWidth(0.6); d.line(M, y, X2, y);
  y += 6; d.setFillColor(FON[0], FON[1], FON[2]); d.rect(M, y - 4.5, X2 - M, 7.5, "F");
  d.setFont("helvetica", "bold"); d.setFontSize(10.5); col([17, 17, 17]); txt("TOTAL RETIRADO", M + 3, y); txt(tc, cx[2] - 2, y, { align: "right" }); txt(tk.toFixed(2), cx[3] - 3, y, { align: "right" });
  y += 8; var obs = d.splitTextToSize(D.obs || "Cuarto de desechos en condiciones adecuadas. Retiro sin incidencias.", X2 - M - 6);
  var hO = 9 + obs.length * 4.5; d.setDrawColor(LIN[0], LIN[1], LIN[2]); d.setLineWidth(0.3); d.roundedRect(M, y, X2 - M, hO, 1.5, 1.5, "S");
  d.setFont("helvetica", "bold"); d.setFontSize(6.8); col(GRIS); txt("OBSERVACIONES DEL RETIRO", M + 3, y + 4.5);
  d.setFont("helvetica", "italic"); d.setFontSize(10); col([17, 17, 17]); txt(obs, M + 3, y + 9.5); y += hO + 8;
  /* firmas */
  var w2 = (X2 - M - 14) / 2, xa = M, xb = M + w2 + 14, yF = y + 22;
  if(RP.firmaJpg){ try{ d.addImage(RP.firmaJpg, "JPEG", xa + w2 / 2 - 25, y, 50, 20); }catch(e){} }
  else { d.setFont("helvetica", "italic"); d.setFontSize(8); col(GRIS); txt("Sin firma registrada", xa + w2 / 2, y + 16, { align: "center" }); }
  d.setFont("helvetica", "bold"); d.setFontSize(11); col(NAVY); txt(D.operador || "", xb + w2 / 2, y + 16, { align: "center" });
  d.setDrawColor(51, 51, 51); d.setLineWidth(0.4); d.line(xa, yF, xa + w2, yF); d.line(xb, yF, xb + w2, yF);
  d.setFont("helvetica", "bold"); d.setFontSize(9); col([17, 17, 17]);
  txt(D.contacto || "________________", xa + w2 / 2, yF + 5, { align: "center" }); txt("Recibe --- " + E.comercial, xb + w2 / 2, yF + 5, { align: "center" });
  d.setFont("helvetica", "normal"); d.setFontSize(8.5); txt("Entrega · Generador", xa + w2 / 2, yF + 9.5, { align: "center" }); txt("Transportista Especializado", xb + w2 / 2, yF + 9.5, { align: "center" });
  y = yF + 17; d.setDrawColor(LIN[0], LIN[1], LIN[2]); d.setLineWidth(0.3); d.line(M, y, X2, y); y += 5;
  d.setFont("helvetica", "normal"); d.setFontSize(7.8); col(GRIS);
  txt(d.splitTextToSize("Declaración: El generador declara que los desechos entregados corresponden a las clasificaciones y pesos anotados, segregados conforme al Decreto Ejecutivo 111 de 23 de junio de 1999. " + E.comercial + " asume el transporte seguro hasta su tratamiento y disposición final en planta autorizada.", X2 - M), M, y);
  d.setFontSize(7.5); txt("Comprobante digital emitido el " + hoyISO() + " " + ahoraHM() + (D.clave ? " · consulta en línea con la clave " + D.clave : ""), M, 268);
  var nom = "Recibo_" + String(D.recibo || "").replace(/[^A-Za-z0-9-]/g, "") + "_" + String(D.cliente || "").replace(/[^A-Za-z0-9]+/g, "_").slice(0, 30) + ".pdf";
  return { blob: d.output("blob"), nombre: nom };
}

function jpg3102(src){return new Promise(function(ok,mal){var im=new Image();im.crossOrigin='anonymous';im.onload=function(){try{var c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;var x=c.getContext('2d');x.fillStyle='white';x.fillRect(0,0,c.width,c.height);x.drawImage(im,0,0);ok(c.toDataURL('image/jpeg',.9));}catch(e){mal(e);}};im.onerror=function(){mal(Error('No se pudo cargar la imagen del recibo.'));};im.src=src;});}
var fila3102=Promise.resolve();
w.RecibosPDF3102={crear:function(d,e){var trabajo=fila3102.catch(function(){}).then(async function(){
 if(!w.jspdf)throw Error('No se cargó la biblioteca PDF.');
 RP.firmaJpg='';if(!RP.logo)RP.logo=await jpg3102('logo3102.png');
 if(d.firma){if(!/^data:image\//.test(d.firma))throw Error('La firma tiene un formato no compatible.');RP.firmaJpg=await jpg3102(d.firma);}
 return recPdfDe_({recibo:d.recibo,cliente:d.cliente,contacto:d.firmante||d.contactoAtiende||d.contacto||'',fecha:d.fecha,horaInicio:d.horaInicio,horaFinal:d.horaFinal,vehiculo:d.vehiculo,operador:d.responsable,
 kgBolsas:d.kgBio,cantBolsas:d.cantBio,kgPunzo:d.kgPunzo,cantPunzo:d.cantPunzo,kgAnatomo:d.kgAnatomo,cantAnatomo:d.cantAnatomo,
 obs:(d.entregas&&d.entregas.length?'Se entregó en esta visita: '+d.entregas.map(x=>x.cantidad+' '+x.nombre).join(', ')+'. ':'')+(d.obs||'')+(d.correccion?' · Recibo corregido el '+(d.correccion.enTxt||d.correccion.en)+': '+d.correccion.motivo:''),clave:d.clave},e);
 });fila3102=trabajo;return trabajo;}};

})(window);