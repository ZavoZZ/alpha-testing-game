# Migration from MariaDB to MongoDB

## Summary

This project has been successfully migrated from MariaDB + Sequelize to MongoDB + Mongoose.

## Changes Made

### 1. Docker Configuration
- **docker-compose.yml**: Replaced `mariadb` container with `mongo:latest`
- Changed port from 3306 to 27017
- Added `mongodb_data` volume for data persistence
- Updated environment variables to use `DB_URI` instead of separate DB_HOSTNAME, DB_PORTNAME, DB_DATABASE, DB_USERNAME, DB_PASSWORD

### 2. Dependencies
- **Removed**: `sequelize`, `mariadb`, `mysql2`
- **Added**: `mongoose` (version 8.9.3)

### 3. Database Configuration
- **server/database/index.js**: Completely rewritten to use Mongoose
- Now exports `connectDB()` function and mongoose instance
- Connects using MongoDB connection URI format: `mongodb://mongo:27017/game_db`

### 4. Models
- **server/database/models/User.js**: Created new Mongoose schema with:
  - username (unique, required)
  - email (unique, required)
  - password (required, min 8 chars)
  - role (enum: user, moderator, admin)
  - isActive (boolean)
  - isBanned (boolean)
  - lastLogin (date)
  - timestamps (createdAt, updatedAt)

### 5. Server Startup
- **server/server.js**: Updated to call `connectDB()` instead of `database.sync()`

### 6. Environment Configuration
- **.envdev**: Simplified to use single `DB_URI` variable
- Format: `mongodb://localhost:27017/game_db`

### 7. Configuration Script
- **configure-script.js**: Updated to generate MongoDB-compatible docker-compose.yml
- Removed SQL startup script generation
- Changed default port from 3306 to 27017

### 8. Cleanup
- Deleted `tools/create_database.sql`

## Running the Application

1. Start the services:
```bash
docker compose up
```

2. For development without Docker:
```bash
# Make sure MongoDB is running locally on port 27017
npm run dev
```

## Environment Variables

```env
WEB_PORT=3000
DB_URI=mongodb://mongo:27017/game_db
SECRET_ACCESS=access
```

## MongoDB Connection

The database connection is established in `server/database/index.js` and uses the URI format:
- **Local**: `mongodb://localhost:27017/game_db`
- **Docker**: `mongodb://mongo:27017/game_db`

## Notes

- MongoDB creates databases automatically when first accessed, no manual setup needed
- Collections are created automatically when documents are first inserted
- Mongoose handles schema validation and relationships
- All Sequelize references have been removed from the codebase
