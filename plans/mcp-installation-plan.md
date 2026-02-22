# Plan de Instalare MCP Servers pentru Kilo Code

## ✅ Status Actual

1. **Playwright MCP** - FUNCȚIONEAZĂ cu flag-urile `--isolated --no-sandbox`
2. **Codebase Indexing** - FUNCȚIONEAZĂ (Qdrant + OpenAI)
3. **Workspace Rules** - FUNCȚIONEAZĂ
4. **Workspace Workflows** - FUNCȚIONEAZĂ

---

## 🎯 MCP-uri Disponibile și Testate

### 1. Playwright (DEJA INSTALAT)

```json
{
	"command": "npx",
	"args": ["-y", "@playwright/mcp@0.0.38", "--isolated", "--no-sandbox"]
}
```

**Utilizare**: Browser automation, testing, screenshots

### 2. Filesystem (disponibil în Kilo Code)

Kilo Code are deja acces la sistemul de fișiere prin tool-urile native.

### 3. Puppeteer (alternativă)

```bash
npm install --save-dev puppeteer
```

**Deja instalat** în proiectul tău (din package.json)

---

## 🔍 Problema cu Multe MCP-uri Recomandate

După cercetare, multe dintre MCP-urile recomandate anterior **NU EXISTĂ** sau au nume diferite:

| MCP Căutat                             | Status                 |
| -------------------------------------- | ---------------------- |
| `@mcp-js/jest`                         | ❌ Nu există           |
| `@modelcontextprotocol/server-mongodb` | ❌ Nu există           |
| `@modelcontextprotocol/server-github`  | ❌ Verificare necesară |
| `@MCP-Showcase/docker`                 | ❌ Posibil inexistent  |

---

## ✅ Recomandări Reale pentru Proiectul Tău

### Alternativa 1: Folosește Tool-urile Native Kilo Code

Kilo Code are deja tool-uri puternice:

- `read_file` / `write_to_file` - Fișiere
- `search_files` / `codebase_search` - Căutare cod
- `execute_command` - Comenzi terminal
- `list_files` - Explorare directoare

### Alternativa 2: MCP-uri Verifycate

#### A. Playwright (deja instalat și funcțional)

- Browser automation
- Testing E2E
- Screenshots
- Console monitoring

#### B. Puppeteer (npm local)

```bash
npm install puppeteer
```

Folosit în proiectul tău deja!

#### C. Custom MCP Scripts

Poți crea scripturi MCP personalizate pentru:

- MongoDB operations
- API testing
- Docker management

---

## 📋 Configurație Finală Recomandată

### `.kilocode/mcp.json` (Optimizat):

```json
{
	"mcpServers": {
		"playwright": {
			"command": "npx",
			"args": ["-y", "@playwright/mcp@0.0.38", "--isolated", "--no-sandbox"],
			"alwaysAllow": [
				"browser_install",
				"browser_navigate",
				"browser_snapshot",
				"browser_tabs",
				"browser_close",
				"browser_evaluate",
				"browser_click",
				"browser_type",
				"browser_console_messages",
				"browser_network_requests"
			]
		}
	}
}
```

---

## 🛠️ Automatizare prin Skills

Kilo Code are skills utile deja disponibile:

| Skill                         | Utilizare                      |
| ----------------------------- | ------------------------------ |
| `artifacts-builder`           | Componente React/HTML complexe |
| `file-organizer`              | Organizare fișiere inteligente |
| `vercel-react-best-practices` | Optimizări React/Next.js       |
| `web-design-guidelines`       | Audit UI/UX                    |
| `webapp-testing`              | Testare cu Playwright          |

---

## 📝 Concluzie

**Playwright MCP este suficient** pentru:

- ✅ Testare E2E
- ✅ Verificare funcționalitate
- ✅ Screenshots
- ✅ Console monitoring
- ✅ Navigation testing

**Nu sunt necesare alte MCP-uri** - tool-urile native Kilo Code + Playwright acoperă toate nevoile de automatizare.

---

_Generated: 2026-02-21_
