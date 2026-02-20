#!/bin/bash

# =====================================================================
# Kilo AI Command Wrapper with Retry Logic
# =====================================================================
# This script wraps commands with automatic retry logic
# Usage: ./scripts/kilo-command-wrapper.sh "your command here"
# =====================================================================

# Configuration
MAX_RETRIES=3
RETRY_DELAY=5
TIMEOUT=300  # 5 minutes

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the command to execute
COMMAND="$@"

if [ -z "$COMMAND" ]; then
    echo -e "${RED}❌ Error: No command provided${NC}"
    echo "Usage: $0 \"command to execute\""
    exit 1
fi

echo "=========================================="
echo "🔄 Command Wrapper with Retry Logic"
echo "=========================================="
echo ""
echo -e "${BLUE}Command: $COMMAND${NC}"
echo -e "${BLUE}Max Retries: $MAX_RETRIES${NC}"
echo -e "${BLUE}Retry Delay: ${RETRY_DELAY}s${NC}"
echo -e "${BLUE}Timeout: ${TIMEOUT}s${NC}"
echo ""

# Function to run command with timeout
run_with_timeout() {
    local cmd="$1"
    local timeout_duration="$2"
    
    # Run command in background
    eval "$cmd" &
    local pid=$!
    
    # Wait for command with timeout
    local count=0
    while kill -0 $pid 2>/dev/null; do
        if [ $count -ge $timeout_duration ]; then
            echo -e "${RED}⏱️  Command timed out after ${timeout_duration}s${NC}"
            kill -9 $pid 2>/dev/null
            return 124  # Timeout exit code
        fi
        sleep 1
        count=$((count + 1))
    done
    
    # Get exit code
    wait $pid
    return $?
}

# Retry loop
RETRY_COUNT=0
SUCCESS=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    
    echo "=========================================="
    echo -e "${BLUE}Attempt $RETRY_COUNT of $MAX_RETRIES${NC}"
    echo "=========================================="
    echo ""
    
    # Record start time
    START_TIME=$(date +%s)
    
    # Run command with timeout
    if run_with_timeout "$COMMAND" "$TIMEOUT"; then
        # Success!
        END_TIME=$(date +%s)
        DURATION=$((END_TIME - START_TIME))
        
        echo ""
        echo "=========================================="
        echo -e "${GREEN}✅ SUCCESS${NC}"
        echo "=========================================="
        echo -e "Duration: ${DURATION}s"
        echo -e "Attempts: $RETRY_COUNT"
        echo ""
        
        SUCCESS=true
        break
    else
        # Failed
        EXIT_CODE=$?
        END_TIME=$(date +%s)
        DURATION=$((END_TIME - START_TIME))
        
        echo ""
        echo "=========================================="
        echo -e "${RED}❌ FAILED (Exit Code: $EXIT_CODE)${NC}"
        echo "=========================================="
        echo -e "Duration: ${DURATION}s"
        echo ""
        
        # Check if we should retry
        if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
            echo -e "${YELLOW}⏳ Retrying in ${RETRY_DELAY}s...${NC}"
            echo ""
            sleep $RETRY_DELAY
        fi
    fi
done

# Final result
echo "=========================================="
if [ "$SUCCESS" = true ]; then
    echo -e "${GREEN}✅ Command completed successfully${NC}"
    echo "=========================================="
    exit 0
else
    echo -e "${RED}❌ Command failed after $MAX_RETRIES attempts${NC}"
    echo "=========================================="
    echo ""
    echo "Troubleshooting tips:"
    echo "  1. Check if services are running: docker ps"
    echo "  2. Check logs: docker logs [service] --tail 50"
    echo "  3. Restart services: docker compose restart [service]"
    echo "  4. Check network: docker network ls"
    echo ""
    exit 1
fi
