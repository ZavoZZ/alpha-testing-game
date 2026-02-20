@echo off
:: ============================================================================
:: STORAGE MIGRATION CU SANDBOX MANAGEMENT
:: Opreste sandbox-ul, muta datele, reporneste sandbox-ul
:: ============================================================================

setlocal enabledelayedexpansion

echo.
echo ========================================
echo   STORAGE MIGRATION CU SANDBOX
echo ========================================
echo.

:: Salvam directorul curent
set "PROJECT_DIR=%~dp0"
cd /d "%PROJECT_DIR%"

:: Verifica daca D: exista
if not exist D:\ (
    echo ERROR: Drive D: nu exista!
    pause
    exit /b 1
)

:: Verifica spatiu liber pe C:
for /f "tokens=3" %%a in ('dir C:\ /-c ^| find "bytes free"') do set c_free=%%a
set /a c_free_mb=!c_free! / 1048576
echo Spatiu liber pe C: !c_free_mb! MB

if !c_free_mb! LSS 500 (
    echo.
    echo WARNING: Spatiu foarte putin pe C: (!c_free_mb! MB)
    echo Recomandat sa curatati Docker cache mai intai:
    echo   docker system prune -a -f
    echo.
)

echo.
echo Pasii migrarii:
echo   1. Oprire sandbox Docker
echo   2. Curatare Docker cache
echo   3. Migrare date pe D:
echo   4. Repornire sandbox Docker
echo.

set /p confirm="Continuati? (y/n): "
if /i not "%confirm%"=="y" (
    echo Anulat.
    exit /b 0
)

:: PASUL 1: Oprire sandbox
echo.
echo [1/4] Oprire sandbox Docker...
call stop-sandbox.cmd
if errorlevel 1 (
    echo WARNING: Eroare la oprirea sandbox-ului
)

:: Asteapta ca containerele sa se opreasca
timeout /t 5 /nobreak >nul

:: PASUL 2: Curatare Docker cache
echo.
echo [2/4] Curatare Docker cache...
docker system prune -f 2>nul
docker builder prune -f 2>nul

:: PASUL 3: Ruleaza migrarea
echo.
echo [3/4] Migrare date pe D:...
echo.
echo Alegeti tipul de migrare:
echo   1. Migrare completa (Docker + npm + VS Code)
echo   2. Doar Docker
echo   3. Doar npm
echo   4. Doar VS Code
echo   5. Sarire peste migrare (doar repornire sandbox)
echo.

set /p mig_choice="Optiune (1-5): "

if "%mig_choice%"=="1" (
    powershell -ExecutionPolicy Bypass -File "%PROJECT_DIR%migrate-storage-to-D.ps1"
)
if "%mig_choice%"=="2" (
    powershell -ExecutionPolicy Bypass -File "%PROJECT_DIR%migrate-storage-to-D.ps1" -SkipNpm -SkipVSCode
)
if "%mig_choice%"=="3" (
    powershell -ExecutionPolicy Bypass -File "%PROJECT_DIR%migrate-storage-to-D.ps1" -SkipDocker -SkipVSCode
)
if "%mig_choice%"=="4" (
    powershell -ExecutionPolicy Bypass -File "%PROJECT_DIR%migrate-storage-to-D.ps1" -SkipDocker -SkipNpm
)
if "%mig_choice%"=="5" (
    echo Migrare sarita.
)

:: PASUL 4: Repornire sandbox
echo.
echo [4/4] Repornire sandbox Docker...
call start-sandbox.cmd
if errorlevel 1 (
    echo WARNING: Eroare la repornirea sandbox-ului
    echo Incercati manual: start-sandbox.cmd
)

echo.
echo ========================================
echo   MIGRATION COMPLETA!
echo ========================================
echo.

:: Verifica spatiu eliberat
for /f "tokens=3" %%a in ('dir C:\ /-c ^| find "bytes free"') do set c_free_after=%%a
set /a c_free_after_mb=!c_free_after! / 1048576
echo Spatiu liber pe C: acum: !c_free_after_mb! MB

echo.
echo Daca intampinati probleme:
echo   1. Restarteaza computerul
echo   2. Verifica Docker Desktop settings
echo   3. Consulta STORAGE_MIGRATION_GUIDE.md
echo.

pause
