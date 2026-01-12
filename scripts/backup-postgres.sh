#!/bin/bash
# PostgreSQL Database Backup Script (Docker version)
# Runs pg_dump inside the postgres container
# Usage: ./backup-postgres.sh -d "database_name" [-o "output_dir"] [-f "format"] [-C "container_name"]

# From project root
# Basic - uses container's POSTGRES_USER env var
# ./scripts/backup-postgres.sh -d academy

# Specify user
# ./scripts/backup-postgres.sh -d academy -u admin

# With output directory and format
# ./scripts/backup-postgres.sh -d academy -o ./backups -f plain

# Different container name
# ./scripts/backup-postgres.sh -d academy -C my-postgres-container

# Restore backup
#   docker exec -i postgres pg_restore -U admin -d academy < ./backups/academy_latest.dump
# Or for a clean restore:
#   docker exec -i postgres pg_restore -U admin -d academy --clean --if-exists < ./backups/academy_latest.dump

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
OUTPUT_DIR="./backups"
FORMAT="custom"  # custom, plain, directory, tar
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
CONTAINER="postgres"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

usage() {
    cat << EOF
PostgreSQL Database Backup Script (Docker version)

Runs pg_dump inside the postgres container.

Usage: $(basename "$0") [OPTIONS]

Required:
  -d, --database      Database name to backup

Optional:
  -C, --container     Docker container name (default: postgres)
  -o, --output        Output directory (default: ./backups)
  -f, --format        Backup format: custom, plain, directory, tar (default: custom)
  -u, --user          PostgreSQL user (default: uses POSTGRES_USER env var in container)
  -h, --help          Show this help message

Examples:
  $(basename "$0") -d academy
  $(basename "$0") -d academy -o /backups -f plain
  $(basename "$0") -d academy -C my-postgres-container -u admin

Formats:
  custom    - Compressed archive, allows selective restore with pg_restore (recommended)
  plain     - Plain SQL script (.sql), restore with psql
  tar       - Tar archive
  directory - Directory with one file per table

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

# Parse command line arguments
DATABASE=""
PG_USER=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -d|--database)
            DATABASE="$2"
            shift 2
            ;;
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
        -u|--user)
            PG_USER="$2"
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

# Validate required parameters
if [[ -z "$DATABASE" ]]; then
    log_error "Database name is required (-d or --database)"
    usage
fi

# Validate format
case $FORMAT in
    custom|plain|directory|tar)
        ;;
    *)
        log_error "Invalid format: $FORMAT. Must be one of: custom, plain, directory, tar"
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
    exit 1
fi

# Get POSTGRES_USER from container if not specified
if [[ -z "$PG_USER" ]]; then
    PG_USER=$(docker exec "$CONTAINER" printenv POSTGRES_USER 2>/dev/null || echo "postgres")
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
    directory)
        EXT="dir"
        FORMAT_FLAG="-Fd"
        ;;
    tar)
        EXT="tar"
        FORMAT_FLAG="-Ft"
        ;;
esac

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Generate backup filename
BACKUP_FILE="${OUTPUT_DIR}/${DATABASE}_${TIMESTAMP}.${EXT}"
CONTAINER_BACKUP_PATH="/tmp/${DATABASE}_${TIMESTAMP}.${EXT}"

log_info "Starting backup of database: $DATABASE"
log_info "Container: $CONTAINER"
log_info "User: $PG_USER"
log_info "Format: $FORMAT"
log_info "Output: $BACKUP_FILE"

# Perform the backup
START_TIME=$(date +%s)

if [[ "$FORMAT" == "directory" ]]; then
    # Directory format requires special handling
    docker exec "$CONTAINER" pg_dump -U "$PG_USER" -d "$DATABASE" $FORMAT_FLAG -f "$CONTAINER_BACKUP_PATH" --verbose
    
    # Copy directory from container
    docker cp "$CONTAINER:$CONTAINER_BACKUP_PATH" "$BACKUP_FILE"
    
    # Cleanup in container
    docker exec "$CONTAINER" rm -rf "$CONTAINER_BACKUP_PATH"
else
    # Stream backup directly from container to local file
    docker exec "$CONTAINER" pg_dump -U "$PG_USER" -d "$DATABASE" $FORMAT_FLAG > "$BACKUP_FILE"
fi

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

# Verify backup was created
if [[ ! -e "$BACKUP_FILE" ]]; then
    log_error "Backup file was not created!"
    exit 1
fi

# Get backup size
if [[ "$FORMAT" == "directory" ]]; then
    BACKUP_SIZE=$(du -sh "$BACKUP_FILE" | cut -f1)
else
    BACKUP_SIZE=$(ls -lh "$BACKUP_FILE" | awk '{print $5}')
fi

log_info "Backup completed successfully!"
log_info "Duration: ${DURATION} seconds"
log_info "Size: $BACKUP_SIZE"
log_info "File: $BACKUP_FILE"

# Create a latest symlink
LATEST_LINK="${OUTPUT_DIR}/${DATABASE}_latest.${EXT}"
if [[ "$FORMAT" != "directory" ]]; then
    ln -sf "$(basename "$BACKUP_FILE")" "$LATEST_LINK"
    log_info "Latest symlink: $LATEST_LINK"
fi

echo ""
echo "To restore this backup, copy it to the container and run:"
case $FORMAT in
    custom|directory|tar)
        echo "  docker exec -i $CONTAINER pg_restore -U $PG_USER -d $DATABASE < $BACKUP_FILE"
        echo "  # Or for a clean restore:"
        echo "  docker exec -i $CONTAINER pg_restore -U $PG_USER -d $DATABASE --clean --if-exists < $BACKUP_FILE"
        ;;
    plain)
        echo "  docker exec -i $CONTAINER psql -U $PG_USER -d $DATABASE < $BACKUP_FILE"
        ;;
esac
