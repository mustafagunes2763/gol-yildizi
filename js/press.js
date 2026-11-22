// Yabancı basın: oynadığın ülkenin kendi gazetecileri. Hepsi kurgusal kişiler ve yayın organlarıdır.
// as: hangi Türk muhabirin soru havuzunu kullandığı (analitik: selin/riza · sert/kulis: kenan/berk · TV: nur/duygu)
// Tarzları ciddi ve profesyoneldir; sorular çevirmen eşliğinde sorulur.

const J = (id, name, outlet, paper, icon, style, as, hello, react) => ({ id, name, outlet, paper, icon, style, as, hello, react, foreign: true });
const R = (humble, bold, witty, sharp, refuse) => ({ humble, bold, witty, sharp, refuse });

export const FOREIGN = {
  ENG: [
    J('eng_whitfield', 'Graham Whitfield', 'The Matchday Post', 'golsporu', '🇬🇧', 'Soğukkanlı, istatistiklerle soru soran', ['selin'],
      ['Graham Whitfield, The Matchday Post. Kısa bir sorum olacak.', 'Çevirmeniniz hazırsa başlayalım.', 'Kısa bir sorum olacak.'],
      R('Whitfield not defterine düzgün harflerle yazıyor.', 'Whitfield kaşını kaldırdı: "Bu iddialı bir cümle."', 'Whitfield hafifçe gülümsedi ama yazmadı.', 'Whitfield kalemini bıraktı: "Bunu aynen yazacağım."', 'Whitfield başını salladı: "Anlıyorum, bir dahaki sefere."')),
    J('eng_reeves', 'Callum Reeves', 'Northern Sport Weekly', 'transfer', '🗞️', 'Kulis ve transfer haberleri, doğrudan', ['berk'],
      ['Callum Reeves, Northern Sport Weekly. Açık bir soru soracağım.', 'Bir dakikanızı alabilir miyim?', 'Kısa bir sorum olacak:'],
      R('Reeves tatmin olmamış görünüyor.', 'Reeves hızla yazıyor: "Yarın ilk sayfada."', 'Reeves gülümsedi: "Bunu kullanabilirim."', 'Reeves geri adım atmadı: "Cevabınız kayda geçti."', 'Reeves arkanızdan seslendi: "Sorular bitmedi."')),
    J('eng_doyle', 'Hannah Doyle', 'Pitchside TV', 'golsporu', '📺', 'Net, profesyonel canlı yayın muhabiri', ['nur'],
      ['Canlı yayındayız, iki dakikanız var mı?', 'Hannah Doyle, Pitchside TV. Hemen soralım:', 'İzleyicilerimiz sizi duymak istiyor:'],
      R('Doyle kameraya döndü: "Olgun bir yaklaşım."', 'Doyle stüdyoya bağladı: "Kendinden çok emin."', 'Doyle gülümsedi: "Stüdyo da güldü."', 'Doyle yayını hızla stüdyoya verdi.', 'Doyle kameraya döndü: "Şimdilik konuşmak istemiyor."')),
  ],
  ESP: [
    J('esp_ortuno', 'Javier Ortuño', 'Diario del Balón', 'golsporu', '🇪🇸', 'Taktik ve oyun kurgusu soran', ['selin'],
      ['Javier Ortuño, Diario del Balón. Oyunla ilgili bir sorum var.', 'Bir dakikanızı alabilir miyim?', 'Kısa ama teknik bir soru:'],
      R('Ortuño onaylarcasına başını salladı.', 'Ortuño hafifçe gülümsedi: "Kendinize güveniyorsunuz."', 'Ortuño güldü: "Bunu okurlar sever."', 'Ortuño ciddileşti: "Not ettim."', 'Ortuño saygıyla kenara çekildi.')),
    J('esp_berasategui', 'Iñaki Berasategui', 'El Marcador Norte', 'transfer', '📱', 'Kulis ve transfer takipçisi', ['berk'],
      ['Iñaki Berasategui, El Marcador Norte. Bir sorum var:', 'Kısa bir soru soracağım:', 'Bir dakikanızı alabilir miyim?'],
      R('Berasategui telefonuna not aldı: "Kapı kapalı değil o zaman."', 'Berasategui hemen yazmaya başladı.', 'Berasategui güldü: "Bunu kulis notlarına ekliyorum."', 'Berasategui duraksadı: "Sert bir cevap."', 'Berasategui omuz silkti: "Kaynaklarım konuşur."')),
    J('esp_sanz', 'Marta Sanz', 'Radio Área', 'golsporu', '📻', 'Hızlı, canlı radyo yayını', ['nur'],
      ['Radio Área canlı yayını! Bir soru:', 'Marta Sanz, dinleyicilerimiz için kısa bir yorum alabilir miyim?', 'Nefesiniz yerine geldiyse:'],
      R('Sanz mikrofona döndü: "Çok olgun bir cevap."', 'Sanz heyecanla: "Duydunuz mu?"', 'Sanz gülerek: "Stüdyodakiler de güldü."', 'Sanz bir an sessiz kaldı, sonra yayını devretti.', 'Sanz: "Belki maçtan sonra."')),
  ],
  ITA: [
    J('ita_ferri', 'Alessandro Ferri', 'Il Pallone Quotidiano', 'golsporu', '🇮🇹', 'Taktik, disiplin ve savunma üzerine', ['selin'],
      ['Alessandro Ferri, Il Pallone Quotidiano. Taktik bir sorum var.', 'Bir dakikanızı alabilir miyim?', 'Kısa bir değerlendirme rica edeceğim:'],
      R('Ferri not alıyor: "Alçakgönüllü."', 'Ferri kaşlarını kaldırdı: "Cesur."', 'Ferri gülümsedi: "Esprili de."', 'Ferri yazmayı bıraktı: "Bu manşet olur."', 'Ferri: "Anlayışla karşılıyorum."')),
    J('ita_marchetti', 'Davide Marchetti', 'Mercato Notturno', 'transfer', '📱', 'Transfer dönemi uzmanı', ['berk'],
      ['Davide Marchetti, Mercato Notturno. Bir sorum var:', 'Kısa bir soru soracağım:', 'Bir dakikanızı alabilir miyim?'],
      R('Marchetti: "Yani şimdilik buradasınız."', 'Marchetti hemen mesaj attı.', 'Marchetti güldü: "Diplomatik."', 'Marchetti: "Bu cevap çok konuşulur."', 'Marchetti: "Sessizlik de bir cevap."')),
    J('ita_romano', 'Giulia Romano', 'Studio Calcio TV', 'golsporu', '📺', 'Stüdyoya bağlanan saha muhabiri', ['nur'],
      ['Studio Calcio, canlı bağlantı! Bir soru:', 'Giulia Romano, izleyicilerimiz için:', 'Hemen stüdyoya bağlanmadan önce:'],
      R('Romano: "Teşekkürler, çok net."', 'Romano kameraya: "İddialı sözler!"', 'Romano gülümsedi: "Stüdyo eğlendi."', 'Romano yayını hızla stüdyoya verdi.', 'Romano: "Belki bir sonraki maçta."')),
  ],
  GER: [
    J('ger_kruger', 'Matthias Krüger', 'Fußball Rundschau', 'golsporu', '🇩🇪', 'Disiplinli, detaycı', ['selin'],
      ['Matthias Krüger, Fußball Rundschau. Somut bir soru:', 'Bir dakikanızı alabilir miyim?', 'Kısa ve net:'],
      R('Krüger memnun: "Profesyonel bir cevap."', 'Krüger: "Bu sözlerin arkasında durmanız gerekecek."', 'Krüger hafifçe güldü.', 'Krüger kalemini bıraktı: "Kayda geçti."', 'Krüger: "Anlaşıldı."')),
    J('ger_becker', 'Jonas Becker', 'Transfer Kompass', 'transfer', '📱', 'Kulis ve sözleşme haberleri', ['berk'],
      ['Jonas Becker, Transfer Kompass. Bir sorum var:', 'Kısa bir soru soracağım:', 'Bir dakikanızı alabilir miyim?'],
      R('Becker: "Yani kapı açık değil."', 'Becker hızla yazıyor.', 'Becker gülümsedi.', 'Becker: "Bunu yönetim okuyacak."', 'Becker: "Kaynaklarım var zaten."')),
    J('ger_hoffmann', 'Lena Hoffmann', 'Anpfiff TV', 'golsporu', '📺', 'Sakin ama ısrarcı canlı yayın muhabiri', ['nur'],
      ['Anpfiff TV, canlı yayın. Bir dakika alabilir miyim?', 'Lena Hoffmann, izleyicilerimiz için kısa bir soru:', 'Hemen soralım:'],
      R('Hoffmann: "Teşekkürler, çok net."', 'Hoffmann kameraya döndü: "Kendinden emin."', 'Hoffmann gülümsedi.', 'Hoffmann bir an duraksadı, yayını devretti.', 'Hoffmann: "Saygı duyuyoruz."')),
  ],
  FRA: [
    J('fra_marchand', 'Julien Marchand', 'Le Journal du But', 'golsporu', '🇫🇷', 'Oyun zekâsı ve gelişim üzerine', ['selin'],
      ['Julien Marchand, Le Journal du But. Bir sorum var:', 'Bir dakikanızı alabilir miyim?', 'Kısa bir analiz rica ediyorum:'],
      R('Marchand not alıyor.', 'Marchand: "Hedefleriniz büyük."', 'Marchand gülümsedi: "Hoş bir cevap."', 'Marchand ciddileşti: "Bunu yazacağım."', 'Marchand: "Başka zaman."')),
    J('fra_lefevre', 'Antoine Lefèvre', 'Mercato Direct', 'transfer', '📱', 'Transfer ve kulis', ['berk'],
      ['Antoine Lefèvre, Mercato Direct. Bir sorum var:', 'Kısa bir soru soracağım:', 'Bir dakikanızı alabilir miyim?'],
      R('Lefèvre: "Diplomatik."', 'Lefèvre hemen yazdı.', 'Lefèvre güldü.', 'Lefèvre: "Sert bir cevap."', 'Lefèvre: "Peki."')),
    J('fra_dubois', 'Claire Dubois', 'Canal Stade', 'golsporu', '📺', 'Canlı yayın sunucusu', ['nur'],
      ['Canal Stade, canlı! Kısa bir soru:', 'Claire Dubois, izleyicilerimiz için:', 'Hemen soralım:'],
      R('Dubois: "Olgun bir cevap."', 'Dubois: "İddialı!"', 'Dubois gülümsedi.', 'Dubois yayını stüdyoya verdi.', 'Dubois: "Anlıyoruz."')),
  ],
  NED: [
    J('ned_smit', 'Pieter Smit', 'Voetbal Dagblad', 'golsporu', '🇳🇱', 'Hücum futbolu ve gelişim üzerine', ['selin'],
      ['Pieter Smit, Voetbal Dagblad. Bir sorum var:', 'Bir dakikanızı alabilir miyim?', 'Kısa bir değerlendirme:'],
      R('Smit başını salladı.', 'Smit: "Büyük hedefler."', 'Smit gülümsedi.', 'Smit: "Not ettim."', 'Smit: "Tamam."')),
    J('ned_jansen', 'Bram Jansen', 'Transferradar', 'transfer', '📱', 'Transfer kulisi', ['berk'],
      ['Bram Jansen, Transferradar. Bir sorum var:', 'Kısa bir soru soracağım:', 'Bir dakikanızı alabilir miyim?'],
      R('Jansen: "Şimdilik kalıyor."', 'Jansen hızla yazdı.', 'Jansen güldü.', 'Jansen: "Bu konuşulur."', 'Jansen: "Peki."')),
    J('ned_devries', 'Sanne de Vries', 'Voetbal Vandaag TV', 'golsporu', '📺', 'Canlı yayın muhabiri', ['nur'],
      ['Canlı yayındayız, bir soru:', 'Sanne de Vries, izleyicilerimiz için:', 'Hemen soralım:'],
      R('De Vries: "Teşekkürler."', 'De Vries: "Kendinden emin!"', 'De Vries gülümsedi.', 'De Vries yayını devretti.', 'De Vries: "Anlıyoruz."')),
  ],
  POR: [
    J('por_barros', 'João Barros', 'Jornal da Bola', 'golsporu', '🇵🇹', 'Teknik ve oyun anlayışı üzerine', ['selin'],
      ['João Barros, Jornal da Bola. Bir sorum var:', 'Bir dakikanızı alabilir miyim?', 'Kısa bir değerlendirme:'],
      R('Barros not aldı.', 'Barros: "İddialı."', 'Barros gülümsedi.', 'Barros: "Yazacağım."', 'Barros: "Başka zaman."')),
    J('por_mendes', 'Rui Mendes', 'Mercado Aberto', 'transfer', '📱', 'Transfer kulisi', ['berk'],
      ['Rui Mendes, Mercado Aberto. Bir sorum var:', 'Kısa bir soru soracağım:', 'Bir dakikanızı alabilir miyim?'],
      R('Mendes: "Diplomatik."', 'Mendes hızla yazdı.', 'Mendes güldü.', 'Mendes: "Sert."', 'Mendes: "Peki."')),
    J('por_carvalho', 'Inês Carvalho', 'Canal Golo', 'golsporu', '📺', 'Canlı yayın muhabiri', ['nur'],
      ['Canal Golo, canlı! Bir soru:', 'Inês Carvalho, izleyicilerimiz için:', 'Hemen soralım:'],
      R('Carvalho: "Teşekkürler."', 'Carvalho: "Kendinden emin!"', 'Carvalho gülümsedi.', 'Carvalho yayını devretti.', 'Carvalho: "Anlıyoruz."')),
  ],
  BEL: [
    J('bel_peeters', 'Thomas Peeters', 'Sportkrant', 'golsporu', '🇧🇪', 'Analitik, sakin', ['selin'],
      ['Thomas Peeters, Sportkrant. Bir sorum var:', 'Bir dakikanızı alabilir miyim?', 'Kısa bir değerlendirme:'],
      R('Peeters not aldı.', 'Peeters: "Büyük sözler."', 'Peeters gülümsedi.', 'Peeters: "Kayda geçti."', 'Peeters: "Anlıyorum."')),
    J('bel_claes', 'Wout Claes', 'Transfergids', 'transfer', '📱', 'Transfer kulisi', ['berk'],
      ['Wout Claes, Transfergids. Bir sorum var:', 'Kısa bir soru soracağım:', 'Bir dakikanızı alabilir miyim?'],
      R('Claes: "Şimdilik kalıyor."', 'Claes hızla yazdı.', 'Claes güldü.', 'Claes: "Konuşulur."', 'Claes: "Peki."')),
    J('bel_lambert', 'Camille Lambert', 'Stade Live', 'golsporu', '📺', 'Canlı yayın muhabiri', ['nur'],
      ['Stade Live, canlı yayın. Bir soru:', 'Camille Lambert, izleyicilerimiz için:', 'Hemen soralım:'],
      R('Lambert: "Teşekkürler."', 'Lambert: "Kendinden emin!"', 'Lambert gülümsedi.', 'Lambert yayını devretti.', 'Lambert: "Anlıyoruz."')),
  ],
};

// Yurt dışına özel, ciddi sorular (maç öncesi)
export const ABROAD_Q = {
  ENG: ['Premier Lig\'in temposu ve fizik gücü sizi zorladı mı?', 'İngiltere\'de hayata, havaya, dile alışabildiniz mi?', 'Ligdeki savunmacıların fiziği karşısında nasıl bir yol izliyorsunuz?'],
  ESP: ['La Liga\'da topa sahip olma oyunu ön planda. Bu oyuna nasıl uyum sağladınız?', 'İspanyolca öğrenme süreciniz nasıl gidiyor?', 'Teknik takımlara karşı forvet olarak nasıl pozisyon buluyorsunuz?'],
  ITA: ['Serie A savunmaları disiplinleriyle bilinir. Forvet olarak nasıl çözüm buluyorsunuz?', 'İtalyan futbolunun taktik yapısına uyum sağlamak ne kadar sürdü?', 'İtalya\'da günlük hayata alışabildiniz mi?'],
  GER: ['Bundesliga\'da pres ve geçiş oyunu çok hızlı. Buna nasıl hazırlanıyorsunuz?', 'Almanca öğreniyor musunuz, soyunma odasında iletişim nasıl?', 'Kalabalık tribünler sizi nasıl etkiliyor?'],
  FRA: ['Ligue 1\'de genç oyuncular hızla öne çıkıyor. Siz kendinizi nerede görüyorsunuz?', 'Fransa\'daki yaşama ve dile uyum süreciniz nasıl?', 'Ligdeki fiziksel ve atletik oyuna nasıl uyum sağladınız?'],
  NED: ['Hollanda futbolu hücuma ve gelişime önem veriyor. Size ne kattı?', 'Eredivisie büyük liglere bir basamak olarak görülüyor. Planınız ne?', 'Hollanda\'da hayata alışabildiniz mi?'],
  POR: ['Portekiz ligi yetenek geliştirmesiyle bilinir. Burada ne öğrendiniz?', 'Portekizce öğrenme süreciniz nasıl gidiyor?', 'Buradaki taraftar kültürünü nasıl buldunuz?'],
  BEL: ['Pro League genç oyuncular için önemli bir vitrin. Hedefiniz ne?', 'Belçika\'da çok dilli bir soyunma odası var. İletişim nasıl?', 'Bu ligdeki tempoya alışabildiniz mi?'],
};
export const ABROAD_A = {
  humble: [{ t: 'Hâlâ öğreniyorum. Takım arkadaşlarım ve teknik ekip bana çok yardımcı oluyor.', fx: { coach: 2, team: 2 } }, { t: 'Her gün biraz daha alışıyorum. Burada olmak benim için büyük bir fırsat.' }],
  bold: [{ t: 'Uyum süreci bitti. Artık fark yaratma zamanı.', fx: { fame: 1 } }, { t: 'Bu lige gol atmaya geldim ve bunu yapmaya devam edeceğim.' }],
  witty: [{ t: 'Dil biraz zor ama gol dilini herkes anlıyor.' }, { t: 'Yemeklere alıştım, şimdi sıra ligin en iyilerinden olmakta.' }],
  sharp: [{ t: 'Benim nereden geldiğime değil, sahada ne yaptığıma bakın.', fx: { coach: -1 } }],
};

export function forCountry(c) { return FOREIGN[c] || null; }
