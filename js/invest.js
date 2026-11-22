// Yatırımlar: kira getiren mülkler, risk taşıyan işletmeler ve yarış atları (at yarışı).
// Tüm kişi ve at isimleri kurgusaldır.
import { clamp, pick, rand, randInt, money, addInbox, shuffle } from './engine.js';

// ---------------------------------------------------------------- mülk ve işletmeler
// kind: kira (sabit gelir, değer korur) · isletme (dalgalı gelir, risk)
export const PROPS = [
  { id: 'inv_daire1', name: 'Kiralık 1+1 daire', kind: 'kira', price: 6_000_000, base: 28_000, vol: 0.05, emoji: '🏢', desc: 'Öğrenci semtinde, kiracısı hazır.' },
  { id: 'inv_daire3', name: 'Kiralık 3+1 daire', kind: 'kira', price: 18_000_000, base: 82_000, vol: 0.05, emoji: '🏘️', desc: 'Aile kiracı, düzenli ödüyor.' },
  { id: 'inv_dukkan', name: 'Cadde üstü dükkân', kind: 'kira', price: 40_000_000, base: 175_000, vol: 0.1, emoji: '🏬', desc: 'Ana caddede, uzun kontratlı kiracı.' },
  { id: 'inv_kafe', name: 'Kafe', kind: 'isletme', price: 15_000_000, base: 70_000, vol: 0.9, emoji: '☕', desc: 'Adın tabelada. Ünün arttıkça müşteri artar.', fame: true },
  { id: 'inv_halisaha', name: 'Halı saha tesisi', kind: 'isletme', price: 30_000_000, base: 140_000, vol: 0.6, emoji: '⚽', desc: 'Akşamları dolu. Kışın biraz düşer.', fans: 1 },
  { id: 'inv_restoran', name: 'Restoran', kind: 'isletme', price: 70_000_000, base: 330_000, vol: 1.1, emoji: '🍽️', desc: 'İyi haftada çok kazandırır, kötü haftada zarar eder.', fame: true },
  { id: 'inv_akademi', name: 'Futbol akademisi', kind: 'isletme', price: 150_000_000, base: 300_000, vol: 0.3, emoji: '🎓', desc: 'Çocuklara futbol öğret. Taraftar ve ün kazandırır.', fans: 2 },
  { id: 'inv_otel', name: 'Butik otel', kind: 'isletme', price: 400_000_000, base: 1_300_000, vol: 0.7, emoji: '🏨', desc: 'Sezonluk turist geliri, yüksek risk yüksek getiri.', fame: true },
];
const PROP = Object.fromEntries(PROPS.map((x) => [x.id, x]));
export const SELL = { kira: 0.85, isletme: 0.6 };
export const propName = (p, it) => it.id === 'inv_kafe' ? `${p.surname} Kafe` : it.id === 'inv_restoran' ? `${p.surname} Sofrası` : it.name;

export function ensure(p) {
  p.invest ||= { props: [], horses: [], last: null, month: 0, monthSum: 0, market: null, raced: {} };
  return p.invest;
}

export function buyProp(state, id) {
  const p = state.player, I = ensure(p), it = PROP[id];
  if (!it) return { ok: false, msg: 'Bulunamadı.' };
  if (I.props.includes(id)) return { ok: false, msg: 'Zaten sende.' };
  if (p.money < it.price) return { ok: false, msg: 'Paran yetmiyor.' };
  p.money -= it.price; I.props.push(id);
  addInbox(state, `${it.emoji} ${propName(p, it)} artık senin! Haftalık getirisi ortalama ${money(it.base)}.`);
  return { ok: true };
}
export function sellProp(state, id) {
  const p = state.player, I = ensure(p), it = PROP[id];
  if (!I.props.includes(id)) return { ok: false, msg: 'Sende yok.' };
  I.props = I.props.filter((x) => x !== id);
  const back = Math.round(it.price * SELL[it.kind]);
  p.money += back;
  return { ok: true, back };
}

// Bir işletmenin bu haftaki geliri
function income(state, it, week) {
  const p = state.player;
  let x = it.base * (1 + rand(-it.vol, it.vol));
  if (it.fame) x *= 1 + (p.fame || 0) / 200;
  if (it.id === 'inv_halisaha') { const t = week / Math.max(1, state.season.totalWeeks || 34); if (t > 0.35 && t < 0.65) x *= 0.75; }
  return Math.round(x / 1000) * 1000;
}
const EVENTS = {
  inv_kafe: [['Kahve makinesi bozuldu', -0.6], ['Ünlü bir fenomen kafede paylaşım yaptı', 1.5]],
  inv_restoran: [['Mutfakta su baskını', -1.2], ['Bir yemek eleştirmeni övgü yazdı', 1.4]],
  inv_halisaha: [['Suni çim yenilendi', -0.8], ['Şirket turnuvası düzenlendi', 1.2]],
  inv_otel: [['Klima arızası, iade talepleri', -0.9], ['Bayram tatili, oteller doldu', 1.3]],
  inv_daire1: [['Kombi değişti', -2]], inv_daire3: [['Çatı tamiri', -1.5]], inv_dukkan: [['Kiracı geç ödedi, bu ay boş', -1]],
  inv_akademi: [['Akademiden bir çocuk süper lig takımıyla sözleşme imzaladı!', 1]],
};

// Haftalık: gelirler, at bakım masrafları, at dinlenmesi
export function weekly(state, week) {
  const p = state.player, I = ensure(p);
  const lines = [];
  let total = 0;
  for (const id of I.props) {
    const it = PROP[id]; if (!it) continue;
    let x = income(state, it, week);
    const ev = EVENTS[id];
    if (ev && Math.random() < 0.05) { const [t, m] = pick(ev); x += Math.round(it.base * m / 1000) * 1000; lines.push(`${it.emoji} ${t}`); if (id === 'inv_akademi' && m > 0) p.fame = clamp((p.fame || 0) + 1, 0, 100); }
    if (it.fans && Math.random() < 0.25) p.fans = clamp((p.fans ?? 50) + it.fans * 0.5, 0, 100);
    total += x;
  }
  let upkeep = 0;
  for (const h of I.horses) { upkeep += h.upkeep; h.fatigue = Math.max(0, (h.fatigue || 0) - 1); }
  total -= upkeep;
  if (I.props.length || I.horses.length) {
    p.money += total;
    I.last = { total, upkeep, lines };
    I.monthSum = (I.monthSum || 0) + total;
    I.month = (I.month || 0) + 1;
    for (const l of lines) addInbox(state, `💼 ${l}`);
    if (I.month >= 4) {
      addInbox(state, `💼 Son 4 haftada yatırımların ${I.monthSum >= 0 ? 'kazandırdı' : 'kaybettirdi'}: ${money(Math.abs(I.monthSum))}.`);
      I.month = 0; I.monthSum = 0;
    }
  }
  return total;
}

// ---------------------------------------------------------------- yarış atları
const HORSE_A = ['Rüzgâr', 'Kara', 'Yıldız', 'Gümüş', 'Altın', 'Deli', 'Asil', 'Boz', 'Ateş', 'Mavi', 'Şahin', 'Fırtına', 'Kızıl', 'Bulut', 'Sultan', 'Toros'];
const HORSE_B = ['Gülü', 'Şimşek', 'Tozu', 'Ok', 'Yele', 'Doru', 'Kanat', 'Prens', 'Rüya', 'Efe', 'Dalga', 'Kartal', 'Yay', 'Kervan', 'Han', 'Ay'];
const JOCKEYS = ['Halil Doğru', 'Selçuk Ova', 'Kemal Uçar', 'Gökhan Yel', 'Ozan Atlı', 'Murat Tozkoparan', 'Ferhat Düz', 'Cem Akıncı'];
const horseName = () => `${pick(HORSE_A)} ${pick(HORSE_B)}`;
const q = (h) => h.speed * 0.6 + h.stamina * 0.4;
export const horseQ = (h) => Math.round(q(h));
const priceOf = (h) => Math.round(Math.max(1_500_000, ((q(h) - 40) ** 2.2) * 15_000 * (h.age <= 4 ? 1.2 : h.age >= 7 ? 0.6 : 1)) / 100_000) * 100_000;

function newHorse(lo, hi) {
  const base = randInt(lo, hi);
  const h = { id: 'h' + Math.random().toString(36).slice(2, 8), name: horseName(), age: randInt(2, 6), speed: clamp(base + randInt(-6, 6), 35, 99), stamina: clamp(base + randInt(-8, 8), 35, 99), form: 50, races: 0, wins: 0, earned: 0, fatigue: 0 };
  h.price = priceOf(h);
  h.upkeep = Math.round(h.price * 0.0035 / 1000) * 1000 + 20_000;
  return h;
}

// Sezon başına yenilenen at pazarı (4 at: ucuz, iki orta, bir elit)
export function market(state) {
  const I = ensure(state.player), y = state.season.year;
  if (!I.market || I.market.year !== y) I.market = { year: y, list: [newHorse(53, 60), newHorse(60, 70), newHorse(62, 74), newHorse(80, 90)] };
  return I.market.list;
}
export function buyHorse(state, hid) {
  const p = state.player, I = ensure(p);
  const i = market(state).findIndex((h) => h.id === hid);
  if (i < 0) return { ok: false, msg: 'At bulunamadı.' };
  const h = I.market.list[i];
  if (I.horses.length >= 4) return { ok: false, msg: 'Ahırında en fazla 4 at olabilir.' };
  if (p.money < h.price) return { ok: false, msg: 'Paran yetmiyor.' };
  p.money -= h.price;
  I.market.list.splice(i, 1);
  I.horses.push(h);
  addInbox(state, `🐎 ${h.name} ahırına geldi! Haftalık bakım masrafı ${money(h.upkeep)}.`);
  return { ok: true, h };
}
export function sellHorse(state, hid) {
  const p = state.player, I = ensure(p);
  const h = I.horses.find((x) => x.id === hid);
  if (!h) return { ok: false };
  const back = Math.round(priceOf(h) * 0.7 * (0.8 + h.form / 250) / 100_000) * 100_000;
  I.horses = I.horses.filter((x) => x !== h);
  p.money += back;
  return { ok: true, back };
}

// Sezon sonu: atlar yaşlanır, gelişir ya da yavaşlar; 10 yaşında emekli olur
export function seasonEnd(state) {
  const p = state.player, I = ensure(p);
  for (const h of I.horses) {
    h.age++;
    const d = h.age <= 4 ? randInt(1, 5) : h.age <= 6 ? randInt(-1, 2) : randInt(-6, -2);
    h.speed = clamp(h.speed + d, 30, 99); h.stamina = clamp(h.stamina + d + randInt(-1, 1), 30, 99);
  }
  const old = I.horses.filter((h) => h.age >= 10);
  for (const h of old) { p.money += 500_000; addInbox(state, `🐎 ${h.name} yarışlardan emekli oldu ve bir çiftliğe gönderildi. (${h.wins} galibiyet)`); }
  I.horses = I.horses.filter((h) => h.age < 10);
  I.raced = {};
}

// Yarış takvimi: her hafta üç koşu; sezonun %70'inde Gazi Koşusu
export const RACES = {
  maiden: { name: 'Maiden Koşusu', fee: 50_000, prize: 900_000, field: 54, dist: 1400 },
  handikap: { name: 'Handikap Koşusu', fee: 200_000, prize: 3_000_000, field: 66, dist: 1600 },
  grup: { name: 'Grup Koşusu', fee: 700_000, prize: 12_000_000, field: 76, dist: 2000 },
  gazi: { name: 'Gazi Koşusu', fee: 2_500_000, prize: 50_000_000, field: 85, dist: 2400, fame: 5 },
};
export const gaziWeek = (state) => Math.round((state.season.totalWeeks || 34) * 0.7);
export function racesThisWeek(state) {
  const ids = ['maiden', 'handikap', 'grup'];
  if (state.season.week === gaziWeek(state)) ids.push('gazi');
  return ids.map((id) => ({ id, ...RACES[id] }));
}
export function canRace(state, h) {
  if (state.phase !== 'hub') return { ok: false, why: 'Sezon bitti.' };
  if ((h.fatigue || 0) > 0) return { ok: false, why: `${h.fatigue} hafta dinlenmeli.` };
  return { ok: true };
}
export const TACTICS = {
  onde: { name: 'Önden kaç', desc: 'Başta hızlı, dayanıklılığı düşükse sonda düşer.' },
  orta: { name: 'Grupta bekle', desc: 'Dengeli koşu.' },
  sonda: { name: 'Sonda patla', desc: 'Geride bekler, son düzlükte hızlanır.' },
};

// Yarışı simüle et: kareler halinde konumlar (animasyon için) ve sonuç
export function runRace(state, raceId, hid, tactic) {
  const p = state.player, I = ensure(p);
  const R = RACES[raceId], h = I.horses.find((x) => x.id === hid);
  if (!R || !h) return null;
  const c = canRace(state, h); if (!c.ok) return { error: c.why };
  if (p.money < R.fee) return { error: 'Kayıt ücretine paran yetmiyor.' };
  p.money -= R.fee;
  const field = [{ name: h.name, mine: true, speed: h.speed, stamina: h.stamina, form: h.form, tactic, jockey: 'Senin jokeyin' }];
  const names = new Set([h.name]);
  const jk = shuffle(JOCKEYS.slice());
  for (let i = 0; i < 7; i++) {
    let n; do n = horseName(); while (names.has(n)); names.add(n);
    const b = R.field + randInt(-8, 7);
    field.push({ name: n, speed: clamp(b + randInt(-5, 5), 30, 99), stamina: clamp(b + randInt(-7, 7), 30, 99), form: randInt(40, 70), tactic: pick(Object.keys(TACTICS)), jockey: jk[i] });
  }
  const D = R.dist, FR = 160;
  const pos = field.map(() => 0), done = field.map(() => null);
  const frames = [];
  const tired = field.map((f) => Math.max(0, (R.dist / 1000) * 14 - f.stamina * 0.16));
  const day = field.map(() => rand(0.93, 1.07));                  // günün formu
  const slip = field.map(() => (Math.random() < 0.08 ? randInt(10, 60) : -1));   // kötü çıkış / sıkışma anı
  for (let t = 0; t < 400 && done.some((x) => x === null); t++) {
    for (let i = 0; i < field.length; i++) {
      if (done[i] !== null) continue;
      const f = field[i], prog = pos[i] / D;
      let v = 8 + f.speed * 0.07 + (f.form - 50) * 0.015;
      if (f.tactic === 'onde') v *= prog < 0.5 ? 1.07 : 1 - tired[i] * 0.012 * (prog - 0.5) * 2;
      if (f.tactic === 'sonda') v *= prog < 0.7 ? 0.95 : 1.08 + f.speed * 0.0008;
      v *= 1 - tired[i] * 0.006 * prog;
      v *= rand(0.93, 1.07) * day[i];
      if (slip[i] >= 0 && t >= slip[i] && t < slip[i] + 8) v *= 0.55;
      pos[i] += v;
      if (pos[i] >= D) { pos[i] = D; done[i] = t + (pos[i] - D) / v; }
    }
    frames.push(pos.map((x) => x / D));
  }
  const order = field.map((f, i) => ({ ...f, t: done[i] ?? 999 })).sort((a, b) => a.t - b.t);
  const place = order.findIndex((x) => x.mine) + 1;
  const prize = place === 1 ? R.prize : place === 2 ? Math.round(R.prize * 0.4) : place === 3 ? Math.round(R.prize * 0.2) : 0;
  p.money += prize;
  h.races++; if (place === 1) h.wins++; h.earned += prize;
  h.form = clamp(h.form + (place <= 3 ? 6 : -4), 20, 90);
  h.fatigue = raceId === 'gazi' || raceId === 'grup' ? 3 : 2;   // haftalık sayaç: 2 = bir hafta ara
  if (place === 1 && R.fame) p.fame = clamp((p.fame || 0) + R.fame, 0, 100);
  if (place === 1) addInbox(state, `🏁 ${h.name} ${R.name}'nu kazandı! Ödül: ${money(prize)}.`);
  // FR: animasyonu ~FR kareye sıkıştır
  const step = Math.max(1, Math.floor(frames.length / FR));
  return { race: { id: raceId, ...R }, horse: h.name, field: field.map((f) => ({ name: f.name, mine: !!f.mine, jockey: f.jockey })), frames: frames.filter((_, i) => i % step === 0).concat([pos.map((x) => x / D)]), order: order.map((x) => ({ name: x.name, mine: !!x.mine })), place, prize, fee: R.fee };
}
