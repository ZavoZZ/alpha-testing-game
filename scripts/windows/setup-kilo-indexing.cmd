@echo off
REM === Setup Kilo AI Codebase Indexing for Windows ===
echo === Setup Kilo AI Codebase Indexing for Windows ===
echo.

REM Check if Docker is installed
echo Checking for Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Docker is not installed!
    echo.
    echo Please install Docker Desktop for Windows:
    echo https://www.docker.com/products/docker-desktop
    echo.
    echo After installation, restart this script.
    pause
    exit /b 1
)
echo [OK] Docker is installed

REM Check if Docker is running
echo.
echo Checking if Docker is running...
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Docker is not running!
    echo.
    echo Please start Docker Desktop and wait for it to be ready.
    echo Then restart this script.
    pause
    exit /b 1
)
echo [OK] Docker is running

REM Stop and remove existing Qdrant container
echo.
echo Stopping existing Qdrant container (if any)...
docker stop qdrant >nul 2>&1
docker rm qdrant >nul 2>&1

REM Start Qdrant in Docker
echo.
echo Starting Qdrant vector database...
docker run -d --name qdrant -p 6333:6333 -p 6334:6334 -v "%cd%\qdrant_storage:/qdrant/storage" qdrant/qdrant:latest
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start Qdrant container
    pause
    exit /b 1
)

REM Wait for Qdrant to start
echo.
echo Waiting for Qdrant to start (10 seconds)...
timeout /t 10 /nobreak >nul

REM Verify Qdrant is running
echo.
echo Verifying Qdrant is running...
curl -s http://localhost:6333 >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Qdrant is not responding
    echo.
    echo Checking Docker logs:
    docker logs qdrant
    pause
    exit /b 1
)
echo [OK] Qdrant is running on http://localhost:6333

REM Create .kilo directory
echo.
echo Creating .kilo directory...
if not exist ".kilo" mkdir .kilo
echo [OK] .kilo directory created

REM Create qdrant_storage directory
echo.
echo Creating qdrant_storage directory...
if not exist "qdrant_storage" mkdir qdrant_storage
echo [OK] qdrant_storage directory created

REM Check for .vscode/settings.json
echo.
echo Checking configuration files...
if exist ".vscode\settings.json" (
    echo [OK] .vscode\settings.json exists
) else (
    echo [WARNING] .vscode\settings.json does not exist
    echo You need to create it with your Kilo AI configuration
)

REM Check for OpenAI API key in environment
echo.
echo Checking OpenAI API key...
if defined OPENAI_API_KEY (
    echo [OK] OPENAI_API_KEY is set in environment
    
    REM Test OpenAI API
    echo Testing OpenAI API connection...
    curl -s -o nul -w "%%{http_code}" -X POST https://api.openai.com/v1/embeddings -H "Content-Type: application/json" -H "Authorization: Bearer %OPENAI_API_KEY%" -d "{\"input\": \"test\", \"model\": \"text-embedding-3-small\"}" > temp_response.txt
    set /p response=<temp_response.txt
    del temp_response.txt
    
    if "%response%"=="200" (
        echo [OK] OpenAI API is working
    ) else (
        echo [WARNING] OpenAI API returned code: %response%
    )
) else (
    echo [WARNING] OPENAI_API_KEY is not set
    echo You need to set it in .vscode\settings.json
)

REM Final status
echo.
echo === Setup Complete ===
echo.
echo Status:
docker ps | findstr qdrant >nul 2>&1
if %errorlevel% equ 0 (
    echo   Qdrant: [OK] Running
) else (
    echo   Qdrant: [ERROR] Not running
)

if defined OPENAI_API_KEY (
    echo   OpenAI API: [OK] Configured
) else (
    echo   OpenAI API: [WARNING] Not configured
)

echo   Kilo AI Extension: [OK] Installed
echo.
echo Next Steps:
echo   1. Configure OpenAI API key in .vscode\settings.json
echo   2. Reload VS Code: Ctrl+Shift+P -^> "Developer: Reload Window"
echo   3. Open Kilo AI sidebar
echo   4. Click "Index Codebase"
echo   5. Wait 2-5 minutes for indexing to complete
echo.
echo URLs:
echo   Qdrant Dashboard: http://localhost:6333/dashboard
echo   Qdrant API: http://localhost:6333
echo.
echo To stop Qdrant: docker stop qdrant
echo To restart Qdrant: docker restart qdrant
echo.
pause
