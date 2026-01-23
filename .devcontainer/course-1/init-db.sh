#!/bin/bash
set -e

echo "🗄️ Initializing Course 1 database..."

# Create basic extensions
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- UUID generation
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- Case-insensitive text
    CREATE EXTENSION IF NOT EXISTS citext;

    -- Fuzzy string matching (useful for search)
    CREATE EXTENSION IF NOT EXISTS pg_trgm;
EOSQL

echo "✅ Database extensions created"
