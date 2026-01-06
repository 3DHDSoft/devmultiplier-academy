# Metrics Quick Reference

Quick reference guide for the OpenTelemetry metrics implementation.

## 🚀 Quick Start

### Import and Use

```typescript
import {
  // HTTP metrics
  recordHttpRequest,

  // Database metrics
  recordDbQuery,

  // API metrics
  recordApiCall,

  // Auth metrics
  recordLoginAttempt,

  // Email metrics
  recordEmailSent,

  // Page metrics
  recordPageView,

  // Direct counters/histograms
  httpRequestCounter,
  httpRequestDuration,
  loginAttemptCounter,
  // ... etc
} from '@/lib/metrics';
```

### Common Usage Patterns

**HTTP Request:**

```typescript
recordHttpRequest({
  method: 'GET',
  route: '/api/users',
  statusCode: 200,
  duration: 45,
  requestSize: 256,
  responseSize: 1024,
});
```

**Database Query:**

```typescript
const start = Date.now();
try {
  const result = await prisma.user.findMany();
  recordDbQuery({
    operation: 'findMany',
    table: 'user',
    duration: Date.now() - start,
    success: true,
  });
} catch (error) {
  recordDbQuery({
    operation: 'findMany',
    table: 'user',
    duration: Date.now() - start,
    success: false,
    error: 'QueryError',
  });
}
```

**External API Call:**

```typescript
recordApiCall({
  service: 'stripe',
  endpoint: '/v1/customers',
  duration: 250,
  statusCode: 200,
  success: true,
});
```

**Login Attempt:**

```typescript
recordLoginAttempt({
  success: true,
  userId: 'user-123',
  email: 'user@example.com',
  country: 'United States',
  city: 'San Francisco',
});
```

**Email Sent:**

```typescript
recordEmailSent({
  type: 'password_reset',
  recipient: 'user@example.com',
  success: true,
  duration: 180,
});
```

**Page View:**

```typescript
recordPageView({
  path: '/courses/react-basics',
  userId: 'user-123',
  isUnique: true,
});
```

**Direct Counter Usage:**

```typescript
import { courseEnrollmentCounter } from '@/lib/metrics';

courseEnrollmentCounter.add(1, {
  'course.id': courseId,
  'user.id': userId,
});
```

## 📊 Available Metrics

### Performance Metrics

- `http.server.requests` - Counter
- `http.server.duration` - Histogram (ms)
- `http.server.errors` - Counter
- `db.queries` - Counter
- `db.query.duration` - Histogram (ms)
- `db.errors` - Counter
- `api.calls` - Counter
- `api.call.duration` - Histogram (ms)
- `api.errors` - Counter

### Authentication Metrics

- `user.login.attempts` - Counter
- `user.login.success` - Counter
- `user.login.failures` - Counter
- `user.login.new_location` - Counter
- `user.login.suspicious` - Counter
- `user.logout` - Counter
- `user.registration` - Counter
- `user.activation` - Counter

### User Activity Metrics

- `user.active` - UpDownCounter
- `user.sessions.active` - UpDownCounter
- `page.views` - Counter
- `page.views.unique` - Counter

### Content Metrics

- `course.views` - Counter
- `course.enrollments` - Counter
- `course.completions` - Counter
- `lesson.views` - Counter
- `lesson.completions` - Counter

### Search Metrics

- `search.queries` - Counter
- `search.duration` - Histogram (ms)
- `search.results.count` - Histogram

### Email Metrics

- `email.sent` - Counter
- `email.failures` - Counter
- `email.send.duration` - Histogram (ms)
- `notification.sent` - Counter

## 🔍 Common Grafana Queries

### HTTP Performance

```promql
# Request rate
rate(http_server_requests_total[5m])

# Error rate percentage
(rate(http_server_errors_total[5m]) / rate(http_server_requests_total[5m])) * 100

# Average latency
rate(http_server_duration_sum[5m]) / rate(http_server_duration_count[5m])

# P95 latency
histogram_quantile(0.95, rate(http_server_duration_bucket[5m]))

# Requests by route
sum by (http_route) (rate(http_server_requests_total[5m]))
```

### Authentication & Security

```promql
# Login success rate
rate(user_login_success_total[5m]) / rate(user_login_attempts_total[5m])

# Failed logins by country
sum by (geo_country) (rate(user_login_failures_total[5m]))

# Suspicious login rate
rate(user_login_suspicious_total[5m])

# New location logins
rate(user_login_new_location_total[5m])
```

### Database Performance

```promql
# Query rate
rate(db_queries_total[5m])

# Average query latency
rate(db_query_duration_sum[5m]) / rate(db_query_duration_count[5m])

# Slow queries (P99 latency)
histogram_quantile(0.99, rate(db_query_duration_bucket[5m]))

# Error rate
rate(db_errors_total[5m]) / rate(db_queries_total[5m])

# Queries by table
sum by (db_table) (rate(db_queries_total[5m]))
```

### User Engagement

```promql
# Current active users
user_active

# Page views by path
topk(10, sum by (page_path) (rate(page_views_total[5m])))

# Course enrollments
rate(course_enrollments_total[5m])

# Completion rate
rate(course_completions_total[5m]) / rate(course_enrollments_total[5m])
```

### External Services

```promql
# API call rate by service
sum by (api_service) (rate(api_calls_total[5m]))

# API error rate
rate(api_errors_total[5m]) / rate(api_calls_total[5m])

# API latency P95
histogram_quantile(0.95, rate(api_call_duration_bucket[5m]))
```

### Email Service

```promql
# Email send rate
rate(email_sent_total[5m])

# Email failure rate
rate(email_failures_total[5m]) / (rate(email_sent_total[5m]) + rate(email_failures_total[5m]))

# Emails by type
sum by (email_type) (rate(email_sent_total[5m]))
```

## 🎯 Alerting Rules

### Critical Alerts

**High Error Rate:**

```promql
(rate(http_server_errors_total[5m]) / rate(http_server_requests_total[5m])) > 0.05
```

Alert when > 5% of requests are errors

**High P95 Latency:**

```promql
histogram_quantile(0.95, rate(http_server_duration_bucket[5m])) > 1000
```

Alert when P95 latency > 1000ms

**Database Errors:**

```promql
rate(db_errors_total[5m]) > 0
```

Alert on any database errors

**API Failures:**

```promql
rate(api_errors_total[5m]) > 1
```

Alert when external API errors > 1/sec

**Suspicious Logins:**

```promql
rate(user_login_suspicious_total[5m]) > 0.1
```

Alert when suspicious logins > 0.1/sec

**Email Send Failures:**

```promql
(rate(email_failures_total[5m]) / (rate(email_sent_total[5m]) + rate(email_failures_total[5m]))) > 0.1
```

Alert when email failure rate > 10%

## 🛠️ Custom Metrics

### Create Custom Counter

```typescript
import { createCounter } from '@/lib/metrics';

const myCounter = createCounter('my.custom.counter', {
  description: 'Description of my counter',
  unit: '1',
});

myCounter.add(1, { 'label.name': 'value' });
```

### Create Custom Histogram

```typescript
import { createHistogram } from '@/lib/metrics';

const myHistogram = createHistogram('my.custom.duration', {
  description: 'Duration of custom operation',
  unit: 'ms',
});

myHistogram.record(150, { operation: 'batch_process' });
```

### Create Custom UpDownCounter (Gauge)

```typescript
import { createUpDownCounter } from '@/lib/metrics';

const queueSize = createUpDownCounter('queue.size', {
  description: 'Items in processing queue',
  unit: '1',
});

queueSize.add(5); // Add items
queueSize.add(-2); // Remove items
```

## 📝 Best Practices

### DO ✅

- Use helper functions (`recordHttpRequest`, etc.) for consistency
- Keep label cardinality low (< 100 unique values)
- Use semantic naming (`http.server.duration`, not `http_time`)
- Record metrics asynchronously to avoid blocking
- Include relevant context in labels
- Use appropriate metric types (Counter, Histogram, UpDownCounter)

### DON'T ❌

- Don't include PII in labels (email addresses, names, etc.)
- Don't use high-cardinality labels (user IDs, timestamps)
- Don't block application flow waiting for metrics
- Don't create metrics dynamically at runtime
- Don't use counters for values that decrease

## 🔧 Configuration

### Export Interval

Default: 60 seconds

Change in [instrumentation.node.ts](../instrumentation.node.ts):

```typescript
exportIntervalMillis: 30000, // 30 seconds
```

### Debug Logging

Enable in [instrumentation.node.ts](../instrumentation.node.ts):

```typescript
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
```

### Environment Variables

```bash
OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp-gateway-prod-us-east-3.grafana.net/otlp
OTEL_EXPORTER_OTLP_HEADERS=Authorization=Basic <BASE64_CREDENTIALS>
```

## 📚 Documentation

- [Full Implementation Guide](./metrics_implementation.md)
- [Testing Guide](./metrics_testing_guide.md)
- [OpenTelemetry Architecture](./opentelemetry_architecture.md)
- [Tempo Queries](./tempo_queries.md)

## 🆘 Troubleshooting

**Metrics not appearing:**

1. Enable debug logging
2. Check environment variables
3. Wait 60+ seconds for export
4. Verify Grafana Cloud credentials

**Wrong values:**

1. Check label cardinality
2. Verify metric type (Counter vs Histogram)
3. Check aggregation in queries

**High memory:**

1. Reduce export interval
2. Limit label cardinality
3. Remove unnecessary metrics

## 📞 Support

For issues or questions:

- Review documentation in `/doc` folder
- Check OpenTelemetry logs (enable DEBUG)
- Test with local OTLP collector
- Verify Grafana Cloud connection

---

_DevMultiplier Academy - Building 10x-100x Developers in the Age of AI_
