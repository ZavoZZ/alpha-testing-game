@echo off
REM ============================================================
REM Local Sandbox Quick Start Script for Windows
REM ============================================================
REM 
REM Usage: Double-click this file or run from command prompt:
REM        start-sandbox.cmd
REM
REM Prerequisites:
REM - Docker Desktop must be installed and running
REM - Node.js v18+ must be installed
REM ============================================================

echo.
echo ============================================================
echo           LOCAL SANDBOX - QUICK START
echo ============================================================
echo.

REM Check if Docker is running
echo [1/5] Checking Docker...
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)
echo [OK] Docker is running

REM Check if Node.js is installed
echo.
echo [2/5] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js v18+ from https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [OK] Node.js %NODE_VERSION% installed

REM Create .env.local if it doesn't exist
echo.
echo [3/5] Checking environment configuration...
if not exist .env.local (
    echo [INFO] Creating .env.local from template...
    copy .envdev .env.local >nul
    echo [OK] .env.local created
) else (
    echo [OK] .env.local exists
)

REM Stop any existing containers
echo.
echo [4/5] Stopping existing containers (if any)...
docker compose -f docker-compose.local.yml down 2>nul
echo [OK] Done

REM Start all services
echo.
echo [5/5] Starting all services...
echo This may take a few minutes on first run...
docker compose -f docker-compose.local.yml up -d --build

if errorlevel 1 (
    echo.
    echo [ERROR] Failed to start services!
    echo Check the logs with: docker compose -f docker-compose.local.yml logs
    pause
    exit /b 1
)

echo.
echo ============================================================
echo           SERVICES STARTED SUCCESSFULLY!
echo ============================================================
echo.
echo Access your application at:
echo.
echo   Main App:       http://localhost:3000
echo   Auth Server:    http://localhost:3100/health
echo   News Server:    http://localhost:3200/health
echo   Chat Server:    http://localhost:3300/health
echo   Economy Server: http://localhost:3400/health
echo   Qdrant Dashboard: http://localhost:6333/dashboard
echo.
echo ============================================================
echo.
echo To stop all services, run: stop-sandbox.cmd
echo To view logs, run: docker compose -f docker-compose.local.yml logs -f
echo.

REM Wait for services to be ready
echo Waiting for services to be ready...
timeout /t 10 /nobreak >nul

REM Open browser
echo Opening browser...
start http://localhost:3000

echo.
echo Sandbox is ready! Press any key to close this window.
pause >nul
