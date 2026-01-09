# OpenTelemetry Environment Switching Guide

This guide explains how to switch between local and cloud observability backends for the dev-academy-web application.

## Overview

The application supports two observability configurations:

| Environment | Backend | Use Case | Configuration |
|------------|---------|----------|---------------|
| **Development** | Local Grafana Stack | Local development, debugging | `OTEL_USE_CLOUD=false` or `NODE_ENV=development` |
| **Production** | Grafana Cloud | Production deployment | `OTEL_USE_CLOUD=true` or `NODE_ENV=production` |

## Architecture Comparison

### Local Stack (Development)

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#93c5fd', 'primaryTextColor': '#000000', 'primaryBorderColor': '#2563eb', 'lineColor': '#000000', 'background': '#ffffff', 'textColor': '#000000', 'fontFamily': 'system-ui'}}}%%
graph LR
    A[Next.js App] -->|OTLP HTTP| B[OTEL Collector<br/>:4318]
    B -->|Traces| C[Tempo<br/>:3200]
    B -->|Metrics| D[Prometheus<br/>:9090]
    C --> E[Grafana<br/>:3001]
    D --> E

    style A fill:#93c5fd,stroke:#2563eb,color:#000000,stroke-width:2px
    style B fill:#86efac,stroke:#16a34a,color:#000000,stroke-width:2px
    style C fill:#fcd34d,stroke:#d97706,color:#000000,stroke-width:2px
    style D fill:#fcd34d,stroke:#d97706,color:#000000,stroke-width:2px
    style E fill:#c4b5fd,stroke:#7c3aed,color:#000000,stroke-width:2px
    linkStyle default stroke:#000000,stroke-width:2px
```

**Benefits:**
- No external dependencies
- Fast iteration cycle
- Full control over data
- No cost
- 15-second dashboard refresh

**Services:**
- OpenTelemetry Collector (http://localhost:4318)
- Grafana (http://localhost:3001)
- Prometheus (http://localhost:9090)
- Tempo (http://localhost:3200)

### Cloud Stack (Production)

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#93c5fd', 'primaryTextColor': '#000000', 'primaryBorderColor': '#2563eb', 'lineColor': '#000000', 'background': '#ffffff', 'textColor': '#000000', 'fontFamily': 'system-ui'}}}%%
graph LR
    A[Next.js App] -->|OTLP HTTPS| B[Grafana Cloud<br/>OTLP Gateway]
    B -->|Traces| C[Tempo]
    B -->|Metrics| D[Mimir/Prometheus]
    C --> E[Grafana Cloud UI]
    D --> E

    style A fill:#93c5fd,stroke:#2563eb,color:#000000,stroke-width:2px
    style B fill:#fca5a5,stroke:#dc2626,color:#000000,stroke-width:2px
    style C fill:#fcd34d,stroke:#d97706,color:#000000,stroke-width:2px
    style D fill:#fcd34d,stroke:#d97706,color:#000000,stroke-width:2px
    style E fill:#c4b5fd,stroke:#7c3aed,color:#000000,stroke-width:2px
    linkStyle default stroke:#000000,stroke-width:2px
```

**Benefits:**
- Managed infrastructure
- Global availability
- Long-term retention
- Alerting & notifications
- Team collaboration

## Configuration

### Environment Variables

The application checks these variables in order:

1. **`OTEL_USE_CLOUD`** - Explicitly set backend (`true` = cloud, `false` = local)
2. **`NODE_ENV`** - Auto-detect environment (`production` = cloud, `development` = local)
3. **Default** - Uses local stack if neither is set

### Decision Logic

```typescript
const isProduction = process.env.NODE_ENV === 'production';
const useCloudBackend = process.env.OTEL_USE_CLOUD === 'true' || isProduction;
```

**Examples:**

| `NODE_ENV` | `OTEL_USE_CLOUD` | Result |
|-----------|------------------|--------|
| `development` | (not set) | Local Stack |
| `development` | `false` | Local Stack |
| `development` | `true` | Grafana Cloud |
| `production` | (any value) | Grafana Cloud |
| (not set) | `false` | Local Stack |
| (not set) | `true` | Grafana Cloud |

## Setup Instructions

### Development (Local Stack)

#### 1. Configure `.env`

```bash
# .env or .env.local
NODE_ENV=development
OTEL_USE_CLOUD=false
OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318
```

#### 2. Start Local Services

```bash
cd .devcontainer
docker-compose up -d otel-collector prometheus tempo grafana
```

#### 3. Verify Services

```bash
# Check if services are running
docker-compose ps

# Check collector health
curl http://localhost:13133

# Check Prometheus
curl http://localhost:9090/-/healthy

# Check Tempo
curl http://localhost:3200/ready
```

#### 4. Start Application

```bash
bun run dev
```

**Expected Console Output:**
```
📊 OpenTelemetry configuration: Local Stack (development)
  🏠 Using local OTLP collector: http://otel-collector:4318
✅ OpenTelemetry instrumentation initialized
```

#### 5. Access Grafana

1. Open http://localhost:3001
2. Login: `admin` / `admin`
3. Go to **Dashboards** → **DevAcademy - Application Overview**
4. Dashboard refreshes every **15 seconds**

### Production (Grafana Cloud)

#### 1. Get Grafana Cloud Credentials

1. Sign up at https://grafana.com/auth/sign-up/create-user
2. Navigate to **Connections** → **Add new connection** → **OpenTelemetry**
3. Copy your:
   - Endpoint: `https://otlp-gateway-prod-us-east-X.grafana.net/otlp`
   - Instance ID: `123456`
   - Token: `glc_xxx...`

#### 2. Encode Credentials

```bash
# Create base64 encoded credentials
echo -n "123456:glc_xxx..." | base64
# Output: MTIzNDU2OmdsY194eHguLi4=
```

#### 3. Configure Production Environment

```bash
# .env.local (for testing production locally)
NODE_ENV=production
OTEL_USE_CLOUD=true
OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp-gateway-prod-us-east-3.grafana.net/otlp
OTEL_EXPORTER_OTLP_HEADERS={"Authorization":"Basic MTIzNDU2OmdsY194eHguLi4="}
```

**For actual production deployment**, set these as environment variables in your hosting platform (Vercel, AWS, etc.).

#### 4. Deploy Application

```bash
# Build for production
bun run build

# Start production server
bun run start
```

**Expected Console Output:**
```
📊 OpenTelemetry configuration: Grafana Cloud (production)
  ☁️  Using Grafana Cloud endpoint: https://otlp-gateway-prod-us-east-3.grafana.net/otlp
✅ OpenTelemetry instrumentation initialized
```

#### 5. Verify in Grafana Cloud

1. Login to your Grafana Cloud instance
2. Go to **Explore** → Select **Tempo** datasource
3. Query: `{service.name="dev-academy-web"}`
4. You should see traces within 1-2 minutes

## Testing Cloud Configuration Locally

You can test Grafana Cloud integration from your development environment:

```bash
# Temporarily override to use cloud
OTEL_USE_CLOUD=true bun run dev
```

Or add to `.env.local`:

```bash
# .env.local
NODE_ENV=development
OTEL_USE_CLOUD=true  # Override to test cloud
OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp-gateway-prod-us-east-3.grafana.net/otlp
OTEL_EXPORTER_OTLP_HEADERS={"Authorization":"Basic <your-credentials>"}
```

## Troubleshooting

### Metrics Not Appearing in Local Grafana

**Check 1: Services Running**
```bash
docker-compose ps
# All services should be "Up"
```

**Check 2: OTLP Collector Logs**
```bash
docker-compose logs otel-collector
# Should show "Everything is ready"
```

**Check 3: Application Configuration**
```bash
# Check console output when starting app
bun run dev
# Should show: "🏠 Using local OTLP collector"
```

**Check 4: Prometheus Targets**
1. Open http://localhost:9090/targets
2. Verify `otel-collector` target is UP

**Check 5: Generate Test Traffic**
```bash
# Generate some requests
for i in {1..10}; do curl http://localhost:3000/; sleep 1; done
```

### Not Connecting to Grafana Cloud

**Check 1: Credentials**
```bash
# Verify base64 encoding
echo "MTIzNDU2OmdsY194eHguLi4=" | base64 -d
# Should output: 123456:glc_xxx...
```

**Check 2: Environment Variables Loaded**
```typescript
// Add temporary debug logging to instrumentation.node.ts
console.log('OTEL_USE_CLOUD:', process.env.OTEL_USE_CLOUD);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Endpoint:', process.env.OTEL_EXPORTER_OTLP_ENDPOINT);
```

**Check 3: Network Connectivity**
```bash
curl -X POST https://otlp-gateway-prod-us-east-3.grafana.net/otlp/v1/traces \
  -H "Authorization: Basic <your-base64>" \
  -H "Content-Type: application/json" \
  -d '{}'
# Should return: {"partialSuccess":{}}
```

**Check 4: Enable Debug Logging**
```typescript
// instrumentation.node.ts
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
```

## Best Practices

### Development Workflow

1. **Always use local stack** during active development
2. **Test cloud integration** before deploying to production
3. **Monitor local Grafana** to catch issues early
4. **Use 15-second refresh** for responsive feedback

### Production Deployment

1. **Set `NODE_ENV=production`** - auto-enables cloud backend
2. **Use environment variables** - never commit credentials to git
3. **Verify traces appear** in Grafana Cloud after deployment
4. **Set up alerts** for production errors
5. **Monitor costs** - free tier has limits

### Environment Variable Management

**Development (`.env`):**
```bash
NODE_ENV=development
OTEL_USE_CLOUD=false
OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318
```

**Local Testing (`.env.local` - gitignored):**
```bash
# Can override to test cloud integration
OTEL_USE_CLOUD=true
OTEL_EXPORTER_OTLP_HEADERS={"Authorization":"Basic <real-credentials>"}
```

**Production (Hosting Platform):**
```bash
NODE_ENV=production
OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp-gateway-prod-us-east-3.grafana.net/otlp
OTEL_EXPORTER_OTLP_HEADERS={"Authorization":"Basic <real-credentials>"}
# OTEL_USE_CLOUD not needed - production auto-enables cloud
```

## Quick Reference

### Start Local Stack
```bash
cd .devcontainer && docker-compose up -d
```

### Stop Local Stack
```bash
cd .devcontainer && docker-compose down
```

### View Local Services
- Grafana: http://localhost:3001
- Prometheus: http://localhost:9090
- Tempo: http://localhost:3200
- OTLP Collector: http://localhost:4318

### Switch to Cloud (Temporary)
```bash
OTEL_USE_CLOUD=true bun run dev
```

### Switch to Local (Temporary)
```bash
OTEL_USE_CLOUD=false bun run dev
```

### Check Current Configuration
```bash
# Look for this line in console output:
# "📊 OpenTelemetry configuration: Local Stack (development)"
# or
# "📊 OpenTelemetry configuration: Grafana Cloud (production)"
```

## Related Documentation

- [OpenTelemetry Setup Guide](./opentelemetry_setup.md)
- [OpenTelemetry Architecture](./opentelemetry_architecture.md)
- [Docker Compose Configuration](../.devcontainer/docker-compose.yml)
- [OTLP Collector Config](../.devcontainer/otel-collector/otel-collector-config.yml)

---

**Last Updated**: 2026-01-07
**Version**: 1.0.0

---

_DevMultiplier Academy - Building 10x-100x Developers in the Age of AI_
