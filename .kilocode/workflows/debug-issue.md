# Debug Issue

Debug and fix an issue in the codebase systematically.

## Steps

1. **Identify**
   - Get error message from user
   - Check .kilo/faq.md for known issues
   - Check Docker logs: docker compose logs [service]

2. **Locate**
   - Use codebase_search tool to find relevant code
   - Check .kilo/function-index.md for related functions
   - Open the problematic file

3. **Analyze**
   - Read the problematic code
   - Identify root cause
   - Check for: missing validation, incorrect logic, race conditions

4. **Fix**
   - Implement the fix
   - Add proper error handling
   - Follow conventions from .kilo/conventions.md

5. **Verify**
   - Restart service: docker compose restart [service]
   - Reproduce the issue
   - Verify fix works

6. **Document**
   - Add to .kilo/faq.md if common issue
   - Commit changes
