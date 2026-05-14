@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title REAL MEDYA AGENCY SERVER - DO NOT CLOSE
if not exist "logs" mkdir "logs"
echo =============================================== >> "logs\start-log.txt"
echo RUN_SERVER started: %DATE% %TIME% >> "logs\start-log.txt"
echo Folder: %CD% >> "logs\start-log.txt"
echo =============================================== >> "logs\start-log.txt"
where node >> "logs\start-log.txt" 2>&1
if errorlevel 1 (
  echo Node.js not found. Install Node.js LTS.
  echo Node.js not found. >> "logs\start-log.txt"
  start "" "https://nodejs.org"
  pause
  exit /b 1
)
echo Starting local server...
echo Starting local server... >> "logs\start-log.txt"
node server-standalone.js
set EXITCODE=%ERRORLEVEL%
echo Server stopped with code %EXITCODE% >> "logs\start-log.txt"
echo.
echo SERVER STOPPED. Send a screenshot of this window and logs\start-log.txt.
echo.
pause
exit /b %EXITCODE%
