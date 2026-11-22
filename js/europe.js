// Avrupa kupaları — güncel format: 36 takımlı lig aşaması (ŞL/AL 8 maç, KL 6 maç), 9-24 play-off,
// son 16 / çeyrek / yarı final iki maç, final tek maç. Ayrıca UEFA Süper Kupa ve Türk takımları için ön elemeler.
import { simScore, shuffle, rand, pick, sortedTableOf, addStatTo, pickScorer, pickAssister } from './engine.js';
import { UCL_2026, UEL_2026, UECL_2026, EURO_SLOTS, EURO_TEAMS, UECL_TEAMS, QUAL_RESERVE, QUAL_PATHS, SUPER_2026 } from './data-europe.js';

export const COMP = {
  UCL: { name: 'Şampiyonlar Ligi', short: 'ŞL', icon: '⭐', fame: 3 },
  UEL: { name: 'Avrupa Ligi', short: 'AL', icon: '🟠', fame: 2 },
  UECL: { name: 'Konferans Ligi', short: 'KL', icon: '🟢', fame: 1.5 },
  USC: { name: 'UEFA Süper Kupa', short: 'SK', icon: '🏆', fame: 2, cup: true },
  CUP: { name: 'Ulusal kupa', short: 'Kupa', icon: '🏆', fame: 1, cup: true },
};
const LOWER = { UCL: 'UEL', UEL: 'UECL', UECL: null };
const MDS = { UCL: 8, UEL: 8, UECL: 6 };
const FOREIGN = (id) => !!(EURO_TEAMS[id] || UECL_TEAMS[id]);
// 0-7 lig aşaması · 8/9 play-off · 10/11 son 16 · 12/13 çeyrek · 14/15 yarı final (iki maç) · 16 final (tek maç)
const STAGE_NAME = ['Play-off', 'Son 16', 'Çeyrek final', 'Yarı final', 'Final'];
export const ROUND_NAME = [...Array.from({ length: 8 }, (_, i) => `Lig aşaması ${i + 1}. maç`),
  'Play-off 1. maç', 'Play-off rövanş', 'Son 16 1. maç', 'Son 16 rövanş', 'Çeyrek final 1. maç', 'Çeyrek final rövanş',
  'Yarı final 1. maç', 'Yarı final rövanş', 'Final'];
const LEAGUE_MDS = 8, LAST = 16;
export const stageOf = (idx) => idx < LEAGUE_MDS ? null : idx === LAST ? { stage: 4, leg: 0, final: true } : { stage: (idx - LEAGUE_MDS) >> 1, leg: (idx - LEAGUE_MDS) & 1 };
export { STAGE_NAME };

// Lig haftalarına yerleştirilmiş takvim (38 haftalık sezonda)
export function euroWeeks(total) {
  // ilk 4 hafta: ön elemeler (0-1: 3. ön eleme, 2-3: play-off) ve Süper Kupa (1. hafta)
  const f = [0.12, 0.16, 0.2, 0.25, 0.3, 0.35, 0.42, 0.47, 0.53, 0.56, 0.61, 0.64, 0.71, 0.74, 0.81, 0.84, 0.93];
  const out = [];
  for (const x of f) { let w = Math.max(4, Math.min(total - 1, Math.round(x * total))); while (out.includes(w)) w++; out.push(w); }
  return out;
}

// 36 takım için 8 tur: daire yönteminin 35 turundan 8'i (herkes 8 farklı rakip)
function leagueRounds(ids, mds = LEAGUE_MDS) {
  const t = shuffle(ids.slice());
  const n = t.length, rounds = [];
  for (let r = 0; r < n - 1; r++) {
    const ms = [];
    for (let i = 0; i < n / 2; i++) {
      const a = t[i], b = t[n - 1 - i];
      ms.push((r + i) % 2 ? { h: a, a: b, hg: null, ag: null } : { h: b, a: a, hg: null, ag: null });
    }
    rounds.push(ms);
    t.splice(1, 0, t.pop());
  }
  return shuffle(rounds).slice(0, mds);
}

function newComp(id, teams) {
  const table = Object.fromEntries(teams.map((t) => [t, { p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 }]));
  const mds = MDS[id] || LEAGUE_MDS;
  return { id, teams, mds, rounds: leagueRounds(teams, mds), ko: [], table, md: 0, winner: null, out: [] };
}

// nx: { UCL, UEL, UECL, quals?, super? }
export function createEuro(state, nx) {
  const total = state.season.totalWeeks;
  const E = { year: state.season.year, weeks: euroWeeks(total), comps: {}, ps: {}, quals: [], super: null };
  for (const c of ['UCL', 'UEL', 'UECL']) E.comps[c] = newComp(c, (nx[c] || []).slice(0, 36));
  const sc = nx.super || SUPER_2026;
  if (sc && sc[0] && sc[1] && sc[0] !== sc[1]) E.super = { hi: sc[0], lo: sc[1], legs: [{ h: sc[0], a: sc[1], hg: null, ag: null }], w: null, week: 1 };
  for (const q of nx.quals || []) E.quals.push(q);
  return E;
}
// eski kayıt: Konferans Ligi yoksa ekle
export function ensureUECL(state) {
  const E = state.euro;
  if (!E || E.comps.UECL) return false;
  E.comps.UECL = newComp('UECL', UECL_2026.filter((id) => state.teams[id]).slice(0, 36));
  E.quals ||= []; E.super ??= null;
  const idx = E.weeks.filter((w) => w < state.season.week).length;
  for (let i = 0; i < idx; i++) simComp(state, E.comps.UECL, i);
  return true;
}

// Gelecek sezon katılımcıları: İngiltere ve Türkiye puan durumuna göre, diğerleri sabit havuz,
// kupa şampiyonları bir üst kupaya (AL → ŞL, KL → AL). Türk takımlarının bir kısmı ön eleme oynar.
export function nextParticipants(state, sum) {
  // oyundaki liglerin takımları sabit havuzdan değil puan durumundan gelir
  const inLeague = new Set(Object.values(state.leagues).flat());
  const FOREIGN = (id) => !!(EURO_TEAMS[id] || UECL_TEAMS[id]) && !inLeague.has(id);
  const last = state.euro ? Object.fromEntries(Object.entries(state.euro.comps).map(([c, x]) => [c, x.winner])) : {};
  const used = new Set();
  const lists = { UCL: [], UEL: [], UECL: [] };
  const add = (c, id) => { if (id && !used.has(id) && state.teams[id]) { used.add(id); lists[c].push(id); } };
  // kupa şampiyonları
  add('UCL', last.UCL); add('UCL', last.UEL); add('UEL', last.UECL);
  // lig sıraları
  for (const [, sl] of Object.entries(EURO_SLOTS)) {
    const tbl = sum.leagues[sl.league];
    if (!tbl) continue;
    let k = 0;
    for (const c of ['UCL', 'UEL', 'UECL']) for (let i = 0; i < (sl[c] || 0); i++) add(c, tbl[k++]?.id);
  }
  // Türk elemeleri
  const quals = [];
  const tr = sum.leagues.SL || [];
  for (const path of QUAL_PATHS) {
    const id = tr[path.pos - 1]?.id;
    if (!id || used.has(id)) continue;
    used.add(id);
    quals.push({ team: id, comp: path.comp, rounds: path.rounds.slice(), cur: 0, ties: [], done: false });
  }
  // yabancı sabit havuz
  const base = { UCL: UCL_2026, UEL: UEL_2026, UECL: UECL_2026 };
  for (const c of ['UCL', 'UEL', 'UECL']) {
    const need = 36 - quals.filter((q) => q.comp === c).length;
    for (const id of base[c]) { if (lists[c].length >= need) break; if (FOREIGN(id)) add(c, id); }
    for (const id of QUAL_RESERVE) { if (lists[c].length >= need) break; add(c, id); }
    // yeni liglerle sabit havuz azaldıysa: önce lig dışı yabancılar, sonra yabancı liglerin güçlü takımları
    if (lists[c].length < need) {
      const tr = new Set([...(state.leagues.SL || []), ...(state.leagues.L1 || [])]);
      const rest = Object.keys(state.teams).filter((id) => !used.has(id) && !tr.has(id)).sort((x, y) => (inLeague.has(x) - inLeague.has(y)) || ((state.teams[y].str || 0) - (state.teams[x].str || 0)));
      for (const id of rest) { if (lists[c].length >= need) break; add(c, id); }
    }
    lists[c] = lists[c].slice(0, need);
  }
  // eleme rakipleri: bir alt kupanın (ŞL için AL, AL için KL) yabancı takımlarından, KL için yedek havuzdan
  for (const q of quals) {
    const low = LOWER[q.comp];
    const pool = (low ? lists[low] : QUAL_RESERVE.filter((id) => !used.has(id))).filter((id) => FOREIGN(id) && !quals.some((o) => o.opps?.includes(id)));
    const strong = pool.map((id) => [id, state.teams[id]?.str || 70]).sort((a, b) => b[1] - a[1]).slice(0, 14).map((x) => x[0]);
    q.opps = shuffle(strong).slice(0, q.rounds.length);
    // havuz küçükse (yeni ligler sabit havuzdan takım çekti) herhangi bir yabancı takımla tamamla
    const trSet = new Set([...(state.leagues.SL || []), ...(state.leagues.L1 || [])]);
    if (q.opps.length < q.rounds.length) { const extra = shuffle(Object.keys(state.teams).filter((id) => !trSet.has(id) && !used.has(id) && !q.opps.includes(id) && !quals.some((o) => o.opps?.includes(id)) && id !== q.team)); while (q.opps.length < q.rounds.length && extra.length) q.opps.push(extra.pop()); }
    lists[q.comp].push(q.team);     // şimdilik lig aşamasında; elenirse yer değiştirir
  }
  return { ...lists, quals, super: [last.UCL, last.UEL] };
}

export const sortedEuro = (comp) => sortedTableOf(comp.table);

function applyLeague(comp, m) {
  const H = comp.table[m.h], A = comp.table[m.a];
  H.p++; A.p++; H.gf += m.hg; H.ga += m.ag; A.gf += m.ag; A.ga += m.hg;
  H.gd = H.gf - H.ga; A.gd = A.gf - A.ga;
  if (m.hg > m.ag) { H.w++; A.l++; H.pts += 3; } else if (m.hg < m.ag) { A.w++; H.l++; A.pts += 3; } else { H.d++; A.d++; H.pts++; A.pts++; }
}

// Eleme turu eşleşmeleri: her eşleşme { hi (iyi sıralı, rövanşı evinde), lo, legs: [...] }
function genStage(comp, stage) {
  if (comp.ko[stage]) return comp.ko[stage];
  let pairs = [];
  if (stage === 0) {
    const t = sortedEuro(comp).map((r) => r.id);
    comp.seeds = t;
    comp.out.push(...t.slice(24));
    for (let i = 8; i < 16; i++) pairs.push([t[i], t[31 - i]]);
  } else if (stage === 1) {
    const top = comp.seeds.slice(0, 8);
    const po = shuffle(comp.ko[0].map((x) => x.w));
    pairs = top.map((id, i) => [id, po[i]]);
  } else {
    const prev = shuffle(comp.ko[stage - 1].map((x) => x.w));
    const rank = (id) => comp.seeds.indexOf(id);
    for (let i = 0; i < prev.length; i += 2) pairs.push(rank(prev[i]) <= rank(prev[i + 1]) ? [prev[i], prev[i + 1]] : [prev[i + 1], prev[i]]);
  }
  comp.ko[stage] = pairs.map(([hi, lo]) => ({
    hi, lo, w: null,
    legs: stage === 4 ? [{ h: hi, a: lo, hg: null, ag: null }] : [{ h: lo, a: hi, hg: null, ag: null }, { h: hi, a: lo, hg: null, ag: null }],
  }));
  return comp.ko[stage];
}

export function matchesAt(comp, idx) {
  if (idx < LEAGUE_MDS) return idx < (comp.mds || LEAGUE_MDS) ? comp.rounds[idx] : [];
  const st = stageOf(idx);
  return genStage(comp, st.stage).map((tie) => tie.legs[st.leg]);
}
export function tieOf(comp, idx, m) {
  if (comp.tie) return comp.tie;     // Süper Kupa / ön eleme
  const st = stageOf(idx);
  return st ? comp.ko[st.stage].find((t) => t.legs[st.leg] === m) : null;
}
// Eşleşmede bir takımın toplam golü (tamamlanan ayaklar)
export function aggFor(tie, id) {
  let g = 0;
  for (const l of tie.legs) if (l.hg !== null) g += l.h === id ? l.hg : l.ag;
  return g;
}

// Eşleşmeyi bitir: toplam skor eşitse uzatma (rövanş/final) + penaltılar
function settleTie(state, comp, tie, last, pens) {
  let a = aggFor(tie, last.h), b = aggFor(tie, last.a);
  if (a === b) {
    if (pens) last.pens = pens;
    else {
      if (Math.random() < 0.3) { const sH = state.teams[last.h].str, sA = state.teams[last.a].str; if (Math.random() < sH / (sH + sA)) last.hg++; else last.ag++; last.et = true; a = aggFor(tie, last.h); b = aggFor(tie, last.a); }
      if (a === b) { let x = 0, y = 0; for (let k = 0; k < 5; k++) { x += Math.random() < 0.76; y += Math.random() < 0.74; } while (x === y) { x += Math.random() < 0.75; y += Math.random() < 0.75; } last.pens = [x, y]; }
    }
  }
  a = aggFor(tie, last.h); b = aggFor(tie, last.a);
  tie.w = a > b ? last.h : a < b ? last.a : (last.pens[0] > last.pens[1] ? last.h : last.a);
  comp.out.push(tie.w === tie.hi ? tie.lo : tie.hi);
  if (tie.legs.length === 1) comp.winner = tie.w;
}

export function recordResult(state, comp, idx, m, pens) {
  if (comp.tie) {
    if (m === comp.tie.legs[comp.tie.legs.length - 1]) { settleTie(state, comp, comp.tie, m, pens); if (comp.onDone) comp.onDone(); }
    return;
  }
  if (idx < LEAGUE_MDS) return applyLeague(comp, m);
  const tie = tieOf(comp, idx, m);
  if (m === tie.legs[tie.legs.length - 1]) settleTie(state, comp, tie, m, pens);
}

function simGoalsEuro(state, teamId, n) {
  const t = state.teams[teamId];
  for (let i = 0; i < n; i++) { const sc = pickScorer(t); addStatTo(state.euro.ps, teamId, sc, 1, 0); addStatTo(state.euro.ps, teamId, pickAssister(t, sc), 0, 1); }
}

// Haftanın Avrupa maçlarını oyna (oyuncunun maçı zaten oynandıysa atlanır)
function simComp(state, comp, idx) {
  if (comp.winner) return;
  for (const m of matchesAt(comp, idx)) {
    if (m.hg !== null) continue;
    [m.hg, m.ag] = simScore(state.teams, m.h, m.a);
    simGoalsEuro(state, m.h, m.hg); simGoalsEuro(state, m.a, m.ag);
    recordResult(state, comp, idx, m);
  }
  comp.md = idx + 1;
}
function simLeg(state, pc, m) {
  if (m.hg !== null) return;
  [m.hg, m.ag] = simScore(state.teams, m.h, m.a);
  recordResult(state, pc, -1, m);
}
export function simWeek(state, week) {
  const E = state.euro;
  if (!E) return;
  if (E.super && E.super.week === week) simLeg(state, superComp(state), E.super.legs[0]);
  for (const q of E.quals || []) { const t = qualTie(state, q, week); if (t) simLeg(state, t.pc, t.m); }
  const idx = E.weeks.indexOf(week);
  if (idx < 0) return;
  for (const comp of Object.values(E.comps)) simComp(state, comp, idx);
}

// ---------- Süper Kupa ----------
function superComp(state) {
  const E = state.euro;
  return { id: 'USC', tie: E.super, out: [], get winner() { return E.super.w; }, set winner(v) { E.super.w = v; } };
}

// ---------- ön elemeler ----------
// Her elemede iki maç: 3. ön eleme 0-1. haftalar, play-off 2-3. haftalar.
function qualWeeks(q, r) { return q.rounds.length === 2 ? [r * 2, r * 2 + 1] : [2, 3]; }
// Bu hafta oynanacak eleme maçı: { pc (sahte kupa), m, tie, round }
function qualTie(state, q, week) {
  if (q.done) return null;
  const wk = qualWeeks(q, q.cur);
  const leg = wk.indexOf(week);
  if (leg < 0) return null;
  let tie = q.ties[q.cur];
  if (!tie) {
    const opp = q.opps[q.cur];
    // ilk maç Türk takımının deplasmanında ya da evinde (kura)
    const homeFirst = Math.random() < 0.5;
    tie = { hi: opp, lo: q.team, w: null, legs: homeFirst ? [{ h: q.team, a: opp, hg: null, ag: null }, { h: opp, a: q.team, hg: null, ag: null }] : [{ h: opp, a: q.team, hg: null, ag: null }, { h: q.team, a: opp, hg: null, ag: null }] };
    q.ties[q.cur] = tie;
  }
  const pc = { id: q.comp, tie, out: [], winner: null, onDone: () => qualDone(state, q, tie) };
  return { pc, m: tie.legs[leg], tie, round: q.rounds[q.cur], leg: leg + 1 };
}
function swapTeam(comp, from, to) {
  comp.teams = comp.teams.map((x) => (x === from ? to : x));
  for (const r of comp.rounds) for (const m of r) { if (m.h === from) m.h = to; if (m.a === from) m.a = to; }
  comp.table[to] = comp.table[from]; delete comp.table[from];
}
function qualDone(state, q, tie) {
  const E = state.euro;
  if (tie.w === q.team) {
    q.cur++;
    if (q.cur >= q.rounds.length) { q.done = true; q.result = 'in'; }
    return;
  }
  q.done = true;
  // elendi: son eleme rakibi lig aşamasına girer; Türk takımı bir alt kupaya düşer (KL'de elenirse kupa yok)
  const target = E.comps[q.comp], low = LOWER[q.comp] && E.comps[LOWER[q.comp]];
  const sub = q.opps[q.opps.length - 1];
  if (low && low.teams.includes(sub)) { swapTeam(target, q.team, '__tmp'); swapTeam(low, sub, q.team); swapTeam(target, '__tmp', sub); q.result = 'down'; }
  else if (low) { const weakest = low.teams.filter(FOREIGN).sort((a, b) => (state.teams[a].str || 0) - (state.teams[b].str || 0))[0]; swapTeam(target, q.team, sub); swapTeam(low, weakest, q.team); q.result = 'down'; }
  else { swapTeam(target, q.team, sub); q.result = 'out'; }
}

// Oyuncunun bu haftaki Avrupa maçı
export function euroFixture(state) {
  const E = state.euro;
  if (!E) return null;
  const me = state.player.clubId, wk = state.season.week;
  if (E.super && E.super.week === wk && !E.super.w && (E.super.hi === me || E.super.lo === me)) {
    const m = E.super.legs[0];
    return { comp: 'USC', md: -1, round: 'Final', h: m.h, a: m.a, home: m.h === me, opp: m.h === me ? m.a : m.h, knockout: true, final: true, leg: 0, stage: 'Final', agg: null };
  }
  for (const [qi, q] of (E.quals || []).entries()) {
    if (q.team !== me) continue;
    const t = qualTie(state, q, wk);
    if (!t || t.m.hg !== null) continue;
    const first = t.leg === 2 ? t.tie.legs[0] : null;
    return { comp: q.comp, qual: qi, md: -1, round: `${t.round} ${t.leg === 1 ? '1. maç' : 'rövanş'}`, h: t.m.h, a: t.m.a, home: t.m.h === me, opp: t.m.h === me ? t.m.a : t.m.h,
      knockout: t.leg === 2, final: false, leg: t.leg, stage: t.round,
      agg: first ? { my: first.h === me ? first.hg : first.ag, opp: first.h === me ? first.ag : first.hg } : null };
  }
  const idx = E.weeks.indexOf(state.season.week);
  if (idx < 0) return null;
  for (const comp of Object.values(E.comps)) {
    if (!comp.teams.includes(me) || comp.out.includes(me) || comp.winner) continue;
    if ((E.quals || []).some((q) => q.team === me && !q.done)) continue;   // önce elemeyi geç
    const m = matchesAt(comp, idx).find((x) => x.h === me || x.a === me);
    if (m && m.hg === null) {
      const st = stageOf(idx);
      const tie = st ? tieOf(comp, idx, m) : null;
      const decider = !!tie && m === tie.legs[tie.legs.length - 1];
      const opp = m.h === me ? m.a : m.h;
      const first = tie && tie.legs.length === 2 && decider ? tie.legs[0] : null;
      return {
        comp: comp.id, md: idx, round: ROUND_NAME[idx], h: m.h, a: m.a, home: m.h === me, opp,
        knockout: decider, final: !!st?.final, leg: st ? st.leg + 1 : 0, stage: st ? STAGE_NAME[st.stage] : null,
        agg: first ? { my: first.h === me ? first.hg : first.ag, opp: first.h === me ? first.ag : first.hg } : null,
      };
    }
  }
  return null;
}

export function findMatch(state, fx) {
  if (fx.comp === 'USC') { const pc = superComp(state); return { comp: pc, m: pc.tie.legs[0] }; }
  if (fx.qual != null) {
    const q = state.euro.quals[fx.qual];
    const t = qualTie(state, q, state.season.week);
    return { comp: t.pc, m: t.m };
  }
  const comp = state.euro.comps[fx.comp];
  return { comp, m: matchesAt(comp, fx.md).find((x) => x.h === fx.h && x.a === fx.a) };
}

// Oyuncunun takımının kupadaki durumu (hub için)
export function myEuroStatus(state) {
  const E = state.euro, me = state.player.clubId;
  if (!E) return null;
  const q = (E.quals || []).find((x) => x.team === me && !x.done);
  if (q) return { comp: q.comp, name: COMP[q.comp].name, qual: q.rounds[q.cur], out: false, winner: false, pos: null };
  for (const comp of Object.values(E.comps)) {
    if (!comp.teams.includes(me)) continue;
    const pos = comp.md <= LEAGUE_MDS ? sortedEuro(comp).findIndex((r) => r.id === me) + 1 : null;
    return { comp: comp.id, name: COMP[comp.id].name, out: comp.out.includes(me), winner: comp.winner === me, pos };
  }
  return null;
}
export { LEAGUE_MDS, pick, rand };
