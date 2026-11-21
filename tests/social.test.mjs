import * as E from '../js/engine.js';
import * as S from '../js/social.js';
import assert from 'node:assert';
const st = E.newGame({ name: 'Arda', surname: 'Yıldırım' });
E.acceptOffer(st, st.offers[0]);
const r = st.social.rival;
assert.ok(r && r.team !== st.player.clubId, 'rakip başka takımda');
assert.equal(E.leagueOf(st, r.team), E.leagueOf(st, st.player.clubId), 'aynı lig');
assert.equal(Object.values(st.teams).flatMap((t) => t.squad).filter((x) => x.name === S.RIVAL_NAME).length, 1, 'tek Ahmet');
for (let w = 0; w < 12; w++) { E.advanceWeek(st); st.event = null; }
assert.ok(st.social.feed.length > 5);
assert.ok(S.post(st, 'training').ok);
assert.equal(S.post(st, 'fans').ok, false, 'haftada 1 paylaşım');
// hikâye
assert.ok(S.postStory(st, 'gym').ok); assert.equal(S.postStory(st, 'food').ok, false);
// canlı yayın
assert.ok(S.startLive(st).ok); for (let i = 0; i < 3; i++) assert.ok(S.answerLive(st, 0).ok);
assert.ok(st.social.live.gain >= 0); S.endLive(st); assert.equal(S.startLive(st).ok, false, '4 haftada bir');
// profil
assert.ok(S.profileOf(st, 'emir').bio); assert.ok(S.profileOf(st, 'ahmet').author.rival);
// anket
for (let w = 0; w < 6; w++) { E.advanceWeek(st); st.event = null; }
const pl = st.social.feed.find((f) => f.poll); if (pl) { assert.equal(pl.poll.opts.reduce((a, o) => a + o.pct, 0), 100); assert.ok(S.vote(st, pl.id, 0).ok); assert.equal(S.vote(st, pl.id, 0).ok, false); }
for (const d of st.social.dms.filter((x) => x.options && !x.done)) S.answerDm(st, d.id, d.options.length - 1);
// transfer: üst lige geçince Ahmet de gelir
const big = st.leagues.SL.find((t) => t !== r.team);
E.acceptOffer(st, { clubId: big, wage: 1e5, years: 3 });
assert.equal(E.leagueOf(st, st.social.rival.team), 'SL');
assert.notEqual(st.social.rival.team, big);
assert.equal(Object.values(st.teams).flatMap((t) => t.squad).filter((x) => x.name === S.RIVAL_NAME).length, 1);
// kriz
S.startCrisis(st, 'test'); assert.ok(st.social.crisis);
assert.ok(S.composeOptions(st).some((o) => o.id === 'sorry'));
st.social.weekPosts = 0; S.post(st, 'sorry'); assert.equal(st.social.crisis, null);
JSON.parse(JSON.stringify(st));
console.log('SOSYAL TESTLER GEÇTİ');
