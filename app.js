// Lucide v1.66.0 · ISC license in vendor/LUCIDE-LICENSE.txt.
const ICON_PATHS = {"play":"<path d=\"M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z\" />","arrow-up-right":"<path d=\"M7 7h10v10\" /> <path d=\"M7 17 17 7\" />","arrow-right":"<path d=\"M5 12h14\" /> <path d=\"m12 5 7 7-7 7\" />","arrow-down":"<path d=\"M12 5v14\" /> <path d=\"m19 12-7 7-7-7\" />","arrow-up":"<path d=\"m5 12 7-7 7 7\" /> <path d=\"M12 19V5\" />","volume-2":"<path d=\"M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z\" /> <path d=\"M16 9a5 5 0 0 1 0 6\" /> <path d=\"M19.364 18.364a9 9 0 0 0 0-12.728\" />","x":"<path d=\"M18 6 6 18\" /> <path d=\"m6 6 12 12\" />","rotate-ccw":"<path d=\"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8\" /> <path d=\"M3 3v5h5\" />","smartphone":"<rect width=\"14\" height=\"20\" x=\"5\" y=\"2\" rx=\"2\" ry=\"2\" /> <path d=\"M12 18h.01\" />","maximize":"<path d=\"M8 3H5a2 2 0 0 0-2 2v3\" /> <path d=\"M21 8V5a2 2 0 0 0-2-2h-3\" /> <path d=\"M3 16v3a2 2 0 0 0 2 2h3\" /> <path d=\"M16 21h3a2 2 0 0 0 2-2v-3\" />","calendar-days":"<path d=\"M8 2v3\" /> <path d=\"M16 2v3\" /> <rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" /> <path d=\"M3 9h18\" /> <path d=\"M8 13h.01\" /> <path d=\"M12 13h.01\" /> <path d=\"M16 13h.01\" /> <path d=\"M8 17h.01\" /> <path d=\"M12 17h.01\" /> <path d=\"M16 17h.01\" />","map-pin":"<path d=\"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0\" /> <circle cx=\"12\" cy=\"10\" r=\"3\" />","message-circle":"<path d=\"M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719\" />"};
function icon(name) { return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon icon-${name}" aria-hidden="true" focusable="false">${ICON_PATHS[name]}</svg>`; }
const $ = id => document.getElementById(id);
const config = window.WEDDING;
const dialog = $('cinema');
const film = $('film');
const qualityBar = document.createElement('div');
qualityBar.className = 'video-quality';
qualityBar.innerHTML = `<label for="video-quality">Calidad del vídeo</label><select id="video-quality"><option value="high" selected>Alta calidad · 1440p</option><option value="compatible">Conexión lenta · 1080p</option></select><button id="fullscreen-video" class="fullscreen-button" type="button">${icon('maximize')}<span>Pantalla completa</span></button><a id="original-video-link" target="_blank" rel="noopener"><span>Abrir original</span>${icon('arrow-up-right')}</a><span id="video-status" role="status" aria-live="polite"></span>`;
$('video-wrap').append(qualityBar);
$('original-video-link').href = config.videoOriginalUrl;
let videoMode = 'high';
let hlsPlayer;
let loadedVideoUrl;
let videoPreparationFailed = false;
let opener;
function invitation() {
  document.title = 'Laia & Jonathan · 19 de junio de 2027';
  film.pause();
  exitFilmFullscreen();
  if (dialog.open) dialog.close();
  document.body.classList.remove('modal-open');
  $('welcome').hidden = true;
  $('invitation').hidden = false;
  window.scrollTo(0, 0);
}
function cinema(event) {
  opener = event?.currentTarget;
  film.pause();
  film.currentTime = 0;
  $('orientation').hidden = false;
  $('video-wrap').hidden = true;
  $('video-error').hidden = true;
  $('vertical').hidden = !matchMedia('(max-width: 700px) and (orientation: portrait)').matches;
  $('orientation-note').textContent = 'Mejor en horizontal y con el sonido activado.';
  dialog.showModal();
  document.body.classList.add('modal-open');
  const url = videoMode === 'compatible' ? config.videoFallbackUrl : config.videoUrl;
  if (config.videoReady && loadedVideoUrl !== url) loadVideo(url);
  else setPlayLoading(film.readyState < 1 && !videoPreparationFailed);
}
function closeCinema() {
  film.pause();
  exitFilmFullscreen();
  dialog.close();
  document.body.classList.remove('modal-open');
  opener?.focus();
}
function play() {
  if (!config.videoReady || !config.videoUrl) {
    $('orientation').hidden = true;
    $('video-wrap').hidden = false;
    $('video-error').hidden = false;
    return;
  }
  const url = videoMode === 'compatible' ? config.videoFallbackUrl : config.videoUrl;
  // Prepare metadata before the second tap: iPhone fullscreen needs both
  // a ready video and the original user gesture (not a later load callback).
  if (loadedVideoUrl !== url || film.readyState < 1) { loadVideo(url); return; }
  $('orientation').hidden = true;
  $('video-wrap').hidden = false;
  film.play().catch(() => { /* Native video controls allow another play attempt. */ });
  enterFilmFullscreen();
}
function setPlayLoading(loading) {
  $('play-now').disabled = loading;
  $('play-now').setAttribute('aria-busy', String(loading));
  $('play-now').querySelector('.play-now-label').textContent = loading
    ? 'Preparando el corto…' : videoPreparationFailed ? 'Reintentar' : 'Ver corto';
}
function fullscreenHint() {
  $('video-status').textContent = 'Si no se amplía, usa el control de pantalla completa del vídeo o abre el enlace en Safari o Chrome.';
}
function enterFilmFullscreen() {
  if (document.fullscreenElement === film || film.webkitDisplayingFullscreen) return;
  film.dataset.fullscreenRequest = 'pending';
  const enterNative = film.webkitEnterFullscreen || film.webkitEnterFullScreen;
  if (enterNative && film.webkitSupportsFullscreen !== false) {
    try { film.dataset.fullscreenMethod = 'native'; enterNative.call(film); return; } catch { /* Try the standard API next. */ }
  }
  const enter = film.requestFullscreen || film.webkitRequestFullscreen;
  if (enter) {
    try {
      film.dataset.fullscreenMethod = 'standard';
      Promise.resolve(enter.call(film)).then(() => { film.dataset.fullscreenRequest = 'accepted'; }).catch(() => {
        film.dataset.fullscreenRequest = 'blocked'; fullscreenHint();
      });
      return;
    } catch {}
  }
  film.dataset.fullscreenRequest = 'unsupported';
  fullscreenHint();
}
function exitFilmFullscreen() {
  if (film.webkitDisplayingFullscreen) {
    try { (film.webkitExitFullscreen || film.webkitExitFullScreen)?.call(film); } catch {}
  }
  if (document.fullscreenElement === film) document.exitFullscreen?.().catch(() => {});
  else if (document.webkitFullscreenElement === film) {
    try { document.webkitExitFullscreen?.(); } catch {}
  }
}
function videoFailure() {
  videoPreparationFailed = true;
  loadedVideoUrl = undefined;
  setPlayLoading(false);
  $('orientation-note').textContent = 'No se ha podido preparar el corto. Comprueba la conexión y pulsa Reintentar.';
  $('video-error').textContent = videoMode === 'high'
    ? 'No se ha podido reproducir en 1440p. Puedes reintentar con el botón de reproducción, abrir el original o elegir 1080p.'
    : 'No se ha podido cargar el vídeo. Comprueba la conexión e inténtalo de nuevo.';
  $('video-error').hidden = false;
}
function loadVideo(url, position = 0, autoplay = false) {
  videoPreparationFailed = false;
  setPlayLoading(true);
  hlsPlayer?.destroy();
  hlsPlayer = undefined;
  loadedVideoUrl = url;
  film.onloadedmetadata = () => {
    if (Number.isFinite(film.duration)) film.currentTime = Math.min(position, Math.max(0, film.duration - .1));
    film.onloadedmetadata = null;
    if (autoplay && dialog.open) film.play().catch(() => {});
  };
  if (/\.m3u8(?:\?|$)/i.test(url) && !film.canPlayType('application/vnd.apple.mpegurl')) {
    if (!window.Hls?.isSupported()) { videoFailure(); return; }
    hlsPlayer = new Hls({ enableWorker: false, maxBufferLength: 20 });
    hlsPlayer.loadSource(url);
    hlsPlayer.attachMedia(film);
    hlsPlayer.on(Hls.Events.ERROR, (_event, data) => { if (data.fatal) videoFailure(); });
  } else {
    film.src = url;
    film.load();
  }
}
function switchVersion(mode) {
  const position = Number.isFinite(film.currentTime) ? film.currentTime : 0;
  const wasPlaying = !film.paused;
  videoMode = mode;
  $('video-quality').value = mode;
  $('video-error').hidden = true;
  loadVideo(mode === 'compatible' ? config.videoFallbackUrl : config.videoUrl, position, wasPlaying);
  if (wasPlaying && dialog.open) film.play().catch(() => {});
}
$('video-quality').addEventListener('change', event => {
  $('video-status').textContent = '';
  switchVersion(event.target.value);
});
$('fullscreen-video').addEventListener('click', enterFilmFullscreen);
film.addEventListener('loadedmetadata', () => setPlayLoading(false));
film.addEventListener('webkitbeginfullscreen', () => {
  film.dataset.fullscreenRequest = 'accepted';
  film.dataset.fullscreenEntered = 'true';
  $('video-status').textContent = '';
});
document.addEventListener('fullscreenchange', () => {
  if (document.fullscreenElement === film) {
    film.dataset.fullscreenEntered = 'true';
    $('video-status').textContent = '';
  }
});
window.addEventListener('resize', () => {
  $('vertical').hidden = !matchMedia('(max-width: 700px) and (orientation: portrait)').matches;
});
$('start').addEventListener('click', cinema);
['replay-nav', 'replay-story'].forEach(id => $(id).addEventListener('click', cinema));
['play-now', 'vertical'].forEach(id => $(id).addEventListener('click', play));
['skip-intro', 'continue'].forEach(id => $(id).addEventListener('click', invitation));
$('close-cinema').addEventListener('click', closeCinema);
dialog.addEventListener('cancel', event => { event.preventDefault(); closeCinema(); });
film.addEventListener('ended', invitation);
film.addEventListener('error', videoFailure);
film.addEventListener('playing', () => { $('video-error').hidden = true; });
function resetWelcome() {
  film.pause();
  film.currentTime = 0;
  exitFilmFullscreen();
  if (dialog.open) dialog.close();
  document.body.classList.remove('modal-open');
  document.title = 'Estáis invitados a mi fiesta de cumpleaños';
  $('invitation').hidden = true;
  $('welcome').hidden = false;
  if (location.hash) history.replaceState(history.state, '', location.pathname + location.search);
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
}
$('back-cover').addEventListener('click', () => {
  resetWelcome();
  $('start').focus();
});
// A restored page must keep the surprise, even when returned from the browser cache.
window.addEventListener('pageshow', event => {
  if (event.persisted) resetWelcome();
});
if (config.venue) $('venue-copy').textContent = config.venue;
for (const [key, id] of [['mapUrl', 'map-link'], ['rsvpUrl', 'rsvp-link']]) {
  if (config[key] && /^https?:\/\//i.test(config[key])) {
    $(id).href = config[key]; $(id).hidden = false;
    if (key === 'rsvpUrl') $('rsvp-copy').textContent = '¡Nos hará mucha ilusión teneros allí! Confirmad por WhatsApp e indicad vuestros nombres.';
  }
}
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
resetWelcome();
