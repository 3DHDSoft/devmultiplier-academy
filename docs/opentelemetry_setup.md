# OpenTelemetry Integration Guide

## Overview

This application is instrumented with OpenTelemetry for distributed tracing and observability. The implementation includes:

- **Auto-instrumentation** for HTTP, Prisma, and Undici
- **Custom spans** for security features (login logging, location checks, failed attempts)
- **OTLP export** to Grafana Cloud (or any OTLP-compatible backend)

## Architecture

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#f8fafc',
  'primaryTextColor': '#000000',
  'primaryBorderColor': '#2563eb',
  'lineColor': '#000000',
  'secondaryColor': '#fafafa',
  'tertiaryColor': '#f5f5f5',
  'background': '#ffffff',
  'textColor': '#000000',
  'edgeLabelBackground': '#f1f5f9',
  'fontFamily': 'system-ui, -apple-system, sans-serif'
}}}%%
graph TB
    subgraph app["Next.js Application"]
        subgraph custom["Custom Spans"]
            tracer["src/lib/tracer.ts<br/>(Utilities)"]
            logger["src/lib/login-logger.ts<br/>(Security Tracing)"]
        end

        entry["instrumentation.ts<br/>(Entry Point)"]
        sdk["instrumentation.node.ts<br/>(Node.js SDK Configuration)"]
        entry --> sdk
    end

    app -->|OTLP/HTTP| grafana["Grafana Cloud<br/>Tempo (Traces)"]

    style app fill:#f8fafc,stroke:#2563eb,stroke-width:2px,color:#000000
    style custom fill:#fafafa,stroke:#7c3aed,stroke-width:2px,color:#000000
    style tracer fill:#c4b5fd,stroke:#7c3aed,color:#000000,stroke-width:2px
    style logger fill:#c4b5fd,stroke:#7c3aed,color:#000000,stroke-width:2px
    style entry fill:#93c5fd,stroke:#2563eb,color:#000000,stroke-width:2px
    style sdk fill:#67e8f9,stroke:#0891b2,color:#000000,stroke-width:2px
    style grafana fill:#fcd34d,stroke:#d97706,stroke-width:2px,color:#000000

    linkStyle default stroke:#000000,stroke-width:2px
```

## Features Instrumented

### 1. Auto-Instrumentation

The following are automatically traced:

- **HTTP Requests** - All incoming HTTP requests to the Next.js application
- **Prisma Database Queries** - All database operations
- **Undici/Fetch** - Outgoing HTTP requests (e.g., to ip-api.com)

### 2. Custom Security Spans

#### Login Logging (`login.log`)

Tracks the entire login logging process with:

- Attributes: `login.user.id`, `login.user.email`, `login.success`, `login.failure_reason`
- Events: `client_info_retrieved`, `fallback_to_ip_geolocation`, `login_log_created`

#### New Location Detection (`login.check_new_location`)

Monitors new login locations with:

- Attributes: `check.user_id`, `check.location.city`, `check.location.country`, `check.previous_logins_count`, `check.is_new_location`
- Events: `new_location_detected`, `new_location_email_sent`

#### Failed Attempts Monitoring (`login.check_failed_attempts`)

Tracks failed login attempts with:

- Attributes: `check.email`, `check.failed_attempts_count`, `check.time_window_minutes`
- Events: `failed_attempts_threshold_reached`, `sending_failed_attempts_alert`, `failed_attempts_email_sent`, `skipped_alert_to_avoid_spam`

## Environment-Based Configuration

The application supports two observability backends:

### Development: Local Grafana Stack

- **OpenTelemetry Collector** - Receives and processes telemetry
- **Grafana** - Visualization and dashboards (http://localhost:3001)
- **Prometheus** - Metrics storage
- **Tempo** - Distributed tracing storage
- **Refresh Interval**: 15 seconds

### Production: Grafana Cloud

- **OTLP Gateway** - Managed collector endpoint
- **Grafana Cloud** - Hosted visualization
- **Mimir/Prometheus** - Managed metrics storage
- **Tempo** - Managed tracing storage

### Switching Between Environments

Set the `OTEL_USE_CLOUD` environment variable:

```bash
# Development (default) - uses local stack
OTEL_USE_CLOUD=false

# Production - uses Grafana Cloud
OTEL_USE_CLOUD=true
```

The application automatically uses Grafana Cloud when `NODE_ENV=production`, regardless of the `OTEL_USE_CLOUD` setting.

## Local Development Setup

### 1. Start the Local Observability Stack

The local stack is already configured in your `.devcontainer/docker-compose.yml`:

```bash
# Start all services (from .devcontainer directory)
docker-compose up -d

# Or start specific services
docker-compose up -d otel-collector prometheus tempo grafana
```

### 2. Verify Services are Running

```bash
# Check service status
docker-compose ps

# Expected services:
# - otel-collector (ports 4317, 4318)
# - prometheus (port 9090)
# - tempo (port 3200)
# - grafana (port 3001)
```

### 3. Access Local Grafana

1. Open http://localhost:3001
2. Login with:
   - **Username**: `admin`
   - **Password**: `admin` (or check `GRAFANA_ADMIN_PASSWORD` in `.env`)
3. Navigate to **Dashboards** → **DevAcademy - Application Overview**
4. The dashboard will refresh every **15 seconds**

### 4. Configure Environment Variables

Your `.env` file should have:

```bash
# Development configuration
NODE_ENV=development
OTEL_USE_CLOUD=false
OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318
```

### 5. Run Your Application

```bash
bun run dev
```

You should see:

```
📊 OpenTelemetry configuration: Local Stack (development)
  🏠 Using local OTLP collector: http://otel-collector:4318
✅ OpenTelemetry instrumentation initialized
```

## Production Setup (Grafana Cloud)

### 1. Sign Up for Grafana Cloud (Free Tier)

1. Go to [https://grafana.com/auth/sign-up/create-user](https://grafana.com/auth/sign-up/create-user)
2. Create a free account
3. After login, you'll be in your Grafana Cloud stack

### 2. Get Your OTLP Endpoint and API Token

1. In Grafana Cloud, navigate to **Connections** → **Add new connection**
2. Search for and select **OpenTelemetry**
3. Click **Create a token** or use an existing one
4. You'll see something like:
   ```
   Endpoint: https://otlp-gateway-prod-us-east-0.grafana.net/otlp
   Instance ID: 123456
   Token: glc_xxx...
   ```

### 3. Configure Environment Variables for Production

Add these to your `.env.local` or production environment variables:

```bash
# Production OpenTelemetry Configuration
NODE_ENV=production
OTEL_USE_CLOUD=true
OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp-gateway-prod-us-east-0.grafana.net/otlp
OTEL_EXPORTER_OTLP_HEADERS={"Authorization":"Basic <base64_encoded_credentials>"}
```

**Note**: When `NODE_ENV=production`, the app automatically uses Grafana Cloud even without setting `OTEL_USE_CLOUD=true`.

**Note:** For the `Authorization` header, you need to base64 encode `<instance-id>:<token>`:

```bash
# Example:
echo -n "123456:glc_xxx..." | base64
# Output: MTIzNDU2OmdsY194eHguLi4=

# Then use in OTEL_EXPORTER_OTLP_HEADERS:
OTEL_EXPORTER_OTLP_HEADERS={"Authorization":"Basic MTIzNDU2OmdsY194eHguLi4="}
```

### 4. Alternative: Use Separate Variables

For easier configuration, you can also set:

```bash
# Grafana Cloud OTLP Configuration
GRAFANA_CLOUD_INSTANCE_ID=123456
GRAFANA_CLOUD_TOKEN=glc_xxx...
GRAFANA_CLOUD_REGION=prod-us-east-0

# The instrumentation.node.ts will construct the endpoint automatically
```

Then update `instrumentation.node.ts` to use these:

```typescript
const GRAFANA_CLOUD_INSTANCE_ID = process.env.GRAFANA_CLOUD_INSTANCE_ID;
const GRAFANA_CLOUD_TOKEN = process.env.GRAFANA_CLOUD_TOKEN;
const GRAFANA_CLOUD_REGION = process.env.GRAFANA_CLOUD_REGION || 'prod-us-east-0';

const traceExporter = new OTLPTraceExporter({
  url: `https://otlp-gateway-${GRAFANA_CLOUD_REGION}.grafana.net/otlp/v1/traces`,
  headers: {
    Authorization: `Basic ${Buffer.from(`${GRAFANA_CLOUD_INSTANCE_ID}:${GRAFANA_CLOUD_TOKEN}`).toString('base64')}`,
  },
});
```

### 5. Test the Integration

1. Restart your Next.js application:

   ```bash
   bun run dev
   ```

2. Perform some actions:
   - Login to the application
   - Navigate to different pages
   - Trigger a failed login attempt

3. Check Grafana Cloud:
   - Go to **Explore** → Select **Tempo** data source
   - You should see traces appearing within 1-2 minutes

## Viewing Traces in Grafana Cloud

### 1. Explore Traces

Navigate to **Explore** → Select **Tempo** data source.

**Search by Service:**

```
{service.name="dev-academy-web"}
```

**Search by Operation:**

```
{span.name="login.log"}
```

**Search for Failed Logins:**

```
{login.success=false}
```

**Search for New Location Alerts:**

```
{check.is_new_location=true}
```

### 2. Create Dashboards

Here are some useful dashboard queries:

#### Panel 1: Login Success Rate (Time Series)

**Query Type:** Tempo → TraceQL

```traceql
# Count successful logins
{span.name="login.log" && login.success=true} | rate()

# Count failed logins
{span.name="login.log" && login.success=false} | rate()
```

**Visualization:** Time series graph **Legend:** `{{login.success}}`

#### Panel 2: New Location Alerts (Stat)

**Query Type:** Tempo → TraceQL

```traceql
{span.name="login.check_new_location" && check.is_new_location=true} | count_over_time(1h)
```

**Visualization:** Stat panel **Title:** "New Location Alerts (Last Hour)"

#### Panel 3: Failed Attempts by Email (Table)

**Query Type:** Tempo → TraceQL

```traceql
{span.name="login.check_failed_attempts" && check.failed_attempts_count > 0}
  | select(check.email, check.failed_attempts_count, check.location.country)
```

**Visualization:** Table **Columns:** Email, Failed Attempts, Country

#### Panel 4: Login Duration P95 (Time Series)

**Query Type:** Tempo → TraceQL

```traceql
{span.name="login.log"} | quantile_over_time(duration, 0.95) by (login.success)
```

**Visualization:** Time series **Title:** "Login Duration P95" **Y-Axis:** Milliseconds

#### Panel 5: Geolocation Fallback Rate (Stat)

**Query Type:** Tempo → TraceQL

```traceql
# Count spans with fallback event
{span.name="login.log"} | select(span.events.name="fallback_to_ip_geolocation") | rate()
```

**Visualization:** Stat **Title:** "Geolocation Fallback Rate"

### 3. Create Alerts

#### Alert: High Failed Login Rate

**Condition:**

```traceql
{span.name="login.log" && login.success=false} | rate() > 0.1
```

**Description:** Alert when failed login rate exceeds 10% (0.1 per second)

**Notification:** Email, Slack, PagerDuty, etc.

#### Alert: New Location Spike

**Condition:**

```traceql
{span.name="login.check_new_location" && check.is_new_location=true} | count_over_time(5m) > 10
```

**Description:** Alert when more than 10 new location alerts in 5 minutes

## Example Dashboard JSON

Create a new dashboard in Grafana and import this JSON:

```json
{
  "dashboard": {
    "title": "Dev Academy - Security Monitoring",
    "panels": [
      {
        "title": "Login Success Rate",
        "targets": [
          {
            "datasource": "Tempo",
            "query": "{span.name=\"login.log\"} | rate() by (login.success)"
          }
        ],
        "type": "timeseries"
      },
      {
        "title": "New Location Alerts (Last Hour)",
        "targets": [
          {
            "datasource": "Tempo",
            "query": "{span.name=\"login.check_new_location\" && check.is_new_location=true} | count_over_time(1h)"
          }
        ],
        "type": "stat"
      },
      {
        "title": "Failed Attempts by Country",
        "targets": [
          {
            "datasource": "Tempo",
            "query": "{span.name=\"login.check_failed_attempts\"} | count() by (check.location.country)"
          }
        ],
        "type": "bargauge"
      }
    ]
  }
}
```

## Prometheus Metrics Endpoint

The application exposes a `/api/metrics` endpoint that provides metrics in Prometheus text format. This endpoint can be scraped by Prometheus or other monitoring tools.

### Endpoint Details

**URL**: `http://localhost:3000/api/metrics` (or your production domain)

**Method**: `GET`

**Response Format**: `text/plain; version=0.0.4`

### Available Metrics

Currently exposed metrics:

- **app_info**: Application information gauge with service name and environment labels
- **app_uptime_seconds**: Application uptime in seconds (counter)

### Example Response

```prometheus
# HELP app_info Application information
# TYPE app_info gauge
app_info{service="dev-academy-web",environment="development"} 1

# HELP app_uptime_seconds Application uptime in seconds
# TYPE app_uptime_seconds counter
app_uptime_seconds 1234.567
```

### Configuring Prometheus to Scrape

Add this job to your `prometheus.yml` configuration:

```yaml
scrape_configs:
  - job_name: 'dev-academy-web'
    scrape_interval: 30s
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/api/metrics'
```

### Grafana Cloud Integration

If you're using Grafana Cloud, you can configure the Grafana Agent to scrape this endpoint:

1. Navigate to **Connections** → **Grafana Cloud** → **Configure**
2. Add a new scrape configuration in the agent config:

```yaml
metrics:
  configs:
    - name: dev-academy-web
      scrape_configs:
        - job_name: 'dev-academy-web'
          static_configs:
            - targets: ['your-domain.com:443']
          scheme: https
          metrics_path: '/api/metrics'
```

### Future Enhancements

The metrics endpoint can be enhanced to include:

- Request rate and latency metrics from OpenTelemetry
- Custom business metrics (user registrations, enrollments, etc.)
- Database connection pool metrics
- Cache hit/miss ratios
- Error rates by endpoint

To add more detailed metrics, install the Prometheus exporter:

```bash
bun add @opentelemetry/exporter-prometheus
```

Then update the metrics endpoint to use the PrometheusSerializer for full OpenTelemetry metrics export.

## Useful TraceQL Queries

### Find Traces with Errors

```traceql
{status=error}
```

### Find Slow Logins (> 1 second)

```traceql
{span.name="login.log" && duration > 1s}
```

### Find Logins from Specific Country

```traceql
{span.name="login.log" && geo.country="United States"}
```

### Find Email Sent Events

```traceql
{span.events.name="new_location_email_sent" || span.events.name="failed_attempts_email_sent"}
```

### Find Database Query Performance

```traceql
{span.name=~"prisma:.*"} | quantile_over_time(duration, 0.95)
```

## Troubleshooting

### Traces Not Appearing in Grafana Cloud

1. **Check environment variables:**

   ```bash
   echo $OTEL_EXPORTER_OTLP_ENDPOINT
   echo $OTEL_EXPORTER_OTLP_HEADERS
   ```

2. **Verify credentials are correct:**
   - Instance ID and token must be base64 encoded together
   - Format: `echo -n "<instance-id>:<token>" | base64`

3. **Check application logs:**
   - Look for OpenTelemetry initialization messages
   - Check for any OTLP export errors

4. **Test with curl:**
   ```bash
   curl -X POST \
     https://otlp-gateway-prod-us-east-0.grafana.net/otlp/v1/traces \
     -H "Authorization: Basic <base64_credentials>" \
     -H "Content-Type: application/json" \
     -d '{}'
   ```

### High Cardinality Warning

If you see warnings about high cardinality attributes:

- Avoid using email addresses or user IDs in span names
- Use span attributes instead
- Consider sampling for high-traffic endpoints

### Performance Impact

OpenTelemetry adds minimal overhead:

- Auto-instrumentation: ~1-5ms per request
- Custom spans: ~0.1-0.5ms per span
- Network export: Async, non-blocking

To reduce overhead:

- Enable sampling for production: `OTEL_TRACES_SAMPLER=parentbased_traceidratio`
- Set sample rate: `OTEL_TRACES_SAMPLER_ARG=0.1` (10% sampling)

## Local Development with Jaeger (Optional)

For local testing without Grafana Cloud:

1. **Run Jaeger locally:**

   ```bash
   docker run -d --name jaeger \
     -p 16686:16686 \
     -p 4318:4318 \
     jaegertracing/all-in-one:latest
   ```

2. **Update `.env.local`:**

   ```bash
   OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces
   # Remove OTEL_EXPORTER_OTLP_HEADERS
   ```

3. **View traces:** Open [http://localhost:16686](http://localhost:16686)

## Resources

- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [Grafana Tempo Documentation](https://grafana.com/docs/tempo/latest/)
- [TraceQL Documentation](https://grafana.com/docs/tempo/latest/traceql/)
- [Next.js OpenTelemetry](https://nextjs.org/docs/app/building-your-application/optimizing/open-telemetry)

## Next Steps

1. **Create your Grafana Cloud account**
2. **Configure environment variables** with your OTLP endpoint and credentials
3. **Restart the application** to start sending traces
4. **Import the example dashboard** or create your own
5. **Set up alerts** for security events

Happy monitoring! 🚀

---

_DevMultiplier Academy - Building 10x-100x Developers in the Age of AI_
