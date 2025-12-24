#!/usr/bin/env sh
set -eu

: "${UPSTREAM_API_BASE_URL:?Must set UPSTREAM_API_BASE_URL (e.g. https://your-backend-xyz.a.run.app)}"

# Strip trailing /api or /api/
case "$UPSTREAM_API_BASE_URL" in
  */api) UPSTREAM_API_BASE_URL="${UPSTREAM_API_BASE_URL%/api}" ;;
  */api/) UPSTREAM_API_BASE_URL="${UPSTREAM_API_BASE_URL%/api/}" ;;
esac

# Strip any trailing slash(es) so proxy_pass forwards the full original URI
UPSTREAM_API_BASE_URL="${UPSTREAM_API_BASE_URL%/}"
export UPSTREAM_API_BASE_URL

echo "Using UPSTREAM_API_BASE_URL=${UPSTREAM_API_BASE_URL}"

envsubst '$UPSTREAM_API_BASE_URL' \
  < /etc/nginx/templates/nginx.conf.template \
  > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'
