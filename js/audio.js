// Ses efektleri: WebAudio ile anında üretilir (dosya yok).
let ctx = null, master = null, crowdNode = null, crowdGain = null;
let enabled = true;
try { enabled = localStorage.getItem('golyildizi.sound') !== '0'; } catch { /* yoksay */ }

export const soundOn = () => enabled;
export function setSound(on) {
  enabled = on;
  try { localStorage.setItem('golyildizi.sound', on ? '1' : '0'); } catch { /* yoksay */ }
  if (!on) stopCrowd();
}

// Tarayıcılar sesi ancak bir dokunuştan sonra açar
export function unlock() {
  if (!enabled) return;
  try {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = 0.7;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
  } catch { ctx = null; }
}

function noiseBuffer(sec = 2) {
  const b = ctx.createBuffer(1, ctx.sampleRate * sec, ctx.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return b;
}
let _noise = null;
const noise = () => (_noise ||= noiseBuffer(2));

function env(g, t, a, peak, d) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
}

function ready() { return enabled && ctx && ctx.state === 'running'; }

export function whistle(long = false) {
  if (!ready()) return;
  const t = ctx.currentTime;
  const blasts = long ? [[0, 0.25], [0.35, 0.25], [0.7, 0.9]] : [[0, 0.35]];
  for (const [o, len] of blasts) {
    const osc = ctx.createOscillator(), g = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain();
    osc.frequency.value = 2900;
    lfo.frequency.value = 38; lg.gain.value = 140;
    lfo.connect(lg).connect(osc.frequency);
    osc.connect(g).connect(master);
    g.gain.setValueAtTime(0.0001, t + o);
    g.gain.exponentialRampToValueAtTime(0.12, t + o + 0.02);
    g.gain.setValueAtTime(0.12, t + o + len - 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, t + o + len);
    osc.start(t + o); lfo.start(t + o); osc.stop(t + o + len + 0.05); lfo.stop(t + o + len + 0.05);
  }
}

export function kick(power = 0.6) {
  if (!ready()) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator(), g = ctx.createGain();
  osc.frequency.setValueAtTime(180, t);
  osc.frequency.exponentialRampToValueAtTime(50, t + 0.12);
  osc.connect(g).connect(master);
  env(g, t, 0.005, 0.5 * power + 0.2, 0.15);
  osc.start(t); osc.stop(t + 0.2);
  const n = ctx.createBufferSource(), ng = ctx.createGain(), f = ctx.createBiquadFilter();
  n.buffer = noise(); f.type = 'highpass'; f.frequency.value = 1500;
  n.connect(f).connect(ng).connect(master);
  env(ng, t, 0.002, 0.25 * power, 0.05);
  n.start(t); n.stop(t + 0.1);
}

export function post() {
  if (!ready()) return;
  const t = ctx.currentTime;
  for (const [f, v] of [[880, 0.18], [1320, 0.1], [2210, 0.06]]) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'triangle'; o.frequency.value = f;
    o.connect(g).connect(master);
    env(g, t, 0.003, v, 0.9);
    o.start(t); o.stop(t + 1);
  }
}

export function thud() {
  if (!ready()) return;
  const t = ctx.currentTime;
  const n = ctx.createBufferSource(), g = ctx.createGain(), f = ctx.createBiquadFilter();
  n.buffer = noise(); f.type = 'lowpass'; f.frequency.value = 400;
  n.connect(f).connect(g).connect(master);
  env(g, t, 0.005, 0.6, 0.18);
  n.start(t); n.stop(t + 0.3);
}

function crowdBurst(dur, peak, freq, q = 0.7) {
  const t = ctx.currentTime;
  const n = ctx.createBufferSource(), g = ctx.createGain(), f = ctx.createBiquadFilter();
  n.buffer = noise(); n.loop = true;
  f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q;
  n.connect(f).connect(g).connect(master);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + dur * 0.25);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  n.start(t); n.stop(t + dur + 0.1);
  return f;
}

export function goalRoar() {
  if (!ready()) return;
  crowdBurst(3.2, 0.9, 900, 0.5);
  crowdBurst(3.0, 0.4, 2200, 0.8);
}
export function ooh() {
  if (!ready()) return;
  const f = crowdBurst(1.4, 0.35, 500, 1.2);
  f.frequency.setValueAtTime(450, ctx.currentTime);
  f.frequency.linearRampToValueAtTime(320, ctx.currentTime + 1.3);
}

// Arka planda tribün uğultusu (maç ekranında)
export function startCrowd() {
  if (!ready() || crowdNode) return;
  crowdNode = ctx.createBufferSource();
  crowdNode.buffer = noise(); crowdNode.loop = true;
  const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 700; f.Q.value = 0.4;
  crowdGain = ctx.createGain(); crowdGain.gain.value = 0.0001;
  crowdNode.connect(f).connect(crowdGain).connect(master);
  crowdNode.start();
  crowdGain.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 1.5);
}
export function stopCrowd() {
  if (!crowdNode) return;
  try {
    crowdGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
    crowdNode.stop(ctx.currentTime + 0.9);
  } catch { /* yoksay */ }
  crowdNode = null;
}
