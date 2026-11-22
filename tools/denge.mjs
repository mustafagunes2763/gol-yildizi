// Denge testi: N kariyeri otomatik oynatır, sezon sezon özet çıkarır.
// Kullanım: node tools/denge.mjs [kariyer=20] [isabet=0.32]
import * as E from '../js/engine.js';
import * as K from '../js/contract.js';
import * as Social from '../js/social.js';
import { LEAGUES } from '../js/data.js';

const N = +process.argv[2] || 20, HIT = +process.argv[3] || 0.32;
const rows = [];
const stats = { injWeeks: 0, matches: 0, cupGames: 0, euroGames: 0, natCaps: 0, trophies: {} };
for (let c = 0; c < N; c++) {
  const s = E.newGame({ name: 'Sim', surname: 'Oyuncu' + c });
  E.acceptOffer(s, s.offers[0]);
  for (let season = 0; season < 18 && s.phase !== 'retired'; season++) {
    let g = 0;
    while (s.phase === 'hub' && g++ < 140) {
      const p = s.player;
      if (p.injury > 0) stats.injWeeks++;
      // antrenman: enerji yettikçe en zayıf stat
      while (p.energy >= E.TRAIN_COST + 25 && p.injury <= 0) {
        const k = E.STAT_KEYS.slice().sort((a, b) => p.stats[a] - p.stats[b])[0];
        E.train(s, k, 1.1);
      }
      if (s.event) s.event = null;
      if (s.natMatch && !s.natMatch.res) { try { (await import('../js/career.js')).playNat(s); stats.natCaps++; } catch {} s.natMatch = null; }
      const plan = E.planMatch(s);
      if (!plan) { E.advanceWeek(s); continue; }
      const moments = plan.events.filter((e) => e.type === 'moment');
      let goals = 0, assists = 0;
      for (const m of moments) { const r = Math.random(); if (r < HIT) goals++; else if (r < HIT + 0.08) assists++; }
      const teamG = plan.events.filter((e) => e.type === 'teamGoal').length, oppG = plan.events.filter((e) => e.type === 'oppGoal').length;
      const res = { played: plan.role !== 'out', goals, assists, outcomes: [], myGoals: teamG + goals + assists, oppGoals: oppG };
      if (!res.played) { res.goals = 0; res.assists = 0; res.myGoals = teamG; }
      if (plan.fx.knockout && res.myGoals + (plan.fx.agg?.my || 0) === res.oppGoals + (plan.fx.agg?.opp || 0)) res.pens = Math.random() < 0.5 ? [5, 4] : [4, 5];
      if (plan.fx.cup) stats.cupGames++; else if (plan.fx.comp) stats.euroGames++;
      if (res.played) stats.matches++;
      E.finishMatch(s, plan, res);
      if (res.injury) p.injury = res.injury;
    }
    const p = s.player;
    const sum = E.seasonSummary(s);
    rows.push({ c, season, age: p.age, ovr: Math.round(E.overall(p)), club: p.clubId, lid: sum.myLeague, str: s.teams[p.clubId].str, pos: sum.myPos,
      apps: p.season.apps, goals: p.season.goals, avg: p.season.apps ? +(p.season.ratingSum / p.season.apps).toFixed(2) : 0,
      wage: p.contract.wage, money: Math.round(p.money), fame: Math.round(p.fame), value: K.marketValue(p) });
    // sezon sonu: ödüller + en iyi teklif (daha güçlü takım) ya da uzatma
    const Aw = await import('../js/awards.js');
    if (p.age >= Aw.RETIRE_MAX) break;
    Aw.seasonAwards(s, sum);
    const offers = E.seasonOffers(s).sort((a, b) => s.teams[b.clubId].str - s.teams[a.clubId].str);
    const best = offers[0];
    if (best && (s.teams[best.clubId].str > s.teams[p.clubId].str + 2 || E.contractExpiring(s))) {
      E.endSeason(s); E.acceptOffer(s, best);
    } else {
      if (E.contractExpiring(s)) p.contract = { ...p.contract, wage: Math.round(p.contract.wage * 1.15 / 500) * 500, endsYear: s.season.year + 3 };
      E.endSeason(s);
    }
  }
  for (const t of s.player.trophies || []) stats.trophies[t.key] = (stats.trophies[t.key] || 0) + 1;
}
// sezon numarasına göre ortalamalar
const by = {};
for (const r of rows) (by[r.season] ||= []).push(r);
const avg = (a, k) => a.reduce((x, y) => x + y[k], 0) / a.length;
const fmt = (n) => n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(0) + 'K' : Math.round(n);
console.log('sz yaş  ovr  str  maç  gol  ort   maaş    para    şöhret değer  ligler');
for (const [k, a] of Object.entries(by)) {
  const lg = {}; for (const r of a) lg[r.lid] = (lg[r.lid] || 0) + 1;
  console.log(`${k.padStart(2)} ${avg(a, 'age').toFixed(0).padStart(3)} ${avg(a, 'ovr').toFixed(1).padStart(5)} ${avg(a, 'str').toFixed(1).padStart(5)} ${avg(a, 'apps').toFixed(1).padStart(4)} ${avg(a, 'goals').toFixed(1).padStart(4)} ${avg(a, 'avg').toFixed(2).padStart(5)} ${fmt(avg(a, 'wage')).padStart(7)} ${fmt(avg(a, 'money')).padStart(7)} ${avg(a, 'fame').toFixed(0).padStart(5)} ${fmt(avg(a, 'value')).padStart(6)}  ${Object.entries(lg).map(([l, n]) => l + ':' + n).join(' ')}`);
}
console.log('maç', stats.matches, 'kupa maçı', stats.cupGames, 'avrupa maçı', stats.euroGames, 'sakat hafta', stats.injWeeks, 'milli', stats.natCaps);
console.log('kupalar:', Object.entries(stats.trophies).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k}:${n}`).join(' '));
const maxG = rows.slice().sort((a, b) => b.goals - a.goals)[0];
console.log('en golcü sezon:', maxG.goals, 'gol', maxG.apps, 'maç', maxG.club, 'yaş', maxG.age);
