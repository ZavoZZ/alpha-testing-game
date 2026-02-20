# GitHub Codespaces Setup Guide

## 🚀 Quick Start

### 1. Create Codespace

1. Go to your GitHub repository
2. Click the green **"Code"** button
3. Select **"Codespaces"** tab
4. Click **"Create codespace on main"**

### 2. Wait for Setup

The codespace will:
- Install Node.js dependencies
- Configure Docker
- Set up the development environment

### 3. Start Services

```bash
# Option A: Docker Compose (recommended)
docker-compose -f docker-compose.local.yml up -d

# Option B: Use the setup script
./scripts/codespaces-setup.sh
```

### 4. Access the Application

| Service | URL |
|---------|-----|
| Main App (Dev Server) | http://localhost:3001 |
| Main App (API) | http://localhost:3000 |
| Auth Service | http://localhost:3100 |
| News Service | http://localhost:3200 |
| Chat Service | http://localhost:3300 |
| Economy Service | http://localhost:3400 |

## 📋 Prerequisites

### GitHub Account
- Free GitHub account works fine
- No payment required for basic Codespaces

### MongoDB
The project supports two options:

**Option 1: MongoDB in Docker (Default)**
```bash
# MongoDB will be started automatically with docker-compose
```

**Option 2: MongoDB Atlas (Cloud)**
1. Create free account at https://www.mongodb.com/atlas
2. Create free cluster
3. Get connection string
4. Update `.env.local`:
   ```
   DB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/game_db
   ```

## 🔧 Configuration

### Environment Variables

The following files control environment configuration:

| File | Purpose | Git |
|------|---------|-----|
| `.envdev` | Development template | ✅ Yes |
| `.env.codespaces` | Codespaces template | ❌ No |
| `.env.local` | Local/Codespaces config | ❌ No |
| `.env` | Production config | ❌ No |

### Creating .env.local

