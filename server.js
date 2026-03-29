// server.ts
import fs from "fs";
import https from "https";
import http from "http";
import express from "express";
import { handler as astroHandler } from "./dist/server/entry.mjs";
import { rateLimit } from "express-rate-limit";
var app = express();
app.set("trust proxy", 1);
var globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  limit: 100,
  // Limit each IP to 100 requests per window
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again after 15 minutes"
});
var sensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  limit: 10,
  // Limit each IP to 10 requests per window for sensitive routes
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: "Too many requests to this sensitive endpoint, please try again after 15 minutes"
});
app.use(globalLimiter);
app.use(["/login", "/panel", "/:lang/login", "/:lang/panel", "/api", "/:lang/api"], sensitiveLimiter);
app.use(express.static("dist/client"));
app.use(astroHandler);
var HOST = process.env.HOST || "0.0.0.0";
var PORT = Number(process.env.PORT) || 4321;
var HTTPS_KEY_PATH = process.env.HTTPS_KEY_PATH;
var HTTPS_CERT_PATH = process.env.HTTPS_CERT_PATH;
console.log(`Starting server...`);
console.log(`Host: ${HOST}`);
console.log(`Port: ${PORT}`);
console.log(`Key Path: ${HTTPS_KEY_PATH}`);
console.log(`Cert Path: ${HTTPS_CERT_PATH}`);
var server;
if (HTTPS_KEY_PATH && HTTPS_CERT_PATH && fs.existsSync(HTTPS_KEY_PATH) && fs.existsSync(HTTPS_CERT_PATH)) {
  console.log("Certificates found. Initializing HTTPS server...");
  try {
    const options = {
      key: fs.readFileSync(HTTPS_KEY_PATH),
      cert: fs.readFileSync(HTTPS_CERT_PATH)
    };
    server = https.createServer(options, app);
  } catch (err) {
    console.error("Failed to load certificates:", err);
    process.exit(1);
  }
} else {
  console.log("Certificates not found or not configured. Initializing HTTP server...");
  server = http.createServer(app);
}
server.listen(PORT, HOST, () => {
  const protocol = server instanceof https.Server ? "https" : "http";
  console.log(`Server running on ${protocol}://${HOST}:${PORT}`);
});
