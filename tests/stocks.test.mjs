// Borsa: fiyat güncelleme, al-sat, reklam etkisi, temettü
import * as E from '../js/engine.js';
import * as S from '../js/stocks.js';
import assert from 'node:assert';

assert.equal(S.STOCKS.length, 24);
assert.equal(new Set(S.STOCKS.map((s) => s.code)).size, 24);
const s = E.newGame({ name: 'Test', surname: 'Oyuncu' });
E.acceptOffer(s, s.offers[0]);
S.ensure(s);
s.player.money = 10_000_000;
// al
const px = S.price(s, 'LIKE');
const b = S.buy(s, 'LIKE', 1_000_000);
assert(b.ok && b.n === Math.floor(1_000_000 / (px * 1.002)), 'alım adedi');
assert(Math.abs(s.player.money - (10_000_000 - b.cost)) < 1);
// yarısını sat
const sl = S.sell(s, 'LIKE', 0.5);
assert(sl.ok && sl.n === Math.floor(b.n / 2));
assert.equal(S.holdings(s).LIKE.n, b.n - sl.n);
// fiyatlar: 3 sezonluk simülasyon, aşırı uçlara gitmesin
const ratios = [];
for (let season = 0; season < 3; season++) {
  for (let w = 0; w < 34; w++) { s.season.week = w; S.weekly(s); }
  s.season.year++;
}
for (const st of S.STOCKS) ratios.push(S.price(s, st.code) / st.p0);
const mn = Math.min(...ratios), mx = Math.max(...ratios);
assert(mn > 0.2 && mx < 5, `fiyat aralığı ${mn.toFixed(2)}–${mx.toFixed(2)}`);
assert(S.ensure(s).news.length > 5, 'haber üretilmeli');
// aynı hafta iki kez güncellenmez
S.weekly(s); const before = S.price(s, 'YAPI'); S.weekly(s); assert.equal(S.price(s, 'YAPI'), before);
// reklam etkisi: buzz verilen hisse ortalamada yükselir
let up = 0;
for (let i = 0; i < 60; i++) {
  s.season.week = (s.season.week + 1) % 34; if (!s.season.week) s.season.year++;
  S.sponsorBuzz(s, 'Defne Akyazı');
  const p0 = S.price(s, 'DFNE'); S.weekly(s); if (S.price(s, 'DFNE') > p0) up++;
}
assert(up > 40, 'reklam sonrası yükseliş ' + up);
// temettü
s.player.money = 50_000_000;
S.buy(s, 'YAPI', 10_000_000);
const m0 = s.player.money; const d = S.seasonEnd(s);
assert(d > 0 && s.player.money === m0 + d, 'temettü');
console.log('BORSA TESTLERİ GEÇTİ', { aralık: [mn.toFixed(2), mx.toFixed(2)], reklam: up });
