# Playwright Setup - Prerequisites & Configuration

## ✅ Installation Status

| Component            | Status        | Version       |
| -------------------- | ------------- | ------------- |
| @playwright/test     | ✅ Installed  | 1.57.0        |
| Node.js              | ✅ Available  | 22+           |
| Bun                  | ✅ Configured | 1.3.5+        |
| playwright.config.ts | ✅ Created    | Latest        |
| E2E Test Files       | ✅ Created    | 5 test suites |

## System Requirements

✅ **All requirements are met:**

### Runtime

- Node.js 22+ (or Bun 1.3.5+)
- ~500MB disk space for browser binaries (auto-installed on first run)

### Browsers

Playwright will automatically download these on first run:

- Chromium (latest)
- Firefox (latest)
- WebKit/Safari (latest)

### Network

- localhost:3000 should be available (dev server port)
- No special firewall rules needed

## Configuration Files

### 1. playwright.config.ts ✅

- Configures test environment
- Sets base URL to http://localhost:3000
- Runs on Chromium, Firefox, WebKit
- Includes mobile device profiles
- Auto-starts dev server before tests

### 2. E2E Tests ✅

Ready-to-run test files:

- `e2e/homepage.spec.ts` - Homepage tests
- `e2e/auth.spec.ts` - Authentication pages
- `e2e/navigation.spec.ts` - Course & main pages
- `e2e/legal.spec.ts` - Legal pages & redirects
- `e2e/accessibility.spec.ts` - Accessibility checks

### 3. Package Scripts ✅

Added to package.json:

```json
"e2e": "playwright test",
"e2e:ui": "playwright test --ui",
"e2e:debug": "playwright test --debug",
"e2e:headed": "playwright test --headed"
```

## Initial Setup (First Time Only)

When you run E2E tests for the first time:

```bash
bun run e2e
```

This will:

1. ✅ Download browser binaries (~500MB total)
2. ✅ Start Next.js dev server automatically
3. ✅ Run all tests
4. ✅ Generate HTML report

**Estimated time: 2-5 minutes on first run**

## Quick Start

### 1. Run all tests (headless)

```bash
bun run e2e
```

### 2. Run tests with visual UI

```bash
bun run e2e:ui
```

### 3. Debug a specific test

```bash
bun run e2e:debug
```

## Port Requirements

The following ports must be available:

- **3000** - Next.js dev server (auto-started)
- Dev server will be killed after tests complete

If port 3000 is in use:

```bash
# Find what's using it
lsof -i :3000

# Kill if needed
kill -9 <PID>
```

## Environment Variables

No special environment variables needed. Tests use:

- `baseURL: http://localhost:3000` from playwright.config.ts
- `.env.local` is automatically loaded by Next.js

## Browser Binaries

First-time setup downloads:

- Chromium (~160MB)
- Firefox (~100MB)
- WebKit (~150MB)

**Location:** `~/.cache/ms-playwright/`

To reinstall browsers:

```bash
bunx playwright install
```

To clean up browser cache:

```bash
bunx playwright uninstall
```

## Dependencies

All required packages are installed:

```bash
bun install  # Already includes @playwright/test
```

No additional setup needed!

## Verification Checklist

Run this to verify setup:

```bash
# Check Playwright version
bunx playwright --version

# Check if browsers are installed
bunx playwright install

# Run a quick smoke test
bun run e2e -- e2e/homepage.spec.ts
```

## Troubleshooting

### "DevServer didn't start"

- Ensure port 3000 is available
- Check that Next.js can start with `bun run dev`

### "Browser not found"

```bash
bunx playwright install --with-deps
```

### "Timeout errors"

- Increase timeout in playwright.config.ts or individual tests
- Check internet connection (first run downloads browsers)

### "Tests still fail after setup"

```bash
# Clear all caches and reinstall
bun clean
rm -rf .next e2e/.test-results
bun install
bunx playwright install --with-deps
bun run e2e
```

## Next Steps

1. ✅ Run initial test: `bun run e2e`
2. ✅ View HTML report: `bunx playwright show-report`
3. ✅ Add more tests as needed
4. ✅ Integrate into CI/CD pipeline
5. ✅ Set up test runs on PR submissions

## Documentation

- Full guide: [PLAYWRIGHT.md](./PLAYWRIGHT.md)
- Unit tests: [TESTING.md](./TESTING.md)
- Playwright docs: https://playwright.dev

## Support

For issues:

1. Check [Playwright troubleshooting](https://playwright.dev/docs/troubleshooting)
2. Review test output with `bunx playwright show-report`
3. Run with debug mode: `bun run e2e:debug`
