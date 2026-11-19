(function(w){var esc=w.Portal3102Common.esc;var esEscritorio_=function(){return true;};
function caF_(v, d){ return Number(v || 0).toLocaleString("en-US", { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); }
function caNice_(m){ if(!(m > 0)) return 10; var p = Math.pow(10, Math.floor(Math.log10(m))) / 2; return Math.ceil(m / (p * 4)) * p * 4; }
function caW_(w){ try{ return esEscritorio_() ? w : Math.min(w, 440); }catch(e){ return w; } }
function caEjes_(w, h, pl, pr, pt, pb, mx, fmt){ var g = ""; for(var k = 0; k <= 4; k++){ var v = mx * k / 4, y = pt + (1 - k / 4) * (h - pt - pb); g += '<line x1="' + pl + '" x2="' + (w - pr) + '" y1="' + y + '" y2="' + y + '" style="stroke:var(--tm-linea2,#eef1f5)"/><text class="ca-txt" x="' + (pl - 8) + '" y="' + (y + 4) + '" text-anchor="end">' + (fmt ? fmt(v) : caF_(v)) + '</text>'; } return g; }
function caCurvas_(w, h, A, B, nomA, nomB){ w = caW_(w);
  var pl = 50, pr = 120, pt = 16, pb = 24, todos = A.concat(B), mx = caNice_(Math.max.apply(null, todos.map(function(p){ return p[1]; }).concat([1])) * 1.08);
  var X = function(d){ return pl + (d - 1) / Math.max(1, Math.max(A.length, B.length) - 1) * (w - pl - pr); }, Y = function(v){ return pt + (1 - v / mx) * (h - pt - pb); };
  var path = function(P){ return P.map(function(p, i){ return (i ? "L" : "M") + X(p[0]).toFixed(1) + " " + Y(p[1]).toFixed(1); }).join(" "); };
  var g = '<svg viewBox="0 0 ' + w + ' ' + h + '" width="100%" style="display:block;overflow:visible">' + caEjes_(w, h, pl, pr, pt, pb, mx);
  Array.from(new Set([1, Math.round(Math.max(A.length,B.length)/4),Math.round(Math.max(A.length,B.length)/2),Math.round(Math.max(A.length,B.length)*3/4),Math.max(A.length,B.length)])).forEach(function(d){ g += '<text class="ca-txt" x="' + X(d) + '" y="' + (h - 6) + '" text-anchor="middle">día ' + d + '</text>'; });
  if(B.length) g += '<path class="ln" style="--L:2000;stroke:var(--tm-verde-marca,#8fd46a);fill:none;stroke-width:2.2" d="' + path(B) + '"/>';
  if(A.length){ var u = A[A.length - 1];
    g += '<path class="fd" style="fill:var(--tm-ok,#2f9e44);fill-opacity:.13" d="' + path(A) + ' L' + X(u[0]) + ' ' + Y(0) + ' L' + X(1) + ' ' + Y(0) + ' Z"/>';
    g += '<path class="ln" style="--L:2000;stroke:var(--tm-navy2,#14306b);fill:none;stroke-width:2.8;stroke-linejoin:round;filter:drop-shadow(0 3px 4px rgba(20,48,107,.18))" d="' + path(A) + '"/>';
    g += '<line x1="' + X(u[0]) + '" x2="' + X(u[0]) + '" y1="' + pt + '" y2="' + (h - pb) + '" style="stroke:var(--tm-navy2,#14306b);stroke-dasharray:3 3;stroke-opacity:.35"/>';
    A.forEach(function(p){ g += '<rect x="' + (X(p[0]) - 9) + '" y="' + pt + '" width="18" height="' + (h - pt - pb) + '" style="fill:transparent" data-tip="' + esc(nomA + " · día " + p[0] + " · " + caF_(p[1]) + " kg") + '"/>'; });
    var lab = [[Y(u[1]), nomA + " · " + caF_(u[1]), "var(--tm-navy2,#14306b)"]];
    if(B.length){ var bb = B[Math.min(B.length, u[0]) - 1] || B[B.length - 1]; lab.push([Y(B[B.length - 1][1]), nomB + " · " + caF_(B[B.length - 1][1]), "var(--tm-gris,#667489)"]); g += '<circle class="fd" cx="' + X(bb[0]) + '" cy="' + Y(bb[1]) + '" r="4" style="fill:var(--tm-verde-marca,#8fd46a);stroke:var(--tm-tarjeta,#fff);stroke-width:2" data-tip="' + esc(nomB + " al día " + bb[0] + " · " + caF_(bb[1]) + " kg") + '"/>'; }
    g += '<circle class="fd" cx="' + X(u[0]) + '" cy="' + Y(u[1]) + '" r="5.5" style="fill:var(--tm-navy2,#14306b);stroke:var(--tm-tarjeta,#fff);stroke-width:2"/>';
    lab.sort(function(a, b){ return a[0] - b[0]; }); var ult = -99; lab.forEach(function(l){ var y = Math.max(l[0], ult + 16); ult = y; g += '<text class="fd ca-val" x="' + (w - pr + 12) + '" y="' + (y + 4) + '" style="fill:' + l[2] + '">' + esc(l[1]) + '</text>'; });
  }
  return g + '</svg>';
}

w.Portal3102Grafico={render:function(A,B,a,b){return caCurvas_(820,210,A,B,a,b);}};})(window);