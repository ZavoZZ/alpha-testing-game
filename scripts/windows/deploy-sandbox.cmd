@echo off
REM ============================================================
REM Deploy to Production Script for Windows
REM ============================================================
REM 
REM This script:
REM 1. Runs local tests
REM 2. Commits changes to Git
REM 3. Pushes to GitHub
REM 4. Deploys to production server
REM 5. Verifies production deployment
REM
REM Usage: deploy-sandbox.cmd "Your commit message"
REM ============================================================

setlocal enabledelayedexpansion

REM Check for commit message
if "%~1"=="" (
    echo [ERROR] Please provide a commit message
    echo Usage: deploy-sandbox.cmd "Your commit message"
    pause
    exit /b 1
)

set COMMIT_MSG=%~1

echo.
echo ============================================================
echo           DEPLOY TO PRODUCTION
echo ============================================================
echo.
echo Commit message: %COMMIT_MSG%
echo.

REM Step 1: Run local tests
echo [1/5] Running local tests...
call test-sandbox.cmd
if errorlevel 1 (
    echo [ERROR] Local tests failed! Fix issues before deploying.
    pause
    exit /b 1
)

REM Step 2: Check Git status
echo.
echo [2/5] Checking Git status...
git status --porcelain > temp_git_status.txt
set /p GIT_STATUS=<temp_git_status.txt
del temp_git_status.txt

if not "%GIT_STATUS%"=="" (
    echo [INFO] You have uncommitted changes
    echo.
    git status --short
    echo.
    
    REM Stage all changes
    echo Staging all changes...
    git add .
    
    REM Commit
    echo Committing changes...
    git commit -m "%COMMIT_MSG%"
    
    if errorlevel 1 (
        echo [WARNING] Commit failed or nothing to commit
    )
) else (
    echo [OK] No uncommitted changes
)

REM Step 3: Pull latest from remote
echo.
echo [3/5] Pulling latest from GitHub...
git pull origin main --rebase

if errorlevel 1 (
    echo [ERROR] Git pull failed! Resolve conflicts and try again.
    pause
    exit /b 1
)

REM Step 4: Push to GitHub
echo.
echo [4/5] Pushing to GitHub...
git push origin main

if errorlevel 1 (
    echo [ERROR] Git push failed!
    pause
    exit /b 1
)
echo [OK] Pushed to GitHub

REM Step 5: Deploy to production
echo.
echo [5/5] Deploying to production server...
echo This may take a few minutes...
echo.

ssh root@ovidiuguru.online "cd /root/MERN-template && git pull origin main && docker compose down && docker compose up -d --build"

if errorlevel 1 (
    echo [ERROR] Deployment failed!
    pause
    exit /b 1
)

echo.
echo ============================================================
echo           DEPLOYMENT COMPLETE!
echo ============================================================
echo.
echo Production URL: https://ovidiuguru.online
echo.
echo Verify deployment:
echo   curl https://ovidiuguru.online
echo   curl https://ovidiuguru.online/api/economy/health
echo.

REM Open production in browser
echo Opening production in browser...
start https://ovidiuguru.online

echo.
pause
