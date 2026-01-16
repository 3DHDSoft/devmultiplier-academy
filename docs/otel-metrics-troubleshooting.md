# OpenTelemetry Metrics Troubleshooting Guide

## Dev-X-Academy-Web

This guide helps you diagnose and fix issues in the telemetry pipeline: **Next.js App → OTEL Collector → Prometheus → Grafana**.

---

## Table of Contents

- [Overview: The Telemetry Pipeline](#overview-the-telemetry-pipeline)
- [Quick Health Check](#quick-health-check)
- [Stage 1: Next.js Application](#stage-1-nextjs-application)
- [Stage 2: OTEL Collector](#stage-2-otel-collector)
- [Stage 3: Prometheus](#stage-3-prometheus)
- [Stage 4: Grafana](#stage-4-grafana)
- [Common Issues & Solutions](#common-issues--solutions)
- [Debug Mode](#debug-mode)
- [Testing Tools](#testing-tools)

---

## Overview: The Telemetry Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                     Telemetry Data Flow                         │
└─────────────────────────────────────────────────────────────────┘

   1. GENERATE          2. SEND            3. RECEIVE         4. EXPORT
┌──────────────┐    ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  Next.js App │───>│ OTLP HTTP    │──>│ OTEL         │──>│ Prometheus   │
│              │    │ Port 4318    │   │ Collector    │   │ Scrape       │
│ - HTTP req   │    │              │   │              │   │ Port 8889    │
│ - Metrics    │    │ Traces &     │   │ - Receives   │   │              │
│ - Traces     │    │ Metrics      │   │ - Processes  │   │ - Stores     │
└──────────────┘    └──────────────┘   │ - Routes     │   │ - Queries    │
                                        └──────────────┘   └──────┬───────┘
                                               │                   │
                                               │ 5. STORE          │
                                               v                   │
                                        ┌──────────────┐          │
                                        │    Tempo     │          │
                                        │  (Traces)    │          │
                                        └──────────────┘          │
                                                                  │
                                               6. VISUALIZE       │
                                               ┌──────────────────┘
                                               v
                                        ┌──────────────┐
                                        │   Grafana    │
                                        │              │
                                        │ - Dashboards │
                                        │ - Queries    │
                                        │ - Alerts     │
                                        └──────────────┘
```

### Key Ports

| Service        | Port  | Protocol | Purpose                          |
| -------------- | ----- | -------- | -------------------------------- |
| Next.js App    | 3000  | HTTP     | Application                      |
| OTEL Collector | 4317  | gRPC     | OTLP gRPC endpoint               |
| OTEL Collector | 4318  | HTTP     | OTLP HTTP endpoint (we use this) |
| OTEL Collector | 8888  | HTTP     | Collector's own metrics          |
| OTEL Collector | 8889  | HTTP     | Prometheus scrape endpoint       |
| OTEL Collector | 13133 | HTTP     | Health check                     |
| Prometheus     | 9090  | HTTP     | Query API & UI                   |
| Tempo          | 3200  | HTTP     | Trace query API                  |
| Grafana        | 3001  | HTTP     | Dashboard UI                     |

---

## Quick Health Check

Run this complete health check to verify the entire pipeline:

```bash
#!/bin/bash
# Complete pipeline health check

echo "=== PIPELINE HEALTH CHECK ==="
echo

# 1. Check Docker containers
echo "1. Docker Containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "otel-collector|prometheus|grafana|tempo|dev-x-academy"
echo

# 2. Check OTEL Collector health
echo "2. OTEL Collector Health:"
curl -s http://localhost:13133/health | jq '.' || echo "❌ OTEL Collector not responding"
echo

# 3. Check if OTEL Collector is receiving data
echo "3. OTEL Collector Metrics (should show data received):"
curl -s http://localhost:8888/metrics | grep -E "otelcol_receiver_accepted|otelcol_exporter_sent" | head -5
echo

# 4. Check Prometheus targets
echo "4. Prometheus Targets:"
curl -s http://localhost:9090/api/v1/targets | jq '.data.activeTargets[] | {job: .labels.job, health: .health, lastError: .lastError}' || echo "❌ Prometheus not responding"
echo

# 5. Check Prometheus has data
echo "5. Prometheus Data (recent metrics):"
curl -s 'http://localhost:9090/api/v1/query?query=up' | jq '.data.result[] | {metric: .metric.job, value: .value[1]}' || echo "❌ No data in Prometheus"
echo

# 6. Check Grafana datasources
echo "6. Grafana Datasources:"
curl -s -u admin:admin http://localhost:3001/api/datasources | jq '.[] | {name: .name, type: .type, url: .url}' || echo "❌ Grafana not responding"
echo

echo "=== HEALTH CHECK COMPLETE ==="
```

Save this as `scripts/health-check.sh` and run:

```bash
chmod +x scripts/health-check.sh
./scripts/health-check.sh
```

---

## Stage 1: Next.js Application

**Goal**: Verify the Next.js app is generating and sending telemetry.

### 1.1 Check Application is Running

```bash
# Check Next.js is running
curl http://localhost:3000
# Should return HTML

# Check process
ps aux | grep "next dev"
```

### 1.2 Verify OpenTelemetry Initialization

**Check console logs** when starting the dev server:

```bash
bun run dev
```

**Look for these messages**:

```
📊 OpenTelemetry configuration: Local Stack (development)
  🏠 Using local OTLP collector: http://otel-collector:4318
✅ OpenTelemetry instrumentation initialized with @vercel/otel
```

**If you DON'T see these messages:**

1. Check the instrumentation file is being loaded:

   ```bash
   # Verify instrumentation files exist
   ls -la instrumentation.ts instrumentation.node.ts
   ```

2. Check for errors in the console:

   ```bash
   bun run dev 2>&1 | grep -i "error\|instrumentation"
   ```

3. Enable debug logging:

   ```typescript
   // Edit instrumentation.node.ts line 20-21
   // Change from:
   diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR);

   // To:
   diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
   ```

### 1.3 Verify OTEL Endpoint Configuration

```bash
# Check environment variables
cat .env.local | grep OTEL
```

**Expected for local development**:

```env
OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318
```

**Common Issues**:

- ❌ Wrong hostname: `localhost` instead of `otel-collector`
- ❌ Wrong port: `4317` (gRPC) instead of `4318` (HTTP)
- ❌ Missing protocol: `otel-collector:4318` instead of `http://otel-collector:4318`

### 1.4 Generate Test Traffic

```bash
# Generate test telemetry data
bun run telemetry:test

# Or generate continuous traffic
bun run telemetry:traffic

# Or test login metrics
bun run telemetry:login
```

**Expected output**:

```
🚀 Starting telemetry test traffic generator...
Generating traffic for 30 seconds...
✅ Request 1: Home page
✅ Request 2: About page
...
```

### 1.5 Check Network Connectivity

**Verify the app can reach the OTEL Collector**:

```bash
# From inside the dev container
docker exec -it dev-x-academy-web curl -v http://otel-collector:4318/v1/traces
```

**Expected response**:

```
* Connected to otel-collector (172.18.0.X) port 4318
< HTTP/1.1 405 Method Not Allowed
```

(405 is OK - means the endpoint exists but doesn't accept GET requests)

**If connection fails**:

```bash
# Check Docker network
docker network inspect dev-web-net

# Verify both containers are on the same network
docker inspect dev-x-academy-web | jq '.[0].NetworkSettings.Networks'
docker inspect otel-collector | jq '.[0].NetworkSettings.Networks'
```

---

## Stage 2: OTEL Collector

**Goal**: Verify the OTEL Collector is receiving, processing, and exporting data.

### 2.1 Check OTEL Collector is Running

```bash
# Check container status
docker ps | grep otel-collector

# Expected output:
# otel-collector   Up X minutes   0.0.0.0:4317-4318->4317-4318/tcp, ...
```

### 2.2 Check Health Endpoint

```bash
# Health check
curl http://localhost:13133/health

# Expected response:
# {"status":"OK"}
```

**If unhealthy or no response**:

```bash
# Check logs
docker logs otel-collector

# Restart collector
docker restart otel-collector
```

### 2.3 Verify Configuration

```bash
# View current configuration
cat .devcontainer/otel-collector/otel-collector-config.yml
```

**Key sections to verify**:

**Receivers** (line ~6):

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318 # ← Should accept HTTP on 4318
```

**Exporters** (line ~25):

```yaml
exporters:
  otlp/tempo:
    endpoint: tempo:4319
    tls:
      insecure: true

  prometheus:
    endpoint: 0.0.0.0:8889 # ← Prometheus scrapes this
```

**Service Pipeline** (line ~35):

```yaml
service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [otlp/tempo]
    metrics:
      receivers: [otlp]
      exporters: [prometheus] # ← Metrics go to Prometheus
```

### 2.4 Check Collector Metrics

The collector exposes its own metrics showing what it's processing:

```bash
# Check receiver metrics (data coming IN)
curl -s http://localhost:8888/metrics | grep "otelcol_receiver"

# Look for:
# otelcol_receiver_accepted_spans - Traces received
# otelcol_receiver_accepted_metric_points - Metrics received
```

**Example output (healthy)**:

```
otelcol_receiver_accepted_spans{receiver="otlp",service_instance_id="...",transport="http"} 1234
otelcol_receiver_accepted_metric_points{receiver="otlp",service_instance_id="...",transport="http"} 567
```

**If these are 0 or missing**:

- Next.js app is NOT sending data to the collector
- Go back to [Stage 1](#stage-1-nextjs-application)

```bash
# Check exporter metrics (data going OUT)
curl -s http://localhost:8888/metrics | grep "otelcol_exporter"

# Look for:
# otelcol_exporter_sent_spans - Traces sent to Tempo
# otelcol_exporter_sent_metric_points - Metrics sent to Prometheus
```

**Example output (healthy)**:

```
otelcol_exporter_sent_spans{exporter="otlp/tempo",service_instance_id="..."} 1234
otelcol_exporter_sent_metric_points{exporter="prometheus",service_instance_id="..."} 567
```

**If receiver is high but exporter is 0**:

- Collector is receiving but not exporting
- Check the exporter configuration
- Check connectivity to Tempo/Prometheus

### 2.5 Check Collector Logs

```bash
# View recent logs
docker logs otel-collector --tail 100

# Follow logs in real-time
docker logs otel-collector -f

# Filter for errors
docker logs otel-collector 2>&1 | grep -i error
```

**Healthy log patterns**:

```
2024-XX-XX INFO service@v0.XX.0/service.go:XX Everything is ready. Begin running and processing data.
```

**Common error patterns**:

**Connection refused to Tempo**:

```
Error: failed to export to tempo:4319: connection refused
```

**Solution**: Check Tempo is running: `docker ps | grep tempo`

**Port already in use**:

```
Error: listen tcp 0.0.0.0:4318: bind: address already in use
```

**Solution**: Another process is using port 4318

**Configuration error**:

```
Error: cannot unmarshal config: ...
```

**Solution**: Fix syntax in `otel-collector-config.yml`

### 2.6 Test Collector Directly

Send test data directly to the collector:

```bash
# Send a test trace
curl -X POST http://localhost:4318/v1/traces \
  -H "Content-Type: application/json" \
  -d '{
    "resourceSpans": [{
      "resource": {
        "attributes": [{
          "key": "service.name",
          "value": {"stringValue": "test-service"}
        }]
      },
      "scopeSpans": [{
        "spans": [{
          "traceId": "5b8aa5a2d2c872e8321cf37308d69df2",
          "spanId": "051581bf3cb55c13",
          "name": "test-span",
          "kind": 1,
          "startTimeUnixNano": "'$(date +%s%N)'",
          "endTimeUnixNano": "'$(date +%s%N)'"
        }]
      }]
    }]
  }'
```

**Expected**: HTTP 200 OK

Then check collector logs:

```bash
docker logs otel-collector --tail 20
```

You should see the trace being processed.

---

## Stage 3: Prometheus

**Goal**: Verify Prometheus is scraping metrics from the OTEL Collector.

### 3.1 Check Prometheus is Running

```bash
# Check container
docker ps | grep prometheus

# Check Prometheus UI
curl http://localhost:9090
# Should return HTML
```

### 3.2 Check Prometheus Configuration

```bash
# View configuration
cat .devcontainer/prometheus/prometheus.yml
```

**Key section to verify** (scrape configs):

```yaml
scrape_configs:
  - job_name: 'otel-collector'
    scrape_interval: 15s
    static_configs:
      - targets: ['otel-collector:8889'] # ← Scraping OTEL Collector
```

**Verify**:

- ✅ Target is `otel-collector:8889` (not `localhost`)
- ✅ Scrape interval is reasonable (10-60 seconds)
- ✅ Job name is descriptive

### 3.3 Check Prometheus Targets

**Via UI** (easiest):

1. Open http://localhost:9090/targets
2. Look for the `otel-collector` target
3. Check **State** column

**Expected**:

```
State: UP
Last Scrape: X seconds ago
Scrape Duration: XX ms
```

**Via API**:

```bash
curl -s http://localhost:9090/api/v1/targets | jq '.data.activeTargets[] | {job: .labels.job, health: .health, lastError: .lastError}'
```

**Healthy output**:

```json
{
  "job": "otel-collector",
  "health": "up",
  "lastError": ""
}
```

**Common Issues**:

**State: DOWN**

```json
{
  "job": "otel-collector",
  "health": "down",
  "lastError": "Get \"http://otel-collector:8889/metrics\": dial tcp: lookup otel-collector: no such host"
}
```

**Solution**: OTEL Collector container not on same network

```bash
docker network connect dev-web-net otel-collector
```

**State: DOWN (connection refused)**

```json
{
  "job": "otel-collector",
  "health": "down",
  "lastError": "connection refused"
}
```

**Solution**: OTEL Collector not exposing port 8889

```bash
# Check OTEL Collector config has prometheus exporter
docker logs otel-collector | grep prometheus
```

### 3.4 Query Prometheus for Data

**Check if any metrics exist**:

```bash
# Query all metrics
curl -s 'http://localhost:9090/api/v1/label/__name__/values' | jq '.data' | head -20
```

**Expected**: Long list of metric names

**Check for OTEL Collector metrics**:

```bash
# Check for collector's own metrics
curl -s 'http://localhost:9090/api/v1/query?query=up{job="otel-collector"}' | jq '.'
```

**Expected**:

```json
{
  "status": "success",
  "data": {
    "result": [
      {
        "metric": {
          "job": "otel-collector",
          "instance": "otel-collector:8889"
        },
        "value": [1234567890, "1"] // ← 1 means UP
      }
    ]
  }
}
```

**Check for application metrics**:

```bash
# Check for HTTP metrics from Next.js
curl -s 'http://localhost:9090/api/v1/query?query=http_server_duration_milliseconds_count' | jq '.data.result[0]'
```

**If no data**:

```json
{
  "status": "success",
  "data": {
    "result": [] // ← Empty = no data
  }
}
```

**Troubleshooting**:

1. Check OTEL Collector is receiving data (Stage 2.4)
2. Check OTEL Collector is exporting to Prometheus exporter (Stage 2.4)
3. Check Prometheus is scraping successfully (Stage 3.3)

### 3.5 Check Prometheus Logs

```bash
# View logs
docker logs prometheus --tail 100

# Filter for errors
docker logs prometheus 2>&1 | grep -E "error|failed|scrape"
```

**Healthy patterns**:

```
level=info ts=... msg="Server is ready to receive web requests."
```

**Error patterns**:

**Scrape failed**:

```
level=warn ts=... component=scrape msg="Scrape failed" err="Get \"http://otel-collector:8889/metrics\": context deadline exceeded"
```

**Solution**: OTEL Collector is slow or overloaded, increase scrape timeout in prometheus.yml

### 3.6 Test Prometheus UI

1. Open http://localhost:9090
2. Go to **Graph** tab
3. Enter query: `up`
4. Click **Execute**
5. Switch to **Graph** view

**Expected**: Graph showing `up` metric with value `1` for otel-collector

**Try application metrics**:

```promql
# HTTP request count
rate(http_server_duration_milliseconds_count[5m])

# HTTP request duration (p95)
histogram_quantile(0.95, rate(http_server_duration_milliseconds_bucket[5m]))

# All metrics with service name
{service_name="dev-academy-web"}
```

---

## Stage 4: Grafana

**Goal**: Verify Grafana can query Prometheus and display metrics.

### 4.1 Check Grafana is Running

```bash
# Check container
docker ps | grep grafana

# Check Grafana UI
curl -s -u admin:admin http://localhost:3001/api/health | jq '.'
```

**Expected**:

```json
{
  "commit": "...",
  "database": "ok",
  "version": "..."
}
```

### 4.2 Check Grafana Datasources

**Via UI**:

1. Open http://localhost:3001
2. Login: admin / admin
3. Navigate to **Connections** → **Data sources**
4. Check **Prometheus** datasource

**Via API**:

```bash
# List all datasources
curl -s -u admin:admin http://localhost:3001/api/datasources | jq '.[] | {name: .name, type: .type, url: .url}'
```

**Expected**:

```json
{
  "name": "Prometheus",
  "type": "prometheus",
  "url": "http://prometheus:9090"
}
{
  "name": "Tempo",
  "type": "tempo",
  "url": "http://tempo:3200"
}
```

**Test datasource connection**:

```bash
# Test Prometheus datasource (replace ID with actual ID from above)
curl -s -u admin:admin http://localhost:3001/api/datasources/1 | jq '.name, .url'

# Health check specific datasource
curl -s -u admin:admin -X POST http://localhost:3001/api/datasources/1/health | jq '.'
```

**Expected**:

```json
{
  "status": "OK",
  "message": "Data source is working"
}
```

**If datasource is unhealthy**:

**Connection refused**:

```json
{
  "status": "Error",
  "message": "Get \"http://prometheus:9090/api/v1/query\": dial tcp: lookup prometheus: no such host"
}
```

**Solution**: Grafana and Prometheus not on same network

```bash
docker network connect dev-web-net grafana
docker network connect dev-web-net prometheus
```

### 4.3 Test Prometheus Queries from Grafana

**Via UI**:

1. Go to **Explore** (compass icon)
2. Select **Prometheus** datasource
3. Enter query: `up`
4. Click **Run query**

**Expected**: Table/graph showing the `up` metric

**Via API**:

```bash
# Query Prometheus through Grafana proxy
curl -s -u admin:admin 'http://localhost:3001/api/datasources/proxy/1/api/v1/query?query=up' | jq '.data.result[0]'
```

**Expected**:

```json
{
  "metric": {
    "job": "otel-collector",
    "instance": "otel-collector:8889"
  },
  "value": [1234567890, "1"]
}
```

### 4.4 Check Grafana Dashboards

**List dashboards**:

```bash
# Via API
curl -s -u admin:admin http://localhost:3001/api/search?type=dash-db | jq '.[] | {title: .title, uid: .uid}'
```

**Expected dashboards**:

```json
{
  "title": "Application Overview",
  "uid": "app-overview"
}
{
  "title": "Performance Metrics",
  "uid": "performance-metrics"
}
{
  "title": "Security Monitoring",
  "uid": "security-monitoring"
}
```

**View dashboard in UI**:

1. Go to **Dashboards** (squares icon)
2. Click on **Application Overview**
3. Check if panels are loading

**If panels show "No data"**:

1. Check time range (top-right) - set to "Last 15 minutes"
2. Check if Prometheus has data (Stage 3.4)
3. Check panel queries - click panel title → **Edit**
4. Run query in Explore first to verify it works

### 4.5 Check Grafana Logs

```bash
# View logs
docker logs grafana --tail 100

# Filter for errors
docker logs grafana 2>&1 | grep -E "error|failed"
```

**Healthy patterns**:

```
logger=http.server msg="HTTP Server Listen" address=[::]:3000
```

**Error patterns**:

**Datasource error**:

```
logger=datasources msg="Failed to query datasource" error="connection refused"
```

**Solution**: Check datasource configuration and network connectivity

### 4.6 Generate and View Test Data

**Complete end-to-end test**:

```bash
# 1. Generate test traffic
bun run telemetry:test

# 2. Wait 30 seconds for data to flow through pipeline
sleep 30

# 3. Query Prometheus
curl -s 'http://localhost:9090/api/v1/query?query=http_server_duration_milliseconds_count' | jq '.data.result[0].metric'

# 4. Open Grafana dashboard
echo "Open http://localhost:3001/d/app-overview/application-overview"
```

**Expected in Grafana**:

- Request rate graph showing activity
- Response time graph showing latency
- Error rate graph (should be 0% for test traffic)

---

## Common Issues & Solutions

### Issue 1: No Data in Grafana

**Symptom**: Grafana dashboards show "No data"

**Diagnosis checklist**:

```bash
# 1. Check all containers running
docker ps | grep -E "grafana|prometheus|otel-collector"

# 2. Check OTEL Collector receiving data
curl -s http://localhost:8888/metrics | grep "otelcol_receiver_accepted_metric_points"

# 3. Check Prometheus targets
curl -s http://localhost:9090/api/v1/targets | jq '.data.activeTargets[] | {job: .labels.job, health: .health}'

# 4. Check Prometheus has data
curl -s 'http://localhost:9090/api/v1/query?query=up' | jq '.data.result'

# 5. Check Grafana datasource
curl -s -u admin:admin http://localhost:3001/api/datasources/1/health | jq '.'
```

**Solution path**:

- If step 2 fails → Go to [Stage 1](#stage-1-nextjs-application)
- If step 3 fails → Go to [Stage 2](#stage-2-otel-collector)
- If step 4 fails → Go to [Stage 3](#stage-3-prometheus)
- If step 5 fails → Go to [Stage 4](#stage-4-grafana)

### Issue 2: OTEL Collector Not Receiving Data

**Symptom**: `otelcol_receiver_accepted_metric_points{} 0`

**Common causes**:

1. **Wrong endpoint in Next.js**

   ```bash
   # Check .env.local
   cat .env.local | grep OTEL_EXPORTER_OTLP_ENDPOINT

   # Should be:
   OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318

   # NOT:
   # http://localhost:4318 (wrong in container)
   # http://otel-collector:4317 (wrong port - that's gRPC)
   ```

2. **Network connectivity issue**

   ```bash
   # Test from dev container
   docker exec -it dev-x-academy-web curl -v http://otel-collector:4318

   # If "Could not resolve host":
   docker network connect dev-web-net dev-x-academy-web
   ```

3. **Next.js not sending data**

   ```bash
   # Restart dev server with debug logging
   # Edit instrumentation.node.ts line 20
   diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

   # Restart
   bun run dev

   # Generate traffic
   bun run telemetry:test
   ```

### Issue 3: Prometheus Not Scraping

**Symptom**: Prometheus targets show "DOWN"

**Common causes**:

1. **Wrong scrape target**

   ```bash
   # Check prometheus.yml
   cat .devcontainer/prometheus/prometheus.yml | grep -A 3 "job_name: 'otel-collector'"

   # Should have:
   targets: ['otel-collector:8889']

   # NOT:
   # ['localhost:8889'] (wrong in container)
   # ['otel-collector:4318'] (wrong port - that's OTLP)
   ```

2. **OTEL Collector not exposing metrics**

   ```bash
   # Test directly
   curl http://localhost:8889/metrics | head -20

   # Should return Prometheus-format metrics
   # If "Connection refused", check otel-collector-config.yml:
   cat .devcontainer/otel-collector/otel-collector-config.yml | grep -A 2 "prometheus:"

   # Should have:
   exporters:
     prometheus:
       endpoint: 0.0.0.0:8889
   ```

3. **Network issue**

   ```bash
   # Test from Prometheus container
   docker exec -it prometheus wget -O- http://otel-collector:8889/metrics

   # If fails, connect network
   docker network connect dev-web-net prometheus
   docker network connect dev-web-net otel-collector
   ```

### Issue 4: Metrics Have Wrong Labels

**Symptom**: Metrics appear but with incorrect service name or labels

**Check instrumentation configuration**:

```typescript
// instrumentation.node.ts line ~100
registerOTel({
  serviceName: 'dev-academy-web', // ← Should match your service
  // ...
});
```

**Check OTEL Collector adds correct attributes**:

```yaml
# otel-collector-config.yml
processors:
  batch:
  attributes:
    actions:
      - key: service.name
        value: dev-academy-web # ← Consistent naming
        action: upsert
```

### Issue 5: High Cardinality / Too Many Metrics

**Symptom**: Prometheus slow, metrics explosion

**Check for high cardinality labels**:

```bash
# Query Prometheus for series count
curl -s 'http://localhost:9090/api/v1/query?query=count({__name__=~".+"})' | jq '.data.result[0].value[1]'

# Should be < 10,000 for development
# If > 100,000, you have a problem
```

**Common causes**:

- User IDs in metric labels (use exemplars instead)
- URLs with unique IDs in labels
- Timestamps in labels

**Solution**: Add relabeling in OTEL Collector:

```yaml
# otel-collector-config.yml
processors:
  attributes:
    actions:
      - key: http.url # Don't include full URL
        action: delete
      - key: user.id # Don't include user IDs
        action: delete
```

---

## Debug Mode

Enable verbose logging across the entire pipeline:

### 1. Enable Next.js Debug Logging

```typescript
// instrumentation.node.ts line 20-21
// Change to DEBUG level
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
```

Restart dev server:

```bash
bun run dev
```

**You'll see detailed OTEL logs**:

```
@opentelemetry/instrumentation-http Outgoing HTTP request
@opentelemetry/sdk-metrics Exporting metrics
@opentelemetry/exporter-trace-otlp-http Sending trace to http://otel-collector:4318/v1/traces
```

### 2. Enable OTEL Collector Debug Logging

```yaml
# Edit .devcontainer/otel-collector/otel-collector-config.yml
service:
  telemetry:
    logs:
      level: debug # ← Change from 'info' to 'debug'
```

Restart collector:

```bash
docker restart otel-collector
```

View debug logs:

```bash
docker logs otel-collector -f | grep -E "received|export|batch"
```

### 3. Enable Prometheus Debug Logging

```bash
# Restart Prometheus with debug flag
docker stop prometheus
docker run -d --name prometheus \
  --network dev-web-net \
  -p 9090:9090 \
  -v $(pwd)/.devcontainer/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro \
  -v prometheus_web_data:/prometheus \
  prom/prometheus:latest \
  --config.file=/etc/prometheus/prometheus.yml \
  --log.level=debug  # ← Debug flag
```

View debug logs:

```bash
docker logs prometheus -f | grep scrape
```

---

## Testing Tools

### Generate Test Traffic

```bash
# Quick test (10 requests)
bun run telemetry:test

# Continuous traffic (30 seconds)
bun run telemetry:traffic

# Login flow test
bun run telemetry:login
```

### Manual cURL Tests

```bash
# Test Next.js app
curl http://localhost:3000/
curl http://localhost:3000/api/health

# Test OTEL Collector
curl http://localhost:13133/health
curl http://localhost:8888/metrics | head -50

# Test Prometheus
curl 'http://localhost:9090/api/v1/query?query=up'
curl 'http://localhost:9090/api/v1/targets' | jq '.data.activeTargets[0]'

# Test Grafana
curl -u admin:admin http://localhost:3001/api/health
curl -u admin:admin http://localhost:3001/api/datasources | jq '.'
```

### Complete Pipeline Test Script

```bash
#!/bin/bash
# scripts/test-telemetry-pipeline.sh

set -e

echo "🧪 Testing Telemetry Pipeline"
echo

echo "1️⃣  Generating test traffic..."
bun run telemetry:test > /dev/null &
TRAFFIC_PID=$!

echo "2️⃣  Waiting for data to flow through pipeline (30s)..."
sleep 30

echo "3️⃣  Checking OTEL Collector received data..."
RECEIVED=$(curl -s http://localhost:8888/metrics | grep "otelcol_receiver_accepted_metric_points" | grep -oE '[0-9]+$' | head -1)
if [ "$RECEIVED" -gt 0 ]; then
  echo "   ✅ OTEL Collector received $RECEIVED metric points"
else
  echo "   ❌ OTEL Collector received NO data"
  exit 1
fi

echo "4️⃣  Checking Prometheus scraped data..."
PROM_DATA=$(curl -s 'http://localhost:9090/api/v1/query?query=up{job="otel-collector"}' | jq -r '.data.result[0].value[1]')
if [ "$PROM_DATA" = "1" ]; then
  echo "   ✅ Prometheus is scraping OTEL Collector"
else
  echo "   ❌ Prometheus is NOT scraping OTEL Collector"
  exit 1
fi

echo "5️⃣  Checking Grafana can query Prometheus..."
GRAFANA_HEALTH=$(curl -s -u admin:admin -X POST http://localhost:3001/api/datasources/1/health | jq -r '.status')
if [ "$GRAFANA_HEALTH" = "OK" ]; then
  echo "   ✅ Grafana datasource is healthy"
else
  echo "   ❌ Grafana datasource is unhealthy: $GRAFANA_HEALTH"
  exit 1
fi

echo
echo "🎉 PIPELINE TEST PASSED"
echo
echo "📊 View dashboards at: http://localhost:3001/d/app-overview/application-overview"
echo "📈 View Prometheus at: http://localhost:9090"
echo "🔍 View OTEL Collector metrics at: http://localhost:8888/metrics"

kill $TRAFFIC_PID 2>/dev/null || true
```

Save and run:

```bash
chmod +x scripts/test-telemetry-pipeline.sh
./scripts/test-telemetry-pipeline.sh
```

---

## Quick Reference Commands

```bash
# === HEALTH CHECKS ===
curl http://localhost:13133/health                    # OTEL Collector
curl http://localhost:9090/-/healthy                  # Prometheus
curl -u admin:admin http://localhost:3001/api/health  # Grafana

# === CHECK DATA FLOW ===
# 1. OTEL Collector receiving
curl -s http://localhost:8888/metrics | grep "otelcol_receiver_accepted"

# 2. OTEL Collector exporting
curl -s http://localhost:8888/metrics | grep "otelcol_exporter_sent"

# 3. Prometheus scraping
curl -s http://localhost:9090/api/v1/targets | jq '.data.activeTargets[0].health'

# 4. Prometheus has data
curl -s 'http://localhost:9090/api/v1/query?query=up' | jq '.data.result'

# 5. Grafana connected
curl -s -u admin:admin http://localhost:3001/api/datasources/1/health | jq '.status'

# === VIEW LOGS ===
docker logs otel-collector --tail 50 -f
docker logs prometheus --tail 50 -f
docker logs grafana --tail 50 -f

# === RESTART SERVICES ===
docker restart otel-collector
docker restart prometheus
docker restart grafana

# === GENERATE TEST DATA ===
bun run telemetry:test
bun run telemetry:traffic
```

---

## Getting Help

If you're still stuck after following this guide:

1. **Collect diagnostic information**:

   ```bash
   # Run health check
   ./scripts/health-check.sh > diagnostic-output.txt 2>&1

   # Collect all logs
   docker logs otel-collector > otel-logs.txt 2>&1
   docker logs prometheus > prometheus-logs.txt 2>&1
   docker logs grafana > grafana-logs.txt 2>&1
   ```

2. **Check configuration files**:
   - `.env.local` - Application config
   - `.devcontainer/otel-collector/otel-collector-config.yml` - Collector config
   - `.devcontainer/prometheus/prometheus.yml` - Prometheus config
   - `instrumentation.node.ts` - OTEL instrumentation

3. **Verify versions**:

   ```bash
   docker exec otel-collector otelcol-contrib --version
   docker exec prometheus prometheus --version
   docker exec grafana grafana-cli --version
   ```

4. **Common documentation**:
   - [OpenTelemetry Docs](https://opentelemetry.io/docs/)
   - [Prometheus Docs](https://prometheus.io/docs/)
   - [Grafana Docs](https://grafana.com/docs/)
   - [Project Observability Guide](../.devcontainer/observability-setup.md)

---

**Related Documentation**:

- [Observability Setup Guide](../.devcontainer/observability-setup.md)
- [DevContainer Overview](devcontainer-overview.md)
- [Telemetry Testing Scripts](../scripts/readme-telemetry-testing.md)

---

- **Last Updated**: 2026-01-08
- **Version**: 1.0

---

_DevMultiplier Academy - Building 10x-100x Developers in the Age of AI_
