# Gemini'den bekleyenler

Gemini kotası dolunca kalan işler. Promptlar aşağıda, sırayla gönderilecek.

## ÖNCELİK SIRASI (2026-11-21)
1. Gazete fotoğrafları (3) — hemen kullanılır
2. Muhabir portreleri (6) — röportaj kartında
3. Karakterler (7) — hoca, menajer, aile, sevgili adayları
4. Mağaza (11) — EN SON
(Lig kadroları görsellerden sonra.)

## 1) Gazete fotoğrafları — 4:3
Şablon:
```
Newspaper sports photo, 4:3, grainy press photo look, slightly desaturated. A footballer seen as a dark backlit silhouette against stadium floodlights, [SAHNE]. Fictional player, plain kit with no logos or sponsor text, no readable text anywhere, no real people.
```
- [x] `arguing angrily with a referee who is holding up a card` → img/news/referee.jpg
- [x] `walking through the stadium tunnel toward the bright pitch, seen from behind` → img/news/tunnel.jpg
- [x] `in mid-air performing an acrobatic bicycle kick, upside down, ball just leaving his foot` → img/news/bicycle.jpg

Gelenler: cheer, slide, sad, trophy, sign, penmiss, injury, press, training ✅
Ek set ✅: fans, coach, airport, header, freekick, wedding, empty, paparazzi (paparazzi: araba ızgarası ve ayakkabı logosu bulanıklaştırıldı; header: top deseni bulanıklaştırıldı)
- [x] Kumarbaz → img/news/gambler.jpg — `Newspaper paparazzi photo, 4:3, grainy press photo look, harsh flash, dim smoky casino at night. A young footballer in a dark shirt sitting at a roulette/card table with stacks of chips, head in hands after a big loss, dealer and other gamblers as blurred silhouettes. Fictional people, no logos, no readable text, no real people.` (NEWS_PHOTOS setine eklenecek)

## 2) Muhabir portreleri — 1:1
Şablon:
```
Semi-realistic digital painting portrait, head and shoulders, 1:1, dark neutral background, soft studio lighting, consistent illustrated mobile-game character style. [KİŞİ]. Fictional person, not resembling any real celebrity, no text, no logos.
```
- [x] Selin Arıkan → img/people/selin.jpg — `a polite, analytical female sports journalist in her early 30s, neat dark bob haircut, glasses, notebook and pen in hand, calm attentive expression`
- [x] Kenan "Bomba" Sarp → img/people/kenan.jpg — `a provocative tabloid sports reporter in his 40s, messy dark hair, stubble, leather jacket, holding a recorder forward, mischievous grin`
- [x] Duygu Ateş → img/people/duygu.jpg — `a glamorous celebrity gossip reporter in her late 20s, long wavy auburn hair, bold red lipstick, stylish outfit, holding a smartphone, excited curious expression`
- [ ] Rıza Tekin → img/people/riza.jpg — `a retired football legend turned TV pundit in his early 60s, white hair, thick grey moustache, tweed blazer, warm wise fatherly smile`
- [ ] Berk Yılmazer → img/people/berk.jpg — `a fast-talking transfer-news journalist in his early 30s, slick short hair, trendy glasses, earbuds, phone pressed to his ear, sharp eager look`
- [ ] Nur Karaca → img/people/nur.jpg — `an energetic live TV sports presenter in her late 20s, sleek black ponytail, blazer, holding a TV microphone, big bright smile`

## 3) Karakterler — 1:1 ✅ (gerçekçi basın fotoğrafı tarzıyla yeniden yapıldı; img/people/*.jpg)
Not: coach.jpg gerçek kulüp hocası yerine kullanılmıyor (gerçek kişiye uydurma yüz olmasın); sadece ek antrenman olayında.
- [ ] `a stern Turkish football head coach in his late 50s, short grey beard, dark club tracksuit, arms crossed` → img/people/coach.jpg
- [ ] `a sharp football agent in his 50s, slicked-back grey hair, expensive navy suit, phone in hand, sly smile` → img/people/agent.jpg
- [ ] `a warm Turkish mother in her late 40s, headscarf optional, kind smile` → img/people/mother.jpg
- [ ] `a proud Turkish father in his early 50s, moustache, flat cap` → img/people/father.jpg
- [ ] `an elegant woman in her mid-20s, long dark hair, confident smile` → img/people/partner0.jpg
- [ ] `a sporty woman in her mid-20s, blonde ponytail, casual style` → img/people/partner1.jpg
- [ ] `a stylish woman in her mid-20s, curly red hair, artistic look` → img/people/partner2.jpg

## 4) Mağaza görselleri — 4:3 (EN SON)
Arabalar:
```
Studio product photo of a fictional car, 4:3, dark gradient background, dramatic rim lighting, 3/4 front view, glossy reflections on the floor. [ARABA]. No brand logos, no badges, no license plate text, no readable text.
```
- [ ] `a small, slightly used silver hatchback city car` → img/shop/car1.jpg
- [ ] `a clean dark-blue family sedan` → car2
- [ ] `a large black luxury SUV` → car3
- [ ] `a sleek red two-door sports coupe` → car4
- [ ] `a low, aggressive yellow supercar with scissor doors` → car5
- [ ] `a futuristic matte-black hypercar with glowing light strips` → car6

Evler:
```
Real-estate photo of a fictional home in Istanbul, 4:3, golden hour light, inviting and aspirational. [EV]. No people, no readable text, no logos.
```
- [ ] `a small modest studio apartment interior with a single bed and a tiny kitchen` → house1
- [ ] `a modern two-bedroom apartment living room with city view` → house2
- [ ] `a luxury high-rise residence apartment with floor-to-ceiling windows overlooking the sea` → house3
- [ ] `a large modern villa with a pool and garden` → house4
- [ ] `a historic white Ottoman-style waterfront mansion (yalı) on the Bosphorus with a private pier` → house5

## Veri
- [x] Premier Lig kadroları — İLK DENEME REDDEDİLDİ (2024-25 verisi geldi: Wolves/West Ham/Leicester/Southampton
      vardı, Brentford/Coventry/Hull/Leeds yoktu; Salah, Trossard, Onana, Asensio, Ndidi gibi Süper Lig'e geçenler
      eski takımlarında; 8 oyuncu iki takımda). Sıkı promptla takım takım tekrar istendi.
      ✅ Arsenal, Hull, Ipswich, Leeds, Liverpool, Man City, Man Utd, Newcastle, Forest, Tottenham, Sunderland (kontrol edildi; şüpheli transferler web ile doğrulandı)
      Tüm 20 PL takımı gerçek kadrolu ✅ (grup1 + grup2, 2026-11-21)
      ✅ Arsenal (kontrol edildi) → data/pl-kadrolar.csv + js/kadrolar.js. Kalan 19 takım: avl bou bre bha che cov cry eve ful hul ips lee liv mci mun new nfo sun tot
      Premier Lig oyunda AKTİF (2026-11-21): kadrosu gelmeyen takımlarda geçici İngilizce uydurma isimler var; gelen kadro eski kayıtlara da otomatik yüklenir.
      Avrupa kupası yabancı takımları (61 takım) da gerçek kadro bekliyor. Gelen CSV'ler: python3 tools/kadro_ekle.py dosya.csv --yaz
- [ ] La Liga, Serie A, Bundesliga kadroları — Aşama 4
- [x] Süper Lig + 1. Lig kadroları
- [x] Kulüp bilgileri
- [x] Türkçe karakterli isimler

## Konferans Ligi kadroları (2026-11-21 eklendi)
- [ ] 34 KL takımı + 14 ön eleme rakibi şimdilik uydurma isimli. Aynı CSV promptuyla istenebilir.
  KL: ata frb mon get bra aja twe gnt stv jab pao agf fck fcm fcn brn pfs lug thu hea mjb haj czv ucr kai csk kup bor rig egn kau lri ies ibe
  Eleme rakipleri: rap leg mta par ros bas yb shr gor rij mal lud fcsb qar

## La Liga (2026-11-21 eklendi) — 12 yeni takım uydurma isimli
- [x] ath sev val osa ray esp ala elc lvt dep rac mlg — gerçek kadrolar geldi (2026-11-21)
- Sonra sırayla: Serie A, Bundesliga, Ligue 1

## Yeni gazete fotoğrafları (2026-11-21) — 4:3, aynı şablon
- [x] proposal, baby, divorce, family, radio, captain, documentary, podcast ✅


## Serie A / Bundesliga / Ligue 1
- 35 takımın kadrosu eklendi (Kasım 2026). 27 transfer çakışması yeni kadro lehine çözüldü.

## Gol sevinçleri (2026-11-22) — 4:3 ✅ (takım: tribün afişindeki logo, imza: Avrupa kupası afişi, taraftar: tribün yazısı bulanıklaştırıldı) → img/news/celeb_<id>.jpg
Şablon (gazete fotoğraflarıyla aynı stil):
```
Sports press photo, 4:3, realistic, shallow depth of field, stadium floodlights at night, crowd blurred in the background. A young footballer in a plain red kit with no logos, no sponsor text and no readable numbers, [SAHNE]. His face is turned away from the camera or hidden by motion blur. Fictional people, no real people, no club badges, no readable text anywhere.
```
- [x] taraftar → `sprinting towards the stand with arms wide open, fans leaning over the barrier reaching to hug him`
- [x] takim → `buried under a pile of celebrating teammates in the same plain red kit, group hug near the corner flag`
- [x] forma → `swinging his shirt over his head bare-chested, the referee running in from the side reaching for his pocket`
- [x] rakip → `standing in front of the rival stand with a finger pressed to his lips, rival fans in blue scarves booing behind a fence`
- [x] imza → `doing a signature pose on one knee, pointing both index fingers up to the sky, camera flashes in the stands`
- [x] kalp → `making a heart shape with his hands towards the family seats in the stand, a woman and a small child waving back (both blurred)`
- [x] diz → `knee-sliding on wet grass with arms spread, water spraying from the turf, seen from a low angle`
- [x] sakin → `walking back to the centre circle with palms raised apologetically, not celebrating, opposing fans applauding respectfully`
Not: Fotoğraf gelince js/celebrate.js içindeki CELEB_IMAGES setine id eklenir; maç akışında ve Paslaş'ta görünür.

## Gazete + Paslaş görselleri (2026-11-22) — 4:3 → img/news/<id>.jpg
Şablon A (gazete/maç):
```
Sports press photo, 4:3, realistic, natural light or stadium floodlights, shallow depth of field. [SAHNE]. Fictional people only, faces turned away, blurred or out of frame. No logos, no sponsor text, no club badges, no readable text or numbers anywhere.
```
- [x] hattrick_ball → `a footballer in a plain white kit walking off the pitch from behind with the match ball tucked under his arm, teammates patting his back`
- [x] striker_other → `a striker in a plain blue kit sliding on his knees after scoring, seen from behind, fans celebrating in the stand`
- [x] scoreboard → `a big stadium scoreboard at night, digits deliberately blurred, floodlights and mist`
- [x] bus → `a team bus arriving at a stadium at dusk, fans with scarves and red flares lining the road`
- [x] tifo → `a huge colourful fan choreography covering a whole stand, abstract shapes and stripes, no letters`
- [x] analysis → `a football analyst desk with two laptops showing abstract heatmaps and passing networks, coffee cup, tactics board behind`
- [x] medical → `a footballer doing a medical test on a treadmill with sensors and a breathing mask, doctors' backs in the foreground`
- [x] awayfans → `a small away section in heavy rain, fans in hooded jackets holding scarves above their heads`

Şablon B (Paslaş, telefon fotoğrafı havası):
```
Smartphone social media photo, 4:3, candid, warm natural colours, slightly imperfect framing. [SAHNE]. Fictional people only, faces hidden, turned away or cropped. No logos, no brand names, no readable text.
```
- [x] soc_mirror → `a mirror selfie in a modern locker room, the phone covering the face, plain training kit`
- [x] soc_challenge → `a football flying into a metal rubbish bin on a training pitch, shot from low angle, players cheering in the background`
- [x] soc_kidfan → `a small boy seen from behind in a plain red football shirt holding up a signed shirt in a stadium stand`
- [x] soc_charity → `a footballer from behind handing a teddy bear to a child in a bright hospital playroom, nurses smiling (faces blurred)`
- [x] soc_portrait → `a pencil portrait drawing of a young footballer pinned on an easel in a small art studio, pencils and eraser shavings on the table`
- [x] soc_tickets → `a hand holding two football match tickets in front of a stadium entrance (no text on the tickets)`
- [x] soc_dinner → `a romantic restaurant table for two by a window with city lights, candles and wine glasses, couple's hands only`
- [ ] soc_boat → `a small private boat on the Bosphorus at sunset, a couple seen from behind on the deck`
- [x] soc_paris → `a couple seen from behind in front of the Eiffel Tower at night, holding hands`
- [ ] soc_balloon → `hot air balloons over the fairy chimneys of Cappadocia at sunrise, taken from inside a balloon basket`
- [ ] soc_movie → `a cosy sofa with a blanket, a pizza box and a TV glowing in a dark living room`

## Ahmet Akyurt paylaşımları (2026-11-22) — 4:3 → img/news/ahmet_<id>.jpg
Gemini'ye img/people/ahmet.jpg dosyasını referans olarak ekle. Şablon:
```
Smartphone social media photo, 4:3, realistic. The same young man as in the reference photo: about 19, Turkish, dark brown curly hair styled up on top with short faded sides, thick dark eyebrows, light stubble, brown eyes, slim athletic build, confident half-smile. [SAHNE]. No logos, no brand names, no club badges, no readable text.
```
- [ ] ahmet_gym → `lifting a heavy dumbbell in a modern gym, sweaty, serious look in the mirror`
- [ ] ahmet_goal → `celebrating a goal with a finger on his lips, wearing a plain navy blue kit, stadium floodlights behind`
- [ ] ahmet_training → `alone on a training pitch at dusk, a row of footballs lined up, taking a shot`
- [ ] ahmet_car → `leaning against a shiny black sports car with no visible logo, sunglasses, evening city street`
- [ ] ahmet_yacht → `relaxing on a yacht deck in summer with sunglasses, turquoise sea`
- [ ] ahmet_trophy → `kissing a generic silver trophy with no text, confetti falling, plain navy blue kit`
- [ ] ahmet_mirror → `a locker room mirror selfie, phone in hand, smug smile, plain navy blue training top`
