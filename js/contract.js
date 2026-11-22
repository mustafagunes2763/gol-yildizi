// Sözleşme pazarlığı (NSS tarzı) + menajer Cengiz Demirel
// Kulübün görünmeyen sınırları var; çok zorlarsan sabrı azalır, sonunda masadan kalkar.
import { clamp, rand, randInt, pick, overall, money } from './engine.js';

export const AGENT = { name: 'Cengiz Demirel', commission: 0.10, fee: 2 };   // imza parasının %10'u + 2 haftalık maaş

const r5 = (x, step = 5000) => Math.max(step, Math.round(x / step) * step);

// Oyuncunun piyasa değeri (₺)
export function marketValue(p) {
  const ovr = overall(p);
  const ageF = p.age <= 21 ? 1.35 : p.age <= 25 ? 1.2 : p.age <= 29 ? 1 : p.age <= 32 ? 0.6 : 0.3;
  return Math.round(Math.max(1_000_000, (Math.max(1, ovr - 30) ** 2.6) * 5200 * ageF * (1 + (p.fame || 0) / 70)) / 100_000) * 100_000;
}

// Kulübün teklifine görünmez sınırlar ekleyip pazarlık oturumu açar
export function openNegotiation(state, offer, kind = 'transfer') {
  const p = state.player;
  const t = state.teams[offer.clubId];
  const value = marketValue(p);
  const rich = clamp((t.str - 50) / 30, 0.2, 1.4);
  const o = {
    wage: offer.wage,
    years: offer.years,
    sign: offer.sign ?? r5(offer.wage * randInt(2, 6), 10000),
    goal: offer.goal ?? r5(offer.wage * 0.3, 1000),
    release: offer.release ?? r5(value * rand(2, 3.2), 100000),
    champ: offer.champ ?? r5(offer.wage * randInt(3, 6), 10000),   // şampiyonluk / kupa primi
    play: 0,                                                           // forma garantisi: 0 yok · 1 rotasyon · 2 ilk 11
  };
  const greed = rand(1.12, 1.45) * (kind === 'start' ? 0.9 : 1) * (1 + (p.fame || 0) / 200);
  const limit = {
    wage: r5(o.wage * greed),
    sign: r5(o.sign * rand(1.25, 1.9) * Math.max(0.75, rich), 10000),
    goal: r5(o.goal * rand(1.4, 2.4), 1000),
    release: r5(o.release * rand(0.45, 0.7), 100000),     // kulüp bundan düşük bedele razı olmaz
    years: p.age >= 30 ? randInt(1, 2) : p.age <= 21 ? randInt(3, 5) : randInt(2, 4),   // kulübün tercih ettiği süre
    champ: r5(o.champ * rand(1.5, 2.6), 10000),
    play: playLimit(state, p, offer.clubId),
  };
  return {
    clubId: offer.clubId, kind, value,
    offer: { ...o }, demand: { ...o }, limit,
    patience: kind === 'renew' ? 4 : kind === 'raise' ? 2 : 3, rounds: 0, status: 'open', bluffed: false,
    log: [{ who: 'agent', text: firstAdvice(p, o, limit, value, kind) }],
  };
}

// Kulübün verebileceği en yüksek forma garantisi (kadrodaki forvetlere göre)
export function playLimit(state, p, clubId) {
  const t = state.teams[clubId];
  const ovr = overall(p) + (p.fame || 0) / 20;
  const fvs = (t?.squad || []).filter((x) => x.pos === 'FV' && x.ovr).map((x) => x.ovr).sort((a, b) => b - a);
  if (!fvs.length) return ovr >= (t?.str || 70) - 4 ? 2 : 1;
  if (ovr >= (fvs[2] ?? fvs[fvs.length - 1]) + 1) return 2;
  if (ovr >= fvs[fvs.length - 1] - 6) return 1;
  return 0;
}
export const PLAY_TEXT = ['Yok', 'Rotasyon', 'İlk 11'];

function firstAdvice(p, o, limit, value, kind) {
  const lines = [];
  if (kind === 'raise') { lines.push('Bu sezon iyi gidiyorsun, zam istemenin tam zamanı. Ama kulübün sabrı az, iki hamlede iş bitmeli.'); return lines.join(' '); }
  lines.push(kind === 'start' ? 'Evlat, ilk sözleşmede açgözlü olma ama ezik de durma. Biraz zorlayabiliriz.'
    : kind === 'renew' ? 'Kulübün seni tutmak istiyor. Bu bizim kozumuz, iyi pazarlık edelim.'
    : `Piyasa değerin şu an ${money(value)}. Masadaki teklif ${o.wage < limit.wage * 0.82 ? 'zayıf, daha fazlasını hak ediyorsun' : 'fena değil ama biraz daha koparabiliriz'}.`);
  if (p.age <= 21) lines.push('Gençsin, uzun sözleşme güven verir ama serbest kalma bedelini yüksek tutma, büyük kulüpler gelemez.');
  else if (p.age >= 30) lines.push('Yaş ilerliyor, uzun sözleşme ve büyük imza parası senin güvencen.');
  return lines.join(' ');
}

// Cengiz'in anlık tavsiyesi (talebe göre)
export function agentHint(n) {
  const d = n.demand, L = n.limit;
  const w = d.wage / L.wage;
  if (n.status !== 'open') return '';
  const parts = [];
  if (w < 0.9) parts.push('Maaşta hâlâ pay var, biraz daha isteyebiliriz.');
  else if (w <= 1.02) parts.push('Maaşta sınırdayız, daha fazlası riskli.');
  else parts.push('Maaşta çok zorluyoruz, kulüp rahatsız olabilir!');
  if (d.sign > L.sign * 1.05) parts.push('İmza parası fazla yüksek.');
  else if (d.sign < L.sign * 0.7) parts.push('İmza parasını artırabiliriz.');
  if (d.release < L.release) parts.push('Bu serbest kalma bedeline kulüp yanaşmaz.');
  else if (d.release > L.release * 2.2) parts.push('Bedel çok yüksek, büyük kulüpler seni alamaz.');
  if (Math.abs(d.years - L.years) >= 2) parts.push(`Kulüp ${L.years} yıllık bir sözleşme düşünüyor.`);
  if (d.champ > L.champ * 1.05) parts.push('Şampiyonluk primini fazla istedik.');
  if (d.play > L.play) parts.push(L.play === 0 ? 'Kulüp forma garantisi vermek istemiyor.' : 'İlk 11 garantisi istemek fazla, rotasyon sözü alabiliriz.');
  if (n.patience <= 1) parts.push('Sabırları tükeniyor, bir sonraki teklif son olabilir.');
  return parts.join(' ');
}

// Talebi gönder: kulüp kabul eder / karşı teklif yapar / masadan kalkar
export function submitDemand(n) {
  if (n.status !== 'open') return n;
  const d = n.demand, L = n.limit;
  n.rounds++;
  const over =
    Math.max(0, d.wage / L.wage - 1) * 1.6 +
    Math.max(0, d.sign / L.sign - 1) * 0.6 +
    Math.max(0, d.goal / L.goal - 1) * 0.4 +
    Math.max(0, L.release / Math.max(1, d.release) - 1) * 0.8 +
    Math.abs(d.years - L.years) * 0.04 +
    Math.max(0, (d.champ || 0) / Math.max(1, L.champ) - 1) * 0.3 +
    Math.max(0, (d.play || 0) - (L.play || 0)) * 0.35;
  if (over <= 0.05) {
    n.offer = { ...d };
    n.status = 'agreed';
    n.log.push({ who: 'club', text: pick(['Tamam, anlaştık! Kalemi getirin.', 'Bu şartlarla imzaya hazırız.', 'Uzatmayalım, kabul.']) });
    n.log.push({ who: 'agent', text: 'Güzel iş çıkardık evlat. Sözleşme hazır, imzala.' });
    return n;
  }
  n.patience -= over > 0.45 ? 2 : 1;
  if (n.patience < 0) {
    n.status = 'walked';
    n.log.push({ who: 'club', text: pick(['Bu taleplerle devam edemeyiz. Teklifimizi geri çekiyoruz.', 'Masadan kalkıyoruz, başka oyunculara bakacağız.']) });
    n.log.push({ who: 'agent', text: 'Fazla zorladık. Olur böyle şeyler, başka kapılar açılır.' });
    return n;
  }
  // karşı teklif: talebe doğru yaklaş, sınırı geçme
  const mid = (a, b, cap) => Math.min(cap, a + (b - a) * rand(0.4, 0.7));
  n.offer.wage = r5(mid(n.offer.wage, d.wage, L.wage));
  n.offer.sign = r5(mid(n.offer.sign, d.sign, L.sign), 10000);
  n.offer.goal = r5(mid(n.offer.goal, d.goal, L.goal), 1000);
  n.offer.release = r5(Math.max(L.release, n.offer.release - (n.offer.release - d.release) * rand(0.3, 0.6)), 100000);
  n.offer.years = Math.round((n.offer.years + L.years) / 2);
  n.offer.champ = r5(mid(n.offer.champ, d.champ, L.champ), 10000);
  n.offer.play = Math.min(d.play || 0, L.play || 0);
  n.log.push({ who: 'club', text: over > 0.45 ? pick(['Bu talepler gerçekçi değil! Ama son bir teklif yapalım:', 'Ciddi misiniz? Neyse, şunu konuşabiliriz:']) : pick(['Biraz esneyebiliriz. Yeni teklifimiz:', 'Ortada buluşalım:', 'Şöyle yapalım:']) });
  return n;
}

// Blöf: "Başka kulüpler de ilgileniyor" — her görüşmede bir kez
export function bluff(state, n) {
  if (n.status !== 'open' || n.bluffed) return n;
  n.bluffed = true;
  const p = state.player;
  const real = (state.social?.rumors || []).length > 0 || (p.fame || 0) >= 35;
  const ok = Math.random() < (real ? 0.78 : 0.32);
  n.log.push({ who: 'agent', text: pick(['Açık konuşayım, masada başka teklifler de var.', 'Başka kulüpler de kapımızı çalıyor, bilginiz olsun.', 'Yurt dışından ciddi bir ilgi var, acele etmeyelim.']) });
  if (ok) {
    n.limit.wage = r5(n.limit.wage * 1.08); n.limit.sign = r5(n.limit.sign * 1.12, 10000); n.limit.champ = r5(n.limit.champ * 1.1, 10000);
    n.offer.wage = r5(Math.min(n.limit.wage, n.offer.wage * 1.05));
    for (const k of ['wage', 'sign', 'champ']) n.demand[k] = Math.max(n.demand[k], n.offer[k]);
    n.log.push({ who: 'club', text: pick(['Anlıyoruz… Sizi kaybetmek istemeyiz. Biraz daha esneyebiliriz.', 'Peki, teklifimizi iyileştireceğiz.']) });
  } else {
    n.patience -= 1;
    n.log.push({ who: 'club', text: pick(['Öyle bir teklif yok, biliyoruz. Ciddi olalım.', 'Gidin o zaman oraya! …Şaka bir yana, bu tavır hoş değil.']) });
    if (n.patience < 0) { n.status = 'walked'; n.log.push({ who: 'agent', text: 'Blöfümüz tutmadı, masadan kalktılar.' }); }
  }
  return n;
}

// Sezon ortası zam görüşmesi açılabilir mi?
export function raiseAvailable(state) {
  const p = state.player, s = state.season;
  if (!s || state.phase !== 'hub') return { ok: false };
  if (p.raiseYear === s.year) return { ok: false, why: 'Bu sezon zaten zam görüşmesi yaptın.' };
  if (s.week < 10) return { ok: false, why: '10. haftadan sonra zam isteyebilirsin.' };
  if (p.contract.endsYear <= s.year + 1) return { ok: false, why: 'Sözleşmen bitiyor, sezon sonunda uzatma pazarlığı yapılacak.' };
  const avg = p.season.apps ? p.season.ratingSum / p.season.apps : 0;
  if (p.season.apps < 6 || (avg < 6.9 && p.season.goals < 6)) return { ok: false, why: 'Zam istemek için önce sahada kendini göster (6+ maç, 6,9+ ortalama ya da 6+ gol).' };
  return { ok: true };
}
export function openRaise(state) {
  const p = state.player;
  p.raiseYear = state.season.year;
  const avg = p.season.apps ? p.season.ratingSum / p.season.apps : 6.5;
  const base = Math.round(p.contract.wage * (1.08 + Math.max(0, avg - 6.9) * 0.15) / 5000) * 5000;
  const yearsLeft = Math.max(1, p.contract.endsYear - state.season.year);
  return openNegotiation(state, { clubId: p.clubId, wage: base, years: yearsLeft + 1, release: p.contract.release, goal: p.contract.goalBonus, champ: p.contract.champ, sign: r5(base * 2, 10000) }, 'raise');
}

// Kulübün masadaki teklifini kabul et
export function acceptCurrent(n) {
  if (n.status === 'open') { n.status = 'agreed'; n.demand = { ...n.offer }; }
  return n;
}

// İmza: para, komisyon, sözleşme kaydı
export function signContract(state, n) {
  const p = state.player;
  const o = n.offer;
  const commission = Math.round(o.sign * AGENT.commission + o.wage * AGENT.fee);
  p.money += o.sign - commission;
  p.agentPaid = (p.agentPaid || 0) + commission;
  p.contract = { wage: o.wage, endsYear: state.season.year + o.years, goalBonus: o.goal, release: o.release, sign: o.sign, champ: o.champ || 0, play: o.play || 0 };
  p.playBreach = 0;
  return { commission };
}

// Bir kulüp serbest kalma bedelini ödeyebilir mi? (bütçe güce göre)
export function canAfford(team, p) {
  const budget = Math.max(0, team.str - 55) ** 2.4 * 90_000;
  return !p.contract?.release || budget >= p.contract.release;
}
