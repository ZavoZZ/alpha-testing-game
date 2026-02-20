# Kilo AI Custom Modes Guide

**Date:** 2026-02-15  
**Version:** 1.0  
**Purpose:** Complete guide to using Kilo AI custom modes for automated development workflow

---

## 📋 Overview

This project includes three custom Kilo AI modes that automate the entire development workflow:

1. **Development Mode** (`dev`) - Local development with sandbox testing
2. **Testing Mode** (`test`) - Automated testing with browser automation
3. **Deployment Mode** (`deploy`) - Safe automated deployment to production

These modes work together to provide a complete CI/CD pipeline similar to Cursor AI's workflow.

---

## 🎯 Mode Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Kilo AI Modes                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────┐ │
│  │     DEV      │───▶│     TEST     │───▶│  DEPLOY  │ │
│  │   (Local)    │    │ (Automated)  │    │  (Prod)  │ │
│  └──────────────┘    └──────────────┘    └──────────┘ │
│         │                    │                   │     │
│         ▼                    ▼                   ▼     │
│  Docker Compose      Browser Tests        GitHub      │
│  Local Services      API Tests            SSH Deploy  │
│  Hot Reload          Screenshots          Health Check │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Mode 1: Development (`dev`)

### Purpose
Local development with Docker sandbox testing. All changes are made and tested locally before any deployment.

### Key Features
- ✅ Works only on local files
- ✅ Uses Docker Compose for local services
- ✅ Hot reload enabled
- ✅ Local ports: 3000, 3100, 3200, 3300, 3400
- ✅ Never touches production server
- ✅ Windows-compatible (cmd.exe and Git Bash)

### When to Use
- Making code changes
- Adding new features
- Fixing bugs
- Testing locally
- Experimenting with changes

### How to Activate
```
In Kilo AI chat:
"Switch to dev mode"
or
"Use development mode"
```

### Available Commands

**Windows (cmd.exe):**
```cmd
REM Start local services
scripts\local-start.cmd

REM Stop services
docker compose -f docker-compose.local.yml down

REM View logs
docker compose -f docker-compose.local.yml logs -f

REM Restart a service
docker compose -f docker-compose.local.yml restart [service]
```

**Git Bash:**
```bash
# Start local services
./scripts/local-start.sh

# Stop services
docker compose -f docker-compose.local.yml down

# View logs
docker compose -f docker-compose.local.yml logs -f

# Restart a service
docker compose -f docker-compose.local.yml restart [service]
```

### Local Environment
- **MongoDB:** localhost:27017
- **Redis:** localhost:6379
- **Main App:** http://localhost:3000
- **Auth Service:** http://localhost:3100
- **Economy Service:** http://localhost:3200
- **Chat Service:** http://localhost:3300
- **Admin Service:** http://localhost:3400

### Configuration Files
- [`docker-compose.local.yml`](docker-compose.local.yml) - Local Docker services
- [`.env.local`](.env.local) - Local environment variables
- [`scripts/local-start.cmd`](scripts/local-start.cmd) - Windows start script
- [`scripts/local-start.sh`](scripts/local-start.sh) - Bash start script

### File Restrictions
Can edit:
- All `.js`, `.jsx`, `.json` files
- All `.md`, `.css`, `.html` files
- Scripts (`.sh`, `.cmd`)
- Configuration files (`.yml`, `.env`)

Cannot edit:
- `node_modules/`
- `.git/`
- `qdrant_storage/`
- Production server files

### Workflow Example
```
1. Kilo AI: "I need to add a new feature to the dashboard"
2. Mode: dev
3. Kilo makes changes to client/pages/dashboard.jsx
4. Kilo runs: scripts\local-start.cmd
5. Kilo tests: http://localhost:3000/dashboard
6. Kilo verifies changes work
7. Ready for testing mode
```

---

## 🧪 Mode 2: Testing (`test`)

### Purpose
Automated testing with browser automation and API testing. Ensures everything works before deployment.

### Key Features
- ✅ Browser automation (Puppeteer)
- ✅ API endpoint testing
- ✅ Screenshot capture
- ✅ Error detection
- ✅ Performance monitoring
- ✅ Comprehensive test reports

### When to Use
- After making changes in dev mode
- Before deployment
- Verifying bug fixes
- Testing new features
- Regression testing

### How to Activate
```
In Kilo AI chat:
"Switch to test mode"
or
"Run tests"
or
"Test the application"
```

### Available Commands

**Windows:**
```cmd
REM Run full test suite
scripts\local-test.cmd

REM Run browser tests
node scripts\browser-test.js

REM Run API tests
node scripts\test-all-apis.js
```

**Git Bash:**
```bash
# Run full test suite
./scripts/local-test.sh

# Run browser tests
node scripts/browser-test.js

# Run API tests
./test-all-apis-v2.sh
```

### Test Categories

#### 1. Browser Tests
- Homepage loading
- Login/signup functionality
- Dashboard rendering
- Interactive elements
- Form submissions
- Navigation
- Console errors
- Network requests

#### 2. API Tests
- Authentication endpoints
- Economy endpoints (28 APIs)
- Admin endpoints
- Chat endpoints
- Request/response validation
- Status code verification
- Data integrity checks
- Error handling

#### 3. Performance Tests
- Page load times
- API response times
- Database query performance
- Memory usage
- CPU usage

#### 4. Security Tests
- Authentication
- Authorization
- Input validation
- SQL injection prevention
- XSS protection
- CSRF protection

### Test Verification Checklist
- [ ] All services running
- [ ] Homepage loads correctly
- [ ] Login/signup works
- [ ] Dashboard displays data
- [ ] Work system functional
- [ ] Inventory system works
- [ ] Marketplace functional
- [ ] Admin panel accessible
- [ ] No console errors
- [ ] No network errors
- [ ] Database updates correctly
- [ ] All API endpoints respond

### Screenshots
All screenshots are saved to [`screenshots/`](screenshots/) directory:
- `homepage.png` - Homepage view
- `login.png` - Login page
- `dashboard.png` - Dashboard view
- `error-*.png` - Error states
- `test-*.png` - Test results

### Configuration Files
- [`scripts/local-test.cmd`](scripts/local-test.cmd) - Windows test script
- [`scripts/local-test.sh`](scripts/local-test.sh) - Bash test script
- [`scripts/browser-test.js`](scripts/browser-test.js) - Browser automation

### Workflow Example
```
1. Kilo AI: "Test the new dashboard feature"
2. Mode: test
3. Kilo runs: scripts\local-test.cmd
4. Kilo launches browser automation
5. Kilo tests all pages and features
6. Kilo captures screenshots
7. Kilo generates test report
8. If all pass: Ready for deployment
9. If any fail: Back to dev mode to fix
```

---

## 🚀 Mode 3: Deployment (`deploy`)

### Purpose
Safe automated deployment to production with health checks and automatic rollback.

### Key Features
- ✅ Pre-deployment safety checks
- ✅ GitHub integration
- ✅ Automatic backup
- ✅ Health checks
- ✅ Automatic rollback on failure
- ✅ Production monitoring

### When to Use
- After all tests pass
- Deploying new features
- Deploying bug fixes
- Updating production

### How to Activate
```
In Kilo AI chat:
"Switch to deploy mode"
or
"Deploy to production"
or
"Push to production"
```

### Deployment Workflow

#### 1. Pre-Deployment Checks
- [ ] All local tests pass
- [ ] No uncommitted changes
- [ ] No merge conflicts
- [ ] Dependencies updated
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Backup created
- [ ] Rollback plan ready

#### 2. Git Operations
```bash
# Check status
git status

# Add changes
git add .

# Commit with message
git commit -m "feat: add new dashboard feature"

# Push to GitHub
git push origin main
```

#### 3. GitHub Actions
- Wait for CI/CD pipeline to complete
- Verify all tests pass
- Check build succeeds

#### 4. Production Deployment
```bash
# SSH to production server
ssh root@ovidiuguru.online

# Navigate to project
cd /root/MERN-template

# Create backup
cp -r . ../backup-$(date +%Y%m%d-%H%M%S)

# Pull latest changes
git pull origin main

# Rebuild and restart
docker compose up -d --build
```

#### 5. Health Checks
```bash
# Wait for services to start (30 seconds)
sleep 30

# Check main site
curl https://ovidiuguru.online

# Check services
curl https://ovidiuguru.online/auth/health
curl https://ovidiuguru.online/economy/health
curl https://ovidiuguru.online/admin/health
```

#### 6. Verification
- [ ] Site loads correctly
- [ ] No 500 errors
- [ ] Login works
- [ ] Dashboard displays
- [ ] API endpoints respond
- [ ] Database connected
- [ ] No console errors
- [ ] SSL certificate valid

#### 7. Rollback (if needed)
```bash
# Stop services
docker compose down

# Restore backup
rm -rf * && cp -r ../backup-TIMESTAMP/* .

# Restart services
docker compose up -d

# Or use git reset
git reset --hard HEAD~1
docker compose up -d --build
```

### Available Commands

**Windows (Git Bash required for SSH):**
```bash
# Deploy script
./scripts/local-deploy.sh

# Manual SSH
ssh root@ovidiuguru.online
```

**Production Server:**
```bash
# Navigate to project
cd /root/MERN-template

# Pull changes
git pull origin main

# Rebuild services
docker compose up -d --build

# Check status
docker ps

# View logs
docker compose logs -f

# Restart service
docker compose restart [service]
```

### Configuration Files
- [`scripts/local-deploy.sh`](scripts/local-deploy.sh) - Deployment script
- [`scripts/local-deploy.cmd`](scripts/local-deploy.cmd) - Windows wrapper
- [`.github/workflows/`](.github/workflows/) - GitHub Actions

### File Restrictions
Can read:
- All project files

Can modify:
- Deployment scripts
- GitHub workflows
- Docker compose files
- Environment files

Cannot modify:
- Production files directly (must use Git)
- Application code (must go through dev → test → deploy)

### Workflow Example
```
1. Kilo AI: "Deploy the new feature to production"
2. Mode: deploy
3. Kilo verifies all tests passed
4. Kilo commits changes: git commit -m "feat: new feature"
5. Kilo pushes to GitHub: git push origin main
6. Kilo waits for GitHub Actions to pass
7. Kilo SSHs to production server
8. Kilo creates backup
9. Kilo pulls changes and rebuilds
10. Kilo runs health checks
11. Kilo verifies production works
12. If issues: Automatic rollback
13. Deployment complete!
```

---

## 🔄 Complete Workflow Example

### Scenario: Adding a New Feature

#### Step 1: Development
```
User: "Add a new inventory filter feature"
Kilo: "Switching to dev mode"
Mode: dev

1. Kilo analyzes requirements
2. Kilo modifies client/pages/panels/InventoryPanel.jsx
3. Kilo starts local services: scripts\local-start.cmd
4. Kilo tests locally: http://localhost:3000
5. Kilo verifies feature works
6. Ready for testing
```

#### Step 2: Testing
```
User: "Test the new feature"
Kilo: "Switching to test mode"
Mode: test

1. Kilo runs full test suite: scripts\local-test.cmd
2. Kilo launches browser automation
3. Kilo tests inventory page
4. Kilo tests filter functionality
5. Kilo checks for errors
6. Kilo captures screenshots
7. All tests pass ✅
8. Ready for deployment
```

#### Step 3: Deployment
```
User: "Deploy to production"
Kilo: "Switching to deploy mode"
Mode: deploy

1. Kilo verifies all tests passed
2. Kilo commits: git commit -m "feat: add inventory filter"
3. Kilo pushes: git push origin main
4. Kilo waits for GitHub Actions ✅
5. Kilo SSHs to production
6. Kilo creates backup
7. Kilo deploys changes
8. Kilo runs health checks ✅
9. Kilo verifies production ✅
10. Deployment successful! 🎉
```

---

## 🛠️ Configuration

### VS Code Settings
File: [`.vscode/settings.json`](.vscode/settings.json)

```json
{
  "kilo.modes.enabled": true,
  "kilo.modes.directory": ".kilo/modes",
  "kilo.modes.default": "dev",
  "kilo.commandWrapper": "./scripts/kilo-command-wrapper.sh",
  "kilo.commandTimeout": 300000,
  "kilo.commandRetries": 3
}
```

### Mode Files
- [`.kilo/modes/dev.json`](.kilo/modes/dev.json) - Development mode
- [`.kilo/modes/test.json`](.kilo/modes/test.json) - Testing mode
- [`.kilo/modes/deploy.json`](.kilo/modes/deploy.json) - Deployment mode

### Environment Files
- [`.env.local`](.env.local) - Local development
- `.env` - Production (on server)

---

## 🐛 Troubleshooting

### Mode Not Switching
**Problem:** Kilo AI doesn't switch modes

**Solution:**
1. Reload VS Code: `Ctrl+Shift+P` → "Developer: Reload Window"
2. Check `.vscode/settings.json` exists
3. Verify mode files exist in `.kilo/modes/`
4. Check Kilo AI extension is updated

### Commands Not Working
**Problem:** Scripts fail to execute

**Solution:**
1. Check Docker is running: `docker ps`
2. Verify working directory is correct
3. Use correct shell (cmd.exe or Git Bash)
4. Check file permissions on scripts
5. View logs: `docker compose logs -f`

### Tests Failing
**Problem:** Tests don't pass

**Solution:**
1. Ensure services are running: `docker ps`
2. Check service logs: `docker compose logs [service]`
3. Verify database is accessible
4. Check network connectivity
5. Review screenshots in `screenshots/` directory

### Deployment Fails
**Problem:** Deployment doesn't complete

**Solution:**
1. Check GitHub Actions status
2. Verify SSH connection: `ssh root@ovidiuguru.online`
3. Check production server logs
4. Verify backup was created
5. Use rollback if needed

### Rollback Needed
**Problem:** Production has issues after deployment

**Solution:**
```bash
# SSH to server
ssh root@ovidiuguru.online

# Navigate to project
cd /root/MERN-template

# Stop services
docker compose down

# Reset to previous version
git reset --hard HEAD~1

# Rebuild
docker compose up -d --build

# Verify
curl https://ovidiuguru.online
```

---

## 📊 Best Practices

### Development Mode
1. Always test locally before committing
2. Use descriptive commit messages
3. Keep changes small and focused
4. Test each change individually
5. Monitor Docker logs for errors

### Testing Mode
1. Run full test suite before deployment
2. Review all screenshots
3. Check for console errors
4. Verify API responses
5. Test edge cases

### Deployment Mode
1. Never skip pre-deployment checks
2. Always create backups
3. Monitor production after deployment
4. Be ready to rollback
5. Document all deployments

---

## 🔗 Related Documentation

- [`KILO_AI_COMPLETE_SETUP.md`](KILO_AI_COMPLETE_SETUP.md) - Kilo AI setup guide
- [`LOCAL_DEVELOPMENT_GUIDE.md`](LOCAL_DEVELOPMENT_GUIDE.md) - Local development guide
- [`LOCAL_SANDBOX_SETUP_COMPLETE.md`](LOCAL_SANDBOX_SETUP_COMPLETE.md) - Sandbox setup
- [`plans/KILO_AI_CURSOR_AUTOMATION_PLAN.md`](plans/KILO_AI_CURSOR_AUTOMATION_PLAN.md) - Automation plan

---

## 📝 Quick Reference

### Mode Switching
```
"Switch to dev mode"     → Development
"Switch to test mode"    → Testing
"Switch to deploy mode"  → Deployment
```

### Common Commands
```bash
# Start local services
scripts\local-start.cmd    # Windows
./scripts/local-start.sh   # Git Bash

# Run tests
scripts\local-test.cmd     # Windows
./scripts/local-test.sh    # Git Bash

# Deploy
./scripts/local-deploy.sh  # Git Bash (SSH required)
```

### URLs
- **Local:** http://localhost:3000
- **Production:** https://ovidiuguru.online
- **Qdrant:** http://localhost:6333/dashboard

---

**Status:** Ready to use  
**Last Updated:** 2026-02-15  
**Version:** 1.0
