// Hikâye senaryoları: tek seferlik olaylar + birkaç bölümlük zincirleme hikâyeler.
// Temalar: kulüp içi dram, özel hayat, medya & şöhret.
// Kişiler kurgusal (Barış Kocaman, Tolga, Lara Ses, Cengiz Demirel...). Gerçek isimler sadece olumlu olaylarda geçer.
import { clamp, pick, randInt, money, addInbox, overall } from './engine.js';
import { ek } from './news.js';
import * as Fam from './family.js';

const ABS = (s) => s.season.year * 60 + s.season.week;
const first = (n) => (n || '').split(' ')[0];
const lastN = (n) => (n || '').split(' ').slice(-1)[0];
const mate = (state) => {
  const sq = state.teams[state.player.clubId]?.squad || [];
  const me = `${state.player.name} ${state.player.surname}`;
  const xs = sq.filter((x) => x.name !== me);
  return xs.length ? pick(xs).name : 'Takım arkadaşın';
};
const AGENT = 'Cengiz Demirel';
const RIVAL = 'Barış Kocaman';
const FRIEND = 'Tolga';
const INFLU = 'Lara Ses';
const BRAND = 'Zirve Spor';

// ask: haftalık maaşa göre makul para miktarı
const ask = (p, a, b) => Math.round(clamp(p.contract.wage * randInt(a, b), 20_000, 25_000_000) / 1000) * 1000;

// ---------------------------------------------------------------------------
// TEK SEFERLİK OLAYLAR
// her biri: (state) => olay | null (koşul tutmazsa null)
// seçenek: { label, fx, result, odds?: {p, win:{fx,result,next?}, lose:{fx,result,next?}}, next? }
// ---------------------------------------------------------------------------
const SINGLES = {
  // ---------- kulüp içi ----------
  birthday(state) {
    const m = mate(state);
    return {
      title: '🎂 Soyunma odasında doğum günü', photo: 'cheer',
      text: `Bugün ${ek(m, 'gen')} doğum günü. Takım sürpriz pasta hazırlıyor, sen de bir şey yapacak mısın?`,
      options: [
        { label: `Hediye al (${money(ask(state.player, 1, 2))})`, fx: { money: -ask(state.player, 1, 2), team: 7 }, result: `${first(m)} hediyeye bayıldı, soyunma odası bayram yeri.` },
        { label: 'Pastayı yüzüne bas!', odds: { p: 0.65, win: { fx: { team: 9, morale: 3 }, result: 'Herkes kahkahadan yerlere yattı. Video takım hesabında paylaşıldı.' }, lose: { fx: { team: -4, coach: -3 }, result: 'Pasta hocanın takımına da sıçradı. Pek gülen olmadı.' } } },
        { label: 'Sadece tebrik et', fx: { team: 1 }, result: 'Kısa ve öz bir tebrik.' },
      ],
    };
  },
  tactic_meeting() {
    return {
      title: '📋 Video analiz toplantısı', face: 'coach',
      text: 'Hoca, rakibin savunma zaaflarını anlatırken sana soru soruyor: "Sen olsan bu boşluğu nasıl kullanırsın?"',
      options: [
        { label: 'Detaylı cevap ver', fx: { coach: 6, stat: 'pas' }, result: 'Hoca başını salladı: "İşte bunu istiyorum."' },
        { label: 'Şakayla geçiştir', odds: { p: 0.4, win: { fx: { team: 5 }, result: 'Takım güldü, hoca da gülümsedi.' }, lose: { fx: { coach: -6 }, result: 'Hoca: "Burası komedi kulübü değil."' } } },
        { label: '"Bilmiyorum hocam"', fx: { coach: -2 }, result: 'Hoca bir sonraki oyuncuya döndü.' },
      ],
    };
  },
  academy_visit(state) {
    return {
      title: '⚽ Altyapı ziyareti', photo: 'training',
      text: 'Kulübün U14 takımı seni antrenmanlarına davet ediyor. Çocuklar posterini dolabına asmış.',
      options: [
        { label: 'Git, birlikte antrenman yap', fx: { energy: -10, fans: 5, fame: 1, morale: 4 }, result: 'Çocuklardan biri sana çalım attı. Yıllar sonra onu hatırlayacaksın.' },
        { label: 'İmzalı forma gönder', fx: { fans: 2 }, result: 'Formalar dağıtıldı, teşekkür videosu geldi.' },
        { label: 'Vaktim yok', fx: { fans: -2 }, result: 'Kulüp sosyal medyası etkinliği sensiz paylaştı.' },
      ],
    };
  },
  president_dinner(state) {
    const p = state.player;
    if (p.fame < 25) return null;
    return {
      title: '🍽️ Başkanla akşam yemeği', photo: 'press',
      text: 'Kulüp başkanı seni yemeğe çağırdı. Sohbet bir yerde sözleşmene geliyor: "Seni uzun vadede burada görmek istiyoruz."',
      options: [
        { label: '"Ben de burada mutluyum"', fx: { coach: 3, fans: 4 }, result: 'Başkan memnun. Basına "o bizim geleceğimiz" dedi.' },
        { label: '"Teklifleri de dinliyorum"', fx: { fame: 2, fans: -4, coach: -2 }, result: 'Başkanın yüzü düştü. Ertesi gün manşetlerde: "Ayrılık sinyali!"' },
        { label: 'Lafı menajerine bırak', fx: {}, result: `${AGENT}: "Doğru yaptın, bu işler bende."` },
      ],
    };
  },
  newcomer(state) {
    return {
      title: '🧳 Yeni transfer yalnız', photo: 'airport',
      text: 'Takıma yeni katılan yabancı oyuncu dil bilmiyor, yemekte hep tek başına oturuyor.',
      options: [
        { label: 'Masana davet et', fx: { team: 6, morale: 2 }, result: 'Birkaç kelime Türkçe öğrettin. İlk kelimesi "abi" oldu.' },
        { label: 'Şehri gezdir', fx: { team: 8, energy: -8 }, result: 'Boğaz turu, balık ekmek… Artık en yakın arkadaşın.' },
        { label: 'Kendi işine bak', fx: { team: -2 }, result: 'Yabancı oyuncu ilk ay zorlandı.' },
      ],
    };
  },
  bus_late() {
    return {
      title: '🚌 Takım otobüsü kaçtı', photo: 'airport',
      text: 'Alarm çalmadı! Deplasman otobüsü 10 dakika önce kalktı.',
      options: [
        { label: `Taksiyle yetiş (${money(4_000)})`, fx: { money: -4_000, coach: -2 }, result: 'Son anda yetiştin. Hoca saatine baktı ama bir şey demedi.' },
        { label: 'Hocayı ara, özür dile', odds: { p: 0.55, win: { fx: { coach: -1 }, result: 'Hoca: "Bir daha olmasın." Otobüs seni bekledi.' }, lose: { fx: { coach: -7, bench: true }, result: 'Hoca: "Kurallar herkes için." Bu hafta yedeksin.' } } },
      ],
    };
  },
  injured_mate(state) {
    const m = mate(state);
    return {
      title: '🏥 Sakat arkadaş', photo: 'injury',
      text: `${m} çapraz bağ ameliyatı oldu, aylarca yok. Hastanede canı sıkkın.`,
      options: [
        { label: 'Ziyaret et, moral ver', fx: { team: 6, morale: 2, energy: -5 }, result: `${first(m)}: "Döndüğümde ilk golü sana pasla atacağım."` },
        { label: 'Golünü ona adamaya söz ver', fx: { team: 4, fans: 3 }, result: 'Taraftarlar bu sözü çok sevdi.' },
        { label: 'Mesaj at yeter', fx: { team: 1 }, result: 'Kısa bir "geçmiş olsun".' },
      ],
    };
  },
  camp_room() {
    return {
      title: '🏨 Kamp odası', photo: 'tunnel',
      text: 'Kampta oda arkadaşın gece boyunca horluyor. Sabah antrenmanı 08.00\'de.',
      options: [
        { label: 'Malzemeciden kulak tıkacı iste', fx: { energy: 5 }, result: 'Mis gibi uyudun.' },
        { label: 'Lobide kanepede uyu', fx: { energy: -10, team: 2 }, result: 'Boynun tutuldu ama kimse kırılmadı.' },
        { label: 'Odayı değiştirmek için hocaya git', fx: { coach: -2, energy: 8, team: -3 }, result: 'Oda değişti, dedikodu da başladı.' },
      ],
    };
  },
  dressing_prank() {
    return {
      title: '🧦 Kayıp kramponlar', photo: 'training',
      text: 'Antrenmandan önce kramponların ortadan kayboldu. Herkes masum masum bakıyor.',
      options: [
        { label: 'Sen de intikam şakası hazırla', odds: { p: 0.6, win: { fx: { team: 7, morale: 3 }, result: 'Şakan efsane oldu, soyunma odasında hâlâ konuşuluyor.' }, lose: { fx: { coach: -4, team: 2 }, result: 'Şaka hocanın arabasına denk geldi…' } } },
        { label: 'Yedek kramponla çık', fx: { stat: 'teknik', energy: -5 }, result: 'Bir numara küçük kramponla top sürmek tekniğine iyi geldi.' },
        { label: 'Bağır çağır', fx: { team: -5 }, result: 'Kimse itiraf etmedi, hava gerildi.' },
      ],
    };
  },
  // ---------- özel hayat ----------
  mother_birthday(state) {
    const c = ask(state.player, 1, 3);
    return {
      title: '💐 Annenin doğum günü', face: 'mother',
      text: 'Yarın annenin doğum günü. Kardeşin aradı: "Unutmadın değil mi?"',
      options: [
        { label: `Sürpriz yap (${money(c)})`, fx: { money: -c, family: 10, morale: 4 }, result: 'Annen ağladı, sonra herkese videosunu yolladı.' },
        { label: 'Görüntülü ara', fx: { family: 4 }, result: 'Uzun uzun konuştunuz, yemek tarifleri bile verdi.' },
        { label: 'Antrenman var, sonra ararım', fx: { family: -8 }, result: 'Annen "olsun oğlum" dedi ama sesi buruktu.' },
      ],
    };
  },
  father_health(state) {
    const c = ask(state.player, 2, 5);
    return {
      title: '🩺 Babanın kontrolü', face: 'father',
      text: 'Babanın tansiyonu yükselmiş. Doktor özel hastanede kapsamlı kontrol öneriyor.',
      options: [
        { label: `Masrafı karşıla (${money(c)})`, fx: { money: -c, family: 10 }, result: 'Kontroller temiz çıktı. Baban "Boşuna para harcadın" diye söylendi ama gururlu.' },
        { label: 'Devlet hastanesine git desinler', fx: { family: -3 }, result: 'Randevu üç ay sonraya verildi.' },
      ],
    };
  },
  nutrition(state) {
    const c = ask(state.player, 1, 3);
    return {
      title: '🥗 Beslenme uzmanı', photo: 'training',
      text: 'Ünlü bir diyetisyen sana özel program önerdi. Şeker yok, hamur yok, gece atıştırmalığı yok.',
      options: [
        { label: `Programa başla (${money(c)})`, fx: { money: -c, energy: 15, stat: 'hiz' }, result: 'İki haftada kendini tüy gibi hissettin.' },
        { label: 'Annemin yemekleri yeter', fx: { family: 2, morale: 2 }, result: 'Mantı her şeye bedel.' },
      ],
    };
  },
  insomnia() {
    return {
      title: '🌙 Uykusuz gece', photo: 'empty',
      text: 'Büyük maçtan önce uyuyamıyorsun. Saat gece 3 ve telefon elinde.',
      options: [
        { label: 'Telefonu bırak, nefes egzersizi', fx: { energy: 5, morale: 1 }, result: 'Bir süre sonra uyuyakaldın.' },
        { label: 'Maç videoları izle', fx: { energy: -8, stat: 'teknik' }, result: 'Kalecinin zayıf köşesini buldun ama gözlerin kan çanağı.' },
        { label: 'Sosyal medyada gez', fx: { energy: -12, morale: -3 }, result: 'Yorumları okumamalıydın…' },
      ],
    };
  },
  pet(state) {
    if (state.player.hasPet) return null;
    return {
      title: '🐶 Sokak köpeği', photo: 'rain',
      text: 'Antrenman çıkışı yağmurda titreyen bir yavru köpek peşine takıldı.',
      options: [
        { label: 'Sahiplen', fx: { morale: 6, fans: 4, pet: true }, result: 'Adını "Penaltı" koydun. Fotoğrafı internette rekor beğeni aldı.' },
        { label: 'Barınağa götür, masraflarını üstlen', fx: { money: -5_000, fans: 2, morale: 2 }, result: 'Barınak teşekkür mesajı yayınladı.' },
        { label: 'Yoluna devam et', fx: { morale: -2 }, result: 'O gece aklından çıkmadı.' },
      ],
    };
  },
  cousin_wedding(state) {
    return {
      title: '💒 Kuzenin düğünü', photo: 'wedding',
      text: 'Kuzenin cumartesi evleniyor. Maç pazar günü. Halaya kalkmazsan küserler.',
      options: [
        { label: 'Git ve halay çek!', fx: { family: 10, energy: -20, coach: -3 }, result: 'Halayın başında mendil salladın. Videosu taraftar sayfalarında.' },
        { label: 'Takı gönder, gitme', fx: { money: -ask(state.player, 1, 2), family: 3 }, result: 'Takı beğenildi ama halan "gelmedi" diye söylendi.' },
        { label: 'Kampa sadık kal', fx: { family: -6, coach: 4 }, result: 'Hoca profesyonelliğini fark etti.' },
      ],
    };
  },
  neighborhood_match() {
    return {
      title: '🏚️ Mahalle maçı', photo: 'fans',
      text: 'Çocukluğunun geçtiği mahallede halı saha turnuvası var. Eski arkadaşlar seni de takıma yazmış.',
      options: [
        { label: 'Oyna, eğlen', odds: { p: 0.8, win: { fx: { fans: 6, morale: 6, energy: -10 }, result: 'Hat-trick yaptın, mahalle yıkıldı.' }, lose: { fx: { injury: 1, coach: -6 }, result: 'Halı sahada bileğin burkuldu. Hoca çıldırdı.' } } },
        { label: 'Sadece seyret, kupa ver', fx: { fans: 3, morale: 3 }, result: 'Kupayı sen verdin, herkes fotoğraf istedi.' },
      ],
    };
  },
  driving_license() {
    return {
      title: '🚦 Hız cezası', photo: 'paparazzi',
      text: 'Otoyolda hız sınırını aştın, trafik polisi çevirdi. Seni tanıdı…',
      options: [
        { label: 'Cezayı öde, özür dile', fx: { money: -9_000, fans: 2 }, result: 'Polis cezayı yazdı, sonra fotoğraf istedi.' },
        { label: '"Ben kimim biliyor musun?"', fx: { fans: -10, fame: 2, coach: -4 }, result: 'Polis kamerası her şeyi kaydetmişti. Akşam haberlerindesin.' },
      ],
    };
  },
  // ---------- medya & şöhret ----------
  tv_show(state) {
    if (state.player.fame < 20) return null;
    return {
      title: '📺 Gece programı daveti', photo: 'press',
      text: 'Popüler bir gece şovu seni konuk etmek istiyor. Program maç gününden bir gün önce.',
      options: [
        { label: 'Katıl, esprili ol', odds: { p: 0.65, win: { fx: { fame: 4, fans: 5, energy: -10 }, result: 'Stüdyo kahkahaya boğuldu, kesitler viral oldu.' }, lose: { fx: { fame: 2, fans: -4, energy: -10 }, result: 'Bir esprin yanlış anlaşıldı, rakip taraftarlar ayakta.' } } },
        { label: 'Maçtan sonraya ertele', fx: { coach: 2 }, result: 'Program "maçtan sonra bekleriz" dedi.' },
        { label: 'Reddet', fx: {}, result: 'Odaklanma zamanı.' },
      ],
    };
  },
  podcast() {
    return {
      title: '🎙️ Podcast', photo: 'podcast',
      text: 'Gençler arasında popüler bir futbol podcast\'i seni üç saatlik sohbete çağırıyor.',
      options: [
        { label: 'Kariyerini anlat', fx: { fans: 5, fame: 2, energy: -6 }, result: 'Altyapı hikâyelerin çok sevildi.' },
        { label: 'Hocayı eleştir', fx: { fame: 4, coach: -12, fans: 2 }, result: 'Kesit tüm spor sayfalarında. Hoca hiç memnun değil.' },
        { label: 'Katılma', fx: {}, result: '' },
      ],
    };
  },
  fan_group(state) {
    return {
      title: '📣 Taraftar grubu', photo: 'fans',
      text: 'Kulübün tribün grubu seni yemeğe çağırıyor. Bazı üyeleri başkanla kavgalı.',
      options: [
        { label: 'Git, beraber marş söyle', fx: { fans: 10, coach: -2 }, result: 'Artık tribünün çocuğusun. Yönetim pek hoşnut değil.' },
        { label: 'Atkı imzala, gönder', fx: { fans: 4 }, result: 'İmzalı atkılar tribünde açıldı.' },
        { label: 'Siyasete girmem', fx: { fans: -3, coach: 2 }, result: 'Tribün "bizden değil" diye homurdandı.' },
      ],
    };
  },
  autograph(state) {
    return {
      title: '✍️ İmza günü', photo: 'fans',
      text: 'AVM\'de imza günü düzenleniyor. Sıra kapıya kadar uzamış, iki saat sürer.',
      options: [
        { label: 'Herkesi imzala', fx: { fans: 8, fame: 2, energy: -12 }, result: 'Son çocuğa kadar imzaladın. Bileğin ağrıyor ama değdi.' },
        { label: 'Bir saat dur, çık', fx: { fans: 2, energy: -5 }, result: 'Sıradakiler hayal kırıklığına uğradı.' },
      ],
    };
  },
  game_cover(state) {
    if (state.player.fame < 70) return null;
    const c = ask(state.player, 8, 15);
    return {
      title: '🎮 Video oyunu kapağı', photo: 'champions',
      text: 'Bir futbol oyununun yeni sürümü kapak yüzü olarak seni istiyor.',
      options: [
        { label: `Kabul et (+${money(c)})`, fx: { money: c, fame: 6, fans: 4 }, result: 'Kapak çıktı! Kendinle oynamak garip bir his.' },
        { label: 'Reddet, "kapak laneti" var', fx: { morale: 1 }, result: 'Batıl inanç mı, akıl mı? Kim bilir.' },
      ],
    };
  },
  fake_news(state) {
    return {
      title: '📰 Uydurma transfer haberi', photo: 'press',
      text: 'Bir site, ezeli rakibe gizlice imza attığını yazdı. Taraftarlar öfkeli.',
      options: [
        { label: 'Sert yalanlama yap', fx: { fans: 5 }, result: 'Kulüp de açıklamanı paylaştı, haber kaldırıldı.' },
        { label: 'Avukata ver', fx: { money: -15_000, fans: 3, fame: 1 }, result: 'Site tekzip yayınlamak zorunda kaldı.' },
        { label: 'Hiç cevap verme', fx: { fans: -6 }, result: 'Sessizliğin "kabul" diye yorumlandı.' },
      ],
    };
  },
  challenge(state) {
    return {
      title: '📱 Sosyal medya akımı', photo: 'cheer',
      text: `${INFLU} seni "kafa topu akımı"na etiketledi. Milyonlarca kişi izliyor.`,
      options: [
        { label: 'Katıl, rekor dene', odds: { p: 0.5, win: { fx: { fame: 5, fans: 6 }, result: '214 kafa! Rekor senin.' }, lose: { fx: { fame: 2, fans: 1 }, result: '17\'de düşürdün ama komik montaj tuttu.' } } },
        { label: 'Takımı da kat', fx: { team: 6, fame: 2 }, result: 'Takımca çekilen video kulüp hesabında patladı.' },
        { label: 'Görmezden gel', fx: {}, result: '' },
      ],
    };
  },
  charity_match(state) {
    if (state.player.fame < 30) return null;
    return {
      title: '🤝 Hayır maçı', photo: 'fans',
      text: 'Deprem bölgesindeki okullar için yıldızlar karması maç yapıyor. Davetlisin.',
      options: [
        { label: 'Oyna ve prim bağışla', fx: { money: -ask(state.player, 2, 4), fans: 8, fame: 3, energy: -10 }, result: 'Tribünler doldu, okul inşaatı başladı.' },
        { label: 'Sadece bağış yap', fx: { money: -ask(state.player, 1, 3), fans: 4 }, result: 'Bağışın teşekkür listesinde.' },
        { label: 'Katılamam', fx: { fans: -3 }, result: '' },
      ],
    };
  },
  // ---------- aile ----------
  anniversary(state) {
    const p = state.player, pt = p.partner;
    if (!pt?.married) return null;
    const c = ask(p, 2, 5), pn = first(pt.name);
    return {
      title: '💐 Evlilik yıl dönümü', face: 'partner' + (pt.portrait ?? 0),
      text: `Bugün ${ek(pn, 'dat')} evlendiğiniz günün yıl dönümü. Takvimine bakınca fark ettin…`,
      options: [
        { label: `Sürpriz akşam yemeği (${money(c)})`, fx: { money: -c, partner: 12, morale: 4 }, result: `${pn} gözyaşlarını tutamadı.` },
        { label: 'Çiçek ve kart', fx: { money: -2_000, partner: 5 }, result: 'Kartı buzdolabının üstüne astı.' },
        { label: 'Antrenman var, sonra kutlarız', fx: { partner: -12 }, result: `${pn}: "Yine mi futbol?"` },
      ],
    };
  },
  in_laws(state) {
    const pt = state.player.partner;
    if (!pt?.married) return null;
    return {
      title: '🧳 Kayınvalide geliyor', face: 'partner' + (pt.portrait ?? 0),
      text: 'Kayınvaliden "bir haftalığına" kalmaya geliyor. Bavullar bir aylık gibi görünüyor.',
      options: [
        { label: 'Güler yüzle ağırla', fx: { partner: 8, energy: -8, morale: -2 }, result: 'Kayınvaliden herkese seni övüyor.' },
        { label: 'Otel ayarla', fx: { money: -ask(state.player, 1, 2), partner: -4 }, result: 'Kibarca otele yerleştirdin. Eşin biraz bozuldu.' },
        { label: 'Deplasmanı bahane et, kaç', fx: { partner: -10, coach: 2 }, result: 'Kaçtın ama dönünce soğuk savaş başladı.' },
      ],
    };
  },
  away_much(state) {
    const pt = state.player.partner;
    if (!pt?.married || state.player.fame < 25) return null;
    const pn = first(pt.name);
    return {
      title: '🏠 Evde yalnızlık', face: 'partner' + (pt.portrait ?? 0),
      text: `Kamp, deplasman, reklam çekimi… ${pn} artık evde seni hiç göremediğini söylüyor.`,
      options: [
        { label: 'Bir hafta sonu tamamen ona ayır', fx: { partner: 12, energy: 8, coach: -2 }, result: 'Telefonu kapattın, sadece ikiniz.' },
        { label: '"Kariyerimin zirvesindeyim"', fx: { partner: -12, morale: -2 }, result: `${pn} kapıyı çarptı.` },
        { label: 'Seyahatlere onu da götür', fx: { money: -ask(state.player, 1, 3), partner: 8 }, result: 'Deplasman otellerinde birlikte kahvaltı.' },
      ],
    };
  },
  jealous(state) {
    const pt = state.player.partner;
    if (!pt) return null;
    const pn = first(pt.name);
    return {
      title: '📱 Kıskançlık krizi', face: 'partner' + (pt.portrait ?? 0),
      text: `Bir hayranın fotoğrafının altına attığın kalp emojisi ${ek(pn, 'gen')} gözünden kaçmadı.`,
      options: [
        { label: 'Hemen açıkla, telefonu göster', fx: { partner: 3 }, result: 'Yanlış anlaşılma çözüldü.' },
        { label: '"Abartıyorsun"', odds: { p: 0.4, win: { fx: { partner: -2 }, result: 'Bir gün küs kaldı, sonra geçti.' }, lose: { fx: { partner: -14, morale: -4 }, result: 'Kavga büyüdü, magazin de duydu.' } } },
        { label: 'Hesabı kapat', fx: { partner: 6, fans: -3 }, result: 'Sosyal medyaya ara verdin.' },
      ],
    };
  },
  child_birthday(state) {
    const kids = (state.player.children || []).filter((c) => !c.exOf && Fam.childAge(state, c) >= 1 && Fam.childAge(state, c) <= 12);
    if (!kids.length) return null;
    const c = pick(kids), a = Fam.childAge(state, c), cost = ask(state.player, 1, 3);
    return {
      title: `🎈 ${c.name} ${a} yaşında!`, photo: 'cheer',
      text: `${ek(c.name, 'gen')} doğum günü partisi bu hafta sonu. Maç da cumartesi…`,
      options: [
        { label: `Büyük parti (${money(cost)})`, fx: { money: -cost, child: { name: c.name, rel: 10 }, morale: 5 }, result: 'Palyaço, pasta, top havuzu. Mutluluk!' },
        { label: 'Maçtan sonra yetiş', fx: { child: { name: c.name, rel: 4 }, energy: -5 }, result: 'Mumları üflerken yanındaydın.' },
        { label: 'Hediyesini gönder', fx: { child: { name: c.name, rel: -6 } }, result: `${c.name} "babam neden gelmedi" diye sordu.` },
      ],
    };
  },
  child_sick(state) {
    const kids = (state.player.children || []).filter((c) => !c.exOf && Fam.childAge(state, c) <= 10);
    if (!kids.length) return null;
    const c = pick(kids);
    return {
      title: `🤒 ${c.name} hasta`, photo: 'injury',
      text: `${c.name} gece yükselen ateşle hastaneye kaldırıldı. Yarın sabah önemli bir antrenman var.`,
      options: [
        { label: 'Hastanede sabahla', fx: { child: { name: c.name, rel: 8 }, energy: -20, family: 4 }, result: 'Sabah ateşi düştü, ilk gördüğü sendin.' },
        state.player.partner
          ? { label: 'Eşine bırak, antrenmana git', fx: { coach: 3, partner: -6, child: { name: c.name, rel: -3 } }, result: 'Antrenmanda aklın hep hastanedeydi.' }
          : { label: 'Bakıcıya bırak, antrenmana git', fx: { coach: 3, child: { name: c.name, rel: -5 } }, result: 'Antrenmanda aklın hep hastanedeydi.' },
      ],
    };
  },
  child_football(state) {
    const kids = (state.player.children || []).filter((c) => c.gender === 'e' && Fam.childAge(state, c) >= 6 && Fam.childAge(state, c) <= 14);
    if (!kids.length) return null;
    const c = pick(kids);
    return {
      title: `⚽ ${c.name} topla yatıp kalkıyor`, photo: 'family',
      text: `${c.name} bahçede sabahtan akşama top sektiriyor. "Baba, ben de senin gibi olacağım!"`,
      options: [
        { label: 'Futbol okuluna yazdır', fx: { money: -ask(state.player, 1, 2), child: { name: c.name, rel: 6, talent: 2 } }, result: 'Antrenörü "bu çocukta iş var" diyor.' },
        { label: 'Her akşam birlikte çalışın', fx: { energy: -8, child: { name: c.name, rel: 10, talent: 1 } }, result: 'Sol ayağını da kullanmaya başladı.' },
        { label: '"Önce dersler"', fx: { child: { name: c.name, rel: -2 }, family: 2 }, result: 'Annesi bu karara çok sevindi.' },
      ],
    };
  },
  child_school(state) {
    const kids = (state.player.children || []).filter((c) => !c.exOf && Fam.childAge(state, c) >= 6 && Fam.childAge(state, c) <= 17);
    if (!kids.length) return null;
    const c = pick(kids);
    return {
      title: `🏫 ${ek(c.name, 'gen')} okul gösterisi`, photo: 'fans',
      text: `${c.name} okul gösterisinde sahneye çıkacak. Saat, maç öncesi kampla çakışıyor.`,
      options: [
        { label: 'Hocadan izin iste, git', odds: { p: 0.6, win: { fx: { child: { name: c.name, rel: 10 }, coach: -1 }, result: 'En önde oturdun, el salladı.' }, lose: { fx: { coach: -6, child: { name: c.name, rel: 8 } }, result: 'Hoca izin vermedi ama yine de gittin…' } } },
        { label: 'Videosunu iste', fx: { child: { name: c.name, rel: -4 } }, result: 'Videoyu otobüste izledin.' },
      ],
    };
  },
  visitation(state) {
    const kids = (state.player.children || []).filter((c) => c.exOf && Fam.childAge(state, c) < 18);
    if (!kids.length) return null;
    const c = pick(kids);
    return {
      title: `👨‍👧 Velayet hafta sonu`, photo: 'family',
      text: `Bu hafta sonu ${c.name} sende kalacak. Ama hafta sonu deplasman var.`,
      options: [
        { label: 'Maça birlikte götür', fx: { child: { name: c.name, rel: 10 }, energy: -6 }, result: 'Tribünden en yüksek sesi o çıkardı.' },
        { label: 'Hafta sonunu ertele', fx: { child: { name: c.name, rel: -8 }, morale: -3 }, result: 'Telefondaki sessizliği unutamadın.' },
      ],
    };
  },
  magazine_interview(state) {
    if (!state.player.partner) return null;
    const pn = first(state.player.partner.name);
    return {
      title: '📸 Magazin röportajı', photo: 'paparazzi', face: 'partner' + (state.player.partner.portrait ?? 0),
      text: `Bir magazin dergisi seninle ${ek(pn, 'gen')} kapak çekimi yapmak istiyor.`,
      options: [
        { label: 'Birlikte poz verin', fx: { fame: 4, partner: 8, coach: -2 }, result: 'Kapak çok konuşuldu. Hoca "futbola odaklan" dedi.' },
        { label: 'Özel hayatımız bize', fx: { partner: 3 }, result: `${pn} bu tavrına saygı duydu.` },
      ],
    };
  },
};

// ---------------------------------------------------------------------------
// ZİNCİRLEME HİKÂYELER
// start(state) koşulu tutarsa ilk bölümü döner. Bölümler STEPS[id][step](state, data).
// ---------------------------------------------------------------------------
const nx = (story, step, a = 2, b = 4, data) => ({ story, step, a, b, data });

const CHAINS = {
  // ---- KULÜP: altyapıdan gelen genç rakip ----
  rival: {
    when: (s) => s.player.age >= 20,
    steps: {
      start: () => ({
        title: '🌟 Altyapıdan yeni yıldız', photo: 'training',
        text: `Hoca, A takıma çıkardığı 17 yaşındaki ${RIVAL} için "Böyle forvet görmedim" dedi. Pozisyonun aynı.`,
        options: [
          { label: 'Ona ağabeylik yap', fx: { team: 5, coach: 3 }, result: `${first(RIVAL)} her antrenmandan sonra yanına geliyor.`, next: nx('rival', 'mentor', 3, 5) },
          { label: 'Antrenmanda ezip geç', fx: { stat: 'sut', energy: -10, team: -3 }, result: 'Antrenmanda ondan iki gol fazla attın. Mesaj alındı.', next: nx('rival', 'feud', 2, 4) },
          { label: 'Umursama', fx: {}, result: 'Kendi işine baktın.', next: nx('rival', 'bench', 3, 6) },
        ],
      }),
      mentor: () => ({
        title: `🤝 ${first(RIVAL)} sana minnettar`, photo: 'cheer',
        text: `${RIVAL} ilk profesyonel sözleşmesini imzaladı ve basına "Her şeyi ağabeyime borçluyum" dedi. Şimdi senden tavsiye istiyor: kendisine menajer arıyor.`,
        options: [
          { label: `${AGENT}'i öner`, fx: { team: 4, money: 25_000 }, result: `${first(AGENT)} sana teşekkür primi gönderdi. ${first(RIVAL)} sağlam ellerde.` },
          { label: '"Önce futbol, sonra para" de', fx: { team: 3, coach: 4, fans: 3 }, result: 'Bu söz kulüp dergisinde manşet oldu.' },
        ],
      }),
      feud: () => ({
        title: `🔥 ${first(RIVAL)} basına konuştu`, photo: 'press',
        text: `${RIVAL}: "Forma kimsenin tapulu malı değil. Bir gün o forma benim olacak."`,
        options: [
          { label: 'Cevap ver: "Önce tıraş olsun"', fx: { fame: 3, fans: 4, coach: -6 }, result: 'Cevabın olay oldu. Hoca ikinizi odasına çağırdı.', next: nx('rival', 'coachcall', 1, 2) },
          { label: 'Sus, sahada göster', fx: { promise: true, coach: 4 }, result: 'Hoca olgunluğunu fark etti. Bu hafta ilk 11 şansın arttı.' },
        ],
      }),
      coachcall: () => ({
        title: '🚪 Hocanın odası', face: 'coach',
        text: 'Hoca ikinizi karşısına aldı: "Bu takımda ego yok. Ya el sıkışırsınız ya ikiniz de tribüne."',
        options: [
          { label: 'Elini sık, sarıl', fx: { team: 8, coach: 6 }, result: 'Gerginlik bitti. Antrenmanda ilk pası ona attın.' },
          { label: 'Elini sık ama soğuk', fx: { coach: 1, team: -2 }, result: 'Buzlar tam erimedi.' },
          { label: '"Ben özür dilemem"', fx: { coach: -12, bench: true }, result: 'Hoca bu hafta seni kadroya almadı.' },
        ],
      }),
      bench: (state) => ({
        title: `🪑 ${first(RIVAL)} forma şansı buldu`, photo: 'tunnel',
        text: `${RIVAL} geçen maç iki gol attı. Gazeteler "yeni ${lastN(state.player.surname)}" diye yazıyor.`,
        options: [
          { label: 'Ekstra antrenmana kal', fx: { stat: 'sut', energy: -15, coach: 5 }, result: 'Antrenman sahasının ışıklarını sen kapattın.' },
          { label: 'Menajerine transfer sor', fx: { coach: -5, fame: 1 }, result: `${first(AGENT)}: "Yaz dönemini bekleyelim, birkaç kapı çalarım."` },
          { label: 'Tebrik et', fx: { team: 5, morale: -2 }, result: 'Centilmenlik herkesin gözünden kaçmadı.' },
        ],
      }),
    },
  },

  // ---- KULÜP: hoca ile kriz ----
  coach_crisis: {
    when: (s) => s.player.rel.coach < 55,
    steps: {
      start: () => ({
        title: '😤 Hoca seni hedef aldı', face: 'coach',
        text: 'Antrenmanda hoca herkesin önünde sana bağırdı: "Bu tempoyla Amatör Lig\'de bile oynayamazsın!"',
        options: [
          { label: 'Odasına git, konuş', odds: { p: (s) => 0.35 + s.player.rel.coach / 200, win: { fx: { coach: 10, promise: true }, result: 'Açık konuştunuz. Hoca: "Senden daha fazlasını beklediğim için."' }, lose: { fx: { coach: -6 }, result: 'Konuşma tartışmaya döndü.', next: nx('coach_crisis', 'ultimatum', 1, 3) } } },
          { label: 'Basına sitem et', fx: { fans: 5, coach: -15 }, result: 'Taraftar yanında ama hoca küplere bindi.', next: nx('coach_crisis', 'fine', 1, 2) },
          { label: 'Sesini çıkarma, çalış', fx: { coach: 3, morale: -3, stat: 'hiz' }, result: 'Kimseye bir şey demedin, sadece koştun.' },
        ],
      }),
      ultimatum: () => ({
        title: '⚠️ Son uyarı', face: 'coach',
        text: 'Hoca: "Ya kurallarıma uyarsın ya da sezon sonuna kadar kulübede oturursun."',
        options: [
          { label: '"Haklısınız hocam"', fx: { coach: 8, morale: -2 }, result: 'Gerilim düştü.' },
          { label: 'Kaptandan arabuluculuk iste', fx: { team: 4, coach: 4 }, result: 'Kaptan ikinizi bir masaya oturttu.' },
          { label: '"Kulübe sizin olsun"', fx: { coach: -15, bench: true, fame: 2 }, result: 'Bu hafta yedeksin. Basın kavgayı duydu bile.', next: nx('coach_crisis', 'board', 2, 3) },
        ],
      }),
      fine: () => ({
        title: '💸 Para cezası', photo: 'press',
        text: 'Kulüp, açıklamaların nedeniyle sana maaşının iki katı para cezası kesti.',
        options: [
          { label: 'Öde, özür dile', fx: { moneyWage: -2, coach: 8 }, result: 'Özrün kabul edildi.' },
          { label: 'İtiraz et', odds: { p: 0.35, win: { fx: { fans: 4, coach: -3 }, result: 'Disiplin kurulu cezayı yarıya indirdi.' }, lose: { fx: { moneyWage: -3, coach: -6 }, result: 'İtirazın reddedildi, ceza arttı.' } } },
        ],
      }),
      board: () => ({
        title: '🏛️ Yönetim devrede', photo: 'press',
        text: 'Başkan seninle hocayı aynı masaya oturtmak istiyor. Bazı yöneticiler hocanın gitmesini istiyor.',
        options: [
          { label: 'Barış için elini uzat', fx: { coach: 15, fans: 3 }, result: 'Hoca: "Geçmiş geçmişte kaldı." Yeni bir sayfa.' },
          { label: '"Ya o ya ben"', odds: { p: 0.3, win: { fx: { coach: 30, fame: 4, fans: -4 }, result: 'Yönetim hocayla yollarını ayırdı! Yeni hoca seninle başlıyor.' }, lose: { fx: { coach: -10, fans: -8, bench: true }, result: 'Yönetim hocanın arkasında durdu. Kulüpte yalnızsın.' } } },
        ],
      }),
    },
  },

  // ---- KULÜP: kaptanlık ----
  captain: {
    when: (s) => s.player.age >= 23 && s.player.rel.coach >= 60 && s.player.rel.team >= 55 && !s.player.captain,
    steps: {
      start: () => ({
        title: '©️ Kaptanlık teklifi', photo: 'captain',
        text: 'Takım kaptanı uzun süre sahalardan uzak kalacak. Hoca pazubandı sana uzatıyor.',
        options: [
          { label: 'Gururla kabul et', fx: { captain: true, fame: 3, team: 4, morale: 6 }, result: 'Pazubant artık kolunda.', next: nx('captain', 'fight', 3, 5) },
          { label: '"Daha deneyimli biri taksın"', fx: { team: 6, coach: 2 }, result: 'Alçakgönüllülüğün soyunma odasında çok sevildi.' },
        ],
      }),
      fight: (state) => ({
        title: '🥊 Soyunma odasında kavga', photo: 'tunnel',
        text: 'Mağlubiyetin ardından iki takım arkadaşın birbirine girdi. Herkes kaptana bakıyor.',
        options: [
          { label: 'Araya gir, konuşma yap', odds: { p: (s) => 0.45 + s.player.rel.team / 200, win: { fx: { team: 10, coach: 4 }, result: 'Konuşman takımı birleştirdi. Bir sonraki maça başka çıktınız.' }, lose: { fx: { team: -6 }, result: 'Kimse seni dinlemedi, kavga büyüdü.' } } },
          { label: 'Hocaya bildir', fx: { coach: 5, team: -6 }, result: 'Hoca ikisini de cezalandırdı. "Ispiyoncu" fısıltıları başladı.' },
          { label: 'Görmezden gel', fx: { team: -4 }, result: 'Kavga kendiliğinden söndü ama sorun bitmedi.' },
        ],
        next: nx('captain', 'return', 4, 7),
      }),
      return: () => ({
        title: '©️ Eski kaptan döndü', photo: 'captain',
        text: 'Eski kaptan sakatlığı atlattı. Pazubant kimde kalacak?',
        options: [
          { label: 'Bandı kendin geri ver', fx: { captain: false, team: 8, fans: 4 }, result: 'Bu jest soyunma odasında unutulmayacak.' },
          { label: 'Kararı hocaya bırak', odds: { p: 0.5, win: { fx: { fame: 2, morale: 4 }, result: 'Hoca: "Pazubant sende kalıyor."' }, lose: { fx: { captain: false, morale: -3 }, result: 'Hoca bandı eski kaptana geri verdi.' } } },
        ],
      }),
    },
  },

  // ---- ÖZEL: eski mahalle arkadaşı ----
  friend: {
    when: (s) => s.player.money > s.player.contract.wage * 8,
    steps: {
      start: (state) => {
        const c = ask(state.player, 4, 8);
        return {
          title: `📞 ${FRIEND} aradı`, photo: 'empty',
          text: `Çocukluk arkadaşın ${FRIEND} iş kurmak için ${money(c)} borç istiyor. "Üç ayda öderim kardeşim."`,
          options: [
            { label: `Ver (${money(c)})`, fx: { money: -c, morale: 2 }, result: `${FRIEND} sana sarıldı.`, next: nx('friend', 'repay', 5, 9, { c }) },
            { label: 'Yarısını ver', fx: { money: -Math.round(c / 2) }, result: `${FRIEND} biraz bozuldu ama kabul etti.`, next: nx('friend', 'repay', 5, 9, { c: Math.round(c / 2) }) },
            { label: 'Kibarca reddet', fx: { morale: -2 }, result: `${FRIEND}: "Tamam kardeşim…" Sesi soğuktu.`, next: nx('friend', 'grudge', 3, 6) },
          ],
        };
      },
      repay: (state, d) => (Math.random() < 0.55 ? {
        title: `☕ ${FRIEND}'nun kafesi açıldı`, photo: 'cheer',
        text: `${FRIEND}'nun kafesi tutuldu! Borcunu faiziyle getirdi, duvara da imzalı formanı astı.`,
        options: [{ label: 'Bir kahve de benden', fx: { money: Math.round(d.c * 1.15), morale: 6, fans: 2 }, result: 'Kafe taraftarların buluşma noktası oldu.' }],
      } : {
        title: `😶 ${FRIEND} ortadan kayboldu`, photo: 'empty',
        text: `${FRIEND} telefonlarına çıkmıyor. Ortak arkadaşlar işinin battığını söylüyor.`,
        options: [
          { label: 'Peşini bırak, borcu sil', fx: { morale: -3, family: 2 }, result: 'Annen "iyilik kaybolmaz" dedi.' },
          { label: 'Evine git, yüzleş', odds: { p: 0.4, win: { fx: { money: Math.round(d.c * 0.5), morale: 2 }, result: 'Mahcup oldu, yarısını hemen ödedi.' }, lose: { fx: { morale: -5 }, result: 'Kapıyı açmadı bile.' } } },
        ],
      }),
      grudge: () => ({
        title: `📱 ${FRIEND} laf attı`, photo: 'paparazzi',
        text: `${FRIEND} sosyal medyada "Para görünce eski dostları unutanlar…" diye paylaşım yaptı. Herkes kimi kastettiğini biliyor.`,
        options: [
          { label: 'Ara, kalbini al', fx: { morale: 3 }, result: 'Yarım saatlik konuşma her şeyi düzeltti.' },
          { label: 'Cevap yaz', fx: { fans: -4, fame: 1 }, result: 'Kavga magazin sayfalarına taşındı.' },
          { label: 'Engelle', fx: { morale: -1 }, result: 'Bir dönem kapandı.' },
        ],
      }),
    },
  },

  // ---- ÖZEL: diz ağrısı ----
  knee: {
    when: (s) => s.player.injury === 0 && s.player.age >= 19,
    steps: {
      start: () => ({
        title: '🦵 Dizinde sızı', photo: 'injury',
        text: 'Antrenmanda dizinde bir sızı hissettin. Doktor MR çekmek istiyor ama maç yaklaşıyor.',
        options: [
          { label: 'MR çektir, bu hafta dinlen', fx: { energy: 10, bench: true }, result: 'Bu hafta yedeksin ama içi rahat.', next: nx('knee', 'result', 1, 2, { careful: true }) },
          { label: 'Ağrı kesiciyle oyna', odds: { p: 0.65, win: { fx: { promise: true }, result: 'Sızı geçti gibi. Maça hazırsın.' }, lose: { fx: { injury: 3, morale: -5 }, result: 'Isınmada dizin tuttu. 3 hafta yoksun.' } }, next: nx('knee', 'result', 2, 3, { careful: false }) },
        ],
      }),
      result: (state, d) => ({
        title: '🩻 MR sonucu', face: 'coach',
        text: d.careful ? 'Doktor: "Erken yakaladık, küçük bir ödem. Sana özel bir güçlendirme programı hazırladım."' : 'Doktor: "Zorlamaya devam edersen menisküs yırtılabilir. Önlem alalım."',
        options: [
          { label: 'Programa harfiyen uy', fx: { energy: -8, stat: 'guc', coach: 4 }, result: 'Dizin eskisinden sağlam.' },
          { label: `Özel fizyoterapist tut (${money(60_000)})`, fx: { money: -60_000, energy: 12, stat: 'hiz' }, result: 'Fizyoterapist mucize yarattı.' },
          { label: 'Boşver, bir şey olmaz', odds: { p: 0.7, win: { fx: {}, result: 'Şimdilik sorun yok.' }, lose: { fx: { injury: 4, morale: -6 }, result: 'Ve dizin pes etti. 4 hafta yoksun.' } } },
        ],
      }),
    },
  },

  // ---- ÖZEL: kardeşin geleceği ----
  sibling: {
    when: (s) => s.player.age <= 30,
    steps: {
      start: () => ({
        title: '👦 Kardeşin futbolcu olmak istiyor', face: 'mother',
        text: 'Annen aradı: "Kardeşin okulu bırakıp futbolcu olmak istiyor. Bir de sen konuş onunla."',
        options: [
          { label: 'Altyapı seçmelerine götür', fx: { family: 6, energy: -6 }, result: 'Kardeşin seni gururla izledi, seçmeler gelecek ay.', next: nx('sibling', 'trial', 3, 5) },
          { label: '"Önce okul" de', fx: { family: 4 }, result: 'Annen rahatladı. Kardeşin biraz küstü.', next: nx('sibling', 'school', 6, 10) },
        ],
      }),
      trial: () => (Math.random() < 0.5 ? {
        title: '✅ Kardeşin seçmeleri geçti!', face: 'mother',
        text: 'Kardeşin kulübün U15 takımına kabul edildi. Annen telefonda ağlıyor.',
        options: [
          { label: 'Kramponlarını sen al', fx: { money: -8_000, family: 10, morale: 6 }, result: 'Aynı formayı giyme hayali başladı.' },
          { label: 'Ona antrenman programı yaz', fx: { family: 8, energy: -5 }, result: 'Hafta sonları birlikte çalışıyorsunuz.' },
        ],
      } : {
        title: '❌ Seçmeler olmadı', face: 'mother',
        text: 'Kardeşin seçmelerde elendi. Odasına kapandı, kimseyle konuşmuyor.',
        options: [
          { label: 'Yanına git, kendi elendiğin günü anlat', fx: { family: 10, morale: 2 }, result: 'Bir yıl sonra tekrar deneyecek. Bu sefer okulla birlikte.' },
          { label: 'Tanıdık kulübe torpil yap', fx: { family: 4, fame: -1, coach: -2 }, result: 'Başka bir kulübe girdi ama dedikodusu çıktı.' },
        ],
      }),
      school: () => ({
        title: '🎓 Karne günü', face: 'mother',
        text: 'Kardeşin takdir belgesi almış! "Ağabeyim gibi bilgisayar mühendisi… şaka, futbolcu olacağım" diyor.',
        options: [
          { label: 'Ona tablet hediye et', fx: { money: -15_000, family: 8, morale: 3 }, result: 'Evin en mutlu günü.' },
          { label: 'Stadyuma davet et', fx: { family: 6, fans: 1 }, result: 'Maçtan sonra onu soyunma odasına aldın.' },
        ],
      }),
    },
  },

  // ---- MEDYA: eski paylaşım krizi ----
  old_post: {
    when: (s) => s.player.fame >= 15,
    steps: {
      start: () => ({
        title: '📱 Eski paylaşımın ortaya çıktı', photo: 'paparazzi',
        text: '15 yaşındayken ezeli rakip için yazdığın alaycı bir paylaşım bulundu. Ekran görüntüsü her yerde.',
        options: [
          { label: 'İçten bir özür yayınla', fx: { fans: -2, fame: 1 }, result: 'Çoğu kişi "çocukmuş" deyip geçti.' },
          { label: 'Espriyle cevap ver', odds: { p: 0.5, win: { fx: { fame: 5, fans: 6 }, result: 'Cevabın paylaşımdan daha çok yayıldı. Kazandın!' }, lose: { fx: { fans: -8, fame: 2 }, result: 'Espri ters tepti, rakip taraftar ayakta.' } }, next: nx('old_post', 'derby', 2, 4) },
          { label: 'Sil ve sus', fx: { fans: -4 }, result: 'Silmek, ekran görüntülerini durdurmadı.', next: nx('old_post', 'derby', 2, 4) },
        ],
      }),
      derby: () => ({
        title: '😠 Rakip tribünler seni bekliyor', photo: 'protest',
        text: 'Rakip taraftarlar maçta sana özel pankart hazırlamış. Her topa dokunuşunda ıslık bekleniyor.',
        options: [
          { label: 'Gol atarsam susturma hareketi yapacağım', fx: { morale: 5, promise: true, fans: 3 }, result: 'Hırslısın. Hoca da öyle.' },
          { label: 'Maç öncesi rakip tribünü alkışla', fx: { fame: 3, fans: 4 }, result: 'Islıklar yerini homurtuya bıraktı. Centilmen yıldız.' },
          { label: 'Kulaklıkla ısın, umursama', fx: { energy: 5 }, result: 'Odaklandın.' },
        ],
      }),
    },
  },

  // ---- MEDYA: reklam anlaşması ----
  sponsor: {
    when: (s) => s.player.fame >= 30,
    steps: {
      start: (state) => {
        const c = ask(state.player, 6, 12);
        return {
          title: `👟 ${BRAND} reklam teklifi`, face: 'agent',
          text: `${AGENT}: "${BRAND} seni yeni krampon reklamının yüzü yapmak istiyor. ${money(c)} teklif ediyorlar."`,
          options: [
            { label: 'Kabul et', fx: { money: c, energy: -10 }, result: 'Çekim günü 14 saat sürdü.', next: nx('sponsor', 'air', 3, 5) },
            { label: 'Daha fazla iste', odds: { p: 0.5, win: { fx: { money: Math.round(c * 1.5), energy: -10 }, result: 'Marka geri adım attı: %50 fazlası!', next: nx('sponsor', 'air', 3, 5) }, lose: { fx: {}, result: 'Marka teklifi rakip takımdaki oyuncuya götürdü.' } } },
            { label: 'Reddet, futbola odaklan', fx: { coach: 3 }, result: '' },
          ],
        };
      },
      air: () => (Math.random() < 0.6 ? {
        title: '📺 Reklamın yayında!', photo: 'freekick',
        text: 'Reklam filmin maç arasında yayınlandı. Sloganın sokakta tekrar ediliyor.',
        options: [{ label: 'Harika!', fx: { fame: 5, fans: 4 }, result: 'Satışlar patladı, marka uzatma sinyali veriyor.' }],
      } : {
        title: '🙈 Reklam alay konusu', photo: 'paparazzi',
        text: 'Reklamdaki oyunculuğun "caps" oldu. Rakip taraftarlar seni taklit ediyor.',
        options: [
          { label: 'Sen de dalga geç', fx: { fame: 3, fans: 5 }, result: 'Kendinle dalga geçebilmen herkesin hoşuna gitti.' },
          { label: 'Markaya kız', fx: { fans: -2 }, result: 'Marka açıklama yaptı, iş büyüdü.' },
        ],
      }),
    },
  },

  // ---- MEDYA: belgesel ----
  documentary: {
    when: (s) => s.player.fame >= 45,
    steps: {
      start: () => ({
        title: '🎬 Belgesel teklifi', photo: 'documentary',
        text: 'Bir dijital platform, sezon boyunca hayatını kaydetmek istiyor: antrenmanlar, ev, maç öncesi soyunma odası…',
        options: [
          { label: 'Kabul et', fx: { money: 400_000, fame: 3 }, result: 'Kameralar kapına dayandı.', next: nx('documentary', 'locker', 2, 4) },
          { label: 'Soyunma odası hariç kabul et', fx: { money: 200_000, fame: 2, coach: 2 }, result: 'Hoca bu sınırı takdir etti.', next: nx('documentary', 'premiere', 6, 9) },
          { label: 'Reddet', fx: {}, result: '' },
        ],
      }),
      locker: () => ({
        title: '🎥 Kamera soyunma odasında', photo: 'documentary',
        text: 'Kamera, hocanın devre arası konuşmasını kaydetti. Takımda "bizi rezil edecek" huzursuzluğu var.',
        options: [
          { label: 'O kısmı kestir', fx: { team: 6, money: -50_000 }, result: 'Yapımcı istemeye istemeye kabul etti.' },
          { label: 'Belgesel gerçek olmalı', fx: { team: -8, fame: 3 }, result: 'Takım arkadaşların sana mesafeli.' },
        ],
        next: nx('documentary', 'premiere', 4, 7),
      }),
      premiere: () => ({
        title: '🍿 Belgeselin galası', photo: 'champions',
        text: 'Belgesel yayınlandı! Annenin mutfakta ağladığı sahne en çok konuşulan an oldu.',
        options: [
          { label: 'Galaya aileyi götür', fx: { family: 10, fame: 6, fans: 6 }, result: 'Kırmızı halıda annen yıldız oldu.' },
          { label: 'Evden izle', fx: { fame: 4, fans: 4, morale: 3 }, result: 'Telefonun sabaha kadar sustu mu? Hayır.' },
        ],
      }),
    },
  },

  // ---- AİLE: bebek ----
  baby: {
    when: (s) => !!s.player.partner?.married && (s.player.children || []).filter((c) => !c.exOf).length < 4 && ABS(s) - (s.player.partner.marriedAt ?? 0) >= 6 && !(s.player.newborn > 0),
    steps: {
      start: (state) => {
        const pn = first(state.player.partner.name), n = (state.player.children || []).filter((c) => !c.exOf).length;
        return {
          title: n ? '👶 Bir kardeş mi?' : '👶 Bebek konuşması', face: 'partner' + (state.player.partner.portrait ?? 0),
          text: n ? `${pn}: "${state.player.children[0].name} bir kardeş istiyor. Sen ne dersin?"` : `${pn} akşam yemeğinde elini tuttu: "Artık bir bebeğimiz olsun istiyorum."`,
          options: [
            { label: '"Ben de çok istiyorum"', fx: { partner: 10, morale: 5 }, result: 'Güzel haber gelecek gibi…', next: nx('baby', 'news', 4, 8) },
            { label: '"Biraz daha bekleyelim"', fx: { partner: -6 }, result: `${pn} anlayışla karşıladı ama biraz buruk.` },
          ],
        };
      },
      news: (state) => ({
        title: '🍼 Müjde!', face: 'partner' + (state.player.partner?.portrait ?? 0),
        text: `${first(state.player.partner?.name || 'Eşin')} test sonucunu gösterdi: Bebek yolda!`,
        options: [
          { label: 'Herkese duyur!', fx: { fans: 4, fame: 2, family: 8, morale: 6 }, result: 'Gol sevincini bebek sallama hareketiyle yapacaksın.', next: nx('baby', 'birth', 28, 36) },
          { label: 'Şimdilik aile arasında kalsın', fx: { family: 6, partner: 4 }, result: 'Sırrınızı sadece anneler biliyor.', next: nx('baby', 'birth', 28, 36) },
        ],
      }),
      birth: (state) => {
        const g = Math.random() < 0.5 ? 'e' : 'k';
        const used = new Set((state.player.children || []).map((c) => c.name));
        const pool = (g === 'e' ? Fam.BOY : Fam.GIRL).filter((n) => !used.has(n));
        const names = pool.sort(() => Math.random() - 0.5).slice(0, 3);
        if (g === 'e' && !used.has(state.player.name)) names[2] = state.player.name;
        return {
          title: g === 'e' ? '👦 Bir oğlun oldu!' : '👧 Bir kızın oldu!', photo: 'baby',
          text: `Doğumhanenin kapısı açıldı… ${g === 'e' ? 'Oğlun' : 'Kızın'} sağlıklı, ${randInt(2900, 3900)} gram! Adını ne koyacaksınız?`,
          options: names.map((n) => ({ label: n === state.player.name ? `${n} (senin adın)` : n, fx: { child: { add: true, name: n, gender: g } }, result: `Hoş geldin ${n}!` })),
        };
      },
    },
  },

  // ---- AİLE: evlilikte kriz ----
  marriage_crisis: {
    when: (s) => !!s.player.partner?.married && s.player.fame >= 20,
    steps: {
      start: (state) => {
        const pn = first(state.player.partner.name);
        return {
          title: '📰 İhanet söylentisi', photo: 'paparazzi', face: 'partner' + (state.player.partner.portrait ?? 0),
          text: `Bir magazin sitesi, bir gece kulübünden çıkarken çekilmiş bulanık bir fotoğrafını "gizli aşk" diye yayınladı. ${pn} sabah gazeteyi masaya koydu.`,
          options: [
            { label: 'Kamera kayıtlarını bulup göster', fx: { money: -10_000, partner: 4 }, result: 'Fotoğraftaki kişinin kuzenin olduğu ortaya çıktı.' },
            { label: '"Bana güvenmiyor musun?"', odds: { p: (s) => s.player.partner.value / 110, win: { fx: { partner: -3 }, result: 'Güveni sarsılmadı.' }, lose: { fx: { partner: -18, morale: -6 }, result: 'Evde soğuk rüzgârlar esiyor.', next: nx('marriage_crisis', 'therapy', 2, 4) } } },
            { label: 'Siteye dava aç', fx: { money: -25_000, fame: 1, partner: 2 }, result: 'Site haberi kaldırdı.' },
          ],
        };
      },
      therapy: (state) => ({
        title: '🛋️ Çift terapisi', face: 'partner' + (state.player.partner?.portrait ?? 0),
        text: `${first(state.player.partner?.name || 'Eşin')} bir çift terapistinden randevu almış. "Gelirsen evliliğimizi kurtarabiliriz."`,
        options: [
          { label: `Git (${money(30_000)})`, fx: { money: -30_000, partner: 18, energy: -5 }, result: 'Uzun zamandır ilk kez gerçekten konuştunuz.' },
          { label: '"Bunlara ihtiyacımız yok"', fx: { partner: -15 }, result: 'Kapı yine çarptı.' },
        ],
      }),
      ask: (state) => {
        const t = Fam.divorceTerms(state), pn = first(state.player.partner?.name || 'Eşin');
        return {
          title: '💔 Boşanmak istiyor', photo: 'divorce', face: 'partner' + (state.player.partner?.portrait ?? 0),
          text: `${pn}: "Artık eskisi gibi değiliz. Boşanmak istiyorum." Avukatına göre mal paylaşımı ${money(t.share)}${t.house ? ', ev de onda kalır' : ''}, haftalık nafaka ${money(t.alimony + t.childSupport)}.`,
          options: [
            { label: `Son bir şans: terapi (${money(40_000)})`, odds: { p: 0.45, win: { fx: { money: -40_000, partner: 35 }, result: 'Zor ama başardınız. Yeni bir başlangıç.' }, lose: { fx: { money: -40_000, divorce: true }, result: 'Terapi de işe yaramadı. Yollar ayrıldı.' } } },
            { label: 'Anlaşmalı boşan', fx: { divorce: true }, result: 'Mahkeme 20 dakika sürdü.' },
          ],
        };
      },
    },
  },

  // ---- MEDYA + ÖZEL: paparazzi ----
  paparazzi: {
    when: (s) => !!s.player.partner && s.player.fame >= 20,
    steps: {
      start: (state) => {
        const pn = first(state.player.partner.name);
        return {
          title: '📸 Paparazzi peşinde', photo: 'paparazzi', face: 'partner' + (state.player.partner.portrait ?? 0),
          text: `${pn} ile restorandan çıkarken flaşlar patladı. Ertesi gün bir site yanındaki garsonla "gizli buluşma" uydurdu.`,
          options: [
            { label: `${pn} ile birlikte açıklama yapın`, fx: { partner: 8, fans: 3 }, result: 'Ortak paylaşımınız dedikoduyu bitirdi.' },
            { label: 'Siteye dava aç', fx: { money: -20_000, partner: 4, fame: 1 }, result: 'Dava sürüyor.', next: nx('paparazzi', 'court', 4, 7) },
            { label: 'Hiç yorum yapma', odds: { p: 0.5, win: { fx: { partner: 2 }, result: 'Haber kendiliğinden unutuldu.' }, lose: { fx: { partner: -12, morale: -4 }, result: `${pn} bu sessizliği yanlış anladı. Ev buz gibi.` } } },
          ],
        };
      },
      court: () => ({
        title: '⚖️ Davanın sonucu', photo: 'press',
        text: 'Mahkeme, uydurma haberi yapan siteyi tazminata mahkûm etti.',
        options: [{ label: 'Tazminatı bağışla', fx: { money: 20_000, fans: 5, fame: 2 }, result: 'Tazminatı bir dernek okuluna bağışladın.' }],
      }),
    },
  },
};

// ---------------------------------------------------------------------------
// motor
// ---------------------------------------------------------------------------
function initStories(p) {
  p.stories ||= {};        // devam eden hikâyeler: { id: { step, due, data } }
  p.seenEv ||= {};         // olay id -> son görüldüğü mutlak hafta
  p.storiesDone ||= {};
}

// Olay kayda yazılır (JSON): fonksiyonlu şansları sayıya çevir
function normalize(ev, state) {
  for (const o of ev.options) if (o.odds && typeof o.odds.p === 'function') o.odds.p = clamp(o.odds.p(state), 0.05, 0.95);
  return ev;
}
function build(id, step, state, data) {
  const ch = CHAINS[id];
  const ev = ch.steps[step](state, data || {});
  return normalize({ ...ev, id: `${id}_${step}`, story: id }, state);
}

// Maç / kamp / antrenmana bağlı olaylar: sakat ya da cezalıyken çıkmaz
const MATCHY = new Set(['bus_late', 'camp_room', 'insomnia', 'cousin_wedding', 'tv_show', 'child_birthday', 'child_school', 'visitation', 'dressing_prank', 'tactic_meeting', 'nightclub', 'extra_training']);
// Devam eden zincirin sonraki bölümü için gereken durum
const KEEP = {
  baby: (s) => !!s.player.partner,
  marriage_crisis: (s) => !!s.player.partner?.married,
  paparazzi: (s) => !!s.player.partner,
  captain: (s) => !!s.player.captain,
};
// Transfer olunca eski kulübe bağlı hikâyeler kapanır, kaptanlık düşer
export function onTransfer(state) {
  const p = state.player;
  initStories(p);
  for (const id of ['rival', 'coach_crisis', 'captain', 'documentary']) delete p.stories[id];
  p.captain = false;
}

// Her hafta çağrılır. fallback: eski olay havuzunu döndüren fonksiyon.
export function weeklyStory(state, fallback) {
  const p = state.player;
  initStories(p);
  const now = ABS(state);
  const cool = (id, w) => now - (p.seenEv[id] ?? -999) >= w;
  // 0) evlilik dibe vurduysa boşanma talebi
  if (p.partner?.married && p.partner.value < 18 && !p.stories.marriage_crisis && cool('divorce_ask', 20)) {
    p.seenEv.divorce_ask = now;
    return build('marriage_crisis', 'ask', state);
  }
  // 1) vadesi gelen hikâye bölümü (koşulu artık tutmuyorsa sessizce kapanır: ör. boşandıktan sonra bebek haberi gelmez)
  for (const [id, st] of Object.entries(p.stories)) {
    if (st.due <= now) {
      delete p.stories[id];
      if (KEEP[id] && !KEEP[id](state)) continue;
      return build(id, st.step, state, st.data);
    }
  }
  if (Math.random() > 0.34) return null;
  // 2) yeni zincir (aynı anda en fazla 2 hikâye açık)
  if (Object.keys(p.stories).length < 2 && Math.random() < 0.35) {
    const opts = Object.entries(CHAINS).filter(([id, c]) => !p.stories[id] && cool(id, 80) && c.when(state));
    if (opts.length) {
      const [id] = pick(opts);
      p.seenEv[id] = now;
      return build(id, 'start', state);
    }
  }
  // 3) tek seferlik olay
  const busy = p.injury > 0 || p.suspended > 0 || state.phase !== 'hub';
  const singles = Object.entries(SINGLES).filter(([id]) => cool(id, 40) && !(busy && MATCHY.has(id))).map(([id, f]) => { const ev = f(state); return ev && { ...ev, id }; }).filter(Boolean);
  const old = fallback ? fallback(state) : null;
  const pool = old && cool(old.id, 20) && !(busy && MATCHY.has(old.id)) ? [...singles, old] : singles;
  if (!pool.length) return null;
  const ev = pick(pool);
  p.seenEv[ev.id] = now;
  return normalize(ev, state);
}

const LABEL = { money: 'Para', family: 'Aile', coach: 'Hoca', team: 'Takım', partner: 'Sevgili', morale: 'Moral', fans: 'Taraftar', fame: 'Ün', energy: 'Enerji' };
const STAT_TR = { sut: 'Şut', pas: 'Pas', hiz: 'Hız', teknik: 'Teknik', guc: 'Güç' };

// Seçimi uygula: fx + şans + sonraki bölüm. { result, summary } döner.
export function applyChoice(state, ev, i, relAdd) {
  const p = state.player;
  initStories(p);
  const opt = ev.options[i];
  if (!opt) return null;
  let fx = opt.fx || {}, result = opt.result || '', next = opt.next || ev.next || null;
  if (opt.odds) {
    const pr = typeof opt.odds.p === 'function' ? opt.odds.p(state) : opt.odds.p;
    const br = Math.random() < pr ? opt.odds.win : opt.odds.lose;
    fx = { ...fx, ...(br.fx || {}) }; result = br.result || result; next = br.next || next;
  }
  const parts = [];
  const num = (k, d) => { if (d) parts.push(`${LABEL[k]} ${d > 0 ? '+' : '−'}${k === 'money' ? money(Math.abs(d)) : Math.abs(Math.round(d))}`); };
  if (fx.moneyWage) fx = { ...fx, money: (fx.money || 0) + Math.round(fx.moneyWage * p.contract.wage) };
  if (fx.money) { p.money += fx.money; num('money', fx.money); }
  for (const k of ['family', 'coach', 'team']) if (fx[k]) { relAdd(p, k, fx[k]); num(k, fx[k]); }
  if (fx.morale) { p.morale = clamp(p.morale + fx.morale, 0, 100); num('morale', fx.morale); }
  if (fx.fans) { p.fans = clamp((p.fans ?? 50) + fx.fans, 0, 100); num('fans', fx.fans); }
  if (fx.fame) { p.fame = clamp(p.fame + fx.fame, 0, 100); num('fame', fx.fame); }
  if (fx.energy) { p.energy = clamp(p.energy + fx.energy, 0, 100); num('energy', fx.energy); }
  if (fx.partner && p.partner) { p.partner.value = clamp(p.partner.value + fx.partner, 0, 100); num('partner', fx.partner); }
  if (fx.stat) { p.stats[fx.stat] = clamp(p.stats[fx.stat] + 0.8, 1, 99); parts.push(`${STAT_TR[fx.stat]} +0.8`); }
  if (fx.promise) { p.weekFlags.coachPromise = true; parts.push('İlk 11 şansı ↑'); }
  if (fx.bench) { p.weekFlags.benched = true; parts.push('Bu hafta yedek'); }
  if (fx.injury) { p.injury = Math.max(p.injury || 0, fx.injury); parts.push(`Sakat (${fx.injury} hafta)`); }
  if (fx.child) {
    if (fx.child.add) { Fam.addChild(state, fx.child.name, fx.child.gender); parts.push(`${fx.child.gender === 'k' ? '👧' : '👦'} ${fx.child.name}`); }
    else {
      const c = (p.children || []).find((x) => x.name === fx.child.name);
      if (c) {
        if (fx.child.rel) { c.rel = clamp((c.rel ?? 70) + fx.child.rel, 0, 100); parts.push(`${c.name} ${fx.child.rel > 0 ? '+' : '−'}${Math.abs(fx.child.rel)}`); }
        if (fx.child.talent) c.talent = (c.talent || 0) + fx.child.talent;
      }
    }
  }
  if (fx.divorce) { const r = Fam.divorce(state); if (r.ok) parts.push(`Boşandınız · −${money(r.terms.share)}`); }
  if (fx.pet) p.hasPet = true;
  if (fx.captain === true) { p.captain = true; parts.push('©️ Kaptan'); }
  if (fx.captain === false && p.captain) { p.captain = false; parts.push('Pazubant bırakıldı'); }
  if (next) {
    const now = ABS(state);
    p.stories[next.story] = { step: next.step, due: now + randInt(next.a, next.b), data: next.data || {} };
  }
  const summary = parts.join(' · ');
  if (result || summary) addInbox(state, `${ev.title.replace(/^\S+\s/, '')}: ${result}${summary ? ` (${summary})` : ''}`);
  return { result, summary, fx };
}

// test / geliştirme için
export const _all = { SINGLES, CHAINS };
