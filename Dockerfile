# syntax=docker/dockerfile:1

# ---------- Builder ----------
FROM node:22-bookworm-slim AS builder
WORKDIR /app

# Puppeteer: on n'embarque PAS son Chromium (on utilise celui du systeme au runtime)
ENV PUPPETEER_SKIP_DOWNLOAD=true

# Outils pour compiler les modules natifs (bcrypt) + openssl pour Prisma
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ openssl \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate && npm run build

# ---------- Runner ----------
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PUPPETEER_SKIP_DOWNLOAD=true
# Chromium systeme pour la generation PDF (export.service lit cette variable)
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Chromium + polices + libs runtime (Prisma a besoin d'openssl)
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium openssl \
    fonts-liberation fonts-dejavu-core \
    && rm -rf /var/lib/apt/lists/*

# node_modules complet (inclut prisma CLI pour migrate deploy au boot)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./

# Dossier des avatars uploades (monte en volume via compose)
RUN mkdir -p uploads/avatars

EXPOSE 3001

# Applique les migrations puis demarre l'API
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
