@echo off
title DayScore AI Application Runner
cls
echo ========================================================================
echo                      DayScore AI - Windows Launcher
echo ========================================================================
echo.

:: Check if DayScore-App.exe exists
if exist "DayScore-App.exe" (
    echo  [Option 1] Found standalone Windows executable: DayScore-App.exe
    echo  Starting DayScore standalone application...
    echo.
    start "" "DayScore-App.exe"
    exit /b
)

:: If DayScore-App.exe is not present, check for Node.js
echo Checking system requirements...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo  [!] Node.js is not detected on your system.
    echo.
    echo  Please install Node.js from https://nodejs.org (LTS recommended).
    echo  Alternatively, run DayScore-App.exe if available.
    echo.
    pause
    exit /b
)

:: Check if node_modules exists, install if missing
if not exist "node_modules\" (
    echo  [+] First-time setup: Installing required dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo  [!] Failed to install dependencies. Please run 'npm install' manually.
        pause
        exit /b
    )
)

:: Check if dist exists, build if missing
if not exist "dist\" (
    echo  [+] Building production assets...
    call npm run build
)

echo.
echo ========================================================================
echo  [✓] Starting DayScore Server on http://localhost:3000 ...
echo ========================================================================
echo.

:: Launch browser in parallel after 2 seconds
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:3000"

:: Start the production server
call npm start
pause
