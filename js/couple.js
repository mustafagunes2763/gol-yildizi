// Sevgili / eş ile ilişki: romantik planlar, hediye ve sürprizler, tatiller, dertleşme ve çocuk isteme.
// Her partnerin bir zevki var: aynı plan herkesi aynı derecede mutlu etmez.
import { clamp, pick, randInt, money, addInbox } from './engine.js';
import { ek } from './news.js';

export const TASTES = {
  romantik: { name: 'Romantik', hint: 'Küçük, anlamlı jestlere bayılır.' },
  maceraci: { name: 'Maceracı', hint: 'Yeni yerler ve heyecan ister.' },
  luks: { name: 'Lüks sever', hint: 'Şık mekânlar ve pahalı hediyeler onu etkiler.' },
  sade: { name: 'Sade', hint: 'Gösterişi sevmez, birlikte vakit geçirmek yeter.' },
};
const first = (n) => (n || '').split(' ')[0];
export function ensure(p) {
  if (!p.partner) return null;
  p.partner.taste ||= pick(Object.keys(TASTES));
  return p.partner;
}

// ---------------------------------------------------------------- romantik planlar (haftada bir)
// c: maaşın katı (en az min) · love: [min,max] · t: zevke göre çarpan
export const PLANS = [
  { id: 'yemek', img: 'soc_dinner', emoji: '🍽️', name: 'Akşam yemeği', c: 0.5, min: 10_000, love: [4, 8], t: { luks: 1.4, romantik: 1.1 }, line: (n) => `${n} ile şehrin ışıklarına bakan bir restoranda yemek yediniz.` },
  { id: 'sinema', emoji: '🎬', name: 'Sinema gecesi', c: 0.1, min: 3_000, love: [3, 6], t: { sade: 1.4 }, line: (n) => `${n} filmin en heyecanlı yerinde koluna sarıldı.` },
  { id: 'sahil', emoji: '🌅', name: 'Sahilde yürüyüş', c: 0, min: 0, love: [2, 6], t: { romantik: 1.6, sade: 1.4, luks: 0.6 }, line: (n) => `Gün batımında sahilde uzun uzun yürüdünüz. ${n} hiç bu kadar gülmemişti.` },
  { id: 'film', emoji: '🛋️', name: 'Evde film ve pizza', c: 0, min: 0, love: [2, 5], t: { sade: 1.6, luks: 0.5 }, energy: 4, line: (n) => `Battaniye, pizza ve bir film. ${n} ikinci filmde uyuyakaldı.` },
  { id: 'konser', emoji: '🎤', name: 'Konser', c: 0.8, min: 15_000, love: [4, 9], t: { maceraci: 1.4, romantik: 1.1 }, energy: -6, line: (n) => `Konserde en sevdiği şarkıda ${n} sesini kaybedene kadar söyledi.` },
  { id: 'tekne', emoji: '⛵', name: 'Tekne turu', c: 2, min: 60_000, love: [6, 11], t: { luks: 1.5, maceraci: 1.2 }, line: (n) => `Boğazda özel bir teknede akşam yemeği. ${n} fotoğraf çekmekten yemeğe fırsat bulamadı.` },
  { id: 'kurs', emoji: '👩‍🍳', name: 'Birlikte yemek kursu', c: 0.4, min: 8_000, love: [4, 8], t: { sade: 1.3, maceraci: 1.2 }, line: (n) => `Yemek kursunda hamuru yere düşürdün, ${n} gülmekten kriz geçirdi.` },
  { id: 'paintball', emoji: '🎯', name: 'Paintball', c: 0.3, min: 6_000, love: [3, 8], t: { maceraci: 1.7, luks: 0.6 }, energy: -8, line: (n) => `${n} seni üç kez vurdu ve bunu haftalarca anlatacak.` },
];
export const planCost = (p, x) => Math.max(x.min, Math.round(p.contract.wage * x.c / 1000) * 1000);

// ---------------------------------------------------------------- hediye ve sürprizler (haftada bir)
export const GIFTS = [
  { id: 'cicek', emoji: '💐', name: 'Çiçek', c: 0.3, min: 5_000, love: [3, 6], t: { romantik: 1.4 }, line: (n) => `${n} çiçekleri vazoya koyup fotoğrafını çekti.` },
  { id: 'mektup', emoji: '✉️', name: 'El yazısıyla mektup', c: 0, min: 0, love: [3, 9], t: { romantik: 1.8, sade: 1.4, luks: 0.5 }, line: (n) => `${n} mektubu okurken gözleri doldu.` },
  { id: 'plak', emoji: '📀', name: 'Sevdiği sanatçının plağı', c: 0.6, min: 12_000, love: [5, 9], t: { sade: 1.3, romantik: 1.2 }, line: (n) => `${n}: "Bunu hatırlaman çok tatlı!"` },
  { id: 'taki', emoji: '💎', name: 'Pırlanta kolye', c: 6, min: 250_000, love: [6, 14], t: { luks: 1.6, sade: 0.6 }, line: (n) => `${n} kolyeyi takıp aynanın karşısından ayrılmadı.` },
  { id: 'canta', emoji: '👜', name: 'Tasarım çanta', c: 4, min: 150_000, love: [5, 12], t: { luks: 1.5, sade: 0.5, maceraci: 0.7 }, line: (n) => `${n} çantayı hemen bir davette kullanmak istedi.` },
  { id: 'parti', emoji: '🎉', name: 'Sürpriz parti', c: 2, min: 80_000, love: [6, 13], t: { maceraci: 1.3, romantik: 1.3, sade: 0.8 }, energy: -6, line: (n) => `Işıklar yanınca ${n} çığlık attı; bütün arkadaşları oradaydı!` },
  { id: 'yildiz', emoji: '⭐', name: 'Adına yıldız kaydettir', c: 1, min: 30_000, love: [5, 10], t: { romantik: 1.6 }, line: (n) => `Gökyüzünde artık "${n}" adında bir yıldız var.` },
];

// ---------------------------------------------------------------- tatiller (8 haftada bir; bir antrenmanı kaçırırsın)
export const TRIPS = [
  { id: 'kapadokya', emoji: '🎈', name: 'Kapadokya, balon turu', cost: 400_000, love: [8, 13], t: { romantik: 1.4, maceraci: 1.3 }, line: (n) => `Gün doğumunda balondan peribacalarına baktınız. ${n} bu anı hiç unutmayacak.` },
  { id: 'bodrum', emoji: '🏖️', name: 'Bodrum, hafta sonu', cost: 900_000, love: [7, 12], t: { luks: 1.3, sade: 1.1 }, line: (n) => `Bodrum'da güneş, deniz ve uzun akşam yemekleri. ${n} bronzlaşmış dönüyor.` },
  { id: 'paris', img: 'soc_paris', emoji: '🗼', name: 'Paris', cost: 2_500_000, love: [9, 15], t: { romantik: 1.5, luks: 1.3 }, line: (n) => `Eyfel Kulesi'nin önünde ${n} ellerini tuttu. Şehir ışıl ışıldı.` },
  { id: 'maldiv', emoji: '🏝️', name: 'Maldivler', cost: 8_000_000, love: [12, 18], t: { luks: 1.5, maceraci: 1.1, sade: 0.8 }, line: (n) => `Su üstü bungalov, bembeyaz kum. ${n}: "Burada kalalım, futbolu bırak!"` },
  { id: 'kamp', emoji: '⛺', name: 'Dağda kamp', cost: 40_000, love: [5, 11], t: { maceraci: 1.7, sade: 1.3, luks: 0.4 }, line: (n) => `Kamp ateşinin başında yıldızları saydınız. ${n} uyku tulumunda bile güldü.` },
];
export const TRIP_COOLDOWN = 8;

const nowAbs = (state) => state.season.year * 60 + state.season.week;

function doIt(state, item, cost, flag, extra = {}) {
  const p = state.player, pt = ensure(p);
  if (!pt) return { ok: false, msg: 'Bir ilişkin yok.' };
  if (flag && p.weekFlags?.[flag]) return { ok: false, msg: flag === 'gift' ? 'Bu hafta zaten bir sürpriz yaptın.' : 'Bu hafta zaten birlikte bir plan yaptınız.' };
  if (p.money < cost) return { ok: false, msg: `${money(cost)} lazım.` };
  p.money -= cost;
  if (flag) (p.weekFlags ||= {})[flag] = true;
  const mult = item.t?.[pt.taste] ?? 1;
  // aynı şeyi üst üste yapmak etkisini azaltır
  const last = pt.lastAct === item.id ? 0.5 : 1;
  pt.lastAct = item.id;
  const d = Math.max(1, Math.round(randInt(item.love[0], item.love[1]) * mult * last));
  pt.value = clamp(pt.value + d, 0, 100);
  p.morale = clamp(p.morale + Math.ceil(d / 3), 0, 100);
  if (item.energy) p.energy = clamp(p.energy + item.energy, 0, 100);
  const n = first(pt.name);
  let msg = `${item.emoji} ${item.line(n)}`;
  msg += mult >= 1.3 ? ` Tam ${ek(n, 'dat')} göre bir şeydi!` : mult <= 0.7 ? ` ${n} pek etkilenmedi; belki başka bir şey denemelisin.` : '';
  if (last < 1) msg += ' (Aynı şeyi yine yaptınız, sürprizi kalmadı.)';
  // magazin: ünlüysen bazen görüntülenirsiniz
  let paparazzi = false;
  if ((p.fame || 0) >= 30 && cost > 0 && Math.random() < 0.15) { paparazzi = true; p.fame = clamp(p.fame + 0.5, 0, 100); msg += ' 📸 Magazin muhabirleri de oradaydı.'; }
  Object.assign(extra, { d, mult, paparazzi });
  return { ok: true, msg: `${msg} İlişki +${d}`, d, paparazzi, img: item.img || null };
}

export function doPlan(state, id) {
  const x = PLANS.find((y) => y.id === id); if (!x) return { ok: false };
  return doIt(state, x, planCost(state.player, x), 'date');
}
export function doGift(state, id) {
  const x = GIFTS.find((y) => y.id === id); if (!x) return { ok: false };
  return doIt(state, x, planCost(state.player, x), 'gift');
}
export function tripReady(state) {
  const pt = state.player.partner; if (!pt) return { ok: false };
  const left = (pt.lastTrip ?? -99) + TRIP_COOLDOWN - nowAbs(state);
  return left > 0 ? { ok: false, why: `${left} hafta sonra yeniden tatile çıkabilirsiniz.` } : { ok: true };
}
export function doTrip(state, id) {
  const x = TRIPS.find((y) => y.id === id); if (!x) return { ok: false };
  const r0 = tripReady(state); if (!r0.ok) return { ok: false, msg: r0.why };
  const p = state.player;
  const r = doIt(state, x, x.cost, null);
  if (!r.ok) return r;
  p.partner.lastTrip = nowAbs(state);
  // dinlendin ama bir antrenmanı kaçırdın
  p.energy = clamp(p.energy + 25, 0, 100);
  if (p.rel) p.rel.coach = clamp(p.rel.coach - 3, 0, 100);
  return { ...r, msg: `${r.msg} · Enerji +25, hocayla ilişki −3 (antrenman kaçtı)` };
}

// ---------------------------------------------------------------- dertleşme (2 haftada bir), olay kartı olarak döner
export function talkReady(state) {
  const pt = state.player.partner; if (!pt) return { ok: false };
  const left = (pt.lastTalk ?? -99) + 2 - nowAbs(state);
  return left > 0 ? { ok: false, why: 'Biraz önce konuştunuz. Haftaya tekrar dene.' } : { ok: true };
}
export function talkEvent(state) {
  const p = state.player, pt = ensure(p); if (!pt) return null;
  pt.lastTalk = nowAbs(state);
  const n = first(pt.name), face = 'partner' + (pt.portrait ?? 0);
  const topics = [];
  if ((p.fame || 0) >= 35) topics.push(() => ({
    title: '💬 Kıskançlık', face,
    text: `${n}: "Paslaş'ta sana yazan o kadar insan var ki… Bazen kendimi ikinci planda hissediyorum."`,
    options: [
      { label: '"Benim için tek bir kişi var, o da sensin."', fx: { partner: 7, morale: 2 }, result: `${n} gülümsedi, telefonunu bir kenara bıraktı.` },
      { label: 'Ortak bir paylaşım yapmayı öner', fx: { partner: 5, fans: 2 }, result: 'Birlikte fotoğrafınız binlerce beğeni aldı.' },
      { label: '"Abartıyorsun, bu benim işim."', fx: { partner: -8, morale: -2 }, result: `${n} o gece pek konuşmadı.` },
    ],
  }));
  topics.push(() => ({
    title: '💬 Kariyer ve gelecek', face,
    text: `${n}: "Yurt dışından teklif gelirse ne yapacağız? Ben burada işimi, ailemi bırakabilir miyim bilmiyorum."`,
    options: [
      { label: '"Kararı birlikte vereceğiz."', fx: { partner: 6, family: 2 }, result: `${n} rahatladı: "Sana güveniyorum."` },
      { label: '"Kariyerim her şeyden önce gelir."', fx: { partner: -7, morale: 1 }, result: `${n} sessizce başını salladı.` },
      { label: '"Gidersek seninle her yeri yuva yaparız."', fx: { partner: 8 }, result: `${n} sana sarıldı.` },
    ],
  }));
  if (pt.value < 55) topics.push(() => ({
    title: '💬 "Bana hiç zaman ayırmıyorsun"', face,
    text: `${n}: "Antrenman, maç, röportaj… Ben neredeyim bu hayatta?"`,
    options: [
      { label: 'Haklı olduğunu kabul et, söz ver', fx: { partner: 9, morale: -1 }, result: `${n}: "Sözünü tutarsan her şey düzelir."` },
      { label: '"Sezon bitince telafi edeceğim."', fx: { partner: 3 }, result: `${n} pek ikna olmadı ama bekleyecek.` },
      { label: 'Kapıyı çarpıp çık', fx: { partner: -12, morale: -5 }, result: 'Tartışma büyüdü. Gece kanepede uyudun.' },
    ],
  }));
  if ((p.children || []).some((c) => !c.exOf)) topics.push(() => ({
    title: '💬 Çocuklar', face,
    text: `${n}: "Çocuklar seni çok özlüyor. Bu hafta onları okuldan sen alabilir misin?"`,
    options: [
      { label: '"Tabii, ben alırım."', fx: { partner: 5, family: 6, energy: -6 }, result: 'Okul kapısında çocuklar boynuna atladı.' },
      { label: '"Bu hafta çok yoğunum."', fx: { partner: -5, family: -4 }, result: `${n}: "Hep böyle diyorsun."` },
    ],
  }));
  topics.push(() => ({
    title: '💬 Aileler', face,
    text: `${n}: "Annem bu pazar bizi yemeğe çağırıyor. Maç sonrası yorgun olacağını biliyorum ama…"`,
    options: [
      { label: 'Git, kayınvalideyi mutlu et', fx: { partner: 6, family: 3, energy: -5 }, result: 'Yemekler bitmek bilmedi ama herkes mutlu.' },
      { label: 'Kibarca bir sonraki haftaya ertele', fx: { partner: 1 }, result: `${n} annesine "Haftaya kesin geliyoruz" dedi.` },
      { label: '"Ben gelmeyeyim, sen git."', fx: { partner: -6 }, result: `${n} tek başına gitti.` },
    ],
  }));
  topics.push(() => ({
    title: '💬 Hayaller', face,
    text: `${n}: "Futbol bitince ne yapmak istersin? Ben hep bir bahçeli ev hayal ettim."`,
    options: [
      { label: 'Birlikte hayal kur', fx: { partner: 6, morale: 3 }, result: 'Saatlerce bahçeye dikilecek ağaçları konuştunuz.' },
      { label: '"Futbol hiç bitmeyecek!"', fx: { partner: 1, morale: 2 }, result: `${n} güldü: "Sen bilirsin kaptan."` },
    ],
  }));
  return pick(topics)();
}

// ---------------------------------------------------------------- çocuk isteme
export function childReady(state) {
  const p = state.player, pt = p.partner;
  if (!pt) return { ok: false, why: 'Önce bir ilişkin olmalı.' };
  if (!pt.married && !(pt.value >= 75 && pt.weeks >= 30)) return { ok: false, why: 'Önce evlenmelisiniz ya da ilişkiniz çok güçlü ve uzun olmalı.' };
  if (p.stories?.baby) return { ok: false, why: 'Bebek yolda! 🍼' };
  if (p.newborn > 0) return { ok: false, why: 'Daha yeni bir bebeğiniz oldu.' };
  if ((p.children || []).filter((c) => !c.exOf).length >= 5) return { ok: false, why: 'Kalabalık bir aile oldunuz.' };
  const left = (pt.childAsk ?? -99) + 8 - nowAbs(state);
  if (left > 0) return { ok: false, why: `Bu konuyu ${left} hafta sonra yeniden açabilirsin.` };
  return { ok: true };
}
export function childEvent(state) {
  const p = state.player, pt = ensure(p);
  pt.childAsk = nowAbs(state);
  const n = first(pt.name), face = 'partner' + (pt.portrait ?? 0);
  const kids = (p.children || []).filter((c) => !c.exOf).length;
  let chance = (pt.value - 40) / 45 - (pt.married ? 0 : 0.2) - kids * 0.08;
  chance = clamp(chance, 0.05, 0.95);
  const yes = Math.random() < chance;
  if (yes) return {
    title: kids ? '👶 Bir kardeş daha?' : '👶 "Bir bebeğimiz olsun mu?"', face,
    text: `${n} bir an sustu, sonra gözleri parladı: "${kids ? 'Bir kardeş… Evet, ben de çok istiyorum!' : 'Ben de uzun zamandır bunu düşünüyordum. Evet!'}"`,
    options: [
      { label: 'Ona sarıl', fx: { partner: 8, morale: 5, family: 3 }, result: 'Güzel haberler yakında gelebilir…', next: { story: 'baby', step: 'news', a: 3, b: 8 } },
    ],
  };
  const why = !pt.married ? 'Önce evlenelim, sonra konuşalım.' : kids >= 2 ? 'Şu an elimiz kolumuz dolu, biraz bekleyelim.' : pt.value < 60 ? 'Önce aramızı düzeltmemiz lazım.' : 'Henüz hazır hissetmiyorum, biraz zaman ver.';
  return {
    title: '👶 Çocuk konusu', face,
    text: `${n}: "${why}"`,
    options: [
      { label: '"Anlıyorum, acele yok."', fx: { partner: 4 }, result: `${n} anlayışın için teşekkür etti. Birkaç ay sonra yeniden konuşabilirsiniz.` },
      { label: 'Israr et', fx: { partner: -7, morale: -2 }, result: 'Konu tartışmaya döndü.' },
    ],
  };
}

export { addInbox };
