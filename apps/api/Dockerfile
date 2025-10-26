# Stage 1: Prune the monorepo to only include the api app and its dependencies
FROM node:20-alpine AS pruner
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /app

# Install turbo globally
RUN yarn global add turbo

# Copy the entire monorepo
COPY . .

# Prune the monorepo to only include the api app and its internal dependencies
RUN turbo prune api --docker

# Stage 2: Install dependencies
FROM node:20-alpine AS installer
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /app

# Copy lockfile and package.json files from pruned monorepo
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/yarn.lock ./yarn.lock

# Install dependencies
RUN yarn install --frozen-lockfile

# Stage 3: Build
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /app

# Copy installed dependencies
COPY --from=installer /app/ .

# Copy source code from pruned monorepo
COPY --from=pruner /app/out/full/ .

# Build the app
RUN yarn turbo db:generate
RUN yarn turbo run build --filter=api

# Stage 4: Production
FROM node:20-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs

# Copy necessary files with proper ownership
COPY --from=builder --chown=expressjs:nodejs /app .

# Switch to non-root user
USER expressjs

# Expose port
EXPOSE 8000

# Set NODE_ENV
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "apps/api/dist/index.js"]