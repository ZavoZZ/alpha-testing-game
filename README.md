# Alpha Testing Phase

A modern MERN stack application template for building persistent browser-based games and web applications.

## 🚀 Technology Stack

* **Frontend**: React 18 with modern hooks and context API
* **Backend**: Node.js with Express
* **Database**: MongoDB with Mongoose ODM
* **Authentication**: JWT tokens with HttpOnly cookies
* **Infrastructure**: Docker & Docker Compose
* **Microservices**: Auth, News, and Chat servers

This template is designed for persistent browser-based games (PBBGs) but is flexible enough for various web applications.

**License**: zlib (see LICENSE)

## 📚 Documentation

All project documentation is organized in the [`/docs/`](/docs/) folder:

* **[Setup Guides](/docs/setup/)** - Deployment, configuration, and quick start
* **[Architecture](/docs/architecture/)** - System design and technical architecture
* **[Features](/docs/features/)** - Feature documentation (Admin Panel, Authentication, etc.)
* **[Session Logs](/docs/session-logs/)** - Development notes organized by date

For detailed documentation, visit the [docs folder](/docs/README.md).

# Microservices

There are external components to this template referred to as "microservices". These can be omitted entirely by simply removing the React components that access them. These are also available via [docker hub](https://hub.docker.com/u/krgamestudios).

* News Server: https://github.com/krgamestudios/news-server
* Auth Server: https://github.com/krgamestudios/auth-server
* Chat Server: https://github.com/krgamestudios/chat-server

# Setup Deployment

A clean install is this easy:

```
git clone https://github.com/krgamestudios/MERN-template.git
cd MERN-template
node configure-script.js
docker compose up --build
```

# Setup Development

To set up this template in development mode:

1. Ensure MongoDB is running in your development environment
2. Run `npm install`
3. Run `cp .envdev .env` and enter your details into the `.env` file
4. Execute `npm run dev`
5. Navigate to `http://localhost:3000` in your web browser
6. Repeat this process for each microservice (linked above)

For detailed setup instructions, see [`/docs/setup/QUICK_START.md`](/docs/setup/QUICK_START.md).

# Features List

## Core Features
- **Single Language**: JavaScript/Node.js across the entire stack
- **Modern React**: Hooks, Context API, lazy loading, and code splitting
- **MongoDB Integration**: NoSQL database with Mongoose ODM
- **Docker Ready**: Complete Docker Compose setup for all services

## Authentication System (Microservice)
- Email validation and verification
- Secure login/logout with JWT tokens
- HttpOnly cookies for enhanced security
- Password recovery and reset
- Account deletion
- Role-based access control (Admin/Moderator/User)

## Admin Panel
- **Modern UI**: Beautiful, responsive admin interface
- **User Management**: View, create, ban, and delete users
- **Role Management**: Grant admin or moderator privileges
- **Real-time Statistics**: User count, admin count, banned users
- **Database Access**: Secure, password-protected admin database viewer

## News System (Microservice)
- Publish, edit, and delete articles
- Admin-controlled content management
- Article browsing and reading

## Chat System (Microservice)
- Real-time chat when logged in
- Persistent chat logs in database
- Room-based chat system (`/room name`)
- Popup chat interface

## Moderation Tools
- User banning system
- Chat-mute functionality
- User reporting for offensive content
- Comprehensive moderation dashboard

## Configuration
- Easy-to-use configuration script
- Environment-based settings
- Optional default admin account creation

# Coming Soon

- Full documentation
	- Modding tutorials
- Fully Featured News Blog (as a microservice)
	- Individual pages for news articles

# Coming Eventually

- Fully Featured News Blog (as a microservice)
	- Restore deleted articles
	- Undo edits
- Fully Featured Chat System (as a microservice)
	- Custom emoji
	- Private messaging
	- Broadcasting to all channels
	- Badges next to usernames
- Backend for leaderboards (modding tutorial?)
- Backend for energy systems (modding tutorial?)
- Backend for items, shops, trading and currency (modding tutorial?)
