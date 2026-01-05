# Grafana Tempo TraceQL Query Guide

This guide provides useful TraceQL queries for analyzing traces in Grafana Cloud Tempo for the dev-academy-web application.

## Table of Contents

- [Basic Queries](#basic-queries)
- [Performance Analysis](#performance-analysis)
- [Route-Specific Queries](#route-specific-queries)
- [Error Detection](#error-detection)
- [Advanced Queries](#advanced-queries)
- [Query Patterns](#query-patterns)

## Basic Queries

### All Traces for the Application

```traceql
{service.name="dev-academy-web"}
```

Shows all traces from the dev-academy-web service.

### Recent Traces (Last 15 Minutes)

```traceql
{service.name="dev-academy-web"} | select(span.name, span.duration)
```

Use the time picker in Grafana to limit to last 15 minutes.

### Traces by HTTP Method

```traceql
{service.name="dev-academy-web" && http.method="GET"}
```

Filter traces by HTTP method (GET, POST, PUT, DELETE, etc.).

## Performance Analysis

### Slow Requests (Duration > 200ms)

```traceql
{service.name="dev-academy-web"} | duration > 200ms
```

Finds all requests taking longer than 200 milliseconds.

### Very Slow Requests (Duration > 1s)

```traceql
{service.name="dev-academy-web"} | duration > 1s
```

Critical performance issues requiring immediate attention.

### Average Duration by Route

```traceql
{service.name="dev-academy-web"}
| select(http.route, span.duration)
| by(http.route)
```

Groups traces by route to identify slow endpoints.

### P95 Duration Analysis

```traceql
{service.name="dev-academy-web"}
| select(span.duration)
| quantile_over_time(span.duration, 0.95)
```

Shows 95th percentile latency for requests.

## Route-Specific Queries

### Homepage Traces

```traceql
{service.name="dev-academy-web" && http.route="/"}
```

All traces for the homepage route.

### API Endpoint Traces

```traceql
{service.name="dev-academy-web" && http.route=~"/api/.*"}
```

Traces for all API endpoints using regex matching.

### Admin Routes

```traceql
{service.name="dev-academy-web" && http.route=~"/admin/.*"}
```

Traces for admin-protected routes.

### Security Dashboard

```traceql
{service.name="dev-academy-web" && http.route="/security"}
```

Traces for the security monitoring page.

## Error Detection

### Failed Requests (Status Code >= 400)

```traceql
{service.name="dev-academy-web" && http.status_code >= 400}
```

All client and server errors.

### Server Errors Only (Status Code >= 500)

```traceql
{service.name="dev-academy-web" && http.status_code >= 500}
```

Critical server-side errors.

### Error Status Spans

```traceql
{service.name="dev-academy-web" && status=error}
```

Spans marked with error status by OpenTelemetry.

### Authentication Failures

```traceql
{service.name="dev-academy-web" && http.status_code=401}
```

Unauthorized access attempts.

## Advanced Queries

### Next.js Specific Spans

#### Page Compilation Traces

```traceql
{service.name="dev-academy-web" && next.span_type=~".*compile.*"}
```

Traces showing Next.js page compilation.

#### Server-Side Rendering

```traceql
{service.name="dev-academy-web" && next.span_type="AppRender.getBodyResult"}
```

Traces for server-side rendering operations.

#### Component Resolution

```traceql
{service.name="dev-academy-web" && next.span_type="NextNodeServer.findPageComponents"}
```

Traces showing component resolution time.

### Client Component Loading

```traceql
{service.name="dev-academy-web" && next.span_type="NextNodeServer.clientComponentLoading"}
| select(next.clientComponentLoadCount, span.duration)
```

Analyze client-side component loading performance.

### RSC (React Server Components) Requests

```traceql
{service.name="dev-academy-web" && next.rsc=true}
```

Traces for React Server Component requests.

### Non-RSC Requests

```traceql
{service.name="dev-academy-web" && next.rsc=false}
```

Traditional page requests without RSC.

## Database Query Analysis

### Postgres Query Traces

```traceql
{service.name="dev-academy-web" && span.name=~"pg.*"}
```

All database queries instrumented by the Postgres driver.

### Slow Database Queries (> 100ms)

```traceql
{service.name="dev-academy-web" && span.name=~"pg.*"} | duration > 100ms
```

Database queries that may need optimization.

## HTTP Client Traces

### Outbound HTTP Requests

```traceql
{service.name="dev-academy-web" && http.request.method != ""}
| select(url.full, http.response.status_code, span.duration)
```

All outbound HTTP requests made by the application.

### External API Calls

```traceql
{service.name="dev-academy-web" && server.address != "localhost"}
```

Calls to external services (excluding localhost).

## Query Patterns

### Combining Multiple Conditions

```traceql
{
  service.name="dev-academy-web" &&
  http.method="POST" &&
  http.route=~"/api/.*"
} | duration > 500ms
```

Complex query combining service, method, route, and duration filters.

### Selecting Specific Attributes

```traceql
{service.name="dev-academy-web"}
| select(
    http.method,
    http.route,
    http.status_code,
    span.duration
  )
```

Project only the attributes you need for analysis.

### Grouping and Aggregation

```traceql
{service.name="dev-academy-web"}
| select(http.route, span.duration)
| by(http.route)
| avg(span.duration)
```

Calculate average duration grouped by route.

### Count by Status Code

```traceql
{service.name="dev-academy-web"}
| select(http.status_code)
| by(http.status_code)
| count()
```

Distribution of HTTP status codes.

## Trace Comparison Queries

### Compare Routes Performance

```traceql
{service.name="dev-academy-web" && http.route="/"}
| select(span.duration)
```

vs.

```traceql
{service.name="dev-academy-web" && http.route="/api/user/login-history"}
| select(span.duration)
```

Run both queries to compare different route performance.

### Before and After Deployment

Use time range selector to compare:

```traceql
{service.name="dev-academy-web" && http.route="/"}
| select(span.duration)
| avg(span.duration)
```

Run for time range before deployment, then after deployment.

## Resource Attribute Queries

### Filter by Environment

```traceql
{
  service.name="dev-academy-web" &&
  deployment.environment="development"
}
```

Useful if you add staging/production environments later.

### Filter by Service Version

```traceql
{
  service.name="dev-academy-web" &&
  service.version="1.0.0"
}
```

Track traces by deployed version.

## Debugging Workflows

### Find Trace by ID

```traceql
{traceid="b78c926ceeae757883cdc9b57e021a26"}
```

Locate a specific trace when you have the trace ID from logs.

### Parent-Child Span Analysis

```traceql
{service.name="dev-academy-web"}
| select(span.name, span.parent_id, span.duration)
```

Analyze span hierarchies and relationships.

### Span Count per Trace

```traceql
{service.name="dev-academy-web"}
| select(span.name)
| count()
| by(traceid)
```

Identify traces with unusually high span counts.

## Performance Optimization Patterns

### Identify Bottlenecks

```traceql
{service.name="dev-academy-web"}
| select(next.span_name, span.duration)
| sort(span.duration desc)
| limit(10)
```

Top 10 slowest operations.

### Component Tree Building Time

```traceql
{
  service.name="dev-academy-web" &&
  next.span_type="NextNodeServer.createComponentTree"
} | select(span.duration)
```

Measure React component tree construction time.

### Render Performance

```traceql
{
  service.name="dev-academy-web" &&
  next.span_type="AppRender.getBodyResult"
} | select(next.route, span.duration)
```

Analyze server-side rendering performance by route.

## Alert Query Examples

### SLO Violation Detection

```traceql
{service.name="dev-academy-web"}
| duration > 2s
| count() > 10
```

Alert when more than 10 requests exceed 2 seconds in the time window.

### Error Rate Threshold

```traceql
{service.name="dev-academy-web" && http.status_code >= 500}
| count() > 5
```

Alert when 5 or more server errors occur.

## Tips for Effective Querying

1. **Start Simple**: Begin with basic service filter, then add conditions
2. **Use Time Range**: Narrow down time window before running expensive queries
3. **Select Wisely**: Only project attributes you need for better performance
4. **Regex Carefully**: Regex patterns can be slow on large datasets
5. **Combine with Metrics**: Use Tempo queries with Grafana metrics for full picture
6. **Save Favorites**: Save commonly used queries in Grafana for quick access

## Integration with Other Tools

### Link to Logs (Loki)

When viewing a trace in Grafana Tempo, click "Logs for this span" to see corresponding application logs from Loki (if configured).

### Correlation with Metrics (Prometheus/Mimir)

Use trace IDs in log queries or exemplars in metrics to correlate:

```promql
rate(http_request_duration_seconds_bucket[5m])
```

Then click on exemplar points to see corresponding traces.

## Additional Resources

- [TraceQL Documentation](https://grafana.com/docs/tempo/latest/traceql/)
- [Grafana Tempo Documentation](https://grafana.com/docs/tempo/latest/)
- [OpenTelemetry Semantic Conventions](https://opentelemetry.io/docs/specs/semconv/)
