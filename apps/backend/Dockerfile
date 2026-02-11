# Production-ready for Coolify. Oracle wallet: mount at /app/wallet and set TNS_ADMIN=/app/wallet.
FROM node:24-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.14.2 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/backend/package.json apps/backend/
COPY scripts/fix-lockfile-registry.sh scripts/
RUN pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
WORKDIR /app/apps/backend
RUN pnpm exec prisma generate
RUN pnpm run build

FROM base AS runner
WORKDIR /app/apps/backend
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/package.json ./
COPY --from=builder /app/package.json /app/
COPY --from=builder /app/pnpm-workspace.yaml /app/
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/apps/backend/node_modules/.prisma ./node_modules/.prisma
ENV NODE_ENV=production
EXPOSE 4000
# Coolify: set PORT, DATABASE_URL (MySQL) or TNS_ADMIN + DB_USER, DB_PASSWORD, DB_CONNECTION_STRING (Oracle wallet)
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:4000/health',r=>{let b='';r.on('data',c=>b+=c);r.on('end',()=>process.exit(r.statusCode===200?0:1))}).on('error',()=>process.exit(1))"
CMD ["node", "dist/index.js"]
