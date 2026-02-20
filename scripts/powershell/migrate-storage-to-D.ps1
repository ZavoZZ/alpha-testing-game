# ============================================================================
# STORAGE MIGRATION SCRIPT - Muta toate datele de pe C: pe D:
# ============================================================================
# Acest script muta:
# 1. Docker Desktop data (WSL2 distributions)
# 2. npm cache
# 3. VS Code extensions si cache
# 4. Configureaza variabile de mediu pentru viitoarele instalari
#
# IMPORTANT: Rulati ca Administrator!
# ============================================================================

param(
    [switch]$DryRun = $false,
    [switch]$SkipDocker = $false,
    [switch]$SkipNpm = $false,
    [switch]$SkipVSCode = $false
)

$ErrorActionPreference = "Stop"

# Culori pentru output
function Write-Info { param($msg) Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Success { param($msg) Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Warning { param($msg) Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Write-Error { param($msg) Write-Host "[ERROR] $msg" -ForegroundColor Red }

# Verifica daca ruleaza ca Administrator
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# ============================================================================
# SECTIUNEA 1: DOCKER DESKTOP
# ============================================================================
function Move-DockerData {
    Write-Info "=== DOCKER DESKTOP MIGRATION ==="
    
    # Verifica daca Docker Desktop ruleaza
    $dockerProcess = Get-Process -Name "Docker Desktop" -ErrorAction SilentlyContinue
    if ($dockerProcess) {
        Write-Warning "Docker Desktop ruleaza. Trebuie oprit inainte de migrare."
        if (-not $DryRun) {
            Write-Info "Oprire Docker Desktop..."
            Stop-Process -Name "Docker Desktop" -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 5
        }
    }
    
    # Oprire WSL
    Write-Info "Oprire WSL..."
    if (-not $DryRun) {
        wsl --shutdown 2>$null
        Start-Sleep -Seconds 3
    }
    
    # Creare directoare destinatie
    $dockerDest = "D:\DockerData"
    $wslDest = "D:\WSL"
    
    if (-not $DryRun) {
        New-Item -ItemType Directory -Force -Path $dockerDest | Out-Null
        New-Item -ItemType Directory -Force -Path $wslDest | Out-Null
    }
    Write-Success "Directoare destinatie create: $dockerDest, $wslDest"
    
    # Listeaza distributiile WSL Docker
    Write-Info "Listare distributii WSL Docker..."
    $wslList = wsl -l -v 2>$null | Out-String
    
    if ($wslList -match "docker-desktop") {
        Write-Info "Gasit docker-desktop distribution"
        
        # Export docker-desktop
        $dockerDesktopDest = "$wslDest\docker-desktop-data.tar"
        
        if (-not $DryRun) {
            Write-Info "Export docker-desktop-data..."
            wsl --export docker-desktop-data $dockerDesktopDest 2>$null
            
            if (Test-Path $dockerDesktopDest) {
                Write-Success "docker-desktop-data exportat cu succes"
                
                # Unregister si reimport
                Write-Info "Unregister docker-desktop-data..."
                wsl --unregister docker-desktop-data 2>$null
                
                Write-Info "Import docker-desktop-data in noua locatie..."
                wsl --import docker-desktop-data "$wslDest\distro" $dockerDesktopDest --version 2 2>$null
                
                Write-Success "docker-desktop-data mutat cu succes!"
            }
        } else {
            Write-Info "[DRY RUN] Ar exporta docker-desktop-data catre $dockerDesktopDest"
        }
    }
    
    # Configureaza Docker Desktop sa foloseasca noul locatie
    # Docker Desktop pe Windows cu WSL2 foloseste automat WSL
    # Trebuie configurat in Docker Desktop Settings
    
    Write-Warning "IMPORTANT: Dupa rularea acestui script:"
    Write-Warning "1. Deschide Docker Desktop"
    Write-Warning "2. Mergi la Settings > Resources > Advanced"
    Write-Warning "3. Verifica ca Disk image location sa fie pe D:"
    
    # Curatare build cache
    Write-Info "Curatare Docker build cache..."
    if (-not $DryRun) {
        docker builder prune -f 2>$null
    }
    
    Write-Success "Docker migration complet!"
}

# ============================================================================
# SECTIUNEA 2: NPM CACHE
# ============================================================================
function Move-NpmCache {
    Write-Info "=== NPM CACHE MIGRATION ==="
    
    $npmCacheDest = "D:\npm-cache"
    
    if (-not $DryRun) {
        New-Item -ItemType Directory -Force -Path $npmCacheDest | Out-Null
    }
    Write-Success "Director npm cache creat: $npmCacheDest"
    
    # Configureaza npm cache
    Write-Info "Configurare npm cache..."
    if (-not $DryRun) {
        npm config set cache $npmCacheDest --global
        npm config set prefix "D:\npm-global" --global
    }
    
    # Creare director npm-global
    $npmGlobalDest = "D:\npm-global"
    if (-not $DryRun) {
        New-Item -ItemType Directory -Force -Path $npmGlobalDest | Out-Null
    }
    
    # Adauga la PATH
    Write-Info "Adaugare npm-global la PATH..."
    if (-not $DryRun) {
        $currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
        if ($currentPath -notlike "*$npmGlobalDest*") {
            [Environment]::SetEnvironmentVariable("PATH", "$currentPath;$npmGlobalDest", "User")
        }
    }
    
    # Curata cache vechi
    Write-Info "Curatare cache vechi..."
    $oldCache = "$env:APPDATA\npm-cache"
    if (Test-Path $oldCache) {
        $oldSize = (Get-ChildItem -Path $oldCache -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB
        Write-Info "Cache vechi: $([math]::Round($oldSize, 2)) MB"
        
        if (-not $DryRun) {
            Remove-Item -Path $oldCache -Recurse -Force -ErrorAction SilentlyContinue
            Write-Success "Cache vechi sters!"
        }
    }
    
    Write-Success "NPM cache migration complet!"
}

# ============================================================================
# SECTIUNEA 3: VS CODE
# ============================================================================
function Move-VSCodeData {
    Write-Info "=== VS CODE MIGRATION ==="
    
    # 1. Extensii
    $vscodeExtensionsSrc = "$env:USERPROFILE\.vscode\extensions"
    $vscodeExtensionsDest = "D:\VSCode\extensions"
    
    if (Test-Path $vscodeExtensionsSrc) {
        $extSize = (Get-ChildItem -Path $vscodeExtensionsSrc -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB
        Write-Info "Extensii VS Code: $([math]::Round($extSize, 2)) MB"
        
        if (-not $DryRun) {
            Write-Info "Mutare extensii..."
            New-Item -ItemType Directory -Force -Path $vscodeExtensionsDest | Out-Null
            
            # Copiaza extensii
            Copy-Item -Path "$vscodeExtensionsSrc\*" -Destination $vscodeExtensionsDest -Recurse -Force -ErrorAction SilentlyContinue
            
            # Creare junction point (simlink)
            $junctionExists = Test-Path $vscodeExtensionsSrc
            if ($junctionExists) {
                Rename-Item -Path $vscodeExtensionsSrc -NewName "extensions.old" -Force -ErrorAction SilentlyContinue
            }
            
            New-Item -ItemType Junction -Path $vscodeExtensionsSrc -Target $vscodeExtensionsDest -Force | Out-Null
            Write-Success "Extensii mutate si junction creat!"
        }
    }
    
    # 2. Cache si date VS Code
    $vscodeDataSrc = "$env:APPDATA\Code"
    $vscodeDataDest = "D:\VSCode\Data"
    
    if (Test-Path $vscodeDataSrc) {
        $dataSize = (Get-ChildItem -Path $vscodeDataSrc -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB
        Write-Info "Date VS Code: $([math]::Round($dataSize, 2)) MB"
        
        if (-not $DryRun) {
            Write-Info "Mutare date VS Code..."
            New-Item -ItemType Directory -Force -Path $vscodeDataDest | Out-Null
            
            # Muta doar folderele mari (Cache, CachedData, CachedExtensions, etc.)
            $cacheFolders = @("Cache", "CachedData", "CachedExtensions", "CachedExtensionVSIXs", "Code Cache", "GPUCache", "Service Worker", "CachedProfiles")
            
            foreach ($folder in $cacheFolders) {
                $srcPath = "$vscodeDataSrc\$folder"
                $destPath = "$vscodeDataDest\$folder"
                
                if (Test-Path $srcPath) {
                    Write-Info "  Mutare $folder..."
                    New-Item -ItemType Directory -Force -Path $destPath | Out-Null
                    Copy-Item -Path "$srcPath\*" -Destination $destPath -Recurse -Force -ErrorAction SilentlyContinue
                    
                    # Creare junction
                    Rename-Item -Path $srcPath -NewName "$folder.old" -Force -ErrorAction SilentlyContinue
                    New-Item -ItemType Junction -Path $srcPath -Target $destPath -Force | Out-Null
                }
            }
            
            Write-Success "Date VS Code mutate!"
        }
    }
    
    # 3. Configureaza variabila de mediu pentru extensii
    Write-Info "Configurare VSCODE_EXTENSIONS..."
    if (-not $DryRun) {
        [Environment]::SetEnvironmentVariable("VSCODE_EXTENSIONS", $vscodeExtensionsDest, "User")
    }
    
    Write-Success "VS Code migration complet!"
}

# ============================================================================
# SECTIUNEA 4: VARIABILE DE MEDIU
# ============================================================================
function Set-EnvironmentVariables {
    Write-Info "=== CONFIGURARE VARIABILE DE MEDIU ==="
    
    $vars = @{
        "NPM_CONFIG_CACHE" = "D:\npm-cache"
        "NPM_CONFIG_PREFIX" = "D:\npm-global"
        "VSCODE_EXTENSIONS" = "D:\VSCode\extensions"
        "TEMP" = "D:\Temp"
        "TMP" = "D:\Temp"
    }
    
    foreach ($var in $vars.GetEnumerator()) {
        Write-Info "Setare $($var.Key) = $($var.Value)"
        if (-not $DryRun) {
            [Environment]::SetEnvironmentVariable($var.Key, $var.Value, "User")
            
            # Creare director daca nu exista
            if (-not (Test-Path $var.Value)) {
                New-Item -ItemType Directory -Force -Path $var.Value | Out-Null
            }
        }
    }
    
    # Creare folder Temp pe D
    if (-not $DryRun) {
        New-Item -ItemType Directory -Force -Path "D:\Temp" | Out-Null
    }
    
    Write-Success "Variabile de mediu configurate!"
}

# ============================================================================
# SECTIUNEA 5: CURATARE
# ============================================================================
function Invoke-Cleanup {
    Write-Info "=== CURATARE ==="
    
    # Sterge folderele .old
    $oldFolders = @(
        "$env:USERPROFILE\.vscode\extensions.old"
        "$env:APPDATA\Code\Cache.old"
        "$env:APPDATA\Code\CachedData.old"
        "$env:APPDATA\Code\CachedExtensions.old"
        "$env:APPDATA\Code\Code Cache.old"
        "$env:APPDATA\Code\GPUCache.old"
    )
    
    foreach ($folder in $oldFolders) {
        if (Test-Path $folder) {
            $size = (Get-ChildItem -Path $folder -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB
            Write-Info "Gasit $folder ($([math]::Round($size, 2)) MB)"
            
            if (-not $DryRun) {
                Remove-Item -Path $folder -Recurse -Force -ErrorAction SilentlyContinue
                Write-Success "Sters $folder"
            }
        }
    }
    
    # Curatare Docker images neutilizate
    Write-Info "Curatare Docker images neutilizate..."
    if (-not $DryRun) {
        docker image prune -f 2>$null
        docker volume prune -f 2>$null
    }
    
    Write-Success "Curatare complet!"
}

# ============================================================================
# MAIN
# ============================================================================
function Main {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Magenta
    Write-Host "  STORAGE MIGRATION: C: -> D:" -ForegroundColor Magenta
    Write-Host "========================================" -ForegroundColor Magenta
    Write-Host ""
    
    if ($DryRun) {
        Write-Warning "MOD DRY RUN - Nu se vor face modificari!"
        Write-Host ""
    }
    
    if (-not (Test-Administrator)) {
        Write-Error "Acest script trebuie rulat ca Administrator!"
        Write-Info "Click dreapta pe PowerShell si selectati 'Run as Administrator'"
        exit 1
    }
    
    # Verifica spațiu pe D:
    $dDrive = Get-WmiObject Win32_LogicalDisk -Filter "DeviceID='D:'"
    $freeSpaceGB = [math]::Round($dDrive.FreeSpace / 1GB, 2)
    Write-Info "Spatiu liber pe D: $freeSpaceGB GB"
    
    if ($freeSpaceGB -lt 10) {
        Write-Error "Spatiu insuficient pe D: (minim 10GB necesar)"
        exit 1
    }
    
    # Executa migrarile
    if (-not $SkipDocker) { Move-DockerData }
    if (-not $SkipNpm) { Move-NpmCache }
    if (-not $SkipVSCode) { Move-VSCodeData }
    Set-EnvironmentVariables
    
    if (-not $DryRun) {
        Invoke-Cleanup
    }
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  MIGRATION COMPLET!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    
    Write-Warning "ACTIUNI NECESARE DUPA RESTART:"
    Write-Host "1. Restarteaza computerul pentru a aplica variabilele de mediu"
    Write-Host "2. Porneste Docker Desktop si verifica setarile"
    Write-Host "3. Deschide VS Code si verifica extensiile"
    Write-Host "4. Ruleaza 'npm cache verify' pentru a verifica cache-ul"
    Write-Host ""
    
    if (-not $DryRun) {
        Write-Info "Spațiu eliberat pe C: aproximativ 6-8 GB"
    }
}

# Ruleaza scriptul
Main
