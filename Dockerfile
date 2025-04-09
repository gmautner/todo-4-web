# Dockerfile v5

# 1. Base Image for all stages
FROM node:20-alpine AS base
RUN npm install -g pnpm

# ------------------------------------

# 2. Dependencies Stage ('deps')
# Installs *only* production dependencies
FROM base AS deps
WORKDIR /app
# Copy package files from the web app folder into the current WORKDIR (/app)
COPY apps/web/package.json apps/web/pnpm-lock.yaml ./
# Install production dependencies in /app
RUN pnpm install --prod

# -------------------------------------

# 3. Builder Stage ('builder')
# Builds the application
FROM base AS builder
WORKDIR /app
# Copy package files again to /app
COPY apps/web/package.json apps/web/pnpm-lock.yaml ./
# Copy production dependencies installed in the 'deps' stage from /app/node_modules to /app/node_modules
COPY --from=deps /app/node_modules ./node_modules
# Install *all* dependencies (including dev) in /app
RUN pnpm install
# Copy the application source code from apps/web in context to /app in image
# This comes AFTER install to not invalidate dependency cache on code change
COPY apps/web ./
# Copy any root config files if they exist and are needed
# COPY tsconfig.base.json ./

# Build the application (runs in /app)
RUN pnpm build
# Prune dev dependencies after build (runs in /app)
RUN pnpm prune --prod

# -------------------------------------

# 4. Runner Stage ('runner')
# Minimal image to run the application
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

USER nextjs

# Copy application artifacts from builder stage (/app) to runner stage (/app)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./ 
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy files needed for migrations from builder stage (/app)
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./ 
COPY --from=builder --chown=nextjs:nodejs /app/pnpm-lock.yaml ./ 
COPY --from=builder --chown=nextjs:nodejs /app/drizzle.config.ts ./ 
COPY --from=builder --chown=nextjs:nodejs /app/drizzle ./drizzle 
# Copy final production node_modules from builder stage (/app)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules 

EXPOSE 3000

CMD ["sh", "-c", "pnpm exec drizzle-kit migrate && node server.js"] 