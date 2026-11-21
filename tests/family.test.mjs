import * as E from '../js/engine.js';
import * as Fam from '../js/family.js';
import * as S from '../js/stories.js';
import * as Life from '../js/life.js';
import * as Aw from '../js/awards.js';
import assert from 'node:assert';

const s = E.newGame({ name: 'Test', surname: 'Oyuncu' });
E.acceptOffer(s, s.offers[0]);
const p = s.player; Life.initLife(p);
p.money = 500_000_000; p.age = 25; p.fame = 60;
p.partner = { name: 'Elif Kaya', job: 'Mimar', portrait: 1, value: 90, weeks: 30, married: false, likesFame: true };
// teklif: yüksek ilişki + pahalı yüzük + stadyum (ünlüyü sever) => büyük şans
assert(Fam.acceptChance(p, Fam.RINGS[2], Fam.PLACES[2]) > 0.9);
p.partner.likesFame = false;
assert(Fam.acceptChance(p, Fam.RINGS[0], Fam.PLACES[2]) < Fam.acceptChance(p, Fam.RINGS[0], Fam.PLACES[0]));
p.partner.likesFame = true;
let r; let tries = 0;
do { p.partner.cooldown = 0; p.partner.value = 95; r = Fam.propose(s, 'r3', 'stad'); tries++; } while (!r.yes && p.partner && tries < 20);
assert(r.yes && p.partner.engaged);
const m0 = p.money;
assert(Fam.wed(s, 'buyuk').ok && p.partner.married && p.money < m0);
// ret senaryosu
const s2 = E.newGame({ name: 'A', surname: 'B' }); E.acceptOffer(s2, s2.offers[0]); Life.initLife(s2.player);
s2.player.money = 1e9; s2.player.partner = { name: 'Naz Ateş', job: 'Avukat', portrait: 0, value: 56, weeks: 11, likesFame: false };
let no = 0; for (let i = 0; i < 30 && s2.player.partner; i++) { s2.player.partner.cooldown = 0; s2.player.partner.value = 56; s2.player.partner.engaged = false; const x = Fam.propose(s2, 'r1', 'stad'); if (!x.yes) no++; }
assert(no > 5, 'reddedilme hiç olmuyor');
// bebek zinciri: start -> news -> birth
p.partner.marriedAt = -100;
const { CHAINS } = S._all;
s.event = { ...CHAINS.baby.steps.birth(s, {}), id: 'baby_birth', story: 'baby' };
Life.resolveEvent(s, 0);
assert.equal(p.children.length, 1);
s.event = { ...CHAINS.baby.steps.birth(s, {}), id: 'baby_birth', story: 'baby' };
Life.resolveEvent(s, 1);
assert.equal(p.children.length, 2);
assert.notEqual(p.children[0].name, p.children[1].name);
// çocuk olayları
for (const k of ['child_birthday', 'child_sick', 'anniversary', 'in_laws', 'away_much', 'jealous']) {
  p.children.forEach((c) => (c.born = s.season.year - 7));
  const ev = S._all.SINGLES[k](s);
  assert(ev, k);
  s.event = { ...ev, id: k }; const res = Life.resolveEvent(s, 0); assert(res, k);
}
// boşanma talebi: ilişki dibe vurunca otomatik gelir
p.partner.value = 10; p.stories = {}; p.seenEv = {};
const ev = S.weeklyStory(s, null);
assert.equal(ev.id, 'marriage_crisis_ask');
const before = p.money;
s.event = ev; Life.resolveEvent(s, 1);   // anlaşmalı boşan
assert(!p.partner, 'boşanmadı');
assert(p.money < before && p.alimony && p.alimony.weekly > 0);
assert(p.children.every((c) => c.exOf));
const m1 = p.money; Life.weeklyLife(s, s.season.week); assert(p.money < m1 + 1, 'nafaka ödenmedi');
// emeklilik: oğulla devam
p.children[0].gender = 'e'; p.children[0].rel = 95; p.children[0].talent = 3;
p.age = 36; const sum = Aw.retire(s);
assert(sum.children.length === 2);
const son = Aw.newSon(s, sum.children[0].name, sum.children[0]);
assert.equal(son.name, sum.children[0].name);
assert(son.siblings.length === 1);
JSON.parse(JSON.stringify(s));
console.log('AİLE TESTLERİ GEÇTİ');
