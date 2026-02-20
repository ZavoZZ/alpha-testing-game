# Configurare SSH Tunnel pentru Ollama - Kilo AI Codebase Indexing

## Arhitectura Setup-ului

```
[Mașina ta locală]          [Server Remote]           [VS Code + Kilo AI]
    Ollama:11434    <---->  SSH Tunnel  <---->      Accesează localhost:11434
```

## Pas 1: Verifică Ollama Local

Pe **mașina ta locală**, verifică că Ollama rulează:

```bash
# Verifică dacă Ollama este instalat
ollama --version

# Pornește Ollama (dacă nu rulează deja)
ollama serve

# Testează că funcționează
curl http://localhost:11434/api/tags
```

## Pas 2: Creează SSH Tunnel (Reverse Port Forwarding)

### Opțiunea A: Remote Port Forwarding (Recomandat)

Pe **mașina ta locală**, rulează:

```bash
# Sintaxă generală
ssh -R 11434:localhost:11434 root@<IP_SERVER> -N

# Exemplu concret (înlocuiește cu IP-ul serverului tău)
ssh -R 11434:localhost:11434 root@your-server-ip -N
```

**Explicație:**
- `-R 11434:localhost:11434` = Forward portul 11434 de pe server către localhost:11434 (mașina ta)
- `-N` = Nu executa comenzi, doar tunnel
- Lasă această comandă să ruleze în background

### Opțiunea B: Cu autentificare prin cheie SSH

```bash
ssh -R 11434:localhost:11434 -i ~/.ssh/your_key root@your-server-ip -N
```

### Opțiunea C: Tunnel persistent cu autoreconnect

Creează un script pe **mașina ta locală**:

**Fișier: `ollama-tunnel.sh`**
```bash
#!/bin/bash

SERVER="root@your-server-ip"
LOCAL_PORT=11434
REMOTE_PORT=11434

echo "Starting Ollama SSH tunnel to $SERVER..."

while true; do
    ssh -R ${REMOTE_PORT}:localhost:${LOCAL_PORT} \
        -o ServerAliveInterval=60 \
        -o ServerAliveCountMax=3 \
        -o ExitOnForwardFailure=yes \
        $SERVER -N
    
    echo "Tunnel disconnected. Reconnecting in 5 seconds..."
    sleep 5
done
```

Fă-l executabil și rulează-l:
```bash
chmod +x ollama-tunnel.sh
./ollama-tunnel.sh
```

## Pas 3: Configurează Server-ul pentru Port Forwarding

Pe **server** (`/root/MERN-template`), verifică configurația SSH:

```bash
# Editează configurația SSH
sudo nano /etc/ssh/sshd_config
```

Asigură-te că aceste linii sunt prezente și decomentate:
```
GatewayPorts yes
AllowTcpForwarding yes
```

Restart SSH service:
```bash
sudo systemctl restart sshd
```

## Pas 4: Verifică Tunnel-ul pe Server

Pe **server**, verifică că portul este deschis:

```bash
# Verifică dacă portul 11434 ascultă
netstat -tlnp | grep 11434

# Sau cu ss
ss -tlnp | grep 11434

# Testează conexiunea
curl http://localhost:11434/api/tags
```

## Pas 5: Configurează Kilo AI în VS Code

În VS Code pe **server**, configurează Kilo AI să folosească Ollama:

### Fișier: `.vscode/settings.json`

```json
{
  "kilo.codebaseIndexing.enabled": true,
  "kilo.codebaseIndexing.provider": "ollama",
  "kilo.codebaseIndexing.ollama.url": "http://localhost:11434",
  "kilo.codebaseIndexing.ollama.model": "codellama:7b",
  "kilo.codebaseIndexing.excludePatterns": [
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/*.log",
    "**/package-lock.json"
  ],
  "kilo.codebaseIndexing.includePatterns": [
    "**/*.js",
    "**/*.jsx",
    "**/*.json",
    "**/*.md",
    "**/*.sh"
  ]
}
```

## Pas 6: Instalează Model Ollama (pe mașina locală)

```bash
# Instalează un model pentru code indexing
ollama pull codellama:7b

# Sau un model mai mic/rapid
ollama pull codellama:7b-instruct

# Sau pentru performanță mai bună (dacă ai RAM)
ollama pull codellama:13b

# Verifică modelele instalate
ollama list
```

## Pas 7: Testează Setup-ul Complet

### Pe server:
```bash
# Test 1: Verifică că portul este accesibil
curl http://localhost:11434/api/tags

# Test 2: Testează generare de cod
curl http://localhost:11434/api/generate -d '{
  "model": "codellama:7b",
  "prompt": "Write a hello world function in JavaScript",
  "stream": false
}'
```

### În VS Code:
1. Deschide Command Palette (`Ctrl+Shift+P`)
2. Caută "Kilo: Index Codebase"
3. Selectează directorul `/root/MERN-template`
4. Așteaptă indexarea să se finalizeze

## Troubleshooting

### Problema: "Connection refused" pe server

**Soluție:**
```bash
# Pe mașina locală, verifică că Ollama rulează
curl http://localhost:11434/api/tags

# Verifică că tunnel-ul SSH este activ
ps aux | grep "ssh -R"
```

### Problema: Tunnel se deconectează frecvent

**Soluție:** Folosește opțiunea C cu autoreconnect și adaugă keep-alive:
```bash
ssh -R 11434:localhost:11434 \
    -o ServerAliveInterval=30 \
    -o ServerAliveCountMax=3 \
    root@your-server-ip -N
```

### Problema: "GatewayPorts" nu funcționează

**Soluție:** Verifică permisiunile firewall:
```bash
# Pe server
sudo ufw allow 11434/tcp
# sau
sudo iptables -A INPUT -p tcp --dport 11434 -j ACCEPT
```

### Problema: Ollama consumă prea multă memorie

**Soluție:** Folosește un model mai mic:
```bash
ollama pull codellama:7b-code  # Model optimizat pentru cod
```

## Comenzi Utile

### Monitorizare Tunnel
```bash
# Pe mașina locală - verifică conexiunea SSH
watch -n 5 'ps aux | grep "ssh -R"'

# Pe server - monitorizează traficul
sudo tcpdump -i lo port 11434
```

### Oprire Tunnel
```bash
# Găsește procesul SSH
ps aux | grep "ssh -R"

# Omoară procesul (înlocuiește PID)
kill <PID>
```

## Alternativă: VS Code Remote SSH

Dacă folosești VS Code Remote SSH, tunnel-ul poate fi configurat automat:

**Fișier: `.ssh/config` (pe mașina locală)**
```
Host your-server
    HostName your-server-ip
    User root
    RemoteForward 11434 localhost:11434
    ServerAliveInterval 60
    ServerAliveCountMax 3
```

Apoi conectează-te normal prin VS Code Remote SSH.

## Securitate

⚠️ **Important:** Acest setup expune Ollama doar pe localhost al serverului, NU pe internet.

Pentru securitate suplimentară:
```bash
# Pe server, verifică că portul nu este expus public
sudo netstat -tlnp | grep 11434
# Ar trebui să vezi: 127.0.0.1:11434 (NU 0.0.0.0:11434)
```

## Performanță

Pentru indexing optim al proiectului MERN:
- **Model recomandat:** `codellama:7b` (balans între viteză și calitate)
- **RAM necesar:** Minim 8GB pe mașina locală
- **Timp indexing:** ~5-10 minute pentru acest proiect

## Resurse

- [Ollama Documentation](https://ollama.ai/docs)
- [SSH Port Forwarding Guide](https://www.ssh.com/academy/ssh/tunneling/example)
- [Kilo AI Documentation](https://docs.kilo.ai)

---

**Status:** Ready to use
**Ultima actualizare:** 2026-02-14
