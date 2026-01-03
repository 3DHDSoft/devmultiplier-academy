#!/bin/bash

set -e

# Create essential extensions for SQL Server to PostgreSQL migration
echo "SETUP INFO: Creating PostgreSQL extensions..."

# Core extensions for SQL Server migration
# Test: SELECT extname, extversion, extrelocatable FROM pg_extension ORDER BY extname;
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
	CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- For UUID generation (uuid_generate_v4)
	CREATE EXTENSION IF NOT EXISTS ltree;            -- For HIERARCHYID mapping
	CREATE EXTENSION IF NOT EXISTS pg_trgm;          -- For full-text search and LIKE optimization
	CREATE EXTENSION IF NOT EXISTS btree_gist;       -- For advanced indexing (overlaps, ranges)
	CREATE EXTENSION IF NOT EXISTS btree_gin;        -- For GIN indexes on multiple types
	CREATE EXTENSION IF NOT EXISTS postgis;          -- For GEOGRAPHY/GEOMETRY spatial data
	CREATE EXTENSION IF NOT EXISTS postgis_topology; -- For topology support
	CREATE EXTENSION IF NOT EXISTS postgis_raster;   -- For raster data support
EOSQL

# Additional contrib extensions for enterprise workloads
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
	CREATE EXTENSION IF NOT EXISTS citext;             -- Case-insensitive text (for collations)
	CREATE EXTENSION IF NOT EXISTS hstore;             -- Key-value store (for flexible schemas)
	CREATE EXTENSION IF NOT EXISTS pg_stat_statements; -- Query performance monitoring
	CREATE EXTENSION IF NOT EXISTS unaccent;           -- Remove accents from strings
	CREATE EXTENSION IF NOT EXISTS tablefunc;          -- Crosstab and pivot functions
EOSQL

echo "SETUP INFO: Extensions created successfully"

# Installed extensions
# "extname"	"extversion"	"extrelocatable"
# "btree_gin"	"1.3"	true
# "btree_gist"	"1.8"	true
# "citext"	"1.8"	true
# "fuzzystrmatch"	"1.2"	true
# "hstore"	"1.8"	true
# "ltree"	"1.3"	true
# "pg_stat_statements"	"1.12"	true
# "pg_trgm"	"1.6"	true
# "plpgsql"	"1.0"	false
# "postgis"	"3.6.1"	false
# "postgis_raster"	"3.6.1"	false
# "postgis_tiger_geocoder"	"3.6.1"	false
# "postgis_topology"	"3.6.1"	false
# "tablefunc"	"1.0"	true
# "unaccent"	"1.1"	true
# "uuid-ossp"	"1.1"	true

# Create non-root user if environment variables are provided
if [ -n "${POSTGRES_NON_ROOT_USER:-}" ] && [ -n "${POSTGRES_NON_ROOT_PASSWORD:-}" ]; then
	psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
		CREATE USER ${POSTGRES_NON_ROOT_USER} WITH PASSWORD '${POSTGRES_NON_ROOT_PASSWORD}';
		GRANT ALL PRIVILEGES ON DATABASE "${POSTGRES_DB}" TO ${POSTGRES_NON_ROOT_USER};
		GRANT CREATE ON SCHEMA public TO ${POSTGRES_NON_ROOT_USER};
	EOSQL
	echo "SETUP INFO: Non-root user '${POSTGRES_NON_ROOT_USER}' created successfully"
else
	echo "SETUP INFO: No non-root user environment variables provided - skipping user creation"
fi
