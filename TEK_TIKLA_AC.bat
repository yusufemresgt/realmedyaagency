@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title Real Medya Agency V8 - OTOMATIK BASLAT

if not exist "logs" mkdir "logs"
set "LOGFILE=%CD%\logs\start-log.txt"

echo ================================================== > "%LOGFILE%"
echo REAL MEDYA AGENCY V8 START LOG >> "%LOGFILE%"
echo Date: %DATE% %TIME% >> "%LOGFILE%"
echo Folder: %CD% >> "%LOGFILE%"
echo ================================================== >> "%LOGFILE%"
echo. >> "%LOGFILE%"

cls
echo ==================================================
echo        REAL MEDYA AGENCY V8 - OTOMATIK BASLAT
echo ==================================================
echo.
echo Bu dosya siteyi tek tikla baslatir ve tarayicida acar.
echo Server penceresi acik kalmali. Kapatirsan lokal site kapanir.
echo.
echo Log dosyasi: logs\start-log.txt
echo.

if not exist "package.json" (
  echo HATA: package.json bulunamadi.
  echo ZIP'i once cikart. start.bat dosyasini klasorun icinden calistir.
  echo HATA: package.json bulunamadi. >> "%LOGFILE%"
  echo Klasor icerigi: >> "%LOGFILE%"
  dir >> "%LOGFILE%" 2>&1
  pause
  exit /b 1
)

echo [1/5] Node.js kontrol ediliyor...
echo [1/5] Node.js kontrol ediliyor... >> "%LOGFILE%"
where node >> "%LOGFILE%" 2>&1
if errorlevel 1 (
  echo HATA: Node.js bulunamadi.
  echo Node.js LTS kurman gerekiyor. Sayfa aciliyor...
  echo HATA: Node.js bulunamadi. >> "%LOGFILE%"
  start "" "https://nodejs.org"
  pause
  exit /b 1
)
node -v
node -v >> "%LOGFILE%" 2>&1

echo.
echo [2/5] npm kontrol ediliyor...
echo [2/5] npm kontrol ediliyor... >> "%LOGFILE%"
where npm >> "%LOGFILE%" 2>&1
if errorlevel 1 (
  echo HATA: npm bulunamadi. Node.js LTS'i yeniden kur.
  echo HATA: npm bulunamadi. >> "%LOGFILE%"
  pause
  exit /b 1
)
npm -v
npm -v >> "%LOGFILE%" 2>&1

echo.
echo [3/5] Paketler kuruluyor/kontrol ediliyor...
echo [3/5] Paketler kuruluyor/kontrol ediliyor... >> "%LOGFILE%"
if not exist "node_modules\express" (
  echo Ilk kurulum basladi. Internet gerekir. 1-3 dakika surebilir.
  echo npm install basladi... >> "%LOGFILE%"
  call npm install --no-audit --no-fund
  if errorlevel 1 (
    echo.
    echo HATA: npm install basarisiz oldu.
    echo Detay icin logs\start-log.txt dosyasina bak.
    echo HATA: npm install basarisiz oldu. >> "%LOGFILE%"
    pause
    exit /b 1
  )
  echo npm install tamamlandi. >> "%LOGFILE%"
) else (
  echo node_modules bulundu. Kurulum atlandi.
  echo node_modules bulundu. Kurulum atlandi. >> "%LOGFILE%"
)

echo.
echo [4/5] 3000 portu temizleniyor...
echo [4/5] 3000 portu temizleniyor... >> "%LOGFILE%"
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do (
  echo Eski 3000 port islemi kapatiliyor: %%a
  echo Eski 3000 port islemi kapatiliyor: %%a >> "%LOGFILE%"
  taskkill /PID %%a /F >> "%LOGFILE%" 2>&1
)

echo.
echo [5/5] Server baslatiliyor...
echo [5/5] Server baslatiliyor... >> "%LOGFILE%"
echo.
echo Site adresi:        http://localhost:3000
echo Yayinci Yonetimi adresi: http://localhost:3000/canli-admin.html
echo Admin sifresi:      real2026
echo.
echo Yeni siyah SERVER penceresi acilacak. O pencereyi kapatma.
echo Tarayici otomatik aciliyor...

start "Real Medya Agency V8 SERVER - KAPATMAYIN" cmd /k "cd /d "%~dp0" && set PORT=3000 && node server.js"
timeout /t 5 /nobreak >nul
start "" "http://localhost:3000"

echo.
echo ==================================================
echo Site acildiysa bu pencereyi kapatabilirsin.
echo SERVER yazan diger siyah pencere acik kalmali.
echo Hata olursa logs\start-log.txt dosyasinin fotografini at.
echo ==================================================
echo.
pause
exit /b 0
