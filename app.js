const $ = id => document.getElementById(id);
const config = window.WEDDING;
const dialog = $('cinema');
const film = $('film');
const qualityBar = document.createElement('div');
qualityBar.className = 'video-quality';
qualityBar.innerHTML = '<label for="video-quality">Calidad del vídeo</label><select id="video-quality"><option value="high" selected>Alta calidad · 1440p</option><option value="compatible">Conexión lenta · 1080p</option></select><a id="original-video-link" target="_blank" rel="noopener">Abrir original ↗</a><span id="video-status" role="status" aria-live="polite"></span>';
$('video-wrap').append(qualityBar);
$('original-video-link').href = config.videoOriginalUrl;
let videoMode = 'high';
let hlsPlayer;
let loadedVideoUrl;
let opener;
let seen = false;
try { seen = localStorage.getItem('lj-invitation-seen') === 'yes'; } catch {}
function invitation() {
  document.title = 'Laia & Jonathan · 19 de junio de 2027';
  film.pause();
  if (dialog.open) dialog.close();
  document.body.classList.remove('modal-open');
  $('welcome').hidden = true;
  $('invitation').hidden = false;
  try { localStorage.setItem('lj-invitation-seen', 'yes'); } catch {}
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
  $('play-now').textContent = matchMedia('(max-width: 700px) and (orientation: portrait)').matches ? 'Ya está, ver la película ▶' : 'Ver la película ▶';
  dialog.showModal();
  document.body.classList.add('modal-open');
}
function closeCinema() {
  film.pause();
  dialog.close();
  document.body.classList.remove('modal-open');
  opener?.focus();
}
function play() {
  $('orientation').hidden = true;
  $('video-wrap').hidden = false;
  if (!config.videoReady || !config.videoUrl) {
    $('video-error').hidden = false;
    return;
  }
  const url = videoMode === 'compatible' ? config.videoFallbackUrl : config.videoUrl;
  if (loadedVideoUrl !== url) loadVideo(url);
  film.play().catch(() => { /* Native video controls allow another play attempt. */ });
}
function videoFailure() {
  $('video-error').textContent = videoMode === 'high'
    ? 'No se ha podido reproducir en 1440p. Puedes reintentar con el botón de reproducción, abrir el original o elegir 1080p.'
    : 'No se ha podido cargar el vídeo. Comprueba la conexión e inténtalo de nuevo.';
  $('video-error').hidden = false;
}
function loadVideo(url, position = 0, autoplay = false) {
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
$('start').addEventListener('click', cinema);
['replay-nav', 'replay-story'].forEach(id => $(id).addEventListener('click', cinema));
['play-now', 'vertical'].forEach(id => $(id).addEventListener('click', play));
['skip-intro', 'continue'].forEach(id => $(id).addEventListener('click', invitation));
$('close-cinema').addEventListener('click', closeCinema);
dialog.addEventListener('cancel', event => { event.preventDefault(); closeCinema(); });
film.addEventListener('ended', invitation);
film.addEventListener('error', videoFailure);
film.addEventListener('playing', () => { $('video-error').hidden = true; });
$('back-cover').addEventListener('click', () => {
  document.title = '¡Estáis invitados a una fiesta de cumpleaños!';
  $('invitation').hidden = true;
  $('welcome').hidden = false;
  window.scrollTo(0, 0);
  $('start').focus();
});
if (config.venue) $('venue-copy').textContent = config.venue;
if (config.schedule) $('schedule-copy').textContent = config.schedule;
for (const [key, id] of [['mapUrl', 'map-link'], ['rsvpUrl', 'rsvp-link']]) {
  if (config[key] && /^https?:\/\//i.test(config[key])) {
    $(id).href = config[key]; $(id).hidden = false;
    if (key === 'rsvpUrl') $('rsvp-copy').textContent = '¡Nos hará mucha ilusión teneros allí! Confirmad por WhatsApp e indicad vuestros nombres y cuántas personas vendréis.';
  }
}
if (seen) invitation();
