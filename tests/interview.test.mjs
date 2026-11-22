import * as E from '../js/engine.js';
import * as Iv from '../js/interview.js';
import assert from 'node:assert';
const st = E.newGame({ name: 'Arda', surname: 'Yıldırım' }); E.acceptOffer(st, st.offers[0]);
for (let w = 0; w < 3; w++) { E.advanceWeek(st); st.event = null; }
let n = 0;
for (const [k, c] of Object.entries(Iv._C)) {
  for (const rid of Object.keys(c.q)) assert.ok(Iv.REPORTERS[rid], `${k}: muhabir ${rid}`);
  for (const tone of Object.keys(Iv.TONES)) assert.ok(c.a[tone]?.length, `${k}: ${tone} cevabı yok`);
  for (const t of [...Object.values(c.q).flat(), ...Object.values(c.a).flat().map((a) => a.t)]) { n++; assert.ok(!/\{(?!ad|rakip|takim|sehir|sevgili|araba|pos|skor|sonuc|ahmet|kupa)\w+\}/.test(t), `${k}: bilinmeyen değişken: ${t}`); }
}
// gerçek akış: çok sayıda maç öncesi/sonrası röportaj
const p = st.player; const lid = E.leagueOf(st, p.clubId);
const ctxs = new Set();
for (let i = 0; i < 400; i++) {
  const opp = E.pick(st.leagues[lid].filter((t) => t !== p.clubId));
  const plan = { role: 'starter', fx: { opp, h: p.clubId, a: opp, home: true, comp: i % 7 === 0 ? 'UCL' : null }, promise: false };
  if (i % 9 === 0) st.social.rival.team = opp;
  const pre = Iv.preInterview(st, plan); if (pre) { ctxs.add(pre.ctx); assert.ok(!pre.q.includes('{')); pre.answers.forEach((a) => assert.ok(!a.text.includes('{'), a.text)); Iv.applyAnswer(st, pre, pre.answers[0]); }
  const res = { played: true, goals: E.randInt(0, 2), assists: 0, myGoals: E.randInt(0, 5), oppGoals: E.randInt(0, 3), rating: 6.5, outcomes: [], lateWinner: i % 5 === 0 };
  res.result = res.myGoals > res.oppGoals ? 'W' : res.myGoals < res.oppGoals ? 'L' : 'D';
  const post = Iv.postInterview(st, plan, res); if (post) { ctxs.add(post.ctx); post.answers.forEach((a) => assert.ok(!a.text.includes('{'), a.text)); Iv.applyAnswer(st, post, post.answers[1]); }
}
console.log(n, 'metin ·', ctxs.size, 'farklı senaryo görüldü:', [...ctxs].join(' '));
console.log('RÖPORTAJ TESTLERİ GEÇTİ');
