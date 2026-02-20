# ============================================================================
# STORAGE ANALYSIS - Analiza completa a spatiului pe C:
# ============================================================================

param(
    [int]$TopN = 20
)

$ErrorActionPreference = "SilentlyContinue"

function Get-FolderSize {
    param($Path)
    try {
        $size = (Get-ChildItem -Path $Path -Recurse -Force -ErrorAction SilentlyContinue | 
                 Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue).Sum
        return [math]::Round($size / 1MB, 2)
    } catch {
        return 0
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "  ANALIZA COMPLETA STOCARE C:" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""

# Analiza LocalAppData
Write-Host "[1] %LOCALAPPDATA% (AppData\Local)" -ForegroundColor Cyan
$localAppData = @()
Get-ChildItem -Path $env:LOCALAPPDATA -Directory -Force -ErrorAction SilentlyContinue | 
    ForEach-Object {
        $size = Get-FolderSize -Path $_.FullName
        if ($size -gt 10) {
            $localAppData += [PSCustomObject]@{
                Name = $_.Name
                SizeMB = $size
                Path = $_.FullName
            }
        }
    }

$localAppData | Sort-Object SizeMB -Descending | Select-Object -First $TopN | 
    Format-Table -AutoSize @{L='Folder';E={$_.Name}}, @{L='Size (MB)';E={$_.SizeMB}}, @{L='Path';E={$_.Path}}

# Analiza AppData\Roaming
Write-Host ""
Write-Host "[2] %APPDATA% (AppData\Roaming)" -ForegroundColor Cyan
$roamingData = @()
Get-ChildItem -Path $env:APPDATA -Directory -Force -ErrorAction SilentlyContinue | 
    ForEach-Object {
        $size = Get-FolderSize -Path $_.FullName
        if ($size -gt 10) {
            $roamingData += [PSCustomObject]@{
                Name = $_.Name
                SizeMB = $size
                Path = $_.FullName
            }
        }
    }

$roamingData | Sort-Object SizeMB -Descending | Select-Object -First $TopN | 
    Format-Table -AutoSize @{L='Folder';E={$_.Name}}, @{L='Size (MB)';E={$_.SizeMB}}, @{L='Path';E={$_.Path}}

# Analiza User Profile
Write-Host ""
Write-Host "[3] %USERPROFILE% (User folders)" -ForegroundColor Cyan
$userFolders = @("Desktop", "Documents", "Downloads", "Videos", "Music", "Pictures", ".vscode", ".ollama")
foreach ($folder in $userFolders) {
    $path = Join-Path $env:USERPROFILE $folder
    if (Test-Path $path) {
        $size = Get-FolderSize -Path $path
        if ($size -gt 10) {
            Write-Host ("{0,-20} {1,10:N2} MB" -f $folder, $size)
        }
    }
}

# Total
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
$totalLocal = ($localAppData | Measure-Object -Property SizeMB -Sum).Sum
$totalRoaming = ($roamingData | Measure-Object -Property SizeMB -Sum).Sum
Write-Host ("Total LocalAppData: {0:N2} MB ({1:N2} GB)" -f $totalLocal, ($totalLocal/1024))
Write-Host ("Total Roaming: {0:N2} MB ({1:N2} GB)" -f $totalRoaming, ($totalRoaming/1024))
Write-Host ("Total analizat: {0:N2} MB ({1:N2} GB)" -f ($totalLocal+$totalRoaming), (($totalLocal+$totalRoaming)/1024))
Write-Host "========================================" -ForegroundColor Green

# Spatiu liber
$cDrive = Get-WmiObject Win32_LogicalDisk -Filter "DeviceID='C:'"
$freeGB = [math]::Round($cDrive.FreeSpace / 1GB, 2)
$totalGB = [math]::Round($cDrive.Size / 1GB, 2)
Write-Host ""
Write-Host "Spatiu liber C: $freeGB GB din $totalGB GB" -ForegroundColor $(if($freeGB -lt 5){"Red"}elseif($freeGB -lt 20){"Yellow"}else{"Green"})

# Recomandari
Write-Host ""
Write-Host "RECOMANDARI PENTRU CURATARE:" -ForegroundColor Yellow
Write-Host "1. Docker: docker system prune -a -f (elibereaza imagini neutilizate)"
Write-Host "2. Temp: sterge continutul din %TEMP% si %LOCALAPPDATA%\Temp"
Write-Host "3. npm: npm cache clean --force"
Write-Host "4. CrashDumps: sterge din %LOCALAPPDATA%\CrashDumps"
Write-Host "5. Browser cache: curata din Chrome/Edge settings"
Write-Host ""
