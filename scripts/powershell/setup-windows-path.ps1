# Windows PATH Setup Script for Docker, Node.js, npm, and Git
# This script adds necessary tools to the User PATH environment variable

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Windows PATH Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to add to PATH if not already present
function Add-ToPath {
    param(
        [string]$PathToAdd,
        [string]$ToolName
    )
    
    if (Test-Path $PathToAdd) {
        $currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
        
        if ($currentPath -notlike "*$PathToAdd*") {
            Write-Host "[+] Adding $ToolName to PATH: $PathToAdd" -ForegroundColor Green
            $newPath = $currentPath + ";" + $PathToAdd
            [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
            $env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [Environment]::GetEnvironmentVariable("Path", "User")
            return $true
        } else {
            Write-Host "[OK] $ToolName already in PATH: $PathToAdd" -ForegroundColor Yellow
            return $false
        }
    } else {
        Write-Host "[!] Path not found for $ToolName : $PathToAdd" -ForegroundColor Red
        return $false
    }
}

# Function to verify tool is accessible
function Test-Tool {
    param(
        [string]$Command,
        [string]$ToolName
    )
    
    try {
        $null = & $Command --version 2>&1
        Write-Host "[OK] $ToolName is accessible" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "[X] $ToolName is NOT accessible" -ForegroundColor Red
        return $false
    }
}

# Backup current PATH
Write-Host "Creating backup of current PATH..." -ForegroundColor Cyan
$backupPath = [Environment]::GetEnvironmentVariable("Path", "User")
$backupFile = "path-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss').txt"
$backupPath | Out-File -FilePath $backupFile -Encoding UTF8
Write-Host "[OK] PATH backup saved to: $backupFile" -ForegroundColor Green
Write-Host ""

# Track changes
$pathsAdded = @()
$pathsSkipped = @()
$pathsNotFound = @()

# Docker paths to check
Write-Host "Checking Docker paths..." -ForegroundColor Cyan
$dockerPaths = @(
    "C:\Program Files\Docker\Docker\resources\bin",
    "C:\Program Files\Docker\Docker\resources",
    "$env:ProgramFiles\Docker\Docker\resources\bin",
    "$env:ProgramFiles\Docker\Docker\resources"
)

foreach ($path in $dockerPaths) {
    if (Test-Path $path) {
        $result = Add-ToPath -PathToAdd $path -ToolName "Docker"
        if ($result) {
            $pathsAdded += "Docker: $path"
        } else {
            $pathsSkipped += "Docker: $path"
        }
        break
    }
}

# Node.js paths to check
Write-Host "Checking Node.js paths..." -ForegroundColor Cyan
$nodePaths = @(
    "C:\Program Files\nodejs",
    "C:\Program Files (x86)\nodejs",
    "$env:ProgramFiles\nodejs",
    "${env:ProgramFiles(x86)}\nodejs",
    "$env:APPDATA\npm"
)

foreach ($path in $nodePaths) {
    if (Test-Path $path) {
        $result = Add-ToPath -PathToAdd $path -ToolName "Node.js"
        if ($result) {
            $pathsAdded += "Node.js: $path"
        } else {
            $pathsSkipped += "Node.js: $path"
        }
    }
}

# npm global path
$npmPath = "$env:APPDATA\npm"
if (Test-Path $npmPath) {
    $result = Add-ToPath -PathToAdd $npmPath -ToolName "npm (global)"
    if ($result) {
        $pathsAdded += "npm: $npmPath"
    } else {
        $pathsSkipped += "npm: $npmPath"
    }
}

# Git paths to check
Write-Host "Checking Git paths..." -ForegroundColor Cyan
$gitPaths = @(
    "C:\Program Files\Git\cmd",
    "C:\Program Files (x86)\Git\cmd",
    "$env:ProgramFiles\Git\cmd",
    "${env:ProgramFiles(x86)}\Git\cmd",
    "C:\Program Files\Git\bin",
    "$env:ProgramFiles\Git\bin"
)

foreach ($path in $gitPaths) {
    if (Test-Path $path) {
        $result = Add-ToPath -PathToAdd $path -ToolName "Git"
        if ($result) {
            $pathsAdded += "Git: $path"
        } else {
            $pathsSkipped += "Git: $path"
        }
        break
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PATH Update Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if ($pathsAdded.Count -gt 0) {
    Write-Host ""
    Write-Host "Paths Added:" -ForegroundColor Green
    foreach ($path in $pathsAdded) {
        Write-Host "  + $path" -ForegroundColor Green
    }
}

if ($pathsSkipped.Count -gt 0) {
    Write-Host ""
    Write-Host "Paths Already Present:" -ForegroundColor Yellow
    foreach ($path in $pathsSkipped) {
        Write-Host "  [OK] $path" -ForegroundColor Yellow
    }
}

# Refresh environment variables for current session
$env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [Environment]::GetEnvironmentVariable("Path", "User")

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Verifying Tools" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verify each tool
$dockerOk = Test-Tool -Command "docker" -ToolName "Docker"
$nodeOk = Test-Tool -Command "node" -ToolName "Node.js"
$npmOk = Test-Tool -Command "npm" -ToolName "npm"
$gitOk = Test-Tool -Command "git" -ToolName "Git"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Final Status" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$allOk = $dockerOk -and $nodeOk -and $npmOk -and $gitOk

if ($allOk) {
    Write-Host "[OK] All tools are accessible!" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now use Docker, Node.js, npm, and Git from any command prompt." -ForegroundColor Green
    Write-Host "Note: You may need to restart any open terminals for changes to take effect." -ForegroundColor Yellow
    exit 0
} else {
    Write-Host "[!] Some tools are not accessible. Please check the following:" -ForegroundColor Red
    Write-Host ""
    if (-not $dockerOk) { Write-Host "  - Docker may not be installed or not in a standard location" -ForegroundColor Red }
    if (-not $nodeOk) { Write-Host "  - Node.js may not be installed or not in a standard location" -ForegroundColor Red }
    if (-not $npmOk) { Write-Host "  - npm may not be installed or not in a standard location" -ForegroundColor Red }
    if (-not $gitOk) { Write-Host "  - Git may not be installed or not in a standard location" -ForegroundColor Red }
    Write-Host ""
    Write-Host "Please install missing tools or manually add them to PATH." -ForegroundColor Yellow
    Write-Host "See WINDOWS_PATH_SETUP_GUIDE.md for manual instructions." -ForegroundColor Yellow
    exit 1
}
