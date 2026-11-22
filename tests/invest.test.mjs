// Yatırımlar ve at yarışı
import * as E from '../js/engine.js';
import * as I from '../js/invest.js';
import * as C from '../js/celebrate.js';
import assert from 'node:assert';

const s = E.newGame({ name: 'Y', surname: 'Atçı' });
E.acceptOffer(s, s.offers[0]);
s.player.money = 2_000_000_000;
for (const it of I.PROPS) assert(I.buyProp(s, it.id).ok, it.id);
assert(!I.buyProp(s, 'inv_kafe').ok, 'iki kez alınabildi');
const m = I.market(s);
assert.equal(m.length, 4);
assert(I.buyHorse(s, m[3].id).ok);
const h = s.player.invest.horses[0];
const before = s.player.money;
for (let w = 0; w < 6; w++) E.advanceWeek(s);
assert(s.player.invest.last && typeof s.player.invest.last.total === 'number');
// yarış
let wins = 0;
for (let i = 0; i < 40; i++) {
  h.fatigue = 0;
  const r = I.runRace(s, 'handikap', h.id, ['onde', 'orta', 'sonda'][i % 3]);
  assert(!r.error, r.error);
  assert.equal(r.field.length, 8); assert(r.frames.length > 20);
  assert(r.frames.at(-1).every((x) => x <= 1));
  assert.equal(r.order.length, 8);
  if (r.place === 1) wins++;
}
assert(wins > 5 && wins < 40, 'elit at handikapta ' + wins);
// dinlenme
const r2 = I.runRace(s, 'maiden', h.id, 'orta');
assert(r2.error, 'dinlenmeden koştu');
// sezon sonu: yaş ve pazar
E.endSeason(s);
assert(h.age >= 3);
assert.notEqual(I.market(s)[0].id, m[0].id);
assert(I.sellProp(s, 'inv_otel').ok);
JSON.parse(JSON.stringify(s));
// gol sevinci
const plan = { fx: { opp: 'fb' } };
const opts = C.options(s, plan, { yellows: 0 });
assert(opts.length >= 3 && opts[0].v === 'taraftar');
const f0 = s.player.fans ?? 50;
C.apply(s, 'taraftar', plan, { ad: 'Atçı' });
assert(s.player.fans > f0);
assert.equal(C.apply(s, 'forma', plan, { ad: 'Atçı' }).card, 'yellow');
console.log('YATIRIM TESTLERİ GEÇTİ', { wins });
