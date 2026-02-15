#!/bin/bash

echo "🔍 Checking server version..."
echo ""

# Check local version
echo "📍 LOCAL VERSION:"
git log --oneline -1
echo ""

# Check server version
echo "📍 SERVER VERSION (ovidiuguru.online):"
ssh root@ovidiuguru.online "cd /root/MERN-template && git log --oneline -1"
echo ""

# Compare
LOCAL_COMMIT=$(git log --oneline -1 | awk '{print $1}')
SERVER_COMMIT=$(ssh root@ovidiuguru.online "cd /root/MERN-template && git log --oneline -1 | awk '{print \$1}'")

echo "---"
if [ "$LOCAL_COMMIT" == "$SERVER_COMMIT" ]; then
    echo "✅ Server is UP TO DATE with local version"
else
    echo "⚠️  Server is BEHIND - needs deployment"
    echo "   Local:  $LOCAL_COMMIT"
    echo "   Server: $SERVER_COMMIT"
fi
