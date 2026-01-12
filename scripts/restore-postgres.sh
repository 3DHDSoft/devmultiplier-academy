#!/bin/bash
# PostgreSQL Database Restore Script (Docker version)
# Runs pg_restore/psql inside the postgres container
# Usage: ./restore-postgres.sh -f "backup_file" [-d "database"] [-C "container"] [--clean]

# From project root
# ./scripts/restore-postgres.sh -f ./backups/academy_latest.dump --clean

# Verification Commands
# Connect to database:      docker exec -it postgres psql -U admin -d academy
# List tables:              docker exec postgres psql -U admin -d academy -c '\dt+'
# Count rows in all tables: docker exec postgres psql -U admin -d academy -c "SELECT schemaname, relname, n_live_tup FROM pg_stat_user_tables ORDER BY n_live_tup DESC;"
	
# Features:
# - Auto-detects format from extension (`.dump`, `.sql`, `.tar`)
# - Extracts database name from backup filename
# - `--clean` - drops existing objects before restore
# - `--drop-db` - drops entire database (with confirmation prompt)
# - `--create-db` - creates database if it doesn't exist
# - Shows table listing after restore for verification

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

# Default values
CONTAINER="postgres"
CLEAN_RESTORE=false
CREATE_DB=false
DROP_DB=false

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

usage() {
    cat << EOF
PostgreSQL Database Restore Script (Docker version)

Runs pg_restore/psql inside the postgres container.

Usage: $(basename "$0") [OPTIONS]

Required:
  -f, --file          Backup file to restore (.dump, .sql, .tar)

Optional:
  -d, --database      Target database name (default: extracted from filename)
  -C, --container     Docker container name (default: postgres)
  -u, --user          PostgreSQL user (default: uses POSTGRES_USER env var in container)
  --clean             Drop existing objects before restore (pg_restore only)
  --create-db         Create database before restore
  --drop-db           Drop and recreate database before restore (DESTRUCTIVE!)
  -h, --help          Show this help message

Examples:
  $(basename "$0") -f ./backups/academy_20260112.dump
  $(basename "$0") -f ./backups/academy_latest.dump -d academy_restored
  $(basename "$0") -f ./backups/academy.sql -d academy
  $(basename "$0") -f ./backups/academy.dump --clean
  $(basename "$0") -f ./backups/academy.dump --drop-db

File Formats:
  .dump    - Compressed archive, allows selective restore with pg_restore (recommended)
  .sql     - Plain SQL script (.sql), restore with psql
  .tar     - Tar archive (pg_restore)

Note: For Prisma projects, --drop-db is usually cleanest since it ensures migrations table and all schemas are fresh.	

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

# Extract database name from backup filename
extract_dbname_from_file() {
    local filename="$1"
    # Remove path, then remove timestamp and extension
    # Example: ./backups/academy_20260112_053230.dump -> academy
    basename "$filename" | sed -E 's/_[0-9]{8}_[0-9]{6}\.(dump|sql|tar)$//' | sed -E 's/_latest\.(dump|sql|tar)$//' | sed -E 's/\.(dump|sql|tar)$//'
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

# Parse command line arguments
BACKUP_FILE=""
DATABASE=""
PG_USER=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -f|--file)
            BACKUP_FILE="$2"
            shift 2
            ;;
        -d|--database)
            DATABASE="$2"
            shift 2
            ;;
        -C|--container)
            CONTAINER="$2"
            shift 2
            ;;
        -u|--user)
            PG_USER="$2"
            shift 2
            ;;
        --clean)
            CLEAN_RESTORE=true
            shift
            ;;
        --create-db)
            CREATE_DB=true
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

# Extract database name if not provided
if [[ -z "$DATABASE" ]]; then
    DATABASE=$(extract_dbname_from_file "$BACKUP_FILE")
    log_info "Database name extracted from filename: $DATABASE"
fi

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
    exit 1
fi

# Get POSTGRES_USER from container if not specified
if [[ -z "$PG_USER" ]]; then
    PG_USER=$(docker exec "$CONTAINER" printenv POSTGRES_USER 2>/dev/null || echo "postgres")
fi

# Get backup file size
BACKUP_SIZE=$(ls -lh "$BACKUP_FILE" | awk '{print $5}')

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  PostgreSQL Database Restore"
echo "════════════════════════════════════════════════════════════════"
echo ""
log_info "Backup file: $BACKUP_FILE"
log_info "File size: $BACKUP_SIZE"
log_info "Format: $FORMAT"
log_info "Target database: $DATABASE"
log_info "Container: $CONTAINER"
log_info "User: $PG_USER"
[[ "$CLEAN_RESTORE" == true ]] && log_info "Mode: Clean restore (drop existing objects)"
[[ "$DROP_DB" == true ]] && log_warn "Mode: DROP and recreate database!"
[[ "$CREATE_DB" == true ]] && log_info "Mode: Create database if not exists"
echo ""

# Confirmation for destructive operations
if [[ "$DROP_DB" == true ]]; then
    echo -e "${RED}WARNING: This will DROP the database '$DATABASE' and all its data!${NC}"
    read -p "Type 'yes' to confirm: " confirm
    if [[ "$confirm" != "yes" ]]; then
        log_info "Restore cancelled."
        exit 0
    fi
    echo ""
fi

# Start restore
START_TIME=$(date +%s)

# Drop database if requested
if [[ "$DROP_DB" == true ]]; then
    log_step "Dropping database '$DATABASE'..."
    docker exec "$CONTAINER" psql -U "$PG_USER" -d postgres -c "DROP DATABASE IF EXISTS \"$DATABASE\";" || true
    CREATE_DB=true
fi

# Create database if requested
if [[ "$CREATE_DB" == true ]]; then
    log_step "Creating database '$DATABASE'..."
    docker exec "$CONTAINER" psql -U "$PG_USER" -d postgres -c "CREATE DATABASE \"$DATABASE\";" 2>/dev/null || log_warn "Database may already exist"
fi

# Perform the restore
log_step "Restoring backup..."

case $FORMAT in
    custom|tar)
        # Build pg_restore command
        RESTORE_CMD="pg_restore -U $PG_USER -d $DATABASE"
        
        if [[ "$CLEAN_RESTORE" == true ]]; then
            RESTORE_CMD="$RESTORE_CMD --clean --if-exists"
        fi
        
        RESTORE_CMD="$RESTORE_CMD --no-owner --no-acl --verbose"
        
        # Stream backup file to container's pg_restore
        docker exec -i "$CONTAINER" $RESTORE_CMD < "$BACKUP_FILE" 2>&1 | while read -r line; do
            if [[ "$line" == *"pg_restore:"* ]]; then
                echo -e "${CYAN}  →${NC} $line"
            fi
        done || true  # pg_restore may return non-zero even on success with warnings
        ;;
    plain)
        if [[ "$CLEAN_RESTORE" == true ]]; then
            log_warn "--clean flag ignored for plain SQL format"
        fi
        
        # Stream SQL file to container's psql
        docker exec -i "$CONTAINER" psql -U "$PG_USER" -d "$DATABASE" -v ON_ERROR_STOP=0 < "$BACKUP_FILE" 2>&1 | while read -r line; do
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
log_step "Database status:"
docker exec "$CONTAINER" psql -U "$PG_USER" -d "$DATABASE" -c "\dt+" 2>/dev/null | head -20 || log_warn "Could not list tables"

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  Verification Commands"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "  # Connect to database:"
echo "  docker exec -it $CONTAINER psql -U $PG_USER -d $DATABASE"
echo ""
echo "  # List tables:"
echo "  docker exec $CONTAINER psql -U $PG_USER -d $DATABASE -c '\\dt+'"
echo ""
echo "  # Count rows in all tables:"
echo "  docker exec $CONTAINER psql -U $PG_USER -d $DATABASE -c \"SELECT schemaname, relname, n_live_tup FROM pg_stat_user_tables ORDER BY n_live_tup DESC;\""
echo ""
