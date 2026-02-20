# Plan Migrare Stocare C: → D: Drive

## Situație Actuală

### Docker ✅ REZOLVAT
- **Locație nouă**: `D:\MigratedData\Docker\DockerDesktopWSL`
- Configurat din Docker Desktop Settings → Resources → Advanced → Disk image location

### Locații de Migrat pe C: Drive

#### 1. npm Cache și Global Packages
| Locație C: | Dimensiune estimată | Destinație D: |
|------------|---------------------|---------------|
| `C:\Users\david\AppData\Local\npm-cache` | ~500MB-2GB | `D:\DevData\npm\cache` |
| `C:\Users\david\AppData\Roaming\npm` | ~100-500MB | `D:\DevData\npm\global` |

#### 2. VS Code
| Locație C: | Dimensiune estimată | Destinație D: |
|------------|---------------------|---------------|
| `C:\Users\david\.vscode\extensions` | ~500MB-1GB | `D:\DevData\vscode\extensions` |
| `C:\Users\david\AppData\Roaming\Code` | ~200-500MB | `D:\DevData\vscode\roaming` |

#### 3. AI Tools - Claude
| Locație C: | Dimensiune estimată | Destinație D: |
|------------|---------------------|---------------|
| `C:\Users\david\AppData\Local\AnthropicClaude` | ~100-300MB | `D:\DevData\ai\claude\local` |
| `C:\Users\david\AppData\Roaming\Claude` | ~50-200MB | `D:\DevData\ai\claude\roaming` |
| `C:\Users\david\AppData\Local\claude-cli-nodejs` | ~50-100MB | `D:\DevData\ai\claude\cli` |

#### 4. AI Tools - Cursor
| Locație C: | Dimensiune estimată | Destinație D: |
|------------|---------------------|---------------|
| `C:\Users\david\AppData\Roaming\Cursor` | ~200-500MB | `D:\DevData\ai\cursor\roaming` |

#### 5. AI Tools - Perplexity
| Locație C: | Dimensiune estimată | Destinație D: |
|------------|---------------------|---------------|
| `C:\Users\david\AppData\Local\Perplexity` | ~50-200MB | `D:\DevData\ai\perplexity` |

---

## Structură Organizată D: Drive

```
D:\DevData\
├── npm\
│   ├── cache\          # npm cache
│   └── global\         # npm global packages
├── vscode\
│   ├── extensions\     # VS Code extensions
│   └── roaming\        # VS Code user data
├── ai\
│   ├── claude\
│   │   ├── local\      # Claude AppData\Local
│   │   ├── roaming\    # Claude AppData\Roaming
│   │   └── cli\        # Claude CLI
│   ├── cursor\
│   │   └── roaming\    # Cursor AppData\Roaming
│   └── perplexity\     # Perplexity data
└── docker\             # Already at D:\MigratedData\Docker
```

---

## Metodologie Migrare

### Opțiunea A: Junction Points (Recomandat)
- Creează puncte de legătură (symlinks) de la C: la D:
- Aplicațiile cred că folosesc în continuare C:
- Transparent pentru toate aplicațiile
- Nu necesită reconfigurare în aplicații

### Opțiunea B: Environment Variables
- Setează variabile de mediu pentru noile locații
- Funcționează doar pentru aplicațiile care respectă variabilele
- Mai puțin fiabil decât junction points

### Implementare: Junction Points

```cmd
# Exemplu pentru npm cache
mklink /J "C:\Users\david\AppData\Local\npm-cache" "D:\DevData\npm\cache"

# Exemplu pentru VS Code extensions
mklink /J "C:\Users\david\.vscode\extensions" "D:\DevData\vscode\extensions"
```

---

## Ordine de Execuție

1. **Pregătire**
   - Creare structură foldere pe D:
   - Verificare spațiu liber D:
   - Backup fișiere critice

2. **Migrare npm** (Prioritate Mare)
   - Copiere conținut
   - Creare junction point
   - Verificare funcționare

3. **Migrare VS Code** (Prioritate Mare)
   - Închide VS Code
   - Copiere extensions și roaming
   - Creare junction points
   - Repornire VS Code

4. **Migrare AI Tools** (Prioritate Medie)
   - Claude, Cursor, Perplexity
   - Procedură similară

5. **Configurare Automată**
   - Setare environment variables pentru instalări viitoare
   - Creare script curățare automată

6. **Verificare Finală**
   - Testare toate aplicațiile
   - Verificare spațiu eliberat pe C:

---

## Variabile de Mediu de Setat

```
npm_config_cache=D:\DevData\npm\cache
npm_config_prefix=D:\DevData\npm\global
VSCODE_EXTENSIONS=D:\DevData\vscode\extensions
```

---

## Estimare Spațiu de Eliberat

| Componentă | Spațiu estimat |
|------------|----------------|
| npm cache + global | 1-2.5 GB |
| VS Code | 0.7-1.5 GB |
| AI Tools | 0.5-1 GB |
| **TOTAL** | **2.2-5 GB** |

---

## Riscuri și Mitigare

1. **VS Code extensions nerecunoscute**
   - Soluție: Folosește junction point, nu doar environment variable
   
2. **npm cache corupt**
   - Soluție: Se poate regenera cu `npm cache clean --force`

3. **AI tools pierd setări**
   - Soluție: Backup înainte de migrare

---

## Status

- [x] Docker migrat la D:\MigratedData\Docker\DockerDesktopWSL
- [ ] npm cache și global packages
- [ ] VS Code extensions și roaming
- [ ] Claude AI data
- [ ] Cursor AI data
- [ ] Perplexity data
- [ ] Environment variables
- [ ] Script curățare automată
- [ ] Documentație finală
