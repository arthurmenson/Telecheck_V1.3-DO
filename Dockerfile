# Production Dockerfile for TeleCheck
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# System deps for building native modules (e.g., canvas)
RUN apk add --no-cache python3 build-base pkgconfig cairo-dev pango-dev jpeg-dev giflib-dev librsvg-dev

# Copy package files
COPY package*.json ./

# Install dependencies (prefer lockfile, fallback if out-of-sync)
RUN npm ci || npm install --no-audit --no-fund

# Copy source code
COPY . .

# Build application
RUN npm run build:prod

# Prune dev dependencies to keep only production deps (prebuilt in builder)
RUN npm prune --omit=dev

# Production stage
FROM node:20-alpine AS production

# Install runtime libs for native modules and dumb-init
RUN apk add --no-cache dumb-init cairo pango libjpeg-turbo giflib librsvg

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy production node_modules from builder (already pruned)
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy package files (kept for transparency/debugging)
COPY package*.json ./

# Copy built application from builder stage
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/server/config ./server/config

# Create uploads directory
RUN mkdir -p uploads && chown nodejs:nodejs uploads

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start application
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
