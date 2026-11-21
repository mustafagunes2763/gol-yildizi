// Sezon sonu ödülleri, kupa dolabı, emeklilik ve oğulla devam
import { leagueStats, endSeason, newPlayer, startingOffers, clamp, pick, overall, money, addInbox } from './engine.js';
import { LEAGUES } from './data.js';
import { initLife } from './life.js';
import { ek } from './news.js';

export const TROPHY = {
  champ_SL: { name: 'Süper Lig Şampiyonluğu', icon: '🏆' },
  champ_L1: { name: '1. Lig Şampiyonluğu', icon: '🥇' },
  champ_PL: { name: 'Premier Lig Şampiyonluğu', icon: '🦁' },
  champ_LL: { name: 'La Liga Şampiyonluğu', icon: '🇪🇸' },
  champ_SA: { name: 'Serie A Şampiyonluğu', icon: '🇮🇹' },
  champ_BL: { name: 'Bundesliga Şampiyonluğu', icon: '🇩🇪' },
  champ_FR: { name: 'Ligue 1 Şampiyonluğu', icon: '🇫🇷' },
  ucl: { name: 'Şampiyonlar Ligi', icon: '⭐' },
  uel: { name: 'Avrupa Ligi', icon: '🟠' },
  uecl: { name: 'Konferans Ligi', icon: '🟢' },
  usc: { name: 'UEFA Süper Kupa', icon: '🏆' },
  promo_L1: { name: "Süper Lig'e Yükselme", icon: '⬆️' },
  golkrali: { name: 'Gol Kralı', icon: '👟' },
  asistkrali: { name: 'Asist Kralı', icon: '🎯' },
  yilin: { name: 'Yılın Oyuncusu', icon: '⭐' },
  genc: { name: 'Yılın Genç Oyuncusu', icon: '🌱' },
  euro: { name: 'Avrupa Şampiyonası (Milli)', icon: '🇹🇷' },
  wc: { name: 'Dünya Kupası (Milli)', icon: '🌍' },
};

// Sezon ödüllerini hesapla, oyuncunun kazandıklarını kupa dolabına ekle (sezon başına bir kez)
export function seasonAwards(state, sum) {
  const p = state.player;
  if (state.awardsYear === sum.year && state.lastAwards) return state.lastAwards;
  const lid = sum.myLeague;
  const n = sum.leagues[lid].length;
  const pos = Object.fromEntries(sum.leagues[lid].map((r, i) => [r.id, i + 1]));
  const stats = leagueStats(state, lid);
  const ageOf = (x) => x.me ? p.age : (state.teams[x.teamId].squad.find((s) => s.name === x.name)?.age ?? 26);
  const myAvg = sum.stats.avg || 0;
  const score = (x) => x.g * 1 + x.a * 0.7 + ((n - pos[x.teamId]) / n) * 5 + (x.me ? (myAvg - 6.8) * 6 : 0);
  const best = (f, list = stats) => list.slice().sort((a, b) => f(b) - f(a) || b.g - a.g)[0];
  const out = [];
  const gk = best((x) => x.g + x.a * 0.01);
  if (gk && gk.g > 0) out.push({ key: 'golkrali', winner: gk, value: `${gk.g} gol` });
  const ak = best((x) => x.a + x.g * 0.01);
  if (ak && ak.a > 0) out.push({ key: 'asistkrali', winner: ak, value: `${ak.a} asist` });
  const yo = best(score);
  if (yo) out.push({ key: 'yilin', winner: yo, value: `${yo.g} gol · ${yo.a} asist` });
  const young = best(score, stats.filter((x) => ageOf(x) <= 21));
  if (young) out.push({ key: 'genc', winner: young, value: `${young.g} gol · ${young.a} asist` });

  // takım kupaları
  const team = [];
  if (sum.myPos === 1) team.push({ SL: 'champ_SL', L1: 'champ_L1', PL: 'champ_PL', LL: 'champ_LL', SA: 'champ_SA', BL: 'champ_BL', FR: 'champ_FR' }[lid]);
  else if (lid === 'L1' && sum.myPos <= LEAGUES.L1.promote) team.push('promo_L1');

  p.trophies ||= [];
  const won = [];
  for (const k of team) won.push(k);
  for (const a of out) if (a.winner.me) won.push(a.key);
  for (const k of won) {
    p.trophies.push({ key: k, year: sum.year, club: p.clubId, league: lid });
    const bonus = { golkrali: 12, yilin: 15, asistkrali: 8, genc: 8, champ_SL: 20, champ_L1: 10, promo_L1: 6, champ_PL: 25, champ_LL: 25, champ_SA: 25, champ_BL: 25, champ_FR: 22 }[k] || 0;
    p.fame = clamp((p.fame || 0) + bonus / 2, 0, 100);
    p.money += Math.round(p.contract.wage * bonus);
  }
  state.awardsYear = sum.year;
  state.lastAwards = { list: out, won, lid };
  if (won.length) addInbox(state, `Sezon ödülleri: ${won.map((k) => TROPHY[k].icon + ' ' + TROPHY[k].name).join(', ')}. Tebrikler!`);
  return state.lastAwards;
}

// ---------- emeklilik ----------
export const RETIRE_MIN = 33, RETIRE_MAX = 38;
const HOF_KEY = 'golyildizi.hof';

export function hallOfFame() {
  try { return JSON.parse(localStorage.getItem(HOF_KEY) || '[]'); } catch { return []; }
}

export function retire(state) {
  const p0 = state.player;
  endSeason(state);                    // son sezon kayda geçsin, dünya ilerlesin
  const p = state.player;
  const clubs = [...new Set(p.career.seasons.map((s) => s.club))].map((id) => state.teams[id]?.name || id);
  const best = p.career.seasons.slice().sort((a, b) => b.goals - a.goals)[0];
  const summary = {
    name: `${p.name} ${p.surname}`, gen: p.gen || 1, retiredAt: p.age - 1, years: p.career.seasons.length,
    apps: p.career.apps, goals: p.career.goals, assists: p.career.assists,
    trophies: (p.trophies || []).length, trophyList: p.trophies || [], clubs, money: p.money, fame: Math.round(p.fame || 0),
    best: best ? { year: best.year, goals: best.goals, club: state.teams[best.club]?.name } : null, ovr: overall(p),
    date: Date.now(),
    children: (p.children || []).map((c) => ({ name: c.name, gender: c.gender, rel: c.rel, talent: c.talent || 0 })),
  };
  state.legacy = [...(state.legacy || []), summary];
  try {
    const hof = hallOfFame();
    hof.push(summary);
    hof.sort((a, b) => (b.goals + b.trophies * 15) - (a.goals + a.trophies * 15));
    localStorage.setItem(HOF_KEY, JSON.stringify(hof.slice(0, 30)));
  } catch { /* depolama yok */ }
  state.phase = 'retired';
  void p0;
  return summary;
}

// Oğlu 17 yaşında aynı dünyada kariyere başlar: soyadı, ünün ve paranın bir kısmı ona geçer
export function newSon(state, firstName, child = null) {
  const f = state.player;
  const son = newPlayer({
    name: firstName, surname: f.surname, foot: f.foot, nation: f.nation,
    look: { skin: f.look?.skin ?? 1, hair: pick(['kisa', 'kazitma', 'kivircik', 'uzun', 'mohikan']), hairColor: f.look?.hairColor || 'siyah' },
  });
  // gerçek çocuk: babasıyla bağı ve küçükken aldığı futbol eğitimi yeteneğine yansır
  const talent = Math.round((f.fame || 0) / 20) + (child ? Math.round(((child.rel ?? 60) - 50) / 15) + (child.talent || 0) : 0);
  for (const k of Object.keys(son.stats)) son.stats[k] += talent;
  son.money = Math.round(f.money * 0.25);
  son.fame = Math.round((f.fame || 0) * 0.2);
  son.gen = (f.gen || 1) + 1;
  son.fatherName = `${f.name} ${f.surname}`;
  initLife(son);
  son.rel.family = child ? clamp(50 + (child.rel ?? 60) / 2, 30, 100) : 85;
  // kardeşleri aile olarak kalır
  if (child) son.siblings = (f.children || []).filter((c) => c.name !== child.name).map((c) => ({ name: c.name, gender: c.gender }));
  state.player = son;
  state.phase = 'offers';
  state.offers = startingOffers(state);
  addInbox(state, `${son.name} ${son.surname}, efsane ${ek(son.fatherName, 'gen')} oğlu olarak futbola adım attı. Gözler üzerinde!`);
  return son;
}

export function trophyCounts(p) {
  const c = {};
  for (const t of p.trophies || []) (c[t.key] ||= []).push(t.year);
  return c;
}
export { money };
