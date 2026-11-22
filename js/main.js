import * as E from './engine.js';
import { STAT_LABELS, LEAGUES, COUNTRIES, clubInfo, isDerby } from './data.js';
import { playMoment, OUTCOME_TEXT } from './moment.js';
import * as Cloud from './cloud.js';
import * as News from './news.js';
import * as Sfx from './audio.js';
import * as Music from './music.js';
import * as Voice from './voice.js';
import * as Trivia from './trivia.js';
import * as Career from './career.js';
import * as Drills from './drills.js';
import * as Look from './look.js';
import * as Iv from './interview.js';
import * as Life from './life.js';
import * as Spiker from './commentary.js';
import * as K from './contract.js';
import * as Aw from './awards.js';
import * as Eu from './europe.js';
import * as Cup from './cup.js';
import * as Winter from './winter.js';
import * as Celeb from './celebrate.js';
import * as Inv from './invest.js';
import * as Stk from './stocks.js';
import * as Cp from './couple.js';
import * as Soc from './social.js';
import * as Fam from './family.js';
import * as Bet from './betting.js';
import * as CUI from './casino-ui.js';
import * as SUI from './social-ui.js';

const app = document.getElementById('app');
// Kaydı yükle ve eski sürümleri güncelle
function prepare(s, slot) {
  if (!s || s.v !== E.SAVE_VERSION || !s.player) return null;
  s.news ||= [];
  Life.initLife(s.player);
  let changed = false;
  if (!s.econV) { s.player.money *= 10; s.player.contract.wage *= 10; s.econV = 1; changed = true; }
  if (E.upgradeTeams(s)) changed = true;
  if (changed) Cloud.save(s, slot);
  return s;
}
let state = prepare(Cloud.loadSlot(Cloud.activeSlot()), Cloud.activeSlot());
function openSlot(i) {
  Cloud.setActiveSlot(i);
  state = prepare(Cloud.loadSlot(i), i);
  ui.popup = []; ui.pending = []; ui.match = null; ui.plan = null; ui.iv = null; ui.summary = null;
}
let screen = 'start';
let ui = { delConfirm: null, tableTab: null, lbField: 'goals', toast: null, popup: [], pending: [], shopTab: 'car', casinoTab: 'bahis', bj: null, roulette: null, slot: null, stake: 10000, candidates: null };

// ---------- yardımcılar ----------
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const team = (id) => state.teams[id];
function badge(t, size = 40) {
  return `<span class="badge" style="--c1:${t.c1};--c2:${t.c2};width:${size}px;height:${size}px;font-size:${Math.round(size * 0.28)}px">${esc(t.short)}</span>`;
}
const bar = (v, max = 100, cls = '') => `<div class="bar ${cls}"><div style="width:${Math.max(0, Math.min(100, v / max * 100))}%"></div></div>`;
const seasonLabel = () => `${state.season.year}-${String(state.season.year + 1).slice(2)}`;
function toast(msg) {
  ui.toast = msg;
  render();
  setTimeout(() => { if (ui.toast === msg) { ui.toast = null; render(); } }, 2200);
}
function persist() { Cloud.save(state); }
CUI.init({ st: () => state, ui, persist, render: () => render(), toast: (m) => toast(m), money: E.money, moneyShort: E.moneyShort, cur: () => E.CUR.mode, esc });
SUI.init({ st: () => state, ui, persist, render: () => render(), toast: (m) => toast(m), money: E.money, esc, badge: (t, n) => badge(t, n), face: (n, z, c) => face(n, z, c) });
function addNews(list, showNow = true) {
  list = list.filter(Boolean);
  if (!list.length) return;
  state.news ||= [];
  state.news.unshift(...list);
  state.news = state.news.slice(0, 80);
  if (showNow) ui.popup.push(...list); else ui.pending.push(...list);
}
function go(s) { screen = s; render(); window.scrollTo(0, 0); }

// ---------- ekranlar ----------
// Gemini portreleri (img/people)
const face = (name, size = 44, cls = '') => `<img class="face ${cls}" src="img/people/${name}.jpg" width="${size}" height="${size}" alt="" loading="lazy">`;
const EVENT_FACE = { family_money: 'mother', extra_training: 'coach' };
// Gemini'den gelen muhabir portreleri (img/people/<id>.jpg)
const REPORTER_FACES = new Set(['selin', 'kenan', 'duygu']);
function eventArea() {
  return state.event ? eventCard(state.event) : ui.evResult ? `<div class="card event evresult"><b>${esc(ui.evResult.title)}</b>${ui.evResult.img ? `<img class="celimg" src="img/news/${ui.evResult.img}.jpg" alt="">` : ''}${ui.evResult.result ? `<p>${esc(ui.evResult.result)}</p>` : ''}${ui.evResult.summary ? `<p class="small evsum">${esc(ui.evResult.summary)}</p>` : ''}<button class="btn ghost" data-act="evOk">Tamam</button></div>` : '';
}
function eventCard(ev) {
  const fk = ev.face || EVENT_FACE[ev.id] || (ev.id === 'partner_trip' ? 'partner' + (state.player.partner?.portrait ?? 0) : null);
  const story = ev.story ? '<span class="evtag">Hikâye</span>' : '';
  return `<div class="card event">${ev.photo ? `<img class="evphoto" src="img/news/${ev.photo}.jpg" alt="" loading="lazy">` : ''}
    ${fk ? `<div class="evface">${face(fk, 64, 'round')}</div>` : ''}${story}<b>${esc(ev.title)}</b><p>${esc(ev.text)}</p>
    <div class="evbtns">${ev.options.map((o, i) => `<button class="btn ${i ? 'ghost' : ''}" data-act="event" data-i="${i}">${esc(o.label)}</button>`).join('')}</div></div>`;
}

function ovrRing(v, size = 62) {
  const r = 26, c = 2 * Math.PI * r, f = Math.max(0, Math.min(1, (v - 40) / 59));
  const col = v >= 85 ? '#facc15' : v >= 75 ? '#22c55e' : v >= 65 ? '#60a5fa' : '#94a3b8';
  return `<div class="ovring" style="width:${size}px;height:${size}px"><svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="${r}" fill="none" stroke="#ffffff1a" stroke-width="6"/><circle cx="32" cy="32" r="${r}" fill="none" stroke="${col}" stroke-width="6" stroke-linecap="round" stroke-dasharray="${c * f} ${c}" transform="rotate(-90 32 32)"/></svg><b style="color:${col}">${v}</b><span>GÜÇ</span></div>`;
}
function radar(stats) {
  const keys = E.STAT_KEYS, n = keys.length, R = 70, cx = 100, cy = 92;
  const pt = (i, v) => { const a = -Math.PI / 2 + i * 2 * Math.PI / n; return [cx + Math.cos(a) * R * v, cy + Math.sin(a) * R * v]; };
  const grid = [0.25, 0.5, 0.75, 1].map((g) => `<polygon points="${keys.map((_, i) => pt(i, g).join(',')).join(' ')}" fill="none" stroke="#ffffff22"/>`).join('');
  const poly = keys.map((k, i) => pt(i, stats[k] / 99).join(',')).join(' ');
  const labels = keys.map((k, i) => { const [x, y] = pt(i, 1.24); return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle">${STAT_LABELS[k]} ${Math.floor(stats[k])}</text>`; }).join('');
  return `<svg class="radar" viewBox="0 0 200 190">${grid}${keys.map((_, i) => `<line x1="${cx}" y1="${cy}" x2="${pt(i, 1)[0]}" y2="${pt(i, 1)[1]}" stroke="#ffffff14"/>`).join('')}<polygon points="${poly}" fill="#22c55e55" stroke="#22c55e" stroke-width="2"/>${labels}</svg>`;
}
function rehabCard(p) {
  const done = p.weekFlags?.rehab;
  return `<div class="card injury"><b>🩹 Sakatsın</b> · ${p.injury} hafta daha yoksun.
    ${done ? `<p class="small muted">Bu haftaki tedavi kararın verildi.</p>` : `<p class="small muted">Tedavi yöntemini seç:</p><div class="rehab">${Career.rehabOptions(state).filter((o) => o.ok !== false).map((o) => `<button class="${o.risky ? 'risky' : ''}" data-act="rehab" data-id="${o.id}"><span>${o.emoji}</span><b>${esc(o.name)}</b><small>${esc(o.desc)}${o.cost ? ` · ${E.money(o.cost)}` : ''}</small></button>`).join('')}</div>`}</div>`;
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function animateRace(R) {
  const comm = () => document.getElementById('racecomm');
  const mineIdx = R.field.findIndex((f) => f.mine);
  const say = (t) => { R.comm = t; const c = comm(); if (c) c.textContent = t; };
  await sleep(900); say('Ve kapılar açıldı! Atlar fırladı!'); Sfx.whistle?.();
  const F = R.frames, dur = 7000, t0 = performance.now();
  let lastSay = 0;
  await new Promise((done) => {
    const step = (now) => {
      const k = Math.max(0, Math.min(1, (now - t0) / dur)), fi = Math.min(F.length - 1, Math.floor(k * (F.length - 1)));
      const fr = F[fi];
      R.cur = fr;
      for (let i = 0; i < fr.length; i++) { const el = document.getElementById('hrs' + i); if (el) el.style.left = `calc(${fr[i] * 100}% * 0.86)`; }
      if (now - lastSay > 1700 && k < 0.95) {
        lastSay = now;
        const rank = fr.map((x, i) => [x, i]).sort((a, b) => b[0] - a[0]);
        const lead = R.field[rank[0][1]].name, myPos = rank.findIndex((x) => x[1] === mineIdx) + 1;
        say(k < 0.3 ? `${lead} öne geçti! ${R.horse} şu an ${myPos}. sırada.` : k < 0.7 ? `Arka düzlükte ${lead} önde… ${R.horse} ${myPos}. sırada!` : `Son düzlük! ${lead} zorluyor… ${R.horse} ${myPos}.!`);
      }
      if (k < 1 && ui.race === R) requestAnimationFrame(step); else done();
    };
    requestAnimationFrame(step);
  });
  if (ui.race !== R) return;
  say(R.place === 1 ? `${R.horse} çizgiyi ilk geçti!` : `${R.order[0].name} kazandı. ${R.horse} ${R.place}. oldu.`);
  await sleep(800);
  R.shown = true; render();
}

function coupleBox(p) {
  const pt = Cp.ensure(p), n = pt.name.split(' ')[0];
  const tab = ['plan', 'gift', 'trip'].includes(ui.cpTab) ? ui.cpTab : null;
  const tr = Cp.tripReady(state), tk = Cp.talkReady(state), ch = Cp.childReady(state);
  const row = (x, cost, act, dis) => `<div class="cprow"><span class="cpemo">${x.emoji}</span><div class="grow"><b>${esc(x.name)}</b><div class="muted small">${cost ? E.money(cost) : 'Ücretsiz'}${x.energy ? ` · Enerji ${x.energy > 0 ? '+' : ''}${x.energy}` : ''}</div></div><button class="btn sm" data-act="${act}" data-id="${x.id}" ${dis || p.money < cost ? 'disabled' : ''}>Seç</button></div>`;
  const list = tab === 'plan' ? Cp.PLANS.map((x) => row(x, Cp.planCost(p, x), 'cpPlan', p.weekFlags.date)).join('') + (p.weekFlags.date ? '<p class="muted small">Bu haftaki planınızı yaptınız.</p>' : '')
    : tab === 'gift' ? Cp.GIFTS.map((x) => row(x, Cp.planCost(p, x), 'cpGift', p.weekFlags.gift)).join('') + (p.weekFlags.gift ? '<p class="muted small">Bu hafta zaten bir sürpriz yaptın.</p>' : '')
    : tab === 'trip' ? Cp.TRIPS.map((x) => row(x, x.cost, 'cpTrip', !tr.ok)).join('') + `<p class="muted small">${tr.ok ? 'Tatil enerji verir ama bir antrenmanı kaçırırsın (hocayla ilişki −3).' : esc(tr.why)}</p>` : '';
  return `<p class="muted small mt">💡 ${esc(n)}: ${esc(Cp.TASTES[pt.taste].hint)}</p>
    <div class="chips cptabs">
      <button class="${tab === 'plan' ? 'on' : ''}" data-act="cpTab" data-t="plan">💕 Plan yap</button>
      <button class="${tab === 'gift' ? 'on' : ''}" data-act="cpTab" data-t="gift">🎁 Sürpriz</button>
      <button class="${tab === 'trip' ? 'on' : ''}" data-act="cpTab" data-t="trip">✈️ Tatil</button>
      <button data-act="cpTalk" ${tk.ok ? '' : 'disabled'}>💬 Dertleş</button>
      <button data-act="cpChild" ${ch.ok ? '' : 'disabled'}>👶 Çocuk iste</button>
    </div>
    ${!ch.ok && ch.why ? `<p class="muted small">👶 ${esc(ch.why)}</p>` : ''}
    ${list ? `<div class="cplist">${list}</div>` : ''}`;
}

function winterCard() {
  const W = state.winter, left = Winter.weeksLeft(state);
  return `<div class="card wintercard"><b>❄️ Ara transfer dönemi</b><span class="muted small"> · ${left > 1 ? `${left} hafta kaldı` : 'son hafta!'}</span>
    ${W.offers.map((o, i) => { const t = team(o.clubId); return `<div class="woffer">${badge(t, 38)}<div class="grow"><b>${esc(t.name)}</b> ${o.kind === 'loan' ? '<em class="loantag">KİRALIK</em>' : ''}<div class="muted small">${esc(Winter.leagueName(state, t.id))} · Güç ${t.str}</div><div class="small">${esc(Winter.offerLabel(state, o))}</div>
      <div class="wbtns">${o.kind === 'loan' ? `<button class="btn sm" data-act="winterLoan" data-i="${i}">Kiralık git</button>` : `<button class="btn sm" data-act="winterSign" data-i="${i}">İmzala</button><button class="btn ghost sm" data-act="negotiate" data-src="winter" data-i="${i}">🤝 Pazarlık</button>`}<button class="btn ghost sm" data-act="winterNo" data-i="${i}">Reddet</button></div></div></div>`; }).join('')}
  </div>`;
}
function natCard(m) {
  const lbl = m.level === 'A' ? 'A Milli Takım' : 'Ümit Milli Takım (U21)';
  if (!m.res && state.player.injury > 0) return `<div class="card natcard"><div class="muted small">🇹🇷 ${lbl} · ${esc(m.comp)}</div><p>Sakatlığın nedeniyle bu milli arada forma giyemeyeceksin.</p><button class="btn ghost" data-act="natClose">Tamam</button></div>`;
  if (!m.res) return `<div class="card natcard"><div class="muted small">🇹🇷 ${lbl} · ${esc(m.comp)}</div><div class="vs"><span class="flag">🇹🇷</span><b>Türkiye${m.level === 'U21' ? ' U21' : ''}</b><span>vs</span><b>${esc(m.opp)}</b></div><button class="btn big" data-act="natPlay">Milli maça çık</button></div>`;
  const r = m.res;
  return `<div class="card natcard done"><div class="muted small">🇹🇷 ${lbl} · ${esc(m.comp)}</div><div class="natscore">Türkiye ${r.my} - ${r.op} ${esc(m.opp)}</div>
    <p class="small">${r.g ? `⚽ ${r.g} gol` : 'Gol yok'}${r.a ? ` · 🅰️ ${r.a} asist` : ''} · Puan ${String(r.rating).replace('.', ',')}</p><button class="btn ghost" data-act="natClose">Tamam</button></div>`;
}

function musicCard() {
  const m = Music.settings();
  return `<div class="card"><div class="row"><b>🎵 Menü müziği</b><button class="btn sm ${m.on ? '' : 'ghost'}" data-act="music">${m.on ? '🔊 Açık' : '🔇 Kapalı'}</button></div>
    <div class="seg mt"><button class="${m.src === 'theme' ? 'on' : ''}" data-act="musicTheme">🎼 Gol Yıldızı teması</button><button class="${m.src === 'custom' ? 'on' : ''}" data-act="musicCustom" ${m.name ? '' : 'disabled'}>📁 Kendi müziğin</button></div>
    ${m.name ? `<p class="small">Seçili dosya: <b>${esc(m.name)}</b> <button class="linkbtn" data-act="musicClear">Kaldır</button></p>` : ''}
    <label class="btn ghost filebtn mt">${m.name ? 'Başka dosya seç' : 'Telefonundan müzik seç'}<input type="file" accept="audio/*" id="musicFile" hidden></label>
    <div class="row mt"><span class="small">Ses</span><input type="range" id="musicVol" min="0" max="100" value="${Math.round(m.vol * 100)}" class="grow"></div>
    <p class="muted small">Kendi seçtiğin müzik sadece bu cihazda saklanır, hiçbir yere yüklenmez.</p></div>`;
}

const screens = {
  start() {
    const u = Cloud.currentUser();
    const slots = Cloud.slotSummaries();
    return `
      <div class="start">
        <div class="logo"><img src="icons/icon-192.png" alt=""><h1>Gol Yıldızı</h1><p>17 yaşındasın. Hedef: dünya yıldızı.</p></div>
        ${slots.map((s) => s.empty ? `
          <button class="slot empty" data-act="newSlot" data-i="${s.i}"><span class="slotno">${s.i + 1}</span><span class="grow">Boş yuva<small>Yeni kariyer başlat</small></span><span>＋</span></button>` : `
          <div class="slot">
            <button class="slotmain" data-act="playSlot" data-i="${s.i}"><span class="slotno">${s.i + 1}</span>
              <span class="grow"><b>${esc(s.name)}</b><small>${esc(s.club)} · ${s.age} yaş · ${s.season} H${s.week} · ${s.goals} gol · Güç ${s.ovr}</small></span><span>▶</span></button>
            ${ui.delConfirm === s.i
              ? `<div class="delrow"><span>Bu kariyer silinsin mi?</span><button class="btn sm red" data-act="delSlot" data-i="${s.i}">Sil</button><button class="btn sm ghost" data-act="delCancel">Vazgeç</button></div>`
              : `<button class="slotdel" data-act="delAsk" data-i="${s.i}" aria-label="Sil">🗑</button>`}
          </div>`).join('')}
        <button class="btn ghost" data-go="settings">⚙️ Ayarlar ve yedek${u ? ' · ☁️' : ''}</button>
      </div>`;
  },

  create() {
    return `
      <header class="top"><button class="back" data-go="start">‹</button><h2>Oyuncunu oluştur</h2></header>
      <form class="card form" id="createForm">
        <label>Ad<input name="name" required maxlength="16" autocomplete="off"></label>
        <label>Soyad<input name="surname" required maxlength="18" autocomplete="off"></label>
        <label>Ayak<select name="foot"><option>Sağ</option><option>Sol</option></select></label>
        <div class="lookpick">
          <div id="lookPreview">${Look.portraitSvg(Look.DEFAULT_LOOK, ['#16a34a', '#ffffff'], 110)}</div>
          <div class="grow">
            <div class="lp-label">Ten</div>
            <div class="swatches">${Look.SKINS.map((c, i) => `<label class="sw"><input type="radio" name="skin" value="${i}" ${i === 1 ? 'checked' : ''}><span style="background:${c}"></span></label>`).join('')}</div>
            <div class="lp-label">Saç rengi</div>
            <div class="swatches">${Object.entries(Look.HAIR_COLORS).map(([k, c]) => `<label class="sw" title="${Look.HAIR_COLOR_LABELS[k]}"><input type="radio" name="hairColor" value="${k}" ${k === 'siyah' ? 'checked' : ''}><span style="background:${c}"></span></label>`).join('')}</div>
          </div>
        </div>
        <div class="lp-label">Saç modeli</div>
        <div class="chips">${Object.entries(Look.HAIR_STYLES).map(([k, l]) => `<label class="chip"><input type="radio" name="hair" value="${k}" ${k === 'kisa' ? 'checked' : ''}><span>${l}</span></label>`).join('')}</div>
        <label>Uyruk<select name="nation">${['Türkiye', 'Almanya', 'Hollanda', 'Belçika', 'Fransa', 'Azerbaycan', 'Bosna-Hersek'].map((n) => `<option>${n}</option>`).join('')}</select></label>
        <p class="muted small">Mevki: Forvet. Kariyerine Trendyol 1. Lig'de başlayacaksın.</p>
        ${!Cloud.slotSummaries()[Cloud.activeSlot()].empty ? `<p class="warn small">Dikkat: bu yuvadaki kariyer silinecek.</p>` : ''}
        <button class="btn big" type="submit">Başla</button>
      </form>`;
  },

  offers() {
    const p = state.player;
    const isStart = !p.clubId;
    return `
      <header class="top"><h2>${isStart ? 'Kulüp teklifleri' : 'Transfer teklifleri'}</h2></header>
      <div class="card agent">${face('agent', 56, 'round')}<div class="grow"><b>Menajerin Cengiz Demirel</b><div class="muted small">${isStart ? '"Üç kulüpten deneme sözleşmesi buldum evlat. Seç birini, gerisini ben hallederim."' : '"Masada teklifler var. Acele etme, en iyisini seç."'}</div></div></div>
      ${state.offers.map((o, i) => {
        const t = team(o.clubId);
        return `<div class="card offer">
          ${badge(t, 48)}
          <div class="grow"><b>${esc(t.name)}</b><div class="muted small">${LEAGUES[E.leagueOf(state, t.id)].name} · Güç ${t.str}</div>
          <div class="muted small">${esc(clubInfo(t.id).sehir || '')}${clubInfo(t.id).teknik_direktor ? ' · Hoca: ' + esc(clubInfo(t.id).teknik_direktor) : ''}</div>
          <div class="small">${E.money(o.wage)}/hafta · ${o.years} yıl</div>
          <button class="btn ghost sm mt" data-act="negotiate" data-src="start" data-i="${i}">🤝 Pazarlık et</button></div>
          <button class="btn" data-act="accept" data-i="${i}">İmzala</button>
        </div>`;
      }).join('')}`;
  },

  hub() {
    const p = state.player, t = team(p.clubId);
    const fx = state.phase === 'hub' ? E.currentFixture(state) : null;
    const lid = E.leagueOf(state, p.clubId);
    const pos = E.sortedTable(state.season.leagues[lid].table).findIndex((r) => r.id === p.clubId) + 1;
    const role = fx ? E.selection(state) : null;
    const roleText = { starter: 'İlk 11', sub: 'Yedek', out: 'Kadro dışı', injured: `Sakat (${p.injury} hafta)`, suspended: `Cezalı (${p.suspended} maç)` }[role] || '';
    const capTxt = p.captain ? ' · ©️ Kaptan' : '';
    return `
      <header class="hero hero2" style="--c1:${t.c1};--c2:${t.c2}">
        ${p.shirt ? `<i class="shirtbg">${p.shirt}</i>` : ''}
        <div class="hface">${Look.portraitSvg(Look.lookOf(p), [t.c1, t.c2], 58)}${badge(t, 24)}</div>
        <div class="grow">
          <div class="pname">${esc(p.name)} ${esc(p.surname)}${p.captain ? ' <span title="Kaptan">©️</span>' : ''}</div>
          <div class="small">${esc(t.name)} · ${p.age} yaş · FV${p.shirt ? ` · #${p.shirt}` : ''}${p.nat?.caps ? ` · 🇹🇷 ${p.nat.caps}` : ''}</div>
          <div class="formdots">${(p.form || []).map((r) => `<i class="f${r}">${{ W: 'G', D: 'B', L: 'M' }[r]}</i>`).join('')}<small>${p.season.goals}⚽ ${p.season.assists}🅰️</small></div>
        </div>
        ${ovrRing(E.overall(p))}
      </header>
      <div class="statsrow">
        <div><span>Para</span><b>${E.money(p.money)}</b></div>
        <div><span>Sezon</span><b>${seasonLabel()}</b></div>
        <div><span>Lig sırası</span><b>${pos}.</b></div>
      </div>
      <div class="card">
        <div class="row"><span>Enerji</span><b>${Math.round(p.energy)}</b></div>${bar(p.energy, 100, p.energy < 30 ? 'low' : '')}
        <div class="row mt"><span>Moral</span><b>${Math.round(p.morale)}</b></div>${bar(p.morale, 100, 'blue')}
        <div class="row mt"><span>Taraftar sevgisi</span><b>${Math.round(p.fans ?? 50)}</b></div>${bar(p.fans ?? 50, 100, 'orange')}
      </div>
      ${p.injury > 0 ? rehabCard(p) : p.fragile > 0 ? `<div class="card injury small">💉 Ağrı kesiciyle oynuyorsun: ${p.fragile} hafta daha sakatlık riskin yüksek.</div>` : ''}
      ${Career.campAvailable(state) ? `<div class="card campcard"><b>🏕️ Sezon öncesi kamp</b><p class="muted small">Kamp yerini ve antrenman odağını seç, hazırlık maçlarına çık, forma numaranı al.</p><button class="btn" data-go="camp">Kampa git</button></div>` : ''}
      ${Winter.isOpen(state) && state.winter.offers.length ? winterCard() : ''}
      ${state.natMatch ? natCard(state.natMatch) : ''}
      ${eventArea()}
      ${state.phase === 'seasonEnd' ? `
        <div class="card next"><b>Sezon bitti!</b><p class="muted small">Sezon özetini ve teklifleri gör.</p>
        <button class="btn big" data-go="seasonEnd">Sezon sonu</button></div>` :
      fx ? `
        <div class="card next">
          <div class="muted small">${fx.cup ? `<span class="comp CUP">${Cup.CUPS[fx.cup].flag} ${Cup.CUPS[fx.cup].name}</span> · ${fx.round}` : fx.comp ? `<span class="comp ${fx.comp}">${Eu.COMP[fx.comp].icon} ${Eu.COMP[fx.comp].name}</span> · ${fx.round}` : `Hafta ${state.season.week + 1} · ${LEAGUES[lid].name}`}</div>
          <div class="vs">${badge(team(fx.h), 36)}<b>${esc(team(fx.h).short)}</b><span>vs</span><b>${esc(team(fx.a).short)}</b>${badge(team(fx.a), 36)}</div>
          ${isDerby(fx.h, fx.a) ? '<div class="derby">🔥 DERBİ</div>' : ''}
          ${fx.agg ? `<div class="muted small">İlk maç: ${fx.agg.my}-${fx.agg.opp} · toplam skora bakılır</div>` : ''}
          ${fx.single ? `<div class="derby">🏆 ${fx.final ? 'KUPA FİNALİ' : 'TEK MAÇ ELEME'} · beraberlikte uzatma ve penaltılar</div>` : fx.knockout ? `<div class="derby">🏆 ${fx.final ? 'FİNAL · tek maç' : 'RÖVANŞ'} · toplam skor eşitse uzatma ve penaltılar</div>` : fx.leg === 1 ? '<div class="derby">🏆 ELEME 1. MAÇ · rövanş haftaya</div>' : ''}
          <div class="muted small">🏟️ ${esc(clubInfo(fx.h).stadyum || (fx.home ? 'İç saha' : 'Deplasman'))}</div>
          <div class="muted small">${fx.home ? 'İç saha' : 'Deplasman'} · Rakip gücü ${team(fx.opp).str} · Hoca kararı: <b>${roleText}</b></div>
          ${state.natMatch && !state.natMatch.res && !(p.injury > 0) ? '<button class="btn big" disabled>Önce milli maç 🇹🇷</button>' : '<button class="btn big" data-go="prematch">Maça çık</button>'}
        </div>` : `
        <div class="card next"><b>Bu hafta maçın yok</b><p class="muted small">Ligin bitti, diğer lig devam ediyor.</p>
        <button class="btn big" data-act="skipWeek">Haftayı geç</button></div>`}
      <div class="grid">
        <button class="tile t-green" data-go="train">🏋️<span>Antrenman</span></button>
        <button class="tile t-purple" data-act="rest" ${p.rested ? 'disabled' : ''}>😴<span>Dinlen</span></button>
        <button class="tile t-pink" data-go="shop">🛍️<span>Mağaza</span></button>
        <button class="tile t-green" data-go="invest">💼<span>Yatırım</span></button>
        <button class="tile t-red" data-go="life">❤️<span>İlişkiler</span></button>
        <button class="tile t-gold" data-go="casino">🎰<span>Gazino</span></button>
        <button class="tile rel t-purple" data-go="social"><img class="ticon" src="img/social/logo96.png" alt="" width="28" height="28"><span>Paslaş</span>${SUI.badgeCount(state) ? `<em class="tbadge">${SUI.badgeCount(state)}</em>` : ''}</button>
        <button class="tile t-blue" data-go="table">📊<span>Ligler</span></button>
        <button class="tile t-gold" data-go="europe">🏆<span>Avrupa</span></button>
        <button class="tile t-green" data-go="cup">🥇<span>Kupa</span></button>
        <button class="tile t-blue" data-go="profile">👤<span>Profil</span></button>
        <button class="tile t-gray" data-go="news">📰<span>Gazete</span></button>
        ${Cloud.SHOW_LEADERBOARD ? '<button class="tile" data-go="leaderboard">🏆<span>Arkadaşlar</span></button>' : ''}
        <button class="tile t-gray" data-go="settings">⚙️<span>Ayarlar</span></button>
        <button class="tile" data-go="start">🏠<span>Ana menü</span></button>
      </div>
      <div class="card inbox"><h3>Mesajlar</h3>
        ${state.inbox.slice(0, 6).map((m) => `<p>${esc(m.text)}</p>`).join('') || '<p class="muted">Henüz mesaj yok.</p>'}
      </div>`;
  },

  train() {
    const p = state.player;
    return `
      <header class="top"><button class="back" data-go="hub">‹</button><h2>Antrenman</h2></header>
      <div class="banner" style="background-image:url('img/training-banner.jpg')"><span>Sabahın köründe, sisli sahada…</span></div>
      <div class="card"><div class="row"><span>Enerji</span><b>${Math.round(p.energy)}</b></div>${bar(p.energy, 100, p.energy < 30 ? 'low' : '')}
      <p class="muted small">🎮 Mini oyunda başarına göre gelişim ×0,6 ile ×1,8 arası olur. "Hızlı" normal gelişim verir. Her antrenman ${E.TRAIN_COST} enerji harcar. Enerji her hafta +${E.WEEKLY_ENERGY} dolar. Genç yaşta daha hızlı gelişirsin.</p></div>
      ${E.STAT_KEYS.map((k) => `
        <div class="card statline">
          <div class="grow"><div class="row"><b>${STAT_LABELS[k]}</b><b>${Math.floor(p.stats[k])}</b></div>${bar(p.stats[k])}</div>
          <div class="tbtns"><button class="btn" data-act="drill" data-stat="${k}" ${p.energy < E.TRAIN_COST || p.injury > 0 ? 'disabled' : ''}>${Drills.DRILLS[k].icon} Mini oyun</button>
          <button class="btn ghost sm" data-act="train" data-stat="${k}" ${p.energy < E.TRAIN_COST ? 'disabled' : ''}>Hızlı</button></div>
        </div>`).join('')}
      <p class="muted small pad">Şut: güç ve isabet · Teknik: falso ve isabet · Hız: defans baskısına karşı süre · Pas: asist şansı · Güç: genel güç</p>`;
  },

  table() {
    const p = state.player, myL = E.leagueOf(state, p.clubId);
    let lid = ui.tableTab && LEAGUES[ui.tableTab] ? ui.tableTab : myL;
    const L = LEAGUES[lid], SL = state.season.leagues[lid];
    const view = ['puan', 'fikstur', 'gol', 'asist'].includes(ui.tableView) ? ui.tableView : 'puan';
    const rows = E.sortedTable(SL.table);
    const played = Math.max(0, ...rows.map((r) => r.p));
    const myIdx = rows.findIndex((r) => r.id === p.clubId);
    const zones = leagueZones(lid, rows.length);
    let body = '';
    if (view === 'puan') {
      const form = teamForms(SL, state.season.week);
      const full = !!ui.tableFull;
      body = `<div class="tblwrap"><table class="tbl league ${full ? 'full' : 'compact'}">
        <tr><th>#</th><th class="l">Takım</th><th>O</th>${full ? '<th>G</th><th>B</th><th>M</th>' : ''}<th>Av</th><th>P</th>${full ? '' : '<th class="fm">Form</th>'}</tr>
        ${rows.map((r, i) => {
          const z = zones[i];
          return `<tr class="${r.id === p.clubId ? 'me' : ''}" ${r.id === p.clubId ? 'id="myrow"' : ''}><td class="pos" style="${z ? `box-shadow: inset 3px 0 ${z.c}` : ''}">${i + 1}</td><td class="l nm"><span>${badge(team(r.id), 20)}<span>${esc(team(r.id).name)}</span></span></td><td>${r.p}</td>${full ? `<td>${r.w ?? 0}</td><td>${r.d ?? 0}</td><td>${r.l ?? 0}</td>` : ''}<td>${r.gd > 0 ? '+' : ''}${r.gd}</td><td><b>${r.pts}</b></td>${full ? '' : `<td class="fm">${(form[r.id] || []).map((x) => `<i class="f${x}"></i>`).join('')}</td>`}</tr>`;
        }).join('')}
      </table></div>
      <div class="legend">${[...new Map(zones.filter(Boolean).map((z) => [z.t, z])).values()].map((z) => `<span><i style="background:${z.c}"></i>${z.t}</span>`).join('')}</div>
      <button class="linkbtn" data-act="tableFull">${full ? 'Kısa görünüm (form)' : 'Detaylı görünüm (G/B/M)'}</button>`;
    } else if (view === 'fikstur') {
      const total = SL.fixtures.length;
      const wk = Math.max(0, Math.min(total - 1, ui.fxWeek ?? Math.min(state.season.week, total - 1)));
      const ms = SL.fixtures[wk] || [];
      body = `<div class="weeknav"><button class="btn ghost sm" data-act="fxWeek" data-d="-1" ${wk <= 0 ? 'disabled' : ''}>‹</button><b>${wk + 1}. hafta</b><button class="btn ghost sm" data-act="fxWeek" data-d="1" ${wk >= total - 1 ? 'disabled' : ''}>›</button></div>
        <div class="card fxlist">${ms.map((m) => `<div class="fxrow ${m.h === p.clubId || m.a === p.clubId ? 'me' : ''}"><span class="t h">${esc(team(m.h).name)} ${badge(team(m.h), 18)}</span><b class="sc">${m.hg === null ? '–' : `${m.hg} - ${m.ag}`}</b><span class="t a">${badge(team(m.a), 18)} ${esc(team(m.a).name)}</span></div>`).join('')}</div>`;
    } else {
      const k = view === 'gol' ? 'g' : 'a', k2 = view === 'gol' ? 'a' : 'g';
      const all = E.leagueStats(state, lid).filter((x) => x[k] > 0).sort((x, y) => y[k] - x[k] || y[k2] - x[k2] || x.name.localeCompare(y.name, 'tr'));
      const meIdx = all.findIndex((x) => x.me);
      const pod = all.slice(0, 3);
      const row = (x, i) => `<tr class="${x.me ? 'me' : ''}"><td>${i + 1}</td><td class="l"><b>${esc(x.name)}</b><div class="muted tiny">${badge(team(x.teamId), 14)} ${esc(team(x.teamId).name)}</div></td><td><b>${x[k]}</b></td><td class="muted">${x[k2]}</td></tr>`;
      body = all.length ? `<div class="podium">${[1, 0, 2].filter((i) => pod[i]).map((i) => `<div class="pod p${i + 1} ${pod[i].me ? 'me' : ''}"><span class="medal">${['🥇', '🥈', '🥉'][i]}</span>${badge(team(pod[i].teamId), 28)}<b>${esc(pod[i].name.split(' ').slice(-1)[0])}</b><span class="num">${pod[i][k]}</span></div>`).join('')}</div>
        <table class="tbl stats"><tr><th>#</th><th class="l">Oyuncu</th><th>${k === 'g' ? 'Gol' : 'Asist'}</th><th>${k === 'g' ? 'Asist' : 'Gol'}</th></tr>
        ${all.slice(3, 25).map((x, i) => row(x, i + 3)).join('')}
        ${meIdx >= 25 ? `<tr class="gap"><td colspan="4">…</td></tr>${row(all[meIdx], meIdx)}` : ''}</table>` : '<p class="muted pad">Henüz gol atılmadı. Sezon ilerledikçe liste dolacak.</p>';
    }
    return `
      <header class="top"><button class="back" data-go="hub">‹</button><h2>Ligler</h2><button class="hdrbtn" data-go="europe">🏆 Avrupa</button></header>
      ${(() => { const cty = (x) => x?.country || 'TUR'; const myC = cty(LEAGUES[myL]), curC = cty(L); const cs = [...new Set(Object.values(LEAGUES).map(cty))].sort((a, b) => (b === myC) - (a === myC)); const subs = Object.values(LEAGUES).filter((x) => cty(x) === curC);
        return `<div class="ctpick">${cs.map((c) => { const first = Object.values(LEAGUES).find((x) => cty(x) === c); return `<button class="${c === curC ? 'on' : ''} ${c === myC ? 'mine' : ''}" data-act="tab" data-tab="${c === myC ? myL : first.id}"><span class="flag">${COUNTRIES[c]?.flag || '🏳️'}</span><small>${COUNTRIES[c]?.name || c}</small></button>`; }).join('')}</div>
        ${subs.length > 1 ? `<div class="lgpick">${subs.map((x) => `<button class="${x.id === lid ? 'on' : ''}" data-act="tab" data-tab="${x.id}"><b>${x.name.replace('Trendyol ', '')}</b>${x.id === myL ? '<small>Senin ligin</small>' : '<small>&nbsp;</small>'}</button>`).join('')}</div>` : ''}`; })()}
      <div class="lghead card"><div><b>${L.name}</b><div class="muted small">${seasonLabel()} · ${played}/${SL.fixtures.length} hafta</div></div>${myIdx >= 0 ? `<div class="mypos"><span>${myIdx + 1}.</span><small>${rows[myIdx].pts} puan</small></div>` : ''}</div>
      <div class="seg">${[['puan', 'Tablo'], ['fikstur', 'Maçlar'], ['gol', 'Goller'], ['asist', 'Asistler']].map(([v, l]) => `<button class="${v === view ? 'on' : ''}" data-act="tview" data-v="${v}">${l}</button>`).join('')}</div>
      ${body}`;
  },

  cup() {
    const C = Cup.ensure(state), me = state.player.clubId;
    const mine = Cup.countryOf(state, me);
    const cs = Object.keys(C?.cups || {});
    const c = cs.includes(ui.cupTab) ? ui.cupTab : (cs.includes(mine) ? mine : cs[0]);
    const cup = C?.cups[c];
    const st = Cup.myStatus(state);
    const wk = state.season.week;
    const tieRow = (t) => {
      const mine2 = t.h === me || t.a === me;
      const sc = t.hg === null ? 'vs' : `${t.hg} - ${t.ag}`;
      const w = (id) => t.w === id ? 'win' : t.w ? 'lose' : '';
      return `<div class="fxrow cuprow ${mine2 ? 'me' : ''}"><span class="t h ${w(t.h)}">${esc(team(t.h).short)} ${badge(team(t.h), 20)}</span><b class="sc">${sc}${t.pens ? `<small> (p. ${t.pens[0]}-${t.pens[1]})</small>` : t.et ? '<small> uz.</small>' : ''}</b><span class="t a ${w(t.a)}">${badge(team(t.a), 20)} ${esc(team(t.a).short)}</span></div>`;
    };
    const rounds = cup ? cup.rounds.map((r, i) => {
      const ties = r.ties;
      const head = `<div class="cuphead"><b>${esc(r.name)}</b><span class="muted small">${i < cup.cur ? 'Oynandı' : i === cup.cur && !cup.winner ? (r.week === wk ? 'Bu hafta' : `${r.week + 1}. hafta`) : `${r.week + 1}. hafta`}</span></div>`;
      if (!ties) return `<div class="card cupround">${head}<p class="muted small">Kura, önceki tur bitince çekilecek.</p></div>`;
      const list = i === cup.rounds.length - 1 || ties.length <= 8 || ui.cupAll === i ? ties : ties.filter((t) => t.h === me || t.a === me).concat(ties.filter((t) => t.h !== me && t.a !== me).slice(0, 6));
      return `<div class="card cupround">${head}${list.map(tieRow).join('')}${list.length < ties.length ? `<button class="btn ghost sm" data-act="cupAll" data-i="${i}">Tümünü göster (${ties.length})</button>` : ''}${r.byes?.length ? `<p class="muted small">Ön elemeden muaf: ${r.byes.length} takım</p>` : ''}</div>`;
    }).join('') : '<p class="muted">Kupa bilgisi yok.</p>';
    return `
      <header class="top"><button class="back" data-go="hub">‹</button><h2>🥇 Kupalar</h2></header>
      <div class="lgpick">${cs.map((id) => `<button class="${id === c ? 'on' : ''}" data-act="cupTab" data-tab="${id}"><span class="flag">${Cup.CUPS[id].flag}</span><b>${Cup.CUPS[id].name}</b><small>${id === mine ? 'Senin kupan' : '&nbsp;'}</small></button>`).join('')}</div>
      ${c === mine && st ? `<div class="card cupstat">${st.winner ? `🏆 <b>${esc(st.name)} şampiyonusun!</b>` : st.out ? `❌ ${esc(st.name)}'na veda ettin.` : st.round ? `Sıradaki: <b>${esc(st.round)}</b> · ${st.week + 1}. hafta` : ''}</div>` : ''}
      ${cup?.winner ? `<div class="card center"><div style="font-size:36px">🏆</div><b>${esc(team(cup.winner).name)}</b><div class="muted small">${Cup.CUPS[c].name} şampiyonu</div></div>` : ''}
      ${rounds}`;
  },

  invest() {
    const p = state.player, I = Inv.ensure(p);
    const tab = ['mulk', 'borsa', 'ahir', 'yaris'].includes(ui.invTab) ? ui.invTab : 'mulk';
    let body = '';
    if (tab === 'borsa') body = stockTab(p);
    else if (tab === 'mulk') {
      body = `<p class="muted small pad">Kira getiren mülkler değerini korur (satışta %85). İşletmeler daha çok kazandırabilir ama kötü haftada zarar eder (satışta %60).</p>
        ${Inv.PROPS.map((it) => { const own = I.props.includes(it.id); return `<div class="card shopitem ${own ? 'own' : ''}"><div class="shop-img"><span>${it.emoji}</span></div>
          <div class="grow"><b>${esc(Inv.propName(p, it))}</b> <em class="kindtag ${it.kind}">${it.kind === 'kira' ? 'KİRA' : 'İŞLETME'}</em><div class="muted small">${esc(it.desc)}</div>
          <div class="small">Haftalık ~${E.money(it.base)}${it.vol >= 0.5 ? ' · dalgalı' : ''}</div><div class="price">${E.money(it.price)}</div></div>
          ${own ? `<div class="ownbox">✓ Sende<button class="btn ghost sm" data-act="invSell" data-id="${it.id}">Sat ${E.money(it.price * Inv.SELL[it.kind])}</button></div>` : `<button class="btn" data-act="invBuy" data-id="${it.id}" ${p.money < it.price ? 'disabled' : ''}>Al</button>`}</div>`; }).join('')}`;
    } else if (tab === 'ahir') {
      const mk = Inv.market(state);
      const hcard = (h, mine) => `<div class="card horse ${mine ? 'own' : ''}"><div class="hhead"><span class="hemo">🐎</span><div class="grow"><b>${esc(h.name)}</b><div class="muted small">${h.age} yaşında · Güç ${Inv.horseQ(h)}${mine ? ` · ${h.races} koşu, ${h.wins} birincilik` : ''}</div></div>${mine ? `<b class="small">${E.money(h.earned)}</b>` : `<b class="price">${E.money(h.price)}</b>`}</div>
        <div class="hstats"><span>Hız</span>${bar(h.speed)}<span>Dayanıklılık</span>${bar(h.stamina, 100, 'blue')}${mine ? `<span>Form</span>${bar(h.form, 100, 'orange')}` : ''}</div>
        <div class="muted small">Bakım: ${E.money(h.upkeep)}/hafta${mine && h.fatigue > 0 ? ` · 😮‍💨 ${h.fatigue} hafta dinlenmede` : ''}</div>
        ${mine ? `<button class="btn ghost sm mt" data-act="horseSell" data-id="${h.id}">Sat</button>` : `<button class="btn sm mt" data-act="horseBuy" data-id="${h.id}" ${p.money < h.price || I.horses.length >= 4 ? 'disabled' : ''}>Satın al</button>`}</div>`;
      body = `<h3 class="pad">Ahırın (${I.horses.length}/4)</h3>${I.horses.length ? I.horses.map((h) => hcard(h, true)).join('') : '<p class="muted pad">Henüz atın yok. Aşağıdan bir at al ve yarışlara kaydet.</p>'}
        <h3 class="pad">At pazarı · bu sezon</h3>${mk.length ? mk.map((h) => hcard(h, false)).join('') : '<p class="muted pad">Pazardaki atlar satıldı. Yeni sezonda yenileri gelir.</p>'}`;
    } else {
      const races = Inv.racesThisWeek(state);
      const sel = I.horses.find((h) => h.id === ui.raceHorse) || I.horses.find((h) => Inv.canRace(state, h).ok) || I.horses[0];
      const tac = Inv.TACTICS[ui.raceTac] ? ui.raceTac : 'orta';
      body = !I.horses.length ? '<p class="muted pad">Yarışmak için önce ahırına bir at almalısın.</p>' : `
        <div class="card"><b>At</b><div class="chips">${I.horses.map((h) => `<button class="${h === sel ? 'on' : ''}" data-act="raceHorse" data-id="${h.id}">${esc(h.name)}${h.fatigue > 0 ? ' 😮‍💨' : ''}</button>`).join('')}</div>
        <b class="mt">Taktik</b><div class="chips">${Object.entries(Inv.TACTICS).map(([k, t]) => `<button class="${k === tac ? 'on' : ''}" data-act="raceTac" data-t="${k}">${t.name}</button>`).join('')}</div><div class="muted small">${Inv.TACTICS[tac].desc}</div></div>
        ${races.map((r) => { const c = sel ? Inv.canRace(state, sel) : { ok: false }; return `<div class="card race ${r.id}"><div class="row"><b>${r.id === 'gazi' ? '🏆 ' : '🏁 '}${esc(r.name)}</b><span class="muted small">${r.dist} m</span></div>
          <div class="small">Kayıt ${E.money(r.fee)} · Birincilik ödülü <b>${E.money(r.prize)}</b> · Rakip seviyesi ~${r.field}</div>
          <button class="btn sm mt" data-act="raceGo" data-r="${r.id}" ${!c.ok || p.money < r.fee ? 'disabled' : ''}>${c.ok ? 'Koşuya kaydet' : esc(c.why)}</button></div>`; }).join('')}
        <p class="muted small pad">Gazi Koşusu sezonda bir kez, ${Inv.gaziWeek(state) + 1}. haftada koşulur.</p>`;
    }
    return `
      <header class="top"><button class="back" data-go="hub">‹</button><h2>💼 Yatırımlar</h2><span class="grow"></span><b class="money">${E.money(p.money)}</b></header>
      ${I.last ? `<div class="card small">Geçen hafta: <b class="${I.last.total >= 0 ? 'gain' : 'loss'}">${I.last.total >= 0 ? '+' : '−'}${E.money(Math.abs(I.last.total))}</b>${I.last.upkeep ? ` <span class="muted">(at bakımı dahil ${E.money(I.last.upkeep)})</span>` : ''}</div>` : ''}
      <div class="tabs"><button class="${tab === 'mulk' ? 'on' : ''}" data-act="invTab" data-t="mulk">🏢 Mülkler</button><button class="${tab === 'borsa' ? 'on' : ''}" data-act="invTab" data-t="borsa">📈 Borsa</button><button class="${tab === 'ahir' ? 'on' : ''}" data-act="invTab" data-t="ahir">🐎 Ahır</button><button class="${tab === 'yaris' ? 'on' : ''}" data-act="invTab" data-t="yaris">🏁 Yarışlar</button></div>
      ${body}`;
  },

  race() {
    const R = ui.race;
    if (!R) return '';
    const lanes = R.field.map((f, i) => `<div class="lane ${f.mine ? 'mine' : ''}"><span class="lno">${i + 1}</span><span class="hrs" id="hrs${i}" style="left:calc(${(R.cur?.[i] || 0) * 100}% * 0.86)">🏇</span><span class="lname">${esc(f.name)}</span></div>`).join('');
    const res = R.shown ? `<div class="card raceres"><b>${R.place === 1 ? '🏆 KAZANDIN!' : R.place <= 3 ? `🥈 ${R.place}. oldun` : `${R.place}. sırada bitirdin`}</b>
      ${R.prize ? `<div>Ödül: <b class="gain">${E.money(R.prize)}</b></div>` : `<div class="muted small">Ödül yok. Kayıt ücreti: ${E.money(R.fee)}</div>`}
      <ol class="small">${R.order.map((o) => `<li class="${o.mine ? 'me' : ''}">${esc(o.name)}</li>`).join('')}</ol>
      <button class="btn big" data-act="raceDone">Tamam</button></div>` : '';
    return `
      <header class="top"><h2>🏁 ${esc(R.race.name)}</h2></header>
      <div class="muted small pad">${R.race.dist} metre · ${esc(R.horse)} koşuyor</div>
      <div class="rtrack" id="track">${lanes}<div class="finish"></div></div>
      <div class="racecomm" id="racecomm">${esc(R.comm || 'Atlar start makinesinde…')}</div>
      ${res}`;
  },

  europe() {
    const E2 = state.euro, me = state.player.clubId;
    const mine = Eu.myEuroStatus(state)?.comp;
    const cid = ['UCL', 'UEL', 'UECL'].includes(ui.euroTab) ? ui.euroTab : (mine && mine !== 'USC' ? mine : 'UCL');
    const comp = E2?.comps[cid];
    const view = ['puan', 'ko', 'gol'].includes(ui.euroView) ? ui.euroView : (comp && comp.md > (comp.mds || 8) ? 'ko' : 'puan');
    return `
      <header class="top"><button class="back" data-go="table">‹</button><h2>🏆 Avrupa kupaları</h2></header>
      <div class="lgpick">${['UCL', 'UEL', 'UECL'].map((id) => `<button class="${id === cid ? 'on' : ''}" data-act="euroTab" data-tab="${id}"><span class="flag">${Eu.COMP[id].icon}</span><b>${Eu.COMP[id].name}</b><small>${id === mine ? 'Takımın burada' : '&nbsp;'}</small></button>`).join('')}</div>
      ${E2?.super ? superCard(E2.super) : ''}
      <div class="seg">${[['puan', 'Lig aşaması'], ['ko', 'Eleme'], ['gol', 'Goller']].map(([v, l]) => `<button class="${v === view ? 'on' : ''}" data-act="euroView" data-v="${v}">${l}</button>`).join('')}</div>
      ${euroBody(cid, view)}`;
  },

  profile() {
    const p = state.player;
    const s = p.season;
    const avg = s.apps ? (s.ratingSum / s.apps).toFixed(1) : '-';
    return `
      <header class="top"><button class="back" data-go="hub">‹</button><h2>Profil</h2><button class="btn ghost sm" data-go="cabinet">🏆 Kupa dolabı${(p.trophies || []).length ? ` (${p.trophies.length})` : ''}</button></header>
      <div class="card profilehead ph2" style="--c1:${team(p.clubId).c1};--c2:${team(p.clubId).c2}">
        ${p.shirt ? `<i class="shirtbg">${p.shirt}</i>` : ''}
        <div class="phface">${Look.portraitSvg(Look.lookOf(p), [team(p.clubId).c1, team(p.clubId).c2], 96)}</div>
        <div class="grow">
          <b class="pname">${esc(p.name)} ${esc(p.surname)}</b>
          <div class="muted small">${p.age} yaş · ${esc(p.nation)} · ${esc(p.foot)} ayak · FV${p.shirt ? ` · #${p.shirt}` : ''}</div>
          <div class="chips mt">${badge(team(p.clubId), 20)}<span>${esc(team(p.clubId).name)}</span>${p.captain ? '<span>©️ Kaptan</span>' : ''}${p.nat?.caps ? `<span>🇹🇷 ${p.nat.caps} maç · ${p.nat.goals} gol</span>` : ''}${state.social ? `<span>📱 ${SUI.followers(state)}</span>` : ''}</div>
        </div>
        ${ovrRing(E.overall(p), 70)}
      </div>
      <div class="kpis">
        <div><span>Piyasa değeri</span><b>${E.money(K.marketValue(p))}</b></div>
        <div><span>Maaş</span><b>${E.money(p.contract.wage)}<small>/hf</small></b></div>
        <div><span>Ün</span><b>${Math.round(p.fame)}</b></div>
        <div><span>Taraftar</span><b>${Math.round(p.fans ?? 50)}</b></div>
      </div>
      <div class="card"><div class="row small muted"><span>Sözleşme</span><span>${p.contract.endsYear} yazına kadar</span></div>
        <div class="ctags small">${p.loan ? `<span>🔁 Kiralık · sözleşmen ${esc(team(p.loan.from).short || team(p.loan.from).name)}'da</span>` : ''}${p.contract.goalBonus ? `<span>⚽ Gol primi ${E.money(p.contract.goalBonus)}</span>` : ''}${p.contract.champ ? `<span>🏆 Şamp. primi ${E.money(p.contract.champ)}</span>` : ''}${p.contract.release ? `<span>🔓 Serbest kalma ${E.money(p.contract.release)}</span>` : ''}${p.contract.play ? `<span>👕 Forma garantisi: ${K.PLAY_TEXT[p.contract.play]}${p.playBreach ? ` (${p.playBreach} ihlal)` : ''}</span>` : ''}</div>
        ${state.phase === 'hub' ? `<button class="btn ghost sm mt ${K.raiseAvailable(state).ok ? '' : 'dim'}" data-act="raise">💰 Zam iste</button>` : ''}
        ${radar(p.stats)}</div>
      ${(() => { const c = clubInfo(p.clubId); return c.stadyum ? `<div class="card clubcard" style="--c1:${team(p.clubId).c1}">
        <div class="row">${badge(team(p.clubId), 40)}<div class="grow"><b>${esc(c.tam_adi || team(p.clubId).name)}</b><div class="muted small">${esc(c.sehir)} · Kuruluş ${c.kurulus_yili}</div></div></div>
        <div class="row small mt"><span>Stadyum</span><span>${esc(c.stadyum)} (${Number(c.kapasite).toLocaleString('tr-TR')})</span></div>
        <div class="row small"><span>Teknik direktör</span><span>${esc(c.teknik_direktor)}</span></div>
        ${c.ezeli_rakipler?.length ? `<div class="row small"><span>Ezeli rakipler</span><span>${c.ezeli_rakipler.map((r) => esc(team(r)?.name || r)).join(', ')}</span></div>` : ''}
      </div>` : ''; })()}
      <div class="card"><h3>Bu sezon</h3>
        <div class="statsrow in"><div><span>Maç</span><b>${s.apps}</b></div><div><span>Gol</span><b>${s.goals}</b></div><div><span>Asist</span><b>${s.assists}</b></div><div><span>Ort.</span><b>${avg}</b></div></div>
        <p class="small muted">🟨 ${s.yellows || 0} · 🟥 ${s.reds || 0}${p.suspended ? ` · <b class="warn">Cezalı: ${p.suspended} maç</b>` : ` · Ceza sınırına ${4 - ((p.yellows || 0) % 4)} sarı`}</p>
      </div>
      <div class="card"><h3>Kariyer</h3>
        <div class="statsrow in"><div><span>Maç</span><b>${p.career.apps}</b></div><div><span>Gol</span><b>${p.career.goals}</b></div><div><span>Asist</span><b>${p.career.assists}</b></div></div>
        ${p.career.seasons.length ? `<table class="tbl"><tr><th class="l">Sezon</th><th class="l">Kulüp</th><th>M</th><th>G</th><th>A</th><th>Ort</th></tr>
          ${p.career.seasons.map((c) => `<tr><td class="l">${c.year}-${String(c.year + 1).slice(2)}</td><td class="l">${esc(team(c.club).short)}</td><td>${c.apps}</td><td>${c.goals}</td><td>${c.assists}</td><td>${c.avg || '-'}</td></tr>`).join('')}</table>` : ''}
      </div>`;
  },

  leaderboard() {
    const u = Cloud.currentUser();
    if (!Cloud.cloudEnabled() || !u) {
      return `<header class="top"><button class="back" data-go="hub">‹</button><h2>Arkadaşlar</h2></header>
        <div class="card"><p>${Cloud.cloudEnabled() ? 'Sıralamayı görmek için menüden Google ile giriş yap.' : 'Arkadaş sıralaması için Firebase ayarı gerekiyor. (README dosyasında anlatılıyor.)'}</p>
        <p class="muted small">Düellolar (penaltı, şut yarışı, bahis) bir sonraki aşamada gelecek.</p></div>`;
    }
    const f = ui.lbField;
    const rows = ui.lbRows;
    if (!rows || ui.lbLoaded !== f) {
      ui.lbLoaded = f; ui.lbRows = null;
      Cloud.leaderboard(f).then((r) => { ui.lbRows = r; render(); }).catch((e) => { ui.lbRows = []; toast('Sıralama yüklenemedi'); console.warn(e); });
    }
    const fmt = (r) => f === 'money' ? E.money(r.money) : r[f];
    return `
      <header class="top"><button class="back" data-go="hub">‹</button><h2>Arkadaş sıralaması</h2></header>
      <div class="tabs">${[['goals', 'Gol'], ['overall', 'Güç'], ['money', 'Para'], ['assists', 'Asist']].map(([k, l]) => `<button class="${k === f ? 'on' : ''}" data-act="lb" data-f="${k}">${l}</button>`).join('')}</div>
      ${!rows ? '<p class="muted pad">Yükleniyor…</p>' : `<table class="tbl"><tr><th>#</th><th class="l">Oyuncu</th><th class="l">Kulüp</th><th></th></tr>
        ${rows.map((r, i) => `<tr class="${r.uid === u.uid ? 'me' : ''}"><td>${i + 1}</td><td class="l">${esc(r.name)}<div class="muted small">${esc(r.owner)}</div></td><td class="l small">${esc(r.club)}</td><td><b>${fmt(r)}</b></td></tr>`).join('')}</table>`}
      <p class="muted small pad">Düellolar (penaltı, şut yarışı, bahis) bir sonraki aşamada gelecek.</p>`;
  },

  news() {
    const list = state.news || [];
    return `
      <header class="top"><button class="back" data-go="hub">‹</button><h2>Gazete arşivi</h2></header>
      ${list.length ? list.map((c, i) => {
        const P = News.PAPERS[c.paper];
        return `<button class="card npitem" data-act="openNews" data-i="${i}" style="--p1:${P.c1};--p2:${P.c2}">
          <span class="npitem-m">${P.name}</span>
          <b>${esc(c.headline)}</b>
          <span class="muted small">${esc(c.date)}</span>
        </button>`;
      }).join('') : '<p class="muted pad">Henüz hakkında haber çıkmadı. Sahada kendini göster!</p>'}`;
  },

  settings() {
    const u = Cloud.currentUser();
    const lb = Cloud.lastBackupInfo();
    const back = state ? 'hub' : 'start';
    const cloud = !Cloud.cloudEnabled()
      ? `<p class="muted small">Bulut yedeği için Firebase kurulumu gerekiyor (README'de anlatılıyor). O zamana kadar aşağıdaki dosya yedeğini kullan.</p>`
      : u ? `<p>Giriş: <b>${esc(u.displayName || u.email)}</b></p>
             <p class="muted small">3 kariyerin de her maçtan sonra otomatik yedekleniyor.${lb ? ` Son yedek: ${new Date(lb.at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} ${lb.ok ? '✅' : '⚠️ başarısız'}` : ''}</p>
             <div class="evbtns"><button class="btn ghost" data-act="syncNow">Şimdi eşitle</button><button class="btn ghost" data-act="logout">Çıkış yap</button></div>`
          : `<p class="muted small">Google ile giriş yaparsan kariyerlerin buluta yedeklenir. Telefon değişse bile aynı hesapla geri gelir.</p>
             <button class="btn" data-act="login">Google ile giriş yap</button>`;
    return `
      <header class="top"><button class="back" data-go="${back}">‹</button><h2>Ayarlar</h2></header>
      ${musicCard()}
      ${Voice.supported() ? `<div class="card"><div class="row"><b>🎙️ Sesli maç anlatımı</b><button class="btn sm ${Voice.isOn() ? '' : 'ghost'}" data-act="voice">${Voice.isOn() ? '🔊 Açık' : '🔇 Kapalı'}</button></div><p class="muted small">Spiker ${Spiker.SPIKER_NAME} ve yorumcu ${Trivia.NAME} maçı sesli anlatır.${Voice.clipCount() ? ` ${Voice.clipCount()} kayıtlı ses dosyası kullanılıyor.` : ''} Telefonun Türkçe sesini kullanır${Voice.hasTurkish() ? '' : ' (bu cihazda Türkçe ses bulunamadı, varsayılan ses kullanılır)'}.</p></div>` : ''}
      <div class="card"><div class="row"><b>💶 Para birimi</b><div class="chips"><button class="${E.CUR.mode === 'EUR' ? 'on' : ''}" data-act="currency" data-c="EUR">€ Euro</button><button class="${E.CUR.mode === 'TRY' ? 'on' : ''}" data-act="currency" data-c="TRY">₺ TL</button></div></div><p class="muted small">Tüm tutarlar seçtiğin para biriminde gösterilir. Kur: 1 € = ${E.EUR_RATE.toLocaleString('tr-TR')} ₺.</p></div>
      <div class="card"><div class="row"><b>Ses efektleri</b><button class="btn sm ${Sfx.soundOn() ? '' : 'ghost'}" data-act="sound">${Sfx.soundOn() ? '🔊 Açık' : '🔇 Kapalı'}</button></div></div>
      <div class="card"><h3>☁️ Bulut yedeği</h3>${cloud}</div>
      <div class="card"><h3>💾 Dosya yedeği</h3>
        <p class="muted small">3 kayıt yuvasının hepsini tek dosyaya indir. Geri yüklerken mevcut kayıtların üzerine yazılır.</p>
        <div class="evbtns"><button class="btn" data-act="exportSave">Yedeği indir</button>
        <label class="btn ghost filebtn">Yedeği yükle<input type="file" accept=".json,application/json" id="importFile" hidden></label></div>
      </div>
      <p class="muted small pad">Gol Yıldızı · kayıtlar bu telefonda saklanır.</p>`;
  },

  shop() {
    const p = state.player;
    const tab = Life.SHOP_TABS[ui.shopTab] ? ui.shopTab : 'car';
    const list = Life.SHOP_TABS[tab][1];
    const info = { car: 'Araba ün kazandırır ve her hafta moralini yükseltir (en iyi araban geçerli).', house: 'Ev her hafta ekstra enerji verir (en iyi evin geçerli).', lux: 'Lüks eşyalar ün ve moral getirir; bazıları sevgilini de mutlu eder.', gear: 'Performans ekipmanı antrenman verimini artırır, sakatlık riskini düşürür.', hobby: 'Hobiler her hafta moralini yükseltir, kafanı dağıtır.' }[tab];
    return `
      <header class="top"><button class="back" data-go="hub">‹</button><h2>Mağaza</h2><span class="grow"></span><b class="money">${E.money(p.money)}</b></header>
      <div class="tabs shoptabs">${Object.entries(Life.SHOP_TABS).map(([k, [l]]) => `<button class="${tab === k ? 'on' : ''}" data-act="shopTab" data-t="${k}">${l}</button>`).join('')}</div>
      <p class="muted small pad">${info} Satarken fiyatın %60'ını geri alırsın.</p>
      ${list.map((it) => {
        const own = p.owned.includes(it.id);
        const lock = it.needPartner && !p.partner;
        return `<div class="card shopitem ${own ? 'own' : ''}">
          <div class="shop-img"><span>${it.emoji}</span>${Life.SHOP_IMAGES.has(it.id) ? `<img src="img/shop/${it.id}.jpg" alt="">` : ''}</div>
          <div class="grow"><b>${esc(it.name)}</b><div class="muted small">${esc(it.desc)}</div>
            <div class="small">${tab === 'car' ? `Ün +${it.fame} · Moral +${it.morale}/hafta${it.energy ? ` · Enerji +${it.energy}/hafta` : ''}` : tab === 'house' ? `Enerji +${it.energy}/hafta` : Life.shopEffect(it)}</div>
            <div class="price">${E.money(it.price)}</div></div>
          ${own ? `<div class="ownbox">✓ Sende<button class="btn ghost sm" data-act="sell" data-id="${it.id}">Sat ${E.money(it.price * Life.SELL_RATE)}</button></div>`
                : `<button class="btn" data-act="buy" data-id="${it.id}" ${p.money < it.price || lock ? 'disabled' : ''}>${lock ? 'Sevgili yok' : 'Al'}</button>`}
        </div>`;
      }).join('')}`;
  },

  // (portre yardımcısı aşağıda: face())
  life() {
    const p = state.player;
    const relFace = { family: `<span class="faces">${face('mother', 40)}${face('father', 40)}</span>` };
    const relRow = (k, btn) => `<div class="card relrow"><div class="row">${relFace[k] || ''}<b class="grow">${Life.REL_LABEL[k]}</b><b>${Math.round(p.rel[k])}</b></div>${bar(p.rel[k], 100, k === 'family' ? 'orange' : k === 'team' ? 'blue' : '')}
      <div class="muted small">${{ coach: 'Yüksekse ilk 11 şansın artar.', team: 'Yüksekse pozisyonlarda daha çok arkadaşın olur, pasların gole döner.', family: 'Yüksekse moralin her hafta artar.' }[k]}</div>${btn}</div>`;
    const partner = p.partner;
    let love;
    if (p.age < 18) love = `<p class="muted">Özel hayat 18 yaşında açılır. Şimdilik futbola odaklan!</p>`;
    else if (!partner) {
      love = ui.candidates
        ? ui.candidates.map((c, i) => `<div class="cand">${face('partner' + (c.portrait ?? i % 3), 52, 'round')}<div class="grow"><b>${esc(c.name)}</b><div class="muted small">${esc(c.job)}</div></div><button class="btn sm" data-act="meet" data-i="${i}">Tanış</button></div>`).join('') +
          `<button class="btn ghost" data-act="meetCancel">Vazgeç</button>`
        : `<p class="muted small">Şu an yalnızsın.</p><button class="btn" data-act="social">Sosyal hayata çık 🍸</button>`;
    } else {
      love = `<div class="cand">${face('partner' + (partner.portrait ?? 0), 56, 'round love')}<div class="grow"><b>${esc(partner.name)}</b><div class="muted small">${esc(partner.job)} · ${partner.married ? 'Eşin 💍' : 'Sevgilin'} · ${partner.weeks} hafta</div></div><b>${Math.round(partner.value)}</b></div>
        ${bar(partner.value, 100, 'pink')}
        ${coupleBox(p)}
        <div class="evbtns mt">
          ${Fam.canPropose(p) ? `<button class="btn" data-go="propose">💍 Evlilik teklifi</button>` : ''}
          ${partner.engaged ? `<button class="btn" data-go="wedding">💒 Düğünü planla</button>` : ''}
          ${!partner.married ? `<button class="btn ghost" data-act="breakup">Ayrıl</button>` : `<button class="btn ghost" data-act="divorceAsk">Boşan</button>`}
        </div>
        ${ui.divorceAsk && partner.married ? (() => { const t = Fam.divorceTerms(state); return `<div class="card warnbox"><b>Boşanmak istediğine emin misin?</b><p class="small">Mal paylaşımı: <b>${E.money(t.share)}</b>${t.house ? ` · Evin (${esc(Life.HOUSES.find((h) => h.id === t.house)?.name || '')}) eşinde kalır` : ''}<br>Nafaka: haftalık <b>${E.money(t.alimony)}</b> × ${t.alimonyWeeks} hafta${t.kids ? ` + çocuk nafakası <b>${E.money(t.childSupport)}</b>/hafta (18 yaşına kadar)` : ''}</p><div class="evbtns"><button class="btn danger" data-act="divorce">Evet, boşan</button><button class="btn ghost" data-act="divorceNo">Vazgeç</button></div></div>`; })() : ''}
        ${!partner.married && !partner.engaged && !Fam.canPropose(p) ? `<p class="muted small">${partner.cooldown > 0 ? `Teklifin reddedildi. ${partner.cooldown} hafta sonra tekrar deneyebilirsin.` : 'Evlilik teklifi için ilişki 55+ ve en az 10 hafta birlikte olmalısınız. İlişki ne kadar yüksekse "evet" ihtimali o kadar artar.'}</p>` : ''}
        ${partner.engaged ? '<p class="muted small">💍 Nişanlısınız!</p>' : ''}`;
    }
    const car = Life.CARS.filter((x) => p.owned.includes(x.id)).pop(), house = Life.HOUSES.filter((x) => p.owned.includes(x.id)).pop();
    return `
      <header class="top"><button class="back" data-go="hub">‹</button><h2>İlişkiler</h2></header>
      ${eventArea()}
      ${relRow('coach', `<button class="btn ghost sm" data-act="talkCoach" ${p.weekFlags.coach ? 'disabled' : ''}>Hocayla konuş</button>`)}
      ${relRow('team', `<button class="btn ghost sm" data-act="treatTeam" ${p.weekFlags.team ? 'disabled' : ''}>Takıma yemek ısmarla (${E.money(Life.teamCost(p))})</button>`)}
      ${relRow('family', `<button class="btn ghost sm" data-act="callFamily" ${p.weekFlags.family ? 'disabled' : ''}>Aileni ara</button>`)}
      <div class="card"><h3>❤️ Özel hayat</h3>${love}</div>
      ${(p.children || []).length ? `<div class="card"><h3>👨‍👩‍👧 Çocukların</h3>${p.children.map((c) => `<div class="row kid"><span class="grow">${c.gender === 'k' ? '👧' : '👦'} <b>${esc(c.name)}</b> <span class="muted small">${Fam.childAge(state, c) < 1 ? 'bebek' : Fam.childAge(state, c) + ' yaş'}${c.exOf ? ' · annesiyle' : ''}${c.talent ? ' · ⚽ yetenekli' : ''}</span></span><b>${Math.round(c.rel ?? 70)}</b></div>${bar(c.rel ?? 70, 100, 'orange')}`).join('')}
        <button class="btn ghost sm mt" data-act="kidsTime" ${p.weekFlags.kids ? 'disabled' : ''}>Çocuklarla vakit geçir</button></div>` : ''}
      ${p.alimony ? `<div class="card small"><div class="row"><span>Nafaka (${esc(p.alimony.to)})</span><b class="warn">−${E.money(p.alimony.weekly + p.alimony.child)}/hafta</b></div></div>` : ''}
      <div class="card small"><div class="row"><span>Araban</span><b>${car ? esc(car.name) : '—'}</b></div><div class="row"><span>Evin</span><b>${house ? esc(house.name) : 'Kulüp lojmanı'}</b></div></div>`;
  },

  propose() {
    const p = state.player, pt = p.partner;
    if (!pt || !Fam.canPropose(p)) return screens.life();
    ui.ring ||= 'r2'; ui.place ||= 'home';
    const ring = Fam.RINGS.find((r) => r.id === ui.ring), place = Fam.PLACES.find((x) => x.id === ui.place);
    const cost = Fam.ringCost(p, ring) + Fam.placeCost(p, place);
    const ch = Fam.acceptChance(p, ring, place);
    const hint = ch > 0.8 ? 'Neredeyse kesin "evet"' : ch > 0.6 ? 'Büyük ihtimalle "evet"' : ch > 0.4 ? 'Yazı tura…' : 'Riskli, "hayır" diyebilir';
    return `
      <header class="top"><button class="back" data-go="life">‹</button><h2>💍 Evlilik teklifi</h2></header>
      <div class="card center">${face('partner' + (pt.portrait ?? 0), 72, 'round love')}<h3>${esc(pt.name)}</h3><p class="muted small">${esc(pt.job)} · ${pt.weeks} haftadır birliktesiniz · ${pt.likesFame ? 'Şöhreti seviyor' : 'Gözlerden uzak durmayı seviyor'}</p></div>
      <div class="card"><h3>Yüzük</h3>${Fam.RINGS.map((r) => `<button class="pickrow ${r.id === ui.ring ? 'on' : ''}" data-act="pickRing" data-id="${r.id}"><span class="big">${r.emoji}</span><span class="grow"><b>${r.name}</b><small>${r.desc}</small></span><b>${E.money(Fam.ringCost(p, r))}</b></button>`).join('')}</div>
      <div class="card"><h3>Nerede?</h3>${Fam.PLACES.map((x) => `<button class="pickrow ${x.id === ui.place ? 'on' : ''}" data-act="pickPlace" data-id="${x.id}"><span class="grow"><b>${x.name}</b><small>${x.desc}${x.public ? ' · Ün +' + x.fame : ''}</small></span><b>${E.money(Fam.placeCost(p, x))}</b></button>`).join('')}</div>
      <div class="card"><div class="row"><span>Toplam</span><b>${E.money(cost)}</b></div><div class="row"><span>Tahmin</span><b>${hint}</b></div>
        <button class="btn big mt" data-act="proposeGo" ${p.money < cost ? 'disabled' : ''}>Diz çök 💍</button>${p.money < cost ? '<p class="muted small">Paran yetmiyor.</p>' : ''}</div>`;
  },

  wedding() {
    const p = state.player, pt = p.partner;
    if (!pt?.engaged) return screens.life();
    return `
      <header class="top"><button class="back" data-go="life">‹</button><h2>💒 Düğün</h2></header>
      <div class="card center">${face('partner' + (pt.portrait ?? 0), 64, 'round love')}<p>${esc(pt.name)} ile nasıl bir düğün?</p></div>
      ${Fam.WEDDINGS.map((w) => `<div class="card"><div class="row"><b>${w.name}</b><b>${E.money(Fam.weddingCost(p, w))}</b></div><p class="muted small">${w.desc}</p>
        <p class="small">${[w.fame ? `Ün +${w.fame}` : '', w.fans ? `Taraftar +${w.fans}` : '', `Aile ${w.family > 0 ? '+' : ''}${w.family}`, `Eşin +${w.partner}`].filter(Boolean).join(' · ')}</p>
        <button class="btn" data-act="wed" data-id="${w.id}" ${p.money < Fam.weddingCost(p, w) ? 'disabled' : ''}>Bu düğünü yap</button></div>`).join('')}
      <button class="btn ghost" data-act="cancelEngage">Nişanı boz</button>`;
  },

  social() { return SUI.screen(); },

  camp() {
    const c = Career.camp(state);
    const steps = ['Kamp yeri', 'Antrenman odağı', 'Hazırlık maçları', 'Forma numarası'];
    let body = '';
    if (c.step === 0) body = Career.CAMP_PLACES.map((x) => `<button class="compose" data-act="campPick" data-k="place" data-id="${x.id}"><span class="cemo">${x.emoji}</span><span class="grow"><b>${esc(x.name)}</b><small>${esc(x.desc)}</small></span></button>`).join('');
    else if (c.step === 1) body = Career.CAMP_FOCUS.map((x) => `<button class="compose" data-act="campPick" data-k="focus" data-id="${x.id}"><span class="cemo">${x.emoji}</span><span class="grow"><b>${esc(x.name)}</b><small>${esc(x.desc)}</small></span></button>`).join('');
    else if (c.step === 2) body = `<div class="card"><p>Kampta iki hazırlık maçı oynayacaksın. Golün hocanın gözüne girmeni sağlar.</p><button class="btn big" data-act="campPick" data-k="friendly" data-id="1">Hazırlık maçlarını oyna</button></div>`;
    else if (c.step >= 3) body = `${c.friendlies.map((f) => `<div class="card fr"><b>${esc(team(state.player.clubId).short)} ${f.my}-${f.op} ${esc(f.opp)}</b><div class="small">${f.g ? `⚽ ${f.g} gol` : 'Gol yok'} · Puan ${String(f.rating).replace('.', ',')}</div></div>`).join('')}
      ${c.step === 3 ? `<h3 class="sect">👕 Forma numaranı seç</h3><div class="shirts">${Career.shirtOptions(state).map((n) => `<button data-act="campPick" data-k="shirt" data-id="${n}">${n}</button>`).join('')}</div><p class="muted small">9 ve 10 numaralar ün ya da kaptanlık ister.</p>`
        : `<div class="card"><b>✅ Kamp tamamlandı!</b><p class="small">Forma numaran: <b>#${c.shirt}</b></p><button class="btn big" data-go="hub">Sezona başla</button></div>`}`;
    return `<header class="top"><button class="back" data-go="hub">‹</button><h2>🏕️ Sezon öncesi kamp</h2></header>
      <div class="campsteps">${steps.map((t, i) => `<span class="${i < c.step ? 'ok' : i === c.step ? 'on' : ''}">${i + 1}. ${t}</span>`).join('')}</div>
      ${c.place ? `<p class="muted small pad">${Career.CAMP_PLACES.find((x) => x.id === c.place).emoji} ${esc(Career.CAMP_PLACES.find((x) => x.id === c.place).name)}${c.focus ? ` · ${esc(Career.CAMP_FOCUS.find((x) => x.id === c.focus).name)}` : ''}</p>` : ''}
      ${body}`;
  },

  tourn() {
    const t = state.natTourn || Career.startTournament(state);
    if (!t) return `<header class="top"><button class="back" data-go="seasonEnd">‹</button><h2>Turnuva</h2></header><p class="pad">Bu yaz turnuva yok.</p>`;
    const last = t.games[t.games.length - 1];
    return `<header class="top"><button class="back" data-go="seasonEnd">‹</button><h2>${t.icon} ${esc(t.name)}</h2></header>
      <div class="card"><b>🇹🇷 Türkiye</b> · ${t.i < 3 ? `Grup puanı: ${t.pts}` : 'Eleme turları'}</div>
      ${t.games.map((g) => `<div class="card fr ${g.my > g.op || g.pens?.startsWith('5') ? 'w' : g.my < g.op || g.pens ? 'l' : ''}"><div class="muted small">${esc(g.stage)}</div><b>Türkiye ${g.my}-${g.op} ${esc(g.opp)}</b>${g.pens ? ` <small>(pen. ${g.pens})</small>` : ''}<div class="small">${g.g ? `⚽ ${g.g} gol` : 'Gol yok'} · Puan ${String(g.rating).replace('.', ',')}</div></div>`).join('')}
      ${t.champion ? `<div class="card natcard done"><b>🏆 ŞAMPİYONUZ!</b><p>Türkiye ${esc(t.name)} şampiyonu! Tarihe geçtin.</p></div>`
        : t.out ? `<div class="card"><b>Turnuvaya veda ettik.</b><p class="small">${esc(last.stage)} turunda elendik.</p></div>`
        : `<button class="btn big" data-act="tournNext">${['Grup 1. maç', 'Grup 2. maç', 'Grup 3. maç', 'Son 16', 'Çeyrek final', 'Yarı final', 'Final'][t.i]}: Türkiye - ${esc(t.opps[t.i][0])}</button>`}
      <button class="btn ghost" data-go="seasonEnd">Sezon sonuna dön</button>`;
  },

  casino() {
    const p = state.player;
    const t = ui.casinoTab;
    // euro modunda yuvarlak euro tutarları (içeride TL tutulur)
    const base = E.CUR.mode === 'EUR' ? [200, 1000, 5000, 20_000, 100_000, 500_000].map((x) => x * E.EUR_RATE) : [10_000, 50_000, 250_000, 1_000_000, 5_000_000, 25_000_000];
    const stakes = base.filter((x) => x <= Math.max(base[0], p.money));
    if (!base.includes(ui.stake)) ui.stake = base[0];
    if (ui.stake > p.money) ui.stake = stakes.filter((x) => x <= p.money).pop() || base[0];
    const stakeBar = `<div class="stakes">${stakes.map((x) => `<button class="${x === ui.stake ? 'on' : ''}" data-act="stake" data-v="${x}">${E.moneyShort(x, false)}</button>`).join('')}</div>`;
    let body = '';
    if (t === 'bahis') { body = betScreen(stakeBar);
    } else body = CUI.body(t, stakeBar);
    return `
      <header class="top"><button class="back" data-go="hub">‹</button><h2>Gazino</h2><span class="grow"></span><b class="money">${E.money(p.money - CUI.hidden())}</b></header>
      <div class="tabs scroll">${CUI.TABS.map(([k, l]) => `<button class="${t === k ? 'on' : ''}" data-act="casinoTab" data-t="${k}">${l}</button>`).join('')}</div>
      ${body}
      <p class="muted small pad">Tüm oyunlar oyun içi parayla. Çok kaybedersen gazeteler duyar…</p>`;
  },

  prematch() {
    if (!ui.plan) {
      ui.plan = E.planMatch(state); ui.iv = Iv.preInterview(state, ui.plan);
      if (ui.plan && isDerby(ui.plan.fx.h, ui.plan.fx.a) && Math.random() < 0.7) { addNews([News.derbyPreview(state, ui.plan)], false); persist(); }
    }
    const plan = ui.plan;
    const roleMsg = {
      starter: 'Hoca seni ilk 11\'e yazdı! Sana gelen pozisyonları değerlendir.',
      sub: `Yedek kulübesindesin. ${plan.onFrom}. dakika civarı oyuna girebilirsin.`,
      out: plan.injured ? `Sakatsın, bu maçta forma giyemezsin. (${state.player.injury} hafta)` : plan.suspended ? `Cezalısın! Bu maçta oynayamazsın. (${state.player.suspended} maç)` : 'Hoca seni bu maçın kadrosuna almadı. Antrenmanla gücünü artır.',
    }[plan.role];
    const T = E.TACTICS[plan.tactic], wx = plan.weather;
    const wIcon = { gunduz: '☀️', aksam: '🌇', gece: '🌙' }[wx.tod] + (wx.fx === 'yagmur' ? ' 🌧️' : wx.fx === 'kar' ? ' ❄️' : '');
    return `
      <header class="top"><h2>Maç günü</h2></header>
      <div class="card next">
        <div class="vs">${badge(team(plan.fx.h), 44)}<b>${esc(team(plan.fx.h).name)}</b></div>
        <div class="vsmid">vs</div>
        <div class="vs">${badge(team(plan.fx.a), 44)}<b>${esc(team(plan.fx.a).name)}</b></div>
        <p>${roleMsg}</p>
        <div class="matchinfo"><div>${wIcon} <b>${E.WEATHER_TEXT[wx.tod]}${wx.fx ? ' · ' + E.WEATHER_TEXT[wx.fx] : ''}</b>${wx.fx === 'yagmur' ? '<small>Top kayar, kaleciler hata yapabilir</small>' : wx.fx === 'kar' ? '<small>Ağır zemin, top yavaş</small>' : ''}</div>
          <div>📋 Rakip: <b>${T.name}</b><small>${T.desc}</small></div></div>
        ${state.player.yellows % 4 === 3 && plan.role !== 'out' ? '<p class="small warn">⚠️ 3 sarın var: bir sarı daha görürsen 1 maç cezalısın.</p>' : ''}
        ${ui.iv ? interviewCard(ui.iv) : ''}
        <button class="btn big" data-act="kickoff" ${ui.iv && !ui.iv.chosen ? 'disabled' : ''}>${plan.role === 'out' ? 'Maçı izle' : 'Başla'}</button>
      </div>`;
  },

  match() {
    const m = ui.match;
    return `
      <div class="scoreboard" style="--c1:${m.plan.fx.home ? m.plan.myColors[0] : m.plan.oppColors[0]};--c2:${m.plan.fx.home ? m.plan.oppColors[0] : m.plan.myColors[0]}">
        <div class="sb-team">${esc(team(m.plan.fx.h).short)}</div>
        <div class="sb-score">${m.homeG} - ${m.awayG}<small>${m.pens ? `pen. ${m.plan.fx.home ? m.pens[0] : m.pens[1]}-${m.plan.fx.home ? m.pens[1] : m.pens[0]}` : m.minute + "'"}</small>${m.plan.fx.comp ? `<em class="sbcomp">${m.plan.fx.cup ? Cup.CUPS[m.plan.fx.cup].flag : Eu.COMP[m.plan.fx.comp].icon} ${m.plan.fx.cup ? Cup.CUPS[m.plan.fx.cup].short : Eu.COMP[m.plan.fx.comp].short} · ${m.plan.fx.round}${m.plan.fx.agg ? ` · toplam ${m.res.myGoals + m.plan.fx.agg.my}-${m.res.oppGoals + m.plan.fx.agg.opp}` : ''}</em>` : ''}</div>
        <div class="sb-team">${esc(team(m.plan.fx.a).short)}</div>
      </div>
      ${!m.done && !m.inMoment ? `<div class="mbtns"><button class="btn ghost speedbtn ${m.fast ? 'on' : ''}" data-act="fast">${m.fast ? '⏩ Hızlı · normale al' : '▶ Normal · hızlandır'}</button>${Voice.supported() ? `<button class="btn ghost speedbtn vbtn ${Voice.isOn() ? 'on' : ''}" data-act="voice">${Voice.isOn() ? '🎙️ Spiker açık' : '🔇 Spiker kapalı'}</button>` : ''}</div>` : ''}
      <div id="momentHost" class="moment-host ${m.inMoment ? 'on' : ''}"></div>
      ${m.inMoment ? '' : `
        ${m.choice ? `<div class="card choice"><b>${esc(m.choice.title)}</b><div class="evbtns">${m.choice.options.map((c, i) => `<button class="btn ${i ? 'ghost' : ''}" data-act="choice" data-v="${c.v}">${esc(c.label)}</button>`).join('')}</div><div class="cbar"></div></div>` : ''}
        <div class="feed">${m.feed.slice().reverse().map((f) => `<p class="${f.cls || ''}"><b>${f.min}'</b> ${['spk', 'hl', 'goal', 'card-y', 'card-r'].includes(f.cls) && f.id ? '🎙️ ' : ''}${f.cls === 'card-y' ? '🟨 ' : f.cls === 'card-r' ? '🟥 ' : ''}${esc(f.text)}${f.img ? `<img class="celimg" src="img/news/celeb_${f.img}.jpg" alt="">` : ''}</p>`).join('')}</div>
        ${m.done ? `
          <div class="card ft" id="matchEnd">
            <h3>Maç sonu</h3>
            ${m.res.played ? `<div class="statsrow in"><div><span>Puan</span><b>${m.res.rating}</b></div><div><span>Gol</span><b>${m.res.goals}</b></div><div><span>Asist</span><b>${m.res.assists}</b></div></div>` : '<p class="muted">Bu maçta oynamadın.</p>'}
          </div>
          ${m.round ? roundCard(m) : ''}
          ${ui.iv ? interviewCard(ui.iv) : ''}
          <button class="btn big" data-act="afterMatch" ${ui.iv && !ui.iv.chosen ? 'disabled' : ''}>Devam</button>` : ''}`}
    `;
  },

  negotiate() {
    const n = ui.neg, p = state.player, t = team(n.clubId);
    const o = n.offer, d = n.demand, open = n.status === 'open';
    const row = (key, label, fmt, stepUp, stepDown) => `<div class="negrow"><span>${label}</span>
      <span class="negclub">${fmt(o[key])}</span>
      ${open ? `<span class="negctl"><button data-act="negStep" data-k="${key}" data-d="-1">−</button><b>${fmt(d[key])}</b><button data-act="negStep" data-k="${key}" data-d="1">+</button></span>` : `<b>${fmt(o[key])}</b>`}</div>`;
    const kindTxt = { start: 'İlk profesyonel sözleşme', transfer: 'Transfer görüşmesi', renew: 'Sözleşme uzatma', raise: 'Sezon ortası zam görüşmesi' }[n.kind];
    return `
      <header class="top"><button class="back" data-act="negBack">‹</button><h2>Pazarlık</h2></header>
      <div class="card offer">${badge(t, 48)}<div class="grow"><b>${esc(t.name)}</b><div class="muted small">${kindTxt} · Piyasa değerin ${E.money(n.value)}</div>
        <div class="patience">${open ? `Kulübün sabrı: ${'●'.repeat(Math.max(0, n.patience))}${'○'.repeat(Math.max(0, (n.kind === 'renew' ? 4 : n.kind === 'raise' ? 2 : 3) - n.patience))}` : n.status === 'agreed' ? '✅ Anlaşma sağlandı' : '❌ Kulüp masadan kalktı'}</div></div></div>
      <div class="card neg">
        <div class="negrow head"><span></span><span class="negclub">Kulüp</span><span class="negctl">${open ? 'Senin talebin' : 'Sözleşme'}</span></div>
        ${row('wage', 'Haftalık maaş', E.money)}
        ${row('years', 'Süre', (v) => v + ' yıl')}
        ${row('sign', 'İmza parası', E.money)}
        ${row('goal', 'Gol primi', E.money)}
        ${row('release', 'Serbest kalma', (v) => v >= 10_000_000 ? E.moneyShort(v) : E.money(v))}
        ${row('champ', 'Şampiyonluk primi', E.money)}
        ${row('play', 'Forma garantisi', (v) => K.PLAY_TEXT[v || 0])}
      </div>
      <div class="card agent">${face('agent', 48, 'round')}<div class="grow"><b>Cengiz</b><div class="small">${esc(K.agentHint(n) || (n.status === 'agreed' ? 'İmzala, gerisini ben hallederim.' : 'Boş ver, başka kulüpler de var.'))}</div>
        <div class="muted tiny">Komisyon: imza parasının %10'u + 2 haftalık maaş</div></div></div>
      <div class="neglog">${n.log.slice().reverse().map((l) => `<p class="${l.who}"><b>${l.who === 'agent' ? 'Cengiz' : esc(t.short || t.name)}:</b> ${esc(l.text)}</p>`).join('')}</div>
      <div class="evbtns pad">
        ${open ? `<button class="btn" data-act="negSubmit">Talebi ilet</button><button class="btn ghost" data-act="negAccept">Kulübün teklifini kabul et</button>${n.bluffed ? '' : '<button class="btn ghost" data-act="negBluff">🃏 "Başka kulüpler de ilgileniyor"</button>'}` : ''}
        ${n.status === 'agreed' ? `<button class="btn big" data-act="negSign">✍️ İmzala</button>` : ''}
        <button class="btn ghost" data-act="negBack">${n.status === 'walked' ? 'Geri dön' : 'Vazgeç'}</button>
      </div>`;
  },

  seasonEnd() {
    if (!ui.summary) {
      ui.summary = E.seasonSummary(state);
      ui.seasonOffers = state.player.age >= Aw.RETIRE_MAX ? [] : E.seasonOffers(state);
      const before = state.awardsYear;
      ui.awards = Aw.seasonAwards(state, ui.summary);
      if (before !== state.awardsYear) {
        addNews(ui.awards.won.map((k) => News.awardNews(state, k, ui.awards.list.find((a) => a.key === k)?.value)), false);
        persist();
      }
      if (!state.seasonNewsDone || state.seasonNewsDone !== state.season.year) {
        state.seasonNewsDone = state.season.year;
        addNews(News.seasonNews(state, ui.summary));
        persist();
      }
    }
    const s = ui.summary;
    const p = state.player;
    const expiring = E.contractExpiring(state);
    return `
      <header class="top"><h2>${seasonLabel()} sezonu bitti</h2></header>
      ${(() => { const d = state.natTourn || Career.tournamentFor(state); return d ? `<div class="card natcard"><b>${d.icon} ${esc(d.name)} başlıyor!</b><p class="small">Milli takım kadrosundasın. Türkiye'yi turnuvada temsil et.</p><button class="btn big" data-go="tourn">${state.natTourn ? 'Turnuvaya devam' : 'Turnuvaya git'}</button></div>` : ''; })()}
      <div class="card">
        <p>${esc(team(p.clubId).name)} ligi <b>${s.myPos}.</b> sırada bitirdi.</p>
        <p class="small muted">Şampiyonlar: ${Object.entries(s.champion).map(([l, id]) => `${esc(team(id).name)} (${LEAGUES[l].name.replace('Trendyol ', '')})`).join(', ')}</p>
        ${(() => { const cs = Cup.myStatus(state); return cs?.champ ? `<p class="small muted">🏆 ${esc(cs.name)} şampiyonu: <b>${esc(team(cs.champ).name)}</b></p>` : ''; })()}
        ${Object.entries(s.euro || {}).filter(([, id]) => id).map(([c, id]) => `<p class="small muted">${Eu.COMP[c].icon} ${Eu.COMP[c].name} şampiyonu: <b>${esc(team(id).name)}</b></p>`).join('')}
        ${Object.keys(LEAGUES).map((lid) => { const k = E.leagueStats(state, lid).sort((x, y) => y.g - x.g)[0]; return k ? `<p class="small muted">⚽ ${LEAGUES[lid].name.replace('Trendyol ', '')} gol kralı: <b>${esc(k.name)}</b> (${esc(team(k.teamId).short || team(k.teamId).name)}, ${k.g} gol)</p>` : ''; }).join('')}
        <div class="statsrow in"><div><span>Maç</span><b>${s.stats.apps}</b></div><div><span>Gol</span><b>${s.stats.goals}</b></div><div><span>Asist</span><b>${s.stats.assists}</b></div><div><span>Ort.</span><b>${s.stats.avg || '-'}</b></div></div>
      </div>
      <div class="card awards"><h3>🏅 Sezon ödülleri · ${LEAGUES[ui.awards.lid].name.replace('Trendyol ', '')}</h3>
        ${ui.awards.won.filter((k) => k.startsWith('champ') || k.startsWith('promo')).map((k) => `<div class="aw me"><span>${Aw.TROPHY[k].icon}</span><div><b>${Aw.TROPHY[k].name}</b><div class="muted small">${esc(team(p.clubId).name)}</div></div></div>`).join('')}
        ${ui.awards.list.map((a) => `<div class="aw ${a.winner.me ? 'me' : ''}"><span>${Aw.TROPHY[a.key].icon}</span><div><b>${Aw.TROPHY[a.key].name}</b><div class="muted small">${esc(a.winner.name)} · ${esc(team(a.winner.teamId).short || team(a.winner.teamId).name)} · ${a.value}</div></div>${a.winner.me ? '<em>SEN!</em>' : ''}</div>`).join('')}
      </div>
      ${p.age >= Aw.RETIRE_MIN ? `<div class="card retire"><p class="small">${p.age >= Aw.RETIRE_MAX ? `${p.age} yaşındasın. Vücudun artık izin vermiyor, kramponları asma vakti.` : `${p.age} yaşındasın. İstersen futbolu bırakabilirsin. Oğlun yeni kariyere başlar.`}</p>
        <button class="btn big ${p.age >= Aw.RETIRE_MAX ? '' : 'ghost'}" data-act="retire">🎬 Futbolu bırak</button></div>` : ''}
      ${p.age >= Aw.RETIRE_MAX ? '' : `
      <h3 class="pad">Transfer teklifleri</h3>
      ${ui.seasonOffers.length ? ui.seasonOffers.map((o, i) => {
        const t = team(o.clubId);
        return `<div class="card offer">${badge(t, 44)}<div class="grow"><b>${esc(t.name)}</b><div class="muted small">${LEAGUES[E.leagueOf(state, t.id)].name} · Güç ${t.str}</div><div class="small">${E.money(o.wage)}/hafta · ${o.years} yıl</div>
          <button class="btn ghost sm mt" data-act="negotiate" data-src="season" data-i="${i}">🤝 Pazarlık et</button></div><button class="btn" data-act="seasonAccept" data-i="${i}">İmzala</button></div>`;
      }).join('') : '<p class="muted pad">Bu yaz teklif gelmedi.</p>'}
      <div class="card"><p class="small">${expiring ? `Sözleşmen bitiyor. ${esc(team(Winter.parentClub(state)).name)} sana ${E.money(Math.round(p.contract.wage * 1.15 / 500) * 500)}/hafta ile 2 yıl uzatma teklif ediyor.` : `Sözleşmen ${p.contract.endsYear} yazına kadar sürüyor.${p.contract.release ? ` Serbest kalma bedelin ${E.money(p.contract.release)}.` : ''}`}</p>
      ${expiring ? `<button class="btn big" data-act="negotiate" data-src="renew">🤝 Uzatma pazarlığı</button>` : ''}
      <button class="btn big ghost" data-act="stay">${p.loan ? `${esc(News.ek(team(p.loan.from).name, 'dat'))} dön` : `${esc(News.ek(team(p.clubId).name, 'loc'))} kal`}${expiring ? ' (teklifi kabul et)' : ''}</button></div>`}`;
  },

  retired() {
    const sum = (state.legacy || []).slice(-1)[0];
    const hof = Aw.hallOfFame();
    if (!sum) return '';
    const tc = {}; for (const t of sum.trophyList) tc[t.key] = (tc[t.key] || 0) + 1;
    return `
      <header class="top"><h2>Bir efsane veda ediyor</h2></header>
      <div class="card center retirecard">
        <div class="big">🎬</div><h3>${esc(sum.name)}${sum.gen > 1 ? ` <small class="muted">(${sum.gen}. kuşak)</small>` : ''}</h3>
        <p class="muted small">${sum.retiredAt} yaşında futbolu bıraktı</p>
        <div class="statsrow in"><div><span>Sezon</span><b>${sum.years}</b></div><div><span>Maç</span><b>${sum.apps}</b></div><div><span>Gol</span><b>${sum.goals}</b></div><div><span>Asist</span><b>${sum.assists}</b></div></div>
        <p class="small">${Object.entries(tc).map(([k, n]) => `${Aw.TROPHY[k].icon} ${Aw.TROPHY[k].name}${n > 1 ? ' ×' + n : ''}`).join(' · ') || 'Kupa kazanamadı'}</p>
        <p class="muted small">Kulüpler: ${esc(sum.clubs.join(', '))}${sum.best ? ` · En iyi sezon: ${sum.best.year} (${sum.best.goals} gol)` : ''}</p>
      </div>
      <div class="card"><h3>👑 Ölümsüzler</h3>${hof.slice(0, 10).map((h, i) => `<div class="row small"><span>${i + 1}. ${esc(h.name)}</span><span class="muted">${h.goals} gol · ${h.trophies} kupa</span></div>`).join('')}</div>
      <div class="card"><h3>👶 Oğlunla devam et</h3>
        <p class="small muted">Oğlun 17 yaşında, aynı dünyada kariyere başlar. Soyadını, ününün bir kısmını, paranın %25'ini ve biraz da yeteneğini miras alır. Onunla bağın ve küçükken aldığı futbol eğitimi yeteneğini artırır.</p>
        ${(() => { const ss = (sum.children || []).filter((c) => c.gender === 'e'); return ss.length
          ? ss.map((c, i) => `<button class="pickrow" data-act="newSonKid" data-i="${(sum.children || []).indexOf(c)}"><span class="big">👦</span><span class="grow"><b>${esc(c.name)}</b><small>Bağınız ${Math.round(c.rel ?? 70)}${c.talent ? ' · ⚽ futbol okulunda yetişti' : ''}</small></span><b>Başla ›</b></button>`).join('')
          : `<p class="small muted">Hiç oğlun olmadı. Yine de bir oğulla devam edebilirsin (hikâyede evlat edinildi).</p>
        <input id="sonName" class="textin" placeholder="Oğlunun adı" maxlength="16" value="${esc(ui.sonName || '')}">
        <button class="btn big" data-act="newSon">Yeni kariyere başla</button>`; })()}
      </div>
      <button class="btn ghost big" data-go="start">Ana menüye dön</button>`;
  },

  cabinet() {
    const p = state.player;
    const tc = Aw.trophyCounts(p);
    const legacy = state.legacy || [];
    return `
      <header class="top"><button class="back" data-go="profile">‹</button><h2>Kupa dolabı</h2></header>
      <div class="shelfwrap">
        <div class="shelfhead"><b>${(p.trophies || []).length}</b> kupa · ${Object.keys(tc).length}/${Object.keys(Aw.TROPHY).length} çeşit</div>
        ${(() => { const keys = Object.keys(Aw.TROPHY); const rows = []; for (let i = 0; i < keys.length; i += 3) rows.push(keys.slice(i, i + 3)); return rows.map((r) => `<div class="shelf">${r.map((k) => `<div class="cup2 ${tc[k] ? 'won' : 'locked'}"><span>${Aw.TROPHY[k].icon}</span>${tc[k] && tc[k].length > 1 ? `<b>×${tc[k].length}</b>` : ''}<div class="cname">${esc(Aw.TROPHY[k].name)}</div>${tc[k] ? `<div class="cyears">${tc[k].join(', ')}</div>` : '<div class="cyears">—</div>'}</div>`).join('')}</div>`).join(''); })()}
      </div>
      ${p.nat?.caps || p.nat?.u21caps ? `<div class="card"><h3>🇹🇷 Milli takım</h3><div class="statsrow in"><div><span>A Milli</span><b>${p.nat.caps}</b></div><div><span>Gol</span><b>${p.nat.goals}</b></div><div><span>U21</span><b>${p.nat.u21caps}</b></div><div><span>U21 gol</span><b>${p.nat.u21goals}</b></div></div>${(p.nat.tourn || []).map((t) => `<p class="small">${esc(t.name)}: <b>${esc(t.reached)}</b> · ${t.goals} gol</p>`).join('')}</div>` : ''}
      ${p.gotw ? `<div class="card small">🏅 Haftanın golü ödülü: <b>${p.gotw}</b></div>` : ''}
      <div class="card"><h3>Kariyer</h3>
        <table class="tbl"><tr><th>Sezon</th><th class="l">Kulüp</th><th>M</th><th>G</th><th>A</th><th>Ort</th></tr>
        ${p.career.seasons.map((x) => `<tr><td>${x.year}</td><td class="l">${esc(team(x.club)?.short || x.club)}</td><td>${x.apps}</td><td>${x.goals}</td><td>${x.assists}</td><td>${x.avg || '-'}</td></tr>`).join('') || '<tr><td colspan="6" class="muted">İlk sezonun devam ediyor</td></tr>'}</table>
      </div>
      ${legacy.length ? `<div class="card"><h3>Aile mirası</h3>${legacy.map((l) => `<div class="row small"><span>${esc(l.name)}</span><span class="muted">${l.goals} gol · ${l.trophies} kupa</span></div>`).join('')}</div>` : ''}`;
  },
};

// Maç sonu: haftanın sonuçları + sıralamadaki değişim
function roundCard(m) {
  const R = m.round, me = state.player.clubId;
  const d = (m.posBefore || R.posAfter) - R.posAfter;
  const i = R.posAfter - 1, from = Math.max(0, Math.min(R.rows.length - 5, i - 2));
  const slice = R.rows.slice(from, from + 5);
  const mine = R.matches.find((x) => x.h === me || x.a === me);
  const others = R.matches.filter((x) => x !== mine).sort((a, b) => (R.near.has(b.h) || R.near.has(b.a)) - (R.near.has(a.h) || R.near.has(a.a)));
  return `<div class="card roundcard"><img class="evphoto" src="img/news/radio.jpg" alt="" loading="lazy"><h3>📻 Haftanın sonuçları</h3>
    <div class="posmove ${d > 0 ? 'up' : d < 0 ? 'down' : ''}">Sıralaman: <b>${m.posBefore}.</b> → <b>${R.posAfter}.</b> ${d > 0 ? `▲${d}` : d < 0 ? `▼${-d}` : '='}</div>
    <table class="tbl league compact mini">${slice.map((r, k) => `<tr class="${r.id === me ? 'me' : ''}"><td class="pos">${from + k + 1}</td><td class="l nm"><span>${badge(team(r.id), 18)}<span>${esc(team(r.id).name)}</span></span></td><td>${r.p}</td><td>${r.gd > 0 ? '+' : ''}${r.gd}</td><td><b>${r.pts}</b></td></tr>`).join('')}</table>
    <div class="fxlist">${others.map((x) => `<div class="fxrow ${R.near.has(x.h) || R.near.has(x.a) ? 'near' : ''}"><span class="t h">${esc(team(x.h).name)} ${badge(team(x.h), 16)}</span><b class="sc">${x.hg} - ${x.ag}</b><span class="t a">${badge(team(x.a), 16)} ${esc(team(x.a).name)}</span></div>`).join('')}</div>
    <p class="muted tiny">Sarı çizgili maçlar sıralamada sana yakın rakiplerin.</p></div>`;
}

// ---------- bahis (iddaa tarzı) ----------
function betScreen(stakeBar) {
  const p = state.player;
  ui.slip ||= []; ui.betMode ||= 'kombine';
  const view = ['bulten', 'kupon', 'gecmis'].includes(ui.betView) ? ui.betView : 'bulten';
  const list = Bet.bulletin(state);
  // bülten değişti mi (yeni hafta): kupondaki eski seçimleri at
  ui.slip = ui.slip.filter((l) => list.some((m) => m.key === l.key));
  const pending = p.bets.filter((b) => b.year === state.season.year);
  const seg = `<div class="seg">${[['bulten', 'Bülten'], ['kupon', `Kuponum${ui.slip.length ? ` (${ui.slip.length})` : ''}`], ['gecmis', 'Geçmiş']].map(([v, l]) => `<button class="${v === view ? 'on' : ''}" data-act="betView" data-v="${v}">${l}</button>`).join('')}</div>`;
  const dots = (f) => f.map((x) => `<i class="f${x}"></i>`).join('');
  const sel = (m, mk, k) => ui.slip.some((l) => l.key === m.key && l.mk === mk && l.pick === k);
  const oddBtn = (m, mk, k, lab = k) => `<button class="${sel(m, mk, k) ? 'on' : ''}" data-act="pickOdd" data-key="${m.key}" data-mk="${mk}" data-pick="${esc(k)}"><span>${esc(lab)}</span><b>${m.mk[mk][k].toFixed(2)}</b></button>`;
  let body = '';
  if (view === 'bulten') {
    const lg = ui.betLg && ui.betLg !== 'all' ? ui.betLg : 'all';
    const shown = list.filter((m) => lg === 'all' || m.lid === lg);
    body = `<div class="chips">${[['all', 'Tümü'], ...Object.keys(Bet.LG).filter((l) => list.some((m) => m.lid === l)).map((l) => [l, Bet.LG[l]])].map(([k, l]) => `<button class="${k === lg ? 'on' : ''}" data-act="betLg" data-v="${k}">${l}</button>`).join('')}</div>
      ${shown.map((m) => {
        const open = ui.betOpen === m.key;
        return `<div class="card betcard">
          <div class="bm-head"><span class="muted tiny">${Bet.LG[m.lid]} · ${state.season.week + 1}. hafta</span><span class="muted tiny">${ui.slip.some((l) => l.key === m.key) ? '🎟️ kuponda' : ''}</span></div>
          <div class="bm-teams"><div>${badge(team(m.h), 22)}<b>${esc(team(m.h).name)}</b><small>${m.posH}. · <span class="fdots">${dots(m.formH)}</span></small></div>
            <div>${badge(team(m.a), 22)}<b>${esc(team(m.a).name)}</b><small>${m.posA}. · <span class="fdots">${dots(m.formA)}</span></small></div></div>
          <div class="odds3">${['1', 'X', '2'].map((k) => oddBtn(m, 'MS', k)).join('')}</div>
          ${open ? `<div class="mkts">
            <h4>${Bet.MARKETS.CS}</h4><div class="odds3">${['1X', '12', 'X2'].map((k) => oddBtn(m, 'CS', k)).join('')}</div>
            <h4>Gol sayısı</h4><div class="odds4">${oddBtn(m, 'AU', 'Alt', '2,5 Alt')}${oddBtn(m, 'AU', 'Üst', '2,5 Üst')}${oddBtn(m, 'AU35', 'Alt', '3,5 Alt')}${oddBtn(m, 'AU35', 'Üst', '3,5 Üst')}</div>
            <h4>${Bet.MARKETS.KG}</h4><div class="odds2">${oddBtn(m, 'KG', 'Var')}${oddBtn(m, 'KG', 'Yok')}</div>
            <h4>${Bet.MARKETS.IY}</h4><div class="odds3">${['1', 'X', '2'].map((k) => oddBtn(m, 'IY', k)).join('')}</div>
            <h4>${Bet.MARKETS.SK}</h4><div class="odds4">${Object.keys(m.mk.SK).map((k) => oddBtn(m, 'SK', k)).join('')}</div>
          </div>` : ''}
          <button class="linkbtn" data-act="betOpen" data-key="${m.key}">${open ? 'Daha az ▲' : 'Tüm bahisler (+21) ▼'}</button>
        </div>`;
      }).join('') || '<p class="muted pad">Bu hafta bültende maç yok.</p>'}
      ${ui.slip.length ? `<button class="slipbar" data-act="betView" data-v="kupon"><span>🎟️ ${ui.slip.length} seçim</span><b>Oran ${Bet.comboOdd(ui.slip).toFixed(2)}</b><span>Kupona git ›</span></button>` : ''}`;
  } else if (view === 'kupon') {
    const legs = ui.slip;
    const mode = legs.length < 2 ? 'tekli' : ui.betMode;
    const total = mode === 'tekli' ? ui.stake * legs.length : ui.stake;
    const win = mode === 'tekli' ? legs.reduce((a, l) => a + ui.stake * l.odd, 0) : ui.stake * Bet.comboOdd(legs);
    body = legs.length ? `<div class="card slip">${legs.map((l, i) => `<div class="sliprow"><div class="grow"><b>${esc(l.label)}</b><div class="muted tiny">${esc(team(l.h).short)} - ${esc(team(l.a).short)} · ${Bet.MARKETS[l.mk]}</div></div><b>${l.odd.toFixed(2)}</b><button class="x" data-act="slipDel" data-i="${i}">✕</button></div>`).join('')}
        ${legs.length > 1 ? `<div class="seg mini">${[['kombine', `Kombine · ${Bet.comboOdd(legs).toFixed(2)}`], ['tekli', 'Tekli (her maça ayrı)']].map(([v, l]) => `<button class="${v === mode ? 'on' : ''}" data-act="betMode" data-v="${v}">${l}</button>`).join('')}</div>` : ''}
        <p class="muted tiny">${mode === 'kombine' ? 'Kombinede tüm maçlar tutmalı; oranlar çarpılır.' : 'Her seçim ayrı kupon; tutanlar ayrı ayrı öder.'}</p>
        ${stakeBar}
        <div class="row"><span>Toplam yatırılan</span><b>${E.money(total)}</b></div>
        <div class="row"><span>Olası kazanç</span><b class="winc">${E.money(Math.round(win))}</b></div>
        <div class="evbtns mt"><button class="btn" data-act="betPlace" ${total > p.money ? 'disabled' : ''}>Kuponu yatır</button><button class="btn ghost" data-act="slipClear">Temizle</button></div></div>`
      : '<div class="card center muted">Kupon boş. Bültenden oranlara dokunarak seçim ekle.</div>';
    body += pending.length ? `<h3 class="pad">Bu haftaki kuponların</h3>${pending.map((b) => couponCard(b)).join('')}` : '';
  } else {
    const st = p.betStats || { staked: 0, won: 0, coupons: 0, hits: 0 };
    const net = st.won - st.staked;
    body = `<div class="statsrow in"><div><span>Yatırılan</span><b>${E.money(st.staked)}</b></div><div><span>Kazanılan</span><b>${E.money(st.won)}</b></div></div>
      <div class="statsrow in"><div><span>Net</span><b class="${net >= 0 ? 'winc' : 'losec'}">${net >= 0 ? '+' : '−'}${E.money(Math.abs(net))}</b></div><div><span>Tutan kupon</span><b>${st.hits}/${st.coupons}${st.coupons ? ` · %${Math.round(st.hits / st.coupons * 100)}` : ''}</b></div></div>
      ${(p.betHistory || []).map((b) => couponCard(b, true)).join('') || '<p class="muted pad">Henüz sonuçlanmış kupon yok.</p>'}`;
  }
  return `${seg}${body}`;
}
function couponCard(b, done) {
  const legs = b.legs || [{ h: b.h, a: b.a, label: `MS ${b.pick}`, odd: b.odd }];
  return `<div class="card coupon ${done ? (b.won ? 'won' : 'lost') : ''}"><div class="row small"><b>${b.kind === 'kombine' ? `Kombine · ${legs.length} maç` : 'Tekli'}</b><span class="muted">${b.week + 1}. hafta</span></div>
    ${legs.map((l) => `<div class="row tiny"><span>${done ? (l.won ? '✅' : '❌') : '⏳'} ${esc(team(l.h).short)}-${esc(team(l.a).short)} ${l.score ? `<b>${l.score}</b>` : ''}</span><span>${esc(l.label)} · ${l.odd.toFixed(2)}</span></div>`).join('')}
    <div class="row small"><span>${E.money(b.stake)} × ${b.odd.toFixed(2)}</span><b class="${done ? (b.won ? 'winc' : 'losec') : ''}">${done ? (b.won ? '+' + E.money(b.payout) : 'Yattı') : 'Olası ' + E.money(Math.round(b.stake * b.odd))}</b></div></div>`;
}

// Borsa sekmesi
function spark(h, w = 72, hgt = 26, big = false) {
  const lo = Math.min(...h), hi = Math.max(...h), rg = hi - lo || 1;
  const pts = h.map((v, i) => `${(i / (h.length - 1) * w).toFixed(1)},${(hgt - 2 - (v - lo) / rg * (hgt - 4)).toFixed(1)}`).join(' ');
  const up = h.at(-1) >= h[0];
  return `<svg class="spark ${big ? 'big' : ''}" viewBox="0 0 ${w} ${hgt}" preserveAspectRatio="none"><polyline points="${pts}" fill="none" stroke="${up ? '#22c55e' : '#ef4444'}" stroke-width="${big ? 1.6 : 1.8}" vector-effect="non-scaling-stroke"/></svg>`;
}
const pct = (x) => `${x >= 0 ? '+' : '−'}%${Math.abs(x * 100).toFixed(1)}`;
const fpx = (x) => (E.CUR.mode === 'EUR' ? '€' : '₺') + (E.CUR.mode === 'EUR' ? x / E.EUR_RATE : x).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const plx = (x) => Math.abs(E.conv(x)) < 0.5 ? E.money(0) : (x >= 0 ? '+' : '−') + E.money(Math.abs(x));
function stockTab(p) {
  const M = Stk.ensure(state), H = Stk.holdings(state), pf = Stk.portfolio(state);
  const eur = E.CUR.mode === 'EUR';
  const AMT = (eur ? [100, 1_000, 10_000, 100_000].map((v) => v * E.EUR_RATE) : [5_000, 50_000, 500_000, 5_000_000]);
  const sort = ui.stkSort || 'all';
  let list = Stk.STOCKS.slice();
  if (sort === 'mine') list = list.filter((s) => H[s.code]);
  if (sort === 'up') list.sort((a, b) => Stk.weekChange(state, b.code) - Stk.weekChange(state, a.code));
  if (sort === 'div') list.sort((a, b) => b.div - a.div);
  const row = (s) => {
    const P = M.prices[s.code], ch = Stk.weekChange(state, s.code), h = H[s.code], open = ui.stkSel === s.code;
    const val = h ? h.n * P.p : 0;
    const news = M.news.filter((n) => n.code === s.code).slice(0, 3);
    return `<div class="card stk ${open ? 'open' : ''} ${h ? 'own' : ''}"><div class="stkrow" data-act="stkSel" data-c="${s.code}">
      <span class="tick">${s.code}</span><div class="grow"><b>${esc(s.name)}</b><div class="muted tiny">${s.sector}${s.div ? ` · temettü %${(s.div * 100).toFixed(1)}` : ''}${h ? ` · ${h.n} adet` : ''}</div></div>
      ${spark(P.h.slice(-12))}<div class="stkp"><b>${fpx(P.p)}</b><small class="${ch >= 0 ? 'gain' : 'loss'}">${pct(ch)}</small></div></div>
      ${open ? `<div class="stkdet">${spark(P.h, 300, 90, true)}
        <div class="row tiny muted"><span>${P.h.length} hafta önce ${fpx(P.h[0])}</span><span>En yüksek ${fpx(Math.max(...P.h))} · En düşük ${fpx(Math.min(...P.h))}</span></div>
        ${h ? `<div class="card small mt">Elinde <b>${h.n} adet</b> · Değer <b>${E.money(val)}</b> · Maliyet ${E.money(h.cost)} · <b class="${val - h.cost >= 0 ? 'gain' : 'loss'}">${plx(val - h.cost)}</b></div>` : ''}
        ${news.length ? `<div class="stknews">${news.map((n) => `<p class="tiny">${n.dir > 0 ? '🟢' : '🔴'} ${esc(n.t)} <b class="${n.pct >= 0 ? 'gain' : 'loss'}">${pct(n.pct)}</b></p>`).join('')}</div>` : ''}
        <b class="small">Al</b><div class="chips">${AMT.map((v) => `<button data-act="stkBuy" data-c="${s.code}" data-v="${v}" ${p.money < P.p * 1.002 ? 'disabled' : ''}>${E.moneyShort(v)}</button>`).join('')}<button data-act="stkBuy" data-c="${s.code}" data-v="${Math.floor(p.money)}" ${p.money < P.p * 1.002 ? 'disabled' : ''}>Tüm param</button></div>
        ${h ? `<b class="small">Sat</b><div class="chips"><button data-act="stkSell" data-c="${s.code}" data-v="0.25">%25</button><button data-act="stkSell" data-c="${s.code}" data-v="0.5">%50</button><button data-act="stkSell" data-c="${s.code}" data-v="1">Hepsi</button></div>` : ''}
        <p class="muted tiny">Alım-satımda %${(Stk.FEE * 100).toFixed(1)} komisyon alınır. Fiyatlar her hafta güncellenir.</p></div>` : ''}</div>`;
  };
  return `<div class="card pfcard"><div class="row"><div><span class="muted small">Portföy değeri</span><div class="pfv">${E.money(pf.value)}</div></div>
      <div class="ralign"><span class="muted small">Kâr / zarar</span><div class="${pf.pl >= 0 ? 'gain' : 'loss'}"><b>${plx(pf.pl)}</b>${pf.cost ? ` <small>(${pct(pf.pl / pf.cost)})</small>` : ''}</div></div></div></div>
    ${M.news.length ? `<div class="card stknews"><b class="small">📰 Piyasa haberleri</b>${M.news.slice(0, 3).map((n) => `<p class="tiny">${n.dir > 0 ? '🟢' : '🔴'} ${esc(n.t)} <b class="${n.pct >= 0 ? 'gain' : 'loss'}">${n.code} ${pct(n.pct)}</b></p>`).join('')}</div>` : ''}
    <div class="chips">${[['all', 'Tümü'], ['mine', 'Hisselerim'], ['up', 'Haftanın yükselenleri'], ['div', 'Temettü']].map(([k, l]) => `<button class="${k === sort ? 'on' : ''}" data-act="stkSort" data-v="${k}">${l}</button>`).join('')}</div>
    ${list.map(row).join('') || '<p class="muted pad">Henüz hissen yok. Bir şirkete dokunup alım yapabilirsin.</p>'}
    <p class="muted small pad">Reklamını yaptığın markaların hisseleri ilgi görür. Temettü sezon sonunda ödenir.</p>`;
}

// Lig bölgeleri (Avrupa / düşme) — FotMob tarzı renkli şerit
function leagueZones(lid, n) {
  const Z = { ucl: { t: 'Şampiyonlar Ligi', c: '#3b82f6' }, uclq: { t: 'ŞL ön eleme', c: '#60a5fa' }, uel: { t: 'Avrupa Ligi', c: '#f97316' }, uelq: { t: 'AL ön eleme', c: '#fdba74' }, uecl: { t: 'Konferans Ligi', c: '#22c55e' }, ueclq: { t: 'KL ön eleme', c: '#86efac' }, up: { t: 'Süper Lig\'e çıkış', c: '#22c55e' }, down: { t: 'Küme düşme', c: '#ef4444' } };
  const out = Array(n).fill(null);
  if (lid === 'SL') { out[0] = Z.ucl; out[1] = Z.uclq; out[2] = Z.uelq; out[3] = Z.uelq; out[4] = Z.ueclq; }
  if (lid === 'PL' || lid === 'LL') { for (let i = 0; i < 5; i++) out[i] = Z.ucl; out[5] = out[6] = Z.uel; out[7] = Z.uecl; }
  if (lid === 'SA' || lid === 'BL') { for (let i = 0; i < 4; i++) out[i] = Z.ucl; out[4] = out[5] = Z.uel; out[6] = Z.uecl; }
  if (lid === 'FR') { for (let i = 0; i < 4; i++) out[i] = Z.ucl; out[4] = Z.uel; out[5] = Z.uecl; }
  if (lid === 'NL' || lid === 'PT') { out[0] = out[1] = Z.ucl; out[2] = Z.uel; out[3] = Z.uecl; }
  if (lid === 'BE') { out[0] = Z.ucl; out[1] = Z.uel; out[2] = Z.uecl; }
  if (['SCO', 'GRE', 'AUT', 'SUI', 'DEN', 'NOR', 'CZE', 'POL'].includes(lid)) { out[0] = Z.uclq; out[1] = Z.uelq; out[2] = Z.ueclq; out[3] = Z.ueclq; }
  const L = LEAGUES[lid];
  for (let i = 0; i < (L.promote || 0); i++) out[i] = Z.up;
  for (let i = 0; i < (L.relegate || 0); i++) out[n - 1 - i] = Z.down;
  return out;
}
// Son 5 maç: G / B / M
function teamForms(SL, week) {
  const f = {};
  for (let w = 0; w < Math.min(week + 1, SL.fixtures.length); w++) for (const m of SL.fixtures[w]) {
    if (m.hg === null) continue;
    (f[m.h] ||= []).push(m.hg > m.ag ? 'w' : m.hg === m.ag ? 'd' : 'l');
    (f[m.a] ||= []).push(m.ag > m.hg ? 'w' : m.hg === m.ag ? 'd' : 'l');
  }
  for (const k of Object.keys(f)) f[k] = f[k].slice(-5);
  return f;
}
function superCard(sc) {
  const m = sc.legs[0], me = state.player.clubId;
  return `<div class="card supercard ${sc.hi === me || sc.lo === me ? 'me' : ''}"><div class="muted small">🏆 UEFA Süper Kupa · ${sc.week + 1}. hafta</div>
    <div class="fxrow"><span class="t h">${esc(team(m.h).short)} ${badge(team(m.h), 20)}</span><b class="sc">${m.hg === null ? 'vs' : `${m.hg} - ${m.ag}`}${m.pens ? `<small> (p. ${m.pens[0]}-${m.pens[1]})</small>` : ''}</b><span class="t a">${badge(team(m.a), 20)} ${esc(team(m.a).short)}</span></div>
    ${sc.w ? `<div class="small center">Kupa: <b>${esc(team(sc.w).name)}</b></div>` : ''}</div>`;
}

function euroBody(cid, view) {
  const comp = state.euro?.comps[cid];
  const me = state.player.clubId;
  let body = '';
  if (!comp) return '<p class="muted pad">Bu sezon kupa yok.</p>';
  if (view === 'puan') {
    const rows = Eu.sortedEuro(comp);
    const q = (state.euro.quals || []).filter((x) => x.comp === cid && x.ties.length);
    body = `${q.map((x) => `<div class="card"><h3>🇹🇷 ${esc(team(x.team).name)} · ön eleme</h3>${x.ties.map((t, i) => `<div class="komatch ${x.team === me ? 'me' : ''}"><span>${esc(x.rounds[i])}</span><b>${t.legs.map((l) => l.hg === null ? '-' : `${l.h === x.team ? l.hg : l.ag}-${l.h === x.team ? l.ag : l.hg}`).join(' · ')}</b><span class="${t.w === x.team ? 'win' : ''}">${t.w ? (t.w === x.team ? '✅' : '❌') : ''} ${esc(team(t.hi).short)} ${badge(team(t.hi), 16)}</span></div>`).join('')}${x.done ? `<p class="small muted">${x.result === 'in' ? 'Lig aşamasına kaldı!' : x.result === 'down' ? 'Elendi, bir alt kupada devam ediyor.' : 'Elendi, Avrupa defteri kapandı.'}</p>` : ''}</div>`).join('')}
      <p class="muted small pad">${Math.min(comp.md, comp.mds || 8)}/${comp.mds || 8} maç oynandı</p>
      <div class="tblwrap"><table class="tbl league compact">
      <tr><th>#</th><th class="l">Takım</th><th>O</th><th>Av</th><th>P</th></tr>
      ${rows.map((r, i) => `<tr class="${r.id === me ? 'me' : ''}" ${r.id === me ? 'id="myrow"' : ''}><td class="pos" style="box-shadow: inset 3px 0 ${i < 8 ? '#3b82f6' : i < 24 ? '#f59e0b' : '#ef4444'}">${i + 1}</td><td class="l nm"><span>${badge(team(r.id), 20)}<span>${esc(team(r.id).name)}</span></span></td><td>${r.p}</td><td>${r.gd > 0 ? '+' : ''}${r.gd}</td><td><b>${r.pts}</b></td></tr>`).join('')}</table></div>
      <div class="legend"><span><i style="background:#3b82f6"></i>Son 16</span><span><i style="background:#f59e0b"></i>Play-off</span><span><i style="background:#ef4444"></i>Elendi</span></div>`;
  } else if (view === 'ko') {
    const sc = (l) => l.hg === null ? '-' : `${l.hg}-${l.ag}`;
    body = comp.ko.length ? comp.ko.map((ties, i) => `<div class="card"><h3>${Eu.STAGE_NAME[i]}</h3>${ties.map((t) => {
      const last = t.legs[t.legs.length - 1], two = t.legs.length === 2;
      const aggHi = Eu.aggFor(t, t.hi), aggLo = Eu.aggFor(t, t.lo);
      return `<div class="komatch ${t.hi === me || t.lo === me ? 'me' : ''}"><span class="${t.w === t.hi ? 'win' : ''}">${badge(team(t.hi), 16)} ${esc(team(t.hi).short)}</span>
        <b>${two ? `${t.legs[0].hg === null ? '-' : aggHi + '-' + aggLo}` : sc(last)}${last.pens ? `<small> (p. ${last.h === t.hi ? last.pens[0] : last.pens[1]}-${last.h === t.hi ? last.pens[1] : last.pens[0]})</small>` : last.et ? '<small> uz.</small>' : ''}
        ${two ? `<small class="legs">${sc(t.legs[0]).split('-').reverse().join('-')} · ${sc(t.legs[1])}</small>` : ''}</b>
        <span class="${t.w === t.lo ? 'win' : ''}">${esc(team(t.lo).short)} ${badge(team(t.lo), 16)}</span></div>`;
    }).join('')}</div>`).join('')
      + (comp.winner ? `<div class="card center"><div style="font-size:36px">🏆</div><b>${esc(team(comp.winner).name)}</b><div class="muted small">${Eu.COMP[cid].name} şampiyonu</div></div>` : '')
      : '<p class="muted pad">Eleme turları lig aşaması bitince başlar.</p>';
  } else {
    const all = Object.entries(state.euro.ps || {}).map(([k, v]) => { const i = k.indexOf('|'); return { teamId: k.slice(0, i), name: k.slice(i + 1), g: v[0], a: v[1], me: !!v[2] }; })
      .filter((x) => comp.teams.includes(x.teamId) && x.g > 0).sort((x, y) => y.g - x.g || y.a - x.a).slice(0, 20);
    body = all.length ? `<table class="tbl stats"><tr><th>#</th><th class="l">Oyuncu</th><th>Gol</th><th>Asist</th></tr>${all.map((x, i) => `<tr class="${x.me ? 'me' : ''}"><td>${i + 1}</td><td class="l"><b>${esc(x.name)}</b><div class="muted tiny">${badge(team(x.teamId), 14)} ${esc(team(x.teamId).name)}</div></td><td><b>${x.g}</b></td><td class="muted">${x.a}</td></tr>`).join('')}</table>` : '<p class="muted pad">Henüz gol yok.</p>';
  }
  return body;
}

function interviewCard(iv) {
  if (!iv.answers?.[0]?.tone) return '';   // eski kayıttan kalma röportaj
  return `<div class="iv">
    <div class="iv-head">${REPORTER_FACES.has(iv.rid) ? face(iv.rid, 44, 'round') : `<span class="iv-ic">${iv.icon}</span>`}<div><b>${esc(iv.reporter)}</b><small>${esc(iv.outlet)} · ${esc(iv.style)}</small></div></div>
    <p class="iv-hello">${esc(iv.hello)}</p>
    <p class="iv-q">"${esc(iv.q)}"</p>
    ${iv.chosen ? `<p class="iv-a">"${esc(iv.chosen.text)}"</p><p class="iv-react">${esc(iv.react || '')}</p><p class="muted small">${esc(iv.summary)}</p>`
      : iv.answers.map((a, i) => `<button class="iv-opt" data-act="ivAns" data-i="${i}">${esc(a.text)}</button>`).join('') +
        `<button class="iv-skip" data-act="ivAns" data-i="-1">🚫 Konuşmayacağım</button>`}
  </div>`;
}

// ---------- maç akışı ----------
async function runMatch() {
  const plan = ui.plan;
  if (window.__debug) window.__debug.ui = ui;   // testler için
  const m = ui.match = {
    plan, minute: 0, homeG: 0, awayG: 0, feed: [], fast: localStorage.getItem('golyildizi.fast') === '1', done: false, inMoment: false, choice: null,
    res: { played: plan.role !== 'out', goals: 0, assists: 0, outcomes: [], myGoals: 0, oppGoals: 0, yellows: 0, red: false, cards: [] },
  };
  const p = state.player;
  const home = plan.fx.home;
  const addMine = () => { if (m.minute >= 85 && m.res.myGoals <= m.res.oppGoals) m.res.lateWinner = true; else if (m.res.myGoals + 1 <= m.res.oppGoals) m.res.lateWinner = false; m.res.myGoals++; if (home) m.homeG++; else m.awayG++; };
  const addOpp = () => { m.res.oppGoals++; if (home) m.awayG++; else m.homeG++; };
  const score = () => `${m.homeG}-${m.awayG}`;
  const V = (extra = {}) => ({
    ad: p.surname, takim: plan.myName, rakip: plan.oppName, kaleci: plan.keeperName.split(' ').slice(-1)[0], skor: score(),
    arkadas: (E.pick(plan.teammates) || '').split(' ').slice(-1)[0], defans: 'Defans', ...extra,
  });
  // Spiker satırı akışa
  const spk = (ev, extra, cls) => {
    const line = Spiker.say(ev, V(extra));
    if (!line) return;
    m.feed.push({ min: m.minute, text: line.text, cls: cls || 'spk', id: line.id });
    const big = /goal|assist|Red|halftime/.test(ev);
    if (!m.fast || big) Voice.say(line.text, 'spiker', big, line.id);
  };
  // Maç içi seçim (kayarak gir / itiraz): 6 sn içinde seçilmezse varsayılan
  const ask = (title, options, def) => new Promise((resolve) => {
    let t;
    m.choice = { title, options, pick: (v) => { clearTimeout(t); m.choice = null; resolve(v); } };
    t = setTimeout(() => { if (m.choice) m.choice.pick(def); }, 6000);
    render();
  });
  const onPitch = (min) => plan.role !== 'out' && !m.res.red && min >= plan.onFrom && min <= plan.onTo;
  const myCard = (type, min) => {
    if (type === 'none') { m.feed.push({ min, text: 'Hakem sadece uyardı.' }); return; }
    const r = E.giveCard(state, type, m.res.yellows);
    m.res.cards.push({ min, ...r });
    if (r.card === 'yellow') {
      m.res.yellows++;
      spk('meYellow', {}, 'card-y');
      if (r.accum) m.feed.push({ min, text: '4. sarı kart: gelecek maç cezalısın!', cls: 'bad' });
    } else {
      m.res.red = true; m.res.redMin = min;
      spk('meRed', {}, 'card-r');
      m.feed.push({ min, text: `Oyundan atıldın! ${r.ban} maç ceza.`, cls: 'bad' });
      // 10 kişi kaldınız: sonraki takım golleri azalır
      for (const e of evs) if (e.type === 'teamGoal' && Math.random() < 0.35) e.type = 'void';
    }
  };
  const ci = clubInfo(plan.fx.h);
  if (ci.stadyum && ci.kapasite) {
    const fill = isDerby(plan.fx.h, plan.fx.a) ? E.rand(0.92, 1) : E.rand(0.45, 0.9);
    m.feed.push({ min: 0, text: `${ci.stadyum}, ${Math.round(ci.kapasite * fill).toLocaleString('tr-TR')} seyirci.${isDerby(plan.fx.h, plan.fx.a) ? ' Derbi heyecanı!' : ''}` });
  }
  // Bedirhan Bülent Şimşek: bazı maçlardan önce ön bilgilendirme
  {
    const derby = isDerby(plan.fx.h, plan.fx.a), rivalT = state.social?.rival?.team;
    const lidP = E.leagueOf(state, p.clubId), rows = plan.fx.comp ? [] : E.sortedTable(state.season.leagues[lidP].table), pos = rows.findIndex((r) => r.id === p.clubId) + 1;
    const kind = plan.fx.cup ? 'cup' : plan.fx.comp ? 'euro' : derby ? 'derby' : rivalT === plan.fx.opp ? 'rival' : state.season.week >= 8 && pos && pos <= 3 ? 'top' : state.season.week >= 8 && pos > rows.length - 4 ? 'bottom' : p.season.goals >= 5 && Math.random() < 0.5 ? 'star' : 'generic';
    if (kind !== 'generic' || Math.random() < 0.35) {
      for (const ln of [Spiker.preLine('hello'), Spiker.preLine(kind)]) { m.feed.push({ min: 0, text: `🎙️ ${ln.text}`, cls: 'spk pre' }); if (!m.fast) Voice.say(ln.text, 'spiker', false, ln.id); }
    }
  }
  const wx = plan.weather;
  m.feed.push({ min: 0, text: `${E.WEATHER_TEXT[wx.tod]}${wx.fx ? ' · ' + E.WEATHER_TEXT[wx.fx] : ''} · Rakip taktiği: ${E.TACTICS[plan.tactic].name}` });
  if (wx.fx) spk('weather_' + wx.fx); else if (wx.tod === 'gece') spk('weather_gece');
  if (plan.tactic !== 'dengeli') spk('tactic_' + plan.tactic);
  spk('kickoff');
  Sfx.whistle(); Sfx.startCrowd();
  if (plan.role === 'sub') m.feed.push({ min: 0, text: 'Yedek kulübesindesin.' });
  if (plan.suspended) m.feed.push({ min: 0, text: 'Cezalısın, maçı tribünden izliyorsun.', cls: 'bad' });
  // diğer sahalar: sıralamada sana yakın takımların maçları (canlı gol haberleri)
  const lidMe0 = E.leagueOf(state, p.clubId);
  const radio = plan.fx.comp ? [] : E.preSimRound(state, lidMe0).map((x) => ({ m: x, hg: 0, ag: 0 }));
  m.posBefore = plan.fx.comp ? null : E.sortedTable(state.season.leagues[lidMe0].table).findIndex((r) => r.id === p.clubId) + 1;
  m.week = state.season.week;
  // yorumcu: maç boyunca birkaç "ilginç bilgi"
  const triv = Trivia.pool(state, plan);
  const trivMins = new Set(E.shuffle([6, 13, 21, 28, 34, 41, 52, 58, 64, 71, 78, 84]).slice(0, E.randInt(2, 3)));
  const yorum = (min) => { const t = Trivia.line(triv); if (!t) return; m.feed.push({ min, text: `🎙️ ${Trivia.NAME}: ${t}`, cls: 'yorum' }); if (!m.fast) Voice.say(t, 'yorum'); };
  yorum(0);
  screen = 'match';
  render();

  const insert = (ev) => { const i = evs.findIndex((e) => e.min > ev.min); if (i < 0) evs.push(ev); else evs.splice(i, 0, ev); };
  const evs = plan.events.slice();
  let lateDone = false, leadTrim = false, oppRed = false;

  const wait = (ms) => new Promise((r) => setTimeout(r, m.fast ? ms * 0.3 : ms * 0.62));
  async function moment(ev, min, buildup = true) {
    if (buildup) {
      // NSS tarzı: pozisyon satır satır gelişir, sonra saha açılır
      const vars = V({ defans: E.pick(ev.oppNames || ['Defans']).split(' ').slice(-1)[0] });
      for (const line of Spiker.buildUp(ev.kind, vars)) {
        m.feed.push({ min, text: line.text, cls: 'build', id: line.id });
        if (!m.fast) Voice.say(line.text, 'spiker', false, line.id);
        render();
        await wait(1300);
      }
      m.feed[m.feed.length - 1].cls = 'build hot';
      render();
      await wait(900);
    }
    m.inMoment = true;
    render();
    window.scrollTo(0, 0);
    const r = await playMoment(document.getElementById('momentHost'), {
      ...ev, minute: min, stats: p.stats, energy: p.energy, look: Look.lookOf(p), teamRel: p.rel?.team ?? 50,
      myColors: plan.myColors, oppColors: plan.oppColors, teammates: plan.teammates, defenders: ev.defenders - (oppRed ? 1 : 0),
    });
    m.inMoment = false;
    return r;
  }

  for (let min = 1; min <= 90; min++) {
    m.minute = min;
    const feedBefore = m.feed.length;
    if (plan.role === 'sub' && min === plan.onFrom) m.feed.push({ min, text: 'Oyuna girdin!', cls: 'hl' });
    if (plan.role === 'starter' && plan.onTo < 90 && min === plan.onTo && !m.res.red) m.feed.push({ min, text: 'Yorulduğun için oyundan çıktın.' });
    // skor durumu: geride → son dakika baskısı; 2+ öndeyken bir an eksilir
    const diff = m.res.myGoals - m.res.oppGoals;
    if (min === 75 && !lateDone && onPitch(80) && diff < 0) {
      lateDone = true;
      spk('latePressure', {}, 'hl');
      const n = diff <= -2 ? 1 : E.randInt(1, 2);
      for (let k = 0; k < n; k++) insert(plan.extraMoment(E.randInt(77, Math.min(89, plan.onTo)), E.pick(['acik', 'kafa', 'korner', 'kontra', 'uzuntop', 'duvar', 'vole', 'arkadirek', 'kosevurusu', 'donen', 'yerden', 'uclu'])));
    }
    if (min === 60 && !leadTrim && diff >= 2) {
      leadTrim = true;
      const i = evs.findIndex((e) => e.type === 'moment');
      if (i >= 0 && Math.random() < 0.6) evs.splice(i, 1);
    }
    while (evs.length && evs[0].min === min) {
      const ev = evs.shift();
      if (ev.type === 'teamGoal') { addMine(); m.feed.push({ min, text: `GOL! ${ev.scorer} (${plan.myName})${ev.assist ? ` · asist: ${ev.assist}` : ''}`, cls: 'goal' }); spk('teamGoal'); }
      else if (ev.type === 'oppGoal') { addOpp(); m.feed.push({ min, text: `Gol: ${ev.scorer} (${plan.oppName})${ev.assist ? ` · asist: ${ev.assist}` : ''}`, cls: 'bad' }); spk('oppGoal'); }
      else if (ev.type === 'moment') {
        if (m.res.red) continue;
        let cur = ev, guard = 0;
        while (cur && guard++ < 3) {
          const next = cur.chain; cur.chain = null;
          const { outcome, text, foul, detail } = await moment(cur, min, guard === 1);
          for (const f of m.feed) if (f.cls?.startsWith('build')) f.cls = 'build old';
          m.res.outcomes.push(outcome);
          const vx = { defans: foul?.name || E.pick(cur.oppNames || ['Defans']) };
          if (cur.kind === 'penalti' && outcome !== 'goal') m.res.penMissed = true;
          if (cur.kind === 'rovasata' && outcome === 'goal') m.res.bicycle = true;
          if (outcome === 'goal') {
            addMine(); m.res.goals++; (m.res.goalKinds ||= []).push(cur.kind);
            m.feed.push({ min, text: `GOOOL! ${p.name} ${p.surname}!`, cls: 'goal' });
            spk(Spiker.LINES['goal_' + cur.kind] && Math.random() < 0.75 ? 'goal_' + cur.kind : 'goal');
            // gol sevinci
            render(); await wait(m.fast ? 300 : 900);
            const cid = await ask('⚽ GOL! Nasıl sevineceksin?', Celeb.options(state, plan, m.res), 'takim');
            const cel = Celeb.apply(state, cid, plan, { ad: p.surname });
            m.feed.push({ min, text: `🎉 ${cel.line}`, cls: 'hl celeb', img: cel.img });
            (m.res.celebs ||= []).push(cid);
            if (cel.crisis) m.res.celebCrisis = true;
            if (cel.card) { render(); await wait(m.fast ? 300 : 900); myCard('yellow', min); }
          } else if (outcome === 'assist') {
            addMine(); m.res.assists++; spk('assist', {}, 'goal');
          } else if (outcome === 'foulPen' || outcome === 'foulFk') {
            spk(outcome, vx, 'hl');
            if (foul?.card === 'red') { spk('oppRed', vx, 'card-r'); oppRed = true; for (const e of evs) if (e.type === 'oppGoal' && Math.random() < 0.4) e.type = 'void'; }
            else if (foul?.card === 'yellow') spk('oppYellow', vx, 'card-y');
            cur = { ...cur, kind: outcome === 'foulPen' ? 'penalti' : 'serbest' };
            render(); await wait(1800);
            spk('intro_' + cur.kind, {}, 'hl'); render(); await wait(1200);
            continue;
          } else if (outcome === 'offside' || outcome === 'lost') {
            spk(outcome, vx);
            // itiraz ya da kayarak müdahale
            const opts = outcome === 'offside'
              ? [{ label: '🗣️ Hakeme itiraz et', v: 'appeal' }, { label: 'Kabul et', v: 'no' }]
              : [{ label: '🦵 Kayarak gir', v: 'tackle' }, { label: '🗣️ Faul! İtiraz et', v: 'appeal' }, { label: 'Bırak', v: 'no' }];
            const c = await ask(outcome === 'offside' ? 'Ofsayt mıydı?' : 'Top gitti! Ne yapıyorsun?', opts, 'no');
            if (c === 'appeal') {
              const r = Math.random();
              if (r < 0.12) { spk('appealWin', {}, 'hl'); cur = { ...cur, kind: outcome === 'offside' ? 'birebir' : 'serbest' }; render(); await wait(1800); continue; }
              if (r < 0.52) { spk('appealYellow'); myCard('yellow', min); }
              else spk('appealNothing');
            } else if (c === 'tackle') {
              const r = Math.random(), tek = (p.stats.teknik + p.stats.guc) / 200;
              if (r < 0.3 + tek * 0.2) { spk('tackleWin', {}, 'hl'); cur = { ...cur, kind: E.pick(['acik', 'kontra']) }; render(); await wait(1500); continue; }
              if (r < 0.62) { m.feed.push({ min, text: 'Faul! Hakem düdüğü çaldı.' }); const red = Math.random() < (p.energy < 30 ? 0.12 : 0.05); myCard(red ? 'red' : Math.random() < 0.55 ? 'yellow' : 'none', min); }
              else spk('tackleMiss');
            }
          } else {
            const key = { saved: 'saved', miss: 'miss', over: 'over', post: 'post', blocked: 'blocked', intercepted: 'intercepted', tmMiss: 'tmMiss' }[outcome];
            if (key) spk(detail && Spiker.LINES[key + '_' + detail] && Math.random() < 0.8 ? key + '_' + detail : key, vx); else m.feed.push({ min, text: text || OUTCOME_TEXT[outcome] });
          }
          cur = next;
          if (m.res.red) break;
        }
      }
    }
    for (const r of radio) for (const g of r.m.preGoals || []) {
      if (g.min !== min) continue;
      if (g.side === 'h') r.hg++; else r.ag++;
    }
    if (min === 45) { spk('halftime'); Sfx.whistle(); }
    if (trivMins.has(min) && m.feed.length === feedBefore) yorum(min);
    render();
    // tempo: sakin dakikalar akar, yeni satır gelince okumaya zaman tanır
    const added = m.feed.length - feedBefore;
    const lines = Math.min(3, added);
    await new Promise((r) => setTimeout(r, m.fast ? 60 + lines * 320 : 210 + lines * 800 + (min === 45 ? 700 : 0)));
    if (!m.fast && lines) await Voice.idle(7000);   // sesli anlatım bitsin
  }
  m.minute = 90;
  // eleme maçı: uzatma + penaltılar
  const aggM = () => m.res.myGoals + (plan.fx.agg?.my || 0), aggO = () => m.res.oppGoals + (plan.fx.agg?.opp || 0);
  if (plan.fx.knockout && aggM() === aggO() && !m.res.red) {
    m.feed.push({ min: 90, text: plan.fx.agg ? `Toplam skor ${aggM()}-${aggO()}! Uzatmalara gidiyoruz…` : 'Berabere! Uzatmalara gidiyoruz…', cls: 'hl' }); Sfx.whistle(); render(); await wait(1600);
    for (let min = 91; min <= 120; min++) {
      m.minute = min;
      if (Math.random() < 0.011) { addMine(); m.feed.push({ min, text: `GOL! ${E.pick(plan.teammates)} (${plan.myName})`, cls: 'goal' }); spk('teamGoal'); }
      else if (Math.random() < 0.010) { addOpp(); m.feed.push({ min, text: `Gol: ${E.pick(state.teams[plan.fx.opp].squad).name} (${plan.oppName})`, cls: 'bad' }); spk('oppGoal'); }
      render(); await new Promise((r) => setTimeout(r, m.fast ? 25 : 120));
    }
    if (aggM() === aggO()) {
      m.feed.push({ min: 120, text: 'Penaltılar! Kalpler duracak…', cls: 'hl' }); Sfx.whistle(true); render(); await wait(1800);
      const iKick = plan.role !== 'out' && plan.onTo >= 90 && plan.onFrom <= 120;
      const short = (n) => { const w = (n || '').split(' '); return w.length > 1 ? `${w[0][0]}. ${w.slice(1).join(' ')}` : n; };
      const mates = (state.teams[p.clubId].squad.filter((x) => x.pos !== 'KL').map((x) => x.name)).slice(0, 10), opps = state.teams[plan.fx.opp].squad.filter((x) => x.pos !== 'KL').map((x) => x.name).slice(0, 10);
      let a = 0, b = 0;
      m.pens = [0, 0];
      const setP = () => { m.pens = plan.fx.home ? [a, b] : [b, a]; };
      for (let k = 0; k < 20; k++) {
        // bizim atış
        let ok;
        if (k === 0 && iKick) {
          m.feed.push({ min: 120, text: 'İlk penaltı senden!', cls: 'hl' }); render(); await wait(900);
          const r = await moment(plan.extraMoment(120, 'penalti'), 120, false);
          ok = r.outcome === 'goal';
          m.feed.push({ min: 120, text: ok ? `⚽ ${p.surname} attı!` : `❌ ${p.surname} kaçırdı!`, cls: ok ? 'goal' : 'bad' });
        } else {
          ok = Math.random() < 0.76;
          const who = mates[(iKick ? k - 1 : k + 0) % mates.length] || 'Arkadaşın';
          m.feed.push({ min: 120, text: ok ? `⚽ ${short(who)} attı` : `❌ ${short(who)} kaçırdı`, cls: ok ? '' : 'bad' });
        }
        if (ok) a++;
        setP(); render(); await wait(1100);
        if (k < 5 && (a > b + (5 - k) || b > a + (4 - k))) break;
        // rakip atış
        const okb = Math.random() < 0.74;
        if (okb) b++;
        m.feed.push({ min: 120, text: okb ? `⚽ ${short(opps[k % opps.length] || 'Rakip')} attı` : `🧤 ${short(opps[k % opps.length] || 'Rakip')} kaçırdı!`, cls: okb ? 'bad' : 'goal' });
        setP(); render(); await wait(1100);
        if (k < 5 && (a > b + (4 - k) || b > a + (4 - k))) break;
        if (k >= 4 && a !== b) break;
      }
      m.res.pens = [a, b];
      m.feed.push({ min: 120, text: a > b ? `Penaltılarda kazandık! (${a}-${b})` : `Penaltılarda kaybettik… (${a}-${b})`, cls: a > b ? 'goal' : 'bad' });
    }
  }
  {
    const r = m.res.myGoals > m.res.oppGoals || (m.res.pens && m.res.pens[0] > m.res.pens[1]) ? 'W' : m.res.myGoals < m.res.oppGoals || m.res.pens ? 'L' : 'D';
    const ft = Spiker.ftParts(r, m.homeG, m.awayG);
    m.feed.push({ min: m.minute, text: `🎙️ ${ft.show}`, cls: 'spk' });
    Voice.sayParts(ft.ids, ft.text);
  }
  Sfx.whistle(true); Sfx.stopCrowd();
  if (m.res.red) plan.onTo = Math.max(plan.onFrom, m.res.redMin);
  E.finishMatch(state, plan, m.res);
  if (m.res.celebs?.length) Soc.onCelebrate(state, m.res.celebs, !!m.res.celebCrisis);
  // p.recent artık engine.finishMatch içinde güncelleniyor
  const recentAvg = p.recent?.length ? p.recent.reduce((a, b) => a + b, 0) / p.recent.length : 0;
  const lidMe = E.leagueOf(state, p.clubId);
  addNews([
    ...(m.res.played && p.career.apps === 1 ? [News.debutNews(state, plan)] : []),
    ...News.matchNews(state, plan, m.res), ...Iv.promiseResult(state, plan, m.res), News.maybeRumor(state, recentAvg), News.cardNews(state, plan, m.res),
    ...(plan.fx.cup ? [News.cupNews(state, plan, m.res)] : plan.fx.comp ? [News.euroNews(state, plan, m.res)] : [...News.weeklyExtras(state, plan, m.res, E.leagueStats(state, lidMe)), News.leagueNews(state), News.leaguePlayerNews(state)]),
  ], false);
  if (m.res.injury) {
    m.feed.push({ min: 90, text: `Maçın sonunda sakatlandın! ${m.res.injury} hafta yoksun.`, cls: 'bad' });
    addNews([News.injuryNews(state, m.res.injury)], false);
  }
  if (p.casinoWeek < -Math.max(2_000_000, p.contract.wage * 10) && Math.random() < 0.5) addNews([News.casinoNews(state)], false);
  ui.iv = Iv.postInterview(state, plan, m.res);
  if (!plan.fx.comp) {
    const L = state.season.leagues[lidMe];
    const rows = E.sortedTable(L.table);
    m.round = { lid: lidMe, week: m.week, matches: (L.fixtures[m.week] || []).filter((x) => x.hg !== null), near: new Set(radio.map((r) => [r.m.h, r.m.a]).flat()), rows, posAfter: rows.findIndex((r) => r.id === p.clubId) + 1 };
  }
  m.done = true;
  persist();
  render();
}

// ---------- olaylar ----------
app.addEventListener('click', async (e) => {
  const el = e.target.closest('[data-go],[data-act]');
  if (!el || el.disabled) return;
  if (el.dataset.go) {
    if (el.dataset.go === 'prematch') ui.plan = null;
    return go(el.dataset.go);
  }
  const act = el.dataset.act;
  switch (act) {
    case 'cupTab': ui.cupTab = el.dataset.tab; ui.cupAll = null; return render();
    case 'cupAll': ui.cupAll = +el.dataset.i; return render();
    case 'continue': return go(state.phase === 'seasonEnd' ? 'seasonEnd' : 'hub');
    case 'playSlot': openSlot(+el.dataset.i); if (!state) return toast('Bu kayıt açılamadı.'); return go(state.phase === 'offers' ? 'offers' : state.phase === 'seasonEnd' ? 'seasonEnd' : state.phase === 'retired' ? 'retired' : 'hub');
    case 'newSlot': Cloud.setActiveSlot(+el.dataset.i); state = null; return go('create');
    case 'delAsk': ui.delConfirm = +el.dataset.i; return render();
    case 'delCancel': ui.delConfirm = null; return render();
    case 'delSlot': Cloud.deleteSlot(+el.dataset.i); if (+el.dataset.i === Cloud.activeSlot()) state = null; ui.delConfirm = null; return toast('Kariyer silindi');
    case 'syncNow': { const r = await Cloud.syncAll(); openSlot(Cloud.activeSlot()); return toast(`Eşitlendi (${r.down} indirildi, ${r.up} gönderildi)`); }
    case 'exportSave': {
      const blob = new Blob([Cloud.exportAll()], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `gol-yildizi-yedek-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      return toast('Yedek dosyası indirildi');
    }
    case 'login':
      try { await Cloud.signIn(); } catch (err) { toast('Giriş başarısız: ' + (err.code || err.message)); }
      return;
    case 'logout': await Cloud.signOut(); return render();
    case 'sound': Sfx.setSound(!Sfx.soundOn()); if (Sfx.soundOn()) Sfx.unlock(); return render();
    case 'music': Music.unlock(); Music.toggle(); return render();
    case 'musicTheme': Music.useTheme(); return render();
    case 'musicCustom': Music.useCustom(); return render();
    case 'musicClear': await Music.clearCustom(); return render();
    case 'accept': {
      const o = state.offers[+el.dataset.i];
      E.acceptOffer(state, o);
      state.news ||= [];
      addNews([News.signingNews(state, o.clubId, null)]);
      persist(); return go('hub');
    }
    case 'drill': {
      const stat = el.dataset.stat;
      if (state.player.injury > 0) return toast('Sakatken antrenman yapamazsın.');
      if (state.player.energy < E.TRAIN_COST) return toast('Yeterli enerjin yok.');
      Drills.run(stat, (score) => {
        const r = E.train(state, stat, Drills.multOf(score));
        persist(); render();
        toast(r.ok ? `${STAT_LABELS[stat]} +${r.gain.toFixed(2)} (×${String(Drills.multOf(score)).replace('.', ',')})` : r.msg);
      });
      return;
    }
    case 'train': {
      const r = E.train(state, el.dataset.stat);
      persist();
      return toast(r.ok ? `${STAT_LABELS[el.dataset.stat]} +${r.gain.toFixed(1)}` : r.msg);
    }
    case 'rest': {
      const r = E.rest(state); persist();
      return toast(r.ok ? 'Dinlendin: +25 enerji' : r.msg);
    }
    case 'skipWeek': E.advanceWeek(state); addNews([News.leagueNews(state), News.leaguePlayerNews(state)], false); persist(); return render();
    case 'tab': ui.tableTab = el.dataset.tab; ui.fxWeek = null; return render();
    case 'tview': ui.tableView = el.dataset.v; return render();
    case 'tableFull': ui.tableFull = !ui.tableFull; return render();
    case 'fxWeek': { const SLx = state.season.leagues[ui.tableTab && LEAGUES[ui.tableTab] ? ui.tableTab : E.leagueOf(state, state.player.clubId)]; ui.fxWeek = Math.max(0, Math.min(SLx.fixtures.length - 1, (ui.fxWeek ?? Math.min(state.season.week, SLx.fixtures.length - 1)) + +el.dataset.d)); return render(); }
    case 'euroTab': ui.euroTab = el.dataset.tab; ui.euroView = null; return render();
    case 'euroView': ui.euroView = el.dataset.v; return render();
    case 'lb': ui.lbField = el.dataset.f; return render();
    case 'shopTab': ui.shopTab = el.dataset.t; return render();
    case 'invTab': ui.invTab = el.dataset.t; return render();
    case 'stkSel': ui.stkSel = ui.stkSel === el.dataset.c ? null : el.dataset.c; return render();
    case 'stkSort': ui.stkSort = el.dataset.v; return render();
    case 'stkBuy': { const r = Stk.buy(state, el.dataset.c, +el.dataset.v); persist(); toast(r.ok ? `${r.n} adet ${el.dataset.c} alındı (${E.money(r.cost)})` : r.msg); return render(); }
    case 'stkSell': { const r = Stk.sell(state, el.dataset.c, +el.dataset.v); persist(); toast(r.ok ? `${r.n} adet satıldı: ${E.money(r.back)} (${r.pl >= 0 ? 'kâr' : 'zarar'} ${E.money(Math.abs(r.pl))})` : r.msg); return render(); }
    case 'invBuy': { const r = Inv.buyProp(state, el.dataset.id); persist(); toast(r.ok ? 'Satın alındı!' : r.msg); return render(); }
    case 'invSell': { const r = Inv.sellProp(state, el.dataset.id); persist(); toast(r.ok ? `Satıldı: ${E.money(r.back)}` : r.msg); return render(); }
    case 'horseBuy': { const r = Inv.buyHorse(state, el.dataset.id); persist(); toast(r.ok ? `${r.h.name} ahırında!` : r.msg); return render(); }
    case 'horseSell': { if (!confirm('Atı satmak istediğine emin misin?')) return; const r = Inv.sellHorse(state, el.dataset.id); persist(); toast(r.ok ? `Satıldı: ${E.money(r.back)}` : 'Satılamadı'); return render(); }
    case 'raceHorse': ui.raceHorse = el.dataset.id; return render();
    case 'raceTac': ui.raceTac = el.dataset.t; return render();
    case 'raceGo': {
      const I = Inv.ensure(state.player);
      const h = I.horses.find((x) => x.id === ui.raceHorse) || I.horses.find((x) => Inv.canRace(state, x).ok);
      if (!h) return toast('Koşabilecek atın yok.');
      const r = Inv.runRace(state, el.dataset.r, h.id, Inv.TACTICS[ui.raceTac] ? ui.raceTac : 'orta');
      if (!r || r.error) return toast(r?.error || 'Koşu başlatılamadı.');
      persist();
      ui.race = r; go('race');
      return animateRace(r);
    }
    case 'raceDone': ui.race = null; ui.invTab = 'yaris'; return go('invest');
    case 'buy': { const r = Life.buy(state, el.dataset.id); persist(); return toast(r.ok ? `${r.item.name} alındı!` : r.msg); }
    case 'sell': { const r = Life.sell(state, el.dataset.id); persist(); return toast(r.ok ? `${r.item.name} satıldı` : r.msg); }
    case 'event': {
      const title = state.event?.title;
      const r = Life.resolveEvent(state, +el.dataset.i);
      ui.evResult = r && (r.result || r.summary) ? { title, result: r.result, summary: r.summary } : null;
      persist(); return render();
    }
    case 'evOk': ui.evResult = null; return render();
    case 'talkCoach': { const r = Life.talkCoach(state); persist(); return toast(r.msg); }
    case 'treatTeam': { const r = Life.treatTeam(state); persist(); return toast(r.msg); }
    case 'callFamily': { const r = Life.callFamily(state); persist(); return toast(r.msg); }
    case 'social': ui.candidates = Life.meetCandidates(); return render();
    case 'meetCancel': ui.candidates = null; return render();
    case 'meet': { Life.startDating(state, ui.candidates[+el.dataset.i]); ui.candidates = null; persist(); return render(); }
    case 'date': case 'gift': { const r = Life.datePartner(state, act); persist(); return toast(r.msg || ''); }
    case 'cpTab': ui.cpTab = ui.cpTab === el.dataset.t ? null : el.dataset.t; return render();
    case 'cpPlan': case 'cpGift': case 'cpTrip': {
      const r = act === 'cpPlan' ? Cp.doPlan(state, el.dataset.id) : act === 'cpGift' ? Cp.doGift(state, el.dataset.id) : Cp.doTrip(state, el.dataset.id);
      if (!r.ok) return toast(r.msg || 'Olmadı.');
      E.addInbox(state, r.msg); ui.cpTab = null; ui.evResult = { title: '💕 ' + (state.player.partner?.name.split(' ')[0] || ''), result: r.msg, img: r.img };
      persist(); return render();
    }
    case 'cpTalk': case 'cpChild': {
      const ev = act === 'cpTalk' ? (Cp.talkReady(state).ok && Cp.talkEvent(state)) : (Cp.childReady(state).ok && Cp.childEvent(state));
      if (!ev) return toast('Şu an olmaz.');
      state.event = ev; persist(); return render();
    }
    case 'pickRing': ui.ring = el.dataset.id; return render();
    case 'pickPlace': ui.place = el.dataset.id; return render();
    case 'proposeGo': {
      const r = Fam.propose(state, ui.ring, ui.place);
      if (!r.ok) return toast(r.msg);
      if (r.yes) addNews([News.proposalNews(state, r.place)]);
      persist(); ui.evResult = { title: r.yes ? '💍 EVET!' : '💔 Hayır…', result: r.msg, summary: r.yes ? 'Nişanlısınız. Düğünü planlayabilirsin.' : 'İlişki −18 · Moral −12. Yüzük yarı fiyatına satıldı.' };
      return go(r.yes ? 'wedding' : 'hub');
    }
    case 'wed': { const r = Fam.wed(state, el.dataset.id); if (!r.ok) return toast(r.msg); addNews([News.weddingNews(state, r.wedding)]); persist(); toast(r.msg); return go('life'); }
    case 'cancelEngage': Fam.cancelEngagement(state); persist(); return go('life');
    case 'divorceAsk': ui.divorceAsk = true; return render();
    case 'divorceNo': ui.divorceAsk = false; return render();
    case 'divorce': { ui.divorceAsk = false; Fam.divorce(state, 'senin isteğinle'); persist(); return render(); }
    case 'kidsTime': { const r = Life.kidsTime(state); persist(); return toast(r.msg || ''); }
    case 'breakup': Life.breakUp(state); persist(); return render();
    case 'socLike': case 'socCmt': case 'socTag': case 'socTab': case 'socPost': case 'socReply': case 'socDm': case 'socProf': case 'socProfClose': case 'socStory': case 'socStoryClose':
    case 'socStoryPost': case 'socLive': case 'socLiveAns': case 'socLiveEnd': case 'socVote': SUI.handle(act, el); return;
    case 'casinoTab': ui.casinoTab = el.dataset.t; return render();
    case 'slot': case 'barbut': case 'barbutRoll': case 'rBet': case 'rUndo': case 'rClear': case 'rRepeat': case 'rSpin': case 'bjDeal': case 'bjHit': case 'bjStand': case 'bjDouble':
    case 'kPrice': case 'kBuy': case 'kAll': case 'pkSit': case 'pkRebuy': case 'pkMove': case 'pkNext': case 'pkLeave':
      Sfx.unlock(); CUI.handle(act, el); return;
    case 'stake': ui.stake = +el.dataset.v; return render();
    case 'currency': E.setCurrency(el.dataset.c); toast(el.dataset.c === 'EUR' ? 'Tutarlar artık euro' : 'Tutarlar artık TL'); return render();
    case 'betView': ui.betView = el.dataset.v; return render();
    case 'betLg': ui.betLg = el.dataset.v; return render();
    case 'betOpen': ui.betOpen = ui.betOpen === el.dataset.key ? null : el.dataset.key; return render();
    case 'pickOdd': { const m = Bet.bulletin(state).find((x) => x.key === el.dataset.key); if (m) Bet.toggleSlip(ui.slip ||= [], m, el.dataset.mk, el.dataset.pick); return render(); }
    case 'slipDel': ui.slip.splice(+el.dataset.i, 1); return render();
    case 'slipClear': ui.slip = []; return render();
    case 'betMode': ui.betMode = el.dataset.v; return render();
    case 'betPlace': {
      const mode = ui.slip.length < 2 ? 'tekli' : ui.betMode;
      const r = Bet.place(state, ui.slip, ui.stake, mode);
      if (!r.ok) return toast(r.msg);
      ui.slip = []; persist(); toast(`Kupon yatırıldı (${E.money(r.total)})`); return render();
    }
    case 'kickoff': Sfx.unlock(); ui.iv = null; return runMatch();
    case 'ivAns': {
      const iv = ui.iv; if (!iv || iv.chosen) return;
      const i = +el.dataset.i;
      if (i < 0) {
        const r = Iv.refuse(state, iv);
        iv.chosen = { text: 'Konuşmak istemiyorum.' }; iv.summary = r.summary; iv.react = r.react;
        addNews(r.news, false); persist(); return render();
      }
      const a = iv.answers[i];
      const r = Iv.applyAnswer(state, iv, a);
      iv.chosen = a; iv.summary = r.summary; iv.react = r.react;
      if (iv.when === 'pre') {
        if (a.promise) ui.plan.promise = true;
        if (a.target === 'opp') {
          // kışkırtılan rakip daha hırslı oynar
          ui.plan.provoke = true;
          for (const ev of ui.plan.events) if (ev.type === 'moment') ev.keeper = Math.min(95, ev.keeper + 3);
          if (Math.random() < 0.3) ui.plan.events.push({ min: E.randInt(20, 88), type: 'oppGoal', scorer: E.pick(team(ui.plan.fx.opp).squad).name }), ui.plan.events.sort((x, y) => x.min - y.min);
        }
      }
      addNews(r.news, iv.when === 'pre' ? false : false);
      persist();
      return render();
    }
    case 'openNews': ui.popup = [state.news[+el.dataset.i]]; return render();
    case 'npNext': ui.popup.shift(); return render();
    case 'fast': ui.match.fast = !ui.match.fast; localStorage.setItem('golyildizi.fast', ui.match.fast ? '1' : '0'); if (ui.match.fast) Voice.stop(); return render();
    case 'campPick': Career.campPick(state, el.dataset.k, el.dataset.id); persist(); return render();
    case 'natPlay': Career.playNat(state); persist(); return render();
    case 'natClose': Career.closeNat(state); persist(); return render();
    case 'tournNext': Career.nextTournamentGame(state); persist(); return render();
    case 'rehab': { const r = Career.rehab(state, el.dataset.id); if (r.ok) persist(); return toast(r.msg); }
    case 'voice': Voice.setOn(!Voice.isOn()); if (Voice.isOn()) Voice.say('Sesli anlatım açık', 'spiker'); return render();
    case 'choice': if (ui.match?.choice) ui.match.choice.pick(el.dataset.v); return render();
    case 'afterMatch':
      Voice.stop();
      ui.match = null; ui.plan = null; ui.iv = null;
      ui.popup.push(...ui.pending); ui.pending = [];
      return go(state.phase === 'seasonEnd' ? 'seasonEnd' : 'hub');
    case 'retire': {
      if (!confirm('Futbolu bırakmak istediğine emin misin?')) return;
      const sum = Aw.retire(state);
      addNews([News.retireNews(state, sum)], false);
      ui.summary = null; persist(); return go('retired');
    }
    case 'newSonKid': {
      const sum = (state.legacy || []).slice(-1)[0];
      const c = sum?.children?.[+el.dataset.i];
      if (!c) return;
      Aw.newSon(state, c.name, c);
      persist(); return go('offers');
    }
    case 'newSon': {
      const name = (document.getElementById('sonName')?.value || '').trim();
      if (!name) return toast('Oğlunun adını yaz');
      Aw.newSon(state, name);
      persist(); return go('offers');
    }
    case 'negotiate': {
      const src = el.dataset.src;
      const p = state.player;
      let offer, kind;
      if (src === 'start') { offer = state.offers[+el.dataset.i]; kind = 'start'; }
      else if (src === 'season') { offer = ui.seasonOffers[+el.dataset.i]; kind = 'transfer'; }
      else if (src === 'winter') { offer = state.winter.offers[+el.dataset.i]; kind = 'transfer'; }
      else { offer = { clubId: Winter.parentClub(state), wage: Math.round(p.contract.wage * 1.15 / 500) * 500, years: 2 }; kind = 'renew'; }
      ui.neg = K.openNegotiation(state, offer, kind); ui.neg.src = src; ui.neg.idx = +el.dataset.i;
      return go('negotiate');
    }
    case 'negStep': {
      const n = ui.neg, k = el.dataset.k, dir = +el.dataset.d;
      if (k === 'play') { n.demand.play = Math.min(2, Math.max(0, (n.demand.play || 0) + dir)); return render(); }
      const step = { champ: Math.max(10000, Math.round((n.offer.champ || 0) * 0.1 / 10000) * 10000), wage: Math.max(5000, Math.round(n.offer.wage * 0.05 / 5000) * 5000), sign: Math.max(10000, Math.round(n.offer.sign * 0.1 / 10000) * 10000), goal: Math.max(1000, Math.round(n.offer.goal * 0.1 / 1000) * 1000), release: Math.max(100000, Math.round(n.offer.release * 0.1 / 100000) * 100000), years: 1 }[k];
      n.demand[k] = k === 'years' ? Math.min(5, Math.max(1, n.demand.years + dir)) : Math.max(step, n.demand[k] + dir * step);
      return render();
    }
    case 'winterNo': Winter.dismiss(state, +el.dataset.i); persist(); return render();
    case 'winterLoan': {
      const r = Winter.acceptLoan(state, +el.dataset.i, E.acceptOffer);
      addNews([News.loanNews(state, r.to, r.from)]);
      persist(); return go('hub');
    }
    case 'winterSign': {
      const r = Winter.acceptTransfer(state, +el.dataset.i, E.acceptOffer);
      state.player.winterFrom = r.old;
      addNews([News.signingNews(state, r.to, r.old)]);
      persist(); return go('hub');
    }
    case 'negBluff': K.bluff(state, ui.neg); return render();
    case 'raise': {
      const r = K.raiseAvailable(state);
      if (!r.ok) return toast(r.why || 'Şu an zam isteyemezsin.');
      ui.neg = K.openRaise(state); ui.neg.src = 'raise'; persist();
      return go('negotiate');
    }
    case 'negSubmit': K.submitDemand(ui.neg); return render();
    case 'negAccept': K.acceptCurrent(ui.neg); ui.neg.log.push({ who: 'agent', text: 'Teklifi kabul ettik. Hayırlı olsun!' }); return render();
    case 'negBack': {
      const src = ui.neg?.src, walked = ui.neg?.status === 'walked', idx = ui.neg?.idx; ui.neg = null;
      if (src === 'winter') { if (walked && state.winter?.offers[idx]) { Winter.dismiss(state, idx); persist(); } return go('hub'); }
      if (src === 'raise') { if (walked) { state.player.morale = Math.max(0, state.player.morale - 4); if (state.player.rel) state.player.rel.coach = Math.max(0, state.player.rel.coach - 3); persist(); } return go('profile'); }
      return go(src === 'start' ? 'offers' : 'seasonEnd');
    }
    case 'negSign': {
      const n = ui.neg, p = state.player, old = p.clubId;
      if (n.src === 'winter') {
        const r = Winter.acceptTransfer(state, n.idx, E.acceptOffer, { clubId: n.clubId, wage: n.offer.wage, years: n.offer.years });
        const k = K.signContract(state, n);
        p.winterFrom = r.old;
        addNews([News.signingNews(state, n.clubId, r.old)]);
        E.addInbox(state, `Cengiz Demirel komisyonunu aldı: ${E.money(k.commission)}.`);
        ui.neg = null; persist(); return go('hub');
      }
      if (n.src === 'raise') {
        const r = K.signContract(state, n);
        E.addInbox(state, `${team(p.clubId).name} ile yeni sözleşme: ${E.money(n.offer.wage)}/hafta, ${n.offer.years} yıl. Cengiz'in komisyonu: ${E.money(r.commission)}.`);
        p.morale = Math.min(100, p.morale + 6);
        ui.neg = null; persist(); return go('profile');
      }
      if (n.src === 'start') {
        E.acceptOffer(state, { clubId: n.clubId, wage: n.offer.wage, years: n.offer.years });
        const r = K.signContract(state, n);
        addNews([News.signingNews(state, n.clubId, null)]);
        E.addInbox(state, `Cengiz Demirel komisyonunu aldı: ${E.money(r.commission)}.`);
      } else if (n.src === 'season') {
        E.endSeason(state);
        E.acceptOffer(state, { clubId: n.clubId, wage: n.offer.wage, years: n.offer.years });
        const r = K.signContract(state, n);
        addNews([News.signingNews(state, n.clubId, old)]);
        E.addInbox(state, `Cengiz Demirel komisyonunu aldı: ${E.money(r.commission)}.`);
        ui.summary = null;
      } else {
        const r = K.signContract(state, n);
        p.contract.endsYear += 1;
        E.addInbox(state, `${team(p.clubId).name} ile sözleşmeni ${n.offer.years} yıl uzattın. Cengiz'in komisyonu: ${E.money(r.commission)}.`);
        E.endSeason(state);
        ui.summary = null;
      }
      ui.neg = null; persist(); return go('hub');
    }
    case 'seasonAccept': {
      const o = ui.seasonOffers[+el.dataset.i];
      const old = state.player.clubId;
      E.endSeason(state);
      E.acceptOffer(state, o);
      addNews([News.signingNews(state, o.clubId, old)]);
      ui.summary = null; persist(); return go('hub');
    }
    case 'stay': {
      const p = state.player;
      if (E.contractExpiring(state)) p.contract = { wage: Math.round(p.contract.wage * 1.15 / 500) * 500, endsYear: state.season.year + 3 };
      E.endSeason(state);
      ui.summary = null; persist(); return go('hub');
    }
  }
});

function readLook(form) {
  const f = new FormData(form);
  return { skin: +(f.get('skin') ?? 1), hair: f.get('hair') || 'kisa', hairColor: f.get('hairColor') || 'siyah' };
}
app.addEventListener('input', (e) => { if (e.target.id === 'musicVol') Music.setVolume(e.target.value / 100); });
document.addEventListener('pointerdown', () => Music.unlock(), { capture: true });
app.addEventListener('change', async (e) => {
  if (e.target.id === 'musicFile' && e.target.files?.[0]) {
    const f = e.target.files[0];
    if (f.size > 25 * 1024 * 1024) return toast('Dosya çok büyük (en fazla 25 MB).');
    try { await Music.setCustom(f); toast('Menü müziği ayarlandı 🎵'); } catch { toast('Müzik kaydedilemedi.'); }
    return render();
  }
  if (e.target.id === 'importFile' && e.target.files?.[0]) {
    try {
      const n = Cloud.importAll(await e.target.files[0].text());
      openSlot(Cloud.activeSlot());
      toast(`${n} kariyer geri yüklendi`);
    } catch (err) { toast(err.message || 'Dosya okunamadı'); }
    return;
  }
  const form = e.target.closest('#createForm');
  if (form) document.getElementById('lookPreview').innerHTML = Look.portraitSvg(readLook(form), ['#16a34a', '#ffffff'], 110);
});

app.addEventListener('submit', (e) => {
  if (e.target.id !== 'createForm') return;
  e.preventDefault();
  const f = new FormData(e.target);
  state = E.newGame({ name: f.get('name').trim(), surname: f.get('surname').trim(), foot: f.get('foot'), nation: f.get('nation'), look: readLook(e.target) });
  state.news = [];
  persist();
  go('offers');
});

// yatay şerit kimliği: ekran + sınıf + aynı sınıftan kaçıncı olduğu
let lastScreen = null;
function hKey(el) { const c = el.className || el.tagName; const same = [...app.querySelectorAll(el.tagName)].filter((x) => x.className === el.className); return `${screen}|${c}|${same.indexOf(el)}`; }
function render() {
  // aile olaylarından gelen haberler (bebek, boşanma)
  if (state?.newsQueue?.length && screen !== 'match') {
    const q = state.newsQueue.splice(0);
    addNews(q.map((n) => n.kind === 'baby' ? News.babyNews(state, n.name, n.gender) : n.kind === 'divorce' ? News.divorceNews(state, n.name, n.share) : null));
  }
  const html = (screens[screen] || screens.start)();
  document.body.classList.toggle('menu-bg', screen === 'start');
  // maç sırasında canvas'ı yeniden oluşturma
  if (screen === 'match' && ui.match?.inMoment && document.getElementById('momentHost')?.firstChild) return;
  const pop = ui.popup.length && screen !== 'match' ? `
    <div class="np-overlay"><div class="np-wrap">${News.clippingHtml(ui.popup[0])}</div>
      <button class="btn big" data-act="npNext">${ui.popup.length > 1 ? `Sonraki haber (${ui.popup.length - 1})` : 'Kapat'}</button></div>` : '';
  // yatay kayan şeritler (sekmeler, lig seçici, bahis miktarları) yeniden çizilince başa sarmasın
  const hs = {};
  app.querySelectorAll('*').forEach((el, i) => { if (el.scrollLeft > 0) hs[hKey(el)] = el.scrollLeft; });
  app.innerHTML = html + pop + (ui.toast ? `<div class="toast">${esc(ui.toast)}</div>` : '');
  if (lastScreen === screen && Object.keys(hs).length) {
    app.querySelectorAll('*').forEach((el) => { if (el.scrollWidth <= el.clientWidth) return; const k = hKey(el); if (hs[k] == null) return; el.scrollLeft = hs[k]; });
  }
  if (lastScreen !== screen) {
    // yeni ekranda seçili sekme görünür olsun
    requestAnimationFrame(() => app.querySelectorAll('.chips .on, .lgpick .on, .ctpick .on, .tabs .on, .ctabs .on, .stakes .on').forEach((el) => { const box = el.parentElement; if (box.scrollWidth > box.clientWidth) box.scrollLeft = Math.max(0, el.offsetLeft - box.clientWidth / 2 + el.offsetWidth / 2); }));
  }
  lastScreen = screen;
  if (screen === 'casino') CUI.afterRender(ui.casinoTab);
  Music.onScreen(screen);
  // maç bitince röportaj ve sonuçlar en altta: otomatik aşağı kaydır
  if (screen === 'match' && ui.match?.done) {
    const first = !ui.match.scrolledEnd;
    ui.match.scrolledEnd = true;
    // sadece ilk seferde: Maç sonu + haftanın sonuçları ekranın tepesine gelsin
    if (first) requestAnimationFrame(() => { const el = document.getElementById('matchEnd'); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - (document.querySelector('.scoreboard')?.offsetHeight || 0) - 10, behavior: 'smooth' }); });
  }
}

// ---------- başlat ----------
(async function boot() {
  render();
  await Cloud.initCloud();
  Cloud.onUser(async (u) => {
    if (u) {
      try {
        const r = await Cloud.syncAll();
        if (r.down) { openSlot(Cloud.activeSlot()); toast(`Buluttan ${r.down} kariyer geri yüklendi`); }
      } catch (e) { console.warn(e); }
    }
    if (screen === 'start' || screen === 'settings') render();
  });
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
