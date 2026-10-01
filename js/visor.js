// Visor de documentos PDF (Talento Humano, Servicio al cliente, Operar herramientas, Glosario).
// Publicado en internet usa PDF.js: muestra todas las páginas una debajo de otra y las va
// dibujando a medida que se desplazan (funciona también en celular).
// Abierto en local (file://) o si PDF.js falla, usa el visor de PDF del propio navegador.
(function(){
  const DOCS = window.DOCS_TH || [], PREF = window.DOCS_PREF || 'doc-';
  const $ = id => document.getElementById(id);
  const lienzo=$('visorLienzo'), titulo=$('visorTitulo'), abrir=$('visorAbrir'), bajar=$('visorBajar');
  const lib = window.pdfjsLib;
  if (lib) lib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  let actual=-1, token=0, observador=null;

  function marcar(i){ document.querySelectorAll('.doc').forEach((b,k)=>b.classList.toggle('activo',k===i)); }

  function nativo(url,t){
    token++; if(observador) observador.disconnect();
    const f=document.createElement('iframe'); f.src=url; f.title=t;
    lienzo.classList.remove('paginas'); lienzo.replaceChildren(f);
  }

  async function mostrarPaginas(pdf, t){
    lienzo.classList.add('paginas'); lienzo.replaceChildren();
    const ancho=Math.max(280, lienzo.clientWidth-24), dpr=Math.min(window.devicePixelRatio||1,2);
    const p1=await pdf.getPage(1); if(t!==token) return;
    const base=p1.getViewport({scale:1}), proporcion=base.height/base.width;
    const huecos=[];
    for(let n=1;n<=pdf.numPages;n++){
      const h=document.createElement('div'); h.className='pag'; h.dataset.n=n;
      h.style.width=ancho+'px'; h.style.height=Math.round(ancho*proporcion)+'px';
      h.setAttribute('aria-label',titulo.textContent+', página '+n+' de '+pdf.numPages);
      lienzo.appendChild(h); huecos.push(h);
    }
    async function dibujar(h){
      if(h.dataset.ok) return; h.dataset.ok='1';
      const page=await pdf.getPage(+h.dataset.n); if(t!==token) return;
      const vp0=page.getViewport({scale:1}), esc=ancho/vp0.width, vp=page.getViewport({scale:esc*dpr});
      const c=document.createElement('canvas'); c.width=vp.width; c.height=vp.height;
      c.style.width=ancho+'px'; c.style.height=(vp.height/dpr)+'px';
      await page.render({canvasContext:c.getContext('2d'),viewport:vp}).promise;
      if(t!==token) return;
      h.style.height='auto'; h.replaceChildren(c);
    }
    if(observador) observador.disconnect();
    observador=new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ dibujar(e.target); observador.unobserve(e.target);} }),{root:lienzo,rootMargin:'600px 0px'});
    huecos.forEach(h=>observador.observe(h));
    lienzo.scrollTop=0;
  }

  async function cargar(i, desplazar, conHash){
    if(i<0||i>=DOCS.length) return;
    const d=DOCS[i]; actual=i; marcar(i);
    const url=encodeURI(d.f);
    titulo.textContent=d.t; abrir.href=url; bajar.href=url;
    if(conHash) history.replaceState(null,'','#'+PREF+(i+1));
    if(desplazar && window.innerWidth<=900) $('visor').scrollIntoView({behavior:'smooth',block:'start'});
    if(!lib || location.protocol==='file:'){ nativo(url,d.t); return; }
    const t=++token;
    lienzo.classList.remove('paginas');
    lienzo.innerHTML='<p class="visor-msg">Cargando documento…</p>';
    try{ const pdf=await lib.getDocument(url).promise; if(t!==token) return; await mostrarPaginas(pdf,t); }
    catch(e){ if(t===token) nativo(url,d.t); }
  }

  document.querySelectorAll('.doc').forEach(b=>b.addEventListener('click',()=>cargar(+b.dataset.doc-1,true,true)));
  function desdeHash(){ const m=location.hash.match(new RegExp(PREF+'(\\d+)')); return m? +m[1]-1 : 0; }
  window.addEventListener('hashchange',()=>{ const i=desdeHash(); if(i!==actual) cargar(i,true,false); });
  let rt, ancho0=window.innerWidth;
  window.addEventListener('resize',()=>{ clearTimeout(rt); rt=setTimeout(()=>{ if(Math.abs(window.innerWidth-ancho0)>80 && actual>=0){ ancho0=window.innerWidth; cargar(actual,false,false);} },300); });
  cargar(desdeHash(), false, false);
})();
