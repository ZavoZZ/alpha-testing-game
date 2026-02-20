# Quick Start Guide - Test Joc

## 🚀 Pornire Rapidă

### 1. Pornește toate serviciile
```bash
cd /root/MERN-template
docker compose up -d
```

### 2. Verifică că toate rulează
```bash
docker compose ps
```

Ar trebui să vezi:
- ✅ mern-template-app-1 (port 3000)
- ✅ mern-template-auth-server-1 (port 3200)
- ✅ mern-template-news-server-1 (port 3100)
- ✅ mern-template-chat-server-1 (port 3300)
- ✅ mern-template-mongo-1 (port 27017)

### 3. Accesează jocul
```
http://188.245.220.40:3000
```

**Parola game**: `testjoc`

## 🔄 Comenzi Utile

### Restart complet
```bash
docker compose down
docker compose up -d
```

### Rebuild complet (după modificări cod)
```bash
docker compose down -v
docker compose up --build -d
```

### Vezi logs
```bash
# Toate serviciile
docker compose logs -f

# Un singur serviciu
docker compose logs -f app
docker compose logs -f auth-server
docker compose logs -f news-server
docker compose logs -f chat-server
```

### Stop servicii
```bash
docker compose down
```

## 🧪 Test Rapid

### Test Auth
```bash
# Crează cont
curl -X POST http://188.245.220.40:3200/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"player1","email":"player@test.com","password":"pass12345"}'

# Login
curl -X POST http://188.245.220.40:3200/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"player@test.com","password":"pass12345"}'
```

### Health Checks
```bash
curl http://188.245.220.40:3200/health  # Auth
curl http://188.245.220.40:3100/health  # News
curl http://188.245.220.40:3300/health  # Chat
```

## 📋 Microservicii

| Serviciu | Port | Endpoint | Database |
|----------|------|----------|----------|
| Main App | 3000 | http://188.245.220.40:3000 | game_db |
| Auth Server | 3200 | http://188.245.220.40:3200 | auth_db |
| News Server | 3100 | http://188.245.220.40:3100 | news_db |
| Chat Server | 3300 | http://188.245.220.40:3300 | chat_db |
| MongoDB | 27017 | mongodb://localhost:27017 | - |

## 🔧 Configurare Domeniu

Pentru a folosi domeniul `ovidiuguru.online`:

1. Mergi pe Namecheap → Advanced DNS
2. Adaugă A Records:
   - `@` → `188.245.220.40`
   - `www` → `188.245.220.40`
3. Așteaptă 5-30 minute pentru propagare DNS
4. Accesează: `http://ovidiuguru.online`

**Detalii complete**: Vezi `DOMAIN_SETUP_GUIDE.md`

## 🎮 Flow-ul Jocului

1. **Accesează** → `http://188.245.220.40:3000`
2. **Introdu parola** → `testjoc`
3. **Sign Up / Login** → Folosește Auth Server (port 3200)
4. **Joacă** → Main App coordonează tot
5. **Chat** → Chat Server (port 3300) pentru real-time
6. **News** → News Server (port 3100) pentru updates

## 🐛 Troubleshooting

### Serviciile nu pornesc?
```bash
# Verifică ce rulează
docker ps -a

# Vezi logs pentru erori
docker compose logs

# Restart complet
docker compose down -v
docker compose up --build -d
```

### Nu se conectează la database?
```bash
# Verifică că MongoDB rulează
docker compose ps mongo

# Vezi logs MongoDB
docker compose logs mongo
```

### Changes nu apar?
```bash
# Hard refresh în browser
Ctrl + Shift + R

# Sau rebuild
docker compose down
docker compose up --build -d
```

### Port-uri ocupate?
```bash
# Verifică ce folosește portul
sudo lsof -i :3000
sudo lsof -i :3200

# Oprește procesul
sudo kill -9 PID
```

## 📚 Documentație Completă

- **Microservicii**: Vezi `MICROSERVICES_ARCHITECTURE.md`
- **Design**: Vezi `NEW_DESIGN_README.md`
- **Auth System**: Vezi `AUTH_SYSTEM_COMPLETE.md`
- **Domain Setup**: Vezi `DOMAIN_SETUP_GUIDE.md`
- **Fixes**: Vezi `FIXES_APPLIED.md`

---

**TIP**: Pentru multi-player scaling, vezi secțiunea "Scalare" în `MICROSERVICES_ARCHITECTURE.md`
