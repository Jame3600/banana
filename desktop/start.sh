#!/usr/bin/env bash
# PixelSoft HQ launcher: start the server (if not running) and open the game.
set -e
DIR="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${PIXELSOFT_PORT:-8787}"
cd "$DIR"
[ -x .venv/bin/uvicorn ] || { python3 -m venv .venv && .venv/bin/pip install -q -r requirements.txt; }
if ! curl -sf "http://localhost:$PORT/api/usage" >/dev/null 2>&1; then
  mkdir -p logs
  nohup .venv/bin/uvicorn server:app --port "$PORT" >> logs/server.log 2>&1 &
  for _ in $(seq 1 30); do curl -sf "http://localhost:$PORT/api/usage" >/dev/null 2>&1 && break; sleep 0.5; done
fi
xdg-open "http://localhost:$PORT" >/dev/null 2>&1 || true
