# i18n Check

Find missing translations and validate internationalization consistency.

## Instructions

Scan the codebase to identify missing translations and i18n issues.

### Step 1: Discover Translation Files

```bash
# Find all translation files
find src -name "*.json" -path "*/messages/*" -o -name "*.json" -path "*/i18n/*"

# List available locales
ls src/i18n/messages/
```

### Step 2: Extract Translation Keys

```bash
# Find useTranslations usage
grep -r "useTranslations\|getTranslations" src --include="*.tsx" --include="*.ts" -h | \
  grep -oP "(?<=useTranslations\(['\"]).+?(?=['\"])" | sort -u

# Find t() function calls
grep -rhoP "(?<=\bt\()['\"][^'\"]+['\"]" src --include="*.tsx" --include="*.ts" | \
  tr -d "'" | tr -d '"' | sort -u
```

### Step 3: Compare Locales

```typescript
// Script to check translation completeness
import en from '@/i18n/messages/en.json';
import es from '@/i18n/messages/es.json';

function getAllKeys(obj: object, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null) {
      return getAllKeys(value, fullKey);
    }
    return [fullKey];
  });
}

const enKeys = getAllKeys(en);
const esKeys = getAllKeys(es);

// Missing in Spanish
const missingInEs = enKeys.filter(k => !esKeys.includes(k));
console.log('Missing in es.json:', missingInEs);

// Extra in Spanish (potentially outdated)
const extraInEs = esKeys.filter(k => !enKeys.includes(k));
console.log('Extra in es.json:', extraInEs);
```

### Step 4: Check Database Translations

```sql
-- Find courses without translations for a locale
SELECT c.id, c.slug, ct.locale
FROM "Course" c
LEFT JOIN course_translations ct ON c.id = ct."courseId"
WHERE ct.locale IS NULL OR ct.locale NOT IN ('en', 'es');

-- Find missing translations per locale
SELECT
  'en' as locale,
  COUNT(*) FILTER (WHERE ct.locale = 'en') as has_translation,
  COUNT(*) FILTER (WHERE ct.locale IS NULL OR ct.locale != 'en') as missing
FROM "Course" c
LEFT JOIN course_translations ct ON c.id = ct."courseId";
```

### Step 5: Generate Report

```markdown
## i18n Audit Report

### Translation Files

| Locale | File | Keys | Status |
|--------|------|------|--------|
| en | en.json | 150 | ✅ Base |
| es | es.json | 142 | ⚠️ 8 missing |
| fr | fr.json | 130 | ⚠️ 20 missing |

### Missing Translations

#### Spanish (es.json)
```json
{
  "dashboard.newFeature": "...",
  "courses.enrollNow": "...",
  "errors.sessionExpired": "..."
}
```

#### French (fr.json)
```json
{
  "auth.forgotPassword": "...",
  "dashboard.welcome": "...",
  // ... 18 more
}
```

### Database Content

| Content Type | EN | ES | FR |
|--------------|----|----|-----|
| Courses | 10 | 8 | 5 |
| Modules | 45 | 40 | 25 |
| Lessons | 120 | 100 | 60 |

### Unused Translations

Keys in translation files but not used in code:
- `old.feature.title`
- `deprecated.message`

### Recommendations

1. Add missing keys to es.json and fr.json
2. Remove unused translations
3. Add translations for 2 courses in ES
4. Add translations for 5 courses in FR
```

## Validation Checks

### Key Naming Conventions

```typescript
// ✅ Good key names
"auth.login"
"auth.loginButton"
"dashboard.welcomeMessage"
"errors.validation.emailRequired"

// ❌ Bad key names
"Login"           // Not namespaced
"auth_login"      // Inconsistent separator
"authLoginBtn"    // Inconsistent casing
```

### ICU Message Syntax

```typescript
// ✅ Valid ICU format
"{count, plural, =0 {No items} =1 {1 item} other {# items}}"
"{name} has {count, number} points"

// ❌ Invalid format
"{count} items"   // No plural handling
"Hello {name"     // Unclosed brace
```

### Interpolation Variables

```typescript
// Check that variables match across translations
// en.json
"welcome": "Welcome, {name}!"

// es.json - ✅ Correct
"welcome": "¡Bienvenido, {name}!"

// es.json - ❌ Wrong variable name
"welcome": "¡Bienvenido, {nombre}!"
```

## Automated Checks

### ESLint Plugin

```javascript
// .eslintrc.js
module.exports = {
  plugins: ['i18next'],
  rules: {
    'i18next/no-literal-string': 'warn',
  },
};
```

### Pre-commit Hook

```bash
#!/bin/bash
# .husky/pre-commit

# Check for hardcoded strings in JSX
if grep -r ">[A-Z][a-z]" src --include="*.tsx" | grep -v "className" | grep -v "import"; then
  echo "Warning: Possible hardcoded strings found"
fi
```

## Usage

```bash
# Full i18n audit
/i18n-check

# Check specific locale
/i18n-check es

# Check database translations only
/i18n-check --db

# Generate missing keys template
/i18n-check --generate es
```

## Quick Fixes

### Add Missing Key

```bash
# Add to all locale files
for file in src/i18n/messages/*.json; do
  # Use jq to add key (requires jq installed)
  jq '.namespace.newKey = "TODO: Translate"' "$file" > tmp && mv tmp "$file"
done
```

### Sync Structure

```typescript
// Ensure all locales have same structure as base (en)
function syncLocale(base: object, target: object): object {
  const result = { ...target };
  for (const [key, value] of Object.entries(base)) {
    if (typeof value === 'object') {
      result[key] = syncLocale(value, target[key] || {});
    } else if (!(key in result)) {
      result[key] = `TODO: ${value}`;
    }
  }
  return result;
}
```
