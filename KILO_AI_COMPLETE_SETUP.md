# Kilo AI Codebase Indexing - Setup Complet

## 🎯 Problema Identificată

1. **Qdrant nu rula** - Vector database necesar pentru indexing
2. **Configurație incompletă** - Lipseau setările pentru Qdrant
3. **Folder .kilo lipsă** - Cache-ul Kilo AI nu era inițializat
4. **OpenAI API nu era testat corect** - Requests nu ajungeau la OpenAI

## ✅ Soluția Implementată

### 1. Instalat Qdrant Vector Database

Qdrant rulează acum în Docker:
```bash
docker run -d \
  --name qdrant \
  -p 6333:6333 \
  -p 6334:6334 \
  -v $(pwd)/qdrant_storage:/qdrant/storage \
  qdrant/qdrant:latest
```

**URLs:**
- Dashboard: http://localhost:6333/dashboard
- API: http://localhost:6333

### 2. Configurat `.vscode/settings.json`

```json
{
  "kilo.codebaseIndexing.enabled": true,
  "kilo.codebaseIndexing.provider": "openai",
  "kilo.codebaseIndexing.openai.apiKey": "sk-proj-...",
  "kilo.codebaseIndexing.openai.model": "text-embedding-3-small",
  "kilo.codebaseIndexing.vectorStore": "qdrant",
  "kilo.codebaseIndexing.qdrant.url": "http://localhost:6333",
  "kilo.codebaseIndexing.qdrant.collectionName": "mern-template-codebase",
  "kilo.codebaseIndexing.chunkSize": 1000,
  "kilo.codebaseIndexing.chunkOverlap": 200
}
```

### 3. Creat Script Automat

[`setup-kilo-indexing.sh`](setup-kilo-indexing.sh) - Instalează și configurează tot:
- Instalează Docker (dacă lipsește)
- Pornește Qdrant
- Verifică OpenAI API
- Creează directoare necesare
- Testează conexiunile

## 🚀 Cum Să Folosești

### Pas 1: Rulează Setup-ul

```bash
./setup-kilo-indexing.sh
```

Acest script va:
- ✅ Instala Docker (dacă nu există)
- ✅ Porni Qdrant în Docker
- ✅ Verifica OpenAI API
- ✅ Crea directorul `.kilo`
- ✅ Testa toate conexiunile

### Pas 2: Reload VS Code

```
Ctrl+Shift+P → "Developer: Reload Window"
```

### Pas 3: Indexează Codebase-ul

1. Deschide Kilo AI sidebar (icon în stânga)
2. Click pe "Index Codebase" sau "⚡ Index"
3. Selectează `/root/MERN-template`
4. Așteaptă 2-5 minute

### Pas 4: Verifică Progresul

**În Qdrant Dashboard:**
```
http://localhost:6333/dashboard
```

Vei vedea collection-ul `mern-template-codebase` cu vectori.

**În VS Code:**
- Status bar va arăta progresul
- Notifications pentru erori (dacă apar)

## 📊 Ce Se Întâmplă La Indexare

1. **Scanare fișiere** (~200 fișiere .js, .jsx, .json, .md, .sh)
2. **Chunking** - Împarte codul în bucăți de 1000 caractere (overlap 200)
3. **Embeddings** - Trimite la OpenAI pentru vectorizare
4. **Storage** - Salvează în Qdrant
5. **Index** - Creează index pentru căutare rapidă

**Timp estimat:** 2-5 minute
**Cost:** ~$0.0025 (sub 1 cent)

## 🔍 Verificare Status

### Verifică Qdrant:
```bash
curl http://localhost:6333
```

### Verifică Collections:
```bash
curl http://localhost:6333/collections
```

### Verifică Docker:
```bash
docker ps | grep qdrant
```

### Verifică Logs Qdrant:
```bash
docker logs qdrant
```

## 🐛 Troubleshooting

### Eroare: "fetch failed"

**Cauză:** Qdrant nu rulează sau OpenAI API nu răspunde

**Soluție:**
```bash
# Verifică Qdrant
docker ps | grep qdrant

# Restart Qdrant
docker restart qdrant

# Verifică OpenAI API
curl -X POST https://api.openai.com/v1/embeddings \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"input": "test", "model": "text-embedding-3-small"}'
```

### Eroare: "Connection refused"

**Cauză:** Qdrant nu este accesibil

**Soluție:**
```bash
# Verifică că portul 6333 este deschis
netstat -tlnp | grep 6333

# Restart Qdrant
docker restart qdrant

# Verifică logs
docker logs qdrant --tail 50
```

### Eroare: "Collection not found"

**Cauză:** Collection-ul nu a fost creat

**Soluție:**
```bash
# Creează manual collection-ul
curl -X PUT http://localhost:6333/collections/mern-template-codebase \
  -H "Content-Type: application/json" \
  -d '{
    "vectors": {
      "size": 1536,
      "distance": "Cosine"
    }
  }'
```

### Indexarea Se Blochează

**Soluție:**
1. Reload VS Code
2. Verifică logs: `Ctrl+Shift+P` → "Developer: Show Logs" → "Extension Host"
3. Caută erori de la "Kilo"
4. Restart Qdrant: `docker restart qdrant`

## 📁 Structura Fișierelor

```
/root/MERN-template/
├── .vscode/
│   └── settings.json          # Configurație Kilo AI
├── .kilo/                      # Cache Kilo AI (creat automat)
├── qdrant_storage/             # Date Qdrant (persistente)
├── .env                        # OpenAI API Key
├── .gitignore                  # Exclude qdrant_storage, .kilo
└── setup-kilo-indexing.sh      # Script setup automat
```

## 🔒 Securitate

### Fișiere Protejate în .gitignore:
- `.vscode/settings.json` - Conține API keys
- `.env` - Environment variables
- `qdrant_storage/` - Date vectori
- `.kilo/` - Cache Kilo AI

### API Keys:
- **OpenAI**: Stocat în `.vscode/settings.json` și `.env`
- **Qdrant**: Nu necesită API key pentru localhost

## 💰 Costuri

### Indexare Inițială:
- Fișiere: ~200
- Cod: ~500KB
- Tokens: ~125,000
- **Cost: $0.0025** (sub 1 cent)

### Re-indexare (doar fișiere modificate):
- Fișiere: ~5-10
- Cod: ~10-20KB
- Tokens: ~2,500-5,000
- **Cost: $0.00005-0.0001**

### Cost Lunar Estimat:
- Indexare inițială: $0.0025
- Re-indexări zilnice: $0.003
- **Total: ~$0.01/lună**

## 🎯 După Indexare

### Întrebări Pe Care Le Poți Pune Kilo:

1. **Căutare cod:**
   - "Unde este logica de calcul salariu?"
   - "Arată-mi toate API endpoints pentru economie"
   - "Cum funcționează autentificarea?"

2. **Explicații:**
   - "Explică-mi GameClock service"
   - "Ce face EconomyEngine?"
   - "Cum funcționează WorkCalculator?"

3. **Debugging:**
   - "Unde ar putea fi bug-ul în salary calculation?"
   - "Ce fișiere folosesc MongoDB?"
   - "Unde sunt definite rutele de chat?"

### Kilo AI va:
- ✅ Căuta semantic în tot codebase-ul
- ✅ Găsi cod relevant chiar dacă nu folosești keywords exacte
- ✅ Înțelege contextul și relațiile între fișiere
- ✅ Oferi răspunsuri cu link-uri directe la cod

## 📊 Monitorizare

### Qdrant Dashboard:
```
http://localhost:6333/dashboard
```

Vezi:
- Număr de vectori indexați
- Dimensiunea collection-ului
- Statistici de căutare

### Docker Stats:
```bash
docker stats qdrant
```

Vezi:
- CPU usage
- Memory usage
- Network I/O

## 🔄 Mentenanță

### Restart Qdrant:
```bash
docker restart qdrant
```

### Stop Qdrant:
```bash
docker stop qdrant
```

### Șterge și Recreează:
```bash
docker stop qdrant
docker rm qdrant
rm -rf qdrant_storage
./setup-kilo-indexing.sh
```

### Re-indexare Completă:
1. În Kilo AI sidebar
2. Click pe "⚙️ Settings"
3. "Clear Index"
4. "Index Codebase" din nou

## ✅ Checklist Final

- [x] Docker instalat
- [x] Qdrant rulează pe localhost:6333
- [x] OpenAI API Key configurat
- [x] `.vscode/settings.json` complet
- [x] `.gitignore` actualizat
- [x] Kilo AI extension instalat (v5.7.0)
- [ ] VS Code reloaded
- [ ] Codebase indexat
- [ ] Testat cu întrebări

## 🎉 Gata!

După ce rulezi [`setup-kilo-indexing.sh`](setup-kilo-indexing.sh) și reload VS Code, totul ar trebui să funcționeze perfect!

**Următorii pași:**
1. Reload VS Code
2. Deschide Kilo AI sidebar
3. Click "Index Codebase"
4. Așteaptă 2-5 minute
5. Începe să întrebi despre cod!

---

**Status:** Ready to use
**Ultima actualizare:** 2026-02-14
**Versiune Kilo AI:** 5.7.0
**Qdrant:** Latest (Docker)
