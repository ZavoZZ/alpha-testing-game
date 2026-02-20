@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

:: ============================================================
:: ELIMINARE DUPLICATE ȘI CREARE JUNCTION POINTS
:: Șterge folderele de pe C: și creează junction points către D:
:: ============================================================

title Eliminare Duplicate și Creare Junction Points

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║     ELIMINARE DUPLICATE ȘI CREARE JUNCTION POINTS          ║
echo ║                                                            ║
echo ║  AVERTISMENT: Acest script va ȘTERGE foldere de pe C:     ║
echo ║  și va crea junction points către D:\DevData               ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

:: Verificare drepturi de Administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [EROARE] Acest script necesita drepturi de Administrator!
    pause
    exit /b 1
)

echo AVERTISMENT! Acest script va:
echo   1. Șterge folderele de pe C: care au duplicate pe D:
echo   2. Crea junction points de la C: către D:\DevData
echo.
echo Asta va elibera spațiu pe C: drive!
echo.
echo Apasă orice tastă pentru a continua sau Ctrl+C pentru a anula...
pause >nul

set "DEV_DATA=D:\DevData"

:: ============================================================
:: 1. npm cache
:: ============================================================
echo.
echo [1/6] Procesare npm cache...

set "SRC=C:\Users\david\AppData\Local\npm-cache"
set "DST=%DEV_DATA%\npm\cache"

if exist "%SRC%" (
    echo     Ștergere: %SRC%
    rmdir /s /q "%SRC%" 2>nul
)
echo     Creare junction point: %SRC% -^> %DST%
mklink /J "%SRC%" "%DST%"

:: ============================================================
:: 2. npm global
:: ============================================================
echo [2/6] Procesare npm global...

set "SRC=C:\Users\david\AppData\Roaming\npm"
set "DST=%DEV_DATA%\npm\global"

if exist "%SRC%" (
    echo     Ștergere: %SRC%
    rmdir /s /q "%SRC%" 2>nul
)
echo     Creare junction point: %SRC% -^> %DST%
mklink /J "%SRC%" "%DST%"

:: ============================================================
:: 3. VS Code extensions
:: ============================================================
echo [3/6] Procesare VS Code extensions...

set "SRC=C:\Users\david\.vscode\extensions"
set "DST=%DEV_DATA%\vscode\extensions"

if exist "%SRC%" (
    echo     Ștergere: %SRC%
    rmdir /s /q "%SRC%" 2>nul
)
echo     Creare junction point: %SRC% -^> %DST%
mklink /J "%SRC%" "%DST%"

:: ============================================================
:: 4. VS Code roaming
:: ============================================================
echo [4/6] Procesare VS Code roaming...

set "SRC=C:\Users\david\AppData\Roaming\Code"
set "DST=%DEV_DATA%\vscode\roaming"

if exist "%SRC%" (
    echo     Ștergere: %SRC%
    rmdir /s /q "%SRC%" 2>nul
)
echo     Creare junction point: %SRC% -^> %DST%
mklink /J "%SRC%" "%DST%"

:: ============================================================
:: 5. Claude roaming
:: ============================================================
echo [5/6] Procesare Claude roaming...

set "SRC=C:\Users\david\AppData\Roaming\Claude"
set "DST=%DEV_DATA%\ai\claude\roaming"

if exist "%SRC%" (
    echo     Ștergere: %SRC%
    rmdir /s /q "%SRC%" 2>nul
)
echo     Creare junction point: %SRC% -^> %DST%
mklink /J "%SRC%" "%DST%"

:: ============================================================
:: 6. Cursor roaming
:: ============================================================
echo [6/6] Procesare Cursor roaming...

set "SRC=C:\Users\david\AppData\Roaming\Cursor"
set "DST=%DEV_DATA%\ai\cursor\roaming"

if exist "%SRC%" (
    echo     Ștergere: %SRC%
    rmdir /s /q "%SRC%" 2>nul
)
echo     Creare junction point: %SRC% -^> %DST%
mklink /J "%SRC%" "%DST%"

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║               OPERAȚIUNE COMPLETĂ!                         ║
echo ╠════════════════════════════════════════════════════════════╣
echo ║  Junction points create cu succes:                         ║
echo ║                                                            ║
echo ║  C:\Users\david\AppData\Local\npm-cache                    ║
echo ║  C:\Users\david\AppData\Roaming\npm                        ║
echo ║  C:\Users\david\.vscode\extensions                         ║
echo ║  C:\Users\david\AppData\Roaming\Code                       ║
echo ║  C:\Users\david\AppData\Roaming\Claude                     ║
echo ║  C:\Users\david\AppData\Roaming\Cursor                     ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

:: Verificare spațiu liber
for /f "tokens=3" %%a in ('wmic logicaldisk where "DeviceID='C:'" get FreeSpace /value ^| findstr "="') do set "C_FREE=%%a"
set /a "C_FREE_GB=!C_FREE!/1024/1024/1024"
echo Spațiu liber pe C: !C_FREE_GB! GB
echo.

:: Verificare junction points
echo Verificare junction points:
echo.
dir "C:\Users\david\AppData\Local\npm-cache" /AL 2>nul | findstr "<JUNCTION>" && echo     [OK] npm-cache
dir "C:\Users\david\AppData\Roaming\npm" /AL 2>nul | findstr "<JUNCTION>" && echo     [OK] npm global
dir "C:\Users\david\.vscode\extensions" /AL 2>nul | findstr "<JUNCTION>" && echo     [OK] VS Code extensions
dir "C:\Users\david\AppData\Roaming\Code" /AL 2>nul | findstr "<JUNCTION>" && echo     [OK] VS Code roaming
dir "C:\Users\david\AppData\Roaming\Claude" /AL 2>nul | findstr "<JUNCTION>" && echo     [OK] Claude
dir "C:\Users\david\AppData\Roaming\Cursor" /AL 2>nul | findstr "<JUNCTION>" && echo     [OK] Cursor

echo.
echo Gata! Aplicațiile vor folosi datele de pe D:\DevData
echo.

pause
