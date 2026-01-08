import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { dbQueryCounter, dbQueryDuration, dbErrorCounter } from './metrics';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const basePrisma = new PrismaClient({ adapter });

// Add OpenTelemetry extension to capture Prisma metrics
// Using Prisma Client Extensions instead of middleware (required when using adapters)
const prisma = basePrisma.$extends({
  name: 'opentelemetry-metrics',
  query: {
    async $allOperations({ operation, model, args, query }) {
      const startTime = Date.now();

      try {
        const result = await query(args);
        const duration = Date.now() - startTime;

        // Record successful query metrics
        dbQueryCounter.add(1, {
          'db.system': 'postgresql',
          'db.operation': operation,
          'db.table': model || 'unknown',
        });

        dbQueryDuration.record(duration, {
          'db.system': 'postgresql',
          'db.operation': operation,
          'db.table': model || 'unknown',
        });

        return result;
      } catch (error) {
        const duration = Date.now() - startTime;

        // Record query metrics even on error
        dbQueryCounter.add(1, {
          'db.system': 'postgresql',
          'db.operation': operation,
          'db.table': model || 'unknown',
          'error': 'true',
        });

        dbQueryDuration.record(duration, {
          'db.system': 'postgresql',
          'db.operation': operation,
          'db.table': model || 'unknown',
          'error': 'true',
        });

        // Record error counter
        dbErrorCounter.add(1, {
          'db.system': 'postgresql',
          'db.operation': operation,
          'db.table': model || 'unknown',
          'error.type': error instanceof Error ? error.name : 'Unknown',
        });

        throw error;
      }
    },
  },
});

const globalForPrisma = global as unknown as { prisma: typeof prisma };

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
export { prisma };
