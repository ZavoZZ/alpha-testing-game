#!/bin/bash

# Script pentru deployment pe serverul de producție
# Server: 188.245.220.40 (ovidiuguru.online)

echo "🚀 Starting deployment to production server..."
echo "Server: ovidiuguru.online (188.245.220.40)"
echo ""

# 1. Pull latest changes from GitHub
echo "📥 Step 1: Pulling latest changes from GitHub..."
git pull origin main

if [ $? -ne 0 ]; then
    echo "❌ Failed to pull from GitHub"
    exit 1
fi

echo "✅ Code updated from GitHub"
echo ""

# 2. Rebuild Docker containers
echo "🔨 Step 2: Rebuilding Docker containers..."
docker compose down
docker compose up --build -d

if [ $? -ne 0 ]; then
    echo "❌ Failed to rebuild containers"
    exit 1
fi

echo "✅ Containers rebuilt successfully"
echo ""

# 3. Wait for services to start
echo "⏳ Step 3: Waiting for services to start (20 seconds)..."
sleep 20

# 4. Check container status
echo "📊 Step 4: Checking container status..."
docker compose ps

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Check MongoDB replica set status"
echo "2. Verify services are running"
echo "3. Test the application at https://ovidiuguru.online"
echo ""
