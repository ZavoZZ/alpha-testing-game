# Windows PATH Setup Guide

This guide explains how to automatically configure your Windows system PATH to include Docker, Node.js, npm, and Git, and then run the complete project setup.

## Table of Contents

1. [Quick Start - Automated Setup](#quick-start---automated-setup)
2. [Understanding the PATH Issue](#understanding-the-path-issue)
3. [What the Scripts Do](#what-the-scripts-do)
4. [Manual PATH Setup](#manual-path-setup)
5. [Troubleshooting](#troubleshooting)
6. [Verification](#verification)

---

## Quick Start - Automated Setup

### Option 1: Complete Automated Setup (Recommended)

Run the complete setup that configures PATH and sets up the entire project:

```cmd
auto-setup-complete.cmd
```

This will:
1. ✅ Configure Windows PATH for all required tools
2. ✅ Install npm dependencies
3. ✅ Install Puppeteer
4. ✅ Start Docker services
5. ✅ Verify everything is running
6. ✅ Generate a detailed report

### Option 2: PATH Setup Only

If you only want to configure the PATH without running the full setup:

```cmd
setup-windows-path.cmd
```

Or run the PowerShell script directly:

```powershell
powershell -ExecutionPolicy Bypass -File setup-windows-path.ps1
```

---

## Understanding the PATH Issue

### What is PATH?

The PATH environment variable tells Windows where to find executable programs. When you type a command like `docker` or `npm`, Windows searches through all directories listed in PATH to find the executable.

### Why Do We Need This?

After installing Docker, Node.js, npm, and Git, they may not be automatically added to your PATH, especially:

- **Docker Desktop** - Often requires manual PATH configuration
- **Node.js** - Usually adds itself, but npm global packages need `%APPDATA%\npm`
- **Git** - May not add itself to PATH during installation
- **After Fresh Installation** - New installations may require a system restart

### User PATH vs System PATH

- **System PATH** - Requires administrator privileges, affects all users
- **User PATH** - No admin required, affects only your user account

Our scripts use **User PATH** to avoid requiring administrator privileges.

---

## What the Scripts Do

### 1. `setup-windows-path.ps1` (PowerShell Script)

The main PATH configuration script that:

- **Creates a backup** of your current PATH (saved as `path-backup-YYYYMMDD-HHMMSS.txt`)
- **Detects installation paths** for:
  - Docker: `C:\Program Files\Docker\Docker\resources\bin`
  - Node.js: `C:\Program Files\nodejs`, `C:\Program Files (x86)\nodejs`
  - npm: `%APPDATA%\npm` (for global packages)
  - Git: `C:\Program Files\Git\cmd`, `C:\Program Files (x86)\Git\cmd`
- **Adds missing paths** to User PATH environment variable
- **Verifies each tool** is accessible after configuration
- **Provides detailed output** of all changes made

### 2. `setup-windows-path.cmd` (CMD Wrapper)

A simple wrapper that:

- Checks if PowerShell is available
- Launches the PowerShell script with proper execution policy
- Displays results and waits for user confirmation

### 3. `auto-setup-complete.cmd` (Complete Setup)

The comprehensive setup script that:

1. **Runs PATH setup** using the PowerShell script
2. **Verifies all tools** are accessible
3. **Installs npm dependencies** (`npm install`)
4. **Installs Puppeteer** (`npm install --save-dev puppeteer`)
5. **Starts Docker services** (`docker compose -f docker-compose.local.yml up -d`)
6. **Waits for services** to initialize
7. **Verifies services** are running
8. **Generates detailed report** with all actions and results

---

## Manual PATH Setup

If the automated scripts don't work, you can manually add paths to your PATH:

### Step 1: Open Environment Variables

1. Press `Win + X` and select **System**
2. Click **Advanced system settings**
3. Click **Environment Variables**

### Step 2: Edit User PATH

1. Under **User variables**, select **Path**
2. Click **Edit**
3. Click **New** for each path you need to add

### Step 3: Add These Paths

Add the following paths (adjust if your installations are in different locations):

#### Docker
```
C:\Program Files\Docker\Docker\resources\bin
```

#### Node.js
```
C:\Program Files\nodejs
```

#### npm (Global Packages)
```
%APPDATA%\npm
```

#### Git
```
C:\Program Files\Git\cmd
```

### Step 4: Apply Changes

1. Click **OK** on all dialogs
2. **Restart any open terminals** for changes to take effect
3. You may need to **restart your computer** for some applications

---

## Troubleshooting

### Issue: "PowerShell is not available"

**Solution:** Install PowerShell or use the manual PATH setup method.

### Issue: "Tool not found after PATH setup"

**Possible causes:**

1. **Tool not installed** - Install the missing tool first
2. **Non-standard installation path** - Use manual PATH setup with your actual installation path
3. **Terminal not restarted** - Close and reopen your terminal
4. **System restart needed** - Restart your computer

**Verification:**
```cmd
where docker
where node
where npm
where git
```

### Issue: "Access denied" or "Permission denied"

**Solution:** The scripts use User PATH which doesn't require admin privileges. If you still get permission errors:

1. Right-click the CMD file
2. Select "Run as administrator"
3. Or use the manual PATH setup method

### Issue: Docker not starting

**Possible causes:**

1. **Docker Desktop not running** - Start Docker Desktop application
2. **WSL 2 not configured** - Docker Desktop requires WSL 2 on Windows
3. **Virtualization not enabled** - Enable virtualization in BIOS

**Solution:**
```cmd
# Check Docker status
docker info

# Start Docker Desktop manually
start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```

### Issue: npm install fails

**Possible causes:**

1. **Network issues** - Check internet connection
2. **Proxy settings** - Configure npm proxy if behind corporate firewall
3. **Permissions** - Run terminal as administrator

**Solution:**
```cmd
# Clear npm cache
npm cache clean --force

# Try install again
npm install
```

### Issue: Services not starting

**Check Docker Compose:**
```cmd
# View service status
docker compose -f docker-compose.local.yml ps

# View service logs
docker compose -f docker-compose.local.yml logs

# Restart services
docker compose -f docker-compose.local.yml restart
```

---

## Verification

### Verify PATH Configuration

After running the setup, verify each tool is accessible:

```cmd
# Check Docker
docker --version
docker compose version

# Check Node.js
node --version

# Check npm
npm --version

# Check Git
git --version
```

### Verify Docker Services

Check that Docker services are running:

```cmd
# List running containers
docker compose -f docker-compose.local.yml ps

# Check service logs
docker compose -f docker-compose.local.yml logs

# Check specific service
docker compose -f docker-compose.local.yml logs mongodb
docker compose -f docker-compose.local.yml logs redis
```

### Verify npm Dependencies

Check that dependencies are installed:

```cmd
# List installed packages
npm list --depth=0

# Check for Puppeteer
npm list puppeteer
```

### Test Database Connections

```cmd
# Test MongoDB connection
docker exec -it proiectjoc-mongodb-1 mongosh --eval "db.version()"

# Test Redis connection
docker exec -it proiectjoc-redis-1 redis-cli ping
```

---

## Next Steps After Setup

Once setup is complete:

### 1. Start Development

```cmd
# Your services are already running from the setup
# Check status
docker compose -f docker-compose.local.yml ps
```

### 2. Run Tests

```cmd
# Run your test scripts
npm test
```

### 3. Access Services

- **MongoDB**: `mongodb://localhost:27017`
- **Redis**: `redis://localhost:6379`
- **Application**: Check your application configuration

### 4. Stop Services When Done

```cmd
# Stop all services
docker compose -f docker-compose.local.yml down

# Stop and remove volumes (clean slate)
docker compose -f docker-compose.local.yml down -v
```

---

## Additional Resources

### Backup and Restore PATH

Your original PATH is automatically backed up to:
```
path-backup-YYYYMMDD-HHMMSS.txt
```

To restore your original PATH:
1. Open the backup file
2. Copy the PATH value
3. Manually set it in Environment Variables

### Setup Report

After running `auto-setup-complete.cmd`, check the detailed report:
```
setup-report-YYYYMMDD-HHMMSS.txt
```

This report contains:
- All PATH changes made
- Tool versions detected
- npm installation output
- Docker service status
- Any errors encountered

### Common Installation Paths

If tools are installed in non-standard locations, check these alternatives:

**Docker:**
- `C:\Program Files\Docker\Docker\resources\bin`
- `C:\Program Files\Docker\Docker\resources`

**Node.js:**
- `C:\Program Files\nodejs`
- `C:\Program Files (x86)\nodejs`
- `%LOCALAPPDATA%\Programs\nodejs`

**npm:**
- `%APPDATA%\npm`
- `%APPDATA%\npm\node_modules`

**Git:**
- `C:\Program Files\Git\cmd`
- `C:\Program Files (x86)\Git\cmd`
- `C:\Program Files\Git\bin`

---

## Support

If you encounter issues not covered in this guide:

1. **Check the setup report** - `setup-report-YYYYMMDD-HHMMSS.txt`
2. **Check PATH backup** - `path-backup-YYYYMMDD-HHMMSS.txt`
3. **Verify installations** - Ensure all tools are actually installed
4. **Try manual setup** - Use the manual PATH setup instructions
5. **Restart system** - Some changes require a full system restart

---

## Summary

### Automated Setup (Recommended)
```cmd
auto-setup-complete.cmd
```

### PATH Only
```cmd
setup-windows-path.cmd
```

### Manual Setup
Follow the [Manual PATH Setup](#manual-path-setup) section

### Verification
```cmd
docker --version
node --version
npm --version
git --version
docker compose -f docker-compose.local.yml ps
```

---

**Last Updated:** 2026-02-15
**Version:** 1.0.0
