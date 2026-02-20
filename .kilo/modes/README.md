# Kilo AI Custom Modes

This directory contains custom mode configurations for Kilo AI.

## Available Modes

### 1. Development Mode (`dev.json`)
**Purpose:** Local development with Docker sandbox testing

**Use when:**
- Making code changes
- Adding new features
- Fixing bugs
- Testing locally

**Activate:**
```
"Switch to dev mode"
```

**Key Features:**
- Works only on local files
- Uses Docker Compose for services
- Hot reload enabled
- Local ports: 3000, 3100, 3200, 3300, 3400
- Never touches production

---

### 2. Testing Mode (`test.json`)
**Purpose:** Automated testing with browser automation

**Use when:**
- After making changes
- Before deployment
- Verifying bug fixes
- Regression testing

**Activate:**
```
"Switch to test mode"
```

**Key Features:**
- Browser automation (Puppeteer)
- API endpoint testing
- Screenshot capture
- Error detection
- Performance monitoring

---

### 3. Deployment Mode (`deploy.json`)
**Purpose:** Safe automated deployment to production

**Use when:**
- All tests pass
- Deploying new features
- Deploying bug fixes

**Activate:**
```
"Switch to deploy mode"
```

**Key Features:**
- Pre-deployment safety checks
- GitHub integration
- Automatic backup
- Health checks
- Automatic rollback on failure

---

## Quick Start

1. **Development:**
   ```
   "Switch to dev mode"
   "Start local services"
   ```

2. **Testing:**
   ```
   "Switch to test mode"
   "Run all tests"
   ```

3. **Deployment:**
   ```
   "Switch to deploy mode"
   "Deploy to production"
   ```

## Complete Documentation

See [`KILO_AI_MODES_GUIDE.md`](../../KILO_AI_MODES_GUIDE.md) for complete documentation.

## Configuration

Modes are configured in `.vscode/settings.json`:
```json
{
  "kilo.modes.enabled": true,
  "kilo.modes.directory": ".kilo/modes",
  "kilo.modes.default": "dev"
}
```

## Mode Files

- [`dev.json`](dev.json) - Development mode configuration
- [`test.json`](test.json) - Testing mode configuration
- [`deploy.json`](deploy.json) - Deployment mode configuration

## Workflow

```
Development → Testing → Deployment
    ↓           ↓           ↓
  Local      Automated   Production
  Docker     Tests       Server
```

---

**Last Updated:** 2026-02-15
