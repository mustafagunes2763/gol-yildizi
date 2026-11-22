# Spiker seslendirme listesi — Bedirhan Bülent Şimşek

Her satırı klon sesle ayrı ayrı oku. Dosya adı = kimlik + `.mp3` (ör. `pre_hello_1.mp3`).
Dosyaları bana gönder; `audio/spiker/` klasörüne koyup listeye eklerim. Kaydı olmayan satırlar telefonun sesiyle okunmaya devam eder.

## 1. Öncelikli: maç önü bilgilendirme + maç sonu skor (35 dosya)

| Dosya | Metin | Ton |
|---|---|---|
| pre_hello_1 | İyi akşamlar sevgili futbolseverler, ben Bedirhan Bülent Şimşek. Maçımıza hoş geldiniz! | sıcak, tok, yayın açılışı |
| pre_hello_2 | Merhaba değerli seyirciler, Bedirhan Bülent Şimşek ile yine bir futbol gecesindeyiz. | sıcak, tok, yayın açılışı |
| pre_hello_3 | Sevgili dostlar, iyi seyirler. Mikrofonda Bedirhan Bülent Şimşek, kemerleri bağlayın! | sıcak, tok, yayın açılışı |
| pre_derby_1 | Bugün sıradan bir maç yok karşımızda. Bu bir derbi! Şehrin yarısı sevinecek, yarısı üzülecek. | sıcak, tok, yayın açılışı |
| pre_derby_2 | Derbi günü! Tribünler günler öncesinden doldu, nefesler tutuldu. | sıcak, tok, yayın açılışı |
| pre_euro_1 | Avrupa gecesindeyiz! Marş çalındı, ülkemizin gözü kulağı bu maçta. | sıcak, tok, yayın açılışı |
| pre_euro_2 | Avrupa kupalarında yine sahnedeyiz. Bu gecenin puanı ülke puanına yazılacak. | sıcak, tok, yayın açılışı |
| pre_cup_1 | Kupa gecesindeyiz! Tek maç, kaybedenin yolu burada bitiyor. | heyecanlı, vurgulu |
| pre_cup_2 | Kupa maçlarında sürpriz her zaman mümkündür. Bu akşam uzatma da var, penaltı da. | gizemli, merak uyandıran |
| pre_rival_1 | Bu maçın içinde bir maç daha var: akademiden beri süren o büyük rekabet bugün sahaya taşınıyor. | sıcak, tok, yayın açılışı |
| pre_rival_2 | İki eski akademi arkadaşı, iki ezeli rakip, bu akşam aynı çimde! | sıcak, tok, yayın açılışı |
| pre_top_1 | Zirve yarışının kritik bir haftasındayız. Bugün kaybedenin canı çok yanar. | sıcak, tok, yayın açılışı |
| pre_top_2 | Şampiyonluk kokusu alınan bir maç. Her pas, her şut altın değerinde. | sıcak, tok, yayın açılışı |
| pre_bottom_1 | Ligin alt sıralarında nefes kesen bir mücadele var. Bu üç puan hayati. | sıcak, tok, yayın açılışı |
| pre_bottom_2 | Düşme hattından uzaklaşmak için bu maç kaçırılmamalı. | sıcak, tok, yayın açılışı |
| pre_star_1 | Gözler genç golcümüzde. Son haftalarda attığı gollerle herkesin dilinde. | sıcak, tok, yayın açılışı |
| pre_star_2 | Takımın gol yükünü sırtlanan genç yıldızımız bugün de sahada. | sıcak, tok, yayın açılışı |
| pre_generic_1 | Tribünler hazır, oyuncular ısındı. Güzel bir futbol izleyeceğimize inanıyorum. | sıcak, tok, yayın açılışı |
| pre_generic_2 | Teknik direktörlerin hazırlıkları tamam. Bakalım sahada kim haklı çıkacak. | sıcak, tok, yayın açılışı |
| ft_W_1 | Ve maç sona erdi! Galibiyet bizim! | çok heyecanlı, bağırarak |
| ft_W_2 | Son düdük! Üç puan hanemize yazıldı! | çok heyecanlı, bağırarak |
| ft_W_3 | Bitti bitti bitti! Tribünler bayram yeri! | çok heyecanlı, bağırarak |
| ft_D_1 | Ve maç sona erdi. Puanlar paylaşıldı. | canlı maç anlatımı |
| ft_D_2 | Son düdük çaldı, kazanan çıkmadı. | canlı maç anlatımı |
| ft_L_1 | Ve maç sona erdi. Bugün olmadı, kafalar önde. | üzgün, alçak ses |
| ft_L_2 | Son düdük. Acı bir mağlubiyet. | üzgün, alçak ses |
| ft_skor | Skor tabelası: | net, tane tane, kısa |
| num_0 | sıfır | net, tane tane, kısa |
| num_1 | bir | net, tane tane, kısa |
| num_2 | iki | net, tane tane, kısa |
| num_3 | üç | net, tane tane, kısa |
| num_4 | dört | net, tane tane, kısa |
| num_5 | beş | net, tane tane, kısa |
| num_6 | altı | net, tane tane, kısa |
| num_7 | yedi | net, tane tane, kısa |
| num_8 | sekiz | net, tane tane, kısa |
| num_9 | dokuz | net, tane tane, kısa |

Skor şöyle birleşir: `ft_W_1` + `ft_skor` + `num_2` + `num_1` → "Ve maç sona erdi! Galibiyet bizim! Skor tabelası: iki, bir."

## 2. İsteğe bağlı: maç içi sabit cümleler (64 dosya)

Oyuncu/takım adı içeren cümleler kaydedilemez (her kariyerde değişir), onlar listede yok.

| Dosya | Metin | Ton |
|---|---|---|
| kickoff_2 | Hakem düdüğü çaldı, 90 dakikalık roman başlıyor sevgili seyirciler! | canlı maç anlatımı |
| kickoff_3 | Top yuvarlak, saha yeşil, heyecan dorukta. Başlıyoruz! | canlı maç anlatımı |
| kickoff_4 | Çekirdekler hazır mı? Çünkü maç başladı! | canlı maç anlatımı |
| weather_yagmur_1 | Bardaktan boşanırcasına yağmur var, top çimde kayıyor, kaleciler dikkat! | canlı maç anlatımı |
| weather_yagmur_2 | Yağmur altında bir futbol şöleni. Şemsiyesi olan şanslı! | canlı maç anlatımı |
| weather_kar_1 | Kar yağıyor! Turuncu top sahada, kartopu oynasak daha kolay olurdu! | canlı maç anlatımı |
| weather_kar_2 | Saha beyaz, nefesler buhar buhar. Bu maçta ayakta kalan kazanır! | canlı maç anlatımı |
| weather_gece_1 | Işıklar yandı, gece maçının büyüsü başladı! | canlı maç anlatımı |
| intro_birebir_2 | Kaleciyle baş başa! Ya şimdi ya hiç! | canlı maç anlatımı |
| intro_korner_1 | Korner! Ceza sahasında itiş kakış, hakem göz kulak olsun! | canlı maç anlatımı |
| goal_serbest_1 | GOOOL! Frikikten harika gol! Top kavis aldı, köşeye yerleşti, baraj hâlâ şaşkın! | çok heyecanlı, bağırarak |
| goal_kafa_2 | GOOOL! Müthiş yükseldi, alnının tam ortası! | çok heyecanlı, bağırarak |
| goal_rovasata_2 | AMAN ALLAHIM! Rövaşatayla gol! Akrobat mı futbolcu mu karar veremedik! | çok heyecanlı, bağırarak |
| goal_penalti_2 | GOL! Penaltıyı tereyağından kıl çeker gibi attı! | çok heyecanlı, bağırarak |
| goal_kosevurusu_2 | Kornerden müthiş orta, ağlar havalandı! | çok heyecanlı, bağırarak |
| saved_3 | Uff! Kaleci son anda uzandı, köşeden çeldi! | canlı maç anlatımı |
| miss_1 | Auta gitti! Top tribünlere hediye. | canlı maç anlatımı |
| miss_2 | Az farkla dışarıda! Direk "az kalsın" dedi. | canlı maç anlatımı |
| miss_3 | Kaçtı! Kale ile top arasında küçük bir anlaşmazlık… | canlı maç anlatımı |
| over_1 | Üstten aut! Bu şutla ancak uydu düşürülür! | canlı maç anlatımı |
| over_2 | Top tribünlerde! Taraftarlar hatıra fotoğrafı çekiyor. | canlı maç anlatımı |
| post_1 | DİREK! Metal ses hâlâ kulaklarımızda! | canlı maç anlatımı |
| blocked_1 | Defans araya girdi, şut bloke! | canlı maç anlatımı |
| blocked_2 | Ve barajdan döndü, duvar yerinde durdu! | canlı maç anlatımı |
| offside_1 | Bayrak havada! Ofsayt. Bir adım erken, bir adım fazla! | canlı maç anlatımı |
| offside_2 | Yan hakem bayrağı kaldırdı, ofsayt! Tribünlerden ıslıklar… | canlı maç anlatımı |
| foulPen_1 | Ceza sahasında düştü! Hakem beyaz noktayı gösteriyor, PENALTI! | canlı maç anlatımı |
| appealNothing_1 | Hakem elini salladı, devam! İtiraz kabul edilmedi. | canlı maç anlatımı |
| halftime_1 | İlk yarı bitti. Çay simit molası! | canlı maç anlatımı |
| halftime_2 | Devre arası. Teknik direktör soyunma odasında konuşmasını hazırlıyor. | canlı maç anlatımı |
| build_acik_2_2 | Sağa, sola… boşluk arıyorlar… | canlı maç anlatımı |
| build_acik_3_1 | Rakip ataktan döndü, top bizde… | canlı maç anlatımı |
| build_kontra_1_2 | Kafayla uzaklaştırdık! | canlı maç anlatımı |
| build_birebir_1_2 | Defansın arkasına uzun top… | canlı maç anlatımı |
| build_birebir_2_2 | Pas geldi, tam zamanında… | canlı maç anlatımı |
| build_serbest_1_3 | Düdük! Tehlikeli bölgede frikik! | canlı maç anlatımı |
| build_serbest_2_1 | Ceza sahası yayında faul! | canlı maç anlatımı |
| build_serbest_2_2 | Rakipler baraj kuruyor… | canlı maç anlatımı |
| build_kafa_1_2 | Adamını geçti, çizgiye indi… | canlı maç anlatımı |
| build_kafa_2_2 | Kafasını kaldırdı… | canlı maç anlatımı |
| build_korner_1_1 | Şut! Defanstan sekti… | canlı maç anlatımı |
| build_korner_1_2 | Korner! | canlı maç anlatımı |
| build_korner_2_2 | Herkes ceza sahasında… | canlı maç anlatımı |
| build_rovasata_1_1 | Ceza sahasında karambol… | canlı maç anlatımı |
| build_rovasata_1_2 | Top havaya sekti… | canlı maç anlatımı |
| build_rovasata_2_3 | Havada! Akrobasi zamanı! | canlı maç anlatımı |
| build_uzuntop_1_2 | Kafasını kaldırdı, uzun vurdu… | canlı maç anlatımı |
| build_duvar_2_3 | Şimdi ya da hiç! | canlı maç anlatımı |
| build_kosevurusu_1_1 | Şut! Defanstan sekti… | canlı maç anlatımı |
| build_kosevurusu_1_2 | Korner kararı! | canlı maç anlatımı |
| build_kosevurusu_2_2 | Uzun boylular ceza sahasında… | canlı maç anlatımı |
| build_vole_1_1 | Korner sonrası top uzaklaştırıldı… | canlı maç anlatımı |
| build_vole_1_2 | Top havada dönüyor… | canlı maç anlatımı |
| build_vole_2_2 | Top havalandı… | canlı maç anlatımı |
| build_arkadirek_1_2 | Kafasını kaldırdı, ceza sahasına bakıyor… | canlı maç anlatımı |
| build_arkadirek_2_2 | Orta ön direği aşacak… | canlı maç anlatımı |
| build_balik_1_2 | Alçak ve sert çevirecek… | canlı maç anlatımı |
| build_balik_2_2 | Top sert geliyor, yerden yarım metre! | canlı maç anlatımı |
| build_balik_2_3 | Balıklama zamanı! | canlı maç anlatımı |
| build_pres_2_1 | Top auta çıktı, taç rakibin… | canlı maç anlatımı |
| build_pres_2_2 | Taç atışı kısa kullanıldı… | canlı maç anlatımı |
| build_penalti_1_3 | Hakem beyaz noktayı gösteriyor! PENALTI! | canlı maç anlatımı |
| build_penalti_2_1 | Ceza sahasında el! | canlı maç anlatımı |
| build_penalti_2_2 | Hakem VAR'ı dinliyor… | canlı maç anlatımı |
