// Paslaş ekranı: Akış · Paylaş · Profil · Mesajlar
import * as S from './social.js';
import * as Look from './look.js';

let X = null;   // { st(), ui, persist, render, toast, money, esc, badge, face, go }
export function init(ctx) { X = ctx; }
const esc = (s) => X.esc(s);
const st = () => X.st();

function avatar(a, size = 40) {
  const state = st();
  if (a.me) { const t = state.teams[state.player.clubId]; return `<span class="sav" style="width:${size}px;height:${size}px">${Look.portraitSvg(Look.lookOf(state.player), [t.c1, t.c2], size)}</span>`; }
  if (a.rival) return `<span class="sav rv" style="width:${size}px;height:${size}px">${X.face('ahmet', size, 'round')}</span>`;
  if (a.face) return `<span class="sav" style="width:${size}px;height:${size}px">${X.face(a.face, size, 'round')}</span>`;
  if (a.club) return X.badge(state.teams[a.club], size);
  return `<span class="sav emo" style="width:${size}px;height:${size}px;font-size:${Math.round(size * 0.5)}px">${a.av || '🙂'}</span>`;
}
const nameLine = (a) => `<b>${esc(a.name)}</b>${a.verified ? '<i class="ver">✔</i>' : ''}${a.rival ? '<em class="rtag">RAKİP</em>' : ''}${a.mate ? '<em class="mtag">Takım arkadaşın</em>' : ''}<small>@${esc(a.handle || '')}</small>`;
const profKey = (a) => a.persona || (a.rival ? 'ahmet' : null);
const head = (a, size = 40) => { const k = profKey(a); return `<div class="shead ${k ? 'tap' : ''}" ${k ? `data-act="socProf" data-k="${k}"` : ''}>${avatar(a, size)}<div class="sname">${nameLine(a)}</div></div>`; };
const fmtText = (t) => esc(t).replace(/\n/g, '<br>').replace(/(^|\s|<br>)(#[\wçğıöşüÇĞİÖŞÜ]+)/g, '$1<span class="htag">$2</span>');
function pollHtml(f) {
  const pl = f.poll, me = `${st().player.name} ${st().player.surname}`;
  if (pl.voted == null) return `<div class="poll">${pl.opts.map((o, i) => `<button data-act="socVote" data-id="${f.id}" data-o="${i}">${esc(o.t)}</button>`).join('')}<small class="muted">${S.fmtF(pl.total)} oy · oy verince sonuçlar görünür</small></div>`;
  const max = Math.max(...pl.opts.map((o) => o.pct));
  return `<div class="poll done">${pl.opts.map((o, i) => `<div class="pbar ${o.pct === max ? 'win' : ''} ${o.t === me ? 'me' : ''}"><div style="width:${o.pct}%"></div><span>${esc(o.t)}${pl.voted === i ? ' ✓' : ''}</span><b>%${o.pct}</b></div>`).join('')}<small class="muted">${S.fmtF(pl.total)} oy</small></div>`;
}
function feedItem(f) {
  return `<div class="spost">${head(f.author)}
      <p class="stext">${fmtText(f.text)}</p>
      ${f.poll ? pollHtml(f) : image(f.img)}
      <div class="sbar">❤️ ${S.fmtF(f.likes)}</div></div>`;
}
function storiesBar(s) {
  const mine = s.stories?.find((x) => x.mine);
  const others = (s.stories || []).filter((x) => !x.mine);
  return `<div class="stories">
    <button class="story me" data-act="${mine ? 'socStory' : 'socTab'}" ${mine ? `data-id="${mine.id}"` : 'data-t="yaz"'}><span class="ring ${mine ? 'seen' : 'add'}">${avatar({ me: true }, 52)}${mine ? '' : '<i>＋</i>'}</span><small>Hikâyen</small></button>
    ${others.map((x) => `<button class="story" data-act="socStory" data-id="${x.id}"><span class="ring ${x.seen ? 'seen' : ''}">${avatar(x.who, 52)}</span><small>${esc(x.who.name.split(' ')[0])}</small></button>`).join('')}
  </div>`;
}
const image = (img, emoji) => img ? `<img class="simg" src="img/news/${img}.jpg" alt="" loading="lazy">` : emoji ? `<div class="simg emo">${emoji}</div>` : '';

function feedTab(s) {
  const trends = s.trends.length ? `<div class="trends">${s.trends.map((t) => `<span class="${s.crisis?.tag === t ? 'hot' : ''}">${esc(t)}</span>`).join('')}</div>` : '';
  const crisis = s.crisis ? `<div class="card crisis">🚨 <b>${esc(s.crisis.tag)}</b> gündemde! (${esc(s.crisis.why)}) · ${s.crisis.weeks} hafta sürecek. <button class="btn sm" data-act="socTab" data-t="yaz">Özür paylaş</button></div>` : '';
  const posts = s.feed.map(feedItem).join('');
  return `${storiesBar(s)}${crisis}${trends}${posts || '<p class="muted center pad">Akış boş. Bir hafta oyna, herkes senden bahsetsin!</p>'}`;
}

function composeTab(s) {
  const opts = S.composeOptions(st());
  const left = S.POSTS_PER_WEEK - s.weekPosts;
  const liveOk = S.liveReady(st());
  const weeksLeft = liveOk ? 0 : S.LIVE_EVERY - (st().season.year * 60 + st().season.week - s.lastLive);
  return `<div class="card liveCard"><div class="row"><div><b>🔴 Canlı yayın</b><p class="muted small">Takipçilerinin sorularını cevapla. ${S.LIVE_EVERY} haftada bir.</p></div>
      <button class="btn sm ${liveOk ? 'red' : 'ghost'}" data-act="socLive" ${liveOk ? '' : 'disabled'}>${liveOk ? 'Yayına geç' : `${weeksLeft} hafta`}</button></div></div>
    <h3 class="sect">📸 Hikâye <small class="muted">${s.weekStory ? 'bu hafta paylaşıldı' : 'haftada 1 · bir hafta görünür'}</small></h3>
    <div class="storyopts">${S.storyOptions(st()).map((o) => `<button data-act="socStoryPost" data-id="${o.id}" ${s.weekStory ? 'disabled' : ''}><span>${o.emoji}</span>${esc(o.label)}</button>`).join('')}</div>
    <h3 class="sect">📝 Gönderi <small class="muted">${left > 0 ? 'bu hafta 1 hakkın var' : 'bu haftaki hakkın doldu'}</small></h3>
    ${opts.map((o) => `<button class="compose ${o.wait || left <= 0 ? 'off' : ''}" data-act="socPost" data-id="${o.id}" ${o.wait || left <= 0 ? 'disabled' : ''}>
      <span class="cemo">${o.emoji}</span><span class="grow"><b>${esc(o.label)}</b>
      <small>${o.wait ? `${o.wait} hafta sonra` : `Etkileşim ${o.reach >= 1.8 ? 'çok yüksek' : o.reach >= 1.2 ? 'yüksek' : 'normal'}`}${o.endsCrisis ? ' · linci bitirir' : ''}</small></span>
      ${o.risk >= 0.3 ? '<em class="risk hi">⚠️ Çok riskli</em>' : o.risk >= 0.12 ? '<em class="risk">⚠️ Riskli</em>' : ''}</button>`).join('')}`;
}

function profileTab(s) {
  const state = st(), p = state.player, r = s.rival, rt = state.teams[r.team];
  const rg = S.rivalSeasonGoals(state);
  const me = { me: true, name: `${p.name} ${p.surname}`, handle: s.handle, verified: s.followers > 50_000 };
  const posts = s.posts.map((x) => `<div class="spost mine">
      <div class="shead">${avatar(me, 34)}<div class="sname">${nameLine(me)}</div>${x.sponsored ? '<em class="adtag">Reklam</em>' : ''}</div>
      <p class="stext">${esc(x.text)}</p>${image(x.img, x.img ? null : x.emoji)}
      <div class="sbar">❤️ ${S.fmtF(x.likes)} · 💬 ${x.comments.length}</div>
      <div class="cmts">${x.comments.map((c, ci) => `<div class="cmt ${c.tone}"><span ${profKey(c.who) ? `data-act="socProf" data-k="${profKey(c.who)}"` : ''}>${avatar(c.who, 26)}</span><div class="grow"><b ${profKey(c.who) ? `data-act="socProf" data-k="${profKey(c.who)}"` : ''}>${esc(c.who.name)}</b>${c.who.rival ? '<em class="rtag">RAKİP</em>' : ''} ${esc(c.text)}
        ${c.answered ? `<div class="ans">↳ <b>Sen:</b> ${esc(c.answered)}</div>` : c.reply ? `<div class="ropts">${S.REPLIES[c.tone].map((o, oi) => `<button data-act="socReply" data-p="${x.id}" data-c="${ci}" data-o="${oi}">${esc(o.label)}</button>`).join('')}</div>` : ''}</div></div>`).join('')}</div>
    </div>`).join('');
  return `<div class="card sprof">
      ${avatar(me, 72)}
      <div class="grow"><div class="sname big">${nameLine(me)}</div>
        <div class="pstats"><div><b>${S.fmtF(s.followers)}</b><span>Takipçi</span></div><div><b>${s.posts.length}</b><span>Paylaşım</span></div><div><b>${Math.round(p.fans ?? 50)}</b><span>Taraftar</span></div></div>
        <p class="muted small">Sponsorluk değeri: ${X.money(S.sponsorPay(s))} / paylaşım</p></div>
    </div>
    <div class="card rivalcard">
      <div class="muted small">⚔️ EZELİ RAKİBİN</div>
      <div class="rvrow">${avatar({ rival: true, team: r.team }, 58)}<div class="grow"><b>${S.RIVAL_NAME}</b><div class="small">${esc(rt.name)} · ${p.age} yaş · FV · Güç ${r.ovr}</div><div class="small muted">@${S.RIVAL_NAME.toLocaleLowerCase('tr-TR').replace(/\s/g, '').replace(/ı/g, 'i').replace(/ç/g, 'c')} · ${S.fmtF(r.followers)} takipçi</div></div>${X.badge(rt, 34)}</div>
      <div class="vsrow"><div><b>${p.season.goals}</b><span>Senin golün</span></div><div class="vs2">VS</div><div><b>${rg}</b><span>Ahmet'in golü</span></div></div>
      <div class="row small"><span>Rekabet</span><b>${r.heat >= 70 ? '🔥🔥🔥 Kızgın' : r.heat >= 40 ? '🔥🔥 Gergin' : '🔥 Soğuk'}</b></div>
      <div class="bar orange"><div style="width:${r.heat}%"></div></div>
      ${r.history?.length ? `<p class="muted small">Peşinden geldi: ${r.history.map((h) => `${h.year} → ${esc(st().teams[h.to].name)}`).join(' · ')}</p>` : '<p class="muted small">Akademiden beri rakipsiniz. Sen nereye, o oraya…</p>'}
    </div>
    <button class="btn big" data-act="socTab" data-t="yaz">✍️ Yeni paylaşım</button>
    ${posts || '<p class="muted center pad">Henüz paylaşım yok.</p>'}`;
}

function dmTab(s) {
  const list = s.dms.map((d) => `<div class="card dm ${d.done ? 'done' : ''} ${d.kind}">
      ${head(d.from, 38)}
      <p>${esc(d.text)}</p>${d.img ? image(d.img) : ''}
      ${d.done ? `<p class="dres">↳ <b>${esc(d.done.label)}</b>${d.done.text ? ` — ${esc(d.done.text)}` : ''}${d.done.summary ? `<br><small>${esc(d.done.summary)}</small>` : ''}</p>`
        : d.options ? `<div class="ropts">${d.options.map((o, oi) => `<button data-act="socDm" data-id="${d.id}" data-o="${oi}">${esc(o.label)}</button>`).join('')}</div>` : ''}
    </div>`).join('');
  return list || '<p class="muted center pad">Gelen kutusu boş.</p>';
}

function personaProfile(k) {
  const pr = S.profileOf(st(), k); if (!pr) return '';
  return `<button class="btn ghost sm" data-act="socProfClose">‹ Geri</button>
    <div class="card sprof">${avatar(pr.author, 72)}<div class="grow"><div class="sname big">${nameLine(pr.author)}</div>
      <p class="small">${esc(pr.bio)}</p><div class="pstats"><div><b>${S.fmtF(pr.followers)}</b><span>Takipçi</span></div><div><b>${pr.posts.length}</b><span>Paylaşım</span></div></div></div></div>
    ${pr.posts.map(feedItem).join('') || '<p class="muted center pad">Henüz paylaşım yok.</p>'}`;
}
function liveView(s) {
  const L = s.live, done = L.i >= L.qs.length, q = L.qs[L.i];
  return `<div class="card live"><div class="row"><b class="lv">🔴 CANLI</b><span>👁️ ${S.fmtF(L.viewers)} izleyici</span></div>
    <div class="livecam">${avatar({ me: true }, 96)}<div class="hearts">❤️ 💬 🔥 👏</div></div>
    ${L.answers.map((a) => `<div class="lq"><small class="muted">${esc(a.q)}</small><div>↳ ${esc(a.text)} <small class="muted">${esc(a.summary)}</small></div></div>`).join('')}
    ${done ? `<p class="win">Yayın bitti! +${S.fmtF(L.gain)} yeni takipçi 🎉</p><button class="btn big" data-act="socLiveEnd">Kapat</button>`
      : `<div class="lq cur">${head(q.who, 32)}<p><b>${esc(q.q)}</b></p><div class="ropts">${q.a.map(([t], i) => `<button data-act="socLiveAns" data-o="${i}">${esc(t)}</button>`).join('')}</div></div>`}
  </div>`;
}
function storyOverlay(s, sid) {
  const x = s.stories?.find((y) => y.id === sid); if (!x) return '';
  return `<div class="storyov" data-act="socStoryClose"><div class="storybox"><div class="sbarp"><div></div></div>
    <div class="shead">${avatar(x.who, 36)}<div class="sname"><b>${esc(x.who.name)}</b></div></div>
    ${x.img ? `<img src="img/news/${x.img}.jpg" alt="">` : `<div class="semo">${x.emoji || '📸'}</div>`}
    <p class="stext">${esc(x.text)}</p>${x.mine ? `<small>👁️ ${S.fmtF(x.views)} görüntülenme</small>` : ''}</div></div>`;
}

export function screen() {
  const state = st(), ui = X.ui;
  const s = S.ensure(state);
  const t = ui.socTab ||= 'akis';
  const unread = s.dms.filter((d) => !d.done && d.options).length;
  const body = s.live ? liveView(s) : ui.socProfile ? personaProfile(ui.socProfile) : t === 'yaz' ? composeTab(s) : t === 'profil' ? profileTab(s) : t === 'dm' ? dmTab(s) : feedTab(s);
  if (t === 'dm') s.dms.forEach((d) => { d.read = true; });
  return `<header class="top paslas"><button class="back" data-go="hub">‹</button><img class="plogoimg" src="img/social/logo96.png" alt="" width="30" height="30"><h2 class="plogo">${S.APP}</h2><span class="grow"></span><span class="fchip">👥 ${S.fmtF(s.followers)}</span></header>
    <div class="tabs stabs">${[['akis', '🏠 Akış'], ['yaz', '✍️ Paylaş'], ['profil', '👤 Profil'], ['dm', `✉️ Mesaj${unread ? ` <em class="nb">${unread}</em>` : ''}`]].map(([k, l]) => `<button class="${t === k ? 'on' : ''}" data-act="socTab" data-t="${k}">${l}</button>`).join('')}</div>
    ${body}${ui.socStory ? storyOverlay(s, ui.socStory) : ''}`;
}

export const ACTS = new Set(['socTab', 'socPost', 'socReply', 'socDm', 'socProf', 'socProfClose', 'socStory', 'socStoryClose', 'socStoryPost', 'socLive', 'socLiveAns', 'socLiveEnd', 'socVote']);
export function handle(act, el) {
  const state = st(), ui = X.ui;
  if (act === 'socTab') { ui.socTab = el.dataset.t; ui.socProfile = null; X.render(); return window.scrollTo(0, 0); }
  if (act === 'socProf') { ui.socProfile = el.dataset.k; X.render(); return window.scrollTo(0, 0); }
  if (act === 'socProfClose') { ui.socProfile = null; return X.render(); }
  if (act === 'socStory') { const x = S.seeStory(state, el.dataset.id); ui.socStory = x?.id || null; X.persist(); return X.render(); }
  if (act === 'socStoryClose') { ui.socStory = null; return X.render(); }
  if (act === 'socStoryPost') { const r = S.postStory(state, el.dataset.id); if (!r.ok) return X.toast(r.msg); X.persist(); ui.socTab = 'akis'; return X.toast(`Hikâye paylaşıldı! ${r.summary}`); }
  if (act === 'socLive') { const r = S.startLive(state); if (!r.ok) return X.toast(r.msg); X.persist(); X.render(); return window.scrollTo(0, 0); }
  if (act === 'socLiveAns') { const r = S.answerLive(state, +el.dataset.o); if (!r.ok) return; X.persist(); return X.toast(`${r.crisis ? '🚨 Bu cevap olay oldu! ' : ''}${r.summary || 'Cevap verildi'}`); }
  if (act === 'socLiveEnd') { S.endLive(state); X.persist(); return X.render(); }
  if (act === 'socVote') { const r = S.vote(state, el.dataset.id, +el.dataset.o); if (!r.ok) return; X.persist(); return X.toast(r.msg); }
  if (act === 'socPost') {
    const r = S.post(state, el.dataset.id);
    if (!r.ok) return X.toast(r.msg);
    X.persist(); ui.socTab = 'profil'; window.scrollTo(0, 0);
    return X.toast(`${r.crisis ? '🚨 Paylaşımın tepki çekti! ' : 'Paylaşıldı! '}${r.summary}`);
  }
  if (act === 'socReply') {
    const r = S.reply(state, el.dataset.p, +el.dataset.c, +el.dataset.o);
    if (!r.ok) return;
    X.persist();
    return X.toast(`${r.crisis ? '🚨 Cevabın olay oldu! ' : 'Cevap verildi. '}${r.summary || ''}`);
  }
  if (act === 'socDm') {
    const r = S.answerDm(state, el.dataset.id, +el.dataset.o);
    if (!r.ok) return r.msg ? X.toast(r.msg) : null;
    X.persist();
    return X.toast(`${r.text || 'Tamam'}${r.summary ? ` · ${r.summary}` : ''}`);
  }
  return false;
}
export const badgeCount = (state) => (state.social?.dms || []).filter((d) => !d.done && d.options && !d.read).length;
