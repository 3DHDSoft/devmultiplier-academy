# Details

Date : 2026-01-10 09:17:32

Directory /workspaces/dev-x-academy-web

Total : 245 files,  37349 codes, 1228 comments, 9991 blanks, all 48568 lines

[Summary](results.md) / Details / [Diff Summary](diff.md) / [Diff Details](diff-details.md)

## Files
| filename | language | code | comment | blank | total |
| :--- | :--- | ---: | ---: | ---: | ---: |
| [.claude/settings.local.json](/.claude/settings.local.json) | JSON | 74 | 0 | 1 | 75 |
| [.devcontainer/.env](/.devcontainer/.env) | Properties | 26 | 7 | 5 | 38 |
| [.devcontainer/Dockerfile](/.devcontainer/Dockerfile) | Docker | 77 | 10 | 7 | 94 |
| [.devcontainer/config/postgres/init-user-db.sh](/.devcontainer/config/postgres/init-user-db.sh) | Shell Script | 30 | 24 | 8 | 62 |
| [.devcontainer/config/postgres/postgresql.conf](/.devcontainer/config/postgres/postgresql.conf) | Properties | 35 | 13 | 10 | 58 |
| [.devcontainer/devcontainer.json](/.devcontainer/devcontainer.json) | JSON with Comments | 142 | 55 | 22 | 219 |
| [.devcontainer/docker-compose.yml](/.devcontainer/docker-compose.yml) | YAML | 176 | 24 | 15 | 215 |
| [.devcontainer/grafana/README.md](/.devcontainer/grafana/README.md) | source.markdown.math | 138 | 0 | 58 | 196 |
| [.devcontainer/grafana/dashboards/application-overview.json](/.devcontainer/grafana/dashboards/application-overview.json) | JSON | 562 | 0 | 1 | 563 |
| [.devcontainer/grafana/dashboards/performance-metrics.json](/.devcontainer/grafana/dashboards/performance-metrics.json) | JSON | 641 | 0 | 1 | 642 |
| [.devcontainer/grafana/dashboards/security-monitoring.json](/.devcontainer/grafana/dashboards/security-monitoring.json) | JSON | 680 | 0 | 1 | 681 |
| [.devcontainer/grafana/provisioning/dashboards/dashboards.yml](/.devcontainer/grafana/provisioning/dashboards/dashboards.yml) | YAML | 12 | 0 | 2 | 14 |
| [.devcontainer/grafana/provisioning/datasources/prometheus.yml](/.devcontainer/grafana/provisioning/datasources/prometheus.yml) | YAML | 12 | 0 | 2 | 14 |
| [.devcontainer/grafana/provisioning/datasources/tempo.yml](/.devcontainer/grafana/provisioning/datasources/tempo.yml) | YAML | 19 | 0 | 2 | 21 |
| [.devcontainer/observability-setup.md](/.devcontainer/observability-setup.md) | source.markdown.math | 108 | 0 | 41 | 149 |
| [.devcontainer/otel-collector/otel-collector-config.yml](/.devcontainer/otel-collector/otel-collector-config.yml) | YAML | 46 | 7 | 12 | 65 |
| [.devcontainer/post-create.sh](/.devcontainer/post-create.sh) | Shell Script | 52 | 34 | 12 | 98 |
| [.devcontainer/post-start.sh](/.devcontainer/post-start.sh) | Shell Script | 9 | 2 | 5 | 16 |
| [.devcontainer/prometheus/prometheus.yml](/.devcontainer/prometheus/prometheus.yml) | YAML | 29 | 27 | 7 | 63 |
| [.devcontainer/restart-observability.sh](/.devcontainer/restart-observability.sh) | Shell Script | 23 | 7 | 8 | 38 |
| [.devcontainer/tempo/tempo.yml](/.devcontainer/tempo/tempo.yml) | YAML | 41 | 2 | 8 | 51 |
| [.env](/.env) | Properties | 24 | 50 | 19 | 93 |
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
| [.github/instructions/typescript-5-es2022.instructions.md](/.github/instructions/typescript-5-es2022.instructions.md) | source.markdown.math | 85 | 0 | 35 | 120 |
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
| [.markdownlint.json](/.markdownlint.json) | JSON | 13 | 0 | 1 | 14 |
| [.ncurc.json](/.ncurc.json) | JSON | 3 | 0 | 1 | 4 |
| [.prettierrc](/.prettierrc) | JSON | 43 | 0 | 2 | 45 |
| [README.md](/README.md) | source.markdown.math | 237 | 0 | 90 | 327 |
| [bun.lock](/bun.lock) | JSON with Comments | 1,003 | 0 | 940 | 1,943 |
| [cache/config.json](/cache/config.json) | JSON | 6 | 0 | 0 | 6 |
| [components.json](/components.json) | JSON | 22 | 0 | 1 | 23 |
| [docs/api-endpoints.md](/docs/api-endpoints.md) | source.markdown.math | 532 | 0 | 161 | 693 |
| [docs/api-implementation-guide.md](/docs/api-implementation-guide.md) | source.markdown.math | 588 | 0 | 138 | 726 |
| [docs/api\_tests.md](/docs/api_tests.md) | source.markdown.math | 382 | 0 | 134 | 516 |
| [docs/api\_tests\_quick\_ref.md](/docs/api_tests_quick_ref.md) | source.markdown.math | 275 | 0 | 84 | 359 |
| [docs/authentication-and-user-profiles.md](/docs/authentication-and-user-profiles.md) | source.markdown.math | 1,097 | 0 | 270 | 1,367 |
| [docs/authentication-guide.md](/docs/authentication-guide.md) | source.markdown.math | 594 | 0 | 166 | 760 |
| [docs/awesome-claude-code-resources.md](/docs/awesome-claude-code-resources.md) | source.markdown.math | 191 | 0 | 76 | 267 |
| [docs/claude-code\_copilot-comparison.md](/docs/claude-code_copilot-comparison.md) | source.markdown.math | 378 | 0 | 163 | 541 |
| [docs/database-setup.md](/docs/database-setup.md) | source.markdown.math | 133 | 0 | 61 | 194 |
| [docs/devcontainer-executive-overview.md](/docs/devcontainer-executive-overview.md) | source.markdown.math | 674 | 0 | 257 | 931 |
| [docs/devcontainer-executive-summary.md](/docs/devcontainer-executive-summary.md) | source.markdown.math | 350 | 0 | 159 | 509 |
| [docs/devcontainer-overview.md](/docs/devcontainer-overview.md) | source.markdown.math | 920 | 0 | 347 | 1,267 |
| [docs/grafana\_implementation.md](/docs/grafana_implementation.md) | source.markdown.math | 323 | 0 | 134 | 457 |
| [docs/grafana\_quick\_start.md](/docs/grafana_quick_start.md) | source.markdown.math | 129 | 0 | 66 | 195 |
| [docs/grafana\_setup.md](/docs/grafana_setup.md) | source.markdown.math | 296 | 0 | 138 | 434 |
| [docs/legal-pages-integration-guide.md](/docs/legal-pages-integration-guide.md) | source.markdown.math | 708 | 0 | 134 | 842 |
| [docs/mermaid-theme-guide.md](/docs/mermaid-theme-guide.md) | source.markdown.math | 144 | 0 | 46 | 190 |
| [docs/metrics\_implementation.md](/docs/metrics_implementation.md) | source.markdown.math | 375 | 0 | 136 | 511 |
| [docs/metrics\_quick\_reference.md](/docs/metrics_quick_reference.md) | source.markdown.math | 317 | 0 | 132 | 449 |
| [docs/metrics\_testing\_guide.md](/docs/metrics_testing_guide.md) | source.markdown.math | 318 | 0 | 145 | 463 |
| [docs/multilingual-implementation-guide.md](/docs/multilingual-implementation-guide.md) | source.markdown.math | 1,183 | 0 | 248 | 1,431 |
| [docs/oauth\_setup.md](/docs/oauth_setup.md) | source.markdown.math | 222 | 0 | 80 | 302 |
| [docs/opentelemetry\_architecture.md](/docs/opentelemetry_architecture.md) | source.markdown.math | 655 | 0 | 222 | 877 |
| [docs/opentelemetry\_environment\_switching.md](/docs/opentelemetry_environment_switching.md) | source.markdown.math | 296 | 0 | 115 | 411 |
| [docs/opentelemetry\_setup.md](/docs/opentelemetry_setup.md) | source.markdown.math | 447 | 0 | 188 | 635 |
| [docs/otel-metrics-troubleshooting.md](/docs/otel-metrics-troubleshooting.md) | source.markdown.math | 982 | 0 | 370 | 1,352 |
| [docs/password\_reset\_feature.md](/docs/password_reset_feature.md) | source.markdown.math | 232 | 0 | 103 | 335 |
| [docs/playwright.md](/docs/playwright.md) | source.markdown.math | 309 | 0 | 117 | 426 |
| [docs/playwright\_setup.md](/docs/playwright_setup.md) | source.markdown.math | 184 | 0 | 82 | 266 |
| [docs/prisma-introduction.md](/docs/prisma-introduction.md) | source.markdown.math | 270 | 0 | 95 | 365 |
| [docs/rest-api-vs-prisma-comparison.md](/docs/rest-api-vs-prisma-comparison.md) | source.markdown.math | 608 | 0 | 175 | 783 |
| [docs/security\_features.md](/docs/security_features.md) | source.markdown.math | 280 | 0 | 112 | 392 |
| [docs/tempo\_queries.md](/docs/tempo_queries.md) | source.markdown.math | 305 | 0 | 157 | 462 |
| [docs/testing-strategy-nextjs.md](/docs/testing-strategy-nextjs.md) | source.markdown.math | 825 | 0 | 172 | 997 |
| [docs/testing.md](/docs/testing.md) | source.markdown.math | 165 | 0 | 57 | 222 |
| [docs/testing\_overview.md](/docs/testing_overview.md) | source.markdown.math | 226 | 0 | 88 | 314 |
| [e2e/accessibility.spec.ts](/e2e/accessibility.spec.ts) | TypeScript | 34 | 6 | 5 | 45 |
| [e2e/auth.spec.ts](/e2e/auth.spec.ts) | TypeScript | 38 | 5 | 11 | 54 |
| [e2e/failing-video.spec.ts](/e2e/failing-video.spec.ts) | TypeScript | 6 | 2 | 2 | 10 |
| [e2e/homepage.spec.ts](/e2e/homepage.spec.ts) | TypeScript | 22 | 1 | 5 | 28 |
| [e2e/legal.spec.ts](/e2e/legal.spec.ts) | TypeScript | 31 | 2 | 6 | 39 |
| [e2e/navigation.spec.ts](/e2e/navigation.spec.ts) | TypeScript | 24 | 0 | 6 | 30 |
| [eslint.config.mjs](/eslint.config.mjs) | JavaScript | 26 | 3 | 3 | 32 |
| [instrumentation.node.ts](/instrumentation.node.ts) | TypeScript | 88 | 33 | 17 | 138 |
| [instrumentation.ts](/instrumentation.ts) | TypeScript | 5 | 7 | 2 | 14 |
| [middleware.ts](/middleware.ts) | TypeScript | 41 | 16 | 12 | 69 |
| [next.config.ts](/next.config.ts) | TypeScript | 18 | 0 | 3 | 21 |
| [package.json](/package.json) | JSON | 100 | 0 | 1 | 101 |
| [playwright.config.ts](/playwright.config.ts) | TypeScript | 27 | 27 | 7 | 61 |
| [postcss.config.mjs](/postcss.config.mjs) | JavaScript | 6 | 0 | 2 | 8 |
| [prisma.config.ts](/prisma.config.ts) | TypeScript | 11 | 2 | 2 | 15 |
| [prisma/migrations/20260103230420\_init/migration.sql](/prisma/migrations/20260103230420_init/migration.sql) | pgsql | 175 | 52 | 65 | 292 |
| [prisma/migrations/20260105155934\_add\_login\_logs/migration.sql](/prisma/migrations/20260105155934_add_login_logs/migration.sql) | pgsql | 20 | 5 | 6 | 31 |
| [prisma/migrations/20260105161426\_add\_isadmin\_field/migration.sql](/prisma/migrations/20260105161426_add_isadmin_field/migration.sql) | pgsql | 1 | 1 | 1 | 3 |
| [prisma/migrations/20260107125107\_add\_password\_reset\_tokens/migration.sql](/prisma/migrations/20260107125107_add_password_reset_tokens/migration.sql) | pgsql | 13 | 5 | 6 | 24 |
| [prisma/migrations/20260107130350\_add\_user\_preferences/migration.sql](/prisma/migrations/20260107130350_add_user_preferences/migration.sql) | pgsql | 7 | 1 | 1 | 9 |
| [prisma/migrations/20260107133659\_add\_session\_tracking/migration.sql](/prisma/migrations/20260107133659_add_session_tracking/migration.sql) | pgsql | 5 | 1 | 3 | 9 |
| [prisma/migrations/20260107142548\_add\_email\_change\_tokens/migration.sql](/prisma/migrations/20260107142548_add_email_change_tokens/migration.sql) | pgsql | 2 | 2 | 2 | 6 |
| [prisma/migrations/20260107\_add\_email\_change\_tokens/migration.sql](/prisma/migrations/20260107_add_email_change_tokens/migration.sql) | pgsql | 14 | 2 | 2 | 18 |
| [prisma/migrations/20260107\_add\_session\_tracking/migration.sql](/prisma/migrations/20260107_add_session_tracking/migration.sql) | pgsql | 13 | 2 | 2 | 17 |
| [prisma/schema.prisma](/prisma/schema.prisma) | Prisma | 237 | 0 | 32 | 269 |
| [public/icon.svg](/public/icon.svg) | XML | 6 | 3 | 3 | 12 |
| [public/logo.svg](/public/logo.svg) | XML | 8 | 3 | 3 | 14 |
| [reset.sh](/reset.sh) | Shell Script | 4 | 1 | 1 | 6 |
| [scripts/generate-continuous-traffic.ts](/scripts/generate-continuous-traffic.ts) | TypeScript | 111 | 29 | 31 | 171 |
| [scripts/generate-test-telemetry.ts](/scripts/generate-test-telemetry.ts) | TypeScript | 161 | 37 | 40 | 238 |
| [scripts/make-admin.ts](/scripts/make-admin.ts) | TypeScript | 41 | 6 | 11 | 58 |
| [scripts/quickstart.md](/scripts/quickstart.md) | source.markdown.math | 110 | 0 | 58 | 168 |
| [scripts/readme-telemetry-testing.md](/scripts/readme-telemetry-testing.md) | source.markdown.math | 149 | 0 | 69 | 218 |
| [scripts/reset-password.ts](/scripts/reset-password.ts) | TypeScript | 45 | 7 | 12 | 64 |
| [scripts/restart-prometheus.sh](/scripts/restart-prometheus.sh) | Shell Script | 20 | 2 | 5 | 27 |
| [scripts/test-email.ts](/scripts/test-email.ts) | TypeScript | 50 | 7 | 11 | 68 |
| [scripts/test-login-metrics.ts](/scripts/test-login-metrics.ts) | TypeScript | 89 | 24 | 24 | 137 |
| [scripts/verify-testing-setup.sh](/scripts/verify-testing-setup.sh) | Shell Script | 40 | 8 | 9 | 57 |
| [src/\_\_tests\_\_/auth.test.ts](/src/__tests__/auth.test.ts) | TypeScript | 54 | 3 | 8 | 65 |
| [src/\_\_tests\_\_/models.test.ts](/src/__tests__/models.test.ts) | TypeScript | 60 | 3 | 9 | 72 |
| [src/app/(auth)/forgot-password/page.tsx](/src/app/(auth)/forgot-password/page.tsx) | TypeScript JSX | 119 | 8 | 15 | 142 |
| [src/app/(auth)/layout.tsx](/src/app/(auth)/layout.tsx) | TypeScript JSX | 5 | 0 | 3 | 8 |
| [src/app/(auth)/login/page.tsx](/src/app/(auth)/login/page.tsx) | TypeScript JSX | 231 | 16 | 22 | 269 |
| [src/app/(auth)/register/page.tsx](/src/app/(auth)/register/page.tsx) | TypeScript JSX | 224 | 14 | 27 | 265 |
| [src/app/(auth)/reset-password/page.tsx](/src/app/(auth)/reset-password/page.tsx) | TypeScript JSX | 189 | 14 | 25 | 228 |
| [src/app/(protected)/admin/logins/page.tsx](/src/app/(protected)/admin/logins/page.tsx) | TypeScript JSX | 283 | 4 | 20 | 307 |
| [src/app/(protected)/dashboard/page.tsx](/src/app/(protected)/dashboard/page.tsx) | TypeScript JSX | 82 | 4 | 12 | 98 |
| [src/app/(protected)/layout.tsx](/src/app/(protected)/layout.tsx) | TypeScript JSX | 5 | 0 | 3 | 8 |
| [src/app/(protected)/profile/page.tsx](/src/app/(protected)/profile/page.tsx) | TypeScript JSX | 1,021 | 34 | 104 | 1,159 |
| [src/app/(protected)/security/page.tsx](/src/app/(protected)/security/page.tsx) | TypeScript JSX | 191 | 3 | 19 | 213 |
| [src/app/about/page.tsx](/src/app/about/page.tsx) | TypeScript JSX | 79 | 5 | 8 | 92 |
| [src/app/api/\_\_tests\_\_/courses.test.ts](/src/app/api/__tests__/courses.test.ts) | TypeScript | 92 | 6 | 17 | 115 |
| [src/app/api/\_\_tests\_\_/enrollments.test.ts](/src/app/api/__tests__/enrollments.test.ts) | TypeScript | 152 | 4 | 28 | 184 |
| [src/app/api/\_\_tests\_\_/progress.test.ts](/src/app/api/__tests__/progress.test.ts) | TypeScript | 154 | 6 | 40 | 200 |
| [src/app/api/\_\_tests\_\_/register.test.ts](/src/app/api/__tests__/register.test.ts) | TypeScript | 174 | 6 | 39 | 219 |
| [src/app/api/\_\_tests\_\_/user-language.test.ts](/src/app/api/__tests__/user-language.test.ts) | TypeScript | 98 | 4 | 21 | 123 |
| [src/app/api/\_\_tests\_\_/user-profile.test.ts](/src/app/api/__tests__/user-profile.test.ts) | TypeScript | 123 | 6 | 23 | 152 |
| [src/app/api/admin/login-logs/route.ts](/src/app/api/admin/login-logs/route.ts) | TypeScript | 35 | 3 | 5 | 43 |
| [src/app/api/auth/\[...nextauth\]/route.ts](/src/app/api/auth/%5B...nextauth%5D/route.ts) | TypeScript | 2 | 0 | 2 | 4 |
| [src/app/api/auth/forgot-password/route.ts](/src/app/api/auth/forgot-password/route.ts) | TypeScript | 119 | 10 | 13 | 142 |
| [src/app/api/auth/logout/route.ts](/src/app/api/auth/logout/route.ts) | TypeScript | 11 | 1 | 3 | 15 |
| [src/app/api/auth/register/route.ts](/src/app/api/auth/register/route.ts) | TypeScript | 53 | 3 | 9 | 65 |
| [src/app/api/auth/reset-password/route.ts](/src/app/api/auth/reset-password/route.ts) | TypeScript | 86 | 6 | 21 | 113 |
| [src/app/api/courses/\[id\]/route.ts](/src/app/api/courses/%5Bid%5D/route.ts) | TypeScript | 125 | 2 | 7 | 134 |
| [src/app/api/courses/route.ts](/src/app/api/courses/route.ts) | TypeScript | 61 | 2 | 6 | 69 |
| [src/app/api/enrollments/\[id\]/route.ts](/src/app/api/enrollments/%5Bid%5D/route.ts) | TypeScript | 65 | 1 | 10 | 76 |
| [src/app/api/enrollments/route.ts](/src/app/api/enrollments/route.ts) | TypeScript | 120 | 4 | 19 | 143 |
| [src/app/api/metrics/route.ts](/src/app/api/metrics/route.ts) | TypeScript | 28 | 10 | 7 | 45 |
| [src/app/api/progress/\[courseId\]/lesson/route.ts](/src/app/api/progress/%5BcourseId%5D/lesson/route.ts) | TypeScript | 145 | 14 | 21 | 180 |
| [src/app/api/progress/\[courseId\]/module/route.ts](/src/app/api/progress/%5BcourseId%5D/module/route.ts) | TypeScript | 129 | 10 | 19 | 158 |
| [src/app/api/progress/\[courseId\]/route.ts](/src/app/api/progress/%5BcourseId%5D/route.ts) | TypeScript | 95 | 5 | 14 | 114 |
| [src/app/api/user/delete/route.ts](/src/app/api/user/delete/route.ts) | TypeScript | 51 | 3 | 14 | 68 |
| [src/app/api/user/email/request-change/route.ts](/src/app/api/user/email/request-change/route.ts) | TypeScript | 78 | 7 | 15 | 100 |
| [src/app/api/user/email/verify-change/route.ts](/src/app/api/user/email/verify-change/route.ts) | TypeScript | 96 | 5 | 17 | 118 |
| [src/app/api/user/language/route.ts](/src/app/api/user/language/route.ts) | TypeScript | 47 | 0 | 8 | 55 |
| [src/app/api/user/login-history/route.ts](/src/app/api/user/login-history/route.ts) | TypeScript | 23 | 2 | 7 | 32 |
| [src/app/api/user/profile/route.ts](/src/app/api/user/profile/route.ts) | TypeScript | 115 | 0 | 12 | 127 |
| [src/app/api/user/sessions/route.ts](/src/app/api/user/sessions/route.ts) | TypeScript | 63 | 11 | 11 | 85 |
| [src/app/contact/page.tsx](/src/app/contact/page.tsx) | TypeScript JSX | 144 | 4 | 12 | 160 |
| [src/app/courses/page.tsx](/src/app/courses/page.tsx) | TypeScript JSX | 111 | 6 | 10 | 127 |
| [src/app/error.tsx](/src/app/error.tsx) | TypeScript JSX | 17 | 0 | 2 | 19 |
| [src/app/global-error.tsx](/src/app/global-error.tsx) | TypeScript JSX | 21 | 0 | 2 | 23 |
| [src/app/globals.css](/src/app/globals.css) | PostCSS | 61 | 6 | 9 | 76 |
| [src/app/layout.tsx](/src/app/layout.tsx) | TypeScript JSX | 51 | 0 | 3 | 54 |
| [src/app/page.tsx](/src/app/page.tsx) | TypeScript JSX | 14 | 0 | 2 | 16 |
| [src/app/pricing/page.tsx](/src/app/pricing/page.tsx) | TypeScript JSX | 62 | 1 | 6 | 69 |
| [src/app/privacy-policy/page.tsx](/src/app/privacy-policy/page.tsx) | TypeScript JSX | 419 | 20 | 44 | 483 |
| [src/app/providers.tsx](/src/app/providers.tsx) | TypeScript JSX | 13 | 0 | 3 | 16 |
| [src/app/terms-of-service/page.tsx](/src/app/terms-of-service/page.tsx) | TypeScript JSX | 408 | 20 | 52 | 480 |
| [src/app/verify-email-change/page.tsx](/src/app/verify-email-change/page.tsx) | TypeScript JSX | 112 | 1 | 14 | 127 |
| [src/auth.ts](/src/auth.ts) | TypeScript | 280 | 30 | 30 | 340 |
| [src/auth.types.ts](/src/auth.types.ts) | TypeScript | 18 | 0 | 3 | 21 |
| [src/components/layout/footer.tsx](/src/components/layout/footer.tsx) | TypeScript JSX | 92 | 4 | 7 | 103 |
| [src/components/layout/header.tsx](/src/components/layout/header.tsx) | TypeScript JSX | 138 | 4 | 8 | 150 |
| [src/components/layout/layout-wrapper.tsx](/src/components/layout/layout-wrapper.tsx) | TypeScript JSX | 16 | 0 | 3 | 19 |
| [src/components/sections/courses.tsx](/src/components/sections/courses.tsx) | TypeScript JSX | 96 | 8 | 9 | 113 |
| [src/components/sections/cta.tsx](/src/components/sections/cta.tsx) | TypeScript JSX | 63 | 2 | 7 | 72 |
| [src/components/sections/hero.tsx](/src/components/sections/hero.tsx) | TypeScript JSX | 42 | 6 | 7 | 55 |
| [src/components/sections/pricing.tsx](/src/components/sections/pricing.tsx) | TypeScript JSX | 108 | 2 | 9 | 119 |
| [src/components/ui/\_\_tests\_\_/button.test.tsx](/src/components/ui/__tests__/button.test.tsx) | TypeScript JSX | 20 | 0 | 5 | 25 |
| [src/components/ui/button.tsx](/src/components/ui/button.tsx) | TypeScript JSX | 30 | 0 | 5 | 35 |
| [src/components/ui/language-selector.tsx](/src/components/ui/language-selector.tsx) | TypeScript JSX | 90 | 3 | 13 | 106 |
| [src/components/ui/profile-dropdown.tsx](/src/components/ui/profile-dropdown.tsx) | TypeScript JSX | 222 | 8 | 31 | 261 |
| [src/contexts/ThemeContext.tsx](/src/contexts/ThemeContext.tsx) | TypeScript JSX | 77 | 11 | 19 | 107 |
| [src/globals.d.ts](/src/globals.d.ts) | TypeScript | 12 | 1 | 3 | 16 |
| [src/lib/\_\_tests\_\_/api.test.ts](/src/lib/__tests__/api.test.ts) | TypeScript | 63 | 3 | 13 | 79 |
| [src/lib/\_\_tests\_\_/utils.test.ts](/src/lib/__tests__/utils.test.ts) | TypeScript | 6 | 0 | 2 | 8 |
| [src/lib/admin-middleware.ts](/src/lib/admin-middleware.ts) | TypeScript | 24 | 8 | 8 | 40 |
| [src/lib/email-service.ts](/src/lib/email-service.ts) | TypeScript | 372 | 27 | 21 | 420 |
| [src/lib/http-server-metrics.ts](/src/lib/http-server-metrics.ts) | TypeScript | 44 | 27 | 15 | 86 |
| [src/lib/ip-utils.ts](/src/lib/ip-utils.ts) | TypeScript | 90 | 18 | 19 | 127 |
| [src/lib/login-logger.ts](/src/lib/login-logger.ts) | TypeScript | 270 | 34 | 34 | 338 |
| [src/lib/metrics.ts](/src/lib/metrics.ts) | TypeScript | 341 | 72 | 83 | 496 |
| [src/lib/prisma.ts](/src/lib/prisma.ts) | TypeScript | 53 | 5 | 14 | 72 |
| [src/lib/session-tracker.ts](/src/lib/session-tracker.ts) | TypeScript | 154 | 28 | 21 | 203 |
| [src/lib/tracer.ts](/src/lib/tracer.ts) | TypeScript | 56 | 24 | 11 | 91 |
| [src/lib/user-agent-parser.ts](/src/lib/user-agent-parser.ts) | TypeScript | 134 | 14 | 12 | 160 |
| [src/lib/utils.ts](/src/lib/utils.ts) | TypeScript | 5 | 0 | 2 | 7 |
| [src/lib/with-metrics.ts](/src/lib/with-metrics.ts) | TypeScript | 40 | 15 | 12 | 67 |
| [tsconfig.json](/tsconfig.json) | JSON with Comments | 33 | 0 | 1 | 34 |
| [vitest.config.mjs](/vitest.config.mjs) | JavaScript | 36 | 0 | 3 | 39 |
| [vitest.setup.ts](/vitest.setup.ts) | TypeScript | 52 | 4 | 5 | 61 |

[Summary](results.md) / Details / [Diff Summary](diff.md) / [Diff Details](diff-details.md)