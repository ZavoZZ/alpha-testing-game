@echo off
:: ============================================================================
:: VERIFICARE STARE DUPA MIGRARE
:: ============================================================================

echo.
echo ========================================
echo   VERIFICARE STARE POST-MIGRARE
echo ========================================
echo.

:: 1. Verifica spatiu pe C:
echo [1] Spatiu pe C:
for /f "tokens=3" %%a in ('dir C:\ /-c ^| find "bytes free"') do set c_free=%%a
set /a c_free_mb=%c_free% / 1048576
echo     Liber: %c_free_mb% MB
echo.

:: 2. Verifica Docker
echo [2] Docker:
docker version >nul 2>&1
if errorlevel 1 (
    echo     [ERROR] Docker nu ruleaza!
) else (
    echo     [OK] Docker ruleaza
    docker info 2>nul | findstr "Docker Root Dir"
)
echo.

:: 3. Verifica containere
echo [3] Containere Docker:
docker ps --format "table {{.Names}}\t{{.Status}}" 2>nul
echo.

:: 4. Verifica npm
echo [4] npm:
where npm >nul 2>&1
if errorlevel 1 (
    echo     [ERROR] npm nu este in PATH!
) else (
    echo     [OK] npm gasit
    npm config get cache
    npm config get prefix
)
echo.

:: 5. Verifica VS Code
echo [5] VS Code:
where code >nul 2>&1
if errorlevel 1 (
    echo     [WARN] code nu este in PATH
) else (
    echo     [OK] VS Code gasit
    code --list-extensions 2>nul | find /c /v "" 
    echo     extensii instalate
)
echo.

:: 6. Verifica variabile de mediu
echo [6] Variabile de mediu:
echo     NPM_CONFIG_CACHE: %NPM_CONFIG_CACHE%
echo     VSCODE_EXTENSIONS: %VSCODE_EXTENSIONS%
echo     TEMP: %TEMP%
echo     TMP: %TMP%
echo.

:: 7. Verifica foldere pe D:
echo [7] Foldere pe D:
if exist "D:\DockerData" (
    echo     [OK] D:\DockerData exista
) else (
    echo     [WARN] D:\DockerData nu exista
)
if exist "D:\npm-cache" (
    echo     [OK] D:\npm-cache exista
) else (
    echo     [WARN] D:\npm-cache nu exista
)
if exist "D:\VSCode" (
    echo     [OK] D:\VSCode exista
) else (
    echo     [WARN] D:\VSCode nu exista
)
if exist "D:\WSL" (
    echo     [OK] D:\WSL exista
) else (
    echo     [WARN] D:\WSL nu exista
)
echo.

:: 8. Verifica WSL
echo [8] WSL Distributions:
wsl -l -v 2>nul
echo.

:: 9. Test proiect
echo [9] Test Proiect:
if exist "package.json" (
    echo     [OK] package.json gasit
    npm run --silent 2>nul | findstr "dev"
) else (
    echo     [WARN] Nu suntem in directorul proiectului
)
echo.

echo ========================================
echo   VERIFICARE COMPLETA
echo ========================================
echo.

pause
