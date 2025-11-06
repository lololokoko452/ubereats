# Stage 1: build the frontend (Vue)
FROM node:18-alpine AS frontend-builder
WORKDIR /app/client

COPY client/package*.json ./
RUN npm ci

COPY client/ .
RUN npm run build

# Stage 2: install backend production dependencies
FROM node:18-alpine AS backend-builder
ENV NODE_ENV=production
WORKDIR /app/server

COPY server/package*.json ./
RUN npm ci --omit=dev

COPY server/ .
# Copy the built frontend into the backend public directory
COPY --from=frontend-builder /app/client/dist ./public

# Stage 3: runtime image
FROM node:18-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app

COPY --from=backend-builder /app/server ./server

# Create non-root user
RUN addgroup -S nodejs && adduser -S nodeapp -G nodejs \
  && chown -R nodeapp:nodejs /app

USER nodeapp
EXPOSE 4000

CMD ["node", "server/src/index.js"]
