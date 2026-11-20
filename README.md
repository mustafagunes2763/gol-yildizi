# ⚽ Gol Yıldızı

New Star Soccer tarzı, telefonda tarayıcıdan oynanan futbolcu kariyer oyunu.
17 yaşında bir forvetle Trendyol 1. Lig'de başla, Süper Lig'e ve ötesine yüksel.

## Şu an oyunda olanlar (Aşama 1)

- Oyuncu oluşturma, 1. Lig'den 3 kulüp teklifi
- 2026-27 Süper Lig (18 takım) ve 1. Lig (20 takım), çift devreli fikstür, puan durumu
- Maçlar: dakika dakika akış, sana gelen anlarda **kaydırarak şut/pas** (falso, kaleci, defans baskısı, penaltı)
- Antrenman (Şut, Pas, Hız, Teknik, Güç), enerji, moral, maaş
- Hoca kararı: kadro dışı → yedek → ilk 11
- Sezon sonu: yükselme/düşme, transfer teklifleri, sözleşme uzatma, yaşlanma
- Kayıt telefonda; Firebase ayarlanınca Google girişi, bulut kaydı ve arkadaş sıralaması

## Sıradaki aşamalar

2. Mağaza (araba, ev, eşya), menajer, ilişkiler
3. Arkadaş düelloları: penaltı, şut yarışı, bahisli düello
4. Premier Lig, La Liga, Serie A, Bundesliga, Avrupa kupaları, gerçek kadrolar, kumar mini oyunları
5. Ses, animasyon, denge ayarları

## Kurulum

### 1) Firebase projesi
1. https://console.firebase.google.com → **Proje ekle**
2. Proje ayarları → **Uygulamalarınız** → Web (`</>`) → uygulama ekle → çıkan `firebaseConfig` bilgilerini `js/firebase-config.js` dosyasına yapıştır.
3. **Authentication** → Başlayın → **Google** sağlayıcısını etkinleştir.
4. Authentication → Ayarlar → **Yetkili alanlar** → oyunun adresini ekle (ör. `kullaniciadin.github.io`).
5. **Firestore Database** → Veritabanı oluştur → **Kurallar** sekmesine `firestore.rules` içeriğini yapıştır → Yayınla.

### 2) Yayınlama (GitHub Pages)
1. Bu klasörü bir GitHub reposuna yükle.
2. Repo → **Settings → Pages** → Source: `Deploy from a branch`, Branch: `main` / `(root)` → Save.
3. Birkaç dakika sonra oyun `https://kullaniciadin.github.io/repo-adi/` adresinde açılır.

### 3) Telefona ekleme
Linki telefonda Chrome'da aç → menü (⋮) → **Ana ekrana ekle**. Uygulama gibi tam ekran açılır.

## Düzenleme

- Takım güçleri ve renkleri: `js/data.js`
- Oyun dengesi: `js/engine.js` (antrenman, maç, transfer)
- Şut/pas mini oyunu: `js/moment.js`

## Yerelde deneme

```bash
python3 -m http.server 8080
# tarayıcıda http://localhost:8080
```
