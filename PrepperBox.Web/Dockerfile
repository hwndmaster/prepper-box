# ---- Build Stage ----
FROM node:22-alpine AS build
WORKDIR /app

ARG ATOM_PKG_ACCESS_TOKEN

# Install dependencies
COPY package.json pnpm-lock.yaml .npmrc ./
RUN if [ -z "$$ATOM_PKG_ACCESS_TOKEN" ]; then \
			echo "ATOM_PKG_ACCESS_TOKEN build arg is required for GitHub Packages auth." >&2; \
			exit 1; \
		fi && \
		corepack enable && pnpm install --frozen-lockfile --prod=false

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
