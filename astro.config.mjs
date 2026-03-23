import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import fs from 'fs';

const httpsConfig = {};
// Check custom env vars first, then fallback to default Windows paths
const keyPath = process.env.HTTPS_KEY_PATH || 'C:/Users/angel/certs/localhost-key.pem';
const certPath = process.env.HTTPS_CERT_PATH || 'C:/Users/angel/certs/localhost.pem';

// Only enable HTTPS if the certificate files actually exist
if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
  httpsConfig.key = fs.readFileSync(keyPath);
  httpsConfig.cert = fs.readFileSync(certPath);
}

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'middleware'
  }),
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    routing: {
      prefixDefaultLocale: true
    }
  },
  server: {
    port: 4321,
    host: true,
    https: Object.keys(httpsConfig).length > 0 ? httpsConfig : undefined
  }
});
