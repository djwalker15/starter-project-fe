#!/usr/bin/env sh
set -eu

: "${UPSTREAM_API_BASE_URL:?Must set UPSTREAM_API_BASE_URL}"

# Security Check
if [[ "$UPSTREAM_API_BASE_URL" != https://* && "$UPSTREAM_API_BASE_URL" != http://localhost* ]]; then
  echo "WARNING: UPSTREAM_API_BASE_URL does not start with https://. This is insecure for production!"
fi

# Strip trailing /api or /api/
case "$UPSTREAM_API_BASE_URL" in
  */api) UPSTREAM_API_BASE_URL="${UPSTREAM_API_BASE_URL%/api}" ;;
  */api/) UPSTREAM_API_BASE_URL="${UPSTREAM_API_BASE_URL%/api/}" ;;
esac

UPSTREAM_API_BASE_URL="${UPSTREAM_API_BASE_URL%/}"
export UPSTREAM_API_BASE_URL

echo "Using UPSTREAM_API_BASE_URL=${UPSTREAM_API_BASE_URL}"

envsubst '$UPSTREAM_API_BASE_URL' \
  < /etc/nginx/templates/nginx.conf.template \
  > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'
