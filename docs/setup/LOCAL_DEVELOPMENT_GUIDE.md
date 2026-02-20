# Local Development Guide

**Complete guide for setting up and using the local development sandbox environment**

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Environment Setup](#environment-setup)
4. [Running Services](#running-services)
5. [Testing](#testing)
6. [Deployment](#deployment)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)
9. [Scripts Reference](#scripts-reference)

---

## 🎯 Prerequisites

### Required Software

1. **Docker Desktop**
   - Windows: [Download Docker Desktop](https://www.docker.com/products/docker-desktop)
   - Mac: [Download Docker Desktop](https://www.docker.com/products/docker-desktop)
   - Linux: Install Docker Engine and Docker Compose
   - Verify: `docker --version` and `docker compose --version`

2. **Node.js** (v18 or higher)
   - Download: [nodejs.org](https://nodejs.org/)
   - Verify: `node --version` and `npm --version`

3. **Git**
   - Download: [git-scm.com](https://git-scm.com/)
   - Verify: `git --version`

4. **VS Code** (recommended)
   - Download: [code.visualstudio.com](https://code.visualstudio.com/)
   - Install Kilo AI extension

### Optional Software

- **Puppeteer** (for browser testing): `npm install --save-dev puppeteer`
- **MongoDB Compass** (for database GUI): [Download](https://www.mongodb.com/products/compass)

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
# Clone from GitHub
git clone https://github.com/ovidiuguru/MERN-template.git
cd MERN-template
```

### 2. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install Puppeteer for browser testing (optional)
npm install --save-dev puppeteer
```

### 3. Configure Environment

```bash
# Copy environment template
cp .envdev .env.local

# Edit .env.local if needed (optional)
# The default values work for local development
```

### 4. Start Services

```bash
# Start all services with one command
./scripts/local-start.sh

# Or on Windows (if bash not available):
bash scripts/local-start.sh
```

### 5. Access the Application

Open your browser and navigate to:
- **Main App**: http://localhost:3000
- **Qdrant Dashboard**: http://localhost:6333/dashboard

---

## 🔧 Environment Setup

### Environment Files

The project uses different environment files for different purposes:

| File | Purpose | Committed to Git |
|------|---------|------------------|
| `.envdev` | Development template | ✅ Yes |
| `.env.local` | Local development | ❌ No |
| `.env` | Production (on server) | ❌ No |

### `.env.local` Configuration

The `.env.local` file is automatically created by [`local-start.sh`](scripts/local-start.sh) if it doesn't exist. Default configuration:

```bash
# Web Server
WEB_PORT=3000

# Database
DB_URI=mongodb://localhost:27017/game_db

# Microservices
AUTH_URI=http://localhost:3100
NEWS_URI=http://localhost:3200
CHAT_URI=http://localhost:3300
ECONOMY_URI=http://localhost:3400

# API URLs
API_URL=http://localhost:3000
WEB_ORIGIN=http://localhost:3000

# JWT Secrets (change in production!)
SECRET_ACCESS=local_dev_jwt_secret_key_change_in_production_12345
SECRET_REFRESH=local_dev_refresh_secret_key_change_in_production_67890

# Game Password
GAME_PASSWORD=testjoc

# CORS
CORS_ORIGIN=*

# Environment
NODE_ENV=development
```

### VS Code Configuration

1. **Copy the settings template:**
   ```bash
   cp .vscode/settings.json.example .vscode/settings.json
   ```

2. **Edit `.vscode/settings.json`:**
   - Replace `YOUR_OPENAI_API_KEY_HERE` with your actual OpenAI API key
   - Adjust other settings as needed

3. **Reload VS Code:**
   - Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
   - Type "Developer: Reload Window"
   - Press Enter

---

## 🐳 Running Services

### Service Architecture

The application consists of multiple microservices:

| Service | Port | Description |
|---------|------|-------------|
| Main App | 3000 | React frontend + Express backend |
| Auth Server | 3100 | Authentication service |
| News Server | 3200 | News management service |
| Chat Server | 3300 | Real-time chat service |
| Economy Server | 3400 | Game economy + work system |
| MongoDB | 27017 | Database |
| Qdrant | 6333 | Vector database (for Kilo AI) |

### Starting Services

#### Option 1: Using the Start Script (Recommended)

```bash
./scripts/local-start.sh
```

This script will:
- ✅ Check if Docker is running
- ✅ Create `.env.local` if it doesn't exist
- ✅ Stop any existing containers
- ✅ Start all services
- ✅ Wait for services to be ready
- ✅ Display service URLs

#### Option 2: Using Docker Compose Directly

```bash
# Start all services
docker compose -f docker-compose.local.yml up -d

# Start specific service
docker compose -f docker-compose.local.yml up -d app

# View logs
docker compose -f docker-compose.local.yml logs -f

# Stop all services
docker compose -f docker-compose.local.yml down
```

### Managing Services

#### View Running Containers

```bash
docker ps
```

#### View Logs

```bash
# All services
docker compose -f docker-compose.local.yml logs -f

# Specific service
docker logs mern-app-local -f
docker logs mern-auth-local -f
docker logs mern-economy-local -f
```

#### Restart Services

```bash
# Restart all
docker compose -f docker-compose.local.yml restart

# Restart specific service
docker compose -f docker-compose.local.yml restart app
docker compose -f docker-compose.local.yml restart auth-server
```

#### Stop Services

```bash
# Stop all
docker compose -f docker-compose.local.yml down

# Stop specific service
docker compose -f docker-compose.local.yml stop app
```

#### Rebuild Services

```bash
# Rebuild all
docker compose -f docker-compose.local.yml up -d --build

# Rebuild specific service
docker compose -f docker-compose.local.yml up -d --build app
```

---

## 🧪 Testing

### Running All Tests

```bash
./scripts/local-test.sh
```

This script runs:
1. ✅ Service health checks
2. ✅ Database connectivity tests
3. ✅ API endpoint tests
4. ✅ Container log checks
5. ✅ Browser tests (if Puppeteer is installed)

### Running Specific Tests

#### Browser Tests

```bash
node scripts/browser-test.js
```

Tests include:
- Homepage loads successfully
- Login page functionality
- Signup page functionality
- Dashboard authentication
- Responsive design
- Performance checks

Screenshots are saved to [`screenshots/`](screenshots/) directory.

#### API Tests

```bash
# Test all APIs
./test-all-apis-v2.sh

# Test economy system
./test-economy-comprehensive.sh

# Test specific endpoint
curl http://localhost:3000
curl http://localhost:3100/health
curl http://localhost:3400/health
```

#### Database Tests

```bash
# Connect to MongoDB
docker exec -it mern-mongodb-local mongosh game_db

# Check collections
show collections

# Query users
db.users.find().limit(5)
```

---

## 🚀 Deployment

### Deployment Workflow

```
Local Development → Testing → Git Commit → GitHub Push → Production Deploy
```

### Using the Deploy Script

```bash
./scripts/local-deploy.sh "Your commit message"
```

This script will:
1. ✅ Run all local tests
2. ✅ Check Git status
3. ✅ Commit changes (if any)
4. ✅ Push to GitHub
5. ✅ SSH to production server
6. ✅ Pull latest changes
7. ✅ Rebuild and restart services
8. ✅ Verify production deployment

### Manual Deployment

```bash
# 1. Run tests
./scripts/local-test.sh

# 2. Commit changes
git add .
git commit -m "Your commit message"

# 3. Push to GitHub
git push origin main

# 4. Deploy to production
ssh root@ovidiuguru.online << 'EOF'
  cd /root/MERN-template
  git pull origin main
  npm install --production
  npm run build
  docker compose down
  docker compose up -d --build
EOF

# 5. Verify production
curl https://ovidiuguru.online
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Docker Not Running

**Error:** `Cannot connect to the Docker daemon`

**Solution:**
```bash
# Windows/Mac: Start Docker Desktop
# Linux: Start Docker service
sudo systemctl start docker
```

#### 2. Port Already in Use

**Error:** `Port 3000 is already allocated`

**Solution:**
```bash
# Find process using the port
# Windows:
netstat -ano | findstr :3000

# Mac/Linux:
lsof -i :3000

# Kill the process
# Windows:
taskkill /PID <PID> /F

# Mac/Linux:
kill -9 <PID>

# Or stop all Docker containers
docker compose -f docker-compose.local.yml down
```

#### 3. MongoDB Connection Error

**Error:** `MongoNetworkError: failed to connect to server`

**Solution:**
```bash
# Check if MongoDB is running
docker ps | grep mongodb

# Restart MongoDB
docker compose -f docker-compose.local.yml restart mongodb

# Check logs
docker logs mern-mongodb-local --tail 50

# Verify connection
docker exec -it mern-mongodb-local mongosh --eval "db.adminCommand('ping')"
```

#### 4. Service Won't Start

**Error:** Service exits immediately after starting

**Solution:**
```bash
# Check logs for errors
docker logs <container-name> --tail 50

# Common fixes:
# 1. Rebuild the service
docker compose -f docker-compose.local.yml up -d --build <service>

# 2. Remove and recreate
docker compose -f docker-compose.local.yml down
docker compose -f docker-compose.local.yml up -d

# 3. Clean Docker system
docker system prune -a
docker volume prune
```

#### 5. Git Push Failed

**Error:** `failed to push some refs`

**Solution:**
```bash
# Pull latest changes first
git pull origin main --rebase

# Resolve conflicts if any
git status
# Edit conflicted files
git add .
git rebase --continue

# Push again
git push origin main
```

#### 6. Puppeteer Installation Issues

**Error:** `Error: Failed to launch the browser process`

**Solution:**
```bash
# Reinstall Puppeteer
npm uninstall puppeteer
npm install --save-dev puppeteer

# On Linux, install dependencies
sudo apt-get install -y \
  libnss3 libatk1.0-0 libatk-bridge2.0-0 \
  libcups2 libdrm2 libxkbcommon0 libxcomposite1 \
  libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2
```

### Checking Service Health

```bash
# Check all services
docker ps

# Check specific service health
curl http://localhost:3000
curl http://localhost:3100/health
curl http://localhost:3400/health

# Check MongoDB
docker exec -it mern-mongodb-local mongosh --eval "db.adminCommand('ping')"

# Check Qdrant
curl http://localhost:6333
```

### Viewing Logs

```bash
# All services
docker compose -f docker-compose.local.yml logs -f

# Specific service (last 50 lines)
docker logs mern-app-local --tail 50 -f
docker logs mern-auth-local --tail 50 -f
docker logs mern-economy-local --tail 50 -f
docker logs mern-mongodb-local --tail 50 -f

# Filter for errors
docker logs mern-app-local 2>&1 | grep -i error
```

---

## 💡 Best Practices

### Development Workflow

1. **Always work locally first**
   - Never edit files directly on the production server
   - Test everything locally before deploying

2. **Use the automation scripts**
   - [`local-start.sh`](scripts/local-start.sh) - Start services
   - [`local-test.sh`](scripts/local-test.sh) - Run tests
   - [`local-deploy.sh`](scripts/local-deploy.sh) - Deploy to production

3. **Test before committing**
   ```bash
   ./scripts/local-test.sh
   git add .
   git commit -m "Your message"
   ```

4. **Use meaningful commit messages**
   ```bash
   # Good
   git commit -m "Add user authentication with JWT"
   git commit -m "Fix economy calculation bug in WorkCalculator"
   
   # Bad
   git commit -m "Update"
   git commit -m "Fix stuff"
   ```

5. **Keep services running during development**
   - Don't stop/start services unnecessarily
   - Use `docker compose restart <service>` to reload changes

### Code Changes

1. **After modifying code:**
   ```bash
   # Restart the affected service
   docker compose -f docker-compose.local.yml restart app
   
   # Wait a few seconds
   sleep 5
   
   # Test the changes
   curl http://localhost:3000
   ```

2. **After modifying dependencies:**
   ```bash
   # Rebuild the service
   docker compose -f docker-compose.local.yml up -d --build app
   ```

3. **After modifying environment variables:**
   ```bash
   # Restart all services
   docker compose -f docker-compose.local.yml restart
   ```

### Git Workflow

```bash
# 1. Pull latest changes
git pull origin main

# 2. Create a feature branch (optional)
git checkout -b feature/your-feature-name

# 3. Make changes and test
./scripts/local-test.sh

# 4. Commit changes
git add .
git commit -m "Descriptive message"

# 5. Push to GitHub
git push origin main
# or
git push origin feature/your-feature-name

# 6. Deploy to production
./scripts/local-deploy.sh
```

### Security

1. **Never commit sensitive files:**
   - `.env.local`
   - `.vscode/settings.json` (with API keys)
   - `qdrant_storage/`
   - `.kilo/`

2. **Use different secrets for local and production:**
   - Local: Simple secrets for testing
   - Production: Strong, unique secrets

3. **Keep API keys secure:**
   - Store in `.vscode/settings.json` (not committed)
   - Never hardcode in source files
   - Use environment variables

---

## 📚 Scripts Reference

### [`scripts/local-start.sh`](scripts/local-start.sh)

**Purpose:** Start all services for local development

**Usage:**
```bash
./scripts/local-start.sh
```

**What it does:**
- Checks if Docker is running
- Creates `.env.local` if needed
- Stops existing containers
- Starts all services
- Waits for services to be ready
- Displays service URLs

---

### [`scripts/local-test.sh`](scripts/local-test.sh)

**Purpose:** Run all tests on local environment

**Usage:**
```bash
./scripts/local-test.sh
```

**What it does:**
- Checks if services are running
- Runs service health checks
- Tests database connectivity
- Tests API endpoints
- Checks container logs for errors
- Runs browser tests (if available)
- Displays test results summary

**Exit codes:**
- `0` - All tests passed
- `1` - Some tests failed

---

### [`scripts/local-deploy.sh`](scripts/local-deploy.sh)

**Purpose:** Deploy local changes to production

**Usage:**
```bash
./scripts/local-deploy.sh "Commit message"
```

**What it does:**
- Runs local tests
- Checks Git status
- Commits changes (if any)
- Pushes to GitHub
- SSHs to production server
- Pulls latest changes
- Rebuilds and restarts services
- Verifies production deployment
- Checks production logs

---

### [`scripts/kilo-command-wrapper.sh`](scripts/kilo-command-wrapper.sh)

**Purpose:** Execute commands with automatic retry logic

**Usage:**
```bash
./scripts/kilo-command-wrapper.sh "command to execute"
```

**Example:**
```bash
./scripts/kilo-command-wrapper.sh "curl http://localhost:3000"
./scripts/kilo-command-wrapper.sh "docker compose restart app"
```

**Features:**
- Automatic retry (up to 3 attempts)
- Timeout protection (5 minutes)
- Detailed output
- Exit code handling

---

### [`scripts/browser-test.js`](scripts/browser-test.js)

**Purpose:** Test application in a real browser using Puppeteer

**Usage:**
```bash
node scripts/browser-test.js
```

**Environment variables:**
```bash
# Test different URL
BASE_URL=http://localhost:3000 node scripts/browser-test.js

# Run with visible browser
HEADLESS=false node scripts/browser-test.js
```

**Tests:**
- Homepage loads
- Login page functionality
- Signup page functionality
- Dashboard authentication
- Responsive design
- Performance checks

**Output:**
- Screenshots saved to [`screenshots/`](screenshots/)
- Test results in console

---

## 🎓 Kilo AI Integration

### Configuring Kilo AI for Local Development

1. **Copy VS Code settings:**
   ```bash
   cp .vscode/settings.json.example .vscode/settings.json
   ```

2. **Add your OpenAI API key:**
   - Open `.vscode/settings.json`
   - Replace `YOUR_OPENAI_API_KEY_HERE` with your actual key

3. **Start Qdrant:**
   ```bash
   ./scripts/local-start.sh
   ```

4. **Index the codebase:**
   - Open Kilo AI sidebar in VS Code
   - Click "Index Codebase"
   - Wait 2-5 minutes

### Using Kilo AI for Development

**Example prompts:**

```
Add a new button to the dashboard that displays the user's balance.
Test it locally on localhost:3000 and show me a screenshot.
```

```
Fix the login bug. Check the logs, find the issue, and fix it.
Test locally until it works.
```

```
Test everything locally, then deploy to production.
Verify it works on ovidiuguru.online.
```

### Kilo AI Workflow Rules

Add these rules to your `.cursorrules` file or tell Kilo AI directly:

```markdown
# Kilo AI - Local Development Rules

1. ALWAYS work locally first
   - Edit files in local workspace
   - Test on localhost ports
   - Never edit directly on SSH server

2. ALWAYS restart services after changes
   - Run: docker compose -f docker-compose.local.yml restart [service]
   - Wait 10 seconds
   - Check logs: docker logs [service] --tail 20

3. ALWAYS read command output
   - If command fails, read the error
   - Fix the issue
   - Retry the command

4. ALWAYS test in browser
   - Open http://localhost:3000 after changes
   - Check console for errors
   - Test functionality manually

5. ALWAYS run tests before deploy
   - Run: ./scripts/local-test.sh
   - All tests must pass
   - Fix any failures

6. Deploy workflow
   - Only deploy after all tests pass
   - Use: ./scripts/local-deploy.sh "message"
   - Verify production works
```

---

## 📞 Support

### Getting Help

1. **Check this guide first** - Most common issues are covered
2. **Check logs** - `docker logs <container> --tail 50`
3. **Check GitHub Issues** - [github.com/ovidiuguru/MERN-template/issues](https://github.com/ovidiuguru/MERN-template/issues)
4. **Ask Kilo AI** - It has access to the entire codebase

### Useful Resources

- [Docker Documentation](https://docs.docker.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Puppeteer Documentation](https://pptr.dev/)

---

## 📝 Changelog

### Version 1.0.0 (2026-02-15)

- ✅ Initial local development environment setup
- ✅ Docker Compose configuration for local services
- ✅ Automation scripts (start, test, deploy)
- ✅ Browser testing with Puppeteer
- ✅ VS Code configuration template
- ✅ Comprehensive documentation

---

**Last Updated:** 2026-02-15  
**Maintained By:** Development Team  
**Status:** ✅ Ready for Use
