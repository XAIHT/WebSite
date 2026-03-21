# XAIHT - eXtended Artificial Intelligence Humanly Tempered

A secure, multilingual web application built with [Astro](https://astro.build/) for a technological research company. The site supports English and Spanish languages and includes a landing page, robust authentication system (Local + Google SSO), and user panel. It relies on a hyper-optimized dynamic routing architecture (`[lang]`) to serve localized content without code duplication. It ships with a custom Node.js server supporting HTTP/HTTPS, Docker multi-stage builds, Kubernetes manifests, and a Jenkins CI/CD pipeline.

## Features

- **Dynamic i18n Routing**: Unified, parameterized routing (`[lang]`) to serve multiple languages dynamically without duplicated code.
- **Multilingual Support**: Full internationalization (i18n) with English and Spanish language dictionaries.
- **Secure Authentication**: Session-based local authentication with httpOnly, secure cookies, and `crypto.randomUUID()` session IDs.
- **Google OAuth Integration**: Built-in UI and architecture elements for Google Single Sign-On (SSO) integration.
- **Registration Flow**: Complete sign-up architecture parallel to the login system.
- **Security Headers**: Comprehensive security headers (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy).
- **Dark/Light Theme**: User-selectable theme with localStorage persistence, fully styling all form components.
- **Responsive Design**: Mobile-first responsive design with scoped CSS.
- **Server-Side Rendering**: SSR via `@astrojs/node` adapter in middleware mode.
- **Custom HTTPS Server**: Standalone Node.js server (`server.ts`) with automatic HTTP/HTTPS detection.
- **Containerized Deployment**: Multi-stage Docker builds on Alpine Linux.
- **Kubernetes Ready**: Deployment manifests with LoadBalancer service, secrets, and resource limits.
- **CI/CD Pipeline**: Jenkins pipeline for automated deployment.
- **Vulnerability Scanning**: Snyk integration for container security scanning.

## Prerequisites

- Node.js 18 or higher
- npm package manager
- Docker (for containerized deployment)
- kubectl (for Kubernetes deployment)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/angelahack1/XAIHT.git
cd XAIHT
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:4321`

## Project Structure

```
/
├── public/
│   └── favicon.svg
├── src/
│   ├── layouts/
│   │   └── Layout.astro          # Main layout with nav, footer, and theme toggle
│   ├── lib/
│   │   └── i18n.ts               # Internationalization utilities (EN/ES)
│   ├── middleware.ts             # Route protection middleware
│   └── pages/
│       ├── index.astro           # Root redirect to default language route
│       └── [lang]/               # Dynamic routing mapped sequentially to active locales
│           ├── index.astro       # Localized landing page
│           ├── login.astro       # Localized login page with Google SSO
│           ├── register.astro    # Localized registration entry
│           ├── panel.astro       # Localized user panel (protected)
│           └── logout.ts         # Logout API endpoint
├── server.ts                     # Custom Node.js server (HTTP/HTTPS)
├── Dockerfile                    # Multi-stage Docker build (node:18-alpine)
├── Jenkinsfile                   # CI/CD pipeline definition
├── kubernetes-deployment.yaml    # K8s Deployment + LoadBalancer Service
├── astro.config.mjs              # Astro config (SSR, i18n, HTTPS)
├── GoogleOauthSetup.md           # Instructions for configuring Google Sign-In assets
├── DEPLOYMENT.md                 # Detailed deployment guide
└── SECURITY.md                   # Security documentation and checklists
```

### Key Files

- **src/pages/[lang]/**: Replaces rigid static folder implementations (`en`, `es`) with a unified dynamically-generated Astro parameterization engine based on `i18n` logic.
- **GoogleOauthSetup.md**: Step-by-step instructions on initializing your OAuth `Client ID` and `Client Secret` through the Google Developer Console.
- **server.ts**: Custom Node.js server that auto-detects SSL certificates from environment variables (`HTTPS_KEY_PATH`, `HTTPS_CERT_PATH`) and falls back to HTTP when unavailable
- **src/middleware.ts**: Protects parameterized `/panel` routes, redirecting unauthenticated users to login safely.
- **Dockerfile**: Multi-stage production build -- builder stage compiles Astro and the custom server, runtime stage uses a minimal Alpine image

## Security Features

### Authentication
- Configured routes for both typical Local Session validation and Google SSO authentication mechanisms.
- Session validation utilizes secure, httpOnly cookies.
- Demo credentials: `demo@xaiht.com` / `demo123`
- Protected routes with automatic redirect to login.

### Security Headers
- **Content Security Policy (CSP)**: Restricts resource loading
- **X-Content-Type-Options**: Prevents MIME-sniffing
- **X-Frame-Options**: Prevents clickjacking
- **X-XSS-Protection**: Enables browser XSS protection
- **Referrer Policy**: Controls referrer information

### Cookie Security
- `httpOnly`: Prevents JavaScript access
- `secure`: HTTPS only (in production)
- `sameSite: strict`: CSRF protection
- Limited lifespan (24 hours)

For the full security analysis, see [SECURITY.md](./SECURITY.md).

## HTTPS Configuration

The project includes a **custom server** (server.ts) that automatically supports both HTTP and HTTPS based on environment configuration. Let's Encrypt + Nginx proxy or automatic container SSL environments are heavily documented in [DEPLOYMENT.md](./DEPLOYMENT.md).

## npm Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `npm run dev` | `astro dev` | Start development server with hot reload |
| `npm run build` | `astro check && astro build` | Type-check and build Astro to `dist/` |
| `npm run build:server` | `esbuild server.ts ...` | Compile custom server to `server.js` |
| `npm run preview` | `astro preview` | Preview production build locally |
| `npm run scan` | `snyk container test ...` | Scan Docker image for vulnerabilities |

## Build for Production

```bash
# Build Astro project (runs type-check first)
npm run build

# Build custom server
npm run build:server
```

## Deployment

The project supports robust CI automation pipelines and standalone containerization. Refer to [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment capabilities stretching from standard PM2 process handling to integrated Kubernetes orchestrations. 

## Available Routes

| Route | Language | Protected | Description |
|-------|----------|-----------|-------------|
| `/` | -- | No | Redirects to default language config |
| `/[lang]` | Dynamic (EN/ES) | No | Landing page |
| `/[lang]/login` | Dynamic | No | Login form & Google SSO |
| `/[lang]/register` | Dynamic | No | User registration form & Google SSO |
| `/[lang]/panel` | Dynamic | Yes | Encrypted User Dashboard |
| `/[lang]/logout` | Dynamic | -- | Session cleanup endpoint |

## Demo Credentials

- **Email**: demo@xaiht.com
- **Password**: demo123

## Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | [Astro](https://astro.build/) | ^5.16.15 |
| SSR Adapter | @astrojs/node | ^9.1.0 |
| Language | TypeScript | ^5.7.3 |
| Server Compiler | esbuild | ^0.27.3 |
| Security Scanner | Snyk | ^1.1294.0 |
| Runtime | Node.js (Alpine) | 18 |
| Container | Docker | Multi-stage |
| Orchestration | Kubernetes | -- |
| CI/CD | Jenkins | -- |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `HOST` | `0.0.0.0` | Server bind address |
| `PORT` | `4321` | Server port |
| `NODE_ENV` | -- | Set to `production` for production builds |
| `HTTPS_KEY_PATH` | -- | Path to SSL private key (optional) |
| `HTTPS_CERT_PATH` | -- | Path to SSL certificate (optional) |

## Security Best Practices

1. **Environment Variables**: Store sensitive data (Google SSO secrets) in environment variables, never code.
2. **Database Authentication**: Replace demo credentials with a database-backed auth system.
3. **Password Hashing**: Use bcrypt or argon2 for password hashing.
4. **Rate Limiting**: Implement rate limiting for login attempts.

For the complete security checklist, see [SECURITY.md](./SECURITY.md).

## License

All rights reserved - XAIHT 2026-2027

## Contributing

This is a private project for XAIHT. For questions or support, contact the development team.
