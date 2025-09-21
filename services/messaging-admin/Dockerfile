FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:20-alpine AS production
RUN addgroup -g 1001 -S nodejs && adduser -S msgadmin -u 1001
WORKDIR /app
COPY --from=builder --chown=msgadmin:nodejs /app/dist ./dist
COPY --from=builder --chown=msgadmin:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=msgadmin:nodejs /app/package.json ./
USER msgadmin
EXPOSE 3010
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD node -e "fetch('http://localhost:3010/health').then(r=>r.ok?process.exit(0):process.exit(1)).catch(()=>process.exit(1))"
CMD ["npm", "start"]
