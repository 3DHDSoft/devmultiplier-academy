# Metrics Testing Guide

This guide explains how to test and verify that metrics are being collected and exported correctly.

## Quick Test

### 1. Enable Debug Logging

Temporarily enable debug logging in [instrumentation.node.ts](../instrumentation.node.ts):

```typescript
// Change this line:
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR);

// To this:
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
```

### 2. Run the Application

```bash
bun run dev
```

You should see OpenTelemetry initialization logs:

```
✅ OpenTelemetry instrumentation initialized
```

### 3. Trigger Some Actions

Open your browser and perform these actions:

**HTTP Metrics:**

```bash
# Visit pages to generate HTTP metrics
curl http://localhost:3000/
curl http://localhost:3000/courses
curl http://localhost:3000/login
```

**Authentication Metrics:**

- Try to log in with valid credentials
- Try to log in with invalid credentials
- Navigate to `/security` to view login history

**Page View Metrics:**

- Visit different pages in the browser
- Navigate between routes

### 4. Wait for Export

Metrics are exported every **60 seconds**. Wait at least 60 seconds after triggering actions.

With debug logging enabled, you'll see export logs like:

```
@opentelemetry/exporter-trace-otlp-http: Exporting batch of 5 spans
@opentelemetry/exporter-metrics-otlp-http: Exporting batch of 12 metrics
```

### 5. Verify in Grafana Cloud

1. Go to your Grafana Cloud instance
2. Navigate to **Explore**
3. Select **Prometheus** as the data source
4. Try these queries:

**Check HTTP metrics:**

```promql
devacademy_http_client_request_duration_seconds_count
```

**Check login metrics:**

```promql
devacademy_user_login_attempts_total
```

**Check all available metrics:**

```promql
{__name__=~".+"}
```

## Manual Testing Scenarios

### Scenario 1: HTTP Request Metrics

**Actions:**

1. Make HTTP requests to different routes
2. Include successful and error responses

**Test:**

```bash
# Successful request
curl http://localhost:3000/

# 404 error
curl http://localhost:3000/nonexistent

# API request
curl http://localhost:3000/api/courses
```

**Expected Metrics:**

- `http.server.requests` - Should increment for each request
- `http.server.duration` - Should record duration for each request
- `http.server.errors` - Should increment for 404 response

**Verify in Grafana:**

```promql
# Total requests in last 5 minutes
rate(devacademy_http_client_request_duration_seconds_count[5m])

# Error rate
rate(devacademy_api_errors_total[5m]) / rate(devacademy_http_client_request_duration_seconds_count[5m])

# Average latency
rate(devacademy_http_client_request_duration_seconds_sum[5m]) / rate(devacademy_http_client_request_duration_seconds_count[5m])
```

### Scenario 2: Authentication Metrics

**Actions:**

1. Navigate to `/login`
2. Try incorrect password (3 times)
3. Try correct password
4. Navigate to `/security` to view login history

**Expected Metrics:**

- `user.login.attempts` - Should be 4 (3 failed + 1 success)
- `user.login.failures` - Should be 3
- `user.login.success` - Should be 1
- `user.login.suspicious` - Should be 1 (after 3 failed attempts)

**Verify in Grafana:**

```promql
# Login success rate
rate(devacademy_user_login_success_total[5m]) / rate(devacademy_user_login_attempts_total[5m])

# Failed attempts by reason
sum by (failure_reason) (devacademy_user_login_failures_total)

# Suspicious logins
rate(devacademy_user_login_suspicious_total[5m])
```

### Scenario 3: Database Metrics

**Actions:**

1. Visit pages that query the database
2. Trigger login (which creates a login log entry)

**Expected Metrics:**

- `db.queries` - Should increment for each query
- `db.query.duration` - Should record query durations

**Verify in Grafana:**

```promql
# Query rate by operation
rate(devacademy_db_client_operation_duration_seconds_count[5m])

# Query latency by table
rate(db_query_duration_sum[5m]) / rate(db_query_duration_count[5m])

# Database errors
rate(devacademy_db_errors_total[5m])
```

### Scenario 4: External API Metrics

**Actions:**

1. Log in from a public IP (or simulate with headers)
2. This triggers the IP geolocation API call

**Expected Metrics:**

- `api.calls` - Should increment
- `api.call.duration` - Should record API call duration

**Verify in Grafana:**

```promql
# API call rate by service
sum by (api_service) (rate(devacademy_api_calls_total[5m]))

# API latency
histogram_quantile(0.95, rate(devacademy_api_call_duration_milliseconds_bucket[5m]))

# API error rate
rate(api_errors_total[5m]) / rate(devacademy_api_calls_total[5m])
```

### Scenario 5: Email Metrics

**Actions:**

1. Configure `RESEND_API_KEY` in `.env`
2. Trigger actions that send emails:
   - Log in from a new location
   - Fail login 3+ times

**Expected Metrics:**

- `email.sent` - Should increment for successful sends
- `email.failures` - Should increment for failures
- `email.send.duration` - Should record send duration

**Verify in Grafana:**

```promql
# Email send rate by type
sum by (email_type) (rate(devacademy_email_sent_total[5m]))

# Email failure rate
rate(devacademy_email_failures_total[5m]) / (rate(devacademy_email_sent_total[5m]) + rate(devacademy_email_failures_total[5m]))

# Email send latency
rate(email_send_duration_sum[5m]) / rate(email_send_duration_count[5m])
```

### Scenario 6: Page View Metrics

**Actions:**

1. Visit different pages in the browser
2. Navigate between routes

**Expected Metrics:**

- `page.views` - Should increment for each page view

**Verify in Grafana:**

```promql
# Page views by path
sum by (page_path) (rate(devacademy_page_views_total[5m]))

# Most viewed pages
topk(10, sum by (page_path) (devacademy_page_views_total))
```

## Automated Testing

You can write automated tests to verify metrics:

```typescript
// test/metrics.test.ts
import { describe, it, expect } from 'vitest';
import { recordHttpRequest, recordLoginAttempt } from '@/lib/metrics';

describe('Metrics', () => {
  it('should record HTTP request metrics', () => {
    // This test verifies the function doesn't throw
    expect(() => {
      recordHttpRequest({
        method: 'GET',
        route: '/test',
        statusCode: 200,
        duration: 100,
      });
    }).not.toThrow();
  });

  it('should record login attempt metrics', () => {
    expect(() => {
      recordLoginAttempt({
        success: true,
        userId: 'test-user',
        email: 'test@example.com',
      });
    }).not.toThrow();
  });
});
```

Run tests:

```bash
bun test
```

## Integration Testing with Real Export

### Setup Local OTLP Collector

If you want to test locally without Grafana Cloud:

1. **Install OpenTelemetry Collector:**

```bash
# Using Docker
docker run -p 4318:4318 \
  -v $(pwd)/otel-collector-config.yaml:/etc/otel-collector-config.yaml \
  otel/opentelemetry-collector:latest \
  --config=/etc/otel-collector-config.yaml
```

2. **Configure collector** (`otel-collector-config.yaml`):

```yaml
receivers:
  otlp:
    protocols:
      http:
        endpoint: 0.0.0.0:4318

exporters:
  logging:
    loglevel: debug

service:
  pipelines:
    metrics:
      receivers: [otlp]
      exporters: [logging]
    traces:
      receivers: [otlp]
      exporters: [logging]
```

3. **Update `.env` to point to local collector:**

```bash
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
# Remove OTEL_EXPORTER_OTLP_HEADERS for local testing
```

4. **Run your app and watch collector logs:**

```bash
# In one terminal
docker logs -f <container-id>

# In another terminal
bun run dev
```

You should see metrics and traces in the collector logs.

## Troubleshooting

### No metrics appearing

**Check 1: Verify SDK initialization**

```typescript
// Add to instrumentation.node.ts
console.log('✅ OpenTelemetry SDK initialized');
```

**Check 2: Verify metrics are being recorded**

```typescript
// Add temporary logging to metrics.ts
export function recordHttpRequest(...) {
  console.log('Recording HTTP request metric:', attributes);
  // ... rest of function
}
```

**Check 3: Verify export is happening** Enable debug logging and check for export messages.

**Check 4: Verify credentials**

```bash
# Test OTLP endpoint
curl -X POST $OTEL_EXPORTER_OTLP_ENDPOINT/v1/metrics \
  -H "Authorization: Basic $YOUR_CREDENTIALS" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Metrics appear but with wrong values

**Check label cardinality:**

- Ensure labels don't have too many unique values
- Verify label values are sanitized

**Check aggregation:**

- Counters should only increase
- Histograms should record positive values
- UpDownCounters can increase/decrease

### High memory usage

**Reduce export interval:**

```typescript
exportIntervalMillis: 30000, // Export every 30 seconds instead of 60
```

**Limit label cardinality:**

- Remove dynamic labels
- Aggregate before recording

## Performance Testing

Test metrics overhead:

```bash
# Without metrics (disable in code)
ab -n 1000 -c 10 http://localhost:3000/

# With metrics (normal operation)
ab -n 1000 -c 10 http://localhost:3000/
```

Compare response times and throughput. Metrics should add < 5ms overhead per request.

## Checklist

Before deploying to production:

- [ ] Metrics export successfully to Grafana Cloud
- [ ] No PII (personally identifiable information) in metric labels
- [ ] Label cardinality is reasonable (< 100 unique values per label)
- [ ] Export interval is appropriate for your scale
- [ ] Debug logging is disabled (`DiagLogLevel.ERROR`)
- [ ] Metrics dashboard is created in Grafana
- [ ] Alerts are configured for critical metrics
- [ ] Documentation is updated with custom metrics

## Next Steps

Once metrics are verified:

1. **Create Dashboards** - Build Grafana dashboards for key metrics
2. **Set Up Alerts** - Configure alerts for anomalies
3. **Analyze Patterns** - Review metrics to understand user behavior
4. **Optimize** - Use metrics to identify performance bottlenecks
5. **Custom Metrics** - Add domain-specific metrics as needed

## References

- [OpenTelemetry Metrics Implementation](./metrics_implementation.md)
- [OpenTelemetry Debugging](https://opentelemetry.io/docs/languages/js/getting-started/nodejs/#troubleshooting)
- [Grafana Cloud Metrics](https://grafana.com/docs/grafana-cloud/metrics/)

---

_DevMultiplier Academy - Building 10x-100x Developers in the Age of AI_
