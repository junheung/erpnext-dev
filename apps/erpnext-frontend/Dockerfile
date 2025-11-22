# Multi-stage build for ERPNext frontend (Next.js)
# Build Stage
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies using lockfile if present
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source
COPY . .

# Build (PORT is respected only at runtime; build embeds public env vars if provided)
# ARG NEXT_PUBLIC_API_URL
# ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

# Runtime Stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8300

# Copy necessary artifacts
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json

# Install production dependencies only
RUN npm install --omit=dev

# Expose application port
EXPOSE 8300

# NOTE: Provide NEXT_PUBLIC_API_URL at runtime: -e NEXT_PUBLIC_API_URL=http://frappe:8000
CMD ["npm", "run", "start"]
