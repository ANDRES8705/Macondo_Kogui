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

  // ---------- Chatbot "Kogui" (preguntas frecuentes, funciona sin servidor) ----------
  (function(){
    const RESPUESTAS = [
      {id:'menu', chip:'Ver el menú', claves:['menu','postre','carta','mousse','cheesecake','tiramisu','torta','bebida','cafe','jugo','malteada','limonada','lulo','maracuya'],
       r:'Tenemos mousses (lulo, maracuyá, frutos rojos, café), tiramisú, cheesecakes, tortas y bebidas como café, limonadas, jugos y malteadas. <a href="menu.html">Ver el menú completo con video</a>.'},
      {id:'horario', chip:'Horario', claves:['horario','hora','abren','abierto','cierran','atienden','dias'],
       r:'Atendemos de lunes a sábado, de 9:00 a. m. a 7:00 p. m.'},
      {id:'ubicacion', chip:'¿Dónde están?', claves:['donde','ubicacion','direccion','candelaria','llegar','queda','local','punto'],
       r:'Estamos en La Candelaria, el centro histórico de Bogotá. <a href="ubicacion.html">Ver ubicación</a>.'},
      {id:'pqrs', chip:'Radicar una PQRS', claves:['pqrs','queja','reclamo','peticion','solicitud','sugerencia','felicitacion','problema'],
       r:'Puedes radicarla en nuestro <a href="pqrs.html">formulario de PQRS</a>. Respondemos peticiones y quejas en 5 días hábiles, reclamos en 10 y solicitudes en 3.'},
      {id:'empresa', chip:'Sobre la empresa', claves:['empresa','sas','sociedad','quienes','nosotros','mision','vision','valores'],
       r:'Somos Macondo Kogui S.A.S., una microempresa bogotana de postres tradicionales colombianos. <a href="empresa.html">Información de la empresa</a> · <a href="nosotros.html">Misión y visión</a>.'},
      {id:'dato', chip:'Dato curioso 🇨🇴', claves:['dato','curioso','colombia','sabias','historia'],
       r:null},
      {id:'trabajo', chip:'Trabaja con nosotros', claves:['trabajo','empleo','vacante','hoja de vida','contratar','trabajar'],
       r:'Publicamos las vacantes en nuestras redes. Conoce el proceso en <a href="talento-humano.html">Apoyo a Talento Humano</a>.'}
    ];
    const DATOS = [
      'El nombre Macondo viene del pueblo imaginario de "Cien años de soledad", la novela de Gabriel García Márquez.',
      'Los kogui son un pueblo indígena que vive en la Sierra Nevada de Santa Marta y la considera el corazón del mundo.',
      'Colombia es uno de los países con más especies de aves del mundo.',
      'El lulo es una fruta originaria de los Andes, y en Colombia es protagonista de jugos y postres.',
      'El café colombiano se cultiva en las montañas andinas y es reconocido en todo el mundo por su suavidad.',
      'La Sierra Nevada de Santa Marta es la montaña costera más alta del mundo.'
    ];
    const sinTildes = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');

    const btn=document.createElement('button');
    btn.className='chat-fab'; btn.type='button'; btn.setAttribute('aria-label','Abrir chat de ayuda'); btn.setAttribute('aria-expanded','false');
    btn.innerHTML='<span aria-hidden="true">💬</span><b>¿Preguntas?</b>';
    const box=document.createElement('section');
    box.className='chat'; box.setAttribute('aria-label','Chat de ayuda Macondo Kogui'); box.hidden=true;
    box.innerHTML='<header class="chat-head"><img src="img/logo.png" alt=""><div><b>Kogui</b><small>Asistente de Macondo Kogui</small></div><button type="button" class="chat-x" aria-label="Cerrar chat">×</button></header>'+
      '<div class="chat-log" role="log" aria-live="polite"></div><div class="chat-chips"></div>'+
      '<form class="chat-form"><input name="q" autocomplete="off" placeholder="Escribe tu pregunta…" aria-label="Escribe tu pregunta"><button class="btn" type="submit">Enviar</button></form>';
    document.body.append(btn,box);
    const log=box.querySelector('.chat-log'), chips=box.querySelector('.chat-chips'), f=box.querySelector('.chat-form');

    function msg(html,quien){const d=document.createElement('div');d.className='m '+quien;d.innerHTML=html;log.appendChild(d);log.scrollTop=log.scrollHeight;}
    function responder(item){ msg(item.id==='dato' ? '¿Sabías que…? '+DATOS[Math.floor(Math.random()*DATOS.length)] : item.r,'bot'); }
    function buscar(texto){
      const t=sinTildes(texto);
      if(/^(hola|buen|hey|saludos)/.test(t)) return msg('¡Hola! ¿En qué te ayudo? Puedes elegir una opción o escribirme.','bot');
      if(/gracias/.test(t)) return msg('¡Con gusto! Que disfrutes tu postre.','bot');
      let mejor=null,puntos=0;
      RESPUESTAS.forEach(it=>{const p=it.claves.filter(k=>t.includes(k)).length; if(p>puntos){puntos=p;mejor=it;}});
      mejor ? responder(mejor) : msg('No tengo esa respuesta todavía. Prueba con una de las opciones, o déjanos tu pregunta en el <a href="pqrs.html">formulario de PQRS</a>.','bot');
    }
    RESPUESTAS.forEach(it=>{const c=document.createElement('button');c.type='button';c.textContent=it.chip;c.onclick=()=>{msg(it.chip,'yo');responder(it);};chips.appendChild(c);});
    f.addEventListener('submit',e=>{e.preventDefault();const q=f.q.value.trim();if(!q)return;msg(q.replace(/</g,'&lt;'),'yo');f.q.value='';setTimeout(()=>buscar(q),250);});

    let saludado=false;
    function abrir(){box.hidden=false;btn.setAttribute('aria-expanded','true');btn.classList.add('off');
      if(!saludado){msg('¡Hola! Soy Kogui 🐆. Te ayudo con el menú, horarios, ubicación o PQRS. ¿Qué necesitas?','bot');saludado=true;}
      f.q.focus();}
    function cerrar(){box.hidden=true;btn.setAttribute('aria-expanded','false');btn.classList.remove('off');btn.focus();}
    btn.addEventListener('click',abrir);
    box.querySelector('.chat-x').addEventListener('click',cerrar);
    box.addEventListener('keydown',e=>{if(e.key==='Escape')cerrar();});
    document.querySelectorAll('[data-open-chat]').forEach(b=>b.addEventListener('click',abrir));
  })();
