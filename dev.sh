#!/usr/bin/env bash
# Corre el proyecto local leyendo tu .env  ->  ./dev.sh
set -euo pipefail
cd "$(dirname "$0")"
[ -f .env ] || { echo "Falta .env  (cp .env.example .env)"; exit 1; }
set -a; source .env; set +a
args=(--kv=HORARIO_KV --binding "EDIT_KEY=${EDIT_KEY:?EDIT_KEY vacía en .env}")
[ -n "${TEAM_OPEN:-}" ] && args+=(--binding "TEAM_OPEN=$TEAM_OPEN")
npx wrangler pages dev . "${args[@]}"
