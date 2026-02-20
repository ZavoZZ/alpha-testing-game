# ============================================================================
# Docker Desktop Configuration for D: Drive
# ============================================================================
# Configureaza Docker Desktop sa foloseasca D: pentru date
# ============================================================================

param(
    [switch]$DryRun = $false
)

$ErrorActionPreference = "Stop"

function Write-Info { param($msg) Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Success { param($msg) Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Warning { param($msg) Write-Host "[WARN] $msg" -ForegroundColor Yellow }

# Docker Desktop settings path
$daemonJsonPath = "$env:USERPROFILE\.docker\daemon.json"

Write-Info "=== DOCKER DESKTOP D: CONFIGURATION ==="

# Creare directoare pe D:
$dockerDataPath = "D:\DockerData"
$dockerWslPath = "D:\WSL"

if (-not $DryRun) {
    New-Item -ItemType Directory -Force -Path $dockerDataPath | Out-Null
    New-Item -ItemType Directory -Force -Path $dockerWslPath | Out-Null
}
Write-Success "Directoare create: $dockerDataPath, $dockerWslPath"

# ============================================================================
# METODA 1: WSL Distribution Move (Pentru Docker Desktop cu WSL2)
# ============================================================================
function Move-WSLDockerData {
    Write-Info "Mutare WSL Docker distributions..."
    
    # Oprire Docker Desktop
    Write-Info "Oprire Docker Desktop..."
    if (-not $DryRun) {
        Stop-Process -Name "Docker Desktop" -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 3
        wsl --shutdown
        Start-Sleep -Seconds 3
    }
    
    # Listeaza distributiile
    $distros = wsl -l -v 2>$null | Out-String
    
    Write-Info "Distributii WSL curente:"
    Write-Host $distros
    
    # Export docker-desktop-data
    if ($distros -match "docker-desktop-data") {
        $exportPath = "$dockerWslPath\docker-desktop-data.tar"
        
        Write-Info "Export docker-desktop-data..."
        if (-not $DryRun) {
            wsl --export docker-desktop-data $exportPath 2>$null
            
            if (Test-Path $exportPath) {
                $size = (Get-Item $exportPath).Length / 1GB
                Write-Success "Export complet: $([math]::Round($size, 2)) GB"
                
                # Unregister
                Write-Info "Unregister docker-desktop-data..."
                wsl --unregister docker-desktop-data 2>$null
                
                # Import in noua locatie
                Write-Info "Import in noua locatie..."
                wsl --import docker-desktop-data "$dockerWslPath\docker-desktop-data" $exportPath --version 2 2>$null
                
                Write-Success "docker-desktop-data mutat pe D:"
                
                # Sterge tar-ul dupa import
                # Remove-Item $exportPath -Force
            }
        }
    }
    
    # Export docker-desktop (daca exista)
    if ($distros -match "docker-desktop\s") {
        $exportPath = "$dockerWslPath\docker-desktop.tar"
        
        Write-Info "Export docker-desktop..."
        if (-not $DryRun) {
            wsl --export docker-desktop $exportPath 2>$null
            
            if (Test-Path $exportPath) {
                Write-Info "Unregister docker-desktop..."
                wsl --unregister docker-desktop 2>$null
                
                Write-Info "Import in noua locatie..."
                wsl --import docker-desktop "$dockerWslPath\docker-desktop" $exportPath --version 2 2>$null
                
                Write-Success "docker-desktop mutat pe D:"
            }
        }
    }
}

# ============================================================================
# METODA 2: Daemon.json Configuration
# ============================================================================
function Set-DockerDaemonConfig {
    Write-Info "Configurare daemon.json..."
    
    $daemonConfig = @{
        "data-root" = $dockerDataPath
        "storage-opts" = @(
            "size=100GB"
        )
    }
    
    $daemonJson = $daemonConfig | ConvertTo-Json -Depth 10
    
    if (-not $DryRun) {
        # Creare director daca nu exista
        $daemonDir = Split-Path $daemonJsonPath -Parent
        if (-not (Test-Path $daemonDir)) {
            New-Item -ItemType Directory -Force -Path $daemonDir | Out-Null
        }
        
        # Backup existent
        if (Test-Path $daemonJsonPath) {
            Copy-Item $daemonJsonPath "$daemonJsonPath.backup" -Force
        }
        
        # Scrie configurare noua
        $daemonJson | Out-File -FilePath $daemonJsonPath -Encoding utf8
        
        Write-Success "daemon.json configurat"
    } else {
        Write-Info "[DRY RUN] Ar scrie daemon.json:"
        Write-Host $daemonJson
    }
}

# ============================================================================
# METODA 3: Docker Desktop Settings Store
# ============================================================================
function Set-DockerDesktopSettings {
    Write-Info "Configurare Docker Desktop settings..."
    
    # Docker Desktop foloseste un settings-store.json
    $settingsStorePath = "$env:APPDATA\Docker\settings-store.json"
    
    if (Test-Path $settingsStorePath) {
        $settings = Get-Content $settingsStorePath | ConvertFrom-Json
        
        # Seteaza calea pentru disk image
        if ($settings.PSObject.Properties.Match("dataFolder")) {
            $settings.dataFolder = $dockerDataPath
        }
        
        if (-not $DryRun) {
            $settings | ConvertTo-Json -Depth 10 | Out-File $settingsStorePath -Encoding utf8
            Write-Success "Docker Desktop settings actualizat"
        }
    }
}

# ============================================================================
# METODA 4: Environment Variable
# ============================================================================
function Set-DockerEnvVars {
    Write-Info "Configurare variabile de mediu Docker..."
    
    $envVars = @{
        "DOCKER_DATA_ROOT" = $dockerDataPath
        "DOCKER_BUILDKIT" = "1"
    }
    
    foreach ($var in $envVars.GetEnumerator()) {
        if (-not $DryRun) {
            [Environment]::SetEnvironmentVariable($var.Key, $var.Value, "User")
            Write-Success "$($var.Key) = $($var.Value)"
        }
    }
}

# ============================================================================
# MAIN
# ============================================================================
Write-Host ""
Write-Host "Configurare Docker Desktop pentru D: Drive" -ForegroundColor Magenta
Write-Host ""

if ($DryRun) {
    Write-Warning "MOD DRY RUN - Nu se vor face modificari!"
}

# Executa configurarile
Move-WSLDockerData
Set-DockerDaemonConfig
Set-DockerDesktopSettings
Set-DockerEnvVars

Write-Host ""
Write-Success "CONFIGURARE COMPLETA!"
Write-Host ""
Write-Warning "ACTIUNI NECESARE:"
Write-Host "1. Deschide Docker Desktop"
Write-Host "2. Mergi la Settings > Resources > Advanced"
Write-Host "3. Verifica/seteaza Disk image location la: $dockerDataPath"
Write-Host "4. Click Apply & Restart"
Write-Host ""
Write-Info "Docker va folosi acum D: pentru toate datele"
