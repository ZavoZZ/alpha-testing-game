@echo off
setlocal enabledelayedexpansion

echo ============================================
echo   COMPREHENSIVE API TESTING SCRIPT
echo   Testing All Services and Endpoints
echo ============================================
echo.

:: Create temp JSON file for signup
echo {"username":"testuser","email":"test@test.com","password":"testjoc123"} > %TEMP%\signup.json
echo {"email":"test@test.com","password":"testjoc123"} > %TEMP%\login.json

echo ============================================
echo   1. AUTH SERVER (Port 3100)
echo ============================================
echo.

echo [1.1] Testing Auth Health...
curl -s http://localhost:3100/health
echo.
echo.

echo [1.2] Testing Signup...
curl -s -X POST http://localhost:3100/api/auth-service/auth/signup -H "Content-Type: application/json" -d @%TEMP%\signup.json
echo.
echo.

echo [1.3] Testing Login...
curl -s -X POST http://localhost:3100/api/auth-service/auth/login -H "Content-Type: application/json" -d @%TEMP%\login.json > %TEMP%\login_response.json
type %TEMP%\login_response.json
echo.
echo.

echo [1.4] Testing Admin Users (without auth - should fail)...
curl -s http://localhost:3100/api/auth-service/auth/admin/users
echo.
echo.

echo ============================================
echo   2. ECONOMY SERVER (Port 3400)
echo ============================================
echo.

echo [2.1] Testing Economy Health (without auth - should fail)...
curl -s http://localhost:3400/api/economy/health
echo.
echo.

echo [2.2] Testing Balance (without auth - should fail)...
curl -s http://localhost:3400/api/economy/balance
echo.
echo.

echo [2.3] Testing Work Preview...
curl -s http://localhost:3400/api/economy/work/preview
echo.
echo.

echo [2.4] Testing Companies...
curl -s http://localhost:3400/api/economy/companies
echo.
echo.

echo [2.5] Testing Marketplace...
curl -s http://localhost:3400/api/economy/marketplace
echo.
echo.

echo ============================================
echo   3. NEWS SERVER (Port 3200)
echo ============================================
echo.

echo [3.1] Testing News Health...
curl -s http://localhost:3200/health
echo.
echo.

echo [3.2] Testing News Articles...
curl -s http://localhost:3200/news
echo.
echo.

echo ============================================
echo   4. CHAT SERVER (Port 3300)
echo ============================================
echo.

echo [4.1] Testing Chat Health...
curl -s http://localhost:3300/health
echo.
echo.

echo ============================================
echo   5. MAIN APP (Port 3000)
echo ============================================
echo.

echo [5.1] Testing Homepage...
curl -s -o nul -w "HTTP Status: %%{http_code}" http://localhost:3000/
echo.
echo.

echo [5.2] Testing Dashboard (without auth - should redirect)...
curl -s -o nul -w "HTTP Status: %%{http_code}" http://localhost:3000/dashboard
echo.
echo.

echo ============================================
echo   6. DOCKER CONTAINER STATUS
echo ============================================
echo.

docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo.
echo ============================================
echo   TEST COMPLETE
echo ============================================

:: Cleanup
del %TEMP%\signup.json 2>nul
del %TEMP%\login.json 2>nul
del %TEMP%\login_response.json 2>nul
