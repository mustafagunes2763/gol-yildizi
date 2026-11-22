// Ulusal kupalar: kurulum, takvim, oyuncunun maçları, şampiyon, ödül
import * as E from '../js/engine.js';
import * as Cup from '../js/cup.js';
import * as News from '../js/news.js';
import * as Iv from '../js/interview.js';
import assert from 'node:assert';

let cupGames = 0, titles = 0, pensSeen = 0;
for (let run = 0; run < 8; run++) {
  const s = E.newGame({ name: 'Test', surname: 'Oyuncu' });
  E.acceptOffer(s, s.offers[0]);
  const club = ['gs', 'fb', 'bjk', 'ts', 'ars', 'rma', 'bay', 'psv'][run];
  s.player.clubId = club;
  const C = s.cups;
  assert(C && C.cups.TUR && C.cups.ENG && C.cups.BEL, 'kupalar kurulmadı');
  for (const [c, cup] of Object.entries(C.cups)) {
    const euroW = new Set(s.euro.weeks);
    for (const r of cup.rounds) { assert(!euroW.has(r.week), `${c} ${r.name} Avrupa haftasında`); assert(r.week >= 4 && r.week < s.season.totalWeeks); }
    const ws = cup.rounds.map((r) => r.week);
    assert.deepEqual(ws, [...new Set(ws)].sort((a, b) => a - b), c + ' hafta sırası');
  }
  let guard = 0;
  while (s.phase === 'hub' && guard++ < 120) {
    const plan = E.planMatch(s);
    if (!plan) { E.advanceWeek(s); continue; }
    const res = { played: plan.role !== 'out', goals: E.randInt(0, 1), assists: 0, outcomes: [], myGoals: E.randInt(0, 3), oppGoals: E.randInt(0, 2) };
    if (res.goals > res.myGoals) res.goals = res.myGoals;
    if (plan.fx.cup) {
      cupGames++;
      assert(plan.fx.knockout && plan.fx.single && !plan.fx.agg);
      if (res.myGoals === res.oppGoals) { res.pens = Math.random() < 0.5 ? [5, 4] : [3, 4]; pensSeen++; }
      Iv.preInterview?.(s, plan);
    }
    E.finishMatch(s, plan, res);
    if (plan.fx.cup) {
      const n = News.cupNews(s, plan, res);
      if (res.cupTrophy) { titles++; assert(n && n.headline); assert(s.player.trophies.some((t) => t.key === 'cup_' + plan.fx.cup)); }
      Iv.postInterview(s, plan, res);
    }
  }
  assert.equal(s.phase, 'seasonEnd');
  for (const [c, cup] of Object.entries(s.cups.cups)) {
    assert(cup.winner, c + ' şampiyonsuz');
    const all = cup.rounds.flatMap((r) => r.ties || []);
    assert(all.every((t) => t.w), c + ' oynanmamış eşleşme');
    assert.equal(cup.rounds[cup.rounds.length - 1].ties.length, 1, c + ' final tek maç değil');
    assert.equal(cup.out.length, Cup.cupTeamsCount(s, c) - 1, c + ' elenen sayısı');
  }
  const st = Cup.myStatus(s);
  assert(st && (st.winner || st.out));
  JSON.parse(JSON.stringify(s));
  // yeni sezon yeni kupa
  E.endSeason(s);
  assert.equal(s.cups.year, s.season.year);
  assert(Object.values(s.cups.cups).every((c) => !c.winner && c.cur === 0));
}
// eski kayıt: cups yoksa ensure ile sezon ortasında kurulur
{
  const s = E.newGame({ name: 'Eski', surname: 'Kayıt' });
  E.acceptOffer(s, s.offers[0]);
  for (let i = 0; i < 15; i++) E.advanceWeek(s);
  delete s.cups;
  Cup.ensure(s);
  for (const cup of Object.values(s.cups.cups)) for (const r of cup.rounds) if (r.week < 15) assert(r.ties && r.ties.every((t) => t.w), 'geçmiş tur oynanmadı');
}
console.log('kupa maçı', cupGames, 'kupa şampiyonluğu', titles, 'penaltı', pensSeen);
assert(cupGames > 8);
console.log('KUPA TESTLERİ GEÇTİ');
