// Sonido de bienvenida: reproduce los primeros 4 segundos de soundindex.mp3 al cargar el inicio.
// Los navegadores bloquean el audio automático hasta que la persona interactúa con la página;
// si eso pasa, suena con el primer clic, toque o tecla.
(function(){
  const DURACION = 4; // segundos
  const audio = new Audio('soundindex.mp3');
  audio.preload = 'auto';
  let listo = false;

  function detener(){ audio.pause(); audio.currentTime = 0; }
  audio.addEventListener('timeupdate', () => { if (audio.currentTime >= DURACION) detener(); });

  function quitarEscuchas(){ ['pointerdown','keydown','touchstart'].forEach(ev => document.removeEventListener(ev, alInteractuar)); }
  function reproducir(){
    if (listo) return Promise.resolve();
    audio.currentTime = 0;
    return audio.play().then(() => {
      listo = true; quitarEscuchas();
      setTimeout(detener, DURACION * 1000 + 150); // respaldo por si no llega timeupdate
    });
  }
  function alInteractuar(){ reproducir().catch(() => {}); }

  reproducir().catch(() => {
    ['pointerdown','keydown','touchstart'].forEach(ev => document.addEventListener(ev, alInteractuar));
  });
})();
