// Prisma 7+ configuration file
// Database connection is configured here instead of schema.prisma
import dotenv from 'dotenv';
import { defineConfig, env } from 'prisma/config';

// Load .env.local first (higher priority), then .env as fallback
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

// Prisma's env() helper throws if a variable is missing. During CI/build
// we may not have DATABASE_URL set (we don't need a live DB for `prisma generate`).
// Use a safe fallback to an in-memory SQLite database so codegen can run.
let datasourceUrl: string;
try {
  datasourceUrl = env('DATABASE_URL');
} catch (_e) {
  // Fallback to SQLite in-memory for code generation and local builds
  // This avoids failing the build when a production DB URL isn't present.
  // Consumers deploying to production should ensure `DATABASE_URL` is set.

  console.warn('DATABASE_URL not set — falling back to SQLite in-memory for prisma generate.');
  datasourceUrl = 'file:./dev.db';
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: datasourceUrl,
  },
});
