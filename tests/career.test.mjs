import * as E from '../js/engine.js';
import * as C from '../js/career.js';
import assert from 'node:assert';
const st = E.newGame({ name: 'Arda', surname: 'Yıldırım' });
E.acceptOffer(st, st.offers[0]);
// kamp
assert.ok(C.campAvailable(st));
C.campPick(st, 'place', 'alpler'); C.campPick(st, 'focus', 'bitiricilik'); C.campPick(st, 'friendly', 1);
assert.equal(st.camp.friendlies.length, 2);
const n = C.shirtOptions(st)[0]; C.campPick(st, 'shirt', n);
assert.ok(st.camp.done); assert.equal(st.player.shirt, n);
// milli: güçlü oyuncu yap, milli araya kadar ilerle
for (const k of E.STAT_KEYS) st.player.stats[k] = 85; st.player.fame = 50;
let called = false;
for (let w = 0; w < 30 && !called; w++) { E.advanceWeek(st); st.event = null; if (st.natMatch) called = true; }
assert.ok(called, 'milli davet');
const r = C.playNat(st); assert.ok(r && st.player.nat.caps === 1);
C.closeNat(st); assert.equal(st.natMatch, null);
// tedavi
st.player.injury = 4; st.player.money = 1e9; st.player.weekFlags = {};
assert.ok(C.rehab(st, 'abroad').ok); assert.equal(st.player.injury, 2);
assert.equal(C.rehab(st, 'early').ok, false, 'haftada bir');
st.player.weekFlags = {}; assert.ok(C.rehab(st, 'early').ok); assert.equal(st.player.injury, 0); assert.equal(st.player.fragile, 6);
// turnuva: 2027-28 sezonu sonu EURO 2028
st.season.year = 2027; st.player.nat.level = 'A';
const t = C.startTournament(st); assert.ok(t && t.name === 'EURO 2028');
let k = 0; while (!t.out && !t.champion && k++ < 10) C.nextTournamentGame(st);
assert.ok(t.out || t.champion); assert.equal(st.player.nat.tourn.length, 1);
assert.equal(C.tournamentFor(st), null, 'bir kez');
JSON.parse(JSON.stringify(st));
console.log('KARİYER TESTLERİ GEÇTİ');
