#!/bin/bash

# Quick Deploy Script - Fast deployment without full checks
# Use this for minor updates when you're confident

set -e

echo "⚡ Quick Deploy Starting..."

cd /root/MERN-template

# Pull latest code
echo "📥 Pulling code..."
git pull origin main

# Install dependencies (only if package.json changed)
if git diff HEAD@{1} --name-only | grep -q "package.json"; then
    echo "📦 Installing dependencies..."
    npm install --production
    cd microservices/economy-server && npm install --production && cd ../..
    cd microservices/auth-server && npm install --production && cd ../..
    cd microservices/news-server && npm install --production && cd ../..
    cd microservices/chat-server && npm install --production && cd ../..
fi

# Build client (only if client files changed)
if git diff HEAD@{1} --name-only | grep -q "client/"; then
    echo "🏗️ Building client..."
    cd client
    npm install
    npm run build
    cd ..
fi

# Restart services
echo "🔄 Restarting services..."
pm2 restart all

echo "✅ Quick deploy complete!"
pm2 list
