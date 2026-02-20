#!/bin/bash

# Health Check Script - Monitor all services
# Can be run manually or via cron

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🏥 System Health Check"
echo "=================================="
echo ""

# Function to check service
check_service() {
    local name=$1
    local url=$2
    local port=$3
    
    # Check if port is listening
    if netstat -tlnp 2>/dev/null | grep -q ":$port "; then
        port_status="${GREEN}✅${NC}"
    else
        port_status="${RED}❌${NC}"
    fi
    
    # Check HTTP endpoint
    if curl -f -s -m 5 $url > /dev/null 2>&1; then
        http_status="${GREEN}✅${NC}"
    else
        http_status="${RED}❌${NC}"
    fi
    
    echo -e "$name"
    echo -e "  Port $port: $port_status"
    echo -e "  HTTP: $http_status"
    echo ""
}

# Check all services
echo "📊 Service Status:"
echo ""

check_service "Main Server" "http://localhost:3000/health" "3000"
check_service "Auth Server" "http://localhost:3200/health" "3200"
check_service "News Server" "http://localhost:3100/health" "3100"
check_service "Chat Server" "http://localhost:3300/health" "3300"
check_service "Economy Server" "http://localhost:3400/health" "3400"

# Check MongoDB
echo "🗄️  Database:"
if mongosh --eval "db.adminCommand('ping')" --quiet > /dev/null 2>&1; then
    echo -e "  MongoDB: ${GREEN}✅${NC}"
else
    echo -e "  MongoDB: ${RED}❌${NC}"
fi
echo ""

# Check Nginx
echo "🌐 Web Server:"
if systemctl is-active --quiet nginx; then
    echo -e "  Nginx: ${GREEN}✅${NC}"
else
    echo -e "  Nginx: ${RED}❌${NC}"
fi
echo ""

# Check PM2
echo "⚙️  Process Manager:"
pm2_status=$(pm2 jlist 2>/dev/null)
if [ $? -eq 0 ]; then
    online_count=$(echo $pm2_status | grep -o '"status":"online"' | wc -l)
    total_count=$(echo $pm2_status | grep -o '"name":' | wc -l)
    echo -e "  PM2: ${GREEN}✅${NC} ($online_count/$total_count online)"
else
    echo -e "  PM2: ${RED}❌${NC}"
fi
echo ""

# Check disk space
echo "💾 Disk Space:"
df -h / | tail -1 | awk '{print "  Root: "$3" used / "$2" total ("$5" used)"}'
echo ""

# Check memory
echo "🧠 Memory:"
free -h | grep Mem | awk '{print "  RAM: "$3" used / "$2" total"}'
echo ""

# Check public endpoint
echo "🌍 Public Access:"
if curl -f -s -m 10 https://ovidiuguru.online/health > /dev/null 2>&1; then
    echo -e "  ovidiuguru.online: ${GREEN}✅${NC}"
else
    echo -e "  ovidiuguru.online: ${RED}❌${NC}"
fi
echo ""

# Summary
echo "=================================="
echo "Health check complete at $(date)"
echo "=================================="
