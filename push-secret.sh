#!/usr/bin/env bash
# Sube EDIT_KEY de tu .env a Cloudflare como secreto  ->  ./push-secret.sh NOMBRE_PROYECTO_PAGES
set -euo pipefail
cd "$(dirname "$0")"
[ -n "${1:-}" ] || { echo "Uso: ./push-secret.sh NOMBRE_PROYECTO_PAGES"; exit 1; }
set -a; source .env; set +a
printf %s "${EDIT_KEY:?EDIT_KEY vacía en .env}" | npx wrangler pages secret put EDIT_KEY --project-name "$1"
