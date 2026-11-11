# Multi-stage Dockerfile for YatraSewa Express API (Coolify / Kamatera Ready)
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy root workspace configs
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/
COPY packages/shared-types/package.json ./packages/shared-types/

# Install dependencies
RUN pnpm install

# Copy full monorepo source
COPY . .

# Build Shared Packages & API
RUN pnpm --filter @yatrasewa/shared-types build || true
RUN pnpm --filter @yatrasewa/database build || true
RUN pnpm --filter @yatrasewa/api build

EXPOSE 4000

ENV NODE_ENV=production
ENV API_PORT=4000

CMD ["pnpm", "--filter", "@yatrasewa/api", "start"]
