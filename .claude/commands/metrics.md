# Metrics

Check OpenTelemetry metrics, traces, and observability status.

## Instructions

Monitor and analyze application metrics and traces.

### Step 1: Check Observability Stack

```bash
# Verify services are running
docker ps | grep -E "grafana|prometheus|tempo|otel"

# Check OTEL collector health
curl -s http://localhost:4318/v1/metrics > /dev/null && echo "✅ OTEL Collector running" || echo "❌ OTEL Collector not available"

# Check Grafana
curl -s http://localhost:3001/api/health | jq
```

### Step 2: View Metrics

#### Grafana Dashboard

```bash
# Open Grafana (default: admin/admin)
open http://localhost:3001

# Direct link to app dashboard
open http://localhost:3001/d/devmultiplier/application-metrics
```

#### Prometheus Queries

```bash
# Access Prometheus UI
open http://localhost:9090

# Query via API
curl -s "http://localhost:9090/api/v1/query?query=http_requests_total" | jq
```

### Step 3: Key Metrics

#### HTTP Metrics

```promql
# Request rate (requests per second)
rate(http_requests_total[5m])

# Request rate by route
sum by (route) (rate(http_requests_total[5m]))

# Error rate
rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m])

# P95 latency
histogram_quantile(0.95, rate(http_request_duration_ms_bucket[5m]))

# Average latency by route
avg by (route) (rate(http_request_duration_ms_sum[5m]) / rate(http_request_duration_ms_count[5m]))
```

#### Database Metrics

```promql
# Query rate
rate(db_queries_total[5m])

# Query rate by operation
sum by (operation) (rate(db_queries_total[5m]))

# Error rate
rate(db_errors_total[5m]) / rate(db_queries_total[5m])

# Query duration P95
histogram_quantile(0.95, rate(db_query_duration_ms_bucket[5m]))
```

#### Authentication Metrics

```promql
# Login attempts
rate(login_attempts_total[5m])

# Failed logins
rate(login_attempts_total{success="false"}[5m])

# Success rate
rate(login_attempts_total{success="true"}[5m]) / rate(login_attempts_total[5m])
```

#### Page View Metrics

```promql
# Page views per minute
rate(page_views_total[1m]) * 60

# Top pages
topk(10, sum by (path) (rate(page_views_total[5m])))
```

### Step 4: View Traces

```bash
# Open Tempo UI (via Grafana)
open http://localhost:3001/explore?orgId=1&left=%7B"datasource":"tempo"%7D

# Search traces by service
# Service name: devmultiplier-academy
```

#### Trace Queries

```
# Find slow requests (>1s)
{ duration > 1s }

# Find errors
{ status = error }

# Find specific route
{ http.route = "/api/courses" }

# Find database operations
{ db.system = "postgresql" }
```

### Step 5: Generate Test Traffic

```bash
# Generate traffic for metrics testing
bun run telemetry:traffic

# Generate login metrics
bun run telemetry:login

# Custom traffic generation
for i in {1..100}; do
  curl -s http://localhost:3000/api/courses > /dev/null
  sleep 0.1
done
```

## Metrics Dashboard Panels

### Overview Panel

```markdown
| Metric | Value | Status |
|--------|-------|--------|
| Request Rate | 150 req/s | ✅ Normal |
| Error Rate | 0.1% | ✅ Normal |
| P95 Latency | 245ms | ✅ Normal |
| Active Sessions | 42 | ✅ Normal |
```

### Alert Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| Error Rate | > 1% | > 5% |
| P95 Latency | > 500ms | > 2000ms |
| DB Query Time | > 100ms | > 500ms |
| Failed Logins/min | > 10 | > 50 |

## Troubleshooting

### No Metrics Appearing

```bash
# Check OTEL environment variables
echo $OTEL_EXPORTER_OTLP_ENDPOINT

# Verify instrumentation is loaded
grep -r "instrumentation" src/

# Check for errors in app logs
docker logs devcontainer-app-1 2>&1 | grep -i otel
```

### Missing Traces

```bash
# Verify trace exporter
curl -X POST http://localhost:4318/v1/traces \
  -H "Content-Type: application/json" \
  -d '{"resourceSpans":[]}'

# Check Tempo is receiving data
curl http://localhost:3200/ready
```

### High Cardinality Warning

```promql
# Check label cardinality
count by (__name__) ({__name__=~".+"})

# Identify high cardinality labels
topk(10, count by (route) (http_requests_total))
```

## Custom Metric Examples

### Add New Counter

```typescript
// src/lib/metrics.ts
import { metrics } from '@opentelemetry/api';

const meter = metrics.getMeter('devmultiplier-academy');

// Create counter
export const enrollmentCounter = meter.createCounter('enrollments_total', {
  description: 'Total course enrollments',
});

// Usage
enrollmentCounter.add(1, {
  courseId: course.id,
  source: 'web',
});
```

### Add New Histogram

```typescript
export const courseLoadTime = meter.createHistogram('course_load_time_ms', {
  description: 'Time to load course content',
  unit: 'ms',
});

// Usage
const start = Date.now();
// ... load course
courseLoadTime.record(Date.now() - start, {
  courseSlug: course.slug,
});
```

## Usage

```bash
# Quick metrics overview
/metrics

# Check specific metric
/metrics http_requests_total

# View traces
/metrics traces

# Generate test data
/metrics generate
```

## Quick Links

| Service | URL | Credentials |
|---------|-----|-------------|
| Grafana | http://localhost:3001 | admin/admin |
| Prometheus | http://localhost:9090 | - |
| OTEL Collector | http://localhost:4318 | - |
| Tempo | http://localhost:3200 | - |
