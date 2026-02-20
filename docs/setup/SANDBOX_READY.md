# 🚀 SANDBOX LOCAL - GHID FINAL

**Status:** ✅ CONFIGURARE COMPLETĂ  
**Data:** 2026-02-19  
**Platformă:** Windows 11

---

## ✅ CE AM CREAT

### Fișiere Dockerfile.local (5 fișiere)

| Fișier | Status | Descriere |
|--------|--------|-----------|
| [`Dockerfile.local`](../Dockerfile.local) | ✅ Creat | Aplicația principală |
| [`microservices/auth-server/Dockerfile.local`](../microservices/auth-server/Dockerfile.local) | ✅ Creat | Serviciu autentificare |
| [`microservices/news-server/Dockerfile.local`](../microservices/news-server/Dockerfile.local) | ✅ Creat | Serviciu știri |
| [`microservices/chat-server/Dockerfile.local`](../microservices/chat-server/Dockerfile.local) | ✅ Creat | Serviciu chat |
| [`microservices/economy-server/Dockerfile.local`](../microservices/economy-server/Dockerfile.local) | ✅ Creat | Serviciu economie |

### Scripturi Windows (4 fișiere)

| Script | Comandă | Descriere |
|--------|---------|-----------|
| [`start-sandbox.cmd`](../start-sandbox.cmd) | `.\start-sandbox.cmd` | Pornește toate serviciile |
| [`stop-sandbox.cmd`](../stop-sandbox.cmd) | `.\stop-sandbox.cmd` | Oprește toate serviciile |
| [`test-sandbox.cmd`](../test-sandbox.cmd) | `.\test-sandbox.cmd` | Testează toate serviciile |
| [`deploy-sandbox.cmd`](../deploy-sandbox.cmd) | `.\deploy-sandbox.cmd "mesaj"` | Deploy pe production |

---

## 🎯 PAȘI DE URMAT

### PASUL 1: Verifică Prerequisites

Deschide **PowerShell** sau **Command Prompt** și rulează:

```powershell
# Verifică Docker
docker --version
docker compose --version

# Verifică Node.js
node --version
npm --version

# Verifică Git
git --version
```

**Dacă lipsește ceva:**
- **Docker Desktop:** https://www.docker.com/products/docker-desktop
- **Node.js:** https://nodejs.org/ (alege LTS)
- **Git:** https://git-scm.com/download/win

---

### PASUL 2: Pornește Sandbox-ul

**Opțiunea A: Dublu-click pe fișier**
- Navighează în folderul proiectului
- Dublu-click pe `start-sandbox.cmd`

**Opțiunea B: Din terminal**
```powershell
.\start-sandbox.cmd
```

**Ce se întâmplă:**
1. Verifică Docker
2. Verifică Node.js
3. Creează `.env.local` dacă nu există
4. Pornește toate containerele Docker
5. Deschide browser la http://localhost:3000

---

### PASUL 3: Testează Serviciile

```powershell
.\test-sandbox.cmd
```

**Sau manual:**
```powershell
# Testează fiecare serviciu
curl http://localhost:3000
curl http://localhost:3100/health
curl http://localhost:3200/health
curl http://localhost:3300/health
curl http://localhost:3400/health
```

---

### PASUL 4: Dezvoltă Local

1. **Deschide VS Code:**
   ```powershell
   code .
   ```

2. **Editează fișiere** - modificările sunt aplicate automat (hot-reload)

3. **Testează în browser:** http://localhost:3000

4. **Vezi loguri:**
   ```powershell
   docker compose -f docker-compose.local.yml logs -f
   ```

---

### PASUL 5: Deploy pe GitHub și Production

```powershell
# Deploy complet cu un singur comandă
.\deploy-sandbox.cmd "Adaugă feature nou pentru X"
```

**Ce face scriptul:**
1. Rulează teste locale
2. Face commit cu mesajul tău
3. Push pe GitHub
4. SSH pe server și deploy
5. Verifică production

**Sau manual:**
```powershell
# 1. Testează
.\test-sandbox.cmd

# 2. Commit
git add .
git commit -m "Mesajul tău"

# 3. Push
git push origin main

# 4. Deploy pe server
ssh root@ovidiuguru.online
cd /root/MERN-template
git pull origin main
docker compose down
docker compose up -d --build
```

---

## 🌐 URL-URI

### Local Development

| Serviciu | URL |
|----------|-----|
| Main App | http://localhost:3000 |
| Auth Server | http://localhost:3100/health |
| News Server | http://localhost:3200/health |
| Chat Server | http://localhost:3300/health |
| Economy Server | http://localhost:3400/health |
| Qdrant Dashboard | http://localhost:6333/dashboard |

### Production

| Serviciu | URL |
|----------|-----|
| Main App | https://ovidiuguru.online |
| Economy API | https://ovidiuguru.online/api/economy/health |

---

## 🔧 COMENZI UTILE

### Docker

```powershell
# Vezi containerele care rulează
docker ps

# Vezi loguri
docker compose -f docker-compose.local.yml logs -f

# Repornește un serviciu
docker compose -f docker-compose.local.yml restart app

# Oprește tot
docker compose -f docker-compose.local.yml down

# Reconstruiește
docker compose -f docker-compose.local.yml up -d --build
```

### Git

```powershell
# Status
git status

# Vezi modificări
git diff

# Istorie
git log --oneline -10

# Pull latest
git pull origin main
```

### MongoDB

```powershell
# Conectare la MongoDB local
docker exec -it mern-mongodb-local mongosh game_db

# Vezi colecții
show collections

# Vezi utilizatori
db.users.find().limit(5)
```

---

## 🐛 TROUBLESHOOTING

### Docker nu pornește

```powershell
# Verifică status
docker info

# Repornește Docker Desktop
# Sau ca Administrator:
Restart-Service docker
```

### Port deja folosit

```powershell
# Găsește procesul
netstat -ano | findstr :3000

# Omoară procesul (înlocuiește PID)
taskkill /PID <PID> /F
```

### Container nu pornește

```powershell
# Vezi loguri
docker logs mern-app-local --tail 50

# Reconstruiește
docker compose -f docker-compose.local.yml up -d --build app
```

### Git push eșuează

```powershell
# Pull mai întâi
git pull origin main --rebase

# Rezolvă conflicte
git status
# Editează fișierele
git add .
git rebase --continue

# Push din nou
git push origin main
```

---

## 📊 ARHITECTURA

```
┌─────────────────────────────────────────────────────────────┐
│                    WINDOWS 11 LOCAL                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   VS Code    │  │   Kilo AI    │  │    Git       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Docker Desktop                          │    │
│  │                                                      │    │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │    │
│  │  │  App    │ │  Auth   │ │  News   │ │  Chat   │   │    │
│  │  │  :3000  │ │  :3100  │ │  :3200  │ │  :3300  │   │    │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘   │    │
│  │                                                      │    │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐               │    │
│  │  │ Economy │ │ MongoDB │ │ Qdrant  │               │    │
│  │  │  :3400  │ │  :27017 │ │  :6333  │               │    │
│  │  └─────────┘ └─────────┘ └─────────┘               │    │
│  │                                                      │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ git push
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         GITHUB                                │
│              https://github.com/ZavoZZ/alpha-testing-game     │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ SSH deploy
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    PRODUCTION SERVER                          │
│                   ovidiuguru.online                           │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ CHECKLIST

### Setup (doar o dată)
- [ ] Docker Desktop instalat și pornit
- [ ] Node.js v18+ instalat
- [ ] Git instalat și configurat
- [ ] VS Code instalat

### Zilnic
- [ ] `.\start-sandbox.cmd` - Pornește sandbox
- [ ] Dezvoltă în VS Code
- [ ] Testează pe localhost:3000
- [ ] `.\test-sandbox.cmd` - Verifică totul
- [ ] `.\deploy-sandbox.cmd "mesaj"` - Deploy

---

## 🎉 GATA!

Sandbox-ul tău este configurat complet!

**Pentru a începe:**
```powershell
.\start-sandbox.cmd
```

**Pentru a deploy:**
```powershell
.\deploy-sandbox.cmd "Mesajul tău de commit"
```

---

**Document creat:** 2026-02-19  
**Status:** ✅ Complet și funcțional
