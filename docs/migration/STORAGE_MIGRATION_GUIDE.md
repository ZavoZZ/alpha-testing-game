# Storage Migration Guide: C: → D:

## Situația Actuală

| Componentă | Locație C: | Dimensiune |
|------------|------------|------------|
| Docker Desktop | `%LOCALAPPDATA%\Docker` | ~5.4 GB |
| VS Code | `%APPDATA%\Code` + `.vscode` | ~788 MB |
| npm cache | `%APPDATA%\npm-cache` | ~272 MB |
| **TOTAL** | | **~6.5 GB** |

**Spațiu liber C:** ~242 MB (CRITIC!)
**Spațiu liber D:** ~164 GB (OK)

---

## Cum se Rulează Migrarea

### Opțiunea 1: Script Interactiv (Recomandat)

```cmd
run-migration.cmd
```

Acesta va deschide un meniu cu opțiuni:
1. **DRY RUN** - Simulează migrarea fără modificări
2. **MIGRATION COMPLETĂ** - Mută totul
3. **MIGRATION DOCKER** - Doar Docker
4. **MIGRATION NPM** - Doar npm
5. **MIGRATION VS CODE** - Doar VS Code

### Opțiunea 2: PowerShell Direct

```powershell
# Ca Administrator, în PowerShell:

# Dry run (testare)
.\migrate-storage-to-D.ps1 -DryRun

# Migrare completă
.\migrate-storage-to-D.ps1

# Doar Docker
.\migrate-storage-to-D.ps1 -SkipNpm -SkipVSCode

# Doar npm
.\migrate-storage-to-D.ps1 -SkipDocker -SkipVSCode

# Doar VS Code
.\migrate-storage-to-D.ps1 -SkipDocker -SkipNpm
```

---

## Ce Face Scriptul

### 1. Docker Desktop
- Oprește Docker Desktop și WSL
- Exportă `docker-desktop-data` din WSL
- Importă în noua locație `D:\WSL`
- Curăță build cache

### 2. npm Cache
- Creează `D:\npm-cache` și `D:\npm-global`
- Configurează npm să folosească noua locație
- Șterge cache-ul vechi
- Adaugă `D:\npm-global` la PATH

### 3. VS Code
- Mută extensiile în `D:\VSCode\extensions`
- Creează junction point pentru compatibilitate
- Mută cache-urile în `D:\VSCode\Data`
- Configurează variabila `VSCODE_EXTENSIONS`

### 4. Variabile de Mediu
Setează permanent:
- `NPM_CONFIG_CACHE=D:\npm-cache`
- `NPM_CONFIG_PREFIX=D:\npm-global`
- `VSCODE_EXTENSIONS=D:\VSCode\extensions`
- `TEMP=D:\Temp`
- `TMP=D:\Temp`

---

## După Migrare

### 1. Repornire Necesară
```
Restart computer pentru a aplica variabilele de mediu
```

### 2. Verificare Docker
```cmd
docker info | findstr "Docker Root Dir"
docker images
docker ps -a
```

### 3. Verificare npm
```cmd
npm config get cache
npm config get prefix
npm cache verify
```

### 4. Verificare VS Code
```cmd
code --list-extensions
```

---

## Structura pe D: după Migrare

```
D:\
├── DockerData\
│   └── (Docker Desktop data)
├── WSL\
│   ├── distro\
│   └── docker-desktop-data.tar
├── npm-cache\
│   └── (npm cache files)
├── npm-global\
│   └── (global npm packages)
├── VSCode\
│   ├── extensions\
│   └── Data\
│       ├── Cache\
│       ├── CachedData\
│       └── ...
└── Temp\
```

---

## Configurare Docker Desktop Manuală

După migrare, deschide Docker Desktop:
1. Settings → Resources → Advanced
2. Schimbă "Disk image location" la `D:\DockerData`
3. Apply & Restart

---

## Recuperare în Caz de Eroare

### Docker nu pornește
```cmd
wsl --unregister docker-desktop-data
wsl --import docker-desktop-data D:\WSL\distro D:\WSL\docker-desktop-data.tar --version 2
```

### VS Code nu găsește extensiile
```cmd
rmdir %USERPROFILE%\.vscode\extensions
mklink /J %USERPROFILE%\.vscode\extensions D:\VSCode\extensions
```

### npm cache invalid
```cmd
npm cache clean --force
npm cache verify
```

---

## Prevenire - Configurare pentru Viitor

### npm
```cmd
npm config set cache D:\npm-cache --global
npm config set prefix D:\npm-global --global
```

### VS Code
Adaugă în `settings.json`:
```json
{
  "extensions.autoUpdate": true,
  "extensions.autoCheckUpdates": true
}
```

### Docker Desktop
Settings → Resources → Advanced → Disk image location: `D:\DockerData`

---

## Note Importante

1. **Nu ștergeți folderele `.old` imediat** - așteptați să verificați că totul funcționează
2. **Proiectul curent nu este afectat** - doar datele de sistem sunt mutate
3. **Sesiunile VS Code și Docker** trebuie repornite după migrare
4. **Backup recomandat** pentru date critice înainte de migrare

---

## Spațiu Eliberat Estimat

| Componentă | Spațiu Eliberat |
|------------|-----------------|
| Docker | ~5.4 GB |
| VS Code | ~788 MB |
| npm | ~272 MB |
| Temp | ~500 MB |
| **TOTAL** | **~7 GB** |
