@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

:: ============================================================
:: MIGRARE DATE DEZVOLTARE C: - D: DRIVE
:: Muta npm, VS Code, AI tools pe D: drive folosind junction points
:: ============================================================

title Migrare Date Dezvoltare pe D: Drive

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║     MIGRARE DATE DEZVOLTARE C: - D: DRIVE                  ║
echo ║                                                            ║
echo ║  Acest script va muta:                                     ║
echo ║  - npm cache si global packages                            ║
echo ║  - VS Code extensions si user data                         ║
echo ║  - AI tools (Claude, Cursor, Perplexity)                   ║
echo ║                                                            ║
echo ║  Foloseste junction points pentru transparenta             ║
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

:: Verificare existenta D: drive
if not exist "D:\" (
    echo [EROARE] D: drive nu exista!
    pause
    exit /b 1
)

:: Creare structura foldere pe D:
echo [1/8] Creare structura foldere pe D: drive...
echo.

set "DEV_DATA=D:\DevData"

:: Creare foldere principale
if not exist "%DEV_DATA%\npm\cache" mkdir "%DEV_DATA%\npm\cache"
if not exist "%DEV_DATA%\npm\global" mkdir "%DEV_DATA%\npm\global"
if not exist "%DEV_DATA%\vscode\extensions" mkdir "%DEV_DATA%\vscode\extensions"
if not exist "%DEV_DATA%\vscode\roaming" mkdir "%DEV_DATA%\vscode\roaming"
if not exist "%DEV_DATA%\ai\claude\local" mkdir "%DEV_DATA%\ai\claude\local"
if not exist "%DEV_DATA%\ai\claude\roaming" mkdir "%DEV_DATA%\ai\claude\roaming"
if not exist "%DEV_DATA%\ai\claude\cli" mkdir "%DEV_DATA%\ai\claude\cli"
if not exist "%DEV_DATA%\ai\cursor\roaming" mkdir "%DEV_DATA%\ai\cursor\roaming"
if not exist "%DEV_DATA%\ai\perplexity" mkdir "%DEV_DATA%\ai\perplexity"

echo     OK - Structura creata la %DEV_DATA%
echo.

:: Verificare spațiu liber pe D:
echo [2/8] Verificare spatiu liber pe D: drive...
for /f "tokens=3" %%a in ('dir D:\ ^| findstr /C:"bytes free"') do set "FREE_SPACE=%%a"
echo     Spatiu liber pe D: !FREE_SPACE! bytes
echo.

:: Avertisment - închidere aplicații
echo [3/8] AVERTISMENT: Inchide urmatoarele aplicatii inainte de a continua:
echo.
echo     - VS Code
echo     - Claude Desktop
echo     - Cursor
echo     - Perplexity
echo     - Orice terminal care foloseste npm
echo.
echo Apasa orice tasta pentru a continua sau Ctrl+C pentru a anula...
pause >nul

:: ============================================================
:: MIGRARE NPM
:: ============================================================
echo.
echo [4/8] Migrare npm...
echo.

:: npm cache
set "NPM_CACHE_SRC=C:\Users\david\AppData\Local\npm-cache"
set "NPM_CACHE_DST=%DEV_DATA%\npm\cache"

if exist "%NPM_CACHE_SRC%" (
    if exist "%NPM_CACHE_SRC%\*" (
        echo     Copiere npm cache...
        robocopy "%NPM_CACHE_SRC%" "%NPM_CACHE_DST%" /E /MOVE /R:1 /W:1 /NFL /NDL /NJH /NJS
        echo     OK - npm cache copiat
    )
    :: Verifica daca e deja junction
    dir "%NPM_CACHE_SRC%" /AL >nul 2>&1
    if !errorLevel! neq 0 (
        rmdir "%NPM_CACHE_SRC%" 2>nul
        mklink /J "%NPM_CACHE_SRC%" "%NPM_CACHE_DST%"
        echo     OK - Junction point creat pentru npm cache
    ) else (
        echo     OK - Junction point deja existent pentru npm cache
    )
) else (
    echo     INFO - npm cache nu exista, se creeaza junction direct
    mklink /J "%NPM_CACHE_SRC%" "%NPM_CACHE_DST%"
)

:: npm global
set "NPM_GLOBAL_SRC=C:\Users\david\AppData\Roaming\npm"
set "NPM_GLOBAL_DST=%DEV_DATA%\npm\global"

if exist "%NPM_GLOBAL_SRC%" (
    if exist "%NPM_GLOBAL_SRC%\*" (
        echo     Copiere npm global packages...
        robocopy "%NPM_GLOBAL_SRC%" "%NPM_GLOBAL_DST%" /E /MOVE /R:1 /W:1 /NFL /NDL /NJH /NJS
        echo     OK - npm global copiat
    )
    dir "%NPM_GLOBAL_SRC%" /AL >nul 2>&1
    if !errorLevel! neq 0 (
        rmdir "%NPM_GLOBAL_SRC%" 2>nul
        mklink /J "%NPM_GLOBAL_SRC%" "%NPM_GLOBAL_DST%"
        echo     OK - Junction point creat pentru npm global
    ) else (
        echo     OK - Junction point deja existent pentru npm global
    )
) else (
    echo     INFO - npm global nu exista, se creeaza junction direct
    mklink /J "%NPM_GLOBAL_SRC%" "%NPM_GLOBAL_DST%"
)

echo.

:: ============================================================
:: MIGRARE VS CODE
:: ============================================================
echo [5/8] Migrare VS Code...
echo.

:: VS Code extensions
set "VSCODE_EXT_SRC=C:\Users\david\.vscode\extensions"
set "VSCODE_EXT_DST=%DEV_DATA%\vscode\extensions"

if exist "%VSCODE_EXT_SRC%" (
    if exist "%VSCODE_EXT_SRC%\*" (
        echo     Copiere VS Code extensions...
        robocopy "%VSCODE_EXT_SRC%" "%VSCODE_EXT_DST%" /E /MOVE /R:1 /W:1 /NFL /NDL /NJH /NJS
        echo     OK - VS Code extensions copiate
    )
    dir "%VSCODE_EXT_SRC%" /AL >nul 2>&1
    if !errorLevel! neq 0 (
        rmdir "%VSCODE_EXT_SRC%" 2>nul
        mklink /J "%VSCODE_EXT_SRC%" "%VSCODE_EXT_DST%"
        echo     OK - Junction point creat pentru VS Code extensions
    ) else (
        echo     OK - Junction point deja existent pentru VS Code extensions
    )
) else (
    echo     INFO - VS Code extensions nu exista, se creeaza junction direct
    mklink /J "%VSCODE_EXT_SRC%" "%VSCODE_EXT_DST%"
)

:: VS Code roaming
set "VSCODE_ROAMING_SRC=C:\Users\david\AppData\Roaming\Code"
set "VSCODE_ROAMING_DST=%DEV_DATA%\vscode\roaming"

if exist "%VSCODE_ROAMING_SRC%" (
    if exist "%VSCODE_ROAMING_SRC%\*" (
        echo     Copiere VS Code user data...
        robocopy "%VSCODE_ROAMING_SRC%" "%VSCODE_ROAMING_DST%" /E /MOVE /R:1 /W:1 /NFL /NDL /NJH /NJS
        echo     OK - VS Code user data copiat
    )
    dir "%VSCODE_ROAMING_SRC%" /AL >nul 2>&1
    if !errorLevel! neq 0 (
        rmdir "%VSCODE_ROAMING_SRC%" 2>nul
        mklink /J "%VSCODE_ROAMING_SRC%" "%VSCODE_ROAMING_DST%"
        echo     OK - Junction point creat pentru VS Code roaming
    ) else (
        echo     OK - Junction point deja existent pentru VS Code roaming
    )
) else (
    echo     INFO - VS Code roaming nu exista, se creeaza junction direct
    mklink /J "%VSCODE_ROAMING_SRC%" "%VSCODE_ROAMING_DST%"
)

echo.

:: ============================================================
:: MIGRARE AI TOOLS
:: ============================================================
echo [6/8] Migrare AI Tools...
echo.

:: Claude Local
set "CLAUDE_LOCAL_SRC=C:\Users\david\AppData\Local\AnthropicClaude"
set "CLAUDE_LOCAL_DST=%DEV_DATA%\ai\claude\local"

if exist "%CLAUDE_LOCAL_SRC%" (
    if exist "%CLAUDE_LOCAL_SRC%\*" (
        echo     Copiere Claude local data...
        robocopy "%CLAUDE_LOCAL_SRC%" "%CLAUDE_LOCAL_DST%" /E /MOVE /R:1 /W:1 /NFL /NDL /NJH /NJS
    )
    dir "%CLAUDE_LOCAL_SRC%" /AL >nul 2>&1
    if !errorLevel! neq 0 (
        rmdir "%CLAUDE_LOCAL_SRC%" 2>nul
        mklink /J "%CLAUDE_LOCAL_SRC%" "%CLAUDE_LOCAL_DST%"
        echo     OK - Junction point creat pentru Claude local
    )
) else (
    mklink /J "%CLAUDE_LOCAL_SRC%" "%CLAUDE_LOCAL_DST%" 2>nul
)

:: Claude Roaming
set "CLAUDE_ROAMING_SRC=C:\Users\david\AppData\Roaming\Claude"
set "CLAUDE_ROAMING_DST=%DEV_DATA%\ai\claude\roaming"

if exist "%CLAUDE_ROAMING_SRC%" (
    if exist "%CLAUDE_ROAMING_SRC%\*" (
        echo     Copiere Claude roaming data...
        robocopy "%CLAUDE_ROAMING_SRC%" "%CLAUDE_ROAMING_DST%" /E /MOVE /R:1 /W:1 /NFL /NDL /NJH /NJS
    )
    dir "%CLAUDE_ROAMING_SRC%" /AL >nul 2>&1
    if !errorLevel! neq 0 (
        rmdir "%CLAUDE_ROAMING_SRC%" 2>nul
        mklink /J "%CLAUDE_ROAMING_SRC%" "%CLAUDE_ROAMING_DST%"
        echo     OK - Junction point creat pentru Claude roaming
    )
) else (
    mklink /J "%CLAUDE_ROAMING_SRC%" "%CLAUDE_ROAMING_DST%" 2>nul
)

:: Claude CLI
set "CLAUDE_CLI_SRC=C:\Users\david\AppData\Local\claude-cli-nodejs"
set "CLAUDE_CLI_DST=%DEV_DATA%\ai\claude\cli"

if exist "%CLAUDE_CLI_SRC%" (
    if exist "%CLAUDE_CLI_SRC%\*" (
        echo     Copiere Claude CLI data...
        robocopy "%CLAUDE_CLI_SRC%" "%CLAUDE_CLI_DST%" /E /MOVE /R:1 /W:1 /NFL /NDL /NJH /NJS
    )
    dir "%CLAUDE_CLI_SRC%" /AL >nul 2>&1
    if !errorLevel! neq 0 (
        rmdir "%CLAUDE_CLI_SRC%" 2>nul
        mklink /J "%CLAUDE_CLI_SRC%" "%CLAUDE_CLI_DST%"
        echo     OK - Junction point creat pentru Claude CLI
    )
) else (
    mklink /J "%CLAUDE_CLI_SRC%" "%CLAUDE_CLI_DST%" 2>nul
)

:: Cursor
set "CURSOR_SRC=C:\Users\david\AppData\Roaming\Cursor"
set "CURSOR_DST=%DEV_DATA%\ai\cursor\roaming"

if exist "%CURSOR_SRC%" (
    if exist "%CURSOR_SRC%\*" (
        echo     Copiere Cursor data...
        robocopy "%CURSOR_SRC%" "%CURSOR_DST%" /E /MOVE /R:1 /W:1 /NFL /NDL /NJH /NJS
    )
    dir "%CURSOR_SRC%" /AL >nul 2>&1
    if !errorLevel! neq 0 (
        rmdir "%CURSOR_SRC%" 2>nul
        mklink /J "%CURSOR_SRC%" "%CURSOR_DST%"
        echo     OK - Junction point creat pentru Cursor
    )
) else (
    mklink /J "%CURSOR_SRC%" "%CURSOR_DST%" 2>nul
)

:: Perplexity
set "PERPLEXITY_SRC=C:\Users\david\AppData\Local\Perplexity"
set "PERPLEXITY_DST=%DEV_DATA%\ai\perplexity"

if exist "%PERPLEXITY_SRC%" (
    if exist "%PERPLEXITY_SRC%\*" (
        echo     Copiere Perplexity data...
        robocopy "%PERPLEXITY_SRC%" "%PERPLEXITY_DST%" /E /MOVE /R:1 /W:1 /NFL /NDL /NJH /NJS
    )
    dir "%PERPLEXITY_SRC%" /AL >nul 2>&1
    if !errorLevel! neq 0 (
        rmdir "%PERPLEXITY_SRC%" 2>nul
        mklink /J "%PERPLEXITY_SRC%" "%PERPLEXITY_DST%"
        echo     OK - Junction point creat pentru Perplexity
    )
) else (
    mklink /J "%PERPLEXITY_SRC%" "%PERPLEXITY_DST%" 2>nul
)

echo.

:: ============================================================
:: CONFIGURARE ENVIRONMENT VARIABLES
:: ============================================================
echo [7/8] Configurare environment variables...
echo.

:: Setare environment variables pentru utilizator
setx npm_config_cache "%DEV_DATA%\npm\cache" >nul 2>&1
setx npm_config_prefix "%DEV_DATA%\npm\global" >nul 2>&1
setx VSCODE_EXTENSIONS "%DEV_DATA%\vscode\extensions" >nul 2>&1

echo     OK - Environment variables setate:
echo         npm_config_cache = %DEV_DATA%\npm\cache
echo         npm_config_prefix = %DEV_DATA%\npm\global
echo         VSCODE_EXTENSIONS = %DEV_DATA%\vscode\extensions
echo.

:: ============================================================
:: RAPORT FINAL
:: ============================================================
echo [8/8] Raport final...
echo.

:: Calcul dimensiuni
for /f "tokens=3" %%a in ('dir /s "%DEV_DATA%\npm" 2^>nul ^| findstr /C:"File(s)"') do set "NPM_SIZE=%%a"
for /f "tokens=3" %%a in ('dir /s "%DEV_DATA%\vscode" 2^>nul ^| findstr /C:"File(s)"') do set "VSCODE_SIZE=%%a"
for /f "tokens=3" %%a in ('dir /s "%DEV_DATA%\ai" 2^>nul ^| findstr /C:"File(s)"') do set "AI_SIZE=%%a"

echo ╔════════════════════════════════════════════════════════════╗
echo ║               MIGRARE COMPLETA!                            ║
echo ╠════════════════════════════════════════════════════════════╣
echo ║  Date mutate pe D: drive:                                  ║
echo ║                                                            ║
echo ║  npm:        %DEV_DATA%\npm                               ║
echo ║  VS Code:    %DEV_DATA%\vscode                            ║
echo ║  AI Tools:   %DEV_DATA%\ai                                ║
echo ║                                                            ║
echo ║  Docker:     D:\MigratedData\Docker (deja configurat)     ║
echo ║                                                            ║
echo ╠════════════════════════════════════════════════════════════╣
echo ║  URMATORII PASI:                                           ║
echo ║                                                            ║
echo ║  1. Reporneste VS Code                                     ║
echo ║  2. Reporneste AI tools (Claude, Cursor, Perplexity)       ║
echo ║  3. Deschide un terminal nou pentru npm                    ║
echo ║  4. Verifica functionarea cu:                              ║
echo ║     npm config get cache                                   ║
echo ║     code --list-extensions                                 ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

:: Salvare raport
set "REPORT_FILE=%DEV_DATA%\MIGRATION_REPORT.txt"
echo Raport migrare > "%REPORT_FILE%"
echo =============== >> "%REPORT_FILE%"
echo Data: %date% %time% >> "%REPORT_FILE%"
echo. >> "%REPORT_FILE%"
echo Locatii migrate: >> "%REPORT_FILE%"
echo - npm cache: %NPM_CACHE_DST% >> "%REPORT_FILE%"
echo - npm global: %NPM_GLOBAL_DST% >> "%REPORT_FILE%"
echo - VS Code extensions: %VSCODE_EXT_DST% >> "%REPORT_FILE%"
echo - VS Code roaming: %VSCODE_ROAMING_DST% >> "%REPORT_FILE%"
echo - Claude local: %CLAUDE_LOCAL_DST% >> "%REPORT_FILE%"
echo - Claude roaming: %CLAUDE_ROAMING_DST% >> "%REPORT_FILE%"
echo - Claude CLI: %CLAUDE_CLI_DST% >> "%REPORT_FILE%"
echo - Cursor: %CURSOR_DST% >> "%REPORT_FILE%"
echo - Perplexity: %PERPLEXITY_DST% >> "%REPORT_FILE%"

echo Raport salvat in: %REPORT_FILE%
echo.

pause
