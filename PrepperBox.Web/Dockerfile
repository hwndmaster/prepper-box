# ---- Build Stage ----
FROM node:22-alpine AS build
WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

# Copy source and build
COPY . .
RUN pnpm run build

# ---- Serve Stage ----
FROM nginx:alpine AS runtime
COPY --from=build /app/build /usr/share/nginx/html

# Optional: custom nginx config for React Router (handles page refresh)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8046
EXPOSE 8443
