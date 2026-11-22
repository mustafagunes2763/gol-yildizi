// Aşama 2: mağaza, ilişkiler, haftalık olaylar, sakatlık, bahis kuponları.
import { clamp, pick, randInt, rand, money, addInbox, expectedGoals, leagueOf } from './engine.js';
import * as Stories from './stories.js';
import * as Family from './family.js';
import * as Betting from './betting.js';
import * as Social from './social.js';
import * as Invest from './invest.js';

// ---------- mağaza ----------
export const CARS = [
  { id: 'car1', name: 'Kompakt Hatchback', desc: 'İkinci el ama sağlam', price: 900_000, fame: 1, morale: 1, emoji: '🚗' },
  { id: 'car2', name: 'Aile Sedanı', desc: 'Temiz, konforlu', price: 2_500_000, fame: 2, morale: 1, emoji: '🚙' },
  { id: 'car7', name: 'Elektrikli SUV', desc: 'Sessiz, hızlı, şarjı evde', price: 4_500_000, fame: 3, morale: 2, emoji: '🔋' },
  { id: 'car9', name: 'Arazi Aracı', desc: 'Kar, çamur, dağ yolu fark etmez', price: 6_000_000, fame: 3, morale: 2, emoji: '🛻' },
  { id: 'car3', name: 'Lüks SUV', desc: 'Siyah, heybetli', price: 8_000_000, fame: 4, morale: 2, emoji: '🚐' },
  { id: 'car4', name: 'Spor Coupe', desc: 'Kırmızı, iki kapı', price: 20_000_000, fame: 6, morale: 2, emoji: '🏎️' },
  { id: 'car8', name: 'Klasik Cabrio (1967)', desc: 'Restore edilmiş, koleksiyonluk', price: 32_000_000, fame: 7, morale: 3, emoji: '🚘' },
  { id: 'car5', name: 'Süper Spor', desc: 'Makas kapılı canavar', price: 50_000_000, fame: 9, morale: 3, emoji: '🏁' },
  { id: 'car10', name: 'Lüks Limuzin', desc: 'Şoförlü, arka koltukta masaj', price: 75_000_000, fame: 9, morale: 3, energy: 2, emoji: '🚖' },
  { id: 'car6', name: 'Hiper Araba', desc: 'Geleceğin arabası', price: 150_000_000, fame: 12, morale: 3, emoji: '🚀' },
];
export const HOUSES = [
  { id: 'house1', name: 'Stüdyo Daire', desc: 'Küçük ama senin', price: 3_000_000, energy: 3, emoji: '🏠' },
  { id: 'house2', name: '2+1 Daire', desc: 'Şehir manzaralı', price: 10_000_000, energy: 6, emoji: '🏢' },
  { id: 'house6', name: 'Bahçeli Müstakil Ev', desc: 'Sakin sokak, mangal keyfi', price: 18_000_000, energy: 8, emoji: '🏘️' },
  { id: 'house3', name: 'Rezidans', desc: 'Deniz manzaralı, yüksek kat', price: 35_000_000, energy: 10, emoji: '🌆' },
  { id: 'house7', name: 'Dağ Evi', desc: 'Şömine, orman, kafa dinlemek için', price: 55_000_000, energy: 12, emoji: '🏔️' },
  { id: 'house4', name: 'Havuzlu Villa', desc: 'Bahçe, havuz, huzur', price: 90_000_000, energy: 14, emoji: '🏡' },
  { id: 'house8', name: 'Çatı Katı Penthouse', desc: 'Teraslı, 360° şehir manzarası', price: 180_000_000, energy: 16, emoji: '🌃' },
  { id: 'house5', name: 'Boğaz Yalısı', desc: 'Özel iskelesiyle', price: 400_000_000, energy: 20, emoji: '🏛️' },
];
// Lüks: tek seferlik ün, haftalık küçük moral, bazıları sevgiliyi de mutlu eder
export const LUX = [
  { id: 'lux_parfum', name: 'Parfümcüben imza parfüm', desc: 'Kendi kokun, kendi şişen', price: 30_000, fame: 0, morale: 1, partner: 3, emoji: '🧴' },
  { id: 'lux_gozluk', name: 'SonGlasses güneş gözlüğü', desc: 'Havalimanı çıkışlarının vazgeçilmezi', price: 60_000, fame: 1, morale: 0, emoji: '🕶️' },
  { id: 'lux_telefon', name: 'Xxxaomi Ultra telefon', desc: 'En yeni model, en iyi kamera', price: 90_000, fame: 0, morale: 1, emoji: '📱' },
  { id: 'lux_takim', name: 'Terzi işi takım elbise', desc: 'Ödül törenleri için ölçüye özel', price: 250_000, fame: 1, morale: 1, emoji: '🤵' },
  { id: 'lux_saat', name: 'Saatcim Chronograph', desc: 'Çelik kasa, safir cam', price: 450_000, fame: 1, morale: 1, emoji: '⌚' },
  { id: 'lux_zincir', name: 'Altın zincir', desc: 'Göz alıcı ama abartmadan', price: 1_200_000, fame: 2, morale: 1, emoji: '📿' },
  { id: 'lux_kolye', name: 'Pırlanta kolye (hediye)', desc: 'Sevdiğine özel', price: 3_500_000, fame: 1, morale: 1, partner: 10, emoji: '💎', needPartner: true },
  { id: 'lux_saat2', name: 'Saatcim Tourbillon', desc: 'Sınırlı üretim, numaralı', price: 6_000_000, fame: 3, morale: 1, emoji: '⏱️' },
  { id: 'lux_tablo', name: 'Çağdaş sanat tablosu', desc: 'Salonunun yeni yıldızı', price: 15_000_000, fame: 3, morale: 2, emoji: '🖼️' },
  { id: 'lux_jet', name: 'Özel jet (ortaklık payı)', desc: 'Deplasman yorgunluğuna son', price: 250_000_000, fame: 8, morale: 2, energy: 4, emoji: '🛩️' },
];
// Performans: antrenman verimi, enerji ve sakatlık riski
export const GEAR = [
  { id: 'gear_krampon', name: 'Like Pro krampon', desc: 'Hafif, sağlam; şutta his farkı', price: 40_000, train: 1.04, emoji: '👟' },
  { id: 'gear_uyku', name: 'Uyku takip bandı', desc: 'Uykunu ölç, toparlanmanı artır', price: 25_000, energy: 1, emoji: '😴' },
  { id: 'gear_masaj', name: 'Masaj koltuğu', desc: 'Maç sonrası kaslar gevşer', price: 150_000, energy: 2, emoji: '💺' },
  { id: 'gear_krampon2', name: 'amigos Elite kişiye özel krampon', desc: 'Ayak kalıbına göre üretilir', price: 350_000, train: 1.07, emoji: '🥾' },
  { id: 'gear_diyet', name: 'Beslenme uzmanı (sezonluk)', desc: 'Kişisel menü, ölçülü takviye', price: 1_500_000, energy: 3, inj: 0.9, emoji: '🥗' },
  { id: 'gear_kriyo', name: 'Kriyoterapi kabini', desc: 'Soğuk terapiyle hızlı toparlanma', price: 2_500_000, energy: 1, inj: 0.8, emoji: '🧊' },
  { id: 'gear_gym', name: 'Ev spor salonu', desc: 'Ekstra mesai evde', price: 4_000_000, train: 1.1, emoji: '🏋️' },
  { id: 'gear_hoca', name: 'Kişisel antrenör (sezonluk)', desc: 'Bitiricilik ve teknik çalışmaları', price: 7_000_000, train: 1.15, emoji: '🧑‍🏫' },
  { id: 'gear_fizyo', name: 'Özel fizyoterapist', desc: 'Sakatlık riskini ciddi azaltır', price: 12_000_000, inj: 0.65, energy: 1, emoji: '🩺' },
  { id: 'gear_oksijen', name: 'Hiperbarik oksijen odası', desc: 'Profesyonellerin toparlanma sırrı', price: 30_000_000, energy: 3, inj: 0.85, emoji: '🫧' },
];
// Hobi: haftalık moral, bazıları ün ve ilişki
export const HOBBY = [
  { id: 'hob_kulaklik', name: 'Readme stüdyo kulaklık', desc: 'Isınma listen hiç bu kadar net olmadı', price: 25_000, morale: 1, emoji: '🎧' },
  { id: 'hob_konsol', name: 'PlayArena konsol seti', desc: 'Kamp akşamlarının kralı', price: 35_000, morale: 1, emoji: '🎮' },
  { id: 'hob_xbox', name: 'XxxBox + direksiyon seti', desc: 'Yarış oyunlarında rakipsiz', price: 60_000, morale: 1, emoji: '🕹️' },
  { id: 'hob_bisiklet', name: 'Yol bisikleti', desc: 'Sabah sahil turları', price: 120_000, morale: 1, energy: 1, emoji: '🚴' },
  { id: 'hob_kamera', name: 'Profesyonel kamera', desc: 'Paslaş paylaşımların bir başka', price: 180_000, morale: 1, fame: 1, emoji: '📷' },
  { id: 'hob_motor', name: 'Motosiklet', desc: 'Kulüp izin verirse…', price: 1_800_000, fame: 1, morale: 2, emoji: '🏍️' },
  { id: 'hob_piyano', name: 'Kuyruklu piyano', desc: 'Kafa dağıtmanın en zarif yolu', price: 3_000_000, morale: 2, emoji: '🎹' },
  { id: 'hob_karavan', name: 'Karavan', desc: 'Sezon arası yollara', price: 5_000_000, morale: 2, energy: 1, partner: 3, emoji: '🚌' },
  { id: 'hob_tekne', name: 'Sürat teknesi', desc: 'Yazın koylar senin', price: 30_000_000, fame: 3, morale: 3, partner: 4, emoji: '🚤' },
  { id: 'hob_yat', name: 'Lüks yat', desc: 'Mürettebatlı, 40 metre', price: 600_000_000, fame: 10, morale: 4, partner: 6, emoji: '🛥️' },
];
export const SHOP_TABS = { car: ['🚗 Arabalar', CARS], house: ['🏠 Evler', HOUSES], lux: ['💎 Lüks', LUX], gear: ['🏋️ Performans', GEAR], hobby: ['🎮 Hobi', HOBBY] };
const ITEMS = Object.fromEntries([...CARS, ...HOUSES, ...LUX, ...GEAR, ...HOBBY].map((x) => [x.id, x]));
export const SELL_RATE = 0.6;
// Gemini görselleri geldikçe buraya eklenir (img/shop/<id>.jpg)
export const SHOP_IMAGES = new Set([]);

export function initLife(p) {
  p.owned ||= [];
  p.rel ||= { coach: 50, team: 50, family: 70 };
  p.partner ??= null;      // { name, look, value, weeks, married }
  p.injury ??= 0;          // kalan hafta
  p.weekFlags ||= {};      // bu hafta yapılanlar
  p.bets ||= [];
  p.casinoWeek ??= 0;      // bu haftaki gazino kâr/zarar
}

const best = (p, list, key) => list.filter((x) => p.owned.includes(x.id)).reduce((m, x) => Math.max(m, x[key]), 0);
const extra = (p, key) => [...LUX, ...GEAR, ...HOBBY, ...CARS].filter((x) => p.owned.includes(x.id)).reduce((m, x) => m + (x[key] || 0), 0);
export const houseEnergy = (p) => best(p, HOUSES, 'energy') + Math.min(8, extra(p, 'energy'));
export const carMorale = (p) => best(p, CARS, 'morale') + Math.min(6, [...LUX, ...HOBBY].filter((x) => p.owned.includes(x.id)).reduce((m, x) => m + (x.morale || 0), 0) * 0.5);
// performans ekipmanı: antrenman verimi (en iyisi) ve sakatlık riski (çarpımsal, en az %50)
export const trainMul = (p) => GEAR.filter((x) => (p.owned || []).includes(x.id) && x.train).reduce((m, x) => Math.max(m, x.train), 1);
export const injMul = (p) => Math.max(0.5, GEAR.filter((x) => (p.owned || []).includes(x.id) && x.inj).reduce((m, x) => m * x.inj, 1));
export const shopEffect = (it) => [it.fame ? `Ün +${it.fame}` : '', it.morale ? `Moral +${it.morale}/hafta` : '', it.energy ? `Enerji +${it.energy}/hafta` : '', it.partner ? `İlişki +${it.partner}` : '', it.train ? `Antrenman verimi +%${Math.round((it.train - 1) * 100)}` : '', it.inj ? `Sakatlık riski −%${Math.round((1 - it.inj) * 100)}` : ''].filter(Boolean).join(' · ');

export function buy(state, id) {
  const p = state.player, it = ITEMS[id];
  if (!it || p.owned.includes(id)) return { ok: false, msg: 'Zaten sende var.' };
  if (p.money < it.price) return { ok: false, msg: 'Paran yetmiyor.' };
  if (it.needPartner && !p.partner) return { ok: false, msg: 'Bunu hediye edecek biri yok.' };
  p.money -= it.price;
  p.owned.push(id);
  if (it.fame) p.fame = clamp(p.fame + it.fame, 0, 100);
  if (it.partner && p.partner) p.partner.value = clamp((p.partner.value || 50) + it.partner, 0, 100);
  p.morale = clamp(p.morale + 5, 0, 100);
  addInbox(state, `${it.emoji} ${it.name} artık senin! ${shopEffect(it)}.`);
  return { ok: true, item: it };
}
export function sell(state, id) {
  const p = state.player, it = ITEMS[id];
  if (!p.owned.includes(id)) return { ok: false, msg: 'Bu sende yok.' };
  p.owned = p.owned.filter((x) => x !== id);
  p.money += Math.round(it.price * SELL_RATE);
  return { ok: true, item: it };
}

// ---------- ilişkiler ----------
export const REL_LABEL = { coach: 'Teknik direktör', team: 'Takım arkadaşları', family: 'Aile' };
const relAdd = (p, k, d) => { p.rel[k] = clamp(p.rel[k] + d, 0, 100); };
export { relAdd };

export function talkCoach(state) {
  const p = state.player;
  if (p.weekFlags.coach) return { ok: false, msg: 'Bu hafta hocayla zaten konuştun.' };
  p.weekFlags.coach = true;
  if (p.rel.coach >= 60 && Math.random() < 0.6) {
    p.weekFlags.coachPromise = true;
    relAdd(p, 'coach', 2);
    return { ok: true, msg: 'Hoca: "Seni bu hafta daha çok düşünüyorum." (İlk 11 şansı arttı)' };
  }
  const d = randInt(2, 6);
  relAdd(p, 'coach', d);
  return { ok: true, msg: `Hocayla iyi bir sohbet ettin. İlişki +${d}` };
}
export function treatTeam(state) {
  const p = state.player;
  if (p.weekFlags.team) return { ok: false, msg: 'Bu hafta zaten yemek ısmarladın.' };
  const cost = Math.max(20_000, Math.round(p.contract.wage * 1.5));
  if (p.money < cost) return { ok: false, msg: `Yemek için ${money(cost)} lazım.` };
  p.money -= cost; p.weekFlags.team = true;
  relAdd(p, 'team', 8);
  return { ok: true, msg: `Takıma yemek ısmarladın (${money(cost)}). Takım +8` };
}
export const teamCost = (p) => Math.max(20_000, Math.round(p.contract.wage * 1.5));
export function kidsTime(state) {
  const p = state.player;
  const kids = (p.children || []).filter((c) => !c.exOf || state.season.year - c.born < 18);
  if (!kids.length) return { ok: false };
  if (p.weekFlags.kids) return { ok: false, msg: 'Bu hafta çocuklarla zaten vakit geçirdin.' };
  p.weekFlags.kids = true;
  for (const c of kids) c.rel = clamp((c.rel ?? 70) + 5, 0, 100);
  p.morale = clamp(p.morale + 4, 0, 100); p.energy = clamp(p.energy - 6, 0, 100);
  return { ok: true, msg: 'Parkta top oynadınız, dondurma yediniz. Çocuklar +5, moral +4' };
}
export function callFamily(state) {
  const p = state.player;
  if (p.weekFlags.family) return { ok: false, msg: 'Bu hafta aileni zaten aradın.' };
  p.weekFlags.family = true;
  relAdd(p, 'family', 4);
  p.morale = clamp(p.morale + 2, 0, 100);
  return { ok: true, msg: 'Annenle uzun uzun konuştun. Aile +4, moral +2' };
}

// ---------- sevgili ----------
const GIRL_NAMES = ['Elif', 'Zeynep', 'Defne', 'Ecem', 'Selin', 'Melis', 'Ceren', 'İrem', 'Damla', 'Buse', 'Naz', 'Yağmur'];
const SURN = ['Aydın', 'Kaya', 'Demir', 'Arslan', 'Erdem', 'Tekin', 'Yalın', 'Ateş', 'Uysal', 'Kılıç'];
const JOBS = ['Mimar', 'Doktor', 'Oyuncu', 'Model', 'Avukat', 'Şarkıcı', 'Öğretmen', 'Spiker'];
export function meetCandidates() {
  const order = [0, 1, 2].sort(() => Math.random() - 0.5);
  return Array.from({ length: 3 }, (_, i) => ({
    name: `${pick(GIRL_NAMES)} ${pick(SURN)}`,
    job: pick(JOBS),
    portrait: order[i],         // img/people/partner{0..2}.jpg
    likesFame: Math.random() < 0.5,
  }));
}
export function startDating(state, c) {
  const p = state.player;
  if (p.age < 18) return { ok: false, msg: '18 yaşından önce olmaz.' };
  p.partner = { ...c, value: 55, weeks: 0, married: false };
  p.morale = clamp(p.morale + 6, 0, 100);
  addInbox(state, `${c.name} ile görüşmeye başladın. Magazin basını şimdiden peşinde!`);
  return { ok: true };
}
export const dateCost = (p) => Math.max(10_000, Math.round(p.contract.wage * 0.5));
export const giftCost = (p) => Math.max(50_000, Math.round(p.contract.wage * 3));
export function datePartner(state, kind) {
  const p = state.player;
  if (!p.partner) return { ok: false };
  const flag = kind === 'gift' ? 'gift' : 'date';
  if (p.weekFlags[flag]) return { ok: false, msg: kind === 'gift' ? 'Bu hafta zaten hediye aldın.' : 'Bu hafta zaten buluştunuz.' };
  const cost = kind === 'gift' ? giftCost(p) : dateCost(p);
  if (p.money < cost) return { ok: false, msg: `${money(cost)} lazım.` };
  p.money -= cost; p.weekFlags[flag] = true;
  const d = kind === 'gift' ? randInt(8, 14) : randInt(4, 8);
  p.partner.value = clamp(p.partner.value + d, 0, 100);
  p.morale = clamp(p.morale + 2, 0, 100);
  return { ok: true, msg: `${p.partner.name.split(' ')[0]} çok mutlu! +${d}` };
}
export const canPropose = (p) => p.partner && !p.partner.married && p.partner.value >= 80 && p.partner.weeks >= 16;
export const weddingCost = (p) => Math.max(500_000, Math.round(p.contract.wage * 15));
export function propose(state) {
  const p = state.player;
  if (!canPropose(p)) return { ok: false, msg: 'Henüz erken.' };
  const cost = weddingCost(p);
  if (p.money < cost) return { ok: false, msg: `Düğün için ${money(cost)} lazım.` };
  p.money -= cost;
  p.partner.married = true;
  p.morale = clamp(p.morale + 15, 0, 100);
  relAdd(p, 'family', 10);
  p.fame = clamp(p.fame + 3, 0, 100);
  return { ok: true, msg: `Evlendiniz! Düğün masrafı ${money(cost)}.` };
}
export function breakUp(state) {
  const p = state.player;
  if (!p.partner) return;
  addInbox(state, `${p.partner.name} ile yollarınızı ayırdınız.`);
  p.exes = [...(p.exes || []), { name: p.partner.name, how: 'ayrılık', year: state.season?.year }];
  p.partner = null;
  p.morale = clamp(p.morale - 10, 0, 100);
}

// ---------- haftalık ----------
export function weeklyLife(state, weekIndex) {
  Invest.weekly(state, weekIndex);
  const p = state.player;
  initLife(p);
  // ev ve araba
  p.energy = clamp(p.energy + houseEnergy(p), 0, 100);
  p.morale = clamp(p.morale + carMorale(p) * 0.5, 0, 100);
  // aile
  if (p.rel.family >= 65) p.morale = clamp(p.morale + 1, 0, 100);
  if (p.rel.family < 30) p.morale = clamp(p.morale - 1, 0, 100);
  relAdd(p, 'family', -0.5);
  // hoca ve takım zamanla ortalamaya döner
  for (const k of ['coach', 'team']) p.rel[k] += (50 - p.rel[k]) * 0.02;
  // sevgili
  if (p.partner) {
    p.partner.weeks++;
    p.partner.value = clamp(p.partner.value - (p.partner.married ? 1 : 2), 0, 100);
    p.morale = clamp(p.morale + (p.partner.value - 50) / 25, 0, 100);
    if (!p.partner.married && p.partner.value < 15) {
      addInbox(state, `${p.partner.name} seninle yeterince ilgilenmediğini söyleyip ayrıldı.`);
      p.partner = null; p.morale = clamp(p.morale - 10, 0, 100);
    }
  }
  Family.weeklyFamily(state);
  // sakatlık iyileşir
  if (p.fragile > 0) p.fragile--;
  if (p.injury > 0) {
    p.injury--;
    if (p.injury === 0) addInbox(state, 'Sakatlığın geçti, takımla çalışmalara başladın!');
  }
  // bahisler
  Betting.resolve(state);
  // haftalık bayraklar sıfırlanır
  p.weekFlags = {};
  p.casinoWeek = 0;
  // kaptanlık: moral ve ün
  if (p.captain) { p.morale = clamp(p.morale + 0.5, 0, 100); p.fame = clamp(p.fame + 0.1, 0, 100); }
  // sosyal medya (Paslaş)
  Social.weekly(state);
  Social.weeklyScenario(state);
  Social.weeklyLeaguePosts(state);
  // hikâye bölümü ya da rastgele olay
  if (!state.event) state.event = Stories.weeklyStory(state, randomEvent);
}

// ---------- olaylar ----------
function randomEvent(state) {
  const p = state.player;
  const pool = [];
  const ask = Math.round(clamp(p.contract.wage * randInt(2, 6), 30_000, 20_000_000) / 1000) * 1000;
  pool.push({
    id: 'family_money', title: '📞 Aileden telefon',
    text: `Baban evin tadilatı için ${money(ask)} istiyor.`,
    options: [
      { label: `Gönder (${money(ask)})`, fx: { money: -ask, family: 12, morale: 2 } },
      { label: 'Şu an olmaz', fx: { family: -10 } },
    ],
  });
  pool.push({
    id: 'charity', title: '🎗️ Yardım kampanyası',
    text: 'Memleketindeki okul için yardım kampanyası düzenleniyor.',
    options: [
      { label: `Bağış yap (${money(Math.round(ask / 2))})`, fx: { money: -Math.round(ask / 2), fans: 6, fame: 2 } },
      { label: 'Katılmayayım', fx: {} },
    ],
  });
  pool.push({
    id: 'nightclub', title: '🌃 Gece daveti',
    text: 'Takım arkadaşların maç öncesi gece kulübüne çağırıyor.',
    options: [
      { label: 'Gidelim!', fx: { team: 8, energy: -25, coach: -6 } },
      { label: 'Erken yatacağım', fx: { coach: 4, team: -3 } },
    ],
  });
  pool.push({
    id: 'extra_training', title: '🏋️ Ek antrenman',
    text: 'Hoca, antrenman sonrası kalıp şut çalışmanı istiyor.',
    options: [
      { label: 'Kalırım hocam', fx: { coach: 6, energy: -15, stat: 'sut' } },
      { label: 'Yorgunum', fx: { coach: -5 } },
    ],
  });
  if (p.partner) pool.push({
    id: 'partner_trip', title: '💕 Tatil isteği',
    text: `${p.partner.name.split(' ')[0]} hafta sonu kaçamağı yapmak istiyor.`,
    options: [
      { label: `Gidelim (${money(Math.round(ask / 3))})`, fx: { money: -Math.round(ask / 3), partner: 12, energy: 10 } },
      { label: 'Maç var, olmaz', fx: { partner: -8 } },
    ],
  });
  return pick(pool);
}
export function resolveEvent(state, i) {
  const ev = state.event;
  if (!ev) return null;
  const r = Stories.applyChoice(state, ev, i, relAdd);
  state.event = null;
  return r;
}

// ---------- sakatlık ----------
export function injuryRoll(state, minutes) {
  const p = state.player;
  let risk = 0.018 * (minutes / 90) * injMul(p);
  if (p.energy < 30) risk *= 3;
  if (p.age >= 30) risk *= 1.5;
  if (p.fragile > 0) risk *= 2.5;   // ağrı kesiciyle erken dönüş
  if (Math.random() < risk) {
    p.injury = randInt(1, 5);
    p.morale = clamp(p.morale - 6, 0, 100);
    return p.injury;
  }
  return 0;
}

// ---------- bahis ----------
// Bu haftanın diğer maçları (oyuncunun takımının maçı hariç) için oranlar
export function bettable(state) {
  const s = state.season, out = [];
  for (const [lid, L] of Object.entries(s.leagues)) {
    const round = L.fixtures[s.week];
    if (!round) continue;
    for (const m of round) {
      if (m.h === state.player.clubId || m.a === state.player.clubId || m.hg !== null) continue;
      const th = state.teams[m.h], ta = state.teams[m.a];
      const xh = expectedGoals(th.str, ta.str, true), xa = expectedGoals(ta.str, th.str, false);
      const pr = outcomeProbs(xh, xa);
      const odd = (q) => Math.max(1.05, Math.round((0.92 / q) * 100) / 100); // %8 kasa payı
      out.push({ lid, h: m.h, a: m.a, odds: { '1': odd(pr[0]), X: odd(pr[1]), '2': odd(pr[2]) } });
    }
  }
  return out.slice(0, 12);
}
function outcomeProbs(lh, la) {
  const pmf = (l, k) => Math.exp(-l) * l ** k / [1, 1, 2, 6, 24, 120, 720, 5040][k];
  let w = 0, d = 0, l = 0;
  for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) {
    const q = pmf(lh, i) * pmf(la, j);
    if (i > j) w += q; else if (i === j) d += q; else l += q;
  }
  const t = w + d + l;
  return [w / t, d / t, l / t];
}
export function placeBet(state, match, pick, stake) {
  const p = state.player;
  stake = Math.floor(stake);
  if (!(stake > 0)) return { ok: false, msg: 'Geçerli bir miktar gir.' };
  if (stake > p.money) return { ok: false, msg: 'Paran yetmiyor.' };
  if (p.bets.some((b) => b.h === match.h && b.a === match.a && b.week === state.season.week)) return { ok: false, msg: 'Bu maça zaten oynadın.' };
  p.money -= stake;
  p.casinoWeek -= stake;
  p.bets.push({ week: state.season.week, year: state.season.year, lid: match.lid, h: match.h, a: match.a, pick, odd: match.odds[pick], stake });
  return { ok: true };
}
function resolveBets(state, weekIndex) {
  const p = state.player;
  const keep = [];
  for (const b of p.bets) {
    if (b.year !== state.season.year || b.week !== weekIndex) { if (b.week > weekIndex) keep.push(b); continue; }
    const m = state.season.leagues[b.lid]?.fixtures[b.week]?.find((x) => x.h === b.h && x.a === b.a);
    if (!m || m.hg === null) continue;
    const res = m.hg > m.ag ? '1' : m.hg === m.ag ? 'X' : '2';
    const tn = `${state.teams[b.h].short}-${state.teams[b.a].short} ${m.hg}-${m.ag}`;
    if (res === b.pick) {
      const win = Math.round(b.stake * b.odd);
      p.money += win;
      addInbox(state, `🎟️ Kupon tuttu! ${tn} · ${money(win)} kazandın.`);
    } else addInbox(state, `🎟️ Kupon yattı: ${tn}.`);
  }
  p.bets = keep;
}

// ---------- gazino ----------
export function casinoResult(state, delta) {
  const p = state.player;
  p.money += delta;
  p.casinoWeek += delta;
}
// Rulet: Avrupa ruleti (0-36)
const REDS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
export const rouletteColor = (n) => (n === 0 ? 'green' : REDS.has(n) ? 'red' : 'black');
export function spinRoulette(bet) {
  const n = randInt(0, 36);
  let mult = 0;
  if (bet.type === 'red' && rouletteColor(n) === 'red') mult = 2;
  if (bet.type === 'black' && rouletteColor(n) === 'black') mult = 2;
  if (bet.type === 'odd' && n !== 0 && n % 2 === 1) mult = 2;
  if (bet.type === 'even' && n !== 0 && n % 2 === 0) mult = 2;
  if (bet.type === 'num' && n === bet.num) mult = 36;
  return { n, mult };
}
// Slot
const SYMBOLS = ['⚽', '🍒', '🍋', '⭐', '🔔', '7️⃣'];
const SLOT_W = [30, 25, 20, 12, 9, 4];
const spin1 = () => { let r = Math.random() * 100; for (let i = 0; i < SYMBOLS.length; i++) { if ((r -= SLOT_W[i]) < 0) return SYMBOLS[i]; } return SYMBOLS[0]; };
export function spinSlot() {
  const reels = [spin1(), spin1(), spin1()];
  const [a, b, c] = reels;
  let mult = 0;
  if (a === b && b === c) mult = { '⚽': 5, '🍒': 8, '🍋': 10, '⭐': 20, '🔔': 30, '7️⃣': 100 }[a];
  else if (a === b || b === c || a === c) mult = 1.5;
  return { reels, mult };
}
// Blackjack
export function newDeck() {
  const d = [];
  for (const s of ['♠', '♥', '♦', '♣']) for (const r of ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']) d.push({ r, s });
  for (let i = d.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [d[i], d[j]] = [d[j], d[i]]; }
  return d;
}
export function handValue(h) {
  let v = 0, aces = 0;
  for (const c of h) { if (c.r === 'A') { v += 11; aces++; } else if ('JQK'.includes(c.r)) v += 10; else v += +c.r; }
  while (v > 21 && aces) { v -= 10; aces--; }
  return v;
}

export { leagueOf, rand };
