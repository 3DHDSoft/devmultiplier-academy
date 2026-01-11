# Grafana Cloud Dashboards

Pre-configured dashboards for DevAcademy application monitoring on Grafana Cloud.

## Directory Structure

```
📦 grafana-cloud/
├── 📖 README.md                              # This documentation
├── 📁 dashboards/
│   ├── 📊 application-overview.json          # HTTP requests, errors, login activity, DB queries
│   ├── 📊 performance-metrics.json           # Response time percentiles, throughput, latency
│   └── 📊 security-monitoring.json           # Failed logins, suspicious activity, geo-tracking
└── 📁 scripts/
    └── ⚙️ import-dashboards.sh               # Automated dashboard import script
```

**Legend:**
- 📦 Project root
- 📁 Directory
- 📖 Documentation
- 📊 Dashboard configuration
- ⚙️ Shell script

## Prerequisites

> ℹ️ **Note**: These dashboards are designed for Grafana Cloud. For local development, use the dashboards in `.devcontainer/grafana/dashboards/` instead.

1. **Grafana Cloud account** with OTLP gateway configured
2. **Application sending metrics** via OpenTelemetry to Grafana Cloud
3. **Prometheus datasource** - dashboards use `grafanacloud-devacademyweb-prom` (update if your UID differs)

## Import Instructions

### Method 1: Import via Grafana UI

1. Log in to your Grafana Cloud instance
2. Go to **Dashboards** → **New** → **Import**
3. Click **Upload JSON file** and select a dashboard file
4. Select your Prometheus datasource (should be `grafanacloud-prom`)
5. Click **Import**
6. Repeat for each dashboard

### Method 2: Import via Script (Recommended)

> 💡 **Tip**: Use the import script for automated deployment or CI/CD pipelines.

**Step 1**: Add Grafana credentials to `.env.vercel.cloud`:

```bash
# Grafana Cloud API (for dashboard import)
GRAFANA_URL="https://your-org.grafana.net"
GRAFANA_API_KEY="your-service-account-token"
```

> ℹ️ **Note**: Create a service account token at **Administration** → **Service accounts** with `Editor` role.

**Step 2**: Run the import script:

```bash
./grafana-cloud/scripts/import-dashboards.sh
```

The script will:
- Load credentials from `.env.vercel.cloud`
- Import all dashboards from `grafana-cloud/dashboards/`
- Report success/failure for each dashboard

### Method 3: Manual API Import

```bash
# Set your Grafana Cloud credentials
export GRAFANA_URL="https://your-instance.grafana.net"
export GRAFANA_API_KEY="your-api-key"

# Import a single dashboard
curl -X POST "$GRAFANA_URL/api/dashboards/db" \
  -H "Authorization: Bearer $GRAFANA_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"dashboard\": $(cat grafana-cloud/dashboards/application-overview.json), \"overwrite\": true}"
```

## Datasource Configuration

These dashboards use the datasource UID `grafanacloud-devacademyweb-prom`. If your Prometheus datasource has a different UID, update the dashboards:

```bash
# Find your datasource UID
curl -s "$GRAFANA_URL/api/datasources" \
  -H "Authorization: Bearer $GRAFANA_API_KEY" | jq '.[] | {name, uid}'

# Replace datasource UID in all dashboard files (example)
sed -i 's/grafanacloud-devacademyweb-prom/your-datasource-uid/g' grafana-cloud/dashboards/*.json
```

## Dashboard Descriptions

### Application Overview (`devacademy-overview-cloud`)
- HTTP Client Request Rate
- Average HTTP Response Time
- API Error Rate
- Login Activity (attempts/success/failures)
- Database Query Rate
- HTTP Requests by Endpoint (pie chart)

### Performance Metrics (`devacademy-performance-cloud`)
- HTTP Response Time Percentiles (p50/p95/p99)
- Database Query Time Percentiles
- Database Query Duration by Operation
- External API Call Duration (p95)
- HTTP Request/Response Sizes
- Throughput by Route

### Security Monitoring (`devacademy-security-cloud`)
- Recent Failed Logins (5m window)
- Suspicious Login Attempts
- Logins from New Locations
- Login Success Rate (gauge)
- Login Failures by Reason
- Login Attempts by Country
- Top Suspicious Login Locations (table)
- Security Email Alerts Sent

## Metrics Required

These dashboards expect the following metrics from your application, filtered by `job="dev-academy-web"`:

| Metric | Type | Description |
|--------|------|-------------|
| `http_server_request_duration_seconds` | Histogram | HTTP request latency |
| `db_queries_total` | Counter | Database query count |
| `db_query_duration` | Histogram | Database query latency |
| `api_errors_total` | Counter | API errors by type |
| `api_call_duration` | Histogram | External API call latency |
| `user_login_attempts_total` | Counter | Total login attempts |
| `user_login_success_total` | Counter | Successful logins |
| `user_login_failures_total` | Counter | Failed logins (with `failure_reason` label) |
| `user_login_suspicious_total` | Counter | Suspicious login attempts |
| `user_login_new_location_total` | Counter | Logins from new locations |
| `email_sent_total` | Counter | Security emails sent (with `email_type` label) |

> **Note**: Metrics are filtered using `job="dev-academy-web"` label in Grafana Cloud. The `job` label is automatically added by Grafana Cloud's OTLP receiver based on the service name.

## Local vs Cloud Dashboards

| Feature | Local (`.devcontainer/grafana/dashboards/`) | Cloud (`grafana-cloud/dashboards/`) |
|---------|---------------------------------------------|-------------------------------------|
| Datasource UID | `prometheus` | `grafanacloud-devacademyweb-prom` |
| Dashboard UID suffix | (none) | `-cloud` |
| Tag | `devacademy` | `devacademy`, `cloud` |
| Auto-provisioning | Yes (via Grafana provisioning) | No (manual import) |
| **Service filter label** | `service_name="dev-academy-web"` | `job="dev-academy-web"` |
| **Metric names** | Same as cloud (no prefix) | Same as local (no prefix) |

### Why Different Filter Labels?

- **Local stack**: Uses OpenTelemetry Collector with `resource_to_telemetry_conversion` enabled, which converts the `service.name` resource attribute to a `service_name` label.
- **Cloud stack**: Grafana Cloud's OTLP receiver automatically maps the `service.name` attribute to the standard Prometheus `job` label.

Both use the same metric names (e.g., `http_server_request_duration_seconds`, `user_login_attempts_total`). The only difference is the filter label used to identify the service.

## Troubleshooting

### No data in dashboards

1. Verify metrics are being sent to Grafana Cloud:
   ```bash
   curl -s "$GRAFANA_URL/api/datasources/proxy/uid/grafanacloud-prom/api/v1/query?query=up" \
     -H "Authorization: Bearer $GRAFANA_API_KEY"
   ```

2. Check for metrics with the `dev-academy-web` job label:
   ```bash
   curl -s "$GRAFANA_URL/api/datasources/proxy/uid/grafanacloud-prom/api/v1/query?query=http_server_request_duration_seconds_count{job=\"dev-academy-web\"}" \
     -H "Authorization: Bearer $GRAFANA_API_KEY"
   ```

3. List all available metrics:
   ```bash
   curl -s "$GRAFANA_URL/api/datasources/proxy/uid/grafanacloud-prom/api/v1/label/__name__/values" \
     -H "Authorization: Bearer $GRAFANA_API_KEY" | jq '.data | map(select(contains("http") or contains("user_login") or contains("db_")))'
   ```

### Wrong datasource

If dashboards show "No data" but metrics exist, verify the datasource UID matches:
1. Go to **Configuration** → **Data sources**
2. Click on your Prometheus datasource
3. Copy the UID from the URL or datasource settings
4. Update dashboard JSON files if different from `grafanacloud-prom`

## Related Documentation

- 📖 [OTEL Configuration](../docs/error-handling-logging.md#option-4-grafana-cloud-managed-opentelemetry)
- 📊 [Local Grafana Dashboards](../.devcontainer/grafana/dashboards/)
- ⚙️ [Metrics Implementation](../src/lib/metrics.ts)

---

_DevMultiplier Academy - Building 10x-100x Developers in the Age of AI_
