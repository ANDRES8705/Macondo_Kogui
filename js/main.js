// Drawer
  const body=document.body, burger=document.getElementById('openMenu');
  function openMenu(){body.classList.add('menu-open');burger.setAttribute('aria-expanded','true')}
  function closeMenu(){body.classList.remove('menu-open');burger.setAttribute('aria-expanded','false')}
  burger.addEventListener('click',openMenu);
  document.getElementById('closeMenu').addEventListener('click',closeMenu);
  document.getElementById('scrim').addEventListener('click',closeMenu);
  document.querySelectorAll('#drawer a').forEach(a=>a.addEventListener('click',closeMenu));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});

  // Dropdowns (click for touch / keyboard)
  document.querySelectorAll('nav.main button').forEach(b=>{
    b.addEventListener('click',()=>{
      const open=b.getAttribute('aria-expanded')==='true';
      document.querySelectorAll('nav.main button').forEach(x=>{x.setAttribute('aria-expanded','false');x.nextElementSibling.classList.remove('open')});
      if(!open){b.setAttribute('aria-expanded','true');b.nextElementSibling.classList.add('open')}
    });
  });
  document.addEventListener('click',e=>{if(!e.target.closest('nav.main'))document.querySelectorAll('nav.main .dd').forEach(d=>d.classList.remove('open'))});

  // PQRS form (demo: genera número de radicado, no envía datos)
  const form=document.getElementById('pqrsForm'), ok=document.getElementById('pqrsOk');
  if(form) form.addEventListener('submit',e=>{
    e.preventDefault();
    if(!form.checkValidity()){form.reportValidity();return}
    const d=new FormData(form), tipo=d.get('tipo');
    const dias={'Petición':5,'Queja':5,'Reclamo':10,'Solicitud':3,'Sugerencia':5,'Felicitación':5}[tipo]||5;
    const rad='MK-'+new Date().toISOString().slice(0,10).replace(/-/g,'')+'-'+Math.floor(1000+Math.random()*9000);
    ok.textContent=`¡Gracias, ${d.get('nombre')}! Tu ${tipo.toLowerCase()} quedó registrada con el radicado ${rad}. Te responderemos en máximo ${dias} días hábiles al correo ${d.get('correo')}.`;
    ok.classList.add('show'); form.reset(); ok.scrollIntoView({block:'nearest'});
  });
