-- Create email_change_tokens table
CREATE TABLE IF NOT EXISTS "email_change_tokens" (
    "id" UUID PRIMARY KEY DEFAULT uuidv7(),
    "userId" UUID NOT NULL,
    "currentEmail" TEXT NOT NULL,
    "newEmail" TEXT NOT NULL,
    "token" TEXT UNIQUE NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "email_change_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Add indexes
CREATE INDEX IF NOT EXISTS "email_change_tokens_userId_idx" ON "email_change_tokens"("userId");
CREATE INDEX IF NOT EXISTS "email_change_tokens_token_idx" ON "email_change_tokens"("token");
CREATE INDEX IF NOT EXISTS "email_change_tokens_expires_idx" ON "email_change_tokens"("expires");
