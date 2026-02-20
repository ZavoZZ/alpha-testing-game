# Client Pages - React Components

**Purpose:** Frontend UI components and pages  
**Framework:** React 18  
**Status:** 🟢 Production Ready

---

## 📁 Structure

```
pages/
├── accounts/           # Account management
│   ├── login.jsx       # Login page
│   ├── signup.jsx      # Signup page
│   ├── account.jsx     # Account settings
│   ├── recover.jsx     # Password recovery
│   ├── reset.jsx       # Password reset
│   └── panels/
│       ├── logout.jsx  # Logout panel
│       └── delete-account.jsx # Account deletion
│
├── administration/     # Admin & moderation
│   ├── admin-panel.jsx # Main admin dashboard
│   ├── admin.jsx       # Admin route
│   ├── mod.jsx         # Moderator route
│   └── panels/
│       ├── ban-user.jsx       # Ban management
│       ├── grant-admin.jsx    # Admin promotion
│       ├── grant-mod.jsx      # Mod promotion
│       ├── news-editor.jsx    # News editor
│       └── news-publisher.jsx # News publisher
│
├── panels/             # Reusable UI panels
│   ├── WorkStation.jsx # Work system UI (500 lines)
│   ├── news-feed.jsx   # News display
│   ├── popup-chat.jsx  # Chat interface
│   └── footer.jsx      # Footer component
│
├── static/             # Static pages
│   ├── credits.jsx     # Credits page
│   └── privacy-policy.jsx # Privacy policy
│
├── utilities/          # Utility components
│   ├── token-provider.jsx     # JWT token management
│   ├── game-auth-provider.jsx # Auth context
│   └── apply-to-body.jsx      # Body class utility
│
├── app.jsx             # Main app with routes
├── dashboard.jsx       # User dashboard
├── homepage.jsx        # Landing page
├── password-screen.jsx # Game password
└── not-found.jsx       # 404 page
```

---

## 🎯 Main Pages

### Homepage (`homepage.jsx`)
- Landing page
- Game introduction
- Login/Signup buttons
- Public access

### Dashboard (`dashboard.jsx`)
- User dashboard after login
- Balance display
- Transfer money form
- Transaction history
- Protected route (JWT required)

### Password Screen (`password-screen.jsx`)
- Game access password
- Password: `testjoc`
- Session persistence
- First screen users see

---

## 🔐 Account Pages

### Login (`accounts/login.jsx`)
- Email/password form
- JWT token reception
- Auto-redirect to dashboard
- Error handling

### Signup (`accounts/signup.jsx`)
- Registration form
- Email/username/password validation
- Auto-login after signup
- Error handling

### Account (`accounts/account.jsx`)
- Account settings
- Profile management
- Protected route

---

## 👑 Administration Pages

### Admin Panel (`administration/admin-panel.jsx`)
- User management dashboard
- View all users (table)
- Statistics (total, admins, mods, banned)
- Create/Update/Delete users
- Change roles
- Ban/Unban users
- Admin-only access

### Admin Route (`administration/admin.jsx`)
- Admin route wrapper
- Redirects non-admins

### Mod Route (`administration/mod.jsx`)
- Moderator route wrapper
- Redirects non-moderators

---

## 🎨 Panels

### WorkStation (`panels/WorkStation.jsx`)
- Work system interface
- Company selection
- Start work button
- Salary preview
- Work status display
- Cooldown timer
- Earnings alerts

### News Feed (`panels/news-feed.jsx`)
- Display news articles
- Fetch from news API
- Auto-refresh

### Popup Chat (`panels/popup-chat.jsx`)
- Chat interface
- Send/receive messages
- Real-time updates

---

## 🔧 Utilities

### Token Provider (`utilities/token-provider.jsx`)
- JWT token management
- localStorage persistence
- Token refresh logic
- Used by ALL protected components

### Game Auth Provider (`utilities/game-auth-provider.jsx`)
- Authentication context
- User state management
- Login/logout functions
- Used by ALL authenticated components

### Apply to Body (`utilities/apply-to-body.jsx`)
- Apply CSS classes to body
- Used for page-specific styling

---

## 🎨 Common Patterns

### Component Structure
```jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utilities/game-auth-provider';

export default function ComponentName() {
  const [data, setData] = useState(null);
  const { authTokens } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    const response = await fetch('/api/endpoint', {
      headers: {
        'Authorization': `Bearer ${authTokens.accessToken}`
      }
    });
    const result = await response.json();
    setData(result.data);
  };
  
  return <div>{/* JSX */}</div>;
}
```

### API Calls
```jsx
// ✅ With authentication
const response = await fetch('/api/endpoint', {
  headers: {
    'Authorization': `Bearer ${authTokens.accessToken}`,
    'Content-Type': 'application/json'
  },
  method: 'POST',
  body: JSON.stringify(data)
});

// ✅ Handle response
const result = await response.json();
if (result.success) {
  // Handle success
} else {
  // Handle error
}
```

---

## 🔍 Common Tasks

### Add New Page
1. Create component in appropriate directory
2. Add route in `app.jsx`
3. Add navigation link if needed
4. Test routing

### Add Protected Route
```jsx
// In app.jsx
<Route 
  path="/protected" 
  element={
    <ProtectedRoute>
      <YourComponent />
    </ProtectedRoute>
  } 
/>
```

### Add Admin-Only Route
```jsx
// In app.jsx
<Route 
  path="/admin" 
  element={
    <AdminRoute>
      <AdminComponent />
    </AdminRoute>
  } 
/>
```

---

## 🧪 Testing

### Manual Testing
1. Open browser: http://localhost:3000
2. Test navigation
3. Test forms
4. Check console for errors
5. Verify API calls in Network tab

### Production Testing
1. Open: https://ovidiuguru.online
2. Login with test account
3. Test all features
4. Verify responsiveness

---

## 🐛 Troubleshooting

### Page Not Loading
- Check route in `app.jsx`
- Check component import
- Check browser console for errors

### API Call Failing
- Check JWT token is valid
- Check API endpoint URL
- Check request headers
- Check browser Network tab

### Redirect Loop
- Check authentication logic
- Check token expiration
- Clear localStorage and try again

---

## 📚 Related Documentation

- **Admin Panel**: `docs/features/ADMIN_PANEL_COMPLETE.md`
- **Auth System**: `docs/architecture/AUTH_SYSTEM_COMPLETE.md`
- **Project Structure**: `docs/PROJECT_STRUCTURE.md`

---

## 🔗 Dependencies

### Used By
- Main app routing
- User authentication flow
- Admin operations

### Depends On
- `react` (UI library)
- `react-router-dom` (routing)
- `utilities/token-provider.jsx` (JWT management)
- `utilities/game-auth-provider.jsx` (auth context)
- Auth API (`microservices/auth-server`)
- Economy API (`microservices/economy-server`)

---

**Last Updated:** 2026-02-14  
**Maintainer:** AI Assistant  
**Status:** 🟢 Production Ready
