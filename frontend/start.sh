#!/usr/bin/env bash
set -euo pipefail

frontend_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

echo "Frontend: http://localhost:5500"
echo "Beenden mit Strg+C."
#exec python3 -m http.server 5500 --bind 127.0.0.1 --directory "$frontend_dir"
exec jwebserver -p 5500
