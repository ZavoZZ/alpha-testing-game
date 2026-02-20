# Kilo Code Workflow: Debug Issue

**Description:** Debug and fix an issue in the codebase  
**Steps:** 6  
**Invoke with:** `/debug` or select from workflows menu

---

## Step 1: Identify (1 min)

**Prompt:**
```
Get the error message or issue description from user
Check .kilo/faq.md for known issues
Check browser console / Docker logs for errors
```

**Expected:**
- Clear error message or issue description
- Known issue found in FAQ or need to investigate

---

## Step 2: Locate (2 min)

**Prompt:**
```
Use codebase_search to find relevant code
Check .kilo/function-index.md for related functions
Check .kilo/code-map.md for file locations
Open the problematic file(s)
```

**Expected:**
- Files identified that contain the bug
- Error location pinpointed

---

## Step 3: Analyze (2 min)

**Prompt:**
```
Read the problematic code
Identify the root cause
Check for:
- Missing validation
- Incorrect logic
- Race conditions
- Missing error handling
```

**Expected:**
- Clear understanding of what's wrong
- Proposed fix identified

---

## Step 4: Fix (3 min)

**Prompt:**
```
Implement the fix
Add proper error handling if missing
Add logging for debugging if needed
Follow conventions from .kilo/conventions.md
```

**Expected:**
- Code fix implemented
- Follows project standards

---

## Step 5: Verify (2 min)

**Prompt:**
```
Restart affected service: docker compose -f docker-compose.local.yml restart economy-server
Reproduce the issue
Verify fix works
Check for side effects
```

**Expected:**
- Issue resolved
- No new issues introduced

---

## Step 6: Document (1 min)

**Prompt:**
```
If this is a common issue, add to .kilo/faq.md
Update .kilo/function-index.md if function was changed
Commit changes with descriptive message
```

**Expected:**
- Issue documented for future reference
- Changes committed

---

## 📝 Debugging Commands

```bash
# View logs
docker compose -f docker-compose.local.yml logs -f [service]

# MongoDB
docker exec -it mongodb mongosh auth_db

# Test API
curl http://localhost:3400/economy/endpoint -H "Authorization: Bearer TOKEN"
```

---

## 🎯 Quick Reference

| Resource | File |
|----------|------|
| FAQ | `.kilo/faq.md` |
| Functions | `.kilo/function-index.md` |
| Files | `.kilo/code-map.md` |
| Conventions | `.kilo/conventions.md` |
