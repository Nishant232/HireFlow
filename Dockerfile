# Stage 1: Build backend TypeScript
FROM node:20-alpine AS builder

WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci

COPY backend/ ./
RUN npm run build

# Stage 2: Production image
FROM node:20-alpine AS production

RUN apk add --no-cache dumb-init

WORKDIR /app

# Production backend dependencies
COPY backend/package*.json ./
RUN npm ci --omit=dev

# Compiled backend
COPY --from=builder /app/backend/dist ./dist

# Pre-built frontend (added by GitHub Actions via git add -f)
COPY frontend/dist ./public

EXPOSE 7860

ENV NODE_ENV=production
ENV PORT=7860

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
