import { ek } from './news.js';
// Spiker: heyecanlı + esprili anlatım. Her satırın bir kimliği var;
// ileride audio/spiker/<id>.mp3 dosyası eklenirse o satır seslendirilir.
// Yer tutucular: {ad} {takim} {rakip} {kaleci} {defans} {arkadas} {skor} {stad}

export const LINES = {
  kickoff: [
    'Ve başladı! {takim} ile {rakip} karşı karşıya, tribünler tıklım tıklım!',
    'Hakem düdüğü çaldı, 90 dakikalık roman başlıyor sevgili seyirciler!',
    'Top yuvarlak, saha yeşil, heyecan dorukta. Başlıyoruz!',
    'Çekirdekler hazır mı? Çünkü maç başladı!',
  ],
  weather_yagmur: [
    'Bardaktan boşanırcasına yağmur var, top çimde kayıyor, kaleciler dikkat!',
    'Yağmur altında bir futbol şöleni. Şemsiyesi olan şanslı!',
  ],
  weather_kar: [
    'Kar yağıyor! Turuncu top sahada, kartopu oynasak daha kolay olurdu!',
    'Saha beyaz, nefesler buhar buhar. Bu maçta ayakta kalan kazanır!',
  ],
  weather_gece: [
    'Işıklar yandı, gece maçının büyüsü başladı!',
  ],
  tactic_katenacio: [
    '{rakip} kalesinin önüne otobüs park etmiş, hem de iki katlısından!',
    '{rakip} bugün beraberliğe imza atmaya gelmiş, kaleyi betona gömmüşler.',
  ],
  tactic_pres: [
    '{rakip} önde basıyor, topu alan nefes alamıyor!',
  ],
  tactic_hucum: [
    '{rakip} gol için gelmiş, arkalarında koca boşluklar var!',
  ],
  tactic_kanat: [
    '{rakip} kanatlara yüklenecek, ortalar yağmur gibi gelecek.',
  ],
  intro_acik: [
    'Top {ad:loc}! Bakalım ne yapacak…',
    '{ad} topla buluştu, önünde {defans} var!',
    'Topu ayağına aldı {ad}, tribünler ayağa kalkıyor!',
  ],
  intro_kontra: [
    'KONTRA! KONTRA! {ad} önünde koca bir boşluk!',
    'Top kapıldı, {takim} hızlı çıkıyor, {ad} rüzgar gibi!',
  ],
  intro_birebir: [
    'Defansın arkasına sarktı {ad}! Karşısında sadece {kaleci}!',
    'Kaleciyle baş başa! Ya şimdi ya hiç!',
  ],
  intro_serbest: [
    'Ceza sahası önünde serbest vuruş, topun başında {ad}!',
    'Frikik! Baraj diziliyor, {ad} topa bakıyor, kaleci baraja bağırıyor!',
  ],
  intro_kafa: [
    'Kanattan orta geliyor, {ad} yükseliyor…',
    '{arkadas} ortaya çevirdi, ceza sahası karışık!',
  ],
  intro_korner: [
    'Korner! Ceza sahasında itiş kakış, hakem göz kulak olsun!',
    'Köşe vuruşu, {arkadas} topun başında, {ad} pozisyon alıyor.',
  ],
  intro_rovasata: [
    'Top havada arkadan geliyor… {ad} sırtı dönük… yoksa?!',
    'Geriden yüksek bir top! {ad} kaleye arkası dönük, akrobasi zamanı mı?',
  ],
  intro_uzuntop: [
    'Uzun top! {ad} defansın arkasında, {kaleci} kalesinden çıkıyor!',
    'Geriden yüksek bir top, {ad} ile {kaleci} arasında hız yarışı!',
  ],
  intro_duvar: [
    'Ceza sahası önünde {ad}, yanında {arkadas}… ver-kaç kokusu!',
    '{ad} topla, önü kalabalık, {arkadas} duvar olmaya hazır!',
  ],
  intro_pres: [
    'Top rakipte ama {ad} bırakmıyor! Önde pres!',
    '{rakip} geriden çıkmaya çalışıyor, {ad} üstüne basıyor!',
  ],
  intro_penalti: [
    'PENALTI! Topun başına {ad} geçiyor. Kalbi olan izlemesin!',
    'Penaltı noktasında {ad}, karşısında {kaleci}. Sinir savaşı!',
  ],
  goal: [
    'GOOOOL! {ad}! Bu nasıl bir vuruş! Ağlar havalandı!',
    'VE GOL! {ad} imzayı attı! Tribünler yıkılıyor!',
    'GOOOL! {kaleci} sadece baktı! Bakmak da bir sanattır ama bugün değil!',
    'Ağları sarstı {ad}! Skor {skor}!',
  ],
  goal_serbest: [
    'GOOOL! Frikikten harika gol! Top kavis aldı, köşeye yerleşti, baraj hâlâ şaşkın!',
    'Muhteşem frikik! {ad} topu adresine teslim etti, kargo bile bu kadar hızlı değil!',
  ],
  goal_kafa: [
    'KAFAYLA GOL! {ad} kafasını sadece düşünmek için kullanmıyor!',
    'GOOOL! Müthiş yükseldi, alnının tam ortası!',
  ],
  goal_korner: [
    'KORNERDEN GOL! {ad} ceza sahasında herkesten yüksekti!',
  ],
  goal_rovasata: [
    'RÖVAŞATA! İNANILMAZ! {ad} havada ters döndü ve top ağlarda! Bu gol yıllarca konuşulur!',
    'AMAN ALLAHIM! Rövaşatayla gol! Akrobat mı futbolcu mu karar veremedik!',
  ],
  goal_penalti: [
    'Penaltı gol! {ad} soğukkanlı, {kaleci} öbür köşede!',
    'GOL! Penaltıyı tereyağından kıl çeker gibi attı!',
  ],
  intro_kosevurusu: ['Korner! Topun başında {ad} var, ceza sahası kalabalık!', '{ad} köşe bayrağına koştu, korneri kendisi kullanacak!'],
  intro_vole: ['Top ceza sahası dışına sekti… {ad} bekliyor!', 'Uzaklaştırılan top havada… {ad} gözünü topa dikti!'],
  intro_arkadirek: ['{arkadas} kanattan çevirecek… {ad} arka direkte unutuldu!', 'Orta ön direği geçebilir… arka direkte {ad} tek başına!'],
  intro_balik: ['{arkadas} çizgiye indi, sert ve alçak çevirecek…', 'Alçak orta geliyor! {ad} kendini atacak mı?'],
  goal_kosevurusu: ['{ad} korneri adrese teslim gönderdi, gol!', 'Kornerden müthiş orta, ağlar havalandı!'],
  goal_vole: ['VOLEEE! {ad} havadan vurdu, top füze gibi ağlarda!', 'Ne vuruş! {ad} yere düşürmeden vurdu, {kaleci} sadece baktı!', 'Bu vole yılın golü adayı! {ad} inanılmaz!'],
  goal_arkadirek: ['Arka direkte {ad}! Kafayı içeri çevirdi, gol!', '{ad} arka direkte unutulmayacak bir kafa vurdu!'],
  goal_balik: ['BALIKLAMA! {ad} kendini attı, top ağlarda!', '{ad} çimlere uzanarak kafayı vurdu, muhteşem!'],
  goal_uzuntop: [
    'GOL! Kaleciden önce davrandı {ad}, top boş ağlarda!',
    'Hız yarışını kazandı {ad}! {kaleci} geç kaldı, GOL!',
  ],
  goal_duvar: [
    'VER-KAÇ VE GOL! {ad} ile {arkadas} defansı ikiye böldü!',
    'Ders kitabı gibi duvar pası! {ad} bitirdi, GOL!',
  ],
  goal_pres: [
    'PRESTEN GOL! {ad} topu kaptı ve affetmedi!',
    'Rakip geriden çıkayım derken {ad} topu çaldı, ağlara gönderdi!',
  ],
  goal_birebir: [
    'GOL! Kaleciyle birebirde affetmedi {ad}!',
  ],
  assist: [
    'GOL! Pas {ad:abl}, bitiren {arkadas}! Ortak mülkiyet!',
    'Harika paylaşım! {ad} servis etti, {arkadas} tabağı temizledi!',
  ],
  saved: [
    'Ve {kaleci} çıkardı! Eldivenlerine sağlık!',
    'Kurtarış! {kaleci} bugün duvar örmüş!',
    'Uff! Kaleci son anda uzandı, köşeden çeldi!',
  ],
  miss: [
    'Auta gitti! Top tribünlere hediye.',
    'Az farkla dışarıda! Direk "az kalsın" dedi.',
    'Kaçtı! Kale ile top arasında küçük bir anlaşmazlık…',
  ],
  over: [
    'Üstten aut! Bu şutla ancak uydu düşürülür!',
    'Top tribünlerde! Taraftarlar hatıra fotoğrafı çekiyor.',
  ],
  post: [
    'DİREK! Metal ses hâlâ kulaklarımızda!',
    'Direkten döndü! {rakip} bugün şanslı!',
  ],
  blocked: [
    'Defans araya girdi, şut bloke!',
    'Ve barajdan döndü, duvar yerinde durdu!',
  ],
  lost: [
    'Top kaptırıldı, {defans} temiz müdahale.',
    '{defans} ayağını uzattı, top gitti.',
  ],
  intercepted: [
    'Pas arada kesildi, {defans} okudu!',
  ],
  tmMiss: [
    '{arkadas} kaçırdı! {ad} ellerini başına koydu!',
    'Altın tepside sundu {ad}, {arkadas} tepsiyi düşürdü!',
  ],
  offside: [
    'Bayrak havada! Ofsayt. Bir adım erken, bir adım fazla!',
    'Yan hakem bayrağı kaldırdı, ofsayt! Tribünlerden ıslıklar…',
  ],
  foulPen: [
    'Ceza sahasında düştü! Hakem beyaz noktayı gösteriyor, PENALTI!',
    'Bu penaltı! {defans} biçti, hakem tereddüt etmedi!',
  ],
  foulFk: [
    'Faul! {defans} arkadan girdi, serbest vuruş!',
    'Düdük çaldı, faul. Topun başında {ad} olacak!',
  ],
  oppYellow: [
    'Sarı kart {defans:dat}! Hakem cebine elini attı.',
    '{defans} sarıyı gördü, bundan sonra dikkatli olmalı.',
  ],
  oppRed: [
    'KIRMIZI KART! {defans} oyundan atıldı! {rakip} 10 kişi!',
    'Hakem kırmızıyı çıkardı! Son adam faulü, {defans} soyunma odasına!',
  ],
  tackleWin: [
    'Kayarak girdi {ad}, topu geri kazandı! Forvetten defans dersi!',
  ],
  tackleMiss: [
    'Kaydı {ad} ama boşluğa! Çimleri biçmiş oldu.',
  ],
  meYellow: [
    'Sarı kart {ad:dat}! Biraz sert girdi.',
    'Hakem {ad:dat} sarı gösterdi, tribünler itiraz ediyor.',
  ],
  meRed: [
    'KIRMIZI! {ad} oyundan atılıyor! Bu ayak orada ne arıyordu?!',
    'İkinci sarıdan kırmızı! {ad} erken duşa gidiyor.',
  ],
  appealWin: [
    'İnanılmaz! Hakem VAR\'a gitti ve kararını değiştirdi! {ad} haklı çıktı!',
  ],
  appealYellow: [
    'Hakeme fazla yüklendi {ad}, itirazdan sarı kart!',
  ],
  appealNothing: [
    'Hakem elini salladı, devam! İtiraz kabul edilmedi.',
    '{ad} kollarını açtı ama hakem duymazdan geldi.',
  ],
  teamGoal: [
    'GOL! {takim} öne geçiyor… {skor}!',
    'Gol {takim:abl}! Skor {skor}.',
  ],
  oppGoal: [
    'Gol {rakip:abl}… Skor {skor}. Soğuk duş!',
    '{rakip} buldu golü. Sessizlik… {skor}.',
  ],
  latePressure: [
    'Son dakikalar! {takim} yüklenmeye başladı, herkes ileride!',
    'Saat işliyor, {takim} geride! Kaleci bile çıkacak neredeyse!',
  ],
  halftime: [
    'İlk yarı bitti. Çay simit molası!',
    'Devre arası. Teknik direktör soyunma odasında konuşmasını hazırlıyor.',
  ],
  fulltime: [
    'Ve maç sona erdi! Skor {skor}.',
    'Son düdük! {skor}. Futbol yine konuştu!',
  ],
};


// Pozisyon öncesi gerilim: her tür için birkaç sahne, satır satır parlar (NSS tarzı)
export const BUILD = {
  acik: [
    ['{arkadas} orta sahada topu kazandı…', 'Kafasını kaldırdı, {ad:acc} gördü…', 'Top {ad:loc}! Önü açılıyor!'],
    ['{takim} sabırla paslaşıyor…', 'Sağa, sola… boşluk arıyorlar…', 'Ve top {ad:dat} geldi!'],
    ['Rakip ataktan döndü, top bizde…', '{arkadas} ileri çıkıyor…', 'Ara pası {ad:dat}!'],
  ],
  kontra: [
    ['{rakip} köşe vuruşu kullanıyor…', 'Kafayla uzaklaştırdık!', 'KONTRA! {ad} tek başına!'],
    ['{defans} topu kaybetti!', '{arkadas} hemen ileri vurdu…', '{ad} koşuyor, arkasında kimse yok!'],
  ],
  birebir: [
    ['{arkadas} kafasını kaldırdı…', 'Defansın arkasına uzun top…', 'Ofsayt yok! {ad} kaleciyle karşı karşıya!'],
    ['{ad} ofsayt çizgisinde bekliyor…', 'Pas geldi, tam zamanında…', 'Sıyrıldı! Önünde sadece {kaleci}!'],
  ],
  serbest: [
    ['{ad} ceza sahasına doğru sürüyor…', '{defans} arkadan girdi, düştü!', 'Düdük! Tehlikeli bölgede frikik!'],
    ['Ceza sahası yayında faul!', 'Rakipler baraj kuruyor…', '{ad} topu yere koydu, geri çekildi…'],
  ],
  kafa: [
    ['Top sağ kanatta {arkadas:loc}…', 'Adamını geçti, çizgiye indi…', 'Ortasını yaptı! {ad} kafaya kalkıyor!'],
    ['{arkadas} sol kanattan sürüyor…', 'Kafasını kaldırdı…', 'Ortaya gönderdi! {ad} havalandı!'],
  ],
  korner: [
    ['Şut! Defanstan sekti…', 'Korner!', '{arkadas} topun başında, ceza sahası karışık…'],
    ['{kaleci} topu kornere çeldi!', 'Herkes ceza sahasında…', '{ad} adamını itiyor, top geliyor!'],
  ],
  rovasata: [
    ['Ceza sahasında karambol…', 'Top havaya sekti…', '{ad} sırtı dönük… yoksa?!'],
    ['{arkadas} kanattan çevirdi, top arkada kaldı…', '{ad} geriye doğru yükseliyor…', 'Havada! Akrobasi zamanı!'],
  ],
  uzuntop: [
    ['{arkadas} geride topu kazandı…', 'Kafasını kaldırdı, uzun vurdu…', 'Top defansın arkasında! {ad} koşuyor, {kaleci} çıkıyor!'],
    ['{rakip} ofsayt tuzağı kuruyor…', '{arkadas} kafayı kaldırdı, havadan aşırdı…', 'Tuzak bozuldu! {ad} topun peşinde!'],
  ],
  duvar: [
    ['{takim} ceza sahası önünde paslaşıyor…', 'Top {ad:dat} geldi, önü kalabalık…', 'Yanında {arkadas}! Ver-kaç fırsatı!'],
    ['{ad} sürüyor, iki defans önünde…', '{arkadas} yanına geldi, duvar oluyor…', 'Şimdi ya da hiç!'],
  ],
  kosevurusu: [
    ['Şut! Defanstan sekti…', 'Korner kararı!', '{ad} topu köşe bayrağına koydu…'],
    ['{kaleci} topu kornere çeldi!', 'Uzun boylular ceza sahasında…', '{ad} kolunu kaldırdı, işaret verdi…'],
  ],
  vole: [
    ['Korner sonrası top uzaklaştırıldı…', 'Top havada dönüyor…', '{ad} ceza sahası çizgisinde, yere düşmeden vuracak mı?'],
    ['{arkadas} göğsüyle indirdi…', 'Top havalandı…', '{ad} vole için pozisyon aldı!'],
  ],
  arkadirek: [
    ['{arkadas} kanatta çalımladı…', 'Kafasını kaldırdı, ceza sahasına bakıyor…', 'Arka direkte {ad} boş!'],
    ['{takim} sağdan geliyor…', 'Orta ön direği aşacak…', '{ad} arka direğe sızdı!'],
  ],
  balik: [
    ['{arkadas} çizgiye kadar indi…', 'Alçak ve sert çevirecek…', '{ad} ceza sahasına daldı!'],
    ['Hızlı hücum, {arkadas} kanatta…', 'Top sert geliyor, yerden yarım metre!', 'Balıklama zamanı!'],
  ],
  pres: [
    ['{rakip} geriden oyun kuruyor…', '{ad} pres için öne çıktı…', 'Kaleci kısa verdi! Top rakipte, {ad} üstüne basıyor!'],
    ['Top auta çıktı, taç rakibin…', 'Taç atışı kısa kullanıldı…', '{ad} pres yapıyor! Hata gelebilir!'],
  ],
  penalti: [
    ['{ad} ceza sahasına girdi…', '{defans} kaydı, {ad} yerde!', 'Hakem beyaz noktayı gösteriyor! PENALTI!'],
    ['Ceza sahasında el!', 'Hakem VAR\'ı dinliyor…', 'Ve penaltı! Topun başına {ad} geçiyor!'],
  ],
};
export function buildUp(kind, vars = {}) {
  const seqs = BUILD[kind] || BUILD.acik;
  const si = Math.floor(Math.random() * seqs.length);
  return seqs[si].map((t, i) => ({ id: `build_${kind}_${si + 1}_${i + 1}`, text: fill(t, vars) }));
}

// Seslendirme dosyaları (Chatterbox ile üretilecek): eklenince buraya id yaz
export const SPIKER_SESLERI = new Set([]);

function fill(t, v) {
  return t.replace(/\{(\w+)(?::(\w+))?\}/g, (_, k, c) => (v[k] == null ? '' : c ? ek(v[k], c) : v[k]));
}

// Bir olay için rastgele satır: { id, text }
export function say(event, vars = {}) {
  const list = LINES[event];
  if (!list || !list.length) return null;
  const i = Math.floor(Math.random() * list.length);
  return { id: `${event}_${i + 1}`, text: fill(list[i], vars) };
}

// Ses dosyası varsa çal
let audioEl = null;
export function speak(line) {
  if (!line || !SPIKER_SESLERI.has(line.id)) return;
  try {
    audioEl?.pause();
    audioEl = new Audio(`audio/spiker/${line.id}.mp3`);
    audioEl.play().catch(() => {});
  } catch { /* ses yok */ }
}

// Tüm satırları id ile döker (seslendirme listesi için)
export function allLines() {
  const out = [];
  for (const [ev, list] of Object.entries(LINES)) list.forEach((t, i) => out.push({ id: `${ev}_${i + 1}`, text: t }));
  for (const [k, seqs] of Object.entries(BUILD)) seqs.forEach((seq, si) => seq.forEach((t, i) => out.push({ id: `build_${k}_${si + 1}_${i + 1}`, text: t })));
  return out;
}
