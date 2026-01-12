#!/bin/bash
# Neon Serverless PostgreSQL Restore Script
# Runs pg_restore/psql inside a postgres container to restore to remote Neon database
# Usage: ./restore-neon.sh -f "backup_file" [--clean] [--drop-db]

# From project root
# Basic restore (reads DATABASE_URL from .env.local)
# ./scripts/restore-neon.sh -f ./backups_cloud/neondb_latest.dump

# Clean restore (drops existing objects first)
# ./scripts/restore-neon.sh -f ./backups_cloud/neondb_latest.dump --clean

# Drop and recreate entire database (DESTRUCTIVE)
# ./scripts/restore-neon.sh -f ./backups_cloud/neondb_latest.dump --drop-db

# Use different env file
# ./scripts/restore-neon.sh -f ./backups_cloud/neondb_latest.dump -e .env.production

# Restore SQL file
# ./scripts/restore-neon.sh -f ./backups_cloud/neondb.sql

# Features:
# - Reads `DATABASE_URL` from `.env.local`
# - Always asks for confirmation (remote database!)
# - Automatically adds `sslmode=require` for Neon
# - `--clean` drops objects before restore
# - `--drop-db` drops entire database and recreates
# - Shows table listing after restore

# Project structure:
# 📦 /
# ├─📁 scripts/
# │   ├─📄 backup-postgres.sh    # Local backup
# │   ├─📄 backup-neon.sh        # Neon backup
# │   ├─📄 restore-postgres.sh   # Local restore
# │   └─📄 restore-neon.sh       # Neon restore
# ├─📁 backups/                  # Local backups
# ├─📁 backups_cloud/            # Neon backups
# └─📄 .env.local                # DATABASE_URL here

set -euo pipefail

# Get script directory to find .env.local relative to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Default values
CONTAINER="postgres"
CLEAN_RESTORE=false
DROP_DB=false

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

usage() {
    cat << EOF
Neon Serverless PostgreSQL Restore Script

Runs pg_restore/psql inside a postgres container to restore to remote Neon database.
Reads DATABASE_URL from .env.local in project root.

Usage: $(basename "$0") [OPTIONS]

Required:
  -f, --file          Backup file to restore (.dump, .sql, .tar)

Optional:
  -C, --container     Docker container name with pg_restore (default: postgres)
  -e, --env-file      Path to env file (default: .env.local in project root)
  --clean             Drop existing objects before restore (pg_restore only)
  --drop-db           Drop and recreate database before restore (DESTRUCTIVE!)
  -h, --help          Show this help message

Examples:
  $(basename "$0") -f ./backups_cloud/mydb_latest.dump
  $(basename "$0") -f ./backups_cloud/mydb_20260112.dump --clean
  $(basename "$0") -f ./backups_cloud/mydb.sql
  $(basename "$0") -f ./backups_cloud/mydb.dump --drop-db
  $(basename "$0") -f ./backups_cloud/mydb.dump -e .env.production

File Formats:
  .dump    - Compressed archive, allows selective restore with pg_restore (recommended)
  .sql     - Plain SQL script (.sql), restore with psql
  .tar     - Tar archive (pg_restore)

Note: Neon connection strings require SSL. This script automatically adds sslmode=require.

EOF
    exit 1
}

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

log_step() {
    echo -e "${CYAN}[STEP]${NC} $1"
}

# Extract database name from connection string
extract_dbname() {
    local conn="$1"
    echo "$conn" | sed -E 's|.*://[^/]+/([^?]+).*|\1|'
}

# Extract host from connection string
extract_host() {
    local conn="$1"
    echo "$conn" | sed -E 's|.*@([^:/]+).*|\1|'
}

# Extract user from connection string
extract_user() {
    local conn="$1"
    echo "$conn" | sed -E 's|.*://([^:]+):.*|\1|'
}

# Ensure SSL mode is set
ensure_ssl() {
    local conn="$1"
    if [[ "$conn" != *"sslmode="* ]]; then
        if [[ "$conn" == *"?"* ]]; then
            echo "${conn}&sslmode=require"
        else
            echo "${conn}?sslmode=require"
        fi
    else
        echo "$conn"
    fi
}

# Build connection string for postgres database (for DROP/CREATE operations)
get_postgres_conn() {
    local conn="$1"
    # Replace database name with 'postgres' for admin operations
    echo "$conn" | sed -E 's|(.*://[^/]+/)([^?]+)(.*)|\1postgres\3|'
}

# Detect file format from extension
detect_format() {
    local filename="$1"
    case "${filename##*.}" in
        dump)
            echo "custom"
            ;;
        sql)
            echo "plain"
            ;;
        tar)
            echo "tar"
            ;;
        *)
            echo "unknown"
            ;;
    esac
}

# Load DATABASE_URL from env file
load_env() {
    local env_file="$1"
    
    if [[ ! -f "$env_file" ]]; then
        log_error "Environment file not found: $env_file"
        exit 1
    fi
    
    # Extract DATABASE_URL from env file (handles quotes and exports)
    local db_url
    db_url=$(grep -E "^DATABASE_URL=" "$env_file" | sed -E 's/^DATABASE_URL=["'"'"']?([^"'"'"']*)["'"'"']?$/\1/' | head -1)
    
    if [[ -z "$db_url" ]]; then
        log_error "DATABASE_URL not found in $env_file"
        exit 1
    fi
    
    echo "$db_url"
}

# Parse command line arguments
ENV_FILE="${PROJECT_ROOT}/.env.local"
BACKUP_FILE=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -f|--file)
            BACKUP_FILE="$2"
            shift 2
            ;;
        -C|--container)
            CONTAINER="$2"
            shift 2
            ;;
        -e|--env-file)
            ENV_FILE="$2"
            shift 2
            ;;
        --clean)
            CLEAN_RESTORE=true
            shift
            ;;
        --drop-db)
            DROP_DB=true
            shift
            ;;
        -h|--help)
            usage
            ;;
        *)
            log_error "Unknown option: $1"
            usage
            ;;
    esac
done

# Validate required parameters
if [[ -z "$BACKUP_FILE" ]]; then
    log_error "Backup file is required (-f or --file)"
    usage
fi

# Resolve symlinks and check file exists
if [[ -L "$BACKUP_FILE" ]]; then
    BACKUP_FILE=$(readlink -f "$BACKUP_FILE")
fi

if [[ ! -f "$BACKUP_FILE" ]]; then
    log_error "Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Get absolute path
BACKUP_FILE=$(cd "$(dirname "$BACKUP_FILE")" && pwd)/$(basename "$BACKUP_FILE")

# Detect format
FORMAT=$(detect_format "$BACKUP_FILE")
if [[ "$FORMAT" == "unknown" ]]; then
    log_error "Unknown backup format. Supported: .dump, .sql, .tar"
    exit 1
fi

# Load DATABASE_URL from .env.local
log_info "Loading DATABASE_URL from $ENV_FILE"
CONNECTION=$(load_env "$ENV_FILE")

# Ensure SSL is enabled (required for Neon)
CONNECTION=$(ensure_ssl "$CONNECTION")

# Extract database info
DB_NAME=$(extract_dbname "$CONNECTION")
DB_HOST=$(extract_host "$CONNECTION")
DB_USER=$(extract_user "$CONNECTION")

# Check if docker is available
if ! command -v docker &> /dev/null; then
    log_error "docker command not found."
    exit 1
fi

# Check if container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER}$"; then
    log_error "Container '$CONTAINER' is not running."
    log_info "Running containers:"
    docker ps --format '  {{.Names}}'
    log_info ""
    log_info "Start your postgres container or specify a different container with -C"
    exit 1
fi

# Get backup file size
BACKUP_SIZE=$(ls -lh "$BACKUP_FILE" | awk '{print $5}')

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  Neon PostgreSQL Restore"
echo "════════════════════════════════════════════════════════════════"
echo ""
log_info "Backup file: $BACKUP_FILE"
log_info "File size: $BACKUP_SIZE"
log_info "Format: $FORMAT"
log_info "Target: $DB_NAME @ $DB_HOST"
log_info "User: $DB_USER"
log_info "Container: $CONTAINER"
[[ "$CLEAN_RESTORE" == true ]] && log_info "Mode: Clean restore (drop existing objects)"
[[ "$DROP_DB" == true ]] && log_warn "Mode: DROP and recreate database!"
echo ""

# Confirmation for all Neon restores (it's a remote database!)
echo -e "${YELLOW}WARNING: This will restore to REMOTE Neon database '$DB_NAME'${NC}"
if [[ "$DROP_DB" == true ]]; then
    echo -e "${RED}WARNING: This will DROP the database '$DB_NAME' and ALL its data!${NC}"
fi
read -p "Type 'yes' to confirm: " confirm
if [[ "$confirm" != "yes" ]]; then
    log_info "Restore cancelled."
    exit 0
fi
echo ""

# Start restore
START_TIME=$(date +%s)

# Drop database if requested
if [[ "$DROP_DB" == true ]]; then
    log_step "Dropping database '$DB_NAME' on Neon..."
    POSTGRES_CONN=$(get_postgres_conn "$CONNECTION")
    
    # Terminate existing connections (Neon specific - use neon_superuser or owner)
    docker exec "$CONTAINER" psql "$POSTGRES_CONN" -c \
        "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();" 2>/dev/null || true
    
    # Drop database
    docker exec "$CONTAINER" psql "$POSTGRES_CONN" -c "DROP DATABASE IF EXISTS \"$DB_NAME\";" || {
        log_error "Failed to drop database. You may need to drop it manually in Neon Console."
        exit 1
    }
    
    # Create database
    log_step "Creating database '$DB_NAME' on Neon..."
    docker exec "$CONTAINER" psql "$POSTGRES_CONN" -c "CREATE DATABASE \"$DB_NAME\";" || {
        log_error "Failed to create database."
        exit 1
    }
    
    # Re-ensure SSL in connection after database operations
    CONNECTION=$(ensure_ssl "$CONNECTION")
fi

# Perform the restore
log_step "Restoring backup to Neon..."

case $FORMAT in
    custom|tar)
        # Build pg_restore command
        RESTORE_OPTS="--no-owner --no-acl --verbose"
        
        if [[ "$CLEAN_RESTORE" == true ]]; then
            RESTORE_OPTS="--clean --if-exists $RESTORE_OPTS"
        fi
        
        # Stream backup file to container's pg_restore
        docker exec -i "$CONTAINER" pg_restore -d "$CONNECTION" $RESTORE_OPTS < "$BACKUP_FILE" 2>&1 | while read -r line; do
            if [[ "$line" == *"pg_restore:"* ]]; then
                # Filter some noise
                if [[ "$line" != *"WARNING:"*"no privileges"* ]]; then
                    echo -e "${CYAN}  →${NC} $line"
                fi
            fi
        done || true  # pg_restore may return non-zero even on success with warnings
        ;;
    plain)
        if [[ "$CLEAN_RESTORE" == true ]]; then
            log_warn "--clean flag ignored for plain SQL format"
        fi
        
        # Stream SQL file to container's psql
        docker exec -i "$CONTAINER" psql "$CONNECTION" -v ON_ERROR_STOP=0 < "$BACKUP_FILE" 2>&1 | while read -r line; do
            if [[ -n "$line" ]]; then
                echo -e "${CYAN}  →${NC} $line"
            fi
        done
        ;;
esac

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo ""
log_info "Restore completed!"
log_info "Duration: ${DURATION} seconds"

# Show database info
echo ""
log_step "Database status (from Neon):"
docker exec "$CONTAINER" psql "$CONNECTION" -c "\dt+" 2>/dev/null | head -25 || log_warn "Could not list tables"

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  Verification Commands"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "  # Connect to Neon database:"
echo "  docker exec -it $CONTAINER psql \"\$DATABASE_URL\""
echo ""
echo "  # List tables:"
echo "  docker exec $CONTAINER psql \"\$DATABASE_URL\" -c '\\dt+'"
echo ""
echo "  # Count rows:"
echo "  docker exec $CONTAINER psql \"\$DATABASE_URL\" -c \"SELECT schemaname, relname, n_live_tup FROM pg_stat_user_tables ORDER BY n_live_tup DESC;\""
echo ""
echo "  # Or use Neon Console: https://console.neon.tech"
echo ""
