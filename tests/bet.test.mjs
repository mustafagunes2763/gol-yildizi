import * as E from '../js/engine.js';
import * as Bet from '../js/betting.js';
import * as Life from '../js/life.js';
import assert from 'node:assert';
const s = E.newGame({ name: 'T', surname: 'O' }); E.acceptOffer(s, s.offers[0]); Life.initLife(s.player);
s.player.money = 1e9;
let staked = 0, paid = 0;
for (let w = 0; w < 20; w++) {
  const list = Bet.bulletin(s);
  assert(list.length > 15);
  for (const m of list) {
    // olasılıkların toplamı ~1/0.92 (kasa payı) olmalı
    const inv = (o) => Object.values(o).reduce((a, x) => a + 1 / x, 0);
    for (const mk of ['MS', 'CS', 'AU', 'KG', 'IY']) if (Math.min(...Object.values(m.mk[mk])) > 1.03) assert(inv(m.mk[mk]) > (mk === 'CS' ? 2 : 1), mk);
    if (Math.min(...Object.values(m.mk.MS)) > 1.03) assert(Math.abs(inv(m.mk.MS) - 1 / 0.92) < 0.03, 'MS marj ' + inv(m.mk.MS));
  }
  const slip = [];
  for (const m of list.slice(0, 3)) Bet.toggleSlip(slip, m, E.pick(['MS', 'AU', 'KG', 'IY', 'SK']), null) ;
  slip.length = 0;
  for (const m of list.slice(0, 3)) { const mk = E.pick(['MS', 'AU', 'KG', 'IY', 'SK', 'CS']); Bet.toggleSlip(slip, m, mk, E.pick(Object.keys(m.mk[mk]))); }
  const before = s.player.money;
  assert(Bet.place(s, slip, 10000, 'kombine').ok);
  assert(Bet.place(s, slip, 10000, 'tekli').ok);
  staked += before - s.player.money;
  const plan = E.planMatch(s);
  if (plan) E.finishMatch(s, plan, { played: true, goals: 0, assists: 0, outcomes: [], myGoals: 1, oppGoals: 1 });
  else E.advanceWeek(s);
  if (s.phase !== 'hub') break;
}
const st = s.player.betStats;
assert(st.coupons >= 70 && s.player.betHistory.length > 0 && s.player.bets.length <= 4);
console.log(`kupon ${st.coupons}, tutan ${st.hits}, yatırılan ${st.staked}, kazanılan ${st.won}`);
JSON.parse(JSON.stringify(s));
console.log('BAHİS TESTLERİ GEÇTİ');
