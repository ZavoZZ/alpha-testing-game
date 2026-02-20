@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

:: ============================================================
:: REPARARE JUNCTION POINTS - C: DRIVE
:: Creează junction points lipsă pentru datele migrate pe D:
:: ============================================================

title Reparare Junction Points

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║           REPARARE JUNCTION POINTS                        ║
echo ║                                                            ║
echo ║  Creează legături de pe C: către D:\DevData               ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

:: Verificare drepturi de Administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [EROARE] Acest script necesita drepturi de Administrator!
    echo Click dreapta pe script si selecteaza "Run as administrator"
    pause
    exit /b 1
)

set "DEV_DATA=D:\DevData"

:: ============================================================
:: 1. npm cache
:: ============================================================
echo [1/6] Verificare npm cache...

set "NPM_CACHE_SRC=C:\Users\david\AppData\Local\npm-cache"
set "NPM_CACHE_DST=%DEV_DATA%\npm\cache"

if exist "%NPM_CACHE_SRC%" (
    echo     Folderul exista deja: %NPM_CACHE_SRC%
) else (
    echo     Creare junction point: %NPM_CACHE_SRC% -^> %NPM_CACHE_DST%
    mklink /J "%NPM_CACHE_SRC%" "%NPM_CACHE_DST%"
)

:: ============================================================
:: 2. npm global
:: ============================================================
echo [2/6] Verificare npm global...

set "NPM_GLOBAL_SRC=C:\Users\david\AppData\Roaming\npm"
set "NPM_GLOBAL_DST=%DEV_DATA%\npm\global"

if exist "%NPM_GLOBAL_SRC%" (
    echo     Folderul exista deja: %NPM_GLOBAL_SRC%
) else (
    echo     Creare junction point: %NPM_GLOBAL_SRC% -^> %NPM_GLOBAL_DST%
    mklink /J "%NPM_GLOBAL_SRC%" "%NPM_GLOBAL_DST%"
)

:: ============================================================
:: 3. VS Code extensions
:: ============================================================
echo [3/6] Verificare VS Code extensions...

set "VSCODE_EXT_SRC=C:\Users\david\.vscode\extensions"
set "VSCODE_EXT_DST=%DEV_DATA%\vscode\extensions"

if exist "%VSCODE_EXT_SRC%" (
    echo     Folderul exista deja: %VSCODE_EXT_SRC%
) else (
    echo     Creare junction point: %VSCODE_EXT_SRC% -^> %VSCODE_EXT_DST%
    mklink /J "%VSCODE_EXT_SRC%" "%VSCODE_EXT_DST%"
)

:: ============================================================
:: 4. VS Code roaming
:: ============================================================
echo [4/6] Verificare VS Code roaming...

set "VSCODE_ROAMING_SRC=C:\Users\david\AppData\Roaming\Code"
set "VSCODE_ROAMING_DST=%DEV_DATA%\vscode\roaming"

if exist "%VSCODE_ROAMING_SRC%" (
    echo     Folderul exista deja: %VSCODE_ROAMING_SRC%
) else (
    echo     Creare junction point: %VSCODE_ROAMING_SRC% -^> %VSCODE_ROAMING_DST%
    mklink /J "%VSCODE_ROAMING_SRC%" "%VSCODE_ROAMING_DST%"
)

:: ============================================================
:: 5. Claude roaming
:: ============================================================
echo [5/6] Verificare Claude roaming...

set "CLAUDE_ROAMING_SRC=C:\Users\david\AppData\Roaming\Claude"
set "CLAUDE_ROAMING_DST=%DEV_DATA%\ai\claude\roaming"

if exist "%CLAUDE_ROAMING_SRC%" (
    echo     Folderul exista deja: %CLAUDE_ROAMING_SRC%
) else (
    echo     Creare junction point: %CLAUDE_ROAMING_SRC% -^> %CLAUDE_ROAMING_DST%
    mklink /J "%CLAUDE_ROAMING_SRC%" "%CLAUDE_ROAMING_DST%"
)

:: ============================================================
:: 6. Cursor roaming
:: ============================================================
echo [6/6] Verificare Cursor roaming...

set "CURSOR_SRC=C:\Users\david\AppData\Roaming\Cursor"
set "CURSOR_DST=%DEV_DATA%\ai\cursor\roaming"

if exist "%CURSOR_SRC%" (
    echo     Folderul exista deja: %CURSOR_SRC%
) else (
    echo     Creare junction point: %CURSOR_SRC% -^> %CURSOR_DST%
    mklink /J "%CURSOR_SRC%" "%CURSOR_DST%"
)

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║               REPARARE COMPLETĂ!                           ║
echo ╠════════════════════════════════════════════════════════════╣
echo ║  Junction points create:                                   ║
echo ║                                                            ║
echo ║  C:\Users\david\AppData\Local\npm-cache                    ║
echo ║  C:\Users\david\AppData\Roaming\npm                        ║
echo ║  C:\Users\david\.vscode\extensions                         ║
echo ║  C:\Users\david\AppData\Roaming\Code                       ║
echo ║  C:\Users\david\AppData\Roaming\Claude                     ║
echo ║  C:\Users\david\AppData\Roaming\Cursor                     ║
echo ║                                                            ║
echo ║  Toate pointează către D:\DevData                          ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

:: Verificare junction points
echo Verificare junction points:
echo.
dir "C:\Users\david\AppData\Local\npm-cache" /AL 2>nul && echo     [OK] npm-cache
dir "C:\Users\david\AppData\Roaming\npm" /AL 2>nul && echo     [OK] npm global
dir "C:\Users\david\.vscode\extensions" /AL 2>nul && echo     [OK] VS Code extensions
dir "C:\Users\david\AppData\Roaming\Code" /AL 2>nul && echo     [OK] VS Code roaming
dir "C:\Users\david\AppData\Roaming\Claude" /AL 2>nul && echo     [OK] Claude
dir "C:\Users\david\AppData\Roaming\Cursor" /AL 2>nul && echo     [OK] Cursor

echo.
echo Acum aplicațiile vor găsi datele!
echo.

pause
