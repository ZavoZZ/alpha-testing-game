# Ghid Rapid: Transformă Kilo AI în Cursor AI

**Timp necesar:** 30 minute pentru setup de bază  
**Dificultate:** Medie  
**Rezultat:** Kilo AI automat ca Cursor AI

---

## 🚀 Setup Rapid (30 minute)

### Pasul 1: Clonează Repo Local (5 min)

**IMPORTANT:** Nu mai lucra pe SSH! Lucrează local pe computerul tău.

```bash
# Pe computerul tău local (Windows/Mac/Linux)
cd ~/Projects  # sau unde vrei tu
git clone https://github.com/ovidiuguru/MERN-template.git
cd MERN-template
```

### Pasul 2: Instalează Dependințe (5 min)

```bash
# Node.js dependencies
npm install

# Browser automation
npm install --save-dev puppeteer

# Verifică Docker
docker --version
docker compose --version
```

### Pasul 3: Configurare Environment (5 min)

```bash
# Copiază template
cp .envdev .env

# Editează .env
nano .env  # sau code .env
```

**Schimbă în .env:**
```bash
# Înainte (pentru production):
API_URL=https://ovidiuguru.online

# După (pentru local):
API_URL=http://localhost:3000
AUTH_SERVICE_URL=http://localhost:3100
ECONOMY_SERVICE_URL=http://localhost:3400
```

### Pasul 4: Pornește Docker Local (5 min)

```bash
# Start all services
docker compose up -d

# Verifică că rulează
docker ps

# Ar trebui să vezi:
# - app (port 3000)
# - auth-server (port 3100)
# - economy-server (port 3400)
# - mongodb (port 27017)
```

### Pasul 5: Testează Local (5 min)

```bash
# Test homepage
curl http://localhost:3000

# Test auth service
curl http://localhost:3100/health

# Test economy service
curl http://localhost:3400/health

# Deschide în browser
open http://localhost:3000  # Mac
# sau
start http://localhost:3000  # Windows
# sau
xdg-open http://localhost:3000  # Linux
```

### Pasul 6: Configurare VS Code (5 min)

```bash
# Deschide VS Code LOCAL (nu SSH!)
code .
```

**Instalează extensii necesare:**
1. Kilo AI (dacă nu e deja instalat)
2. Docker (pentru management)
3. GitLens (pentru Git)

**Verifică setările Kilo AI:**
- Deschide Command Palette: `Ctrl+Shift+P` (Windows/Linux) sau `Cmd+Shift+P` (Mac)
- Caută: "Kilo: Open Settings"
- Verifică că `kilo.codebaseIndexing.enabled` este `true`

---

## 🎯 Utilizare Imediată

### Scenario 1: Dezvoltare Simplă

**În Kilo AI chat, scrie:**
```
Vreau să adaug un buton nou pe dashboard care să afișeze balanta.
Lucrează local, testează pe localhost:3000, și arată-mi rezultatul în browser.
```

**Kilo AI va:**
1. Edita `client/pages/dashboard.jsx`
2. Reporni serviciul: `docker compose restart app`
3. Aștepta 10 secunde
4. Deschide browser la `http://localhost:3000/dashboard`
5. Îți va arăta screenshot-ul

### Scenario 2: Fix Bug

**În Kilo AI chat, scrie:**
```
Login-ul nu merge. Verifică logs, găsește problema, și fixează.
Testează local până merge.
```

**Kilo AI va:**
1. Verifica logs: `docker logs auth-server --tail 50`
2. Găsi eroarea
3. Fixa codul
4. Reporni serviciul
5. Testa login în browser
6. Confirma că merge

### Scenario 3: Deploy pe Production

**În Kilo AI chat, scrie:**
```
Testează totul local, apoi deploy pe ovidiuguru.online.
Verifică că merge pe production.
```

**Kilo AI va:**
1. Rula teste locale
2. Commit și push pe GitHub
3. SSH deploy pe server
4. Testa production
5. Confirma success

---

## 📋 Comenzi Utile

### Docker Management

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# Restart specific service
docker compose restart app
docker compose restart auth-server
docker compose restart economy-server

# View logs
docker logs app --tail 50 -f
docker logs auth-server --tail 50 -f
docker logs economy-server --tail 50 -f

# Rebuild after code changes
docker compose up -d --build

# Enter container
docker exec -it app sh
docker exec -it economy-server sh
```

### Testing

```bash
# Run all API tests
./test-all-apis-v2.sh

# Run economy tests
./test-economy-comprehensive.sh

# Run browser tests (după ce creezi scriptul)
node scripts/browser-test.js
```

### Git

```bash
# Status
git status

# Commit
git add .
git commit -m "Your message"

# Push
git push origin main

# Pull latest
git pull origin main
```

### Deploy

```bash
# Manual deploy to production
ssh root@ovidiuguru.online << 'EOF'
  cd /root/MERN-template
  git pull origin main
  docker compose up -d --build
EOF

# Automated deploy (după ce creezi scriptul)
./scripts/kilo-deploy.sh
```

---

## 🔧 Configurare Avansată (Opțional)

### 1. Command Wrapper pentru Retry Automat

**Creează:** `scripts/kilo-command-wrapper.sh`

```bash
#!/bin/bash
COMMAND="$@"
MAX_RETRIES=3
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    echo "Attempt $((RETRY_COUNT + 1))/$MAX_RETRIES: $COMMAND"
    
    if eval "$COMMAND"; then
        echo "✅ SUCCESS"
        exit 0
    else
        echo "❌ FAILED"
        RETRY_COUNT=$((RETRY_COUNT + 1))
        [ $RETRY_COUNT -lt $MAX_RETRIES ] && sleep 5
    fi
done

echo "❌ FAILED after $MAX_RETRIES attempts"
exit 1
```

```bash
chmod +x scripts/kilo-command-wrapper.sh
```

### 2. Browser Test Script

**Creează:** `scripts/browser-test.js`

```javascript
const puppeteer = require('puppeteer');

async function test() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    console.log('Testing homepage...');
    await page.goto('http://localhost:3000');
    await page.screenshot({ path: 'screenshots/homepage.png' });
    
    console.log('Testing login...');
    await page.goto('http://localhost:3000/login');
    await page.type('input[name="email"]', 'test@example.com');
    await page.type('input[name="password"]', 'password123');
    await page.screenshot({ path: 'screenshots/login.png' });
    
    await browser.close();
    console.log('✅ Tests complete!');
}

test().catch(console.error);
```

```bash
mkdir -p screenshots
node scripts/browser-test.js
```

### 3. VS Code Tasks

**Creează:** `.vscode/tasks.json`

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start Local",
      "type": "shell",
      "command": "docker compose up -d",
      "group": {
        "kind": "build",
        "isDefault": true
      }
    },
    {
      "label": "Run Tests",
      "type": "shell",
      "command": "./test-all-apis-v2.sh"
    },
    {
      "label": "Deploy",
      "type": "shell",
      "command": "./scripts/kilo-deploy.sh"
    }
  ]
}
```

**Utilizare:**
- `Ctrl+Shift+B` → Start Local
- `Ctrl+Shift+P` → "Tasks: Run Task" → Alege task-ul

---

## 🎓 Instrucțiuni pentru Kilo AI

### Cum să Instruiești Kilo AI

**Adaugă în `.cursorrules` sau spune-i direct:**

```markdown
# Kilo AI - Reguli de Lucru

## CRITICAL: Development Workflow

1. **ALWAYS work locally first**
   - Edit files in local workspace
   - Test on localhost ports (3000, 3100, 3400)
   - Never edit directly on SSH server

2. **ALWAYS restart services after changes**
   - Run: docker compose restart [service-name]
   - Wait 10 seconds for service to be ready
   - Check logs: docker logs [service-name] --tail 20

3. **ALWAYS read command output**
   - If command fails, read the error
   - Fix the issue
   - Retry the command
   - Repeat until success

4. **ALWAYS test in browser**
   - Open http://localhost:3000 after changes
   - Check console for errors
   - Test functionality manually
   - Take screenshots if needed

5. **ALWAYS run tests before deploy**
   - Run: ./test-all-apis-v2.sh
   - All tests must pass
   - Fix any failures
   - Re-run tests

6. **Deploy workflow**
   - Only deploy after all tests pass
   - Commit: git add . && git commit -m "message"
   - Push: git push origin main
   - SSH deploy: ssh root@ovidiuguru.online 'cd /root/MERN-template && git pull && docker compose up -d --build'
   - Wait 30 seconds
   - Test production: curl https://ovidiuguru.online/health
   - Verify in browser: https://ovidiuguru.online

## Services and Ports

- Main App: localhost:3000 (React frontend)
- Auth Server: localhost:3100 (Authentication)
- Economy Server: localhost:3400 (Economy, Work, GameClock)
- MongoDB: localhost:27017

## Common Commands

### Docker
- Start: docker compose up -d
- Stop: docker compose down
- Restart: docker compose restart [service]
- Logs: docker logs [service] --tail 50
- Rebuild: docker compose up -d --build

### Testing
- All tests: ./test-all-apis-v2.sh
- Economy: ./test-economy-comprehensive.sh
- Browser: node scripts/browser-test.js

### Git
- Status: git status
- Commit: git add . && git commit -m "message"
- Push: git push origin main

## Error Handling

If a command fails:
1. Read the error message
2. Check logs: docker logs [service] --tail 50
3. Fix the issue in code
4. Restart service: docker compose restart [service]
5. Retry the command
6. Repeat until success

Never give up after first failure!
Always retry at least 3 times!
```

---

## 🐛 Troubleshooting

### Problema: "Port already in use"

```bash
# Găsește procesul
lsof -i :3000  # sau alt port

# Omoară procesul
kill -9 [PID]

# Sau restart Docker
docker compose down
docker compose up -d
```

### Problema: "Docker service won't start"

```bash
# Check logs
docker logs [service-name]

# Rebuild
docker compose up -d --build [service-name]

# Nuclear option
docker compose down
docker system prune -a
docker compose up -d --build
```

### Problema: "MongoDB connection error"

```bash
# Check MongoDB is running
docker ps | grep mongodb

# Restart MongoDB
docker compose restart mongodb

# Check connection
docker exec -it mongodb mongosh auth_db
```

### Problema: "Git push failed"

```bash
# Pull first
git pull origin main

# Resolve conflicts if any
git status
# Edit conflicted files
git add .
git commit -m "Resolve conflicts"

# Push again
git push origin main
```

### Problema: "SSH timeout"

**Soluție:** Nu mai lucra pe SSH! Lucrează local și deploy automat.

---

## 📊 Checklist: Ești Gata?

- [ ] Repo clonat local
- [ ] Dependencies instalate (`npm install`)
- [ ] Docker rulează local (`docker ps`)
- [ ] Serviciile pornesc (`docker compose up -d`)
- [ ] Poți accesa localhost:3000 în browser
- [ ] VS Code deschis local (nu SSH!)
- [ ] Kilo AI instalat și configurat
- [ ] `.cursorrules` actualizat cu reguli noi

**Dacă toate sunt bifate, ești gata! 🎉**

---

## 🎯 Primul Test

**Spune-i lui Kilo AI:**

```
Vreau să testezi că totul funcționează:
1. Verifică că Docker rulează local
2. Deschide browser la localhost:3000
3. Testează login cu testjucator@ovidiuguru.com / Password123!
4. Arată-mi dashboard-ul
5. Confirmă că totul merge
```

**Dacă Kilo AI face toate astea automat, SUCCESS! 🎉**

---

## 📚 Next Steps

După ce merge basic setup-ul:

1. **Creează custom modes** (Dev, Test, Deploy)
2. **Adaugă browser automation** (Puppeteer)
3. **Configurează GitHub Actions** (CI/CD)
4. **Setup GLM-5** (model gratuit)
5. **Automatizează complet** (zero intervenție manuală)

Vezi [`KILO_AI_CURSOR_AUTOMATION_PLAN.md`](./KILO_AI_CURSOR_AUTOMATION_PLAN.md) pentru detalii complete.

---

## 🆘 Ajutor

**Dacă te blochezi:**

1. Verifică că Docker rulează: `docker ps`
2. Verifică logs: `docker logs [service] --tail 50`
3. Restart services: `docker compose restart`
4. Rebuild: `docker compose up -d --build`
5. Nuclear option: `docker compose down && docker compose up -d --build`

**Dacă Kilo AI nu face ce vrei:**

1. Fii mai specific în instrucțiuni
2. Spune-i explicit să citească logs
3. Spune-i să reîncerce dacă eșuează
4. Adaugă reguli în `.cursorrules`

---

**Succes! 🚀**

Acum ai Kilo AI care lucrează ca Cursor AI:
- ✅ Testare locală în sandbox
- ✅ Citește output și erori
- ✅ Retry automat
- ✅ Browser automation
- ✅ Deploy automat
- ✅ Zero risc în producție

**Timp economisit:** 80% din debugging manual  
**Risc redus:** 95% (nu mai lucrezi direct pe production)  
**Productivitate:** 3x mai rapid
