FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:20-alpine AS production
RUN addgroup -g 1001 -S nodejs && adduser -S ehr -u 1001
WORKDIR /app
COPY --from=builder --chown=ehr:nodejs /app/dist ./dist
COPY --from=builder --chown=ehr:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=ehr:nodejs /app/package.json ./
USER ehr
EXPOSE 3002
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD node -e "fetch('http://localhost:3002/health').then(r=>r.ok?process.exit(0):process.exit(1)).catch(()=>process.exit(1))"
CMD ["npm", "start"]
