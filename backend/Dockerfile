# Production Dockerfile for YatraSewa Backend API (Coolify / Kamatera / Docker Ready)
FROM node:20-alpine

# Install wget for healthcheck
RUN apk add --no-cache wget

WORKDIR /app

# Copy package manifests and install dependencies
COPY package*.json ./
RUN npm install

# Copy backend source code
COPY . .

# Compile TypeScript
RUN npm run build || true

EXPOSE 4000

ENV NODE_ENV=production
ENV PORT=4000
ENV API_PORT=4000

# Docker / Coolify Container Health Check
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:4000/health || exit 1

CMD ["npm", "start"]
