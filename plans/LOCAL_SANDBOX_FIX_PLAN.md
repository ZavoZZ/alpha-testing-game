# Plan: Fixare Probleme Sandbox Local

**Data:** 2026-02-19
**Status:** Necesită implementare

---

## Probleme Identificate

### Problema 1: Inconsecvență în numele cheii localStorage pentru token

**Fișiere afectate:**
- `client/pages/panels/InventoryPanel.jsx` (linia 23, 197)
- `client/pages/panels/MarketplacePanel.jsx` (linia 22, 211)

**Simptome:**
- Eroare "Authentication token is invalid" pe paginile Inventar și Piață

**Cauză:**
```javascript
// TokenProvider.jsx salvează ca:
localStorage.setItem("accessToken", accessToken);

// InventoryPanel.jsx caută ca:
const token = localStorage.getItem('token');  // ❌ Returnează null!
```

---

### Problema 2: API_BASE_URL Hardcoded către Producție în WorkStation

**Fișier afectat:**
- `client/pages/panels/WorkStation.jsx` (linia 29)

**Simptome:**
- Eroare "Authentication token is invalid" pe pagina Munca
- Request-urile merg către `https://ovidiuguru.online` în loc de `http://localhost:3000`

**Cauză:**
```javascript
// WorkStation.jsx linia 29
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ovidiuguru.online';
```

---

### Problema 3: Utilizatorul nu este Admin

**Utilizator:** `yxud74@gmail.com`
**Rol curent:** `user`
**Rol dorit:** `admin`

---

## Soluții

### Soluția 1: Modificare InventoryPanel.jsx

**Linia 23:**
```javascript
// ÎNAINTE:
const token = localStorage.getItem('token');

// DUPĂ:
const token = localStorage.getItem('accessToken');
```

**Linia 197:**
```javascript
// ÎNAINTE:
const token = localStorage.getItem('token');

// DUPĂ:
const token = localStorage.getItem('accessToken');
```

---

### Soluția 2: Modificare MarketplacePanel.jsx

**Linia 22 și 211:**
```javascript
// ÎNAINTE:
const token = localStorage.getItem('token');

// DUPĂ:
const token = localStorage.getItem('accessToken');
```

---

### Soluția 3: Modificare WorkStation.jsx

**Linia 29:**
```javascript
// ÎNAINTE:
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ovidiuguru.online';

// DUPĂ:
const API_BASE_URL = typeof window !== 'undefined' 
  ? `${window.location.protocol}//${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}`
  : 'http://localhost:3000';
```

---

### Soluția 4: Update rol utilizator în MongoDB

**Comandă MongoDB:**
```javascript
db.users.updateOne(
  { email: "yxud74@gmail.com" },
  { $set: { role: "admin" } }
)
```

---

## Pași de Implementare

### Pasul 1: Modificare InventoryPanel.jsx
- Schimbă `localStorage.getItem('token')` în `localStorage.getItem('accessToken')` pe liniile 23 și 197

### Pasul 2: Modificare MarketplacePanel.jsx
- Schimbă `localStorage.getItem('token')` în `localStorage.getItem('accessToken')` pe liniile 22 și 211

### Pasul 3: Modificare WorkStation.jsx
- Modifică linia 29 pentru a detecta automat URL-ul

### Pasul 4: Update rol utilizator
- Execută comandă MongoDB pentru a seta rolul "admin"

### Pasul 5: Restart container app
- `docker restart mern-app-local`

### Pasul 6: Testare
- Verifică că paginile Munca, Inventar, Piață funcționează
- Verifică că utilizatorul are acces la Admin Panel

---

## Comenzi pentru Update Admin

```bash
# Conectare la MongoDB container
docker exec -it mern-mongodb-local mongosh game_db

# Update rol utilizator
db.users.updateOne(
  { email: "yxud74@gmail.com" },
  { $set: { role: "admin" } }
)

# Verificare
db.users.findOne({ email: "yxud74@gmail.com" }, { email: 1, role: 1 })
```

---

## Verificare Finală

1. ✅ Pagina Munca funcționează fără eroare
2. ✅ Pagina Inventar funcționează fără eroare
3. ✅ Pagina Piață funcționează fără eroare
4. ✅ Utilizatorul are acces la Admin Panel
5. ✅ Toate API-urile răspund corect

---

**Necesită:** Switch la Code mode pentru implementare
