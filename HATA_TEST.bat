@echo off
cd /d "%~dp0"
title Real Medya Agency V8 - HATA TEST
if not exist logs mkdir logs
echo Klasor: %CD%
echo.
echo Dosyalar:
dir
echo.
echo Node:
node -v
echo.
echo NPM:
npm -v
echo.
echo Paket kurulumu:
call npm install --no-audit --no-fund
echo.
echo Server baslatiliyor. Site: http://localhost:3000
echo Bu pencereyi kapatma.
node server.js
pause
