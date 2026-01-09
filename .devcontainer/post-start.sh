#!/bin/bash

echo "🔄 Starting development services..."

# Verify database connections
echo "📡 Checking database connections..."

if pg_isready -h postgres -U admin -d academy > /dev/null 2>&1; then
    echo "  ✅ PostgreSQL 18: Connected"
else
    echo "  ❌ PostgreSQL 18: Not available"
fi

echo ""
echo "Ready to code! 🚀"
