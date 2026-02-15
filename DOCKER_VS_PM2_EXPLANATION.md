# Docker vs PM2 - Ce se întâmplă pe server

## Situația Actuală

### Local (Development):
- ✅ **Docker** este folosit pentru development
- ✅ Există [`docker-compose.yml`](docker-compose.yml) și [`Dockerfile`](Dockerfile)
- ✅ Toate microserviciile au Dockerfile-uri proprii
- ✅ Rulezi cu `docker compose up`

### Pe Server (Production - ovidiuguru.online):
- ❌ **Docker NU este folosit**
- ✅ **PM2** este folosit pentru process management
- ✅ Serviciile rulează direct cu Node.js (fără containere)

## De Ce Această Diferență?

### Motivul: `.gitignore`
```gitignore
# Linia 116-117
Dockerfile
docker-compose.yml
```

**Fișierele Docker sunt IGNORATE de Git** → Nu ajung pe server când faci `git pull`

## Cum Funcționează Deployment-ul Actual

### 1. Local → GitHub:
```bash
git push origin main
# ❌ Dockerfile și docker-compose.yml NU sunt push-ate (sunt în .gitignore)
# ✅ Doar codul sursă este push-at
```

### 2. Server → Pull:
```bash
git pull origin main
# ✅ Primește codul nou
# ❌ NU primește Dockerfile sau docker-compose.yml
```

### 3. Server → Restart:
```bash
pm2 restart all
# ✅ Restartează procesele Node.js direct
# ❌ NU folosește Docker
```

## Arhitectura Actuală pe Server

```
ovidiuguru.online (Production)
├── PM2 Process Manager
│   ├── app (Main Server) - Port 3000
│   ├── auth-server - Port 3200
│   ├── news-server - Port 3100
│   ├── chat-server - Port 3300
│   └── economy-server - Port 3400
└── MongoDB - Port 27017
```

**Toate rulează direct cu Node.js, fără Docker containers**

## Avantaje & Dezavantaje

### PM2 (Actual pe server):
✅ **Avantaje:**
- Mai simplu de configurat
- Mai puține resurse (fără overhead Docker)
- Restart rapid
- Logs centralizate cu `pm2 logs`

❌ **Dezavantaje:**
- Dependențe globale (Node.js, npm trebuie instalate)
- Mai greu de replicat environment-ul
- Fără izolare între servicii

### Docker (Local development):
✅ **Avantaje:**
- Environment consistent (local = production)
- Izolare completă între servicii
- Ușor de scalat
- Portabil

❌ **Dezavantaje:**
- Mai multe resurse
- Mai complex de configurat
- Overhead pentru containere

## Cum Să Migrezi la Docker pe Server (Opțional)

Dacă vrei să folosești Docker și pe server:

### 1. Scoate Docker din `.gitignore`:
```bash
# Editează .gitignore și șterge liniile:
# Dockerfile
# docker-compose.yml
```

### 2. Push Docker files:
```bash
git add Dockerfile docker-compose.yml
git commit -m "feat: Add Docker configuration for production"
git push origin main
```

### 3. Pe server, instalează Docker:
```bash
ssh root@ovidiuguru.online
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

### 4. Modifică deployment script:
```bash
# În loc de:
pm2 restart all

# Folosește:
docker compose down
docker compose up --build -d
```

## Recomandare

### Pentru tine ACUM:
**✅ Păstrează PM2** - funcționează bine, este simplu, și nu ai nevoie de complexitatea Docker în producție

### Când să migrezi la Docker:
- Când ai nevoie de scalare (multiple instanțe)
- Când vrei environment consistent local/production
- Când ai probleme cu dependențe

## Verificare Status Actual

### Pe server (PM2):
```bash
ssh root@ovidiuguru.online "pm2 list"
```

### Local (Docker):
```bash
docker compose ps
```

---

**Concluzie**: Proiectul folosește **Docker local** pentru development și **PM2 pe server** pentru production. Ambele metode sunt valide - Docker este în `.gitignore` pentru că deployment-ul actual nu îl folosește.
