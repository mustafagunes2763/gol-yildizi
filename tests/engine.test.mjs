import * as E from '../js/engine.js';
import assert from 'node:assert';

// fikstür: her takım her takımla 2 kez, her hafta herkes 1 maç
for (const n of [18, 20]) {
  const ids = Array.from({ length: n }, (_, i) => 't' + i);
  const fx = E.makeFixtures(ids);
  assert.equal(fx.length, (n - 1) * 2);
  const pairs = new Map();
  for (const r of fx) {
    const seen = new Set();
    for (const m of r) { assert(!seen.has(m.h) && !seen.has(m.a)); seen.add(m.h); seen.add(m.a); pairs.set(m.h + '-' + m.a, (pairs.get(m.h + '-' + m.a) || 0) + 1); }
    assert.equal(seen.size, n);
  }
  assert.equal(pairs.size, n * (n - 1)); // her ev-deplasman kombinasyonu bir kez
}

// Tam kariyer simülasyonu (mini oyun rastgele sonuçla)
const s = E.newGame({ name: 'Test', surname: 'Oyuncu' });
assert.equal(s.offers.length, 3);
E.acceptOffer(s, s.offers[0]);
const outcomes = ['goal', 'saved', 'miss', 'assist', 'blocked', 'lost', 'over'];
let roles = {};
for (let season = 0; season < 6; season++) {
  let guard = 0;
  while (s.phase === 'hub' && guard++ < 60) {
    // biraz antrenman
    while (s.player.energy >= 60 && s.player.injury === 0) E.train(s, E.pick(E.STAT_KEYS));
    const plan = E.planMatch(s);
    if (!plan) { E.advanceWeek(s); continue; }
    roles[plan.role] = (roles[plan.role] || 0) + 1;
    const res = { played: plan.role !== 'out', goals: 0, assists: 0, outcomes: [], myGoals: 0, oppGoals: 0 };
    for (const ev of plan.events) {
      if (ev.type === 'teamGoal') res.myGoals++;
      if (ev.type === 'oppGoal') res.oppGoals++;
      if (ev.type === 'moment') { const o = E.pick(outcomes); res.outcomes.push(o); if (o === 'goal') { res.goals++; res.myGoals++; } if (o === 'assist') { res.assists++; res.myGoals++; } }
    }
    E.finishMatch(s, plan, res);
  }
  assert.equal(s.phase, 'seasonEnd');
  const sum = E.seasonSummary(s);
  // tablo tutarlılığı
  for (const [lid, rows] of Object.entries(sum.leagues)) {
    const n = rows.length;
    for (const r of rows) assert.equal(r.p, (n - 1) * 2, `${lid} ${r.id} maç sayısı`);
    const gf = rows.reduce((a, r) => a + r.gf, 0), ga = rows.reduce((a, r) => a + r.ga, 0);
    assert.equal(gf, ga);
  }
  const offers = E.seasonOffers(s);
  console.log(`Sezon ${sum.year}: ${s.teams[s.player.clubId].name} ${sum.myPos}. | maç ${sum.stats.apps} gol ${sum.stats.goals} ort ${sum.stats.avg} | güç ${E.overall(s.player)} | para ${E.money(s.player.money)} | teklif: ${offers.map(o => s.teams[o.clubId].short + ' ' + E.money(o.wage)).join(', ')}`);
  E.endSeason(s);
  if (offers.length) E.acceptOffer(s, offers[0]);
  assert.equal(s.leagues.SL.length, 18);
  assert.equal(s.leagues.L1.length, 20);
}
console.log('roller:', roles);
JSON.parse(JSON.stringify(s)); // kayıt serileştirilebilir
console.log('TÜM TESTLER GEÇTİ');
