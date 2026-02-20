@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

:: ============================================================
:: SCRIPT CURĂȚARE AUTOMATĂ - ÎNTREȚINERE D: DRIVE
:: Rulează periodic pentru a menține D: drive curat
:: ============================================================

title Curățare Automată D: Drive

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║           CURĂȚARE AUTOMATĂ D: DRIVE                       ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

set "DEV_DATA=D:\DevData"
set "LOG_FILE=%DEV_DATA%\cleanup-log.txt"

:: Creare log
echo Cleanup started: %date% %time% > "%LOG_FILE%"

:: ============================================================
:: 1. CURĂȚARE npm CACHE
:: ============================================================
echo [1/5] Curățare npm cache vechi...

:: Curăță fișiere mai vechi de 30 de zile din cache
if exist "%DEV_DATA%\npm\cache" (
    forfiles /P "%DEV_DATA%\npm\cache" /S /D -30 /C "cmd /c del @path 2>nul" 2>nul
    echo     OK - npm cache curățat
) else (
    echo     INFO - npm cache nu există
)

:: ============================================================
:: 2. CURĂȚARE TEMP FILES
:: ============================================================
echo [2/5] Curățare temp files...

:: Windows Temp
if exist "C:\Windows\Temp" (
    del /q "C:\Windows\Temp\*" 2>nul
    for /d %%x in ("C:\Windows\Temp\*") do @rmdir "%%x" /s /q 2>nul
)

:: User Temp
if exist "%TEMP%" (
    del /q "%TEMP%\*" 2>nul
    for /d %%x in ("%TEMP%\*") do @rmdir "%%x" /s /q 2>nul
)

echo     OK - Temp files curățate

:: ============================================================
:: 3. CURĂȚARE DOCKER
:: ============================================================
echo [3/5] Curățare Docker...

:: Docker system prune (fără ștergere imagini active)
docker system prune -f 2>nul
if !errorLevel! equ 0 (
    echo     OK - Docker curățat
) else (
    echo     INFO - Docker nu rulează sau nu este instalat
)

:: ============================================================
:: 4. CURĂȚARE CRASH DUMPS
:: ============================================================
echo [4/5] Curățare crash dumps...

if exist "C:\Users\david\AppData\Local\CrashDumps" (
    del /q "C:\Users\david\AppData\Local\CrashDumps\*" 2>nul
    echo     OK - Crash dumps curățate
)

:: WSL crash dumps
if exist "C:\Users\david\AppData\Local\Docker\wsl" (
    forfiles /P "C:\Users\david\AppData\Local\Docker\wsl" /M *.dmp /C "cmd /c del @path 2>nul" 2>nul
)

:: ============================================================
:: 5. RAPORT SPAȚIU
:: ============================================================
echo [5/5] Raport spațiu...
echo.

:: Spațiu C:
for /f "tokens=3" %%a in ('wmic logicaldisk where "DeviceID='C:'" get FreeSpace /value ^| findstr "="') do set "C_FREE=%%a"
set /a "C_FREE_GB=!C_FREE!/1024/1024/1024"

:: Spațiu D:
for /f "tokens=3" %%a in ('wmic logicaldisk where "DeviceID='D:'" get FreeSpace /value ^| findstr "="') do set "D_FREE=%%a"
set /a "D_FREE_GB=!D_FREE!/1024/1024/1024"

echo ╔════════════════════════════════════════════════════════════╗
echo ║               RAPORT SPAȚIU                                ║
echo ╠════════════════════════════════════════════════════════════╣
echo ║  C: Drive - !C_FREE_GB! GB liber                          ║
echo ║  D: Drive - !D_FREE_GB! GB liber                          ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

:: Salvare în log
echo C: Drive free: !C_FREE_GB! GB >> "%LOG_FILE%"
echo D: Drive free: !D_FREE_GB! GB >> "%LOG_FILE%"
echo Cleanup completed: %date% %time% >> "%LOG_FILE%"

echo Curățare completă! Log salvat în: %LOG_FILE%
echo.

:: Dacă C: drive e sub 5GB, avertizează
if !C_FREE_GB! lss 5 (
    echo [AVERTISMENT] C: drive are mai puțin de 5GB liber!
    echo          Consideră curățare suplimentară.
    echo.
)

pause
