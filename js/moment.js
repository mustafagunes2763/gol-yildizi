// Kritik an mini oyunu (v2)
// - Oyuncundan sürükle: çizdiğin yoldan topla koşar
// - Hızlı kaydır (oyuncudan ya da boş yerden): şut, arkadaşına doğru: pas
// Türler: acik | kontra | birebir | serbest | kafa | korner | rovasata | penalti | uzuntop | duvar | pres
// Mantıksal saha 360x540, kale üstte.
import * as Sfx from './audio.js';
import { lookOf, hairColor, skinColor } from './look.js';

const W = 360, H = 540;
const GOAL_Y = 40, POST_L = 130, POST_R = 230, GOAL_DEPTH = 18, GOAL_CX = 180;
const BALL_R = 4.5, BODY_R = 9;

const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const wrap = (d) => { while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; };
const angDiff = (a, b) => Math.abs(wrap(a - b));

// Sonuç türleri: goal | assist | saved | miss | over | post | blocked | lost | tmMiss | intercepted
export const OUTCOME_TEXT = {
  goal: 'GOOOL!', assist: 'ASİST! Gol!', saved: 'Kaleci kurtardı', miss: 'Auta gitti', over: 'Üstten auta',
  post: 'Direkten döndü!', blocked: 'Defans bloke etti', lost: 'Top kaptırıldı', tmMiss: 'Arkadaşın kaçırdı', intercepted: 'Pas arada kesildi',
  offside: 'OFSAYT! Bayrak kalktı', foulPen: 'PENALTI! Düşürüldün', foulFk: 'Faul! Serbest vuruş',
};

const HINTS = {
  acik: 'Sürükle: koş · Hızlı kaydır: şut · Arkadaşa dokun: pas',
  kontra: 'Kontra! Sürükle, arkadaşa dokun ya da vur',
  birebir: 'Birebir! Yana hızlı kaydır: çalım · Kaleye kaydır: şut',
  serbest: 'Serbest vuruş: kavisli kaydır · çok sert = baraj',
  kafa: 'Top kafana gelince kaleye doğru kaydır',
  korner: 'Korner! Top gelince kafayı vur',
  rovasata: 'Top havada arkadan geliyor… tam anında kaydır!',
  penalti: 'PENALTI — kaleye doğru kaydır',
  uzuntop: 'Uzun top! Topa doğru sürükle, kaleciden önce yetiş',
  duvar: 'Arkadaşa dokun: ver-kaç! Top dönünce vur',
  pres: 'Top rakipte! Üstüne koş, kap ve vur',
  kosevurusu: 'Korneri sen kullanıyorsun! Arkadaşına kaydır ya da kavisle direkt dene',
  vole: 'Top havada geliyor… gelince sert kaydır: vole!',
  arkadirek: 'Arka direk! Top gelince kaleye kafayla çevir',
  balik: 'Alçak orta! Balıklama atla: top gelince hızla kaydır',
};
const TIME_LIMIT = { acik: 10, kontra: 13, birebir: 8, uzuntop: 9, duvar: 11, pres: 11 };
const RUNNERS = new Set(['acik', 'kontra', 'birebir', 'uzuntop', 'duvar', 'pres']);
const HEADERS = new Set(['kafa', 'korner', 'rovasata', 'vole', 'arkadirek', 'balik']);

/**
 * @param {HTMLElement} host
 * @param {{kind:string, defenders:number, keeper:number, stats:object, energy:number,
 *          myColors:string[], oppColors:string[], teammates:string[], minute:number}} o
 * @returns {Promise<{outcome:string, text:string}>}
 */
export function playMoment(host, o) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.className = 'moment-canvas';
    host.innerHTML = '';
    host.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let scale = 1;
    const dpr = window.devicePixelRatio || 1;
    function resize() {
      const r = host.getBoundingClientRect();
      scale = Math.min(r.width / W, r.height / H);
      canvas.style.width = W * scale + 'px';
      canvas.style.height = H * scale + 'px';
      canvas.width = Math.round(W * scale * dpr);
      canvas.height = Math.round(H * scale * dpr);
    }
    resize();
    window.addEventListener('resize', resize);

    const st = o.stats;
    const kind = HINTS[o.kind] ? o.kind : 'acik';
    const tired = o.energy < 30 ? 1.4 : 1;
    const canRun = RUNNERS.has(kind);
    const canPass = canRun || kind === 'kosevurusu';
    const weather = o.weather || {};
    const snow = weather.fx === 'kar', rain = weather.fx === 'yagmur';
    const runSpeed = (58 + st.hiz * 0.6) * (o.energy < 30 ? 0.85 : 1) * (snow ? 0.9 : 1);
    const pressSpeed = runSpeed * clamp(0.72 + (o.keeper - st.hiz) / 250, 0.6, 0.9) * (o.pressMul || 1);
    const isHeader = HEADERS.has(kind);
    const oppNames = (o.oppNames && o.oppNames.length ? o.oppNames : ['Defans']).map((n) => n.split(' ').slice(-1)[0]);
    let foulInfo = null;
    const keeperSpeed = 25 + o.keeper * 0.95;           // şut sırasında yana kayma
    const keeperRun = 35 + o.keeper * 0.45;             // çıkış hızı
    const keeperReach = 11 + o.keeper / 22;
    const tackleP = clamp(0.5 - st.teknik / 240 + (o.keeper - 65) / 300, 0.12, 0.45); // defans topu kapma şansı

    // ---------- kurulum ----------
    const me = { x: 180, y: 260, hasBall: true };
    const keeper = { x: GOAL_CX, y: GOAL_Y + 8, stun: 0 };
    const defenders = [];
    const mates = [];
    let crossBall = null; // kafa vuruşu için orta
    let loose = null;     // sahipsiz top (uzun top / ver-kaç dönüşü): { vx, vy, fr }
    let press = null;     // pres: { carrier, pass, t, next, passes, won, tryAt }
    const mateName = () => (o.teammates[Math.floor(Math.random() * o.teammates.length)] || 'Arkadaşın').split(' ').slice(-1)[0];

    if (kind === 'acik') {
      me.x = rand(85, 275); me.y = rand(200, 290);
      const n = Math.min(4, o.defenders + (o.extraDef || 0));
      for (let i = 0; i < n; i++) {
        const t = rand(0.3, 0.7);
        const spread = n === 1 ? (Math.random() < 0.5 ? -1 : 1) * rand(25, 45) : (i - (n - 1) / 2) * 64 + rand(-12, 12);
        defenders.push({ role: 'zone', x: clamp(me.x + (GOAL_CX - me.x) * t + spread, 30, 330), y: clamp(me.y + (GOAL_Y - me.y) * t + rand(-15, 20), 75, me.y - 35) });
      }
      const pa = rand(-2.6, -0.5), pd = rand(95, 120);
      defenders.push({ role: 'press', x: clamp(me.x + Math.cos(pa) * pd, 15, 345), y: clamp(me.y + Math.sin(pa) * pd, 60, H - 20) });
      const nM = (o.teamRel ?? 50) >= 65 ? 2 : (o.teamRel ?? 50) < 35 ? 1 : Math.random() < 0.5 ? 1 : 2;
      for (let i = 0; i < nM; i++) {
        const side = me.x < GOAL_CX ? 1 : -1;
        mates.push({ x: clamp(GOAL_CX + side * rand(40, 115) * (i ? -0.6 : 1), 40, 320), y: rand(105, 210), tx: null, name: mateName() });
      }
    } else if (kind === 'kontra') {
      me.x = rand(120, 240); me.y = rand(455, 485);
      for (let i = 0; i < Math.min(2, o.defenders); i++) {
        defenders.push({ role: 'zone', x: clamp(me.x + rand(-90, 90), 40, 320), y: rand(230, 320) });
      }
      defenders.push({ role: 'press', x: clamp(me.x + rand(-60, 60), 20, 340), y: me.y + 60, slow: 0.85 });
      mates.push({ x: me.x < 180 ? me.x + rand(90, 130) : me.x - rand(90, 130), y: me.y + rand(-10, 20), tx: null, run: true, name: mateName() });
    } else if (kind === 'birebir') {
      me.x = rand(140, 220); me.y = rand(230, 270);
      defenders.push({ role: 'press', x: me.x + rand(-25, 25), y: me.y + 55, slow: 0.92 });
    } else if (kind === 'serbest') {
      me.hasBall = true;
      me.x = rand(90, 270); me.y = rand(215, 265);
      // baraj: topa 55 birim uzakta, kale yönünde
      const a = Math.atan2(GOAL_Y - me.y, GOAL_CX - me.x);
      const wx = me.x + Math.cos(a) * 55, wy = me.y + Math.sin(a) * 55;
      const px = -Math.sin(a), py = Math.cos(a);
      const nW = 4;
      for (let i = 0; i < nW; i++) {
        const off = (i - (nW - 1) / 2) * 17 + (me.x < GOAL_CX ? 8 : -8);
        defenders.push({ role: 'wall', x: wx + px * off, y: wy + py * off });
      }
      keeper.x = GOAL_CX + (me.x < GOAL_CX ? 14 : -14);
    } else if (kind === 'kafa') {
      me.hasBall = false;
      me.x = rand(150, 210); me.y = rand(105, 145);
      defenders.push({ role: 'mark', x: me.x + rand(-16, 16), y: me.y + 16 });
      const fromLeft = Math.random() < 0.5;
      const sx = fromLeft ? 20 : 340, sy = rand(120, 190);
      const target = { x: me.x + rand(-4, 4), y: me.y + rand(-4, 4) };
      const tt = rand(0.85, 1.05);
      crossBall = { x: sx, y: sy, vx: (target.x - sx) / tt, vy: (target.y - sy) / tt };
      mates.push({ x: sx, y: sy + 8, name: mateName(), crosser: true });
    } else if (kind === 'korner') {
      me.hasBall = false;
      me.x = rand(150, 215); me.y = rand(95, 130);
      const left = Math.random() < 0.5;
      const sx = left ? 6 : 354, sy = GOAL_Y + 4;
      defenders.push({ role: 'mark', x: me.x + rand(-12, 12), y: me.y + 14 });
      defenders.push({ role: 'mark', x: me.x + (left ? -30 : 30), y: me.y - 10, fixed: true });
      mates.push({ x: left ? me.x + 45 : me.x - 45, y: me.y + 25, name: mateName(), fixed: true });
      mates.push({ x: sx, y: sy + 6, name: mateName(), crosser: true });
      const target = { x: me.x + rand(-4, 4), y: me.y + rand(-4, 4) };
      const tt = rand(0.95, 1.15);
      crossBall = { x: sx, y: sy, vx: (target.x - sx) / tt, vy: (target.y - sy) / tt };
    } else if (kind === 'rovasata') {
      me.hasBall = false;
      me.x = rand(160, 200); me.y = rand(110, 140);
      defenders.push({ role: 'mark', x: me.x + rand(-14, 14), y: me.y - 18 });
      const sx = Math.random() < 0.5 ? 40 : 320, sy = rand(330, 380);
      mates.push({ x: sx, y: sy + 8, name: mateName(), crosser: true });
      const target = { x: me.x + rand(-3, 3), y: me.y + rand(-3, 3) };
      const tt = rand(0.9, 1.05);
      crossBall = { x: sx, y: sy, vx: (target.x - sx) / tt, vy: (target.y - sy) / tt, high: true };
    } else if (kind === 'vole') {
      // ceza sahası çizgisi: sekip gelen top, havadan vole
      me.hasBall = false;
      me.x = rand(130, 230); me.y = rand(195, 230);
      defenders.push({ role: 'mark', x: me.x + rand(-30, 30), y: me.y - rand(30, 45) });
      if (o.defenders > 1) defenders.push({ role: 'mark', x: clamp(me.x + rand(-70, 70), 40, 320), y: me.y - rand(60, 90), fixed: true });
      const sx = Math.random() < 0.5 ? 30 : 330, sy = rand(130, 175);
      mates.push({ x: sx, y: sy + 8, name: mateName(), crosser: true });
      const tt = rand(0.85, 1.0);
      crossBall = { x: sx, y: sy, vx: (me.x - sx) / tt, vy: (me.y - sy) / tt, high: true };
    } else if (kind === 'arkadirek') {
      // orta ön direği geçer, arka direkte bekliyorsun
      me.hasBall = false;
      const left = Math.random() < 0.5;            // orta soldan → sen sağ (arka) direkte
      me.x = left ? rand(220, 245) : rand(115, 140); me.y = rand(74, 92);
      defenders.push({ role: 'mark', x: me.x + (left ? -14 : 14), y: me.y + 12 });
      defenders.push({ role: 'mark', x: left ? 150 : 210, y: rand(85, 105), fixed: true });
      const sx = left ? 15 : 345, sy = rand(110, 150);
      mates.push({ x: sx, y: sy + 8, name: mateName(), crosser: true });
      const tt = rand(1.05, 1.2);
      crossBall = { x: sx, y: sy, vx: (me.x - sx) / tt, vy: (me.y - sy) / tt, high: true };
    } else if (kind === 'balik') {
      // sert, alçak orta: balıklama
      me.hasBall = false;
      me.x = rand(150, 210); me.y = rand(105, 135);
      defenders.push({ role: 'mark', x: me.x + rand(-18, 18), y: me.y - 14 });
      const sx = Math.random() < 0.5 ? 25 : 335, sy = rand(95, 140);
      mates.push({ x: sx, y: sy + 8, name: mateName(), crosser: true });
      const tt = rand(0.6, 0.72);
      crossBall = { x: sx, y: sy, vx: (me.x - sx) / tt, vy: (me.y - sy) / tt };
    } else if (kind === 'kosevurusu') {
      // korneri sen kullanıyorsun
      const left = Math.random() < 0.5;
      me.x = left ? 16 : 344; me.y = GOAL_Y + 18;
      const spots = [[rand(145, 175), rand(95, 115)], [rand(185, 215), rand(100, 125)], [left ? rand(225, 250) : rand(110, 135), rand(80, 95)]];
      spots.forEach(([x, y], i) => mates.push({ x, y, name: mateName(), fixed: true, corner: true }));
      for (const [x, y] of spots) defenders.push({ role: 'mark', x: x + rand(-12, 12), y: y + rand(8, 16), fixed: true });
      defenders.push({ role: 'mark', x: left ? 125 : 235, y: GOAL_Y + 14, fixed: true });   // ön direk
    } else if (kind === 'penalti') {
      me.x = GOAL_CX; me.y = 150;
    } else if (kind === 'uzuntop') {
      // defansın arkasına atılan top: kaleciyle yarış
      me.hasBall = false;
      me.x = rand(110, 250); me.y = rand(330, 360);
      defenders.push({ role: 'press', x: clamp(me.x + (Math.random() < 0.5 ? -1 : 1) * rand(22, 40), 20, 340), y: me.y + rand(8, 26), slow: 0.8 });
      if (o.defenders > 1) defenders.push({ role: 'press', x: clamp(me.x + rand(-110, 110), 20, 340), y: me.y + rand(40, 70), slow: 0.7 });
      mates.push({ x: clamp(me.x + rand(-60, 60), 40, 320), y: H - 25, name: mateName(), crosser: true });
      const tx = clamp(me.x + rand(-40, 40), POST_L - 10, POST_R + 10), ty = rand(175, 215);
      const fr = 1.6, k = fr * 1.03;                  // sürtünmeyle hedefin biraz ötesinde durur
      const bx0 = me.x + (Math.random() < 0.5 ? -1 : 1) * 26;
      loose = { vx: (tx - bx0) * k, vy: (ty - me.y - 40) * k, fr, grace: 0.6, x0: bx0 };
    } else if (kind === 'duvar') {
      // ceza sahası önü: yanında duvar arkadaş, önünde iki defans
      me.x = rand(120, 240); me.y = rand(255, 285);
      const side = me.x < GOAL_CX ? 1 : -1;
      mates.push({ x: clamp(me.x + side * rand(48, 62), 40, 320), y: me.y - rand(18, 30), name: mateName(), wall: true, fixed: true });
      defenders.push({ role: 'press', x: me.x + rand(-10, 10), y: me.y - rand(48, 60), slow: 0.95 });
      defenders.push({ role: 'zone', x: clamp(me.x - side * rand(25, 50), 30, 330), y: me.y - rand(95, 120) });
      if (o.defenders > 2) defenders.push({ role: 'zone', x: clamp(me.x + side * rand(60, 90), 30, 330), y: me.y - rand(110, 140) });
    } else if (kind === 'pres') {
      // top rakipte, kendi ceza sahalarından çıkmaya çalışıyorlar
      me.hasBall = false;
      me.x = rand(120, 240); me.y = rand(300, 330);
      const c = { role: 'opp', x: clamp(me.x + rand(-70, 70), 60, 300), y: rand(165, 205) };
      const r1 = { role: 'opp', x: c.x < GOAL_CX ? rand(240, 310) : rand(50, 120), y: rand(120, 160) };
      const r2 = { role: 'opp', x: clamp(GOAL_CX + rand(-40, 40), 60, 300), y: rand(240, 280) };
      defenders.push(c, r1, r2);
      press = { carrier: c, pass: null, t: 0, next: rand(1.6, 2.2), passes: 0, won: false, tryAt: 0 };
      mates.push({ x: me.x < GOAL_CX ? me.x + rand(70, 110) : me.x - rand(70, 110), y: me.y + rand(-10, 20), tx: null, name: mateName() });
    }
    defenders.forEach((d, i) => { d.name = oppNames[i % oppNames.length]; });

    const ball = { x: me.x, y: me.y - 10 };
    if (crossBall) { ball.x = crossBall.x; ball.y = crossBall.y; }
    if (kind === 'uzuntop') { ball.x = loose.x0; ball.y = me.y + 40; }
    if (press) { ball.x = press.carrier.x; ball.y = press.carrier.y + 9; }
    if (window.__debug) window.__debug.moment = { kind, ball, me, keeper, defenders, mates, get loose() { return loose; }, get press() { return press; }, get path() { return path; }, get gesture() { return gesture; } };

    // ---------- durum ----------
    let phase = 'aim';   // aim | flying | done
    let shot = null;
    let outcome = null, outcomeAt = 0, msg = '';
    let trail = [];
    let gesture = null;  // aktif dokunma
    let path = [];       // koşu yolu
    let facing = -Math.PI / 2;
    let elapsed = 0, last = performance.now();
    let keeperReactAt = Infinity, keeperTargetX = keeper.x;
    let flashText = '', flashUntil = 0;
    const limit = (TIME_LIMIT[kind] || 0) * (o.timeMul || 1);
    let meV = { x: 0, y: 0 }, dodge = null, lastRaw = 0;
    const flash = (t) => { flashText = t; flashUntil = elapsed + 0.9; };

    // ---------- girdi ----------
    const toLocal = (e) => {
      const r = canvas.getBoundingClientRect();
      return { x: (e.clientX - r.left) / scale, y: (e.clientY - r.top) / scale, t: performance.now() };
    };
    canvas.addEventListener('pointerdown', (e) => {
      if (phase !== 'aim') return;
      canvas.setPointerCapture(e.pointerId);
      const p = toLocal(e);
      gesture = { pts: [p], nearMe: canRun && (me.hasBall || loose || (press && !press.won)) && dist(p, me) < 45, mode: null };
    });
    const samplePath = (pts) => pts.filter((_, i) => i % 2 === 0).map((p) => ({ x: clamp(p.x, 10, W - 10), y: clamp(p.y, GOAL_Y + 6, H - 10) }));
    canvas.addEventListener('pointermove', (e) => {
      if (!gesture) return;
      const p = toLocal(e);
      const lastP = gesture.pts[gesture.pts.length - 1];
      if (dist(p, lastP) > 2) gesture.pts.push(p);
      if (gesture.pts.length > 240) gesture.pts.shift();
      // oyuncudan başlayıp yavaşça sürüklenirse: koşu yolu (çizerken koşmaya başlar)
      if (gesture.nearMe && !gesture.mode && p.t - gesture.pts[0].t > 160 && dist(p, gesture.pts[0]) > 8) gesture.mode = 'path';
      if (gesture.mode === 'path' && phase === 'aim') path = samplePath(gesture.pts);
    });
    // Bırakma hızı: son ~90 ms (şut gücü buna göre, tutarlı)
    function releaseSpeed(pts) {
      const b = pts[pts.length - 1];
      let k = pts.length - 1;
      while (k > 0 && b.t - pts[k - 1].t < 90) k--;
      const a = pts[Math.max(0, k - 1)];
      return dist(a, b) / Math.max(16, b.t - a.t);
    }
    canvas.addEventListener('pointerup', (e) => {
      if (!gesture || phase !== 'aim') { gesture = null; return; }
      gesture.pts.push(toLocal(e));
      const g = gesture; gesture = null;
      const a = g.pts[0], b = g.pts[g.pts.length - 1];
      const len = Math.hypot(b.x - a.x, b.y - a.y);
      const dur = b.t - a.t;
      const rs = releaseSpeed(g.pts);
      // dokunma: takım arkadaşına dokun = pas
      if (len < 14 && dur < 350) {
        if (canPass && me.hasBall) {
          const m = mates.find((x) => !x.crosser && dist(x, b) < 30);
          if (m) return passTo(m, 430);
        }
        return;
      }
      if (g.mode === 'path') {
        const avg = len / Math.max(dur, 1);
        if (rs > 1.4 && rs > avg * 2.2) { const tail = g.pts.filter((q) => b.t - q.t < 140); if (tail.length > 1) { path = []; return release(tail, rs); } } // çizip sonunda fırlattı: şut
        path = samplePath(g.pts); return;
      }
      // topsuzken: yanındaysa topu alıp vurur, değilse önce topa yetiş
      if (!me.hasBall && (loose || press)) {
        if (loose && loose.grace <= 0 && dist(me, ball) < 26) grabLoose(true);
        else { if (len >= 25) flash(press ? 'Önce topu kap!' : 'Önce topa yetiş!'); return; }
      }
      // çalım: oyuncundan başlayan hızlı yatay kaydırma
      if (g.nearMe && me.hasBall && kind !== 'serbest' && Math.abs(b.x - a.x) > 1.8 * Math.abs(b.y - a.y) && len > 25 && len < 110) return doDodge(Math.sign(b.x - a.x));
      if (len >= 25) release(g.pts, rs);
      else flash('Daha uzun kaydır');
    });
    canvas.addEventListener('pointercancel', () => { gesture = null; });

    function grabLoose(quiet) {
      loose = null; me.hasBall = true;
      facing = Math.atan2(GOAL_Y - me.y, GOAL_CX - me.x);
      if (!quiet) flash('Topu aldın!');
    }
    // pres: topu kazandın, artık açık oyun gibi
    function winBall(txt) {
      press.won = true; press.pass = null;
      me.hasBall = true; facing = -Math.PI / 2;
      const c = press.carrier; c.stun = 1.1;
      defenders.forEach((d) => { d.role = d === c ? 'press' : 'zone'; d.slow = 0.85; });
      flash(txt); Sfx.thud();
    }
    function doDodge(dir) {
      dodge = { vx: dir * 150, t: 0.22 };
      for (const d of defenders) {
        if (d.role === 'wall' || dist(d, me) > 48 || d.stun > 0) continue;
        if (Math.random() < 0.45 + st.teknik / 250) { d.stun = 1.1; flash('Çalım!'); }
        else { flash('Yutmadı!'); if (Math.random() < tackleP * 1.2) return tackled(d); }
      }
    }

    // Ofsayt çizgisi: kaleye en yakın ikinci rakip (kaleci dahil)
    function offsideY() {
      const ys = [keeper.y, ...defenders.filter((d) => d.role !== 'wall').map((d) => d.y)].sort((x, y) => x - y);
      return ys.length > 1 ? ys[1] : ys[0];
    }
    const isOffside = (m) => kind !== 'kosevurusu' && m.y < offsideY() - 3 && m.y < ball.y - 4;

    function passTo(m, sp) {
      if (isOffside(m)) { me.hasBall = false; path = []; return finish('offside'); }
      const err = gauss() * 0.06 * (1 - st.pas / 130) * tired;
      const pa = Math.atan2(m.y - ball.y, m.x - ball.x) + err;
      me.hasBall = false; path = [];
      shot = { kind: 'pass', vx: Math.cos(pa) * sp, vy: Math.sin(pa) * sp, target: m };
      Sfx.kick(0.35);
      phase = 'flying'; trail = []; shotFrame = history.length;
    }

    // Defans topu aldı: bazen faul (penaltı / serbest vuruş + kart)
    function tackled(d) {
      if (Math.random() < (o.foulRate ?? 0.25)) {
        const inBox = me.y < GOAL_Y + 150 && me.x > 60 && me.x < 300;
        const lastMan = !defenders.some((x) => x !== d && x.role !== 'wall' && x.y < me.y);
        const card = lastMan && Math.random() < 0.5 ? 'red' : Math.random() < 0.45 ? 'yellow' : null;
        foulInfo = { inBox, card, name: d.name };
        return finish(inBox ? 'foulPen' : 'foulFk');
      }
      return finish('lost');
    }

    function release(pts, rs) {
      const a = pts[0], b = pts[pts.length - 1];
      const dx = b.x - a.x, dy = b.y - a.y;
      const len = Math.hypot(dx, dy);
      const dt = Math.max(40, b.t - a.t);
      const swipeSpeed = Math.max(len / dt, rs ?? 0);
      let ang = Math.atan2(dy, dx);
      const mid = pts[Math.floor(pts.length / 2)];
      const cross = ((mid.x - a.x) * dy - (mid.y - a.y) * dx) / len;
      const curve = clamp(cross / len, -0.35, 0.35);
      const midAng = Math.atan2(mid.y - a.y, mid.x - a.x);
      const raw = swipeSpeed * 470;
      lastRaw = raw;
      if (window.__debug) window.__debug.raw = raw;

      // --- KAFA ---
      if (isHeader) {
        const d = dist(ball, me);
        const win = kind === 'rovasata' ? 22 : kind === 'balik' ? 26 : kind === 'vole' ? 32 : 30;
        if (d > win) {
          const early = crossBall && crossBall.vx * (me.x - ball.x) + crossBall.vy * (me.y - ball.y) > 0;
          return finish('miss', early ? 'Erken kafa vurdun' : 'Topa yetişemedin');
        }
        // markajdaki defans kafayı kapabilir
        const pDef = clamp((kind === 'vole' ? 0.18 : kind === 'arkadirek' ? 0.22 : 0.33) + (o.keeper - st.guc) / 250, 0.1, 0.5);
        if (Math.random() < pDef) { crossBall = null; return finish('blocked', kind === 'vole' ? 'Defans kendini önüne attı' : kind === 'balik' ? 'Defans topa önce uzandı' : 'Defans kafada önde davrandı'); }
        crossBall = null;
        const errMul = kind === 'rovasata' ? 0.16 : kind === 'vole' ? 0.14 : kind === 'arkadirek' ? 0.1 : 0.13;
        ang += gauss() * errMul * (1 - (kind === 'vole' ? st.sut + st.teknik : st.guc + st.teknik) / 230) * tired;
        const sp = kind === 'rovasata' ? clamp(380 + st.teknik * 2.5, 380, 640)
          : kind === 'vole' ? clamp(380 + st.sut * 3, 380, 700)
            : kind === 'balik' ? clamp(400 + st.guc * 2.2, 400, 620)
              : clamp(300 + st.guc * 2.2 + st.teknik, 300, 560);
        const over = kind === 'vole' && raw > (400 + st.sut * 4) * 1.5 && Math.random() < 0.5;   // fazla sert vole üstten gider
        launchShot(ang, sp, 0, over);
        if (kind === 'vole') flash('VOLE!'); else if (kind === 'balik') flash('Balıklama!');
        if (kind === 'rovasata') keeperReactAt += 0.12;
        return;
      }

      // --- PAS ---
      const angL = Math.atan2(GOAL_Y - ball.y, POST_L - 12 - ball.x);
      const angR = Math.atan2(GOAL_Y - ball.y, POST_R + 12 - ball.x);
      const towardGoal = ball.y > GOAL_Y && ang >= angL && ang <= angR;
      if (canPass && !towardGoal) {
        let best = null;
        for (const m of mates) {
          const ma = Math.atan2(m.y - ball.y, m.x - ball.x);
          const d = angDiff(ang, ma);
          if (!m.crosser && d < 0.32 && (!best || d < best.d)) best = { m, d };
        }
        if (best) return passTo(best.m, clamp(raw, 280, 580));
      }

      // --- ŞUT ---
      ang += gauss() * 0.075 * (1 - (st.sut + st.teknik) / 240) * tired;
      ang += clamp(wrap(midAng - Math.atan2(dy, dx)), -0.35, 0.35) * 0.6;
      const maxSpeed = 400 + st.sut * 4;
      const sp = clamp(raw * (0.85 + st.sut / 200), 230, maxSpeed);
      const over = raw > maxSpeed * 1.45 && Math.random() < clamp((raw / maxSpeed - 1.45) * 2 + 0.3, 0, 0.9);
      const cf = curve * 1100 * (0.4 + st.teknik / 110) * (kind === 'serbest' ? 1.3 : 1);
      const low = kind === 'serbest' && raw > maxSpeed * 0.95; // çok sert serbest vuruş baraja gider
      launchShot(ang, sp, cf, over, low);
      shot.curved = Math.abs(curve) > 0.07;
    }

    function launchShot(ang, sp, cf, over, low = false) {
      me.hasBall = false; path = [];
      shot = { kind: 'shot', vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, cf, over, low };
      Sfx.kick(clamp(sp / 650, 0.3, 1));
      keeperReactAt = elapsed + (kind === 'penalti' ? 0.05 : kind === 'serbest' ? 0.2 : 0.3 + Math.random() * 0.1 - o.keeper / 1500);
      if (kind === 'penalti') {
        const r = Math.random();
        keeperTargetX = r < 0.42 ? POST_L + 24 : r < 0.84 ? POST_R - 24 : GOAL_CX;
        // panenka: yavaş ve ortaya
        if (sp < 300 && Math.abs(Math.cos(ang)) < 0.18) {
          shot.panenka = true; shot.vx *= 0.8; shot.vy *= 0.8;
          keeperTargetX = Math.random() < 0.2 + o.keeper / 900 ? GOAL_CX : keeperTargetX === GOAL_CX ? POST_L + 24 : keeperTargetX;
          flash('PANENKA?!');
        }
      }
      phase = 'flying'; trail = []; shotFrame = history.length;
    }

    function finish(out, text) {
      if (outcome) return;
      if (shot?.panenka) text = out === 'goal' ? 'PANENKA! Kaleci yere yattı, top yavaşça ağlarda 😎' : out === 'saved' ? 'Panenka denedin… kaleci yerinden kıpırdamadı 😳' : text;
      if (kind === 'kosevurusu' && out === 'goal') text = 'OLİMPİK GOL! Kornerden direkt ağlara! 🌀';
      outcome = out;
      msg = text || OUTCOME_TEXT[out];
      outcomeAt = elapsed;
      phase = 'done';
      path = []; gesture = null;
      if (navigator.vibrate && (out === 'goal' || out === 'assist')) navigator.vibrate([60, 40, 120]);
      if (out === 'goal' || out === 'assist') {
        netHitX = ball.x; netHitAt = elapsed;
        Sfx.goalRoar();
      } else if (out === 'post') Sfx.post();
      else if (out === 'saved') Sfx.thud(), Sfx.ooh();
      else if (out === 'miss' || out === 'over' || out === 'tmMiss') Sfx.ooh();
      else if (out === 'blocked' || out === 'intercepted') Sfx.thud();
    }

    // ---------- güncelleme ----------
    function moveTo(ent, tx, ty, speed, dt) {
      const d = Math.hypot(tx - ent.x, ty - ent.y);
      if (d < 0.5) return d;
      const s = Math.min(d, speed * dt);
      ent.x += (tx - ent.x) / d * s;
      ent.y += (ty - ent.y) / d * s;
      return d;
    }

    function update(dt) {
      elapsed += dt;
      if (keeper.stun > 0) keeper.stun -= dt;
      for (const d of defenders) if (d.stun > 0) d.stun -= dt;

      if (phase === 'aim') {
        // süre
        if (limit && elapsed > limit) return finish('lost', 'Pozisyon kayboldu');

        // oyuncu yolu izler, top ayağında
        const px0 = me.x, py0 = me.y;
        if (dodge) {
          me.x = clamp(me.x + dodge.vx * dt, 12, W - 12); dodge.t -= dt;
          if (dodge.t <= 0) dodge = null;
        } else if ((me.hasBall || loose || (press && !press.won)) && path.length) {
          const tgt = path[0];
          const d = moveTo(me, tgt.x, tgt.y, me.hasBall ? runSpeed : runSpeed * 1.08, dt);
          if (d > 0.5) facing = Math.atan2(tgt.y - me.y, tgt.x - me.x);
          if (d < 4) path.shift();
        }
        meV = { x: (me.x - px0) / Math.max(dt, 1e-3), y: (me.y - py0) / Math.max(dt, 1e-3) };
        if (me.hasBall) {
          ball.x = me.x + Math.cos(facing) * 9;
          ball.y = me.y + Math.sin(facing) * 9;
          if (ball.y < GOAL_Y + 4) {
            if (ball.x > POST_L + 4 && ball.x < POST_R - 4) return finish('goal', 'GOOOL! Topla ağlara!');
            me.y += 3;
          }
        }

        // sahipsiz top (uzun top / ver-kaç dönüşü)
        if (loose) {
          ball.x += loose.vx * dt; ball.y += loose.vy * dt;
          const f = loose.fr * (rain ? 0.75 : snow ? 1.4 : 1);
          loose.vx *= 1 - f * dt; loose.vy *= 1 - f * dt;
          if (loose.grace > 0) loose.grace -= dt;
          else if (dist(me, ball) < BODY_R + BALL_R + 4) grabLoose();
          else if (ball.x < 4 || ball.x > W - 4 || ball.y > H - 4) return finish('lost', 'Top auta çıktı');
          else if (ball.y < GOAL_Y + 6) return finish('saved', 'Kaleci topu aldı');
        }
        // pres: rakip topla oynuyor
        if (press && !press.won) {
          const c = press.carrier;
          if (press.pass) {
            const pz = press.pass;
            ball.x += pz.vx * dt; ball.y += pz.vy * dt;
            if (dist(me, ball) < BODY_R + BALL_R + 6) return winBall('Araya girdin!');
            if (dist(ball, pz.to) < BODY_R + 2) {
              press.carrier = pz.to; press.pass = null; press.t = 0; press.passes++;
              press.next = rand(1.3, 2.0) - press.passes * 0.15;
              if (press.passes >= 3) return finish('lost', 'Rakip presi kırdı');
            }
          } else {
            press.t += dt;
            // top sürer: senden uzaklaşır
            const ax = c.x - me.x, ay = c.y - me.y, al = Math.hypot(ax, ay) || 1;
            if (c.stun <= 0) { c.x = clamp(c.x + ax / al * 22 * dt, 30, 330); c.y = clamp(c.y + ay / al * 12 * dt, 70, 300); }
            ball.x = c.x; ball.y = c.y + 9;
            const dm = dist(me, c);
            if (dm < BODY_R * 2 + 4 && elapsed >= press.tryAt) {
              press.tryAt = elapsed + 0.6;
              const pW = clamp(0.5 + (st.guc + st.hiz - 120) / 250 - (o.keeper - 65) / 220, 0.25, 0.8);
              if (Math.random() < pW) return winBall('Topu kaptın!');
              if (Math.random() < 0.14) { foulInfo = null; return finish('lost', 'Faul yaptın! Rakip serbest vuruş kazandı'); }
              flash('Sıyırdı!'); press.t = press.next;   // hemen pası çıkarır
            }
            if (press.t >= press.next) {
              const opts = defenders.filter((d) => d !== c);
              const to = opts.reduce((b, d) => (!b || dist(d, me) > dist(b, me) ? d : b), null);
              const a = Math.atan2(to.y - ball.y, to.x - ball.x) + gauss() * 0.04;
              press.pass = { to, vx: Math.cos(a) * 240, vy: Math.sin(a) * 240 };
              Sfx.kick(0.3);
            }
          }
          for (const d of defenders) if (d !== press.carrier && d !== (press.pass && press.pass.to)) moveTo(d, d.x + Math.sin(elapsed + d.y) * 6, d.y, 8, dt);
        }
        // orta (kafa)
        if (crossBall) {
          ball.x += crossBall.vx * dt; ball.y += crossBall.vy * dt;
          if (ball.x < -10 || ball.x > W + 10 || ball.y < 0) return finish('miss', 'Topa yetişemedin');
          // top oyuncuyu geçip uzaklaştıysa
          const past = crossBall.vx * (ball.x - me.x) + crossBall.vy * (ball.y - me.y) > 0 && dist(ball, me) > (kind === 'rovasata' ? 26 : 34);
          if (past) return finish('miss', 'Topa yetişemedin');
        }

        // defanslar: biri pres (öngörülü), bir kısmı pas yollarını kapatır, kalanı şut yolunu
        const freeMates = mates.filter((m) => !m.crosser);
        let markIdx = 0;
        for (const d of defenders) {
          if (d.role === 'wall' || d.stun > 0) continue;
          const dm = dist(d, me);
          if (d.role === 'press' || (d.role === 'zone' && dm < (kind === 'kontra' ? 55 : 70))) {
            const lead = d.role === 'press' ? 0.25 : 0.1;
            moveTo(d, ball.x + meV.x * lead, ball.y + meV.y * lead, pressSpeed * (d.slow || 1) * (d.role === 'zone' ? 0.9 : 1), dt);
          } else if (d.role === 'zone' && markIdx < freeMates.length && canPass && markIdx < defenders.length - 2) {
            const m = freeMates[markIdx++];
            moveTo(d, m.x + (ball.x - m.x) * 0.3, m.y + (ball.y - m.y) * 0.3, 24 + (o.keeper - 60) * 0.3, dt);
          } else if (d.role === 'zone') {
            if (d.t0 === undefined) { d.t0 = clamp((me.y - d.y) / (me.y - GOAL_Y), 0.15, 0.85); d.off = d.x - (me.x + (GOAL_CX - me.x) * d.t0); }
            const lx = me.x + (GOAL_CX - me.x) * d.t0 + d.off * 0.55;
            d.x += clamp(lx - d.x, -14 * dt, 14 * dt);
            if (kind === 'kontra') d.y += clamp(me.y - 90 - d.y, -10 * dt, 18 * dt) * 0.3; // geri koşar
          } else if (d.role === 'mark' && !d.fixed) {
            moveTo(d, me.x + 8, me.y + 14, 20, dt);
          }
          if (loose && loose.grace <= 0 && dist(d, ball) < BODY_R + BALL_R + 2) return finish('lost', 'Defans önce yetişti');
          // top kapma
          if (me.hasBall && dist(d, ball) < BODY_R + BALL_R + 3) {
            if (Math.random() < tackleP) return tackled(d);
            d.stun = 0.9;
            flash('Çalım!');
          }
        }

        // kaleci: top kaleye yaklaşınca çıkar
        if (loose && keeper.stun <= 0 && ball.y < GOAL_Y + 195 && elapsed > 0.4) {
          moveTo(keeper, ball.x, ball.y, keeperRun * 1.35, dt);
          if (dist(keeper, ball) < BODY_R + BALL_R + 2) return finish('saved', 'Kaleci önce davrandı');
        } else if (keeper.stun <= 0) {
          const dGoal = Math.hypot(GOAL_CX - ball.x, GOAL_Y - ball.y);
          const ang0 = Math.atan2(ball.y - GOAL_Y, ball.x - GOAL_CX), out0 = clamp(dGoal * 0.1, 4, 18);
          let tx = clamp(GOAL_CX + Math.cos(ang0) * out0, POST_L + 8, POST_R - 8), ty = GOAL_Y + 8 + Math.max(0, Math.sin(ang0) * out0 * 0.6);
          if (me.hasBall && canRun && (dGoal < 170 || kind === 'birebir')) {
            const a = Math.atan2(ball.y - GOAL_Y, ball.x - GOAL_CX);
            const out = Math.min(80, dGoal * 0.45);
            tx = GOAL_CX + Math.cos(a) * out; ty = GOAL_Y + 8 + Math.sin(a) * out;
          }
          moveTo(keeper, tx, ty, kind === 'birebir' ? keeperRun * 1.5 : dGoal < 170 ? keeperRun : 40, dt);
          if (me.hasBall && dist(keeper, ball) < BODY_R + BALL_R + 3) {
            if (Math.random() < tackleP + 0.2 + (o.keeper - 60) / 150) return finish('saved', 'Kaleci topu kaptı');
            keeper.stun = 1.0;
            flash('Kaleciyi geçtin!');
          }
        }

        // arkadaşlar
        for (const m of mates) {
          if (m.crosser || m.fixed) continue;
          // arkadaşlar ofsayt çizgisinde bekler; arada biri sabırsızlanıp çizgiyi geçer
          if (m.eager === undefined) m.eager = Math.random() < 0.3;
          const line = offsideY() + (m.eager && elapsed > 2.5 ? -14 : 6);
          if (m.run) moveTo(m, m.x, Math.max(130, me.y - 30, line), runSpeed * 0.9, dt);
          else {
            if (m.tx === null || Math.random() < dt * 0.5) { m.tx = clamp(m.x + rand(-25, 25), 40, 320); m.ty = clamp(m.y + rand(-20, 10), 90, 230); }
            moveTo(m, m.tx, Math.max(m.ty, line), m.y < line ? 40 : 18, dt);
          }
        }
      }

      if (phase === 'flying') {
        const s = shot;
        if (s.kind === 'shot' && s.cf) {
          const v = Math.hypot(s.vx, s.vy) || 1;
          s.vx += (-s.vy / v) * s.cf * dt;
          s.vy += (s.vx / v) * s.cf * dt;
          s.cf *= 1 - 1.2 * dt;
        }
        const drag = (s.kind === 'pass' ? 0.55 : 0.3) * (rain ? 0.6 : snow ? 1.6 : 1);
        s.vx *= 1 - drag * dt; s.vy *= 1 - drag * dt;
        ball.x += s.vx * dt; ball.y += s.vy * dt;
        trail.push({ x: ball.x, y: ball.y });
        if (trail.length > 14) trail.shift();

        // defans / baraj
        if (s.kind !== 'mateShot') {
          for (const d of defenders) {
            if (d.tested || dist(d, ball) >= BODY_R + BALL_R) continue;
            d.tested = true;
            let p = s.kind === 'pass' ? 0.5 : 0.5;
            if (d.role === 'wall') { if (s.wallTested) continue; s.wallTested = true; p = s.low ? 0.85 : s.curved ? 0.06 : 0.4; }
            if (d.stun > 0) p *= 0.3;
            if (Math.random() < p) { s.vx *= -0.25; s.vy *= -0.25; return finish(s.kind === 'pass' ? 'intercepted' : 'blocked', d.role === 'wall' ? 'Baraja çarptı' : undefined); }
          }
        }

        // ver-kaç: duvar arkadaş topu boşluğa geri verir
        if (s.kind === 'pass' && s.target.wall && dist(ball, s.target) < BODY_R + 5) {
          const P = { x: clamp(me.x + (GOAL_CX - me.x) * 0.35, 70, 290), y: clamp(me.y - rand(90, 115), GOAL_Y + 95, 230) };
          const fr = 1.1, T = 0.85, k = fr / (1 - Math.exp(-fr * T));
          loose = { vx: (P.x - ball.x) * k, vy: (P.y - ball.y) * k, fr, grace: 0.15 };
          path = [P]; shot = null; phase = 'aim'; trail = [];
          s.target.wall = false;
          const near = defenders.filter((d) => d.role !== 'wall').sort((a, b) => dist(a, me) - dist(b, me))[0];
          if (near) near.stun = 1.3;
          flash('Ver-kaç!'); Sfx.kick(0.4);
          return;
        }
        // pas ulaştı -> arkadaş vurur
        if (s.kind === 'pass' && dist(ball, s.target) < BODY_R + 5) {
          const dGoal = Math.hypot(GOAL_CX - ball.x, GOAL_Y - ball.y);
          const pGoal = clamp(0.92 - dGoal / 420 - o.keeper / 420 + st.pas / 450 + ((o.teamRel ?? 50) - 50) / 400, 0.15, 0.8);
          const scores = Math.random() < pGoal;
          const tx = scores ? (Math.random() < 0.5 ? POST_L + rand(6, 22) : POST_R - rand(6, 22)) : GOAL_CX + rand(-12, 12);
          const a = Math.atan2(GOAL_Y - 6 - ball.y, tx - ball.x);
          shot = { kind: 'mateShot', vx: Math.cos(a) * 520, vy: Math.sin(a) * 520, scores };
          Sfx.kick(0.8);
          keeperTargetX = scores ? (tx < GOAL_CX ? tx + 30 : tx - 30) : tx;
          keeperReactAt = elapsed + 0.1;
          return;
        }

        // kaleci
        if (s.kind !== 'pass' && elapsed >= keeperReactAt && keeper.stun <= 0) {
          if (kind !== 'penalti' && s.kind === 'shot' && s.vy < 0) {
            const t = (keeper.y - ball.y) / s.vy;
            const px = t > 0 ? ball.x + s.vx * t : ball.x;
            if (!s.tracked || Math.random() < dt * 4) s.tracked = true, keeperTargetX = clamp(px + gauss() * (110 - o.keeper) * 0.3, POST_L - 20, POST_R + 20);
          }
          const sp = kind === 'penalti' ? 280 : kind === 'serbest' ? keeperSpeed * 1.35 : s.kind === 'mateShot' ? keeperSpeed * 1.2 : keeperSpeed;
          keeper.x += clamp(keeperTargetX - keeper.x, -sp * dt, sp * dt);
          const want = clamp((keeperTargetX - keeper.x) / 14, -1, 1);
          keeper.dive = (keeper.dive || 0) + (want - (keeper.dive || 0)) * Math.min(1, dt * 10);
          if (s.kind === 'shot' && s.vy < 0 && dist(keeper, ball) < (kind === 'penalti' ? 15 : keeperReach)) {
            const speed = Math.hypot(s.vx, s.vy);
            const slip = speed > 560 && dist(keeper, ball) > keeperReach * 0.6 && Math.random() < 0.35;
            if (!slip && rain && Math.random() < 0.13) { flash('Kaleci kaçırdı!'); keeper.stun = 1; }
            else if (!slip) { s.vx *= 0.2; s.vy = 60; return finish('saved'); }
          }
        }

        // kale çizgisi
        if (ball.y <= GOAL_Y + 2 && s.vy < 0) {
          if (s.kind === 'mateShot') return finish(s.scores ? 'assist' : 'tmMiss');
          if (s.over) return finish('over');
          const nearPost = Math.abs(ball.x - POST_L) <= 3 || Math.abs(ball.x - POST_R) <= 3;
          if (nearPost) { s.vy *= -0.5; return finish('post'); }
          if (ball.x > POST_L + 2 && ball.x < POST_R - 2) return finish('goal');
          return finish('miss');
        }
        const v = Math.hypot(s.vx, s.vy);
        if (v < 40) return finish(s.kind === 'pass' ? 'intercepted' : 'saved', s.kind === 'pass' ? 'Pas kısa kaldı' : 'Zayıf şut, kaleci aldı');
        if (ball.x < -10 || ball.x > W + 10 || ball.y > H + 10) return finish(s.kind === 'pass' ? 'intercepted' : 'miss');
      }

      if (phase === 'done') {
        const good = outcome === 'goal' || outcome === 'assist';
        if (shot) {
          ball.x += shot.vx * dt * 0.3; ball.y += shot.vy * dt * 0.3; shot.vx *= 0.9; shot.vy *= 0.9;
          // gol: top filede kalır
          if (good && ball.y < GOAL_Y - GOAL_DEPTH + 4) { ball.y = GOAL_Y - GOAL_DEPTH + 4; shot.vy = 0; }
        }
        if (good) {
          // sevinç: köşe bayrağına koş, arkadaşlar yanına gelir
          const cx = me.x < GOAL_CX ? 18 : W - 18;
          moveTo(me, cx, GOAL_Y + 12, runSpeed * 1.1, dt);
          for (const m of mates) moveTo(m, me.x + (m.x < me.x ? -14 : 14), me.y + 12, runSpeed, dt);
          if (confetti.length < 140 && elapsed - outcomeAt < 0.6) spawnConfetti(6);
        }
        updateConfetti(dt);
        const wait = good && history.length > 10 ? 1.9 : 1.4;
        if (elapsed - outcomeAt > wait) {
          if (good && history.length > 10) startReplay();
          else end();
        }
      }
    }

    // ---------- efektler ----------
    let confetti = [];
    function spawnConfetti(n) {
      const cols = [...o.myColors, '#facc15', '#ffffff'];
      for (let i = 0; i < n; i++) {
        confetti.push({ x: rand(20, W - 20), y: rand(-20, 10), vx: rand(-30, 30), vy: rand(40, 120), r: rand(0, Math.PI), vr: rand(-6, 6), c: cols[i % cols.length], w: rand(3, 6), h: rand(5, 9) });
      }
    }
    function updateConfetti(dt) {
      for (const c of confetti) { c.x += c.vx * dt; c.y += c.vy * dt; c.r += c.vr * dt; c.vx += Math.sin(c.y / 20) * 10 * dt; }
      confetti = confetti.filter((c) => c.y < H + 10);
    }

    // ---------- tekrar ----------
    let history = [];
    let replay = null; // { frames, i }
    function snap() {
      return {
        ball: { x: ball.x, y: ball.y }, me: { x: me.x, y: me.y }, keeper: { x: keeper.x, y: keeper.y, dive: keeper.dive || 0 },
        defs: defenders.map((d) => ({ x: d.x, y: d.y })), mates: mates.map((m) => ({ x: m.x, y: m.y, name: m.name })),
        trail: trail.slice(), net: netAmp(),
      };
    }
    function startReplay() {
      // şuttan ~1.2 sn önce başlar, top fileye girdikten kısa süre sonra biter
      const from = Math.max(0, shotFrame - 70, goalFrame - 140);
      const frames = history.slice(from, Math.min(history.length, goalFrame + 30));
      replay = { frames, i: 0 };
      phase = 'replay';
    }
    function end() {
      cleanup();
      resolve({ outcome, text: msg, foul: foulInfo });
    }
    canvas.addEventListener('pointerdown', () => { if (phase === 'replay') end(); });

    // ---------- file dalgası ----------
    let netHitX = null, netHitAt = 0;
    function netAmp() {
      if (netHitX === null) return null;
      const t = elapsed - netHitAt;
      return { x: netHitX, a: 9 * Math.exp(-t * 2.2) * Math.cos(t * 14) };
    }

    // ---------- çizim ----------
    function circle(x, y, r, fill, stroke, lw = 2) {
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
      if (fill) { ctx.fillStyle = fill; ctx.fill(); }
      if (stroke) { ctx.lineWidth = lw; ctx.strokeStyle = stroke; ctx.stroke(); }
    }
    function drawPitch(net) {
      for (let i = 0; i < 12; i++) { ctx.fillStyle = i % 2 ? '#2f8f46' : '#2a8340'; ctx.fillRect(0, i * 45, W, 45); }
      ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, GOAL_Y); ctx.lineTo(W, GOAL_Y); ctx.stroke();
      ctx.strokeRect(60, GOAL_Y, 240, 150);
      ctx.strokeRect(120, GOAL_Y, 120, 45);
      circle(GOAL_CX, 150, 2, '#fff');
      ctx.beginPath(); ctx.arc(GOAL_CX, 150, 55, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke();
      ctx.beginPath(); ctx.arc(GOAL_CX, H + 30, 75, 1.15 * Math.PI, 1.85 * Math.PI); ctx.stroke();
      // kale + file (golde dalgalanır)
      const bulge = (x) => (net ? net.a * Math.exp(-((x - net.x) ** 2) / 500) : 0);
      const backY = (x) => GOAL_Y - GOAL_DEPTH - bulge(x);
      ctx.fillStyle = 'rgba(255,255,255,.12)';
      ctx.beginPath(); ctx.moveTo(POST_L, GOAL_Y);
      for (let x = POST_L; x <= POST_R; x += 4) ctx.lineTo(x, backY(x));
      ctx.lineTo(POST_R, GOAL_Y); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.28)'; ctx.lineWidth = 1;
      for (let x = POST_L; x <= POST_R; x += 8) { ctx.beginPath(); ctx.moveTo(x, backY(x)); ctx.lineTo(x, GOAL_Y); ctx.stroke(); }
      for (let k = 0; k <= 3; k++) {
        ctx.beginPath();
        for (let x = POST_L; x <= POST_R; x += 4) { const y = GOAL_Y - (GOAL_Y - backY(x)) * (k / 3); x === POST_L ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
        ctx.stroke();
      }
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(POST_L, GOAL_Y); ctx.lineTo(POST_L, GOAL_Y - GOAL_DEPTH); ctx.lineTo(POST_R, GOAL_Y - GOAL_DEPTH); ctx.lineTo(POST_R, GOAL_Y); ctx.stroke();
    }
    function drawKeeper(k) {
      const d = k.dive || 0;
      if (Math.abs(d) < 0.15) { circle(k.x, k.y, BODY_R, '#22d3a6', '#0f5132'); return; }
      // plonjon: yana uzanmış gövde + eldivenler
      ctx.save();
      ctx.translate(k.x, k.y);
      ctx.fillStyle = '#22d3a6'; ctx.strokeStyle = '#0f5132'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(d * 4, 0, BODY_R + Math.abs(d) * 8, BODY_R * 0.7, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      circle(d * (BODY_R + 12), -2, 3.5, '#f97316', '#7c2d12', 1.5);
      ctx.restore();
    }
    function drawScene(sc, live) {
      drawPitch(sc.net);
      if (live && path.length) {
        ctx.setLineDash([5, 6]); ctx.strokeStyle = 'rgba(250,204,21,.9)'; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(me.x, me.y);
        for (const p of path) ctx.lineTo(p.x, p.y);
        ctx.stroke(); ctx.setLineDash([]);
      }
      const [m1, m2] = o.myColors, [o1, o2] = o.oppColors;
      sc.defs.forEach((d, i) => {
        circle(d.x, d.y, BODY_R, o1, o2);
        if (live && defenders[i].stun > 0) { ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.font = '700 10px system-ui'; ctx.textAlign = 'center'; ctx.fillText('↯', d.x, d.y - 12); }
      });
      drawKeeper(sc.keeper);
      ctx.font = '600 9px system-ui'; ctx.textAlign = 'center';
      const showPass = live && phase === 'aim' && canPass && me.hasBall;
      const offY = showPass ? offsideY() : 0;
      if (showPass) {   // ofsayt çizgisi
        ctx.setLineDash([3, 7]); ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, offY); ctx.lineTo(W, offY); ctx.stroke(); ctx.setLineDash([]);
      }
      for (const m of sc.mates) {
        circle(m.x, m.y, BODY_R, m1, m2);
        if (showPass && !m.crosser) {
          const off = m.y < offY - 3 && m.y < ball.y - 4;
          circle(m.x, m.y, BODY_R + 5 + Math.sin(elapsed * 6) * 1.2, null, off ? 'rgba(239,68,68,.85)' : 'rgba(96,165,250,.9)', 2);
          ctx.fillStyle = off ? '#fca5a5' : '#bfdbfe'; ctx.font = '800 9px system-ui';
          ctx.fillText(off ? 'OFS' : 'PAS', m.x, m.y + 21);
          ctx.font = '600 9px system-ui';
        }
        ctx.fillStyle = '#fff'; ctx.fillText(m.name, m.x, m.y - 13);
      }
      circle(sc.me.x, sc.me.y, BODY_R, m1, m2);
      // kuşbakışı kafa: saç rengi (kelse ten rengi)
      const L = lookOf({ look: o.look });
      circle(sc.me.x, sc.me.y, 4.6, L.hair === 'kel' ? skinColor(L) : hairColor(L), 'rgba(0,0,0,.35)', 1);
      circle(sc.me.x, sc.me.y, BODY_R + 4, null, '#facc15', 2);
      ctx.fillStyle = '#facc15'; ctx.fillText('SEN', sc.me.x, sc.me.y + 22);
      for (let i = 0; i < sc.trail.length; i++) circle(sc.trail[i].x, sc.trail[i].y, BALL_R * (i / sc.trail.length), `rgba(255,255,255,${i / sc.trail.length * 0.5})`);
      circle(sc.ball.x, sc.ball.y, BALL_R, snow ? '#fb923c' : '#fff', '#111', 1);
      drawWeather();
    }
    // hava + saat: gece karartma, yağmur çizgileri, kar taneleri
    const flakes = Array.from({ length: snow ? 70 : rain ? 90 : 0 }, () => ({ x: rand(0, W), y: rand(0, H), s: rand(0.6, 1.4) }));
    function drawWeather() {
      const tod = weather.tod;
      if (tod === 'aksam') { ctx.fillStyle = 'rgba(120,60,20,.12)'; ctx.fillRect(0, 0, W, H); }
      else if (tod === 'gece') {
        ctx.fillStyle = 'rgba(5,10,40,.38)'; ctx.fillRect(0, 0, W, H);
        const g = ctx.createRadialGradient(GOAL_CX, 200, 40, GOAL_CX, 200, 380);
        g.addColorStop(0, 'rgba(255,255,230,.07)'); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      }
      if (!flakes.length) return;
      if (rain) {
        ctx.strokeStyle = 'rgba(200,220,255,.35)'; ctx.lineWidth = 1;
        ctx.beginPath();
        for (const f of flakes) {
          const y = (f.y + elapsed * 520 * f.s) % H, x = (f.x + elapsed * 60) % W;
          ctx.moveTo(x, y); ctx.lineTo(x - 3, y + 11);
        }
        ctx.stroke();
      } else {
        ctx.fillStyle = 'rgba(255,255,255,.85)';
        for (const f of flakes) {
          const y = (f.y + elapsed * 45 * f.s) % H, x = (f.x + Math.sin(elapsed * 1.5 + f.y) * 12 + W) % W;
          ctx.beginPath(); ctx.arc(x, y, 1.3 * f.s, 0, 6.3); ctx.fill();
        }
      }
    }
    function drawConfetti() {
      for (const c of confetti) {
        ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.r);
        ctx.fillStyle = c.c; ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h * Math.abs(Math.cos(c.r * 2)) + 1);
        ctx.restore();
      }
    }
    function draw() {
      ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
      const good = outcome === 'goal' || outcome === 'assist';

      if (phase === 'replay') {
        const f = replay.frames[Math.min(replay.frames.length - 1, Math.floor(replay.i))];
        drawScene(f, false);
        ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(0, 0, W, H);
        circle(22, 22, 6, (elapsed * 2) % 2 < 1 ? '#ef4444' : '#7f1d1d');
        ctx.fillStyle = '#fff'; ctx.font = '800 14px system-ui'; ctx.textAlign = 'left';
        ctx.fillText('TEKRAR', 34, 27);
        ctx.font = '600 11px system-ui'; ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fillRect(0, H - 34, W, 34);
        ctx.fillStyle = '#fff'; ctx.fillText('Geçmek için dokun', W / 2, H - 13);
        return;
      }

      // golde ekran sarsıntısı
      const shake = good && elapsed - outcomeAt < 0.35 ? (0.35 - (elapsed - outcomeAt)) * 14 : 0;
      if (shake) ctx.translate(rand(-shake, shake), rand(-shake, shake));
      drawScene({ ...snap(), trail }, true);

      if (loose && phase === 'aim') {
        circle(ball.x, ball.y, 11 + Math.sin(elapsed * 8) * 2, null, 'rgba(74,222,128,.9)', 2);
      }
      if (press && !press.won && phase === 'aim' && !press.pass) {
        const c = press.carrier;
        circle(c.x, c.y, BODY_R + 6 + Math.sin(elapsed * 7) * 1.5, null, 'rgba(239,68,68,.9)', 2);
        ctx.fillStyle = '#fca5a5'; ctx.font = '800 9px system-ui'; ctx.textAlign = 'center'; ctx.fillText('KAP', c.x, c.y + 22);
      }
      if (crossBall && phase === 'aim') {
        const d = dist(ball, me);
        const r = clamp(d * 0.5, 14, 80);
        circle(me.x, me.y, r, null, d < 30 ? '#4ade80' : 'rgba(255,255,255,.6)', d < 30 ? 4 : 2);
      }
      if (gesture && gesture.pts.length > 1 && gesture.mode !== 'path') {
        // nişan izi: renk = güç (yeşil hafif → sarı → kırmızı çok sert)
        const pw = clamp(releaseSpeed(gesture.pts) / 1.6, 0, 1);
        ctx.strokeStyle = gesture.nearMe && pw < 0.35 ? 'rgba(250,204,21,.55)' : pw < 0.45 ? 'rgba(74,222,128,.85)' : pw < 0.8 ? 'rgba(250,204,21,.9)' : 'rgba(239,68,68,.9)';
        ctx.lineWidth = 3 + pw * 3; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(gesture.pts[0].x, gesture.pts[0].y);
        for (const p of gesture.pts) ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
      drawConfetti();

      ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
      ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fillRect(0, H - 34, W, 34);
      ctx.fillStyle = '#fff'; ctx.font = '600 12px system-ui'; ctx.textAlign = 'center';
      if (phase === 'aim') ctx.fillText(`${o.minute}' ${HINTS[kind]}`, W / 2, H - 13);
      if (limit && phase === 'aim') {
        const pct = clamp(1 - elapsed / limit, 0, 1);
        ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.fillRect(20, H - 46, W - 40, 6);
        ctx.fillStyle = pct > 0.5 ? '#4ade80' : pct > 0.25 ? '#facc15' : '#ef4444';
        ctx.fillRect(20, H - 46, (W - 40) * pct, 6);
      }
      if (flashText && elapsed < flashUntil && phase === 'aim') {
        ctx.fillStyle = '#facc15'; ctx.font = '800 18px system-ui';
        ctx.fillText(flashText, me.x, me.y - 22);
      }
      if (phase === 'done') {
        const t = elapsed - outcomeAt;
        const pop = good ? 1 + 0.5 * Math.exp(-t * 5) * Math.abs(Math.cos(t * 12)) : 1;
        ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(0, H / 2 - 40, W, 80);
        ctx.save(); ctx.translate(W / 2, H / 2 + 10); ctx.scale(pop, pop);
        ctx.fillStyle = good ? '#facc15' : '#fff';
        ctx.font = `800 ${good ? 34 : 22}px system-ui`;
        if (good) { ctx.lineWidth = 5; ctx.strokeStyle = '#000'; ctx.strokeText(msg, 0, 0); }
        ctx.fillText(msg, 0, 0);
        ctx.restore();
      }
    }

    let raf = 0;
    let shotFrame = 0, goalFrame = 0;
    function loop(now) {
      // gerçek zamana bağlı: telefon yavaşlasa da oyun hızı sabit kalır (alt adımlarla)
      const real = Math.min(0.1, Math.max(0, (now - last) / 1000));
      last = now;
      const steps = Math.max(1, Math.ceil(real / 0.02));
      const dt = real / steps;
      if (phase === 'replay') {
        elapsed += dt;
        replay.i += 0.35 * dt * 60;            // ~1/3 hız
        if (replay.i >= replay.frames.length + 25) end();
      } else {
        const before = phase;
        for (let k = 0; k < steps && phase !== 'replay'; k++) update(dt);
        if (before === 'aim' && phase === 'flying') shotFrame = history.length;
        if (phase !== 'replay') history.push(snap());
        if (history.length > 400) { history.shift(); shotFrame--; goalFrame--; }
        if (before !== 'done' && phase === 'done') goalFrame = history.length;
      }
      if (raf !== -1) draw();
      if (raf !== -1) raf = requestAnimationFrame(loop);
    }
    function cleanup() {
      cancelAnimationFrame(raf);
      raf = -1;
      window.removeEventListener('resize', resize);
    }
    raf = requestAnimationFrame(loop);
  });
}
