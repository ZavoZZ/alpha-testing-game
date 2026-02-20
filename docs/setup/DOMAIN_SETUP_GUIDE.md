# 🌐 Ghid Configurare Domeniu Namecheap

## 📋 Pasul 1: Configurare DNS la Namecheap

### A. Accesează panoul Namecheap

1. Loghează-te pe [Namecheap.com](https://www.namecheap.com)
2. Mergi la **Domain List** (Lista de domenii)
3. Click pe **Manage** (Administrează) lângă domeniul tău

### B. Configurează DNS Records

1. Găsește secțiunea **Advanced DNS** 
2. Click pe **Advanced DNS**
3. Șterge toate înregistrările DNS existente (dacă sunt)

### C. Adaugă următoarele DNS Records:

#### Record 1: A Record pentru domeniul principal
```
Type: A Record
Host: @
Value: 188.245.220.40
TTL: Automatic (sau 300)
```

#### Record 2: A Record pentru www
```
Type: A Record
Host: www
Value: 188.245.220.40
TTL: Automatic (sau 300)
```

#### Record 3 (Opțional): CNAME pentru subdomenii
```
Type: CNAME Record
Host: *
Value: @
TTL: Automatic (sau 300)
```

### D. Salvează modificările

Click pe **Save All Changes** (Salvează toate modificările)

---

## ⏰ Pasul 2: Timpul de Propagare

**IMPORTANT:** DNS-ul poate dura între **15 minute - 48 ore** pentru a se propaga complet.

### Verifică propagarea DNS:

```bash
# Pe Windows (Command Prompt sau PowerShell)
nslookup taudomeniu.com

# Pe Mac/Linux (Terminal)
dig taudomeniu.com
```

Sau folosește tool-uri online:
- https://dnschecker.org
- https://www.whatsmydns.net

---

## 🔧 Pasul 3: Configurare Server (DEJA FĂCUT)

✅ Serverul este deja configurat să accepte conexiuni de pe orice domeniu!

### Variabile de mediu setate:

```env
# docker-compose.yml
ALLOWED_ORIGINS=* (acceptă orice domeniu pentru testing)
```

### Pentru producție, va trebui să specifici domeniile:

```env
ALLOWED_ORIGINS=https://taudomeniu.com,https://www.taudomeniu.com
```

---

## 🚀 Pasul 4: Testare După Propagare

### A. Test Basic (după ce DNS s-a propagat)

```bash
# Testează că domeniul rezolvă la IP-ul corect
ping taudomeniu.com

# Ar trebui să vezi: 188.245.220.40
```

### B. Test în Browser

```
http://taudomeniu.com:3000
```

**NOTĂ:** Momentan trebuie să folosești portul `:3000` până configurăm reverse proxy.

---

## 🔒 Pasul 5: SSL/HTTPS (Recomandat)

### Opțiune A: Cloudflare (GRATUIT și RECOMANDAT)

**Avantaje:**
- SSL gratuit
- CDN global
- Protecție DDoS
- Cache automat
- Nu trebuie port :3000

**Pași:**

1. Creează cont pe [Cloudflare.com](https://www.cloudflare.com)
2. Adaugă domeniul tău
3. Cloudflare îți va da 2 nameservere, ceva de genul:
   ```
   amy.ns.cloudflare.com
   reza.ns.cloudflare.com
   ```

4. Înapoi pe Namecheap:
   - Mergi la **Domain** → **Manage**
   - Secțiunea **Nameservers**
   - Alege **Custom DNS**
   - Introdu nameserverele de la Cloudflare
   - Salvează

5. Pe Cloudflare:
   - Mergi la **DNS** → **Records**
   - Adaugă:
     ```
     Type: A
     Name: @
     IPv4: 188.245.220.40
     Proxy: ON (portocaliu)
     ```
     ```
     Type: A
     Name: www
     IPv4: 188.245.220.40
     Proxy: ON (portocaliu)
     ```

6. SSL/TLS Settings:
   - Mergi la **SSL/TLS**
   - Mode: **Flexible** (pentru început)
   - Edge Certificates: **Always Use HTTPS**: ON

7. Configure Page Rules (pentru a elimina portul 3000):
   - Mergi la **Rules** → **Page Rules**
   - Create Page Rule:
     ```
     URL: *taudomeniu.com*
     Settings: Forwarding URL (301)
     Destination: https://taudomeniu.com:3000/$1
     ```

### Opțiune B: Let's Encrypt cu Nginx (Mai complicat)

Va necesita:
- Instalare Nginx
- Certbot pentru SSL
- Configurare reverse proxy

---

## 📱 Pasul 6: Update docker-compose.yml (Pentru producție)

După ce ai domeniu și DNS configurat:

```yaml
services:
  app:
    build: .
    ports:
      - "0.0.0.0:3000:3000"
    environment:
      - WEB_PORT=3000
      - DB_URI=mongodb://mongo:27017/game_db
      - SECRET_ACCESS=access
      - GAME_PASSWORD=testjoc
      - ALLOWED_ORIGINS=https://taudomeniu.com,https://www.taudomeniu.com
    depends_on:
      - mongo
    networks:
      - app-network
    restart: unless-stopped
```

Apoi restart:

```bash
docker compose down
docker compose up -d
```

---

## ✅ Checklist Final

### Pentru început (cu port :3000):

- [ ] DNS A Records configurate pe Namecheap
- [ ] DNS propagat (verificat cu dnschecker.org)
- [ ] Test: `http://taudomeniu.com:3000` funcționează
- [ ] Parolă `testjoc` funcționează

### Pentru producție (fără port, cu HTTPS):

- [ ] Cloudflare configurat (RECOMANDAT)
  - [ ] Nameservere schimbate pe Namecheap
  - [ ] A Records pe Cloudflare
  - [ ] SSL/TLS activat (Flexible mode)
  - [ ] Always Use HTTPS: ON
  - [ ] Page rules pentru redirect
- [ ] Test: `https://taudomeniu.com` funcționează
- [ ] ALLOWED_ORIGINS actualizat în docker-compose.yml

---

## 🆘 Troubleshooting

### Probleme DNS

**Problema:** Domeniul nu rezolvă

**Soluție:**
1. Verifică că ai introdus IP-ul corect: `188.245.220.40`
2. Așteaptă propagarea DNS (până la 48h)
3. Șterge cache DNS local:
   ```bash
   # Windows
   ipconfig /flushdns
   
   # Mac
   sudo dscacheutil -flushcache
   
   # Linux
   sudo systemd-resolve --flush-caches
   ```

### Probleme CORS

**Problema:** Browser arată erori CORS

**Soluție:**
1. Adaugă domeniul în `ALLOWED_ORIGINS`
2. Restart server: `docker compose restart app`

### Probleme SSL

**Problema:** Mixed content warnings

**Soluție:**
1. Asigură-te că toate link-urile folosesc `https://`
2. În Cloudflare: SSL/TLS mode = **Full** (nu Flexible)

---

## 📧 Exemplu Complet

Să presupunem că domeniul tău este: **mygame.com**

### 1. Pe Namecheap:
```
DNS Records:
- A Record: @ → 188.245.220.40
- A Record: www → 188.245.220.40
```

### 2. Așteaptă propagare (verifică pe dnschecker.org)

### 3. Testează:
```
http://mygame.com:3000
```

### 4. Pentru HTTPS fără port:
- Configurează Cloudflare (vezi Pasul 5)
- Accesează: `https://mygame.com`

---

## 🎯 Recomandări

### Pentru Testing (ACUM):
✅ Folosește IP + Port: `http://188.245.220.40:3000`
✅ Sau domeniu + Port: `http://taudomeniu.com:3000`

### Pentru Producție (DUPĂ TESTING):
✅ Cloudflare cu SSL
✅ Fără port în URL: `https://taudomeniu.com`
✅ ALLOWED_ORIGINS configurat cu domeniile tale
✅ Parola mai complexă decât `testjoc`

---

## 💡 Tips

1. **Folosește Cloudflare** - Este GRATUIT și îți rezolvă:
   - SSL automat
   - Eliminarea portului :3000
   - CDN global (site mai rapid)
   - Protecție DDoS
   - Cache

2. **Testează treptat:**
   - Pas 1: DNS → testează `http://domeniu.com:3000`
   - Pas 2: Cloudflare → testează `https://domeniu.com`

3. **Backup înainte de schimbări:**
   ```bash
   docker compose down
   # Backup volumes
   docker volume ls
   ```

---

**Serverul tău este gata să primească conexiuni de pe orice domeniu!** 🚀

După ce configurezi DNS-ul pe Namecheap, așteptă propagarea și vei putea accesa jocul de pe domeniul tău! 🎮
