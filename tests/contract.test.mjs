// Sözleşme pazarlığı: yeni maddeler, blöf, sezon ortası zam, forma garantisi
import * as E from '../js/engine.js';
import * as K from '../js/contract.js';
import assert from 'node:assert';

let agreed = 0, walked = 0, bluffOk = 0, bluffBad = 0;
for (let i = 0; i < 200; i++) {
  const s = E.newGame({ name: 'T', surname: 'O' });
  E.acceptOffer(s, s.offers[0]);
  const n = K.openNegotiation(s, { clubId: 'gs', wage: 200000, years: 3 }, 'transfer');
  assert(n.offer.champ > 0 && n.offer.play === 0 && n.limit.play >= 0 && n.limit.play <= 2);
  const w0 = n.limit.wage;
  K.bluff(s, n);
  if (n.limit.wage > w0) bluffOk++; else bluffBad++;
  K.bluff(s, n);   // ikinci blöf etkisiz
  n.demand.wage = Math.round(n.limit.wage * 0.97 / 5000) * 5000;
  const greedy = i % 2;
  n.demand.play = greedy ? 2 : n.limit.play;
  n.demand.champ = greedy ? n.offer.champ * 3 : n.offer.champ;
  for (let r = 0; r < 6 && n.status === 'open'; r++) K.submitDemand(n);
  if (n.status === 'agreed') { agreed++; assert(n.offer.play <= n.limit.play || n.offer.play === n.demand.play); K.signContract(s, n); assert(s.player.contract.champ >= 0); }
  if (n.status === 'walked') walked++;
  // karşı teklif forma garantisini sınırın üstüne çıkarmaz
  assert(n.offer.play <= Math.max(n.limit.play, 0) || n.status === 'agreed');
}
console.log({ agreed, walked, bluffOk, bluffBad });
assert(agreed > 0 && walked > 0 && bluffOk > 0 && bluffBad > 0);

// sezon ortası zam
{
  const s = E.newGame({ name: 'T', surname: 'O' });
  E.acceptOffer(s, s.offers[0]);
  s.player.contract.endsYear = s.season.year + 3;
  assert(!K.raiseAvailable(s).ok);
  s.season.week = 12; s.player.season.apps = 10; s.player.season.ratingSum = 75;
  assert(K.raiseAvailable(s).ok, K.raiseAvailable(s).why);
  const n = K.openRaise(s);
  assert.equal(n.kind, 'raise'); assert.equal(n.patience, 2);
  assert(n.offer.wage > s.player.contract.wage);
  assert(!K.raiseAvailable(s).ok, 'aynı sezon ikinci zam');
  K.acceptCurrent(n); K.signContract(s, n);
  assert(s.player.contract.wage === n.offer.wage);
}
// forma garantisi ihlali → bedelsiz transfer
{
  const s = E.newGame({ name: 'T', surname: 'O' });
  E.acceptOffer(s, s.offers[0]);
  s.player.contract = { ...s.player.contract, play: 2, release: 999_000_000_000, endsYear: s.season.year + 4 };
  let g = 0;
  while ((s.player.playBreach || 0) < 4 && g++ < 60 && s.phase === 'hub') {
    const plan = E.planMatch(s); if (!plan) { E.advanceWeek(s); continue; }
    plan.role = 'out';
    E.finishMatch(s, plan, { played: false, goals: 0, assists: 0, outcomes: [], myGoals: 1, oppGoals: 1, pens: plan.fx.knockout ? [4, 3] : undefined });
  }
  assert(s.player.playBreach >= 4, 'ihlal sayılmadı');
  assert(s.inbox.some((m) => m.text.includes('maddeyi ihlal')));
}
console.log('SÖZLEŞME TESTLERİ GEÇTİ');
