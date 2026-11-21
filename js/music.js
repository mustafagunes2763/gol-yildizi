// Ana menü müziği.
// 1) "Gol Yıldızı teması": WebAudio ile anlık üretilen, oyuna özel samba-pop döngüsü (dosya yok).
// 2) "Kendi müziğin": oyuncunun kendi telefonundan seçtiği ses dosyası. Sadece bu cihazda (IndexedDB) saklanır, hiçbir yere yüklenmez.
const KEY = 'golyildizi.music';
let cfg = { on: true, vol: 0.6, src: 'theme', name: '' };
try { Object.assign(cfg, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch { /* yoksay */ }
cfg.on = false;   // oyun her açıldığında müzik kapalı başlar; Ayarlar'dan açılır
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cfg)); } catch { /* yoksay */ } };

export const MENU_SCREENS = new Set(['start', 'create', 'hub', 'settings']);
let unlocked = false, wantPlay = false, playing = false;
let ac = null, out = null, timer = null, nextT = 0, step = 0;
let audioEl = null, customUrl = null;

export const settings = () => ({ ...cfg });

// ------------------------------------------------------------ IndexedDB (kendi müziğin)
function db() {
  return new Promise((res, rej) => {
    const r = indexedDB.open('golyildizi-music', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('files');
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
}
async function idb(mode, fn) { const d = await db(); return new Promise((res, rej) => { const tx = d.transaction('files', mode); const q = fn(tx.objectStore('files')); tx.oncomplete = () => res(q?.result); tx.onerror = () => rej(tx.error); }); }
export async function setCustom(file) {
  await idb('readwrite', (s) => s.put(file, 'menu'));
  cfg.src = 'custom'; cfg.name = file.name.replace(/\.[^.]+$/, '').slice(0, 60); save();
  if (customUrl) URL.revokeObjectURL(customUrl); customUrl = null;
  restart();
}
export async function clearCustom() {
  try { await idb('readwrite', (s) => s.delete('menu')); } catch { /* yoksay */ }
  cfg.src = 'theme'; cfg.name = ''; save();
  if (customUrl) URL.revokeObjectURL(customUrl); customUrl = null;
  restart();
}
async function customAudio() {
  if (!customUrl) {
    const blob = await idb('readonly', (s) => s.get('menu')).catch(() => null);
    if (!blob) { cfg.src = 'theme'; save(); return null; }
    customUrl = URL.createObjectURL(blob);
  }
  if (!audioEl) { audioEl = new Audio(); audioEl.loop = true; }
  if (audioEl.src !== customUrl) audioEl.src = customUrl;
  audioEl.volume = cfg.vol;
  return audioEl;
}

// ------------------------------------------------------------ tema (sentez)
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
const CHORDS = [[45, [57, 60, 64]], [41, [57, 60, 65]], [48, [55, 60, 64]], [43, [55, 59, 62]]];   // Am F C G
const _ = null;
const MELODY = [
  [76, _, 74, 72, _, 72, 74, _, 76, _, 79, _, 76, 74, 72, _],
  [72, _, _, 69, _, 72, _, 74, 72, _, 69, _, 67, _, _, _],
  [67, _, 72, _, 74, _, 76, _, 79, _, 76, 74, 76, _, _, _],
  [74, _, 71, _, 74, _, 79, _, 77, 76, 74, _, 71, _, 74, _],
];
const BASS = [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0];   // senkoplu samba basları
const BPM = 118, S16 = 60 / BPM / 4;
let noise = null;

function ensureCtx() {
  if (ac) return ac;
  ac = new (window.AudioContext || window.webkitAudioContext)();
  const comp = ac.createDynamicsCompressor();
  out = ac.createGain(); out.gain.value = 0;
  out.connect(comp); comp.connect(ac.destination);
  const b = ac.createBuffer(1, ac.sampleRate, ac.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  noise = b;
  return ac;
}
function env(g, t, a, peak, dec) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec); }
function tone(type, f, t, peak, dec, cutoff = 4000, detune = 0) {
  const o = ac.createOscillator(), g = ac.createGain(), lp = ac.createBiquadFilter();
  o.type = type; o.frequency.value = f; o.detune.value = detune;
  lp.type = 'lowpass'; lp.frequency.value = cutoff;
  o.connect(lp); lp.connect(g); g.connect(out);
  env(g, t, 0.008, peak, dec); o.start(t); o.stop(t + dec + 0.05);
}
function hit(t, filt, f, peak, dec) {
  const s = ac.createBufferSource(), g = ac.createGain(), bp = ac.createBiquadFilter();
  s.buffer = noise; bp.type = filt; bp.frequency.value = f;
  s.connect(bp); bp.connect(g); g.connect(out);
  env(g, t, 0.002, peak, dec); s.start(t, Math.random() * 0.5); s.stop(t + dec + 0.05);
}
function kick(t) {
  const o = ac.createOscillator(), g = ac.createGain();
  o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
  o.connect(g); g.connect(out); env(g, t, 0.003, 0.9, 0.16); o.start(t); o.stop(t + 0.2);
}
function scheduleStep(i, t) {
  const bar = Math.floor(i / 16) % 8, s = i % 16, [root, tri] = CHORDS[bar % 4];
  if (s % 4 === 0) kick(t);
  if (s === 4 || s === 12) hit(t, 'bandpass', 1400, 0.5, 0.09);                    // el çırpma
  hit(t, 'highpass', 7500, s % 2 ? 0.09 : 0.05, 0.03);                              // shaker
  if (s === 3 || s === 11 || s === 14) hit(t, 'bandpass', 3200, 0.12, 0.04);       // tamburim
  if (BASS[s]) tone('triangle', hz(root + (s === 11 ? 12 : 0)), t, 0.5, 0.18, 600);
  if (s % 4 === 2) tri.forEach((m, k) => tone('square', hz(m), t + k * 0.012, 0.045, 0.14, 2200, k * 4));
  if (bar >= 4) { const m = MELODY[bar % 4][s]; if (m) { tone('sawtooth', hz(m), t, 0.09, 0.2, 2600); tone('sine', hz(m + 12), t, 0.03, 0.15); } }
}
function tick() {
  while (nextT < ac.currentTime + 0.12) { scheduleStep(step++, nextT); nextT += S16; }
}
function startTheme() {
  ensureCtx(); if (ac.state === 'suspended') ac.resume();
  if (timer) return;
  nextT = ac.currentTime + 0.05; step = 0;
  out.gain.cancelScheduledValues(ac.currentTime);
  out.gain.setTargetAtTime(0.32 * cfg.vol, ac.currentTime, 0.4);
  timer = setInterval(tick, 25);
}
function stopTheme() {
  if (!timer) return;
  out.gain.setTargetAtTime(0.0001, ac.currentTime, 0.25);
  clearInterval(timer); timer = null;
}

// ------------------------------------------------------------ kontrol
async function play() {
  if (playing) return;
  playing = true;
  if (cfg.src === 'custom') {
    const a = await customAudio();
    if (a && playing) { a.volume = cfg.vol; a.play().catch(() => { playing = false; }); return; }
  }
  if (playing) startTheme();
}
function stop() {
  playing = false;
  stopTheme();
  if (audioEl && !audioEl.paused) audioEl.pause();
}
function restart() { const w = wantPlay; stop(); if (w && unlocked && cfg.on) play(); }

// Her render'da çağrılır: menü ekranlarında çalar, maçta/diğer ekranlarda susar
export function onScreen(screen) {
  wantPlay = cfg.on && MENU_SCREENS.has(screen) && !document.hidden;
  if (wantPlay && unlocked) play(); else if (!wantPlay) stop();
}
// tarayıcı sesi ancak ilk dokunuştan sonra açar
export function unlock() { if (unlocked) return; unlocked = true; if (wantPlay) play(); }
export function toggle() { cfg.on = !cfg.on; save(); if (!cfg.on) stop(); else { wantPlay = true; play(); } return cfg.on; }
export function setVolume(v) {
  cfg.vol = Math.max(0, Math.min(1, v)); save();
  if (audioEl) audioEl.volume = cfg.vol;
  if (ac && timer) out.gain.setTargetAtTime(0.32 * cfg.vol, ac.currentTime, 0.1);
}
export function useTheme() { cfg.src = 'theme'; save(); restart(); }
export function useCustom() { if (!cfg.name) return false; cfg.src = 'custom'; save(); restart(); return true; }
document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
