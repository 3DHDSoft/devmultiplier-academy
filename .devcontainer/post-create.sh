#!/bin/bash

# Fix workspace permissions for node user
# The workspace may be mounted with different ownership, so we need to ensure
# the node user can write to all necessary files (bun.lock, node_modules, etc.)
sudo chown -R node:node /workspaces/devmultiplier-academy

# Ensure node_modules directories exist with correct permissions
sudo mkdir -p /workspaces/devmultiplier-academy/node_modules
sudo mkdir -p /workspaces/devmultiplier-academy/apps/web/node_modules
sudo chown -R node:node /workspaces/devmultiplier-academy/node_modules
sudo chown -R node:node /workspaces/devmultiplier-academy/apps/web/node_modules

set -e

echo "🚀 Setting up Dev Web Development Environment..."

# Ensure Claude Code auth directory exists with correct permissions
echo "🔐 Setting up Claude Code authentication directory..."
sudo mkdir -p /home/node/.claude
sudo chown -R node:node /home/node/.claude
chmod 700 /home/node/.claude
echo "✅ Claude Code auth directory ready"

# Upgrade npm to latest version
echo "📦 Upgrading npm to latest version..."
sudo npm install -g npm@latest
echo "✅ npm upgraded to $(npm -v)"

# Install global bun packages
echo "🌍 Installing global bun packages..."
bun add -g npm-check-updates vercel
echo "✅ Global packages installed"

# Install Claude Code CLI
echo "🤖 Installing Claude Code CLI..."
sudo npm install -g @anthropic-ai/claude-code
echo "✅ Claude Code CLI installed (run 'claude' to start)"

# Install project dependencies (monorepo structure)
echo "📦 Installing dependencies with Bun..."
# Install root workspace dependencies
if [ -f "package.json" ]; then
    bun install
fi
# Install web app dependencies
if [ -f "apps/web/package.json" ]; then
    cd apps/web && bun install && cd ../..
fi

# Wait for databases to be fully ready
echo "⏳ Waiting for databases to be ready..."

# Wait for PostgreSQL
until pg_isready -h postgres -U admin -d academy > /dev/null 2>&1; do
    echo "  Waiting for PostgreSQL 18..."
    sleep 2
done
echo "✅ PostgreSQL 18 is ready"

# Verify observability configuration file permissions
echo "🔧 Checking observability configuration permissions..."
# Files should already have 644 permissions from git
# Only attempt chmod if we have write access (avoid errors on mounted volumes)
for file in \
  .devcontainer/prometheus/prometheus.yml \
  .devcontainer/grafana/provisioning/datasources/prometheus.yml \
  .devcontainer/grafana/provisioning/datasources/tempo.yml \
  .devcontainer/grafana/provisioning/dashboards/dashboards.yml \
  .devcontainer/otel-collector/otel-collector-config.yml \
  .devcontainer/tempo/tempo.yml; do
  if [ -w "$file" ]; then
    chmod 644 "$file" 2>/dev/null || true
  fi
done
# Also handle dashboard JSON files if they exist
if ls .devcontainer/grafana/dashboards/*.json &>/dev/null; then
  for file in .devcontainer/grafana/dashboards/*.json; do
    if [ -w "$file" ]; then
      chmod 644 "$file" 2>/dev/null || true
    fi
  done
fi
echo "✅ Observability configurations verified"

echo ""
echo "=============================================="
echo "  🎉 Development Environment Ready!"
echo "=============================================="
echo ""
echo "  📚 Databases available:"
echo "     • PostgreSQL 18: postgres:5432 (admin/academy2026)"
echo "     • Database: academy"
echo ""
echo "  🎭 Testing tools:"
echo "     • Playwright: Chromium, Firefox, WebKit"
echo ""
echo "  🛠️ Useful commands:"
echo "     • cd apps/web && bun run dev  - Start development server"
echo "     • cd apps/web && bun test     - Run tests"
echo "     • cd apps/web && bun run e2e  - Run end-to-end tests"
echo "     • psql -h postgres -U admin -d academy"
echo ""
echo "  🔧 Optional tools (start with --profile tools):"
echo "     • pgAdmin:     http://localhost:8008"
echo ""
echo "     DevMultiplier Academy | DevMultiplier.com"
echo ""
