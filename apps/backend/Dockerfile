# Production-ready for Coolify. Oracle wallet: mount at /app/wallet and set TNS_ADMIN=/app/wallet.
FROM node:24-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json* ./
COPY apps/backend/package.json apps/backend/
RUN sed -i 's|https://npm.artifacts.furycloud.io/repository/all/|https://registry.npmjs.org/|g' package-lock.json 2>/dev/null; \
    npm ci --ignore-scripts

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
WORKDIR /app/apps/backend
RUN npx prisma generate
RUN npm run build

FROM base AS runner
WORKDIR /app/apps/backend
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/package.json ./
COPY --from=builder /app/package.json /app/
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/apps/backend/prisma ./prisma
ENV NODE_ENV=production
EXPOSE 4000
# Coolify: set PORT, DATABASE_URL (MySQL) or TNS_ADMIN + DB_USER, DB_PASSWORD, DB_CONNECTION_STRING (Oracle wallet)
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:4000/health',r=>{let b='';r.on('data',c=>b+=c);r.on('end',()=>process.exit(r.statusCode===200?0:1))}).on('error',()=>process.exit(1))"
CMD sh -c "npx prisma migrate deploy && node dist/index.js"
