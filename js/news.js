// Gazete kupürleri: 3 uydurma gazete, abartılı Türk spor basını dili.
import { overall, pick, randInt } from './engine.js';
import { isDerby } from './data.js';
import { headSvg, skinColor, lookOf } from './look.js';

export const PAPERS = {
  golsporu: { name: 'GOL SPORU', slogan: 'Futbolun sesi', c1: '#E30613', c2: '#FFD200', ink: '#111' },
  sertsut:  { name: 'SERT ŞUT', slogan: 'Lafını esirgemez', c1: '#111111', c2: '#FFFFFF', ink: '#111' },
  transfer: { name: 'TRANSFER HATTI', slogan: 'Kulislerin nabzı', c1: '#0B3D91', c2: '#7DD3FC', ink: '#0b1a33' },
};

const BIG = ['gs', 'fb', 'bjk', 'ts'];

// ---------- Türkçe ek yardımcıları ----------
const VOWELS = 'aeıioöuüAEIİOÖUÜ';
const HARD = 'fstkçşhpFSTKÇŞHP';
function lastVowel(w) { for (let i = w.length - 1; i >= 0; i--) if (VOWELS.includes(w[i])) return w[i].toLocaleLowerCase('tr-TR'); return 'e'; }
function lastWord(s) { return s.trim().split(/\s+/).pop(); }
/** ek: loc (-de), abl (-den), acc (-i), dat (-e), gen (-in) */
export function ek(name, type) {
  const w = lastWord(name);
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
  const isUpper = w === w.toLocaleUpperCase('tr-TR');
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
// Gemini fotoğrafları (img/news). 'stand' pozunda çizim kullanılır.
function photoFor(pose) {
  if (pose === 'cheer') return pick(['cheer', 'slide']);
  if (pose === 'sad') return 'sad';
  if (pose === 'trophy') return 'trophy';
  if (pose === 'stand') return 'press';   // basın toplantısı
  return null;
}

// ---------- maç sonrası ----------
const num = (x) => String(x).replace('.', ',');

export function matchNews(state, plan, res) {
  const p = state.player;
  const out = [];
  if (!res.played) return out;
  const AD = UP(p.surname);
  const T = state.teams[p.clubId];
  const O = state.teams[plan.fx.opp];
  const TAKIM = UP(T.name), RAKIP = UP(O.name);
  const skor = plan.fx.home ? `${res.myGoals}-${res.oppGoals}` : `${res.oppGoals}-${res.myGoals}`;
  const mac = plan.fx.home ? `${T.name} ${skor} ${O.name}` : `${O.name} ${skor} ${T.name}`;
  const derby = isDerby(T.id, O.id);
  const firstGoal = res.goals > 0 && p.career.goals === res.goals;
  const decisive = res.goals > 0 && res.result === 'W' && res.myGoals - res.oppGoals === 1;
  const missedPen = res.penMissed;

  // --- Gol Sporu: övgü ---
  if (res.goals >= 3) {
    out.push(clip(state, 'golsporu', {
      headline: pick([`${AD} ŞOV!`, `${UP(ek(p.surname, 'abl'))} GOL YAĞMURU`, `HAT-TRICK'LE TARİH YAZDI`]),
      sub: `${p.name} ${p.surname} ${res.goals} gol attı, ${T.name} rakibini darmadağın etti`,
      body: `${mac}. Genç forvet maç boyunca rakip savunmaya kâbusu yaşattı. Tribünler ayakta alkışladı, maçın topu ${ek(p.surname, 'dat')} hediye edildi. Maç notu: ${num(res.rating)}.`,
      caption: `${p.name} ${p.surname} hat-trick sevincini taraftarla paylaştı`,
    }));
  } else if (firstGoal) {
    out.push(clip(state, 'golsporu', {
      headline: pick(['İLK GOL GELDİ!', 'GENÇ YILDIZ SAHNEDE', `${AD} AĞLARI BULDU`]),
      sub: `${p.age} yaşındaki forvet profesyonel kariyerindeki ilk golünü attı`,
      body: `${mac}. ${ek(T.name, 'gen')} genç golcüsü ${p.surname}, uzun süredir beklenen ilk golüne ${O.name} karşısında kavuştu. Teknik heyet, oyuncunun gelişiminden memnun.`,
      caption: `${p.surname} ilk golünün ardından gözyaşlarını tutamadı`,
    }));
  } else if (res.goals === 2) {
    out.push(clip(state, 'golsporu', {
      headline: pick([`${AD} İKİ ATTI, ${TAKIM} UÇTU`, `${AD} FIRTINASI`, `ÇİFTE ${AD}`]),
      sub: `${p.surname} iki golle maçın yıldızı oldu`,
      body: `${mac}. Kariyerinin en iyi günlerinden birini yaşayan ${p.surname}, iki golüyle ${ek(T.name, 'dat')} önemli puanlar kazandırdı. Maç notu: ${num(res.rating)}.`,
      caption: `${p.surname} gol sonrası köşe bayrağına koştu`,
    }));
  } else if (decisive && (derby || Math.random() < 0.6)) {
    out.push(clip(state, 'golsporu', {
      headline: derby ? `DERBİDE ${AD} DAMGASI!` : pick([`${AD} KAZANDIRDI!`, `ALTIN GOL ${UP(ek(p.surname, 'abl'))}`, `${AD} ATTI, ${TAKIM} GÜLDÜ`]),
      sub: `Tek farklı galibiyette belirleyici gol ${ek(p.surname, 'abl')} geldi`,
      body: `${mac}. Zorlu geçen mücadelede farkı yaratan isim ${p.surname} oldu. ${T.name} taraftarı maç sonu genç oyuncunun adını tezahürat yaptı.`,
      caption: `${p.surname} galibiyet golünü attığı anı kutluyor`,
    }));
  } else if (res.rating >= 8.3) {
    out.push(clip(state, 'golsporu', {
      headline: pick([`${AD} MAESTRO GİBİ`, `${AD} SAHNEYİ ÇALDI`, 'GECENİN YILDIZI']),
      sub: `${p.surname} ${num(res.rating)} notla sahanın en iyisiydi`,
      body: `${mac}. Asistleri ve hareketliliğiyle göz dolduran ${p.surname}, takımının oyununa yön verdi.`,
      caption: `${p.surname} taraftarı selamlıyor`,
    }));
  }

  // --- Sert Şut: eleştiri ---
  if (missedPen) {
    out.push(clip(state, 'sertsut', {
      headline: pick([`${AD} PENALTIDA ÇUVALLADI`, 'BEYAZ NOKTADA FACİA', `${UP(ek(p.surname, 'gen'))} SİNİRLERİ BOZULDU`]),
      sub: 'Kaçan penaltı sonrası tribünlerden tepki geldi',
      body: `${mac}. Penaltıyı kullanmak isteyen ${p.surname} beyaz noktada büyük bir fırsatı harcadı. Yorumcular, genç oyuncunun bu sorumluluğu almaya hazır olup olmadığını sorguluyor.`,
      caption: `${p.surname} kaçan penaltının ardından ellerini başına koydu`, pose: 'sad', photo: 'penmiss',
    }));
  } else if (res.rating <= 5.2) {
    out.push(clip(state, 'sertsut', {
      headline: pick(['HAYAL KIRIKLIĞI!', `${AD} SINIFTA KALDI`, 'BU MU YILDIZ?', `${AD} YOK HÜKMÜNDE`]),
      sub: `${p.surname} ${num(res.rating)} notla günü kötü kapattı`,
      body: `${mac}. Pozisyonları bir bir harcayan ${p.surname}, ${O.name} savunması karşısında etkisiz kaldı. Teknik direktörün sabrı ne kadar sürecek?`,
      caption: `${p.surname} kaçan fırsatların ardından hayıflanıyor`, pose: 'sad',
    }));
  } else if (res.result === 'L' && res.oppGoals - res.myGoals >= 3) {
    out.push(clip(state, 'sertsut', {
      headline: pick([`${TAKIM} ÇÖKTÜ`, 'REZALET!', `${RAKIP} FARK ATTI`]),
      sub: `${T.name} ağır yenilgiyle sarsıldı`,
      body: `${mac}. Savunmada hata üstüne hata yapan ${T.name}, sahadan ağır bir yenilgiyle ayrıldı. Forvet hattı da etkisizdi.`,
      caption: 'Oyuncular maç sonu başı önde soyunma odasına gitti', pose: 'sad',
    }));
  } else if (res.goals >= 2 && Math.random() < 0.35) {
    out.push(clip(state, 'sertsut', {
      headline: `${AD} ABARTILIYOR MU?`,
      sub: 'Herkes övüyor, biz soruyoruz',
      body: `${mac}. Gollerini attı, evet. Ama ${O.name} gibi bir rakibe karşı... ${p.surname} gerçek sınavı büyük maçlarda verecek.`,
      caption: `${p.surname} gol sevinci yaşarken`,
    }));
  }
  return out.slice(0, 2);
}

// ---------- transfer dedikodusu ----------
export function maybeRumor(state, recentAvg) {
  const p = state.player;
  if (state.season.week - (state.lastRumorWeek ?? -99) < 5 && state.lastRumorYear === state.season.year) return null;
  if (recentAvg < 7.0 || Math.random() > 0.18) return null;
  const my = state.teams[p.clubId];
  const bigger = Object.values(state.teams).filter((t) => t.str >= my.str + 4 && t.id !== my.id && t.str <= overall(p) + 30);
  if (!bigger.length) return null;
  const t = pick(bigger.sort((a, b) => b.str - a.str).slice(0, 5));
  state.lastRumorWeek = state.season.week;
  state.lastRumorYear = state.season.year;
  const AD = UP(p.surname);
  const fee = Math.max(0.5, Math.round(((overall(p) - 40) ** 2 * 0.012 + p.fame * 0.06) * 10) / 10);
  return clip(state, 'transfer', {
    headline: pick([`${UP(t.name)} ${UP(ek(p.surname, 'acc'))} İZLİYOR`, `${UP(ek(t.name, 'abl'))} SÜRPRİZ HAMLE`, `${AD} İÇİN ${String(fee).replace('.', ',')} MİLYON EURO`]),
    sub: `${ek(t.name, 'gen')} gözü ${ek(my.name, 'gen')} genç forvetinde`,
    body: `Kulis bilgilerine göre ${t.name} scout ekibi son haftalarda ${p.surname} için tribünde yer aldı. Oyuncunun piyasa değerinin ${String(fee).replace('.', ',')} milyon euroya ulaştığı konuşuluyor. ${my.name} cephesi ise oyuncunun satılık olmadığını açıkladı.`,
    caption: `${ek(t.name, 'gen')} ilgilendiği ${p.surname}`,
    pose: 'stand', photo: 'cheer',
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
    body: `Gece geç saatlerde bir gazinoda görüntülenen ${p.surname}'in yüklü miktarda kaybettiği öne sürüldü. Taraftarlar tepkili: "Önce sahada konuş!"`,
    caption: `${p.surname} basın karşısında`, pose: 'stand',
  });
}

export function weddingNews(state) {
  const p = state.player;
  return clip(state, 'golsporu', {
    headline: `${UP(p.surname)} DÜNYAEVİNE GİRDİ!`, sub: `${p.partner.name} ile görkemli düğün`,
    body: `Futbol dünyasının yıldız ismi ${p.name} ${p.surname}, ${p.partner.name} ile hayatını birleştirdi. Düğüne takım arkadaşları da katıldı.`,
    caption: 'Mutlu çift düğün sonrası', pose: 'trophy', photo: 'cheer',
  });
}

// ---------- imza ----------
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
      sub: `${lid === 'SL' ? 'Süper Lig' : '1. Lig'} kupası ${ek(T.name, 'gen')} müzesinde`,
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
      caption: `${p.surname} golün ardından`, pose: 'cheer', photo: 'cheer',
    });
  }
  const red = res.cards?.find((c) => c.card === 'red' || c.card === 'secondYellow');
  if (red) {
    return clip(state, 'sertsut', {
      headline: red.card === 'red' ? `${UP(p.surname)} KENDİNİ KAYBETTİ!` : `${UP(p.surname)} ÇİFT SARIYLA ATILDI`,
      sub: `${red.min}. dakikada kırmızı kart · ${red.ban} maç ceza`,
      body: `${T.name} forması giyen ${p.surname}, ${O.name} maçında ${red.min}. dakikada kırmızı kart gördü. Disiplin kurulu ${red.ban} maç ceza verdi. Teknik heyetin tepkili olduğu konuşuluyor.`,
      caption: `${p.surname} sahayı terk ederken`, pose: 'sad', photo: 'sad',
    });
  }
  const acc = res.cards?.find((c) => c.accum);
  if (acc) {
    return clip(state, 'transfer', {
      headline: `${UP(p.surname)} SARI KART SINIRINDA`, sub: '4. sarı kartını gördü, gelecek maç yok',
      body: `${p.surname} sezonun 4. sarı kartını görerek bir maçlık cezalı duruma düştü.`,
      caption: `${p.surname} hakemle konuşurken`, pose: 'stand',
    });
  }
  return null;
}
