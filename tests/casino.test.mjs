import * as C from '../js/casino.js';
import assert from 'node:assert';
const card = (s) => ({ r: s.slice(0, -1), s: s.slice(-1) });
const ev = (str) => C.evalBest(str.split(' ').map(card));
// el sıralaması
assert.equal(C.handName(ev('A♠ K♠ Q♠ J♠ 10♠ 2♥ 3♦')), 'Royal floş');
assert.equal(C.handName(ev('5♠ 4♠ 3♠ 2♠ A♠ 9♥ 9♦')), 'Floş');
assert.equal(C.handName(ev('9♠ 9♥ 9♦ 9♣ 2♥ 3♦ 4♣')), 'Kare');
assert.equal(C.handName(ev('9♠ 9♥ 9♦ 2♣ 2♥ 3♦ 4♣')), 'Full house');
assert.equal(C.handName(ev('A♥ 2♦ 3♣ 4♠ 5♥ 9♦ K♣')), 'Kent');
assert.equal(C.handName(ev('A♥ 2♥ 7♥ 4♥ 9♥ 9♦ K♣')), 'Renk');
assert.ok(ev('A♠ A♥ K♦ 7♣ 5♥ 3♦ 2♣') > ev('K♠ K♥ A♦ 7♣ 5♥ 3♦ 2♣'));
assert.ok(ev('6♠ 7♥ 8♦ 9♣ 10♥ 2♦ 2♣') > ev('A♥ 2♦ 3♣ 4♠ 5♥ 9♦ K♣'));
assert.equal(ev('A♠ K♥ 9♦ 7♣ 5♥'), ev('A♥ K♠ 9♣ 7♦ 5♠'));
// rulet ödemeleri
assert.equal(C.rouletteReturn({ n17: 100 }, 17), 3600);
assert.equal(C.rouletteReturn({ red: 100, black: 100 }, 0), 0);
assert.equal(C.rouletteReturn({ d2: 100, c2: 100, odd: 100 }, 17), 300 + 300 + 200);
assert.equal(C.WHEEL.length, 37); assert.equal(new Set(C.WHEEL).size, 37);
// barbut / kazı kazan
let w = 0; for (let i = 0; i < 4000; i++) { const r = C.playBarbut(); if (r.win) w++; assert.ok(r.rolls.length >= 1); }
assert.ok(w > 1600 && w < 2400, 'barbut dengeli ' + w);
for (let i = 0; i < 2000; i++) { const t = C.newTicket(); const c = {}; t.cells.forEach((x) => c[x] = (c[x] || 0) + 1); const triples = Object.values(c).filter((n) => n >= 3).length; assert.equal(triples, t.win ? 1 : 0); assert.equal(t.cells.length, 9); }
// poker: fiş korunumu (yapay zekâ kendine karşı)
for (let g = 0; g < 30; g++) {
  const T = C.newTable(100000);
  for (let hnd = 0; hnd < 6; hnd++) {
    if (T.players[0].stack <= 0) break;
    C.startHand(T);
    let n = 0;
    while (!T.hand.done && n++ < 200) C.act(T, C.aiMove(T));
    assert.ok(T.hand.done, 'el bitmeli');
    T.players.forEach((p) => assert.ok(p.stack >= 0));
  }
}
// toplam fiş: değiştirilen oyuncular hariç tek elde korunur
{ const T = C.newTable(50000); C.startHand(T); const before = T.players.reduce((a, p) => a + p.stack, 0) + T.hand.pot; let n = 0; while (!T.hand.done && n++ < 200) C.act(T, C.aiMove(T)); const after = T.players.reduce((a, p) => a + p.stack, 0); assert.ok(before - after >= 0 && before - after < 4, `fiş ${before} ${after}`); }
console.log('casino ok');
