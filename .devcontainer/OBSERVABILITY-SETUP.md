# Observability Setup Guide

## Overview

This devcontainer includes a complete observability stack for monitoring your Next.js application:

- **OpenTelemetry Collector** - Receives traces and metrics from the app
- **Tempo** - Stores and queries distributed traces
- **Prometheus** - Stores and queries metrics
- **Grafana** - Visualizes traces and metrics

## Quick Start

### 1. Start the observability stack:

```bash
cd .devcontainer
docker-compose up -d otel-collector tempo prometheus grafana
```

### 2. Access the dashboards:

- **Grafana**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9090
- **Tempo**: http://localhost:3200

### 3. Restart your Next.js app to start sending telemetry:

```bash
# Stop the dev server (Ctrl+C) and restart
npm run dev
```

## Switching Between Local and Grafana Cloud

Edit `.env.local` to switch between local and cloud telemetry:

### Use Local (Default):

```env
# --- LOCAL CONFIGURATION (Active by default) ---
OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318
# OTEL_EXPORTER_OTLP_HEADERS=
```

### Use Grafana Cloud:

Comment out the local config and uncomment the cloud config:

```env
# --- LOCAL CONFIGURATION (Disabled) ---
# OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318

# --- GRAFANA CLOUD CONFIGURATION (Active) ---
OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp-gateway-prod-us-east-3.grafana.net/otlp
OTEL_EXPORTER_OTLP_HEADERS={"Authorization":"Basic MTQ4Njg0NzpnbGNfZXlKdklqb2lNVFl6TXpVNU55SXNJbTRpT2lKa1pYWXRZV05oWkdWdGVTMTNaV0l0TWkwaUxDSnJJam9pTlhvMll6SlBTako1ZGpWdU5GaFFOMUUzT1Zsd2NtdzVJaXdpYlNJNmV5SnlJam9pY0hKdlpDMTFjeTFsWVhOMExUTWlmWDA9"}
```

**Important**: Restart your Next.js app after changing the configuration.

## Architecture

```
Next.js App (port 3000)
    |
    | OTLP HTTP (port 4318)
    v
OpenTelemetry Collector
    |
    +---> Tempo (traces via OTLP)
    |
    +---> Prometheus (metrics via scraping port 8889)
    |
    v
Grafana (port 3001)
    |
    +---> Queries Tempo for traces
    +---> Queries Prometheus for metrics
```

## Ports

| Service                | Port  | Purpose                          |
|------------------------|-------|----------------------------------|
| Next.js App            | 3000  | Application                      |
| Grafana                | 3001  | Visualization dashboard          |
| Tempo                  | 3200  | Trace query API                  |
| OTEL Collector (gRPC)  | 4317  | Receive telemetry (gRPC)        |
| OTEL Collector (HTTP)  | 4318  | Receive telemetry (HTTP)        |
| OTEL Collector Metrics | 8888  | Collector internal metrics       |
| OTEL Collector Export  | 8889  | Prometheus scrape endpoint       |
| Prometheus             | 9090  | Metrics query API                |
| OTEL Collector Health  | 13133 | Health check endpoint            |

## Troubleshooting

### No data in Grafana?

1. Check if containers are running:
   ```bash
   docker ps | grep -E "otel-collector|tempo|prometheus|grafana"
   ```

2. Check OpenTelemetry Collector logs:
   ```bash
   docker logs otel-collector
   ```

3. Verify your Next.js app started with instrumentation:
   ```bash
   # Look for this message in the Next.js logs:
   # "✅ OpenTelemetry instrumentation initialized"
   ```

4. Test the OTEL Collector health:
   ```bash
   curl http://localhost:13133/health
   ```

### Switch to debug logging:

Edit `instrumentation.node.ts` line 25:

```typescript
// Change from:
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR);

// To:
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
```

### View Prometheus targets:

Visit http://localhost:9090/targets to see if the OTEL Collector is being scraped successfully.

## Configuration Files

- **Docker Compose**: `.devcontainer/docker-compose.yml`
- **OTEL Collector**: `.devcontainer/otel-collector/otel-collector-config.yml`
- **Tempo**: `.devcontainer/tempo/tempo.yml`
- **Prometheus**: `.devcontainer/prometheus/prometheus.yml`
- **Grafana Datasources**: `.devcontainer/grafana/provisioning/datasources/`
- **Grafana Dashboards**: `.devcontainer/grafana/dashboards/`
- **Next.js Instrumentation**: `instrumentation.ts` and `instrumentation.node.ts`
- **Environment Config**: `.env.local`
