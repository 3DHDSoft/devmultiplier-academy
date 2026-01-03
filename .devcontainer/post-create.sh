#!/bin/bash

set -e

echo "🚀 Setting up Dev Web Development Environment..."

# Install project dependencies if package.json exists
if [ -f "package.json" ]; then
    echo "📦 Installing npm dependencies with Bun..."
    bun install
fi

# Wait for databases to be fully ready
echo "⏳ Waiting for databases to be ready..."

# Wait for PostgreSQL
until pg_isready -h postgres -U sa -d adventure_works > /dev/null 2>&1; do
    echo "  Waiting for PostgreSQL 18..."
    sleep 2
done
echo "✅ PostgreSQL 18 is ready"

# # Run initialization scripts if they exist
# if [ -f ".devcontainer/scripts/init-databases.sh" ]; then
#     echo "🗄️ Running database initialization..."
#     bash .devcontainer/scripts/init-databases.sh
# fi

echo ""
echo "=============================================="
echo "  🎉 Development Environment Ready!"
echo "=============================================="
echo ""
echo "  📚 Databases available:"
echo "     • PostgreSQL 18: postgres:5432 (sa/Dev-Multiplier-2026_Str0ng)"
echo "     • Database: adventure_works"
echo ""
echo "  🛠️ Useful commands:"
echo "     • bun run dev        - Start development server"
echo "     • bun test           - Run tests"
echo "     • psql -h postgres -U sa -d adventure_works"
echo ""
echo "  🔧 Optional tools (start with --profile tools):"
echo "     • pgAdmin:     http://localhost:8008"
echo ""
echo "     DevMultiplier Academy | DevMultiplier.com"
echo ""
