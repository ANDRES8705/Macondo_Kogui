// Visor de documentos de Apoyo a Talento Humano (usa PDF.js para que funcione también en celular)
(function(){
  const DOCS = window.DOCS_TH || [], PREF = window.DOCS_PREF || 'doc-';
  const $ = id => document.getElementById(id);
  const lienzo=$('visorLienzo'), titulo=$('visorTitulo'), pag=$('visorPag'),
        prev=$('visorPrev'), next=$('visorNext'), abrir=$('visorAbrir'), bajar=$('visorBajar');
  const lib = window.pdfjsLib;
  if (lib) lib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  let pdf=null, n=1, actual=-1, token=0;

  // Visor de PDF del propio navegador (respaldo si PDF.js no puede leer el archivo)
  function nativo(url,t){
    pdf=null; token++;
    const f=document.createElement('iframe'); f.src=url; f.title=t;
    lienzo.replaceChildren(f);
    pag.textContent='Usa los controles del visor'; prev.disabled=next.disabled=true;
  }
  function marcar(i){ document.querySelectorAll('.doc').forEach((b,k)=>b.classList.toggle('activo',k===i)); }

  async function pintar(){
    if(!pdf) return;
    const t=++token;
    const page=await pdf.getPage(n);
    const ancho=lienzo.clientWidth||600, dpr=Math.min(window.devicePixelRatio||1,2);
    const base=page.getViewport({scale:1}), alto=Math.max(320,window.innerHeight-(window.innerWidth>900?260:140));
    const esc=Math.min(ancho/base.width, alto/base.height);
    const vp=page.getViewport({scale:esc*dpr});
    const c=document.createElement('canvas'); c.width=vp.width; c.height=vp.height;
    c.style.width=(vp.width/dpr)+'px'; c.style.height=(vp.height/dpr)+'px';
    c.setAttribute('role','img'); c.setAttribute('aria-label',titulo.textContent+', página '+n);
    await page.render({canvasContext:c.getContext('2d'),viewport:vp}).promise;
    if(t!==token) return;
    lienzo.replaceChildren(c);
    pag.textContent='Página '+n+' de '+pdf.numPages;
    prev.disabled=n<=1; next.disabled=n>=pdf.numPages;
  }

  async function cargar(i, desplazar, conHash){
    if(i<0||i>=DOCS.length) return;
    const d=DOCS[i]; actual=i; marcar(i);
    const url=encodeURI(d.f);
    titulo.textContent=d.t; abrir.href=url; bajar.href=url;
    if(conHash) history.replaceState(null,'','#'+PREF+(i+1));
    if(desplazar && window.innerWidth<=900) document.getElementById('visor').scrollIntoView({behavior:'smooth',block:'start'});
    if(!lib || location.protocol==='file:'){ nativo(url,d.t); return; }
    lienzo.innerHTML='<p class="visor-msg">Cargando documento…</p>';
    prev.disabled=next.disabled=true; pag.textContent='—';
    try{ pdf=await lib.getDocument(url).promise; if(actual!==i) return; n=1; await pintar(); }
    catch(e){ if(actual===i) nativo(url,d.t); }
  }

  document.querySelectorAll('.doc').forEach(b=>b.addEventListener('click',()=>cargar(+b.dataset.doc-1,true,true)));
  prev.addEventListener('click',()=>{ if(n>1){n--;pintar();} });
  next.addEventListener('click',()=>{ if(pdf&&n<pdf.numPages){n++;pintar();} });
  document.addEventListener('keydown',e=>{
    if(e.target.closest('input,textarea,select')) return;
    if(e.key==='ArrowRight') next.click(); if(e.key==='ArrowLeft') prev.click();
  });
  let rt; window.addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(pintar,200);});
  function desdeHash(){ const m=location.hash.match(new RegExp(PREF+'(\\d+)')); return m? +m[1]-1 : 0; }
  window.addEventListener('hashchange',()=>{ const i=desdeHash(); if(i!==actual) cargar(i,true,false); });
  cargar(desdeHash(), false, false);
})();
