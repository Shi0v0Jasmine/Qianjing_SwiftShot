@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required. Install Node.js LTS and try again.
  pause
  exit /b 1
)
if not exist apps\web\node_modules call npm ci --prefix apps/web
if errorlevel 1 goto failed
if not exist apps\demo-video\node_modules call npm ci --prefix apps/demo-video
if errorlevel 1 goto failed
call npm run build
if errorlevel 1 goto failed
echo Open http://127.0.0.1:4173 in your browser.
call npm run demo
pause
exit /b 0
:failed
echo Setup failed. Check the error above and retry.
pause
exit /b 1
