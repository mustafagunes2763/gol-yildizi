// "Paslaş" — oyunun kendi (uydurma) sosyal medya uygulaması.
// Akış, profil + paylaşımlar, yorumlar ve cevaplar, DM kutusu, sponsorlu paylaşımlar, kriz/linç, takipçi.
// Kurgusal rakip Ahmet Akyurt: kariyere ezeli rakipte başlar, sen lig değiştirdikçe peşinden gelir.
// Gerçek oyuncular sadece tarafsız (gol krallığı kıyası) ya da olumlu (emoji yorum) geçer.
import { clamp, pick, randInt, rand, money, addInbox, leagueOf, leagueStats, overall, sortedTable, seasonOffers, shuffle, lastWeekScorers } from './engine.js';
import { CELEB_IMAGES } from './celebrate.js';
import { clubInfo, isDerby } from './data.js';
import * as Trivia from './trivia.js';

export const APP = 'Paslaş';
export const RIVAL_NAME = 'Ahmet Akyurt';
export const RIVAL_LOOK = { skin: 2, hair: 'mohikan', hairColor: 'kahve' };
const ABS = (s) => s.season.year * 60 + s.season.week;
let uid = Date.now() % 1e6;
const id = () => (uid++).toString(36);
const tr = (s) => s.toLocaleLowerCase('tr-TR').replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/[^a-z0-9]/g, '');
export const fmtF = (n) => n >= 1e6 ? (n / 1e6).toLocaleString('tr-TR', { maximumFractionDigits: 1 }) + 'M' : n >= 1e3 ? (n / 1e3).toLocaleString('tr-TR', { maximumFractionDigits: 1 }) + 'B' : String(Math.round(n));

// ---------------------------------------------------------------- kişiler
const FANS = ['tribun_kaplani', 'golcu_ruhu', 'ofsayt_avcisi', 'son_dakika_golu', 'kale_arkasi', 'deplasman_ruhu', 'kirmizi_kart_06', 'futbol_delisi', 'pas_ustasi34', 'maraton_tribunu', 'sahanin_kurdu', 'yorumcu_dayi', 'kapali_tribun', 'efsane_gelecek', 'top_bizde', 'kornerci_ali', 'gol_avcisi_77', 'futbolsever_zeynep', 'stat_kizi', 'tribun_annesi'];
const PAGES = {
  kulis: { name: 'Transfer Kulisi', handle: 'transferkulisi', av: '🕵️', verified: true },
  gundem: { name: 'Futbol Gündemi', handle: 'futbolgundem', av: '📢', verified: true },
  istatistik: { name: 'Gol Rakamları', handle: 'golrakamlari', av: '📊', verified: true },
  magazin: { name: 'Lara Ses', handle: 'laraseslemagazin', av: '📸', verified: true },
  selin: { name: 'Selin Arıkan', handle: 'selinarikan', face: 'selin', verified: true },
  kenan: { name: 'Kenan Sarp', handle: 'bombakenan', face: 'kenan', verified: true },
  duygu: { name: 'Duygu Ateş', handle: 'duyguates', face: 'duygu', verified: true },
};
// Oyuna özel markalar (isimler kullanıcının yazdığı gibi). k: ödeme çarpanı, min: gereken takipçi
const B = (name, cat, av, item, k, min = 0, fx = null) => ({ name, cat, av, item, k, min, fx });
export const BRANDS = [
  B('Like', 'krampon', '👟', 'yeni kramponlarım', 1.0), B('amigos', 'krampon', '👟', 'yeni kramponlarım', 1.0), B('lion', 'krampon', '👟', 'yeni kramponlarım', 0.9),
  B('Pinkbull', 'enerji', '🥤', 'maç öncesi enerjim', 0.7),
  B('Saatcim', 'saat', '⌚', 'yeni saatim', 1.2, 20_000),
  B('Readme', 'kulaklik', '🎧', 'ısınma müziğim', 0.8),
  B('Like', 'giyim', '🧥', 'yeni sezon kombinim', 1.1), B('amigos', 'giyim', '🧥', 'antrenman eşofmanım', 1.0), B('lion', 'giyim', '🧥', 'yeni sezon kombinim', 0.9),
  B('Parfümcüben', 'parfum', '🧴', 'imza kokum', 1.0, 20_000),
  B('Xxxaomi', 'telefon', '📱', 'yeni telefonum', 1.3, 50_000),
  B('TOGG', 'otomobil', '🚘', 'yeni arabam', 2.0, 100_000),
  B('Köfteci Yusuf', 'burger', '🍔', 'maç sonrası ödülüm', 0.5),
  B('Kahvecİrfancan', 'kahve', '☕', 'sabah kahvem', 0.5),
  B('Yapı', 'banka', '💳', 'yeni kartım', 1.6, 100_000),
  B('Merit King', 'bahis', '🎰', 'maç heyecanı', 1.8, 20_000, { fans: -2 }),
  B('Temiz Adam', 'sampuan', '🧴', 'saçlarımın sırrı', 0.6),
  B('SonGlasses', 'gozluk', '🕶️', 'yeni gözlüğüm', 0.8),
  B('Gecek', 'su', '💧', 'antrenman suyum', 0.4), B('Defne Akyazı', 'su', '💧', 'antrenman suyum', 0.4),
  B('Protein Oecn', 'protein', '🥛', 'antrenman sonrası proteinim', 0.6), B('PIQ', 'protein', '🥛', 'antrenman sonrası proteinim', 0.6),
  B('PlayArena', 'konsol', '🎮', 'kamp akşamı eğlencem', 0.9), B('XxxBox', 'konsol', '🎮', 'kamp akşamı eğlencem', 0.9),
  B('Bjet', 'havayolu', '✈️', 'deplasman yolculuğum', 1.7, 100_000),
  B('Ramada', 'otel', '🏨', 'tatil adresim', 1.4, 50_000),
  B('Zensizolmaz', 'kozmetik', '💄', 'çift bakım rutinimiz', 1.0, 20_000, { partner: 4 }),
];

// ---------------------------------------------------------------- yorumcu karakterler
// Her birinin kişiliği var; paylaşımın türüne ve maça göre konuşurlar.
export const PERSONAS = {
  emir: { name: 'Emir Coşkun', handle: 'emircoskun', av: '📣', tag: 'Fanatik', tone: 'praise', lines: {
    goal: ['GOOOOL! BU ADAM BAŞKA! 🔥🔥🔥', 'Söylemiştim size, bu çocuk yıldız olacak!!', 'Gece uyuyamam ben bu maçtan sonra 😭❤️', 'ATTI ATTI ATTIIII! ⚽⚽⚽', 'Komşular kapıyı çaldı, o kadar bağırdım 😂📣', 'Bu golü çerçeveletip duvara asacağım 🖼️'],
    win: ['3 PUAN! Kral yine yaptı 👑', 'Tribünde sesim kısıldı, değdi! 📣', 'Bu akşam şehirde kornalar susmaz 📯', 'Takımım, sevdam, her şeyim ❤️'],
    loss: ['Kalbim kırıldı ama yine de seninleyiz 💔', 'Hakem rezaletti, senin suçun yok!', 'Bir maç kaybettik, sevdamızı değil ❤️', 'Pazartesi yine buradayız, yine bağıracağız 📣'],
    love: ['Yengemize selamlar 😍', 'Çok yakıştınız, düğüne beni de çağırın 💍'],
    crisis: ['Ben yine de arkandayım, herkes hata yapar! 🙏'],
    jab: ['VUR VUR VUR! 🔥 Ahmet nerede şimdi?'],
    any: ['Kral paylaşmış, beğenmeyen 3 gün ağlasın 👑', 'Bugün de seni sevmekten yorulmadım 😅', 'Bildirimleri açtım, her paylaşımına ilk ben yazacağım 📣'] } },
  akif: { name: 'Akif Ünlü', handle: 'akifunlu', av: '📊', tag: 'İstatistikçi', tone: 'praise', lines: {
    goal: ['Sezon: {g} gol, {a} asist. Dakika başına katkıda ligin üst sıralarındasın 📊', 'Bu golle birlikte son 5 maçta {g5} gole katkı 📈', 'Paylaşımı ilk ben beğendim, kayıtlara geçsin 😎', 'Bu çocuk benim gözbebeğim 🥹', 'Abi bir selfie borcun var bana 📸', 'Golün xG değeri düşüktü ama sen yine attın. Fark bu 📊'],
    win: ['Son 5 maç: {form}. Grafik yukarı bakıyor 📈', 'Takım sen oynayınca daha çok puan topluyor, rakamlar ortada 📊'],
    loss: ['Topa sahip olma düşüktü, sana top gelmeyince ne yapsın 📉', 'Son 5 maç: {form}. Düzelir, sabır 📊'],
    jab: ['Bilgi notu: {rival} {rg} gol, sen {g} gol. Rakamlar yalan söylemez 📊'],
    league: ['Bu arada gol krallığında {top} {topg} golle önde. Takipteyiz 📊'],
    any: ['Pres sayın lig ortalamasının üstünde, kimse bundan bahsetmiyor 📊', 'Son 5 maç form: {form}', 'Sezon: {g} gol · {a} asist 📊'] } },
  mert: { name: 'Mert Karahasan', handle: 'mertkarahasan', av: '😂', tag: 'Capsçı', tone: 'funny', lines: {
    goal: ['Kaleci hâlâ topu arıyor 😂', 'Bu golü annem de görmüş, telefon açtı 😂', 'Isı haritasına baktım: sahanın her yerindesin 🔥📊', 'Şut isabeti bu sezon yükselişte 📈', 'Rakamlar konuşuyor, ben sadece tercüme ediyorum 📊', 'Kaleci gol sonrası kariyer değişikliği düşünüyor 😂', 'Topun ağlara gidişi slow motion olmalı 😂'],
    loss: ['Bugünkü maçı izlemeyenler kazandı 😂', 'Maç değil korku filmiydi 😂'],
    car: ['Arabayı satsan bizim mahallenin tamamını alırsın 😂', 'Abi bir tur atalım mı, söz bir şeye dokunmayacağım 😂'],
    holiday: ['Tatilde bile formsuz 😂 şaka şaka', 'Denize atlamadan önce ısınma hareketi yaptın mı 😂'],
    love: ['Abi bizim için de bir arkadaşı var mı 😂'],
    jab: ['Ortalık karıştı, cipsleri getirin 🍿😂'],
    crisis: ['Bugün telefonu kapat abi, ciddi söylüyorum 😂'],
    any: ['Paylaşım güzel de, imza günü ne zaman? 😂', 'Bu fotoğrafa filtre koymadım diyorsan yalan 😂', 'Like attım ama kafam karışık 😂'] } },
  omer: { name: 'Ömer Özbey', handle: 'omerozbey', av: '🧐', tag: 'Eleştirmen', tone: 'critic', reply: true, lines: {
    goal: ['Gol güzel ama 90 dakikanın 85\'inde yoktun.', 'Bir gol attı diye kral olmuyorsun, devamını görelim.', 'Bu paylaşım lig tablosundan daha iyi 😂', "Abi profil fotoğrafın 2019'dan kalma, güncelle 😂", 'Her paylaşıma yorum yapıyorum, bana da bir forma 😂', 'Ben bu paylaşımı görünce ağladım (gülmekten) 😂'],
    win: ['Kazandık ama oyun yine kötüydü. Bunu kimse söylemiyor.', 'Rakip takım otobüsü bile üzgün görünüyordu 😂', '3 puan güzel ama savunma yine dağınıktı.'],
    loss: ['Ben demiştim. Bu oyunla bu olur.', 'Önce performans, sonra paylaşım.'],
    car: ['Araba paylaşacağına antrenman videosu at.'], holiday: ['Lig devam ederken tatil fotoğrafı… Ciddi misin?'],
    crisis: ['Bunu hak ettin. Özür yetmez, sahada göster.'],
    any: ['Önce performans, sonra paylaşım.', 'Abartılıyorsun, gerçekçi olalım.'] } },
  eren: { name: 'Eren Akyurt', handle: 'erenakyurt', av: '🦊', tag: 'Ahmet\'in kardeşi', tone: 'eren', reply: true, lines: {
    goal: ['Abim bu sezon {rg} attı, sen {g} 😏', 'Fena değil… ama abim daha iyi', 'Beğeni sayısı gol sayısını geçmesin.', 'İstatistiklere bakmadan konuşanlar çoğaldı.', 'Daha istikrarlı olmalı. Bir iyi, bir kötü.', 'Tamam iyi gol… ama abiminkiler daha güzel 😤'],
    win: ['Şanslı galibiyet. Abim olsa…'],
    loss: ['HAHAHA 😂 abime selam söyle diyorum'],
    jab: ['Abime laf atma! 😤', 'Abim seni sahada susturur 😤'],
    any: ['Abim seni takip etmiyor, ben ediyorum çünkü komiksin 😂', 'İmzalı forma alabilir miyim? Abime söyleme 🤫', 'Abimle aranız ne zaman düzelecek? 🙄', 'Abim senin paylaşımını gördü, gülümsedi. Ben gördüm 🤫', 'Abime söyleme ama gol sevincini çok beğendim 🤐', 'Seninle bir fotoğraf çektirebilir miyim? Abim bilmesin 📸'] } },
};
const personaAuthor = (k) => { const x = PERSONAS[k]; return { name: x.name, handle: x.handle, av: x.av, persona: k }; };
function personaLine(state, k, key) {
  const x = PERSONAS[k], p = state.player;
  if (k === 'akif' && Math.random() < 0.4 && x.lines.league) { const t = topScorer(state); if (t.g > 0) return pick(x.lines.league).replace('{top}', t.name).replace('{topg}', t.g); }
  const list = x.lines[key] || x.lines.any;
  const form = (p.form || []).map((r) => ({ W: 'G', D: 'B', L: 'M' }[r])).join('-') || '—';
  return pick(list).replace('{g}', p.season.goals).replace('{a}', p.season.assists).replace('{g5}', p.season.goals + p.season.assists)
    .replace('{form}', form).replace('{rg}', rivalSeasonGoals(state)).replace('{rival}', RIVAL_NAME);
}
function topScorer(state) {
  const p = state.player;
  const t = leagueStats(state, leagueOf(state, p.clubId)).filter((x) => !x.me).sort((a, b) => b.g - a.g)[0];
  return t || { name: RIVAL_NAME, g: 0 };
}
function personaComments(state, t, crisis) {
  const lm = ctx(state).lm;
  const key = crisis || state.social.crisis ? 'crisis' : t.id === 'jab' ? 'jab' : ['car', 'holiday', 'love'].includes(t.id) ? t.id
    : t.id === 'goal' || (lm && lm.goals > 0 && t.id === 'win') ? 'goal' : t.id === 'win' ? 'win' : t.id === 'loss' ? 'loss' : 'any';
  const ks = Object.keys(PERSONAS).filter((k) => (k === 'eren' ? Math.random() < (t.id === 'jab' || t.id === 'goal' ? 0.8 : 0.35) : Math.random() < 0.45));
  return ks.slice(0, 3).map((k) => ({ who: personaAuthor(k), text: personaLine(state, k, key), tone: PERSONAS[k].tone, reply: !!PERSONAS[k].reply }));
}

// ---------------------------------------------------------------- kurulum
export function ensure(state) {
  if (!state.season || !state.player?.clubId) return null;
  const p = state.player;
  const s = state.social ??= {
    followers: Math.round(800 + (p.fame || 0) * 3000 + randInt(0, 400)),
    posts: [], feed: [], dms: [], trends: [], weekPosts: 0, crisis: null, sponsorWeeks: [], lastWeek: -1, seenFeed: 0,
  };
  s.handle = tr(p.name) + tr(p.surname);
  if (!s.rival) placeRival(state, rivalTeamFor(state, p.clubId), true);
  return s;
}

// ezeli rakip (aynı ligde) → derbi → ligin en güçlüsü
export function rivalTeamFor(state, clubId) {
  const lid = leagueOf(state, clubId);
  const pool = (state.leagues[lid] || []).filter((t) => t !== clubId);
  const ezeli = (clubInfo(clubId).ezeli_rakipler || []).filter((t) => pool.includes(t));
  if (ezeli.length) return ezeli[0];
  const derby = pool.filter((t) => isDerby(clubId, t));
  if (derby.length) return pick(derby);
  return pool.slice().sort((a, b) => (state.teams[b]?.str || 0) - (state.teams[a]?.str || 0))[0];
}

function placeRival(state, teamId, first = false) {
  const p = state.player;
  const s = state.social;
  for (const t of Object.values(state.teams)) t.squad = t.squad.filter((x) => x.name !== RIVAL_NAME);
  const ovr = clamp(overall(p) + (s.rival?.edge ?? 1), 45, 95);
  state.teams[teamId].squad.push({ name: RIVAL_NAME, pos: 'FV', age: p.age, nat: 'Türkiye', ovr, rival: true });
  const prev = s.rival?.team;
  s.rival = { ...(s.rival || { edge: randInt(0, 2), heat: 30, followers: Math.round(s.followers * rand(0.9, 1.3)), history: [] }), team: teamId, ovr, lastSeen: undefined };
  if (!first && prev !== teamId) s.rival.history.push({ year: state.season.year, from: prev, to: teamId });
  return teamId;
}

// Sen transfer olunca (ya da ligler ayrışınca) Ahmet de peşinden gelir
export function onTransfer(state, oldClub) {
  const s = ensure(state); if (!s) return;
  const p = state.player, r = s.rival;
  if (!oldClub) return;
  const sameLeague = leagueOf(state, r.team) === leagueOf(state, p.clubId);
  if (sameLeague && r.team !== p.clubId) return;
  const to = placeRival(state, rivalTeamFor(state, p.clubId));
  const tn = state.teams[to].name;
  addInbox(state, `📱 ${RIVAL_NAME} de ${tn} ile anlaştı! Yine aynı ligdesiniz.`);
  pushFeed(s, rivalAuthor(state), `Yeni macera: ${tn} ✍️ Bazıları peşimden geliyor sanıyor, aslında hep bir adım öndeyim 😎`, { likes: r.followers * 0.08, img: 'sign' });
  pushFeed(s, PAGES.kulis, `🚨 ${RIVAL_NAME} ${tn}'da! ${p.name} ${p.surname} ile kariyerleri yine kesişti. Ezeli rekabet yeni ligde sürecek. #${tr(RIVAL_NAME)}`, { likes: s.followers * 0.05 });
  s.rival.heat = clamp(s.rival.heat + 10, 0, 100);
}
// sezon başı: terfi/düşme ile ligler ayrıştıysa
export function onSeasonStart(state) {
  const s = ensure(state); if (!s) return;
  if (leagueOf(state, s.rival.team) !== leagueOf(state, state.player.clubId)) onTransfer(state, 'season');
  s.weekPosts = 0; s.rumors = [];
}

const rivalAuthor = (state) => ({ name: RIVAL_NAME, handle: tr(RIVAL_NAME), rival: true, verified: state.social.rival.followers > 50_000, team: state.social.rival.team });
const meAuthor = (state) => ({ name: `${state.player.name} ${state.player.surname}`, handle: state.social.handle, me: true, verified: state.social.followers > 50_000 });
const fanAuthor = () => { const h = pick(FANS); return { name: h.replace(/_/g, ' ').replace(/\d+/g, '').trim(), handle: h, av: pick(['🙂', '😎', '🦁', '⚽', '🔥', '🦅', '🐺', '🎺', '🧢', '👑']) }; };
function pushFeed(s, author, text, o = {}) {
  const item = { id: id(), author, text, likes: Math.round(o.likes ?? randInt(20, 400)), img: o.img || null, tag: o.tag || null, abs: o.abs ?? null, kind: o.kind || '', poll: o.poll || null };
  s.feed.unshift(item);
  s.feed = s.feed.slice(0, 40);
  // karakter profilleri için son paylaşımları ayrıca sakla
  const k = author.persona || (author.rival ? 'ahmet' : null);
  if (k) { s.ppl ||= {}; (s.ppl[k] ||= []).unshift(item); s.ppl[k] = s.ppl[k].slice(0, 15); }
}

// ---------------------------------------------------------------- etkiler
const FX_TR = { fans: 'Taraftar', coach: 'Hoca', team: 'Takım', morale: 'Moral', fame: 'Ün', partner: 'Sevgili', energy: 'Enerji', heat: 'Rekabet' };
export function applyFx(state, fx = {}) {
  const p = state.player, s = state.social, parts = [];
  if (fx.money) { p.money += fx.money; parts.push(`${fx.money > 0 ? '+' : '−'}${money(Math.abs(fx.money))}`); }
  if (fx.followersPct) {
    const d = Math.round(s.followers * fx.followersPct / 100);
    s.followers = Math.max(100, s.followers + d);
    parts.push(`Takipçi ${d >= 0 ? '+' : '−'}${fmtF(Math.abs(d))}`);
  }
  for (const k of ['fans', 'morale', 'fame', 'energy']) if (fx[k]) { p[k] = clamp((p[k] ?? 50) + fx[k], 0, 100); parts.push(`${FX_TR[k]} ${fx[k] > 0 ? '+' : '−'}${Math.abs(fx[k])}`); }
  for (const k of ['coach', 'team']) if (fx[k] && p.rel) { p.rel[k] = clamp(p.rel[k] + fx[k], 0, 100); parts.push(`${FX_TR[k]} ${fx[k] > 0 ? '+' : '−'}${Math.abs(fx[k])}`); }
  if (fx.partner && p.partner) { p.partner.value = clamp(p.partner.value + fx.partner, 0, 100); parts.push(`${p.partner.name.split(' ')[0]} ${fx.partner > 0 ? '+' : '−'}${Math.abs(fx.partner)}`); }
  if (fx.heat && s.rival) { s.rival.heat = clamp(s.rival.heat + fx.heat, 0, 100); parts.push(`Rekabet ${fx.heat > 0 ? '🔥' : '🧊'}`); }
  if (fx.endCrisis && s.crisis) { s.crisis.weeks = Math.min(s.crisis.weeks, 1); parts.push('Kriz yatışıyor'); }
  let crisis = false;
  if (fx.crisis && !s.crisis && Math.random() < fx.crisis) { startCrisis(state, fx.crisisWhy || 'paylaşım'); crisis = true; parts.push('🚨 LİNÇ BAŞLADI'); }
  return { summary: parts.join(' · '), crisis };
}

export function startCrisis(state, why) {
  const s = state.social, p = state.player;
  const tag = `#${tr(p.surname).replace(/^./, (c) => c.toUpperCase())}ÖzürDile`;
  s.crisis = { weeks: 3, tag, why };
  p.fans = clamp((p.fans ?? 50) - 6, 0, 100);
  if (p.rel) p.rel.coach = clamp(p.rel.coach - 3, 0, 100);
  s.followers = Math.round(s.followers * 0.97);
  addInbox(state, `🚨 ${APP}'ta linç! ${tag} gündemde. Taraftar tepkili, kulüp rahatsız.`);
  for (let i = 0; i < 3; i++) pushFeed(s, fanAuthor(), pick([`Bu ne ya? ${tag}`, `Kulübümüzü temsil edemezsin! ${tag}`, `Formayı hak etmiyor. ${tag}`, `Bir özrü bile çok görüyor… ${tag}`, `Bu paylaşımı hemen silmesi lazım ${s.crisis?.tag || tag}`, `Taraftarı küstürdün ${tag}`, `Kulüp gereğini yapmalı ${tag}`]), { likes: randInt(200, 3000) });
  pushFeed(s, PAGES.gundem, `Sosyal medyada ${p.name} ${p.surname} krizi! ${tag} etiketi trend oldu.`, { likes: s.followers * 0.02, img: 'backlash' });
}

// ---------------------------------------------------------------- gol sevinci tepkisi
const CELEB_POSTS = {
  taraftar: ['{ad} golden sonra tribünlere koştu, taraftarla kucaklaştı ❤️', 'Bu sevinç tribünle oyuncu arasındaki bağı anlatıyor 🙌'],
  takim: ['{ad} golü takım arkadaşlarıyla kutladı. Soyunma odası tek yürek 🤝'],
  forma: ['{ad} formasını çıkarıp salladı, sarı kartı da gördü 👕🟨', 'Forma çıkaran {ad}: "Kartı bilerek göze aldım"'],
  rakip: ['{ad} rakip tribüne "sus" işareti yaptı! Ortalık karıştı 🤫🔥', 'Maçın konuşulan anı: {ad}\'ın rakip tribüne yaptığı hareket 🤫'],
  imza: ['{ad}\'ın imza sevinci yine sahnede ⭐ Çocuklar sokakta taklit ediyor', 'O sevinç artık bir marka ⭐ {ad}'],
  kalp: ['{ad} golü sevdiklerine adadı ❤️ Tribündeki ailesi gözyaşlarını tutamadı'],
  diz: ['{ad} dizleri üstünde metrelerce kaydı, çimler hâlâ kendine gelemedi 🧎'],
  sakin: ['{ad} eski takımına gol atıp sevinmedi. Saygı dolu bir hareket 👏'],
};
export function onCelebrate(state, ids, crisis) {
  const s = ensure(state); if (!s || !ids?.length) return;
  const p = state.player, me = `${p.name} ${p.surname}`;
  const id = ids[ids.length - 1];
  const t = pick(CELEB_POSTS[id] || CELEB_POSTS.takim).replace('{ad}', me);
  pushFeed(s, PAGES.gundem, t, { likes: s.followers * rand(0.04, 0.12), img: CELEB_IMAGES.has(id) ? 'celeb_' + id : null });
  if (id === 'rakip') pushFeed(s, personaAuthor(crisis ? 'omer' : 'mert'), crisis ? pick(['Bu hareket futbolcuya yakışmadı.', 'Saha içinde kal, tribünle uğraşma.']) : pick(['Rakip tribün çıldırdı 😂🍿', 'Bu sevinç sezon sonu kliplerine girer 😂']), { likes: randInt(400, 6000) });
  if (id === 'forma') pushFeed(s, personaAuthor('emir'), pick(['Kart da olsa değdi! 👕🔥', 'O formayı çerçeveletin!']), { likes: randInt(300, 4000) });
  if (crisis) startCrisis(state, 'rakip tribüne yaptığı "sus" işareti');
}

// ---------------------------------------------------------------- paylaşım şablonları
// when(state, ctx): ctx = { lm (bu haftanın maçı), s }
export const TEMPLATES = [
  { id: 'win', label: 'Galibiyet paylaşımı', emoji: '🏆', img: 'cheer', when: (st, c) => c.lm && c.lm.result === 'W',
    text: (st, c) => pick([`3 puan bizim! ${c.lm.goals ? `${c.lm.goals} gol de benden 😉 ` : ''}Hep birlikte daha güçlüyüz 💪`, `Büyük takım böyle oynar! Teşekkürler tribün 🙌`, `Ter, emek, galibiyet. Sıradaki maça! ⚽`, `Bu galibiyet sizin! Deplasmana gelen, evden izleyen herkese teşekkürler ❤️`, `Kazanmak alışkanlıktır, bırakmaya niyetimiz yok 😤`, `Soyunma odasında müzik son ses 🎶 3 puan cepte!`, `Zor maçtı ama karakter gösterdik 💪`, `Bir maç daha, bir galibiyet daha. Sıradakine odaklandık 🎯`, `Tribünün sesi sahaya kadar geldi, sayenizde kazandık 📣`, `Bugün herkes bir adım fazla koştu. Gurur duyuyorum takımımla 🙌`]),
    fx: { fans: 2, morale: 1 }, reach: 1.3 },
  { id: 'goal', label: 'Golümü paylaş', emoji: '⚽', img: 'header', when: (st, c) => c.lm && c.lm.goals > 0,
    text: (st, c) => pick([`${c.lm.goals > 1 ? `${c.lm.goals} gol` : 'Gol'}! Bu his hiçbir şeye benzemiyor ⚽🔥`, `Gol sevincini sizinle paylaşmak istedim 🙏`, `Ağları sarsmak… bağımlılık yapıyor 😅`, `Bu gol aileme ve beni hiç bırakmayan herkese 🙏`, `O top ağlara gittiğinde kalbim durdu bir an ❤️⚽`, `Gol attım ama asıl kahraman takımım 👏`, `Ağları havalandırmak serbest 😎⚽`, `Gol sevinci: kontrol edilemez 🤪⚽`, `Çocukluk hayalim: dolu tribün önünde gol. Bugün yine yaşadım 🥹`, `Topa dokunuş, kalecinin bakışı, sonrası tarih 😅`]),
    fx: { fans: 2, fame: 1 }, reach: 1.6 },
  { id: 'loss', label: 'Mağlubiyet sonrası', emoji: '🙏', img: 'sad', when: (st, c) => c.lm && c.lm.result === 'L',
    text: () => pick([`Bugün olmadı. Sorumluluk hepimizin, kafamızı kaldıracağız.`, `Taraftarımızdan özür dileriz. Daha çok çalışacağız.`, `Kötü günler de geçer. Hep birlikte! 🙏`, `Kimse bizden daha üzgün değil. Telafi edeceğiz.`, `Mağlubiyet ağır ama ders çıkaracağız. Başımız dik 🙏`, `Bu formayı taşımanın sorumluluğunu biliyoruz. Daha iyisi gelecek.`, `Bu akşam uyku yok. Hataları izleyip düzelteceğiz.`, `Düşmek değil, kalkmamak ayıp. Kalkacağız 💪`, `Taraftarımız her şeyin en iyisini hak ediyor. Söz, toparlanacağız.`]),
    fx: { fans: 3, coach: 1 }, reach: 0.9 },
  { id: 'training', label: 'Antrenman', emoji: '💪', img: () => pick(['gym', 'soc_mirror']), when: () => true,
    text: () => pick([`Ekstra mesai 💪 Kimse görmezken çalışmak…`, `Sabah 7, saha, ben. ⏰⚽`, `Bitirici vuruşlar üzerinde çalıştık 🎯`, `Yağmur, çamur, fark etmez 🌧️⚽`, `Başarı tesadüf değil 💪`, `Bugün 200 şut. Yarın 201 🎯`, `Ter dökmeden gol gelmez 💦`, `Kondisyon günü… bacaklar beni affetsin 😅`, `Spor salonu → saha → buz banyosu → tekrar 🔁`, `Sol ayak çalışması: yavaş yavaş oturuyor 🦶`]),
    fx: { coach: 1, fans: 1 }, reach: 0.8 },
  { id: 'fans', label: 'Taraftara teşekkür', emoji: '❤️', img: 'fans', when: () => true,
    text: (st) => pick([`${st.teams[st.player.clubId].name} taraftarı, siz bambaşkasınız ❤️`, `Tribünden gelen o ses… Teşekkürler! 🎺`, `Her maç sizin için. 🙌`, `Siz olmasanız bu formanın anlamı olmazdı ❤️`, `Deplasmanda da yanımızdaydınız. Helal olsun! 🚌`, `Bu tezahüratları hayatım boyunca unutmayacağım 🎶`, `Sahadaki 12. adam: sizsiniz 📣`, `Formam sizin, golüm sizin, kalbim sizin ❤️`]),
    fx: { fans: 3 }, reach: 1, cooldown: 3 },
  { id: 'coach', label: 'Hocaya teşekkür', emoji: '🧠', img: 'coach', when: () => true,
    text: () => pick([`Hocama güveni için teşekkürler. Daha iyisi gelecek!`, `Her gün bir şey öğreniyorum. Hocam sağ olsun 🙏`, `Hocamın her antrenmanda verdiği emek için minnettarım.`, `Taktik toplantısı uzun sürdü ama değdi 🧠`, `İyi bir hoca, iyi bir oyuncu yaratır. Şanslıyım 🙏`]),
    fx: { coach: 3, team: -1 }, reach: 0.7, cooldown: 4 },
  { id: 'love', label: 'Sevgiliyle fotoğraf', emoji: '💕', img: 'date', when: (st) => !!st.player.partner,
    text: (st) => pick([`Hayatımın golü ❤️ @${tr(st.player.partner.name)}`, `İyi ki varsın ${st.player.partner.name.split(' ')[0]} 💕`, `Tatil modu: kapalı. Aşk modu: açık 😍`, `Maç gününde en büyük taraftarım 💕`, `Seninle her şey daha güzel ❤️`, `Bu gülümseme her şeye değer 😍`, `Akşam yemeği, iyi sohbet, sen 🍝❤️`, `Kalbimin kaptanı 💕`]),
    fx: { partner: 6, fame: 1 }, reach: 1.4, risk: (st, c) => c.lm && c.lm.result === 'L' ? 0.15 : 0, riskWhy: 'mağlubiyet sonrası aşk paylaşımı' },
  { id: 'family', label: 'Aile paylaşımı', emoji: '👨‍👩‍👧', img: 'family', when: (st) => (st.player.children || []).length > 0 || st.player.partner?.married,
    text: () => pick([`Her şeyim bu ev 🏡❤️`, `Pazar keyfi, ailemle 👨‍👩‍👧`, `Yorgunluğun ilacı: çocuk kahkahası 😂`, `Asıl zafer: evde beni bekleyenler ❤️`, `Maçtan sonra en güzel karşılama 🏡`, `Ailem = enerjim 🔋❤️`]),
    fx: { family: 0, fans: 2, morale: 2 }, reach: 1.2 },
  { id: 'car', label: 'Arabamı göster', emoji: '🏎️', img: 'car', when: (st) => st.player.owned?.some((x) => x.startsWith('car')),
    text: () => pick([`Yeni oyuncak 😎🏎️`, `Gaz pedalı da ayak işi 😏`, `Hız bende doğuştan 🏁`, `Garajın yeni misafiri 🏎️`, `Antrenmana erken gitmek için iyi bir sebep 😏`, `Bu rengi taraftarım seçti 😄`, `Hız sınırına uyuyoruz, söz 😇`]),
    fx: { fame: 2 }, reach: 1.5, risk: (st, c) => c.lm && c.lm.result === 'L' ? 0.4 : 0.05, riskWhy: 'mağlubiyet sonrası lüks şov' },
  { id: 'holiday', label: 'Tatil fotoğrafı', emoji: '🏖️', img: 'holiday', when: () => true,
    text: () => pick([`Kafa dinleme vakti 🏖️`, `Deniz, kum, ben 🌊`, `Kısa bir mola, sonra tam gaz ⚡`, `Telefon sessizde, deniz önümde 🌊`, `Şarj oluyorum 🔋`, `Güneş, kitap, sessizlik ☀️📖`, `Kafa boşaltma operasyonu başarılı 😎`]),
    fx: { morale: 3, coach: -2 }, reach: 1.2, risk: (st, c) => (c.lm && c.lm.result === 'L' ? 0.45 : 0.08), riskWhy: 'kötü gidişatta tatil paylaşımı', cooldown: 6 },
  { id: 'jab', label: `${RIVAL_NAME}'e laf sok`, emoji: '😏', img: null, when: (st) => !!st.social.rival,
    text: (st, c) => pick([`Bazıları konuşur, biz sahada gösteririz 😏`, `Gol krallığı listesine bakmak isteyenler… aşağı kaydırsın 😂`, `Kopya çekerek bir yere gelinmez. Kimden bahsettiğimi biliyor 😉`, `Rakip mi? Hangi rakip? 🤷‍♂️`, `Konuşmak kolay, istatistik ortada 📊`, `Gürültü çok, gol az 🤫`, `Herkes kendi kariyerine baksın 😉`, `Akademide de aynıydı, hep bir adım öndeydim 🏃‍♂️💨`, `Rakiplerime iyi şanslar. İhtiyaçları olacak 😏`]),
    fx: { heat: 15, fans: 1 }, reach: 2.2, risk: (st, c) => c.lm && c.lm.result === 'L' ? 0.4 : 0.15, riskWhy: 'rakibe laf sokma' },
  { id: 'bench', label: 'Süre almamaya sitem', emoji: '😤', img: 'locker', when: (st, c) => c.lm && !c.lm.played || (st.player.season?.apps || 0) < (st.season.week * 0.6),
    text: () => pick([`Hazırım. Tek istediğim forma. 🤐`, `Sabır… bir yere kadar.`, `Sahada olmak isterdim. 😔`, `Ben de oynamak istiyorum, bu kadar basit.`, `Bekliyorum… ama sonsuza kadar değil.`, `Kulübeden maç izlemek bana göre değil 😔`, `Sahayı özledim.`]),
    fx: { coach: -6, fans: 2, team: -2 }, reach: 1.8, risk: () => 0.25, riskWhy: 'kulübe sitem' },
  { id: 'sorry', label: 'Özür paylaşımı', emoji: '🙇', img: 'press', when: (st) => !!st.social.crisis,
    text: () => `Kimseyi kırmak istemedim. Herkesten, özellikle taraftarımızdan özür dilerim. 🙏`,
    fx: { fans: 4, coach: 2, morale: -2 }, reach: 1.5, endsCrisis: true },
];

export function composeOptions(state) {
  const s = ensure(state);
  const c = ctx(state);
  const now = ABS(state);
  return TEMPLATES.filter((t) => t.when(state, c)).map((t) => {
    const last = s.posts.find((x) => x.tpl === t.id);
    const wait = t.cooldown && last ? t.cooldown - (now - last.abs) : 0;
    return { ...t, wait: wait > 0 ? wait : 0, risk: t.risk ? t.risk(state, c) : 0 };
  });
}
function ctx(state) {
  const lm = state.player.lastMatch;
  const now = ABS(state);
  return { lm: lm && now - lm.abs <= 1 ? lm : null, s: state.social };
}
export const POSTS_PER_WEEK = 1;

export function post(state, tplId) {
  const s = ensure(state), p = state.player;
  if (s.weekPosts >= POSTS_PER_WEEK) return { ok: false, msg: `Bu hafta ${POSTS_PER_WEEK} paylaşım yaptın. Takipçilerini yorma 😅` };
  const t = composeOptions(state).find((x) => x.id === tplId);
  if (!t) return { ok: false, msg: 'Bu paylaşım şu an uygun değil.' };
  if (t.wait) return { ok: false, msg: `Bunu yakın zamanda paylaştın (${t.wait} hafta sonra).` };
  const c = ctx(state);
  const fx = { ...t.fx };
  if (t.risk) { fx.crisis = t.risk; fx.crisisWhy = t.riskWhy; }
  const reach = s.followers * (0.04 + rand(0, 0.05)) * t.reach * (s.crisis ? 0.6 : 1);
  const growth = t.reach * rand(0.4, 1.4) * (s.crisis ? -0.5 : 1);
  fx.followersPct = Math.round(growth * 10) / 10;
  const res = applyFx(state, fx);
  if (t.endsCrisis && s.crisis) { s.crisis = null; addInbox(state, `🙇 Özür paylaşımı karşılık buldu, linç dindi.`); }
  const text = t.text(state, c);
  const pst = { id: id(), abs: ABS(state), tpl: t.id, emoji: t.emoji, img: typeof t.img === 'function' ? t.img() : t.img, text, likes: Math.round(reach), comments: makeComments(state, t, res.crisis), sponsored: null };
  s.posts.unshift(pst); s.posts = s.posts.slice(0, 30);
  s.weekPosts++;
  if (t.id === 'jab') rivalAnswer(state);
  const coach = coachReaction(state, t, c, res.crisis);
  return { ok: true, post: pst, summary: res.summary + (coach ? ` · ${coach}` : ''), crisis: res.crisis };
}

const PRAISE = ['Kralsın 👑', 'Efsane yolda 🔥🔥', 'Seninle gurur duyuyoruz ❤️', 'Bu adam başka 🙌', 'Milli takıma! 🇹🇷', 'Gol makinesi ⚽⚽', 'Tribünler seninle 🎺', 'Senin gibi oyuncu 10 yılda bir gelir 🙌', 'Formanın hakkını veriyorsun ❤️', 'Avrupa seni bekliyor 🌍', 'Kalitene hayranım', 'Abi bir gol de bize at 😍', 'Gelecek senin 👑', 'Sahada sanat yapıyorsun 🎨', 'Her maçta daha iyisin 📈', 'Okulda herkes seni konuşuyor 😎', 'Ailecek hayranınız ❤️', 'Bu sezon gol kralı sensin!', 'Sen varsan umut var 🙏'];
const CRITIC = ['Paylaşım yapacağına antrenman yap', 'Geçen maç neredeydin?', 'Bu formaya yakışmıyorsun', 'Önce sahada göster', 'Abartılan oyuncu', 'Çok konuşuyorsun, az oynuyorsun', 'Sosyal medyayı bırak, kondisyona bak', 'Bu performansla zor', 'Maaşını hak et önce', 'Her maç aynı hatalar…', 'Hoca seni neden oynatıyor anlamadım', 'Biraz alçakgönüllü ol', 'Topu bir kere de pasla', 'Paylaşım çok, gol yok'];
const TROLL = ['Ahmet Akyurt senden iyi 😂', 'Yedek kulübesinin kralı 😂', 'Hangi maçta gol attın da?', '🤡🤡🤡', "Abi FIFA'da bile 60 güç 😂", 'Kramponlar güzel, ayaklar? 😂', "Bu fotoğrafın xG'si senden yüksek 😂", 'Ofsayt kralı 👑😂', 'Takipçi satın almışsın 😂', 'Kaleci bile senden çok gol atar 😂', 'Yine mi sen 🙄'];
const FUNNY = ['Bu fotoğrafı bizim mahalle maçında da çekeriz 😂', 'Saç kaç lira abi 😂', 'İmzalı forma lazım 🥺', 'Sen bu hızla gidersen Avrupa\'dan teklif gelir', "Bu açıdan Messi'ye benziyorsun 😂 (benzemiyorsun)", 'Abi kramponları bana verir misin, yarın halı saha var', 'Benim annem de beğendi bunu 😂', 'Saçın golden daha güzel olmuş 😂', 'Abi bu fotoğrafı kim çekti, ona da teklif gelsin 😂', 'Paylaşım saatine bakın, uykusuz futbolcu 😂', 'Hayranlıkla izliyorum ama bir ricam var: ilk 11!'];
function makeComments(state, t, crisis) {
  const p = state.player, s = state.social, out = [];
  const n = randInt(3, 5);
  const mood = crisis ? 0.2 : t.id === 'loss' || t.id === 'sorry' ? 0.45 : clamp((p.fans ?? 50) / 100, 0.3, 0.9);
  for (let i = 0; i < n; i++) {
    const r = Math.random();
    if (r < mood) out.push({ who: fanAuthor(), text: pick(t.id === 'love' ? ['Çok yakışıyorsunuz 😍', 'Allah mesut etsin ❤️', ...PRAISE] : PRAISE), tone: 'praise' });
    else if (r < mood + 0.12) out.push({ who: fanAuthor(), text: pick(FUNNY), tone: 'funny' });
    else if (r < mood + 0.3) out.push({ who: fanAuthor(), text: crisis && s.crisis ? `${pick(CRITIC)} ${s.crisis.tag}` : pick(CRITIC), tone: 'critic', reply: true });
    else out.push({ who: fanAuthor(), text: pick(TROLL), tone: 'troll', reply: true });
  }
  // takım arkadaşından emoji (gerçek isim, sadece olumlu emoji)
  const mates = state.teams[p.clubId].squad.filter((x) => x.name !== RIVAL_NAME);
  if (mates.length && Math.random() < 0.6) { const m = pick(mates); out.unshift({ who: { name: m.name, handle: tr(m.name), av: '⚽', mate: true }, text: pick(['🔥🔥', '👏👏', '💪', '⚽❤️', '🙌']), tone: 'mate' }); }
  if (p.partner && t.id === 'love') out.unshift({ who: { name: p.partner.name, handle: tr(p.partner.name), face: 'partner' + (p.partner.portrait ?? 0) }, text: pick(['Seni seviyorum ❤️', '😍😍', 'Benim yıldızım ⭐']), tone: 'love' });
  if (s.rival && (t.id === 'jab' || t.id === 'goal' || (Math.random() < s.rival.heat / 250))) out.push({ who: { name: RIVAL_NAME, handle: tr(RIVAL_NAME), rival: true }, text: pick(['Şans işte 😂', 'Bekle beni 😉', 'Hâlâ benim gölgemdesin', 'Sahada görüşürüz kardeşim 😏', 'Güzel… ama yetmez 🥱']), tone: 'rival', reply: true });
  // karakterler (Emir, Akif, Mert, Ömer, Eren) öne
  const pc = personaComments(state, t, crisis);
  const lead = out.filter((c) => c.tone === 'mate' || c.tone === 'love'), riv = out.filter((c) => c.tone === 'rival'), rest = out.filter((c) => !lead.includes(c) && !riv.includes(c));
  const all = [...lead, ...riv, ...pc, ...rest].slice(0, 8);
  // en fazla 2 cevaplanabilir sıradan yorum (rakip ve karakterler hariç)
  let n2 = 0;
  for (const c of all) if (c.reply && c.tone !== 'rival' && !c.who.persona && ++n2 > 2) c.reply = false;
  return all;
}

// yorum cevapları
export const REPLIES = {
  eren: [
    { label: 'Abine selam söyle 😉', text: 'Abine selam söyle, sahada görüşürüz 😉', fx: { heat: 3, fans: 1 } },
    { label: 'Takıma gel 😄', text: 'Gel seni bizim takıma alalım, abinden iyisin 😄', fx: { followersPct: 0.8, heat: -2 } },
    { label: 'Sen karışma ufaklık', text: 'Sen karışma ufaklık, abin konuşsun!', fx: { heat: 8, followersPct: 1, crisis: 0.12, crisisWhy: 'Ahmet\'in küçük kardeşine çıkışma' } },
  ],
  critic: [
    { label: 'Kibar cevap', text: 'Haklı olabilirsin, daha çok çalışacağım 🙏', fx: { fans: 1 } },
    { label: 'Espri yap', text: 'Gel bir antrenmana, beraber koşalım 😄', fx: { fans: 1, followersPct: 0.4 }, odds: 0.75, bad: { fans: -1 } },
    { label: 'Sert cevap', text: 'Klavye başında futbol kolay, sahaya gel de görelim!', fx: { fans: -2, followersPct: 0.8, crisis: 0.35, crisisWhy: 'taraftara sert cevap' } },
  ],
  troll: [
    { label: 'Ti\'ye al', text: 'Ben de seni seviyorum 😘', fx: { fans: 1, followersPct: 0.5 } },
    { label: 'Engelle', text: '(engellendi)', fx: {} },
    { label: 'Laf yetiştir', text: 'Önce kendi hayatına bak!', fx: { followersPct: 0.6, fans: -1, crisis: 0.2, crisisWhy: 'trol kavgası' } },
  ],
  rival: [
    { label: 'Sahada görüşürüz', text: 'Sahada konuşuruz 😉', fx: { heat: 5, fans: 1, followersPct: 0.6 } },
    { label: 'Takma', text: '👋', fx: { heat: -5 } },
    { label: 'Ağır laf', text: 'Sen önce kadroya gir, sonra konuşursun 😂', fx: { heat: 15, followersPct: 1.5, crisis: 0.2, crisisWhy: 'rakiple atışma' } },
  ],
};
export function reply(state, postId, ci, oi) {
  const s = ensure(state);
  const pst = s.posts.find((x) => x.id === postId), c = pst?.comments[ci];
  if (!c || !c.reply || c.answered) return { ok: false };
  const o = REPLIES[c.tone]?.[oi]; if (!o) return { ok: false };
  let fx = o.fx;
  if (o.odds && Math.random() > o.odds) fx = o.bad;
  c.answered = o.text;
  const r = applyFx(state, fx);
  if (c.tone === 'rival' && o.fx.heat > 10) rivalAnswer(state);
  return { ok: true, summary: r.summary, crisis: r.crisis };
}

function rivalAnswer(state) {
  const s = state.social;
  pushFeed(s, rivalAuthor(state), pick([`Biri bana laf atmış… Ben cevabımı sahada veririm 🥱`, `Gölgemden çık önce 😂`, `Kıskançlık kötü hastalık, geçmiş olsun 🤒`, `İstatistikler ortada. Gerisi gürültü 📊`, `Sahada cevap veremeyen, telefonda kahraman 😂`, `Benimle uğraşacağına antrenman yap kardeşim 💪`, `Etiketlemeye gerek yok, kim olduğunu biliyoruz 🙄`]), { likes: s.rival.followers * rand(0.03, 0.08) });
  s.rival.heat = clamp(s.rival.heat + 5, 0, 100);
}

// ---------------------------------------------------------------- DM
function dm(s, from, text, options = null, o = {}) {
  if (s.dms.some((d) => !d.done && d.text === text)) return;
  from.handle ??= tr(from.name);
  s.dms.unshift({ id: id(), from, text, options, done: null, read: false, abs: o.abs ?? null, kind: o.kind || '', img: o.img || null });
  s.dms = s.dms.slice(0, 30);
}
export function answerDm(state, dmId, oi) {
  const s = ensure(state);
  const d = s.dms.find((x) => x.id === dmId);
  if (!d || d.done || !d.options) return { ok: false };
  const o = d.options[oi]; if (!o) return { ok: false };
  let fx = o.fx || {}, text = o.result || '';
  let sponsor = o.sponsor;
  if (o.odds !== undefined) { const win = Math.random() < o.odds; const br = win ? o.win : o.lose; fx = br.fx; text = br.result; sponsor = br.sponsor; }
  if (fx.money && fx.money < 0 && state.player.money < -fx.money) return { ok: false, msg: 'Paran yetmiyor.' };
  const r = applyFx(state, fx);
  if (sponsor) sponsoredPost(state, sponsor, fx.money);
  const fpost = o.odds !== undefined ? (text === o.win?.result ? o.win.post : null) : o.post;
  if (fpost) photoPost(state, fpost.img, fpost.text);
  d.done = { label: o.label, text, summary: r.summary };
  d.read = true;
  return { ok: true, text, summary: r.summary };
}
// Senaryo sonrası kendi paylaşımın (fotoğraflı)
function photoPost(state, img, text) {
  const s = state.social;
  const pst = { id: id(), abs: ABS(state), tpl: 'scn', emoji: '📸', img, text, likes: Math.round(s.followers * rand(0.05, 0.12)), sponsored: null,
    comments: [{ who: fanAuthor(), text: pick(PRAISE), tone: 'praise' }, { who: fanAuthor(), text: pick(['❤️❤️', 'Helal olsun 👏', 'Örnek insan 🙌']), tone: 'praise' }] };
  s.posts.unshift(pst); s.posts = s.posts.slice(0, 30);
}
function sponsoredPost(state, brand, pay) {
  const s = state.social;
  s.sponsorWeeks.push(ABS(state)); s.sponsorWeeks = s.sponsorWeeks.filter((w) => ABS(state) - w < 10);
  const tooMany = s.sponsorWeeks.length >= 3;
  const pst = { id: id(), abs: ABS(state), tpl: 'ad', emoji: brand.av, img: AD_IMAGES.has(tr(brand.name) + '_' + brand.cat) ? 'ad_' + tr(brand.name) + '_' + brand.cat : AD_IMAGES.has(brand.cat) ? 'ad_' + brand.cat : null, text: `${brand.item} ${brand.av} @${tr(brand.name)} ile her zaman bir adım önde! #reklam #işbirliği`, likes: Math.round(s.followers * rand(0.02, 0.04)), sponsored: brand.name, comments: [] };
  pst.comments = tooMany
    ? [{ who: fanAuthor(), text: 'Futbolcu musun reklam panosu mu? 🙄', tone: 'critic', reply: true }, { who: fanAuthor(), text: 'Yine mi reklam…', tone: 'critic', reply: true }]
    : [{ who: fanAuthor(), text: 'Nereden alınıyor? 😍', tone: 'praise' }, { who: fanAuthor(), text: pick(PRAISE), tone: 'praise' }];
  if (tooMany) { state.player.fans = clamp((state.player.fans ?? 50) - 2, 0, 100); addInbox(state, 'Çok fazla reklam paylaşımı taraftarı rahatsız etti (Taraftar −2).'); }
  s.posts.unshift(pst); s.posts = s.posts.slice(0, 30);
}
// Gemini reklam görselleri geldikçe eklenir: img/news/ad_<marka>_<kategori>.jpg ya da ad_<kategori>.jpg
export const adImg = (b) => AD_IMAGES.has(tr(b.name) + '_' + b.cat) ? 'ad_' + tr(b.name) + '_' + b.cat : AD_IMAGES.has(b.cat) ? 'ad_' + b.cat : null;
export const AD_IMAGES = new Set(['like_krampon', 'amigos_krampon', 'like_giyim', 'lion_giyim', 'saatcim_saat', 'parfumcuben_parfum', 'temizadam_sampuan', 'songlasses_gozluk', 'defneakyazi_su', 'proteinoecn_protein', 'piq_protein', 'playarena_konsol', 'xxxbox_konsol', 'bjet_havayolu', 'zensizolmaz_kozmetik', 'readme_kulaklik', 'xxxaomi_telefon', 'pinkbull_enerji']);
export const sponsorPay = (s) => Math.round(clamp(s.followers * 2.2, 15_000, 60_000_000) / 1000) * 1000;

function weeklyDms(state, c) {
  const s = state.social, p = state.player, now = ABS(state);
  const roll = () => Math.random();
  // sponsor
  if (roll() < 0.22 + Math.min(0.2, s.followers / 5e6)) {
    const pool = BRANDS.filter((x) => s.followers >= x.min && (x.cat !== 'kozmetik' || p.partner));
    const b = pick(pool), pay = Math.round(sponsorPay(s) * b.k * rand(0.8, 1.25) / 1000) * 1000;
    const extra = b.fx || {};
    dm(s, { name: b.name, av: b.av, brand: true }, `Merhaba! ${b.name} olarak seninle çalışmak istiyoruz. ${b.item[0].toLocaleUpperCase('tr-TR') + b.item.slice(1)} temalı tek bir paylaşım için ${money(pay)} teklif ediyoruz. #reklam etiketiyle paylaşman yeterli.${b.cat === 'bahis' ? ' (Bahis reklamı taraftarı kızdırabilir.)' : ''}`, [
      { label: 'Kabul et', fx: { money: pay, ...extra }, sponsor: b, result: 'Anlaştınız, paylaşım profilinde.' },
      { label: 'Pazarlık et', odds: 0.55, win: { fx: { money: Math.round(pay * 1.4), ...extra }, result: 'Pazarlık işe yaradı! %40 fazlasına anlaştınız.', sponsor: b }, lose: { fx: {}, result: 'Marka geri çekildi.' } },
      { label: 'Reddet', fx: {}, result: 'Teşekkür edip reddettin.' },
    ], { abs: now, kind: 'sponsor', img: adImg(b) });
  }
  // rakip
  if (s.rival && roll() < 0.12 + s.rival.heat / 400) {
    dm(s, { name: RIVAL_NAME, rival: true }, pick([`Bu sezon gol krallığı benim, haberin olsun 😏`, `Derbide görüşürüz. Hazır ol 🔥`, `Yine benim gölgemdesin kardeşim 😂`, `Akademi günlerini hatırlıyor musun? Hep bir adım öndeydim.`]), [
      { label: 'Göreceğiz 😉', fx: { heat: 5, morale: 2 }, result: 'Mesaj görüldü.' },
      { label: 'Ekran görüntüsü al, paylaş', fx: { heat: 20, followersPct: 3, crisis: 0.25, crisisWhy: 'özel mesajı ifşa etme' }, result: 'Ekran görüntüsü ortalığı karıştırdı!' },
      { label: 'Cevap verme', fx: { heat: -5 }, result: 'Görüldü bıraktın.' },
    ], { abs: now, kind: 'rival' });
  }
  // taraftar ricası
  if (roll() < 0.12) dm(s, fanAuthor(), pick([`Abi oğlum hastanede, seni çok seviyor. Ona kısa bir video atar mısın? 🥺`, `Okulumuzda turnuva var, bir destek mesajı atar mısın? ⚽`, `Doğum günüm bugün, bir "iyi ki doğdun" yazar mısın 🎂`]), [
    { label: 'Video gönder ❤️', fx: { fans: 3, fame: 1, energy: -3, followersPct: 1 }, result: 'Video viral oldu! Herkes bu jesttan bahsediyor.' },
    { label: 'Kısa mesaj yaz', fx: { fans: 1 }, result: 'Çok sevindiler.' },
    { label: 'Boş ver', fx: { fans: -1 }, result: 'Mesaj cevapsız kaldı.' },
  ], { abs: now, kind: 'fan' });
  // sevgili
  if (p.partner && roll() < 0.18) dm(s, { name: p.partner.name, face: 'partner' + (p.partner.portrait ?? 0) }, pick([`Akşam yemeğe gelecek misin? ❤️`, `Paylaşımlarında beni hiç etiketlemiyorsun 😒`, `Maçını izledim, gurur duydum 😍`]), [
    { label: 'Tatlı cevap 💕', fx: { partner: 4 }, result: 'Kalp attı 😍' },
    { label: 'Sonra konuşuruz', fx: { partner: -3 }, result: 'Biraz bozuldu…' },
  ], { abs: now, kind: 'partner' });
  // magazin
  if (roll() < 0.08) dm(s, PAGES.magazin, `Merhaba, ben Lara Ses. Hakkında çıkan bir dedikoduyu doğrulamak istiyoruz. Bir açıklaman var mı?`, [
    { label: 'Yalanla', fx: { fame: 1 }, result: 'Kısa bir yalanlama yaptın.' },
    { label: 'Esprili cevap', odds: 0.6, win: { fx: { fame: 2, followersPct: 2 }, result: 'Cevabın çok tutuldu!' }, lose: { fx: { fans: -2 }, result: 'Espri yanlış anlaşıldı…' } },
    { label: 'Görmezden gel', fx: {}, result: 'Haber yine de çıktı ama sönük kaldı.' },
  ], { abs: now, kind: 'gossip' });
  // dolandırıcı (komik)
  if (roll() < 0.05) dm(s, { name: 'KriptoKral_Ödül', av: '💰' }, `TEBRİKLER! 🎉 Ünlü futbolculara özel KoinGol fırsatı! ${money(500_000)} yatır, bir haftada 10 katı!`, [
    { label: 'Yatır 🤑', fx: { money: -500_000 }, result: 'Hesap kayboldu. Paran da… 💸 (Dolandırıldın)' },
    { label: 'Şikâyet et', fx: { fans: 1 }, result: 'Hesap kapatıldı. Takipçilerini de uyardın.' },
  ], { abs: now, kind: 'scam' });
}

// ---------------------------------------------------------------- haftalık
export function weekly(state) {
  const s = ensure(state); if (!s) return;
  const p = state.player, now = ABS(state);
  if (s.lastWeek === now) return;
  s.lastWeek = now;
  const c = ctx(state), lm = c.lm && c.lm.abs === now ? c.lm : null, r = s.rival;
  // Ahmet de seninle birlikte gelişir (güç farkı sabit kalır)
  const rv = state.teams[r?.team]?.squad.find((x) => x.rival);
  if (rv) { rv.ovr = clamp(Math.round(overall(p) + (r.edge ?? 1)), 45, 95); rv.age = p.age; r.ovr = rv.ovr; }
  const rg = rivalGoals(state);
  const me = meAuthor(state), myTeam = state.teams[p.clubId];
  // rakip senkron: senin gücüne yakın, bazen öne geçer
  r.edge = clamp((r.edge ?? 1) + rand(-0.6, 0.6), -4, 5);
  r.ovr = clamp(Math.round(overall(p) + r.edge), 45, 95);
  const rp = state.teams[r.team]?.squad.find((x) => x.name === RIVAL_NAME);
  if (rp) { rp.ovr = r.ovr; rp.age = p.age; } else placeRival(state, r.team, true);
  // takipçi
  const fame = p.fame || 0;
  let g = s.followers * rand(0.002, 0.008) + fame * fame * rand(4, 8);
  if (lm?.played) g += (lm.goals * 900 + lm.assists * 300) * (1 + fame / 12) + (lm.rating >= 8 ? fame * 400 : 0);
  if (s.crisis) g = -s.followers * 0.012;
  s.followers = Math.max(100, Math.round(s.followers + g));
  r.followers = Math.round(r.followers * rand(1.001, 1.012) + (rg.week || 0) * 1500 * (1 + fame / 15));
  for (const m of [1e4, 1e5, 1e6, 1e7]) if (s.followers >= m && !(s.milestones ||= []).includes(m)) { s.milestones.push(m); p.fame = clamp(fame + 2, 0, 100); addInbox(state, `📱 ${APP}'ta ${fmtF(m)} takipçiye ulaştın! (Ün +2)`); }
  // kriz
  if (s.crisis) {
    s.crisis.weeks--;
    p.fans = clamp((p.fans ?? 50) - 1.5, 0, 100);
    if (s.crisis.weeks <= 0) { pushFeed(s, PAGES.gundem, `${s.crisis.tag} etiketi gündemden düştü. Tartışmalar yatıştı.`, {}); s.crisis = null; }
  }
  // akış
  if (lm) {
    const opp = state.teams[lm.opp];
    const sc = lm.home ? `${myTeam.name} ${lm.myG}-${lm.opG} ${opp.name}` : `${opp.name} ${lm.opG}-${lm.myG} ${myTeam.name}`;
    pushFeed(s, { name: myTeam.name, handle: tr(myTeam.name), club: p.clubId, verified: true }, `MS | ${sc}${lm.goals ? `\n⚽ ${p.name} ${p.surname}${lm.goals > 1 ? ` ×${lm.goals}` : ''}` : ''}${lm.result === 'W' ? '\n💪 Galibiyet bizim!' : ''}`, { likes: s.followers * rand(0.3, 0.8), img: lm.result === 'W' ? 'cheer' : null });
    if (lm.played) {
      const good = lm.rating >= 7.5, bad = lm.rating < 5.8;
      for (let i = 0; i < 2; i++) pushFeed(s, fanAuthor(), good ? pick([`${p.surname} bugün şov yaptı 🔥`, `Maçın adamı belli: ${p.name} ${p.surname} 👑`, `Bu çocuk büyük oyuncu olacak!`, `Bugün ${p.surname} izlemek için para verilir 🎟️`, `${p.surname} sahada döktürdü, rakip defans hâlâ arıyor 😂`, `Bu çocuğun önünde kimse duramaz!`, `${p.surname} = garanti şov 🔥`])
        : bad ? pick([`${p.surname} bugün yoktu sahada 😴`, `Bu performansla forma giyemez`, `Hoca neden oynattı anlamadım`, `${p.surname} sahaya çıkmış mıydı? Fark etmedim 🙄`, `Bugün ${p.surname} için unutulacak bir gün.`, `Bu kadar top kaybı olur mu ya?`, `${p.surname} dinlenmeli bence, yorgun görünüyor.`])
        : pick([`Fena değildi ${p.surname}, daha iyisini bekliyoruz`, `Takım olarak daha iyi olmalıyız`, `Orta karar bir maç`, `${p.surname} vasattı ama çabası iyiydi.`, `Ne iyi ne kötü. ${p.surname} daha fazlasını yapabilir.`, `Bir iki pozisyon kaçtı, olur böyle.`]), { likes: randInt(50, 1500) * (1 + fame / 20) });
      if (good) s.trends.unshift(`#${tr(p.surname)}`);
    }
    if (lm.derby) s.trends.unshift('#Derbi');
    // karakterlerin maç yorumları
    const key = lm.goals > 0 ? 'goal' : lm.result === 'W' ? 'win' : lm.result === 'L' ? 'loss' : 'any';
    for (const k of ['emir', 'omer', 'mert']) if (Math.random() < 0.35) pushFeed(s, personaAuthor(k), personaLine(state, k, key), { likes: randInt(80, 2500) });
    // rakip takıma karşı oynandıysa
    if (lm.opp === r.team) {
      const ahmetGoal = (lm.oppScorers || []).filter((x) => x === RIVAL_NAME).length;
      if (lm.result === 'W') {
        pushFeed(s, rivalAuthor(state), pick([`Hakem bugün sahadaydı ama bizim için değil… 🤐`, `Futbol bazen adil değil. Rövanş var.`, `Bir maç kaybettik, savaşı değil.`, `Kazanan kazandı, tebrik ederim. Ama rövanş bizim 😤`, `Bugünlük bu kadar. Defter kapanmadı 📒`, `Bu akşam sessizlik. Sonra konuşuruz.`]), { likes: r.followers * 0.04 });
        pushFeed(s, fanAuthor(), pick([`${RIVAL_NAME} yine ${p.surname}'ın gölgesinde kaldı 😂 #${tr(RIVAL_NAME)}`, `${RIVAL_NAME} bu maçı hiç unutmayacak 😂`, `Derbinin kralı belli oldu 👑 #${tr(RIVAL_NAME)}`, `Ahmet'in yüzündeki ifadeyi gördünüz mü 😂`]), { likes: randInt(500, 5000) });
        r.heat = clamp(r.heat + 8, 0, 100);
        s.trends.unshift(`#${tr(RIVAL_NAME)}`);
      } else if (lm.result === 'L') {
        pushFeed(s, rivalAuthor(state), `${ahmetGoal ? `${ahmetGoal > 1 ? `${ahmetGoal} gol` : 'Golümü'} attım, ` : ''}maçı aldık. @${s.handle} bir dahakine 😉`, { likes: r.followers * 0.1, img: ahmetGoal ? 'rivalgoal' : null });
        r.heat = clamp(r.heat + 12, 0, 100);
        s.trends.unshift(`#${tr(RIVAL_NAME)}`);
        if (s.posts[0]) s.posts[0].comments.push({ who: { name: RIVAL_NAME, handle: tr(RIVAL_NAME), rival: true }, text: 'Skor tabelasına baktın mı? 😂', tone: 'rival', reply: true });
      } else pushFeed(s, rivalAuthor(state), `Beraberlik… ama kim daha iyiydi, herkes gördü 😏`, { likes: r.followers * 0.03 });
    }
  }
  // rakibin haftası
  if (rg.week > 0 && Math.random() < 0.6) pushFeed(s, personaAuthor('eren'), pick([`Abim yine yaptı!! 🔥 Sezon: ${rg.season}`, `ABİMMM ⚽⚽ Kimse onu durduramaz`, `Abimin golünü ${state.player.surname} izlemiş mi acaba 😏`]), { likes: randInt(200, 3000) });
  if (rg.week > 0 && lm?.opp !== r.team) pushFeed(s, rivalAuthor(state), pick([`${rg.week > 1 ? `${rg.week} gol` : 'Bir gol daha'} ⚽ Sezon: ${rg.season}. Takipte kalın 😎`, `Ağları sarsmaya devam ⚽🔥 (${rg.season})`, `Gol krallığı yarışı mı? Ben sadece işimi yapıyorum 🤷‍♂️`, `Bir gol daha ⚽ Sayıyı tutmayı bıraktım, siz sayın 😎`, `Gol attım, bazıları yine kıskanacak 😂`, `Bu sezon benim sezonum. Not alın 📝`]), { likes: r.followers * rand(0.04, 0.09), img: Math.random() < 0.6 ? 'rivalgoal' : null });
  else if (Math.random() < 0.25) pushFeed(s, rivalAuthor(state), pick([`Antrenman bitti, sıra spor salonunda 💪`, `Yeni saç, yeni ben 💈`, `Hafta sonu hazırız 🔥`, `Sessiz çalış, gürültüyü sahada yap 🤫`, `Bugün kafa rahat, keyif yerinde 😎`, `Yeni kramponlar geldi 👟 Ağlar hazır olsun`, `Hafta sonu ezeli rakip kim? Fark etmez, kazanırız 😏`]), { likes: r.followers * 0.03, img: Math.random() < 0.4 ? 'locker' : null });
  if (Math.random() < 0.4) akifPost(state);
  // gazeteci / kulis
  if (Math.random() < 0.35) {
    const pos = sortedTable(state.season.leagues[leagueOf(state, p.clubId)].table).findIndex((x) => x.id === p.clubId) + 1;
    // kulis: yazar bir gazeteci, metin oyunun gerçek durumuna dayanır (transfer söylentileri tek kaynaktan: weeklyRumors)
    const lines = [`${myTeam.name} ligde ${pos}. sırada. ${p.surname}'ın formu belirleyici olacak.`, `${p.name} ${p.surname} için antrenmanda en çok çalışan oyuncu diyorlar 👀`];
    if ((p.rel?.coach ?? 50) >= 60) lines.push(`Hoca, ${p.surname}'ın gelişiminden çok memnun.`);
    if ((p.rel?.coach ?? 50) < 40) lines.push(`Hoca ile ${p.surname} arasında soğuk rüzgârlar estiği konuşuluyor.`);
    if (p.contract?.endsYear <= state.season.year + 1) lines.push(`Kulübün ${p.surname} ile sözleşme uzatmak istediği konuşuluyor ✍️`);
    if (s.rival && state.social?.rival?.team) lines.push(`Kulis: ${p.surname} ile ${RIVAL_NAME} rekabeti bu sezon da gündemde.`);
    pushFeed(s, pick([PAGES.selin, PAGES.kenan]), pick(lines), { likes: randInt(1000, 12000) });
  }
  if (p.partner && Math.random() < 0.2) pushFeed(s, PAGES.magazin, `📸 ${p.name} ${p.surname} ve ${p.partner.name} akşam yemeğinde görüntülendi. Mutluluklarına diyecek yok 💕`, { likes: randInt(3000, 30000), img: 'paparazzi' });
  if (Math.random() < 0.2) pushFeed(s, PAGES.kulis, pick([`${RIVAL_NAME} için yurt dışından teklif iddiası! 🚨`, `Sezon sonunda büyük transfer hareketliliği bekleniyor.`, `${p.surname} için menajerine kulüplerden telefon yağıyor.`, `Bu hafta 3 kulüp menajerlerle görüştü 🚨`, `${RIVAL_NAME}'un kardeşi Eren de altyapı seçmelerine katılmış 👀`, `Ara transfer döneminde sürpriz isimler gündemde.`]), { likes: randInt(2000, 25000) });
  // gündem
  s.trends = [...new Set([...(s.crisis ? [s.crisis.tag] : []), ...s.trends, `#${myTeam.name.replace(/\s+/g, '')}`, '#TransferDönemi'])].slice(0, 6);
  // hikâyeler, anketler, söylentiler, karakter paylaşımları
  weeklyStories(state, lm);
  weeklyPoll(state, lm);
  weeklyRumors(state);
  personaTweets(state);
  goalOfWeek(state, lm);
  if (Math.random() < 0.35) ertemPost(state);
  agentDms(state);
  s.weekStory = 0;
  // DM'ler: 3 haftadır cevapsız kalanlar kapanır
  for (const d of s.dms) if (!d.done && d.options && d.abs != null && now - d.abs >= 3) { d.done = { label: 'Cevapsız kaldı', text: '', summary: '' }; d.read = true; }
  weeklyDms(state, c);
  s.weekPosts = 0;
}

// Akif Ünlü: ligdeki oyuncular ve takımlar hakkında istatistik paylaşımları
function akifPost(state) {
  const p = state.player, lid = leagueOf(state, p.clubId);
  const tn = (id) => state.teams[id]?.name || id;
  const st = leagueStats(state, lid).map((x) => ({ ...x, name: x.me ? `${p.name} ${p.surname}` : x.name }));
  const tbl = sortedTable(state.season.leagues[lid].table);
  const wk = state.season.week + 1;
  const opts = [];
  const sc = st.slice().sort((a, b) => b.g - a.g || b.a - a.a).filter((x) => x.g > 0);
  if (sc.length >= 3) opts.push(`⚽ ${wk}. hafta sonunda gol krallığı\n${sc.slice(0, 5).map((x, i) => `${i + 1}. ${x.name} (${tn(x.teamId)}) — ${x.g}`).join('\n')}`);
  const as = st.slice().sort((a, b) => b.a - a.a || b.g - a.g).filter((x) => x.a > 0);
  if (as.length >= 3) opts.push(`🅰️ Asist krallığı\n${as.slice(0, 5).map((x, i) => `${i + 1}. ${x.name} (${tn(x.teamId)}) — ${x.a}`).join('\n')}`);
  const ga = st.slice().sort((a, b) => (b.g + b.a) - (a.g + a.a))[0];
  if (ga && ga.g + ga.a > 2) opts.push(`📊 Gol katkısında zirve: ${ga.name} (${tn(ga.teamId)})\n${ga.g} gol + ${ga.a} asist = ${ga.g + ga.a} katkı. ${wk} haftada maç başına ${((ga.g + ga.a) / Math.max(1, wk)).toFixed(2).replace('.', ',')} 🔥`);
  if (tbl.length && tbl[0].gf) {
    const att = tbl.slice().sort((a, b) => b.gf - a.gf)[0], def = tbl.slice().sort((a, b) => a.ga - b.ga)[0];
    opts.push(`📈 Ligin en golcü takımı ${tn(att.id)}: ${att.gf} gol.\n🧱 En az gol yiyen ${tn(def.id)}: sadece ${def.ga}.`);
    const lead = tbl[0], second = tbl[1];
    if (second) opts.push(`🏁 Zirvede ${tn(lead.id)} (${lead.pts} puan), ${tn(second.id)} ${lead.pts - second.pts} puan geride. Alt sıralarda da düşme savaşı kızışıyor 👀`);
  }
  const pick1 = sc.length > 3 ? pick(sc.slice(0, 10)) : null;
  if (pick1) {
    const teamG = tbl.find((r) => r.id === pick1.teamId)?.gf || 0;
    if (teamG) opts.push(`🔎 ${pick1.name}, ${tn(pick1.teamId)}'ın ${teamG} golünün ${pick1.g + pick1.a} tanesinde pay sahibi (%${Math.round((pick1.g + pick1.a) / teamG * 100)}).`);
  }
  const rg = rivalSeasonGoals(state);
  if (rg + p.season.goals > 0 && Math.random() < 0.4) opts.push(`🆚 Akademiden beri rakipler:\n${p.name} ${p.surname}: ${p.season.goals} gol, ${p.season.assists} asist\n${RIVAL_NAME}: ${rg} gol`);
  if (!opts.length) return;
  pushFeed(state.social, personaAuthor('akif'), pick(opts), { likes: randInt(400, 6000) });
}

export function rivalGoals(state) {
  const s = state.social, r = s?.rival;
  if (!r) return { season: 0, week: 0 };
  const k = `${r.team}|${RIVAL_NAME}`;
  const season = (state.season.ps?.[k]?.[0] || 0) + (state.euro?.ps?.[k]?.[0] || 0);
  const week = season - (r.lastSeen ?? season);
  r.lastSeen = season;
  return { season, week: Math.max(0, week) };
}
export function rivalSeasonGoals(state) {
  const r = state.social?.rival; if (!r) return 0;
  const k = `${r.team}|${RIVAL_NAME}`;
  return (state.season.ps?.[k]?.[0] || 0) + (state.euro?.ps?.[k]?.[0] || 0);
}
export const unread = (state) => (state.social?.dms || []).filter((d) => !d.read).length;


// ================================================================ HOCA TEPKİSİ
function coachReaction(state, t, c, crisis) {
  const p = state.player; p.weekFlags ||= {};
  const lost = c.lm && c.lm.result === 'L';
  if (crisis || t.id === 'bench' || (lost && ['holiday', 'car', 'love'].includes(t.id) && Math.random() < 0.35)) {
    if (Math.random() < (crisis || t.id === 'bench' ? 0.55 : 1)) {
      p.weekFlags.benched = true;
      if (p.rel) p.rel.coach = clamp(p.rel.coach - 3, 0, 100);
      addInbox(state, `📵 Hoca ${APP} paylaşımını görmüş ve hiç hoşlanmamış. Bu hafta kulübeden başlayacaksın.`);
      return 'Hoca rahatsız: bu hafta yedeksin';
    }
  }
  if (['training', 'coach', 'loss', 'sorry'].includes(t.id) && Math.random() < 0.3) {
    p.weekFlags.coachPromise = true;
    addInbox(state, `👍 Hoca ${APP} paylaşımını beğenmiş. Bu hafta forma şansın arttı.`);
    return 'Hoca beğendi 👍';
  }
  return '';
}

// ================================================================ HİKÂYELER (1 hafta = "24 saat")
export const STORY_TPL = [
  { id: 'matchday', label: 'Maç günü', emoji: '⚽', img: () => pick(['locker', 'soc_mirror']), text: 'Maç günü 🔥 Hazırız!', fx: { fans: 1 } },
  { id: 'gym', label: 'Spor salonu', emoji: '🏋️', img: 'gym', text: 'Ekstra mesai 💪', fx: { coach: 1 } },
  { id: 'food', label: 'Maç öncesi yemek', emoji: '🍝', img: null, text: 'Karbonhidrat yüklemesi 🍝', fx: {} },
  { id: 'music', label: 'Isınma müziği', emoji: '🎧', img: null, text: 'Bugünün şarkısı 🎧🔥', fx: { morale: 1 } },
  { id: 'car', label: 'Araba', emoji: '🏎️', img: 'car', text: 'Yola çıktık 🏁', fx: { fame: 1 }, when: (st) => st.player.owned?.some((x) => x.startsWith('car')) },
  { id: 'holiday', label: 'Tatil', emoji: '🏖️', img: 'holiday', text: 'Kısa bir nefes 🌊', fx: { morale: 2, coach: -1 } },
  { id: 'date', label: 'Sevgiliyle akşam', emoji: '💕', img: () => pick(['date', 'soc_dinner']), text: '❤️', fx: { partner: 3 }, when: (st) => !!st.player.partner },
];
export function storyOptions(state) { return STORY_TPL.filter((t) => !t.when || t.when(state)); }
export function postStory(state, tplId) {
  const s = ensure(state);
  if (s.weekStory) return { ok: false, msg: 'Bu hafta hikâye paylaştın. Yenisi gelecek hafta.' };
  const t = STORY_TPL.find((x) => x.id === tplId); if (!t) return { ok: false };
  const fx = { ...t.fx, followersPct: Math.round(rand(0.2, 0.7) * 10) / 10 };
  const res = applyFx(state, fx);
  s.stories = (s.stories || []).filter((x) => !x.mine);
  s.stories.unshift({ id: id(), mine: true, who: meAuthor(state), text: t.text, img: typeof t.img === 'function' ? t.img() : t.img, emoji: t.emoji, abs: ABS(state), views: Math.round(s.followers * rand(0.15, 0.35)), seen: true });
  s.weekStory = 1;
  return { ok: true, summary: res.summary };
}
function weeklyStories(state, lm) {
  const s = state.social, p = state.player, now = ABS(state);
  s.stories = (s.stories || []).filter((x) => now - x.abs < 1);   // bir haftalık ömür
  const add = (who, text, img, emoji) => s.stories.push({ id: id(), who, text, img, emoji, abs: now, seen: false });
  if (Math.random() < 0.6) add(rivalAuthor(state), pick(['Antrenman bitti 💪', 'Hafta sonu hazırız 🔥', 'Yeni kramponlar 👟', 'Kafa dinliyorum 🎧', 'Erken yatıyoruz, maç var 😴', 'Kardeşimle FIFA, 3-0 yendim 😂', 'Buz banyosu… -2 derece 🥶', 'Kahve ve motivasyon ☕']), pick(['locker', 'gym', null]), '😎');
  if (lm) add({ name: state.teams[p.clubId].name, handle: tr(state.teams[p.clubId].name), club: p.clubId }, `MS ${lm.myG}-${lm.opG} ${lm.result === 'W' ? '💪' : lm.result === 'L' ? '😔' : '🤝'}`, lm.result === 'W' ? 'cheer' : null, '⚽');
  if (Math.random() < 0.45) add(personaAuthor('emir'), pick(['Tribün hazır 📣', 'Bugün sesimiz kısılacak!', 'Atkılar boyunlarda 🧣', 'Stada 4 saat kaldı, ben şimdiden kapıdayım 😂', 'Yeni pankart hazırlandı 🎨', 'Deplasman otobüsünde şarkılar başladı 🚌🎶']), null, '📣');
  if (Math.random() < 0.35) add(personaAuthor('mert'), pick(['Bugünün capsi geliyor 😂', 'Ben ciddi bir paylaşım yapsam kim inanır 😂', 'Maç önü çekirdek stoku tamam 🌻', 'Hakemin performansını tahmin edin: 2/10 😂']), null, '😂');
  if (p.partner && Math.random() < 0.4) add({ name: p.partner.name, handle: tr(p.partner.name), face: 'partner' + (p.partner.portrait ?? 0) }, pick(['Kahve keyfi ☕', 'Maçı izliyorum 😍', 'Güzel bir gün ☀️', 'Formasını giydim, uğur getirsin 🍀', 'Tribünden selamlar 👋', 'Bu akşam sinema 🎬']), null, '💕');
}
export function seeStory(state, sid) { const st = state.social?.stories?.find((x) => x.id === sid); if (st) st.seen = true; return st; }

// ================================================================ CANLI YAYIN (4 haftada bir)
const LIVE_Q = [
  { by: 'fan', q: 'En sevdiğin futbolcu kim?', a: [['Takım arkadaşlarım 🙌', { team: 2, fans: 1 }], ['Kendim 😎', { fame: 1, fans: -1, followersPct: 0.5 }], ['Çocukluk kahramanım ⭐', { fans: 1 }]] },
  { by: 'eren', q: 'Abim Ahmet hakkında ne düşünüyorsun? 😏', a: [['Saygı duyarım', { heat: -5, fans: 1 }], ['Kim o? 😂', { heat: 12, followersPct: 1.5, crisis: 0.1, crisisWhy: 'canlı yayında rakibi küçümseme' }], ['Sahada konuşuruz 😉', { heat: 5, fans: 1 }]] },
  { by: 'fan', q: 'Transfer olacak mısın?', a: [['Kulübümde çok mutluyum ❤️', { fans: 3 }], ['Kapım herkese açık', { fans: -3, fame: 1 }], ['Menajerime sorun 😄', { followersPct: 0.5 }]] },
  { by: 'omer', q: 'Son maçtaki performansını nasıl değerlendiriyorsun?', a: [['Yetersizdi, telafi edeceğim', { fans: 2, coach: 1 }], ['Bence iyiydim', { fans: -2 }], ['Eleştirenler sahaya gelsin!', { followersPct: 1.5, crisis: 0.25, crisisWhy: 'canlı yayında taraftara çıkışma' }]] },
  { by: 'fan', q: 'Hocayla aran nasıl?', a: [['Hocama güveniyorum 🙏', { coach: 3 }], ['Bazen anlaşamıyoruz…', { coach: -5, fans: 1, crisis: 0.15, crisisWhy: 'canlı yayında hocayı eleştirme' }], ['Çalışmaya devam 💪', { coach: 1 }]] },
  { by: 'mert', q: 'Abi maçtan önce ne yiyorsun, bizim mahallede kokoreç diyorlar 😂', a: [['Makarna, klasik 🍝', { followersPct: 0.3 }], ['Kokoreç tabii ki 😂', { followersPct: 1.2, fans: 1, coach: -1 }], ['Sır 🤫', {}]] },
  { by: 'fan', q: 'Hangi takımı tutarak büyüdün?', a: [['Şu anki takımım ❤️', { fans: 3 }], ['Söylemem 🤐', {}], ['Ezeli rakibi 😬', { fans: -6, followersPct: 2, crisis: 0.3, crisisWhy: 'canlı yayında rakip takımı tuttuğunu söyleme' }]] },
  { by: 'emir', q: 'Tribüne bir mesajın var mı? 📣', a: [['Sizsiz biz hiçbir şeyiz ❤️', { fans: 4 }], ['Daha çok bağırın 😄', { fans: 2, followersPct: 0.4 }], ['Kısa: 3 puan!', { fans: 1 }]] },
  { by: 'akif', q: 'Bu sezon kaç gol hedefliyorsun? 📊', a: [['Gol değil, takım önemli', { fans: 1, team: 1 }], ['En az 20!', { fame: 1, followersPct: 0.6 }], ['Gol krallığı 👑', { fame: 2, heat: 5 }]] },
  { by: 'fan', q: 'Sevgilin var mı? 😍', a: [['Özel hayatım özel 🙂', {}], ['Belki 😉', { followersPct: 1, partner: -3 }], ['Kalbim dolu ❤️', { partner: 3, fame: 1 }]] },
];
export const LIVE_EVERY = 4;
export function liveReady(state) { const s = ensure(state); return s.lastLive == null || ABS(state) - s.lastLive >= LIVE_EVERY; }
export function startLive(state) {
  const s = ensure(state);
  if (!liveReady(state)) return { ok: false, msg: `Canlı yayın ${LIVE_EVERY} haftada bir yapılabilir.` };
  const qs = shuffle(LIVE_Q.slice()).slice(0, 3).map((x) => ({ ...x, who: x.by === 'fan' ? fanAuthor() : personaAuthor(x.by) }));
  s.live = { viewers: Math.round(s.followers * rand(0.03, 0.08)) + 30, qs, i: 0, answers: [], gain: 0 };
  s.lastLive = ABS(state);
  return { ok: true };
}
export function answerLive(state, oi) {
  const s = ensure(state), L = s.live; if (!L || L.i >= L.qs.length) return { ok: false };
  const [text, fx] = L.qs[L.i].a[oi];
  const r = applyFx(state, fx);
  L.answers.push({ q: L.qs[L.i].q, text, summary: r.summary });
  L.viewers = Math.round(L.viewers * rand(1.05, 1.35) * (r.crisis ? 1.4 : 1));
  L.i++;
  if (L.i >= L.qs.length) {
    L.gain = Math.round(L.viewers * rand(0.08, 0.2));
    s.followers += L.gain;
    pushFeed(s, PAGES.gundem, `🔴 ${state.player.name} ${state.player.surname} canlı yayında ${fmtF(L.viewers)} kişiyle buluştu. En çok konuşulan an: "${L.answers[rand(0, 1) < 0.5 ? 0 : L.answers.length - 1].text}"`, { likes: L.viewers * 0.3 });
  }
  return { ok: true, summary: r.summary, crisis: r.crisis };
}
export function endLive(state) { const s = ensure(state); s.live = null; }

// ================================================================ ANKETLER
function poll(q, opts) {
  const total = randInt(800, 20000);
  let left = 100;
  const o = opts.map(([t, w], i) => ({ t, w }));
  const sum = o.reduce((a, x) => a + x.w, 0);
  o.forEach((x, i) => { x.pct = i === o.length - 1 ? left : Math.round(x.w / sum * 100); left -= x.pct; });
  return { q, opts: o.map(({ t, pct }) => ({ t, pct })), total, voted: null };
}
function weeklyPoll(state, lm) {
  const s = state.social, p = state.player, me = `${p.name} ${p.surname}`;
  if (Math.random() > 0.3) return;
  const kinds = [];
  if (lm?.played) {
    const mates = state.teams[p.clubId].squad.filter((x) => x.name !== RIVAL_NAME && x.pos !== 'KL').sort((a, b) => b.ovr - a.ovr).slice(0, 4);
    if (mates.length >= 2) {
      const [a, b] = shuffle(mates).slice(0, 2);
      kinds.push(['gundem', poll('Maçın adamı kim? 🏅', [[me, Math.max(1, (lm.rating - 5) ** 2 + lm.goals * 3)], [a.name, rand(2, 6)], [b.name, rand(2, 6)]]), 'motm']);
    }
  }
  const rg = rivalSeasonGoals(state);
  kinds.push(['gundem', poll(`Hangisi daha iyi? ⚔️`, [[me, 5 + p.season.goals * 2 + (p.fame || 0) / 5 + (p.fans ?? 50) / 10], [RIVAL_NAME, 5 + rg * 2 + rand(2, 8)]]), 'rival']);
  const top = leagueStats(state, leagueOf(state, p.clubId)).map((x) => ({ ...x, name: x.me ? me : x.name })).sort((a, b) => b.g - a.g).slice(0, 3);
  if (top.length === 3 && top[0].g > 2) kinds.push(['akif', poll('Sezon sonu gol kralı kim olur? 👑', top.map((x) => [x.name, x.g + rand(0, 3)])), 'kral']);
  if (s.rumors?.length) { const club = state.teams[s.rumors[0]]?.name; if (club) kinds.push(['kulis', poll(`${p.surname}, ${club}'a gitsin mi? 🤔`, [['Evet, gitsin', 100 - (p.fans ?? 50)], ['Hayır, kalsın', p.fans ?? 50]]), 'transfer']); }
  const [who, pl, kind] = pick(kinds);
  pl.kind = kind;
  const author = who === 'akif' ? personaAuthor('akif') : who === 'kulis' ? PAGES.kulis : PAGES.gundem;
  pushFeed(s, author, pl.q, { kind: 'poll', poll: pl, likes: pl.total * 0.4 });
}
export function vote(state, feedId, oi) {
  const s = ensure(state), f = s.feed.find((x) => x.id === feedId);
  if (!f?.poll || f.poll.voted != null) return { ok: false };
  f.poll.voted = oi; f.poll.total++;
  const me = `${state.player.name} ${state.player.surname}`;
  const winner = f.poll.opts.reduce((a, b) => (b.pct > a.pct ? b : a));
  let msg = `Oyun kaydedildi. Kazanan: ${winner.t} (%${winner.pct})`;
  if (['motm', 'rival'].includes(f.poll.kind)) {
    const mine = winner.t === me;
    applyFx(state, { morale: mine ? 2 : -1 });
    msg += mine ? ' · Moral +2' : ' · Moral −1';
    if (f.poll.opts[oi].t === me) { const pst = { who: personaAuthor('mert'), text: 'Kendine oy veren futbolcu görmüştüm, şimdi gördüm 😂', tone: 'funny' }; if (s.posts[0]) s.posts[0].comments.push(pst); }
  }
  return { ok: true, msg };
}

// ================================================================ TRANSFER SÖYLENTİLERİ
// Sezonun ikinci yarısında kulis hesapları gerçek tekliflerden ipucu verir; sezon sonu teklifleri bu kulüplerden öncelikli gelir.
function weeklyRumors(state) {
  const s = state.social, p = state.player, wk = state.season.week, tot = state.season.totalWeeks || 34;
  if (wk < tot * 0.5 || wk % 3) return;
  const offers = seasonOffers(state);
  if (!offers.length) return;
  s.rumors = [...new Set([...(s.rumors || []), ...offers.map((o) => o.clubId)])].slice(-4);
  const real = state.teams[pick(offers).clubId];
  const fake = Math.random() < 0.25 ? Object.values(state.teams).filter((t) => leagueOf(state, t.id) && t.str > (real?.str || 0) + 8).sort(() => Math.random() - 0.5)[0] : null;
  const club = fake || real;
  if (!club) return;
  pushFeed(s, PAGES.kulis, pick([
    `🚨 ${club.name}, ${p.name} ${p.surname} için scout gönderdi! Son ${randInt(3, 6)} maçını yerinde izlediler.`,
    `🔥 SICAK: ${club.name} yönetimi ${p.surname}'ı sezon sonu listesinin başına yazdı.`,
    `👀 ${club.name} teknik heyeti ${p.surname} için rapor istedi. Görüşmeler sezon sonunda.`,
  ]), { likes: randInt(3000, 40000) });
  if (fake) s.fakeRumor = club.id;
  if (!fake && Math.random() < 0.6) dm(s, AGENT, `${real.name} beni aradı evlat. Ciddi ilgileniyorlar, sezon sonunu bekle. Sakın sosyal medyada bir şey yazma 🤫`, null, { abs: ABS(state), kind: 'agent' });
  s.trends.unshift(`#${tr(p.surname)}${club.name.replace(/\s+/g, '')}`);
}

// ================================================================ RÖPORTAJ → GÜNDEM
export function onInterview(state, ans) {
  const s = ensure(state); if (!s || !ans?.text) return;
  const p = state.player, me = `${p.name} ${p.surname}`;
  pushFeed(s, PAGES.gundem, `🎙️ ${me} maç sonu konuştu:\n"${ans.text}"`, { likes: s.followers * rand(0.05, 0.15) });
  const tone = ans.tone, tgt = ans.target;
  if (tone === 'sharp' || tgt) {
    pushFeed(s, personaAuthor('omer'), pick(['Bu sözler bir futbolcuya yakışmadı.', 'Önce sahada konuş, sonra mikrofonda.', 'Yine olay çıkardı. Şaşırdık mı? Hayır.']), { likes: randInt(300, 4000) });
    pushFeed(s, personaAuthor('emir'), pick(['Arkasındayız! Söylediği her şey doğru 📣', 'Delikanlı adam, lafını esirgemez 👊']), { likes: randInt(500, 6000) });
    if (tgt === 'opp' || tgt === 'ref') pushFeed(s, personaAuthor('mert'), pick(['Röportaj maçtan daha heyecanlıydı 🍿😂', 'Mikrofonu kapatın abi 😂']), { likes: randInt(800, 9000) });
    if (tgt === 'opp' && s.rival) pushFeed(s, personaAuthor('eren'), 'Abim bu sözleri soyunma odasına astı 😤', { likes: randInt(200, 3000) });
    s.trends.unshift(`#${tr(p.surname)}Açıklama`);
  } else if (tone === 'witty') {
    pushFeed(s, personaAuthor('mert'), pick(['Bu adam futbolcu değil stand-upçı 😂😂', 'Röportajın en iyi anı buydu 😂']), { likes: randInt(1000, 12000) });
    s.followers += Math.round(s.followers * 0.01);
  } else if (tone === 'humble') {
    pushFeed(s, personaAuthor('emir'), pick(['Bu alçakgönüllülük ne güzel ❤️', 'İşte bizim çocuk! Kafa hep yerinde 🙏']), { likes: randInt(400, 5000) });
  } else if (tone === 'bold') {
    pushFeed(s, personaAuthor('akif'), `Hedefi büyük. Rakamlara bakalım: bu sezon ${p.season.goals} gol, ${p.season.assists} asist 📊`, { likes: randInt(300, 4000) });
  }
}

// ================================================================ KARAKTERLERİN GENEL PAYLAŞIMLARI (Twitter gibi)
const TWEETS = {
  emir: ['Hafta sonu maç var, iş yerinde kafam hiç burada değil 📣', 'Atkıyı yıkadım, uğuru kaçtı mı acaba 😬', 'Bu takımı sevmek bir yaşam biçimi ❤️', 'Deplasmana otobüs kalkıyor, gelen var mı? 🚌', 'Maç günü kahvaltısı: simit, çay, heyecan ☕📣', 'Kombinemi yeniledim, 15. yılım ❤️', 'Tribünde yanımdaki dayı 90 dakika hakeme bağırdı, efsane adam 😂', 'Rüyamda şampiyon olduk, uyanınca ağladım 😭', 'Bu sezon bir deplasman bile kaçırmayacağım 🚌'],
  mert: ['Hakemin gözlüğünü bulan ödül alacak 😂', 'Futbol değil dizi izliyoruz, her hafta yeni bölüm 😂', 'Fantezi ligimde 11 kişiden 9u sakat 😂', 'Bugün işe gitmedim, sebep: dünkü maç 😂', 'Ofsayt kuralını 3. kez öğrendim, yine unuttum 😂', "Hakem VAR'a gitti, ben buzdolabına gittim 😂", 'Halı sahada 4 gol attım, kimse çekmemiş 😭', 'Fantezi lig takımımın adı: Ofsayt Bekçileri 😂', 'Spiker "inanılmaz" dedi, ben de inanmadım 😂'],
  omer: ['Bu ligde orta sahada pas yapan kalmadı.', 'Altyapıya yatırım yapmayan kulüp geleceği kaybeder.', 'Herkes forvet konuşuyor, maçlar orta sahada kazanılır.', 'Bu hafta hakem performansları yine tartışmalı.', 'Genç oyunculara sabır gösterilmiyor bu ülkede.', 'Taktik disiplin olmadan yetenek bir yere kadar.', 'VAR kararları tutarsız, bunu herkes görüyor.', 'Takımlar yaz transferini yine son güne bıraktı.', 'Pres yapmayan forvet modern futbolda zorlanır.'],
  eren: ['Abimle sabah koşusu yaptık, beni 5 km geride bıraktı 😅', 'Bir gün ben de abim gibi olacağım ⚽', 'Okulda herkes abimin imzasını istiyor 😎', 'Abimin kramponunu giydim, 2 numara büyük 😂', 'Abim bugün bana frikik öğretti, kaleye 10 metre uzak gitti 😂', 'Okul takımında forvet oldum! Abim gibi ⚽', 'Abimin forması odamın duvarında 😎', 'Annem abimin maçlarını izlerken elleriyle yüzünü kapatıyor 😂', 'Bir gün abimle aynı takımda oynayacağız 🙏'],
};
function personaTweets(state) {
  const s = state.social;
  for (const k of Object.keys(TWEETS)) if (Math.random() < 0.2) pushFeed(s, personaAuthor(k), pick(TWEETS[k]), { likes: randInt(30, 1500) });
}

// ================================================================ PROFİLLER
export const BIOS = {
  emir: { bio: 'Tribünden yazıyorum 📣 Formanın sevdalısı. Maç günleri ulaşılamam.', base: 3200 },
  akif: { bio: 'Rakamlar yalan söylemez 📊 Lig istatistikleri, gol ve asist krallığı.', base: 48000 },
  mert: { bio: 'Burada ciddi bir şey bulamazsın 😂 Caps & futbol.', base: 12000 },
  omer: { bio: 'Futbolu gerçekçi konuşan tek hesap 🧐', base: 7500 },
  eren: { bio: `${RIVAL_NAME}'un kardeşi 🦊 Bir gün ben de oynayacağım ⚽`, base: 2100 },
  ertem: { bio: 'Spiker, yorumcu. Futbol, şehirler, rakamlar ve ilginç bilgiler 📚🎙️', base: 410000 },
};
export function profileOf(state, k) {
  const s = ensure(state);
  if (k === 'ahmet') { const t = state.teams[s.rival.team]; return { author: rivalAuthor(state), bio: `${t.name} · Forvet ⚽ | İş birlikleri için menajerim 📩`, followers: s.rival.followers, posts: s.ppl?.ahmet || [] }; }
  const b = BIOS[k]; if (!b) return null;
  return { author: k === 'ertem' ? ERTEM : personaAuthor(k), bio: b.bio, followers: Math.round(b.base * (1 + (state.season.year - 2026) * 0.3 + state.season.week / 200)), posts: s.ppl?.[k] || [] };
}


// ================================================================ ERTEM ŞENER (ilginç bilgiler)
const ERTEM = { name: 'Ertem Şener', handle: 'ertemsener', av: '🎙️', persona: 'ertem', verified: true };
function ertemPost(state) {
  const p = state.player, lid = leagueOf(state, p.clubId);
  const opp = pick((state.leagues[lid] || []).filter((t) => t !== p.clubId));
  if (!opp) return;
  const pool = Trivia.pool(state, { fx: { h: p.clubId, a: opp, home: true, opp } });
  const t = pool[0]; if (!t) return;
  pushFeed(state.social, ERTEM, `📚 ${pick(['Bilgi notu:', 'Bunu biliyor muydunuz?', 'Arşivden bir not:', 'Kısa bir bilgi:'])} ${t}`, { likes: randInt(1500, 15000) });
}

// ================================================================ HAFTANIN GOLÜ
function goalOfWeek(state, lm) {
  const s = state.social, p = state.player, me = `${p.name} ${p.surname}`;
  if (s.gotw) {
    const g = s.gotw; s.gotw = null;
    if (g.mine) {
      p.gotw = (p.gotw || 0) + 1;
      p.fame = clamp((p.fame || 0) + 0.7, 0, 100);
      s.followers = Math.round(s.followers * 1.04);
      addInbox(state, `🏅 Golün haftanın golü seçildi! (Takipçi +%4)`);
      pushFeed(s, PAGES.gundem, `🏅 Haftanın golü: ${me}! Oyların %${g.pct}'ini aldı. ${p.gotw > 1 ? `Bu sezonki ${p.gotw}. ödülü 🔥` : ''}`, { likes: s.followers * 0.1, img: lm?.bicycle ? 'header' : 'cheer' });
      pushFeed(s, personaAuthor('emir'), pick(['HAFTANIN GOLÜ BİZİM! 🏅📣', 'Oy veren herkese teşekkürler, ben 50 kere oy verdim 😂❤️']), { likes: randInt(300, 4000) });
    } else pushFeed(s, PAGES.gundem, `🏅 Haftanın golü: ${g.winner} (%${g.pct}).`, { likes: randInt(2000, 20000) });
  }
  // aday olmak için özel bir gol ya da iyi bir maç gerekir
  if (!lm?.goals || !(lm.bicycle || lm.rating >= 7.8 || lm.goals >= 2) || Math.random() > 0.45) return;
  const others = leagueStats(state, leagueOf(state, p.clubId)).filter((x) => !x.me && x.g > 0);
  if (others.length < 2) return;
  const [a, b] = shuffle(others).slice(0, 2);
  const pl = poll('Haftanın golü hangisi? ⚽', [[me, 3 + lm.goals * 2 + (lm.bicycle ? 10 : 0) + Math.max(0, lm.rating - 6) * 2], [a.name, rand(3, 9)], [b.name, rand(3, 9)]]);
  pl.kind = 'gotw';
  pushFeed(s, PAGES.gundem, pl.q, { kind: 'poll', poll: pl, likes: pl.total * 0.5 });
  const win = pl.opts.reduce((x, y) => (y.pct > x.pct ? y : x));
  s.gotw = { mine: win.t === me, winner: win.t, pct: win.pct };
}

// ================================================================ MENAJER (Cengiz Demirel)
export const AGENT = { name: 'Cengiz Demirel', handle: 'cengizdemirel', face: 'agent', verified: true };
function agentDms(state) {
  const s = state.social, p = state.player, now = ABS(state);
  if (Math.random() < 0.1) {
    const b = pick(BRANDS.filter((x) => s.followers >= x.min && x.cat !== 'kozmetik'));
    if (b) {
      const gross = Math.round(sponsorPay(s) * b.k * 1.35 / 1000) * 1000, net = Math.round(gross * 0.9);
      dm(s, AGENT, `${b.name} ile senin için özel bir anlaşma ayarladım: ${money(gross)}. Benim payım %10, sana ${money(net)} kalıyor. İmzalayalım mı?`, [
        { label: 'İmzala', fx: { money: net, ...(b.fx || {}) }, sponsor: b, result: 'Anlaşma tamam, paylaşım profilinde.' },
        { label: 'İstemiyorum', fx: {}, result: '"Peki evlat, sen bilirsin."' },
      ], { abs: now, kind: 'agent', img: adImg(b) });
    }
  }
  if (s.crisis && !s.crisis.agent) {
    s.crisis.agent = true;
    const fee = Math.max(100_000, Math.round(p.contract.wage * 2 / 1000) * 1000);
    dm(s, AGENT, `Bu iş büyüdü evlat. Tanıdığım bir PR ajansı var, ${money(fee)} karşılığında bu fırtınayı dindirirler. Ne dersin?`, [
      { label: `Tut (${money(fee)})`, fx: { money: -fee, fans: 2, endCrisis: true }, result: 'Ajans devreye girdi, gündem değişmeye başladı.' },
      { label: 'Kendim hallederim', fx: {}, result: '"Peki, ama dikkatli ol."' },
    ], { abs: now, kind: 'agent' });
  }
  if ((p.weekFlags?.benched || (p.season.apps < state.season.week * 0.5 && state.season.week > 4)) && Math.random() < 0.2) {
    dm(s, AGENT, `Az süre alıyorsun, bu kariyerine iyi gelmez. Hocayla bir konuşayım mı?`, [
      { label: 'Konuş', odds: 0.6, win: { fx: { coach: 4, morale: 2 }, result: 'Görüşme iyi geçti, hoca sana şans verecek.' }, lose: { fx: { coach: -3 }, result: 'Hoca menajer baskısından hoşlanmadı…' } },
      { label: 'Gerek yok', fx: { morale: -1 }, result: '"Sen bilirsin evlat."' },
    ], { abs: now, kind: 'agent' });
  }
}

// ================================================================ KEŞFET & GÜNDEM
// Haftalık keşfet akışı: kulüp hesapları, istatistik sayfaları, taraftar sayfaları, takım arkadaşları ve Ahmet.
// Gerçek futbolcular yalnızca tarafsız/olumlu içerikte geçer.
const tagOf = (t) => '#' + String(t).replace(/[^\wçğıöşüÇĞİÖŞÜ]/g, '');
export function explore(state) {
  const s = ensure(state); if (!s) return null;
  const now = ABS(state);
  if (s.explore?.abs === now) return s.explore;
  const p = state.player, lid = leagueOf(state, p.clubId), myTeam = state.teams[p.clubId];
  const posts = [];
  const add = (author, text, tag, o = {}) => posts.push({ id: id(), author, text, tag, likes: o.likes ?? randInt(800, 40_000), liked: false, cmt: null, kind: o.kind || '', img: o.img || null });
  // ligin son sonuçları (kulüp hesapları)
  const teams = state.leagues[lid] || [];
  for (const id2 of shuffle(teams.filter((t) => t !== p.clubId)).slice(0, 3)) {
    const t = state.teams[id2];
    const star = (t.squad || []).filter((x) => x.pos === 'FV' && !x.rival).sort((a, b) => (b.ovr || 0) - (a.ovr || 0))[0];
    add({ name: t.name, handle: tr(t.name), club: id2, verified: true }, pick([
      `Antrenmanda tempo yüksek 💪 Haftaya hazırız!`, `Taraftarımıza teşekkürler, desteğiniz bizim gücümüz ❤️`,
      star ? `${star.name} antrenmanda formda 🔥` : `Yeni haftaya odaklandık ⚽`, `Altyapımızdan gençler A takım antrenmanında 🌱`, `Bilet satışları başladı! Tribünleri dolduralım 🎟️`,
    ]), tagOf(t.name));
    if (/Bilet/.test(posts.at(-1).text)) posts.at(-1).img = 'soc_tickets';
  }
  // istatistik: ligin golcüleri
  const top = leagueStats(state, lid).sort((a, b) => b.g - a.g).slice(0, 3);
  if (top.length) add(PAGES.istatistik, `⚽ Gol krallığı yarışı:\n${top.map((x, i) => `${i + 1}. ${x.me ? `${p.name} ${p.surname}` : x.name} – ${x.g}`).join('\n')}`, '#GolKrallığı', { likes: randInt(5_000, 60_000) });
  // takım arkadaşları
  const mates = (myTeam.squad || []).filter((x) => !x.rival && x.pos !== 'KL');
  if (mates.length) { const m = pick(mates); add({ name: m.name, handle: tr(m.name), av: '⚽', mate: true }, pick(['Bugün antrenmanda harika bir gündü 💪', 'Yeni kramponlar 👟', 'Ailemle güzel bir hafta sonu ❤️', 'Hazırız 🔥 #Maçgünü', 'Toparlanma günü 🧊']), tagOf(myTeam.name), { kind: 'mate' }); }
  // Ahmet
  const r = s.rival;
  if (r) add({ name: RIVAL_NAME, handle: tr(RIVAL_NAME), rival: true, verified: true }, pick([`Sessizce çalışıyoruz. Konuşmayı sahaya bırakıyoruz 🤫`, `${rivalSeasonGoals(state)} gol. Daha bitmedi 😎`, `Bazıları sadece Paslaş'ta forvet 😏`, `Antrenman sonrası ekstra şut çalışması 🎯`, `Hedef büyük, yol uzun 🏁`]), '#AhmetAkyurt', { kind: 'rival', likes: Math.max(randInt(2_000, 15_000), Math.round(r.followers * rand(0.03, 0.09))) });
  // taraftar sayfası ve gündem
  add({ name: `${myTeam.name} Taraftar`, handle: tr(myTeam.name) + 'taraftar', av: '📣' }, pick([`Bu hafta stadı dolduruyoruz! Herkes tribüne 📣`, `${p.surname} için yeni tezahürat hazırlıyoruz 🎶`, `Deplasman otobüsleri doldu bile 🚌`, `Tribün koreografisi için gönüllüler aranıyor 🎨`]), tagOf(myTeam.name), { kind: 'fan' });
  { const fp = posts.at(-1); fp.img = /koreografi|stadı/.test(fp.text) ? 'tifo' : /otobüs/.test(fp.text) ? 'bus' : Math.random() < 0.4 ? 'awayfans' : null; }
  add(PAGES.gundem, pick(['Haftanın en çok konuşulan maçı hangisi? 👇', 'Transfer dönemi yaklaşırken kulüpler kesenin ağzını açıyor 💸', 'VAR kararları yine gündemde 📺', 'Genç oyuncular bu sezon ligi sırtlıyor 🌟']), '#Gündem');
  // trendler: sayılarla
  const tags = [...new Set([...(s.trends || []), ...posts.map((x) => x.tag)])].slice(0, 8);
  const trends = tags.map((t) => ({ tag: t, count: Math.round(rand(2, 80) * 1000 * (t === s.crisis?.tag ? 3 : 1)) })).sort((a, b) => b.count - a.count);
  s.explore = { abs: now, posts: shuffle(posts), trends, likes: 0 };
  return s.explore;
}
export const EX_CMTS = {
  any: [['👏 Tebrikler', { fans: 0 }], ['🔥🔥🔥', {}]],
  mate: [['💪 Kardeşim!', { team: 2 }], ['😂 Kramponlar sana yakışmamış', { team: -1, followersPct: 0.2 }]],
  rival: [['😏 "Sahada görüşürüz."', { heat: 8, fame: 0.5, crisis: 0.08, crisisWhy: "Ahmet'e laf sokması" }], ['👏 "Başarılar Ahmet."', { heat: -6, fans: 1 }]],
  fan: [['❤️ "Sizinle gurur duyuyorum!"', { fans: 2 }]],
};
export function exploreLike(state, pid) {
  const s = ensure(state), E2 = s?.explore; if (!E2) return { ok: false };
  const x = E2.posts.find((y) => y.id === pid); if (!x || x.liked) return { ok: false };
  x.liked = true; x.likes++;
  let msg = 'Beğendin ❤️';
  if (x.kind === 'mate' && state.player.rel) { state.player.rel.team = clamp(state.player.rel.team + 1, 0, 100); msg = 'Takım arkadaşın beğenini gördü (Takım +1)'; }
  if (x.kind === 'rival' && s.rival) { s.rival.heat = clamp(s.rival.heat - 2, 0, 100); msg = 'Ahmet\'in paylaşımını beğendin… taraftarlar şaşkın 👀'; state.player.fans = clamp((state.player.fans ?? 50) - 1, 0, 100); }
  if (x.kind === 'fan') { state.player.fans = clamp((state.player.fans ?? 50) + 1, 0, 100); msg = 'Taraftar sayfası beğenini fark etti (Taraftar +1)'; }
  return { ok: true, msg };
}
export function exploreComment(state, pid, oi) {
  const s = ensure(state), E2 = s?.explore; if (!E2) return { ok: false };
  const x = E2.posts.find((y) => y.id === pid); if (!x || x.cmt) return { ok: false };
  const list = EX_CMTS[x.kind] || EX_CMTS.any;
  const o = list[oi]; if (!o) return { ok: false };
  x.cmt = o[0];
  const r = applyFx(state, o[1]);
  return { ok: true, msg: r.summary || 'Yorum yapıldı' };
}

// ================================================================ SENARYOLAR (haftalık, mesaj kutusuna)
const SCN = [
  (st) => ({ img: null, from: { name: 'Mert Can (12)', handle: 'kucukmert', av: '🧒' }, text: `Abi ben senin en büyük hayranınım! Okulda herkese senin gol sevincini yapıyorum. Maça gelebilir miyim? 🥺`, options: [
    { label: 'Ailesiyle maça davet et, imzalı forma hazırla', fx: { fans: 3, followersPct: 1, money: -20_000 }, result: 'Mert maçta tribünden el salladı, video viral oldu!', post: { img: 'soc_kidfan', text: 'Küçük Mert bugün tribündeydi ❤️ İmzalı forma artık senin şampiyon!' } },
    { label: 'Sevimli bir sesli mesaj gönder', fx: { fans: 1 }, result: 'Mert sesli mesajı bütün sınıfa dinletti.' },
    { label: 'Görmezden gel', fx: { fans: -1 }, result: '' }] }),
  (st) => ({ from: { name: 'Paslaş Güvenlik', handle: 'paslasguvenlik', av: '🔐', verified: true }, text: 'Hesabına yabancı bir cihazdan giriş denemesi yapıldı. Biri adına sahte bir hesap da açmış görünüyor.', options: [
    { label: 'Şifreyi değiştir, sahte hesabı şikâyet et', fx: { followersPct: 0.5 }, result: 'Sahte hesap kapatıldı, takipçilerin uyarıyı paylaştı.' },
    { label: 'Boş ver', odds: 0.5, win: { fx: {}, result: 'Bir şey olmadı… şimdilik.' }, lose: { fx: { followersPct: -3, fans: -2 }, result: 'Hesabından garip reklamlar paylaşıldı! Takipçiler şaşkın.' } }] }),
  (st) => ({ from: { name: 'Lara Ses', handle: 'laraseslemagazin', av: '📸', verified: true }, text: 'Seninle ortak bir "bir gün benimle" videosu çekmek istiyorum. Milyonlarca izlenme garanti! 🎥', options: [
    { label: 'Kabul et', odds: 0.65, win: { fx: { followersPct: 6, fame: 1, energy: -8 }, result: 'Video patladı, herkes konuşuyor!' }, lose: { fx: { followersPct: 2, fans: -2, energy: -8 }, result: 'Videodaki bir şaka yanlış anlaşıldı, taraftar kızgın.' } },
    { label: 'Kibarca reddet, futbola odaklan', fx: { coach: 2 }, result: 'Hoca bu tavrını beğendi.' }] }),
  (st) => ({ img: 'soc_challenge', from: { name: '#GolChallenge', handle: 'golchallenge', av: '🎯' }, text: 'Herkes çöp kutusuna uzaktan şut atıp videosunu paylaşıyor. Seni de etiketlediler! 🗑️⚽', options: [
    { label: 'Videoyu çek, ilk denemede at!', odds: 0.5, win: { fx: { followersPct: 4, fame: 0.5 }, result: 'İlk denemede! Video milyonları geçti.', post: { img: 'soc_challenge', text: 'İlk denemede 🎯🗑️ #GolChallenge sırası sizde!' } }, lose: { fx: { followersPct: 1 }, result: '17. denemede attın; blooper videosu daha çok izlendi 😂' } },
    { label: 'Takım arkadaşlarıyla birlikte çek', fx: { team: 3, followersPct: 2 }, result: 'Soyunma odası kahkahaya boğuldu.', post: { img: 'soc_challenge', text: 'Takımca #GolChallenge 😂🗑️ Kim attı tahmin edin!' } },
    { label: 'Katılma', fx: {}, result: '' }] }),
  (st) => ({ from: { name: 'Umut Vakfı', handle: 'umutvakfi', av: '💚', verified: true }, text: 'Lösemili çocuklar için bağış kampanyası başlattık. Destek olur musun?', options: [
    { label: 'Büyük bağış yap ve duyur', post: { img: 'soc_charity', text: 'Bugün çocuklarla birlikteydik. Asıl kahramanlar onlar 💚 @umutvakfi' }, fx: { money: -Math.max(200_000, Math.round(st.player.contract.wage * 3)), fans: 4, fame: 1 }, result: 'Kampanya hedefini aştı, çocuklar sana teşekkür videosu gönderdi.' },
    { label: 'Sessizce bağış yap', fx: { money: -Math.max(200_000, Math.round(st.player.contract.wage * 3)), morale: 5 }, result: 'Kimse bilmedi ama içinin rahatladığını hissettin.' },
    { label: 'Paylaşımı yeniden paylaş', fx: { fans: 1 }, result: 'Paylaşımın bağışları artırdı.' }] }),
  (st) => ({ from: { name: 'Mizah Dünyası', handle: 'mizahdunyasi', av: '🤣' }, text: `Senin kaçırdığın pozisyonu "kedi kovalayan forvet" diye montajlayıp paylaştık 😂 Ne dersin?`, options: [
    { label: 'Esprili cevap ver ve paylaş', fx: { followersPct: 3, fans: 2 }, result: 'Kendinle dalga geçebilmen herkesin hoşuna gitti.' },
    { label: 'Kaldırmalarını iste', fx: { fans: -1 }, result: 'Kaldırdılar ama ekran görüntüleri dolaşmaya devam etti.' },
    { label: 'Avukatını devreye sok', fx: { fans: -3, money: -50_000 }, result: '"Espriden anlamıyor" yorumları yağdı.' }] }),
  (st) => ({ from: { name: 'Eski bir paylaşım', handle: 'arsiv', av: '🗂️' }, text: `Biri senin 14 yaşındayken yazdığın "${st.social?.rival ? st.teams[st.social.rival.team].name : 'rakip takım'} benim hayalim" paylaşımını buldu ve gündem yaptı 😬`, options: [
    { label: '"Çocukluk işte 😅" diye cevap ver', fx: { fans: 1, followersPct: 1 }, result: 'Samimi cevabın krizi önledi.' },
    { label: 'Paylaşımı sil', odds: 0.5, win: { fx: {}, result: 'Konu kapandı.' }, lose: { fx: { fans: -3 }, result: '"Sildi!" diye ekran görüntüleri paylaşıldı.', } },
    { label: 'Hiç cevap verme', fx: { fans: -1 }, result: 'Birkaç gün konuşulup unutuldu.' }] }),
  (st) => ({ img: 'soc_portrait', from: { name: 'Çizer Ayşe', handle: 'cizerayse', av: '🎨' }, text: 'Senin için bir portre çizdim! Paylaşırsan çok mutlu olurum 🥹', options: [
    { label: 'Paylaş ve teşekkür et', fx: { fans: 2, followersPct: 0.5 }, result: 'Ayşe\'nin takipçileri on katına çıktı.', post: { img: 'soc_portrait', text: 'Ellerine sağlık @cizerayse 🎨🥹' } },
    { label: 'Satın alıp evine as', fx: { money: -15_000, morale: 3 }, result: 'Portre salonunda yerini aldı.' }] }),
  (st) => ({ from: { name: 'Takım WhatsApp grubu', handle: 'soyunmaodasi', av: '💬' }, text: 'Kaptan doğum günü için ortak bir paylaşım istiyor. Herkes bir video gönderiyor.', options: [
    { label: 'Komik bir video gönder', fx: { team: 4 }, result: 'Videon soyunma odasında en çok güldüren oldu.' },
    { label: 'Kısa bir "iyi ki doğdun" yaz', fx: { team: 1 }, result: '' },
    { label: 'Unut', fx: { team: -3 }, result: 'Kaptan bir şey demedi ama fark etti.' }] }),
];
export function weeklyScenario(state) {
  const s = ensure(state); if (!s) return;
  const now = ABS(state);
  if (now - (s.lastScn ?? -99) < 3 || Math.random() > 0.55) return;
  s.lastScn = now;
  const used = new Set(s.scnUsed || []);
  let pool = SCN.map((f, i) => i).filter((i) => !used.has(i));
  if (!pool.length) { s.scnUsed = []; pool = SCN.map((f, i) => i); }
  const i = pick(pool);
  s.scnUsed = [...(s.scnUsed || []), i].slice(-6);
  const sc = SCN[i](state);
  dm(s, sc.from, sc.text, sc.options, { kind: 'scn', img: sc.img || null });
}

// ================================================================ LİGDEN OYUNCULAR (haftalık)
// Ligdeki diğer oyuncular hakkında istatistik ve gündem paylaşımları. Gerçek oyuncular yalnızca olumlu/tarafsız.
export function weeklyLeaguePosts(state) {
  const s = ensure(state); if (!s) return;
  const p = state.player, lid = leagueOf(state, p.clubId);
  const list = lastWeekScorers(state, lid, 0).filter((x) => !x.me && x.name !== RIVAL_NAME);
  if (!list.length || Math.random() > 0.7) return;
  const T = (x) => state.teams[x.team]?.name || '';
  const hat = list.find((x) => x.g >= 3), two = list.filter((x) => x.g >= 2);
  const MIL = [10, 15, 20, 25, 30];
  const mil = list.find((x) => MIL.some((m) => x.total >= m && x.total - x.g < m));
  if (hat) pushFeed(s, PAGES.gundem, `🎩 HAT-TRICK! ${hat.name} (${T(hat)}) bu hafta ${hat.g} gol attı ve sezondaki gol sayısını ${hat.total} yaptı. #HaftanınOyuncusu`, { likes: randInt(8_000, 90_000) });
  else if (mil) pushFeed(s, PAGES.istatistik, `📊 ${mil.name} (${T(mil)}) sezonun ${mil.total}. golünü attı. Gol krallığı yarışında iddiasını sürdürüyor.`, { likes: randInt(3_000, 40_000) });
  else if (two.length) pushFeed(s, PAGES.istatistik, `⚽ Haftanın çift golcüleri:\n${two.slice(0, 3).map((x) => `${x.name} (${T(x)}) ×${x.g}`).join('\n')}`, { likes: randInt(2_000, 25_000) });
  else {
    const top = list.slice(0, 3);
    pushFeed(s, PAGES.istatistik, `⚽ Haftanın golcüleri:\n${top.map((x) => `${x.name} (${T(x)}) – sezonda ${x.total}`).join('\n')}`, { likes: randInt(2_000, 20_000) });
  }
  // gol krallığında oyuncuyu geçen biri varsa
  const tbl = leagueStats(state, lid).sort((a, b) => b.g - a.g);
  const meRow = tbl.find((x) => x.me), first = tbl[0];
  if (meRow && first && !first.me && first.g > meRow.g && Math.random() < 0.3) pushFeed(s, personaAuthor('akif'), `📊 Gol krallığında zirve: ${first.name} ${first.g} gol. ${p.name} ${p.surname} ${meRow.g} golle takipte. Fark ${first.g - meRow.g}.`, { likes: randInt(1_000, 9_000) });
}
