/* 3.104: barra e iconos existentes de documentos ECOVSA. */
(function(){
 const barra=document.querySelector('.no-imprimir');if(!barra)return;
 barra.classList.add('barra','doc-barra');
 barra.innerHTML='<div class="db-marca"><img src="ecovsa-letras.png" alt="ECOVSA"></div><div class="ti">Reporte de recolecciones</div><button class="sec" onclick="window.close()" aria-label="Volver a recibos">'+DOCE.ic('atras')+'<span class="db-tx-l">Volver a recibos</span></button><button class="db-pdf" id="r104-imprimir" onclick="window.print()" aria-label="Imprimir o guardar en PDF" title="Imprimir o guardar en PDF">'+DOCE.ic('pdf')+'<span class="r104-p-l">Imprimir / Guardar PDF</span><span class="r104-p-c">Imprimir / PDF</span></button>';
 const s=document.createElement('style');s.textContent='.doc-barra #r104-imprimir .r104-p-c{display:none!important}@media(max-width:640px){.doc-barra #r104-imprimir .r104-p-l{display:none!important}.doc-barra #r104-imprimir .r104-p-c{display:inline!important;font-size:13px!important}.doc-barra #r104-imprimir>span::after{content:none!important}}';document.head.appendChild(s);
})();
