#!/bin/bash

set -e

echo "🚀 Setting up Dev Web Development Environment..."

# Install project dependencies if package.json exists
if [ -f "package.json" ]; then
    echo "📦 Installing npm dependencies with Bun..."
    bun install
fi

# Install Playwright browsers
echo ""
echo "🎭 Installing Playwright browsers..."
bunx playwright install 2>&1 | while IFS= read -r line; do
    if [[ "$line" =~ ^Downloading ]]; then
        # Extract browser name and version
        browser_info=$(echo "$line" | sed 's/ from.*//')
        # Show what's being downloaded
        printf "   ⬇️  %s\n" "$browser_info"
        first_progress=1
    elif [[ "$line" =~ ^\| ]]; then
        # Progress bar line - update in-place
        printf "   %s\r" "$line"
        first_progress=0
    elif [[ "$line" =~ "downloaded to" ]]; then
        # Extract version, clear progress bar and replace downloading line
        version=$(echo "$line" | sed 's/ downloaded to.*//')
        printf "\033[K\033[A\033[K   ✅ %s\n" "$version"
    fi
done
echo "   📁 All browsers cached in ~/.cache/ms-playwright/"
echo ""

# Wait for databases to be fully ready
echo "⏳ Waiting for databases to be ready..."

# Wait for PostgreSQL
until pg_isready -h postgres -U admin -d academy > /dev/null 2>&1; do
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
echo "     • PostgreSQL 18: postgres:5432 (admin/academy2026)"
echo "     • Database: academy"
echo ""
echo "  🎭 Testing tools:"
echo "     • Playwright: Chromium, Firefox, WebKit"
echo ""
echo "  🛠️ Useful commands:"
echo "     • bun run dev        - Start development server"
echo "     • bun test           - Run tests"
echo "     • bun run e2e        - Run end-to-end tests"
echo "     • psql -h postgres -U admin -d academy"
echo ""
echo "  🔧 Optional tools (start with --profile tools):"
echo "     • pgAdmin:     http://localhost:8008"
echo ""
echo "     DevMultiplier Academy | DevMultiplier.com"
echo ""
