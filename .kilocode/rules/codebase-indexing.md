# Codebase Indexing - AI Rule

Rule to enforce automatic codebase indexing usage for ALL AI models.

## Guidelines

- **ALWAYS use codebase_search tool FIRST** before any code search or file exploration
- **ALWAYS check .kilo/code-map.md** for file locations before searching
- **ALWAYS check .kilo/function-index.md** for function locations before searching
- **ALWAYS check .kilo/context.json** for project metadata
- **ALWAYS check .kilo/faq.md** for known issues before debugging
- **NEVER manually scan files** without checking index first
- This applies to **ALL models**: GLM-5, Claude, GPT, Haiku, Sonnet, etc.

## Quick Reference

| Task | Action |
|------|--------|
| Find file | Check `.kilo/code-map.md` first |
| Find function | Check `.kilo/function-index.md` first |
| Get project info | Check `.kilo/context.json` first |
| Debug issue | Check `.kilo/faq.md` first |
| Do a search | Use `codebase_search` tool (1 API call) |

## Why This Matters

- **70% faster** - Index is pre-built
- **90% cost reduction** - No expensive semantic searches
- **Accurate** - Index knows exact file locations
- **Model-agnostic** - Works for ALL AI models
