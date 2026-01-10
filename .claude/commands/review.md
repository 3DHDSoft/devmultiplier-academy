# Code Review

Review code changes for quality, security, and adherence to project standards.

## Instructions

You are performing a code review. Analyze the changes thoroughly and provide actionable feedback.

### Step 1: Gather Context

First, understand what's being reviewed:

```bash
# If reviewing staged changes
git diff --cached

# If reviewing unstaged changes
git diff

# If reviewing a specific branch against main
git diff main...HEAD

# If reviewing a PR (replace NUMBER with PR number)
gh pr diff NUMBER
```

### Step 2: Review Checklist

Evaluate the code against these criteria:

#### Correctness
- [ ] Logic is correct and handles edge cases
- [ ] No obvious bugs or regressions
- [ ] Error handling is appropriate
- [ ] Async operations are properly awaited

#### TypeScript & Type Safety
- [ ] No `any` types without justification
- [ ] Proper null/undefined handling
- [ ] Types are accurate and not overly broad
- [ ] Uses `@/` path alias for imports

#### Security (CRITICAL)
- [ ] No hardcoded secrets or credentials
- [ ] User input is validated (Zod schemas)
- [ ] No SQL injection vulnerabilities (Prisma handles this)
- [ ] No XSS vulnerabilities in rendered content
- [ ] Authentication checks on protected routes
- [ ] Proper authorization (users can only access their data)

#### Performance
- [ ] No N+1 query patterns
- [ ] Appropriate use of `include` in Prisma queries
- [ ] No unnecessary re-renders in React components
- [ ] Large lists use pagination

#### Code Quality
- [ ] Follows existing patterns in the codebase
- [ ] DRY - no unnecessary duplication
- [ ] Functions are focused and not too long
- [ ] Variable/function names are descriptive
- [ ] No commented-out code

#### Testing
- [ ] New functionality has tests
- [ ] Tests cover happy path and error cases
- [ ] No skipped tests without explanation

#### Next.js & React Patterns
- [ ] Server vs Client components used appropriately
- [ ] `'use client'` only where necessary
- [ ] API routes follow REST conventions
- [ ] Proper use of Server Actions if applicable

### Step 3: Provide Feedback

Structure your review as follows:

```markdown
## Code Review Summary

### Overview
[1-2 sentence summary of what the changes do]

### Severity Levels
- 🔴 **Critical**: Must fix before merge (security, data loss, crashes)
- 🟠 **Major**: Should fix (bugs, significant issues)
- 🟡 **Minor**: Nice to fix (code quality, style)
- 🟢 **Suggestion**: Optional improvements

### Findings

#### 🔴 Critical Issues
[List any critical issues, or "None found"]

#### 🟠 Major Issues
[List any major issues, or "None found"]

#### 🟡 Minor Issues
[List any minor issues]

#### 🟢 Suggestions
[Optional improvements]

### What's Good
[Highlight positive aspects of the code]

### Verdict
- [ ] ✅ **Approve** - Ready to merge
- [ ] 🔄 **Request Changes** - Issues must be addressed
- [ ] 💬 **Comment** - Feedback provided, author decides
```

### Step 4: Validate Changes Work

If appropriate, run these checks:

```bash
# Type checking
bun run type-check

# Linting
bun run lint

# Tests
bun test

# Build (catches additional issues)
bun run build
```

## Usage Examples

```bash
# Review staged changes
/review

# Review with specific focus
/review security    # Focus on security aspects
/review performance # Focus on performance
/review typescript  # Focus on type safety

# Review a PR
/review pr 123
```

## Project-Specific Checks

For this Next.js project, also verify:

1. **Prisma Changes**: If `schema.prisma` changed, ensure migrations are handled
2. **API Routes**: Check authentication in `src/app/api/` routes
3. **Protected Routes**: Verify middleware handles new protected paths
4. **i18n**: Translation keys exist for user-facing strings
5. **Environment Variables**: New env vars documented in `.env.example`
