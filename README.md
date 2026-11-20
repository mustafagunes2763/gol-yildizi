# ⚽ Gol Yıldızı

New Star Soccer tarzı, telefonda tarayıcıdan oynanan futbolcu kariyer oyunu.
17 yaşında bir forvetle Trendyol 1. Lig'de başla, Süper Lig'e ve ötesine yüksel.

## Oyunda neler var

- 3 kayıt yuvası: bir telefonda 3 ayrı kariyer
- Gerçek 2026-27 Süper Lig ve 1. Lig kadroları (953 oyuncu), kulüp bilgileri, derbiler
- Maçlar: kaydırarak şut/pas, oyuncuyu sürükleyerek koşu; açık oyun, kontra, birebir, serbest vuruş, kafa, penaltı
- Ses, gol animasyonları, yavaş çekim tekrar
- 3 gazete (Gol Sporu, Sert Şut, Transfer Hattı), maç öncesi/sonrası röportaj
- Görünüş seçimi, antrenman, mağaza (araba, ev), ilişkiler, sevgili/evlilik, olaylar, sakatlık
- Gazino: bahis, rulet, blackjack, slot (oyun içi parayla)
- Yedek: dosya olarak indir/yükle; Firebase kurulursa Google girişiyle otomatik bulut yedeği

Oyun tamamen çevrimdışı çalışır; hesap gerekmez. Bulut yedeği isteğe bağlıdır.

## Kurulum

### 1) Yayınlama (GitHub Pages)
1. Bu klasörü bir GitHub reposuna yükle.
2. Repo → **Settings → Pages** → Source: `Deploy from a branch`, Branch: `main` / `(root)` → Save.
3. Birkaç dakika sonra oyun `https://kullaniciadin.github.io/repo-adi/` adresinde açılır.
4. Telefonda bu linki Chrome'da aç → menü (⋮) → **Ana ekrana ekle**. Bir kez açtıktan sonra internetsiz de çalışır.

### 2) (İsteğe bağlı) Firebase bulut yedeği
1. https://console.firebase.google.com → **Proje ekle**
2. Proje ayarları → **Uygulamalarınız** → Web (`</>`) → `firebaseConfig` bilgilerini `js/firebase-config.js` dosyasına yapıştır.
3. **Authentication** → Başlayın → **Google** sağlayıcısını etkinleştir.
4. Authentication → Ayarlar → **Yetkili alanlar** → `kullaniciadin.github.io` ekle.
5. **Firestore Database** → Veritabanı oluştur → **Kurallar** sekmesine `firestore.rules` içeriğini yapıştır → Yayınla.

Sonra oyunda **Ayarlar → Google ile giriş yap**. 3 kariyer de her maçtan sonra otomatik yedeklenir.

## Düzenleme

- Takım güçleri ve renkleri: `js/data.js`
- Oyun dengesi: `js/engine.js` (antrenman, maç, transfer)
- Şut/pas mini oyunu: `js/moment.js`

## Yerelde deneme

```bash
python3 -m http.server 8080
# tarayıcıda http://localhost:8080
```
