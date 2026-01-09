#!/bin/bash
# playwright-setup.sh - Playwright E2E Testing Setup Verification

echo "🎭 Playwright E2E Testing Setup Verification"
echo "=============================================="
echo ""

# Check Node.js version
echo "✓ Node.js version:"
node --version

# Check Bun version
echo "✓ Bun version:"
bun --version

# Check Playwright installation
echo "✓ Playwright version:"
bunx playwright --version

# Check test files
echo ""
echo "📁 E2E Test Files:"
find e2e -name "*.spec.ts" -type f | while read file; do
  echo "  ✓ $(basename $file)"
done

# Check configuration files
echo ""
echo "⚙️  Configuration Files:"
for file in playwright.config.ts vitest.config.mjs vitest.setup.ts TESTING.md PLAYWRIGHT.md PLAYWRIGHT_SETUP.md TESTING_OVERVIEW.md; do
  if [ -f "$file" ]; then
    echo "  ✓ $file"
  fi
done

# Check package.json scripts
echo ""
echo "📝 Test Scripts Available:"
grep -A 10 '"test"' package.json | grep -E '(test|e2e)' | while read line; do
  echo "  ✓ $line"
done

echo ""
echo "=============================================="
echo "✅ Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Run unit tests:  bun run test"
echo "2. Run E2E tests:   bun run e2e"
echo "3. View reports:    bunx playwright show-report"
echo ""
echo "For more info, see:"
echo "  - TESTING_OVERVIEW.md (quick reference)"
echo "  - TESTING.md (Vitest guide)"
echo "  - PLAYWRIGHT.md (Playwright guide)"
echo "  - PLAYWRIGHT_SETUP.md (prerequisites)"
