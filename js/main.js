import * as E from './engine.js';
import { STAT_LABELS, LEAGUES, clubInfo, isDerby } from './data.js';
import { playMoment, OUTCOME_TEXT } from './moment.js';
import * as Cloud from './cloud.js';
import * as News from './news.js';
import * as Sfx from './audio.js';
import * as Look from './look.js';
import * as Iv from './interview.js';
import * as Life from './life.js';
import * as Spiker from './commentary.js';

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
      <p class="muted pad">${isStart ? 'Menajerin üç kulüpten deneme sözleşmesi buldu. Birini seç:' : ''}</p>
      ${state.offers.map((o, i) => {
        const t = team(o.clubId);
        return `<div class="card offer">
          ${badge(t, 48)}
          <div class="grow"><b>${esc(t.name)}</b><div class="muted small">${LEAGUES[E.leagueOf(state, t.id)].name} · Güç ${t.str}</div>
          <div class="muted small">${esc(clubInfo(t.id).sehir || '')}${clubInfo(t.id).teknik_direktor ? ' · Hoca: ' + esc(clubInfo(t.id).teknik_direktor) : ''}</div>
          <div class="small">${E.money(o.wage)}/hafta · ${o.years} yıl</div></div>
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
    return `
      <header class="hero" style="--c1:${t.c1};--c2:${t.c2}">
        ${badge(t, 54)}
        <div class="grow">
          <div class="pname">${esc(p.name)} ${esc(p.surname)}</div>
          <div class="small">${esc(t.name)} · ${p.age} yaş · FV</div>
        </div>
        <div class="ovr"><b>${E.overall(p)}</b><span>GÜÇ</span></div>
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
      ${p.injury > 0 ? `<div class="card injury"><b>🩹 Sakatsın</b> · ${p.injury} hafta daha yoksun. Antrenman yapamazsın, ama dinlenebilirsin.</div>` : ''}
      ${state.event ? `<div class="card event"><b>${esc(state.event.title)}</b><p>${esc(state.event.text)}</p>
        <div class="evbtns">${state.event.options.map((o, i) => `<button class="btn ${i ? 'ghost' : ''}" data-act="event" data-i="${i}">${esc(o.label)}</button>`).join('')}</div></div>` : ''}
      ${state.phase === 'seasonEnd' ? `
        <div class="card next"><b>Sezon bitti!</b><p class="muted small">Sezon özetini ve teklifleri gör.</p>
        <button class="btn big" data-go="seasonEnd">Sezon sonu</button></div>` :
      fx ? `
        <div class="card next">
          <div class="muted small">Hafta ${state.season.week + 1} · ${LEAGUES[lid].name}</div>
          <div class="vs">${badge(team(fx.h), 36)}<b>${esc(team(fx.h).short)}</b><span>vs</span><b>${esc(team(fx.a).short)}</b>${badge(team(fx.a), 36)}</div>
          ${isDerby(fx.h, fx.a) ? '<div class="derby">🔥 DERBİ</div>' : ''}
          <div class="muted small">🏟️ ${esc(clubInfo(fx.h).stadyum || (fx.home ? 'İç saha' : 'Deplasman'))}</div>
          <div class="muted small">${fx.home ? 'İç saha' : 'Deplasman'} · Rakip gücü ${team(fx.opp).str} · Hoca kararı: <b>${roleText}</b></div>
          <button class="btn big" data-go="prematch">Maça çık</button>
        </div>` : `
        <div class="card next"><b>Bu hafta maçın yok</b><p class="muted small">Ligin bitti, diğer lig devam ediyor.</p>
        <button class="btn big" data-act="skipWeek">Haftayı geç</button></div>`}
      <div class="grid">
        <button class="tile" data-go="train">🏋️<span>Antrenman</span></button>
        <button class="tile" data-act="rest" ${p.rested ? 'disabled' : ''}>😴<span>Dinlen</span></button>
        <button class="tile" data-go="shop">🛍️<span>Mağaza</span></button>
        <button class="tile" data-go="life">❤️<span>İlişkiler</span></button>
        <button class="tile" data-go="casino">🎰<span>Gazino</span></button>
        <button class="tile" data-go="table">📊<span>Puan durumu</span></button>
        <button class="tile" data-go="profile">👤<span>Profil</span></button>
        <button class="tile" data-go="news">📰<span>Gazete</span></button>
        ${Cloud.SHOW_LEADERBOARD ? '<button class="tile" data-go="leaderboard">🏆<span>Arkadaşlar</span></button>' : ''}
        <button class="tile" data-go="settings">⚙️<span>Ayarlar</span></button>
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
      <p class="muted small">Her antrenman ${E.TRAIN_COST} enerji harcar. Enerji her hafta +${E.WEEKLY_ENERGY} dolar. Genç yaşta daha hızlı gelişirsin.</p></div>
      ${E.STAT_KEYS.map((k) => `
        <div class="card statline">
          <div class="grow"><div class="row"><b>${STAT_LABELS[k]}</b><b>${Math.floor(p.stats[k])}</b></div>${bar(p.stats[k])}</div>
          <button class="btn" data-act="train" data-stat="${k}" ${p.energy < E.TRAIN_COST ? 'disabled' : ''}>Çalış</button>
        </div>`).join('')}
      <p class="muted small pad">Şut: güç ve isabet · Teknik: falso ve isabet · Hız: defans baskısına karşı süre · Pas: asist şansı · Güç: genel güç</p>`;
  },

  table() {
    const myL = E.leagueOf(state, state.player.clubId);
    const lid = ui.tableTab || myL;
    const rows = E.sortedTable(state.season.leagues[lid].table);
    const L = LEAGUES[lid];
    return `
      <header class="top"><button class="back" data-go="hub">‹</button><h2>Puan durumu</h2></header>
      <div class="tabs">${Object.keys(LEAGUES).map((id) => `<button class="${id === lid ? 'on' : ''}" data-act="tab" data-tab="${id}">${LEAGUES[id].name.replace('Trendyol ', '')}</button>`).join('')}</div>
      <table class="tbl">
        <tr><th>#</th><th class="l">Takım</th><th>O</th><th>Av</th><th>P</th></tr>
        ${rows.map((r, i) => {
          const zone = (L.promote && i < L.promote) ? 'up' : (L.relegate && i >= rows.length - L.relegate) ? 'down' : '';
          return `<tr class="${r.id === state.player.clubId ? 'me' : ''} ${zone}"><td>${i + 1}</td><td class="l">${badge(team(r.id), 20)} ${esc(team(r.id).name)}</td><td>${r.p}</td><td>${r.gd > 0 ? '+' : ''}${r.gd}</td><td><b>${r.pts}</b></td></tr>`;
        }).join('')}
      </table>`;
  },

  profile() {
    const p = state.player;
    const s = p.season;
    const avg = s.apps ? (s.ratingSum / s.apps).toFixed(1) : '-';
    return `
      <header class="top"><button class="back" data-go="hub">‹</button><h2>Profil</h2></header>
      <div class="card profilehead">
        ${Look.portraitSvg(Look.lookOf(p), [team(p.clubId).c1, team(p.clubId).c2], 96)}
        <div class="grow">
          <b class="pname">${esc(p.name)} ${esc(p.surname)}</b>
          <div class="muted small">${p.age} yaş · ${esc(p.nation)} · ${esc(p.foot)} ayak · FV</div>
          <div class="row small mt"><span>Taraftar sevgisi</span><b>${Math.round(p.fans ?? 50)}</b></div>${bar(p.fans ?? 50, 100, 'orange')}
        </div>
      </div>
      <div class="card">
        <div class="row"><span>Sözleşme</span><span>${E.money(p.contract.wage)}/hafta · ${p.contract.endsYear} yazına kadar</span></div>
        <div class="row"><span>Ün</span><span>${Math.round(p.fame)}/100</span></div>
      </div>
      <div class="card">${E.STAT_KEYS.map((k) => `<div class="row"><span>${STAT_LABELS[k]}</span><b>${Math.floor(p.stats[k])}</b></div>${bar(p.stats[k])}`).join('')}</div>
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
    const list = ui.shopTab === 'car' ? Life.CARS : Life.HOUSES;
    return `
      <header class="top"><button class="back" data-go="hub">‹</button><h2>Mağaza</h2><span class="grow"></span><b class="money">${E.money(p.money)}</b></header>
      <div class="tabs"><button class="${ui.shopTab === 'car' ? 'on' : ''}" data-act="shopTab" data-t="car">🚗 Arabalar</button><button class="${ui.shopTab === 'house' ? 'on' : ''}" data-act="shopTab" data-t="house">🏠 Evler</button></div>
      <p class="muted small pad">${ui.shopTab === 'car' ? 'Araba ün kazandırır ve her hafta moralini yükseltir.' : 'Ev her hafta ekstra enerji verir (en iyi evin geçerli).'} Satarken fiyatın %60'ını geri alırsın.</p>
      ${list.map((it) => {
        const own = p.owned.includes(it.id);
        return `<div class="card shopitem ${own ? 'own' : ''}">
          <div class="shop-img"><span>${it.emoji}</span>${Life.SHOP_IMAGES.has(it.id) ? `<img src="img/shop/${it.id}.jpg" alt="">` : ''}</div>
          <div class="grow"><b>${esc(it.name)}</b><div class="muted small">${esc(it.desc)}</div>
            <div class="small">${it.fame ? `Ün +${it.fame} · Moral +${it.morale}/hafta` : `Enerji +${it.energy}/hafta`}</div>
            <div class="price">${E.money(it.price)}</div></div>
          ${own ? `<div class="ownbox">✓ Sende<button class="btn ghost sm" data-act="sell" data-id="${it.id}">Sat ${E.money(it.price * Life.SELL_RATE)}</button></div>`
                : `<button class="btn" data-act="buy" data-id="${it.id}" ${p.money < it.price ? 'disabled' : ''}>Al</button>`}
        </div>`;
      }).join('')}`;
  },

  life() {
    const p = state.player;
    const relRow = (k, btn) => `<div class="card relrow"><div class="row"><b>${Life.REL_LABEL[k]}</b><b>${Math.round(p.rel[k])}</b></div>${bar(p.rel[k], 100, k === 'family' ? 'orange' : k === 'team' ? 'blue' : '')}
      <div class="muted small">${{ coach: 'Yüksekse ilk 11 şansın artar.', team: 'Yüksekse pozisyonlarda daha çok arkadaşın olur, pasların gole döner.', family: 'Yüksekse moralin her hafta artar.' }[k]}</div>${btn}</div>`;
    const partner = p.partner;
    let love;
    if (p.age < 18) love = `<p class="muted">Özel hayat 18 yaşında açılır. Şimdilik futbola odaklan!</p>`;
    else if (!partner) {
      love = ui.candidates
        ? ui.candidates.map((c, i) => `<div class="cand"><span class="avatar">${esc(c.name[0])}</span><div class="grow"><b>${esc(c.name)}</b><div class="muted small">${esc(c.job)}</div></div><button class="btn sm" data-act="meet" data-i="${i}">Tanış</button></div>`).join('') +
          `<button class="btn ghost" data-act="meetCancel">Vazgeç</button>`
        : `<p class="muted small">Şu an yalnızsın.</p><button class="btn" data-act="social">Sosyal hayata çık 🍸</button>`;
    } else {
      love = `<div class="cand"><span class="avatar love">${esc(partner.name[0])}</span><div class="grow"><b>${esc(partner.name)}</b><div class="muted small">${esc(partner.job)} · ${partner.married ? 'Eşin 💍' : 'Sevgilin'} · ${partner.weeks} hafta</div></div><b>${Math.round(partner.value)}</b></div>
        ${bar(partner.value, 100, 'pink')}
        <div class="evbtns mt">
          <button class="btn" data-act="date">Buluş (${E.money(Life.dateCost(p))})</button>
          <button class="btn ghost" data-act="gift">Hediye al (${E.money(Life.giftCost(p))})</button>
          ${Life.canPropose(p) ? `<button class="btn" data-act="propose">💍 Evlenme teklif et (${E.money(Life.weddingCost(p))})</button>` : ''}
          ${!partner.married ? `<button class="btn ghost" data-act="breakup">Ayrıl</button>` : ''}
        </div>
        ${!partner.married && !Life.canPropose(p) ? '<p class="muted small">Evlilik için ilişki 80+ ve en az 16 hafta birlikte olmalısınız.</p>' : ''}`;
    }
    const car = Life.CARS.filter((x) => p.owned.includes(x.id)).pop(), house = Life.HOUSES.filter((x) => p.owned.includes(x.id)).pop();
    return `
      <header class="top"><button class="back" data-go="hub">‹</button><h2>İlişkiler</h2></header>
      ${relRow('coach', `<button class="btn ghost sm" data-act="talkCoach" ${p.weekFlags.coach ? 'disabled' : ''}>Hocayla konuş</button>`)}
      ${relRow('team', `<button class="btn ghost sm" data-act="treatTeam" ${p.weekFlags.team ? 'disabled' : ''}>Takıma yemek ısmarla (${E.money(Life.teamCost(p))})</button>`)}
      ${relRow('family', `<button class="btn ghost sm" data-act="callFamily" ${p.weekFlags.family ? 'disabled' : ''}>Aileni ara</button>`)}
      <div class="card"><h3>❤️ Özel hayat</h3>${love}</div>
      <div class="card small"><div class="row"><span>Araban</span><b>${car ? esc(car.name) : '—'}</b></div><div class="row"><span>Evin</span><b>${house ? esc(house.name) : 'Kulüp lojmanı'}</b></div></div>`;
  },

  casino() {
    const p = state.player;
    const t = ui.casinoTab;
    const stakes = [10_000, 50_000, 250_000, 1_000_000, 5_000_000, 25_000_000].filter((x) => x <= Math.max(10_000, p.money));
    if (ui.stake > p.money) ui.stake = stakes.filter((x) => x <= p.money).pop() || 10_000;
    const stakeBar = `<div class="stakes">${stakes.map((x) => `<button class="${x === ui.stake ? 'on' : ''}" data-act="stake" data-v="${x}">${E.money(x).replace('₺', '')}</button>`).join('')}</div>`;
    let body = '';
    if (t === 'bahis') {
      const list = Life.bettable(state);
      const mine = p.bets.filter((b) => b.week === state.season.week && b.year === state.season.year);
      body = `<p class="muted small pad">Bu haftanın diğer maçları. Kendi maçına bahis yok! Kupon hafta sonunda sonuçlanır.</p>${stakeBar}
        ${list.map((m, i) => { const b = mine.find((x) => x.h === m.h && x.a === m.a); return `<div class="card betrow">
          <div class="small"><b>${esc(team(m.h).short)}</b> - <b>${esc(team(m.a).short)}</b> <span class="muted">${m.lid === 'SL' ? 'SL' : '1.L'}</span></div>
          <div class="odds">${['1', 'X', '2'].map((k) => `<button class="${b?.pick === k ? 'on' : ''}" data-act="bet" data-i="${i}" data-pick="${k}" ${b ? 'disabled' : ''}>${k}<small>${m.odds[k].toFixed(2)}</small></button>`).join('')}</div>
          ${b ? `<div class="muted small">${E.money(b.stake)} oynadın · olası kazanç ${E.money(b.stake * b.odd)}</div>` : ''}
        </div>`; }).join('') || '<p class="muted pad">Bu hafta oynanacak maç yok.</p>'}`;
    } else if (t === 'rulet') {
      const r = ui.roulette;
      body = `${stakeBar}<div class="card center">
        <div class="wheel ${r ? 'c-' + Life.rouletteColor(r.n) : ''}">${r ? r.n : '?'}</div>
        ${r ? `<p class="${r.win > 0 ? 'win' : 'lose'}">${r.win > 0 ? `Kazandın! +${E.money(r.win)}` : 'Kaybettin'}</p>` : '<p class="muted small">Bahsini seç ve çevir</p>'}
        <div class="evbtns"><button class="btn red" data-act="spin" data-t="red">Kırmızı ×2</button><button class="btn blackbtn" data-act="spin" data-t="black">Siyah ×2</button>
        <button class="btn ghost" data-act="spin" data-t="odd">Tek ×2</button><button class="btn ghost" data-act="spin" data-t="even">Çift ×2</button></div>
        <div class="row mt"><input id="rnum" type="number" min="0" max="36" value="${ui.rnum ?? 7}" class="numin"><button class="btn" data-act="spin" data-t="num">Sayıya oyna ×36</button></div>
      </div>`;
    } else if (t === 'blackjack') {
      const g = ui.bj;
      const cards = (h, hide) => h.map((c, i) => hide && i === 1 ? '<span class="pcard back">?</span>' : `<span class="pcard ${'♥♦'.includes(c.s) ? 'redc' : ''}">${c.r}${c.s}</span>`).join('');
      body = `${stakeBar}<div class="card center bj">
        ${g ? `<div class="muted small">Krupiye ${g.done ? Life.handValue(g.dealer) : ''}</div><div class="hand">${cards(g.dealer, !g.done)}</div>
          <div class="muted small mt">Sen ${Life.handValue(g.player)}</div><div class="hand">${cards(g.player)}</div>
          ${g.msg ? `<p class="${g.win > 0 ? 'win' : g.win === 0 ? '' : 'lose'}">${esc(g.msg)}</p>` : ''}` : '<p class="muted">21\'e en yakın olan kazanır. Blackjack 3:2 öder.</p>'}
        <div class="evbtns mt">${!g || g.done ? `<button class="btn" data-act="bjDeal">Dağıt (${E.money(ui.stake)})</button>` : `<button class="btn" data-act="bjHit">Kart çek</button><button class="btn ghost" data-act="bjStand">Dur</button>`}</div>
      </div>`;
    } else {
      const s = ui.slot;
      body = `${stakeBar}<div class="card center">
        <div class="reels">${(s?.reels || ['❔', '❔', '❔']).map((x) => `<span>${x}</span>`).join('')}</div>
        ${s ? `<p class="${s.mult > 0 ? 'win' : 'lose'}">${s.mult > 0 ? `×${s.mult} · +${E.money(ui.stake * s.mult)}` : 'Olmadı'}</p>` : ''}
        <button class="btn big" data-act="slot">Çevir (${E.money(ui.stake)})</button>
        <p class="muted small">3 aynı: ⚽×5 🍒×8 🍋×10 ⭐×20 🔔×30 7️⃣×100 · 2 aynı: ×1,5</p>
      </div>`;
    }
    return `
      <header class="top"><button class="back" data-go="hub">‹</button><h2>Gazino</h2><span class="grow"></span><b class="money">${E.money(p.money)}</b></header>
      <div class="tabs">${[['bahis', '🎟️ Bahis'], ['rulet', '🎡 Rulet'], ['blackjack', '🃏 21'], ['slot', '🎰 Slot']].map(([k, l]) => `<button class="${t === k ? 'on' : ''}" data-act="casinoTab" data-t="${k}">${l}</button>`).join('')}</div>
      ${body}
      <p class="muted small pad">Tüm oyunlar oyun içi parayla. Çok kaybedersen gazeteler duyar…</p>`;
  },

  prematch() {
    if (!ui.plan) { ui.plan = E.planMatch(state); ui.iv = Iv.preInterview(state, ui.plan); }
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
        <div class="sb-score">${m.homeG} - ${m.awayG}<small>${m.minute}'</small></div>
        <div class="sb-team">${esc(team(m.plan.fx.a).short)}</div>
      </div>
      <div id="momentHost" class="moment-host ${m.inMoment ? 'on' : ''}"></div>
      ${m.inMoment ? '' : `
        ${m.choice ? `<div class="card choice"><b>${esc(m.choice.title)}</b><div class="evbtns">${m.choice.options.map((c, i) => `<button class="btn ${i ? 'ghost' : ''}" data-act="choice" data-v="${c.v}">${esc(c.label)}</button>`).join('')}</div><div class="cbar"></div></div>` : ''}
        <div class="feed">${m.feed.slice().reverse().map((f) => `<p class="${f.cls || ''}"><b>${f.min}'</b> ${['spk', 'hl', 'goal', 'card-y', 'card-r'].includes(f.cls) && f.id ? '🎙️ ' : ''}${f.cls === 'card-y' ? '🟨 ' : f.cls === 'card-r' ? '🟥 ' : ''}${esc(f.text)}</p>`).join('')}</div>
        ${m.done ? `
          <div class="card ft">
            <h3>Maç sonu</h3>
            ${m.res.played ? `<div class="statsrow in"><div><span>Puan</span><b>${m.res.rating}</b></div><div><span>Gol</span><b>${m.res.goals}</b></div><div><span>Asist</span><b>${m.res.assists}</b></div></div>` : '<p class="muted">Bu maçta oynamadın.</p>'}
            ${ui.iv ? interviewCard(ui.iv) : ''}
            <button class="btn big" data-act="afterMatch" ${ui.iv && !ui.iv.chosen ? 'disabled' : ''}>Devam</button>
          </div>` : `<button class="btn ghost" data-act="fast">${m.fast ? 'Normal hız' : 'Hızlandır ⏩'}</button>`}`}
    `;
  },

  seasonEnd() {
    if (!ui.summary) {
      ui.summary = E.seasonSummary(state);
      ui.seasonOffers = E.seasonOffers(state);
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
      <div class="card">
        <p>${esc(team(p.clubId).name)} ligi <b>${s.myPos}.</b> sırada bitirdi.</p>
        <p class="small muted">Şampiyonlar: ${esc(team(s.champion.SL).name)} (Süper Lig), ${esc(team(s.champion.L1).name)} (1. Lig)</p>
        <div class="statsrow in"><div><span>Maç</span><b>${s.stats.apps}</b></div><div><span>Gol</span><b>${s.stats.goals}</b></div><div><span>Asist</span><b>${s.stats.assists}</b></div><div><span>Ort.</span><b>${s.stats.avg || '-'}</b></div></div>
      </div>
      <h3 class="pad">Transfer teklifleri</h3>
      ${ui.seasonOffers.length ? ui.seasonOffers.map((o, i) => {
        const t = team(o.clubId);
        return `<div class="card offer">${badge(t, 44)}<div class="grow"><b>${esc(t.name)}</b><div class="muted small">${LEAGUES[E.leagueOf(state, t.id)].name} · Güç ${t.str}</div><div class="small">${E.money(o.wage)}/hafta · ${o.years} yıl</div></div><button class="btn" data-act="seasonAccept" data-i="${i}">İmzala</button></div>`;
      }).join('') : '<p class="muted pad">Bu yaz teklif gelmedi.</p>'}
      <div class="card"><p class="small">${expiring ? `Sözleşmen bitiyor. ${esc(team(p.clubId).name)} sana ${E.money(Math.round(p.contract.wage * 1.15 / 500) * 500)}/hafta ile 2 yıl uzatma teklif ediyor.` : `Sözleşmen ${p.contract.endsYear} yazına kadar sürüyor.`}</p>
      <button class="btn big ghost" data-act="stay">${esc(team(p.clubId).name)}'da kal</button></div>`;
  },
};

function interviewCard(iv) {
  return `<div class="iv">
    <div class="iv-head">🎙️ <span>${esc(iv.reporter)}</span></div>
    <p class="iv-q">"${esc(iv.q)}"</p>
    ${iv.chosen ? `<p class="iv-a">"${esc(iv.chosen.text)}"</p><p class="muted small">${esc(iv.summary)}</p>`
      : iv.answers.map((a, i) => `<button class="iv-opt" data-act="ivAns" data-i="${i}">${esc(a.text)}</button>`).join('') +
        `<button class="iv-skip" data-act="ivAns" data-i="-1">Yorum yapmak istemiyorum</button>`}
  </div>`;
}

function bjFinish(g, natural = false) {
  if (!g || g.done) return;
  const pv = Life.handValue(g.player);
  if (pv <= 21 && !natural) while (Life.handValue(g.dealer) < 17) g.dealer.push(g.deck.pop());
  const dv = Life.handValue(g.dealer);
  let pay = 0;
  if (natural && dv !== 21) { pay = Math.round(g.stake * 2.5); g.msg = 'BLACKJACK! 🎉'; }
  else if (pv > 21) { g.msg = 'Battın (21\'i geçti)'; }
  else if (dv > 21 || pv > dv) { pay = g.stake * 2; g.msg = 'Kazandın!'; }
  else if (pv === dv) { pay = g.stake; g.msg = 'Berabere, paran iade'; }
  else g.msg = 'Krupiye kazandı';
  g.win = pay - g.stake;
  state.player.money += pay; state.player.casinoWeek += pay;
  g.done = true;
}

// ---------- maç akışı ----------
async function runMatch() {
  const plan = ui.plan;
  const m = ui.match = {
    plan, minute: 0, homeG: 0, awayG: 0, feed: [], fast: false, done: false, inMoment: false, choice: null,
    res: { played: plan.role !== 'out', goals: 0, assists: 0, outcomes: [], myGoals: 0, oppGoals: 0, yellows: 0, red: false, cards: [] },
  };
  const p = state.player;
  const home = plan.fx.home;
  const addMine = () => { m.res.myGoals++; if (home) m.homeG++; else m.awayG++; };
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
    Spiker.speak(line);
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
  const wx = plan.weather;
  m.feed.push({ min: 0, text: `${E.WEATHER_TEXT[wx.tod]}${wx.fx ? ' · ' + E.WEATHER_TEXT[wx.fx] : ''} · Rakip taktiği: ${E.TACTICS[plan.tactic].name}` });
  if (wx.fx) spk('weather_' + wx.fx); else if (wx.tod === 'gece') spk('weather_gece');
  if (plan.tactic !== 'dengeli') spk('tactic_' + plan.tactic);
  spk('kickoff');
  Sfx.whistle(); Sfx.startCrowd();
  if (plan.role === 'sub') m.feed.push({ min: 0, text: 'Yedek kulübesindesin.' });
  if (plan.suspended) m.feed.push({ min: 0, text: 'Cezalısın, maçı tribünden izliyorsun.', cls: 'bad' });
  screen = 'match';
  render();

  const insert = (ev) => { const i = evs.findIndex((e) => e.min > ev.min); if (i < 0) evs.push(ev); else evs.splice(i, 0, ev); };
  const evs = plan.events.slice();
  let lateDone = false, leadTrim = false, oppRed = false;

  async function moment(ev, min) {
    spk('intro_' + ev.kind, {}, 'hl');
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
    if (plan.role === 'sub' && min === plan.onFrom) m.feed.push({ min, text: 'Oyuna girdin!', cls: 'hl' });
    if (plan.role === 'starter' && plan.onTo < 90 && min === plan.onTo && !m.res.red) m.feed.push({ min, text: 'Yorulduğun için oyundan çıktın.' });
    // skor durumu: geride → son dakika baskısı; 2+ öndeyken bir an eksilir
    const diff = m.res.myGoals - m.res.oppGoals;
    if (min === 75 && !lateDone && onPitch(80) && diff < 0) {
      lateDone = true;
      spk('latePressure', {}, 'hl');
      const n = diff <= -2 ? 1 : E.randInt(1, 2);
      for (let k = 0; k < n; k++) insert(plan.extraMoment(E.randInt(77, Math.min(89, plan.onTo)), E.pick(['acik', 'kafa', 'korner', 'kontra'])));
    }
    if (min === 60 && !leadTrim && diff >= 2) {
      leadTrim = true;
      const i = evs.findIndex((e) => e.type === 'moment');
      if (i >= 0 && Math.random() < 0.6) evs.splice(i, 1);
    }
    while (evs.length && evs[0].min === min) {
      const ev = evs.shift();
      if (ev.type === 'teamGoal') { addMine(); m.feed.push({ min, text: `GOL! ${ev.scorer} (${plan.myName})`, cls: 'goal' }); spk('teamGoal'); }
      else if (ev.type === 'oppGoal') { addOpp(); m.feed.push({ min, text: `Gol: ${ev.scorer} (${plan.oppName})`, cls: 'bad' }); spk('oppGoal'); }
      else if (ev.type === 'moment') {
        if (m.res.red) continue;
        let cur = ev, guard = 0;
        while (cur && guard++ < 3) {
          const next = cur.chain; cur.chain = null;
          const { outcome, text, foul } = await moment(cur, min);
          m.res.outcomes.push(outcome);
          const vx = { defans: foul?.name || E.pick(cur.oppNames || ['Defans']) };
          if (cur.kind === 'penalti' && outcome !== 'goal') m.res.penMissed = true;
          if (cur.kind === 'rovasata' && outcome === 'goal') m.res.bicycle = true;
          if (outcome === 'goal') {
            addMine(); m.res.goals++;
            m.feed.push({ min, text: `GOOOL! ${p.name} ${p.surname}!`, cls: 'goal' });
            spk(Spiker.LINES['goal_' + cur.kind] && Math.random() < 0.75 ? 'goal_' + cur.kind : 'goal');
          } else if (outcome === 'assist') {
            addMine(); m.res.assists++; spk('assist', {}, 'goal');
          } else if (outcome === 'foulPen' || outcome === 'foulFk') {
            spk(outcome, vx, 'hl');
            if (foul?.card === 'red') { spk('oppRed', vx, 'card-r'); oppRed = true; for (const e of evs) if (e.type === 'oppGoal' && Math.random() < 0.4) e.type = 'void'; }
            else if (foul?.card === 'yellow') spk('oppYellow', vx, 'card-y');
            cur = { ...cur, kind: outcome === 'foulPen' ? 'penalti' : 'serbest' };
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
              if (r < 0.12) { spk('appealWin', {}, 'hl'); cur = { ...cur, kind: outcome === 'offside' ? 'birebir' : 'serbest' }; continue; }
              if (r < 0.52) { spk('appealYellow'); myCard('yellow', min); }
              else spk('appealNothing');
            } else if (c === 'tackle') {
              const r = Math.random(), tek = (p.stats.teknik + p.stats.guc) / 200;
              if (r < 0.3 + tek * 0.2) { spk('tackleWin', {}, 'hl'); cur = { ...cur, kind: E.pick(['acik', 'kontra']) }; continue; }
              if (r < 0.62) { m.feed.push({ min, text: 'Faul! Hakem düdüğü çaldı.' }); const red = Math.random() < (p.energy < 30 ? 0.12 : 0.05); myCard(red ? 'red' : Math.random() < 0.55 ? 'yellow' : 'none', min); }
              else spk('tackleMiss');
            }
          } else {
            const key = { saved: 'saved', miss: 'miss', over: 'over', post: 'post', blocked: 'blocked', intercepted: 'intercepted', tmMiss: 'tmMiss' }[outcome];
            if (key) spk(key, vx); else m.feed.push({ min, text: text || OUTCOME_TEXT[outcome] });
          }
          cur = next;
          if (m.res.red) break;
        }
      }
    }
    if (min === 45) { spk('halftime'); Sfx.whistle(); }
    render();
    await new Promise((r) => setTimeout(r, m.fast ? 25 : 110));
  }
  m.minute = 90;
  spk('fulltime');
  Sfx.whistle(true); Sfx.stopCrowd();
  if (m.res.red) plan.onTo = Math.max(plan.onFrom, m.res.redMin);
  E.finishMatch(state, plan, m.res);
  if (m.res.played) { p.recent = [...(p.recent || []), m.res.rating].slice(-5); }
  const recentAvg = p.recent?.length ? p.recent.reduce((a, b) => a + b, 0) / p.recent.length : 0;
  addNews([...News.matchNews(state, plan, m.res), ...Iv.promiseResult(state, plan, m.res), News.maybeRumor(state, recentAvg), News.cardNews(state, plan, m.res)], false);
  if (m.res.injury) {
    m.feed.push({ min: 90, text: `Maçın sonunda sakatlandın! ${m.res.injury} hafta yoksun.`, cls: 'bad' });
    addNews([News.injuryNews(state, m.res.injury)], false);
  }
  if (p.casinoWeek < -Math.max(2_000_000, p.contract.wage * 10) && Math.random() < 0.5) addNews([News.casinoNews(state)], false);
  ui.iv = Iv.postInterview(state, plan, m.res);
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
    case 'continue': return go(state.phase === 'seasonEnd' ? 'seasonEnd' : 'hub');
    case 'playSlot': openSlot(+el.dataset.i); if (!state) return toast('Bu kayıt açılamadı.'); return go(state.phase === 'offers' ? 'offers' : state.phase === 'seasonEnd' ? 'seasonEnd' : 'hub');
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
    case 'accept': {
      const o = state.offers[+el.dataset.i];
      E.acceptOffer(state, o);
      state.news ||= [];
      addNews([News.signingNews(state, o.clubId, null)]);
      persist(); return go('hub');
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
    case 'skipWeek': E.advanceWeek(state); persist(); return render();
    case 'tab': ui.tableTab = el.dataset.tab; return render();
    case 'lb': ui.lbField = el.dataset.f; return render();
    case 'shopTab': ui.shopTab = el.dataset.t; return render();
    case 'buy': { const r = Life.buy(state, el.dataset.id); persist(); return toast(r.ok ? `${r.item.name} alındı!` : r.msg); }
    case 'sell': { const r = Life.sell(state, el.dataset.id); persist(); return toast(r.ok ? `${r.item.name} satıldı` : r.msg); }
    case 'event': { Life.resolveEvent(state, +el.dataset.i); persist(); return render(); }
    case 'talkCoach': { const r = Life.talkCoach(state); persist(); return toast(r.msg); }
    case 'treatTeam': { const r = Life.treatTeam(state); persist(); return toast(r.msg); }
    case 'callFamily': { const r = Life.callFamily(state); persist(); return toast(r.msg); }
    case 'social': ui.candidates = Life.meetCandidates(); return render();
    case 'meetCancel': ui.candidates = null; return render();
    case 'meet': { Life.startDating(state, ui.candidates[+el.dataset.i]); ui.candidates = null; persist(); return render(); }
    case 'date': case 'gift': { const r = Life.datePartner(state, act); persist(); return toast(r.msg || ''); }
    case 'propose': { const r = Life.propose(state); if (r.ok) addNews([News.weddingNews(state)]); persist(); return toast(r.msg); }
    case 'breakup': Life.breakUp(state); persist(); return render();
    case 'casinoTab': ui.casinoTab = el.dataset.t; return render();
    case 'stake': ui.stake = +el.dataset.v; return render();
    case 'bet': {
      const m = Life.bettable(state)[+el.dataset.i];
      const r = Life.placeBet(state, m, el.dataset.pick, ui.stake); persist();
      return r.ok ? render() : toast(r.msg);
    }
    case 'spin': {
      if (ui.stake > state.player.money) return toast('Paran yetmiyor.');
      const num = +(document.getElementById('rnum')?.value ?? 0); ui.rnum = num;
      if (el.dataset.t === 'num' && !(num >= 0 && num <= 36)) return toast('0-36 arası bir sayı seç.');
      const r = Life.spinRoulette({ type: el.dataset.t, num });
      const win = ui.stake * r.mult;
      Life.casinoResult(state, win - ui.stake);
      ui.roulette = { n: r.n, win }; Sfx.unlock(); persist(); return render();
    }
    case 'slot': {
      if (ui.stake > state.player.money) return toast('Paran yetmiyor.');
      const r = Life.spinSlot(); ui.slot = r;
      Life.casinoResult(state, Math.round(ui.stake * r.mult) - ui.stake); persist(); return render();
    }
    case 'bjDeal': {
      if (ui.stake > state.player.money) return toast('Paran yetmiyor.');
      const deck = Life.newDeck();
      const g = ui.bj = { deck, player: [deck.pop(), deck.pop()], dealer: [deck.pop(), deck.pop()], stake: ui.stake, done: false };
      state.player.money -= g.stake; state.player.casinoWeek -= g.stake;
      if (Life.handValue(g.player) === 21) bjFinish(g, true);
      persist(); return render();
    }
    case 'bjHit': { const g = ui.bj; g.player.push(g.deck.pop()); if (Life.handValue(g.player) > 21) bjFinish(g); else if (Life.handValue(g.player) === 21) bjFinish(g); persist(); return render(); }
    case 'bjStand': bjFinish(ui.bj); persist(); return render();
    case 'kickoff': Sfx.unlock(); ui.iv = null; return runMatch();
    case 'ivAns': {
      const iv = ui.iv; if (!iv || iv.chosen) return;
      const i = +el.dataset.i;
      if (i < 0) { iv.chosen = { text: 'Yorum yapmak istemiyorum.' }; iv.summary = 'Basına konuşmadın'; persist(); return render(); }
      const a = iv.answers[i];
      const r = Iv.applyAnswer(state, iv, a);
      iv.chosen = a; iv.summary = r.summary;
      if (iv.when === 'pre') {
        if (a.promise) ui.plan.promise = true;
        if (a.provoke) {
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
    case 'fast': ui.match.fast = !ui.match.fast; return render();
    case 'choice': if (ui.match?.choice) ui.match.choice.pick(el.dataset.v); return render();
    case 'afterMatch':
      ui.match = null; ui.plan = null; ui.iv = null;
      ui.popup.push(...ui.pending); ui.pending = [];
      return go(state.phase === 'seasonEnd' ? 'seasonEnd' : 'hub');
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
app.addEventListener('change', async (e) => {
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

function render() {
  const html = (screens[screen] || screens.start)();
  document.body.classList.toggle('menu-bg', screen === 'start');
  // maç sırasında canvas'ı yeniden oluşturma
  if (screen === 'match' && ui.match?.inMoment && document.getElementById('momentHost')?.firstChild) return;
  const pop = ui.popup.length && screen !== 'match' ? `
    <div class="np-overlay"><div class="np-wrap">${News.clippingHtml(ui.popup[0])}</div>
      <button class="btn big" data-act="npNext">${ui.popup.length > 1 ? `Sonraki haber (${ui.popup.length - 1})` : 'Kapat'}</button></div>` : '';
  app.innerHTML = html + pop + (ui.toast ? `<div class="toast">${esc(ui.toast)}</div>` : '');
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
