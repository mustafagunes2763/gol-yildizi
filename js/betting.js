// İddaa tarzı bahis: maç sonucu, çifte şans, alt/üst, karşılıklı gol, ilk yarı, kesin skor.
// Tekli ya da kombine kupon; geçmiş ve kâr-zarar istatistiği.
import { expectedGoals, sortedTable, money, addInbox } from './engine.js';

const MARGIN = 0.92;   // %8 kasa payı
const FACT = [1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880];
const pmf = (l, k) => Math.exp(-l) * l ** k / FACT[k];
const odd = (q) => Math.max(1.03, Math.min(250, Math.round((MARGIN / Math.max(q, 0.002)) * 100) / 100));

export const MARKETS = {
  MS: 'Maç sonucu', CS: 'Çifte şans', AU: 'Alt / Üst 2,5', AU35: 'Alt / Üst 3,5', KG: 'Karşılıklı gol', IY: 'İlk yarı sonucu', SK: 'Kesin skor',
};
export const LG = { SL: 'Süper Lig', L1: '1. Lig', PL: 'Premier Lig', LL: 'La Liga', SA: 'Serie A', BL: 'Bundesliga', FR: 'Ligue 1', NL: 'Eredivisie', PT: 'Liga Portugal', BE: 'Pro League' };

// skor matrisi -> tüm pazarlar
function markets(xh, xa) {
  const M = [];
  for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++) M.push([i, j, pmf(xh, i) * pmf(xa, j)]);
  const P = (f) => M.reduce((a, [i, j, q]) => a + (f(i, j) ? q : 0), 0);
  const w = P((i, j) => i > j), d = P((i, j) => i === j), l = P((i, j) => i < j);
  const hh = xh * 0.45, ha = xa * 0.45;
  let hw = 0, hd = 0, hl = 0;
  for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++) { const q = pmf(hh, i) * pmf(ha, j); if (i > j) hw += q; else if (i === j) hd += q; else hl += q; }
  const o25 = P((i, j) => i + j > 2.5), o35 = P((i, j) => i + j > 3.5), btts = P((i, j) => i > 0 && j > 0);
  const scores = M.filter(([i, j]) => i <= 4 && j <= 4).sort((a, b) => b[2] - a[2]).slice(0, 12);
  const other = 1 - scores.reduce((a, x) => a + x[2], 0);
  return {
    MS: { '1': odd(w), X: odd(d), '2': odd(l) },
    CS: { '1X': odd(w + d), '12': odd(w + l), X2: odd(d + l) },
    AU: { Alt: odd(1 - o25), 'Üst': odd(o25) },
    AU35: { Alt: odd(1 - o35), 'Üst': odd(o35) },
    KG: { Var: odd(btts), Yok: odd(1 - btts) },
    IY: { '1': odd(hw), X: odd(hd), '2': odd(hl) },
    SK: Object.fromEntries([...scores.map(([i, j, q]) => [`${i}-${j}`, odd(q)]), ['Diğer', odd(other)]]),
  };
}

// Son 5 maç formu
function forms(L, week) {
  const f = {};
  for (let w = 0; w < week; w++) for (const m of L.fixtures[w] || []) {
    if (m.hg === null) continue;
    (f[m.h] ||= []).push(m.hg > m.ag ? 'w' : m.hg === m.ag ? 'd' : 'l');
    (f[m.a] ||= []).push(m.ag > m.hg ? 'w' : m.hg === m.ag ? 'd' : 'l');
  }
  for (const k of Object.keys(f)) f[k] = f[k].slice(-5);
  return f;
}

// Bu haftanın bülteni (oyuncunun kendi maçı hariç)
export function bulletin(state) {
  const s = state.season, out = [];
  for (const [lid, L] of Object.entries(s.leagues)) {
    const round = L.fixtures[s.week];
    if (!round) continue;
    const pos = Object.fromEntries(sortedTable(L.table).map((r, i) => [r.id, i + 1]));
    const fm = forms(L, s.week);
    for (const m of round) {
      if (m.h === state.player.clubId || m.a === state.player.clubId || m.hg !== null) continue;
      const th = state.teams[m.h], ta = state.teams[m.a];
      const xh = expectedGoals(th.str, ta.str, true), xa = expectedGoals(ta.str, th.str, false);
      out.push({ key: `${lid}|${m.h}|${m.a}`, lid, h: m.h, a: m.a, posH: pos[m.h], posA: pos[m.a], formH: fm[m.h] || [], formA: fm[m.a] || [], mk: markets(xh, xa) });
    }
  }
  return out;
}

const pickLabel = (mk, pick) => (mk === 'MS' || mk === 'IY' ? `${MARKETS[mk].split(' ')[0]} ${pick}` : mk === 'SK' ? `Skor ${pick}` : mk === 'CS' ? `ÇŞ ${pick}` : mk === 'KG' ? `KG ${pick}` : `${pick} ${mk === 'AU' ? '2,5' : '3,5'}`);

// Kupon (taslak): ui tarafında tutulur; her maçtan tek seçim
export function toggleSlip(slip, m, mk, pick) {
  const i = slip.findIndex((x) => x.key === m.key);
  if (i >= 0 && slip[i].mk === mk && slip[i].pick === pick) { slip.splice(i, 1); return slip; }
  const leg = { key: m.key, lid: m.lid, h: m.h, a: m.a, mk, pick, odd: m.mk[mk][pick], label: pickLabel(mk, pick) };
  if (mk === 'SK') leg.scores = Object.keys(m.mk.SK).filter((x) => x !== 'Diğer');
  if (i >= 0) slip[i] = leg; else slip.push(leg);
  return slip;
}
export const comboOdd = (legs) => Math.round(legs.reduce((a, l) => a * l.odd, 1) * 100) / 100;

export function place(state, legs, stake, mode) {
  const p = state.player;
  stake = Math.floor(stake);
  if (!legs.length) return { ok: false, msg: 'Kupon boş.' };
  if (!(stake > 0)) return { ok: false, msg: 'Geçerli bir miktar gir.' };
  const total = mode === 'tekli' ? stake * legs.length : stake;
  if (total > p.money) return { ok: false, msg: `Paran yetmiyor (${money(total)}).` };
  if (mode === 'kombine' && legs.length < 2) return { ok: false, msg: 'Kombine için en az 2 maç seç.' };
  const base = { week: state.season.week, year: state.season.year, stake };
  p.betSeq = (p.betSeq || 0) + 1;
  if (mode === 'tekli') for (const l of legs) p.bets.push({ ...base, id: p.betSeq++, kind: 'tekli', legs: [l], odd: l.odd });
  else p.bets.push({ ...base, id: p.betSeq, kind: 'kombine', legs: legs.slice(), odd: comboOdd(legs) });
  p.money -= total;
  p.casinoWeek -= total;
  p.betStats ||= { staked: 0, won: 0, coupons: 0, hits: 0 };
  p.betStats.staked += total;
  return { ok: true, total };
}

// bir ayağın sonucu
function legResult(state, l) {
  const m = state.season.leagues[l.lid]?.fixtures?.find?.((r) => r.some((x) => x.h === l.h && x.a === l.a))?.find((x) => x.h === l.h && x.a === l.a);
  if (!m || m.hg === null) return null;
  if (m.hth === undefined) {   // ilk yarı skoru (bir kez üretilir)
    let a = 0, b = 0;
    for (let i = 0; i < m.hg; i++) if (Math.random() < 0.45) a++;
    for (let i = 0; i < m.ag; i++) if (Math.random() < 0.45) b++;
    m.hth = a; m.hta = b;
  }
  const res = m.hg > m.ag ? '1' : m.hg === m.ag ? 'X' : '2', tot = m.hg + m.ag;
  const ht = m.hth > m.hta ? '1' : m.hth === m.hta ? 'X' : '2';
  const sk = `${m.hg}-${m.ag}`;
  const won = {
    MS: () => l.pick === res, CS: () => l.pick.includes(res), AU: () => (l.pick === 'Üst') === (tot > 2.5), AU35: () => (l.pick === 'Üst') === (tot > 3.5),
    KG: () => (l.pick === 'Var') === (m.hg > 0 && m.ag > 0), IY: () => l.pick === ht,
    SK: () => (l.pick === 'Diğer' ? !(l.scores || []).includes(sk) : l.pick === sk),
  }[l.mk || 'MS']();
  return { won, score: sk, ht: `${m.hth}-${m.hta}` };
}

// Haftalık: oynanmış maçların kuponlarını sonuçlandır
export function resolve(state) {
  const p = state.player;
  const keep = [];
  p.betHistory ||= [];
  p.betStats ||= { staked: 0, won: 0, coupons: 0, hits: 0 };
  for (const b0 of p.bets) {
    const b = b0.legs ? b0 : { ...b0, kind: 'tekli', legs: [{ lid: b0.lid, h: b0.h, a: b0.a, mk: 'MS', pick: b0.pick, odd: b0.odd, label: `MS ${b0.pick}` }] };
    if (b.year !== state.season.year) continue;
    const rs = b.legs.map((l) => legResult(state, l));
    if (rs.some((r) => r === null)) { keep.push(b0); continue; }
    const won = rs.every((r) => r.won);
    const payout = won ? Math.round(b.stake * b.odd) : 0;
    p.money += payout; p.casinoWeek += payout;
    p.betStats.coupons++; if (won) { p.betStats.hits++; p.betStats.won += payout; }
    const tn = b.legs.map((l, i) => `${state.teams[l.h].short}-${state.teams[l.a].short} ${rs[i].score}`).join(', ');
    addInbox(state, won ? `🎟️ Kupon tuttu! ${tn} · ${money(payout)} kazandın.` : `🎟️ Kupon yattı: ${tn}.`);
    p.betHistory.unshift({ year: b.year, week: b.week, kind: b.kind, stake: b.stake, odd: b.odd, won, payout, legs: b.legs.map((l, i) => ({ h: l.h, a: l.a, label: l.label, odd: l.odd, won: rs[i].won, score: rs[i].score })) });
  }
  p.betHistory = p.betHistory.slice(0, 40);
  p.bets = keep;
}

export { money };
