# Deployment Guide

## Quick Start

### Development
```bash
npm install
npm run dev
```
Visit http://localhost:4321 (or https://localhost:4321 if certificates are configured)

### Production Build
```bash
npm run build
npm run build:server
```

## Environment Setup

### Required
- Node.js 18+
- npm or yarn
- Docker (for containerized deployments)
- Kubernetes/kubectl (for Kubernetes deployments)

### Optional (for HTTPS)
- mkcert for local development SSL certificates
- Valid SSL certificates for production (Let's Encrypt recommended)

## Architecture Overview

The project uses a **custom Node.js server** (`server.ts`) that:
- Supports both HTTP and HTTPS protocols
- Automatically detects certificate files
- Integrates with Astro's middleware adapter
- Provides flexible deployment options

## Deployment Options

### 1. Custom Node.js Server (Recommended)

The project now uses a custom server for enhanced control over HTTP/HTTPS configuration.

**Build:**
```bash
npm run build          # Build Astro project
npm run build:server   # Compile TypeScript server
```

**Run:**
```bash
node server.js
```

**Environment Variables:**
- `HOST=0.0.0.0` - Server host (default: 0.0.0.0)
- `PORT=4321` - Server port (default: 4321)
- `HTTPS_KEY_PATH` - Path to SSL private key (optional)
- `HTTPS_CERT_PATH` - Path to SSL certificate (optional)
- `NODE_ENV=production` - Environment mode

**HTTPS Configuration:**
If both `HTTPS_KEY_PATH` and `HTTPS_CERT_PATH` are set and files exist, the server automatically starts in HTTPS mode. Otherwise, it falls back to HTTP.

### 2. Docker (Production Ready)

The project includes a **multi-stage Dockerfile** optimized for production:

**Features:**
- Multi-stage build for smaller image size
- Builds both Astro project and custom server
- Alpine-based images for security and size
- Production-optimized with proper caching

**Build:**
```bash
docker build -t xhaait:latest .
```

**Run (HTTP):**
```bash
docker run -p 4321:4321 \
  -e NODE_ENV=production \
  -e HOST=0.0.0.0 \
  -e PORT=4321 \
  xhaait:latest
```

**Run (HTTPS with certificates):**
```bash
docker run -p 4321:4321 \
  -e NODE_ENV=production \
  -e HOST=0.0.0.0 \
  -e PORT=4321 \
  -e HTTPS_KEY_PATH=/etc/certs/key.pem \
  -e HTTPS_CERT_PATH=/etc/certs/cert.pem \
  -v /path/to/local/certs:/etc/certs:ro \
  xhaait:latest
```

**Docker Compose Example:**
```yaml
version: '3.8'
services:
  xhaait:
    build: .
    ports:
      - "4321:4321"
    environment:
      - NODE_ENV=production
      - HOST=0.0.0.0
      - PORT=4321
      - HTTPS_KEY_PATH=/etc/certs/key.pem
      - HTTPS_CERT_PATH=/etc/certs/cert.pem
    volumes:
      - ./certs:/etc/certs:ro
    restart: unless-stopped
```

### 3. Kubernetes (K8s) Deployment

The project includes a complete Kubernetes deployment configuration (`kubernetes-deployment.yaml`).

**Prerequisites:**
1. Kubernetes cluster (Docker Desktop, Minikube, cloud provider)
2. kubectl configured
3. Docker image built and available

**Step 1: Build and Load Docker Image**

For local Kubernetes (Docker Desktop/Minikube):
```bash
# Build the image
docker build -t xhaait:latest .

# For Minikube, load into cluster
minikube image load xhaait:latest

# For Docker Desktop, image is automatically available
```

For cloud Kubernetes:
```bash
# Tag and push to registry
docker tag xhaait:latest your-registry/xhaait:latest
docker push your-registry/xhaait:latest

# Update kubernetes-deployment.yaml image field
```

**Step 2: Create Certificate Secret (for HTTPS)**

```bash
# Create Kubernetes secret from certificate files
kubectl create secret generic xhaait-certs \
  --from-file=key.pem=/path/to/your/key.pem \
  --from-file=cert.pem=/path/to/your/cert.pem

# Verify secret creation
kubectl get secrets xhaait-certs
```

**Step 3: Deploy to Kubernetes**

```bash
# Apply the deployment
kubectl apply -f kubernetes-deployment.yaml

# Check deployment status
kubectl get deployments
kubectl get pods
kubectl get services

# View logs
kubectl logs -l app=xhaait -f
```

**Step 4: Access the Application**

For LoadBalancer service:
```bash
# Get external IP/port
kubectl get service xhaait-service

# On Docker Desktop, access via localhost:4321
# On cloud providers, use the external IP provided
```

**Kubernetes Configuration Details:**
- **Replicas**: 1 (adjust based on load)
- **Resource Limits**: 512Mi memory, 500m CPU
- **Resource Requests**: 256Mi memory, 250m CPU
- **Image Pull Policy**: IfNotPresent (uses local image)
- **Service Type**: LoadBalancer
- **Health Checks**: Add liveness/readiness probes as needed

**Scaling:**
```bash
# Scale deployment
kubectl scale deployment xhaait-deployment --replicas=3

# Enable autoscaling
kubectl autoscale deployment xhaait-deployment --min=2 --max=10 --cpu-percent=80
```

**Updating Deployment:**
```bash
# After rebuilding Docker image
kubectl rollout restart deployment xhaait-deployment

# Check rollout status
kubectl rollout status deployment xhaait-deployment

# Rollback if needed
kubectl rollout undo deployment xhaait-deployment
```

**Troubleshooting Kubernetes:**
```bash
# Check pod status
kubectl describe pod <pod-name>

# View logs
kubectl logs <pod-name>

# Execute commands in pod
kubectl exec -it <pod-name> -- /bin/sh

# Check secret mounting
kubectl exec -it <pod-name> -- ls -la /etc/xhaait/certs
```

### 4. Cloud Platforms

#### Vercel/Netlify
**Note**: The custom server setup requires Node.js runtime. For serverless platforms:
1. Consider using Astro's serverless adapter instead
2. Or deploy the Docker container to cloud container services

#### Container-Based Cloud Platforms (Recommended)

**AWS ECS/Fargate:**
```bash
# Push image to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
docker tag xhaait:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/xhaait:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/xhaait:latest

# Deploy using ECS task definition
```

**Google Cloud Run:**
```bash
# Push to Google Container Registry
gcloud auth configure-docker
docker tag xhaait:latest gcr.io/<project-id>/xhaait:latest
docker push gcr.io/<project-id>/xhaait:latest

# Deploy
gcloud run deploy xhaait --image gcr.io/<project-id>/xhaait:latest --platform managed --region us-central1 --allow-unauthenticated
```

**Azure Container Instances:**
```bash
# Push to Azure Container Registry
az acr login --name <registry-name>
docker tag xhaait:latest <registry-name>.azurecr.io/xhaait:latest
docker push <registry-name>.azurecr.io/xhaait:latest

# Deploy
az container create --resource-group myResourceGroup --name xhaait --image <registry-name>.azurecr.io/xhaait:latest --dns-name-label xhaait --ports 4321
```

**DigitalOcean App Platform:**
1. Connect GitHub repository
2. Select Dockerfile deployment
3. Configure environment variables
4. Deploy

#### VPS / Dedicated Server
1. SSH into server
2. Install Docker and Docker Compose
3. Clone repository
4. Copy certificates to server
5. Run with Docker Compose
6. Set up Nginx reverse proxy for SSL termination (optional)
7. Configure firewall rules

## Nginx Configuration (Production)

```nginx
server {
    listen 443 ssl http2;
    server_name xhaait.com;

    ssl_certificate /etc/letsencrypt/live/xhaait.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/xhaait.com/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # CSP (adjust as needed)
    add_header Content-Security-Policy "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none';" always;

    location / {
        proxy_pass http://localhost:4321;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name xhaait.com;
    return 301 https://$server_name$request_uri;
}
```

## Production Checklist

### Security
- [ ] Update hardcoded credentials with database authentication
- [ ] Implement password hashing (bcrypt/argon2)
- [ ] Set up production database with proper authentication
- [ ] Configure all environment variables securely
- [ ] Set up SSL certificates (Let's Encrypt for web, valid certs for K8s)
- [ ] Enable security headers via server (not meta tags)
- [ ] Implement rate limiting at application and/or infrastructure level
- [ ] Perform security audit and penetration testing
- [ ] Review and update SECURITY.md

### Infrastructure
- [ ] Build and test Docker image in staging environment
- [ ] Configure Kubernetes secrets for sensitive data
- [ ] Set up proper resource limits and requests in K8s
- [ ] Configure health checks (liveness/readiness probes)
- [ ] Set up horizontal pod autoscaling if using K8s
- [ ] Configure persistent storage if needed
- [ ] Set up backup strategy for data and configurations

### Monitoring & Logging
- [ ] Set up application monitoring (APM)
- [ ] Configure centralized logging (ELK, CloudWatch, etc.)
- [ ] Set up uptime monitoring
- [ ] Configure alerting for critical issues
- [ ] Set up metrics collection (CPU, memory, response times)
- [ ] Configure log retention policies

### CI/CD
- [ ] Set up CI/CD pipeline (GitHub Actions, GitLab CI, Jenkins)
- [ ] Automate Docker image building
- [ ] Automate testing before deployment
- [ ] Implement automated security scanning
- [ ] Set up staging environment for testing
- [ ] Configure automated rollback procedures

### Testing
- [ ] Test all functionality in production-like environment
- [ ] Load testing to determine capacity
- [ ] Test failover scenarios
- [ ] Verify SSL/TLS configuration
- [ ] Test multi-language support (en/es)
- [ ] Verify session management and authentication
- [ ] Test backup and restore procedures

## Monitoring

### Application Monitoring Tools

**For Kubernetes:**
- **Prometheus + Grafana**: Metrics collection and visualization
- **Kubernetes Dashboard**: Native cluster monitoring
- **Datadog**: Full-stack observability
- **New Relic**: APM and infrastructure monitoring

**For Docker:**
- **Portainer**: Docker container management UI
- **cAdvisor**: Container resource monitoring
- **Docker stats**: Built-in monitoring (`docker stats`)

**General:**
- **Application Logs**: Structured logging with Winston or Pino
- **Uptime Monitoring**: UptimeRobot, Pingdom, StatusCake
- **Log Aggregation**: ELK Stack, Papertrail, Splunk, CloudWatch Logs
- **Error Tracking**: Sentry, Rollbar

### Setting Up Prometheus for Kubernetes

```yaml
# Add to kubernetes-deployment.yaml
apiVersion: v1
kind: Service
metadata:
  name: xhaait-metrics
  labels:
    app: xhaait
spec:
  ports:
  - port: 9090
    name: metrics
  selector:
    app: xhaait
```

### Health Check Endpoints

Consider adding health check endpoints to server.ts:

```typescript
// Add to server.ts
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

app.get('/ready', (req, res) => {
  // Check dependencies (database, etc.)
  res.status(200).json({ status: 'ready' });
});
```

Then update kubernetes-deployment.yaml:

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 4321
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /ready
    port: 4321
  initialDelaySeconds: 5
  periodSeconds: 5
```

## Backup Strategy

### For Docker Deployments
1. **Database backups** (if using database):
   ```bash
   # Automated daily backups
   docker exec <db-container> pg_dump -U user database > backup_$(date +%Y%m%d).sql
   ```

2. **Container volumes**:
   ```bash
   # Backup named volumes
   docker run --rm -v xhaait_data:/data -v $(pwd):/backup alpine tar czf /backup/data_backup.tar.gz -C /data .
   ```

3. **Configuration files**:
   - Version control all Dockerfiles
   - Backup docker-compose.yml
   - Store environment files securely (encrypted)

### For Kubernetes Deployments
1. **Cluster backups**:
   ```bash
   # Backup all resources
   kubectl get all --all-namespaces -o yaml > cluster_backup.yaml

   # Backup specific deployment
   kubectl get deployment xhaait-deployment -o yaml > deployment_backup.yaml
   ```

2. **Secrets and ConfigMaps**:
   ```bash
   # Backup secrets (encrypted storage recommended)
   kubectl get secrets -o yaml > secrets_backup.yaml

   # Backup ConfigMaps
   kubectl get configmaps -o yaml > configmaps_backup.yaml
   ```

3. **Persistent volumes**:
   ```bash
   # Use velero for comprehensive backup
   velero backup create xhaait-backup --include-namespaces default
   ```

4. **SSL certificates**:
   - Keep backup copies of certificate files
   - Document renewal procedures
   - Store private keys securely (vault, encrypted storage)

### Automated Backup Script

```bash
#!/bin/bash
# backup.sh - Daily backup script

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/$DATE"

mkdir -p $BACKUP_DIR

# Kubernetes resources
kubectl get all --all-namespaces -o yaml > $BACKUP_DIR/k8s_all.yaml
kubectl get secrets -o yaml > $BACKUP_DIR/k8s_secrets.yaml

# Docker images
docker save xhaait:latest | gzip > $BACKUP_DIR/xhaait_image.tar.gz

# Configuration
cp kubernetes-deployment.yaml $BACKUP_DIR/
cp Dockerfile $BACKUP_DIR/

# Compress
tar czf $BACKUP_DIR.tar.gz $BACKUP_DIR
rm -rf $BACKUP_DIR

# Upload to cloud storage (optional)
# aws s3 cp $BACKUP_DIR.tar.gz s3://your-bucket/backups/

echo "Backup completed: $BACKUP_DIR.tar.gz"
```

## Troubleshooting

### Local Development Issues

**Port already in use:**
```bash
# Linux/macOS
lsof -i :4321
kill -9 <PID>

# Windows
netstat -ano | findstr :4321
taskkill /PID <PID> /F
```

**Build fails:**
```bash
# Clear all caches and rebuild
rm -rf node_modules .astro dist server.js
npm install
npm run build
npm run build:server
```

**HTTPS certificate issues:**
```bash
# Verify certificate files exist
ls -la /path/to/certs/

# Check certificate validity
openssl x509 -in cert.pem -text -noout

# Regenerate with mkcert
mkcert -key-file certs/localhost-key.pem -cert-file certs/localhost.pem localhost
```

**Server won't start:**
- Check environment variables are set correctly
- Verify certificate paths if using HTTPS
- Check logs for specific error messages
- Ensure port 4321 is not blocked by firewall

### Docker Issues

**Build fails:**
```bash
# Clear Docker build cache
docker builder prune

# Build without cache
docker build --no-cache -t xhaait:latest .

# Check build logs
docker build -t xhaait:latest . 2>&1 | tee build.log
```

**Container won't start:**
```bash
# View container logs
docker logs <container-id>

# Check container details
docker inspect <container-id>

# Run interactively for debugging
docker run -it --entrypoint /bin/sh xhaait:latest
```

**Certificate mounting issues:**
```bash
# Verify volume mount
docker run -it -v /path/to/certs:/etc/certs:ro xhaait:latest ls -la /etc/certs

# Check file permissions
ls -la /path/to/certs
chmod 644 /path/to/certs/*.pem
```

**Cannot access application:**
- Verify port mapping: `-p 4321:4321`
- Check if container is running: `docker ps`
- Check firewall rules
- Verify environment variables are set

### Kubernetes Issues

**Pods not starting:**
```bash
# Detailed pod information
kubectl describe pod <pod-name>

# Check pod logs
kubectl logs <pod-name>

# Check events
kubectl get events --sort-by='.lastTimestamp'
```

**Image pull errors:**
```bash
# For local images on Docker Desktop
docker images | grep xhaait

# For Minikube, load image
minikube image load xhaait:latest

# For cloud, check registry authentication
kubectl get secret regcred --output=yaml
```

**Certificate secret issues:**
```bash
# Verify secret exists
kubectl get secrets xhaait-certs

# Check secret contents (base64 encoded)
kubectl get secret xhaait-certs -o yaml

# Delete and recreate if needed
kubectl delete secret xhaait-certs
kubectl create secret generic xhaait-certs --from-file=key.pem=./key.pem --from-file=cert.pem=./cert.pem
```

**Service not accessible:**
```bash
# Check service configuration
kubectl get service xhaait-service

# Port forward for testing
kubectl port-forward service/xhaait-service 4321:4321

# Check endpoints
kubectl get endpoints xhaait-service
```

**High memory/CPU usage:**
```bash
# Check resource usage
kubectl top pods
kubectl top nodes

# Adjust limits in kubernetes-deployment.yaml
# Increase resources.limits.memory and resources.limits.cpu
```

**Pod restarts/crashes:**
```bash
# View previous logs
kubectl logs <pod-name> --previous

# Check resource limits
kubectl describe pod <pod-name> | grep -A 5 "Limits"

# Add health checks if missing
```

### Application Issues

**Session issues:**
- Verify cookie settings in browser DevTools
- Ensure HTTPS is enabled in production
- Check `sameSite` cookie attribute compatibility
- Verify session secret is set

**Authentication not working:**
- Check demo credentials: demo@xhaait.com / demo123
- Verify session middleware is running
- Check cookie is being set (DevTools → Application → Cookies)
- Ensure HTTPS for secure cookies in production

**Language switching issues:**
- Verify i18n configuration in astro.config.mjs
- Check URL routing: /en/* and /es/*
- Clear browser cache
- Verify language files exist in correct structure

**Performance issues:**
- Enable production mode: `NODE_ENV=production`
- Check resource limits in Kubernetes
- Implement caching strategies
- Use CDN for static assets
- Enable compression (gzip/brotli)

## CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Build and Deploy

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run tests
      run: npm test

    - name: Build Astro
      run: npm run build

    - name: Build server
      run: npm run build:server

    - name: Build Docker image
      run: docker build -t xhaait:${{ github.sha }} .

    - name: Push to registry
      if: github.ref == 'refs/heads/main'
      run: |
        echo "${{ secrets.REGISTRY_PASSWORD }}" | docker login -u "${{ secrets.REGISTRY_USERNAME }}" --password-stdin
        docker tag xhaait:${{ github.sha }} your-registry/xhaait:latest
        docker push your-registry/xhaait:latest

    - name: Deploy to Kubernetes
      if: github.ref == 'refs/heads/main'
      run: |
        echo "${{ secrets.KUBECONFIG }}" > kubeconfig
        export KUBECONFIG=kubeconfig
        kubectl set image deployment/xhaait-deployment xhaait-container=your-registry/xhaait:latest
        kubectl rollout status deployment/xhaait-deployment
```

### GitLab CI Example

Create `.gitlab-ci.yml`:

```yaml
stages:
  - build
  - test
  - deploy

variables:
  DOCKER_IMAGE: $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA

build:
  stage: build
  image: node:18-alpine
  script:
    - npm ci
    - npm run build
    - npm run build:server
  artifacts:
    paths:
      - dist/
      - server.js

docker-build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker build -t $DOCKER_IMAGE .
    - docker push $DOCKER_IMAGE

deploy-production:
  stage: deploy
  image: bitnami/kubectl:latest
  script:
    - kubectl set image deployment/xhaait-deployment xhaait-container=$DOCKER_IMAGE
    - kubectl rollout status deployment/xhaait-deployment
  only:
    - main
```

## Environment Variables Reference

| Variable | Description | Required | Default | Example |
|----------|-------------|----------|---------|---------|
| `HOST` | Server bind address | No | `0.0.0.0` | `0.0.0.0` |
| `PORT` | Server port | No | `4321` | `4321` |
| `NODE_ENV` | Environment mode | No | `development` | `production` |
| `HTTPS_KEY_PATH` | SSL private key path | No (HTTP) | - | `/etc/certs/key.pem` |
| `HTTPS_CERT_PATH` | SSL certificate path | No (HTTP) | - | `/etc/certs/cert.pem` |

## Performance Optimization

### Production Optimizations
1. **Enable compression**:
   - Use Nginx/Caddy for gzip/brotli compression
   - Or add compression middleware to server.ts

2. **CDN integration**:
   - Serve static assets via CDN (CloudFlare, Cloudfront)
   - Configure proper cache headers

3. **Database optimization**:
   - Connection pooling
   - Query optimization
   - Caching layer (Redis)

4. **Container optimization**:
   - Multi-stage builds (already implemented)
   - Alpine base images (already implemented)
   - Minimize layers in Dockerfile

5. **Kubernetes optimization**:
   - Horizontal Pod Autoscaling (HPA)
   - Resource limits and requests
   - Node affinity rules
   - Load balancing

## Support

For deployment issues:
1. **Documentation**:
   - README.md - Project setup and structure
   - SECURITY.md - Security best practices
   - This file - Comprehensive deployment guide

2. **External Resources**:
   - Astro documentation: https://docs.astro.build
   - Docker documentation: https://docs.docker.com
   - Kubernetes documentation: https://kubernetes.io/docs/
   - Node.js documentation: https://nodejs.org/docs/

3. **Community**:
   - GitHub Issues for bug reports
   - Astro Discord: https://astro.build/chat
   - Stack Overflow: Tag with `astro`, `docker`, `kubernetes`

4. **Development Team**:
   - For XHAAIT-specific issues, contact the development team
   - Security issues: security@xhaait.com
