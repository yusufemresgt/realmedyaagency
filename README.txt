REAL MEDYA AGENCY V8 - OTOMATIK YAYIN LIDERLIGI
================================================

Bu klasorde premium Real Medya Agency sitesi + backendli otomatik yayin saati takip sistemi hazir bulunur.

ICINDE NE VAR?
- Ana site sayfalari
- RealPay premium reklam panosu
- Yayin Liderleri sayfasi
- Yayinci Yonetimi paneli
- Backend API: server.js
- TikTok LIVE otomatik kontrol modulu
- JSON veritabani: data/db.json
- start.bat: Windows'ta tek tikla baslatma

LOKAL CALISTIRMA
1) Node.js LTS kur: https://nodejs.org
2) Klasoru masaustune cikar
3) start.bat dosyasina cift tikla
4) Site acilir: http://localhost:3000
5) Canli admin: http://localhost:3000/canli-admin.html

ADMIN SIFRESI
Varsayilan: real2026
Guvenlik icin .env dosyasi olusturup ADMIN_PASSWORD degerini degistir.
Ornek icin .env.example dosyasina bak.

OTOMATIK TAKIP NASIL CALISIR?
- Admin panelinden yayinci eklenir.
- TikTok kullanici adi yazilir. Ornek: batuhannsqhin0
- Otomatik takip baslatilir.
- Sistem belli araliklarla yayincinin canli olup olmadigini kontrol etmeye calisir.
- Canli baglaninca sure baslar.
- Canli bitince sure kapanir.
- RealPay puani saat x 1000 olarak hesaplanir.

ONEMLI NOT
TikTok tarafinda herkese acik resmi LIVE yayin saati API'si garanti sekilde sunulmadigi icin bu sistem tiktok-live-connector paketini kullanir. Bu baglanti TikTok tarafindaki degisikliklerden etkilenebilir. Bu yuzden admin panelinde manuel baslat/durdur ve sure duzeltme butonlari da vardir.

VERCEL NOTU
Sitenin statik bolumu Vercel'de calisir. Fakat otomatik takip surekli calisan backend istedigi icin Vercel tek basina yeterli degildir. Backend icin Render, Railway, VPS veya surekli acik bir bilgisayar gerekir.

HOSTING MANTIGI
Kolay kurulum:
- Frontend: Vercel
- Backend: Render/Railway/VPS
- Frontend'de API adresini localStorage rma_api_base olarak backend URL'sine ayarlayabilirsin.

Ornek tarayici konsolu:
localStorage.setItem('rma_api_base','https://SENIN-BACKEND-ADRESIN.onrender.com')

DOSYA YUKLEME
GitHub'a ZIP yukleme. ZIP'i cikart, icindeki dosyalari ve assets klasorunu yukle.

WHATSAPP
+90 539 834 23 01
Yetkili: Batuhan Sahin
