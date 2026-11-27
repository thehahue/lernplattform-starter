#!/usr/bin/env bash
set -euo pipefail

backend_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd -- "$backend_dir"

echo "Backend: http://localhost:${PORT:-8080}"
echo "H2-Konsole: http://localhost:${PORT:-8080}/h2-console"
echo "Beenden mit Strg+C."
exec ./mvnw spring-boot:run "$@"
