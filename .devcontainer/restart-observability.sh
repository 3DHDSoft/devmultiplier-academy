#!/bin/bash
# Restart observability stack
# Run this from outside the devcontainer (on your host machine)

cd "$(dirname "$0")"

echo "🔄 Restarting observability stack..."

# Stop and remove existing containers
docker compose stop otel-collector tempo prometheus grafana 2>/dev/null || true
docker compose rm -f otel-collector tempo prometheus grafana 2>/dev/null || true

# Start containers
echo "🚀 Starting containers..."
docker compose up -d otel-collector tempo prometheus grafana

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check status
echo ""
echo "📊 Container status:"
docker compose ps otel-collector tempo prometheus grafana

echo ""
echo "✅ Observability stack restarted!"
echo ""
echo "Access points:"
echo "  - Grafana:    http://localhost:3001 (admin/admin)"
echo "  - Prometheus: http://localhost:9090"
echo "  - Tempo:      http://localhost:3200"
echo ""
echo "Next steps:"
echo "  1. Restart your Next.js dev server"
echo "  2. Make some requests to your app"
echo "  3. Check Grafana for traces and metrics"
