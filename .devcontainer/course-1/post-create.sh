#!/bin/bash
set -e

echo "🚀 Setting up Course 1 Development Environment..."

# Install project dependencies
if [ -f "package.json" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
fi

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL..."
until pg_isready -h postgres -U postgres -d academy > /dev/null 2>&1; do
    echo "  Waiting for PostgreSQL..."
    sleep 2
done
echo "✅ PostgreSQL is ready"

# Generate Prisma client if schema exists
if [ -f "prisma/schema.prisma" ]; then
    echo "🔧 Generating Prisma client..."
    npx prisma generate
    echo "✅ Prisma client generated"

    # Push schema to database (for development)
    echo "📊 Pushing schema to database..."
    npx prisma db push --skip-generate
    echo "✅ Database schema ready"
fi

echo ""
echo "=============================================="
echo "  🎉 Course 1 Environment Ready!"
echo "=============================================="
echo ""
echo "  📦 Quick commands:"
echo "     npm run dev     - Start development server"
echo "     npm test        - Run tests"
echo ""
echo "  🗄️ Database:"
echo "     Host: postgres"
echo "     Port: 5432"
echo "     User: postgres"
echo "     Pass: postgres"
echo "     DB:   academy"
echo ""
echo "  💡 Tip: Use SQLTools extension to browse the database"
echo ""
