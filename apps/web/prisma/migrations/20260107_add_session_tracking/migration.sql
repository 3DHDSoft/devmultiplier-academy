-- Add session tracking fields
ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "ipAddress" TEXT;
ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "userAgent" TEXT;
ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "device" TEXT;
ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "browser" TEXT;
ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "os" TEXT;
ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "country" TEXT;
ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "city" TEXT;
ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "region" TEXT;
ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION;
ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;
ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- Add index for querying user sessions
CREATE INDEX IF NOT EXISTS "sessions_userId_createdAt_idx" ON "sessions"("userId", "createdAt");
