# Stage 1: Build
FROM node:20-alpine AS builder

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Copy Prisma schema and code
COPY prisma ./prisma/
COPY . .

# Generate Prisma Client and create a dummy db for build phase
# (Next.js 15 might attempt to pre-render pages needing db schema check)
ENV DATABASE_URL="file:./dev.db"
RUN npx prisma generate
RUN npx prisma db push --accept-data-loss
RUN npm run build

# Stage 2: Production runner
FROM node:20-alpine AS runner

RUN apk add --no-cache openssl

WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set up SQLite volume pathing
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Transfer prisma to runners so we can execute `db push` on startup over fresh persistent mounts
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Startup script to ensure DB schemas exist before node server
CMD ["sh", "-c", "npx prisma@6.19.2 db push --accept-data-loss && node server.js"]
