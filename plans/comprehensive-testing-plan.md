# Comprehensive Game Testing Plan

## Overview

Complete testing strategy for the MERN Economic Simulation Game covering all pages, API endpoints, game logic, and backend services.

## Testing Environment

- **URL:** http://localhost:3001
- **API Base:** http://localhost:3000/api
- **MongoDB:** MongoDB Atlas (cloud)
- **Test Account:** testjucator@ovidiuguru.com / Password123!

---

## Phase 1: Health Checks (All Services)

### 1.1 Microservices Health

```
- Auth Server (3100):   GET http://localhost:3100/health
- News Server (3200):   GET http://localhost:3200/health
- Chat Server (3300):  GET http://localhost:3300/health
- Economy Server (3400): GET http://localhost:3400/health
```

### 1.2 Main App

```
- Frontend (3001):      GET http://localhost:3001
- API Proxy (3000):     GET http://localhost:3000/api/economy/health
```

---

## Phase 2: Public Pages Testing

### 2.1 Homepage (/)

- [ ] Load homepage successfully
- [ ] Display game title and description
- [ ] Show login/signup buttons
- [ ] Check responsive design
- [ ] Check for console errors

### 2.2 Login Page (/login)

- [ ] Load login page
- [ ] Form validation (empty fields)
- [ ] Invalid credentials error
- [ ] Successful login redirects to dashboard
- [ ] "Remember me" functionality
- [ ] Password visibility toggle

### 2.3 Signup Page (/signup)

- [ ] Load signup page
- [ ] Form validation
  - [ ] Email format validation
  - [ ] Username length (3-50 chars)
  - [ ] Password strength (min 8 chars)
- [ ] Duplicate email/username error
- [ ] Successful registration
- [ ] Password visibility toggle

### 2.4 Password Recovery (/recover)

- [ ] Load recovery page
- [ ] Email input validation
- [ ] Success message after email submission
- [ ] Recovery link functionality

### 2.5 Password Reset (/reset)

- [ ] Load with valid token
- [ ] Invalid/expired token handling
- [ ] Password reset validation
- [ ] Successful password change

### 2.6 Static Pages

- [ ] Credits page (/credits)
- [ ] Privacy Policy (/privacy-policy)
- [ ] 404 Not Found page

---

## Phase 3: Authenticated Pages Testing

### 3.1 Dashboard (/dashboard)

- [ ] Load dashboard with valid token
- [ ] Display player information (name, balance, energy)
- [ ] Navigation menu works
- [ ] Real-time updates (if applicable)
- [ ] Logout functionality
- [ ] Token refresh handling

### 3.2 WorkStation (/dashboard -> WorkStation Panel)

- [ ] Load work status
- [ ] Display current job/company
- [ ] Show wage information
- [ ] Salary preview calculation
  - [ ] Base wage display
  - [ ] Gross salary
  - [ ] Tax calculation (15%)
  - [ ] Net salary
  - [ ] Energy cost
- [ ] "Start Shift" button functionality
- [ ] Cooldown timer display
- [ ] Work when no job (government auto-hire)
- [ ] Efficiency bar display
- [ ] Total shifts counter
- [ ] Company solvency warnings

### 3.3 Inventory Panel (/dashboard -> Inventory)

- [ ] Load inventory data
- [ ] Display items grid
- [ ] Item details (name, quantity, value)
- [ ] Empty inventory handling
- [ ] Item sorting/filtering
- [ ] Equipping items (if applicable)

### 3.4 Marketplace Panel (/dashboard -> Marketplace)

- [ ] Load marketplace listings
- [ ] Display items for sale
- [ ] Search/filter functionality
- [ ] Buy item functionality
- [ ] Sell item functionality
- [ ] Price display
- [ ] Quantity selection
- [ ] Insufficient funds handling
- [ ] Transaction success/error messages

### 3.5 News Feed (/dashboard -> News)

- [ ] Load news articles
- [ ] Display article list
- [ ] Article content rendering
- [ ] Publish article (admin only)
- [ ] Edit article (admin only)

### 3.6 Chat Popup (/dashboard -> Chat)

- [ ] Open chat popup
- [ ] Send message
- [ ] Receive messages
- [ ] Room selection
- [ ] Message history
- [ ] Real-time updates
- [ ] Close/minimize chat

---

## Phase 4: Admin Panel Testing

### 4.1 Admin Dashboard (/admin-panel)

- [ ] Access denied for non-admins
- [ ] Admin login required
- [ ] Statistics display
  - [ ] Total users count
  - [ ] Admins count
  - [ ] Moderators count
  - [ ] Banned users count

### 4.2 User Management

- [ ] View all users table
- [ ] Create new user
- [ ] Edit user role (user/mod/admin)
- [ ] Ban user
- [ ] Unban user
- [ ] Delete user
- [ ] Cannot delete own account

### 4.3 News Management

- [ ] News editor access
- [ ] Create article
- [ ] Edit article
- [ ] Publish/unpublish article
- [ ] Delete article

### 4.4 Moderation

- [ ] Chat reports viewing
- [ ] Ban user from reports
- [ ] Review reported messages

---

## Phase 5: API Endpoint Testing

### 5.1 Auth API (/api/auth-service)

```
POST /auth/register     - User registration
POST /auth/login        - User login
POST /auth/logout      - User logout
POST /auth/refresh     - Token refresh
POST /auth/recover     - Password recovery request
POST /auth/reset      - Password reset with token
GET  /auth/me         - Get current user
```

### 5.2 Economy API (/api/economy)

```
GET  /economy/health              - Service health
GET  /economy/player/:id          - Player data
GET  /economy/player/:id/inventory - Player inventory
GET  /economy/player/:id/balance  - Player balance
POST /economy/work/start          - Start work shift
POST /economy/work/complete       - Complete work shift
GET  /economy/work/status         - Work status
GET  /economy/marketplace         - Marketplace listings
POST /economy/marketplace/buy     - Buy item
POST /economy/marketplace/sell    - Sell item
POST /economy/marketplace/list     - List item for sale
```

### 5.3 News API (/api/news-service)

```
GET  /news           - Get all articles
GET  /news/:id       - Get single article
POST /news           - Create article (auth)
PUT  /news/:id       - Update article (auth)
DELETE /news/:id     - Delete article (auth)
```

### 5.4 Chat API (/api/chat-service)

```
GET  /chat/:room     - Get room messages
POST /chat           - Send message
WS  /socket.io       - Real-time chat
```

---

## Phase 6: Game Logic Testing

### 6.1 Work System

- [ ] Start shift increases shifts worked
- [ ] Earn wages correctly
- [ ] Energy consumption
- [ ] Cooldown between shifts (configurable)
- [ ] Government company auto-hire for unemployed
- [ ] Company bankruptcy handling

### 6.2 Salary Calculation

- [ ] Base wage × shifts worked
- [ ] 15% income tax deduction
- [ ] Net salary after tax
- [ ] Bonus multipliers (efficiency)
- [ ] Energy cost deduction

### 6.3 Energy System

- [ ] Energy depletes with work
- [ ] Energy regenerates over time
- [ ] Cannot work without energy
- [ ] Energy display updates

### 6.4 Marketplace

- [ ] Items listed at correct prices
- [ ] Buying deducts balance
- [ ] Selling adds balance
- [ ] Inventory updates after transaction
- [ ] Transaction logs

### 6.5 Inventory

- [ ] Items stored correctly
- [ ] Quantity management
- [ ] Item value tracking

### 6.6 GameClock/Time System

- [ ] Time progresses correctly
- [ ] Daily salary payments
- [ ] Event triggers at correct times

---

## Phase 7: Security Testing

### 7.1 Authentication

- [ ] Invalid tokens rejected
- [ ] Expired tokens handled
- [ ] Role-based access control
- [ ] Admin-only endpoints protected

### 7.2 Input Validation

- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] Input sanitization
- [ ] Rate limiting

### 7.3 Anti-Fraud Shield

- [ ] Suspicious activity detection
- [ ] Transaction limits
- [ ] Activity logging

---

## Phase 8: Performance & Error Handling

### 8.1 Error Handling

- [ ] API timeout handling
- [ ] Network error messages
- [ ] Database error handling
- [ ] Graceful degradation

### 8.2 Console Errors

- [ ] No JavaScript errors
- [ ] No console warnings
- [ ] Proper error boundaries

### 8.3 Loading States

- [ ] Loading spinners
- [ ] Skeleton loaders
- [ ] Timeout handling

---

## Testing Tools & Approach

### Browser Testing (Playwright MCP)

1. Navigate to localhost:3001
2. Take snapshots at each page
3. Interact with forms
4. Verify responses
5. Check console logs

### API Testing (curl)

```bash
# Example: Test login
curl -X POST http://localhost:3000/api/auth-service/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testjucator@ovidiuguru.com","password":"Password123!"}'
```

### Database Verification

- Check MongoDB Atlas for data persistence
- Verify user records
- Verify economy transactions

---

## Issue Tracking

| #   | Issue | Severity | Status | Fix |
| --- | ----- | -------- | ------ | --- |
| 1   |       |          |        |     |
| 2   |       |          |        |     |
| 3   |       |          |        |     |
| 4   |       |          |        |     |
| 5   |       |          |        |     |

---

## Sign-off Checklist

- [ ] All pages tested
- [ ] All API endpoints tested
- [ ] All game logic verified
- [ ] No critical errors
- [ ] No console errors
- [ ] Security checks passed
- [ ] Performance acceptable
- [ ] Ready for production deployment
