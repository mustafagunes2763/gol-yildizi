import { ek } from './news.js';
// Spiker: heyecanlı canlı yayın anlatımı (golde coşku, espri yok). Her satırın bir kimliği var;
// ileride audio/spiker/<id>.mp3 dosyası eklenirse o satır seslendirilir.
// Yer tutucular: {ad} {takim} {rakip} {kaleci} {defans} {arkadas} {skor} {stad}

export const SPIKER_NAME = 'Bedirhan Bülent Şimşek';

// Maç önü bilgilendirme ve maç sonu: isim/takım içermez, klon sesle birebir kaydedilebilir.
export const PRE = {
  hello: [
    'İyi akşamlar sayın seyirciler, ben Bedirhan Bülent Şimşek. Karşılaşmaya çok az kaldı, yayınımıza hoş geldiniz.',
    'Merhaba değerli futbolseverler, mikrofonda Bedirhan Bülent Şimşek. Takımlar sahaya çıkıyor, maç birazdan başlıyor.',
    'Bedirhan Bülent Şimşek ile canlı yayındayız. Hakem son kontrollerini yapıyor, nefesler tutuldu.',
  ],
  derby: [
    'Bu akşam önemli bir derbi var. Haftalardır beklenen maçta tribünler hıncahınç dolu.',
    'Derbi maçlarında form durumu geride kalır. Doksan dakika boyunca tek bir hata bile maçı belirleyebilir.',
  ],
  euro: [
    'Avrupa gecesindeyiz. Marş çalındı, iki takım da sahada yerini aldı.',
    'Avrupa kupalarında kritik bir maç. Alınacak her sonuç hem takıma hem ülke puanına yazılacak.',
  ],
  cup: [
    'Kupa gecesindeyiz. Tek maç oynanacak, kaybeden takım kupaya veda edecek.',
    'Kupada sürprizlere hazırlıklı olmak gerek. Eşitlik bozulmazsa uzatmalar ve penaltılar oynanacak.',
  ],
  rival: [
    'Bu maçta ayrıca iki oyuncunun rekabeti de var. Akademi yıllarından beri birbirleriyle yarışıyorlar.',
    'Gözler iki eski akademi arkadaşında. Bu akşam karşı karşıyalar.',
  ],
  top: [
    'Zirve yarışı için kritik bir hafta. Bu maçı kaybeden takım üst sıralarda zor durumda kalacak.',
    'Şampiyonluk hesapları yapılırken çok önemli bir karşılaşma. Her puan değerli.',
  ],
  bottom: [
    'Ligin alt sıralarını ilgilendiren önemli bir maç. Alınacak üç puan hayati önemde.',
    'Düşme hattından uzaklaşmak isteyen takım için bu akşam kayıp yok.',
  ],
  star: [
    'Gözler son haftalarda attığı gollerle dikkat çeken genç golcümüzde.',
    'Takımın en skorer oyuncusu bu akşam da ilk düdükten itibaren sahada.',
  ],
  generic: [
    'Oyuncular ısınmayı tamamladı, takımlar sahadaki yerini aldı. İyi bir maç bekliyoruz.',
    'İki takımın da hazırlıkları tamam. Bakalım sahada hangisi üstün gelecek.',
  ],
};
export const FT = {
  W: ['Ve maç sona erdi! Takımımız sahadan galibiyetle ayrılıyor!', 'Son düdük çaldı! Bu akşam kazanan biziz!', 'Hakem maçı bitirdi! Değerli bir galibiyet!'],
  D: ['Ve maç sona erdi. Takımlar puanları paylaşıyor.', 'Son düdük çaldı, bu akşam kazanan çıkmadı.'],
  L: ['Ve maç sona erdi. Bu akşam sahadan mağlubiyetle ayrılıyoruz.', 'Son düdük çaldı. Takımımız için zor bir akşam oldu.'],
  skor: 'Skor tabelası:',
};
export const NUM = ['sıfır', 'bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz'];
export function preLine(kind) { const L = PRE[kind] || PRE.generic; const i = Math.floor(Math.random() * L.length); return { id: `pre_${kind}_${i + 1}`, text: L[i] }; }
export function ftParts(result, hg, ag) {
  const L = FT[result], i = Math.floor(Math.random() * L.length);
  const n = (x) => (x <= 9 ? NUM[x] : String(x));
  return { ids: [`ft_${result}_${i + 1}`, 'ft_skor', `num_${hg}`, `num_${ag}`], text: `${L[i]} ${FT.skor} ${n(hg)}, ${n(ag)}.`, show: `${L[i]} ${FT.skor} ${hg}-${ag}` };
}

export const LINES = {
  kickoff: [
    'Hakemin düdüğüyle maç başladı! {takim} ile {rakip} karşı karşıya!',
    'Ve başladı! İlk düdük çaldı, {takim} ile {rakip} arasındaki karşılaşmada top yuvarlanıyor!',
    'Maçımız başladı! Tribünlerden büyük bir uğultu yükseliyor!',
    'Santra yapıldı, karşılaşma başladı!',
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
  intro_kapma: [
    '{defans} baskı altında, geri pas düşünüyor… {ad} sezdi!',
    '{rakip} geriden oyun kurmaya çalışıyor, {ad} pas yolunu kolluyor!',
  ],
  intro_donen: [
    '{arkadas} vurdu, {kaleci} çeldi! Top ceza sahasında sahipsiz!',
    'Kaleci çıkardı ama top dışarı gitmedi! İkinci top kimin olacak?',
  ],
  intro_yerden: [
    '{arkadas} çizgiye indi, yerden sert ortaladı!',
    'Kanattan yerden kesme orta, {ad} hareketlendi!',
  ],
  intro_uclu: [
    '{takim} orta sahada paslaşıyor, {ad} ile {arkadas} üçgen kurdu!',
    'Kısa paslarla ileri çıkıyoruz, {ad} oyunun merkezinde!',
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
    'GOOOL! {ad}! Ve top ağlarda! Skor {skor}!',
    'GOL GOL GOL! {ad} vurdu ve gol! {kaleci} uzandı ama yetişemedi!',
    'VE GOL! {ad} fırsatı kaçırmadı, skor {skor}!',
    'GOOOL! {ad} müthiş vurdu, top filelerde!',
  ],
  goal_serbest: [
    'GOOOL! Serbest vuruştan harika gol! {ad} topu barajın üstünden köşeye gönderdi!',
    'Frikikten GOL! {ad} çok iyi vurdu, {kaleci} kıpırdayamadı!',
  ],
  goal_kafa: [
    'KAFAYLA GOL! {ad} yükseldi ve topu ağlara gönderdi!',
    'GOOOL! {ad} kafayı vurdu, top filelerde!',
  ],
  goal_korner: [
    'KORNERDEN GOL! {ad} ceza sahasında herkesten yüksekte!',
    'Korner ve GOL! {ad} kafayla tamamladı!',
  ],
  goal_rovasata: [
    'RÖVAŞATA VE GOL! İnanılmaz! {ad} havada ters döndü ve top ağlarda!',
    'MUHTEŞEM BİR GOL! {ad} rövaşatayla filelere gönderdi!',
  ],
  goal_penalti: [
    'Penaltı GOL! {ad} soğukkanlı, {kaleci} diğer köşede!',
    'GOL! {ad} penaltıyı köşeye yerleştirdi!',
  ],
  intro_kosevurusu: ['Korner! Topun başında {ad} var, ceza sahası kalabalık!', '{ad} köşe bayrağına koştu, korneri kendisi kullanacak!'],
  intro_vole: ['Top ceza sahası dışına sekti… {ad} bekliyor!', 'Uzaklaştırılan top havada… {ad} gözünü topa dikti!'],
  intro_arkadirek: ['{arkadas} kanattan çevirecek… {ad} arka direkte unutuldu!', 'Orta ön direği geçebilir… arka direkte {ad} tek başına!'],
  intro_balik: ['{arkadas} çizgiye indi, sert ve alçak çevirecek…', 'Alçak orta geliyor! {ad} kendini atacak mı?'],
  goal_kosevurusu: [
    'GOL! {ad} korneri harika kullandı, top ağlarda!',
    'Kornerden GOL! Ceza sahasında karambol ve top filelerde!',
  ],
  goal_vole: [
    'VOLEEE VE GOL! {ad} topu yere düşürmeden vurdu!',
    'GOOOL! Ne vuruş! {ad} voleyle ağları havalandırdı!',
    'GOL! {ad} müthiş bir vole vurdu, {kaleci} sadece izledi!',
  ],
  goal_arkadirek: [
    'Arka direkte {ad}! Ve GOL!',
    'GOOOL! {ad} arka direkte boş kaldı ve affetmedi!',
  ],
  goal_balik: [
    'BALIKLAMA GOL! {ad} kendini attı, top ağlarda!',
    'GOOOL! {ad} uzanarak kafayı vurdu, muhteşem gol!',
  ],
  goal_uzuntop: [
    'GOL! {ad} kaleciden önce davrandı ve topu ağlara gönderdi!',
    'GOOOL! {ad} hız yarışını kazandı, {kaleci} geç kaldı!',
  ],
  goal_duvar: [
    'VER-KAÇ VE GOL! {ad} ile {arkadas} savunmayı ikiye böldü!',
    'GOOOL! Harika bir paslaşma, {ad} bitirdi!',
  ],
  goal_kapma: [
    'ARAYA GİRDİ VE GOL! {ad} geri pası okudu, affetmedi!',
    'GOOOL! {defans} hata yaptı, {ad} cezayı kesti!',
  ],
  goal_donen: [
    'GOL! Dönen topa ilk yetişen {ad}! Ağlar havalandı!',
    'GOOOL! {kaleci} ilk şutu çıkardı ama {ad} ikinci topu affetmedi!',
  ],
  goal_yerden: [
    'GOL! {arkadas} yerden çevirdi, {ad} ilk vuruşta ağlara gönderdi!',
    'GOOOL! Kesme ortaya tek dokunuş, {ad} bitirdi!',
  ],
  goal_uclu: [
    'GOL! Tek dokunuşlarla gelen bir atak, {ad} noktayı koydu!',
    'GOOOL! {ad}, {arkadas} ve takım arkadaşları… pas pas pas, gol!',
  ],
  goal_pres: [
    'PRESTEN GOL! {ad} topu kaptı ve affetmedi!',
    'GOOOL! {ad} topu rakipten çaldı ve ağlara gönderdi!',
  ],
  goal_birebir: [
    'GOL! {ad} kaleciyle karşı karşıya kaldı ve affetmedi!',
    'GOOOL! {ad} birebirde {kaleci} karşısında çok sakin!',
  ],
  assist: [
    'GOL! {ad} harika bir pas verdi, {arkadas} tamamladı!',
    'GOOOL! Asist {ad:abl}, golü atan {arkadas}!',
  ],
  saved: [
    'Ve {kaleci} çıkardı! Eldivenlerine sağlık!',
    'Kurtarış! {kaleci} yerinde, pozisyon sonuçsuz!',
    '{ad} vurdu… {kaleci} izin vermedi!',
  ],
  saved_corner: [
    'Uzandı {kaleci}! Parmak uçlarıyla kornere çeldi!',
    'Müthiş kurtarış! {kaleci} topu köşeden çıkardı, korner!',
    '{ad} çok sert vurdu, {kaleci} uçtu ve kornere gönderdi!',
  ],
  saved_hold: [
    '{kaleci} topu iki eliyle kucakladı, tehlike yok.',
    'Şut kalecinin üzerine, {kaleci} rahat kontrol etti.',
  ],
  miss: [
    'Auta gitti! {ad} bu kez çerçeveyi bulamadı.',
    'Dışarıda! {ad} vurdu ama top kaleyi bulmadı.',
    'Kaçtı! İsabet yok, top auta çıktı.',
  ],
  miss_near: [
    'AZ FARKLA DIŞARIDA! Top direğin hemen yanından auta çıktı!',
    'Ooo! Santimlerle dışarı! {ad} direği yaladı!',
    'Az kaldı! Top kaleyi ıskaladı, {kaleci} çok şanslı!',
  ],
  over: [
    'Üstten aut! {ad} topun altına girdi.',
    'Üstten dışarı! Şut çok sert, isabet yok.',
  ],
  post: [
    'DİREK! Top direkten döndü!',
    'Direkten döndü! {rakip} bu kez kurtuldu!',
    'Olamaz! {ad} direği buldu, top oyun alanına döndü!',
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
    '{ad} çok iyi pas verdi ama {arkadas} vuruşta isabeti bulamadı!',
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
    'GOL! {takim} golü buldu! Skor {skor}!',
    'GOOOL {takim:abl}! Skor tabelası {skor}!',
  ],
  oppGoal: [
    'Gol {rakip:abl}. Skor {skor}.',
    '{rakip} golü buldu. Skor {skor}.',
  ],
  latePressure: [
    'Son dakikalara girdik! {takim} tüm hatlarıyla rakip yarı sahaya yüklendi!',
    'Zaman daralıyor! {takim} gol için baskı kuruyor!',
  ],
  halftime: [
    'Hakem ilk yarıyı bitirdi. Skor {skor}.',
    'İlk 45 dakika sona erdi, takımlar soyunma odasına gidiyor. Skor {skor}.',
  ],
  fulltime: [
    'Ve maç sona erdi! Skor {skor}.',
    'Son düdük çaldı! Karşılaşma {skor} sona erdi.',
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
  kapma: [
    ['{rakip} geriden çıkmaya çalışıyor…', '{defans} topla, önünde kimse yok gibi…', '{ad} pas yolunu kolluyor!'],
    ['{defans} baskı altında…', 'Kaleciye dönmek istiyor…', '{ad} pusuda!'],
  ],
  donen: [
    ['{arkadas} ceza sahası dışından vurdu…', '{kaleci} uzandı, çeldi!', 'Top ceza sahasında sahipsiz!'],
    ['Karambol! Şut…', '{kaleci} çıkardı!', 'İkinci top {ad:dat} doğru!'],
  ],
  yerden: [
    ['{arkadas} kanatta adamını geçti…', 'Çizgiye kadar indi…', 'Yerden sert ortaladı!'],
    ['Top sağ kanatta…', '{arkadas} kafasını kaldırdı…', 'Kesme orta! {ad} hareketlendi!'],
  ],
  uclu: [
    ['{takim} sabırla paslaşıyor…', 'Tek dokunuş, tek dokunuş…', 'Top {ad:loc}, yanında iki arkadaşı!'],
    ['Orta sahada üçgen kuruldu…', '{arkadas} hazır…', '{ad} paslaşarak ilerleyecek!'],
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
  for (const [k, L] of Object.entries(PRE)) L.forEach((t, i) => out.push({ id: `pre_${k}_${i + 1}`, text: t }));
  for (const r of ['W', 'D', 'L']) FT[r].forEach((t, i) => out.push({ id: `ft_${r}_${i + 1}`, text: t }));
  out.push({ id: 'ft_skor', text: FT.skor });
  NUM.forEach((t, i) => out.push({ id: `num_${i}`, text: t }));
  for (const [k, seqs] of Object.entries(BUILD)) seqs.forEach((seq, si) => seq.forEach((t, i) => out.push({ id: `build_${k}_${si + 1}_${i + 1}`, text: t })));
  return out;
}
