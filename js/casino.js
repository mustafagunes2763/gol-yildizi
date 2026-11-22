// Gazino oyunları: rulet (gerçek masa), barbut, kazı kazan, Texas Hold'em poker. (Slot ve 21 life.js'te.)
import { randInt, pick, shuffle, money } from './engine.js';

// ---------------------------------------------------------------- RULET
// Avrupa ruleti: çarktaki gerçek sıra
export const WHEEL = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
const REDS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
export const colorOf = (n) => (n === 0 ? 'green' : REDS.has(n) ? 'red' : 'black');
// bahis anahtarı -> { label, pays (toplam dönüş çarpanı), hit(n) }
export const RBETS = {
  low: { label: '1-18', pays: 2, hit: (n) => n >= 1 && n <= 18 },
  even: { label: 'Çift', pays: 2, hit: (n) => n > 0 && n % 2 === 0 },
  red: { label: 'Kırmızı', pays: 2, hit: (n) => colorOf(n) === 'red' },
  black: { label: 'Siyah', pays: 2, hit: (n) => colorOf(n) === 'black' },
  odd: { label: 'Tek', pays: 2, hit: (n) => n % 2 === 1 },
  high: { label: '19-36', pays: 2, hit: (n) => n >= 19 },
  d1: { label: '1. düzine', pays: 3, hit: (n) => n >= 1 && n <= 12 },
  d2: { label: '2. düzine', pays: 3, hit: (n) => n >= 13 && n <= 24 },
  d3: { label: '3. düzine', pays: 3, hit: (n) => n >= 25 },
  c1: { label: '2:1', pays: 3, hit: (n) => n > 0 && n % 3 === 1 },
  c2: { label: '2:1', pays: 3, hit: (n) => n > 0 && n % 3 === 2 },
  c3: { label: '2:1', pays: 3, hit: (n) => n > 0 && n % 3 === 0 },
};
for (let i = 0; i <= 36; i++) RBETS['n' + i] = { label: String(i), pays: 36, hit: (n) => n === i };
export const betTotal = (bets) => Object.values(bets).reduce((a, x) => a + x, 0);
export function spinWheel() { return WHEEL[randInt(0, 36)]; }
export function rouletteReturn(bets, n) {
  let win = 0;
  for (const [k, amt] of Object.entries(bets)) if (RBETS[k]?.hit(n)) win += amt * RBETS[k].pays;
  return win;
}

// ---------------------------------------------------------------- BARBUT
// İki zar. Kazandıran: 3-3, 5-5, 6-6, 6-5 · Kaybettiren: 1-1, 2-2, 4-4, 1-2. Diğerlerinde sıra karşıya geçer.
const BWIN = new Set(['3-3', '5-5', '6-6', '5-6']);
const BLOSE = new Set(['1-1', '2-2', '4-4', '1-2']);
const key = (a, b) => `${Math.min(a, b)}-${Math.max(a, b)}`;
export function playBarbut() {
  const rolls = [];
  let who = Math.random() < 0.5 ? 'sen' : 'kasa';
  for (let i = 0; i < 60; i++) {
    const d = [randInt(1, 6), randInt(1, 6)], k = key(...d);
    const good = BWIN.has(k), bad = BLOSE.has(k);
    let res = null;
    if (good || bad) res = (who === 'sen') === good ? 'win' : 'lose';
    rolls.push({ who, d, res });
    if (res) return { rolls, win: res === 'win' };
    who = who === 'sen' ? 'kasa' : 'sen';
  }
  return { rolls, win: false };
}

// ---------------------------------------------------------------- KAZI KAZAN
export const SCRATCH = [
  { s: '⚽', mult: 1, p: 0.18 }, { s: '👟', mult: 2, p: 0.08 }, { s: '🧤', mult: 5, p: 0.03 },
  { s: '🏆', mult: 10, p: 0.015 }, { s: '⭐', mult: 100, p: 0.001 },
];
export function newTicket() {
  let r = Math.random(), win = null;
  for (const x of SCRATCH) { if ((r -= x.p) < 0) { win = x; break; } }
  const cells = [];
  const count = Object.fromEntries(SCRATCH.map((x) => [x.s, 0]));
  if (win) { for (let i = 0; i < 3; i++) cells.push(win.s); count[win.s] = 3; }
  while (cells.length < 9) {
    const c = pick(SCRATCH.filter((x) => count[x.s] < 2)).s;
    count[c]++; cells.push(c);
  }
  return { cells: shuffle(cells), win: win ? win.mult : 0, sym: win?.s || null, revealed: Array(9).fill(false), done: false };
}

// ---------------------------------------------------------------- POKER (Texas Hold'em)
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const RV = Object.fromEntries(RANKS.map((r, i) => [r, i + 2]));
const SUITS = ['♠', '♥', '♦', '♣'];
export function deck() { return shuffle(RANKS.flatMap((r) => SUITS.map((s) => ({ r, s })))); }

// 5 kartlık el puanı: [kategori, ...kicker] -> tek sayı
const CAT = ['Yüksek kart', 'Bir çift', 'İki çift', 'Üçlü', 'Kent', 'Renk', 'Full house', 'Kare', 'Floş', 'Royal floş'];
function eval5(cs) {
  const v = cs.map((c) => RV[c.r]).sort((a, b) => b - a);
  const flush = cs.every((c) => c.s === cs[0].s);
  let uniq = [...new Set(v)];
  let straightHi = 0;
  if (uniq.length === 5) {
    if (v[0] - v[4] === 4) straightHi = v[0];
    else if (v[0] === 14 && v[1] === 5) straightHi = 5;      // A-2-3-4-5
  }
  const cnt = {};
  for (const x of v) cnt[x] = (cnt[x] || 0) + 1;
  const groups = Object.entries(cnt).map(([k, n]) => [n, +k]).sort((a, b) => b[0] - a[0] || b[1] - a[1]);
  let cat, ks;
  if (straightHi && flush) { cat = straightHi === 14 ? 9 : 8; ks = [straightHi]; }
  else if (groups[0][0] === 4) { cat = 7; ks = [groups[0][1], groups[1][1]]; }
  else if (groups[0][0] === 3 && groups[1][0] === 2) { cat = 6; ks = [groups[0][1], groups[1][1]]; }
  else if (flush) { cat = 5; ks = v; }
  else if (straightHi) { cat = 4; ks = [straightHi]; }
  else if (groups[0][0] === 3) { cat = 3; ks = groups.map((g) => g[1]); }
  else if (groups[0][0] === 2 && groups[1][0] === 2) { cat = 2; ks = groups.map((g) => g[1]); }
  else if (groups[0][0] === 2) { cat = 1; ks = groups.map((g) => g[1]); }
  else { cat = 0; ks = v; }
  let score = cat;
  for (let i = 0; i < 5; i++) score = score * 15 + (ks[i] || 0);
  return score;
}
export function evalBest(cards) {
  const n = cards.length;
  if (n < 5) return 0;
  if (n === 5) return eval5(cards);
  let best = 0;
  if (n === 6) { for (let a = 0; a < 6; a++) { const s = eval5(cards.filter((_, i) => i !== a)); if (s > best) best = s; } return best; }
  for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) { const s = eval5(cards.filter((_, i) => i !== a && i !== b)); if (s > best) best = s; }
  return best;
}
export const handName = (score) => CAT[Math.floor(score / 15 ** 5)];

// Monte Carlo: elin kaç rakibe karşı kazanma ihtimali
function equity(hole, board, nOpp, iters = 70) {
  const used = new Set([...hole, ...board].map((c) => c.r + c.s));
  const rest = deck().filter((c) => !used.has(c.r + c.s));
  let win = 0;
  for (let it = 0; it < iters; it++) {
    const d = shuffle(rest.slice());
    const b = board.concat(d.splice(0, 5 - board.length));
    const me = evalBest(hole.concat(b));
    let ok = 1;
    for (let o = 0; o < nOpp; o++) { const s = evalBest(d.splice(0, 2).concat(b)); if (s > me) { ok = 0; break; } if (s === me) ok = Math.min(ok, 0.5); }
    win += ok;
  }
  return win / iters;
}

export const AI_NAMES = ['Kumarbaz Necmi', 'Sarışın Lale', 'Profesör Halit', 'Kasımpaşalı Rıfat', 'Madam Süreyya', 'Sessiz Kenan'];
const STYLE = { 'Kumarbaz Necmi': 1.35, 'Sarışın Lale': 1.1, 'Profesör Halit': 0.8, 'Kasımpaşalı Rıfat': 1.2, 'Madam Süreyya': 0.95, 'Sessiz Kenan': 0.85 };

export function newTable(buyIn) {
  const names = shuffle(AI_NAMES.slice()).slice(0, 3);
  return {
    buyIn, sb: Math.max(1, Math.round(buyIn / 100)), bb: Math.max(2, Math.round(buyIn / 50)),
    players: [{ name: 'Sen', me: true, stack: buyIn }, ...names.map((n) => ({ name: n, stack: buyIn, ai: STYLE[n] || 1 }))],
    dealer: randInt(0, 3), hand: null, log: [], hands: 0,
  };
}
const fmt = (n) => money(n);
const active = (h) => h.ps.filter((p) => !p.folded);
const canAct = (p) => !p.folded && !p.allIn;

export function startHand(T) {
  // parası biten yapay zekâ masadan kalkar, yerine yenisi
  T.players.forEach((p, i) => { if (!p.me && p.stack < T.bb) { const n = pick(AI_NAMES.filter((x) => !T.players.some((q) => q.name === x))); T.players[i] = { name: n, stack: T.buyIn, ai: STYLE[n] || 1 }; T.log.push(`${n} masaya oturdu.`); } });
  T.dealer = (T.dealer + 1) % 4;
  const d = deck();
  const ps = T.players.map((p, i) => ({ i, name: p.name, me: !!p.me, ai: p.ai, cards: [d.pop(), d.pop()], folded: p.stack <= 0, allIn: false, bet: 0, put: 0 }));
  const h = T.hand = { ps, deck: d, board: [], pot: 0, street: 'preflop', cur: 0, toCall: 0, minRaise: T.bb, acted: new Set(), done: false, winners: null, seq: Date.now() };
  T.hands++;
  const post = (i, amt) => { const P = T.players[i], p = ps[i]; const a = Math.min(amt, P.stack); P.stack -= a; p.bet += a; p.put += a; h.pot += a; if (P.stack === 0) p.allIn = true; };
  const sbI = nextIdx(T, T.dealer), bbI = nextIdx(T, sbI);
  post(sbI, T.sb); post(bbI, T.bb);
  h.toCall = T.bb;
  h.cur = nextIdx(T, bbI);
  T.log = [`— Yeni el (${T.hands}) · Kör: ${fmt(T.sb)}/${fmt(T.bb)}`];
  return h;
}
function nextIdx(T, i) { for (let k = 1; k <= 4; k++) { const j = (i + k) % 4; const p = T.hand ? T.hand.ps[j] : null; if (!p || canAct(p)) return j; } return (i + 1) % 4; }

export function legal(T) {
  const h = T.hand, p = h.ps[h.cur], P = T.players[h.cur];
  const call = Math.min(h.toCall - p.bet, P.stack);
  return { call, canCheck: call === 0, minRaiseTo: h.toCall + h.minRaise, maxTo: p.bet + P.stack, pot: h.pot };
}

// Oyuncunun ya da yapay zekânın hamlesi: { type: 'fold'|'call'|'raise', to? }
export function act(T, move) {
  const h = T.hand, i = h.cur, p = h.ps[i], P = T.players[i];
  const L = legal(T);
  if (move.type === 'fold') { p.folded = true; T.log.push(`${p.name} kart attı.`); }
  else if (move.type === 'call') {
    const a = L.call; P.stack -= a; p.bet += a; p.put += a; h.pot += a; if (P.stack === 0) p.allIn = true;
    T.log.push(a === 0 ? `${p.name} pas geçti.` : `${p.name} gördü (${fmt(a)}).${p.allIn ? ' ALL-IN!' : ''}`);
  } else {
    const to = Math.min(Math.max(move.to, L.minRaiseTo), L.maxTo);
    const a = to - p.bet; P.stack -= a; p.bet = to; p.put += a; h.pot += a;
    if (to - h.toCall >= h.minRaise) { h.minRaise = to - h.toCall; h.acted = new Set(); }
    h.toCall = Math.max(h.toCall, to); if (P.stack === 0) p.allIn = true;
    T.log.push(`${p.name} ${P.stack === 0 ? 'ALL-IN' : 'yükseltti'} → ${fmt(to)}`);
  }
  h.acted.add(i);
  advance(T);
}

function advance(T) {
  const h = T.hand;
  const alive = active(h);
  if (alive.length === 1) return finish(T);
  const pending = h.ps.filter((p) => canAct(p) && (!h.acted.has(p.i) || p.bet < h.toCall));
  if (pending.length) { h.cur = nextActor(T, h.cur); return; }
  // tur bitti
  for (const p of h.ps) p.bet = 0;
  h.toCall = 0; h.minRaise = T.bb; h.acted = new Set();
  const order = ['preflop', 'flop', 'turn', 'river'];
  const k = order.indexOf(h.street);
  if (k === 3) return finish(T);
  h.street = order[k + 1];
  h.deck.pop();
  h.board.push(...h.deck.splice(-(h.street === 'flop' ? 3 : 1)));
  T.log.push(`${{ flop: 'Flop', turn: 'Turn', river: 'River' }[h.street]}: ${h.board.map((c) => c.r + c.s).join(' ')}`);
  // kimse oynayamıyorsa (herkes all-in) kartları aç
  if (h.ps.filter(canAct).length <= 1) { while (h.board.length < 5) { h.deck.pop(); h.board.push(h.deck.pop()); } return finish(T); }
  h.cur = nextActor(T, T.dealer);
}
function nextActor(T, from) {
  const h = T.hand;
  for (let k = 1; k <= 4; k++) { const j = (from + k) % 4; const p = h.ps[j]; if (canAct(p) && (!h.acted.has(j) || p.bet < h.toCall)) return j; }
  return from;
}

// Kazananlar + yan potlar
function finish(T) {
  const h = T.hand;
  h.done = true;
  const alive = active(h);
  const share = new Map();
  if (alive.length === 1) { share.set(alive[0].i, h.pot); h.winners = [{ i: alive[0].i, amt: h.pot, hand: null }]; }
  else {
    while (h.board.length < 5) h.board.push(h.deck.pop());
    for (const p of alive) p.score = evalBest(p.cards.concat(h.board));
    const levels = [...new Set(h.ps.map((p) => p.put).filter((x) => x > 0))].sort((a, b) => a - b);
    let prev = 0;
    for (const lv of levels) {
      const contributors = h.ps.filter((p) => p.put >= lv);
      const pot = (lv - prev) * contributors.length;
      let elig = contributors.filter((p) => !p.folded);
      if (!elig.length) elig = alive;
      const best = Math.max(...elig.map((p) => p.score));
      const ws = elig.filter((p) => p.score === best);
      ws.forEach((w) => share.set(w.i, (share.get(w.i) || 0) + Math.floor(pot / ws.length)));
      prev = lv;
    }
    h.winners = [...share.entries()].map(([i, amt]) => ({ i, amt, hand: handName(h.ps[i].score) }));
  }
  for (const w of h.winners) T.players[w.i].stack += w.amt;
  for (const w of h.winners) T.log.push(`🏆 ${h.ps[w.i].name} ${fmt(w.amt)} kazandı${w.hand ? ` (${w.hand})` : ''}`);
}

// Yapay zekâ kararı
export function aiMove(T) {
  const h = T.hand, p = h.ps[h.cur], P = T.players[h.cur];
  const L = legal(T);
  const opp = active(h).length - 1;
  let eq = equity(p.cards, h.board, Math.max(1, opp), h.street === 'preflop' ? 50 : 70);
  eq = Math.min(1, eq * (p.ai || 1) ** 0.5);
  const potOdds = L.call / Math.max(1, h.pot + L.call);
  const bluff = Math.random() < 0.07 * (p.ai || 1);
  if ((eq > 0.62 || bluff) && L.maxTo > L.minRaiseTo && Math.random() < 0.75) {
    const size = eq > 0.85 && Math.random() < 0.3 ? L.maxTo : Math.round((h.toCall + h.pot * (0.5 + Math.random() * 0.7)) / T.bb) * T.bb;
    return { type: 'raise', to: Math.max(L.minRaiseTo, size) };
  }
  if (L.canCheck) return { type: 'call' };
  if (eq + 0.04 >= potOdds || (L.call <= T.bb && eq > 0.25)) return { type: 'call' };
  return { type: 'fold' };
}
export const isMyTurn = (T) => T.hand && !T.hand.done && T.hand.ps[T.hand.cur].me;
export { RANKS };
