# Production Dockerfile for YatraSewa Express Backend API (Coolify / Kamatera Ready)
FROM node:20-alpine

WORKDIR /app

# Copy package manifest and install dependencies
COPY package*.json ./
RUN npm install

# Copy backend source code
COPY . .

# Build TypeScript output
RUN npm run build || true

EXPOSE 4000

ENV NODE_ENV=production
ENV API_PORT=4000

CMD ["npm", "start"]
