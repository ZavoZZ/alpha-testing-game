@echo off
:: ============================================================================
:: CONFIGURARE AUTOMATA PENTRU VIITOARELE INSTALARI
:: Seteaza toate variabilele de mediu pentru a folosi D: drive
:: ============================================================================

echo.
echo ========================================
echo   CONFIGURARE D: DRIVE PENTRU VIITOR
echo ========================================
echo.

:: Verifica daca ruleaza ca Administrator
net session >nul 2>&1
if errorlevel 1 (
    echo WARNING: Nu rulati ca Administrator.
    echo Unele setari pot necesita drepturi de administrator.
    echo.
)

:: Creare directoare pe D:
echo [1] Creare directoare pe D:...
if not exist "D:\Temp" mkdir "D:\Temp"
if not exist "D:\npm-cache" mkdir "D:\npm-cache"
if not exist "D:\npm-global" mkdir "D:\npm-global"
if not exist "D:\VSCode\extensions" mkdir "D:\VSCode\extensions"
if not exist "D:\DockerData" mkdir "D:\DockerData"
if not exist "D:\WSL" mkdir "D:\WSL"
echo     [OK] Directoare create
echo.

:: Setare variabile de mediu USER
echo [2] Setare variabile de mediu USER...

:: npm
npm config set cache "D:\npm-cache" --global 2>nul
npm config set prefix "D:\npm-global" --global 2>nul
echo     npm cache: D:\npm-cache
echo     npm prefix: D:\npm-global

:: Variabile de mediu
setx NPM_CONFIG_CACHE "D:\npm-cache" >nul 2>&1
setx NPM_CONFIG_PREFIX "D:\npm-global" >nul 2>&1
setx VSCODE_EXTENSIONS "D:\VSCode\extensions" >nul 2>&1
setx TEMP "D:\Temp" >nul 2>&1
setx TMP "D:\Temp" >nul 2>&1
echo     Variabile setate
echo.

:: Adauga npm-global la PATH
echo [3] Adaugare npm-global la PATH...
for /f "tokens=2*" %%a in ('reg query "HKCU\Environment" /v PATH 2^>nul') do set "user_path=%%b"
if not defined user_path set "user_path="
echo %user_path% | findstr /C:"D:\npm-global" >nul
if errorlevel 1 (
    setx PATH "%user_path%;D:\npm-global" >nul 2>&1
    echo     [OK] npm-global adaugat la PATH
) else (
    echo     [SKIP] npm-global deja in PATH
)
echo.

:: Configurare Docker Desktop (daca exista)
echo [4] Configurare Docker Desktop...
if exist "%LOCALAPPDATA%\Docker" (
    echo     Docker Desktop detectat
    echo     Pentru a muta datele Docker pe D:
    echo       1. Deschide Docker Desktop
    echo       2. Settings ^> Resources ^> Advanced
    echo       3. Seteaza Disk image location la D:\DockerData
    echo       4. Apply ^& Restart
) else (
    echo     Docker Desktop nu este instalat
)
echo.

:: Configurare WSL (daca exista)
echo [5] Configurare WSL...
wsl --status >nul 2>&1
if not errorlevel 1 (
    echo     WSL detectat
    echo     Pentru a muta distributiile WSL pe D:
    echo       wsl --shutdown
    echo       wsl --export docker-desktop-data D:\WSL\docker-desktop-data.tar
    echo       wsl --unregister docker-desktop-data
    echo       wsl --import docker-desktop-data D:\WSL\docker-desktop-data D:\WSL\docker-desktop-data.tar --version 2
) else (
    echo     WSL nu este instalat
)
echo.

:: Configurare VS Code
echo [6] Configurare VS Code...
if exist "%APPDATA%\Code" (
    echo     VS Code detectat
    
    :: Creare junction pentru extensii daca nu exista
    if exist "%USERPROFILE%\.vscode\extensions" (
        echo     Extensii deja existente
        echo     Pentru a muta extensiile pe D:
        echo       1. Inchide VS Code
        echo       2. Ruleaza: migrate-storage-to-D.ps1
    )
) else (
    echo     VS Code nu este instalat
)
echo.

:: Configurare pip (Python) - daca exista
echo [7] Configurare pip (Python)...
where pip >nul 2>&1
if not errorlevel 1 (
    pip config set global.cache-dir "D:\pip-cache" 2>nul
    if not errorlevel 1 (
        echo     [OK] pip cache configurat pe D:\pip-cache
    )
) else (
    echo     pip nu este instalat
)
echo.

:: Rezumat
echo ========================================
echo   CONFIGURARE COMPLETA!
echo ========================================
echo.
echo Variabile de mediu setate:
echo   NPM_CONFIG_CACHE = D:\npm-cache
echo   NPM_CONFIG_PREFIX = D:\npm-global
echo   VSCODE_EXTENSIONS = D:\VSCode\extensions
echo   TEMP = D:\Temp
echo   TMP = D:\Temp
echo.
echo IMPORTANT: Restarteaza terminalul sau
echo             deschide o fereastra noua pentru
echo             a aplica variabilele de mediu.
echo.

pause
