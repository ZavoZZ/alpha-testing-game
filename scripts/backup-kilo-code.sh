#!/bin/bash
# =============================================================================
# Kilo Code Data Backup Script
# =============================================================================
# Purpose: Backup Kilo Code extension data before Codespace rebuild
# This script preserves conversation history and settings that would otherwise
# be lost during container rebuild
# =============================================================================

set -e

# Configuration
BACKUP_DIR=".kilo/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="kilo_code_backup_${TIMESTAMP}"
VSCODE_DATA_DIR="$HOME/.vscode-remote/data/User/globalStorage"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Kilo Code Data Backup Script${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# Check if VS Code data directory exists
if [ ! -d "$VSCODE_DATA_DIR" ]; then
    echo -e "${RED}Error: VS Code remote data directory not found at $VSCODE_DATA_DIR${NC}"
    echo "This script must be run inside the Codespace"
    exit 1
fi

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Find Kilo Code data directory
KILO_DATA_DIR="$VSCODE_DATA_DIR/kilocode.kilo-code"

if [ -d "$KILO_DATA_DIR" ]; then
    echo -e "${GREEN}Found Kilo Code data directory: $KILO_DATA_DIR${NC}"
    
    # Create backup archive
    echo -e "${YELLOW}Creating backup...${NC}"
    tar -czf "$BACKUP_DIR/${BACKUP_NAME}.tar.gz" -C "$VSCODE_DATA_DIR" "kilocode.kilo-code"
    
    # Also create a latest symlink for easy access
    ln -sf "${BACKUP_NAME}.tar.gz" "$BACKUP_DIR/kilo_code_backup_latest.tar.gz"
    
    echo -e "${GREEN}Backup created successfully!${NC}"
    echo -e "Backup location: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
    echo ""
    
    # Show backup info
    echo -e "${YELLOW}Backup contents:${NC}"
    tar -tzf "$BACKUP_DIR/${BACKUP_NAME}.tar.gz" | head -20
    echo "..."
    echo ""
    
    # Show total size
    SIZE=$(du -h "$BACKUP_DIR/${BACKUP_NAME}.tar.gz" | cut -f1)
    echo -e "${GREEN}Backup size: $SIZE${NC}"
    
else
    echo -e "${YELLOW}Warning: Kilo Code data directory not found${NC}"
    echo "No Kilo Code data to backup"
    exit 0
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Backup completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "To restore this backup after rebuild:"
echo "  1. Copy the backup file to your local machine or persist it externally"
echo "  2. After rebuild, run: ./scripts/restore-kilo-code.sh"
echo ""
echo "Or restore directly in Codespace (if backup is stored in workspace):"
echo "  tar -xzf .kilo/backups/kilo_code_backup_latest.tar.gz -C \$HOME/.vscode-remote/data/User/globalStorage/"
