# Log Analysis Command

Analyze and investigate application logs using Pino structured logging.

## Usage

```
/logs [action] [options]
```

## Actions

### View Recent Logs

```bash
# Stream logs with pretty formatting
tail -f logs/app.log | bunx pino-pretty

# Last 100 lines
tail -100 logs/app.log | bunx pino-pretty

# Errors only
tail -f logs/app.log | bunx pino-pretty | grep -E "ERROR|FATAL"
```

### Search by Request ID

```bash
# Find all logs for a specific request
cat logs/app.log | jq 'select(.requestId == "REQUEST_ID")'

# With pretty output
cat logs/app.log | jq 'select(.requestId == "REQUEST_ID")' | bunx pino-pretty
```

### Search by User ID

```bash
# Find all activity for a user
cat logs/app.log | jq 'select(.userId == "USER_ID")'
```

### Search by Error Code

```bash
# Find specific error types
cat logs/app.log | jq 'select(.code == "NOT_FOUND")'
cat logs/app.log | jq 'select(.code == "VALIDATION_ERROR")'
cat logs/app.log | jq 'select(.code == "DATABASE_ERROR")'
```

### Search by Log Level

```bash
# Errors and fatals only
cat logs/app.log | jq 'select(.level >= 50)'

# Warnings and above
cat logs/app.log | jq 'select(.level >= 40)'

# Info and above
cat logs/app.log | jq 'select(.level >= 30)'
```

### Search by Time Range

```bash
# Last hour (adjust timestamp)
cat logs/app.log | jq 'select(.time > "2024-01-01T12:00:00")'

# Between timestamps
cat logs/app.log | jq 'select(.time > "2024-01-01T12:00:00" and .time < "2024-01-01T13:00:00")'
```

### Search by Module

```bash
# Database logs only
cat logs/app.log | jq 'select(.module == "database")'

# API logs only
cat logs/app.log | jq 'select(.module == "api")'

# Auth logs only
cat logs/app.log | jq 'select(.module == "auth")'
```

### Performance Analysis

```bash
# Find slow requests (>1000ms)
cat logs/app.log | jq 'select(.duration > 1000)'

# Sort by duration (slowest first)
cat logs/app.log | jq -s 'sort_by(-.duration) | .[0:10]'

# Average response time
cat logs/app.log | jq -s 'map(select(.duration)) | add / length'
```

### Error Statistics

```bash
# Count errors by type
cat logs/app.log | jq -r 'select(.level >= 50) | .code // "unknown"' | sort | uniq -c | sort -rn

# Count by HTTP status
cat logs/app.log | jq -r '.statusCode // empty' | sort | uniq -c | sort -rn

# Errors by endpoint
cat logs/app.log | jq -r 'select(.level >= 50) | .path // empty' | sort | uniq -c | sort -rn
```

### Export for Analysis

```bash
# Export errors to CSV
cat logs/app.log | jq -r 'select(.level >= 50) | [.time, .code, .message, .path] | @csv' > errors.csv

# Export to JSON array
cat logs/app.log | jq -s 'map(select(.level >= 50))' > errors.json
```

## Log Levels Reference

| Level | Value | Description |
|-------|-------|-------------|
| `trace` | 10 | Very detailed debugging |
| `debug` | 20 | Debug information |
| `info` | 30 | Informational messages |
| `warn` | 40 | Warning conditions |
| `error` | 50 | Error conditions |
| `fatal` | 60 | System unusable |

## Common Investigation Workflows

### Workflow 1: User Reports Error

```bash
# 1. Get request ID from user (shown in error response)
REQUEST_ID="abc-123-xyz"

# 2. Find all logs for this request
cat logs/app.log | jq "select(.requestId == \"$REQUEST_ID\")" | bunx pino-pretty

# 3. Look for the error
cat logs/app.log | jq "select(.requestId == \"$REQUEST_ID\" and .level >= 50)"
```

### Workflow 2: Investigate 500 Errors

```bash
# 1. Find all 500 errors
cat logs/app.log | jq 'select(.statusCode == 500)' | bunx pino-pretty

# 2. Group by endpoint
cat logs/app.log | jq -r 'select(.statusCode == 500) | .path' | sort | uniq -c | sort -rn

# 3. Look at specific endpoint
cat logs/app.log | jq 'select(.statusCode == 500 and .path == "/api/courses")' | bunx pino-pretty
```

### Workflow 3: Performance Investigation

```bash
# 1. Find slowest endpoints
cat logs/app.log | jq -s 'map(select(.duration)) | group_by(.path) | map({path: .[0].path, avg: (map(.duration) | add / length)}) | sort_by(-.avg)'

# 2. Look at specific slow endpoint
cat logs/app.log | jq 'select(.path == "/api/courses" and .duration > 500)' | bunx pino-pretty

# 3. Check for database issues
cat logs/app.log | jq 'select(.module == "database" and .duration > 100)'
```

### Workflow 4: Auth Issues

```bash
# 1. Find auth failures
cat logs/app.log | jq 'select(.module == "auth" and .level >= 40)' | bunx pino-pretty

# 2. Check for specific user
cat logs/app.log | jq 'select(.module == "auth" and .userId == "user-123")'

# 3. Look for patterns
cat logs/app.log | jq -r 'select(.code == "AUTHENTICATION_ERROR") | .message' | sort | uniq -c
```

## Environment Variables

```bash
# Set log level
export LOG_LEVEL=debug  # trace, debug, info, warn, error, fatal

# Set service name (appears in logs)
export SERVICE_NAME=devmultiplier-web
```

## Tips

1. **Always include request ID** in support responses
2. **Use jq filters** to narrow down large log files
3. **Combine filters** with `and`/`or` for complex queries
4. **Export suspicious patterns** for trend analysis
5. **Set up alerts** for `fatal` and repeated `error` patterns
