@echo off
REM ═══════════════════════════════════════════════════
REM  PantenolVisuals Launcher - Windows
REM  Self-contained app (Electron inside), no browser needed.
REM  First run downloads the engine once (~95 MB).
REM ═══════════════════════════════════════════════════
setlocal EnableDelayedExpansion
title PantenolVisuals Launcher
cd /d "%~dp0"
set "DIR=%CD%"
set "BRANCH=main"
set "EV=33.2.0"
set "RT=%DIR%\.electron-win\bin"
set "RT_URL=https://github.com/electron/electron/releases/download/v%EV%/electron-v%EV%-win32-x64.zip"
set "REPO_ZIP=https://codeload.github.com/kpanics/PantenolVisuals/zip/refs/heads/%BRANCH%"

echo [PantenolVisuals] Checking for updates...

REM ── 1. Update launcher files ──
set "UPDATED=0"
if exist "%DIR%\.git" (
  where git >nul 2>nul
  if !errorlevel!==0 (
    git fetch -q origin "+refs/heads/%BRANCH%:refs/remotes/origin/%BRANCH%" >nul 2>nul
    if !errorlevel!==0 (
      git reset --hard FETCH_HEAD -q >nul 2>nul
      if !errorlevel!==0 (
        set "UPDATED=1"
        echo [OK] Launcher updated
      )
    )
  )
)

if "!UPDATED!"=="0" (
  where curl >nul 2>nul
  if !errorlevel!==0 (
    set "TMPZ=%TEMP%\pv-src.zip"
    set "TMPS=%TEMP%\pv-src"
    curl -sL --max-time 25 "%REPO_ZIP%" -o "!TMPZ!" >nul 2>nul
    if exist "!TMPZ!" (
      if exist "!TMPS!" rmdir /s /q "!TMPS!"
      powershell -NoProfile -Command "Expand-Archive -Force '!TMPZ!' '!TMPS!'" >nul 2>nul
      if exist "!TMPS!\PantenolVisuals-%BRANCH%\index.html" (
        robocopy "!TMPS!\PantenolVisuals-%BRANCH%" "%DIR%" /E /NFL /NDL /NJH /NJS /XD .git dist .electron .electron-win /XF launch.bat >nul
        if !errorlevel! LSS 8 (
          set "UPDATED=1"
          echo [OK] Launcher updated
        )
      )
      del /q "!TMPZ!" >nul 2>nul
    )
  )
)
if "!UPDATED!"=="0" echo [..] No network or up to date - launching current copy

REM ── 2. Electron engine (downloaded once) ──
if not exist "%RT%\electron.exe" (
  echo [..] First run: downloading app engine (~95 MB, one time)...
  set "TMPE=%TEMP%\pv-electron"
  if exist "!TMPE!" rmdir /s /q "!TMPE!"
  curl -L --retry 2 -o "%TEMP%\pv-electron.zip" "%RT_URL%" >nul 2>nul
  if exist "%TEMP%\pv-electron.zip" powershell -NoProfile -Command "Expand-Archive -Force '%TEMP%\pv-electron.zip' '!TMPE!'" >nul 2>nul
  if exist "!TMPE!\electron.exe" (
    if not exist "%DIR%\.electron-win" mkdir "%DIR%\.electron-win"
    move "!TMPE!" "%RT%" >nul
    echo [OK] Engine installed
  ) else (
    echo [FAIL] Could not download the engine. Check internet connection.
  )
  del /q "%TEMP%\pv-electron.zip" >nul 2>nul
)

REM ── 3. Launch ──
if exist "%RT%\electron.exe" (
  echo [..] Starting PantenolVisuals...
  start "" "%RT%\electron.exe" "%DIR%"
  exit /b 0
)

echo [..] Fallback: opening in default browser
start "" "%DIR%\index.html"
exit /b 0
