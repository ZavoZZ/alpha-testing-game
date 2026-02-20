@echo off
REM ============================================================
REM Local Sandbox Stop Script for Windows
REM ============================================================

echo.
echo ============================================================
echo           STOPPING LOCAL SANDBOX
echo ============================================================
echo.

REM Stop all containers
echo Stopping all services...
docker compose -f docker-compose.local.yml down

if errorlevel 1 (
    echo [WARNING] Some containers may not have stopped properly
) else (
    echo [OK] All services stopped
)

echo.
echo ============================================================
echo           SANDBOX STOPPED
echo ============================================================
echo.
echo To start again, run: start-sandbox.cmd
echo.
pause
