# Project Context - AI Rule

Rule to provide essential project context for all AI models.

## Guidelines

- **ALWAYS know the project structure**: MERN Economic Simulation Game with microservices
- **ALWAYS know the architecture**: Auth (3100), Economy (3400), Chat (3300), News (3200), Main (3000)
- **ALWAYS follow code conventions**: Check .kilo/conventions.md for standards
- **ALWAYS use correct file paths**: Check .kilo/code-map.md for exact locations
- **ALWAYS use correct function locations**: Check .kilo/function-index.md

## Project Overview

- **Name**: MERN Economic Simulation Game
- **Stack**: React, Node.js, Express, MongoDB, Docker
- **Production**: https://ovidiuguru.online

## Key Files

| Feature | File Path |
|---------|-----------|
| Auth Routes | `microservices/auth-server/routes/auth.js` |
| Economy API | `microservices/economy-server/routes/economy.js` |
| Work Service | `microservices/economy-server/services/WorkService.js` |
| Dashboard | `client/pages/dashboard.jsx` |
| Admin Panel | `client/pages/administration/admin-panel.jsx` |

## Code Standards

- **API Endpoints**: Always use `verifyToken` middleware + try-catch
- **Money/Decimal**: Always use `Decimal.js` for calculations
- **Response Format**: Always return `{success: true/false, data/error}`
- **Validation**: Always validate input before processing

## Security Rules

1. Always use `verifyToken` middleware for protected routes
2. Always use `Decimal` for money calculations
3. Always validate input before processing
4. Always use try-catch for async operations
5. Never trust client data - validate on server
