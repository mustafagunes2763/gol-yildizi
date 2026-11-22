import * as E from '../js/engine.js';
import * as S from '../js/stories.js';
import * as Life from '../js/life.js';
import assert from 'node:assert';

const s = E.newGame({ name: 'Test', surname: 'Oyuncu' });
E.acceptOffer(s, s.offers[0]);
const p = s.player;
Life.initLife(p);
p.money = 50_000_000; p.fame = 80; p.age = 26; p.rel.coach = 70; p.rel.team = 70;
p.partner = { name: 'Elif Kaya', portrait: 1, value: 60, weeks: 5, married: false };
const bad = /undefined|NaN|null|\[object/;
let n = 0;
const check = (ev, where) => {
  assert(ev.title && ev.text && ev.options?.length, where + ' boş');
  for (const t of [ev.title, ev.text, ...ev.options.map((o) => o.label)]) assert(!bad.test(t), `${where}: ${t}`);
  JSON.parse(JSON.stringify(ev)); // kaydedilebilir olmalı
};
const { SINGLES, CHAINS } = S._all;
for (const [id, f] of Object.entries(SINGLES)) {
  const ev = f(s); if (!ev) continue;
  for (let i = 0; i < ev.options.length; i++) {
    const raw = f(s); if (!raw) break;   // tek seferlik koşullu olay (ör. köpek sahiplenildi)
    const e2 = { ...raw, id };
    check(e2, id);
    s.event = e2;
    const r = Life.resolveEvent(s, i);
    assert(r, id);
    assert(!bad.test(r.result + r.summary), `${id}/${i}: ${r.result} ${r.summary}`);
    n++;
  }
}
// zincirler: tüm adımlar, tüm seçenekler
for (const [id, c] of Object.entries(CHAINS)) {
  for (const step of Object.keys(c.steps)) {
    for (let rep = 0; rep < 4; rep++) {
      const ev = c.steps[step](s, { c: 100_000, careful: rep % 2 === 0 });
      check(ev, `${id}.${step}`);
      for (let i = 0; i < ev.options.length; i++) {
        const base = { ...ev, id: `${id}_${step}`, story: id };
        for (const o of base.options) if (o.odds && typeof o.odds.p === 'function') o.odds.p = o.odds.p(s);
        s.event = JSON.parse(JSON.stringify(base));
        const r = Life.resolveEvent(s, i);
        assert(!bad.test(r.result + r.summary), `${id}.${step}/${i}: ${r.result} | ${r.summary}`);
        n++;
      }
    }
  }
}
// sonraki bölüm planlama
for (const [id, st] of Object.entries(p.stories)) assert(CHAINS[id].steps[st.step], `${id} → ${st.step} yok`);
// haftalık akış: 300 hafta boyunca olay gelir, zincirler ilerler
let events = 0, storyEv = 0;
p.stories = {}; p.seenEv = {};
for (let w = 0; w < 300; w++) {
  s.season.week = w % 34; if (w % 34 === 0) s.season.year++;
  s.event = null;
  const ev = S.weeklyStory(s, null);
  if (ev) { events++; if (ev.story) storyEv++; check(ev, ev.id); s.event = ev; Life.resolveEvent(s, Math.floor(Math.random() * ev.options.length)); }
}
console.log(`seçenek testi: ${n}, 300 haftada olay: ${events} (hikâye bölümü ${storyEv})`);
assert(events > 60 && storyEv > 10);
console.log('HİKÂYE TESTLERİ GEÇTİ');
