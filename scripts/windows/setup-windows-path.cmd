@echo off
REM Windows PATH Setup - CMD Wrapper
REM This script launches the PowerShell PATH setup script

echo ========================================
echo Windows PATH Setup Launcher
echo ========================================
echo.

REM Check if PowerShell is available
where powershell >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] PowerShell is not available on this system.
    echo Please install PowerShell to run this script.
    pause
    exit /b 1
)

echo Starting PowerShell PATH setup script...
echo.

REM Run PowerShell script with execution policy bypass
powershell -ExecutionPolicy Bypass -File "%~dp0setup-windows-path.ps1"

set SCRIPT_EXIT_CODE=%errorlevel%

echo.
echo ========================================
echo Setup Complete
echo ========================================
echo.

if %SCRIPT_EXIT_CODE% equ 0 (
    echo [SUCCESS] PATH setup completed successfully!
    echo.
    echo IMPORTANT: Please restart any open terminals for changes to take effect.
) else (
    echo [WARNING] PATH setup completed with warnings or errors.
    echo Please check the output above for details.
)

echo.
pause
exit /b %SCRIPT_EXIT_CODE%
