-- AlterTable
ALTER TABLE "users" ADD COLUMN     "dashboardAppearance" TEXT NOT NULL DEFAULT 'light',
ADD COLUMN     "emailDigestFrequency" TEXT NOT NULL DEFAULT 'weekly',
ADD COLUMN     "notifyOnAchievements" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifyOnCompletionReminders" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifyOnCourseUpdates" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifyOnMessages" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifyOnNewCourses" BOOLEAN NOT NULL DEFAULT true;
