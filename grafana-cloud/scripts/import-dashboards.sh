#!/usr/bin/env bash
#
# Import Grafana Cloud dashboards from JSON files
#
# Usage:
#   ./import-dashboards.sh
#
# Environment Variables (set in .env.vercel.cloud or export manually):
#   GRAFANA_URL       - Grafana Cloud instance URL (e.g., https://your-org.grafana.net)
#   GRAFANA_API_KEY   - Service account token with Editor role
#
# The script will:
#   1. Load env vars from .env.vercel.cloud if present
#   2. Import all dashboard JSON files from grafana-cloud/dashboards/
#   3. Report success/failure for each dashboard
#

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
DASHBOARDS_DIR="$PROJECT_ROOT/grafana-cloud/dashboards"
ENV_FILE="$PROJECT_ROOT/.env.vercel.cloud"

echo -e "${BLUE}📊 Grafana Cloud Dashboard Importer${NC}"
echo "========================================"

# Load environment variables from .env.vercel.cloud
if [[ -f "$ENV_FILE" ]]; then
    echo -e "${YELLOW}📄 Loading environment from $ENV_FILE${NC}"
    # Source only GRAFANA_* variables (avoid sourcing OTEL vars which may have special chars)
    while IFS='=' read -r key value; do
        if [[ "$key" =~ ^GRAFANA_ ]]; then
            # Remove surrounding quotes if present
            value="${value%\"}"
            value="${value#\"}"
            export "$key=$value"
        fi
    done < <(grep -E "^GRAFANA_" "$ENV_FILE" 2>/dev/null || true)
fi

# Validate required environment variables
if [[ -z "${GRAFANA_URL:-}" ]]; then
    echo -e "${RED}❌ Error: GRAFANA_URL is not set${NC}"
    echo ""
    echo "Please set the following in .env.vercel.cloud or export manually:"
    echo "  GRAFANA_URL=\"https://your-org.grafana.net\""
    echo "  GRAFANA_API_KEY=\"your-service-account-token\""
    echo ""
    echo "To create a service account token:"
    echo "  1. Go to Grafana Cloud → Administration → Service accounts"
    echo "  2. Create a new service account with 'Editor' role"
    echo "  3. Generate a token and add it to your env file"
    exit 1
fi

if [[ -z "${GRAFANA_API_KEY:-}" ]]; then
    echo -e "${RED}❌ Error: GRAFANA_API_KEY is not set${NC}"
    echo ""
    echo "Please add to .env.vercel.cloud:"
    echo "  GRAFANA_API_KEY=\"your-service-account-token\""
    exit 1
fi

echo -e "${GREEN}✓ Grafana URL: ${GRAFANA_URL}${NC}"
echo -e "${GREEN}✓ API Key: ****${GRAFANA_API_KEY: -4}${NC}"
echo ""

# Check if dashboards directory exists
if [[ ! -d "$DASHBOARDS_DIR" ]]; then
    echo -e "${RED}❌ Error: Dashboards directory not found: $DASHBOARDS_DIR${NC}"
    exit 1
fi

# Count dashboards
DASHBOARD_COUNT=$(find "$DASHBOARDS_DIR" -name "*.json" -type f | wc -l)
if [[ "$DASHBOARD_COUNT" -eq 0 ]]; then
    echo -e "${YELLOW}⚠️ No dashboard files found in $DASHBOARDS_DIR${NC}"
    exit 0
fi

echo -e "${BLUE}📁 Found $DASHBOARD_COUNT dashboard(s) to import${NC}"
echo ""

# Folder name for dashboards
FOLDER_NAME="DevAcademy"

# Check if folder exists, create if not
echo -e "${YELLOW}📁 Checking for '$FOLDER_NAME' folder...${NC}"
folder_response=$(curl -s \
    -X GET "${GRAFANA_URL}/api/folders" \
    -H "Authorization: Bearer ${GRAFANA_API_KEY}" \
    -H "Content-Type: application/json")

FOLDER_UID=$(echo "$folder_response" | jq -r ".[] | select(.title == \"$FOLDER_NAME\") | .uid // empty")

if [[ -z "$FOLDER_UID" ]]; then
    echo -e "${YELLOW}  Creating '$FOLDER_NAME' folder...${NC}"
    create_response=$(curl -s \
        -X POST "${GRAFANA_URL}/api/folders" \
        -H "Authorization: Bearer ${GRAFANA_API_KEY}" \
        -H "Content-Type: application/json" \
        -d "{\"title\": \"$FOLDER_NAME\"}")

    FOLDER_UID=$(echo "$create_response" | jq -r '.uid // empty')

    if [[ -z "$FOLDER_UID" ]]; then
        echo -e "${RED}❌ Failed to create folder: $(echo "$create_response" | jq -r '.message // "Unknown error"')${NC}"
        exit 1
    fi
    echo -e "${GREEN}  ✓ Created folder (uid: $FOLDER_UID)${NC}"
else
    echo -e "${GREEN}  ✓ Folder exists (uid: $FOLDER_UID)${NC}"
fi
echo ""

# Import each dashboard
SUCCESS_COUNT=0
FAIL_COUNT=0

for dashboard_file in "$DASHBOARDS_DIR"/*.json; do
    filename=$(basename "$dashboard_file")
    dashboard_name=$(jq -r '.title // "Unknown"' "$dashboard_file")

    echo -n "  📊 Importing: $dashboard_name ($filename)... "

    # Build the import payload with folder UID
    payload=$(jq --arg folderUid "$FOLDER_UID" '{dashboard: ., overwrite: true, folderUid: $folderUid}' "$dashboard_file")

    # Make API request
    response=$(curl -s -w "\n%{http_code}" \
        -X POST "${GRAFANA_URL}/api/dashboards/db" \
        -H "Authorization: Bearer ${GRAFANA_API_KEY}" \
        -H "Content-Type: application/json" \
        -d "$payload" 2>&1)

    # Extract HTTP status code (last line)
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    if [[ "$http_code" == "200" ]]; then
        uid=$(echo "$body" | jq -r '.uid // "unknown"')
        url=$(echo "$body" | jq -r '.url // ""')
        echo -e "${GREEN}✓ Success (uid: $uid)${NC}"
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    else
        error_msg=$(echo "$body" | jq -r '.message // "Unknown error"' 2>/dev/null || echo "$body")
        echo -e "${RED}✗ Failed (HTTP $http_code: $error_msg)${NC}"
        FAIL_COUNT=$((FAIL_COUNT + 1))
    fi
done

echo ""
echo "========================================"
echo -e "${BLUE}📊 Import Summary${NC}"
echo -e "  ${GREEN}✓ Successful: $SUCCESS_COUNT${NC}"
if [[ "$FAIL_COUNT" -gt 0 ]]; then
    echo -e "  ${RED}✗ Failed: $FAIL_COUNT${NC}"
fi
echo ""

if [[ "$FAIL_COUNT" -gt 0 ]]; then
    exit 1
fi

echo -e "${GREEN}🎉 All dashboards imported successfully!${NC}"
echo ""
echo "View your dashboards at: ${GRAFANA_URL}/dashboards"
