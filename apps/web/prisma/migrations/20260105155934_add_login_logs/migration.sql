-- CreateTable
CREATE TABLE "login_logs" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "userId" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "country" TEXT,
    "city" TEXT,
    "region" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "login_logs_userId_idx" ON "login_logs"("userId");

-- CreateIndex
CREATE INDEX "login_logs_createdAt_idx" ON "login_logs"("createdAt");

-- CreateIndex
CREATE INDEX "login_logs_ipAddress_idx" ON "login_logs"("ipAddress");

-- AddForeignKey
ALTER TABLE "login_logs" ADD CONSTRAINT "login_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
