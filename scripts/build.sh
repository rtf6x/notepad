#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> migrations"
go run ./cmd/migrate "$@"

echo "==> templ"
go generate ./templates

echo "==> web"
(cd web && npm ci && npm run build)

echo "==> styles"
cat styles/*.scss | npx sass --stdin public/css/app.css --load-path=styles

echo "==> notepad"
go build -o notepad ./cmd/notepad

echo "==> done"
