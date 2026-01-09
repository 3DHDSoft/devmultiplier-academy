# Quick Start - Testing Your Grafana Dashboard

## 🚀 Quick Test (Recommended)

Run this single command to generate traffic and see data in your dashboard:

```bash
bun run telemetry:traffic
```

This will:

- Generate HTTP requests for 5 minutes
- Create realistic traffic patterns
- Populate most of your dashboard panels

## ⚡ See Results

1. **Open Grafana**: http://localhost:3001
2. **Navigate to**: Dashboards → DevAcademy → Application Overview
3. **Set time range**: Last 15 minutes
4. **Wait**: 15-30 seconds for first metrics to appear
   - Metrics export every 15 seconds
   - Prometheus scrapes every 10 seconds
   - Much faster than before!

## 📊 Expected Results

After running the traffic generator, you should see:

✅ **HTTP Client Request Rate** - Line chart showing requests/second ✅ **Average HTTP Response Time** - Gauge showing
latency ✅ **HTTP Requests by Endpoint** - Pie chart of endpoint distribution

## 🔐 Test Login Metrics

To specifically test the login panel:

```bash
bun run telemetry:login 50
```

This generates 50 login attempts with realistic success/failure rates. **Note**: The script will wait 20 seconds to
ensure metrics are exported.

To simulate a security attack (burst of failed logins):

```bash
bun run telemetry:login 50 --burst
```

## 🎯 Test Everything

To generate all types of metrics at once:

```bash
bun run telemetry:test
```

This generates:

- HTTP client metrics
- API error metrics
- Login activity metrics
- Database query metrics

**Note**: The script will wait 20 seconds to ensure metrics are exported before exiting.

## 🎛️ Custom Configuration

### Longer Traffic Test

```bash
DURATION_MINUTES=10 REQUESTS_PER_MINUTE=30 bun run telemetry:traffic
```

### High Load Test

```bash
REQUESTS_PER_MINUTE=100 bun run telemetry:traffic
```

### Target Different Server

```bash
BASE_URL=http://localhost:8080 bun run telemetry:traffic
```

## ❓ Troubleshooting

### No data in dashboard?

1. **Check your app is running**:

   ```bash
   curl http://localhost:3000
   ```

2. **Verify metrics are being exported**:
   - Look for "OpenTelemetry instrumentation initialized" in app logs
   - Metrics export every 60 seconds

3. **Check Prometheus has data**:

   ```bash
   curl -s http://localhost:9090/api/v1/label/__name__/values | grep devacademy
   ```

4. **Verify time range in Grafana**:
   - Click the time picker in top right
   - Select "Last 15 minutes"
   - Click "Refresh" button

### Scripts won't run?

Make sure tsx is available (bun includes it by default):

```bash
bunx tsx --version
```

### Getting connection errors?

Ensure your Next.js app is running:

```bash
bun run dev
```

## 📖 Full Documentation

For detailed information about each script and metric, see:

- [readme-telemetry-testing.md](./readme-telemetry-testing.md)

## 🎉 Success Criteria

Your dashboard is working correctly if you see:

1. ✅ Data appearing in panels within 1-2 minutes
2. ✅ Line charts showing trends over time
3. ✅ Gauges displaying current values
4. ✅ Pie charts showing distribution
5. ✅ No "No data" messages

## 💡 Pro Tips

- Run traffic generator in one terminal
- Keep Grafana open in browser
- Refresh dashboard every 15-30 seconds to see new data
- Use "Last 15 minutes" time range for best results
- Increase time range to see longer trends

## Next Steps

Once your dashboard is working:

1. Customize panel titles and descriptions
2. Adjust alert thresholds
3. Add more panels for specific metrics
4. Create additional dashboards for different views
5. Set up alerting rules for production monitoring

Enjoy your metrics! 📊✨

---

_DevMultiplier Academy - Building 10x-100x Developers in the Age of AI_
