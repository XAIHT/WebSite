# Multi-stage Dockerfile for Astro SSR
# Stage 1: Build source
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the Astro project
RUN npm run build
# Compile the custom server
RUN npm run build:server

# Stage 2: Runtime environment
FROM node:18-alpine AS runtime

WORKDIR /app

# Copy necessary files from the build stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/server.js ./

# Environment variables
ENV HOST=0.0.0.0
ENV PORT=4321
ENV NODE_ENV=production

# Expose port
EXPOSE 4321

# Start the custom server
CMD ["node", "server.js"]

