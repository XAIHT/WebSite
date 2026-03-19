# Security Documentation

> Last updated: 2025-02-10

## Security Features Implemented

### 1. Custom Server Architecture
- **Custom Node.js server** (`server.ts`) with controlled HTTP/HTTPS support
- **Environment-based configuration** for flexible deployment (no hardcoded secrets)
- **Automatic protocol detection** -- HTTP fallback when certificates are unavailable
- **Middleware adapter mode** for enhanced security control via Astro's `@astrojs/node`
- **Multi-stage Docker builds** minimizing attack surface (Alpine Linux base)

### 2. Authentication
- **Session-based authentication** using secure, httpOnly cookies
- **Cryptographically secure session IDs** using `crypto.randomUUID()`
- **Session expiration** set to 24 hours
- **Demo credentials** for testing: `demo@xhaait.com` / `demo123`

⚠️ **Production TODO**: Replace hardcoded credentials with:
- Proper password hashing (bcrypt or argon2)
- Database-backed user authentication
- Rate limiting for login attempts
- Account lockout after failed attempts
- Multi-factor authentication (MFA/2FA)

### 3. Certificate Management
- **Environment-variable based configuration** for certificate paths
- **Read-only volume mounting** in Docker (`:ro` flag)
- **Kubernetes secrets** for secure certificate storage
- **Automatic HTTPS detection** - server starts in HTTP mode if certificates unavailable
- **No hardcoded certificate paths** in production code

⚠️ **Production TODO**:
- Implement automatic certificate renewal (Let's Encrypt with certbot)
- Set up certificate expiration monitoring
- Use certificate management services (AWS ACM, GCP Certificate Manager)
- Store certificates in secure vaults (HashiCorp Vault, AWS Secrets Manager)

### 4. Cookie Security
All session cookies are configured with:
- `httpOnly: true` - Prevents JavaScript access to cookies (XSS protection)
- `secure: true` (in production) - HTTPS only
- `sameSite: 'strict'` - CSRF protection
- `path: '/'` - Cookie scope
- `maxAge: 86400` - 24-hour expiration

### 5. Security Headers
Implemented comprehensive security headers:
- **Content Security Policy (CSP)**: Restricts resource loading
  - `default-src 'self'`
  - `style-src 'self' 'unsafe-inline'` (needed for Astro scoped styles)
  - `script-src 'self' 'unsafe-inline'` (needed for Vite HMR in dev)
  - `img-src 'self' data:`
  - `font-src 'self'`
  - `connect-src 'self'`
  - `frame-ancestors 'none'`
- **X-Content-Type-Options**: `nosniff` - Prevents MIME-sniffing
- **X-Frame-Options**: `DENY` - Prevents clickjacking
- **X-XSS-Protection**: `1; mode=block` - Enables browser XSS protection
- **Referrer-Policy**: `strict-origin-when-cross-origin`

⚠️ **Production TODO**: Implement CSP with nonces via server headers instead of meta tags

### 6. Route Protection
Middleware protects sensitive routes:
- `/en/panel` and `/es/panel` require authentication
- Unauthenticated users are redirected to login
- Authenticated users are redirected away from login page
- Uses `startsWith()` for secure path matching (prevents bypass)

### 7. Input Validation
Login forms implement:
- Email format validation using regex
- Input trimming and sanitization
- Empty field validation
- Type checking for form data

⚠️ **Production TODO**:
- Implement comprehensive input validation library
- Add CAPTCHA to prevent brute force attacks
- Implement rate limiting
- Add password complexity requirements

### 8. HTTPS Configuration
See README.md for HTTPS setup instructions including:
- Development HTTPS using mkcert
- Production deployment with custom server or reverse proxy
- Let's Encrypt SSL certificates
- Cloud platform automatic HTTPS
- Kubernetes certificate management via secrets

### 9. Docker Container Security

**Implemented:**
- **Multi-stage builds**: Separates build and runtime environments
- **Alpine Linux base**: Minimal attack surface (`node:18-alpine`)
- **Non-root user ready**: Can be configured to run as non-root
- **Read-only volumes**: Certificates mounted with `:ro` flag
- **No secrets in image**: All sensitive data via environment variables
- **Minimal layers**: Optimized Dockerfile reduces complexity

⚠️ **Production TODO**:
```dockerfile
# Add to Dockerfile after WORKDIR /app
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs
```

**Security Scanning (Snyk -- integrated):**

Snyk (`^1.1294.0`) is included as a dev dependency and configured in `package.json`:

```bash
# Scan the Docker image for vulnerabilities (requires image to be built first)
npm run scan
# Equivalent to: snyk container test angelakimichellle/xhaait:latest
```

**Alternative scanning tools:**
```bash
# Trivy
trivy image angelakimichellle/xhaait:latest

# Docker Scout (Docker Desktop)
docker scout cves angelakimichellle/xhaait:latest
```

**Docker Security Best Practices:**
- Run containers as non-root user
- Use `--read-only` filesystem where possible
- Drop unnecessary Linux capabilities
- Use Docker secrets for sensitive data
- Enable Docker Content Trust (DCT)
- Regular image updates and CVE scanning
- Limit container resources (memory, CPU)

**Example secure Docker run:**
```bash
docker run -d \
  --name xhaait \
  --read-only \
  --tmpfs /tmp \
  --cap-drop ALL \
  --security-opt no-new-privileges \
  -p 4321:4321 \
  -e NODE_ENV=production \
  -m 512m \
  --cpus 0.5 \
  xhaait:latest
```

### 10. Kubernetes Security

**Implemented:**
- **Resource limits**: Prevents resource exhaustion attacks
- **Secret mounting**: Certificates stored in Kubernetes secrets
- **Namespace isolation**: Can be deployed in separate namespaces
- **Service accounts**: Controlled pod permissions
- **Read-only volume mounts**: Certificates mounted read-only

**Kubernetes Configuration (kubernetes-deployment.yaml):**
```yaml
resources:
  limits:
    memory: "512Mi"
    cpu: "500m"
  requests:
    memory: "256Mi"
    cpu: "250m"

volumeMounts:
- name: certs-volume
  mountPath: "/etc/xhaait/certs"
  readOnly: true
```

⚠️ **Production TODO**:

**1. Security Context:**
```yaml
# Add to pod spec in kubernetes-deployment.yaml
securityContext:
  runAsNonRoot: true
  runAsUser: 1001
  fsGroup: 1001
  seccompProfile:
    type: RuntimeDefault
  capabilities:
    drop:
      - ALL
  readOnlyRootFilesystem: true
```

**2. Network Policies:**
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: xhaait-netpol
spec:
  podSelector:
    matchLabels:
      app: xhaait
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector: {}
    ports:
    - protocol: TCP
      port: 4321
  egress:
  - to:
    - podSelector: {}
```

**3. Pod Security Standards:**
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: xhaait
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
```

**4. RBAC (Role-Based Access Control):**
```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: xhaait-sa
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: xhaait-role
rules:
- apiGroups: [""]
  resources: ["secrets"]
  resourceNames: ["xhaait-certs"]
  verbs: ["get"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: xhaait-rolebinding
subjects:
- kind: ServiceAccount
  name: xhaait-sa
roleRef:
  kind: Role
  name: xhaait-role
  apiGroup: rbac.authorization.k8s.io
```

**Kubernetes Security Best Practices:**
- Use namespace isolation
- Implement RBAC with principle of least privilege
- Enable Pod Security Standards (PSS)
- Use Network Policies to restrict traffic
- Regular security audits with tools like kube-bench, kube-hunter
- Implement admission controllers (OPA, Kyverno)
- Use service mesh for mTLS (Istio, Linkerd)
- Enable audit logging
- Rotate secrets regularly
- Scan images before deployment
- Use private container registries
- Monitor for security events

**Security Scanning for Kubernetes:**
```bash
# Scan Kubernetes configuration
kubesec scan kubernetes-deployment.yaml

# Run kube-bench for CIS compliance
kube-bench run

# Use Polaris for configuration validation
polaris audit --format=pretty
```

### 11. Environment Variables Security

**Current Practice:**
- No hardcoded secrets in code
- Environment variables for all sensitive data
- Certificate paths configurable via env vars

⚠️ **Production TODO**:
- Use secret management services:
  - **Kubernetes**: Secrets and ConfigMaps
  - **Docker**: Docker Secrets (Swarm) or external vaults
  - **Cloud**: AWS Secrets Manager, GCP Secret Manager, Azure Key Vault
  - **HashiCorp Vault**: Enterprise secret management

**Example with Kubernetes External Secrets:**
```yaml
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: vault-backend
spec:
  provider:
    vault:
      server: "https://vault.example.com"
      path: "secret"
      version: "v2"
      auth:
        kubernetes:
          mountPath: "kubernetes"
          role: "xhaait-role"
---
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: xhaait-secrets
spec:
  secretStoreRef:
    name: vault-backend
  target:
    name: xhaait-env-secrets
  data:
  - secretKey: SESSION_SECRET
    remoteRef:
      key: xhaait/session
      property: secret
```

## Known Limitations (Demo Only)

### Application Level
1. **Hardcoded Credentials**: Demo uses hardcoded credentials. Production must use database-backed authentication.
2. **No Password Hashing**: Passwords are compared in plain text. Production must use bcrypt/argon2.
3. **Session Storage**: Sessions are stored in memory. Production should use Redis or database.
4. **No Rate Limiting**: No protection against brute force. Implement rate limiting in production.
5. **No CSRF Tokens**: Relies on SameSite cookies. Consider adding CSRF tokens for defense in depth.
6. **CSP via Meta Tag**: Using meta tag instead of HTTP headers. Move to server headers in production.

### Infrastructure Level
7. **No Container User Isolation**: Docker container runs as root by default. Should run as non-root user.
8. **No Kubernetes Security Context**: Missing pod security contexts, should implement restricted PSS.
9. **No Network Policies**: Kubernetes pods have unrestricted network access. Implement Network Policies.
10. **No Health Checks**: Missing liveness/readiness probes. Add health check endpoints.
11. **No Resource Quotas**: Namespace lacks resource quotas. Implement to prevent resource exhaustion.
12. **Certificate Management**: Manual certificate management. Implement cert-manager for Kubernetes.
13. **Image Scanning (Partial)**: Snyk container scanning available via `npm run scan`, but not yet integrated into CI/CD pipeline. Integrate into Jenkins for pre-deployment gating.

## Compliance and Standards

### Industry Standards
- **OWASP Top 10**: Follow OWASP security best practices
- **CIS Benchmarks**: Implement CIS Docker and Kubernetes benchmarks
- **NIST Cybersecurity Framework**: Align with NIST CSF
- **ISO 27001**: Information security management standards
- **SOC 2**: Service organization controls for cloud services

### Data Protection Regulations
- **GDPR**: EU General Data Protection Regulation
- **CCPA**: California Consumer Privacy Act
- **HIPAA**: Health Insurance Portability and Accountability Act (if handling health data)
- **PCI DSS**: Payment Card Industry Data Security Standard (if handling payments)

### Security Testing
- **SAST** (Static Application Security Testing): SonarQube, Checkmarx
- **DAST** (Dynamic Application Security Testing): OWASP ZAP, Burp Suite
- **IAST** (Interactive Application Security Testing): Contrast Security
- **SCA** (Software Composition Analysis): **Snyk (integrated)**, WhiteSource
- **Penetration Testing**: Annual professional security assessments

### Kubernetes CIS Compliance
```bash
# Run kube-bench for CIS Kubernetes compliance
kube-bench run --targets node,policies,managedservices

# Run kube-hunter for penetration testing
kube-hunter --remote <cluster-ip>
```

### Docker CIS Compliance
```bash
# Run Docker Bench Security
docker run --rm --net host --pid host --userns host --cap-add audit_control \
  -v /etc:/etc:ro \
  -v /var/lib:/var/lib:ro \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  -v /usr/lib/systemd:/usr/lib/systemd:ro \
  docker/docker-bench-security
```

## Security Best Practices for Production

### 1. Authentication
```typescript
import bcrypt from 'bcrypt';

// Hash password on registration
const hashedPassword = await bcrypt.hash(password, 10);

// Verify password on login
const isValid = await bcrypt.compare(password, hashedPassword);
```

### 2. Environment Variables
```bash
# .env
SESSION_SECRET=your-random-secret-here
DATABASE_URL=your-database-url
MAX_LOGIN_ATTEMPTS=5
RATE_LIMIT_WINDOW=15m
```

### 3. Rate Limiting
Consider implementing rate limiting using:
- `express-rate-limit` for Node.js
- Cloudflare rate limiting
- Nginx rate limiting

### 4. Logging and Monitoring
- Log all authentication attempts
- Monitor for suspicious activity
- Implement alerting for security events
- Regular security audits

### 5. Database Security
- Use parameterized queries to prevent SQL injection
- Encrypt sensitive data at rest
- Regular backups
- Principle of least privilege for database access

## Security Checklist for Production

### Application Security
- [ ] Replace hardcoded credentials with database authentication
- [ ] Implement password hashing (bcrypt/argon2)
- [ ] Add rate limiting to login endpoints
- [ ] Implement CAPTCHA on login form
- [ ] Move CSP to HTTP headers with nonces
- [ ] Set up proper session storage (Redis/database)
- [ ] Implement CSRF tokens for additional protection
- [ ] Add account lockout after failed attempts
- [ ] Implement secure password reset functionality
- [ ] Add two-factor authentication (2FA)
- [ ] Regular dependency updates (`npm audit`)
- [ ] Implement comprehensive input validation library
- [ ] Add security logging for all authentication events

### Infrastructure Security
- [ ] Enable HTTPS with valid SSL certificates
- [ ] Implement certificate rotation and monitoring
- [ ] Use secret management service (Vault, AWS Secrets Manager, etc.)
- [ ] Configure environment variables securely
- [ ] Enable comprehensive logging and log shipping
- [ ] Add security monitoring and alerting
- [ ] Regular security audits and penetration testing
- [ ] Implement backup and disaster recovery procedures

### Docker Security
- [ ] Run containers as non-root user
- [ ] Implement read-only filesystem where possible
- [ ] Drop unnecessary Linux capabilities
- [ ] Enable Docker Content Trust (DCT)
- [x] Container image scanning available via Snyk (`npm run scan`)
- [ ] Use specific image tags (not `latest`) in production
- [x] Resource limits defined (512Mi memory, 500m CPU in K8s manifest)
- [ ] Scan base images for CVEs in CI/CD pipeline
- [ ] Use private container registry
- [ ] Integrate container scanning into Jenkins pipeline

### Kubernetes Security
- [ ] Implement Pod Security Standards (restricted)
- [ ] Configure security contexts for all pods
- [ ] Run pods as non-root user (runAsNonRoot: true)
- [ ] Implement Network Policies
- [ ] Enable RBAC with least privilege
- [ ] Use service accounts with minimal permissions
- [ ] Implement resource quotas and limits
- [ ] Add liveness and readiness probes
- [ ] Use namespace isolation
- [ ] Enable audit logging
- [ ] Implement admission controllers (OPA/Kyverno)
- [ ] Scan Kubernetes configurations (kubesec, Polaris)
- [ ] Use cert-manager for certificate management
- [ ] Rotate secrets regularly
- [ ] Implement pod-to-pod mTLS (service mesh)
- [ ] Enable Kubernetes security benchmarks (CIS)

### Monitoring & Compliance
- [ ] Set up SIEM for security event monitoring
- [ ] Implement intrusion detection system (IDS)
- [ ] Enable vulnerability scanning
- [ ] Regular compliance audits (SOC2, ISO 27001, etc.)
- [ ] Implement security incident response plan
- [ ] Document security procedures
- [ ] Regular security training for team
- [ ] Penetration testing (annual or bi-annual)

## Certificate Management Best Practices

### Development
- Use mkcert for local development certificates
- Never commit certificates to version control
- Add `*.pem`, `*.key`, `*.crt` to `.gitignore`
- Use environment variables for certificate paths

### Production

**Option 1: Let's Encrypt with Certbot**
```bash
# Install certbot
sudo apt install certbot

# Generate certificate
sudo certbot certonly --standalone -d xhaait.com -d www.xhaait.com

# Auto-renewal (add to crontab)
0 0 * * * certbot renew --quiet
```

**Option 2: Kubernetes cert-manager**
```yaml
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.12.0/cert-manager.yaml

# Create ClusterIssuer
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@xhaait.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx

# Create Certificate
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: xhaait-tls
spec:
  secretName: xhaait-certs
  issuerRef:
    name: letsencrypt-prod
    kind: ClusterIssuer
  dnsNames:
  - xhaait.com
  - www.xhaait.com
```

**Option 3: Cloud Provider Certificate Managers**
- **AWS**: ACM (AWS Certificate Manager)
- **GCP**: Google-managed SSL certificates
- **Azure**: Azure Key Vault certificates
- **CloudFlare**: Universal SSL

### Certificate Security
- Use strong key sizes (minimum 2048-bit RSA or 256-bit ECDSA)
- Enable HSTS (HTTP Strict Transport Security)
- Implement certificate pinning for mobile apps
- Monitor certificate expiration (30-day warning)
- Rotate certificates regularly (every 90 days recommended)
- Use certificate transparency monitoring
- Store private keys securely (never in plain text)
- Use Hardware Security Modules (HSM) for enterprise

### Certificate Monitoring
```bash
# Check certificate expiration
openssl x509 -in cert.pem -noout -enddate

# Automated monitoring script
#!/bin/bash
CERT_FILE="/path/to/cert.pem"
ALERT_DAYS=30

EXPIRY_DATE=$(openssl x509 -in $CERT_FILE -noout -enddate | cut -d= -f2)
EXPIRY_EPOCH=$(date -d "$EXPIRY_DATE" +%s)
CURRENT_EPOCH=$(date +%s)
DAYS_LEFT=$(( ($EXPIRY_EPOCH - $CURRENT_EPOCH) / 86400 ))

if [ $DAYS_LEFT -lt $ALERT_DAYS ]; then
    echo "WARNING: Certificate expires in $DAYS_LEFT days!"
    # Send alert (email, Slack, PagerDuty, etc.)
fi
```

## Security Monitoring and Logging

### Application Logging
```typescript
// Recommended logging structure
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Log security events
logger.info('Login attempt', {
  email: 'user@example.com',
  ip: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
  success: true,
  timestamp: new Date().toISOString()
});
```

### Security Events to Log
- All authentication attempts (success and failure)
- Password changes and resets
- Account lockouts
- Privilege escalations
- Configuration changes
- Certificate operations
- Unauthorized access attempts
- API rate limit violations
- Input validation failures

### Log Security
- Never log sensitive data (passwords, tokens, PII)
- Hash or mask sensitive fields in logs
- Implement log rotation and retention policies
- Encrypt logs at rest
- Use centralized log management (ELK, Splunk, CloudWatch)
- Implement log integrity verification
- Set up real-time log analysis and alerting

## Incident Response Plan

### Preparation
1. Identify security team members and roles
2. Document communication channels
3. Prepare incident response procedures
4. Set up monitoring and alerting
5. Regular security drills and tabletop exercises

### Detection
1. Monitor security alerts and logs
2. Investigate anomalies
3. Validate security incidents
4. Determine severity and scope

### Response
1. Contain the incident (isolate affected systems)
2. Preserve evidence for forensics
3. Eradicate the threat
4. Recover affected systems
5. Document all actions taken

### Post-Incident
1. Conduct post-mortem analysis
2. Document lessons learned
3. Update security controls
4. Improve detection capabilities
5. Report to stakeholders and compliance bodies

## Vulnerability Disclosure

If you discover a security vulnerability, please email security@xhaait.com with:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if available)

**We commit to:**
- Acknowledge receipt within 48 hours
- Provide regular updates on remediation progress
- Credit reporters (if desired) after fix is deployed
- Not pursue legal action against security researchers

## Security Updates

- 2025-02-10: Snyk vulnerability scanning
  - Added Snyk (`^1.1294.0`) as a dev dependency
  - Added `npm run scan` for container image scanning
  - Forced HTTPS certificate paths in Kubernetes manifest

- 2025-02-09: CI/CD and infrastructure hardening
  - Implemented Jenkins CI/CD pipeline (`Jenkinsfile`)
  - Fixed Kubernetes deployment manifest (resource limits, cert paths)
  - Improved Docker image tagging

- 2024-02-09: Enhanced deployment security
  - Custom server with HTTPS support (`server.ts`)
  - Multi-stage Docker builds (Alpine Linux base)
  - Kubernetes deployment with LoadBalancer service
  - Certificate management via Kubernetes secrets
  - Comprehensive security documentation

- 2024-01-23: Initial security implementation
  - Session-based authentication with `crypto.randomUUID()`
  - Security headers (CSP, X-Frame-Options, X-Content-Type-Options)
  - Route protection middleware
  - Input validation on login forms
  - Dark/light theme toggle
