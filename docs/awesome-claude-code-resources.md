# Awesome Claude Code Resources

A curated collection of community resources, agents, commands, skills, and configurations for Claude Code.

---

## 📚 Main Awesome Lists

| Repository                                                                              | Description                                                                             | Stars |
| --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ----- |
| [hesreallyhim/awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code) | **The definitive awesome list** - slash commands, CLAUDE.md files, CLI tools, workflows | 18k+  |
| [awesomeclaude.ai](https://awesomeclaude.ai/awesome-claude-code)                        | Visual directory of awesome-claude-code with search                                     | -     |
| [claudelog.com](https://claudelog.com/)                                                 | Documentation, guides, tutorials & best practices                                       | -     |

---

## 🤖 Subagent Collections

### Mega Collections

```bash
# 100+ agent mega-collection
git clone https://github.com/0xfurai/claude-code-subagents.git ~/.claude/agents/mega-pack

# Production-ready 48-agent collection
git clone https://github.com/wshobson/agents ~/.claude/agents/wh-production

# AI development team (26 agents)
git clone https://github.com/vijaythecoder/awesome-claude-agents ~/.claude/agents/ai-team

# Comprehensive collection (36 agents)
git clone https://github.com/davepoon/claude-code-subagents-collection ~/.claude/agents/comprehensive

# VoltAgent's 100+ specialized agents
git clone https://github.com/VoltAgent/awesome-claude-code-subagents ~/.claude/agents/voltagent
```

### Individual Repositories

| Repository                                                                                            | Description                                           |
| ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| [wshobson/agents](https://github.com/wshobson/agents)                                                 | Production-ready 48-agent collection with CLI manager |
| [davepoon/buildwithclaude](https://github.com/davepoon/buildwithclaude)                               | Skills, agents, commands, hooks, plugins marketplace  |
| [rahulvrane/awesome-claude-agents](https://github.com/rahulvrane/awesome-claude-agents)               | Collection with installation guides                   |
| [VoltAgent/awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents) | 100+ specialized agents by category                   |
| [buildwithclaude.com](https://www.buildwithclaude.com/)                                               | Web UI to browse and install agents/commands          |

---

## ⚡ Slash Commands Collections

| Repository                                                                                                                            | Description                                       |
| ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| [wshobson/commands](https://github.com/wshobson/commands)                                                                             | Production-ready commands (workflows + tools)     |
| [kingler/n8n_agent](https://github.com/kingler/n8n_agent/tree/main/.claude/commands)                                                  | Code analysis, QA, design, documentation commands |
| [danielrosehill/Claude-Code-Linux-Desktop-Slash-Commands](https://github.com/danielrosehill/Claude-Code-Linux-Desktop-Slash-Commands) | Linux desktop operations                          |

### Quick Install Commands

```bash
# Install wshobson's commands
git clone https://github.com/wshobson/commands.git
cp commands/tools/*.md ~/.claude/commands/
cp commands/workflows/*.md ~/.claude/commands/
```

---

## 📄 CLAUDE.md Examples

| Repository                                                                                                          | Description                  |
| ------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| [basicmachines-co/basic-memory](https://github.com/basicmachines-co/basic-memory/blob/main/CLAUDE.md)               | Comprehensive project memory |
| [grahama1970/claude-code-mcp-enhanced](https://github.com/grahama1970/claude-code-mcp-enhanced/blob/main/CLAUDE.md) | Detailed agent instructions  |
| [Family-IT-Guy/perplexity-mcp](https://github.com/Family-IT-Guy/perplexity-mcp/blob/main/CLAUDE.md)                 | MCP setup documentation      |

---

## 🎨 Output Styles

| Repository                                                                        | Description                                                     |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| [feiskyer/claude-code-settings](https://github.com/feiskyer/claude-code-settings) | Complete settings including output styles                       |
| [YACCO](https://github.com/path-to-yacco)                                         | Yet Another Claude Orchestrator - one of few with Output Styles |

---

## 🛠️ Skills & Plugins

| Repository                                                              | Description                              |
| ----------------------------------------------------------------------- | ---------------------------------------- |
| [anthropics/skills](https://github.com/anthropics/skills)               | **Official** Anthropic skills collection |
| [davepoon/buildwithclaude](https://github.com/davepoon/buildwithclaude) | Marketplace with CLI: `bwc-cli`          |

### Install Skills via CLI

```bash
# Install the marketplace CLI
bun install -g bwc-cli

# Initialize configuration
bwc init

# Add agents or commands
bwc add --agent python-pro
bwc add --command dockerize

# Browse interactively
bwc add
```

---

## ⚙️ Complete Configuration Sets

| Repository                                                                                                    | Description                                         |
| ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| [feiskyer/claude-code-settings](https://github.com/feiskyer/claude-code-settings)                             | Complete settings, commands, agents for vibe coding |
| [peterkrueck/Claude-Code-Development-Kit](https://github.com/peterkrueck/Claude-Code-Development-Kit)         | Professional dev environment                        |
| [OneRedOak/claude-code-workflows](https://github.com/OneRedOak/claude-code-workflows/tree/main/design-review) | UI/UX design review workflow                        |

---

## 🔧 Tools & Utilities

### Status Lines

| Tool                                                  | Description                           |
| ----------------------------------------------------- | ------------------------------------- |
| [claude-code-statusline](https://github.com/path)     | Rust-based with Git integration       |
| [Enhanced 4-line statusline](https://github.com/path) | Themes, cost tracking, MCP monitoring |
| [Vim-style powerline](https://github.com/path)        | Real-time usage, custom themes        |

### Session Management

| Tool                                                  | Description                            |
| ----------------------------------------------------- | -------------------------------------- |
| [Session Continuity Toolset](https://github.com/path) | Cross-session memory, context recovery |
| [Conversation Viewer](https://github.com/path)        | View .jsonl files in HTML UI           |

### Integration Tools

| Tool                                                  | Description                               |
| ----------------------------------------------------- | ----------------------------------------- |
| [Claude Code GitHub Webhook](https://github.com/path) | AI assistance via @mentions in PRs/issues |
| [Claudable](https://github.com/path)                  | Open-source web builder with CLI agents   |

---

## 📖 System Prompts & Documentation

| Repository                                                                                        | Description                                              |
| ------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| [Piebald-AI/claude-code-system-prompts](https://github.com/Piebald-AI/claude-code-system-prompts) | All system prompts, tool descriptions, sub-agent prompts |
| [claude-code-docs mirror](https://github.com/path)                                                | Full-text search, query-time updates                     |

---

## 🎓 Learning Resources

| Resource                                                                                                                                        | Description                  |
| ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| [Anthropic Engineering Blog](https://www.anthropic.com/engineering/claude-code-best-practices)                                                  | Official best practices      |
| [Claude.com Blog - CLAUDE.md](https://claude.com/blog/using-claude-md-files)                                                                    | Official CLAUDE.md guide     |
| [code.claude.com/docs](https://code.claude.com/docs)                                                                                            | Official documentation       |
| [sankalp's Claude Code 2.0 Guide](https://sankalp.bearblog.dev/my-experience-with-claude-code-20-and-how-to-get-better-at-using-coding-agents/) | Deep dive into features      |
| [alexop.dev Customization Guide](https://alexop.dev/posts/claude-code-customization-guide-claudemd-skills-subagents/)                           | CLAUDE.md, skills, subagents |

---

## 🚀 Quick Start

### 1. Bootstrap Your Project

```bash
# Initialize CLAUDE.md
claude
/init

# Add to memory with # shortcut
# Always use TypeScript strict mode
```

### 2. Install Community Agents

```bash
# Create agents directory
mkdir -p ~/.claude/agents

# Install a collection
git clone https://github.com/wshobson/agents ~/.claude/agents/community
```

### 3. Add Slash Commands

```bash
# Create commands directory
mkdir -p ~/.claude/commands

# Download a command
curl -sL https://raw.githubusercontent.com/wshobson/commands/main/tools/security-scan.md \
  -o ~/.claude/commands/security-scan.md
```

### 4. Use the Marketplace CLI

```bash
bun install -g bwc-cli
bwc init
bwc add --agent backend-architect
bwc add --command commit
```

---

## 📁 Recommended Project Structure

```
📦 your-project/
├── 📄 CLAUDE.md                          # Main project instructions
├── 📄 CLAUDE.local.md                    # Personal settings (git-ignored)
└── 📁 .claude/
    ├── 📁 rules/                         # Coding standards & patterns
    │   ├── 📄 typescript.md              # TypeScript strict mode & patterns
    │   ├── 📄 testing.md                 # Vitest & Playwright conventions
    │   ├── 📄 api-routes.md              # API handler patterns
    │   ├── 📄 components.md              # React component guidelines
    │   ├── 📄 prisma.md                  # Database query patterns
    │   ├── 📄 i18n.md                    # Internationalization rules
    │   ├── 📄 security.md                # Security checklist (OWASP)
    │   └── 📄 error-handling.md          # Error classes, Result pattern, logging
    ├── 📁 commands/                      # Slash commands (/command)
    │   ├── 📄 review.md                  # Code review workflow
    │   ├── 📄 deploy.md                  # Deployment workflow
    │   ├── 📄 commit.md                  # Conventional commits
    │   ├── 📄 pr.md                      # Pull request creation
    │   ├── 📄 migrate.md                 # Database migrations
    │   ├── 📄 seed.md                    # Database seeding
    │   ├── 📄 i18n-check.md              # Translation completeness
    │   ├── 📄 api-test.md                # API endpoint testing
    │   ├── 📄 metrics.md                 # OpenTelemetry monitoring
    │   ├── 📄 env-check.md               # Environment validation
    │   └── 📄 logs.md                    # Log analysis with Pino/jq
    ├── 📁 agents/                        # Specialized AI subagents
    │   ├── 📄 dba.md                     # Database Administrator
    │   ├── 📄 security-reviewer.md       # Security auditor (OWASP)
    │   ├── 📄 api-developer.md           # API development patterns
    │   ├── 📄 frontend-developer.md      # React/Next.js components
    │   ├── 📄 i18n-specialist.md         # Internationalization
    │   ├── 📄 devops-engineer.md         # CI/CD & Docker
    │   ├── 📄 performance-analyst.md     # Performance optimization
    │   ├── 📄 accessibility-auditor.md   # WCAG compliance
    │   └── 📄 error-detective.md         # Debugging & log investigation
    ├── 📁 skills/                        # Multi-step workflows
    │   ├── 📁 database-optimization/
    │   │   └── 📄 SKILL.md               # Query & index optimization
    │   ├── 📁 api-scaffolding/
    │   │   └── 📄 SKILL.md               # CRUD API generation
    │   ├── 📁 component-generator/
    │   │   └── 📄 SKILL.md               # React component scaffolding
    │   ├── 📁 translation-sync/
    │   │   └── 📄 SKILL.md               # Translation file sync
    │   ├── 📁 test-generator/
    │   │   └── 📄 SKILL.md               # Test generation
    │   ├── 📁 migration-planner/
    │   │   └── 📄 SKILL.md               # Database migration planning
    │   └── 📁 error-setup/
    │       └── 📄 SKILL.md               # Error handling infrastructure
    └── 📁 output-styles/                 # Response formatting
        └── 📄 technical-writer.md        # Docs with Mermaid & emojis

Legend: 📦 Root | 📁 Directory | 📄 File
```

### Configuration Categories

| Category          | Purpose                                   | Location                 |
| ----------------- | ----------------------------------------- | ------------------------ |
| **Rules**         | Auto-loaded coding standards by file type | `.claude/rules/`         |
| **Commands**      | User-invoked workflows (`/command`)       | `.claude/commands/`      |
| **Agents**        | Specialized AI personas for complex tasks | `.claude/agents/`        |
| **Skills**        | Multi-step guided workflows               | `.claude/skills/`        |
| **Output Styles** | Response formatting templates             | `.claude/output-styles/` |

---

## 🔗 Community & Support

- [Claude Developers Discord](https://discord.gg/anthropic)
- [r/ClaudeAI](https://reddit.com/r/ClaudeAI)
- [GitHub Issues - anthropics/claude-code](https://github.com/anthropics/claude-code/issues)

---

## 📊 Agent Categories Reference

Based on VoltAgent's organization:

| Category                 | Examples                                              |
| ------------------------ | ----------------------------------------------------- |
| **Core Development**     | code-reviewer, debugger, refactorer                   |
| **Language Specialists** | python-pro, typescript-expert, rust-engineer          |
| **DevOps & Cloud**       | docker-specialist, k8s-engineer, azure-infra          |
| **Quality & Security**   | security-auditor, test-engineer, accessibility-expert |
| **Data & ML**            | data-analyst, ml-engineer, ai-engineer                |
| **Documentation**        | api-documenter, technical-writer                      |
| **Business**             | product-manager, ux-researcher                        |
| **Research**             | academic-researcher, web-researcher                   |

---

_DevMultiplier Academy - Claude Code Resources Collection_
