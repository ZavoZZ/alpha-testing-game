# Codespaces Rebuild Fix - Complete Guide

## Problem Summary

On 2026-02-20, rebuilding the Codespace caused two issues:

### 1. Docker-in-Docker Installation Failure
```
ERROR: Feature "Docker (Docker-in-Docker)" (ghcr.io/devcontainers/features/docker-in-docker) failed to install!
Unsupported distribution version 'trixie'. To resolve, either: (1) set feature option '"moby": false', or (2) choose a compatible OS distribution
```

**Root Cause:** The Codespaces environment is running Debian 'trixie', which is not supported by the Docker-in-Docker feature. Even with `"moby": false`, the feature still fails because the base image runs on an unsupported distribution.

### 2. Kilo Code Extension Deletion
The Kilo Code extension was deleted during rebuild because it wasn't specified in the devcontainer.json extensions list, and conversation history was lost.

---

## Solutions Implemented

### Fix 1: Removed Docker-in-Docker Feature

**Reason:** Docker-in-Docker is incompatible with GitHub Codespaces' Debian 'trixie' distribution. The feature cannot work regardless of the moby setting.

**What this means:** You cannot run Docker inside the Codespace container. However, you can still use Docker on your local machine to develop and test, then deploy to the Codespace.

### Fix 2: Kilo Code Extension Auto-Installation

Added Kilo Code extension to `.devcontainer/devcontainer.json`:

```json
"extensions": [
  // Core
  "dbaeumer.vscode-eslint",
  "esbenp.prettier-vscode",
  
  // Kilo AI - installed automatically on rebuild
  "kilocode.kilo-code",
  
  // Docker
  "ms-azuretools.vscode-docker",
  // ... rest of extensions
]
```

### Fix 3: Backup/Restore Scripts for Conversation History

Created two scripts:

1. **`scripts/backup-kilo-code.sh`** - Backs up Kilo Code data before rebuild
2. **`scripts/restore-kilo-code.sh`** - Restores Kilo Code data after rebuild

---

## How to Use

### Before Rebuilding (Backup)

```bash
# Run inside the Codespace before rebuilding
./scripts/backup-kilo-code.sh
```

This creates a backup at `.kilo/backups/kilo_code_backup_latest.tar.gz`

**Important:** Since this backup is stored in the workspace, it will persist even after rebuild. However, for extra safety, you may want to also download the backup file to your local machine.

### After Rebuilding (Restore)

```bash
# Run inside the Codespace after rebuilding
./scripts/restore-kilo-code.sh
```

Then reload VS Code:
```
Ctrl+Shift+P -> 'Developer: Reload Window'
```

---

## What Gets Backed Up

The backup includes:
- Conversation history (`api_conversation_history.json`)
- Extension settings
- Cached data
- Any other data in `~/.vscode-remote/data/User/globalStorage/kilocode.kilo-code/`

---

## Best Practices

1. **Always backup before rebuild** - Run `./scripts/backup-kilo-code.sh` before any rebuild
2. **Download critical backups** - For very important conversations, download the backup file to your local machine
3. **Check backup succeeded** - Verify the backup file was created before proceeding with rebuild

---

## Alternative: Persistent Storage

For a more permanent solution, you can configure persistent storage in the devcontainer. However, this requires modifying the Codespace configuration at the account level, which is outside the scope of this project.

---

## Files Modified

| File | Change |
|------|--------|
| `.devcontainer/devcontainer.json` | Removed Docker-in-Docker feature (incompatible), added Kilo Code extension |
| `scripts/backup-kilo-code.sh` | NEW - Backup script |
| `scripts/restore-kilo-code.sh` | NEW - Restore script |
| `docs/CODESPACES_REBUILD_FIX.md` | Updated documentation |

---

## Note About Docker-in-Docker

The Docker-in-Docker feature has been removed from the devcontainer because it's fundamentally incompatible with GitHub Codespaces' infrastructure. The base image used by Codespaces runs Debian 'trixie', which is not supported by Docker-in-Docker regardless of configuration options.

If you need Docker for development:
- Use Docker locally on your machine
- Use the devcontainer to test and develop your application
- Docker commands (like `docker compose up`) will work locally but not inside the Codespace

---

## Testing the Fix

To test that the fix works:

1. Commit and push the changes:
   ```bash
   git add .
   git commit -m "Fix Codespaces rebuild: Docker-in-Docker and Kilo Code extension"
   git push
   ```

2. Rebuild the Codespace:
   - Go to Codespaces settings
   - Select "Rebuild Container"

3. Verify:
   - Container builds successfully (no Docker-in-Docker error)
   - Kilo Code extension is automatically installed
   - After restore, conversation history is preserved
