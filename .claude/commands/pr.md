# Pull Request

Create a well-formatted pull request with proper description and checklist.

## Instructions

Create a PR with comprehensive description following team standards.

### Step 1: Gather Information

```bash
# Check current branch
git branch --show-current

# View commits since branching from main
git log main..HEAD --oneline

# View all changes
git diff main...HEAD --stat

# Check if branch is pushed
git status
```

### Step 2: Ensure Branch is Ready

```bash
# Push branch if needed
git push -u origin $(git branch --show-current)

# Ensure up to date with main
git fetch origin main
git rebase origin/main  # or merge
```

### Step 3: Analyze Changes

Categorize the changes:

| Category | Look For |
|----------|----------|
| Features | New files, new exports, new routes |
| Fixes | Bug fixes, error handling |
| Breaking | API changes, schema changes |
| Dependencies | package.json changes |
| Database | prisma/schema.prisma changes |
| Tests | Test files added/modified |

### Step 4: Create PR

```bash
gh pr create --title "<type>(<scope>): <description>" --body "$(cat <<'EOF'
## Summary

<!-- Brief description of what this PR does -->

## Changes

- <!-- List key changes -->
-
-

## Type of Change

- [ ] 🐛 Bug fix (non-breaking change that fixes an issue)
- [ ] ✨ New feature (non-breaking change that adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to change)
- [ ] 📝 Documentation update
- [ ] 🔧 Configuration change
- [ ] ♻️ Refactoring (no functional changes)
- [ ] 🧪 Test update

## Testing

<!-- How was this tested? -->

- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing performed

### Test Instructions

1. <!-- Step to reproduce/test -->
2.
3.

## Screenshots

<!-- If applicable, add screenshots -->

## Checklist

- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code where necessary
- [ ] I have updated documentation as needed
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix/feature works
- [ ] New and existing tests pass locally
- [ ] Any dependent changes have been merged

## Related Issues

<!-- Link related issues -->
Closes #

---
🤖 Generated with [Claude Code](https://claude.ai/code)
EOF
)"
```

## PR Templates by Type

### Feature PR

```markdown
## Summary

Add [feature name] to allow users to [capability].

## Changes

- Add new API endpoint `POST /api/[endpoint]`
- Create `[Component]` for [purpose]
- Update database schema with [changes]
- Add tests for new functionality

## Type of Change

- [ ] ✨ New feature

## Testing

- [x] Unit tests added for [component/function]
- [x] E2E test added for user flow
- [x] Manual testing in development

### Test Instructions

1. Navigate to [page]
2. Click [action]
3. Verify [expected result]
```

### Bug Fix PR

```markdown
## Summary

Fix [issue] that caused [problem] when [condition].

## Root Cause

[Explain what was causing the bug]

## Solution

[Explain how the fix works]

## Changes

- Fix [specific change]
- Add guard for [edge case]
- Update tests to cover scenario

## Type of Change

- [x] 🐛 Bug fix

## Testing

- [x] Added regression test
- [x] Verified fix in development
- [x] Tested edge cases

### Test Instructions

1. [Steps to reproduce the original bug]
2. Verify the bug no longer occurs
3. Verify normal functionality still works
```

### Database Migration PR

```markdown
## Summary

[Describe schema changes]

## Migration Details

### Changes to Schema

```prisma
// Added
model NewModel {
  ...
}

// Modified
model ExistingModel {
  newField String  // Added
}
```

### Migration Steps

1. `bunx prisma migrate dev --name [migration_name]`
2. [Any data migration needed]

## Type of Change

- [x] 💥 Breaking change (requires migration)

## Rollback Plan

[How to rollback if needed]

## Checklist

- [ ] Migration tested locally
- [ ] Migration tested on staging database
- [ ] Backup plan documented
- [ ] Dependent code changes included
```

## Usage

```bash
# Create PR interactively
/pr

# Create PR with title
/pr add user enrollment feature

# Create draft PR
/pr --draft
```

## Post-Creation Checklist

```markdown
- [ ] PR created successfully
- [ ] Reviewers assigned
- [ ] Labels added
- [ ] Linked to project board
- [ ] CI checks passing
```
