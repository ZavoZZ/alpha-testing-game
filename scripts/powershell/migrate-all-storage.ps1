# ============================================================================
# COMPLETE STORAGE MIGRATION - Muta TOATE datele de pe C: pe D:
# ============================================================================
# 
# Acopera:
# - Docker Desktop (5.3 GB)
# - Roblox (4.8 GB)
# - .minecraft (1.76 GB)
# - Packages/Windows Apps (1.5 GB)
# - NVIDIA cache (1.3 GB)
# - Google Chrome cache (1.2 GB)
# - Perplexity AI (976 MB)
# - VS Code (747 MB)
# - AnthropicClaude AI (546 MB)
# - Cursor AI (291 MB)
# - npm-cache (259 MB)
# - Temp files (815 MB)
#
# IMPORTANT: Rulati ca Administrator!
# ============================================================================

param(
    [switch]$DryRun = $false,
    [switch]$SkipDocker = $false,
    [switch]$SkipGames = $false,
    [switch]$SkipAI = $false,
    [switch]$SkipCache = $false,
    [switch]$CleanOnly = $false
)

$ErrorActionPreference = "Stop"

function Write-Info { param($msg) Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Success { param($msg) Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Warning { param($msg) Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Write-Error { param($msg) Write-Host "[ERROR] $msg" -ForegroundColor Red }
function Write-Step { param($num, $msg) Write-Host "`n[$num] $msg" -ForegroundColor Magenta }

# Verifica administrator
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Functie pentru mutare cu junction
function Move-WithJunction {
    param(
        [string]$SourcePath,
        [string]$DestPath,
        [string]$Name
    )
    
    if (-not (Test-Path $SourcePath)) {
        Write-Warning "$Name nu exista la $SourcePath"
        return $false
    }
    
    $size = (Get-ChildItem -Path $SourcePath -Recurse -Force -ErrorAction SilentlyContinue | 
             Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue).Sum / 1MB
    
    Write-Info "$Name : $([math]::Round($size, 2)) MB"
    
    if ($DryRun) {
        Write-Info "[DRY RUN] Ar muta $SourcePath -> $DestPath"
        return $true
    }
    
    # Creare destinatie
    $destDir = Split-Path $DestPath -Parent
    if (-not (Test-Path $destDir)) {
        New-Item -ItemType Directory -Force -Path $destDir | Out-Null
    }
    
    # Copiaza continutul
    Write-Info "Copiere $Name..."
    Copy-Item -Path $SourcePath -Destination $DestPath -Recurse -Force -ErrorAction SilentlyContinue
    
    # Redenumeste sursa
    $backupPath = "$SourcePath.old"
    if (Test-Path $backupPath) {
        Remove-Item $backupPath -Recurse -Force -ErrorAction SilentlyContinue
    }
    Rename-Item -Path $SourcePath -NewName "$Name.old" -Force -ErrorAction SilentlyContinue
    
    # Creare junction
    New-Item -ItemType Junction -Path $SourcePath -Target $DestPath -Force | Out-Null
    
    Write-Success "$Name mutat cu succes!"
    return $true
}

# Functie pentru curatare
function Invoke-Cleanup {
    param([string]$Path, [string]$Name)
    
    if (-not (Test-Path $Path)) {
        return
    }
    
    $size = (Get-ChildItem -Path $Path -Recurse -Force -ErrorAction SilentlyContinue | 
             Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue).Sum / 1MB
    
    if ($size -gt 0) {
        Write-Info "Curatare $Name : $([math]::Round($size, 2)) MB"
        
        if (-not $DryRun) {
            Remove-Item -Path "$Path\*" -Recurse -Force -ErrorAction SilentlyContinue
            Write-Success "$Name curatat!"
        }
    }
}

# ============================================================================
# MAIN
# ============================================================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "  COMPLETE STORAGE MIGRATION: C: -> D:" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""

if ($DryRun) {
    Write-Warning "MOD DRY RUN - Nu se vor face modificari!"
    Write-Host ""
}

if ($CleanOnly) {
    Write-Warning "MOD CLEAN ONLY - Doar curatare, fara mutari!"
    Write-Host ""
}

if (-not (Test-Administrator)) {
    Write-Error "Acest script trebuie rulat ca Administrator!"
    Write-Info "Click dreapta pe PowerShell -> Run as Administrator"
    exit 1
}

# Verifica D:
$dDrive = Get-WmiObject Win32_LogicalDisk -Filter "DeviceID='D:'" -ErrorAction SilentlyContinue
if (-not $dDrive) {
    Write-Error "Drive D: nu exista!"
    exit 1
}
$freeGB = [math]::Round($dDrive.FreeSpace / 1GB, 2)
Write-Info "Spatiu liber pe D: $freeGB GB"

if ($freeGB -lt 20) {
    Write-Error "Spatiu insuficient pe D: (minim 20GB necesar)"
    exit 1
}

# Creare structura directoare pe D:
Write-Step "0" "Creare structura directoare pe D:"
$directories = @(
    "D:\MigratedData",
    "D:\MigratedData\Docker",
    "D:\MigratedData\WSL",
    "D:\MigratedData\npm-cache",
    "D:\MigratedData\npm-global",
    "D:\MigratedData\VSCode",
    "D:\MigratedData\VSCode\extensions",
    "D:\MigratedData\VSCode\Data",
    "D:\MigratedData\AI",
    "D:\MigratedData\AI\AnthropicClaude",
    "D:\MigratedData\AI\Perplexity",
    "D:\MigratedData\AI\Cursor",
    "D:\MigratedData\Games",
    "D:\MigratedData\Games\Roblox",
    "D:\MigratedData\Games\Minecraft",
    "D:\MigratedData\Cache",
    "D:\MigratedData\Cache\Google",
    "D:\MigratedData\Cache\NVIDIA",
    "D:\MigratedData\Temp"
)

if (-not $DryRun) {
    foreach ($dir in $directories) {
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Force -Path $dir | Out-Null
        }
    }
}
Write-Success "Directoare create!"

# ============================================================================
# PASUL 1: DOCKER
# ============================================================================
if (-not $SkipDocker -and -not $CleanOnly) {
    Write-Step "1" "DOCKER DESKTOP"
    
    # Opreste Docker
    Write-Info "Oprire Docker Desktop..."
    if (-not $DryRun) {
        Stop-Process -Name "Docker Desktop" -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 3
        wsl --shutdown 2>$null
        Start-Sleep -Seconds 3
    }
    
    # Curatare Docker
    Write-Info "Curatare Docker cache..."
    if (-not $DryRun) {
        docker system prune -f 2>$null
        docker builder prune -f 2>$null
    }
    
    # WSL distributions
    Write-Info "Verificare WSL distributions..."
    $wslList = wsl -l -v 2>$null | Out-String
    
    if ($wslList -match "docker-desktop-data" -and -not $DryRun) {
        $exportPath = "D:\MigratedData\WSL\docker-desktop-data.tar"
        Write-Info "Export docker-desktop-data..."
        wsl --export docker-desktop-data $exportPath 2>$null
        
        if (Test-Path $exportPath) {
            Write-Info "Unregister docker-desktop-data..."
            wsl --unregister docker-desktop-data 2>$null
            
            Write-Info "Import in noua locatie..."
            wsl --import docker-desktop-data "D:\MigratedData\WSL\docker-desktop-data" $exportPath --version 2 2>$null
            Write-Success "docker-desktop-data mutat!"
        }
    }
    
    Write-Success "Docker complet!"
}

# ============================================================================
# PASUL 2: AI APPLICATIONS
# ============================================================================
if (-not $SkipAI -and -not $CleanOnly) {
    Write-Step "2" "AI APPLICATIONS"
    
    # AnthropicClaude
    $claudePath = "$env:LOCALAPPDATA\AnthropicClaude"
    if (Test-Path $claudePath) {
        Move-WithJunction -SourcePath $claudePath -DestPath "D:\MigratedData\AI\AnthropicClaude" -Name "AnthropicClaude"
    }
    
    # Perplexity
    $perplexityPath = "$env:LOCALAPPDATA\Perplexity"
    if (Test-Path $perplexityPath) {
        Move-WithJunction -SourcePath $perplexityPath -DestPath "D:\MigratedData\AI\Perplexity" -Name "Perplexity"
    }
    
    # Cursor
    $cursorPath = "$env:APPDATA\Cursor"
    if (Test-Path $cursorPath) {
        Move-WithJunction -SourcePath $cursorPath -DestPath "D:\MigratedData\AI\Cursor" -Name "Cursor"
    }
    
    Write-Success "AI Applications complet!"
}

# ============================================================================
# PASUL 3: GAMES (Curatare urme dupa dezinstalare)
# ============================================================================
if (-not $SkipGames) {
    Write-Step "3" "GAMES - Curatare urme dupa dezinstalare"
    
    # Roblox - STERGE urmele dupa dezinstalare
    $robloxPath = "$env:LOCALAPPDATA\Roblox"
    if (Test-Path $robloxPath) {
        $size = (Get-ChildItem -Path $robloxPath -Recurse -Force -ErrorAction SilentlyContinue | 
                 Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue).Sum / 1GB
        Write-Info "Roblox (urme dupa dezinstalare): $([math]::Round($size, 2)) GB"
        
        if (-not $DryRun) {
            Write-Info "Stergere urme Roblox..."
            Remove-Item -Path $robloxPath -Recurse -Force -ErrorAction SilentlyContinue
            Write-Success "Urme Roblox sterse! Eliberat: $([math]::Round($size, 2)) GB"
        }
    }
    
    # Minecraft - doar curatare cache, nu sterge tot
    $minecraftPath = "$env:APPDATA\.minecraft"
    if (Test-Path $minecraftPath) {
        $minecraftCache = @("logs", "crash-reports", ".mixin.out")
        foreach ($folder in $minecraftCache) {
            $cachePath = "$minecraftPath\$folder"
            if (Test-Path $cachePath) {
                Invoke-Cleanup -Path $cachePath -Name "Minecraft $folder"
            }
        }
    }
    
    Write-Success "Games complet!"
}

# ============================================================================
# PASUL 4: CACHE FILES
# ============================================================================
if (-not $SkipCache) {
    Write-Step "4" "CACHE FILES (Curatare)"
    
    # Google Chrome cache
    $googleCachePaths = @(
        "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Cache",
        "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Code Cache",
        "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\GPUCache"
    )
    foreach ($path in $googleCachePaths) {
        Invoke-Cleanup -Path $path -Name "Google Chrome Cache"
    }
    
    # NVIDIA cache
    Invoke-Cleanup -Path "$env:LOCALAPPDATA\NVIDIA\DXCache" -Name "NVIDIA DXCache"
    Invoke-Cleanup -Path "$env:LOCALAPPDATA\NVIDIA\GLCache" -Name "NVIDIA GLCache"
    
    # Temp
    Invoke-Cleanup -Path $env:TEMP -Name "User Temp"
    Invoke-Cleanup -Path "$env:LOCALAPPDATA\Temp" -Name "LocalAppData Temp"
    
    # CrashDumps
    Invoke-Cleanup -Path "$env:LOCALAPPDATA\CrashDumps" -Name "CrashDumps"
    
    # npm cache
    if (-not $CleanOnly) {
        Write-Info "Configurare npm cache pe D:..."
        if (-not $DryRun) {
            npm config set cache "D:\MigratedData\npm-cache" --global 2>$null
        }
    }
    Invoke-Cleanup -Path "$env:APPDATA\npm-cache" -Name "npm-cache vechi"
    
    Write-Success "Cache complet!"
}

# ============================================================================
# PASUL 5: VS CODE
# ============================================================================
if (-not $CleanOnly) {
    Write-Step "5" "VS CODE"
    
    # Extensii
    $vscodeExtPath = "$env:USERPROFILE\.vscode\extensions"
    if (Test-Path $vscodeExtPath) {
        Move-WithJunction -SourcePath $vscodeExtPath -DestPath "D:\MigratedData\VSCode\extensions" -Name "VS Code Extensions"
    }
    
    # Cache VS Code
    $vscodeCacheFolders = @("Cache", "CachedData", "CachedExtensions", "CachedExtensionVSIXs", "Code Cache", "GPUCache")
    foreach ($folder in $vscodeCacheFolders) {
        $srcPath = "$env:APPDATA\Code\$folder"
        if (Test-Path $srcPath) {
            Invoke-Cleanup -Path $srcPath -Name "VS Code $folder"
        }
    }
    
    Write-Success "VS Code complet!"
}

# ============================================================================
# PASUL 6: VARIABILE DE MEDIU
# ============================================================================
if (-not $CleanOnly) {
    Write-Step "6" "VARIABILE DE MEDIU"
    
    $envVars = @{
        "NPM_CONFIG_CACHE" = "D:\MigratedData\npm-cache"
        "NPM_CONFIG_PREFIX" = "D:\MigratedData\npm-global"
        "VSCODE_EXTENSIONS" = "D:\MigratedData\VSCode\extensions"
        "TEMP" = "D:\MigratedData\Temp"
        "TMP" = "D:\MigratedData\Temp"
    }
    
    foreach ($var in $envVars.GetEnumerator()) {
        Write-Info "$($var.Key) = $($var.Value)"
        if (-not $DryRun) {
            [Environment]::SetEnvironmentVariable($var.Key, $var.Value, "User")
        }
    }
    
    # Adauga npm-global la PATH
    $currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
    if ($currentPath -notlike "*D:\MigratedData\npm-global*") {
        if (-not $DryRun) {
            [Environment]::SetEnvironmentVariable("PATH", "$currentPath;D:\MigratedData\npm-global", "User")
        }
    }
    
    Write-Success "Variabile de mediu configurate!"
}

# ============================================================================
# PASUL 7: CURATARE FINALA
# ============================================================================
Write-Step "7" "CURATARE FINALA"

# Sterge folderele .old
$oldFolders = Get-ChildItem -Path $env:LOCALAPPDATA -Directory -Filter "*.old" -ErrorAction SilentlyContinue
$oldFolders += Get-ChildItem -Path $env:APPDATA -Directory -Filter "*.old" -ErrorAction SilentlyContinue
$oldFolders += Get-ChildItem -Path $env:USERPROFILE -Directory -Filter "*.old" -ErrorAction SilentlyContinue

foreach ($folder in $oldFolders) {
    $size = (Get-ChildItem -Path $folder.FullName -Recurse -Force -ErrorAction SilentlyContinue | 
             Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue).Sum / 1MB
    if ($size -gt 0) {
        Write-Info "Gasit $($folder.Name) : $([math]::Round($size, 2)) MB"
        if (-not $DryRun) {
            Remove-Item -Path $folder.FullName -Recurse -Force -ErrorAction SilentlyContinue
            Write-Success "Sters $($folder.Name)"
        }
    }
}

# ============================================================================
# FINAL
# ============================================================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  MIGRATION COMPLETA!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Calculeaza spatiu eliberat
$cDrive = Get-WmiObject Win32_LogicalDisk -Filter "DeviceID='C:'"
$freeMB = [math]::Round($cDrive.FreeSpace / 1MB, 2)
Write-Host "Spatiu liber pe C: $freeMB MB" -ForegroundColor $(if($freeMB -lt 500){"Red"}elseif($freeMB -lt 2000){"Yellow"}else{"Green"})

Write-Host ""
Write-Warning "ACTIUNI NECESARE DUPA RESTART:"
Write-Host "1. Restarteaza computerul"
Write-Host "2. Deschide Docker Desktop -> Settings -> Resources -> Advanced"
Write-Host "   Seteaza Disk image location: D:\MigratedData\Docker"
Write-Host "3. Verifica VS Code: code --list-extensions"
Write-Host "4. Verifica npm: npm cache verify"
Write-Host ""

if ($DryRun) {
    Write-Warning "A fost doar un DRY RUN. Pentru migrare reala, ruleaza fara -DryRun"
}
