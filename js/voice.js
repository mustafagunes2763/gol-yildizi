// Sesli anlatım: tarayıcının Türkçe konuşma sentezi (Web Speech API). Dosya yok, internet gerekmez (cihaz sesine bağlı).
// İki ses: spiker (canlı, hızlı) ve yorumcu (daha tok, sakin).
const KEY = 'golyildizi.voice';
let on = true;
try { on = localStorage.getItem(KEY) !== '0'; } catch { /* yoksay */ }
const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
let voices = [];
function loadVoices() {
  if (!synth) return;
  voices = synth.getVoices().filter((v) => /^tr/i.test(v.lang));
}
if (synth) { loadVoices(); synth.onvoiceschanged = loadVoices; }

export const supported = () => !!synth;
export const isOn = () => on && !!synth;
export const hasTurkish = () => voices.length > 0;
export function setOn(v) {
  on = v;
  try { localStorage.setItem(KEY, v ? '1' : '0'); } catch { /* yoksay */ }
  if (!v) stop();
}

// emojileri ve süsleri at, kısaltmaları okunur yap
const clean = (t) => String(t).replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, '').replace(/…/g, '.').replace(/\s+/g, ' ').trim();
let pending = 0;
export function say(text, who = 'spiker', priority = false) {
  if (!isOn()) return;
  const t = clean(text); if (!t) return;
  if (priority) { synth.cancel(); pending = 0; }
  else if (pending >= 2) return;                       // anlatım geride kalmasın
  const u = new SpeechSynthesisUtterance(t);
  u.lang = 'tr-TR';
  const v = who === 'yorum' ? (voices[1] || voices[0]) : voices[0];
  if (v) u.voice = v;
  if (who === 'yorum') { u.rate = 0.98; u.pitch = voices[1] ? 1 : 0.75; }
  else { u.rate = priority ? 1.18 : 1.1; u.pitch = priority ? 1.25 : 1.05; }
  u.volume = 1;
  pending++;
  u.onend = u.onerror = () => { pending = Math.max(0, pending - 1); };
  synth.speak(u);
}
export function stop() { if (synth) synth.cancel(); pending = 0; }
// anlatım bitene kadar bekle (en fazla ms)
export function idle(ms = 6000) {
  if (!isOn()) return Promise.resolve();
  const t0 = Date.now();
  return new Promise((res) => {
    const chk = () => (!synth.speaking && !synth.pending) || Date.now() - t0 > ms ? res() : setTimeout(chk, 150);
    chk();
  });
}
