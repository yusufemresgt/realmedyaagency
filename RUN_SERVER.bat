@echo off
chcp 65001 >nul
setlocal EnableExtensions
cd /d "%~dp0"
title Real Medya Agency V8 - Tek Tikla Baslat

cls
echo ==================================================
echo      REAL MEDYA AGENCY V8 - TEK TIKLA BASLAT
echo ==================================================
echo.
echo Bu dosya gerekli paketleri kurar, serveri baslatir ve siteyi otomatik acar.
echo Pencere acik kalmali. Pencereyi kapatirsan lokal site/backend kapanir.
echo.

if not exist logs mkdir logs
set "LOGFILE=%CD%\logs\start-log.txt"
echo Real Medya Agency V8 start log > "%LOGFILE%"
echo Date: %DATE% %TIME% >> "%LOGFILE%"
echo Folder: %CD% >> "%LOGFILE%"
echo. >> "%LOGFILE%"

if not exist package.json (
  echo HATA: package.json bulunamadi.
  echo ZIP dosyasini once klasore cikar, sonra start.bat dosyasini calistir.
  echo Detay: Bu dosya site klasorunun icinde olmali.
  echo package.json bulunamadi >> "%LOGFILE%"
  pause
  exit /b 1
)

echo [1/4] Node.js kontrol ediliyor...
where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo HATA: Node.js kurulu degil.
  echo Simdi Node.js indirme sayfasi aciliyor. LTS surumunu kur, bilgisayari yeniden baslat, tekrar start.bat ac.
  start "" "https://nodejs.org"
  pause
  exit /b 1
)
node -v
node -v >> "%LOGFILE%" 2>&1

echo.
echo [2/4] npm kontrol ediliyor...
where npm >nul 2>nul
if errorlevel 1 (
  echo.
  echo HATA: npm bulunamadi. Node.js LTS'i tekrar kur.
  pause
  exit /b 1
)
npm -v
npm -v >> "%LOGFILE%" 2>&1

echo.
echo [3/4] Paketler kuruluyor/kontrol ediliyor...
if not exist node_modules (
  echo Ilk kurulum basladi. Internet gerekir. Bu islem 1-3 dakika surebilir.
  call npm install --no-audit --no-fund >> "%LOGFILE%" 2>&1
  if errorlevel 1 (
    echo.
    echo HATA: npm install tamamlanamadi.
    echo Detay dosyasi: logs\start-log.txt
    echo.
    type "%LOGFILE%"
    pause
    exit /b 1
  )
) else (
  echo node_modules bulundu, kurulum atlandi.
)

echo.
echo [4/4] Site baslatiliyor...
echo.
echo Site adresi:        http://localhost:3000
echo Yayinci Yonetimi adresi: http://localhost:3000/canli-admin.html
echo Admin sifresi:      real2026
echo.
echo Tarayici 3 saniye icinde otomatik acilacak...

echo Server baslatiliyor... >> "%LOGFILE%"
start "" cmd /c "timeout /t 3 /nobreak >nul & start "" "http://localhost:3000""

call npm start

echo.
echo ==================================================
echo Server durdu veya hata verdi.
echo Detay icin: logs\start-log.txt
echo ==================================================
pause
