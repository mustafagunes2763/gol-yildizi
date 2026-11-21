// Oyun mantığı — DOM yok, Node'da test edilebilir.
import { TEAMS, LEAGUES, SEASON_START_YEAR, FIRST_NAMES, LAST_NAMES, clubInfo } from './data.js';
import { KADROLAR } from './kadrolar.js';
import { weeklyLife, initLife, injuryRoll } from './life.js';
import { NAME_POOLS, UCL_2026, UEL_2026, UECL_2026 } from './data-europe.js';
import * as Euro from './europe.js';

export const SAVE_VERSION = 1;
export const STAT_KEYS = ['sut', 'pas', 'hiz', 'teknik', 'guc'];
export const ENERGY_MAX = 100;
export const TRAIN_COST = 20;
export const WEEKLY_ENERGY = 45;

// ---------- yardımcılar ----------
export const rand = (a, b) => a + Math.random() * (b - a);
export const randInt = (a, b) => Math.floor(rand(a, b + 1));
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export function poisson(lambda) {
  const L = Math.exp(-lambda);
  let k = 0, p = 1;
  do { k++; p *= Math.random(); } while (p > L);
  return k - 1;
}
export const money = (n) => '₺' + Math.round(n).toLocaleString('tr-TR');
export const randomName = () => `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;

// ---------- oyuncu ----------
export function overall(p) {
  const s = p.stats;
  return Math.round(s.sut * 0.3 + s.teknik * 0.2 + s.hiz * 0.2 + s.pas * 0.15 + s.guc * 0.15);
}

export function newPlayer({ name, surname, foot = 'Sağ', nation = 'Türkiye', look = null }) {
  const stats = {};
  for (const k of STAT_KEYS) stats[k] = randInt(34, 44);
  return {
    name, surname, foot, nation,
    look: look || { skin: 1, hair: 'kisa', hairColor: 'siyah' },
    fans: 50,     // taraftar sevgisi 0-100
    age: 17,
    stats,
    energy: ENERGY_MAX,
    money: 20000,
    morale: 60,   // 0-100
    fame: 0,      // 0-100
    clubId: null,
    contract: { wage: 0, endsYear: SEASON_START_YEAR + 1 },
    rested: false,
    season: emptySeasonStats(),
    career: { apps: 0, goals: 0, assists: 0, seasons: [] },
  };
}

export const emptySeasonStats = () => ({ apps: 0, starts: 0, goals: 0, assists: 0, ratingSum: 0 });

// ---------- takımlar ----------
function genSquad(t = {}) {
  // Kadrosu gelmeyen takım: ülkeye uygun uydurma isimler, güce uygun reytingler (Gemini kadrosu gelince değişir)
  const positions = ['KL','DF','DF','DF','DF','OS','OS','OS','FV','FV','FV','KL','DF','DF','OS','OS','FV','FV'];
  const pool = t.country ? (NAME_POOLS[t.country] || NAME_POOLS.GEN) : null;
  const avg = 66 + ((t.str || 66) - 56) / 1.8;
  const used = new Set();
  return positions.map((pos, i) => {
    let name;
    do { name = pool ? `${pick(pool[0])} ${pick(pool[1])}` : randomName(); } while (used.has(name));
    used.add(name);
    return { name, pos, age: randInt(19, 33), ovr: Math.round(avg + (i < 11 ? randInt(-2, 4) : randInt(-8, -2))), nat: t.country || 'Türkiye' };
  });
}

// Gerçek kadro: [isim, mevki, yaş, uyruk, güç, tahmini]
export function realSquad(id) {
  const k = KADROLAR[id];
  return k ? k.map(([name, pos, age, nat, ovr]) => ({ name, pos, age, nat, ovr })) : null;
}

// Takım gücü: en iyi 11 (1 KL, 4 DF, 3 OS, 3 FV) ortalaması, oyunun ölçeğine yayılır
export function squadStrength(squad) {
  const best = (p, n) => squad.filter((x) => x.pos === p).map((x) => x.ovr).sort((a, b) => b - a).slice(0, n);
  const xi = [...best('KL', 1), ...best('DF', 4), ...best('OS', 3), ...best('FV', 3)];
  if (!xi.length) return 60;
  const avg = xi.reduce((a, b) => a + b, 0) / xi.length;
  return clamp(Math.round(56 + (avg - 66) * 1.8), 45, 92);
}

export function initTeams() {
  const teams = {};
  for (const [id, t] of Object.entries(TEAMS)) {
    const real = realSquad(id);
    teams[id] = { id, ...t, squad: real || genSquad(t), real: !!real };
    if (real) teams[id].str = squadStrength(real);
  }
  return teams;
}

// Aksan/özel harf farkını yok sayan karşılaştırma anahtarı
const foldName = (s) => s.toLocaleLowerCase('tr-TR').replace(/ı/g, 'i').normalize('NFKD').replace(/[^a-z ]/g, '');

// Eski kayıtları gerçek kadrolara yükselt + isimlerin Türkçe/özgün yazımını uygula
export function upgradeTeams(state) {
  let changed = false;
  if ((state.namesV || 0) < 2) {
    for (const [id, t] of Object.entries(state.teams)) {
      const real = realSquad(id);
      if (!t.real || !real) continue;
      const byKey = new Map(real.map((x) => [foldName(x.name), x.name]));
      for (const x of t.squad) { const n = byKey.get(foldName(x.name)); if (n) x.name = n; }
    }
    state.namesV = 2; changed = true;
  }
  // yeni eklenen takımlar (Premier Lig, Avrupa) ve ligler
  for (const [id, t] of Object.entries(TEAMS)) {
    if (state.teams[id]) continue;
    const real = realSquad(id);
    state.teams[id] = { id, ...t, squad: real || genSquad(t), real: !!real };
    if (real) state.teams[id].str = squadStrength(real);
    changed = true;
  }
  for (const [lid, l] of Object.entries(LEAGUES)) {
    if (state.leagues[lid]) continue;
    state.leagues[lid] = l.teams.slice();
    if (state.season && !state.season.leagues[lid]) {
      state.season.leagues[lid] = { fixtures: makeFixtures(l.teams), table: emptyTable(l.teams) };
      // geçmiş haftaları simüle et
      for (let w = 0; w < state.season.week; w++) for (const m of state.season.leagues[lid].fixtures[w] || []) {
        [m.hg, m.ag] = simScore(state.teams, m.h, m.a); applyResult(state.season.leagues[lid].table, m);
      }
      state.season.totalWeeks = Math.max(...Object.values(state.season.leagues).map((x) => x.fixtures.length));
    }
    changed = true;
  }
  if (state.season && !state.euro) {
    state.euro = Euro.createEuro(state, { UCL: UCL_2026, UEL: UEL_2026, UECL: UECL_2026 });
    for (let w = 0; w < state.season.week; w++) Euro.simWeek(state, w);
    changed = true;
  }
  if (Euro.ensureUECL(state)) changed = true;
  for (const [id, t] of Object.entries(state.teams)) {
    if (t.real) continue;
    const real = realSquad(id);
    if (!real) continue;
    t.squad = real; t.real = true; t.str = squadStrength(real);
    changed = true;
  }
  return changed;
}

// Sezon sonu: kadrolar yaşlanır, gençler gelişir, 39 yaşındakiler emekli olur
function ageSquads(state) {
  for (const t of Object.values(state.teams)) {
    if (!t.real) { t.str = clamp(t.str + randInt(-2, 2), 50, 90); continue; }
    t.squad = t.squad.map((x) => {
      const age = x.age + 1;
      if (age >= 39) return { name: randomName(), pos: x.pos, age: 18, nat: 'Türkiye', ovr: randInt(56, 63) };
      const d = age <= 21 ? randInt(1, 4) : age <= 25 ? randInt(0, 2) : age <= 29 ? randInt(-1, 1) : age <= 32 ? randInt(-2, 0) : randInt(-4, -1);
      return { ...x, age, ovr: clamp(x.ovr + d, 45, 95) };
    });
    t.str = squadStrength(t.squad);
  }
}

// ---------- fikstür (çift devreli, çember yöntemi) ----------
export function makeFixtures(teamIds) {
  const ids = shuffle(teamIds);
  if (ids.length % 2) ids.push(null);
  const n = ids.length;
  const rounds = [];
  const arr = ids.slice();
  for (let r = 0; r < n - 1; r++) {
    const round = [];
    for (let i = 0; i < n / 2; i++) {
      const a = arr[i], b = arr[n - 1 - i];
      if (a && b) round.push(r % 2 === 0 ? [a, b] : [b, a]);
    }
    rounds.push(round);
    arr.splice(1, 0, arr.pop()); // ilk eleman sabit, diğerleri döner
  }
  const second = rounds.map((round) => round.map(([h, a]) => [a, h]));
  return rounds.concat(second).map((round) => round.map(([h, a]) => ({ h, a, hg: null, ag: null })));
}

export function emptyTable(teamIds) {
  const t = {};
  for (const id of teamIds) t[id] = { p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 };
  return t;
}

export function applyResult(table, m) {
  const H = table[m.h], A = table[m.a];
  H.p++; A.p++;
  H.gf += m.hg; H.ga += m.ag; A.gf += m.ag; A.ga += m.hg;
  if (m.hg > m.ag) { H.w++; A.l++; H.pts += 3; }
  else if (m.hg < m.ag) { A.w++; H.l++; A.pts += 3; }
  else { H.d++; A.d++; H.pts++; A.pts++; }
}

export const sortedTableOf = (t) => sortedTable(t);
export function sortedTable(table) {
  return Object.entries(table)
    .map(([id, r]) => ({ id, ...r, gd: r.gf - r.ga }))
    .sort((x, y) => y.pts - x.pts || y.gd - x.gd || y.gf - x.gf || x.id.localeCompare(y.id));
}

// ---------- gol / asist krallığı ----------
// Golü kim attı: forvetler çok, orta saha orta, defans az; güçlü oyuncu daha sık
const SCORE_W = { FV: 11, OS: 3, DF: 0.7, KL: 0 };
const ASSIST_W = { FV: 2.2, OS: 4, DF: 1.5, KL: 0.1 };
function pickBy(squad, W, not) {
  const list = squad.filter((x) => x.name !== not && (W[x.pos] || 0) > 0);
  if (!list.length) return null;
  const w = list.map((x) => W[x.pos] * ((x.ovr || 60) / 70) ** 5);
  let r = Math.random() * w.reduce((a, b) => a + b, 0);
  for (let i = 0; i < list.length; i++) if ((r -= w[i]) < 0) return list[i];
  return list[list.length - 1];
}
export function pickScorer(team) { return pickBy(team.squad, SCORE_W)?.name || 'Oyuncu'; }
export function pickAssister(team, scorer) { return Math.random() < 0.72 ? pickBy(team.squad, ASSIST_W, scorer)?.name || null : null; }
export function addStatTo(S, teamId, name, g, a, me = false) {
  if (!name) return;
  const k = `${teamId}|${name}`;
  const r = (S[k] ||= [0, 0]);
  r[0] += g; r[1] += a;
  if (me) r[2] = 1;
}
export function addStat(state, teamId, name, g, a, me = false) {
  if (!name) return;
  if (state._euroStats) return addStatTo(state.euro.ps, teamId, name, g, a, me);
  const S = (state.season.ps ||= {});
  const k = `${teamId}|${name}`;
  const r = (S[k] ||= [0, 0]);
  r[0] += g; r[1] += a;
  if (me) r[2] = 1;
}
function simGoals(state, teamId, n) {
  const t = state.teams[teamId];
  for (let i = 0; i < n; i++) {
    const sc = pickScorer(t);
    addStat(state, teamId, sc, 1, 0);
    addStat(state, teamId, pickAssister(t, sc), 0, 1);
  }
}
// Lig istatistik listesi: [{ name, teamId, g, a, me }]
export function leagueStats(state, lid) {
  const ids = new Set(state.leagues[lid]);
  return Object.entries(state.season.ps || {})
    .map(([k, v]) => { const i = k.indexOf('|'); return { teamId: k.slice(0, i), name: k.slice(i + 1), g: v[0], a: v[1], me: !!v[2] }; })
    .filter((x) => ids.has(x.teamId));
}

// Beklenen gol: güç farkı + iç saha avantajı
export function expectedGoals(strFor, strAgainst, home) {
  return clamp(1.3 * Math.exp((strFor - strAgainst) / 22) + (home ? 0.2 : 0), 0.2, 4.5);
}

export function simScore(teams, h, a) {
  return [poisson(expectedGoals(teams[h].str, teams[a].str, true)),
          poisson(expectedGoals(teams[a].str, teams[h].str, false))];
}

// ---------- sezon ----------
export function newSeason(state) {
  const season = { year: state.season ? state.season.year + 1 : SEASON_START_YEAR, week: 0, leagues: {} };
  for (const [lid, ids] of Object.entries(state.leagues)) {
    season.leagues[lid] = { fixtures: makeFixtures(ids), table: emptyTable(ids) };
  }
  season.totalWeeks = Math.max(...Object.values(season.leagues).map((l) => l.fixtures.length));
  state.season = season;
  const nx = state.euroNext || { UCL: UCL_2026, UEL: UEL_2026, UECL: UECL_2026 };
  if (!nx.UECL) nx.UECL = UECL_2026;
  state.euro = Euro.createEuro(state, nx);
  state.player.season = emptySeasonStats();
  state.player.yellows = 0;   // sarı kartlar sezon sonunda silinir (kırmızı cezası devam eder)
}

export function newGame(playerInfo) {
  const state = {
    v: SAVE_VERSION,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    player: newPlayer(playerInfo),
    teams: initTeams(),
    leagues: Object.fromEntries(Object.entries(LEAGUES).map(([id, l]) => [id, l.teams.slice()])),
    season: null,
    inbox: [],
    phase: 'offers', // offers -> hub -> seasonEnd
    offers: [],
    econV: 1,
  };
  initLife(state.player);
  newSeason(state);
  state.offers = startingOffers(state);
  return state;
}

export function leagueOf(state, teamId) {
  return Object.keys(state.leagues).find((lid) => state.leagues[lid].includes(teamId));
}

// Kariyer başında 1. Lig'den 3 teklif
export function startingOffers(state) {
  const pool = shuffle(state.leagues.L1).slice(0, 3);
  return pool.map((clubId) => ({
    clubId,
    wage: randInt(3, 7) * 10000,
    years: 2,
  }));
}

export function acceptOffer(state, offer) {
  const p = state.player;
  const old = p.clubId;
  p.clubId = offer.clubId;
  p.contract = { wage: offer.wage, endsYear: state.season.year + offer.years };
  state.offers = [];
  state.phase = 'hub';
  const t = state.teams[offer.clubId];
  const hoca = clubInfo(offer.clubId).teknik_direktor;
  addInbox(state, old
    ? `${t.name} ile ${offer.years} yıllık sözleşme imzaladın. Haftalık ${money(offer.wage)}.${hoca ? ` Hocan ${hoca} seni bekliyor.` : ''}`
    : `${t.name} ailesine hoş geldin! ${hoca ? `Hoca ${hoca}` : 'Hoca'} seni yedekten deneyecek. Antrenmanlara ağırlık ver.`);
}

export function addInbox(state, text) {
  state.inbox.unshift({ week: state.season?.week ?? 0, year: state.season?.year, text });
  state.inbox = state.inbox.slice(0, 30);
}

// Bu haftaki maç (oyuncunun takımı)
export function currentFixture(state) {
  const ef = Euro.euroFixture(state);
  if (ef) return ef;
  const lid = leagueOf(state, state.player.clubId);
  const L = state.season.leagues[lid];
  const round = L.fixtures[state.season.week];
  if (!round) return null;
  const m = round.find((x) => x.h === state.player.clubId || x.a === state.player.clubId);
  return m ? { ...m, lid, home: m.h === state.player.clubId, opp: m.h === state.player.clubId ? m.a : m.h } : null;
}

// Hoca seçimi: oyuncunun genel gücünü takım gücüyle kıyasla
export function selection(state) {
  const p = state.player;
  const t = state.teams[p.clubId];
  if (p.injury > 0) return 'injured';
  if (p.suspended > 0) return 'suspended';
  const rel = p.rel ? (p.rel.coach - 50) / 8 : 0;
  const promise = (p.weekFlags?.coachPromise ? 5 : 0) - (p.weekFlags?.benched ? 12 : 0);
  const ovr = overall(p) + (p.morale - 50) / 10 + (p.energy < 30 ? -5 : 0) + rel + promise;
  const fvs = t.squad.filter((x) => x.pos === 'FV' && x.ovr).map((x) => x.ovr).sort((a, b) => b - a);
  if (fvs.length >= 3) {
    // ilk 11 için 3. en iyi forveti, kadro için en zayıf forveti geçmelisin
    if (ovr >= fvs[2] - 2) return 'starter';
    if (ovr >= fvs[fvs.length - 1] - 27) return 'sub';
    return 'out';
  }
  if (ovr >= t.str - 6) return 'starter';
  if (ovr >= t.str - 26) return 'sub';
  return 'out';
}

// Forma çakışması: renkler birbirine yakınsa deplasman takımı alternatif forma giyer
function hexRgb(h) { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
export function colorDist(a, b) {
  const [r1, g1, b1] = hexRgb(a), [r2, g2, b2] = hexRgb(b);
  return Math.hypot(r1 - r2, g1 - g2, b1 - b2);
}
export function matchKits(home, away) {
  const h = [home.c1, home.c2];
  const candidates = [[away.c1, away.c2], [away.c2, away.c1], ['#FFFFFF', away.c1], ['#111111', away.c2], ['#7C3AED', '#FFFFFF']];
  // çim yeşiliyle de karışmasın
  const ok = (k) => colorDist(k[0], h[0]) > 140 && colorDist(k[0], '#2A8340') > 90;
  const a = candidates.find(ok) || candidates[2];
  return { home: h, away: a };
}

// An türü dağılımı
const MOMENT_KINDS = [['acik', 25], ['kontra', 14], ['birebir', 9], ['serbest', 10], ['kafa', 12], ['korner', 8], ['rovasata', 3], ['penalti', 6], ['uzuntop', 8], ['duvar', 8], ['pres', 7]];
export function momentKind(tactic) {
  const w = MOMENT_KINDS.map(([k, v]) => [k, v * ((TACTICS[tactic]?.mix || {})[k] || 1)]);
  let r = Math.random() * w.reduce((a, [, v]) => a + v, 0);
  for (const [k, v] of w) { if ((r -= v) < 0) return k; }
  return 'acik';
}

// Rakip taktikleri: an dağılımı, defans sayısı, pres, süre, goller
export const TACTICS = {
  dengeli: { name: 'Dengeli', desc: 'Klasik 4-4-2, sürpriz yok.', mix: {}, def: 0, press: 1, time: 1, oppG: 1, myG: 1 },
  pres: { name: 'Önde pres', desc: 'Topu çabuk kapmaya çalışırlar; arkaları boş, kontraya açıklar.', mix: { kontra: 1.8, birebir: 1.4, acik: 0.8, uzuntop: 1.7, pres: 0.6 }, def: 0, press: 1.18, time: 0.85, oppG: 1.1, myG: 1.1 },
  katenacio: { name: 'Otobüs', desc: 'Kaleye otobüs çektiler. Duran toplar altın değerinde.', mix: { serbest: 1.6, korner: 1.6, kontra: 0.4, birebir: 0.5, duvar: 1.5, uzuntop: 0.4, pres: 1.3 }, def: 1, press: 0.9, time: 1.15, oppG: 0.7, myG: 0.75 },
  kanat: { name: 'Kanat oyunu', desc: 'Kanatlardan ortalarla gelirler, ceza sahası kalabalık.', mix: { kafa: 1.7, korner: 1.4, rovasata: 1.5 }, def: 0, press: 1, time: 1, oppG: 1.05, myG: 1 },
  hucum: { name: 'Hücum', desc: 'Gol için her şeyi göze alırlar. Bol gollü maç kokusu!', mix: { kontra: 1.6, birebir: 1.5, serbest: 0.8, uzuntop: 1.5, pres: 1.4 }, def: -1, press: 0.95, time: 1, oppG: 1.3, myG: 1.2 },
};
function pickTactic(opp, me) {
  const d = opp.str - me.str;
  const pool = d < -6 ? ['katenacio', 'katenacio', 'dengeli', 'kanat'] : d > 6 ? ['hucum', 'pres', 'dengeli', 'kanat'] : ['dengeli', 'pres', 'kanat', 'hucum', 'katenacio'];
  return pick(pool);
}
// Hava + saat (mevsime göre kar ihtimali)
export function matchWeather(week, totalWeeks) {
  const t = week / Math.max(1, totalWeeks);           // 0 = ağustos, 1 = mayıs
  const winter = t > 0.3 && t < 0.7;
  const r = Math.random();
  const fx = winter ? (r < 0.18 ? 'kar' : r < 0.45 ? 'yagmur' : null) : (r < 0.18 ? 'yagmur' : null);
  const tod = pick(['gunduz', 'aksam', 'aksam', 'gece', 'gece']);
  return { tod, fx };
}
export const WEATHER_TEXT = { gunduz: 'Gündüz', aksam: 'Akşam', gece: 'Gece', yagmur: 'Yağmurlu', kar: 'Karlı' };

// Kartlar (gerçek kurallar): 4 sarı = 1 maç ceza, çift sarıdan kırmızı = 1 maç, direkt kırmızı = 1-3 maç
export function giveCard(state, type, matchYellows) {
  const p = state.player;
  p.yellows ||= 0; p.suspended ||= 0;
  p.season.yellows = (p.season.yellows || 0); p.season.reds = (p.season.reds || 0);
  if (type === 'yellow' && matchYellows >= 1) {
    p.season.yellows++; p.season.reds++;
    p.suspended += 1;
    return { card: 'secondYellow', ban: 1 };
  }
  if (type === 'yellow') {
    p.yellows++; p.season.yellows++;
    if (p.yellows % 4 === 0) { p.suspended += 1; return { card: 'yellow', ban: 1, accum: true }; }
    return { card: 'yellow', ban: 0, left: 4 - (p.yellows % 4) };
  }
  const r = Math.random();
  const ban = r < 0.4 ? 1 : r < 0.85 ? 2 : 3;
  p.season.reds++;
  p.suspended += ban;
  return { card: 'red', ban };
}

// Maç planı: oyuncunun anları ve rakip/takım gollerinin dakikaları
export function planMatch(state) {
  const fx = currentFixture(state);
  if (!fx) return null;
  const p = state.player;
  const me = state.teams[p.clubId], opp = state.teams[fx.opp];
  const sel = selection(state);
  const injured = sel === 'injured';
  const suspended = sel === 'suspended';
  const role = injured || suspended ? 'out' : sel;
  const tactic = pickTactic(opp, me);
  const T = TACTICS[tactic];
  const weather = matchWeather(state.season.week, state.season.totalWeeks);
  const onFrom = role === 'starter' ? 1 : role === 'sub' ? randInt(55, 80) : 999;
  const onTo = role === 'starter' ? (p.energy < 25 ? randInt(55, 75) : 90) : 90;

  // Oyuncu sahadayken takım daha az "otomatik" gol atar; gollerin bir kısmı oyuncunun anlarından gelir
  const myXg = expectedGoals(me.str, opp.str, fx.home);
  const oppXg = expectedGoals(opp.str, me.str, !fx.home);
  const playingShare = role === 'out' ? 0 : (onTo - onFrom) / 90;
  const teamGoals = poisson(myXg * T.myG * (1 - 0.65 * playingShare));
  const oppGoals = poisson(oppXg * T.oppG);

  const minutes = (n, from = 1, to = 90) => Array.from({ length: n }, () => randInt(from, to)).sort((a, b) => a - b);

  let momentCount = 0;
  if (role === 'starter') momentCount = onTo < 90 ? randInt(4, 6) : randInt(5, 8);
  else if (role === 'sub') momentCount = randInt(2, 3);
  const diff = opp.str - overall(p); // pozitif = zor
  const keeperOvr = Math.max(0, ...opp.squad.filter((x) => x.pos === 'KL' && x.ovr).map((x) => x.ovr)) || opp.str;
  const oppDefs = opp.squad.filter((x) => x.pos === 'DF').map((x) => x.name);
  const mkMoment = (min, kind) => ({
    min,
    kind: kind || momentKind(tactic),
    defenders: clamp(Math.round(2 + diff / 15 + Math.random() + T.def * 0.5), 1, 4),
    keeper: clamp(keeperOvr + randInt(-2, 2), 40, 95),
    extraDef: T.def > 0 ? 1 : 0, pressMul: T.press, timeMul: T.time, foulRate: 0.22 + (tactic === 'pres' ? 0.08 : 0),
    oppNames: shuffle(oppDefs.slice()).slice(0, 4), weather,
  });
  const moments = minutes(momentCount, onFrom, onTo).map((min) => mkMoment(min));

  return {
    fx, role, injured, suspended, onFrom, onTo, tactic, weather,
    keeperName: (opp.squad.filter((x) => x.pos === 'KL').sort((a, b) => (b.ovr || 0) - (a.ovr || 0))[0] || {}).name || 'kaleci',
    extraMoment: (min, kind) => ({ ...mkMoment(min, kind), type: 'moment' }),
    myName: me.name, oppName: opp.name,
    ...(() => {
      const k = fx.home ? matchKits(me, opp) : matchKits(opp, me);
      return { myColors: fx.home ? k.home : k.away, oppColors: fx.home ? k.away : k.home };
    })(),
    events: [
      ...minutes(teamGoals).map((min) => { const sc = pickScorer(me); return { min, type: 'teamGoal', scorer: sc, assist: pickAssister(me, sc) }; }),
      ...minutes(oppGoals).map((min) => { const sc = pickScorer(opp); return { min, type: 'oppGoal', scorer: sc, assist: pickAssister(opp, sc) }; }),
      ...moments.map((m) => ({ ...m, type: 'moment' })),
    ].sort((a, b) => a.min - b.min),
    teammates: me.squad.filter((s) => s.pos !== 'KL').map((s) => s.name),
  };
}

// Maç puanı
export function matchRating(res) {
  if (!res.played) return null;
  let r = 6.0 + res.goals * 1.1 + res.assists * 0.7;
  for (const o of res.outcomes) {
    if (o === 'saved' || o === 'post') r += 0.15;
    if (o === 'miss' || o === 'over') r -= 0.25;
    if (o === 'lost' || o === 'blocked') r -= 0.2;
    if (o === 'offside') r -= 0.1;
    if (o === 'foulPen' || o === 'foulFk') r += 0.15;
  }
  if (res.red) r -= 1.5;
  else if (res.yellows) r -= 0.2 * res.yellows;
  r += res.result === 'W' ? 0.3 : res.result === 'L' ? -0.3 : 0;
  return Math.round(clamp(r, 3, 10) * 10) / 10;
}

// Maç bittikten sonra: skor, tablo, oyuncu istatistikleri, gelişim
export function finishMatch(state, plan, res) {
  const p = state.player;
  const fx = plan.fx;
  const myG = res.myGoals, opG = res.oppGoals;
  if (fx.comp) {
    const { comp, m } = Euro.findMatch(state, fx);
    m.hg = fx.home ? myG : opG; m.ag = fx.home ? opG : myG;
    const pens = res.pens ? (fx.home ? res.pens : [res.pens[1], res.pens[0]]) : null;
    Euro.recordResult(state, comp, fx.md, m, pens);
    const tie = Euro.tieOf(comp, fx.md, m);
    res.koWon = fx.knockout && tie ? tie.w === p.clubId : undefined;
    res.agg = tie && tie.legs.length === 2 && fx.knockout ? [Euro.aggFor(tie, p.clubId), Euro.aggFor(tie, fx.opp)] : null;
    res.pensUsed = m.pens || null; res.et = !!m.et;
    if (comp.winner === p.clubId) {
      (p.trophies ||= []).push({ key: fx.comp.toLowerCase(), year: state.season.year, club: p.clubId });
      p.fame = clamp((p.fame || 0) + 12, 0, 100);
      res.euroTrophy = fx.comp;
    }
    if (myG > opG || res.koWon) p.fame = clamp((p.fame || 0) + Euro.COMP[fx.comp].fame * 0.5, 0, 100);
  } else {
    const L = state.season.leagues[fx.lid];
    const m = L.fixtures[state.season.week].find((x) => x.h === fx.h && x.a === fx.a);
    m.hg = fx.home ? myG : opG;
    m.ag = fx.home ? opG : myG;
    applyResult(L.table, m);
  }
  state._euroStats = !!fx.comp;

  res.result = myG > opG ? 'W' : myG < opG ? 'L' : 'D';
  // gol/asist kayıtları
  for (const e of plan.events) {
    if (e.type !== 'teamGoal' && e.type !== 'oppGoal') continue;
    const tid = e.type === 'teamGoal' ? p.clubId : fx.opp;
    addStat(state, tid, e.scorer, 1, 0); addStat(state, tid, e.assist, 0, 1);
  }
  const meName = `${p.name} ${p.surname}`;
  if (res.goals) addStat(state, p.clubId, meName, res.goals, 0, true);
  if (res.assists) {
    addStat(state, p.clubId, meName, 0, res.assists, true);
    for (let i = 0; i < res.assists; i++) addStat(state, p.clubId, pickScorer(state.teams[p.clubId]), 1, 0);
  }
  if (res.goals) for (let i = 0; i < res.goals; i++) if (Math.random() < 0.6) addStat(state, p.clubId, pickAssister(state.teams[p.clubId], meName), 0, 1);
  state._euroStats = false;
  const rating = matchRating(res);
  res.rating = rating;

  if (res.played) {
    p.season.apps++;
    if (plan.role === 'starter') p.season.starts++;
    p.season.goals += res.goals;
    p.season.assists += res.assists;
    p.season.ratingSum += rating;
    p.career.apps++;
    p.career.goals += res.goals;
    p.career.assists += res.assists;
    p.morale = clamp(p.morale + (rating - 6.3) * 6, 0, 100);
    p.fame = clamp(p.fame + res.goals * 0.8 + res.assists * 0.4 + (rating >= 8 ? 1 : 0), 0, 100);
    p.energy = clamp(p.energy - (plan.onTo - plan.onFrom) / 90 * 25, 0, ENERGY_MAX);
    // Maç tecrübesi: iyi oynarsan biraz gelişirsin
    const xp = Math.max(0, (rating - 5.5)) * 0.05;
    for (const k of STAT_KEYS) p.stats[k] = clamp(p.stats[k] + xp * rand(0.3, 1), 1, 99);
    // gol bonusu
    p.money += res.goals * Math.round(p.contract.goalBonus ?? p.contract.wage * 0.5);
    // ilişkiler
    if (p.rel) {
      p.rel.coach = clamp(p.rel.coach + (rating >= 7.5 ? 3 : rating >= 6.5 ? 1 : rating < 5.5 ? -3 : 0), 0, 100);
      p.rel.team = clamp(p.rel.team + res.assists * 2 + (res.result === 'W' ? 1 : 0), 0, 100);
    }
    // sakatlık riski
    res.injury = injuryRoll(state, plan.onTo - plan.onFrom);
  } else {
    p.morale = clamp(p.morale - (plan.suspended ? 1 : 3), 0, 100);
  }
  if (plan.suspended && p.suspended > 0) p.suspended--;
  if (plan.injured) p.backFrom = 'injury';
  else if (plan.suspended && p.suspended === 0) p.backFrom = 'ban';
  p.form = [...(p.form || []), res.result].slice(-5);
  if (!fx.comp) advanceWeek(state);
  return res;
}

// Oyuncunun takımının maçı yoksa ya da oynandıysa haftayı ilerlet
export function advanceWeek(state) {
  const s = state.season;
  const p = state.player;
  Euro.simWeek(state, s.week);
  for (const [lid, L] of Object.entries(s.leagues)) {
    const round = L.fixtures[s.week];
    if (!round) continue;
    for (const m of round) {
      if (m.hg !== null) continue;
      [m.hg, m.ag] = simScore(state.teams, m.h, m.a);
      simGoals(state, m.h, m.hg); simGoals(state, m.a, m.ag);
      applyResult(L.table, m);
    }
  }
  weeklyLife(state, s.week);
  s.week++;
  p.money += p.contract.wage;
  p.energy = clamp(p.energy + WEEKLY_ENERGY, 0, ENERGY_MAX);
  p.rested = false;
  if (s.week >= s.totalWeeks) state.phase = 'seasonEnd';
  state.updatedAt = Date.now();
}

// ---------- antrenman ----------
export function train(state, stat) {
  const p = state.player;
  if (p.injury > 0) return { ok: false, msg: 'Sakatken antrenman yapamazsın.' };
  if (p.energy < TRAIN_COST) return { ok: false, msg: 'Yeterli enerjin yok.' };
  p.energy -= TRAIN_COST;
  const cur = p.stats[stat];
  const ageF = p.age <= 21 ? 1.2 : p.age <= 26 ? 1 : p.age <= 30 ? 0.6 : 0.3;
  const gain = Math.max(0.05, (100 - cur) / 85 * ageF * rand(0.7, 1.3));
  if (p.rel) p.rel.coach = clamp(p.rel.coach + 0.5, 0, 100);
  p.stats[stat] = clamp(cur + gain, 1, 99);
  state.updatedAt = Date.now();
  return { ok: true, gain };
}

export function rest(state) {
  const p = state.player;
  if (p.rested) return { ok: false, msg: 'Bu hafta zaten dinlendin.' };
  p.rested = true;
  p.energy = clamp(p.energy + 25, 0, ENERGY_MAX);
  p.morale = clamp(p.morale + 2, 0, 100);
  return { ok: true };
}

// ---------- sezon sonu ----------
export function seasonSummary(state) {
  const p = state.player;
  const out = { year: state.season.year, leagues: {} };
  for (const [lid, L] of Object.entries(state.season.leagues)) out.leagues[lid] = sortedTable(L.table);
  const lid = leagueOf(state, p.clubId);
  out.myLeague = lid;
  out.myPos = out.leagues[lid].findIndex((r) => r.id === p.clubId) + 1;
  out.stats = { ...p.season, avg: p.season.apps ? Math.round(p.season.ratingSum / p.season.apps * 10) / 10 : 0 };
  out.champion = Object.fromEntries(Object.entries(out.leagues).map(([l, t]) => [l, t[0].id]));
  out.euro = state.euro ? { ...Object.fromEntries(Object.entries(state.euro.comps).map(([c, x]) => [c, x.winner])), USC: state.euro.super?.w || null } : {};
  return out;
}

export function seasonOffers(state) {
  const p = state.player;
  const ovr = overall(p);
  const avg = p.season.apps ? p.season.ratingSum / p.season.apps : 6;
  const score = ovr + (avg - 6.5) * 6 + p.fame / 5;
  const all = Object.values(state.teams).filter((t) => t.id !== p.clubId && leagueOf(state, t.id));
  // Gücü oyuncuya yakın veya biraz üstündeki takımlar ilgilenir
  // sözleşmesi devam ediyorsa: sadece serbest kalma bedelini ödeyebilen kulüpler
  const free = contractExpiring(state) || !p.contract.release;
  const afford = (t) => free || Math.max(0, t.str - 55) ** 2.4 * 90_000 >= p.contract.release;
  const interested = shuffle(all.filter((t) => t.str <= score + 22 && t.str >= Math.min(score - 5, 78) && afford(t)));
  return interested.slice(0, 3).map((t) => ({
    clubId: t.id,
    wage: Math.round(Math.max(p.contract.wage * 1.2, (t.str - 50) * 9000 * (1 + p.fame / 50)) / 5000) * 5000,
    years: randInt(2, 4),
  }));
}

export function endSeason(state) {
  const sum = seasonSummary(state);
  const p = state.player;
  p.career.seasons.push({
    year: sum.year, club: p.clubId, league: sum.myLeague, pos: sum.myPos,
    apps: sum.stats.apps, goals: sum.stats.goals, assists: sum.stats.assists, avg: sum.stats.avg,
  });

  // Yükselme / düşme
  const sl = sum.leagues.SL.map((r) => r.id);
  const l1 = sum.leagues.L1.map((r) => r.id);
  const down = sl.slice(-LEAGUES.SL.relegate);
  const up = l1.slice(0, LEAGUES.L1.promote);
  state.leagues.SL = sl.filter((id) => !down.includes(id)).concat(up);
  state.leagues.L1 = l1.filter((id) => !up.includes(id)).concat(down);

  // Gelecek sezonun Avrupa katılımcıları (bu sezonun puan durumuna göre)
  state.euroNext = Euro.nextParticipants(state, sum);
  state.lastEuro = state.euro ? Object.fromEntries(Object.entries(state.euro.comps).map(([c, x]) => [c, x.winner])) : null;

  // Kadrolar yaşlanır / gelişir, takım güçleri yeniden hesaplanır
  ageSquads(state);

  // Yaşlanma
  p.age++;
  if (p.age >= 31) for (const k of STAT_KEYS) p.stats[k] = clamp(p.stats[k] - rand(0.5, 2.5) * (k === 'hiz' || k === 'guc' ? 1.5 : 1), 1, 99);

  p.bets = [];
  newSeason(state);
  state.phase = 'hub';
  addInbox(state, `${state.season.year}-${String(state.season.year + 1).slice(2)} sezonu başladı!`);
  return sum;
}

export function contractExpiring(state) {
  return state.player.contract.endsYear <= state.season.year + 1;
}
