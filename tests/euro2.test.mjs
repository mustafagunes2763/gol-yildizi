// Konferans Ligi, Süper Kupa ve Türk ön elemeleri
import * as E from '../js/engine.js';
import * as Eu from '../js/europe.js';
import assert from 'node:assert';

const playSeason = (s, log) => {
  let guard = 0, euroMatches = [];
  while (s.phase === 'hub' && guard++ < 80) {
    const plan = E.planMatch(s);
    if (!plan) { E.advanceWeek(s); continue; }
    if (plan.fx.comp) euroMatches.push(`${s.season.week}:${plan.fx.comp}${plan.fx.qual != null ? '(Q)' : ''} ${plan.fx.round}`);
    const res = { played: plan.role !== 'out', goals: 0, assists: 0, outcomes: [], myGoals: E.randInt(0, 3), oppGoals: E.randInt(0, 2) };
    if (plan.fx.knockout && res.myGoals + (plan.fx.agg?.my || 0) === res.oppGoals + (plan.fx.agg?.opp || 0)) res.pens = [5, 4];
    E.finishMatch(s, plan, res);
  }
  return euroMatches;
};

let seenQual = 0, seenUECL = 0, seenSuper = 0;
for (let run = 0; run < 6; run++) {
  const s = E.newGame({ name: 'Test', surname: 'Oyuncu' });
  // GS'ye imza at (ŞL lig aşaması)
  const gs = { clubId: 'gs', wage: 100000, years: 3 };
  E.acceptOffer(s, s.offers[0]); s.player.clubId = 'gs';
  assert.equal(Object.keys(s.euro.comps).length, 3);
  assert.equal(s.euro.comps.UECL.teams.length, 36);
  assert.equal(s.euro.comps.UECL.rounds.length, 6);
  assert(s.euro.super && s.euro.super.hi === 'psg');
  for (const c of Object.values(s.euro.comps)) assert.equal(new Set(c.teams).size, 36, c.id + ' tekrar eden takım');
  playSeason(s);
  for (const c of Object.values(s.euro.comps)) assert(c.winner, c.id + ' şampiyonsuz');
  assert(s.euro.super.w, 'süper kupa oynanmadı');
  // ikinci sezon: SL sırasını zorla, oyuncu 2. sıradaki takımda
  const sum = E.seasonSummary(s);
  const order = sum.leagues.SL.map((r) => r.id);
  const target = order[1 + (run % 4)];
  E.endSeason(s);
  s.offers = []; s.player.clubId = target; s.phase = 'hub';
  if (s.phase !== 'hub' || !s.season || s.season.week !== 0) E.newSeason(s);
  const q = s.euro.quals;
  assert(q.length >= 3 && q.length <= 4, 'TR eleme sayısı');
  for (const c of Object.values(s.euro.comps)) { assert.equal(c.teams.length, 36, c.id); assert.equal(new Set(c.teams).size, 36, c.id + ' tekrar'); }
  const ms = playSeason(s);
  seenQual += ms.filter((x) => x.includes('(Q)')).length;
  seenUECL += ms.filter((x) => x.includes('UECL')).length;
  seenSuper += ms.filter((x) => x.includes('USC')).length;
  for (const x of q) assert(x.done, 'eleme bitmedi');
  for (const c of Object.values(s.euro.comps)) { assert.equal(new Set(c.teams).size, 36, c.id + ' takas sonrası tekrar'); assert(c.winner); }
  const all = Object.values(s.euro.comps).flatMap((c) => c.teams);
  assert.equal(new Set(all).size, all.length, 'bir takım iki kupada');
  console.log(`${s.teams[target].short}: ${q.map((x) => `${x.team}→${x.comp}:${x.result}`).join(' ')} | maçlar: ${ms.slice(0, 5).join(', ')}`);
  JSON.parse(JSON.stringify(s));
}
console.log('eleme maçı', seenQual, 'KL maçı', seenUECL);
assert(seenQual > 0);
console.log('AVRUPA TESTLERİ GEÇTİ');
