#!/bin/bash
# =============================================================================
# Kilo Code Data Restore Script
# =============================================================================
# Purpose: Restore Kilo Code extension data after Codespace rebuild
# This script restores conversation history and settings from a backup
# =============================================================================

set -e

# Configuration
BACKUP_DIR=".kilo/backups"
VSCODE_DATA_DIR="$HOME/.vscode-remote/data/User/globalStorage"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Kilo Code Data Restore Script${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# Check if VS Code data directory exists
if [ ! -d "$VSCODE_DATA_DIR" ]; then
    echo -e "${RED}Error: VS Code remote data directory not found at $VSCODE_DATA_DIR${NC}"
    echo "This script must be run inside the Codespace"
    exit 1
fi

# Check if backup exists
if [ ! -f "$BACKUP_DIR/kilo_code_backup_latest.tar.gz" ]; then
    echo -e "${RED}Error: No backup found at $BACKUP_DIR/kilo_code_backup_latest.tar.gz${NC}"
    echo "Please run ./scripts/backup-kilo-code.sh first"
    exit 1
fi

echo -e "${GREEN}Found backup: $BACKUP_DIR/kilo_code_backup_latest.tar.gz${NC}"
echo ""

# Create Kilo Code data directory if it doesn't exist
mkdir -p "$VSCODE_DATA_DIR"

# Extract backup
echo -e "${YELLOW}Restoring Kilo Code data...${NC}"
tar -xzf "$BACKUP_DIR/kilo_code_backup_latest.tar.gz" -C "$VSCODE_DATA_DIR"

echo -e "${GREEN}Restore completed successfully!${NC}"
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Kilo Code data has been restored!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Please reload VS Code to apply changes:"
echo "  Ctrl+Shift+P -> 'Developer: Reload Window'"
