# Grafana Quick Start

Fast guide to get your monitoring dashboards up and running.

## Start Monitoring Stack

```bash
# From the project root
cd .devcontainer
docker-compose up -d prometheus grafana
```

## Access Services

| Service | URL | Credentials |
|---------|-----|-------------|
| **Grafana** | http://localhost:3001 | admin / admin |
| **Prometheus** | http://localhost:9090 | (no auth) |
| **Next.js App** | http://localhost:3000 | - |

## View Dashboards

1. Open Grafana: http://localhost:3001
2. Login with `admin` / `admin`
3. Navigate to **Dashboards** → **DevAcademy** folder

### Available Dashboards

- **Application Overview** - HTTP requests, logins, database, page views
- **Security Monitoring** - Login failures, suspicious activity, geo distribution
- **Performance Metrics** - Response times, query latency, API calls

## Generate Test Data

To see data in your dashboards, generate some activity:

```bash
# Visit pages
curl http://localhost:3000/
curl http://localhost:3000/courses
curl http://localhost:3000/login

# Or use your browser
open http://localhost:3000
```

**Note:** Metrics are exported every 60 seconds, so wait at least 1 minute to see data appear.

## Verify Setup

### 1. Check Containers

```bash
docker-compose ps
```

All containers should show status `Up`.

### 2. Check Prometheus Targets

Visit: http://localhost:9090/targets

Status should be **UP** for all targets.

### 3. Test a Query

1. Open Prometheus: http://localhost:9090
2. Enter query: `http_server_requests_total`
3. Click **Execute**
4. You should see metrics (after generating some traffic)

## Common Commands

```bash
# View logs
docker logs grafana
docker logs prometheus

# Restart services
docker-compose restart grafana
docker-compose restart prometheus

# Stop monitoring
docker-compose stop grafana prometheus

# Remove everything (including data)
docker-compose down -v
```

## Troubleshooting

### No Data in Dashboards

**Wait 60 seconds** - Metrics are exported every minute

**Generate traffic:**
```bash
for i in {1..10}; do curl http://localhost:3000/; sleep 1; done
```

**Check metrics endpoint:**
```bash
curl http://localhost:3000/api/metrics
```

### Can't Access Grafana

**Check if container is running:**
```bash
docker ps | grep grafana
```

**Check logs:**
```bash
docker logs grafana
```

**Try different port:**

Edit [.devcontainer/.env](.devcontainer/.env):
```bash
GRAFANA_PORT=3002
```

Then restart:
```bash
docker-compose restart grafana
```

### Prometheus Not Scraping

**Check Prometheus logs:**
```bash
docker logs prometheus
```

**Verify network connectivity:**
```bash
docker exec -it prometheus ping dev-x-academy-web
```

**Reload configuration:**
```bash
curl -X POST http://localhost:9090/-/reload
```

## Next Steps

1. ✅ **Explore dashboards** - Click around, see what's available
2. ✅ **Customize time ranges** - Use the time picker (top right)
3. ✅ **Create alerts** - Set up notifications for critical metrics
4. ✅ **Add custom panels** - Build visualizations for your needs
5. ✅ **Read full guide** - [grafana_setup.md](./grafana_setup.md)

## Useful Queries

Try these in Grafana or Prometheus:

```promql
# Request rate
rate(http_server_requests_total[5m])

# Average response time
rate(http_server_duration_sum[5m]) / rate(http_server_duration_count[5m])

# Error rate
rate(http_server_errors_total[5m]) / rate(http_server_requests_total[5m])

# Failed logins
increase(user_login_failures_total[5m])

# Top pages
topk(5, sum by (page_path) (page_views_total))
```

## Resources

- [grafana_setup.md](./grafana_setup.md)
- [metrics_testing_guide.md](./metrics_testing_guide.md)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)

---

_DevMultiplier Academy - Building 10x-100x Developers in the Age of AI_
