# Kilo Code Workspace Rule: Codebase Indexing

**Priority:** HIGH  
**Applies to:** All modes (dev, code, ask, test, architect, debug, deploy)  
**Applies to:** All models (GLM-5, Claude, GPT, Haiku, Sonnet, etc.)

---

## 🚨 CRITICAL: Always Use Codebase Indexing First

### Before ANY code search or file exploration:

```
1. ✅ ALWAYS use codebase_search tool FIRST
2. ✅ Check .kilo/code-map.md for file locations
3. ✅ Check .kilo/function-index.md for function locations  
4. ✅ Check .kilo/context.json for project metadata
5. ✅ Check .kilo/faq.md for known issues
6. ❌ NEVER manually search without checking index first
```

### Why This Matters:
- **70% faster responses** - Index is pre-built
- **90% cost reduction** - No expensive semantic searches
- **Accurate results** - Index knows exact locations
- **Works for ALL models** - Not model-dependent

---

## 📋 Quick Reference Files

| File | When to Use |
|------|-------------|
| `.kilo/code-map.md` | "Where is X file?" |
| `.kilo/function-index.md` | "Where is Y function?" |
| `.kilo/context.json` | Project overview |
| `.kilo/agents.md` | How to do Z task |
| `.kilo/faq.md` | Common problems |
| `.kilo/conventions.md` | Code standards |

---

## 🔧 How to Search

### ❌ DON'T:
```
Search for "login function" in all files
```

### ✅ DO:
```
1. Check .kilo/function-index.md first
2. If not found, use: codebase_search tool with query "login authentication"
3. Then open the exact file from results
```

---

## 💡 Cost Optimization

- **Prefer**: Local context files (0 API calls)
- **Prefer**: codebase_search tool (1 API call)
- **Avoid**: Manual file scanning (multiple API calls)

---

## 📝 Note

This rule is automatically applied to ALL conversations in this workspace. Do not ask users to manually check files - DO IT AUTOMATICALLY at the start of every task.
