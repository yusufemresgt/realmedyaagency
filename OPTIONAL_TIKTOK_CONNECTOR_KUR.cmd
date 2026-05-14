@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title REAL MEDYA AGENCY - OPTIONAL TIKTOK CONNECTOR INSTALL
if not exist "logs" mkdir "logs"
echo Optional TikTok connector install started: %DATE% %TIME% >> "logs\start-log.txt"
where npm >> "logs\start-log.txt" 2>&1
if errorlevel 1 (
  echo npm not found. Reinstall Node.js LTS.
  pause
  exit /b 1
)
echo Installing optional tiktok-live-connector. Internet required.
call npm install tiktok-live-connector --no-audit --no-fund
echo.
echo Done. Now run START_SITE.bat again.
pause
