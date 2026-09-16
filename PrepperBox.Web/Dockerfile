# ---- Build Stage ----
FROM node:22-alpine AS build
WORKDIR /app

ENV PNPM_STORE_PATH=/pnpm/store

# Install dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
# pnpm >=11.9 ignores env-var credentials in the project .npmrc, so the token goes
# into the user-level ~/.npmrc; written and removed within one RUN so it never
# persists in an image layer.
RUN --mount=type=cache,id=prepper-box-web-pnpm-store,target=/pnpm/store \
    --mount=type=secret,id=atom_pkg_access_token \
    sh -eu -c 'token="$(cat /run/secrets/atom_pkg_access_token)"; [ -n "$token" ] || { echo "ATOM_PKG_ACCESS_TOKEN is required." >&2; exit 1; }; printf "//npm.pkg.github.com/:_authToken=%s\n" "$token" > "$HOME/.npmrc"; corepack enable; pnpm config set store-dir "$PNPM_STORE_PATH"; pnpm fetch --frozen-lockfile; pnpm install --frozen-lockfile --offline --prod=false; rm -f "$HOME/.npmrc"'

# Copy source and build
COPY . .
RUN pnpm run build

# ---- Serve Stage ----
FROM nginx:alpine AS runtime
COPY --from=build /app/build /usr/share/nginx/html

# Custom nginx config for React Router (handles page refresh) plus the /api/ and /otlp/ proxies.
# Installed as a TEMPLATE, not as conf.d/default.conf: the nginx image runs envsubst over
# /etc/nginx/templates at start-up, which is what makes the two upstreams configurable per deployment.
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Restricts envsubst to our own variables so nginx's $uri, $host, $upstream and $1 are left alone.
ENV NGINX_ENVSUBST_FILTER=^PREPPER_BOX_

# Defaults match the compose-owned deployment, where every container shares one network and resolves
# these names. The app host overrides them when DCP owns the containers and sits on its own network.
ENV PREPPER_BOX_API_UPSTREAM=http://prepper-box-api:8045
ENV PREPPER_BOX_OTLP_UPSTREAM=http://prepper-box-apphost:21193

EXPOSE 8046
EXPOSE 8443
