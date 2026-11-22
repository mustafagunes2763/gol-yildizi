// Borsa: Paslaş'taki reklam markalarının hisseleri.
// Fiyatlar haftalık dalgalanır, şirket haberleriyle sıçrar ya da düşer; reklamını yaptığın marka ilgi görür.
// Sezon sonunda bazı şirketler kâr payı (temettü) dağıtır. Tüm haberler kurgusaldır.
import { clamp, pick, rand, money, addInbox } from './engine.js';

// [kod, ad (kullanıcının yazdığı gibi), sektör, başlangıç fiyatı (TL), haftalık oynaklık, yıllık temettü oranı]
const RAW = [
  ['LIKE', 'Like', 'spor', 940, 0.035, 0.02], ['AMGS', 'amigos', 'spor', 310, 0.045, 0.015], ['LION', 'lion', 'spor', 188, 0.05, 0.01],
  ['PINK', 'Pinkbull', 'içecek', 420, 0.04, 0.025], ['SAAT', 'Saatcim', 'lüks', 1250, 0.03, 0.03], ['RDME', 'Readme', 'teknoloji', 265, 0.055, 0],
  ['PRFM', 'Parfümcüben', 'kozmetik', 145, 0.045, 0.02], ['XAOM', 'Xxxaomi', 'teknoloji', 560, 0.05, 0.005], ['TOGG', 'TOGG', 'otomotiv', 1780, 0.04, 0],
  ['KFTY', 'Köfteci Yusuf', 'gıda', 230, 0.03, 0.04], ['KHVC', 'Kahvecİrfancan', 'gıda', 96, 0.04, 0.03], ['YAPI', 'Yapı', 'banka', 610, 0.025, 0.06],
  ['MRTK', 'Merit King', 'bahis', 340, 0.07, 0.05], ['TMZA', 'Temiz Adam', 'kozmetik', 120, 0.03, 0.035], ['SGLS', 'SonGlasses', 'lüks', 205, 0.045, 0.015],
  ['GCEK', 'Gecek', 'içecek', 58, 0.025, 0.04], ['DFNE', 'Defne Akyazı', 'içecek', 74, 0.03, 0.035], ['PRTN', 'Protein Oecn', 'sağlık', 132, 0.05, 0.01],
  ['PIQ', 'PIQ', 'sağlık', 88, 0.055, 0.01], ['PLAY', 'PlayArena', 'teknoloji', 720, 0.05, 0.005], ['XBOX', 'XxxBox', 'teknoloji', 690, 0.045, 0.005],
  ['BJET', 'Bjet', 'havacılık', 480, 0.06, 0.02], ['RMDA', 'Ramada', 'turizm', 390, 0.045, 0.03], ['ZNSZ', 'Zensizolmaz', 'kozmetik', 165, 0.05, 0.02],
];
export const STOCKS = RAW.map(([code, name, sector, p0, vol, div]) => ({ code, name, sector, p0, vol, div }));
const BY = Object.fromEntries(STOCKS.map((s) => [s.code, s]));
export const stockOf = (code) => BY[code];
const norm = (s) => String(s).toLocaleLowerCase('tr-TR').replace(/[^a-zçğıöşü0-9]/g, '');
const BY_NAME = Object.fromEntries(STOCKS.map((s) => [norm(s.name), s.code]));
export const FEE = 0.002;           // alım-satım komisyonu
const HIST = 40;

// Haber şablonları (iyi / kötü), sektöre göre; {n} şirket adı
const NEWS = {
  spor: [['{n} yeni krampon serisini tanıttı, ön siparişler rekor kırdı', 1], ['{n} Avrupa\'da yeni mağazalar açıyor', 1], ['{n} fabrikasında üretim aksadı', -1], ['{n} satışlarında beklenti altı çeyrek', -1]],
  içecek: [['{n} yaz sezonunda satış rekoru kırdı', 1], ['{n} yeni ihracat anlaşması imzaladı', 1], ['{n} hammadde maliyetleri arttı', -1], ['{n} bazı ürünlerini toplatıyor', -1]],
  lüks: [['{n} yeni koleksiyonu kısa sürede tükendi', 1], ['{n} Körfez\'de bayilik anlaşması yaptı', 1], ['{n} lüks tüketimde yavaşlama uyarısı yaptı', -1]],
  teknoloji: [['{n} yeni ürününü tanıttı, ilk yorumlar olumlu', 1], ['{n} büyük bir yazılım güncellemesi yayınladı', 1], ['{n} çip tedarikinde sorun yaşıyor', -1], ['{n} ürününde yazılım hatası bulundu', -1]],
  otomotiv: [['{n} yeni modelin siparişlerini açtı', 1], ['{n} ihracat hedefini yükseltti', 1], ['{n} teslimatlarda gecikme açıkladı', -1]],
  gıda: [['{n} yeni şubelerini açtı, kuyruklar oluştu', 1], ['{n} franchise anlaşmaları imzaladı', 1], ['{n} et fiyatlarındaki artıştan etkilendi', -1]],
  banka: [['{n} beklentilerin üzerinde kâr açıkladı', 1], ['{n} yeni dijital bankacılık uygulamasını tanıttı', 1], ['{n} karşılık giderleri arttı', -1]],
  bahis: [['{n} yeni lisans aldı', 1], ['{n} hakkında yeni düzenleme tartışması', -1], ['{n} vergi incelemesi geçiriyor', -1]],
  kozmetik: [['{n} yeni ürün serisi çok satanlar listesinde', 1], ['{n} yurt dışı satışlarını ikiye katladı', 1], ['{n} ürünlerinden birini piyasadan çekti', -1]],
  sağlık: [['{n} sporcu beslenmesinde pazar lideri oldu', 1], ['{n} yeni fabrikası üretime başladı', 1], ['{n} ürünlerinin etiket bilgisi soruşturuluyor', -1]],
  havacılık: [['{n} yeni hatlar açıyor, doluluk yüksek', 1], ['{n} filosuna yeni uçaklar katıyor', 1], ['{n} yakıt fiyatları nedeniyle zararda', -1], ['{n} grev nedeniyle seferlerini iptal etti', -1]],
  turizm: [['{n} bayram döneminde tam doluluk bildirdi', 1], ['{n} yeni otel açılışı yaptı', 1], ['{n} turizm sezonunda beklenen talebi göremedi', -1]],
};

export function ensure(state) {
  const M = (state.stocks ||= { prices: {}, news: [], buzz: [], wk: -1 });
  for (const s of STOCKS) if (!M.prices[s.code]) {
    // başlangıç: geçmiş 20 hafta rastgele yürüyüş
    let x = s.p0 * rand(0.85, 1.1); const h = [];
    for (let i = 0; i < 20; i++) { x *= 1 + gauss() * s.vol; h.push(round(x)); }
    M.prices[s.code] = { p: h.at(-1), h };
  }
  return M;
}
const round = (x) => Math.max(1, Math.round(x * 100) / 100);
function gauss() { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return clamp(Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v), -3, 3); }
export const holdings = (state) => (state.player.shares ||= {});
export const price = (state, code) => ensure(state).prices[code].p;
export const weekChange = (state, code) => { const h = ensure(state).prices[code].h; return h.length > 1 ? h.at(-1) / h.at(-2) - 1 : 0; };

// Reklam anlaşması: markanın hissesi gelecek hafta ilgi görür
export function sponsorBuzz(state, brandName) {
  const code = BY_NAME[norm(brandName)]; if (!code) return;
  const M = ensure(state); if (!M.buzz.includes(code)) M.buzz.push(code);
}

// Haftalık fiyat güncellemesi
export function weekly(state) {
  const M = ensure(state), p = state.player, H = holdings(state);
  const abs = state.season.year * 60 + state.season.week;
  if (M.wk === abs) return; M.wk = abs;
  const market = gauss() * 0.012 + 0.002;                    // genel piyasa havası
  const evCount = Math.random() < 0.55 ? 1 : Math.random() < 0.3 ? 2 : 0;
  const ev = {};
  for (let i = 0; i < evCount; i++) { const s = pick(STOCKS); const [t, dir] = pick(NEWS[s.sector]); ev[s.code] = { t: t.replace('{n}', s.name), dir }; }
  for (const code of M.buzz) if (!ev[code]) ev[code] = { t: `${BY[code].name} reklam kampanyası sonrası satışlar arttı, yüzü ${p.name} ${p.surname}`, dir: 1, buzz: true };
  M.buzz = [];
  for (const s of STOCKS) {
    const P = M.prices[s.code];
    const fair = s.p0 * Math.pow(1.06, Math.max(0, state.season.year - 2026));   // uzun vadede hafif büyüme
    const pull = clamp((fair - P.p) / fair, -0.5, 0.5) * 0.04;                 // aşırı sapmayı geri çek
    let r = market + gauss() * s.vol + pull;
    const e = ev[s.code];
    if (e) {
      const mag = e.buzz ? rand(0.04, 0.09) : rand(0.07, 0.2) * (s.vol > 0.05 ? 1.3 : 1);
      r += e.dir * mag;
      M.news.unshift({ code: s.code, t: e.t, dir: e.dir, abs, pct: 0 });
    }
    r = clamp(r, -0.35, 0.4);
    P.p = round(P.p * (1 + r));
    P.h.push(P.p); if (P.h.length > HIST) P.h.shift();
    if (e) M.news[0].pct = r;
    if (e && H[s.code]?.n) addInbox(state, `📈 ${e.t}. ${s.code} hissesi ${r >= 0 ? '+' : '−'}%${Math.abs(r * 100).toFixed(1)}`);
  }
  M.news = M.news.slice(0, 20);
}

// Al / sat (tutara göre, tam hisse)
export function buy(state, code, amount) {
  const p = state.player, H = holdings(state), px = price(state, code);
  const n = Math.floor(Math.min(amount, p.money) / (px * (1 + FEE)));
  if (n < 1) return { ok: false, msg: 'Paran bir hisseye bile yetmiyor.' };
  const cost = Math.round(n * px * (1 + FEE));
  p.money -= cost;
  const h = (H[code] ||= { n: 0, cost: 0 });
  h.cost += cost; h.n += n;
  return { ok: true, n, cost };
}
export function sell(state, code, frac = 1) {
  const p = state.player, H = holdings(state), h = H[code];
  if (!h?.n) return { ok: false, msg: 'Bu hisseden sende yok.' };
  const n = frac >= 1 ? h.n : Math.max(1, Math.floor(h.n * frac));
  const back = Math.round(n * price(state, code) * (1 - FEE));
  const costPart = h.cost * n / h.n;
  h.cost -= costPart; h.n -= n;
  if (!h.n) delete H[code];
  p.money += back;
  return { ok: true, n, back, pl: back - costPart };
}
export function portfolio(state) {
  const H = holdings(state);
  let value = 0, cost = 0;
  for (const [code, h] of Object.entries(H)) { value += h.n * price(state, code); cost += h.cost; }
  return { value: Math.round(value), cost: Math.round(cost), pl: Math.round(value - cost) };
}

// Sezon sonu: temettü
export function seasonEnd(state) {
  const H = holdings(state);
  let tot = 0; const parts = [];
  for (const [code, h] of Object.entries(H)) {
    const s = BY[code]; if (!s?.div) continue;
    const x = Math.round(h.n * price(state, code) * s.div);
    if (x > 0) { tot += x; parts.push(code); }
  }
  if (tot > 0) { state.player.money += tot; addInbox(state, `📈 Sezon sonu kâr payı (temettü): ${money(tot)} hesabına yattı (${parts.join(', ')}).`); }
  return tot;
}
