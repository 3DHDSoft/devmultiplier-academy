// Prisma 7+ configuration file
// Database connection is configured here instead of schema.prisma
import dotenv from 'dotenv';
import { defineConfig, env } from 'prisma/config';

// Load .env.local first (higher priority), then .env as fallback
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
