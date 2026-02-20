# INSTRUCTIUNI PAS CU PAS - Migrare Stocare C: → D:

## SITUATIA IDENTIFICATA

| Componenta | Spatiu Ocupat | Prioritate |
|------------|---------------|------------|
| Docker Desktop | 5.3 GB | CRITIC |
| **Roblox (urme)** | **3.2 GB** | **DE STERS** |
| .minecraft | 1.76 GB | MARE |
| Windows Packages | 1.5 GB | MEDIU |
| NVIDIA cache | 1.3 GB | MEDIU |
| Google Chrome | 1.2 GB | MEDIU |
| Perplexity AI | 976 MB | MEDIU |
| VS Code | 747 MB | MEDIU |
| AnthropicClaude AI | 546 MB | MEDIU |
| Cursor AI | 291 MB | MIC |
| npm-cache | 259 MB | MIC |
| Temp files | 815 MB | MIC |
| **TOTAL** | **~16 GB** | |

**Roblox are 3.2 GB ramasi dupa dezinstalare - vor fi sterse automat!**

**Spatiu liber C: ~242 MB - CRITIC!**

---

## CUM SA PROCEDEZI (PAS CU PAS)

### PASUL 1: ANALIZA (OBLIGATORIU)

1. Deschide Command Prompt in directorul proiectului
2. Ruleaza:
   ```cmd
   START-MIGRATION.cmd
   ```
3. Alege optiunea **[1] - Analiza starii actuale**
4. Revino la meniu

### PASUL 2: CURATARE RAPIDA (RECOMANDAT INAINTE DE MIGRARE)

1. In meniul principal, alege optiunea **[2] - Curatare rapida**
2. Confirma cu **y**
3. Asteapta sa se termine curatarea
4. Aceasta va elibera spatiu fara sa mute fisiere

### PASUL 3: MIGRARE COMPLETA

1. In meniul principal, alege optiunea **[3] - Migrare completa**
2. Confirma cu **y**
3. Scriptul va:
   - Opri sandbox-ul Docker
   - Muta datele pe D:
   - Configura variabilele de mediu
   - Reporni sandbox-ul

### PASUL 4: VERIFICARE

1. In meniul principal, alege optiunea **[5] - Verifica starea**
2. Verifica ca totul functioneaza

### PASUL 5: RESTART

1. **RESTART COMPUTER** - obligatoriu pentru variabilele de mediu
2. Dupa restart, verifica:
   - Docker Desktop porneste
   - VS Code are extensiile
   - npm functioneaza

---

## CE SE INTAMPLA CU PROIECTUL

### In timpul migrarii:
- Sandbox-ul Docker va fi oprit
- Containerele vor fi oprite
- Datele din MongoDB vor fi pastrate (volume Docker)

### Dupa migrare:
- Sandbox-ul va reporni automat
- Toate containerele vor fi repornite
- Datele proiectului sunt INTACTE

### Structura pe D: dupa migrare:
```
D:\MigratedData\
├── Docker\          # Docker data
├── WSL\             # WSL distributions
├── npm-cache\       # npm cache
├── npm-global\      # npm global packages
├── VSCode\
│   ├── extensions\  # VS Code extensions
│   └── Data\        # VS Code cache
├── AI\
│   ├── AnthropicClaude\
│   ├── Perplexity\
│   └── Cursor\
├── Games\           # (optional)
├── Cache\           # Browser cache
└── Temp\            # Temp files
```

---

## CONFIGURARE DOCKER DESKTOP (MANUAL)

Dupa migrare, trebuie sa configurezi Docker Desktop:

1. Deschide **Docker Desktop**
2. Click pe **Settings** (iconita rotita)
3. Mergi la **Resources** → **Advanced**
4. La **Disk image location**, seteaza:
   ```
   D:\MigratedData\Docker
   ```
5. Click **Apply & Restart**

---

## REZOLVARE PROBLEME

### Docker nu porneste
```cmd
wsl --shutdown
wsl --import docker-desktop-data D:\MigratedData\WSL\docker-desktop-data D:\MigratedData\WSL\docker-desktop-data.tar --version 2
```

### VS Code nu are extensii
```cmd
rmdir %USERPROFILE%\.vscode\extensions
mklink /J %USERPROFILE%\.vscode\extensions D:\MigratedData\VSCode\extensions
```

### npm cache invalid
```cmd
npm cache clean --force
npm cache verify
```

### Proiectul nu porneste
```cmd
cd c:\Users\david\Desktop\proiectjoc
call stop-sandbox.cmd
call start-sandbox.cmd
```

---

## PENTRU VIITOR

Dupa migrare, toate aplicatiile vor folosi automat D: drive:

- **npm**: cache pe `D:\MigratedData\npm-cache`
- **VS Code**: extensii pe `D:\MigratedData\VSCode\extensions`
- **Docker**: date pe `D:\MigratedData\Docker`
- **AI apps**: date pe `D:\MigratedData\AI\`

Variabile de mediu setate:
- `NPM_CONFIG_CACHE=D:\MigratedData\npm-cache`
- `VSCODE_EXTENSIONS=D:\MigratedData\VSCode\extensions`
- `TEMP=D:\MigratedData\Temp`
- `TMP=D:\MigratedData\Temp`

---

## FISIERE CREATE

| Fisier | Descriere |
|--------|-----------|
| `START-MIGRATION.cmd` | **SCRIPTUL PRINCIPAL** - ruleaza acesta |
| `migrate-all-storage.ps1` | Scriptul de migrare complet |
| `analyze-storage.ps1` | Analiza spatiului |
| `verify-migration.cmd` | Verificare dupa migrare |
| `setup-future-installations.cmd` | Configurare pentru viitor |

---

## SUMAR

1. Ruleaza `START-MIGRATION.cmd`
2. Alege [1] pentru analiza
3. Alege [2] pentru curatare
4. Alege [3] pentru migrare
5. Alege [5] pentru verificare
6. **RESTART COMPUTER**
7. Configureaza Docker Desktop manual

**Spatiu estimat eliberat: ~15-17 GB**
