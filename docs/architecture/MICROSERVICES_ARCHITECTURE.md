# Arhitectură Microservicii - Test Joc

## 📋 Prezentare Generală

Aplicația este acum construită pe o arhitectură de microservicii scalabilă, perfectă pentru un joc browser cu mulți jucători simultani.

## 🏗️ Servicii

### 1. **Main App** (Port: 3000)
- **Scop**: Frontend (React) + Game Logic + Password Protection
- **Database**: `mongodb://mongo:27017/game_db`
- **Responsabilități**:
  - Servire frontend (React)
  - Game password protection (`testjoc`)
  - Logica principală a jocului
  - Coordonarea între microservicii

### 2. **Auth Server** (Port: 3200)
- **Scop**: Autentificare și Gestionare Utilizatori
- **Database**: `mongodb://mongo:27017/auth_db`
- **Responsabilități**:
  - Sign up (`POST /auth/signup`)
  - Login (`POST /auth/login`)
  - Password recovery (`POST /auth/recover`)
  - Token refresh (`POST /auth/refresh`)
  - Logout (`POST /auth/logout`)
  - Token verification (`GET /auth/verify`)
- **Tehnologii**: JWT (Access + Refresh tokens), bcrypt, HttpOnly cookies

### 3. **News Server** (Port: 3100)
- **Scop**: Gestionare Articole și Știri
- **Database**: `mongodb://mongo:27017/news_db`
- **Responsabilități**:
  - Lista articole (`GET /news`)
  - Articol individual (`GET /news/:id`)
  - Creare articol (`POST /news`)
  - Update articol (`PUT /news/:id`)
  - Ștergere articol (`DELETE /news/:id`)
- **Features**: Paginare, filtrare după status (published)

### 4. **Chat Server** (Port: 3300)
- **Scop**: Chat Real-time și Messaging
- **Database**: `mongodb://mongo:27017/chat_db`
- **Responsabilități**:
  - Chat real-time (Socket.IO)
  - Istoric mesaje (`GET /chat/history`)
  - Room-based chat (global, game rooms, etc.)
  - Ștergere istoric (`DELETE /chat/clear`)
- **Tehnologii**: Socket.IO pentru WebSocket communication

### 5. **MongoDB** (Port: 27017)
- Database partajat cu database-uri separate pentru fiecare serviciu
- **Databases**:
  - `game_db` - Main application data
  - `auth_db` - Users și authentication
  - `news_db` - Articles și news
  - `chat_db` - Messages și chat history

## 🔌 Comunicare între Servicii

### Din Browser → Main App → Microservicii

```
Browser (http://188.245.220.40:3000)
    ↓
Main App (Frontend)
    ↓ fetch(AUTH_URI + '/auth/login')
Auth Server (http://auth-server:3200)
    ↓
Returns JWT Token
    ↓
Browser stores token
    ↓ fetch(NEWS_URI + '/news', { headers: { Authorization: 'Bearer ' + token }})
News Server (http://news-server:3100)
```

### Environment Variables

**Main App (`docker-compose.yml`)**:
```env
AUTH_URI=http://auth-server:3200
NEWS_URI=http://news-server:3100
CHAT_URI=http://chat-server:3300
```

**Pentru Development Local (`.envdev`)**:
```env
AUTH_URI=http://localhost:3200
NEWS_URI=http://localhost:3100
CHAT_URI=http://localhost:3300
```

## 🚀 Pornire și Deployment

### Docker Compose

```bash
# Pornește toate serviciile
docker compose up -d

# Rebuild complet
docker compose down -v
docker compose up --build -d

# Vezi logs pentru toate serviciile
docker compose logs -f

# Vezi logs pentru un serviciu specific
docker compose logs -f auth-server
docker compose logs -f news-server
docker compose logs -f chat-server
docker compose logs -f app
```

### Health Checks

Fiecare microserviciu are un endpoint `/health`:

```bash
curl http://localhost:3200/health  # Auth
curl http://localhost:3100/health  # News
curl http://localhost:3300/health  # Chat
```

## 📊 Fluxul de Autentificare

1. **Sign Up**:
   ```bash
   curl -X POST http://localhost:3200/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"username":"player1","email":"player@test.com","password":"pass12345"}'
   ```

2. **Login**:
   ```bash
   curl -X POST http://localhost:3200/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"player@test.com","password":"pass12345"}' \
     -c cookies.txt
   ```
   → Returns JWT access token + Sets HttpOnly refresh token cookie

3. **Folosire Token**:
   ```bash
   curl http://localhost:3100/news \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

4. **Refresh Token**:
   ```bash
   curl -X POST http://localhost:3200/auth/refresh \
     -b cookies.txt
   ```
   → Returns new access token

## 🔐 Securitate

### JWT Tokens
- **Access Token**: Valabilitate 1 oră, trimis în răspuns
- **Refresh Token**: Valabilitate 7 zile, HttpOnly cookie
- **Secrets**: Configurate în `docker-compose.yml` (schimbă în producție!)

### Password Protection
- Game access password: `testjoc`
- Session persistence prin cookies
- Separate de user authentication

### CORS
- Configurat pentru `WEB_ORIGIN=*` în development
- În producție, setează domeniul specific

## 📈 Scalare

### Horizontal Scaling

Fiecare microserviciu poate fi scalat independent:

```bash
# Scalează auth-server la 3 instanțe
docker compose up -d --scale auth-server=3

# Scalează news-server la 2 instanțe
docker compose up -d --scale news-server=2

# Scalează chat-server la 4 instanțe pentru mulți jucători
docker compose up -d --scale chat-server=4
```

### Load Balancing

Pentru producție, adaugă un reverse proxy (nginx/traefik):

```
                    Nginx Load Balancer
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
   Auth-Server-1    Auth-Server-2    Auth-Server-3
   News-Server-1    News-Server-2
   Chat-Server-1    Chat-Server-2    Chat-Server-3    Chat-Server-4
```

## 🛠️ Development

### Structura Proiectului

```
MERN-template/
├── microservices/
│   ├── auth-server/
│   │   ├── server.js
│   │   ├── routes/auth.js
│   │   ├── package.json
│   │   └── Dockerfile
│   ├── news-server/
│   │   ├── server.js
│   │   ├── routes/news.js
│   │   ├── package.json
│   │   └── Dockerfile
│   └── chat-server/
│       ├── server.js
│       ├── routes/chat.js
│       ├── package.json
│       └── Dockerfile
├── server/         # Main app backend
├── client/         # React frontend
├── docker-compose.yml
└── .envdev
```

### Adaugă un Nou Microserviciu

1. Creează folder în `microservices/your-service/`
2. Creează `package.json`, `server.js`, `Dockerfile`
3. Adaugă în `docker-compose.yml`:
   ```yaml
   your-service:
     build: ./microservices/your-service
     ports:
       - "YOUR_PORT:YOUR_PORT"
     environment:
       - PORT=YOUR_PORT
       - DB_URI=mongodb://mongo:27017/your_db
     depends_on:
       - mongo
     networks:
       - app-network
   ```
4. Actualizează `AUTH_URI`, `NEWS_URI` în `.envdev` și `docker-compose.yml`

## 🧪 Testing

### Test Auth Flow
```bash
# Sign up
curl -X POST http://localhost:3200/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"testpass123"}'

# Login și salvează cookies
curl -X POST http://localhost:3200/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"testpass123"}' \
  -c /tmp/cookies.txt

# Salvează token-ul
TOKEN=$(curl -s -X POST http://localhost:3200/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"testpass123"}')

# Verifică token
curl http://localhost:3200/auth/verify \
  -H "Authorization: Bearer $TOKEN"
```

### Test News
```bash
# Get news
curl http://localhost:3100/news

# Create article
curl -X POST http://localhost:3100/news \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Article","content":"Content here","author":"Admin"}'
```

### Test Chat
```bash
# Get chat history
curl http://localhost:3300/chat/history

# Socket.IO client pentru real-time testing
# Vezi client/pages/*.jsx pentru implementare
```

## 📝 Notes

- Toate serviciile rulează în același Docker network (`app-network`)
- MongoDB este partajat, dar fiecare serviciu are database-ul său
- Porturile sunt expuse pe host pentru testing și development
- În producție, doar portul 3000 (main app) ar trebui expus public
- Microserviciile comunică între ele prin Docker network DNS (e.g., `http://auth-server:3200`)

## 🔄 Migration de la Monolith

Aplicația a fost migrată de la arhitectură monolitică la microservicii:

**Înainte**:
- Un singur server cu toate rutele
- `AUTH_URI=` și `NEWS_URI=` (empty = local)
- Toate rutele în `server/routes/`

**După**:
- Servicii separate cu databases separate
- `AUTH_URI=http://auth-server:3200`
- `NEWS_URI=http://news-server:3100`
- `CHAT_URI=http://chat-server:3300`
- Fiecare serviciu este independent și scalabil

## 🎯 Avantaje

1. **Scalabilitate**: Fiecare serviciu poate fi scalat independent
2. **Izolare**: Bug într-un serviciu nu afectează celelalte
3. **Deploy Independent**: Poți actualiza un serviciu fără să opreși celelalte
4. **Separare Database**: Fiecare serviciu își gestionează propriile date
5. **Multi-Player Ready**: Perfect pentru jocuri cu mulți jucători simultani
6. **Technology Agnostic**: Fiecare serviciu poate folosi tehnologii diferite
7. **Load Balancing**: Easy să adaugi instanțe multiple pentru fiecare serviciu

---

**Created**: 10 Februarie 2026  
**Version**: 1.0.0  
**Status**: ✅ Operational și testat
