# Scripts Directory

This directory contains automation scripts for local development, testing, and deployment.

---

## 📋 Available Scripts

### 🚀 Local Development

#### [`local-start.sh`](local-start.sh) / [`local-start.cmd`](local-start.cmd)

**Purpose:** Start all services for local development

**Usage:**
```bash
# Linux/Mac/Git Bash
./scripts/local-start.sh

# Windows Command Prompt
scripts\local-start.cmd
```

**What it does:**
- ✅ Checks if Docker is running
- ✅ Creates `.env.local` if needed
- ✅ Stops existing containers
- ✅ Starts all services (app, auth, news, chat, economy, mongodb, qdrant)
- ✅ Waits for services to be ready
- ✅ Displays service URLs

**Services started:**
- Main App: http://localhost:3000
- Auth Server: http://localhost:3100
- News Server: http://localhost:3200
- Chat Server: http://localhost:3300
- Economy Server: http://localhost:3400
- MongoDB: mongodb://localhost:27017
- Qdrant: http://localhost:6333

---

### 🧪 Testing

#### [`local-test.sh`](local-test.sh) / [`local-test.cmd`](local-test.cmd)

**Purpose:** Run all tests on local environment

**Usage:**
```bash
# Linux/Mac/Git Bash
./scripts/local-test.sh

# Windows Command Prompt
scripts\local-test.cmd
```

**What it does:**
- ✅ Checks if services are running
- ✅ Runs service health checks
- ✅ Tests database connectivity
- ✅ Tests API endpoints
- ✅ Checks container logs for errors
- ✅ Runs browser tests (if Puppeteer installed)
- ✅ Displays test results summary

**Exit codes:**
- `0` - All tests passed (ready to deploy)
- `1` - Some tests failed (fix issues before deploying)

---

#### [`browser-test.js`](browser-test.js)

**Purpose:** Test application in a real browser using Puppeteer

**Usage:**
```bash
# Run with default settings
node scripts/browser-test.js

# Run with visible browser
HEADLESS=false node scripts/browser-test.js

# Test different URL
BASE_URL=http://localhost:3000 node scripts/browser-test.js
```

**Requirements:**
```bash
npm install --save-dev puppeteer
```

**Tests performed:**
- Homepage loads successfully
- Page title is correct
- No JavaScript errors
- Login page loads
- Login form has required elements
- Signup page loads
- Dashboard redirects when not authenticated
- Responsive design (mobile)
- API endpoints are accessible
- Page loads within acceptable time

**Output:**
- Screenshots saved to `screenshots/` directory
- Test results in console

---

### 🚀 Deployment

#### [`local-deploy.sh`](local-deploy.sh) / [`local-deploy.cmd`](local-deploy.cmd)

**Purpose:** Deploy local changes to production after testing

**Usage:**
```bash
# Linux/Mac/Git Bash
./scripts/local-deploy.sh "Your commit message"

# Windows Command Prompt
scripts\local-deploy.cmd "Your commit message"
```

**What it does:**
1. ✅ Runs all local tests
2. ✅ Checks Git status
3. ✅ Commits changes (if any)
4. ✅ Pushes to GitHub
5. ✅ SSHs to production server
6. ✅ Pulls latest changes
7. ✅ Rebuilds and restarts services
8. ✅ Verifies production deployment
9. ✅ Checks production logs

**Requirements:**
- All local tests must pass
- SSH access to production server configured
- Git repository configured

---

### 🔄 Utilities

#### [`kilo-command-wrapper.sh`](kilo-command-wrapper.sh)

**Purpose:** Execute commands with automatic retry logic

**Usage:**
```bash
./scripts/kilo-command-wrapper.sh "command to execute"
```

**Examples:**
```bash
# Test endpoint with retry
./scripts/kilo-command-wrapper.sh "curl http://localhost:3000"

# Restart service with retry
./scripts/kilo-command-wrapper.sh "docker compose restart app"

# Run tests with retry
./scripts/kilo-command-wrapper.sh "./scripts/local-test.sh"
```

**Features:**
- Automatic retry (up to 3 attempts)
- Timeout protection (5 minutes)
- Detailed output with colors
- Exit code handling
- Retry delay (5 seconds between attempts)

**Configuration:**
- `MAX_RETRIES=3` - Maximum number of retry attempts
- `RETRY_DELAY=5` - Seconds to wait between retries
- `TIMEOUT=300` - Command timeout in seconds (5 minutes)

---

## 🖥️ Platform Compatibility

### Linux / Mac / Git Bash

All `.sh` scripts work natively:

```bash
./scripts/local-start.sh
./scripts/local-test.sh
./scripts/local-deploy.sh "message"
./scripts/kilo-command-wrapper.sh "command"
node scripts/browser-test.js
```

### Windows Command Prompt

Use the `.cmd` wrappers:

```cmd
scripts\local-start.cmd
scripts\local-test.cmd
scripts\local-deploy.cmd "message"
```

The `.cmd` wrappers automatically detect and use:
1. Git Bash (if installed)
2. WSL (Windows Subsystem for Linux)

If neither is available, they show installation instructions.

### Windows PowerShell

You can run bash scripts directly if Git is installed:

```powershell
bash scripts/local-start.sh
bash scripts/local-test.sh
bash scripts/local-deploy.sh "message"
```

Or use the `.cmd` wrappers:

```powershell
.\scripts\local-start.cmd
.\scripts\local-test.cmd
.\scripts\local-deploy.cmd "message"
```

---

## 📦 Dependencies

### Required

- **Docker Desktop** - For running services
- **Node.js** (v18+) - For running scripts
- **npm** - For package management

### Optional

- **Git Bash** (Windows) - For running bash scripts
- **WSL** (Windows) - Alternative to Git Bash
- **Puppeteer** - For browser testing
  ```bash
  npm install --save-dev puppeteer
  ```

---

## 🔧 Configuration

### Environment Variables

Scripts use environment variables from `.env.local`:

```bash
# Main configuration
WEB_PORT=3000
DB_URI=mongodb://localhost:27017/game_db
API_URL=http://localhost:3000

# Microservices
AUTH_URI=http://localhost:3100
NEWS_URI=http://localhost:3200
CHAT_URI=http://localhost:3300
ECONOMY_URI=http://localhost:3400
```

### Docker Compose

Scripts use `docker-compose.local.yml` for local development:

```bash
docker compose -f docker-compose.local.yml up -d
```

---

## 🐛 Troubleshooting

### Script Won't Execute

**Linux/Mac:**
```bash
# Make script executable
chmod +x scripts/local-start.sh

# Or run with bash
bash scripts/local-start.sh
```

**Windows:**
```cmd
REM Use .cmd wrapper
scripts\local-start.cmd

REM Or install Git Bash
REM Download from: https://git-scm.com/download/win
```

### Docker Not Running

```bash
# Check Docker status
docker ps

# Start Docker Desktop (Windows/Mac)
# Or start Docker service (Linux)
sudo systemctl start docker
```

### Port Already in Use

```bash
# Stop all containers
docker compose -f docker-compose.local.yml down

# Or find and kill process
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -i :3000
kill -9 <PID>
```

### Tests Failing

```bash
# Check service logs
docker logs mern-app-local --tail 50
docker logs mern-auth-local --tail 50
docker logs mern-economy-local --tail 50

# Restart services
docker compose -f docker-compose.local.yml restart

# Rebuild services
docker compose -f docker-compose.local.yml up -d --build
```

---

## 📚 Related Documentation

- [Local Development Guide](../LOCAL_DEVELOPMENT_GUIDE.md) - Complete setup guide
- [Docker Compose Configuration](../docker-compose.local.yml) - Service definitions
- [Environment Configuration](../.env.local) - Environment variables

---

## 🎓 Best Practices

### 1. Always Test Before Deploy

```bash
# Run tests
./scripts/local-test.sh

# If tests pass, deploy
./scripts/local-deploy.sh "Your message"
```

### 2. Use Command Wrapper for Reliability

```bash
# Instead of:
curl http://localhost:3000

# Use:
./scripts/kilo-command-wrapper.sh "curl http://localhost:3000"
```

### 3. Check Logs When Issues Occur

```bash
# View all logs
docker compose -f docker-compose.local.yml logs -f

# View specific service
docker logs mern-app-local -f
```

### 4. Restart Services After Code Changes

```bash
# Restart specific service
docker compose -f docker-compose.local.yml restart app

# Or restart all
docker compose -f docker-compose.local.yml restart
```

---

## 📝 Script Development

### Adding New Scripts

1. Create the script in this directory
2. Make it executable (Linux/Mac):
   ```bash
   chmod +x scripts/your-script.sh
   ```
3. Create Windows wrapper if needed:
   ```cmd
   @echo off
   bash "%~dp0your-script.sh" %*
   ```
4. Update this README
5. Test on all platforms

### Script Template

```bash
#!/bin/bash

# =====================================================================
# Script Name
# =====================================================================
# Description of what the script does
# Usage: ./scripts/script-name.sh [args]
# =====================================================================

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "Script starting..."

# Your code here

echo -e "${GREEN}✅ Script completed${NC}"
```

---

**Last Updated:** 2026-02-15  
**Maintained By:** Development Team
