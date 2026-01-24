-- DropForeignKey
ALTER TABLE "email_change_tokens" DROP CONSTRAINT "email_change_tokens_userId_fkey";

-- AddForeignKey
ALTER TABLE "email_change_tokens" ADD CONSTRAINT "email_change_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
