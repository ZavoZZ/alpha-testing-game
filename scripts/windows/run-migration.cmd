@echo off
:: ============================================================================
:: STORAGE MIGRATION LAUNCHER
:: Ruleaza scriptul PowerShell ca Administrator
:: ============================================================================

echo.
echo ========================================
echo   STORAGE MIGRATION: C: -^> D:
echo ========================================
echo.
echo Acest script va muta:
echo   - Docker Desktop data (~5.4 GB)
echo   - npm cache (~272 MB)
echo   - VS Code extensions si cache (~788 MB)
echo.
echo Total estimat eliberat: ~6.5 GB
echo.

:: Verifica daca D: exista
if not exist D:\ (
    echo ERROR: Drive D: nu exista!
    pause
    exit /b 1
)

:: Verifica spatiu liber pe D:
for /f "tokens=3" %%a in ('dir D:\ /-c ^| find "bytes free"') do set freespace=%%a
echo Spatiu liber pe D: %freespace% bytes

echo.
echo Alegeti modul de rulare:
echo   1. DRY RUN (doar simuleaza, nu face modificari)
echo   2. MIGRATION COMPLETA (muta toate datele)
echo   3. MIGRATION DOCKER (doar Docker)
echo   4. MIGRATION NPM (doar npm)
echo   5. MIGRATION VS CODE (doar VS Code)
echo   6. IESIRE
echo.

set /p choice="Introduceti optiunea (1-6): "

if "%choice%"=="1" (
    echo.
    echo Rulare DRY RUN...
    powershell -ExecutionPolicy Bypass -Command "Start-Process powershell -ArgumentList '-ExecutionPolicy Bypass -File \"%~dp0migrate-storage-to-D.ps1\" -DryRun' -Verb RunAs"
)
if "%choice%"=="2" (
    echo.
    echo Rulare MIGRATION COMPLETA...
    powershell -ExecutionPolicy Bypass -Command "Start-Process powershell -ArgumentList '-ExecutionPolicy Bypass -File \"%~dp0migrate-storage-to-D.ps1\"' -Verb RunAs"
)
if "%choice%"=="3" (
    echo.
    echo Rulare MIGRATION DOCKER...
    powershell -ExecutionPolicy Bypass -Command "Start-Process powershell -ArgumentList '-ExecutionPolicy Bypass -File \"%~dp0migrate-storage-to-D.ps1\" -SkipNpm -SkipVSCode' -Verb RunAs"
)
if "%choice%"=="4" (
    echo.
    echo Rulare MIGRATION NPM...
    powershell -ExecutionPolicy Bypass -Command "Start-Process powershell -ArgumentList '-ExecutionPolicy Bypass -File \"%~dp0migrate-storage-to-D.ps1\" -SkipDocker -SkipVSCode' -Verb RunAs"
)
if "%choice%"=="5" (
    echo.
    echo Rulare MIGRATION VS CODE...
    powershell -ExecutionPolicy Bypass -Command "Start-Process powershell -ArgumentList '-ExecutionPolicy Bypass -File \"%~dp0migrate-storage-to-D.ps1\" -SkipDocker -SkipNpm' -Verb RunAs"
)
if "%choice%"=="6" (
    echo Iesire...
    exit /b 0
)

echo.
echo Scriptul a fost lansat intr-o fereastra noua.
echo Verificati fereastra PowerShell pentru progres.
echo.
pause
