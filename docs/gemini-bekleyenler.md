# Gemini'den bekleyenler

Gemini kotası dolunca kalan işler. Promptlar aşağıda, sırayla gönderilecek.

## Gazete fotoğrafları (2 kaldı) — 4:3
Şablon:
```
Newspaper sports photo, 4:3, grainy press photo look, slightly desaturated. A footballer seen as a dark backlit silhouette against stadium floodlights, [SAHNE]. Fictional player, plain kit with no logos or sponsor text, no readable text anywhere, no real people.
```
- [ ] `arguing angrily with a referee who is holding up a card`  → img/news/referee.jpg
- [ ] `walking through the stadium tunnel toward the bright pitch, seen from behind` → img/news/tunnel.jpg

Gelenler: cheer, slide, sad, trophy, sign, penmiss, injury, press, training ✅

## Mağaza görselleri (Aşama 2) — 4:3
Arabalar:
```
Studio product photo of a fictional car, 4:3, dark gradient background, dramatic rim lighting, 3/4 front view, glossy reflections on the floor. [ARABA]. No brand logos, no badges, no license plate text, no readable text.
```
- [ ] `a small, slightly used silver hatchback city car`
- [ ] `a clean dark-blue family sedan`
- [ ] `a large black luxury SUV`
- [ ] `a sleek red two-door sports coupe`
- [ ] `a low, aggressive yellow supercar with scissor doors`
- [ ] `a futuristic matte-black hypercar with glowing light strips`

Evler:
```
Real-estate photo of a fictional home in Istanbul, 4:3, golden hour light, inviting and aspirational. [EV]. No people, no readable text, no logos.
```
- [ ] `a small modest studio apartment interior with a single bed and a tiny kitchen`
- [ ] `a modern two-bedroom apartment living room with city view`
- [ ] `a luxury high-rise residence apartment with floor-to-ceiling windows overlooking the sea`
- [ ] `a large modern villa with a pool and garden`
- [ ] `a historic white Ottoman-style waterfront mansion (yalı) on the Bosphorus with a private pier`

## Karakterler (Aşama 2) — 1:1
```
Semi-realistic digital painting portrait, head and shoulders, 1:1, dark neutral background, soft studio lighting, consistent illustrated mobile-game character style. [KİŞİ]. Fictional person, not resembling any real celebrity, no text, no logos.
```
- [ ] `a sharp football agent in his 50s, slicked-back grey hair, expensive navy suit, phone in hand, sly smile`
- [ ] `a stern Turkish football head coach in his late 50s, short grey beard, dark club tracksuit, arms crossed`
- [ ] `a friendly female sports journalist in her 30s holding a microphone`
- [ ] `a warm Turkish mother in her late 40s, headscarf optional, kind smile`
- [ ] `a proud Turkish father in his early 50s, moustache, flat cap`
- [ ] `an elegant woman in her mid-20s, long dark hair, confident smile`
- [ ] `a sporty woman in her mid-20s, blonde ponytail, casual style`
- [ ] `a stylish woman in her mid-20s, curly red hair, artistic look`

## Veri
- [ ] Premier Lig kadroları — İLK DENEME REDDEDİLDİ (2024-25 verisi geldi: Wolves/West Ham/Leicester/Southampton
      vardı, Brentford/Coventry/Hull/Leeds yoktu; Salah, Trossard, Onana, Asensio, Ndidi gibi Süper Lig'e geçenler
      eski takımlarında; 8 oyuncu iki takımda). Sıkı promptla takım takım tekrar istendi.
      ✅ Arsenal (kontrol edildi) → data/pl-kadrolar.csv. Kalan 19 takım: avl bou bre bha che cov cry eve ful hul ips lee liv mci mun new nfo sun tot
- [ ] La Liga, Serie A, Bundesliga kadroları — Aşama 4
- [x] Süper Lig + 1. Lig kadroları
- [x] Kulüp bilgileri
- [x] Türkçe karakterli isimler
