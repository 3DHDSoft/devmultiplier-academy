#!/bin/bash
# Neon Serverless PostgreSQL Backup Script
# Runs pg_dump inside a postgres container to backup remote Neon database
# Usage: ./backup-neon.sh [-o "output_dir"] [-f "format"] [-C "container_name"]

# From project root
# ./scripts/backup-neon.sh

# With options
# ./scripts/backup-neon.sh -f plain -n production

# Use different env file
# ./scripts/backup-neon.sh -e .env.production

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

# Features:
# - Automatically reads DATABASE_URL from .env.local in project root
# - Stores backups in ./backups_cloud/
# - Creates _latest symlink for easy access
# - Supports -e flag for different env files (.env.production, etc.)

# To restore to a Neon database:
#   docker exec -i postgres pg_restore \
#     --no-owner --no-acl -d "$DATABASE_URL" < ./backups_cloud/neondb_20260112_071034.dump
# 
# Or with clean restore (drops existing objects first):
#   docker exec -i postgres pg_restore \
#     --clean --if-exists --no-owner --no-acl -d "$DATABASE_URL" < ./backups_cloud/neondb_20260112_071034.dump
		
set -euo pipefail

# Get script directory to find .env.local relative to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Default values
OUTPUT_DIR="./backups_cloud"
FORMAT="custom"  # custom, plain, tar
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
CONTAINER="postgres"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

usage() {
    cat << EOF
Neon Serverless PostgreSQL Backup Script

Runs pg_dump inside a postgres container to backup remote Neon database.
Reads DATABASE_URL from .env.local in project root.

Usage: $(basename "$0") [OPTIONS]

Optional:
  -C, --container     Docker container name with pg_dump (default: postgres)
  -o, --output        Output directory (default: ./backups_cloud)
  -f, --format        Backup format: custom, plain, tar (default: custom)
  -n, --name          Custom backup name prefix (default: extracted from connection string)
  -e, --env-file      Path to env file (default: .env.local in project root)
  -h, --help          Show this help message

Examples:
  $(basename "$0")
  $(basename "$0") -o ./backups_cloud -f plain
  $(basename "$0") -n production -f custom
  $(basename "$0") -e .env.production

Formats:
  custom    - Compressed archive, allows selective restore with pg_restore (recommended)
  plain     - Plain SQL script (.sql), restore with psql
  tar       - Tar archive

Note: Neon connection strings require SSL. This script automatically adds sslmode=require if not present.

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
BACKUP_NAME=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -C|--container)
            CONTAINER="$2"
            shift 2
            ;;
        -o|--output)
            OUTPUT_DIR="$2"
            shift 2
            ;;
        -f|--format)
            FORMAT="$2"
            shift 2
            ;;
        -n|--name)
            BACKUP_NAME="$2"
            shift 2
            ;;
        -e|--env-file)
            ENV_FILE="$2"
            shift 2
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

# Load DATABASE_URL from .env.local
log_info "Loading DATABASE_URL from $ENV_FILE"
CONNECTION=$(load_env "$ENV_FILE")

# Validate format
case $FORMAT in
    custom|plain|tar)
        ;;
    directory)
        log_error "Directory format not supported for remote backups. Use: custom, plain, or tar"
        exit 1
        ;;
    *)
        log_error "Invalid format: $FORMAT. Must be one of: custom, plain, tar"
        exit 1
        ;;
esac

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

# Ensure SSL is enabled (required for Neon)
CONNECTION=$(ensure_ssl "$CONNECTION")

# Extract database info for naming
DB_NAME=$(extract_dbname "$CONNECTION")
DB_HOST=$(extract_host "$CONNECTION")

# Use custom name or database name
if [[ -z "$BACKUP_NAME" ]]; then
    BACKUP_NAME="$DB_NAME"
fi

# Set file extension based on format
case $FORMAT in
    custom)
        EXT="dump"
        FORMAT_FLAG="-Fc"
        ;;
    plain)
        EXT="sql"
        FORMAT_FLAG="-Fp"
        ;;
    tar)
        EXT="tar"
        FORMAT_FLAG="-Ft"
        ;;
esac

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Generate backup filename
BACKUP_FILE="${OUTPUT_DIR}/${BACKUP_NAME}_${TIMESTAMP}.${EXT}"

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  Neon PostgreSQL Backup"
echo "════════════════════════════════════════════════════════════════"
echo ""
log_info "Database: $DB_NAME"
log_info "Host: $DB_HOST"
log_info "Container: $CONTAINER"
log_info "Format: $FORMAT"
log_info "Output: $BACKUP_FILE"
echo ""

# Perform the backup
log_step "Starting backup..."
START_TIME=$(date +%s)

# Run pg_dump inside the container with the remote connection string
docker exec "$CONTAINER" pg_dump \
    "$CONNECTION" \
    $FORMAT_FLAG \
    --no-owner \
    --no-acl \
    --verbose \
    2>&1 > "$BACKUP_FILE" | while read -r line; do
        if [[ "$line" == *"dumping"* ]] || [[ "$line" == *"saving"* ]]; then
            echo -e "${CYAN}  →${NC} $line"
        fi
    done

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

# Verify backup was created and has content
if [[ ! -e "$BACKUP_FILE" ]]; then
    log_error "Backup file was not created!"
    exit 1
fi

BACKUP_SIZE=$(ls -lh "$BACKUP_FILE" | awk '{print $5}')

# Check if backup file is too small (might indicate an error)
BACKUP_BYTES=$(stat -f%z "$BACKUP_FILE" 2>/dev/null || stat -c%s "$BACKUP_FILE" 2>/dev/null || echo "0")
if [[ "$BACKUP_BYTES" -lt 100 ]]; then
    log_warn "Backup file seems too small. Check for errors:"
    cat "$BACKUP_FILE"
    exit 1
fi

echo ""
log_info "Backup completed successfully!"
log_info "Duration: ${DURATION} seconds"
log_info "Size: $BACKUP_SIZE"
log_info "File: $BACKUP_FILE"

# Create a latest symlink
LATEST_LINK="${OUTPUT_DIR}/${BACKUP_NAME}_latest.${EXT}"
ln -sf "$(basename "$BACKUP_FILE")" "$LATEST_LINK"
log_info "Latest symlink: $LATEST_LINK"

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  Restore Instructions"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "To restore to a Neon database:"
case $FORMAT in
    custom|tar)
        echo "  docker exec -i $CONTAINER pg_restore \\"
        echo "    --no-owner --no-acl -d \"\$DATABASE_URL\" < $BACKUP_FILE"
        echo ""
        echo "  # Or with clean restore (drops existing objects first):"
        echo "  docker exec -i $CONTAINER pg_restore \\"
        echo "    --clean --if-exists --no-owner --no-acl -d \"\$DATABASE_URL\" < $BACKUP_FILE"
        ;;
    plain)
        echo "  docker exec -i $CONTAINER psql \"\$DATABASE_URL\" < $BACKUP_FILE"
        ;;
esac
echo ""
