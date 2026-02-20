# Add React Component

Add a new React component to the frontend following project conventions.

## Steps

1. **Research**
   - Check .kilo/code-map.md for frontend structure
   - Check .kilo/conventions.md for React template
   - Find similar component for reference

2. **Create Component**
   - Create file in client/pages/ or client/pages/panels/
   - Use PascalCase filename: MyComponent.jsx
   - Follow React template from .kilo/conventions.md
   - Import useGameAuth for authentication
   - Handle loading and error states

3. **Add to App**
   - Import in parent component or app.jsx
   - Add route if needed
   - Add navigation link if needed

4. **Test**
   - Run: docker compose -f docker-compose.local.yml up -d
   - Test in browser: http://localhost:3000
   - Check for console errors

5. **Update Documentation**
   - Update .kilo/code-map.md with new component
   - Update client/pages/README.md
