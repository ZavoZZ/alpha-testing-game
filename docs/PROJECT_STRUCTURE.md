# 📁 Project Structure

This document outlines the organization of the Alpha Testing Phase project.

## Root Directory Structure

```
/root/MERN-template/
├── client/              # Frontend React application
├── server/              # Backend Express server
├── microservices/       # Microservice containers
├── common/              # Shared utilities
├── docs/                # All documentation (organized by category)
├── .github/             # GitHub configuration
├── docker-compose.yml   # Docker orchestration
├── Dockerfile           # Main app Docker configuration
├── package.json         # Node.js dependencies
├── webpack.config.js    # Webpack build configuration
├── configure-script.js  # Setup configuration script
└── README.md            # Main project readme

```

## Client Structure (`/client/`)

Frontend React application with modern architecture:

```
client/
├── pages/               # React page components
│   ├── accounts/        # Account management (login, signup, etc.)
│   ├── administration/  # Admin and moderation panels
│   ├── panels/          # Reusable UI panels (footer, chat, news)
│   ├── static/          # Static pages (privacy, credits)
│   └── utilities/       # Utility components (auth providers, etc.)
├── styles/              # CSS stylesheets
├── config.js            # Client-side configuration
├── client.jsx           # Main React entry point
└── template.html        # HTML template

```

## Server Structure (`/server/`)

Backend Express application with MongoDB integration:

```
server/
├── database/            # Database configuration and models
│   ├── models/          # Mongoose models (User, etc.)
│   └── index.js         # Database connection
└── server.js            # Main Express server

```

## Microservices Structure (`/microservices/`)

Independent microservices with their own configurations:

```
microservices/
├── auth-server/         # Authentication service
│   ├── routes/          # API routes
│   ├── server.js        # Auth server entry point
│   ├── package.json     # Auth dependencies
│   └── Dockerfile       # Auth container config
├── news-server/         # News/blog service
│   ├── routes/          # API routes
│   ├── server.js        # News server entry point
│   ├── package.json     # News dependencies
│   └── Dockerfile       # News container config
└── chat-server/         # Real-time chat service
    ├── routes/          # API routes
    ├── server.js        # Chat server entry point
    ├── package.json     # Chat dependencies
    └── Dockerfile       # Chat container config

```

## Documentation Structure (`/docs/`)

All project documentation organized by category:

```
docs/
├── setup/               # Setup and configuration guides
│   ├── QUICK_START.md
│   ├── CLOUDFLARE_SETUP.md
│   ├── DOMAIN_SETUP_GUIDE.md
│   ├── SERVER_SETUP_COMPLETE.md
│   └── ACCESS_INSTRUCTIONS.md
├── architecture/        # Technical architecture documentation
│   ├── MICROSERVICES_ARCHITECTURE.md
│   ├── AUTH_SYSTEM_COMPLETE.md
│   └── SCALABILITY_ANALYSIS.md
├── features/            # Feature-specific documentation
│   ├── ADMIN_PANEL_COMPLETE.md
│   ├── CUSTOM_ADMIN_PANEL.md
│   ├── ADMIN_PANEL_SETUP.md
│   └── AUTHENTICATION_TESTING_REPORT.md
└── session-logs/        # Development session logs by date
    ├── 2026-02-10/      # First session logs
    └── 2026-02-11/      # Second session logs

```

## Key Files

### Configuration Files
- `.envdev` - Development environment variables template
- `docker-compose.yml` - Docker services orchestration
- `webpack.config.js` - Frontend build configuration
- `configure-script.js` - Project setup script

### Documentation Files
- `README.md` - Main project readme (root)
- `docs/README.md` - Documentation index
- `LICENSE` - Project license (zlib)

### Docker Files
- `Dockerfile` - Main app container configuration
- `microservices/*/Dockerfile` - Individual service containers

## Important Conventions

### Documentation
- **All `.md` files** (except README.md) go in `/docs/` subfolders
- **Setup guides** → `/docs/setup/`
- **Architecture docs** → `/docs/architecture/`
- **Feature docs** → `/docs/features/`
- **Session logs** → `/docs/session-logs/YYYY-MM-DD/`

### Code Organization
- **Client components** → `/client/pages/` (organized by functionality)
- **Shared utilities** → `/common/utilities/`
- **Database models** → `/server/database/models/`
- **Microservice routes** → `/microservices/[service]/routes/`

### Naming Conventions
- **React Components**: PascalCase (`AdminPanel.jsx`)
- **Utility Files**: kebab-case (`token-provider.jsx`)
- **Database Models**: PascalCase (`User.js`)
- **Documentation**: SCREAMING_SNAKE_CASE (`SETUP_GUIDE.md`)

## Adding New Features

When adding new features to the project:

1. **Frontend**: Add components to `/client/pages/[category]/`
2. **Backend**: Add routes/logic to appropriate microservice
3. **Database**: Add models to `/server/database/models/`
4. **Documentation**: Create docs in `/docs/features/`
5. **Tests**: Document test procedures in `/docs/features/`

## Development Workflow

1. **Local Development**: Use `.envdev` and `npm run dev`
2. **Docker Development**: Use `docker compose up --build`
3. **Production**: Deploy with Docker Compose on server
4. **Documentation**: Update docs when making significant changes

---

*This structure ensures maintainability, scalability, and clear organization.*

*Last Updated: February 11, 2026*
