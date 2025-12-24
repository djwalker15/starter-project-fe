# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Run stage ----
FROM nginx:1.27-alpine

# Copy built SPA
COPY --from=build /app/dist /usr/share/nginx/html

# Nginx template + entrypoint
RUN mkdir -p /etc/nginx/templates
COPY nginx/nginx.conf.template /etc/nginx/templates/nginx.conf.template
COPY nginx/entrypoint.sh /entrypoint.sh

EXPOSE 8080
ENTRYPOINT ["/entrypoint.sh"]
