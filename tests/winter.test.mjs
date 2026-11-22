// Ara transfer dönemi: pencere, kalıcı transfer, kiralık, sezon sonu dönüş
import * as E from '../js/engine.js';
import * as W from '../js/winter.js';
import assert from 'node:assert';

const play = (s, until, g1 = 1) => {
  let g = 0;
  while (s.phase === 'hub' && g++ < 120 && (until == null || s.season.week < until)) {
    s.event = null;
    const plan = E.planMatch(s);
    if (!plan) { E.advanceWeek(s); continue; }
    const res = { played: plan.role !== 'out', goals: g1, assists: 0, outcomes: [], myGoals: g1 + 1, oppGoals: 1 };
    E.finishMatch(s, plan, res);
  }
};
let loans = 0, transfers = 0, windows = 0;
for (let run = 0; run < 30; run++) {
  const s = E.newGame({ name: 'K', surname: 'T' });
  E.acceptOffer(s, s.offers[0]);
  const star = run % 2 === 0;
  if (star) { s.player.clubId = 'sam'; for (const k in s.player.stats) s.player.stats[k] = 78; s.player.fame = 40; }
  else { s.player.clubId = 'gs'; }   // zayıf oyuncu büyük kulüpte: forma bulamaz → kiralık
  const ow = W.openWeek(s);
  play(s, ow + 1, star ? 1 : 0);
  assert(s.winter && s.winter.year === s.season.year, 'pencere açılmadı');
  windows++;
  assert(W.isOpen(s));
  const li = s.winter.offers.findIndex((o) => o.kind === 'loan');
  const ti = s.winter.offers.findIndex((o) => o.kind === 'transfer');
  if (!star && li >= 0) {
    const from = s.player.clubId, wage = s.player.contract.wage, ends = s.player.contract.endsYear;
    const r = W.acceptLoan(s, li, E.acceptOffer);
    loans++;
    assert.equal(s.player.clubId, r.to); assert.equal(s.player.loan.from, from);
    assert.equal(s.player.contract.wage, wage); assert.equal(s.player.contract.endsYear, ends);
    assert(!W.isOpen(s));
    play(s);
    assert.equal(s.phase, 'seasonEnd');
    const offs = E.seasonOffers(s);
    assert(!offs.some((o) => o.clubId === from), 'ana kulüp kendine teklif verdi');
    E.endSeason(s);
    assert.equal(s.player.clubId, from, 'kiralıktan dönmedi');
    assert(!s.player.loan);
    assert.equal(s.player.career.seasons.at(-1).club, r.to);
  } else if (ti >= 0) {
    const r = W.acceptTransfer(s, ti, E.acceptOffer);
    transfers++;
    assert.equal(s.player.clubId, r.to); assert(!s.player.loan);
    play(s);
    assert.equal(s.phase, 'seasonEnd');
    E.endSeason(s);
    assert.equal(s.player.clubId, r.to);
  } else {
    play(s, W.openWeek(s) + W.WINDOW_WEEKS + 1);
    assert(!W.isOpen(s), 'pencere kapanmadı');
  }
  JSON.parse(JSON.stringify(s));
}
console.log({ windows, loans, transfers });
assert(loans > 0 && transfers > 0);
console.log('ARA TRANSFER TESTLERİ GEÇTİ');
