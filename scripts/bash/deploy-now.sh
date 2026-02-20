#!/bin/bash

echo "🚀 Starting deployment to ovidiuguru.online..."
echo ""

# Check local version
LOCAL_COMMIT=$(git log --oneline -1 | awk '{print $1}')
echo "📍 Local version: $LOCAL_COMMIT"
echo ""

# Deploy
echo "🔄 Pulling latest code on server..."
ssh root@ovidiuguru.online << 'ENDSSH'
cd /root/MERN-template
git pull origin main
echo ""
echo "🔄 Restarting services..."
pm2 restart all
echo ""
echo "⏳ Waiting for services to stabilize..."
sleep 5
echo ""
echo "✅ Services status:"
pm2 list
ENDSSH

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "🌐 Check: https://ovidiuguru.online"
