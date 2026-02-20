# Auth Server - Microservice

**Port:** 3100  
**Purpose:** Authentication, JWT, User management  
**Status:** 🟢 Production Ready

---

## 📁 Structure

```
auth-server/
├── routes/
│   └── auth.js             # Authentication & admin routes
├── server.js               # Service entry point
├── package.json            # Dependencies
└── Dockerfile              # Container config
```

---

## 🎯 Main Features

### 1. User Authentication
- User registration (signup)
- User login
- User logout
- Token refresh
- Password hashing (bcrypt)

### 2. JWT Management
- Access token generation (15min expiry)
- Refresh token generation (7d expiry)
- Token verification
- Token refresh mechanism

### 3. Admin Operations
- Get all users
- Update user (role, ban status)
- Delete user
- Create user (admin panel)

---

## 🚀 Quick Start

### Start Service
```bash
cd microservices/auth-server
npm install
npm start
```

### With Docker
```bash
docker compose up auth-server -d
```

### View Logs
```bash
docker logs auth-server --tail 50 -f
```

---

## 📊 API Endpoints

### Public Endpoints
- `POST /signup` - User registration
- `POST /login` - User login

### Protected Endpoints (JWT Required)
- `POST /logout` - User logout
- `POST /refresh` - Refresh access token

### Admin Endpoints (Admin JWT Required)
- `GET /admin/users` - Get all users
- `PUT /admin/users/:id` - Update user
- `DELETE /admin/users/:id` - Delete user

**Full Documentation:** `docs/architecture/AUTH_SYSTEM_COMPLETE.md`

---

## 🔧 Configuration

### Environment Variables
```
MONGODB_URI=mongodb://mongodb:27017/auth_db
SECRET_ACCESS=your-access-secret
SECRET_REFRESH=your-refresh-secret
PORT=3100
```

### JWT Configuration
```javascript
// Access Token
expiresIn: '15m'
algorithm: 'HS256'

// Refresh Token
expiresIn: '7d'
algorithm: 'HS256'
```

---

## 🧪 Testing

### Test Scripts
```bash
# Admin API test
./test-admin-api.sh

# Production admin test
./test-production-admin.sh

# New account test
./test-production-new-account.sh
```

### Manual Testing
```bash
# Signup
curl -X POST http://localhost:3100/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "Password123!"
  }'

# Login
curl -X POST http://localhost:3100/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!"
  }'
```

---

## 🔍 Common Tasks

### Add New Auth Endpoint
1. Edit `routes/auth.js`
2. Add appropriate middleware (`verifyToken`, `verifyAdmin`)
3. Implement logic
4. Test with curl
5. Update documentation

### Modify User Model
1. Edit `server/database/models/User.js` (in root)
2. Create migration if needed
3. Update signup logic in `routes/auth.js` (line 45-90)
4. Test signup flow

### Change JWT Expiry
1. Edit `routes/auth.js` (lines 120-135)
2. Update `expiresIn` parameter
3. Restart service
4. Test token expiration

---

## 🐛 Troubleshooting

### "Invalid credentials" error
- Check password is correct
- Verify user exists in database
- Check bcrypt comparison logic

### "Token expired" error
- Access tokens expire after 15 minutes
- Use refresh token to get new access token
- Check token expiry time in JWT payload

### "Admin access required" error
- User must have `role: 'admin'`
- Check `verifyAdmin` middleware
- Verify JWT contains `admin: true`

---

## 📚 Related Documentation

- **Auth System**: `docs/architecture/AUTH_SYSTEM_COMPLETE.md`
- **Admin Panel**: `docs/features/ADMIN_PANEL_COMPLETE.md`
- **Testing Report**: `docs/features/AUTHENTICATION_TESTING_REPORT.md`

---

## 🔗 Dependencies

### Used By
- `client/pages/accounts/login.jsx` (login UI)
- `client/pages/accounts/signup.jsx` (signup UI)
- `client/pages/administration/admin-panel.jsx` (admin UI)

### Depends On
- `server/database/models/User.js` (User model)
- `common/utilities/validate-email.js` (validation)
- `common/utilities/validate-username.js` (validation)
- MongoDB (database)

---

**Last Updated:** 2026-02-14  
**Maintainer:** AI Assistant  
**Status:** 🟢 Production Ready
