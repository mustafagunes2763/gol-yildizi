// Sesli anlatım.
// 1) Klon ses dosyaları: audio/spiker/<id>.mp3 (audio/spiker/manifest.json'da listelenenler).
// 2) Dosyası olmayan satırlar: tarayıcının Türkçe konuşma sentezi (Web Speech API).
// Tek bir kuyruk: satırlar sırayla, üst üste binmeden okunur.
const KEY = 'golyildizi.voice';
let on = true;
try { on = localStorage.getItem(KEY) !== '0'; } catch { /* yoksay */ }
const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
let voices = [];
function loadVoices() { if (synth) voices = synth.getVoices().filter((v) => /^tr/i.test(v.lang)); }
if (synth) { loadVoices(); synth.onvoiceschanged = loadVoices; }

// klon ses dosyaları
let clips = new Set();
fetch('audio/spiker/manifest.json', { cache: 'no-cache' }).then((r) => (r.ok ? r.json() : [])).then((a) => { clips = new Set(a); }).catch(() => {});
export const hasClip = (id) => clips.has(id);
export const clipCount = () => clips.size;

export const supported = () => !!synth || clips.size > 0;
export const isOn = () => on && supported();
export const hasTurkish = () => voices.length > 0;
export function setOn(v) {
  on = v;
  try { localStorage.setItem(KEY, v ? '1' : '0'); } catch { /* yoksay */ }
  if (!v) stop();
}

const clean = (t) => String(t).replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, '').replace(/…/g, '.').replace(/\s+/g, ' ').trim();
let queue = [], busy = false, audio = null;

function next() {
  if (busy || !queue.length || !on) return;
  const it = queue.shift();
  busy = true;
  const done = () => { busy = false; next(); };
  if (it.id && clips.has(it.id)) {
    audio = new Audio(`audio/spiker/${it.id}.mp3`);
    audio.onended = done;
    audio.onerror = () => { if (it.text) tts(it, done); else done(); };
    audio.play().catch(() => (it.text ? tts(it, done) : done()));
    return;
  }
  if (it.text && synth) tts(it, done); else done();
}
function tts(it, done) {
  const t = clean(it.text); if (!t) return done();
  const u = new SpeechSynthesisUtterance(t);
  u.lang = 'tr-TR';
  const v = it.who === 'yorum' ? (voices[1] || voices[0]) : voices[0];
  if (v) u.voice = v;
  if (it.who === 'yorum') { u.rate = 0.98; u.pitch = voices[1] ? 1 : 0.75; } else { u.rate = it.priority ? 1.18 : 1.1; u.pitch = it.priority ? 1.25 : 1.05; }
  u.onend = u.onerror = done;
  synth.speak(u);
}

// text: ekranda yazan, id: klon ses dosyası (varsa). Öncelikli satır kuyruğu temizler.
export function say(text, who = 'spiker', priority = false, id = null) {
  if (!isOn()) return;
  if (priority) { queue = []; }
  else if (queue.length >= 3) return;          // anlatım geride kalmasın
  queue.push({ text, who, priority, id });
  next();
}
// Klip dizisi (ör. maç sonu + skor). Hepsinin dosyası yoksa tek bir TTS cümlesi okunur.
export function sayParts(ids, text, who = 'spiker') {
  if (!isOn()) return;
  if (ids.every((id) => clips.has(id))) { for (const id of ids) queue.push({ id, who }); next(); }
  else say(text, who, true);
}
export function stop() { queue = []; busy = false; if (audio) { audio.onended = null; audio.pause(); audio = null; } if (synth) synth.cancel(); }
export function idle(ms = 6000) {
  if (!isOn()) return Promise.resolve();
  const t0 = Date.now();
  return new Promise((res) => {
    const chk = () => ((!busy && !queue.length) || Date.now() - t0 > ms ? res() : setTimeout(chk, 150));
    chk();
  });
}
