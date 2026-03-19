// server.ts
import fs from "fs";
import https from "https";
import http from "http";
import { handler as astroHandler } from "./dist/server/entry.mjs";
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
    server = https.createServer(options, astroHandler);
  } catch (err) {
    console.error("Failed to load certificates:", err);
    process.exit(1);
  }
} else {
  console.log("Certificates not found or not configured. Initializing HTTP server...");
  server = http.createServer(astroHandler);
}
server.listen(PORT, HOST, () => {
  const protocol = server instanceof https.Server ? "https" : "http";
  console.log(`Server running on ${protocol}://${HOST}:${PORT}`);
});
