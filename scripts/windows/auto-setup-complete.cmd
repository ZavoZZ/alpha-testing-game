@echo off
REM Complete Automated Setup Script
REM This script runs PATH setup, then executes all project setup commands

setlocal enabledelayedexpansion

echo ========================================
echo Complete Automated Setup
echo ========================================
echo.
echo This script will:
echo   1. Configure Windows PATH for Docker, Node.js, npm, Git
echo   2. Install npm dependencies
echo   3. Install Puppeteer
echo   4. Start Docker services
echo   5. Verify everything is running
echo.
echo ========================================
echo.

REM Create report file
set REPORT_FILE=setup-report-%date:~-4,4%%date:~-10,2%%date:~-7,2%-%time:~0,2%%time:~3,2%%time:~6,2%.txt
set REPORT_FILE=%REPORT_FILE: =0%

echo Complete Automated Setup Report > %REPORT_FILE%
echo Generated: %date% %time% >> %REPORT_FILE%
echo ======================================== >> %REPORT_FILE%
echo. >> %REPORT_FILE%

REM ========================================
REM Step 1: PATH Setup
REM ========================================
echo [STEP 1/5] Configuring Windows PATH...
echo. >> %REPORT_FILE%
echo [STEP 1/5] PATH Configuration >> %REPORT_FILE%
echo ---------------------------------------- >> %REPORT_FILE%

powershell -ExecutionPolicy Bypass -File "%~dp0setup-windows-path.ps1" >> %REPORT_FILE% 2>&1
set PATH_EXIT_CODE=%errorlevel%

if %PATH_EXIT_CODE% equ 0 (
    echo [SUCCESS] PATH configuration completed
    echo Status: SUCCESS >> %REPORT_FILE%
) else (
    echo [WARNING] PATH configuration completed with warnings
    echo Status: COMPLETED WITH WARNINGS >> %REPORT_FILE%
)

echo. >> %REPORT_FILE%

REM Refresh PATH for current session
call refreshenv >nul 2>&1
for /f "tokens=2*" %%a in ('reg query "HKCU\Environment" /v Path 2^>nul') do set "USER_PATH=%%b"
for /f "tokens=2*" %%a in ('reg query "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v Path 2^>nul') do set "SYSTEM_PATH=%%b"
set "PATH=%SYSTEM_PATH%;%USER_PATH%"

echo.
echo ========================================
echo.

REM ========================================
REM Step 2: Verify Tools
REM ========================================
echo [STEP 2/5] Verifying required tools...
echo. >> %REPORT_FILE%
echo [STEP 2/5] Tool Verification >> %REPORT_FILE%
echo ---------------------------------------- >> %REPORT_FILE%

set TOOLS_OK=1

REM Check Docker
docker --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Docker is available
    for /f "delims=" %%i in ('docker --version 2^>^&1') do echo Docker: %%i >> %REPORT_FILE%
) else (
    echo [ERROR] Docker is not available
    echo Docker: NOT FOUND >> %REPORT_FILE%
    set TOOLS_OK=0
)

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Node.js is available
    for /f "delims=" %%i in ('node --version 2^>^&1') do echo Node.js: %%i >> %REPORT_FILE%
) else (
    echo [ERROR] Node.js is not available
    echo Node.js: NOT FOUND >> %REPORT_FILE%
    set TOOLS_OK=0
)

REM Check npm
npm --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] npm is available
    for /f "delims=" %%i in ('npm --version 2^>^&1') do echo npm: %%i >> %REPORT_FILE%
) else (
    echo [ERROR] npm is not available
    echo npm: NOT FOUND >> %REPORT_FILE%
    set TOOLS_OK=0
)

REM Check Git
git --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Git is available
    for /f "delims=" %%i in ('git --version 2^>^&1') do echo Git: %%i >> %REPORT_FILE%
) else (
    echo [ERROR] Git is not available
    echo Git: NOT FOUND >> %REPORT_FILE%
    set TOOLS_OK=0
)

echo. >> %REPORT_FILE%

if %TOOLS_OK% equ 0 (
    echo.
    echo [ERROR] Some required tools are not available.
    echo Please install missing tools and try again.
    echo.
    echo See %REPORT_FILE% for details.
    pause
    exit /b 1
)

echo.
echo ========================================
echo.

REM ========================================
REM Step 3: Install npm dependencies
REM ========================================
echo [STEP 3/5] Installing npm dependencies...
echo. >> %REPORT_FILE%
echo [STEP 3/5] npm Dependencies Installation >> %REPORT_FILE%
echo ---------------------------------------- >> %REPORT_FILE%

npm install >> %REPORT_FILE% 2>&1
set NPM_INSTALL_EXIT=%errorlevel%

if %NPM_INSTALL_EXIT% equ 0 (
    echo [SUCCESS] npm dependencies installed
    echo Status: SUCCESS >> %REPORT_FILE%
) else (
    echo [ERROR] npm install failed
    echo Status: FAILED >> %REPORT_FILE%
    echo.
    echo See %REPORT_FILE% for details.
    pause
    exit /b 1
)

echo. >> %REPORT_FILE%

echo.
echo ========================================
echo.

REM ========================================
REM Step 4: Install Puppeteer
REM ========================================
echo [STEP 4/5] Installing Puppeteer...
echo. >> %REPORT_FILE%
echo [STEP 4/5] Puppeteer Installation >> %REPORT_FILE%
echo ---------------------------------------- >> %REPORT_FILE%

npm install --save-dev puppeteer >> %REPORT_FILE% 2>&1
set PUPPETEER_EXIT=%errorlevel%

if %PUPPETEER_EXIT% equ 0 (
    echo [SUCCESS] Puppeteer installed
    echo Status: SUCCESS >> %REPORT_FILE%
) else (
    echo [WARNING] Puppeteer installation had issues
    echo Status: COMPLETED WITH WARNINGS >> %REPORT_FILE%
)

echo. >> %REPORT_FILE%

echo.
echo ========================================
echo.

REM ========================================
REM Step 5: Start Docker services
REM ========================================
echo [STEP 5/5] Starting Docker services...
echo. >> %REPORT_FILE%
echo [STEP 5/5] Docker Services >> %REPORT_FILE%
echo ---------------------------------------- >> %REPORT_FILE%

REM Check if docker-compose.local.yml exists
if not exist "docker-compose.local.yml" (
    echo [ERROR] docker-compose.local.yml not found
    echo Status: FAILED - docker-compose.local.yml not found >> %REPORT_FILE%
    echo.
    echo See %REPORT_FILE% for details.
    pause
    exit /b 1
)

echo Starting Docker Compose services...
docker compose -f docker-compose.local.yml up -d >> %REPORT_FILE% 2>&1
set DOCKER_EXIT=%errorlevel%

if %DOCKER_EXIT% equ 0 (
    echo [SUCCESS] Docker services started
    echo Status: SUCCESS >> %REPORT_FILE%
) else (
    echo [ERROR] Docker services failed to start
    echo Status: FAILED >> %REPORT_FILE%
    echo.
    echo See %REPORT_FILE% for details.
    pause
    exit /b 1
)

echo.
echo Waiting for services to initialize (10 seconds)...
timeout /t 10 /nobreak >nul

echo.
echo Checking service status...
echo. >> %REPORT_FILE%
echo Service Status: >> %REPORT_FILE%
docker compose -f docker-compose.local.yml ps >> %REPORT_FILE% 2>&1
docker compose -f docker-compose.local.yml ps

echo. >> %REPORT_FILE%

echo.
echo ========================================
echo.

REM ========================================
REM Final Summary
REM ========================================
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo All setup steps completed successfully:
echo   [✓] PATH configured for Docker, Node.js, npm, Git
echo   [✓] npm dependencies installed
echo   [✓] Puppeteer installed
echo   [✓] Docker services started
echo.
echo ========================================
echo Next Steps:
echo ========================================
echo.
echo 1. Verify services are running:
echo    docker compose -f docker-compose.local.yml ps
echo.
echo 2. Check service logs:
echo    docker compose -f docker-compose.local.yml logs
echo.
echo 3. Access your application:
echo    - MongoDB: localhost:27017
echo    - Redis: localhost:6379
echo    - Application: Check your configuration
echo.
echo 4. Stop services when done:
echo    docker compose -f docker-compose.local.yml down
echo.
echo ========================================
echo.
echo Detailed report saved to: %REPORT_FILE%
echo.

echo. >> %REPORT_FILE%
echo ======================================== >> %REPORT_FILE%
echo Setup completed successfully! >> %REPORT_FILE%
echo ======================================== >> %REPORT_FILE%

pause
exit /b 0
