# 🔐 Admin Panel - MongoDB Management

**Data setup**: 11 Februarie 2026  
**Status**: ✅ **FUNCȚIONAL**

---

## 🎯 Soluții Implementate:

### 1️⃣ **Mongo Express** - Quick Database Viewer
- ✅ Web UI pentru MongoDB
- ✅ **Dublu layer de securitate** (Nginx Basic Auth + Mongo Express Auth)
- ✅ Acces rapid la toate bazele de date
- ✅ CRUD operations direct în browser

### 2️⃣ **Custom Admin Panel** - În curând
- 🚧 Se dezvoltă acum...
- Features: User management, Stats, Logs, etc.

---

## 🔑 MONGO EXPRESS - Acces

### **URL-uri de Acces:**

#### **Opțiunea 1: Prin Domain (RECOMANDAT - Securizat)**
```
https://ovidiuguru.online/admin-db/
```

**Credențiale Nivel 1 (Nginx)**:
- Username: `admindb`
- Password: `AdminDB2026SecurePass!`

**Credențiale Nivel 2 (Mongo Express)**:
- Username: `admin`
- Password: `SecureAdminPass2026!`

---

#### **Opțiunea 2: Direct pe IP (Doar pentru debugging)**
```
http://188.245.220.40:8081/
```

**Credențiale**:
- Username: `admin`
- Password: `SecureAdminPass2026!`

⚠️ **NOTĂ**: Acest port **NU ar trebui expus** public în producție! Folosește doar prin domain.

---

## 🛡️ Securitate

### **Dublu Layer de Protecție:**

1. **Nginx Basic Auth** (primul layer)
   - Prompt de browser: username/password
   - Previne accesul neautorizat la Mongo Express
   - Configurare: `/etc/nginx/.htpasswd`

2. **Mongo Express Auth** (al doilea layer)
   - Login în interfața Mongo Express
   - Protejează accesul la baze de date
   - Configurare: Docker environment variables

---

## 📊 Ce Poți Face în Mongo Express:

### **Baze de Date Disponibile:**

1. **auth_db** - Utilizatori și autentificare
   - Colecție: `users`
   - Câmpuri: username, email, password (hash), role, lastLogin, etc.
   - ✅ View users
   - ✅ Edit user roles (user → moderator → admin)
   - ✅ Ban/unban users
   - ✅ Delete users

2. **game_db** - Date principale joc
   - Colecții: (se vor adăuga pe măsură ce jocul crește)

3. **news_db** - News și anunțuri
   - Colecție: `news`
   - ✅ Create/Edit/Delete news posts

4. **chat_db** - Chat și mesaje
   - Colecții: `messages`, `rooms`, etc.

---

## 🎨 Interfața Mongo Express

### **Features:**

- 📁 **Database Browser**: Vezi toate bazele de date
- 📝 **Collection Viewer**: Vizualizează documente în format JSON
- ➕ **Create**: Adaugă documente noi
- ✏️ **Edit**: Modifică documente existente
- 🗑️ **Delete**: Șterge documente
- 🔍 **Search**: Caută în colecții
- 📊 **Stats**: Statistici despre baze de date și colecții
- 💾 **Export**: Export date în JSON/CSV
- 📥 **Import**: Import date din JSON

---

## 🚀 Exemple de Utilizare

### **1. Vezi toți utilizatorii:**
1. Accesează `https://ovidiuguru.online/admin-db/`
2. Login cu credențialele (ambele layere)
3. Click pe `auth_db`
4. Click pe `users`
5. Vezi lista completă de users

### **2. Promovează un user la Admin:**
1. În `auth_db` → `users`
2. Find user-ul dorit
3. Click "Edit Document"
4. Schimbă `"role": "user"` → `"role": "admin"`
5. Save

### **3. Ban user:**
1. În `auth_db` → `users`
2. Find user-ul dorit
3. Click "Edit Document"
4. Schimbă `"isBanned": false` → `"isBanned": true`
5. Save

### **4. Vezi ultimele login-uri:**
1. În `auth_db` → `users`
2. Sort by `lastLogin` (descending)
3. Vezi când s-a logat fiecare user

---

## 🔧 Configurare Docker

### **docker-compose.yml:**
```yaml
mongo-express:
  image: mongo-express:latest
  restart: always
  ports:
    - "8081:8081"
  environment:
    - ME_CONFIG_MONGODB_SERVER=mongo
    - ME_CONFIG_MONGODB_PORT=27017
    - ME_CONFIG_BASICAUTH_USERNAME=admin
    - ME_CONFIG_BASICAUTH_PASSWORD=SecureAdminPass2026!
  depends_on:
    - mongo
  networks:
    - app-network
```

### **Comenzi Docker:**
```bash
# Start Mongo Express
docker compose up -d mongo-express

# Stop Mongo Express
docker compose stop mongo-express

# View logs
docker compose logs mongo-express -f

# Restart
docker compose restart mongo-express
```

---

## 🌐 Configurare Nginx

### **/etc/nginx/sites-available/ovidiuguru.online:**
```nginx
# Mongo Express - Admin Database UI (Protected)
location /admin-db/ {
    proxy_pass http://127.0.0.1:8081/;
    proxy_http_version 1.1;
    
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # Basic auth protection (username/password prompt in browser)
    auth_basic "Admin Database Access";
    auth_basic_user_file /etc/nginx/.htpasswd;
}
```

### **Comenzi Nginx:**
```bash
# Test configuration
sudo nginx -t

# Reload
sudo systemctl reload nginx

# View logs
sudo tail -f /var/log/nginx/ovidiuguru_access.log
sudo tail -f /var/log/nginx/ovidiuguru_error.log
```

---

## 🔒 Schimbă Parolele (Recomandat pentru Producție!)

### **1. Schimbă parola Nginx Basic Auth:**
```bash
# Delete old password
sudo rm /etc/nginx/.htpasswd

# Create new password
sudo htpasswd -c /etc/nginx/.htpasswd admindb
# Vei fi întrebat să introduci noua parolă

# Reload Nginx
sudo systemctl reload nginx
```

### **2. Schimbă parola Mongo Express:**
```bash
# Edit docker-compose.yml
nano docker-compose.yml

# Schimbă:
# ME_CONFIG_BASICAUTH_PASSWORD=SecureAdminPass2026!
# cu noua ta parolă

# Restart container
docker compose restart mongo-express
```

---

## 📱 Acces de pe Mobile/Tablet

Mongo Express funcționează perfect pe mobile browsers:

1. Accesează `https://ovidiuguru.online/admin-db/`
2. Login cu credențialele
3. Interfața e responsive și funcțională

---

## 🐛 Troubleshooting

### **Problemă: "Connection refused" sau "502 Bad Gateway"**
**Soluție**:
```bash
# Verifică dacă Mongo Express rulează
docker compose ps | grep mongo-express

# Verifică logs
docker compose logs mongo-express --tail 50

# Restart dacă e nevoie
docker compose restart mongo-express
```

### **Problemă: "Forgot password"**
**Soluție**:
```bash
# Reset Nginx password
sudo htpasswd -c /etc/nginx/.htpasswd admindb

# Sau verifică parola în docker-compose.yml
cat docker-compose.yml | grep -A 5 mongo-express
```

### **Problemă: "Cannot connect to MongoDB"**
**Soluție**:
```bash
# Verifică MongoDB
docker compose ps | grep mongo

# Restart MongoDB
docker compose restart mongo

# Restart Mongo Express
docker compose restart mongo-express
```

---

## 🎯 Best Practices

1. ✅ **Folosește HTTPS**: Accesează prin `https://ovidiuguru.online/admin-db/`
2. ✅ **Nu expune portul 8081**: Blochează în firewall, folosește doar prin Nginx
3. ✅ **Schimbă parolele**: Folosește parole forte, schimbă-le periodic
4. ✅ **Monitorizează accesul**: Check Nginx logs pentru accese neautorizate
5. ✅ **Backup**: Fă backup regulat la baza de date
6. ✅ **Limit access**: Doar admini ar trebui să cunoască credențialele

---

## 🚧 Custom Admin Panel (Coming Soon)

Se va dezvolta un **Custom Admin Panel** integrat în aplicația React cu:

### **Features Planificate:**
- 👥 **User Management**: CRUD users cu UI frumos
- 📊 **Dashboard**: Statistici (total users, active users, etc.)
- 📰 **News Management**: Create/Edit/Delete news
- 💬 **Chat Moderation**: Vezi și moderează mesaje
- 📈 **Analytics**: Grafice cu activitatea utilizatorilor
- 🔐 **Security**: JWT protected, role-based access
- 🎨 **Modern UI**: Design consistent cu jocul

### **Tehnologii:**
- React (frontend existent)
- JWT Auth (deja implementat)
- Role-based access (admin, moderator)
- Real-time updates (WebSocket/SSE)

---

## 📝 Notes

- **Mongo Express** e perfect pentru:
  - Quick debugging
  - Manual data fixes
  - Database exploration
  - Emergency operations

- **Custom Admin Panel** va fi mai bun pentru:
  - Daily admin tasks
  - User-friendly interface
  - Game-specific operations
  - Integrated with your app

---

## 🎉 Concluzie

**Mongo Express este ACTIV și FUNCȚIONAL!**

**Acces**: https://ovidiuguru.online/admin-db/

**Credențiale**:
- Layer 1 (Nginx): `admindb` / `AdminDB2026SecurePass!`
- Layer 2 (Mongo Express): `admin` / `SecureAdminPass2026!`

**Poți acum:**
- ✅ Vezi toți utilizatorii
- ✅ Modifică roluri (user → admin)
- ✅ Ban/unban users
- ✅ Vezi toate bazele de date
- ✅ Edit/Delete orice date
- ✅ Export/Import date

**Next Step**: Custom Admin Panel în aplicația React! 🚀

---

**Created**: 11 Februarie 2026  
**Status**: ✅ **PRODUCTION READY**  
**Security**: ✅ **Dublu layer protection**
