@echo off
REM ============================================================
REM Local Sandbox Test Script for Windows
REM ============================================================
REM 
REM Tests all local services to verify they are running correctly
REM ============================================================

echo.
echo ============================================================
echo           LOCAL SANDBOX - TEST ALL SERVICES
echo ============================================================
echo.

set ERROR_COUNT=0

REM Test Main App
echo [1/6] Testing Main App (port 3000)...
curl -s -o nul -w "%%{http_code}" http://localhost:3000 > temp_status.txt 2>nul
set /p STATUS=<temp_status.txt
if "%STATUS%"=="200" (
    echo [OK] Main App is running
) else (
    echo [ERROR] Main App is not responding (status: %STATUS%)
    set /a ERROR_COUNT+=1
)
del temp_status.txt 2>nul

REM Test Auth Server
echo.
echo [2/6] Testing Auth Server (port 3100)...
curl -s -o nul -w "%%{http_code}" http://localhost:3100/health > temp_status.txt 2>nul
set /p STATUS=<temp_status.txt
if "%STATUS%"=="200" (
    echo [OK] Auth Server is running
) else (
    echo [ERROR] Auth Server is not responding (status: %STATUS%)
    set /a ERROR_COUNT+=1
)
del temp_status.txt 2>nul

REM Test News Server
echo.
echo [3/6] Testing News Server (port 3200)...
curl -s -o nul -w "%%{http_code}" http://localhost:3200/health > temp_status.txt 2>nul
set /p STATUS=<temp_status.txt
if "%STATUS%"=="200" (
    echo [OK] News Server is running
) else (
    echo [ERROR] News Server is not responding (status: %STATUS%)
    set /a ERROR_COUNT+=1
)
del temp_status.txt 2>nul

REM Test Chat Server
echo.
echo [4/6] Testing Chat Server (port 3300)...
curl -s -o nul -w "%%{http_code}" http://localhost:3300/health > temp_status.txt 2>nul
set /p STATUS=<temp_status.txt
if "%STATUS%"=="200" (
    echo [OK] Chat Server is running
) else (
    echo [ERROR] Chat Server is not responding (status: %STATUS%)
    set /a ERROR_COUNT+=1
)
del temp_status.txt 2>nul

REM Test Economy Server
echo.
echo [5/6] Testing Economy Server (port 3400)...
curl -s -o nul -w "%%{http_code}" http://localhost:3400/health > temp_status.txt 2>nul
set /p STATUS=<temp_status.txt
if "%STATUS%"=="200" (
    echo [OK] Economy Server is running
) else (
    echo [ERROR] Economy Server is not responding (status: %STATUS%)
    set /a ERROR_COUNT+=1
)
del temp_status.txt 2>nul

REM Test Qdrant
echo.
echo [6/6] Testing Qdrant (port 6333)...
curl -s -o nul -w "%%{http_code}" http://localhost:6333/ > temp_status.txt 2>nul
set /p STATUS=<temp_status.txt
if "%STATUS%"=="200" (
    echo [OK] Qdrant is running
) else (
    echo [ERROR] Qdrant is not responding (status: %STATUS%)
    set /a ERROR_COUNT+=1
)
del temp_status.txt 2>nul

echo.
echo ============================================================
if %ERROR_COUNT%==0 (
    echo           ALL TESTS PASSED! ✓
    echo ============================================================
    echo.
    echo Your sandbox is ready for development!
    echo Open http://localhost:3000 in your browser.
) else (
    echo           %ERROR_COUNT% TEST(S) FAILED! ✗
    echo ============================================================
    echo.
    echo Some services are not running. Check logs with:
    echo docker compose -f docker-compose.local.yml logs
)
echo.
pause
