#!/usr/bin/env bash
set -euo pipefail

CACHE_DIR="/var/cache/nginx/eazysupplies"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

invalidate() {
  if [[ "$CACHE_DIR" != "/var/cache/nginx/eazysupplies" ]]; then
    echo "Refusing to purge unexpected cache directory: $CACHE_DIR" >&2
    exit 1
  fi

  echo "Invalidating storefront cache in $CACHE_DIR..."
  sudo find "$CACHE_DIR" -type f -delete
  sudo find "$CACHE_DIR" -mindepth 1 -type d -empty -delete
  sudo systemctl reload nginx
  echo "Storefront cache invalidated."
}

warm() {
  echo "Warming public storefront pages with two passes..."
  cd "$APP_DIR"
  WARM_PASSES=2 node scripts/warm-storefront-cache.mjs
}

status() {
  echo "Cache directory: $CACHE_DIR"
  sudo du -sh "$CACHE_DIR"
  sudo find "$CACHE_DIR" -type f | wc -l | awk '{ print "Cached files: " $1 }'
  curl -fsSI -H 'Accept: text/html' https://eazysupplies.com/ \
    | awk 'BEGIN { IGNORECASE=1 } /^HTTP\// || /^x-storefront-cache:/ || /^age:/'
}

case "${1:-}" in
  invalidate)
    invalidate
    ;;
  warm|revalidate)
    warm
    ;;
  refresh)
    invalidate
    warm
    ;;
  status)
    status
    ;;
  *)
    echo "Usage: $0 {invalidate|warm|revalidate|refresh|status}" >&2
    exit 2
    ;;
esac
