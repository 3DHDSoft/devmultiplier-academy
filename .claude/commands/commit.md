# Commit

Create a well-formatted git commit following conventional commit standards.

## Instructions

Create a commit with proper conventional commit format and scope detection.

### Step 1: Analyze Changes

```bash
# View staged changes
git diff --cached

# View unstaged changes (remind to stage)
git diff

# View untracked files
git status
```

### Step 2: Determine Commit Type

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | Adding course enrollment |
| `fix` | Bug fix | Fixing login redirect |
| `docs` | Documentation | Updating README |
| `style` | Formatting (no code change) | Fixing indentation |
| `refactor` | Code restructuring | Extracting utility function |
| `perf` | Performance improvement | Optimizing database query |
| `test` | Adding/updating tests | Adding unit tests |
| `build` | Build system changes | Updating dependencies |
| `ci` | CI/CD changes | Updating GitHub Actions |
| `chore` | Maintenance | Cleaning up files |

### Step 3: Detect Scope

Automatically detect scope from changed files:

| Path Pattern | Scope |
|--------------|-------|
| `src/app/api/**` | `api` |
| `src/app/(auth)/**` | `auth` |
| `src/app/(protected)/dashboard/**` | `dashboard` |
| `src/components/ui/**` | `ui` |
| `src/components/layout/**` | `layout` |
| `src/lib/**` | `lib` |
| `prisma/**` | `db` |
| `e2e/**` | `e2e` |
| `src/**/__tests__/**` | `test` |
| `.github/**` | `ci` |
| `docs/**` | `docs` |

### Step 4: Write Commit Message

Format:
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Rules:
- **Description**: Imperative mood, lowercase, no period
- **Body**: Explain what and why (not how)
- **Footer**: Reference issues, breaking changes

### Step 5: Create Commit

```bash
git add <files>
git commit -m "$(cat <<'EOF'
<type>(<scope>): <description>

<body>

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

## Examples

### Feature Commit
```bash
git commit -m "$(cat <<'EOF'
feat(api): add course enrollment endpoint

Implement POST /api/enrollments to allow users to enroll in courses.
Includes validation, duplicate checking, and progress initialization.

Closes #123

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

### Bug Fix Commit
```bash
git commit -m "$(cat <<'EOF'
fix(auth): resolve session expiration redirect loop

Users were getting stuck in a redirect loop when their session expired
while on a protected page. Now properly redirects to login with callback URL.

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

### Refactor Commit
```bash
git commit -m "$(cat <<'EOF'
refactor(lib): extract validation schemas to separate module

Move Zod schemas from API routes to shared validation module
for reuse across routes and client-side forms.

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

### Breaking Change
```bash
git commit -m "$(cat <<'EOF'
feat(api)!: change enrollment response format

BREAKING CHANGE: Enrollment API now returns nested course object
instead of flat structure. Update client code accordingly.

Migration: Update API consumers to access course.title instead of courseTitle

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

## Pre-Commit Checklist

```markdown
- [ ] Changes are staged (`git add`)
- [ ] No unintended files included
- [ ] Type correctly identifies the change
- [ ] Scope matches the primary area changed
- [ ] Description is clear and concise
- [ ] Body explains why (if not obvious)
- [ ] No secrets or sensitive data
- [ ] Tests pass (if applicable)
```

## Usage

```bash
# Stage changes and commit with guidance
/commit

# Commit with specific message
/commit fix login redirect issue

# Amend previous commit (use carefully)
/commit --amend
```
