@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

echo ============================================================
echo    RECUPERARE SI MIGRARE SIGURA CATRE D: DRIVE
echo ============================================================
echo.
echo Acest script va:
echo 1. Curăți spațiu suplimentar pe C:
echo 2. Muta Docker pe D: (sigur, cu backup)
echo 3. Configura viitoarele instalări pe D:
echo.
echo Spațiu curent pe C:
wmic logicaldisk where "DeviceID='C:'" get FreeSpace,Size /format:list | findstr "FreeSpace Size"
echo.
pause

:: PASUL 1: Curățare suplimentară
echo.
echo [PASUL 1] Curățare fișiere inutile...
echo.

:: Curățare Windows Update cache
echo Curățare Windows Update cache...
del /q /f /s "C:\Windows\SoftwareDistribution\Download\*" 2>nul

:: Curățare prefetch
echo Curățare Prefetch...
del /q /f "C:\Windows\Prefetch\*" 2>nul

:: Curățare crash dumps
echo Curățare Crash Dumps...
del /q /f "C:\Users\david\AppData\Local\CrashDumps\*" 2>nul
del /q /f "C:\Users\david\AppData\Local\Temp\wsl-crashes\*" 2>nul

:: Curățare npm cache vechi
echo Curățare npm cache vechi...
if exist "C:\Users\david\AppData\Local\npm-cache" rmdir /s /q "C:\Users\david\AppData\Local\npm-cache" 2>nul

:: Curățare pnpm cache
echo Curățare pnpm cache...
if exist "C:\Users\david\AppData\Local\pnpm-cache" rmdir /s /q "C:\Users\david\AppData\Local\pnpm-cache" 2>nul
if exist "C:\Users\david\AppData\Local\pnpm-store" rmdir /s /q "C:\Users\david\AppData\Local\pnpm-store" 2>nul

:: Curățare yarn cache
echo Curățare yarn cache...
if exist "C:\Users\david\AppData\Local\Yarn\Cache" rmdir /s /q "C:\Users\david\AppData\Local\Yarn\Cache" 2>nul

:: Curățare VS Code cache vechi
echo Curățare VS Code cache vechi...
if exist "C:\Users\david\AppData\Roaming\Code\Cache" rmdir /s /q "C:\Users\david\AppData\Roaming\Code\Cache" 2>nul
if exist "C:\Users\david\AppData\Roaming\Code\CachedData" rmdir /s /q "C:\Users\david\AppData\Roaming\Code\CachedData" 2>nul
if exist "C:\Users\david\AppData\Roaming\Code\CachedExtensions" rmdir /s /q "C:\Users\david\AppData\Roaming\Code\CachedExtensions" 2>nul

echo.
echo Spațiu după curățare:
wmic logicaldisk where "DeviceID='C:'" get FreeSpace,Size /format:list | findstr "FreeSpace Size"
echo.
pause

:: PASUL 2: Migrare Docker
echo.
echo [PASUL 2] Migrare Docker catre D: drive...
echo.

:: Verificăm dacă Docker rulează
tasklist /fi "imagename eq Docker Desktop.exe" 2>nul | find /i "Docker Desktop.exe" >nul
if !errorlevel! equ 0 (
    echo Docker Desktop ruleaza. Trebuie inchis...
    taskkill /f /im "Docker Desktop.exe" 2>nul
    timeout /t 5 >nul
)

:: Oprim WSL
echo Oprim WSL...
wsl --shutdown 2>nul
timeout /t 3 >nul

:: Creăm directorul destinație
echo Creăm directorul destinație...
if not exist "D:\DockerData" mkdir "D:\DockerData"

:: Migrăm WSL docker-desktop-data
echo.
echo Migrăm WSL docker-desktop-data...
if exist "C:\Users\david\AppData\Local\Docker\wsl\data\docker-desktop-data.tar" (
    echo Se pare că există deja un export anterior. Verificăm...
)

:: Exportăm distribuția WSL
echo Exportăm docker-desktop-data...
wsl --export docker-desktop-data "D:\DockerData\docker-desktop-data.tar" 2>nul
if !errorlevel! neq 0 (
    echo Eroare la export. Încercăm să continuăm...
)

:: Verificăm dacă exportul a reușit
if exist "D:\DockerData\docker-desktop-data.tar" (
    echo Export reușit. Dimensiune:
    dir "D:\DockerData\docker-desktop-data.tar" | find "docker-desktop-data.tar"
    
    echo.
    echo ATENȚIE: Acum vom șterge distribuția WSL veche și o vom importa de pe D:
    echo Aceasta va elibera spațiu pe C: drive.
    echo.
    set /p confirm="Continuăm? (y/n): "
    if /i "!confirm!" equ "y" (
        echo Unregister docker-desktop-data...
        wsl --unregister docker-desktop-data 2>nul
        
        echo Importăm de pe D:...
        wsl --import docker-desktop-data "D:\DockerData\wsl" "D:\DockerData\docker-desktop-data.tar" --version 2 2>nul
        
        echo Migrare WSL completă!
    ) else (
        echo Migrare WSL anulată. Exportul rămâne pe D: pentru utilizare ulterioară.
    )
) else (
    echo Exportul nu a reușit. Verificăm dacă distribuția există...
    wsl --list --verbose
)

:: PASUL 3: Configurare Docker Desktop settings
echo.
echo [PASUL 3] Configurare Docker Desktop pentru D: drive...
echo.

:: Creăm folderul pentru Docker Desktop
if not exist "D:\DockerData\DockerDesktop" mkdir "D:\DockerData\DockerDesktop"

:: Configurăm settings.json pentru Docker Desktop
set DOCKER_SETTINGS=%APPDATA%\Docker\settings.json
if exist "%DOCKER_SETTINGS%" (
    echo Backup settings.json...
    copy "%DOCKER_SETTINGS%" "%DOCKER_SETTINGS%.backup" >nul 2>nul
    
    echo Configurăm Docker să folosească D: pentru imagini...
    powershell -Command "(Get-Content '%DOCKER_SETTINGS%') -replace '\"dataFolder\": \"[^\"]*\"', '\"dataFolder\": \"D:\\DockerData\"' | Set-Content '%DOCKER_SETTINGS%'" 2>nul
)

echo.
echo ============================================================
echo    MIGRARE DOCKER COMPLETĂ
echo ============================================================
echo.
echo Spațiu curent:
wmic logicaldisk get size,freespace,caption
echo.
pause

:: PASUL 4: Configurare variabile de mediu
echo.
echo [PASUL 4] Configurare variabile de mediu pentru viitoare instalări...
echo.

:: Creăm folderele destinație
if not exist "D:\npm-cache" mkdir "D:\npm-cache"
if not exist "D:\npm-global" mkdir "D:\npm-global"
if not exist "D:\pip-cache" mkdir "D:\pip-cache"
if not exist "D:\VSCodeExtensions" mkdir "D:\VSCodeExtensions"
if not exist "D:\AppData\Local" mkdir "D:\AppData\Local"
if not exist "D:\AppData\Roaming" mkdir "D:\AppData\Roaming"

:: Setăm variabilele de mediu
echo Setăm variabilele de mediu...

:: npm
setx npm_config_cache "D:\npm-cache" /M 2>nul
setx npm_config_prefix "D:\npm-global" /M 2>nul

:: pip (Python)
setx PIP_CACHE_DIR "D:\pip-cache" /M 2>nul

:: VS Code extensions
setx VSCODE_EXTENSIONS "D:\VSCodeExtensions" /M 2>nul

echo.
echo Variabile de mediu setate:
echo npm_config_cache = D:\npm-cache
echo npm_config_prefix = D:\npm-global
echo PIP_CACHE_DIR = D:\pip-cache
echo VSCODE_EXTENSIONS = D:\VSCodeExtensions
echo.

:: PASUL 5: Creare fișier de configurare npm
echo.
echo [PASUL 5] Creare fișier .npmrc global...
echo.

set NPMRC=D:\npm-global\etc\npmrc
if not exist "D:\npm-global\etc" mkdir "D:\npm-global\etc"
echo cache=D:\npm-cache > "%NPMRC%"
echo prefix=D:\npm-global >> "%NPMRC%"

echo Fișier .npmrc creat la: %NPMRC%
echo.

:: PASUL 6: Creare fișier pip.conf
echo.
echo [PASUL 6] Creare fișier pip.ini global...
echo.

set PIPINI=D:\pip-cache\pip.ini
echo [global] > "%PIPINI%"
echo cache-dir = D:\pip-cache >> "%PIPINI%"

echo Fișier pip.ini creat la: %PIPINI%
echo.

echo ============================================================
echo    MIGRARE COMPLETĂ!
echo ============================================================
echo.
echo Spațiu final:
wmic logicaldisk get size,freespace,caption
echo.
echo Următorii pași:
echo 1. Repornește Docker Desktop
echo 2. Verifică că totul funcționează
echo 3. Dacă totul e OK, poți șterge backup-ul de pe D:\DockerData\docker-desktop-data.tar
echo.
pause
