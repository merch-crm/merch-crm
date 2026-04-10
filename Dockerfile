# Base image
FROM node:22-slim AS base

# ─── Stage 1: Install ALL dependencies (needed for build) ──────────────────────
FROM base AS deps
RUN sed -i 's/deb.debian.org/mirror.yandex.ru/g' /etc/apt/sources.list.d/debian.sources && \
  apt-get update && apt-get install -y --no-install-recommends \
  libc6 \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps --ignore-scripts

# ─── Stage 2: Build Next.js application ────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Skip env validation during build
ARG DATABASE_URL="postgresql://build:build@localhost:5432/build"
ENV NX_PLD_VLD_01="pl01_$(head /dev/urandom | tr -dc A-Za-z0-9 | head -c 24)"
ENV SKIP_ENV_VALIDATION="true"
ENV SKIP_REDIS="true"
ENV NODE_OPTIONS="--max-old-space-size=3072"

RUN npm run build

# ─── Stage 3: Migration runner (lightweight init-container image) ───────────────
FROM base AS migrator
WORKDIR /app

# Install deps needed for migration runner (drizzle-orm, pg, dotenv, tsx)
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --legacy-peer-deps --ignore-scripts \
  && npm install tsx --legacy-peer-deps --ignore-scripts

# Copy migration SQL files and runner script
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/drizzle.config.ts ./
COPY --from=builder /app/lib/schema ./lib/schema
COPY --from=builder /app/lib/db.ts ./lib/db.ts
COPY --from=builder /app/lib/env.ts ./lib/env.ts
COPY --from=builder /app/scripts/db-migrate.ts ./scripts/db-migrate.ts

# DATABASE_URL must be passed via env (no .env file in container)
CMD ["npx", "tsx", "scripts/db-migrate.ts"]

# ─── Stage 4: Production application runner ─────────────────────────────────────
FROM base AS runner
WORKDIR /app

# wget is needed for the Docker healthcheck
RUN sed -i 's/deb.debian.org/mirror.yandex.ru/g' /etc/apt/sources.list.d/debian.sources && \
  apt-get update && apt-get install -y --no-install-recommends wget && \
  rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set permissions for prerender cache and local storage
RUN mkdir .next local-storage
RUN chown nextjs:nodejs .next local-storage

# Copy the standalone Next.js build (minimal footprint)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

ENV HOME="/app"
USER nextjs

EXPOSE 3000
ENV PORT=3000

# server.js is created by next build from the standalone output
ENTRYPOINT ["./entrypoint.sh"]
