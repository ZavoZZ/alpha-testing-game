@echo off
REM =====================================================================
REM Windows Wrapper for local-test.sh
REM =====================================================================
REM This script runs the bash script using Git Bash or WSL
REM Usage: scripts\local-test.cmd
REM =====================================================================

echo Running Local Tests...
echo.

REM Try Git Bash first
where bash >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    bash "%~dp0local-test.sh"
    exit /b %ERRORLEVEL%
)

REM Try WSL
where wsl >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    wsl bash "%~dp0local-test.sh"
    exit /b %ERRORLEVEL%
)

REM If neither is available, show error
echo ERROR: Neither Git Bash nor WSL is available!
echo.
echo Please install one of the following:
echo   1. Git for Windows (includes Git Bash): https://git-scm.com/download/win
echo   2. Windows Subsystem for Linux (WSL): https://docs.microsoft.com/en-us/windows/wsl/install
echo.
pause
exit /b 1
