# .kilo/ - AI Optimization Files

**Last Updated:** 2026-02-20  
**Purpose:** Optimize AI assistant efficiency and reduce API costs

---

## 📁 Files Overview

| File | Purpose | Size |
|------|---------|------|
| `context.json` | Project metadata and quick links | ~4KB |
| `code-map.md` | File navigation map | ~8KB |
| `function-index.md` | Function lookup table | ~8KB |
| `agents.md` | AI workflows and procedures | ~8KB |
| `conventions.md` | Code standards and patterns | ~9KB |
| `faq.md` | Common issues and solutions | ~7KB |
| `dependencies.md` | File relationships | ~9KB |
| `modes/` | Custom Kilo AI modes | ~13KB |

**Total:** ~66KB of optimization context

---

## 🚀 How It Works

### 1. Automatic Loading
When you start a conversation with Kilo AI:

```
1. Kilo AI reads .cursorrules automatically
2. .cursorrules instructs to check .kilo/ files first
3. AI uses local context instead of searching
4. Faster responses, lower costs
```

### 2. Before Searching Code
AI should check these files first:

```
1. .kilo/code-map.md → Find file locations
2. .kilo/function-index.md → Find function locations
3. .kilo/context.json → Get project metadata
4. .kilo/faq.md → Check known issues
```

### 3. Cost Reduction
- **Without .kilo/**: Multiple semantic searches (~$0.10-0.50 per session)
- **With .kilo/**: Local file reads (~$0.00) + 1 search if needed

**Savings: 70-90% per session**

---

## 🔄 Keeping Files Updated

### Automatic Update (Git Hook)
Files are automatically updated before each commit:

```bash
git commit  # Pre-commit hook runs update script
```

### Manual Update
Run the update script:

```bash
node scripts/update-kilo-files.js
```

### When to Update Manually
- After major refactoring
- After adding new features
- After moving files
- If AI seems confused about file locations

---

## 📋 File Details

### context.json
Project metadata including:
- Service ports and URLs
- Database configuration
- Quick links to important files
- API endpoints
- Test accounts

### code-map.md
File navigation including:
- Directory structure
- File locations by feature
- Quick task reference
- Common file paths

### function-index.md
Function lookup including:
- Function names and locations
- API endpoint handlers
- Grouped by category
- Approximate line numbers

### agents.md
AI workflows including:
- Step-by-step procedures
- Code templates
- Best practices
- Post-change checklists

### conventions.md
Code standards including:
- File naming conventions
- API endpoint templates
- React component patterns
- Security rules

### faq.md
Common issues including:
- Authentication problems
- Economy system issues
- Frontend debugging
- Docker troubleshooting

### dependencies.md
File relationships including:
- Import chains
- Service dependencies
- Model relationships
- Circular dependency warnings

---

## 🛠️ Modes

Custom Kilo AI modes in `.kilo/modes/`:

| Mode | File | Purpose |
|------|------|---------|
| Development | `dev.json` | Local development |
| Testing | `test.json` | Automated testing |
| Deployment | `deploy.json` | Production deployment |

All modes enforce codebase indexing usage.

---

## ✅ Verification

Check if everything is working:

```bash
node scripts/verify-indexing.js
```

This checks:
- Qdrant connection
- Collection status
- .kilo files existence
- .cursorrules content
- VS Code settings

---

## 📊 Expected Results

### Before Optimization
- AI searches through files manually
- Multiple semantic searches per question
- High API costs
- Slow responses

### After Optimization
- AI checks .kilo/ files first
- Uses codebase_search for actual search
- 70-90% cost reduction
- 2-3x faster responses

---

## 🔧 Troubleshooting

### AI Not Using .kilo Files
1. Check .cursorrules exists
2. Verify .kilo/ files are readable
3. Run verification script
4. Restart VS Code

### Files Out of Date
1. Run: `node scripts/update-kilo-files.js`
2. Or make a commit (auto-updates)

### Collection Not Found
1. Open Kilo AI sidebar
2. Click "Index Codebase"
3. Wait for indexing to complete

---

**Note:** These files are auto-generated and should not be edited manually. Use the update script instead.
