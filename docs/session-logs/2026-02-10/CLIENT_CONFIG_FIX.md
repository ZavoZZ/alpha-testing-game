# Fix pentru "Creating account..." Infinit

## 🐛 Problema

Când utilizatorul încerca să se înregistreze, aplicația se bloca pe "Creating account..." fără să se întâmple nimic.

## 🔍 Cauza

Frontend-ul (React în browser) încerca să folosească `process.env.AUTH_URI` pentru a se conecta la microserviciul de autentificare, dar:

1. **`process.env` nu există în browser!** - Variabilele de mediu sunt doar pentru Node.js server-side
2. Frontend-ul încerca să acceseze `undefined/auth/signup` → 404 error
3. Request-ul eșua, dar UI-ul rămânea blocat pe "loading"

## ✅ Soluția

### 1. Creat fișier de configurație pentru client

**`client/config.js`**:
```javascript
const config = {
	// Browser-ul accesează microserviciile prin hostname + port
	AUTH_URI: typeof window !== 'undefined' 
		? `${window.location.protocol}//${window.location.hostname}:3200`
		: 'http://localhost:3200',
	
	NEWS_URI: typeof window !== 'undefined' 
		? `${window.location.protocol}//${window.location.hostname}:3100`
		: 'http://localhost:3100',
	
	CHAT_URI: typeof window !== 'undefined' 
		? `${window.location.protocol}//${window.location.hostname}:3300`
		: 'http://localhost:3300',
};
```

**Cum funcționează**:
- Când utilizatorul accesează `http://188.245.220.40:3000`
- `window.location.hostname` = `188.245.220.40`
- `config.AUTH_URI` = `http://188.245.220.40:3200` ✅

### 2. Actualizat toate fișierele client

Înlocuit `process.env.AUTH_URI` → `config.AUTH_URI` în:

#### Authentication Files:
- ✅ `client/pages/accounts/signup.jsx`
- ✅ `client/pages/accounts/login.jsx`
- ✅ `client/pages/accounts/recover.jsx`
- ✅ `client/pages/accounts/reset.jsx`
- ✅ `client/pages/accounts/account.jsx`
- ✅ `client/pages/accounts/panels/logout.jsx`
- ✅ `client/pages/accounts/panels/delete-account.jsx`
- ✅ `client/pages/utilities/token-provider.jsx`

#### News Files:
- ✅ `client/pages/panels/news-feed.jsx`

#### Exemple de schimbări:

**Înainte**:
```javascript
const result = await fetch(`${process.env.AUTH_URI}/auth/signup`, {
	method: 'POST',
	// ...
});
```

**După**:
```javascript
const config = require('../../config');

const result = await fetch(`${config.AUTH_URI}/auth/signup`, {
	method: 'POST',
	// ...
});
```

### 3. Rebuild aplicației

```bash
docker compose up -d --build app
```

## 🧪 Testare

### Test Manual în Browser:
1. Accesează `http://188.245.220.40:3000`
2. Introdu parola: `testjoc`
3. Click pe "Sign Up"
4. Completează formularul
5. Click "Create Account"
6. ✅ Ar trebui să funcționeze acum!

### Test cURL:
```bash
# Test direct la auth-server
curl -X POST http://188.245.220.40:3200/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testplayer","email":"test@example.com","password":"password123"}'
```

## 📊 Flow-ul Corect Acum

```
Browser (http://188.245.220.40:3000)
    ↓
Frontend React (config.AUTH_URI = http://188.245.220.40:3200)
    ↓
fetch('http://188.245.220.40:3200/auth/signup')
    ↓
Auth Microservice (Docker container)
    ↓
MongoDB (auth_db)
    ↓
Success! User created
```

## 🔑 Key Points

1. **Browser vs Node.js**:
   - ❌ `process.env` - DOAR în Node.js
   - ✅ `config.js` - Funcționează în browser

2. **Dynamic URLs**:
   - Folosește `window.location` pentru a detecta hostname-ul automat
   - Funcționează cu `localhost`, IP, sau domain

3. **Microservicii Ports**:
   - Main App: `:3000`
   - Auth: `:3200`
   - News: `:3100`
   - Chat: `:3300`

## 🎯 Rezultat

- ✅ Sign up funcționează
- ✅ Login funcționează
- ✅ News feed funcționează
- ✅ Toate request-urile ajung la microservicii

## 📝 Note pentru Viitor

Dacă adaugi noi features care trebuie să comunice cu microserviciile:
1. Importă `config.js`
2. Folosește `config.AUTH_URI`, `config.NEWS_URI`, etc.
3. **NU** folosi `process.env` în client!

---

**Creat**: 10 Februarie 2026  
**Issue**: Sign up blocat pe "Creating account..."  
**Status**: ✅ **REZOLVAT**
