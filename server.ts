import fs from 'fs';
import https from 'https';
import http from 'http';
import express from 'express';
// @ts-ignore
import { handler as astroHandler } from './dist/server/entry.mjs';
import { rateLimit } from 'express-rate-limit';

const app = express();

// Trust reverse proxy for correct IP identification in Kubernetes/Ingress
app.set('trust proxy', 1);

// Global rate limiter
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per window
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Aggressive rate limiter for sensitive routes (e.g. login, panel)
const sensitiveLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 10, // Limit each IP to 10 requests per window for sensitive routes
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: 'Too many requests to this sensitive endpoint, please try again after 15 minutes'
});

// Apply the global rate limiting middleware to all requests
app.use(globalLimiter);

// Apply aggressive limiter to sensitive routes, including localized paths
app.use(['/login', '/panel', '/:lang/login', '/:lang/panel', '/api', '/:lang/api'], sensitiveLimiter);

// Serve static assets from the Astro build output directory
app.use(express.static('dist/client'));

// Handle SSR routes with Astro
app.use(astroHandler as any);

const HOST = process.env.HOST || '0.0.0.0';
const PORT = Number(process.env.PORT) || 4321;
const HTTPS_KEY_PATH = process.env.HTTPS_KEY_PATH;
const HTTPS_CERT_PATH = process.env.HTTPS_CERT_PATH;

console.log(`Starting server...`);
console.log(`Host: ${HOST}`);
console.log(`Port: ${PORT}`);
console.log(`Key Path: ${HTTPS_KEY_PATH}`);
console.log(`Cert Path: ${HTTPS_CERT_PATH}`);

let server: https.Server | http.Server;

// Check if certificate files exist
if (HTTPS_KEY_PATH && HTTPS_CERT_PATH && fs.existsSync(HTTPS_KEY_PATH) && fs.existsSync(HTTPS_CERT_PATH)) {
    console.log('Certificates found. Initializing HTTPS server...');
    try {
        const options: https.ServerOptions = {
            key: fs.readFileSync(HTTPS_KEY_PATH),
            cert: fs.readFileSync(HTTPS_CERT_PATH)
        };
        server = https.createServer(options, app);
    } catch (err) {
        console.error('Failed to load certificates:', err);
        process.exit(1);
    }
} else {
    console.log('Certificates not found or not configured. Initializing HTTP server...');
    server = http.createServer(app);
}

server.listen(PORT, HOST, () => {
    const protocol = server instanceof https.Server ? 'https' : 'http';
    console.log(`Server running on ${protocol}://${HOST}:${PORT}`);
});
