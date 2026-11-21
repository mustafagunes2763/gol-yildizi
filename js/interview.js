// Röportajlar: kendine has tarzı olan muhabirler, duruma göre sorular,
// 4 tonda cevap (mütevazı / iddialı / esprili / sert) + konuşmayı reddetme.
// Cevaplar hoca, takım, taraftar, sevgili ve basınla ilişkiyi etkiler; bazıları ertesi gün gazetede.
import { clamp, pick, sortedTable } from './engine.js';
import { clip, ek } from './news.js';
import { isDerby, clubInfo } from './data.js';
import * as Social from './social.js';

const UP = (s) => s.toLocaleUpperCase('tr-TR');
const fill = (t, v) => t.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? '');

// ---------- muhabirler ----------
export const REPORTERS = {
  selin: {
    name: 'Selin Arıkan', outlet: 'Gol Sporu', paper: 'golsporu', icon: '📝', style: 'Kibar ve analitik',
    hello: ['Merhaba, birkaç dakikanı alabilir miyim?', 'Öncelikle geçmiş olsun yorgunluğun, kısa bir sorum var.', 'Tebrikler, hemen soralım:'],
    react: { humble: 'Selin başını sallayarak not alıyor.', bold: 'Selin kaşlarını kaldırdı: "Cesur sözler."', witty: 'Selin gülmemek için kendini zor tuttu.', sharp: 'Selin bir an duraksadı, kalemi havada kaldı.', refuse: 'Selin anlayışla gülümsedi: "Başka zaman."' },
  },
  kenan: {
    name: 'Kenan "Bomba" Sarp', outlet: 'Sert Şut', paper: 'sertsut', icon: '💣', style: 'Provokatör, iğneleyici',
    hello: ['Bir saniye, bir saniye! Kaçma hemen!', 'Kenan Sarp, Sert Şut. Zor bir sorum var.', 'Kameraya bak bakalım, şimdi şöyle:'],
    react: { humble: 'Kenan sıkılmış görünüyor: "Klasik cevap…"', bold: 'Kenan sırıttı: "İşte manşet bu!"', witty: 'Kenan istemeden güldü: "Bunu yazacağım."', sharp: 'Kenan\'ın gözleri parladı: "Harika, harika!"', refuse: 'Kenan arkandan bağırdı: "Kaçıyor musun?!"' },
  },
  duygu: {
    name: 'Duygu Ateş', outlet: 'Sert Şut Magazin', paper: 'sertsut', icon: '📸', style: 'Magazinci, özel hayat meraklısı',
    hello: ['Canım bir dakika! Futbol değil, hayat soracağım!', 'Flaşlar senin için patlıyor, bir sorum var:', 'Magazin dünyası seni konuşuyor, biliyor musun?'],
    react: { humble: 'Duygu hayal kırıklığıyla iç çekti: "Sıkıcısın!"', bold: 'Duygu heyecanla telefonuna yazıyor.', witty: 'Duygu kahkaha attı: "Bayıldım!"', sharp: 'Duygu geri çekildi: "Tamam, tamam, sakin!"', refuse: 'Duygu omuz silkti: "Sessizlik de haberdir tatlım."' },
  },
  riza: {
    name: 'Rıza Tekin', outlet: 'Eski futbolcu, TV yorumcusu', paper: 'golsporu', icon: '🎓', style: 'Usta, öğüt veren',
    hello: ['Evlat, gel bakalım bir konuşalım.', 'Ben de bu sahalarda çok ter döktüm, söyle bakalım:', 'Genç adam, bir futbolcu gözüyle soruyorum:'],
    react: { humble: 'Rıza Tekin memnun: "Aferin evlat, böyle kal."', bold: 'Rıza Tekin güldü: "Bizim zamanımızda da böyleleri vardı."', witty: 'Rıza Tekin kahkahayı bastı: "Sen adamsın!"', sharp: 'Rıza Tekin başını iki yana salladı: "Bu dil sana yakışmadı."', refuse: 'Rıza Tekin omzunu sıvazladı: "Anlıyorum, dinlen."' },
  },
  berk: {
    name: 'Berk Yılmazer', outlet: 'Transfer Hattı', paper: 'transfer', icon: '📱', style: 'Transfer kulisi, sürekli telefon başında',
    hello: ['Telefonum susmuyor, senin adın geçiyor. Bir soru:', 'Kulislerde ciddi iddialar var, net soruyorum:', 'Menajerinle de konuştum aslında ama senden duymak istiyorum:'],
    react: { humble: 'Berk telefonuna bakıp mırıldandı: "Yani kapı kapalı değil…"', bold: 'Berk hemen bir mesaj attı: "Bu çok büyük!"', witty: 'Berk güldü: "Bunu kulis notlarına koyuyorum."', sharp: 'Berk telefonu cebine koydu: "Peki, peki."', refuse: 'Berk not aldı: "Yorum yok… bu da bir cevap."' },
  },
  nur: {
    name: 'Nur Karaca', outlet: 'Spor kanalı canlı yayın', paper: 'golsporu', icon: '📺', style: 'Hızlı, enerjik, canlı yayın',
    hello: ['Canlı yayındayız! Hemen soralım:', 'Merhaba, izleyicilerimiz sizi bekliyor!', 'Nefes nefesesin ama kısa bir soru:'],
    react: { humble: 'Nur stüdyoya döndü: "Olgun bir açıklama!"', bold: 'Nur kameraya döndü: "Duydunuz mu?!"', witty: 'Nur gülerek: "Stüdyo da kırıldı gülmekten!"', sharp: 'Nur gergin bir gülümsemeyle: "Yayına dönelim…"', refuse: 'Nur kameraya döndü: "Oyuncumuz konuşmak istemedi."' },
  },
};
export const TONES = {
  humble: { label: 'Mütevazı', icon: '🙏' },
  bold: { label: 'İddialı', icon: '💪' },
  witty: { label: 'Esprili', icon: '😄' },
  sharp: { label: 'Sert', icon: '🔥' },
};
// Tonların temel etkileri (bağlam bunlara eklenir)
const BASE_FX = {
  humble: { morale: 2, coach: 3, team: 2 },
  bold: { morale: 3, fans: 3, fame: 1, team: -1 },
  witty: { morale: 2, fans: 2, fame: 2 },
  sharp: { morale: 1, fans: 2, fame: 1 },
};

// ---------- sorular + cevaplar (bağlama göre) ----------
// q: { muhabir: [sorular] }  ·  a: { ton: [{ t, ...bayraklar }] }
// bayraklar: target ('opp' | 'ref' | 'coach' | 'team' | 'press' | 'partner' | 'board'), promise, fx (ek etki), partner (sevgili +/-)
const C = {
  // ===== MAÇ ÖNCESİ =====
  debut: {
    q: { riza: ['İlk maçın, ilk heyecanın. Dizlerin titriyor mu evlat?'], nur: ['Profesyonel kariyerinin ilk maçı! Neler hissediyorsun?'], selin: ['Kariyerinin ilk maçı öncesi hedefin ne?'] },
    a: {
      humble: [{ t: 'Burada olmak bile bir rüya. Hocamın güvenini boşa çıkarmayacağım.' }, { t: 'Öğrenecek çok şeyim var, abilerimden öğreneceğim.' }],
      bold: [{ t: 'İlk maçımda ilk golümü atacağım, not alın!', promise: true }, { t: 'Bu forma bana küçük gelecek, büyük işler yapacağım.' }],
      witty: [{ t: 'Annem tribünde, gol atmazsam eve almaz, mecburum!' }, { t: 'Heyecandan kramponlarımı ters giymeyeyim yeter.' }],
      sharp: [{ t: 'Beni yeterince erken oynatmadılar, bunu sahada göstereceğim.', target: 'coach' }],
    },
  },
  derby: {
    q: { kenan: ['{rakip} taraftarı seni hiç sevmiyor. Korkuyor musun?', 'Derbide kaybederseniz bu şehirde yaşayabilecek misin?'], nur: ['Derbi öncesi taraftara mesajın ne?'], riza: ['Derbi başka maçtır evlat. Hazır mısın?'] },
    a: {
      humble: [{ t: '{rakip} büyük bir camia. Saygı duyuyoruz ama sahada her şeyimizi vereceğiz.' }, { t: 'Derbi derbidir, taraftarımız için savaşacağız.' }],
      bold: [{ t: 'Bu derbiyi biz kazanacağız ve golü ben atacağım!', promise: true }, { t: 'Derbiler büyük oyuncuların maçıdır. Kendimi göstereceğim.' }],
      witty: [{ t: 'Korkmak mı? Ben sadece annemin terliğinden korkarım.' }, { t: 'Derbide kaybetmeyi hiç denemedim, merak da etmiyorum.' }],
      sharp: [{ t: '{rakip} bizden korksun. Sahada ezeceğiz onları!', target: 'opp' }, { t: '{rakip} taraftarının ıslıkları beni sadece motive eder.', target: 'opp' }],
    },
  },
  stronger: {
    q: { selin: ['{rakip} kâğıt üstünde daha güçlü. Şansınızı nasıl görüyorsun?'], kenan: ['Herkes {rakip} kazanır diyor. Havlu atmaya hazır mısınız?'], nur: ['Zorlu {rakip} deplasmanı… Sürpriz yapabilir misiniz?'] },
    a: {
      humble: [{ t: 'Favori onlar, doğru. Ama futbol 90 dakika, elimizden geleni yapacağız.' }],
      bold: [{ t: 'Kâğıt üstünde maç oynanmıyor. Sürpriz yapacağız, göreceksiniz.' }, { t: 'Gol atarsam bu maç biter. Atacağım da.', promise: true }],
      witty: [{ t: 'Kâğıt üstünde güçlüyse kâğıtta oynasınlar, biz çimde oynuyoruz.' }],
      sharp: [{ t: '{rakip} şişirilmiş bir takım. Sahada konuşuruz.', target: 'opp' }],
    },
  },
  weaker: {
    q: { selin: ['{rakip} karşısında favorisiniz. Rehavet tehlikesi var mı?'], kenan: ['{rakip} ile oynamak senin için antrenman gibi mi?'], nur: ['Bugün kaç gol bekleyelim?'] },
    a: {
      humble: [{ t: 'Ligde kolay maç yok. {rakip} her takımı zorlayabilir.' }],
      bold: [{ t: 'Bugün gol yağmuru var, en az bir tanesi benden.', promise: true }],
      witty: [{ t: 'Kaç gol mü? Skorbord yeterince büyükse çok!' }],
      sharp: [{ t: 'Açık konuşayım, bu maçı kaybedersek ayıp olur. Fark atmalıyız.', target: 'opp' }],
    },
  },
  lossStreak: {
    q: { kenan: ['Üst üste yenilgiler… Takımda huzursuzluk var diyorlar, doğru mu?', 'Taraftar hocanın gitmesini istiyor. Sen ne diyorsun?'], selin: ['Kötü seriyi nasıl kırmayı düşünüyorsunuz?'], riza: ['Kötü gidişat ne zaman biter evlat?'] },
    a: {
      humble: [{ t: 'Kötü günler geçecek. Birbirimize sarılacağız.', fx: { team: 3 } }],
      bold: [{ t: 'Bu seriyi bugün ben bitireceğim.', promise: true }],
      witty: [{ t: 'Kötü seri dizi gibi; sezon finalinde mutlu son var.' }],
      sharp: [{ t: 'Bazı arkadaşlar sahada yeterince mücadele etmiyor.', target: 'team' }, { t: 'Taktik sorunları var, bunu herkes görüyor.', target: 'coach' }],
    },
  },
  winStreak: {
    q: { nur: ['Seriye bağladınız! Bu takımı ne durdurur?'], selin: ['Galibiyet serisinin sırrı ne?'], kenan: ['Seri yaptınız diye havalara girmiyorsunuz değil mi?'] },
    a: {
      humble: [{ t: 'Takım ruhu. Herkes birbiri için koşuyor.', fx: { team: 2 } }],
      bold: [{ t: 'Bizi kimse durduramaz. Bu seri uzayacak.' }],
      witty: [{ t: 'Sırrı mı? Soyunma odasında aynı şarkıyı dinliyoruz, değiştirmeyeceğiz.' }],
      sharp: [{ t: 'Bizi küçümseyenler şimdi susuyor, değil mi?', target: 'press' }],
    },
  },
  titleRace: {
    q: { nur: ['Zirve yarışındasınız! Şampiyonluk konuşuluyor mu soyunma odasında?'], kenan: ['Şampiyonluğu kaldırabilecek misiniz yoksa yine son virajda mı düşeceksiniz?'], selin: ['{pos}. sıradasınız. Hedef değişti mi?'] },
    a: {
      humble: [{ t: 'Maç maç bakıyoruz. Şampiyonluğu konuşmak için erken.' }],
      bold: [{ t: 'Şampiyon olacağız. Bunu ilk ben söylüyorum.', fx: { fans: 3 } }],
      witty: [{ t: 'Kupanın yerini vitrinde ayarladık bile, toz almayı unutmayın.' }],
      sharp: [{ t: 'Bizi hiç kimse ciddiye almadı, şimdi herkes bizi konuşuyor.', target: 'press' }],
    },
  },
  relegation: {
    q: { kenan: ['Düşme hattındasınız. Bu takım ligde kalabilir mi?'], selin: ['Alt sıralardan çıkış için ne yapmalı?'], riza: ['Evlat, düşme hattı ağır bir yük. Nasıl taşıyorsunuz?'] },
    a: {
      humble: [{ t: 'Zor durumdayız ama bu formayı ligde tutmak boynumuzun borcu.', fx: { fans: 2 } }],
      bold: [{ t: 'Bu takım düşmeyecek. Gollerimle kurtaracağım.', promise: true }],
      witty: [{ t: 'Aşağıdan bakınca manzara güzel değil, yukarı çıkacağız.' }],
      sharp: [{ t: 'Yönetim bu kadroyu kurarken bunu düşünecekti.', target: 'board' }],
    },
  },
  rumor: {
    q: { berk: ['Büyük bir kulübün seni izlediği konuşuluyor. Gitmek ister misin?', 'Avrupa\'dan izleyici geldiği söyleniyor. Kapı açık mı?'], kenan: ['Aklın başka takımda mı? Taraftar merak ediyor.'] },
    a: {
      humble: [{ t: 'Şu an tek düşüncem bu forma. Gerisini menajerim konuşur.', fx: { fans: 2, coach: 2 } }],
      bold: [{ t: 'Büyük kulüpler beni istiyorsa doğru yoldayım demektir.', rumor: true }],
      witty: [{ t: 'Beni izleyenler varsa umarım iyi açıdan çekiyorlardır.' }],
      sharp: [{ t: 'Bu dedikodular beni yoruyor. Oyuna odaklanmama izin verin.', target: 'press' }],
    },
  },
  backInjury: {
    q: { riza: ['Sakatlıktan döndün evlat. Bacak nasıl?'], selin: ['Uzun bir aradan sonra dönüyorsun. Hazır mısın?'], nur: ['Sakatlık sonrası ilk maç! Heyecanlı mısın?'] },
    a: {
      humble: [{ t: 'Sağlık ekibimize çok teşekkür ederim. Yavaş yavaş ritim bulacağım.', fx: { team: 2 } }],
      bold: [{ t: 'Eskisinden daha güçlü döndüm. Kaybettiğim zamanı gollerle çıkaracağım.', promise: true }],
      witty: [{ t: 'Bacağım iyi, asıl tribünde maç izlemekten kalbim yoruldu.' }],
      sharp: [{ t: 'Beni erken yazanlar yanıldı. Bunu göstereceğim.', target: 'press' }],
    },
  },
  backBan: {
    q: { kenan: ['Cezan bitti. Hakemlerle aran nasıl, yine kırmızı görecek miyiz?'], selin: ['Ceza sonrası dönüş. Dersini aldın mı?'], riza: ['Evlat, o kırmızıyı bir daha görmeyelim, söz mü?'] },
    a: {
      humble: [{ t: 'Takımımı yalnız bıraktım, özür dilerim. Daha sakin olacağım.', fx: { coach: 3, team: 3 } }],
      bold: [{ t: 'Döndüm ve çok açım. Bugün bunun bedelini rakip ödeyecek.' }],
      witty: [{ t: 'Tribünden maç izlemek iyiymiş ama sahadaki yerimi daha çok seviyorum.' }],
      sharp: [{ t: 'O kırmızı haksızdı, hâlâ öyle düşünüyorum.', target: 'ref' }],
    },
  },
  magazin: {
    q: { duygu: ['{sevgili} ile ilişkiniz ciddi mi? Düğün ne zaman?', 'Yeni {araba} ile gece kulübünün önünde görüntülendin! Ne diyorsun?', 'Sosyal medyada çok konuşuluyorsun. Hayatında biri var mı?'] },
    a: {
      humble: [{ t: 'Özel hayatımı konuşmak istemem, saygı gösterirseniz sevinirim.' }],
      bold: [{ t: 'Hayatım da futbolum gibi: hızlı ve göz alıcı!', fx: { fame: 3, coach: -2 } }],
      witty: [{ t: 'Gece kulübü mü? Ben orada sadece müziğe hücum ediyordum.' }, { t: 'Düğün tarihi mi? Önce sezon fikstürüne bakmam lazım.' }],
      sharp: [{ t: 'Benim özel hayatım sizi ilgilendirmez. Futbol sorun.', target: 'press' }],
    },
    partner: { humble: 3, bold: -2, witty: 2, sharp: 1 },
  },
  casino: {
    q: { kenan: ['Gazinoda büyük paralar kaybettiğin konuşuluyor. Doğru mu?'], duygu: ['Gece masalarda seni görmüşler, şanslı mıydın bari?'] },
    a: {
      humble: [{ t: 'Hata yaptım, kabul ediyorum. Odak noktam futbol.', fx: { coach: 2, fans: 2 } }],
      bold: [{ t: 'Kazandığımı da harcarım, kaybettiğimi de. Kimseyi ilgilendirmez.', fx: { fans: -3 } }],
      witty: [{ t: 'Ruletin de bir taktiği var, henüz çözemedim.' }],
      sharp: [{ t: 'Bu iftiraları yazan gazete özür dileyecek!', target: 'press' }],
    },
  },
  preGeneric: {
    q: { selin: ['{rakip} maçı öncesi neler söylemek istersin?', 'Bugün nasıl bir oyun bekliyorsun?'], nur: ['Taraftarlara kısa bir mesaj?'], riza: ['Evlat, bugün ne yapacaksın bakalım?'], kenan: ['Son maçlarda pek göz doldurmadın. Bugün ne değişecek?'] },
    a: {
      humble: [{ t: 'Rakibe saygı duyuyoruz. Sahada elimizden geleni yapacağız.' }, { t: 'Hocamızın planını uygulamaya çalışacağız.' }],
      bold: [{ t: 'Bugün gol atacağım, buna eminim!', promise: true }, { t: 'Bugün sahada beni izleyin, pişman olmayacaksınız.' }],
      witty: [{ t: 'Hava güzel, çim yeşil, top yuvarlak. Gol atmamak ayıp olur.' }, { t: 'Rakip kaleciyi önceden uyarıyorum: bugün ağların yorulacak.' }],
      sharp: [{ t: '{rakip} bizden korksun. Bu maçı farklı alacağız!', target: 'opp' }],
    },
  },

  // ===== MAÇ SONRASI =====
  red: {
    q: { kenan: ['Takımını 10 kişi bıraktın! Bu sinir ne?'], selin: ['Kırmızı kart görmek bu maçı nasıl etkiledi sence?'], riza: ['Evlat, o hareket neydi öyle?'] },
    a: {
      humble: [{ t: 'Takımımdan ve taraftarımızdan özür dilerim. Bir daha olmayacak.', fx: { coach: 4, team: 4, fans: 2 } }],
      bold: [{ t: 'Tutkuyla oynuyorum, bazen taşıyor. Ama bu ben değilim, döneceğim.' }],
      witty: [{ t: 'Erken duşa girdim, en azından sıcak su vardı.', fx: { coach: -2 } }],
      sharp: [{ t: 'Kart haksızdı. Hakem baştan beri bize karşıydı!', target: 'ref' }],
    },
  },
  bicycle: {
    q: { nur: ['O RÖVAŞATA! Nasıl yaptın onu?!'], riza: ['Evlat, o golü ben bile atamazdım. Nasıl oldu?'], selin: ['Akrobatik bir gol attın. Antrenmanda çalışıyor muydun?'] },
    a: {
      humble: [{ t: 'İçgüdüsel bir hareketti. Ortayı yapan arkadaşımın golü bu.', fx: { team: 4 } }],
      bold: [{ t: 'Böyle goller her gün atılmaz ama ben atarım.', fx: { fame: 3 } }],
      witty: [{ t: 'Bilmiyorum, gözlerimi açtığımda top ağlardaydı!' }],
      sharp: [{ t: 'Beni küçümseyenler bu golü tekrar tekrar izlesin.', target: 'press' }],
    },
  },
  hattrick: {
    q: { nur: ['HAT-TRICK! Topu eve götürüyorsun! Ne hissediyorsun?'], selin: ['Üç gol, inanılmaz bir performans. Bu senin kariyerinin en iyi maçı mı?'], kenan: ['3 gol attın, şimdi bonservisin ne kadar oldu sence?'], berk: ['Hat-trick sonrası telefonum çıldırdı. Menajerin aradı mı?'] },
    a: {
      humble: [{ t: 'Arkadaşlarım topu bana tepside sundu. Bu top hepimizin.', fx: { team: 5 } }],
      bold: [{ t: 'Bu daha başlangıç. Gol krallığı benim olacak.', fx: { fame: 3 } }],
      witty: [{ t: 'Topu eve götürüyorum ama annem yine "ayakkabıyla girme" diyecek.' }],
      sharp: [{ t: 'Benim yedek oturduğum maçları hatırlıyor musunuz? İşte cevabım.', target: 'coach' }],
    },
  },
  missedPen: {
    q: { kenan: ['Penaltıyı kaçırdın. Topun başına geçmek senin bencilliğin miydi?'], selin: ['Kaçan penaltı sonrası neler hissediyorsun?'], riza: ['Penaltı kaçırmayan futbolcu yoktur evlat. Kafana takma, ne diyorsun?'] },
    a: {
      humble: [{ t: 'Takımımdan özür dilerim. Bir dahaki penaltıda daha güçlü olacağım.', fx: { team: 2, fans: 2 } }],
      bold: [{ t: 'Bir daha penaltı olsa yine ben atarım. Bu işi bilirim.' }],
      witty: [{ t: 'Kaleci benden önce hangi köşeye atacağımı bildi, falcıya gitmiş olmalı.' }],
      sharp: [{ t: 'Zemin berbattı, ayağım kaydı. Bu sahada futbol oynanmaz.', target: 'board' }],
    },
  },
  derbyWin: {
    q: { nur: ['DERBİ BİZİM! Taraftarlara ne söylemek istersin?'], kenan: ['{rakip} taraftarına bir mesajın var mı?'], riza: ['Derbi kazanmak gibisi yok, değil mi evlat?'] },
    a: {
      humble: [{ t: 'Taraftarımıza armağan olsun. {rakip} de iyi mücadele etti.', fx: { fans: 3 } }],
      bold: [{ t: 'Bu şehir bizim! Derbilerin adamı olacağım.', fx: { fans: 5 } }],
      witty: [{ t: '{rakip} taraftarına geçmiş olsun, haftaya iyileşirler.' }],
      sharp: [{ t: '{rakip} maçtan önce çok konuştu. Şimdi sussunlar!', target: 'opp' }],
    },
  },
  derbyLoss: {
    q: { kenan: ['Derbiyi kaybettiniz. Bu şehirde sokağa çıkabilecek misin?'], selin: ['Derbi yenilgisi sonrası taraftara ne söylersin?'] },
    a: {
      humble: [{ t: 'Taraftarımızdan özür dileriz. Bu acıyı unutturacağız.', fx: { fans: 3 } }],
      bold: [{ t: 'Rövanşta onlara bunu ödeteceğim.' }],
      witty: [{ t: 'Bu akşam evden çıkmıyorum, pizza sipariş ediyorum.' }],
      sharp: [{ t: 'Hakem derbiyi {rakip} lehine yönetti, herkes gördü!', target: 'ref' }],
    },
  },
  brace: {
    q: { nur: ['İki gol! Gecenin yıldızı sensin!'], selin: ['İki golle maçın adamı oldun. Hangisi daha güzeldi?'], berk: ['İki gol daha… Değerin her maç artıyor, farkında mısın?'] },
    a: {
      humble: [{ t: 'Goller güzel ama asıl önemli olan üç puan.', fx: { team: 3 } }],
      bold: [{ t: 'İkisi de güzeldi ama üçüncüsü daha güzel olacaktı, süre yetmedi.' }],
      witty: [{ t: 'İkisini de anneme hediye ediyorum, kardeşim kıskanmasın diye.' }],
      sharp: [{ t: 'Benden şüphe edenler varsa bir daha düşünsün.', target: 'press' }],
    },
  },
  winner: {
    q: { nur: ['Galibiyet golü senden! Nasıl bir duygu?'], selin: ['Golünle takımın kazandı. Ne hissediyorsun?'], riza: ['Kritik golü attın evlat, golcü dediğin böyle olur. Ne dersin?'] },
    a: {
      humble: [{ t: 'Takım arkadaşlarım olmasa bu gol olmazdı. Hepimizin galibiyeti.', fx: { team: 5 } }],
      bold: [{ t: 'Kritik anlarda ben varım. Büyük kulüplere hazırım.', rumor: true, fx: { team: -3 } }],
      witty: [{ t: 'Golü attım, şimdi de anneme söz verdiğim gibi sebzelerimi yiyeceğim.' }],
      sharp: [{ t: 'Beni yedekte bırakmak isteyenlere en iyi cevap bu gol.', target: 'coach' }],
    },
  },
  goal: {
    q: { selin: ['Golünü nasıl anlatırsın?'], nur: ['Gol attın! Sevincini anlat!'], kenan: ['Gol attın ama takım {sonuc}. Golün bir anlamı var mı?'] },
    a: {
      humble: [{ t: 'Gol güzel ama takım olarak daha iyisini yapmalıyız.', fx: { team: 2 } }],
      bold: [{ t: 'Gol yollarında ben varım. Seri başlıyor.' }],
      witty: [{ t: 'Gol sevincimi bir haftadır aynanın karşısında çalışıyordum.' }],
      sharp: [{ t: 'Ben görevimi yaptım, diğerlerine sorun.', target: 'team' }],
    },
  },
  assist: {
    q: { selin: ['Gol atamadın ama asistin harikaydı. Yeter mi?'], riza: ['Pas vermek de golcülüktür evlat. Bencil değilsin, ne güzel.'] },
    a: {
      humble: [{ t: 'Arkadaşım attı, sanki ben atmışım gibi sevindim.', fx: { team: 5 } }],
      bold: [{ t: 'Gol de atarım, attırırım da. Tam forvetim.' }],
      witty: [{ t: 'Asist yaptım, golü atan da bana yemek ısmarlayacak, anlaşmamız var.' }],
      sharp: [{ t: 'Gol atabilirdim ama kimse bana top vermiyor.', target: 'team' }],
    },
  },
  bigLoss: {
    q: { kenan: ['{skor}! Bu bir felaket. Utanç verici değil mi?', 'Bu skordan sonra taraftarın yüzüne nasıl bakacaksın?'], selin: ['{rakip} karşısında ağır bir yenilgi. Ne oldu?'] },
    a: {
      humble: [{ t: 'Sorumluluk hepimizin. Toparlanıp güçlü döneceğiz.', fx: { team: 3, coach: 2, fans: 2 } }],
      bold: [{ t: 'Bu bir kaza. Haftaya bu takımı herkes başka görecek.' }],
      witty: [{ t: 'Skor tabelası bugün bozuktu, öyle diyelim.', fx: { fans: -3 } }],
      sharp: [{ t: 'Bazı arkadaşlar yeterince koşmadı, bunu konuşacağız.', target: 'team' }, { t: 'Taktik baştan yanlıştı, söyleyecek başka şey yok.', target: 'coach' }],
    },
  },
  lost: {
    q: { selin: ['Yenilgi sonrası ne söylemek istersin?'], kenan: ['Yine kaybettiniz. Sorun nerede?'], riza: ['Kaybetmek de futbolun parçası evlat. Ne öğrendin?'] },
    a: {
      humble: [{ t: 'Kaybettik ama bu takım çok çalışkan. Döneceğiz.', fx: { team: 2 } }],
      bold: [{ t: 'Bir maç kaybettik, savaşı değil.' }],
      witty: [{ t: 'Bugün top bizi sevmedi. Yarın çiçek alıp gönlünü yapacağım.' }],
      sharp: [{ t: 'Hakem maçı katletti, başka söze gerek yok!', target: 'ref' }],
    },
  },
  draw: {
    q: { selin: ['Beraberliği nasıl değerlendiriyorsun?'], kenan: ['Bir puan… Yetiyor mu size?'], nur: ['Bir puanla döndünüz. Mutlu musun?'] },
    a: {
      humble: [{ t: 'Deplasmanda ya da evde, bir puan her zaman değerlidir.' }],
      bold: [{ t: 'Kazanmamız gereken bir maçtı. Bundan sonra beraberlik yok.' }],
      witty: [{ t: 'Berabere bitti, kimse küsmedi, güzel bir gün.' }],
      sharp: [{ t: 'Bu puanı kaybettiren hatalar konuşulmalı.', target: 'coach' }],
    },
  },
  poor: {
    q: { kenan: ['Bugün sahada yok gibiydin. Kendini nasıl değerlendiriyorsun?'], riza: ['Evlat, bugün senin günün değildi. Ne oldu?'], selin: ['Formunun düştüğü söyleniyor. Katılıyor musun?'] },
    a: {
      humble: [{ t: 'Haklısınız, kötü oynadım. Antrenmanda daha çok çalışacağım.', fx: { fans: 2, coach: 2 } }],
      bold: [{ t: 'Herkesin kötü günü olur. Haftaya bambaşka biri olacağım.' }],
      witty: [{ t: 'Bugün ikizim oynadı, ben evdeydim.' }],
      sharp: [{ t: 'Hoca beni doğru pozisyonda oynatmıyor.', target: 'coach' }],
    },
  },
  great: {
    q: { selin: ['Gol atamadın ama maçın en iyisiydin. Gol eksikliği üzüyor mu?'], nur: ['Harika oynadın! Tek eksik gol müydü?'] },
    a: {
      humble: [{ t: 'Takım kazandıysa gol atmasam da olur.', fx: { team: 3 } }],
      bold: [{ t: 'Gol atamadığım için mutsuzum, gelecek maç atacağım.' }],
      witty: [{ t: 'Gol atmadım çünkü kaleciyi üzmek istemedim. Bir dahakine acımam.' }],
      sharp: [{ t: 'Daha çok top gelse çok gol atarım.', target: 'team' }],
    },
  },
  benched: {
    q: { kenan: ['Bugün yine kulübedeydin. Hocayla bir sorun mu var?'], berk: ['Az süre alıyorsun. Ayrılmayı düşünüyor musun?'], riza: ['Kulübe de futbolun parçası evlat. Sabredebilecek misin?'] },
    a: {
      humble: [{ t: 'Hocamın kararlarına saygı duyuyorum. Antrenmanda kendimi göstereceğim.', fx: { coach: 4 } }],
      bold: [{ t: 'Daha fazla süre hak ediyorum. Fırsat verilirse göstereceğim.', fx: { coach: -2 } }],
      witty: [{ t: 'Kulübenin minderleri çok rahat, sorun yok… şimdilik.' }],
      sharp: [{ t: 'Bu durum böyle devam ederse başka yerlere bakarım.', target: 'coach', rumor: true }],
    },
  },
  oppRed: {
    q: { kenan: ['Rakip 10 kişi kaldı. Rakibi oyundan sen mi attırdın?'], selin: ['Rakibin kırmızı kartı maçı nasıl etkiledi?'] },
    a: {
      humble: [{ t: 'Futbolda bunlar olur. Arkadaşa geçmiş olsun.' }],
      bold: [{ t: 'Beni durdurmanın tek yolu faul, onu da gördük.' }],
      witty: [{ t: 'Onu ben atmadım, hızım attı.' }],
      sharp: [{ t: 'O oyuncu baştan beri beni sakatlamaya çalışıyordu.', target: 'opp' }],
    },
  },
  postGeneric: {
    q: { selin: ['Maçı nasıl değerlendiriyorsun?'], nur: ['Maç sonu ilk sözler senden!'], riza: ['Bugünkü maçı bir futbolcu gözüyle anlat evlat.'] },
    a: {
      humble: [{ t: 'Önemli olan takımın kazanması. Maç maç bakıyoruz.' }],
      bold: [{ t: 'Daha iyisini yapabilirdim, yapacağım da.' }],
      witty: [{ t: 'Taraftarımız harikaydı, ben de fena değildim, öyle diyelim.' }],
      sharp: [{ t: 'Bazı kararlar anlaşılır değildi. Söylemesem olmaz.', target: 'ref' }],
    },
  },
};

// Hedefe göre ek etki (sert cevaplar)
const TARGET_FX = {
  opp: { fans: 4, fame: 1 },
  ref: { fans: 2, money: -150000 },
  coach: { coach: -10, fans: 1 },
  team: { team: -12, morale: -3, fans: -2 },
  press: { fans: 1, fame: 1, press: -10 },
  board: { coach: -4, fans: 2, money: -50000 },
  partner: {},
};

// ---------- seçim ----------
function myPos(state) {
  const lid = state.leagues ? Object.keys(state.leagues).find((l) => state.leagues[l].includes(state.player.clubId)) : null;
  if (!lid) return null;
  const t = sortedTable(state.season.leagues[lid].table);
  return { pos: t.findIndex((r) => r.id === state.player.clubId) + 1, n: t.length };
}
function weighted(list) {
  let r = Math.random() * list.reduce((a, [, w]) => a + w, 0);
  for (const [k, w] of list) if ((r -= w) < 0) return k;
  return list[0][0];
}
function vars(state, plan, res) {
  const p = state.player, opp = state.teams[plan.fx.opp], me = state.teams[p.clubId];
  const cars = { car1: 'hatchback', car2: 'sedan', car3: 'lüks SUV', car4: 'spor coupe', car5: 'süper spor', car6: 'hiper araba' };
  const car = (p.owned || []).map((id) => cars[id]).filter(Boolean).pop();
  const P = myPos(state);
  return {
    ad: p.surname, rakip: opp.name, takim: me.name, sehir: clubInfo(me.id).sehir || 'bu şehir',
    sevgili: p.partner?.name || 'sevgilin', araba: car || 'araban', pos: P?.pos ?? '',
    skor: res ? `${res.myGoals}-${res.oppGoals}` : '', sonuc: res ? ({ W: 'kazandı', D: 'berabere kaldı', L: 'kaybetti' })[res.result] : '',
  };
}
function build(state, plan, ctxKey, when, res) {
  const c = C[ctxKey];
  const p = state.player;
  const rid = pick(Object.keys(c.q));
  const R = REPORTERS[rid];
  const v = vars(state, plan, res);
  p.press ||= {};
  const mood = p.press[rid] ?? 50;
  const answers = Object.keys(TONES).map((tone) => {
    const a = pick(c.a[tone]);
    return { ...a, tone, text: fill(a.t, v) };
  });
  for (let i = answers.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [answers[i], answers[j]] = [answers[j], answers[i]]; }
  return {
    when, ctx: ctxKey, rid, reporter: R.name, outlet: R.outlet, icon: R.icon, style: R.style,
    hello: mood < 35 ? 'Geçen sefer pek konuşkan değildin… Bakalım bu sefer?' : mood > 70 ? 'Seninle konuşmak her zaman keyifli!' : pick(R.hello),
    q: fill(pick(c.q[rid]), v), answers, partnerFx: c.partner,
  };
}

// ---------- maç öncesi ----------
export function preInterview(state, plan) {
  if (plan.role === 'out') return null;
  const p = state.player, me = state.teams[p.clubId], opp = state.teams[plan.fx.opp];
  const derby = isDerby(me.id, opp.id);
  if (!derby && Math.random() > 0.6) return null;
  const P = myPos(state), week = state.season.week;
  const form = (p.form || []).slice(-3);
  const opts = [];
  if (p.career.apps === 0) opts.push(['debut', 50]);
  if (derby) opts.push(['derby', 40]);
  if (p.backFrom === 'injury') opts.push(['backInjury', 30]);
  if (p.backFrom === 'ban') opts.push(['backBan', 30]);
  if (form.length >= 2 && form.slice(-2).every((r) => r === 'L')) opts.push(['lossStreak', 14]);
  if (form.length >= 3 && form.every((r) => r === 'W')) opts.push(['winStreak', 12]);
  if (P && week >= 10 && P.pos <= 3) opts.push(['titleRace', 10]);
  if (P && week >= 8 && P.pos > P.n - 4) opts.push(['relegation', 10]);
  if ((p.fame || 0) >= 40) opts.push(['rumor', 7]);
  if (p.partner || (p.owned || []).some((id) => id.startsWith('car'))) opts.push(['magazin', 6]);
  if ((p.casinoWeek || 0) < -500000) opts.push(['casino', 12]);
  if (opp.str >= me.str + 4) opts.push(['stronger', 8]);
  if (opp.str <= me.str - 4) opts.push(['weaker', 8]);
  opts.push(['preGeneric', 8]);
  delete p.backFrom;
  return build(state, plan, weighted(opts), 'pre');
}

// ---------- maç sonrası ----------
export function postInterview(state, plan, res) {
  const p = state.player;
  const opp = state.teams[plan.fx.opp], me = state.teams[p.clubId];
  if (!res.played) {
    if (plan.injured || plan.suspended || Math.random() > 0.45) return null;
    return build(state, plan, 'benched', 'post', res);
  }
  const derby = isDerby(me.id, opp.id);
  const diff = res.myGoals - res.oppGoals;
  let key;
  if (res.red) key = 'red';
  else if (res.bicycle) key = 'bicycle';
  else if (res.goals >= 3) key = 'hattrick';
  else if (res.penMissed && Math.random() < 0.7) key = 'missedPen';
  else if (derby && res.result === 'W') key = 'derbyWin';
  else if (derby && res.result === 'L') key = 'derbyLoss';
  else if (res.goals === 2) key = 'brace';
  else if (res.goals >= 1 && res.result === 'W' && diff === 1) key = 'winner';
  else if (diff <= -3) key = 'bigLoss';
  else if (res.goals >= 1) key = 'goal';
  else if (res.assists >= 1) key = 'assist';
  else if (res.outcomes?.some((o) => o === 'foulPen' || o === 'foulFk') && Math.random() < 0.3) key = 'oppRed';
  else if (res.rating <= 5.6) key = 'poor';
  else if (res.rating >= 7.3) key = 'great';
  else if (plan.role === 'sub' && Math.random() < 0.5) key = 'benched';
  else if (res.result === 'L') key = 'lost';
  else if (res.result === 'D') key = 'draw';
  else key = 'postGeneric';
  return build(state, plan, key, 'post', res);
}

// ---------- cevabın sonucu ----------
export function applyAnswer(state, iv, ans) {
  const p = state.player;
  p.fans ??= 50; p.press ||= {};
  const fx = { ...BASE_FX[ans.tone] };
  for (const src of [ans.target ? TARGET_FX[ans.target] : null, ans.fx]) {
    if (src) for (const [k, v] of Object.entries(src)) fx[k] = (fx[k] || 0) + v;
  }
  // sert cevaba taraftar her zaman alkış tutmaz
  if (ans.tone === 'sharp' && Math.random() < 0.3) fx.fans = (fx.fans || 0) - 5;
  if (iv.partnerFx && p.partner) fx.partner = iv.partnerFx[ans.tone] || 0;
  const pressD = (fx.press || 0) + (ans.tone === 'witty' ? 4 : ans.tone === 'humble' ? 2 : ans.tone === 'bold' ? 3 : 0);
  p.press[iv.rid] = clamp((p.press[iv.rid] ?? 50) + pressD, 0, 100);
  apply(p, fx);

  const v = { ad: p.surname, AD: UP(p.surname) };
  const quote = ans.text;
  const R = REPORTERS[iv.rid];
  const news = [];
  if (ans.target === 'ref') news.push(clip(state, 'sertsut', {
    headline: `${UP(ek(p.surname, 'abl'))} HAKEME ATEŞ PÜSKÜRDÜ`, sub: 'Disiplin kurulu sevk ve para cezası kapıda',
    body: `${ek(R.name, 'dat')} konuşan ${p.surname}, "${quote}" diyerek hakemi sert dille eleştirdi. Federasyonun oyuncuya para cezası vermesi bekleniyor.`,
    caption: `${p.surname} hakem kararlarına itiraz ederken`, pose: 'stand', photo: 'referee',
  }));
  if (ans.target === 'team') news.push(clip(state, 'sertsut', {
    headline: 'SOYUNMA ODASINDA KRİZ!', sub: `${p.surname} takım arkadaşlarını hedef aldı`,
    body: `"${quote}" sözleri takım içinde büyük rahatsızlık yarattı. Kaptanın konuyla ilgili ${p.surname} ile görüşeceği öğrenildi.`,
    caption: 'Oyuncular sessizce stadı terk etti', pose: 'sad',
  }));
  if (ans.target === 'coach') news.push(clip(state, 'sertsut', {
    headline: `${v.AD} HOCAYA KAFA TUTTU`, sub: 'Teknik direktörle arası açılabilir',
    body: `${R.outlet} mikrofonuna "${quote}" diyen ${p.surname}, teknik heyetin tepkisini çekti.`,
    caption: `${p.surname} maç sonunda`, pose: 'sad', photo: 'coach',
  }));
  if (ans.target === 'opp' && Math.random() < 0.7) news.push(clip(state, 'sertsut', {
    headline: `${UP(ek(p.surname, 'abl'))} OLAY SÖZLER!`, sub: 'Rakip cephe bu sözlere sessiz kalmayacak',
    body: `${p.surname}, ${ek(R.name, 'dat')} yaptığı açıklamada "${quote}" dedi. Rakip oyuncuların bu sözleri soyunma odasına astığı iddia edildi.`,
    caption: `${p.surname} basın karşısında`, pose: 'stand',
  }));
  if (ans.target === 'board') news.push(clip(state, 'sertsut', {
    headline: `${v.AD} YÖNETİMİ HEDEF ALDI`, sub: 'Kulüp yönetimi açıklamadan rahatsız',
    body: `"${quote}" diyen ${p.surname}, kulüp yönetimini eleştirdi. Kulüp içinden oyuncuya ihtar verilebileceği konuşuluyor.`,
    caption: `${p.surname} basın toplantısında`, pose: 'stand',
  }));
  if (ans.target === 'press' && Math.random() < 0.5) news.push(clip(state, 'sertsut', {
    headline: `${v.AD} BASINA ÇATTI`, sub: `${R.name} ile gergin anlar`,
    body: `Röportaj sırasında gerilen ${p.surname}, "${quote}" diyerek basını eleştirdi.`,
    caption: `${p.surname} röportaj sırasında`, pose: 'stand',
  }));
  if (ans.rumor && Math.random() < 0.6) news.push(clip(state, 'transfer', {
    headline: `${v.AD}: "BÜYÜK KULÜPLERE HAZIRIM"`, sub: 'Genç golcüden menajerlere açık mesaj',
    body: `${ek(R.name, 'dat')} konuşan ${p.surname}, "${quote}" diyerek transfer kapısını araladı. Kulislerde birçok kulübün oyuncuyu takip ettiği konuşuluyor.`,
    caption: `${p.surname} basın toplantısında`, pose: 'stand',
  }));
  if (ans.tone === 'witty' && Math.random() < 0.3) news.push(clip(state, R.paper === 'transfer' ? 'golsporu' : R.paper, {
    headline: `${v.AD} GÜLDÜRDÜ!`, sub: 'Röportajdaki esprisi sosyal medyada gündem oldu',
    body: `${ek(R.name, 'gen')} sorusuna "${quote}" cevabını veren ${p.surname}, sosyal medyada en çok paylaşılan isim oldu.`,
    caption: `${p.surname} röportaj sırasında gülerken`, pose: 'stand', photo: 'press',
  }));
  if (iv.ctx === 'magazin' && Math.random() < 0.5) news.push(clip(state, 'sertsut', {
    headline: `${v.AD} MAGAZİN GÜNDEMİNDE`, sub: p.partner ? `${p.partner.name} ile ilgili sorulara cevap verdi` : 'Özel hayatıyla ilgili sorulara cevap verdi',
    body: `${ek(R.name, 'dat')} konuşan ${p.surname}: "${quote}"`,
    caption: `${p.surname} flaşlar arasında`, pose: 'stand', photo: 'paparazzi',
  }));
  try { Social.onInterview(state, ans); } catch { /* sosyal medya isteğe bağlı */ }
  return { news, summary: effectSummary(fx), react: R.react[ans.tone] };
}

// Konuşmayı reddetme
export function refuse(state, iv) {
  const p = state.player;
  p.press ||= {};
  p.press[iv.rid] = clamp((p.press[iv.rid] ?? 50) - 12, 0, 100);
  const fx = { fans: -1 };
  const R = REPORTERS[iv.rid];
  const news = [];
  if (iv.when === 'post' && Math.random() < 0.2) fx.money = -50000;
  if (iv.rid === 'kenan' || Math.random() < 0.25) news.push(clip(state, 'sertsut', {
    headline: `${UP(p.surname)} SUSTU!`, sub: fx.money ? 'Basın toplantısına çıkmadı, para cezası geliyor' : 'Basının sorularını cevapsız bıraktı',
    body: `${ek(R.name, 'gen')} sorularını yanıtsız bırakan ${p.surname}, stadı hızla terk etti. Bu sessizliğin ardında ne var?`,
    caption: `${p.surname} stadı terk ederken`, pose: 'stand',
  }));
  apply(p, fx);
  return { news, summary: effectSummary(fx) || 'Basına konuşmadın', react: R.react.refuse };
}

function apply(p, fx) {
  if (fx.morale) p.morale = clamp(p.morale + fx.morale, 0, 100);
  if (fx.fans) p.fans = clamp(p.fans + fx.fans, 0, 100);
  if (fx.fame) p.fame = clamp(p.fame + fx.fame, 0, 100);
  if (fx.money) p.money += fx.money;
  if (p.rel) for (const k of ['coach', 'team']) if (fx[k]) p.rel[k] = clamp(p.rel[k] + fx[k], 0, 100);
  if (fx.partner && p.partner) p.partner.value = clamp(p.partner.value + fx.partner, 0, 100);
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
        headline: `${AD} SÖZÜNÜ TUTTU!`, sub: 'Maç öncesi gol sözü vermişti, attı da',
        body: `Maç öncesi iddialı konuşan ${p.surname}, sahada da sözünün arkasında durdu. Taraftar genç golcüye bayılıyor.`,
        caption: `${p.surname} sözünü tuttuktan sonra tribünü selamlıyor`,
      }));
    } else if (res.played) {
      p.fans = clamp((p.fans ?? 50) - 4, 0, 100); p.morale = clamp(p.morale - 3, 0, 100);
      out.push(clip(state, 'sertsut', {
        headline: `BOŞ KONUŞTU, ${AD}!`, sub: 'Gol sözü vermişti, tutamadı',
        body: `Maç öncesi büyük konuşan ${p.surname} sahada sözünü tutamadı. Sosyal medyada alay konusu oldu.`,
        caption: `${p.surname} hayal kırıklığı içinde`, pose: 'sad',
      }));
    }
  }
  if (plan.provoke && res.result === 'L') {
    p.fans = clamp((p.fans ?? 50) - 5, 0, 100);
    out.push(clip(state, 'sertsut', {
      headline: `${UP(state.teams[plan.fx.opp].name)} ${UP(ek(p.surname, 'acc'))} SUSTURDU`, sub: 'Maç öncesi iddialı sözler pahalıya patladı',
      body: `Maç öncesi rakibe meydan okuyan ${p.surname} ve takımı sahadan mağlup ayrıldı. Rakip oyuncular maç sonu bu sözlere gönderme yaptı.`,
      caption: `${p.surname} maç sonunda başı önde`, pose: 'sad',
    }));
  } else if (plan.provoke && res.result === 'W' && res.goals > 0) {
    p.fans = clamp((p.fans ?? 50) + 4, 0, 100);
    out.push(clip(state, 'golsporu', {
      headline: `${AD} DEDİĞİNİ YAPTI!`, sub: 'Maç öncesi meydan okumuştu, sahada da kazandı',
      body: `Rakibe sert sözlerle meydan okuyan ${p.surname}, attığı golle sözlerinin arkasında durdu.`,
      caption: `${p.surname} gol sevincinde`, pose: 'cheer', photo: 'cheer',
    }));
  }
  return out;
}

function effectSummary(fx) {
  const parts = [];
  const sg = (n) => (n > 0 ? '+' : '') + n;
  if (fx.morale) parts.push(`Moral ${sg(fx.morale)}`);
  if (fx.fans) parts.push(`Taraftar ${sg(fx.fans)}`);
  if (fx.fame) parts.push(`Ün ${sg(fx.fame)}`);
  if (fx.coach) parts.push(`Hoca ${sg(fx.coach)}`);
  if (fx.team) parts.push(`Takım ${sg(fx.team)}`);
  if (fx.partner) parts.push(`Sevgili ${sg(fx.partner)}`);
  if (fx.money) parts.push(`Ceza ₺${Math.abs(fx.money).toLocaleString('tr-TR')}`);
  return parts.join(' · ');
}
