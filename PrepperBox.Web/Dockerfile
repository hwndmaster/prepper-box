# ---- Build Stage ----
FROM node:22-alpine AS build
WORKDIR /app

ENV PNPM_STORE_PATH=/pnpm/store

# Install dependencies
COPY package.json pnpm-lock.yaml .npmrc ./
RUN --mount=type=cache,id=prepper-box-web-pnpm-store,target=/pnpm/store \
    --mount=type=secret,id=atom_pkg_access_token \
    sh -eu -c 'token="$(cat /run/secrets/atom_pkg_access_token)"; [ -n "$token" ] || { echo "ATOM_PKG_ACCESS_TOKEN is required." >&2; exit 1; }; export ATOM_PKG_ACCESS_TOKEN="$token"; corepack enable; pnpm config set store-dir "$PNPM_STORE_PATH"; pnpm fetch --frozen-lockfile; pnpm install --frozen-lockfile --offline --prod=false'

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
