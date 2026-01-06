# Claude Code vs GitHub Copilot Configuration

A comprehensive guide for migrating from GitHub Copilot to Claude Code's configuration system.

## Feature Comparison Table

| Feature | GitHub Copilot | Claude Code |
|---------|---------------|-------------|
| **Instructions** | `.github/instructions/*.md` | `CLAUDE.md` or `.claude/CLAUDE.md` |
| **Scoped rules** | `applyTo: '**/*.md'` frontmatter | `.claude/rules/*.md` directory |
| **Agents** | Agent mode / Chat participants | **Subagents** (`.claude/agents/*.md`) |
| **Prompts** | Prompt files | **Slash Commands** (`.claude/commands/*.md`) |
| **Skills** | N/A | **Skills** (`.claude/skills/`) |
| **Output Styles** | N/A | **Output Styles** (`.claude/output-styles/*.md`) |
| **Personal config** | User settings | `~/.claude/CLAUDE.md` |
| **Local overrides** | N/A | `CLAUDE.local.md` (git-ignored) |
| **Enterprise policy** | N/A | System-level `CLAUDE.md` |

## Claude Code Memory Hierarchy

Claude Code uses a hierarchical memory system where files higher in the hierarchy take precedence:

| Memory Type | Location | Purpose | Shared With |
|-------------|----------|---------|-------------|
| **Enterprise policy** | System paths* | Organization-wide standards | All users |
| **Project memory** | `./CLAUDE.md` | Team-shared instructions | Team via source control |
| **User memory** | `~/.claude/CLAUDE.md` | Personal preferences | Just you (all projects) |
| **Project local** | `./CLAUDE.local.md` | Personal project-specific | Just you (current project) |

*Enterprise paths:
- macOS: `/Library/Application Support/ClaudeCode/CLAUDE.md`
- Linux: `/etc/claude-code/CLAUDE.md`
- Windows: `C:\Program Files\ClaudeCode\CLAUDE.md`

## Setting Up Claude Code Instructions

### Option 1: Direct CLAUDE.md (Recommended)

Place your instructions in the project root or `.claude/` directory:

```
📁 your-project/
├── 📝 CLAUDE.md                    # Main instructions
├── 📝 CLAUDE.local.md              # Personal overrides (auto git-ignored)
└── 📁 .claude/
    └── 📁 rules/
        ├── 📝 markdown.md          # Markdown conventions
        ├── 📝 code-style.md        # Code standards
        └── 📝 testing.md           # Testing requirements
```

### Option 2: Import Existing Files

In your `CLAUDE.md`, use the `@path/to/file` syntax to import existing instruction files:

```markdown
# Project Instructions

## Imported Rules
@.github/instructions/markdown_instructions.md
@.github/instructions/typescript_instructions.md

## Additional Context
- See @README.md for project overview
- See @package.json for available commands
```

### Option 3: Bootstrap with /init

Run the `/init` command in Claude Code to auto-generate a `CLAUDE.md` based on your project structure, then merge in your custom instructions.

```bash
# In your project directory
claude
/init
```

## Migration Steps

### Step 1: Create the Claude Code structure

```bash
mkdir -p .claude/rules
touch CLAUDE.md
touch CLAUDE.local.md
```

### Step 2: Convert instruction files

**From GitHub Copilot format:**

```markdown
---
description: 'Documentation Standards'
applyTo: '**/*.md'
---

## Markdown Content Rules
1. Use appropriate heading levels...
```

**To Claude Code format (`.claude/rules/markdown.md`):**

```markdown
# Markdown Documentation Standards

## Scope
These rules apply when working with Markdown files (`*.md`).

## Content Rules
- Use appropriate heading levels (H2, H3, etc.)
- Do not use H1 headings (generated from title)
- Use fenced code blocks with language specification
...
```

### Step 3: Create main CLAUDE.md

```markdown
# Project: Your Project Name

## Overview
Brief description of the project.

## Tech Stack
- Frontend: Next.js 15, TypeScript, Tailwind CSS
- Database: PostgreSQL 18, SQL Server 2025

## Commands
- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun test` - Run tests

## Code Standards
See `.claude/rules/` for detailed guidelines:
- @.claude/rules/markdown.md
- @.claude/rules/code-style.md
- @.claude/rules/testing.md

## Project Structure
- `/src` - Source code
- `/docs` - Documentation
- `/tests` - Test files
```

## Key Differences

### Scoping Rules

**GitHub Copilot** uses frontmatter to scope rules:
```yaml
---
applyTo: '**/*.md'
---
```

**Claude Code** uses directory structure and file naming:
```
.claude/rules/
├── markdown.md      # Markdown-specific rules
├── typescript.md    # TypeScript-specific rules
└── testing.md       # Testing-specific rules
```

### Dynamic Loading

Claude Code discovers `CLAUDE.md` files recursively:
- Starts from current working directory
- Recurses up to (but not including) root `/`
- Nested `CLAUDE.md` files in subdirectories are loaded when Claude reads files in those subtrees

### Quick Memory Addition

Use the `#` shortcut to quickly add memories during a session:

```
# Always use descriptive variable names
```

You'll be prompted to select which memory file to store this in.

## Best Practices

1. **Be specific**: "Use 2-space indentation" is better than "Format code properly"
2. **Use structure**: Group related memories under descriptive markdown headings
3. **Keep it concise**: Write for Claude, not for onboarding a junior dev
4. **Review periodically**: Update memories as your project evolves
5. **Use imports**: Reference existing docs with `@path/to/file` syntax

## Resources

- [Claude Code Memory Documentation](https://code.claude.com/docs/en/memory)
- [Claude Code Subagents Documentation](https://code.claude.com/docs/en/sub-agents)
- [Claude Code VS Code Extension](https://marketplace.visualstudio.com/items?itemName=anthropic.claude-code)
- [Using CLAUDE.md Files (Anthropic Blog)](https://claude.com/blog/using-claude-md-files)
- [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)

---

## Subagents (Custom Agents)

Subagents are specialized AI assistants that Claude Code can delegate tasks to. Each subagent has its own context window, system prompt, and tool access.

### Location

```
📁 ~/.claude/agents/           # User-level agents (all projects)
📁 .claude/agents/             # Project-level agents (team-shared)
```

### Agent File Format

```markdown
---
name: backend-architect
description: Use this agent for backend system design, API architecture, and database schema decisions
tools: Bash, Read, Write, Edit
model: sonnet                  # Options: sonnet, opus, haiku, or 'inherit'
permissionMode: default
color: blue
---

You are a backend architecture specialist. Your responsibilities:

1. Design scalable API architectures
2. Review database schemas for performance
3. Recommend appropriate design patterns
4. Ensure security best practices

When analyzing code:
- Check for N+1 query problems
- Validate proper error handling
- Ensure consistent naming conventions
```

### Built-in Subagents

| Subagent | Purpose |
|----------|---------|
| **Plan** | Creates detailed implementation plans (used in plan mode) |
| **Explore** | Fast, read-only codebase scanning and analysis |
| **Task** | General-purpose task execution |

### Creating Custom Agents

```bash
# Use the /agents command
/agents

# Or ask Claude to create one
"Create a subagent for database migrations that specializes in PostgreSQL"
```

---

## Slash Commands (Custom Prompts)

Slash commands are reusable prompt templates invoked with `/command-name`.

### Location

```
📁 ~/.claude/commands/         # User-level commands (all projects)
📁 .claude/commands/           # Project-level commands (team-shared)
```

### Command File Format

Create a markdown file named after the command (e.g., `review.md` for `/review`):

```markdown
# .claude/commands/review.md

Perform a comprehensive code review of $ARGUMENTS:

1. Check for bugs and security issues
2. Evaluate performance implications
3. Verify error handling
4. Assess test coverage
5. Review naming conventions
6. Check documentation

Provide actionable feedback with specific line references.
```

### Using Variables

| Variable | Description |
|----------|-------------|
| `$ARGUMENTS` | Text passed after the command |
| `$FILE` | Current file path |
| `$SELECTION` | Currently selected text |

### Example Commands

**`/test` - Generate tests:**
```markdown
# .claude/commands/test.md

Generate comprehensive tests for $ARGUMENTS:

- Unit tests for all public functions
- Edge cases and error conditions
- Use the project's testing framework
- Follow existing test patterns in the codebase
```

**`/explain` - Explain code:**
```markdown
# .claude/commands/explain.md

Explain the following code in detail:

$ARGUMENTS

Include:
1. What the code does
2. How it works step-by-step
3. Any potential issues or improvements
```

**`/migrate` - Database migration:**
```markdown
# .claude/commands/migrate.md

Create a database migration for: $ARGUMENTS

Requirements:
- Use the project's migration framework
- Include both up and down migrations
- Add appropriate indexes
- Consider data preservation
```

---

## Skills (Auto-Discovered Capabilities)

Skills are structured capabilities that Claude automatically applies when relevant to the task.

### Location

```
📁 .claude/skills/             # Project-level skills
```

### Skill Structure

```
📁 .claude/skills/
└── 📁 database-optimization/
    ├── 📝 SKILL.md            # Main skill definition
    ├── 📝 patterns.md         # Reference patterns
    └── 📝 examples/
        ├── 📝 query-optimization.sql
        └── 📝 index-strategies.md
```

### Skill File Format

```markdown
# .claude/skills/database-optimization/SKILL.md

---
name: database-optimization
description: PostgreSQL and SQL Server query optimization patterns
triggers:
  - "optimize query"
  - "slow query"
  - "database performance"
---

## Database Optimization Skill

When optimizing database queries:

1. **Analyze the execution plan** first
2. **Check for missing indexes** on WHERE and JOIN columns
3. **Look for N+1 patterns** in application code
4. **Consider query restructuring** before adding indexes

### Reference Files
- @patterns.md for common optimization patterns
- @examples/query-optimization.sql for examples
```

### Skills vs Slash Commands

| Aspect | Skills | Slash Commands |
|--------|--------|----------------|
| Invocation | Auto-applied when relevant | Manual `/command` |
| Structure | Directory with supporting files | Single markdown file |
| Use case | Complex, multi-file workflows | Simple, repeatable prompts |
| Discovery | Automatic based on task | Terminal autocomplete |

---

## Output Styles (Response Formatting)

Output styles customize how Claude responds based on the type of work.

### Location

```
📁 ~/.claude/output-styles/    # User-level styles
📁 .claude/output-styles/      # Project-level styles
```

### Output Style Format

```markdown
# .claude/output-styles/technical-writer.md

---
name: technical-writer
description: Clear, structured documentation with examples
---

You are a technical documentation specialist. When responding:

1. Use clear, concise language
2. Structure content with headers and lists
3. Include code examples for every concept
4. Add "Note:" callouts for important information
5. End with a "Summary" section

Avoid:
- Jargon without explanation
- Walls of text
- Assumptions about prior knowledge
```

### Example Output Styles

**`code-reviewer.md`:**
```markdown
---
name: code-reviewer
description: Thorough code review with actionable feedback
---

For every code review:

1. Start with a brief summary (1-2 sentences)
2. List issues by severity: 🔴 Critical, 🟡 Warning, 🔵 Suggestion
3. Provide specific line references
4. Include corrected code snippets
5. End with overall assessment (1-10 rating)
```

**`brainstorm.md`:**
```markdown
---
name: brainstorm
description: Creative, exploratory ideation mode
---

When brainstorming:

1. Generate multiple diverse options (aim for 5+)
2. Don't self-censor early ideas
3. Build on each idea with variations
4. Highlight unexpected connections
5. End with top 3 recommendations and why
```

---

## Complete Project Structure

```
📁 your-project/
├── 📝 CLAUDE.md                      # Main project instructions
├── 📝 CLAUDE.local.md                # Personal overrides (git-ignored)
└── 📁 .claude/
    ├── 📝 CLAUDE.md                  # Alternative location
    ├── 📁 rules/
    │   ├── 📝 markdown.md            # Markdown conventions
    │   ├── 📝 typescript.md          # TypeScript standards
    │   └── 📝 testing.md             # Testing requirements
    ├── 📁 commands/
    │   ├── 📝 review.md              # /review command
    │   ├── 📝 test.md                # /test command
    │   └── 📝 migrate.md             # /migrate command
    ├── 📁 agents/
    │   ├── 📝 backend-architect.md   # Backend specialist
    │   ├── 📝 frontend-expert.md     # Frontend specialist
    │   └── 📝 dba.md                 # Database administrator
    ├── 📁 skills/
    │   └── 📁 database-optimization/
    │       ├── 📝 SKILL.md
    │       └── 📝 patterns.md
    └── 📁 output-styles/
        ├── 📝 technical-writer.md
        └── 📝 code-reviewer.md
```

---

## Quick Reference Commands

| Command | Purpose |
|---------|---------|
| `/init` | Bootstrap CLAUDE.md from project |
| `/memory` | Edit memory files directly |
| `/agents` | Manage subagents |
| `/mcp` | Manage MCP server connections |
| `/compact` | Compress conversation history |
| `#` | Quick-add to memory |

---

*DevMultiplier Academy - AI-Assisted Development Configuration Standards*
