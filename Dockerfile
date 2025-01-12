# Base stage for dependencies
FROM node:18-alpine AS deps
WORKDIR /app

# Install dependencies required for build
COPY package*.json ./
RUN npm ci

# Build stage
FROM node:18-alpine AS builder
WORKDIR /app

# Copy dependencies and source code
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS runner
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Copy only necessary files from build
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000


# Switch to non-root user
USER nestjs

# Expose application port
EXPOSE $PORT

# Start the application
CMD ["node", "dist/main.js"]