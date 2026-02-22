# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability, please report it by creating a private security advisory on GitHub or contacting the maintainers directly.

## Secrets Management

### Files That Should NEVER Be Committed

| File             | Description                                        |
| ---------------- | -------------------------------------------------- |
| `.env`           | Local environment with real credentials            |
| `.env.sandbox`   | Sandbox environment with MongoDB Atlas credentials |
| `.envdev`        | Development environment                            |
| `.kilocode/.env` | Kilo Code MCP secrets (GitHub tokens)              |
| `*.log`          | Log files that may contain connection strings      |
| `logs/`          | Log directory                                      |

### Required GitHub Secrets for Deployment

| Secret           | Description                                         |
| ---------------- | --------------------------------------------------- |
| `SERVER_HOST`    | Production server IP or domain                      |
| `SERVER_USER`    | SSH user (e.g., root)                               |
| `SERVER_SSH_KEY` | Private SSH key for server access                   |
| `SECRET_ACCESS`  | JWT secret for access tokens                        |
| `SECRET_REFRESH` | JWT secret for refresh tokens                       |
| `GAME_PASSWORD`  | Password to access the game                         |
| `WEB_ORIGIN`     | Production domain (e.g., https://ovidiuguru.online) |

### Environment Files Structure

```
.env.local          # Tracked - template for local development
.env.sandbox.example # Tracked - template for sandbox setup
.env.production     # Tracked - template for production
.env.sandbox        # NOT tracked - real sandbox credentials
.env                # NOT tracked - local credentials
```

## Security Best Practices

1. **Never commit secrets** - Use `.gitignore` properly
2. **Rotate credentials** - If credentials are exposed, rotate them immediately
3. **Use strong secrets** - Generate JWT secrets with `openssl rand -base64 32`
4. **Limit access** - Use IP whitelisting for MongoDB Atlas when possible
5. **Monitor logs** - Check for suspicious activity regularly

## Recent Security Fixes

- **2026-02-22**: Removed exposed GitHub token from documentation
- **2026-02-22**: Added `.log` files to `.gitignore` (contained MongoDB credentials)
- **2026-02-22**: Fixed port mismatch in microservices configuration
- **2026-02-22**: Added health check endpoint to main server

## Deployment Security

The deployment workflow uses Docker containers with:

- Isolated network (`mern-network`)
- Environment variables from `.env.production`
- Health checks for all services
- Resource limits configured

## Contact

For security concerns, please contact the repository maintainers.
