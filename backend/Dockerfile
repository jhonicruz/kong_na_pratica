# Stage 1: Base image with Node.js
FROM node:20-alpine AS base
WORKDIR /usr/src/app

# Stage 2: Install dependencies
FROM base AS deps
COPY package.json package-lock.json* ./
# Install only production dependencies in deps stage to keep image small.
RUN npm install --frozen-lockfile --production

# Stage 3: Build the application
FROM base AS builder
# Copy source and install dev dependencies for build
COPY package.json package-lock.json* ./
RUN npm install --frozen-lockfile
COPY . .
RUN npm run build

# Stage 4: Production image
FROM base AS runner
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY package.json .

# Create a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 4000
CMD ["node", "dist/server.js"]