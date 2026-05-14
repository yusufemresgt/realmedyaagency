REAL MEDYA AGENCY V16 - CANLI SITE DATA FIX

Bu surumde Vercel canlı sitesinde backend API calismazsa ana sayfa liderlik tablosu otomatik olarak data/db.json dosyasindan okunur.

Canli sitede gorsellerin/isimlerin gorunmesi icin GitHub'a su dosyalari yukleyin:
- data/db.json
- uploads klasoru
- assets klasoru
- index.html
- script.js
- style.css

Onemli:
Canli Vercel sitesindeki admin paneli kalici kayit yapmaz. Gercek online yonetim icin backend Render/Railway/VPS uzerinde calismalidir. Lokal START_SITE.bat ile yaptiginiz degisiklikler data/db.json ve uploads klasorune kaydedilir; bunlari GitHub'a yuklerseniz canli siteye yansir.
