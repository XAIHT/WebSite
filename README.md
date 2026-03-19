# XAIHT - eXtended Artificial Intelligence Humanly Tempered

A secure, multilingual web application built with [Astro](https://astro.build/) for a technological research company. The site supports English and Spanish languages and includes a landing page, login system, and user panel. It ships with a custom Node.js server supporting HTTP/HTTPS, Docker multi-stage builds, Kubernetes manifests, and a Jenkins CI/CD pipeline.

## Features

- **Multilingual Support**: Full internationalization (i18n) with English and Spanish (200+ translation keys)
- **Secure Authentication**: Session-based authentication with httpOnly, secure cookies and `crypto.randomUUID()` session IDs
- **Security Headers**: Comprehensive security headers (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
- **Dark/Light Theme**: User-selectable theme with localStorage persistence
- **Responsive Design**: Mobile-first responsive design with scoped CSS
- **Server-Side Rendering**: SSR via `@astrojs/node` adapter in middleware mode
- **Custom HTTPS Server**: Standalone Node.js server (`server.ts`) with automatic HTTP/HTTPS detection
- **Containerized Deployment**: Multi-stage Docker builds on Alpine Linux
- **Kubernetes Ready**: Deployment manifests with LoadBalancer service, secrets, and resource limits
- **CI/CD Pipeline**: Jenkins pipeline for automated deployment
- **Vulnerability Scanning**: Snyk integration for container security scanning

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
│   ├── middleware.ts              # Route protection middleware
│   └── pages/
│       ├── index.astro           # Root redirect to /en
│       ├── en/
│       │   ├── index.astro       # English landing page
│       │   ├── login.astro       # English login page (POST handler)
│       │   ├── panel.astro       # English user panel (protected)
│       │   └── logout.ts         # Logout API endpoint
│       └── es/
│           ├── index.astro       # Spanish landing page
│           ├── login.astro       # Spanish login page (POST handler)
│           ├── panel.astro       # Spanish user panel (protected)
│           └── logout.ts         # Logout API endpoint
├── server.ts                     # Custom Node.js server (HTTP/HTTPS)
├── Dockerfile                    # Multi-stage Docker build (node:18-alpine)
├── Jenkinsfile                   # CI/CD pipeline definition
├── kubernetes-deployment.yaml    # K8s Deployment + LoadBalancer Service
├── astro.config.mjs              # Astro config (SSR, i18n, HTTPS)
├── package.json
├── tsconfig.json
├── DEPLOYMENT.md                 # Detailed deployment guide
└── SECURITY.md                   # Security documentation and checklists
```

### Key Files

- **server.ts**: Custom Node.js server that auto-detects SSL certificates from environment variables (`HTTPS_KEY_PATH`, `HTTPS_CERT_PATH`) and falls back to HTTP when unavailable
- **src/middleware.ts**: Protects `/en/panel` and `/es/panel` routes, redirecting unauthenticated users to login
- **Dockerfile**: Multi-stage production build -- builder stage compiles Astro and the custom server, runtime stage uses a minimal Alpine image
- **kubernetes-deployment.yaml**: Deployment with resource limits (512Mi/500m), certificate secrets, and a LoadBalancer service on port 4321
- **Jenkinsfile**: Pipeline that cleans previous K8s resources and redeploys the manifest

## Security Features

### Authentication
- Session-based authentication using secure, httpOnly cookies
- Demo credentials: `demo@xaiht.com` / `demo123`
- Protected routes with automatic redirect to login

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

The project includes a **custom server** (server.ts) that automatically supports both HTTP and HTTPS based on environment configuration.

### Development with HTTPS

For local development with HTTPS, use `mkcert` to create local SSL certificates:

1. **Install mkcert:**
```bash
# macOS
brew install mkcert

# Windows
choco install mkcert

# Linux
sudo apt install libnss3-tools
wget https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-linux-amd64
chmod +x mkcert-v1.4.4-linux-amd64
sudo mv mkcert-v1.4.4-linux-amd64 /usr/local/bin/mkcert
```

2. **Create and install local CA:**
```bash
mkcert -install
```

3. **Generate certificates:**
```bash
mkdir -p certs
mkcert -key-file certs/localhost-key.pem -cert-file certs/localhost.pem localhost 127.0.0.1 ::1
```

4. **Start development server:**
```bash
npm run dev
```

The `astro.config.mjs` is pre-configured to automatically detect certificates at:
- `HTTPS_KEY_PATH` environment variable OR
- Default Windows path: `C:/Users/angel/certs/localhost-key.pem`
- Default cert path: `C:/Users/angel/certs/localhost.pem`

5. **Access your site:**
- With HTTPS: `https://localhost:4321`
- Without certificates: `http://localhost:4321`

### Custom Certificate Paths

Set environment variables to use custom certificate locations:

```bash
# Linux/macOS
export HTTPS_KEY_PATH=/path/to/key.pem
export HTTPS_CERT_PATH=/path/to/cert.pem
npm run dev

# Windows (PowerShell)
$env:HTTPS_KEY_PATH="C:\path\to\key.pem"
$env:HTTPS_CERT_PATH="C:\path\to\cert.pem"
npm run dev
```

### Production HTTPS Deployment

#### Option 1: Custom Server with Certificates (Direct HTTPS)

The custom server supports native HTTPS:

```bash
# Set certificate environment variables
export HTTPS_KEY_PATH=/path/to/production/key.pem
export HTTPS_CERT_PATH=/path/to/production/cert.pem
export NODE_ENV=production

# Run server (will automatically use HTTPS)
node server.js
```

**In Docker:**
```bash
docker run -p 4321:4321 \
  -e HTTPS_KEY_PATH=/etc/certs/key.pem \
  -e HTTPS_CERT_PATH=/etc/certs/cert.pem \
  -e NODE_ENV=production \
  -v /path/to/certs:/etc/certs:ro \
  xaiht:latest
```

**In Kubernetes:**
```bash
# Certificate already mounted via secret in kubernetes-deployment.yaml
kubectl apply -f kubernetes-deployment.yaml
```

#### Option 2: Reverse Proxy (Recommended for VPS)

Use Nginx or Caddy for SSL termination and additional features:

**With Nginx and Let's Encrypt:**
```bash
# Get certificate
sudo certbot --nginx -d xaiht.com

# Nginx will automatically proxy to http://localhost:4321
# See DEPLOYMENT.md for complete Nginx configuration
```

**With Caddy (automatic HTTPS):**
```yaml
# docker-compose.yml
version: '3.8'
services:
  xaiht:
    build: .
    expose:
      - 4321
    environment:
      - NODE_ENV=production

  caddy:
    image: caddy:latest
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data

volumes:
  caddy_data:
```

```caddyfile
# Caddyfile
xaiht.com {
    reverse_proxy xaiht:4321
}
```

#### Option 3: Cloud Platforms

**Container-based (supports custom server):**
- AWS ECS/Fargate (with Application Load Balancer)
- Google Cloud Run (automatic HTTPS)
- Azure Container Instances (with Application Gateway)
- DigitalOcean App Platform

**Serverless (requires Astro serverless adapter):**
- Vercel
- Netlify
- Cloudflare Pages

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

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

This generates:
- `dist/client/` - Static assets (HTML, CSS, JS bundles)
- `dist/server/` - Server-side route handlers and middleware
- `server.js` - Compiled custom Node.js server

## Deployment

The project supports multiple deployment options:

### 1. Docker (Recommended)

**Build and run:**
```bash
# Build Docker image
docker build -t xaiht:latest .

# Run container (HTTP)
docker run -p 4321:4321 xaiht:latest

# Run container (HTTPS)
docker run -p 4321:4321 \
  -e HTTPS_KEY_PATH=/etc/certs/key.pem \
  -e HTTPS_CERT_PATH=/etc/certs/cert.pem \
  -v /path/to/certs:/etc/certs:ro \
  xaiht:latest
```

### 2. Kubernetes

**Deploy to Kubernetes:**
```bash
# Build and load image (for local K8s)
docker build -t xaiht:latest .

# Create certificate secret
kubectl create secret generic xaiht-certs \
  --from-file=key.pem=/path/to/key.pem \
  --from-file=cert.pem=/path/to/cert.pem

# Deploy
kubectl apply -f kubernetes-deployment.yaml

# Access via LoadBalancer
kubectl get service xaiht-service
```

**Features:**
- LoadBalancer service on port 4321
- Certificate mounting via Kubernetes secrets
- Resource limits: 512Mi memory, 500m CPU
- Configurable replicas and autoscaling

### 3. Node.js Server

**Run directly with Node.js:**
```bash
# Build first
npm run build
npm run build:server

# Run server
node server.js
```

**Environment Variables:**
- `HOST=0.0.0.0` - Server host
- `PORT=4321` - Server port
- `NODE_ENV=production` - Environment mode
- `HTTPS_KEY_PATH` - SSL key path (optional)
- `HTTPS_CERT_PATH` - SSL cert path (optional)

### 4. Cloud Platforms

**Container-based (Recommended):**
- AWS ECS/Fargate
- Google Cloud Run
- Azure Container Instances
- DigitalOcean App Platform

**Traditional hosting:**
- VPS with Docker/Docker Compose
- PM2 with Nginx reverse proxy

**Serverless:**
- For Vercel/Netlify, consider using Astro's serverless adapter instead of the custom server

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Available Routes

| Route | Language | Protected | Description |
|-------|----------|-----------|-------------|
| `/` | -- | No | Redirects to `/en` |
| `/en` | English | No | Landing page |
| `/en/login` | English | No | Login form (POST handler) |
| `/en/panel` | English | Yes | User dashboard |
| `/en/logout` | English | -- | Session cleanup endpoint |
| `/es` | Spanish | No | Landing page |
| `/es/login` | Spanish | No | Login form (POST handler) |
| `/es/panel` | Spanish | Yes | User dashboard |
| `/es/logout` | Spanish | -- | Session cleanup endpoint |

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

1. **Environment Variables**: Store sensitive data in environment variables, never in code
2. **Database Authentication**: Replace demo credentials with a database-backed auth system
3. **Password Hashing**: Use bcrypt or argon2 for password hashing
4. **Rate Limiting**: Implement rate limiting for login attempts
5. **Input Validation**: Always validate and sanitize user inputs
6. **Vulnerability Scanning**: Run `npm run scan` (Snyk) and `npm audit` regularly
7. **Container Scanning**: Scan Docker images before deployment with Snyk or Trivy

For the complete security checklist and documentation, see [SECURITY.md](./SECURITY.md).

## License

All rights reserved - XAIHT 2026-2027

## Contributing

This is a private project for XAIHT. For questions or support, contact the development team.
