// Maç öncesi / sonrası röportajlar. Cevaplar moral, taraftar sevgisi ve üne etki eder;
// iddialı ya da olaylı sözler gazeteye düşebilir.
import { clamp, pick } from './engine.js';
import { clip, ek } from './news.js';
import { isDerby } from './data.js';

const BIG = ['gs', 'fb', 'bjk', 'ts'];
const UP = (s) => s.toLocaleUpperCase('tr-TR');

const REPORTERS = ['Gol Sporu muhabiri', 'Sert Şut muhabiri', 'Spor kanalı muhabiri', 'Transfer Hattı muhabiri'];

// ---------- maç öncesi ----------
export function preInterview(state, plan) {
  if (plan.role === 'out') return null;
  const me = state.teams[state.player.clubId], opp = state.teams[plan.fx.opp];
  const derby = isDerby(me.id, opp.id);
  if (!derby && Math.random() > 0.4) return null;
  const stronger = opp.str >= me.str + 4;
  const q = derby ? `Derbi öncesi taraftara mesajın ne?`
    : stronger ? `${opp.name} kâğıt üstünde daha güçlü. Şansınızı nasıl görüyorsun?`
    : `${opp.name} maçı öncesi neler söylemek istersin?`;
  return {
    when: 'pre', reporter: pick(REPORTERS), q,
    answers: [
      { id: 'humble', text: 'Rakibe saygı duyuyoruz. Sahada elimizden geleni yapacağız.', fx: { morale: 2, coach: 2 } },
      { id: 'promise', text: 'Bugün gol atacağım, buna eminim!', fx: { morale: 4 }, promise: true },
      { id: 'provoke', text: `${opp.name} bizden korksun. Bu maçı farklı alacağız!`, fx: { fans: 3, morale: 1 }, provoke: true },
    ],
  };
}

// ---------- maç sonrası ----------
export function postInterview(state, plan, res) {
  if (!res.played) return null;
  const opp = state.teams[plan.fx.opp];
  let q, answers;
  if (res.result === 'W' && res.goals > 0) {
    q = res.goals >= 2 ? `${res.goals} gol! Muhteşem bir performans. Ne hissediyorsun?` : 'Golünle takımın kazandı. Ne hissediyorsun?';
    answers = [
      { id: 'team', text: 'Takım arkadaşlarım olmasa bu gol olmazdı. Hepimizin galibiyeti.', fx: { fans: 2, morale: 2, team: 5 } },
      { id: 'ego', text: 'Daha iyisini de yaparım. Büyük kulüplere hazırım.', fx: { fame: 2, fans: -3, team: -4 }, ego: true },
      { id: 'fans', text: 'Bu gol tribünlerdeki taraftarımıza armağan olsun!', fx: { fans: 5 } },
    ];
  } else if (res.result === 'L') {
    q = res.oppGoals - res.myGoals >= 3 ? `${opp.name} karşısında ağır bir yenilgi. Ne oldu?` : 'Yenilgi sonrası ne söylemek istersin?';
    answers = [
      { id: 'resp', text: 'Sorumluluk hepimizin. Toparlanıp güçlü döneceğiz.', fx: { morale: 3, fans: 1, team: 3, coach: 2 } },
      { id: 'ref', text: 'Hakem maçı katletti, başka söze gerek yok!', fx: { fans: 2, morale: 1, money: -150000 }, ref: true },
      { id: 'blame', text: 'Bazı arkadaşlar yeterince koşmadı, bunu konuşacağız.', fx: { morale: -4, fans: -2, team: -12 }, blame: true },
    ];
  } else if (res.rating <= 5.6) {
    q = 'Bugün senin günün değildi gibi. Ne diyorsun?';
    answers = [
      { id: 'self', text: 'Haklısınız, kötü oynadım. Antrenmanda daha çok çalışacağım.', fx: { morale: 2, fans: 2 } },
      { id: 'deny', text: 'Bence iyi oynadım, şans yüzümüze gülmedi.', fx: { fans: -2 } },
      { id: 'coach', text: 'Hoca beni doğru pozisyonda oynatmıyor.', fx: { morale: -2, fans: 1, coach: -10 }, coach: true },
    ];
  } else {
    q = res.result === 'W' ? 'Galibiyeti nasıl değerlendiriyorsun?' : 'Beraberliği nasıl değerlendiriyorsun?';
    answers = [
      { id: 'calm', text: 'Önemli olan takımın kazanması. Maç maç bakıyoruz.', fx: { morale: 2 } },
      { id: 'hungry', text: 'Gol atamadığım için mutsuzum, gelecek maç atacağım.', fx: { morale: 1, fame: 1 } },
      { id: 'fans', text: 'Taraftarımız harikaydı, onlar için oynuyoruz!', fx: { fans: 3 } },
    ];
  }
  return { when: 'post', reporter: pick(REPORTERS), q, answers };
}

// Cevabın etkisini uygula, gerekirse gazete kupürü döndür
export function applyAnswer(state, iv, ans, ctx = {}) {
  const p = state.player;
  p.fans ??= 50;
  const fx = ans.fx || {};
  if (fx.morale) p.morale = clamp(p.morale + fx.morale, 0, 100);
  if (fx.fans) p.fans = clamp(p.fans + fx.fans, 0, 100);
  if (fx.fame) p.fame = clamp(p.fame + fx.fame, 0, 100);
  if (fx.money) p.money += fx.money;
  if (p.rel) for (const k of ['coach', 'team']) if (fx[k]) p.rel[k] = clamp(p.rel[k] + fx[k], 0, 100);

  const AD = UP(p.surname);
  const quote = ans.text;
  const news = [];
  if (ans.ref) {
    news.push(clip(state, 'sertsut', {
      headline: `${UP(ek(p.surname, 'abl'))} HAKEME ATEŞ PÜSKÜRDÜ`, sub: 'Disiplin kurulu sevk ve para cezası kapıda',
      body: `Maç sonu açıklamalarında "${quote}" diyen ${p.surname}, hakem kararlarını sert dille eleştirdi. Federasyonun oyuncuya para cezası vermesi bekleniyor.`,
      caption: `${p.surname} maç sonu basın karşısında`, pose: 'stand',
    }));
  }
  if (ans.blame) {
    news.push(clip(state, 'sertsut', {
      headline: 'SOYUNMA ODASINDA KRİZ!', sub: `${p.surname} takım arkadaşlarını hedef aldı`,
      body: `"${quote}" sözleri takım içinde büyük rahatsızlık yarattı. Kaptanın konuyla ilgili ${p.surname} ile görüşeceği öğrenildi.`,
      caption: 'Oyuncular sessizce stadı terk etti', pose: 'sad',
    }));
  }
  if (ans.ego && Math.random() < 0.6) {
    news.push(clip(state, 'transfer', {
      headline: `${AD}: "BÜYÜK KULÜPLERE HAZIRIM"`, sub: 'Genç golcüden menajerlere açık mesaj',
      body: `Maç sonu "${quote}" diyen ${p.surname}, transfer kapısını araladı. Kulislerde birçok kulübün oyuncuyu takip ettiği konuşuluyor.`,
      caption: `${p.surname} basın toplantısında`, pose: 'stand',
    }));
  }
  if (ans.coach) {
    news.push(clip(state, 'sertsut', {
      headline: `${AD} HOCAYA KAFA TUTTU`, sub: 'Teknik direktörle arası açılabilir',
      body: `Kötü geçen maçın ardından "${quote}" diyen ${p.surname}, teknik heyetin tepkisini çekti.`,
      caption: `${p.surname} maç sonunda`, pose: 'sad',
    }));
  }
  return { news, summary: effectSummary(fx) };
}

// Maç öncesi verilen sözün sonucu
export function promiseResult(state, plan, res) {
  const p = state.player;
  const AD = UP(p.surname);
  const out = [];
  if (plan.promise) {
    if (res.goals > 0) {
      p.fans = clamp((p.fans ?? 50) + 5, 0, 100); p.fame = clamp(p.fame + 2, 0, 100);
      out.push(clip(state, 'golsporu', {
        headline: `${AD} SÖZÜNÜ TUTTU!`, sub: '"Bugün gol atacağım" demişti, attı da',
        body: `Maç öncesi iddialı konuşan ${p.surname}, sahada da sözünün arkasında durdu. Taraftar genç golcüye bayılıyor.`,
        caption: `${p.surname} sözünü tuttuktan sonra tribünü selamlıyor`,
      }));
    } else if (res.played) {
      p.fans = clamp((p.fans ?? 50) - 4, 0, 100); p.morale = clamp(p.morale - 3, 0, 100);
      out.push(clip(state, 'sertsut', {
        headline: `BOŞ KONUŞTU, ${AD}!`, sub: '"Gol atacağım" demişti, atamadı',
        body: `Maç öncesi büyük konuşan ${p.surname} sahada sözünü tutamadı. Sosyal medyada alay konusu oldu.`,
        caption: `${p.surname} hayal kırıklığı içinde`, pose: 'sad',
      }));
    }
  }
  if (plan.provoke && res.result === 'L') {
    p.fans = clamp((p.fans ?? 50) - 5, 0, 100);
    out.push(clip(state, 'sertsut', {
      headline: `${UP(state.teams[plan.fx.opp].name)} ${UP(ek(p.surname, 'acc'))} SUSTURDU`, sub: 'Maç öncesi iddialı sözler pahalıya patladı',
      body: `"Bu maçı farklı alacağız" diyen ${p.surname} ve takımı sahadan mağlup ayrıldı. Rakip oyuncular maç sonu bu sözlere gönderme yaptı.`,
      caption: `${p.surname} maç sonunda başı önde`, pose: 'sad',
    }));
  }
  return out;
}

function effectSummary(fx) {
  const parts = [];
  if (fx.morale) parts.push(`Moral ${fx.morale > 0 ? '+' : ''}${fx.morale}`);
  if (fx.fans) parts.push(`Taraftar ${fx.fans > 0 ? '+' : ''}${fx.fans}`);
  if (fx.fame) parts.push(`Ün +${fx.fame}`);
  if (fx.money) parts.push(`Ceza ₺${Math.abs(fx.money).toLocaleString('tr-TR')}`);
  if (fx.coach) parts.push(`Hoca ${fx.coach > 0 ? '+' : ''}${fx.coach}`);
  if (fx.team) parts.push(`Takım ${fx.team > 0 ? '+' : ''}${fx.team}`);
  return parts.join(' · ') || 'Cevabın kaydedildi';
}
