# MIGRARE COMPLETĂ C: → D: DRIVE

## ✅ Status Final

### Docker ✅ CONFIGURAT
- **Locație**: `D:\MigratedData\Docker\DockerDesktopWSL`
- Configurat din Docker Desktop Settings → Resources → Advanced

### Script-uri Create

| Script | Descriere |
|--------|-----------|
| [`migrate-dev-data-to-D.cmd`](migrate-dev-data-to-D.cmd) | Migrează npm, VS Code, AI tools pe D: |
| [`auto-cleanup-D-drive.cmd`](auto-cleanup-D-drive.cmd) | Curățare automată întreținere |

---

## 🚀 RULARE MIGRARE

### Pasul 1: Pregătire
1. **ÎNCHIDE** toate aplicațiile:
   - VS Code
   - Claude Desktop
   - Cursor
   - Perplexity
   - Orice terminal cu npm

### Pasul 2: Executare Script
```cmd
# Click dreapta pe migrate-dev-data-to-D.cmd
# Selectează "Run as administrator"
```

Sau din terminal:
```cmd
powershell -Command "Start-Process cmd -ArgumentList '/c migrate-dev-data-to-D.cmd' -Verb RunAs"
```

### Pasul 3: Verificare
După terminare, verifică:
```cmd
# Verifică npm
npm config get cache
# Ar trebui să arate: D:\DevData\npm\cache

# Verifică VS Code
code --list-extensions
# Ar trebui să listeze extensiile

# Verifică junction points
dir "C:\Users\david\AppData\Local\npm-cache" /AL
dir "C:\Users\david\.vscode\extensions" /AL
```

---

## 📁 Structura D: Drive După Migrare

```
D:\
├── DevData\
│   ├── npm\
│   │   ├── cache\              # npm cache
│   │   └── global\             # npm global packages
│   ├── vscode\
│   │   ├── extensions\         # VS Code extensions
│   │   └── roaming\            # VS Code user data
│   ├── ai\
│   │   ├── claude\
│   │   │   ├── local\          # Claude AppData\Local
│   │   │   ├── roaming\        # Claude AppData\Roaming
│   │   │   └── cli\            # Claude CLI
│   │   ├── cursor\
│   │   │   └── roaming\        # Cursor data
│   │   └── perplexity\         # Perplexity data
│   └── MIGRATION_REPORT.txt    # Raport migrare
│
└── MigratedData\
    └── Docker\
        └── DockerDesktopWSL    # Docker WSL data
```

---

## 🔧 Cum Funcționează

### Junction Points
Scriptul folosește **junction points** (symlinks Windows):
- Aplicațiile cred că folosesc în continuare C:
- Fișierele sunt stocate fizic pe D:
- Transparent pentru toate aplicațiile

### Environment Variables Setate
```
npm_config_cache=D:\DevData\npm\cache
npm_config_prefix=D:\DevData\npm\global
VSCODE_EXTENSIONS=D:\DevData\vscode\extensions
```

---

## 🧹 Întreținere

### Rulare Curățare Automată
```cmd
# Click dreapta pe auto-cleanup-D-drive.cmd
# Selectează "Run as administrator"
```

### Ce curăță:
- npm cache mai vechi de 30 zile
- Windows Temp files
- Docker dangling resources
- Crash dumps

### Programare automată (opțional):
```cmd
# Adaugă în Task Scheduler pentru rulare săptămânală
schtasks /create /tn "Cleanup D Drive" /tr "C:\path\to\auto-cleanup-D-drive.cmd" /sc weekly /d SUN /st 03:00
```

---

## ⚠️ Note Importante

1. **NU șterge** folderele de pe C: care sunt junction points
   - Dacă ștergi un junction point, ștergi doar legătura, nu datele
   - Dar e mai bine să le lași așa cum sunt

2. **Dacă reinstalezi VS Code**:
   - Extensiile vor fi recunoscute automat datorită junction point
   - Nu trebuie să reinstalezi extensiile

3. **Dacă reinstalezi npm**:
   - Rulează `npm config set cache D:\DevData\npm\cache`
   - Rulează `npm config set prefix D:\DevData\npm\global`

4. **Backup**:
   - Înainte de modificări majore, copiază `D:\DevData` pe un alt drive

---

## 📊 Estimare Spațiu Eliberat

| Componentă | Spațiu |
|------------|--------|
| npm cache + global | 1-2.5 GB |
| VS Code | 0.7-1.5 GB |
| AI Tools | 0.5-1 GB |
| **TOTAL** | **2.2-5 GB** |

---

## 🔍 Verificare Junction Points

Pentru a verifica că junction points sunt corecte:
```cmd
# Listează toate junction points din user profile
dir "C:\Users\david\AppData\Local" /AL
dir "C:\Users\david\AppData\Roaming" /AL
dir "C:\Users\david\.vscode" /AL
```

---

## 📞 Suport

Dacă apar probleme:
1. Verifică log-ul: `D:\DevData\MIGRATION_REPORT.txt`
2. Verifică că aplicațiile sunt închise înainte de rulare
3. Rulează scriptul din nou - este idempotent

---

**Data creării**: 2026-02-20
**Autor**: Kilo Code AI Assistant
