// Gazino ekranının oyun gövdeleri ve animasyonları (rulet, 21, slot, poker, barbut, kazı kazan).
// main.js ekran HTML'ini üretir; animasyonlar render sonrası afterRender() ile bağlanır.
import * as C from './casino.js';
import * as Life from './life.js';

let X = null;   // { st(), ui, persist, render, toast, money, esc }
export function init(ctx) { X = ctx; }
const ui = () => X.ui;
const P = () => X.st().player;
const short = (n) => X.moneyShort ? X.moneyShort(n, false) : String(n);
// animasyon bitene kadar kazanç tepedeki bakiyede görünmesin
export const hidden = () => ui().casHide || 0;
function pay(delta) { Life.casinoResult(X.st(), delta); X.persist(); }
function hideUntil(amount, ms, after) {
  ui().casHide = (ui().casHide || 0) + amount;
  setTimeout(() => { ui().casHide = Math.max(0, (ui().casHide || 0) - amount); after?.(); X.render(); }, ms);
}

export const TABS = [['bahis', '🎟️ Bahis'], ['rulet', '🎡 Rulet'], ['blackjack', '🃏 21'], ['slot', '🎰 Slot'], ['poker', '♠️ Poker'], ['barbut', '🎲 Barbut'], ['kazi', '🎫 Kazı kazan']];

// =============================================================== RULET
function rl() { return ui().rl ??= { bets: {}, hist: [], last: null, spin: null, res: null, log: [] }; }
const chip = (k) => { const v = rl().bets[k]; return v ? `<em class="chip">${short(v)}</em>` : ''; };
const cell = (k, label, cls = '', style = '') => `<button class="rc ${cls}" style="${style}" data-act="rBet" data-k="${k}">${label}${chip(k)}</button>`;
function rouletteBody(stakeBar) {
  const r = rl(), total = C.betTotal(r.bets), spinning = !!r.spin;
  let g = cell('n0', '0', 'green', 'grid-column:3/6;grid-row:1');
  for (let row = 1; row <= 12; row++) for (let c = 1; c <= 3; c++) {
    const n = (row - 1) * 3 + c;
    g += cell('n' + n, n, C.colorOf(n), `grid-column:${c + 2};grid-row:${row + 1}`);
  }
  ['d1', 'd2', 'd3'].forEach((k, i) => { g += cell(k, `${i + 1}.<br>12`, 'out v', `grid-column:2;grid-row:${2 + i * 4}/span 4`); });
  [['low', '1<br>18'], ['even', 'ÇİFT'], ['red', '<i class="dia r"></i>'], ['black', '<i class="dia b"></i>'], ['odd', 'TEK'], ['high', '19<br>36']]
    .forEach(([k, l], i) => { g += cell(k, l, 'out v', `grid-column:1;grid-row:${2 + i * 2}/span 2`); });
  ['c1', 'c2', 'c3'].forEach((k, i) => { g += cell(k, '2:1', 'out', `grid-column:${i + 3};grid-row:14`); });
  const res = r.res && !spinning ? r.res : null;
  return `${stakeBar}
    <div class="card center rlcard">
      <canvas id="rwheel" width="520" height="520"></canvas>
      <div class="rlhist">${r.hist.slice(0, 12).map((n) => `<span class="${C.colorOf(n)}">${n}</span>`).join('') || '<em class="muted small">Son sayılar burada</em>'}</div>
      ${res ? `<p class="${res.win >= res.total ? 'win' : 'lose'}">${res.n} ${{ red: 'Kırmızı', black: 'Siyah', green: 'Yeşil' }[C.colorOf(res.n)]} · ${res.win >= res.total ? `Kazandın +${X.money(res.win - res.total)}` : res.win > 0 ? `${X.money(res.win)} geri geldi · net −${X.money(res.total - res.win)}` : `Kaybettin −${X.money(res.total)}`}</p>` : spinning ? '<p class="muted">Top dönüyor…</p>' : '<p class="muted small">Fişi seç, masada istediğin yerlere dokun. Birden çok bahis olur.</p>'}
    </div>
    <div class="rtable ${spinning ? 'lock' : ''}">${g}</div>
    <div class="row rlbar">
      <button class="btn ghost" data-act="rUndo" ${!r.log.length || spinning ? 'disabled' : ''}>↶ Geri</button>
      <button class="btn ghost" data-act="rClear" ${!total || spinning ? 'disabled' : ''}>Temizle</button>
      ${!total && r.last ? `<button class="btn ghost" data-act="rRepeat" ${spinning ? 'disabled' : ''}>Tekrarla</button>` : ''}
    </div>
    <button class="btn big" data-act="rSpin" ${!total || spinning ? 'disabled' : ''}>${spinning ? 'Dönüyor…' : total ? `Çevir · ${X.money(total)}` : 'Önce masaya fiş koy'}</button>
    <p class="muted small center">Tek sayı 35:1 · Düzine / sütun 2:1 · Renk, tek-çift, 1-18 / 19-36 1:1</p>`;
}
function rouletteAct(act, el) {
  const r = rl();
  if (r.spin) return;
  if (act === 'rBet') {
    const total = C.betTotal(r.bets) + ui().stake;
    if (total > P().money) return X.toast('Bu kadar fişe paran yetmiyor.');
    r.bets[el.dataset.k] = (r.bets[el.dataset.k] || 0) + ui().stake; r.log.push([el.dataset.k, ui().stake]); r.res = null;
  } else if (act === 'rUndo') { const [k, v] = r.log.pop() || []; if (k) { r.bets[k] -= v; if (r.bets[k] <= 0) delete r.bets[k]; } }
  else if (act === 'rClear') { r.bets = {}; r.log = []; }
  else if (act === 'rRepeat') {
    if (C.betTotal(r.last) > P().money) return X.toast('Aynı bahse paran yetmiyor.');
    r.bets = { ...r.last }; r.log = Object.entries(r.bets);
  } else if (act === 'rSpin') {
    const total = C.betTotal(r.bets);
    if (!total || total > P().money) return X.toast('Paran yetmiyor.');
    const n = C.spinWheel(), win = C.rouletteReturn(r.bets, n);
    pay(win - total);
    r.last = { ...r.bets };
    r.spin = { n, t0: performance.now(), dur: 5200, w0: r.wAng || 0, b0: Math.random() * Math.PI * 2 };
    hideUntil(win, r.spin.dur + 150, () => { r.hist.unshift(n); r.res = { n, win, total }; r.bets = {}; r.log = []; r.wAng = r.spin.wEnd; r.spin = null; });
    X.render();
    document.getElementById('rwheel')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    requestAnimationFrame(wheelLoop);
    return;
  } else return false;
  X.render();
}
const ease = (t) => 1 - Math.pow(1 - t, 3);
function wheelLoop() {
  const r = rl();
  if (!r.spin) return drawWheel(r.wAng || 0, null);
  const s = r.spin, t = Math.min(1, (performance.now() - s.t0) / s.dur);
  const pIdx = C.WHEEL.indexOf(s.n), step = (Math.PI * 2) / 37;
  s.wEnd ??= s.w0 + Math.PI * 2 * 3;
  const w = s.w0 + (s.wEnd - s.w0) * ease(t);
  // top tekerleğe göre ters yönde döner, %90'da cebe oturur ve sonra tekerlekle birlikte döner
  const relEnd = pIdx * step + step / 2 - Math.PI / 2;
  const tb = Math.min(1, t / 0.9);
  const rel = relEnd + Math.PI * 2 * 9 * (1 - (1 - Math.pow(1 - tb, 2.4)));
  const b = w + rel;
  const rad = tb < 0.6 ? 1 : tb < 1 ? 1 - (tb - 0.6) / 0.4 * 0.22 + Math.abs(Math.sin(tb * 40)) * 0.05 * (1 - tb) : 0.78;
  drawWheel(w, { a: b, rad });
  if (t < 1) requestAnimationFrame(wheelLoop);
}
function drawWheel(w, ball) {
  const cv = document.getElementById('rwheel'); if (!cv) return;
  const g = cv.getContext('2d'), S = cv.width, c = S / 2, R = S * 0.46, step = (Math.PI * 2) / 37;
  g.clearRect(0, 0, S, S);
  // dış ahşap
  g.beginPath(); g.arc(c, c, R + 14, 0, Math.PI * 2); g.fillStyle = '#5b3a1a'; g.fill();
  g.beginPath(); g.arc(c, c, R + 4, 0, Math.PI * 2); g.fillStyle = '#2b1a0b'; g.fill();
  for (let i = 0; i < 37; i++) {
    const n = C.WHEEL[i], a0 = w + i * step - Math.PI / 2, a1 = a0 + step;
    g.beginPath(); g.moveTo(c, c); g.arc(c, c, R, a0, a1); g.closePath();
    g.fillStyle = n === 0 ? '#15803d' : C.colorOf(n) === 'red' ? '#b91c1c' : '#111827'; g.fill();
    g.strokeStyle = '#d4a017'; g.lineWidth = 1.5; g.stroke();
    g.save(); g.translate(c, c); g.rotate(a0 + step / 2); g.fillStyle = '#fff'; g.font = `bold ${S * 0.034}px system-ui`;
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.translate(R * 0.88, 0); g.rotate(Math.PI / 2); g.fillText(n, 0, 0); g.restore();
  }
  // iç göbek
  g.beginPath(); g.arc(c, c, R * 0.72, 0, Math.PI * 2); g.fillStyle = '#3f2a14'; g.fill(); g.strokeStyle = '#d4a017'; g.lineWidth = 3; g.stroke();
  g.beginPath(); g.arc(c, c, R * 0.5, 0, Math.PI * 2); g.fillStyle = '#6b4a22'; g.fill();
  g.save(); g.translate(c, c); g.rotate(w);
  for (let k = 0; k < 4; k++) { g.rotate(Math.PI / 2); g.fillStyle = '#d4a017'; g.fillRect(-4, -R * 0.48, 8, R * 0.42); }
  g.beginPath(); g.arc(0, 0, R * 0.1, 0, Math.PI * 2); g.fillStyle = '#facc15'; g.fill(); g.restore();
  // top
  if (ball || rl().hist.length) {
    let a, rad;
    if (ball) { a = ball.a; rad = ball.rad; }
    else { const n = rl().hist[0]; a = w + C.WHEEL.indexOf(n) * step + step / 2 - Math.PI / 2; rad = 0.78; }
    const br = R * (ball ? rad : 0.78) + (rad === 1 ? 8 : 0);
    g.beginPath(); g.arc(c + Math.cos(a) * br, c + Math.sin(a) * br, S * 0.018, 0, Math.PI * 2);
    g.fillStyle = '#f8fafc'; g.shadowColor = '#000'; g.shadowBlur = 6; g.fill(); g.shadowBlur = 0;
  }
}

// =============================================================== 21
const isRed = (c) => '♥♦'.includes(c.s);
const PIPS = { A: 1, J: 0, Q: 0, K: 0 };
function cardHtml(c, cls = '', delay = 0) {
  if (!c) return `<div class="pc back ${cls}" style="animation-delay:${delay}ms"></div>`;
  const face = { J: '🤵', Q: '👸', K: '🤴' }[c.r];
  const n = PIPS[c.r] ?? +c.r;
  const center = face ? `<span class="face">${face}</span>` : n === 1 ? `<span class="ace">${c.s}</span>` : `<span class="pips p${n}">${Array(n).fill(`<b>${c.s}</b>`).join('')}</span>`;
  return `<div class="pc ${isRed(c) ? 'red' : ''} ${cls}" style="animation-delay:${delay}ms"><i class="tl">${c.r}<br>${c.s}</i><span class="cs">${c.s}</span>${center}<i class="br">${c.r}<br>${c.s}</i></div>`;
}
export { cardHtml };
function handHtml(cards, seenKey, g, hideHole = false, dealer = false) {
  const seen = g[seenKey] || 0;
  let k = 0;
  const html = cards.map((c, i) => {
    const fresh = i >= seen;
    const hole = hideHole && i === 1;
    const flip = dealer && !hideHole && i === 1 && g.holeHidden;
    return cardHtml(hole ? null : c, fresh ? 'deal' : flip ? 'flip' : '', fresh ? 120 + (k++) * 380 + (seenKey === 'sd' ? 190 : 0) : flip ? 0 : 0);
  }).join('');
  g[seenKey] = cards.length;
  return html;
}
function bjBody(stakeBar) {
  const g = ui().bj;
  let html = '';
  if (g) {
    const hide = !g.done;
    const dv = g.done ? Life.handValue(g.dealer) : Life.handValue([g.dealer[0]]);
    const dealer = handHtml(g.dealer, 'sd', g, hide, true);
    if (!hide) g.holeHidden = false; else g.holeHidden = true;
    if (g.msg) setTimeout(() => { g.msgShown = true; }, 0);
    html = `<div class="felt">
      <div class="bjlbl">Krupiye <b>${dv}</b></div><div class="hand2">${dealer}</div>
      <div class="bjmid">${g.msg ? `<span class="bjmsg ${g.win > 0 ? 'win' : g.win === 0 ? '' : 'lose'}" style="animation-delay:${g.msgShown ? 0 : 250 + Math.max(0, g.dealer.length - 2) * 380}ms">${X.esc(g.msg)}</span>` : 'Krupiye 17\'de durur · Blackjack 3:2'}</div>
      <div class="hand2">${handHtml(g.player, 'sp', g)}</div><div class="bjlbl">Sen <b>${Life.handValue(g.player)}</b> · Bahis ${X.money(g.stake)}</div>
    </div>`;
  } else html = `<div class="felt"><div class="bjmid big">🃏 21'e en yakın olan kazanır<br><small>Blackjack 3:2 öder · Krupiye 17'de durur</small></div></div>`;
  const canDouble = g && !g.done && g.player.length === 2 && P().money >= g.stake;
  return `${stakeBar}<div class="card bj2">${html}
    <div class="evbtns mt">${!g || g.done ? `<button class="btn big" data-act="bjDeal">Dağıt (${X.money(ui().stake)})</button>`
      : `<button class="btn" data-act="bjHit">Kart çek</button><button class="btn ghost" data-act="bjStand">Dur</button>${canDouble ? `<button class="btn ghost" data-act="bjDouble">2× Katla</button>` : ''}`}</div></div>`;
}
export function bjFinish(g, natural = false) {
  if (!g || g.done) return;
  const pv = Life.handValue(g.player);
  if (pv <= 21 && !natural) while (Life.handValue(g.dealer) < 17) g.dealer.push(g.deck.pop());
  const dv = Life.handValue(g.dealer);
  let back = 0;
  if (natural && !(dv === 21 && g.dealer.length === 2)) { back = Math.round(g.stake * 2.5); g.msg = 'BLACKJACK! 🎉'; }
  else if (natural) { back = g.stake; g.msg = 'İkiniz de blackjack — berabere'; }
  else if (pv > 21) g.msg = 'Battın (21\'i geçti)';
  else if (dv > 21) { back = g.stake * 2; g.msg = 'Krupiye battı, kazandın!'; }
  else if (pv > dv) { back = g.stake * 2; g.msg = 'Kazandın!'; }
  else if (pv === dv) { back = g.stake; g.msg = 'Berabere, paran iade'; }
  else g.msg = 'Krupiye kazandı';
  g.win = back - g.stake;
  g.done = true;
  if (back) pay(back);
  // krupiyenin çektiği kartlar görünene kadar kazancı sakla
  const extra = Math.max(0, g.dealer.length - 2);
  if (back && extra) hideUntil(back, 400 + extra * 380, null);
}
function bjAct(act) {
  const s = ui();
  if (act === 'bjDeal') {
    if (s.stake > P().money) return X.toast('Paran yetmiyor.');
    const deck = Life.newDeck();
    const g = s.bj = { deck, player: [deck.pop()], dealer: [deck.pop()], stake: s.stake, done: false, sp: 0, sd: 0 };
    g.player.push(deck.pop()); g.dealer.push(deck.pop());
    pay(-g.stake);
    if (Life.handValue(g.player) === 21) bjFinish(g, true);
  } else if (act === 'bjHit') { const g = s.bj; g.player.push(g.deck.pop()); if (Life.handValue(g.player) >= 21) bjFinish(g); }
  else if (act === 'bjStand') bjFinish(s.bj);
  else if (act === 'bjDouble') {
    const g = s.bj; if (P().money < g.stake) return X.toast('Paran yetmiyor.');
    pay(-g.stake); g.stake *= 2; g.player.push(g.deck.pop()); bjFinish(g);
  } else return false;
  X.render();
}

// =============================================================== SLOT
const SYMS = ['⚽', '🍒', '🍋', '⭐', '🔔', '7️⃣'];
function slotBody(stakeBar) {
  const s = ui().slot;
  const reels = (s?.reels || ['7️⃣', '7️⃣', '7️⃣']).map((x, i) => {
    if (s?.anim) {
      const strip = s.strips[i];
      return `<div class="reel"><div class="strip spin" style="--n:${strip.length - 1};animation-duration:${700 + i * 320}ms">${strip.map((y) => `<span>${y}</span>`).join('')}</div></div>`;
    }
    return `<div class="reel"><div class="strip"><span class="${s && s.mult > 0 && (s.mult >= 5 ? true : s.reels.filter((y) => y === x).length > 1) ? 'hit' : ''}">${x}</span></div></div>`;
  }).join('');
  return `${stakeBar}<div class="card center slotm">
    <div class="slotlights">${'●'.repeat(9)}</div>
    <div class="reels2">${reels}<div class="payline"></div></div>
    ${s && !s.anim ? `<p class="${s.mult > 0 ? 'win' : 'lose'}">${s.mult > 0 ? `${s.mult >= 20 ? '💰 JACKPOT! ' : ''}×${String(s.mult).replace('.', ',')} · ${X.money(Math.round(s.stake * s.mult))}` : 'Olmadı'}</p>` : s?.anim ? '<p class="muted">Makaralar dönüyor…</p>' : '<p class="muted small">Kolu çek!</p>'}
    <button class="btn big" data-act="slot" ${s?.anim ? 'disabled' : ''}>🎰 Çevir (${X.money(ui().stake)})</button>
    <p class="muted small">3 aynı: ⚽×5 🍒×8 🍋×10 ⭐×20 🔔×30 7️⃣×100 · 2 aynı: ×1,5</p>
  </div>`;
}
function slotAct(act) {
  if (act !== 'slot') return false;
  const s = ui();
  if (s.slot?.anim) return;
  if (s.stake > P().money) return X.toast('Paran yetmiyor.');
  const r = Life.spinSlot();
  const win = Math.round(s.stake * r.mult);
  pay(win - s.stake);
  const strips = r.reels.map((end, i) => { const n = 14 + i * 6; const a = Array.from({ length: n }, () => SYMS[Math.floor(Math.random() * 6)]); a.push(end); return a; });
  s.slot = { ...r, stake: s.stake, strips, anim: true };
  hideUntil(win, 700 + 2 * 320 + 120, () => { s.slot.anim = false; });
  X.render();
}

// =============================================================== BARBUT
const DIE = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
function barbutBody(stakeBar) {
  const b = ui().barbut;
  const rolls = b ? b.res.rolls.slice(0, b.shown) : [];
  const last = rolls[rolls.length - 1];
  const done = b && b.done;
  const next = b && !done ? b.res.rolls[b.shown] : null;      // sıradaki atış kimin
  const btn = !b || done
    ? `<button class="btn big" data-act="barbut">🎲 ${b ? 'Yeni el' : 'Oyuna başla'} (${X.money(ui().stake)})</button>`
    : next?.who === 'sen'
      ? `<button class="btn big" data-act="barbutRoll">🎲 Zarı at!</button>`
      : `<button class="btn big" disabled>🏦 Kasa zar atıyor…</button>`;
  return `${stakeBar}<div class="card center barbut">
    <div class="dice ${b?.anim ? 'roll' : ''}" ${b ? `data-k="${b.shown}"` : ''}>${last ? `<span>${DIE[last.d[0]]}</span><span>${DIE[last.d[1]]}</span>` : '<span>⚅</span><span>⚄</span>'}</div>
    ${last ? `<p class="bwho">${last.who === 'sen' ? '🙋 Sen attın' : '🏦 Kasa attı'}: <b>${last.d[0]}-${last.d[1]}</b>${last.res ? '' : ' · sıra karşıda'}</p>` : b ? `<p class="bwho">${next?.who === 'sen' ? 'İlk atış senin!' : 'İlk atış kasanın.'} Masada ${X.money(b.stake)}</p>` : ''}
    ${done ? `<p class="${b.res.win ? 'win' : 'lose'}">${b.res.win ? `Kazandın! +${X.money(b.stake)}` : `Kaybettin −${X.money(b.stake)}`}</p>` : ''}
    <div class="blog">${rolls.map((r) => `<span class="${r.res ? (r.res === 'win' ? 'w' : 'l') : ''}">${r.who === 'sen' ? 'Sen' : 'Kasa'} ${r.d.join('-')}</span>`).join('')}</div>
    ${btn}
    <p class="muted small">Atan için kazandırır: 3-3, 5-5, 6-6, 6-5 · Kaybettirir: 1-1, 2-2, 4-4, 1-2.<br>Diğer atışlarda sıra karşıya geçer. Kazanç 1:1.</p>
  </div>`;
}
// Bir atışı göster; sonuç belli olunca parayı öde, sıra kasadaysa kendisi atar
function barbutStep(b) {
  const s = ui();
  if (s.barbut !== b || b.done || b.busy) return;
  b.busy = true; b.anim = true; X.render();
  setTimeout(() => {
    if (s.barbut !== b) return;
    b.busy = false; b.anim = false;
    b.shown++;
    const r = b.res.rolls[b.shown - 1];
    if (r.res || b.shown >= b.res.rolls.length) {
      b.done = true;
      if (b.res.win) pay(b.stake * 2);
    } else if (b.res.rolls[b.shown].who === 'kasa') setTimeout(() => barbutStep(b), 700);
    X.render();
  }, 550);
}
function barbutAct(act) {
  if (act !== 'barbut' && act !== 'barbutRoll') return false;
  const s = ui();
  if (act === 'barbutRoll') { if (s.barbut && !s.barbut.done && s.barbut.res.rolls[s.barbut.shown]?.who === 'sen') barbutStep(s.barbut); return; }
  if (s.barbut && !s.barbut.done) return;
  if (s.stake > P().money) return X.toast('Paran yetmiyor.');
  const res = C.playBarbut();
  const b = s.barbut = { res, shown: 0, stake: s.stake, done: false };
  pay(-b.stake);                       // bahis masaya konur
  if (res.rolls[0].who === 'kasa') setTimeout(() => barbutStep(b), 600);
  else barbutStep(b);                   // oyunu başlatan basış ilk zarı da atar
  X.render();
}

// =============================================================== KAZI KAZAN
const TICKETS_TRY = [[10_000, 'Bronz'], [100_000, 'Gümüş'], [1_000_000, 'Altın'], [10_000_000, 'Elmas']];
const TICKETS_EUR = [[200, 'Bronz'], [2_000, 'Gümüş'], [20_000, 'Altın'], [200_000, 'Elmas']].map(([v, n]) => [v * 55.5, n]);
let TICKETS = TICKETS_EUR;
const tickets = () => (TICKETS = X?.cur?.() === 'TRY' ? TICKETS_TRY : TICKETS_EUR);
function scratchBody() {
  const k = ui().kazi;
  tickets();
  if (!TICKETS.some((t) => t[0] === ui().kaziPrice)) ui().kaziPrice = TICKETS[0][0];
  const price = ui().kaziPrice;
  const tiers = `<div class="stakes">${TICKETS.map(([v, n]) => `<button class="${v === price ? 'on' : ''}" data-act="kPrice" data-v="${v}" ${v > Math.max(P().money, TICKETS[0][0]) ? 'disabled' : ''}>${n} ${short(v)}</button>`).join('')}</div>`;
  if (!k) return `${tiers}<div class="card center"><div class="ticket blank"><b>GOL YILDIZI</b><span>KAZI KAZAN</span><small>3 aynı sembol = ikramiye</small></div>
    <button class="btn big" data-act="kBuy">Bilet al (${X.money(price)})</button>${prizeList(price)}</div>`;
  return `${tiers}<div class="card center">
    <div class="ticket"><div class="tk-head"><b>GOL YILDIZI · ${TICKETS_TRY.concat(TICKETS_EUR).find((t) => t[0] === k.price)?.[1] || ''}</b><small>Parmağınla kazı</small></div>
      <div class="tk-grid" id="tkGrid">${k.cells.map((s, i) => `<div class="tk-cell ${k.done && s === k.sym ? 'hit' : ''}">${s}</div>`).join('')}<canvas id="tkCanvas"></canvas></div></div>
    ${k.done ? `<p class="${k.win ? 'win' : 'lose'}">${k.win ? `${k.sym}${k.sym}${k.sym} Kazandın ${X.money(k.price * k.win)}!` : 'Boş çıktı'}</p>
      <button class="btn big" data-act="kBuy">Yeni bilet (${X.money(price)})</button>`
      : `<button class="btn ghost" data-act="kAll">Hepsini aç</button>`}
    ${prizeList(k.price)}</div>`;
}
const prizeList = (price) => `<p class="muted small">${C.SCRATCH.map((x) => `${x.s}×3 → ${short(price * x.mult)}`).join(' · ')}</p>`;
function scratchAct(act, el) {
  const s = ui();
  if (act === 'kPrice') { s.kaziPrice = +el.dataset.v; }
  else if (act === 'kBuy') {
    const price = s.kaziPrice ?? 10_000;
    if (price > P().money) return X.toast('Paran yetmiyor.');
    const t = C.newTicket(); t.price = price;
    const win = price * t.win;
    pay(win - price);
    s.casHide = (s.casHide || 0) + win; t.hidden = win;
    s.kazi = t;
  } else if (act === 'kAll') { revealAll(); return; }
  else return false;
  X.render();
}
function revealAll() {
  const k = ui().kazi; if (!k || k.done) return;
  k.revealed.fill(true); k.done = true;
  ui().casHide = Math.max(0, (ui().casHide || 0) - (k.hidden || 0)); k.hidden = 0;
  X.render();
}
function bindScratch() {
  const k = ui().kazi, cv = document.getElementById('tkCanvas'), grid = document.getElementById('tkGrid');
  if (!k || k.done || !cv || !grid) return;
  const w = grid.clientWidth, h = grid.clientHeight;
  cv.width = w; cv.height = h;
  const g = cv.getContext('2d');
  const cw = w / 3, ch = h / 3;
  for (let i = 0; i < 9; i++) {
    if (k.revealed[i]) continue;
    const x = (i % 3) * cw, y = Math.floor(i / 3) * ch;
    const grd = g.createLinearGradient(x, y, x + cw, y + ch);
    grd.addColorStop(0, '#9ca3af'); grd.addColorStop(0.5, '#e5e7eb'); grd.addColorStop(1, '#9ca3af');
    g.fillStyle = grd; g.fillRect(x + 3, y + 3, cw - 6, ch - 6);
    g.fillStyle = '#6b7280'; g.font = `bold ${ch * 0.35}px system-ui`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('★', x + cw / 2, y + ch / 2);
  }
  g.globalCompositeOperation = 'destination-out';
  let down = false, last = null, moves = 0;
  const at = (e) => { const b = cv.getBoundingClientRect(); return [(e.clientX - b.left) * (w / b.width), (e.clientY - b.top) * (h / b.height)]; };
  const scratch = (p) => {
    g.lineWidth = 26; g.lineCap = 'round';
    g.beginPath(); g.moveTo(...(last || p)); g.lineTo(...p); g.stroke();
    last = p;
    if (++moves % 6 === 0) check();
  };
  const check = () => {
    const data = g.getImageData(0, 0, w, h).data;
    let changed = false;
    for (let i = 0; i < 9; i++) {
      if (k.revealed[i]) continue;
      const x0 = Math.floor((i % 3) * cw), y0 = Math.floor(Math.floor(i / 3) * ch);
      let clear = 0, tot = 0;
      for (let y = y0 + 4; y < y0 + ch - 4; y += 4) for (let x = x0 + 4; x < x0 + cw - 4; x += 4) { tot++; if (data[(Math.floor(y) * w + Math.floor(x)) * 4 + 3] < 40) clear++; }
      if (clear / tot > 0.45) { k.revealed[i] = true; changed = true; g.fillRect(x0, y0, Math.ceil(cw), Math.ceil(ch)); }
    }
    if (changed && k.revealed.every(Boolean)) revealAll();
  };
  cv.addEventListener('pointerdown', (e) => { down = true; last = null; cv.setPointerCapture(e.pointerId); scratch(at(e)); });
  cv.addEventListener('pointermove', (e) => { if (down) scratch(at(e)); });
  const up = () => { if (down) { down = false; check(); } };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
}

// =============================================================== POKER
function pokerBody(stakeBar) {
  const pk = ui().pk;
  if (!pk) {
    const buy = ui().stake * 10;
    return `${stakeBar}<div class="card center"><div class="felt poker0">♠️♥️ Texas Hold'em ♦️♣️<br><small>3 rakiple masaya otur. Elinin iki kartı + ortadaki beş kart, en iyi 5'li kazanır.</small></div>
      <p>Giriş (buy-in): <b>${X.money(buy)}</b> · Kör: ${X.money(Math.round(buy / 100))}/${X.money(Math.round(buy / 50))}</p>
      <button class="btn big" data-act="pkSit" ${buy > P().money ? 'disabled' : ''}>Masaya otur</button>
      ${buy > P().money ? '<p class="lose small">Bu giriş için paran yetmiyor, daha küçük fiş seç.</p>' : ''}
      <p class="muted small">Giriş, seçili fişin 10 katıdır. Her elin kâr/zararı bakiyene işlenir.</p></div>`;
  }
  const T = pk.T, h = T.hand, showdown = h?.done && h.ps.filter((p) => !p.folded).length > 1;
  const seat = (i) => {
    const pl = T.players[i], hp = h?.ps[i];
    const turn = h && !h.done && h.cur === i;
    const w = h?.winners?.find((x) => x.i === i);
    const cards = hp ? (pl.me || (showdown && !hp.folded) ? hp.cards.map((c) => cardHtml(c, 'sm')).join('') : hp.folded ? '' : cardHtml(null, 'sm') + cardHtml(null, 'sm')) : '';
    const tag = i === T.dealer ? '<em class="dbtn">D</em>' : '';
    return `<div class="seat ${pl.me ? 'me' : ''} ${turn ? 'turn' : ''} ${hp?.folded ? 'fold' : ''} ${w ? 'won' : ''}">
      <div class="sname">${tag}${X.esc(pl.name)}</div><div class="scards">${cards}</div>
      <div class="sstack">${X.money(pl.stack)}${hp?.bet ? ` · <b>${short(hp.bet)}</b>` : ''}${hp?.allIn ? ' · ALL-IN' : ''}${w ? ` · 🏆 +${short(w.amt)}` : ''}</div>
      ${showdown && !hp.folded && hp.score ? `<div class="shand">${C.handName(hp.score)}</div>` : ''}</div>`;
  };
  let actions = '';
  if (h && C.isMyTurn(T)) {
    const L = C.legal(T);
    const half = Math.max(L.minRaiseTo, h.toCall + Math.round(h.pot / 2)), potTo = Math.max(L.minRaiseTo, h.toCall + h.pot + L.call);
    const canRaise = L.maxTo > h.toCall;
    actions = `<div class="pkact">
      <button class="btn ghost" data-act="pkMove" data-m="fold" ${L.canCheck ? 'disabled' : ''}>Kart at</button>
      <button class="btn" data-act="pkMove" data-m="call">${L.canCheck ? 'Pas' : `Gör ${short(L.call)}`}</button></div>
      ${canRaise ? `<div class="pkact">
      ${L.minRaiseTo < L.maxTo ? `<button class="btn ghost" data-act="pkMove" data-m="raise" data-to="${L.minRaiseTo}">Yükselt ${short(L.minRaiseTo)}</button>` : ''}
      ${half < L.maxTo && half > L.minRaiseTo ? `<button class="btn ghost" data-act="pkMove" data-m="raise" data-to="${half}">½ Pot</button>` : ''}
      ${potTo < L.maxTo && potTo > half ? `<button class="btn ghost" data-act="pkMove" data-m="raise" data-to="${potTo}">Pot</button>` : ''}
      <button class="btn red" data-act="pkMove" data-m="raise" data-to="${L.maxTo}">All-in</button></div>` : ''}`;
  } else if (h?.done) {
    actions = T.players[0].stack > 0 ? `<button class="btn big" data-act="pkNext">Sonraki el</button>` : `<p class="lose">Fişlerin bitti.</p><button class="btn big" data-act="pkRebuy" ${T.buyIn > P().money ? 'disabled' : ''}>Yeniden giriş (${X.money(T.buyIn)})</button>`;
  } else actions = '<p class="muted center">Rakipler düşünüyor…</p>';
  return `<div class="card pk">
    <div class="pkrow">${seat(1)}${seat(2)}${seat(3)}</div>
    <div class="felt board"><div class="pot">Pot ${X.money(h?.pot || 0)}</div><div class="bcards">${[0, 1, 2, 3, 4].map((i) => h?.board[i] ? cardHtml(h.board[i], 'sm ' + (i >= (pk.seenBoard || 0) ? 'deal' : ''), (i - (pk.seenBoard || 0)) * 160) : '<div class="pc slot sm"></div>').join('')}</div></div>
    ${seat(0)}
    ${actions}
    <div class="pklog">${T.log.slice(-6).map((l) => `<div>${X.esc(l)}</div>`).join('')}</div>
    <button class="btn ghost" data-act="pkLeave" ${h && !h.done ? 'disabled' : ''}>Masadan kalk (${X.money(T.players[0].stack)})</button>
  </div>`;
}
function afterPokerRender() { const pk = ui().pk; if (pk?.T.hand) pk.seenBoard = pk.T.hand.board.length; }
function pkLoop() {
  const pk = ui().pk; if (!pk || pk.busy) return;
  const T = pk.T, h = T.hand;
  if (!h) return;
  if (h.done) {
    if (!pk.settled) {
      pk.settled = true;
      const delta = T.players[0].stack - pk.handStart;
      if (delta) pay(delta);
    }
    return X.render();
  }
  if (C.isMyTurn(T)) return X.render();
  pk.busy = true;
  setTimeout(() => {
    pk.busy = false;
    if (ui().pk !== pk) return;
    C.act(T, C.aiMove(T));
    X.render();
    pkLoop();
  }, 650);
}
function newHand(pk) { C.startHand(pk.T); pk.handStart = pk.T.players[0].stack + pk.T.hand.ps[0].put; pk.settled = false; pk.seenBoard = 0; }
function pokerAct(act, el) {
  const s = ui();
  if (act === 'pkSit' || act === 'pkRebuy') {
    const buy = act === 'pkRebuy' ? s.pk.T.buyIn : s.stake * 10;
    if (buy > P().money) return X.toast('Paran yetmiyor.');
    if (act === 'pkRebuy') s.pk.T.players[0].stack = buy;
    else s.pk = { T: C.newTable(buy) };
    newHand(s.pk); X.render(); return pkLoop();
  }
  const pk = s.pk; if (!pk) return false;
  if (act === 'pkMove') {
    if (!C.isMyTurn(pk.T)) return;
    const m = el.dataset.m;
    C.act(pk.T, m === 'raise' ? { type: 'raise', to: +el.dataset.to } : { type: m });
    X.render(); return pkLoop();
  }
  if (act === 'pkNext') { newHand(pk); X.render(); return pkLoop(); }
  if (act === 'pkLeave') { s.pk = null; X.toast('Masadan kalktın.'); return; }
  return false;
}

// =============================================================== ortak
export function body(t, stakeBar) {
  switch (t) {
    case 'rulet': return rouletteBody(stakeBar);
    case 'blackjack': return bjBody(stakeBar);
    case 'slot': return slotBody(stakeBar);
    case 'barbut': return barbutBody(stakeBar);
    case 'kazi': return scratchBody();
    case 'poker': return pokerBody(stakeBar);
  }
  return '';
}
export function handle(act, el) {
  if (act === 'slot') return slotAct(act);
  if (act === 'barbut' || act === 'barbutRoll') return barbutAct(act);
  if (act.startsWith('r') && ['rBet', 'rUndo', 'rClear', 'rRepeat', 'rSpin'].includes(act)) return rouletteAct(act, el);
  if (act.startsWith('bj')) return bjAct(act);
  if (act.startsWith('k') && ['kPrice', 'kBuy', 'kAll'].includes(act)) return scratchAct(act, el);
  if (act.startsWith('pk')) return pokerAct(act, el);
  return false;
}
export const ACTS = new Set(['slot', 'barbut', 'barbutRoll', 'rBet', 'rUndo', 'rClear', 'rRepeat', 'rSpin', 'bjDeal', 'bjHit', 'bjStand', 'bjDouble', 'kPrice', 'kBuy', 'kAll', 'pkSit', 'pkRebuy', 'pkMove', 'pkNext', 'pkLeave']);
export function afterRender(t) {
  if (t === 'rulet') { if (!rl().spin) drawWheel(rl().wAng || 0, null); }
  else if (t === 'kazi') bindScratch();
  else if (t === 'poker') afterPokerRender();
}
