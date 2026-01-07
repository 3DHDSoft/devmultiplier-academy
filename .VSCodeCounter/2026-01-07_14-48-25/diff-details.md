# Diff Details

Date : 2026-01-07 14:48:25

Directory /workspaces/dev-x-academy-web

Total : 140 files,  13989 codes, 271 comments, 3178 blanks, all 17438 lines

[Summary](results.md) / [Details](details.md) / [Diff Summary](diff.md) / Diff Details

## Files
| filename | language | code | comment | blank | total |
| :--- | :--- | ---: | ---: | ---: | ---: |
| [.claude/settings.local.json](/.claude/settings.local.json) | (Read Error) | -17 | 0 | -1 | -18 |
| [.devcontainer/.env](/.devcontainer/.env) | Properties | 4 | 1 | 1 | 6 |
| [.devcontainer/OBSERVABILITY-SETUP.md](/.devcontainer/OBSERVABILITY-SETUP.md) | source.markdown.math | 108 | 0 | 38 | 146 |
| [.devcontainer/docker-compose.yml](/.devcontainer/docker-compose.yml) | YAML | 89 | -3 | 4 | 90 |
| [.devcontainer/grafana/README.md](/.devcontainer/grafana/README.md) | source.markdown.math | 128 | 0 | 54 | 182 |
| [.devcontainer/grafana/dashboards/application-overview.json](/.devcontainer/grafana/dashboards/application-overview.json) | JSON | 562 | 0 | 1 | 563 |
| [.devcontainer/grafana/dashboards/performance-metrics.json](/.devcontainer/grafana/dashboards/performance-metrics.json) | JSON | 652 | 0 | 1 | 653 |
| [.devcontainer/grafana/dashboards/security-monitoring.json](/.devcontainer/grafana/dashboards/security-monitoring.json) | JSON | 680 | 0 | 1 | 681 |
| [.devcontainer/grafana/provisioning/dashboards/dashboards.yml](/.devcontainer/grafana/provisioning/dashboards/dashboards.yml) | YAML | 12 | 0 | 2 | 14 |
| [.devcontainer/grafana/provisioning/datasources/prometheus.yml](/.devcontainer/grafana/provisioning/datasources/prometheus.yml) | YAML | 12 | 0 | 2 | 14 |
| [.devcontainer/grafana/provisioning/datasources/tempo.yml](/.devcontainer/grafana/provisioning/datasources/tempo.yml) | YAML | 19 | 0 | 2 | 21 |
| [.devcontainer/otel-collector/otel-collector-config.yml](/.devcontainer/otel-collector/otel-collector-config.yml) | YAML | 46 | 7 | 12 | 65 |
| [.devcontainer/post-create.sh](/.devcontainer/post-create.sh) | Shell Script | -8 | 18 | 1 | 11 |
| [.devcontainer/prometheus/prometheus.yml](/.devcontainer/prometheus/prometheus.yml) | YAML | 29 | 6 | 7 | 42 |
| [.devcontainer/restart-observability.sh](/.devcontainer/restart-observability.sh) | Shell Script | 23 | 7 | 8 | 38 |
| [.devcontainer/tempo/tempo.yml](/.devcontainer/tempo/tempo.yml) | YAML | 41 | 2 | 8 | 51 |
| [.env](/.env) | Properties | 0 | 1 | 1 | 2 |
| [.github/.schemas/collection.schema.json](/.github/.schemas/collection.schema.json) | JSON | 93 | 0 | 1 | 94 |
| [.github/CLAUDE.md](/.github/CLAUDE.md) | source.markdown.math | 4 | 0 | 4 | 8 |
| [.github/FUNDING.yml](/.github/FUNDING.yml) | YAML | 1 | 0 | 1 | 2 |
| [.github/agents/CSharpExpert.agent.md](/.github/agents/CSharpExpert.agent.md) | source.markdown.math | 147 | 0 | 60 | 207 |
| [.github/agents/api-architect.agent.md](/.github/agents/api-architect.agent.md) | source.markdown.math | 42 | 0 | 10 | 52 |
| [.github/agents/clojure-interactive-programming.agent.md](/.github/agents/clojure-interactive-programming.agent.md) | source.markdown.math | 150 | 0 | 46 | 196 |
| [.github/agents/csharp-dotnet-janitor.agent.md](/.github/agents/csharp-dotnet-janitor.agent.md) | source.markdown.math | 65 | 0 | 25 | 90 |
| [.github/agents/csharp-mcp-expert.agent.md](/.github/agents/csharp-mcp-expert.agent.md) | source.markdown.math | 102 | 0 | 23 | 125 |
| [.github/agents/expert-dotnet-software-engineer.agent.md](/.github/agents/expert-dotnet-software-engineer.agent.md) | source.markdown.math | 21 | 0 | 9 | 30 |
| [.github/agents/expert-nextjs-developer.agent.md](/.github/agents/expert-nextjs-developer.agent.md) | source.markdown.math | 394 | 0 | 89 | 483 |
| [.github/agents/microsoft-agent-framework-dotnet.agent.md](/.github/agents/microsoft-agent-framework-dotnet.agent.md) | source.markdown.math | 45 | 0 | 23 | 68 |
| [.github/agents/ms-sql-dba.agent.md](/.github/agents/ms-sql-dba.agent.md) | source.markdown.math | 26 | 0 | 10 | 36 |
| [.github/agents/postgresql-dba.agent.md](/.github/agents/postgresql-dba.agent.md) | source.markdown.math | 19 | 0 | 8 | 27 |
| [.github/agents/typescript-mcp-expert.agent.md](/.github/agents/typescript-mcp-expert.agent.md) | source.markdown.math | 83 | 0 | 18 | 101 |
| [.github/chatmodes/csharp-dotnet-janitor.chatmode.md](/.github/chatmodes/csharp-dotnet-janitor.chatmode.md) | source.markdown.math | 68 | 0 | 27 | 95 |
| [.github/chatmodes/ms-sql-dba.chatmode.md](/.github/chatmodes/ms-sql-dba.chatmode.md) | source.markdown.math | 24 | 0 | 8 | 32 |
| [.github/chatmodes/principal-software-engineer.chatmode.md](/.github/chatmodes/principal-software-engineer.chatmode.md) | source.markdown.math | 34 | 0 | 14 | 48 |
| [.github/collections/csharp-dotnet-development.collection.yml](/.github/collections/csharp-dotnet-development.collection.yml) | YAML | 22 | 0 | 0 | 22 |
| [.github/collections/csharp-dotnet-development.md](/.github/collections/csharp-dotnet-development.md) | source.markdown.math | 15 | 0 | 7 | 22 |
| [.github/collections/database-data-management.md](/.github/collections/database-data-management.md) | source.markdown.math | 18 | 0 | 7 | 25 |
| [.github/collections/frontend-web-dev.collection.yml](/.github/collections/frontend-web-dev.collection.yml) | YAML | 30 | 3 | 4 | 37 |
| [.github/collections/frontend-web-dev.md](/.github/collections/frontend-web-dev.md) | source.markdown.math | 21 | 0 | 7 | 28 |
| [.github/collections/testing-automation.collection.yml](/.github/collections/testing-automation.collection.yml) | YAML | 30 | 3 | 4 | 37 |
| [.github/collections/testing-automation.md](/.github/collections/testing-automation.md) | source.markdown.math | 21 | 0 | 7 | 28 |
| [.github/copilot-instructions.md](/.github/copilot-instructions.md) | source.markdown.math | 163 | 0 | 57 | 220 |
| [.github/instructions/aspnet-rest-apis.instructions.md](/.github/instructions/aspnet-rest-apis.instructions.md) | source.markdown.math | 86 | 0 | 29 | 115 |
| [.github/instructions/clojure.instructions.md](/.github/instructions/clojure.instructions.md) | source.markdown.math | 266 | 0 | 87 | 353 |
| [.github/instructions/csharp-mcp-server.instructions.md](/.github/instructions/csharp-mcp-server.instructions.md) | source.markdown.math | 87 | 0 | 13 | 100 |
| [.github/instructions/csharp.instructions.md](/.github/instructions/csharp.instructions.md) | source.markdown.math | 89 | 0 | 30 | 119 |
| [.github/instructions/devops-core-principles.instructions.md](/.github/instructions/devops-core-principles.instructions.md) | source.markdown.math | 146 | 0 | 26 | 172 |
| [.github/instructions/dotnet-architecture-good-practices.instructions.md](/.github/instructions/dotnet-architecture-good-practices.instructions.md) | source.markdown.math | 203 | 0 | 81 | 284 |
| [.github/instructions/markdown.instructions.md](/.github/instructions/markdown.instructions.md) | source.markdown.math | 127 | 0 | 27 | 154 |
| [.github/instructions/ms-sql-dba.instructions.md](/.github/instructions/ms-sql-dba.instructions.md) | source.markdown.math | 22 | 0 | 8 | 30 |
| [.github/instructions/nextjs.instructions.md](/.github/instructions/nextjs.instructions.md) | source.markdown.math | 116 | 0 | 30 | 146 |
| [.github/instructions/sql\_to\_pg.instructions.md](/.github/instructions/sql_to_pg.instructions.md) | source.markdown.math | 219 | 0 | 48 | 267 |
| [.github/instructions/typescript-5-es2022.instructions.md](/.github/instructions/typescript-5-es2022.instructions.md) | source.markdown.math | 84 | 0 | 35 | 119 |
| [.github/instructions/typescript-mcp-server.instructions.md](/.github/instructions/typescript-mcp-server.instructions.md) | source.markdown.math | 205 | 0 | 29 | 234 |
| [.github/prompts/csharp-async.prompt.md](/.github/prompts/csharp-async.prompt.md) | source.markdown.math | 39 | 0 | 18 | 57 |
| [.github/prompts/csharp-docs.prompt.md](/.github/prompts/csharp-docs.prompt.md) | source.markdown.math | 28 | 0 | 5 | 33 |
| [.github/prompts/csharp-mcp-server-generator.prompt.md](/.github/prompts/csharp-mcp-server-generator.prompt.md) | source.markdown.math | 51 | 0 | 15 | 66 |
| [.github/prompts/csharp-xunit.prompt (2).md](/.github/prompts/csharp-xunit.prompt%20(2).md) | source.markdown.math | 57 | 0 | 19 | 76 |
| [.github/prompts/csharp-xunit.prompt.md](/.github/prompts/csharp-xunit.prompt.md) | source.markdown.math | 57 | 0 | 19 | 76 |
| [.github/prompts/dotnet-best-practices.prompt.md](/.github/prompts/dotnet-best-practices.prompt.md) | source.markdown.math | 65 | 0 | 26 | 91 |
| [.github/prompts/dotnet-design-pattern-review.prompt.md](/.github/prompts/dotnet-design-pattern-review.prompt.md) | source.markdown.math | 37 | 0 | 11 | 48 |
| [.github/prompts/editorconfig.prompt.md](/.github/prompts/editorconfig.prompt.md) | source.markdown.math | 51 | 0 | 19 | 70 |
| [.github/prompts/ef-core.prompt.md](/.github/prompts/ef-core.prompt.md) | source.markdown.math | 61 | 0 | 22 | 83 |
| [.github/prompts/multi-stage-dockerfile.prompt.md](/.github/prompts/multi-stage-dockerfile.prompt.md) | source.markdown.math | 40 | 0 | 14 | 54 |
| [.github/prompts/next-intl-add-language.prompt.md](/.github/prompts/next-intl-add-language.prompt.md) | source.markdown.math | 20 | 0 | 7 | 27 |
| [.github/prompts/postgresql-code-review.prompt.md](/.github/prompts/postgresql-code-review.prompt.md) | source.markdown.math | 177 | 0 | 44 | 221 |
| [.github/prompts/postgresql-optimization.prompt (2).md](/.github/prompts/postgresql-optimization.prompt%20(2).md) | source.markdown.math | 336 | 0 | 77 | 413 |
| [.github/prompts/postgresql-optimization.prompt.md](/.github/prompts/postgresql-optimization.prompt.md) | source.markdown.math | 336 | 0 | 77 | 413 |
| [.github/prompts/sql-code-review.prompt (2).md](/.github/prompts/sql-code-review.prompt%20(2).md) | source.markdown.math | 252 | 0 | 58 | 310 |
| [.github/prompts/sql-code-review.prompt.md](/.github/prompts/sql-code-review.prompt.md) | source.markdown.math | 252 | 0 | 58 | 310 |
| [.github/prompts/sql-optimization.prompt (2).md](/.github/prompts/sql-optimization.prompt%20(2).md) | source.markdown.math | 253 | 0 | 52 | 305 |
| [.github/prompts/sql-optimization.prompt.md](/.github/prompts/sql-optimization.prompt.md) | source.markdown.math | 253 | 0 | 52 | 305 |
| [.github/prompts/typescript-mcp-server-generator.prompt.md](/.github/prompts/typescript-mcp-server-generator.prompt.md) | source.markdown.math | 78 | 0 | 19 | 97 |
| [.github/prompts/write-coding-standards-from-file.prompt.md](/.github/prompts/write-coding-standards-from-file.prompt.md) | source.markdown.math | 227 | 0 | 95 | 322 |
| [.github/scripts/fix-line-endings.sh](/.github/scripts/fix-line-endings.sh) | Shell Script | 3 | 3 | 4 | 10 |
| [README.md](/README.md) | source.markdown.math | 2 | 0 | 2 | 4 |
| [bun.lock](/bun.lock) | JSON with Comments | 2 | 0 | 0 | 2 |
| [doc/SECURITY\_FEATURES.md](/doc/SECURITY_FEATURES.md) | source.markdown.math | -278 | 0 | -110 | -388 |
| [doc/api-endpoints.md](/doc/api-endpoints.md) | source.markdown.math | 21 | 0 | 0 | 21 |
| [doc/api-implementation-guide.md](/doc/api-implementation-guide.md) | source.markdown.math | 25 | 0 | 2 | 27 |
| [doc/api\_tests.md](/doc/api_tests.md) | source.markdown.math | 23 | 0 | 0 | 23 |
| [doc/api\_tests\_quick\_ref.md](/doc/api_tests_quick_ref.md) | source.markdown.math | 24 | 0 | 0 | 24 |
| [doc/authentication-and-user-profiles.md](/doc/authentication-and-user-profiles.md) | source.markdown.math | 12 | 0 | 1 | 13 |
| [doc/authentication-guide.md](/doc/authentication-guide.md) | source.markdown.math | 100 | 0 | 4 | 104 |
| [doc/awesome-claude-code-resources.md](/doc/awesome-claude-code-resources.md) | source.markdown.math | 191 | 0 | 76 | 267 |
| [doc/claude-code-vs-copilot-instructions.md](/doc/claude-code-vs-copilot-instructions.md) | source.markdown.math | 381 | 0 | 133 | 514 |
| [doc/grafana\_quick\_start.md](/doc/grafana_quick_start.md) | source.markdown.math | 129 | 0 | 57 | 186 |
| [doc/grafana\_setup.md](/doc/grafana_setup.md) | source.markdown.math | 295 | 0 | 127 | 422 |
| [doc/legal-pages-integration-guide.md](/doc/legal-pages-integration-guide.md) | source.markdown.math | 22 | 0 | 1 | 23 |
| [doc/mermaid-theme-guide.md](/doc/mermaid-theme-guide.md) | source.markdown.math | 144 | 0 | 46 | 190 |
| [doc/metrics\_implementation.md](/doc/metrics_implementation.md) | source.markdown.math | 375 | 0 | 136 | 511 |
| [doc/metrics\_quick\_reference.md](/doc/metrics_quick_reference.md) | source.markdown.math | 329 | 0 | 133 | 462 |
| [doc/metrics\_testing\_guide.md](/doc/metrics_testing_guide.md) | source.markdown.math | 318 | 0 | 145 | 463 |
| [doc/multilingual-implementation-guide.md](/doc/multilingual-implementation-guide.md) | source.markdown.math | 19 | 0 | 1 | 20 |
| [doc/opentelemetry\_architecture.md](/doc/opentelemetry_architecture.md) | source.markdown.math | 92 | 0 | 19 | 111 |
| [doc/opentelemetry\_setup.md](/doc/opentelemetry_setup.md) | source.markdown.math | 16 | 0 | 6 | 22 |
| [doc/playwright.md](/doc/playwright.md) | source.markdown.math | 22 | 0 | 1 | 23 |
| [doc/playwright\_setup.md](/doc/playwright_setup.md) | source.markdown.math | 14 | 0 | 1 | 15 |
| [doc/prisma-introduction.md](/doc/prisma-introduction.md) | source.markdown.math | 36 | 0 | 1 | 37 |
| [doc/rest-api-vs-prisma-comparison.md](/doc/rest-api-vs-prisma-comparison.md) | source.markdown.math | 20 | 0 | 1 | 21 |
| [doc/security\_features.md](/doc/security_features.md) | source.markdown.math | 280 | 0 | 112 | 392 |
| [doc/tempo\_queries.md](/doc/tempo_queries.md) | source.markdown.math | 4 | 0 | 2 | 6 |
| [doc/testing-strategy-nextjs.md](/doc/testing-strategy-nextjs.md) | source.markdown.math | 117 | 0 | 4 | 121 |
| [doc/testing.md](/doc/testing.md) | source.markdown.math | 9 | 0 | -4 | 5 |
| [doc/testing\_overview.md](/doc/testing_overview.md) | source.markdown.math | 21 | 0 | 1 | 22 |
| [docs/PASSWORD\_RESET\_FEATURE.md](/docs/PASSWORD_RESET_FEATURE.md) | source.markdown.math | 229 | 0 | 83 | 312 |
| [grafana\_implementation.md](/grafana_implementation.md) | source.markdown.math | 287 | 0 | 92 | 379 |
| [instrumentation.node.ts](/instrumentation.node.ts) | TypeScript | 0 | 11 | 0 | 11 |
| [middleware.ts](/middleware.ts) | TypeScript | 22 | 4 | 5 | 31 |
| [package.json](/package.json) | JSON | 2 | 0 | 0 | 2 |
| [prisma/migrations/20260107125107\_add\_password\_reset\_tokens/migration.sql](/prisma/migrations/20260107125107_add_password_reset_tokens/migration.sql) | pgsql | 13 | 5 | 6 | 24 |
| [prisma/migrations/20260107130350\_add\_user\_preferences/migration.sql](/prisma/migrations/20260107130350_add_user_preferences/migration.sql) | pgsql | 7 | 1 | 1 | 9 |
| [prisma/migrations/20260107133659\_add\_session\_tracking/migration.sql](/prisma/migrations/20260107133659_add_session_tracking/migration.sql) | pgsql | 5 | 1 | 3 | 9 |
| [prisma/migrations/20260107142548\_add\_email\_change\_tokens/migration.sql](/prisma/migrations/20260107142548_add_email_change_tokens/migration.sql) | pgsql | 2 | 2 | 2 | 6 |
| [prisma/migrations/20260107\_add\_email\_change\_tokens/migration.sql](/prisma/migrations/20260107_add_email_change_tokens/migration.sql) | pgsql | 14 | 2 | 2 | 18 |
| [prisma/migrations/20260107\_add\_session\_tracking/migration.sql](/prisma/migrations/20260107_add_session_tracking/migration.sql) | pgsql | 13 | 2 | 2 | 17 |
| [prisma/schema.prisma](/prisma/schema.prisma) | Prisma | 33 | -17 | -17 | -1 |
| [scripts/reset-password.ts](/scripts/reset-password.ts) | TypeScript | 45 | 7 | 12 | 64 |
| [src/app/(auth)/forgot-password/page.tsx](/src/app/(auth)/forgot-password/page.tsx) | TypeScript JSX | 113 | 8 | 15 | 136 |
| [src/app/(auth)/reset-password/page.tsx](/src/app/(auth)/reset-password/page.tsx) | TypeScript JSX | 180 | 14 | 25 | 219 |
| [src/app/(protected)/profile/page.tsx](/src/app/(protected)/profile/page.tsx) | TypeScript JSX | 377 | 15 | 39 | 431 |
| [src/app/api/auth/forgot-password/route.ts](/src/app/api/auth/forgot-password/route.ts) | TypeScript | 119 | 10 | 13 | 142 |
| [src/app/api/auth/register/route.ts](/src/app/api/auth/register/route.ts) | TypeScript | 1 | 0 | 0 | 1 |
| [src/app/api/auth/reset-password/route.ts](/src/app/api/auth/reset-password/route.ts) | TypeScript | 119 | 6 | 21 | 146 |
| [src/app/api/user/delete/route.ts](/src/app/api/user/delete/route.ts) | TypeScript | 62 | 3 | 14 | 79 |
| [src/app/api/user/email/request-change/route.ts](/src/app/api/user/email/request-change/route.ts) | TypeScript | 81 | 7 | 15 | 103 |
| [src/app/api/user/email/verify-change/route.ts](/src/app/api/user/email/verify-change/route.ts) | TypeScript | 94 | 5 | 17 | 116 |
| [src/app/api/user/profile/route.ts](/src/app/api/user/profile/route.ts) | TypeScript | 28 | 0 | 0 | 28 |
| [src/app/api/user/sessions/route.ts](/src/app/api/user/sessions/route.ts) | TypeScript | 62 | 10 | 10 | 82 |
| [src/app/globals.css](/src/app/globals.css) | PostCSS | 19 | 2 | 2 | 23 |
| [src/app/verify-email-change/page.tsx](/src/app/verify-email-change/page.tsx) | TypeScript JSX | 103 | 1 | 13 | 117 |
| [src/auth.ts](/src/auth.ts) | TypeScript | 2 | 1 | 1 | 4 |
| [src/components/layout/layout-wrapper.tsx](/src/components/layout/layout-wrapper.tsx) | TypeScript JSX | 3 | 0 | 0 | 3 |
| [src/contexts/ThemeContext.tsx](/src/contexts/ThemeContext.tsx) | TypeScript JSX | 85 | 9 | 20 | 114 |
| [src/lib/email-service.ts](/src/lib/email-service.ts) | TypeScript | 149 | 4 | 5 | 158 |
| [src/lib/ip-utils.ts](/src/lib/ip-utils.ts) | TypeScript | 19 | 1 | 2 | 22 |
| [src/lib/login-logger.ts](/src/lib/login-logger.ts) | TypeScript | 27 | 4 | 4 | 35 |
| [src/lib/metrics.ts](/src/lib/metrics.ts) | TypeScript | 303 | 67 | 78 | 448 |
| [src/lib/session-tracker.ts](/src/lib/session-tracker.ts) | TypeScript | 135 | 24 | 18 | 177 |
| [src/lib/user-agent-parser.ts](/src/lib/user-agent-parser.ts) | TypeScript | 130 | 14 | 12 | 156 |

[Summary](results.md) / [Details](details.md) / [Diff Summary](diff.md) / Diff Details