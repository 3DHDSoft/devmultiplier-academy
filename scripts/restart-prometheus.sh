#!/bin/bash
# Restart Prometheus to reload configuration

echo "🔄 Restarting Prometheus container..."

cd "$(dirname "$0")/.."

if command -v docker-compose &> /dev/null; then
    docker-compose -f .devcontainer/docker-compose.yml restart prometheus
elif command -v docker &> /dev/null && docker compose version &> /dev/null; then
    docker compose -f .devcontainer/docker-compose.yml restart prometheus
else
    echo "❌ Docker compose not found"
    echo ""
    echo "Please restart Prometheus manually:"
    echo "  1. Open Docker Desktop (if using Docker Desktop)"
    echo "  2. Find the 'prometheus' container"
    echo "  3. Click 'Restart'"
    echo ""
    echo "Or run from a terminal with docker access:"
    echo "  docker compose -f .devcontainer/docker-compose.yml restart prometheus"
    exit 1
fi

echo "✅ Prometheus restarted"
echo "🔍 Check targets: http://localhost:9090/targets"
