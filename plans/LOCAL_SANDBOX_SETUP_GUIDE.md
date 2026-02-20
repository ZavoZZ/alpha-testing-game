# 🖥️ Ghid Complet: Transformarea Calculatorului în Sandbox Local

**Platformă:** Windows 11  
**Scop:** Development local, testare, deploy pe GitHub și production  
**Data:** 2026-02-19

---

## 📋 CE AI DEJA (Configurat)

Din analiza proiectului, ai deja:

| Componentă | Status | Fișier/Locație |
|------------|--------|----------------|
| Environment local | ✅ Configurat | [`.env.local`](../.env.local) |
| Docker Compose local | ✅ Configurat | [`docker-compose.local.yml`](../docker-compose.local.yml) |
| Scripturi automatizare | ✅ Există | [`scripts/`](../scripts/) |
| VS Code settings | ✅ Configurat | [`.vscode/settings.json`](../.vscode/settings.json) |
| Git ignore | ✅ Configurat | [`.gitignore`](../.gitignore) |
| Kilo AI modes | ✅ Configurat | [`.kilo/modes/`](../.kilo/modes/) |

---

## ❌ CE LIPSEȘTE (Trebuie Creat)

| Componentă | Status | Acțiune Necesară |
|------------|--------|------------------|
| **Dockerfile.local** (main app) | ❌ Lipsește | Trebuie creat |
| **Dockerfile.local** (auth-server) | ❌ Lipsește | Trebuie creat |
| **Dockerfile.local** (news-server) | ❌ Lipsește | Trebuie creat |
| **Dockerfile.local** (chat-server) | ❌ Lipsește | Trebuie creat |
| **Dockerfile.local** (economy-server) | ❌ Lipsește | Trebuie creat |

---

## 🚀 PASUL 1: Instalare Prerequisites (dacă nu ai)

### 1.1 Docker Desktop

```powershell
# Verifică dacă Docker este instalat
docker --version
docker compose --version
```

**Dacă nu ai Docker:**
1. Descarcă de la: https://www.docker.com/products/docker-desktop
2. Instalează și repornește calculatorul
3. Deschide Docker Desktop și așteaptă să pornească (iconița în system tray)

### 1.2 Node.js (v18+)

```powershell
# Verifică versiunea
node --version
npm --version
```

**Dacă nu ai Node.js:**
1. Descarcă de la: https://nodejs.org/ (alege LTS)
2. Instalează cu opțiunile default

### 1.3 Git

```powershell
# Verifică
git --version
```

**Dacă nu ai Git:**
1. Descarcă de la: https://git-scm.com/download/win
2. Instalează cu opțiunile default

### 1.4 VS Code

```powershell
# Verifică
code --version
```

**Dacă nu ai VS Code:**
1. Descarcă de la: https://code.visualstudio.com/
2. Instalează și deschide proiectul

---

## 🐳 PASUL 2: Creare Dockerfile.local

Aceste fișiere sunt necesare pentru ca Docker să poată rula aplicația local.

### 2.1 Dockerfile.local pentru Main App

Creează fișierul `Dockerfile.local` în rădăcina proiectului:

```dockerfile
# Dockerfile.local - Main Application
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start in development mode
CMD ["npm", "run", "dev"]
```

### 2.2 Dockerfile.local pentru Auth Server

Creează fișierul `microservices/auth-server/Dockerfile.local`:

```dockerfile
# Dockerfile.local - Auth Server
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3100

# Start server
CMD ["npm", "start"]
```

### 2.3 Dockerfile.local pentru News Server

Creează fișierul `microservices/news-server/Dockerfile.local`:

```dockerfile
# Dockerfile.local - News Server
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3200

# Start server
CMD ["npm", "start"]
```

### 2.4 Dockerfile.local pentru Chat Server

Creează fișierul `microservices/chat-server/Dockerfile.local`:

```dockerfile
# Dockerfile.local - Chat Server
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3300

# Start server
CMD ["npm", "start"]
```

### 2.5 Dockerfile.local pentru Economy Server

Creează fișierul `microservices/economy-server/Dockerfile.local`:

```dockerfile
# Dockerfile.local - Economy Server
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3400

# Start server
CMD ["npm", "start"]
```

---

## 🔄 PASUL 3: Workflow Complet

### 3.1 Pornire Sandbox Local

**Opțiunea A: Cu script automat (recomandat)**

```powershell
# În PowerShell sau CMD
.\scripts\local-start.cmd
```

**Opțiunea B: Cu Docker Compose direct**

```powershell
# Pornește toate serviciile
docker compose -f docker-compose.local.yml up -d

# Verifică că toate sunt pornite
docker ps

# Vezi loguri
docker compose -f docker-compose.local.yml logs -f
```

### 3.2 Accesare Servicii

După pornire, accesează:

| Serviciu | URL | Descriere |
|----------|-----|-----------|
| Main App | http://localhost:3000 | Aplicația principală |
| Auth Server | http://localhost:3100/health | Serviciu autentificare |
| News Server | http://localhost:3200/health | Serviciu știri |
| Chat Server | http://localhost:3300/health | Serviciu chat |
| Economy Server | http://localhost:3400/health | Serviciu economie |
| MongoDB | localhost:27017 | Baza de date |
| Qdrant | http://localhost:6333/dashboard | Vector DB pentru Kilo AI |

### 3.3 Testare Locală

```powershell
# Rulează toate testele
.\scripts\local-test.cmd

# Sau manual
curl http://localhost:3000
curl http://localhost:3100/health
curl http://localhost:3400/health
```

---

## 📤 PASUL 4: Deploy pe GitHub

### 4.1 Configurare Git (prima dată)

```powershell
# Configurează Git cu datele tale
git config --global user.name "Numele Tău"
git config --global user.email "email@tau.com"

# Verifică remote-ul
git remote -v
```

### 4.2 Commit și Push

```powershell
# Vezi ce s-a modificat
git status

# Adaugă toate fișierele
git add .

# Commit cu mesaj descriptiv
git commit -m "feat: add local sandbox Dockerfile.local files"

# Push pe GitHub
git push origin main
```

---

## 🚀 PASUL 5: Deploy pe Production Server

### 5.1 Cu Script Automat

```powershell
.\scripts\local-deploy.cmd "Deploy message here"
```

### 5.2 Manual (dacă preferi)

```powershell
# 1. Testează local
.\scripts\local-test.cmd

# 2. Commit și push
git add .
git commit -m "Your message"
git push origin main

# 3. SSH pe server și deploy
ssh root@ovidiuguru.online
cd /root/MERN-template
git pull origin main
docker compose down
docker compose up -d --build
```

---

## 🧪 PASUL 6: Testare pe Production

### 6.1 Verificare Health

```powershell
# Testează production
curl https://ovidiuguru.online
curl https://ovidiuguru.online/api/economy/health
```

### 6.2 Testare Completă

```powershell
# Rulează scriptul de test production
.\test-production-admin.sh
```

---

## 🔧 PASUL 7: Configurare Kilo AI

### 7.1 Adaugă API Key

1. Deschide `.vscode/settings.json`
2. Înlocuiește `your-openai-api-key-here` cu cheia ta OpenAI

```json
{
  "kilo.codebaseIndexing.openai.apiKey": "sk-actual-key-here"
}
```

### 7.2 Indexare Codebase

1. Deschide VS Code
2. Apasă `Ctrl+Shift+P`
3. Scrie "Kilo: Index Codebase"
4. Așteaptă 2-5 minute

### 7.3 Utilizare Kilo AI

Exemple de prompturi:

```
Verifică că Docker rulează local și deschide browser la localhost:3000
```

```
Adaugă un buton nou pe dashboard care să afișeze balanța utilizatorului
```

```
Testează login-ul local, găsește probleme și fixează-le
```

---

## 📊 ARHITECTURA COMPLETĂ

```
┌─────────────────────────────────────────────────────────────────┐
│                    WINDOWS 11 LOCAL SANDBOX                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   VS Code    │  │   Kilo AI    │  │    Git       │          │
│  │   (Editor)   │  │   (Assistant)│  │  (Versioning)│          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Docker Desktop                         │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐        │   │
│  │  │  App    │ │  Auth   │ │  News   │ │  Chat   │        │   │
│  │  │  :3000  │ │  :3100  │ │  :3200  │ │  :3300  │        │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘        │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐                    │   │
│  │  │ Economy │ │ MongoDB │ │ Qdrant  │                    │   │
│  │  │  :3400  │ │  :27017 │ │  :6333  │                    │   │
│  │  └─────────┘ └─────────┘ └─────────┘                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ git push
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         GITHUB                                   │
│              https://github.com/ZavoZZ/alpha-testing-game        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ SSH deploy
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PRODUCTION SERVER                             │
│                   ovidiuguru.online                              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐               │
│  │  App    │ │  Auth   │ │ Economy │ │ MongoDB │               │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🐛 TROUBLESHOOTING

### Problema: Docker nu pornește

```powershell
# Verifică status Docker
docker info

# Repornește Docker Desktop
# Sau în PowerShell ca Administrator:
Restart-Service docker
```

### Problema: Port deja folosit

```powershell
# Găsește procesul care folosește portul
netstat -ano | findstr :3000

# Omoară procesul (înlocuiește PID)
taskkill /PID <PID> /F
```

### Problema: MongoDB nu conectează

```powershell
# Verifică containerul
docker ps | findstr mongodb

# Repornește MongoDB
docker compose -f docker-compose.local.yml restart mongodb

# Vezi loguri
docker logs mern-mongodb-local --tail 50
```

### Problema: Git push eșuează

```powershell
# Pull mai întâi
git pull origin main --rebase

# Rezolvă conflicte dacă există
git status
# Editează fișierele cu conflicte
git add .
git rebase --continue

# Push din nou
git push origin main
```

---

## ✅ CHECKLIST FINAL

### Înainte de a începe:
- [ ] Docker Desktop instalat și pornit
- [ ] Node.js v18+ instalat
- [ ] Git instalat și configurat
- [ ] VS Code instalat

### Setup Sandbox:
- [ ] Dockerfile.local creat în rădăcina proiectului
- [ ] Dockerfile.local creat în microservices/auth-server/
- [ ] Dockerfile.local creat în microservices/news-server/
- [ ] Dockerfile.local creat în microservices/chat-server/
- [ ] Dockerfile.local creat în microservices/economy-server/

### Testare:
- [ ] `docker compose -f docker-compose.local.yml up -d` funcționează
- [ ] http://localhost:3000 se încarcă
- [ ] Toate health endpoints răspund

### Workflow:
- [ ] Poți face modificări local
- [ ] Poți testa local
- [ ] Poți face push pe GitHub
- [ ] Poți face deploy pe production

---

## 📞 URMĂTORII PAȘI

După ce termini setup-ul:

1. **Spune-mi când ești gata** și voi crea fișierele Dockerfile.local pentru tine
2. **Testează** că totul funcționează local
3. **Începe dezvoltarea** cu Kilo AI ca asistent

---

**Status:** 📋 Plan Complet  
**Următoare acțiune:** Creare Dockerfile.local files (necesită Code mode)
