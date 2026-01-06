# Grafana Dashboards

This directory contains Grafana dashboard configurations and provisioning setup for DevAcademy monitoring.

## Directory Structure

```
📦 grafana/
├── 📊 dashboards/
│   ├── 📈 application-overview.json
│   ├── 📈 security-monitoring.json
│   └── 📈 performance-metrics.json
├── ⚙️ provisioning/
│   ├── 🗄️ datasources/
│   │   └── 🔍 prometheus.yml
│   └── 📁 dashboards/
│       └── 📊 dashboards.yml
└── 📄 README.md
```

**Legend:**

- 📦 Root directory
- 📊 Dashboard definitions (JSON)
- 📈 Individual dashboard files
- ⚙️ Configuration/provisioning files (YAML)
- 🗄️ Data source configurations
- 🔍 Prometheus configuration
- 📁 Generic directories
- 📄 Documentation/README

## Dashboards

### 1. Application Overview

**UID:** `devacademy-overview`

Provides a high-level view of application health and activity:

- HTTP request rate and response times
- Error rates by type
- Login activity (attempts, successes, failures)
- Database query rates
- Page view distribution

**Best for:** Daily operations, quick health checks

### 2. Security Monitoring

**UID:** `devacademy-security`

Focused on authentication and security events:

- Recent failed login attempts
- Suspicious login detection
- New location login alerts
- Login success rate
- Geographic distribution of logins
- Security email alerts

**Best for:** Security teams, incident response

### 3. Performance Metrics

**UID:** `devacademy-performance`

Deep dive into application performance:

- HTTP response time percentiles (p50, p95, p99)
- Database query latency distribution
- External API call duration
- Request/Response size analysis
- Throughput by route

**Best for:** Performance optimization, SLA monitoring

## Quick Start

### Start Grafana

```bash
cd .devcontainer
docker-compose up -d grafana prometheus
```

### Access Grafana

- URL: http://localhost:3001
- Username: `admin`
- Password: `admin` (change on first login)

### View Dashboards

Navigate to **Dashboards** → **DevAcademy** folder

## Customization

### Modifying Existing Dashboards

1. Open the dashboard in Grafana
2. Make your changes
3. Save the dashboard
4. Export: **Share** → **Export** → **Save to file**
5. Replace the JSON file in `dashboards/`
6. Restart Grafana: `docker-compose restart grafana`

### Creating New Dashboards

1. Create dashboard in Grafana UI
2. Export as JSON with **Export for sharing externally** enabled
3. Save to `dashboards/` directory
4. Set a unique `uid` in the JSON
5. Restart Grafana to auto-provision

### Adding New Data Sources

Edit `provisioning/datasources/prometheus.yml` and restart Grafana.

## Dashboard Variables

You can add variables to make dashboards more flexible:

```json
"templating": {
  "list": [
    {
      "name": "route",
      "type": "query",
      "datasource": "Prometheus",
      "query": "label_values(http_server_requests_total, http_route)"
    }
  ]
}
```

## Troubleshooting

**Dashboards not appearing:**

- Check Grafana logs: `docker logs grafana`
- Verify JSON syntax: `cat dashboards/*.json | jq .`
- Check provisioning logs in Grafana UI

**No data in panels:**

- Verify Prometheus is running: http://localhost:9090
- Check Prometheus targets: http://localhost:9090/targets
- Test queries in Prometheus UI
- Verify metrics are being exported from the app

**Permission errors:**

```bash
# Fix volume permissions
docker-compose down
sudo chown -R 472:472 /path/to/grafana_data
docker-compose up -d grafana
```

## Best Practices

1. **Use UID for dashboards** - Makes linking and referencing easier
2. **Tag dashboards** - Use tags like `devacademy`, `security`, `performance`
3. **Add descriptions** - Help others understand panel purposes
4. **Use variables** - Make dashboards reusable
5. **Version control** - Keep JSON files in git
6. **Test before deploy** - Validate changes in local Grafana first

## Resources

- [Grafana Dashboard Best Practices](https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/best-practices/)
- [Dashboard JSON Model](https://grafana.com/docs/grafana/latest/dashboards/json-model/)
- [Provisioning Documentation](https://grafana.com/docs/grafana/latest/administration/provisioning/)

---

For full setup guide, see [grafana_setup.md](../../doc/grafana_setup.md)

---

_DevMultiplier Academy - Building 10x-100x Developers in the Age of AI_
