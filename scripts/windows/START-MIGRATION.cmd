@echo off
:: ============================================================================
:: STORAGE MIGRATION - SCRIPT PRINCIPAL
:: ============================================================================
:: 
:: Acest script va muta toate datele de pe C: pe D: drive
:: 
:: SURSE IDENTIFICATE:
::   - Docker Desktop:     5.3 GB
::   - Roblox (urme):      3.2 GB (de sters!)
::   - .minecraft:         1.76 GB
::   - Windows Packages:   1.5 GB
::   - NVIDIA cache:       1.3 GB
::   - Google Chrome:      1.2 GB
::   - Perplexity AI:      976 MB
::   - VS Code:            747 MB
::   - AnthropicClaude:    546 MB
::   - Cursor AI:          291 MB
::   - npm-cache:          259 MB
::   - Temp files:         815 MB
::   - TOTAL:              ~16 GB
::
:: ============================================================================

setlocal enabledelayedexpansion
cd /d "%~dp0"

:MENU
cls
echo.
echo  ============================================================================
echo    STORAGE MIGRATION - Muta datele de pe C: pe D:
echo  ============================================================================
echo.
echo   Spatiu curent pe C:
for /f "tokens=3" %%a in ('dir C:\ /-c ^| find "bytes free"') do set c_free=%%a
set /a c_free_mb=!c_free! / 1048576
echo   !c_free_mb! MB liber
echo.
echo  ============================================================================
echo   OPTIUNI:
echo  ============================================================================
echo.
echo   [1] PASUL 1: Analiza starii actuale (RECOMANDAT MAI INTAI)
echo.
echo   [2] PASUL 2: Curatare rapida (fara mutari, doar curata cache)
echo.
echo   [3] PASUL 3: Migrare completa (muta totul pe D:)
echo.
echo   [4] PASUL 4: Migrare selectiva (alegi ce sa muti)
echo.
echo   [5] PASUL 5: Verifica starea dupa migrare
echo.
echo   [6] PASUL 6: Configureaza pentru viitor (variabile de mediu)
echo.
echo   [7] IESIRE
echo.
echo  ============================================================================

set /p choice="   Alege optiunea (1-7): "

if "%choice%"=="1" goto ANALYZE
if "%choice%"=="2" goto CLEAN
if "%choice%"=="3" goto FULL_MIGRATE
if "%choice%"=="4" goto SELECTIVE
if "%choice%"=="5" goto VERIFY
if "%choice%"=="6" goto FUTURE
if "%choice%"=="7" goto END

goto MENU

:ANALYZE
cls
echo.
echo  ============================================================================
echo    PASUL 1: ANALIZA STARII ACTUALE
echo  ============================================================================
echo.
echo   Se analizeaza folderele de pe C:...
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0analyze-storage.ps1"
echo.
pause
goto MENU

:CLEAN
cls
echo.
echo  ============================================================================
echo    PASUL 2: CURATARE RAPIDA
echo  ============================================================================
echo.
echo   Aceasta optiune va curata:
echo     - Docker cache (imagini neutilizate)
echo     - Temp files
echo     - Browser cache
echo     - npm cache
echo     - CrashDumps
echo.
echo   NU va muta nimic, doar va elibera spatiu.
echo.
set /p confirm="   Continuati? (y/n): "
if /i not "%confirm%"=="y" goto MENU

echo.
echo   Curatare Docker...
docker system prune -f 2>nul
docker builder prune -f 2>nul

echo.
echo   Curatare Temp...
del /q /f /s "%TEMP%\*" 2>nul
del /q /f /s "%LOCALAPPDATA%\Temp\*" 2>nul

echo.
echo   Curatare npm cache...
npm cache clean --force 2>nul

echo.
echo   Curatare CrashDumps...
del /q /f /s "%LOCALAPPDATA%\CrashDumps\*" 2>nul

echo.
echo   Curatare completa!
echo.
pause
goto MENU

:FULL_MIGRATE
cls
echo.
echo  ============================================================================
echo    PASUL 3: MIGRARE COMPLETA
echo  ============================================================================
echo.
echo   ATENTIE: Aceasta optiune va:
echo     1. Opri Docker Desktop si containerele
echo     2. Muta datele Docker pe D:
echo     3. Muta AI apps (AnthropicClaude, Perplexity, Cursor) pe D:
echo     4. Muta VS Code extensions pe D:
echo     5. Configureze npm pentru D:
echo     6. Curete cache-urile
echo     7. Seteze variabile de mediu
echo.
echo   Proiectul curent va fi oprit temporar.
echo.
set /p confirm="   Continuati? (y/n): "
if /i not "%confirm%"=="y" goto MENU

echo.
echo   Se opreste sandbox-ul...
call stop-sandbox.cmd 2>nul

echo.
echo   Se ruleaza migrarea...
powershell -ExecutionPolicy Bypass -Command "Start-Process powershell -ArgumentList '-ExecutionPolicy Bypass -File \"%~dp0migrate-all-storage.ps1\"' -Verb RunAs -Wait"

echo.
echo   Se reporneste sandbox-ul...
call start-sandbox.cmd 2>nul

echo.
echo   Migrare completa!
echo.
pause
goto MENU

:SELECTIVE
cls
echo.
echo  ============================================================================
echo    PASUL 4: MIGRARE SELECTIVA
echo  ============================================================================
echo.
echo   Alege ce sa muti:
echo.
echo   [1] Doar Docker
echo   [2] Doar AI Apps (AnthropicClaude, Perplexity, Cursor)
echo   [3] Doar VS Code
echo   [4] Doar npm
echo   [5] Doar curatare cache
echo   [6] Inapoi la meniu
echo.
set /p sel="   Alege (1-6): "

if "%sel%"=="1" (
    powershell -ExecutionPolicy Bypass -Command "Start-Process powershell -ArgumentList '-ExecutionPolicy Bypass -File \"%~dp0migrate-all-storage.ps1\" -SkipAI -SkipGames -SkipCache' -Verb RunAs"
)
if "%sel%"=="2" (
    powershell -ExecutionPolicy Bypass -Command "Start-Process powershell -ArgumentList '-ExecutionPolicy Bypass -File \"%~dp0migrate-all-storage.ps1\" -SkipDocker -SkipGames -SkipCache' -Verb RunAs"
)
if "%sel%"=="3" (
    powershell -ExecutionPolicy Bypass -Command "Start-Process powershell -ArgumentList '-ExecutionPolicy Bypass -File \"%~dp0migrate-all-storage.ps1\" -SkipDocker -SkipAI -SkipGames -SkipCache' -Verb RunAs"
)
if "%sel%"=="4" (
    npm config set cache "D:\MigratedData\npm-cache" --global
    echo npm cache configurat pe D:\MigratedData\npm-cache
)
if "%sel%"=="5" (
    powershell -ExecutionPolicy Bypass -Command "Start-Process powershell -ArgumentList '-ExecutionPolicy Bypass -File \"%~dp0migrate-all-storage.ps1\" -CleanOnly' -Verb RunAs"
)
if "%sel%"=="6" goto MENU

echo.
echo   Gata!
echo.
pause
goto MENU

:VERIFY
cls
echo.
echo  ============================================================================
echo    PASUL 5: VERIFICARE STARE
echo  ============================================================================
echo.
call verify-migration.cmd
goto MENU

:FUTURE
cls
echo.
echo  ============================================================================
echo    PASUL 6: CONFIGURARE PENTRU VIITOR
echo  ============================================================================
echo.
echo   Se configureaza variabilele de mediu pentru ca toate
echo   aplicatiile sa foloseasca D: drive in viitor...
echo.
call setup-future-installations.cmd
goto MENU

:END
echo.
echo   La revedere!
echo.
exit /b 0
