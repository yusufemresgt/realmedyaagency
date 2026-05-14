@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title REAL MEDYA AGENCY V9 - START
if not exist "logs" mkdir "logs"
set "LOGFILE=%CD%\logs\start-log.txt"
echo =============================================== > "%LOGFILE%"
echo REAL MEDYA AGENCY START: %DATE% %TIME% >> "%LOGFILE%"
echo Folder: %CD% >> "%LOGFILE%"
echo =============================================== >> "%LOGFILE%"
cls
echo ===============================================
echo       REAL MEDYA AGENCY V9 - ONE CLICK START
echo ===============================================
echo.
echo This version does NOT need npm install.
echo Only Node.js is required.
echo.
if not exist "server-standalone.js" (
  echo ERROR: server-standalone.js not found.
  echo ERROR: server-standalone.js not found. >> "%LOGFILE%"
  dir >> "%LOGFILE%" 2>&1
  pause
  exit /b 1
)
where node >> "%LOGFILE%" 2>&1
if errorlevel 1 (
  echo ERROR: Node.js not found. Installing Node.js LTS is required.
  echo ERROR: Node.js not found. >> "%LOGFILE%"
  start "" "https://nodejs.org"
  pause
  exit /b 1
)
node -v
node -v >> "%LOGFILE%" 2>&1
del "logs\server-url.txt" >nul 2>nul
echo Starting server window...
echo Starting server window... >> "%LOGFILE%"
start "REAL MEDYA AGENCY SERVER - KEEP OPEN" "%~dp0RUN_SERVER.cmd"
echo Waiting for server...
for /L %%i in (1,1,20) do (
  if exist "logs\server-url.txt" goto OPEN_SITE
  timeout /t 1 /nobreak >nul
)
:OPEN_SITE
set "SITEURL=http://localhost:3000"
if exist "logs\server-url.txt" set /p SITEURL=<"logs\server-url.txt"
echo Opening: %SITEURL%
echo Opening: %SITEURL% >> "%LOGFILE%"
start "" "%SITEURL%"
echo.
echo If the browser did not open, copy this address:
echo %SITEURL%
echo.
echo Admin page:
echo %SITEURL%/canli-admin.html
echo.
echo Admin password: real2026
echo.
echo IMPORTANT: Keep the SERVER window open.
echo You can close this START window after the site opens.
echo.
pause
exit /b 0
