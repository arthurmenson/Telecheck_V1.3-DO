FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:20-alpine AS production
RUN addgroup -g 1001 -S nodejs && adduser -S auth -u 1001
WORKDIR /app
COPY --from=builder --chown=auth:nodejs /app/dist ./dist
COPY --from=builder --chown=auth:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=auth:nodejs /app/package.json ./
USER auth
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD node -e "fetch('http://localhost:3001/health').then(r=>r.ok?process.exit(0):process.exit(1)).catch(()=>process.exit(1))"
CMD ["npm", "start"]
