# Translation Sync Skill

Synchronize translations across locales and find missing translations.

## Description

This skill manages internationalization by syncing translation files, finding missing keys, and generating translation templates for new content.

## Triggers

Activate this skill when:
- User asks to "sync translations"
- User asks to "find missing translations"
- User asks to "add translation for [locale]"
- User mentions "i18n" or "localization" issues

## Instructions

### Step 1: Analyze Current State

```bash
# Find all translation files
find src -path "*/messages/*.json" -o -path "*/i18n/*.json"

# Count keys per locale
for file in src/i18n/messages/*.json; do
  locale=$(basename "$file" .json)
  count=$(jq 'paths | length' "$file")
  echo "$locale: $count keys"
done
```

### Step 2: Extract All Keys from Base Locale

```typescript
// Script: scripts/extract-i18n-keys.ts
import en from '@/i18n/messages/en.json';

function getAllKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return getAllKeys(value as Record<string, unknown>, fullKey);
    }
    return [fullKey];
  });
}

const keys = getAllKeys(en);
console.log(`Total keys: ${keys.length}`);
keys.forEach(key => console.log(key));
```

### Step 3: Compare Locales

```typescript
// Script: scripts/compare-locales.ts
import en from '@/i18n/messages/en.json';
import es from '@/i18n/messages/es.json';
import fr from '@/i18n/messages/fr.json';

const locales = { en, es, fr };
const baseKeys = getAllKeys(en);

function getKey(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((o, k) => (o as Record<string, unknown>)?.[k], obj);
}

// Find missing translations
Object.entries(locales).forEach(([locale, messages]) => {
  if (locale === 'en') return;

  const missing = baseKeys.filter(key => getKey(messages, key) === undefined);
  const extra = getAllKeys(messages).filter(key => !baseKeys.includes(key));

  console.log(`\n${locale.toUpperCase()}:`);
  console.log(`  Missing: ${missing.length}`);
  missing.forEach(k => console.log(`    - ${k}`));
  console.log(`  Extra: ${extra.length}`);
  extra.forEach(k => console.log(`    + ${k}`));
});
```

### Step 4: Generate Translation Template

```typescript
// Generate template for missing translations
function generateTemplate(
  baseMessages: Record<string, unknown>,
  targetMessages: Record<string, unknown>,
  prefix = ''
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(baseMessages)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const nested = generateTemplate(
        value as Record<string, unknown>,
        (targetMessages[key] as Record<string, unknown>) || {},
        fullKey
      );
      if (Object.keys(nested).length > 0) {
        result[key] = nested;
      }
    } else if (!(key in targetMessages)) {
      // Mark as needing translation
      result[key] = `TODO: ${value}`;
    }
  }

  return result;
}

const missingEs = generateTemplate(en, es);
console.log(JSON.stringify(missingEs, null, 2));
```

### Step 5: Sync Database Translations

```sql
-- Find content without translations
SELECT
  c.id,
  c.slug,
  ct.locale,
  CASE WHEN ct.id IS NULL THEN 'MISSING' ELSE 'EXISTS' END as status
FROM "Course" c
CROSS JOIN (VALUES ('en'), ('es'), ('fr')) AS locales(locale)
LEFT JOIN course_translations ct
  ON c.id = ct."courseId" AND ct.locale = locales.locale
WHERE ct.id IS NULL
ORDER BY c.slug, locales.locale;
```

```typescript
// Generate missing database translations
async function findMissingDbTranslations() {
  const locales = ['en', 'es', 'fr'];

  // Courses
  const courses = await prisma.course.findMany({
    include: { course_translations: true },
  });

  const missingCourses = courses.flatMap(course => {
    const existingLocales = course.course_translations.map(t => t.locale);
    return locales
      .filter(l => !existingLocales.includes(l))
      .map(locale => ({
        type: 'course',
        id: course.id,
        slug: course.slug,
        missingLocale: locale,
      }));
  });

  // Similar for modules and lessons...

  return missingCourses;
}
```

### Step 6: Apply Translations

```typescript
// Merge translations into target file
function mergeTranslations(
  target: Record<string, unknown>,
  additions: Record<string, unknown>
): Record<string, unknown> {
  const result = { ...target };

  for (const [key, value] of Object.entries(additions)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      result[key] = mergeTranslations(
        (result[key] as Record<string, unknown>) || {},
        value as Record<string, unknown>
      );
    } else if (!(key in result)) {
      result[key] = value;
    }
  }

  return result;
}
```

## Output Format

```markdown
## Translation Sync Report

### Summary

| Locale | Total Keys | Complete | Missing | Extra |
|--------|------------|----------|---------|-------|
| en | 150 | 150 (100%) | 0 | 0 |
| es | 142 | 142 (95%) | 8 | 0 |
| fr | 130 | 130 (87%) | 20 | 0 |

### Missing Translations

#### Spanish (es.json) - 8 missing

```json
{
  "dashboard": {
    "newFeature": "TODO: New Feature",
    "analytics": "TODO: Analytics"
  },
  "courses": {
    "enrollNow": "TODO: Enroll Now"
  }
}
```

#### French (fr.json) - 20 missing

<details>
<summary>View all missing keys</summary>

```json
{
  "auth": {
    "forgotPassword": "TODO: Forgot Password?",
    "resetPassword": "TODO: Reset Password"
  },
  // ... more
}
```

</details>

### Database Content

| Content | EN | ES | FR |
|---------|----|----|-----|
| Courses | 10/10 | 8/10 | 5/10 |
| Modules | 45/45 | 40/45 | 25/45 |
| Lessons | 120/120 | 100/120 | 60/120 |

### Generated Files

| File | Action |
|------|--------|
| `es-missing.json` | Template for Spanish |
| `fr-missing.json` | Template for French |

### Next Steps

1. [ ] Translate keys in `es-missing.json`
2. [ ] Translate keys in `fr-missing.json`
3. [ ] Run `/i18n-check` to verify
4. [ ] Create database content for missing locales
```

## Tools Available

- `Read` - View translation files
- `Write` - Update/create translation files
- `Bash` - Run analysis scripts
- `Grep` - Find translation usage in code
