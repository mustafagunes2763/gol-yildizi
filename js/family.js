// Aile hayatı: evlilik teklifi (yüzük + yer), düğün, evlilik, boşanma (mal paylaşımı + nafaka), çocuklar.
import { clamp, pick, randInt, money, addInbox } from './engine.js';

const ABS = (s) => s.season.year * 60 + s.season.week;
const wageOf = (p) => Math.max(5_000, p.contract?.wage || 5_000);

// ---------- teklif ----------
export const RINGS = [
  { id: 'r1', name: 'Sade alyans', desc: 'Küçük ama içten', mul: 3, bonus: 0, emoji: '💍' },
  { id: 'r2', name: 'Pırlanta tektaş', desc: 'Klasik ve göz alıcı', mul: 12, bonus: 0.08, emoji: '💎' },
  { id: 'r3', name: 'Özel tasarım mücevher', desc: 'Kuyumcu senin için tasarladı', mul: 40, bonus: 0.14, emoji: '👑' },
];
export const PLACES = [
  { id: 'home', name: 'Evde mum ışığında', desc: 'Sakin ve romantik', mul: 0.5, bonus: 0.04, fame: 0, shy: 0.06 },
  { id: 'boat', name: 'Boğaz\'da tekne turu', desc: 'Gün batımı, keman, çiçekler', mul: 6, bonus: 0.08, fame: 1, shy: 0.03 },
  { id: 'stad', name: 'Stadyumda dev ekranda', desc: 'Maç sonrası 40 bin kişinin önünde', mul: 2, bonus: 0, fame: 5, fans: 5, public: true },
  { id: 'trip', name: 'Kapadokya\'da balonda', desc: 'Gün doğumunda gökyüzünde', mul: 10, bonus: 0.1, fame: 2, shy: 0.02 },
];
export const ringCost = (p, r) => Math.round(clamp(wageOf(p) * r.mul, 15_000, 60_000_000) / 1000) * 1000;
export const placeCost = (p, pl) => Math.round(clamp(wageOf(p) * pl.mul, 2_000, 20_000_000) / 1000) * 1000;
export const canPropose = (p) => !!p.partner && !p.partner.married && !p.partner.engaged && p.partner.weeks >= 10 && p.partner.value >= 55 && !(p.partner.cooldown > 0);

// kabul şansı: ilişki, birliktelik süresi, yüzük, yer (ünlü sever mi?)
export function acceptChance(p, ring, place) {
  const pt = p.partner;
  let c = 0.25 + (pt.value - 55) / 45 * 0.5 + Math.min(0.1, (pt.weeks - 10) / 300);
  c += ring.bonus + (place.bonus || 0);
  if (place.public) c += pt.likesFame ? 0.12 : -0.12;
  else if (!pt.likesFame) c += place.shy || 0;
  return clamp(c, 0.1, 0.96);
}
export function propose(state, ringId, placeId) {
  const p = state.player, pt = p.partner;
  const ring = RINGS.find((r) => r.id === ringId), place = PLACES.find((x) => x.id === placeId);
  if (!ring || !place || !canPropose(p)) return { ok: false, msg: 'Şu an teklif edemezsin.' };
  const cost = ringCost(p, ring) + placeCost(p, place);
  if (p.money < cost) return { ok: false, msg: `${money(cost)} lazım.` };
  p.money -= cost;
  const first = pt.name.split(' ')[0];
  const yes = Math.random() < acceptChance(p, ring, place);
  if (place.fame) p.fame = clamp(p.fame + place.fame * (yes ? 1 : 0.6), 0, 100);
  if (yes) {
    pt.engaged = true; pt.ring = ring.id;
    pt.value = clamp(pt.value + 12, 0, 100);
    p.morale = clamp(p.morale + 12, 0, 100);
    if (place.fans) p.fans = clamp((p.fans ?? 50) + place.fans, 0, 100);
    addInbox(state, `${first} "EVET" dedi! ${ring.emoji} Nişanlısınız. Sıra düğünde.`);
    return { ok: true, yes, place, ring, msg: `${first} evet dedi! 💍` };
  }
  pt.value = clamp(pt.value - 18, 0, 100);
  pt.cooldown = 12;
  p.morale = clamp(p.morale - 12, 0, 100);
  if (place.public) p.fans = clamp((p.fans ?? 50) - 3, 0, 100);
  // yüzük satılır, yarı fiyatına
  p.money += Math.round(ringCost(p, ring) * 0.5);
  const leave = pt.value < 30 && Math.random() < 0.5;
  addInbox(state, `${first} teklifine "henüz hazır değilim" dedi.${leave ? ' Kısa süre sonra da ayrıldınız.' : ''}`);
  if (leave) { p.partner = null; p.exes = [...(p.exes || []), { name: pt.name, how: 'teklif sonrası ayrılık', year: state.season.year }]; }
  return { ok: true, yes: false, place, ring, left: leave, msg: leave ? `${first} hayır dedi ve ayrıldınız 💔` : `${first} hayır dedi… 💔` };
}

// ---------- düğün ----------
export const WEDDINGS = [
  { id: 'nikah', name: 'Sade nikâh', desc: 'Belediyede, sadece aileler', mul: 6, family: 6, fame: 0, fans: 1, partner: 4 },
  { id: 'buyuk', name: 'Büyük düğün', desc: '1000 davetli, ünlü sanatçılar, takım arkadaşların', mul: 40, family: 10, fame: 6, fans: 4, partner: 10 },
  { id: 'gizli', name: 'Gizli düğün (yurtdışı)', desc: 'Toskana\'da bir bağ evinde, basına kapalı', mul: 25, family: -4, fame: 3, fans: 0, partner: 12 },
];
export const weddingCost = (p, w) => Math.round(clamp(wageOf(p) * w.mul, 50_000, 80_000_000) / 1000) * 1000;
export function wed(state, wid) {
  const p = state.player, pt = p.partner, w = WEDDINGS.find((x) => x.id === wid);
  if (!pt?.engaged || !w) return { ok: false, msg: 'Önce nişanlanmalısınız.' };
  const cost = weddingCost(p, w);
  if (p.money < cost) return { ok: false, msg: `Düğün için ${money(cost)} lazım.` };
  p.money -= cost;
  pt.engaged = false; pt.married = true; pt.marriedAt = ABS(state); pt.marriedYear = state.season.year; pt.wedding = w.id;
  pt.value = clamp(pt.value + w.partner, 0, 100);
  p.rel.family = clamp(p.rel.family + w.family, 0, 100);
  p.fame = clamp(p.fame + w.fame, 0, 100);
  p.fans = clamp((p.fans ?? 50) + w.fans, 0, 100);
  p.morale = clamp(p.morale + 15, 0, 100);
  addInbox(state, `${pt.name} ile evlendiniz! (${w.name}, ${money(cost)})`);
  return { ok: true, wedding: w, msg: 'Evlendiniz! 🎉' };
}
export function cancelEngagement(state) {
  const p = state.player, pt = p.partner;
  if (!pt?.engaged) return;
  pt.engaged = false; pt.value = clamp(pt.value - 30, 0, 100); p.morale = clamp(p.morale - 8, 0, 100);
}

// ---------- boşanma ----------
// Mal paylaşımı: paranın %40'ı, en pahalı ev eşte kalır; nafaka 2 yıl, çocuk nafakası çocuklar 18 olana kadar
export function divorceTerms(state) {
  const p = state.player;
  const kids = (p.children || []).filter((c) => !c.exOf || c.exOf === p.partner?.name);
  const share = Math.round(Math.max(0, p.money) * 0.4);
  const houses = (p.owned || []).filter((id) => id.startsWith('house')).sort();
  const house = houses.length ? houses[houses.length - 1] : null;
  const alimony = Math.round(wageOf(p) * 0.12);
  const childSupport = Math.round(wageOf(p) * 0.05) * kids.length;
  return { share, house, alimony, alimonyWeeks: 76, childSupport, kids: kids.length };
}
export function divorce(state, reason = 'anlaşmalı') {
  const p = state.player, pt = p.partner;
  if (!pt?.married) return { ok: false };
  const t = divorceTerms(state);
  p.money -= t.share;
  if (t.house) p.owned = p.owned.filter((x) => x !== t.house);
  p.alimony = { weekly: t.alimony, weeks: t.alimonyWeeks, child: t.childSupport, to: pt.name };
  for (const c of p.children || []) if (!c.exOf) { c.exOf = pt.name; c.custody = 'anne'; c.rel = clamp((c.rel ?? 70) - 10, 0, 100); }
  p.exes = [...(p.exes || []), { name: pt.name, how: `boşanma (${reason})`, year: state.season.year }];
  p.partner = null;
  p.morale = clamp(p.morale - 18, 0, 100);
  p.rel.family = clamp(p.rel.family - 6, 0, 100);
  p.fans = clamp((p.fans ?? 50) - 2, 0, 100);
  (state.newsQueue ||= []).push({ kind: 'divorce', name: pt.name, share: t.share });
  addInbox(state, `${pt.name} ile boşandınız. Mal paylaşımı ${money(t.share)}${t.house ? ', ev eşinde kaldı' : ''}. Nafaka: haftalık ${money(t.alimony + t.childSupport)}.`);
  return { ok: true, terms: t };
}

// ---------- çocuklar ----------
export const BOY = ['Ali', 'Kerem', 'Arda', 'Emir', 'Yusuf', 'Mert', 'Eymen', 'Çınar', 'Kuzey', 'Aras', 'Deniz', 'Ege', 'Atlas', 'Poyraz', 'Alp', 'Mete'];
export const GIRL = ['Zeynep', 'Elif', 'Defne', 'Asya', 'Nehir', 'Ela', 'Lina', 'Azra', 'Mira', 'Duru', 'Ada', 'Eylül', 'Leyla', 'Su', 'Nil', 'Öykü'];
export const childAge = (state, c) => state.season.year - c.born;
export function addChild(state, name, gender) {
  const p = state.player;
  p.children ||= [];
  const c = { name, gender, born: state.season.year, rel: 80 };
  p.children.push(c);
  p.newborn = 10;                           // ilk haftalar uykusuz
  p.morale = clamp(p.morale + 15, 0, 100);
  p.rel.family = clamp(p.rel.family + 8, 0, 100);
  addInbox(state, `${gender === 'k' ? '👧' : '👦'} ${name} dünyaya geldi! Hoş geldin minik ${p.surname}.`);
  (state.newsQueue ||= []).push({ kind: 'baby', name, gender });
  return c;
}
export const sons = (state) => (state.player.children || []).filter((c) => c.gender === 'e');

// ---------- haftalık ----------
export function weeklyFamily(state) {
  const p = state.player;
  if (p.partner?.cooldown > 0) p.partner.cooldown--;
  if (p.newborn > 0) { p.newborn--; p.energy = clamp(p.energy - 4, 0, 100); }
  for (const c of p.children || []) {
    // velayet sende değilse ilişki yavaş azalır; evde ise aile moral verir
    if (c.custody) c.rel = clamp((c.rel ?? 70) - 0.15, 0, 100);
    else p.morale = clamp(p.morale + 0.3, 0, 100);
  }
  if (p.alimony && p.alimony.weeks > 0) {
    const kidsUnder = (p.children || []).filter((c) => c.exOf && childAge(state, c) < 18).length;
    const pay = p.alimony.weekly + (kidsUnder ? p.alimony.child : 0);
    p.money -= pay;
    p.alimony.weeks--;
    if (p.alimony.weeks <= 0) { if (kidsUnder) p.alimony = { weekly: 0, weeks: 9999, child: p.alimony.child, to: p.alimony.to }; else p.alimony = null; }
  }
  if (p.alimony && p.alimony.weekly === 0 && !(p.children || []).some((c) => c.exOf && childAge(state, c) < 18)) p.alimony = null;
}

export { pick, randInt };
