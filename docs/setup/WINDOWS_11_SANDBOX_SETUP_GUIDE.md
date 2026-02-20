# 🖥️ Windows 11 Sandbox Setup Guide - Browser Based Game

**Proiect:** Browser Based Game (PBBG Economy Simulator)  
**Platform:** Windows 11  
**IDE:** VS Code cu Kilo AI  
**Data:** Februarie 2026

---

## ✅ CE ESTE DEJA CONFIGURAT

Sandbox-ul tău local este **COMPLET FUNCȚIONAL**! Toate serviciile rulează:

| Serviciu | Port | Status | Descriere |
|----------|------|--------|-----------|
| **Frontend (React)** | 3001 | ✅ Running | Webpack dev server cu hot-reload |
| **Backend API** | 3000 | ✅ Running | Express server principal |
| **Auth Server** | 3100 | ✅ Running | Autentificare și gestionare utilizatori |
| **News Server** | 3200 | ✅ Running | Sistem de știri |
| **Chat Server** | 3300 | ✅ Running | Chat în timp real |
| **Economy Server** | 3400 | ✅ Running | Sistem economic complet |
| **MongoDB** | 27017 | ✅ Running | Baza de date |
| **Qdrant** | 6333 | ✅ Running | Vector DB pentru Kilo AI indexing |

---

## 🚀 CUM SĂ PORNEȘTI SANDBOX-UL

### Opțiunea 1: Script Windows (Recomandat)

```cmd
# Dublu-click pe fișierul:
start-sandbox.cmd

# SAU din terminal:
.\start-sandbox.cmd
```

### Opțiunea 2: Docker Compose Direct

```cmd
docker-compose -f docker-compose.local.yml up -d
```

---

## 🛑 CUM SĂ OPREȘTI SANDBOX-UL

```cmd
# Dublu-click pe fișierul:
stop-sandbox.cmd

# SAU din terminal:
.\stop-sandbox.cmd
```

---

## 🧪 CUM SĂ TESTEZI

### Test Rapid (Toate Serviciile)

```cmd
.\test-sandbox.cmd
```

### Test Manual

```cmd
# Frontend - Deschide în browser:
start http://localhost:3001

# Test Auth Server:
curl http://localhost:3100/health

# Test Economy Server:
curl http://localhost:3400/health

# Test MongoDB:
docker exec mern-mongodb-local mongosh --eval "db.adminCommand('ping')"
```

---

## 📁 STRUCTURA PROIECTULUI

```
c:\Users\david\Desktop\proiectjoc\
├── client/                    # Frontend React
│   ├── pages/                 # Componente React
│   │   ├── panels/            # InventoryPanel, MarketplacePanel, WorkStation
│   │   ├── accounts/          # Login, Signup, etc.
│   │   └── administration/    # Admin Panel
│   └── styles/                # CSS
├── server/                    # Backend Express principal
├── microservices/             # Microservicii
│   ├── auth-server/           # Autentificare (port 3100)
│   ├── news-server/           # Știri (port 3200)
│   ├── chat-server/           # Chat (port 3300)
│   └── economy-server/        # Economie (port 3400)
├── docs/                      # Documentație
├── plans/                     # Planuri de dezvoltare
├── docker-compose.local.yml   # Configurare Docker local
├── Dockerfile.local           # Imagine Docker pentru development
├── start-sandbox.cmd          # Script pornire
├── stop-sandbox.cmd           # Script oprire
└── test-sandbox.cmd           # Script testare
```

---

## 🔄 WORKFLOW DE DEZVOLTARE

### 1. Dezvoltare Locală

```cmd
# 1. Pornește sandbox-ul
.\start-sandbox.cmd

# 2. Deschide VS Code
code .

# 3. Editează fișierele - hot-reload este activ!
#    Orice modificare va fi vizibilă instant la http://localhost:3001

# 4. Testează în browser
start http://localhost:3001
```

### 2. Salvare pe GitHub

```cmd
# Vezi ce s-a modificat
git status

# Adaugă toate fișierele
git add .

# Commit cu mesaj descriptiv
git commit -m "feat: descrierea modificărilor"

# Push pe GitHub
git push origin main
```

### 3. Deploy pe Production Server

```cmd
# Rulează scriptul de deploy
.\deploy-sandbox.cmd

# SAU manual:
ssh root@ovidiuguru.online "cd /root/MERN-template && git pull && docker compose up -d --build"
```

---

## 🔧 CONFIGURARE KILO AI

### Kilo AI este deja configurat pentru development local!

Fișiere de configurare:
- `.vscode/settings.json` - Setări VS Code
- `.kilo/modes/dev.json` - Mod development
- `.kilo/modes/test.json` - Mod testare
- `.cursorrules` - Reguli pentru AI

### Cum să folosești Kilo AI:

1. **Deschide VS Code** în folderul proiectului
2. **Apasă Ctrl+Shift+P** → "Kilo: Start"
3. **Scrie o cerere** în chat-ul Kilo AI

Exemple de cereri:
```
"Verifică că toate endpoint-urile economy funcționează"
"Adaugă un buton nou pe dashboard"
"Fixează bug-ul din InventoryPanel"
"Testează login-ul și signup-ul"
```

---

## 🌐 ACCESARE APLICAȚIE

### Local (Sandbox)
- **Frontend:** http://localhost:3001
- **Backend API:** http://localhost:3000
- **Auth:** http://localhost:3100
- **Economy:** http://localhost:3400

### Production (Server)
- **Site:** https://ovidiuguru.online
- **API:** https://ovidiuguru.online/api

---

## 🐛 TROUBLESHOOTING

### Problema: Containerul nu pornește

```cmd
# Verifică log-urile
docker logs mern-app-local

# Repornește containerul
docker restart mern-app-local

# Dacă nu merge, reconstruiește
docker-compose -f docker-compose.local.yml up -d --build
```

### Problema: Port deja în uz

```cmd
# Vezi ce folosește portul
netstat -ano | findstr :3001

# Omoară procesul (înlocuiește PID cu numărul găsit)
taskkill /PID <PID> /F
```

### Problema: Modificările nu apar

```cmd
# Webpack are cache - repornește containerul
docker restart mern-app-local

# Așteaptă 10 secunde pentru recompilare
```

### Problema: MongoDB nu răspunde

```cmd
# Verifică starea
docker logs mern-mongodb-local

# Repornește
docker restart mern-mongodb-local
```

---

## 📊 MONITORING

### Vezi starea containerelor

```cmd
docker ps -a
```

### Vezi log-urile în timp real

```cmd
# Toate log-urile
docker-compose -f docker-compose.local.yml logs -f

# Doar frontend
docker logs mern-app-local -f

# Doar economy server
docker logs mern-economy-local -f
```

### Verifică resursele

```cmd
docker stats
```

---

## 🔐 SECURITATE

### Nu comite fișiere sensibile!

Fișiere care **NU** trebuie pe GitHub:
- `.env` - Variabile de mediu
- `.env.local` - Config local
- `node_modules/` - Dependențe
- `*.log` - Log-uri

Acestea sunt deja în `.gitignore`.

---

## 📚 DOCUMENTAȚIE SUPLIMENTARĂ

### În folderul `docs/`:
- `ECONOMY_API_DOCUMENTATION.md` - Documentație API Economy
- `MODULE_2_3_COMPLETE.md` - Marketplace & Metabolism
- `PROJECT_STRUCTURE.md` - Structura proiectului

### În folderul `plans/`:
- `GITHUB_SYNC_PLAN.md` - Plan sincronizare GitHub
- `KILO_AI_QUICK_START_GUIDE.md` - Ghid Kilo AI
- `MODULE_2_3_ORCHESTRATOR_HANDOFF.md` - Plan implementare

---

## ✅ CHECKLIST FINAL

- [x] Docker Desktop instalat și rulează
- [x] Toate containerele pornite (`docker ps`)
- [x] Frontend accesibil la http://localhost:3001
- [x] API-urile răspund (health checks)
- [x] MongoDB conectat
- [x] Kilo AI configurat în VS Code
- [x] Git configurat cu GitHub

---

## 🎮 GATA!

Sandbox-ul tău este complet funcțional. Acum poți:

1. **Dezvolta local** cu hot-reload activ
2. **Testa** toate funcționalitățile
3. **Folosi Kilo AI** pentru asistență
4. **Salva pe GitHub** când ești mulțumit
5. **Deploy pe production** cu un singur click

**Distracție plăcută cu dezvoltarea jocului!** 🚀

---

*Ultima actualizare: Februarie 2026*  
*Status: ✅ Sandbox Complet Funcțional*
