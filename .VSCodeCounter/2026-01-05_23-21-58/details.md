# Details

Date : 2026-01-05 23:21:58

Directory /workspaces/dev-x-academy-web

Total : 130 files,  23686 codes, 671 comments, 4824 blanks, all 29181 lines

[Summary](results.md) / Details / [Diff Summary](diff.md) / [Diff Details](diff-details.md)

## Files
| filename | language | code | comment | blank | total |
| :--- | :--- | ---: | ---: | ---: | ---: |
| [.claude/settings.local.json](/.claude/settings.local.json) | JSON | 17 | 0 | 1 | 18 |
| [.devcontainer/.env](/.devcontainer/.env) | Properties | 22 | 6 | 4 | 32 |
| [.devcontainer/Dockerfile](/.devcontainer/Dockerfile) | Docker | 76 | 9 | 6 | 91 |
| [.devcontainer/config/postgres/init-user-db.sh](/.devcontainer/config/postgres/init-user-db.sh) | Shell Script | 30 | 24 | 8 | 62 |
| [.devcontainer/config/postgres/postgresql.conf](/.devcontainer/config/postgres/postgresql.conf) | Properties | 35 | 13 | 10 | 58 |
| [.devcontainer/devcontainer.json](/.devcontainer/devcontainer.json) | JSON with Comments | 105 | 12 | 10 | 127 |
| [.devcontainer/docker-compose.yml](/.devcontainer/docker-compose.yml) | YAML | 83 | 27 | 11 | 121 |
| [.devcontainer/post-create.sh](/.devcontainer/post-create.sh) | Shell Script | 52 | 14 | 9 | 75 |
| [.devcontainer/post-start.sh](/.devcontainer/post-start.sh) | Shell Script | 9 | 2 | 5 | 16 |
| [.env](/.env) | Properties | 12 | 16 | 9 | 37 |
| [.markdownlint.json](/.markdownlint.json) | JSON | 13 | 0 | 1 | 14 |
| [.ncurc.json](/.ncurc.json) | JSON | 3 | 0 | 1 | 4 |
| [.prettierrc](/.prettierrc) | JSON | 43 | 0 | 2 | 45 |
| [README.md](/README.md) | source.markdown.math | 235 | 0 | 88 | 323 |
| [bun.lock](/bun.lock) | JSON with Comments | 933 | 0 | 875 | 1,808 |
| [cache/config.json](/cache/config.json) | JSON | 6 | 0 | 0 | 6 |
| [components.json](/components.json) | JSON | 22 | 0 | 1 | 23 |
| [doc/SECURITY\_FEATURES.md](/doc/SECURITY_FEATURES.md) | source.markdown.math | 278 | 0 | 110 | 388 |
| [doc/api-endpoints.md](/doc/api-endpoints.md) | source.markdown.math | 511 | 0 | 161 | 672 |
| [doc/api-implementation-guide.md](/doc/api-implementation-guide.md) | source.markdown.math | 563 | 0 | 136 | 699 |
| [doc/api\_tests.md](/doc/api_tests.md) | source.markdown.math | 359 | 0 | 134 | 493 |
| [doc/api\_tests\_quick\_ref.md](/doc/api_tests_quick_ref.md) | source.markdown.math | 251 | 0 | 84 | 335 |
| [doc/authentication-and-user-profiles.md](/doc/authentication-and-user-profiles.md) | source.markdown.math | 1,085 | 0 | 269 | 1,354 |
| [doc/authentication-guide.md](/doc/authentication-guide.md) | source.markdown.math | 494 | 0 | 162 | 656 |
| [doc/legal-pages-integration-guide.md](/doc/legal-pages-integration-guide.md) | source.markdown.math | 686 | 0 | 133 | 819 |
| [doc/multilingual-implementation-guide.md](/doc/multilingual-implementation-guide.md) | source.markdown.math | 1,164 | 0 | 247 | 1,411 |
| [doc/opentelemetry\_architecture.md](/doc/opentelemetry_architecture.md) | source.markdown.math | 480 | 0 | 176 | 656 |
| [doc/opentelemetry\_setup.md](/doc/opentelemetry_setup.md) | source.markdown.math | 307 | 0 | 129 | 436 |
| [doc/playwright.md](/doc/playwright.md) | source.markdown.math | 287 | 0 | 116 | 403 |
| [doc/playwright\_setup.md](/doc/playwright_setup.md) | source.markdown.math | 170 | 0 | 81 | 251 |
| [doc/prisma-introduction.md](/doc/prisma-introduction.md) | source.markdown.math | 234 | 0 | 94 | 328 |
| [doc/rest-api-vs-prisma-comparison.md](/doc/rest-api-vs-prisma-comparison.md) | source.markdown.math | 588 | 0 | 174 | 762 |
| [doc/tempo\_queries.md](/doc/tempo_queries.md) | source.markdown.math | 301 | 0 | 155 | 456 |
| [doc/testing-strategy-nextjs.md](/doc/testing-strategy-nextjs.md) | source.markdown.math | 708 | 0 | 168 | 876 |
| [doc/testing.md](/doc/testing.md) | source.markdown.math | 156 | 0 | 61 | 217 |
| [doc/testing\_overview.md](/doc/testing_overview.md) | source.markdown.math | 205 | 0 | 87 | 292 |
| [e2e/accessibility.spec.ts](/e2e/accessibility.spec.ts) | TypeScript | 34 | 6 | 5 | 45 |
| [e2e/auth.spec.ts](/e2e/auth.spec.ts) | TypeScript | 38 | 5 | 11 | 54 |
| [e2e/failing-video.spec.ts](/e2e/failing-video.spec.ts) | TypeScript | 6 | 2 | 2 | 10 |
| [e2e/homepage.spec.ts](/e2e/homepage.spec.ts) | TypeScript | 22 | 1 | 5 | 28 |
| [e2e/legal.spec.ts](/e2e/legal.spec.ts) | TypeScript | 31 | 2 | 6 | 39 |
| [e2e/navigation.spec.ts](/e2e/navigation.spec.ts) | TypeScript | 24 | 0 | 6 | 30 |
| [eslint.config.mjs](/eslint.config.mjs) | JavaScript | 26 | 3 | 3 | 32 |
| [instrumentation.node.ts](/instrumentation.node.ts) | TypeScript | 82 | 24 | 15 | 121 |
| [instrumentation.ts](/instrumentation.ts) | TypeScript | 5 | 7 | 2 | 14 |
| [middleware.ts](/middleware.ts) | TypeScript | 19 | 12 | 7 | 38 |
| [next.config.ts](/next.config.ts) | TypeScript | 18 | 0 | 3 | 21 |
| [package-lock.json](/package-lock.json) | JSON | 5,538 | 0 | 1 | 5,539 |
| [package.json](/package.json) | JSON | 92 | 0 | 1 | 93 |
| [playwright.config.ts](/playwright.config.ts) | TypeScript | 27 | 27 | 7 | 61 |
| [postcss.config.mjs](/postcss.config.mjs) | JavaScript | 6 | 0 | 2 | 8 |
| [prisma.config.ts](/prisma.config.ts) | TypeScript | 11 | 2 | 2 | 15 |
| [prisma/migrations/20260103230420\_init/migration.sql](/prisma/migrations/20260103230420_init/migration.sql) | pgsql | 175 | 52 | 65 | 292 |
| [prisma/migrations/20260105155934\_add\_login\_logs/migration.sql](/prisma/migrations/20260105155934_add_login_logs/migration.sql) | pgsql | 20 | 5 | 6 | 31 |
| [prisma/migrations/20260105161426\_add\_isadmin\_field/migration.sql](/prisma/migrations/20260105161426_add_isadmin_field/migration.sql) | pgsql | 1 | 1 | 1 | 3 |
| [prisma/schema.prisma](/prisma/schema.prisma) | Prisma | 204 | 17 | 49 | 270 |
| [public/icon.svg](/public/icon.svg) | XML | 6 | 3 | 3 | 12 |
| [public/logo.svg](/public/logo.svg) | XML | 8 | 3 | 3 | 14 |
| [reset.sh](/reset.sh) | Shell Script | 4 | 1 | 1 | 6 |
| [scripts/make-admin.ts](/scripts/make-admin.ts) | TypeScript | 41 | 6 | 11 | 58 |
| [scripts/test-email.ts](/scripts/test-email.ts) | TypeScript | 50 | 7 | 11 | 68 |
| [scripts/verify-testing-setup.sh](/scripts/verify-testing-setup.sh) | Shell Script | 40 | 8 | 9 | 57 |
| [src/\_\_tests\_\_/auth.test.ts](/src/__tests__/auth.test.ts) | TypeScript | 54 | 3 | 8 | 65 |
| [src/\_\_tests\_\_/models.test.ts](/src/__tests__/models.test.ts) | TypeScript | 60 | 3 | 9 | 72 |
| [src/app/(auth)/layout.tsx](/src/app/(auth)/layout.tsx) | TypeScript JSX | 5 | 0 | 3 | 8 |
| [src/app/(auth)/login/page.tsx](/src/app/(auth)/login/page.tsx) | TypeScript JSX | 127 | 10 | 16 | 153 |
| [src/app/(auth)/register/page.tsx](/src/app/(auth)/register/page.tsx) | TypeScript JSX | 224 | 14 | 27 | 265 |
| [src/app/(protected)/admin/logins/page.tsx](/src/app/(protected)/admin/logins/page.tsx) | TypeScript JSX | 283 | 4 | 20 | 307 |
| [src/app/(protected)/dashboard/page.tsx](/src/app/(protected)/dashboard/page.tsx) | TypeScript JSX | 82 | 4 | 12 | 98 |
| [src/app/(protected)/layout.tsx](/src/app/(protected)/layout.tsx) | TypeScript JSX | 5 | 0 | 3 | 8 |
| [src/app/(protected)/profile/page.tsx](/src/app/(protected)/profile/page.tsx) | TypeScript JSX | 538 | 12 | 54 | 604 |
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
| [src/app/api/auth/logout/route.ts](/src/app/api/auth/logout/route.ts) | TypeScript | 11 | 1 | 3 | 15 |
| [src/app/api/auth/register/route.ts](/src/app/api/auth/register/route.ts) | TypeScript | 52 | 3 | 9 | 64 |
| [src/app/api/courses/\[id\]/route.ts](/src/app/api/courses/%5Bid%5D/route.ts) | TypeScript | 125 | 2 | 7 | 134 |
| [src/app/api/courses/route.ts](/src/app/api/courses/route.ts) | TypeScript | 59 | 2 | 5 | 66 |
| [src/app/api/enrollments/\[id\]/route.ts](/src/app/api/enrollments/%5Bid%5D/route.ts) | TypeScript | 65 | 1 | 10 | 76 |
| [src/app/api/enrollments/route.ts](/src/app/api/enrollments/route.ts) | TypeScript | 119 | 4 | 19 | 142 |
| [src/app/api/progress/\[courseId\]/lesson/route.ts](/src/app/api/progress/%5BcourseId%5D/lesson/route.ts) | TypeScript | 144 | 14 | 21 | 179 |
| [src/app/api/progress/\[courseId\]/module/route.ts](/src/app/api/progress/%5BcourseId%5D/module/route.ts) | TypeScript | 128 | 10 | 19 | 157 |
| [src/app/api/progress/\[courseId\]/route.ts](/src/app/api/progress/%5BcourseId%5D/route.ts) | TypeScript | 95 | 5 | 14 | 114 |
| [src/app/api/user/language/route.ts](/src/app/api/user/language/route.ts) | TypeScript | 47 | 0 | 8 | 55 |
| [src/app/api/user/login-history/route.ts](/src/app/api/user/login-history/route.ts) | TypeScript | 23 | 2 | 7 | 32 |
| [src/app/api/user/profile/route.ts](/src/app/api/user/profile/route.ts) | TypeScript | 77 | 0 | 12 | 89 |
| [src/app/contact/page.tsx](/src/app/contact/page.tsx) | TypeScript JSX | 144 | 4 | 12 | 160 |
| [src/app/courses/page.tsx](/src/app/courses/page.tsx) | TypeScript JSX | 111 | 6 | 10 | 127 |
| [src/app/error.tsx](/src/app/error.tsx) | TypeScript JSX | 17 | 0 | 2 | 19 |
| [src/app/global-error.tsx](/src/app/global-error.tsx) | TypeScript JSX | 21 | 0 | 2 | 23 |
| [src/app/globals.css](/src/app/globals.css) | PostCSS | 42 | 4 | 7 | 53 |
| [src/app/layout.tsx](/src/app/layout.tsx) | TypeScript JSX | 51 | 0 | 3 | 54 |
| [src/app/page.tsx](/src/app/page.tsx) | TypeScript JSX | 14 | 0 | 2 | 16 |
| [src/app/pricing/page.tsx](/src/app/pricing/page.tsx) | TypeScript JSX | 62 | 1 | 6 | 69 |
| [src/app/privacy-policy/page.tsx](/src/app/privacy-policy/page.tsx) | TypeScript JSX | 419 | 20 | 44 | 483 |
| [src/app/providers.tsx](/src/app/providers.tsx) | TypeScript JSX | 6 | 0 | 3 | 9 |
| [src/app/terms-of-service/page.tsx](/src/app/terms-of-service/page.tsx) | TypeScript JSX | 408 | 20 | 52 | 480 |
| [src/auth.ts](/src/auth.ts) | TypeScript | 155 | 15 | 15 | 185 |
| [src/auth.types.ts](/src/auth.types.ts) | TypeScript | 16 | 0 | 3 | 19 |
| [src/components/layout/footer.tsx](/src/components/layout/footer.tsx) | TypeScript JSX | 92 | 4 | 7 | 103 |
| [src/components/layout/header.tsx](/src/components/layout/header.tsx) | TypeScript JSX | 138 | 4 | 8 | 150 |
| [src/components/layout/layout-wrapper.tsx](/src/components/layout/layout-wrapper.tsx) | TypeScript JSX | 13 | 0 | 3 | 16 |
| [src/components/sections/courses.tsx](/src/components/sections/courses.tsx) | TypeScript JSX | 96 | 8 | 9 | 113 |
| [src/components/sections/cta.tsx](/src/components/sections/cta.tsx) | TypeScript JSX | 63 | 2 | 7 | 72 |
| [src/components/sections/hero.tsx](/src/components/sections/hero.tsx) | TypeScript JSX | 42 | 6 | 7 | 55 |
| [src/components/sections/pricing.tsx](/src/components/sections/pricing.tsx) | TypeScript JSX | 108 | 2 | 9 | 119 |
| [src/components/ui/\_\_tests\_\_/button.test.tsx](/src/components/ui/__tests__/button.test.tsx) | TypeScript JSX | 20 | 0 | 5 | 25 |
| [src/components/ui/button.tsx](/src/components/ui/button.tsx) | TypeScript JSX | 30 | 0 | 5 | 35 |
| [src/components/ui/language-selector.tsx](/src/components/ui/language-selector.tsx) | TypeScript JSX | 90 | 3 | 13 | 106 |
| [src/components/ui/profile-dropdown.tsx](/src/components/ui/profile-dropdown.tsx) | TypeScript JSX | 222 | 8 | 31 | 261 |
| [src/globals.d.ts](/src/globals.d.ts) | TypeScript | 12 | 1 | 3 | 16 |
| [src/lib/\_\_tests\_\_/api.test.ts](/src/lib/__tests__/api.test.ts) | TypeScript | 63 | 3 | 13 | 79 |
| [src/lib/\_\_tests\_\_/utils.test.ts](/src/lib/__tests__/utils.test.ts) | TypeScript | 6 | 0 | 2 | 8 |
| [src/lib/admin-middleware.ts](/src/lib/admin-middleware.ts) | TypeScript | 24 | 8 | 8 | 40 |
| [src/lib/email-service.ts](/src/lib/email-service.ts) | TypeScript | 223 | 23 | 16 | 262 |
| [src/lib/ip-utils.ts](/src/lib/ip-utils.ts) | TypeScript | 71 | 17 | 17 | 105 |
| [src/lib/login-logger.ts](/src/lib/login-logger.ts) | TypeScript | 243 | 30 | 30 | 303 |
| [src/lib/prisma.ts](/src/lib/prisma.ts) | TypeScript | 8 | 0 | 5 | 13 |
| [src/lib/tracer.ts](/src/lib/tracer.ts) | TypeScript | 56 | 24 | 11 | 91 |
| [src/lib/utils.ts](/src/lib/utils.ts) | TypeScript | 5 | 0 | 2 | 7 |
| [tsconfig.json](/tsconfig.json) | JSON with Comments | 33 | 0 | 1 | 34 |
| [vitest.config.mjs](/vitest.config.mjs) | JavaScript | 36 | 0 | 3 | 39 |
| [vitest.setup.ts](/vitest.setup.ts) | TypeScript | 52 | 4 | 5 | 61 |

[Summary](results.md) / Details / [Diff Summary](diff.md) / [Diff Details](diff-details.md)