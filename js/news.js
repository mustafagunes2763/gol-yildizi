// Gazete kupürleri: 3 uydurma gazete, abartılı Türk spor basını dili.
import { overall, pick, randInt, money, seasonOffers } from './engine.js';
import { marketValue } from './contract.js';
import { isDerby, clubInfo } from './data.js';
import { headSvg, skinColor, lookOf } from './look.js';

export const PAPERS = {
  golsporu: { name: 'GOL SPORU', slogan: 'Futbolun sesi', c1: '#E30613', c2: '#FFD200', ink: '#111' },
  sertsut:  { name: 'SERT ŞUT', slogan: 'Lafını esirgemez', c1: '#111111', c2: '#FFFFFF', ink: '#111' },
  transfer: { name: 'TRANSFER HATTI', slogan: 'Kulislerin nabzı', c1: '#0B3D91', c2: '#7DD3FC', ink: '#0b1a33' },
  tribun:   { name: 'TRİBÜN POSTASI', slogan: 'Taraftarın sesi', c1: '#14532D', c2: '#FDE047', ink: '#0f2a18' },
  aksam:    { name: 'AKŞAM SPOR', slogan: 'Futbolu ciddiye alır · 1961', c1: '#F5EBDD', c2: '#1F2937', ink: '#1f2937' },
};

const BIG = ['gs', 'fb', 'bjk', 'ts'];

// ---------- Türkçe ek yardımcıları ----------
const VOWELS = 'aeıioöuüAEIİOÖUÜ';
const HARD = 'fstkçşhpFSTKÇŞHP';
function lastVowel(w) { for (let i = w.length - 1; i >= 0; i--) if (VOWELS.includes(w[i])) return w[i].toLocaleLowerCase('tr-TR'); return 'e'; }
function lastWord(s) { return s.trim().split(/\s+/).pop(); }
/** ek: loc (-de), abl (-den), acc (-i), dat (-e), gen (-in) */
// Kısaltmaların okunuşu (FK → "fe-ka", SK → "se-ka", AŞ → "a-şe")
const LETTER = { A: 'a', B: 'be', C: 'ce', Ç: 'çe', D: 'de', E: 'e', F: 'fe', G: 'ge', Ğ: 'yumuşak ge', H: 'he', I: 'ı', İ: 'i', J: 'je', K: 'ka', L: 'le', M: 'me', N: 'ne', O: 'o', Ö: 'ö', P: 'pe', R: 're', S: 'se', Ş: 'şe', T: 'te', U: 'u', Ü: 'ü', V: 've', Y: 'ye', Z: 'ze' };
export function ek(name, type) {
  let w = lastWord(name);
  if (w.length <= 4 && w === w.toLocaleUpperCase('tr-TR') && /^[A-ZÇĞİÖŞÜ]+$/.test(w) && name.trim() !== w) w = LETTER[w[w.length - 1]] || w;
  const v = lastVowel(w);
  const back = 'aıou'.includes(v);
  const round = 'oöuü'.includes(v);
  const endV = VOWELS.includes(w[w.length - 1]);
  const hard = HARD.includes(w[w.length - 1]);
  const i4 = back ? (round ? 'u' : 'ı') : (round ? 'ü' : 'i');
  const e2 = back ? 'a' : 'e';
  const D = hard ? 't' : 'd';
  let s;
  switch (type) {
    case 'loc': s = D + e2; break;
    case 'abl': s = D + e2 + 'n'; break;
    case 'acc': s = (endV ? 'y' : '') + i4; break;
    case 'dat': s = (endV ? 'y' : '') + e2; break;
    case 'gen': s = (endV ? 'n' : '') + i4 + 'n'; break;
    default: s = '';
  }
  const isUpper = name === name.toLocaleUpperCase('tr-TR');
  return `${name}'${isUpper ? s.toLocaleUpperCase('tr-TR') : s}`;
}
const UP = (s) => s.toLocaleUpperCase('tr-TR');

export function newsDate(state) {
  const d = new Date(state.season.year, 7, 14 + state.season.week * 7);
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' });
}

export function clip(state, paper, data) {
  return {
    id: `${state.season.year}-${state.season.week}-${paper}-${Math.random().toString(36).slice(2, 7)}`,
    paper,
    date: newsDate(state),
    issue: randInt(1200, 9800),
    year: state.season.year,
    week: state.season.week,
    kit: [state.teams[state.player.clubId].c1, state.teams[state.player.clubId].c2],
    look: lookOf(state.player),
    pose: 'cheer',
    ...data,
    photo: data.photo !== undefined ? data.photo : photoFor(data.pose || 'cheer'),
  };
}
// Gemini fotoğrafları (img/news). Yeni gelen fotoğraf buraya eklenir.
export const NEWS_PHOTOS = new Set(['cheer', 'slide', 'sad', 'trophy', 'sign', 'penmiss', 'injury', 'press', 'training', 'referee', 'tunnel', 'bicycle',
  'fans', 'coach', 'airport', 'header', 'freekick', 'wedding', 'empty', 'paparazzi', 'gambler', 'protest', 'rain', 'champions',
  'proposal', 'baby', 'divorce', 'family', 'radio', 'captain', 'documentary', 'podcast']);
// Adaylardan mevcut olanlardan birini seç
export const ph = (...c) => pick(c.filter((x) => NEWS_PHOTOS.has(x))) || null;
// 'stand' pozunda çizim kullanılır.
function photoFor(pose) {
  if (pose === 'cheer') return pick(['cheer', 'slide']);
  if (pose === 'sad') return ph('sad', 'empty');
  if (pose === 'trophy') return ph('trophy', 'champions');
  if (pose === 'stand') return 'press';   // basın toplantısı
  return null;
}

// ---------- maç sonrası ----------
const num = (x) => String(x).replace('.', ',');

// Maç sonrası: olumlu haber (Gol Sporu / Tribün Postası / Akşam Spor) + olumsuz haber (Sert Şut / Akşam Spor)
export function matchNews(state, plan, res) {
  const p = state.player;
  const out = [];
  if (!res.played) return out;
  const AD = UP(p.surname), SUR = p.surname, FULL = `${p.name} ${p.surname}`;
  const T = state.teams[p.clubId];
  const O = state.teams[plan.fx.opp];
  const TAKIM = UP(T.name), RAKIP = UP(O.name);
  const skor = plan.fx.home ? `${res.myGoals}-${res.oppGoals}` : `${res.oppGoals}-${res.myGoals}`;
  const mac = plan.fx.home ? `${T.name} ${skor} ${O.name}` : `${O.name} ${skor} ${T.name}`;
  const derby = isDerby(T.id, O.id);
  const firstGoal = res.goals > 0 && p.career.goals === res.goals;
  const decisive = res.goals > 0 && res.result === 'W' && res.myGoals - res.oppGoals === 1;
  const note = num(res.rating);
  const seasonG = p.season.goals;
  const P3 = () => pick(['golsporu', 'golsporu', 'tribun', 'aksam']);
  const kinds = res.goalKinds || [];
  const goalPhoto = kinds.includes('rovasata') ? 'bicycle' : kinds.some((k) => k === 'kafa' || k === 'korner') && Math.random() < 0.8 ? 'header'
    : kinds.includes('serbest') && Math.random() < 0.8 ? 'freekick' : null;
  const add = (paper, pools, extra) => {
    const x = pools[paper] || pools.golsporu;
    const auto = !extra && res.goals > 0 ? (goalPhoto || (paper === 'tribun' && Math.random() < 0.5 ? 'fans' : undefined)) : undefined;
    out.push(clip(state, paper, { headline: pick(x.h), sub: pick(x.s), body: pick(x.b), caption: pick(x.c), ...(auto ? { photo: auto } : {}), ...extra }));
  };

  // ---------- olumlu ----------
  if (res.goals >= 3) {
    add(P3(), {
      golsporu: { h: [`${AD} ŞOV!`, `${UP(ek(SUR, 'abl'))} GOL YAĞMURU`, `HAT-TRICK'LE TARİH YAZDI`, `${AD} DURDURULAMIYOR!`, `${RAKIP} ${UP(ek(SUR, 'gen'))} KURBANI`],
        s: [`${FULL} ${res.goals} gol attı, ${T.name} rakibini darmadağın etti`, `Genç golcü ${O.name} savunmasını paramparça etti`],
        b: [`${mac}. Genç forvet maç boyunca rakip savunmaya kâbusu yaşattı. Tribünler ayakta alkışladı, maçın topu ${ek(SUR, 'dat')} hediye edildi. Maç notu: ${note}.`, `${mac}. ${SUR} bu gece adeta tek başına bir orduydu. ${res.goals} gol, sayısız tehlike ve ayakta alkışlanan bir veda.`],
        c: [`${FULL} hat-trick sevincini taraftarla paylaştı`, `${SUR} maçın topunu havaya kaldırıyor`] },
      tribun: { h: ['BİZİM ÇOCUK DEVLEŞTİ!', `HAT-TRICK! ${AD} SENİ SEVİYORUZ!`, 'TRİBÜNLER YIKILDI!'],
        s: [`${T.name} taraftarı ${ek(SUR, 'gen')} adını 90 dakika boyunca haykırdı`, 'Statta gece boyunca tek bir isim vardı'],
        b: [`${mac}. Biz bu çocuğu ilk günden sevmiştik! ${res.goals} gol attı, tribünleri ayağa kaldırdı. Bu forma ona emanet!`, `Kale arkasındaki taraftarlar maçtan sonra da gitmedi: "${SUR}, ${SUR}!" ${mac}.`],
        c: ['Tribünler hat-trick sonrası tek ses oldu', `${SUR} taraftarı selamlıyor`] },
      aksam: { h: [`${AD}: ${res.goals} ŞUT, ${res.goals} GOL`, 'SOĞUKKANLI BİR BİTİRİCİ', `${UP(ek(SUR, 'gen'))} KUSURSUZ GECESİ`],
        s: [`${SUR} sezondaki gol sayısını ${seasonG}'e çıkardı`, `Maçın en yüksek notu ${note} ile ${ek(SUR, 'dat')}`],
        b: [`${mac}. ${SUR}, pozisyona girişleri ve bitiriciliğiyle maçın kaderini belirledi. İstatistikler oyuncunun ceza sahasındaki etkinliğinin ligin üst sıralarında olduğunu gösteriyor.`],
        c: [`${SUR} üçüncü golünü atarken`] },
    });
  } else if (firstGoal) {
    add(P3(), {
      golsporu: { h: ['İLK GOL GELDİ!', 'GENÇ YILDIZ SAHNEDE', `${AD} AĞLARI BULDU`, 'BİR YILDIZ DOĞUYOR'],
        s: [`${p.age} yaşındaki forvet profesyonel kariyerindeki ilk golünü attı`],
        b: [`${mac}. ${ek(T.name, 'gen')} genç golcüsü ${SUR}, uzun süredir beklenen ilk golüne ${O.name} karşısında kavuştu. Teknik heyet, oyuncunun gelişiminden memnun.`],
        c: [`${SUR} ilk golünün ardından gözyaşlarını tutamadı`] },
      tribun: { h: ['HOŞ GELDİN EVLAT!', `${AD} İLK GOLÜNÜ BİZE ATTI!`],
        s: ['Tribünler genç forvetin ilk golünü bayram gibi kutladı'],
        b: [`${mac}. ${SUR} ilk golünü attı ve koşa koşa tribünlere geldi. Bu daha başlangıç, biz bu çocuğa inanıyoruz!`],
        c: [`${SUR} ilk golünü tribünle kutluyor`] },
      aksam: { h: ['İLK GOL, İLK İMZA', `${AD} HESABINI AÇTI`],
        s: [`${p.age} yaşındaki oyuncu profesyonel kariyerinde ilk kez fileleri havalandırdı`],
        b: [`${mac}. ${SUR}, ${O.name} karşısında attığı golle kariyerine yeni bir sayfa açtı. Genç oyuncunun gelişimi yakından takip edilmeli.`],
        c: [`${SUR} ilk golünün ardından`] },
    });
  } else if (res.goals === 2) {
    add(P3(), {
      golsporu: { h: [`${AD} İKİ ATTI, ${TAKIM} UÇTU`, `${AD} FIRTINASI`, `ÇİFTE ${AD}`, `${AD} İKİ VURDU İKİ DE ATTI`],
        s: [`${SUR} iki golle maçın yıldızı oldu`, `${ek(T.name, 'gen')} golcüsü rakip kaleyi iki kez sarstı`],
        b: [`${mac}. Kariyerinin en iyi günlerinden birini yaşayan ${SUR}, iki golüyle ${ek(T.name, 'dat')} önemli puanlar kazandırdı. Maç notu: ${note}.`],
        c: [`${SUR} gol sonrası köşe bayrağına koştu`] },
      tribun: { h: ['İKİ GOL, BİN SEVİNÇ!', `${AD} BİZİ UÇURDU!`],
        s: ['Tribünler iki gol sonrası bayram yaptı'],
        b: [`${mac}. Ne gece ama! ${SUR} iki kez ağları sarstı, biz de iki kez sesimiz kısılana kadar bağırdık.`],
        c: [`${SUR} ikinci golünün ardından tribünde`] },
      aksam: { h: ['ÇİFT DARBE', `${AD} FARKI YARATTI`],
        s: [`${SUR} sezonda ${seasonG} gole ulaştı`],
        b: [`${mac}. İki golüyle öne çıkan ${SUR}, bitiricilikte istikrarlı bir grafik çiziyor.`],
        c: [`${SUR} ikinci golü atarken`] },
    });
  } else if (decisive && (derby || Math.random() < 0.6)) {
    add(P3(), {
      golsporu: { h: derby ? [`DERBİDE ${AD} DAMGASI!`, `DERBİNİN KAHRAMANI ${AD}`] : [`${AD} KAZANDIRDI!`, `ALTIN GOL ${UP(ek(SUR, 'abl'))}`, `${AD} ATTI, ${TAKIM} GÜLDÜ`, '3 PUANIN MİMARI'],
        s: [`Tek farklı galibiyette belirleyici gol ${ek(SUR, 'abl')} geldi`],
        b: [`${mac}. Zorlu geçen mücadelede farkı yaratan isim ${SUR} oldu. ${T.name} taraftarı maç sonu genç oyuncunun adını tezahürat yaptı.`],
        c: [`${SUR} galibiyet golünü attığı anı kutluyor`] },
      tribun: { h: derby ? ['ŞEHİR BİZİM!', `${AD} DERBİYİ BİZE VERDİ!`] : ['3 PUAN, 1 KAHRAMAN!', `${AD} SEN ÇOK YAŞA!`],
        s: ['Tribünlerde gece yarısına kadar süren kutlama'],
        b: [`${mac}. Son düdükle birlikte tribünler tek ses oldu. Golü atan ${SUR}, formasını taraftara fırlattı.`],
        c: ['Tribünler galibiyet sonrası'] },
      aksam: { h: ['TEK GOL YETTİ', `${AD} FARKI`],
        s: [`${T.name} az pozisyona rağmen kazanmayı bildi`],
        b: [`${mac}. Dengeli geçen maçta ${ek(SUR, 'gen')} golü belirleyici oldu. Kazanma alışkanlığı, sezonun ikinci yarısında önemli olacak.`],
        c: [`${SUR} gol anında`] },
    });
  } else if (res.goals === 1 && Math.random() < 0.45) {
    add(pick(['tribun', 'golsporu']), {
      golsporu: { h: [`${AD} YİNE SAHNEDE`, `${AD} BOŞ GEÇMEDİ`, `${UP(ek(SUR, 'abl'))} GÜZEL GOL`],
        s: [`${SUR} sezonun ${seasonG}. golünü attı`],
        b: [`${mac}. ${SUR} yine golünü attı. Genç forvetin gol ayakkabısı bu sezon çok parlak.`],
        c: [`${SUR} gol sevincinde`] },
      tribun: { h: [`GOLÜN SAHİBİ: ${AD}`, 'BİR GOL DE ONDAN!'],
        s: ['Taraftarın sevgilisi yine sahnede'],
        b: [`${mac}. ${SUR} topu ağlara gönderdi, tribünler onun adını haykırdı. Sezonun ${seasonG}. golü geldi!`],
        c: [`${SUR} golün ardından tribüne koşuyor`] },
    });
  } else if (res.rating >= 8.3) {
    add(P3(), {
      golsporu: { h: [`${AD} MAESTRO GİBİ`, `${AD} SAHNEYİ ÇALDI`, 'GECENİN YILDIZI'],
        s: [`${SUR} ${note} notla sahanın en iyisiydi`],
        b: [`${mac}. Asistleri ve hareketliliğiyle göz dolduran ${SUR}, takımının oyununa yön verdi.`],
        c: [`${SUR} taraftarı selamlıyor`] },
      aksam: { h: ['GOLSÜZ AMA MÜKEMMEL', `${AD} OYUNU YÖNETTİ`],
        s: [`Maç notu ${note}: oyunun her evresinde etkiliydi`],
        b: [`${mac}. ${SUR}, gol atmadan da maça damga vurulabileceğini gösterdi. Pres, pas ve hareketlilik ders niteliğindeydi.`],
        c: [`${SUR} maç sırasında`] },
    });
  }

  // ---------- olumsuz ----------
  const S2 = () => pick(['sertsut', 'sertsut', 'aksam']);
  if (res.penMissed) {
    add(S2(), {
      sertsut: { h: [`${AD} PENALTIDA ÇUVALLADI`, 'BEYAZ NOKTADA FACİA', `${UP(ek(SUR, 'gen'))} SİNİRLERİ BOZULDU`, 'O PENALTI ATILMAZ MIYDI?'],
        s: ['Kaçan penaltı sonrası tribünlerden tepki geldi'],
        b: [`${mac}. Penaltıyı kullanmak isteyen ${SUR} beyaz noktada büyük bir fırsatı harcadı. Yorumcular, genç oyuncunun bu sorumluluğu almaya hazır olup olmadığını sorguluyor.`],
        c: [`${SUR} kaçan penaltının ardından ellerini başına koydu`] },
      aksam: { h: ['BEYAZ NOKTADA BASKI', 'KAÇAN PENALTININ BEDELİ'],
        s: [`${SUR} kritik anda fırsatı değerlendiremedi`],
        b: [`${mac}. Penaltı atışlarında psikolojinin rolü bir kez daha görüldü. ${SUR} için bu, öğrenme sürecinin bir parçası.`],
        c: [`${SUR} penaltı atışı sonrası`] },
    }, { pose: 'sad', photo: 'penmiss' });
  } else if (res.rating <= 5.2) {
    add(S2(), {
      sertsut: { h: ['HAYAL KIRIKLIĞI!', `${AD} SINIFTA KALDI`, 'BU MU YILDIZ?', `${AD} YOK HÜKMÜNDE`, `${AD} SAHADA KAYIP`],
        s: [`${SUR} ${note} notla günü kötü kapattı`],
        b: [`${mac}. Pozisyonları bir bir harcayan ${SUR}, ${O.name} savunması karşısında etkisiz kaldı. Teknik direktörün sabrı ne kadar sürecek?`],
        c: [`${SUR} kaçan fırsatların ardından hayıflanıyor`] },
      aksam: { h: ['FORM DÜŞÜŞÜ Mİ?', `${AD} ARANIYOR`],
        s: [`${SUR} ${note} notla maçın en zayıflarındandı`],
        b: [`${mac}. ${SUR} topla buluştuğu anlarda isabetsizdi. Genç oyuncuların dalgalı grafik çizmesi olağan, ama sinyaller dikkat çekici.`],
        c: [`${SUR} maç sonunda`] },
    }, { pose: 'sad' });
  } else if (res.result === 'L' && res.oppGoals - res.myGoals >= 3) {
    add(S2(), {
      sertsut: { h: [`${TAKIM} ÇÖKTÜ`, 'REZALET!', `${RAKIP} FARK ATTI`, 'UTANÇ GECESİ'],
        s: [`${T.name} ağır yenilgiyle sarsıldı`],
        b: [`${mac}. Savunmada hata üstüne hata yapan ${T.name}, sahadan ağır bir yenilgiyle ayrıldı. Forvet hattı da etkisizdi.`],
        c: ['Taraftarlar maç sonu stat önünde tepki gösterdi'] },
      aksam: { h: ['SAVUNMA ALARM VERİYOR', 'AĞIR FATURA'],
        s: [`${T.name} ${res.oppGoals} gol yedi`],
        b: [`${mac}. Takım savunmasındaki kopukluk ve geçiş anlarındaki yavaşlık skoru açıklıyor.`],
        c: ['Maç sonu boş tribünler'] },
    }, { pose: 'sad', photo: ph('protest', 'empty') });
  } else if (res.goals >= 2 && Math.random() < 0.3) {
    out.push(clip(state, 'sertsut', {
      headline: pick([`${AD} ABARTILIYOR MU?`, 'O KADAR DA DEĞİL!']), sub: 'Herkes övüyor, biz soruyoruz',
      body: `${mac}. Gollerini attı, evet. Ama ${O.name} gibi bir rakibe karşı... ${SUR} gerçek sınavı büyük maçlarda verecek.`,
      caption: `${SUR} gol sevinci yaşarken`,
    }));
  }
  return out.slice(0, 2);
}

// ---------- ilk maç / derbi öncesi ----------
export function debutNews(state, plan) {
  const p = state.player, T = state.teams[p.clubId], O = state.teams[plan.fx.opp];
  return clip(state, pick(['tribun', 'aksam']), {
    headline: pick([`${UP(p.surname)} SAHNEYE ÇIKTI`, 'İLK ADIM ATILDI', `${UP(T.name)} FORMASIYLA İLK MAÇ`]),
    sub: `${p.age} yaşındaki forvet profesyonel kariyerindeki ilk maçına çıktı`,
    body: `${O.name} maçında forma giyen ${p.name} ${p.surname}, tünelden çıkarken heyecanını gizleyemedi. Taraftarlar genç oyuncuyu alkışlarla karşıladı.`,
    caption: `${p.surname} sahaya çıkarken`, photo: 'tunnel',
  });
}
export function derbyPreview(state, plan) {
  const T = state.teams[state.player.clubId], O = state.teams[plan.fx.opp];
  const ci = clubInfo(plan.fx.h);
  return clip(state, pick(['golsporu', 'tribun']), {
    headline: pick(['DERBİ GÜNÜ!', `${UP(T.name)} - ${UP(O.name)}: DEV RANDEVU`, 'ŞEHİR NEFESİNİ TUTTU', 'BU MAÇ BAŞKA!']),
    sub: `${ci.stadyum || 'Stat'} tıklım tıklım dolacak`,
    body: `${T.name} ile ${O.name} arasındaki derbi öncesi heyecan doruğa çıktı. Biletler saatler içinde tükendi. Gözler genç forvet ${state.player.surname} üzerinde olacak.`,
    caption: 'Derbi öncesi tribünler', photo: ph('fans', 'tunnel'),
  });
}

// ---------- haftalık ekstralar: haftanın 11'i, gol krallığı yarışı, devre karnesi, laf sokma ----------
export function weeklyExtras(state, plan, res, stats) {
  const p = state.player, T = state.teams[p.clubId], O = state.teams[plan.fx.opp];
  const out = [];
  const wk = state.season.week, total = state.season.totalWeeks;
  if (res.played && res.rating >= 7.8 && Math.random() < 0.45) {
    out.push(clip(state, 'aksam', {
      headline: pick(["HAFTANIN 11'İ", "HAFTANIN EN İYİLERİ"]), sub: `${p.surname} ${num(res.rating)} notla haftanın kadrosunda`,
      body: `Akşam Spor'un haftanın 11'inde forvet hattında ${ek(T.name, 'gen')} genç oyuncusu ${p.surname} yer aldı. ${res.goals ? `${res.goals} gol` : 'Etkili oyunu'} ile göz doldurdu.`,
      caption: `${p.surname} haftanın 11'inde`, pose: 'cheer',
    }));
  }
  // gol krallığı yarışı (her ~6 haftada bir)
  if (stats && wk >= 6 && wk % 6 === 0) {
    const top = stats.slice().sort((a, b) => b.g - a.g);
    const meIdx = top.findIndex((x) => x.me);
    if (meIdx >= 0 && meIdx < 3 && top[meIdx].g > 0) {
      const lead = top[0];
      out.push(clip(state, 'golsporu', {
        headline: meIdx === 0 ? pick([`GOL KRALI ${UP(p.surname)}!`, `ZİRVEDE ${UP(p.surname)} VAR`]) : pick(['GOL KRALLIĞINDA NEFES NEFESE', `${UP(p.surname)} ZİRVEYE GÖZ DİKTİ`]),
        sub: meIdx === 0 ? `${top[meIdx].g} golle listenin tepesinde` : `Lider ${lead.name} ${lead.g} gol, ${p.surname} ${top[meIdx].g} gol`,
        body: `Gol krallığı yarışı kızışıyor. ${p.surname} şu ana kadar ${top[meIdx].g} gol attı ve listede ${meIdx + 1}. sırada. Sezon sonunda tahtı kim kapacak?`,
        caption: `${p.surname} gol sevincinde`,
      }));
    } else if (top[0] && Math.random() < 0.5) {
      const lead = top[0];
      out.push(clip(state, 'aksam', {
        headline: pick(['GOL KRALLIĞINDA SON DURUM', `ZİRVEDE ${UP(lead.name)}`]),
        sub: `${lead.name} (${state.teams[lead.teamId].name}) ${lead.g} golle lider`,
        body: `${wk}. hafta geride kalırken gol krallığında ${lead.name} ${lead.g} golle zirvede. ${p.surname} ise ${meIdx >= 0 ? `${top[meIdx].g} golle ${meIdx + 1}. sırada` : 'henüz listeye giremedi'}.`,
        caption: 'Gol krallığı yarışı', photo: pick(['slide', 'cheer']),
      }));
    }
  }
  // devre arası karnesi
  if (wk === Math.floor(total / 2) && p.season.apps > 0) {
    const avg = p.season.ratingSum / p.season.apps;
    const grade = avg >= 7.5 ? 'A' : avg >= 7 ? 'B' : avg >= 6.5 ? 'C' : avg >= 6 ? 'D' : 'F';
    out.push(clip(state, 'aksam', {
      headline: `DEVRE ARASI KARNESİ: ${UP(p.surname)} ${grade}`,
      sub: `${p.season.apps} maç · ${p.season.goals} gol · ${p.season.assists} asist · ort. ${num(avg.toFixed(1))}`,
      body: grade <= 'B' ? `${p.surname} ilk yarının en istikrarlı isimlerindendi. İkinci yarıda bu performansı sürdürürse büyük kulüplerin radarına girmesi kaçınılmaz.`
        : grade === 'C' ? `${p.surname} için ilk yarı iniş çıkışlarla geçti. Potansiyel ortada, istikrar gerekiyor.`
        : `${p.surname} ilk yarıda beklentilerin altında kaldı. İkinci yarı kendisi için bir sınav olacak.`,
      caption: `${p.surname} antrenmanda`, photo: ph('training', 'rain'),
    }));
  }
  // rakipten laf sokma (isimsiz)
  if (res.played && res.goals > 0 && res.result === 'W' && (plan.provoke || isDerby(T.id, O.id)) && Math.random() < 0.6) {
    out.push(clip(state, 'sertsut', {
      headline: pick([`${UP(O.name)} CEPHESİ KÖPÜRDÜ`, 'RAKİPTEN LAF SOKMA!', `"${UP(p.surname)} ŞANSLIYDI"`]),
      sub: `${ek(O.name, 'gen')} soyunma odasından ${ek(p.surname, 'dat')} gönderme`,
      body: `Adının açıklanmasını istemeyen bir ${O.name} oyuncusu, "O gol şans eseri geldi, bir dahakine göreceğiz" dedi. ${p.surname} cephesinden henüz yanıt gelmedi.`,
      caption: `${p.surname} maç sonunda`, pose: 'stand',
    }));
  }
  return out;
}

// ---------- ligden haberler (oyuncu dışı) ----------
export function leagueNews(state) {
  const s = state.season, wk = s.week - 1;
  if (wk < 1 || Math.random() > 0.45) return null;
  const cands = [];
  for (const [lid, L] of Object.entries(s.leagues)) {
    const round = L.fixtures[wk];
    if (!round) continue;
    const lname = ({ SL: 'Süper Lig', L1: '1. Lig', PL: 'Premier Lig', LL: 'La Liga', SA: 'Serie A', BL: 'Bundesliga', FR: 'Ligue 1', NL: 'Eredivisie', PT: 'Liga Portugal', BE: 'Pro League' })[lid] || lid;
    for (const m of round) {
      if (m.hg == null) continue;
      const H = state.teams[m.h], A = state.teams[m.a];
      const w = m.hg > m.ag ? H : m.ag > m.hg ? A : null, l = w === H ? A : w === A ? H : null;
      const sk = `${H.name} ${m.hg}-${m.ag} ${A.name}`;
      if (w && l.str - w.str >= 9) cands.push(['upset', 3, { w, l, sk, lname }]);
      if (Math.abs(m.hg - m.ag) >= 4) cands.push(['rout', 2, { w, l, sk, lname, d: Math.abs(m.hg - m.ag) }]);
      if (isDerby(m.h, m.a) && state.player.clubId !== m.h && state.player.clubId !== m.a) cands.push(['derby', 3, { H, A, w, sk, lname }]);
    }
    // lider değişimi / hoca gitti
    const tbl = Object.entries(L.table).map(([id, r]) => ({ id, ...r })).sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga));
    const leader = tbl[0]?.id;
    s.leaders ||= {};
    if (wk >= 3 && s.leaders[lid] && s.leaders[lid] !== leader) cands.push(['leader', 3, { t: state.teams[leader], old: state.teams[s.leaders[lid]], lname, pts: tbl[0].pts }]);
    s.leaders[lid] = leader;
    if (wk >= 8) {
      const bottom = tbl.slice(-3).map((r) => r.id).filter((id) => id !== state.player.clubId);
      s.sacked ||= [];
      for (const id of bottom) if (!s.sacked.includes(id) && Math.random() < 0.08) cands.push(['sacked', 4, { t: state.teams[id], lname, id }]);
    }
  }
  if (!cands.length) return null;
  let r = Math.random() * cands.reduce((a, c) => a + c[1], 0);
  let [kind, , d] = cands[0];
  for (const c of cands) if ((r -= c[1]) < 0) { [kind, , d] = c; break; }
  if (kind === 'upset') return clip(state, pick(['sertsut', 'golsporu']), {
    headline: pick([`${UP(d.l.name)} YIKILDI!`, 'DEV DEVRİLDİ!', `${UP(d.w.name)} SÜRPRİZİ`]),
    sub: `${d.lname}'de haftanın sürprizi`, body: `${d.sk}. Kâğıt üstünde çok daha güçlü olan ${d.l.name}, ${ek(d.w.name, 'dat')} boyun eğdi. ${d.lname}'de dengeler değişiyor mu?`,
    caption: `${d.w.name} oyuncuları galibiyeti kutluyor`, photo: 'cheer',
  });
  if (kind === 'rout') return clip(state, pick(['golsporu', 'aksam']), {
    headline: pick(['GOL YAĞMURU!', `${UP(d.w.name)} ACIMADI`, `${d.d} FARK!`]),
    sub: `${d.lname}'de haftanın skoru`, body: `${d.sk}. ${d.w.name}, rakibine tarihi bir fark attı. ${d.l.name} cephesinde sessizlik hâkim.`,
    caption: `${d.w.name} gol sevincinde`, photo: 'slide',
  });
  if (kind === 'derby') return clip(state, pick(['golsporu', 'tribun', 'sertsut']), {
    headline: d.w ? pick([`DERBİ ${UP(ek(d.w.name, 'gen'))}`, `${UP(d.w.name)} DERBİDE GÜLDÜ`]) : pick(['DERBİDE KAZANAN YOK', 'DERBİDE PUANLAR PAYLAŞILDI']),
    sub: d.sk, body: `${d.lname}'de haftanın derbisi ${d.sk} sona erdi. ${d.w ? `${d.w.name} taraftarı gece boyunca kutlama yaptı.` : 'İki takım da sahadan bir puanla ayrıldı.'}`,
    caption: 'Derbiden bir kare', photo: d.w ? ph('fans', 'cheer') : 'tunnel',
  });
  if (kind === 'leader') return clip(state, 'golsporu', {
    headline: pick([`ZİRVEDE YENİ İSİM: ${UP(d.t.name)}`, 'LİDERLİK EL DEĞİŞTİRDİ', `${UP(d.t.name)} ZİRVEYE OTURDU`]),
    sub: `${d.lname}'de ${d.t.name} ${d.pts} puanla lider`, body: `${d.old.name} zirveyi kaptırdı. ${d.lname}'de şampiyonluk yarışı kızışıyor.`,
    caption: `${d.t.name} oyuncuları`, photo: ph('trophy', 'champions'),
  });
  if (kind === 'sacked') {
    state.season.sacked.push(d.id);
    return clip(state, pick(['sertsut', 'transfer']), {
      headline: pick([`${UP(ek(d.t.name, 'loc'))} DEPREM`, `${UP(d.t.name)} HOCASIYLA YOLLARI AYIRDI`, 'BİR HOCA DAHA GİTTİ']),
      sub: `Kötü gidişat sonrası ${d.t.name} teknik direktörle anlaştı`,
      body: `${d.lname}'de alt sıralarda bulunan ${d.t.name}, teknik direktörüyle karşılıklı anlaşarak yollarını ayırdı. Yeni hoca için görüşmeler başladı.`,
      caption: `${d.t.name} taraftarı stat önünde`, photo: ph('coach', 'protest'),
    });
  }
  return null;
}

// ---------- transfer dedikodusu ----------
export function maybeRumor(state, recentAvg) {
  const p = state.player;
  if (state.season.week - (state.lastRumorWeek ?? -99) < 5 && state.lastRumorYear === state.season.year) return null;
  if (recentAvg < 7.0 || Math.random() > 0.18) return null;
  const my = state.teams[p.clubId];
  // Tek kaynak: Paslaş'taki söylentiler ve sezon sonu teklif verebilecek kulüpler (gazete, Paslaş ve menajer aynı kulübü konuşur)
  const soc = state.social;
  const known = (soc?.rumors || []).filter((id) => id !== soc?.fakeRumor && id !== p.clubId && state.teams[id]);
  let id = known.length ? pick(known) : null;
  if (!id) { const offs = seasonOffers(state); if (offs.length) id = pick(offs).clubId; }
  if (!id) return null;
  const t = state.teams[id];
  if (soc) soc.rumors = [...new Set([...(soc.rumors || []), id])].slice(-4);
  state.lastRumorWeek = state.season.week;
  state.lastRumorYear = state.season.year;
  const AD = UP(p.surname);
  const val = marketValue(p);
  const fee = val >= 1e9 ? `${(val / 1e9).toLocaleString('tr-TR', { maximumFractionDigits: 1 })} MİLYAR ₺` : `${Math.round(val / 1e6)} MİLYON ₺`;
  return clip(state, 'transfer', {
    headline: pick([`${UP(t.name)} ${UP(ek(p.surname, 'acc'))} İZLİYOR`, `${UP(ek(t.name, 'abl'))} SÜRPRİZ HAMLE`, `${AD} İÇİN ${fee}`]),
    sub: `${ek(t.name, 'gen')} gözü ${ek(my.name, 'gen')} forvetinde`,
    body: `Kulis bilgilerine göre ${t.name} scout ekibi son haftalarda ${p.surname} için tribünde yer aldı. Oyuncunun piyasa değerinin ${money(val)} civarında olduğu konuşuluyor. ${my.name} cephesi ise oyuncunun satılık olmadığını açıkladı.`,
    caption: `${ek(t.name, 'gen')} ilgilendiği ${p.surname}`,
    pose: 'stand', photo: ph('airport', 'cheer'),
  });
}

// ---------- sakatlık / gazino ----------
export function injuryNews(state, weeks) {
  const p = state.player, T = state.teams[p.clubId];
  return clip(state, 'golsporu', {
    headline: weeks >= 4 ? `${UP(ek(T.name, 'dat'))} ŞOK: ${UP(p.surname)} SAKAT` : `${UP(p.surname)} SAKATLANDI`,
    sub: `Genç forvet ${weeks} hafta sahalardan uzak kalacak`,
    body: `Maçın son bölümünde yerde kalan ${p.surname}, sağlık ekibinin müdahalesiyle oyundan çıktı. Yapılan kontrollerde ${weeks} haftalık sakatlık tespit edildi. Taraftarlar hızlı iyileşme diliyor.`,
    caption: `${p.surname} sağlık ekibinin müdahalesi sırasında`, pose: 'sad', photo: 'injury',
  });
}
export function casinoNews(state) {
  const p = state.player;
  return clip(state, 'sertsut', {
    headline: `${UP(p.surname)} GAZİNODA GÖRÜNTÜLENDİ`, sub: 'Masada büyük paralar kaybettiği iddia edildi',
    body: `Gece geç saatlerde bir gazinoda görüntülenen ${ek(p.surname, 'gen')} yüklü miktarda kaybettiği öne sürüldü. Taraftarlar tepkili: "Önce sahada konuş!"`,
    caption: `${p.surname} gazinodan çıkarken`, pose: 'stand', photo: ph('gambler', 'paparazzi'),
  });
}

export function weddingNews(state, w) {
  const p = state.player, id = w?.id || 'buyuk';
  const T = {
    buyuk: { h: `${UP(p.surname)} DÜNYAEVİNE GİRDİ!`, s: `${p.partner.name} ile görkemli düğün`, b: `Futbol dünyasının yıldız ismi ${p.name} ${p.surname}, ${p.partner.name} ile bin davetlinin katıldığı düğünle hayatını birleştirdi. Takım arkadaşları piste ilk çıkanlar oldu.` },
    nikah: { h: 'SADE VE MUTLU', s: `${p.surname} ile ${p.partner.name.split(' ')[0]} nikâh masasında`, b: `${p.name} ${p.surname} ve ${p.partner.name}, sadece ailelerin katıldığı sade bir nikâhla evlendi. Çift, "Bizim için önemli olan birlikte olmak" dedi.` },
    gizli: { h: 'GİZLİ DÜĞÜN!', s: `${p.surname} yurtdışında sessiz sedasız evlendi`, b: `${p.name} ${p.surname} ile ${p.partner.name}, Toskana'daki bir bağ evinde basına kapalı törenle dünyaevine girdi. Fotoğraflar ancak ertesi gün sosyal medyada paylaşıldı.` },
  }[id];
  return clip(state, id === 'gizli' ? 'aksam' : 'golsporu', { headline: T.h, sub: T.s, body: T.b, caption: 'Mutlu çift düğün gecesinde', pose: 'trophy', photo: 'wedding' });
}
export function divorceNews(state, exName, share) {
  const p = state.player;
  return clip(state, pick(['sertsut', 'aksam']), {
    headline: pick([`${UP(p.surname)} İÇİN YOLLAR AYRILDI`, 'MAGAZİNDE DEPREM: BOŞANDILAR', `${UP(p.surname)} BEKÂRLIĞA DÖNDÜ`]),
    sub: `${exName} ile resmen boşandı`,
    body: `${p.name} ${p.surname} ve ${exName} mahkemede yollarını ayırdı. Kulislere göre mal paylaşımı ${money(share)} civarında. Yıldız futbolcu çıkışta basına açıklama yapmadı.`,
    caption: `${p.surname} adliye çıkışında`, photo: 'divorce',
  });
}
export function babyNews(state, name, gender) {
  const p = state.player;
  return clip(state, pick(['golsporu', 'aksam']), {
    headline: pick([`${UP(p.surname)} BABA OLDU!`, `HOŞ GELDİN MİNİK ${UP(name)}!`]),
    sub: `${gender === 'k' ? 'Kızı' : 'Oğlu'} ${name} dünyaya geldi`,
    body: `${p.name} ${p.surname}, ${gender === 'k' ? 'kızı' : 'oğlu'} ${ek(name, 'gen')} doğumunu sosyal medyadan duyurdu: "Hayatımın en güzel golü." Takım arkadaşları da tebrik mesajı yağdırdı.`,
    caption: `${p.surname} ilk kez kucağında`, photo: 'baby',
  });
}
export function proposalNews(state, place) {
  const p = state.player, pn = p.partner.name;
  const where = { home: 'evde mum ışığında', boat: "Boğaz'da tekne turunda", stad: 'maç sonrası stadyumun dev ekranında', trip: "Kapadokya'da sıcak hava balonunda" }[place?.id] || '';
  return clip(state, place?.public ? 'tribun' : 'aksam', {
    headline: place?.public ? 'STADYUMDA EVLİLİK TEKLİFİ!' : `${UP(p.surname)} DİZ ÇÖKTÜ!`,
    sub: `${pn} "evet" dedi`,
    body: `${p.name} ${p.surname}, ${ek(pn, 'dat')} ${where} evlilik teklif etti. ${place?.public ? 'Tribünler "Evet! Evet!" diye tezahürat yaptı.' : 'Mutlu haberi sosyal medyadan paylaştılar.'}`,
    caption: `${p.surname} ve ${pn.split(' ')[0]}`, photo: 'proposal',
  });
}

// ---------- imza ----------
export function loanNews(state, clubId, fromId) {
  const p = state.player;
  const t = state.teams[clubId], f = state.teams[fromId];
  return clip(state, 'transfer', {
    headline: pick([`${UP(p.surname)} KİRALIK GİTTİ`, `${UP(p.surname)} ${UP(ek(t.name, 'dat'))} KİRALANDI`]),
    sub: `${ek(f.name, 'gen')} genç forveti sezon sonuna kadar ${ek(t.name, 'loc')}`,
    body: `${f.name}, forma şansı bulmakta zorlanan ${ek(p.surname, 'acc')} sezon sonuna kadar ${ek(t.name, 'dat')} kiraladı. Oyuncunun sözleşmesi ${ek(f.name, 'loc')} devam ediyor.`,
    caption: `${p.surname} yeni takımında`, pose: 'stand', photo: ph('airport', 'cheer'),
  });
}

export function signingNews(state, clubId, oldClubId) {
  const p = state.player;
  const t = state.teams[clubId];
  return clip(state, 'transfer', {
    headline: `${UP(p.surname)} RESMEN ${UP(ek(t.name, 'loc'))}!`,
    sub: `${oldClubId ? ek(state.teams[oldClubId].name, 'abl') + ' ayrılan' : 'Genç'} forvet imzayı attı`,
    body: `${t.name}, ${p.age} yaşındaki forvet ${p.name} ${ek(p.surname, 'acc')} kadrosuna kattığını resmen duyurdu. ${p.surname}, imza töreninde "Burada şampiyonluklar kazanmak için varım" dedi.`,
    caption: `${p.surname} yeni formasıyla poz verdi`,
    kit: [t.c1, t.c2],
    pose: 'stand', photo: 'sign',
  });
}

// ---------- sezon sonu ----------
export function seasonNews(state, sum) {
  const p = state.player;
  const out = [];
  const T = state.teams[p.clubId];
  const lid = sum.myLeague;
  const rows = sum.leagues[lid];
  const n = rows.length;
  const s = sum.stats;
  if (sum.myPos === 1) {
    out.push(clip(state, 'golsporu', {
      headline: `ŞAMPİYON ${UP(T.name)}!`,
      sub: `${({ SL: 'Süper Lig', L1: '1. Lig', PL: 'Premier Lig', LL: 'La Liga', SA: 'Serie A', BL: 'Bundesliga', FR: 'Ligue 1', NL: 'Eredivisie', PT: 'Liga Portugal', BE: 'Pro League' })[lid]} kupası ${ek(T.name, 'gen')} müzesinde`,
      body: `Sezon boyunca istikrarlı bir grafik çizen ${T.name}, ligi zirvede tamamladı. ${p.surname} sezonu ${s.goals} gol ve ${s.assists} asistle kapattı.`,
      caption: `${p.surname} şampiyonluk kupasını havaya kaldırdı`, pose: 'trophy',
    }));
  } else if (lid === 'L1' && sum.myPos <= 3) {
    out.push(clip(state, 'golsporu', {
      headline: `${UP(T.name)} SÜPER LİG'DE!`,
      sub: 'Yükselme sevinci sokaklara taştı',
      body: `${T.name}, ligi ${sum.myPos}. sırada bitirerek Süper Lig biletini aldı. Takımın yükselişinde ${p.surname} önemli rol oynadı: ${s.goals} gol, ${s.assists} asist.`,
      caption: `${p.surname} yükselme kutlamalarında`, pose: 'trophy',
    }));
  } else if (lid === 'SL' && sum.myPos > n - 3) {
    out.push(clip(state, 'sertsut', {
      headline: `${UP(T.name)} KÜME DÜŞTÜ`,
      sub: 'Kara gün: taraftar yönetimi istifaya çağırdı',
      body: `${T.name} sezonu ${sum.myPos}. sırada tamamladı ve 1. Lig'e düştü. ${p.surname} ${s.goals} gol attı ama yetmedi.`,
      caption: 'Oyuncular sezonun son düdüğünde yıkıldı', pose: 'sad',
    }));
  }
  if (s.goals >= 15) {
    out.push(clip(state, 'golsporu', {
      headline: `${UP(p.surname)} ${s.goals} GOLLE SEZONUN YILDIZI`,
      sub: `${s.apps} maçta ${s.goals} gol, ${s.assists} asist, ortalama ${num(s.avg)}`,
      body: `${p.age} yaşındaki golcü, sezonun en çok konuşulan oyuncusu oldu. Avrupa kulüplerinin de radarına girdiği konuşuluyor.`,
      caption: `${p.surname} sezonun en iyi golcülerinden biri`,
    }));
  } else if (s.apps >= 10 && s.avg && s.avg < 6.0) {
    out.push(clip(state, 'sertsut', {
      headline: `${UP(p.surname)} SEZONU SİLİNSİN`,
      sub: `${s.apps} maçta sadece ${s.goals} gol`,
      body: `Beklentilerin çok altında kalan ${p.surname} için yaz transfer döneminde kiralık seçeneği konuşuluyor.`,
      caption: `${p.surname} zor bir sezon geçirdi`, pose: 'sad',
    }));
  }
  return out;
}

// ---------- çizim (HTML) ----------
const escH = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function photoSvg(c) {
  const [k1, k2] = c.kit;
  const sad = c.pose === 'sad', trophy = c.pose === 'trophy', stand = c.pose === 'stand';
  // basit "fotoğraf": stadyum ışıkları + oyuncu silüeti
  const L = lookOf({ look: c.look });
  const sk = skinColor(L);
  const head = sad ? headSvg(L, 100, 54, 12) : stand ? headSvg(L, 100, 56, 12) : headSvg(L, 100, 56, 12);
  const arms = sad
    ? `<path d="M88 78 L80 60 M112 78 L120 60" stroke="${sk}" stroke-width="7" stroke-linecap="round"/>`
    : stand
      ? `<path d="M86 78 L80 108 M114 78 L120 108" stroke="${sk}" stroke-width="7" stroke-linecap="round"/>`
      : `<path d="M86 76 L70 46 M114 76 L130 46" stroke="${sk}" stroke-width="7" stroke-linecap="round"/>`;
  const cup = trophy ? `<g transform="translate(100 30)"><path d="M-12 -14 h24 v8 a12 12 0 0 1 -24 0z" fill="#facc15" stroke="#a16207"/><rect x="-3" y="2" width="6" height="8" fill="#facc15"/><rect x="-9" y="10" width="18" height="4" fill="#a16207"/></g>` : '';
  return `<svg viewBox="0 0 200 150" class="np-photo" role="img" aria-label="${escH(c.caption)}">
    <defs><linearGradient id="g${c.id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b3440"/><stop offset=".55" stop-color="#4b5563"/><stop offset=".56" stop-color="#3f6b46"/><stop offset="1" stop-color="#2f5536"/></linearGradient></defs>
    <rect width="200" height="150" fill="url(#g${c.id})"/>
    ${[20, 55, 145, 180].map((x) => `<circle cx="${x}" cy="14" r="5" fill="#fff8" /><circle cx="${x}" cy="14" r="12" fill="#fff2"/>`).join('')}
    ${Array.from({ length: 26 }, (_, i) => `<circle cx="${(i * 37) % 200}" cy="${50 + (i * 13) % 30}" r="4" fill="#1f2937"/>`).join('')}
    ${cup}
    ${arms}
    ${head}
    <path d="M84 70 h32 l4 42 h-40z" fill="${k1}" stroke="${k2}" stroke-width="3"/>
    <rect x="84" y="110" width="32" height="14" fill="${k2}"/>
    <path d="M90 124 v20 M110 124 v20" stroke="${sk}" stroke-width="7"/>
    <text x="100" y="98" text-anchor="middle" font-size="16" font-weight="800" fill="${k2}" font-family="system-ui">9</text>
  </svg>`;
}

export function clippingHtml(c) {
  const P = PAPERS[c.paper];
  return `<article class="np np-${c.paper}" style="--p1:${P.c1};--p2:${P.c2};--ink:${P.ink}">
    <header class="np-mast"><b>${P.name}</b><span>${P.slogan}</span></header>
    <div class="np-date">${escH(c.date)} · Sayı ${c.issue}</div>
    <h2 class="np-head">${escH(c.headline)}</h2>
    <p class="np-sub">${escH(c.sub)}</p>
    <figure>${c.photo ? `<img class="np-photo" src="img/news/${c.photo}.jpg" alt="${escH(c.caption)}" loading="lazy" width="800" height="600">` : photoSvg(c)}<figcaption>${escH(c.caption)}</figcaption></figure>
    <p class="np-body">${escH(c.body)}</p>
  </article>`;
}

// Kırmızı kart / ceza / rövaşata haberleri
export function cardNews(state, plan, res) {
  const p = state.player, T = state.teams[p.clubId], O = state.teams[plan.fx.opp];
  if (res.bicycle) {
    return clip(state, 'golsporu', {
      headline: `${UP(ek(p.surname, 'abl'))} RÖVAŞATA ŞOVU!`, sub: `${O.name} filelerinde akrobatik gol`,
      body: `${p.surname} havada ters dönerek attığı golle maçın, belki de sezonun golüne imza attı. Tribünler dakikalarca ayakta alkışladı.`,
      caption: `${p.surname} rövaşata anında`, pose: 'cheer', photo: 'bicycle',
    });
  }
  const red = res.cards?.find((c) => c.card === 'red' || c.card === 'secondYellow');
  if (red) {
    return clip(state, 'sertsut', {
      headline: red.card === 'red' ? `${UP(p.surname)} KENDİNİ KAYBETTİ!` : `${UP(p.surname)} ÇİFT SARIYLA ATILDI`,
      sub: `${red.min}. dakikada kırmızı kart · ${red.ban} maç ceza`,
      body: `${T.name} forması giyen ${p.surname}, ${O.name} maçında ${red.min}. dakikada kırmızı kart gördü. Disiplin kurulu ${red.ban} maç ceza verdi. Teknik heyetin tepkili olduğu konuşuluyor.`,
      caption: `${p.surname} hakemle tartışırken`, pose: 'sad', photo: 'referee',
    });
  }
  const acc = res.cards?.find((c) => c.accum);
  if (acc) {
    return clip(state, 'transfer', {
      headline: `${UP(p.surname)} SARI KART SINIRINDA`, sub: '4. sarı kartını gördü, gelecek maç yok',
      body: `${p.surname} sezonun 4. sarı kartını görerek bir maçlık cezalı duruma düştü.`,
      caption: `${p.surname} hakemle konuşurken`, pose: 'stand', photo: 'referee',
    });
  }
  return null;
}

// Sezon ödülü haberi
export function awardNews(state, key, value) {
  const p = state.player;
  const AD = UP(p.surname);
  const H = {
    golkrali: [`GOL KRALI ${AD}!`, 'Sezonun en golcüsü oldu', 'freekick'],
    asistkrali: [`ASİST KRALI ${AD}`, 'Takım arkadaşlarına gol yağdırdı', 'cheer'],
    yilin: [`YILIN OYUNCUSU: ${AD}`, 'Sezonun en iyisi seçildi', 'champions'],
    genc: [`YILIN GENCİ ${AD}`, 'Genç yeteneğe büyük ödül', 'cheer'],
    champ_SL: [`${UP(state.teams[p.clubId].name)} ŞAMPİYON!`, `${p.surname} şampiyonluğun mimarlarından`, 'champions'],
    champ_PL: [`${UP(state.teams[p.clubId].name)} İNGİLTERE ŞAMPİYONU!`, `${p.surname} Premier Lig'in zirvesinde`, 'champions'],
    champ_LL: [`${UP(state.teams[p.clubId].name)} İSPANYA ŞAMPİYONU!`, `${p.surname} La Liga'nın zirvesinde`, 'champions'],
    champ_SA: [`${UP(state.teams[p.clubId].name)} İTALYA ŞAMPİYONU!`, `${p.surname} Serie A'nın zirvesinde`, 'champions'],
    champ_BL: [`${UP(state.teams[p.clubId].name)} ALMANYA ŞAMPİYONU!`, `${p.surname} Bundesliga'nın zirvesinde`, 'champions'],
    champ_NL: [`${UP(state.teams[p.clubId].name)} HOLLANDA ŞAMPİYONU!`, `${p.surname} Eredivisie'nin zirvesinde`, 'champions'],
    champ_PT: [`${UP(state.teams[p.clubId].name)} PORTEKİZ ŞAMPİYONU!`, `${p.surname} Liga Portugal'ın zirvesinde`, 'champions'],
    champ_BE: [`${UP(state.teams[p.clubId].name)} BELÇİKA ŞAMPİYONU!`, `${p.surname} Pro League'in zirvesinde`, 'champions'],
    champ_FR: [`${UP(state.teams[p.clubId].name)} FRANSA ŞAMPİYONU!`, `${p.surname} Ligue 1'in zirvesinde`, 'champions'],
    champ_L1: [`${UP(state.teams[p.clubId].name)} LİG ŞAMPİYONU`, "Süper Lig'e şampiyon olarak çıktılar", 'champions'],
    promo_L1: [`${UP(state.teams[p.clubId].name)} SÜPER LİG'DE!`, 'Yükselme sevinci', 'trophy'],
  }[key];
  if (!H) return null;
  return clip(state, pick(['golsporu', 'aksam', 'tribun']), {
    headline: H[0], sub: `${H[1]}${value ? ' · ' + value : ''}`,
    body: `${p.name} ${p.surname} sezonu ödülle kapattı. ${value ? value + ' ile ' : ''}kariyerine altın bir sayfa ekledi. Kupa dolabı dolmaya başladı!`,
    caption: `${p.surname} ödülünü alırken`, pose: 'trophy', photo: ph(H[2], 'trophy'),
  });
}
// Emeklilik haberi
export function retireNews(state, sum) {
  return clip(state, 'aksam', {
    headline: pick([`BİR DEVİR KAPANDI: ${UP(sum.name)}`, `${UP(sum.name)} FUTBOLU BIRAKTI`]),
    sub: `${sum.years} sezon · ${sum.apps} maç · ${sum.goals} gol · ${sum.trophies} kupa`,
    body: `${sum.retiredAt} yaşında kramponlarını asan ${sum.name}, ${sum.clubs.join(', ')} formalarıyla unutulmaz anlar yaşattı. Futbol dünyası efsaneyi alkışlarla uğurladı.`,
    caption: `${sum.name} son kez tünelden geçerken`, photo: 'tunnel',
  });
}

// Ulusal kupa haberi
export function cupNews(state, plan, res) {
  const p = state.player, fx = plan.fx;
  const T = state.teams[p.clubId], O = state.teams[fx.opp];
  const CN = fx.cupName || 'Kupa';
  const sk = `${res.myGoals}-${res.oppGoals}${res.pens ? ` (pen. ${res.pens.join('-')})` : ''}`;
  const TK = UP(T.name);
  if (res.cupTrophy) return clip(state, pick(['golsporu', 'tribun']), {
    headline: pick([`KUPA ${TK}'NIN!`, `${TK} ${UP(CN)} ŞAMPİYONU!`, 'KUPA EVİNE DÖNDÜ!']),
    sub: `Finalde ${O.name} yenildi · ${sk}`,
    body: `${T.name}, ${CN} finalinde ${ek(O.name, 'acc')} geçerek kupayı kaldırdı. ${res.goals ? `${p.surname} finalde attığı golle damgasını vurdu.` : `${p.surname} final kadrosundaydı.`} Takıma kulüp primi dağıtıldı.`,
    caption: `${T.name} oyuncuları kupayla`, photo: ph('champions', 'trophy'),
  });
  if (res.koWon) {
    if (!fx.final && Math.random() < 0.5 && !res.goals && !res.pensUsed) return null;
    return clip(state, pick(['golsporu', 'tribun', 'aksam']), {
      headline: fx.round === 'Yarı final' ? `${TK} FİNALDE!` : pick([`${TK} KUPADA TUR ATLADI`, `KUPADA ${TK} YOLUNA DEVAM`, `${UP(O.name)} ELENDİ`]),
      sub: `${CN} ${fx.round} · ${sk}`,
      body: `${CN} ${fx.round.toLocaleLowerCase('tr-TR')} maçında ${T.name}, ${ek(O.name, 'acc')} saf dışı bıraktı.${res.pensUsed ? ' Tur penaltılarla geldi!' : ''} ${res.goals ? `${p.surname} golüyle öne çıktı.` : ''}`,
      caption: `${T.name} tur sevinci`, photo: res.pensUsed ? 'cheer' : ph('fans', 'cheer'),
    });
  }
  return clip(state, pick(['sertsut', 'aksam']), {
    headline: O.str + 6 < T.str ? pick(['KUPADA BÜYÜK SÜRPRİZ!', `${TK} KUPADA ŞOKTA`]) : pick([`${TK} KUPAYA VEDA ETTİ`, 'KUPA DEFTERİ KAPANDI']),
    sub: `${CN} ${fx.round}: ${O.name} kazandı · ${sk}`,
    body: `${T.name} ${CN} yolculuğuna ${fx.round.toLocaleLowerCase('tr-TR')} aşamasında veda etti.${res.pensUsed ? ' Penaltılar acımasızdı.' : ''}`,
    caption: `${T.name} oyuncuları maç sonunda`, pose: 'sad', photo: ph('empty', 'sad'),
  });
}

// Avrupa kupası haberi
export function euroNews(state, plan, res) {
  const p = state.player, fx = plan.fx;
  const T = state.teams[p.clubId], O = state.teams[fx.opp];
  const CN = { UCL: 'Şampiyonlar Ligi', UEL: 'Avrupa Ligi', UECL: 'Konferans Ligi', USC: 'UEFA Süper Kupa' }[fx.comp] || 'Avrupa';
  const sk = `${res.myGoals}-${res.oppGoals}${res.pensUsed ? ` (pen. ${res.pens ? res.pens.join('-') : ''})` : ''}`;
  const AD = UP(p.surname), TK = UP(T.name);
  if (res.euroTrophy) return clip(state, pick(['golsporu', 'tribun']), {
    headline: pick([`AVRUPA'NIN KRALI ${TK}!`, `${TK} ${UP(CN)} ŞAMPİYONU!`, 'TARİH YAZILDI!']),
    sub: `Finalde ${O.name} yenildi · ${sk}`,
    body: `${T.name}, ${CN} finalinde ${ek(O.name, 'acc')} geçerek kupayı kaldırdı. ${res.goals ? `${p.surname} finalde attığı golle gecenin kahramanı oldu.` : `${p.surname} finalde forma giydi.`} Şehir sabaha kadar uyumadı!`,
    caption: `${T.name} oyuncuları kupayla`, photo: ph('champions', 'trophy'),
  });
  if (fx.knockout) {
    const nxt = { 8: 'SON 16', 9: 'ÇEYREK FİNAL', 10: 'YARI FİNAL', 11: 'FİNAL' }[fx.md];
    if (res.koWon) return clip(state, pick(['golsporu', 'tribun', 'aksam']), {
      headline: fx.md === 11 ? `${TK} FİNALDE!` : pick([`${nxt}'E UÇTUK!`, `${TK} TUR ATLADI`, `AVRUPA'DA ${TK} RÜZGÂRI`]),
      sub: `${CN} ${fx.round}: ${O.name} elendi · ${sk}`,
      body: `${CN} ${fx.round.toLocaleLowerCase('tr-TR')} maçında ${T.name}, ${ek(O.name, 'acc')} saf dışı bıraktı.${res.pensUsed ? ' Tur penaltılarla geldi!' : ''} ${res.goals ? `${p.surname} golüyle damga vurdu.` : ''}`,
      caption: `${T.name} tur sevinci`, photo: res.pensUsed ? 'cheer' : ph('fans', 'cheer'),
    });
    return clip(state, pick(['sertsut', 'aksam']), {
      headline: pick([`AVRUPA DEFTERİ KAPANDI`, `${TK} VEDA ETTİ`, `${UP(O.name)} DUVARINA TOSLADIK`]),
      sub: `${CN} ${fx.round}: ${O.name} kazandı · ${sk}`,
      body: `${T.name} ${CN} macerasına ${fx.round.toLocaleLowerCase('tr-TR')} aşamasında veda etti.${res.pensUsed ? ' Penaltılar acımasızdı.' : ''}`,
      caption: `${T.name} oyuncuları maç sonunda`, pose: 'sad', photo: ph('empty', 'sad'),
    });
  }
  if (res.myGoals - res.oppGoals >= 2 || (res.result === 'W' && O.str >= 88)) return clip(state, pick(['golsporu', 'tribun']), {
    headline: O.str >= 88 ? pick([`DEV AVRUPA GECESİ!`, `${TK} ${UP(O.name)} DEVİRDİ`]) : pick([`AVRUPA'DA ŞOV`, `${TK} AVRUPA'DA FARK ATTI`]),
    sub: `${CN} ${fx.round} · ${sk}`,
    body: `${CN} lig aşamasında ${T.name}, ${O.name} karşısında önemli bir galibiyet aldı. ${res.goals ? `${p.surname} ${res.goals} golle sahnedeydi.` : ''}`,
    caption: `${T.name} Avrupa gecesinde`, photo: ph('fans', 'cheer'),
  });
  return null;
}
