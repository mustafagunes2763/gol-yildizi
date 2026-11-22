// Gol sevinci: golden sonra oyuncu sevincini seçer. Her sevincin kısa ve uzun vadeli etkisi var.
// Görseller Gemini ile üretilip img/news/celeb_<id>.jpg olarak eklenecek (CELEB_IMAGES'a id yazılınca görünür).
import { clamp, pick, shuffle } from './engine.js';

export const CELEB_IMAGES = new Set(['taraftar', 'takim', 'forma', 'rakip', 'imza', 'kalp', 'diz', 'sakin']);

export const CELEBS = {
  taraftar: { label: '🙌 Taraftara koş', line: '{ad} tribünlere koştu, taraftarla kucaklaşıyor!', fx: { fans: 3, morale: 2 } },
  takim: { label: '🤝 Takımla kucaklaş', line: '{ad} takım arkadaşlarıyla tek yumruk oldu!', fx: { team: 3 } },
  forma: { label: '👕 Formayı çıkar (sarı kart!)', line: '{ad} formasını çıkarıp salladı! Hakem kartına uzanıyor…', fx: { fans: 4, fame: 1 }, card: 'yellow' },
  rakip: { label: '🤫 Rakip tribüne "sus" işareti', line: '{ad} rakip tribüne dönüp parmağını dudağına götürdü! Ortalık karıştı!', fx: { fame: 2, fans: 1 }, crisis: 0.45 },
  imza: { label: '⭐ İmza sevincini yap', line: '{ad} artık herkesin tanıdığı imza sevincini yaptı!', fx: { fame: 1 }, followers: 2 },
  kalp: { label: '❤️ Sevdiklerine kalp yap', line: '{ad} ellerini birleştirip tribündeki ailesine kalp yaptı.', fx: { family: 3, partner: 4 } },
  diz: { label: '🧎 Dizlerinin üstünde kay', line: '{ad} çimlerin üzerinde dizleriyle metrelerce kaydı!', fx: { fans: 2, energy: -3 } },
  sakin: { label: '😐 Sevinme (eski takımına saygı)', line: '{ad} gol sevinci yapmadı, eski takımına saygı gösterdi.', fx: { fans: 1 }, respect: true },
};

// Bu golden sonra sunulacak 3-4 seçenek
export function options(state, plan, res) {
  const p = state.player;
  const oldClub = (p.career?.seasons || []).some((x) => x.club === plan.fx.opp && x.club !== p.clubId);
  const pool = ['takim', 'forma', 'rakip', 'imza', 'diz'];
  if (p.partner || (p.rel?.family ?? 0) > 0) pool.push('kalp');
  const out = ['taraftar', ...shuffle(pool).slice(0, oldClub ? 2 : 3)];
  if (oldClub) out.push('sakin');
  // formayı çıkarmak ikinci sarıysa kırmızı: yine de seçilebilir ama etiket uyarır
  return out.map((id) => ({ v: id, label: id === 'forma' && res.yellows ? '👕 Formayı çıkar (KIRMIZI riski!)' : CELEBS[id].label }));
}

// Seçimi uygula. Döner: { line, card, crisis, img }
export function apply(state, id, plan, ctx) {
  const c = CELEBS[id] || CELEBS.takim;
  const p = state.player;
  const fx = c.fx || {};
  if (fx.fans) p.fans = clamp((p.fans ?? 50) + fx.fans, 0, 100);
  if (fx.morale) p.morale = clamp(p.morale + fx.morale, 0, 100);
  if (fx.fame) p.fame = clamp((p.fame || 0) + fx.fame, 0, 100);
  if (fx.energy) p.energy = clamp(p.energy + fx.energy, 0, 100);
  if (fx.team && p.rel) p.rel.team = clamp(p.rel.team + fx.team, 0, 100);
  if (fx.family && p.rel) p.rel.family = clamp(p.rel.family + fx.family, 0, 100);
  if (fx.partner && p.partner) p.partner.value = clamp(p.partner.value + fx.partner, 0, 100);
  if (c.followers && state.social) state.social.followers = Math.round(state.social.followers * (1 + c.followers / 100));
  const crisis = c.crisis ? Math.random() < c.crisis : false;
  (p.celebs ||= {})[id] = (p.celebs[id] || 0) + 1;
  return {
    line: c.line.replace('{ad}', ctx.ad),
    card: c.card || null,
    crisis,
    img: CELEB_IMAGES.has(id) ? id : null,
  };
}

// Maç sonu Paslaş tepkisi için kısa etiket
export const TAG = { taraftar: 'tribün', takim: 'takım', forma: 'forma', rakip: 'sus', imza: 'imza', kalp: 'kalp', diz: 'diz', sakin: 'saygı' };
export const pickLine = (arr) => pick(arr);
