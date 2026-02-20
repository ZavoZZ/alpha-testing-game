# Setup OpenAI pentru Codebase Indexing - Kilo AI

## 🎯 Avantaje OpenAI vs Ollama

**Mult mai simplu!** Nu mai ai nevoie de:
- ❌ SSH tunnels
- ❌ Ollama instalat local
- ❌ Modele descărcate
- ❌ Configurații complexe

**Doar:**
- ✅ API Key de la OpenAI
- ✅ Configurare în VS Code
- ✅ Gata!

## 📊 Model Recomandat: text-embedding-3-small

### Specificații:
- **Dimensiuni**: 1536 embeddings
- **Cost**: $0.02 / 1M tokens (FOARTE IEFTIN)
- **Performanță**: Excelentă pentru cod
- **Viteză**: Foarte rapid (API cloud)
- **Context**: 8191 tokens

### Cost Estimat pentru Proiectul Tău:

Proiectul MERN (~200 fișiere, ~500KB cod):
- **Tokens estimați**: ~125,000 tokens
- **Cost indexare**: ~$0.0025 (sub 1 cent!)
- **Re-indexare**: Doar fișierele modificate

**Total lunar** (cu re-indexări): ~$0.01-0.05

## 🔑 Pas 1: Obține OpenAI API Key

### Opțiunea A: Cont Nou OpenAI
1. Mergi la: https://platform.openai.com/signup
2. Creează cont (email + verificare)
3. Adaugă metodă de plată (card)
4. Mergi la: https://platform.openai.com/api-keys
5. Click "Create new secret key"
6. **Copiază key-ul** (începe cu `sk-...`)
7. **IMPORTANT**: Salvează-l undeva sigur, nu îl vei mai vedea!

### Opțiunea B: Cont Existent
1. Login la: https://platform.openai.com
2. Mergi la: https://platform.openai.com/api-keys
3. Click "Create new secret key"
4. Numește-l: "Kilo AI Indexing"
5. Copiază key-ul

## 🔧 Pas 2: Configurare pe Server

### Metoda 1: Environment Variable (RECOMANDAT)

Pe **server**, adaugă API key în `.bashrc` sau `.zshrc`:

```bash
# Editează fișierul
nano ~/.bashrc

# Adaugă la final (înlocuiește cu key-ul tău real)
export OPENAI_API_KEY="sk-your-actual-api-key-here"

# Salvează (Ctrl+X, Y, Enter)

# Reîncarcă configurația
source ~/.bashrc

# Verifică
echo $OPENAI_API_KEY
```

### Metoda 2: VS Code Settings (Alternativă)

Editează [`.vscode/settings.json`](.vscode/settings.json) și înlocuiește:
```json
"kilo.codebaseIndexing.openai.apiKey": "sk-your-actual-api-key-here"
```

⚠️ **ATENȚIE**: Nu commita acest fișier cu key-ul în Git!

### Metoda 3: .env File (Cea Mai Sigură)

```bash
# Creează fișier .env în root
echo 'OPENAI_API_KEY=sk-your-actual-api-key-here' > .env

# Asigură-te că este în .gitignore
echo '.env' >> .gitignore
```

Apoi în [`.vscode/settings.json`](.vscode/settings.json):
```json
"kilo.codebaseIndexing.openai.apiKey": "${OPENAI_API_KEY}"
```

## ✅ Pas 3: Verificare Configurație

Am configurat deja [`.vscode/settings.json`](.vscode/settings.json) cu:

```json
{
  "kilo.codebaseIndexing.enabled": true,
  "kilo.codebaseIndexing.provider": "openai",
  "kilo.codebaseIndexing.openai.apiKey": "${OPENAI_API_KEY}",
  "kilo.codebaseIndexing.openai.model": "text-embedding-3-small",
  "kilo.codebaseIndexing.excludePatterns": [
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/*.log",
    "**/package-lock.json",
    "**/.git/**"
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

## 🚀 Pas 4: Indexare Codebase

### În VS Code:

1. **Setează API Key** (alege o metodă de mai sus)
2. **Reload VS Code**: `Ctrl+Shift+P` → "Developer: Reload Window"
3. **Pornește Indexarea**: `Ctrl+Shift+P` → "Kilo: Index Codebase"
4. **Selectează**: `/root/MERN-template`
5. **Așteaptă**: ~2-3 minute (progres bar în VS Code)

### Verificare:
```bash
# Verifică că API key este setat
echo $OPENAI_API_KEY

# Testează API (opțional)
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

## 📈 Monitorizare Costuri

### Dashboard OpenAI:
1. Mergi la: https://platform.openai.com/usage
2. Vezi usage în timp real
3. Setează limite de spending:
   - Settings → Billing → Usage limits
   - Recomandare: $5/lună (mult mai mult decât ai nevoie)

### Cost Breakdown:

**Indexare inițială** (~500KB cod):
- Tokens: ~125,000
- Cost: $0.0025

**Re-indexare zilnică** (doar fișiere modificate, ~10KB):
- Tokens: ~2,500
- Cost: $0.00005

**Cost lunar estimat**: $0.01 - $0.05

## 🔒 Securitate

### Best Practices:

1. **Nu commita API key în Git**:
   ```bash
   # Verifică .gitignore
   cat .gitignore | grep -E "\.env|settings\.json"
   ```

2. **Folosește environment variables**:
   ```bash
   export OPENAI_API_KEY="sk-..."
   ```

3. **Rotește key-ul periodic**:
   - Creează key nou la 3-6 luni
   - Șterge key-ul vechi

4. **Setează limite de spending**:
   - OpenAI Dashboard → Billing → Usage limits

## 🆚 Comparație: OpenAI vs Ollama

| Feature | OpenAI | Ollama |
|---------|--------|--------|
| **Setup** | Simplu (API key) | Complex (SSH tunnel) |
| **Cost** | ~$0.02/lună | Gratis (dar resurse locale) |
| **Viteză** | Foarte rapid | Depinde de hardware |
| **Calitate** | Excelentă | Foarte bună |
| **Mentenanță** | Zero | Trebuie să ruleze local |
| **Scalabilitate** | Infinită | Limitată de hardware |

## 🎯 Recomandare

Pentru proiectul tău:
- ✅ **OpenAI** - Simplu, rapid, ieftin
- ❌ **Ollama** - Complicat, necesită tunnel SSH

## 🐛 Troubleshooting

### Eroare: "Invalid API Key"
```bash
# Verifică key-ul
echo $OPENAI_API_KEY

# Asigură-te că începe cu "sk-"
# Verifică că nu are spații sau caractere extra
```

### Eroare: "Rate limit exceeded"
- Așteaptă 1 minut
- Verifică usage la: https://platform.openai.com/usage
- Crește limita de spending

### Eroare: "Insufficient quota"
- Adaugă metodă de plată
- Verifică billing: https://platform.openai.com/account/billing

### Indexarea nu pornește
```bash
# Reload VS Code
Ctrl+Shift+P → "Developer: Reload Window"

# Verifică logs
Ctrl+Shift+P → "Developer: Show Logs" → "Extension Host"
```

## 📝 Checklist Final

- [ ] Cont OpenAI creat
- [ ] API Key obținut (sk-...)
- [ ] API Key setat ca environment variable
- [ ] `.vscode/settings.json` configurat
- [ ] VS Code reloaded
- [ ] "Kilo: Index Codebase" executat
- [ ] Indexare completă (2-3 minute)
- [ ] Testează: întreabă Kilo despre cod

## 🎉 Gata!

După indexare, poți întreba Kilo:
- "Unde este logica de calcul salariu?"
- "Cum funcționează autentificarea?"
- "Arată-mi toate API endpoints pentru economie"
- "Explică-mi GameClock service"

Kilo va căuta semantic în tot codebase-ul indexat!

---

**Status**: Ready to use
**Cost estimat**: $0.02/lună
**Timp setup**: 5 minute
**Complexitate**: Minimă ✅
