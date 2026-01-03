-- AlterTable
ALTER TABLE "Course" ALTER COLUMN "id" SET DEFAULT uuid_generate_v7();

-- AlterTable
ALTER TABLE "accounts" ALTER COLUMN "id" SET DEFAULT uuid_generate_v7();

-- AlterTable
ALTER TABLE "course_progress" ALTER COLUMN "id" SET DEFAULT uuid_generate_v7();

-- AlterTable
ALTER TABLE "course_translations" ALTER COLUMN "id" SET DEFAULT uuid_generate_v7();

-- AlterTable
ALTER TABLE "enrollments" ALTER COLUMN "id" SET DEFAULT uuid_generate_v7();

-- AlterTable
ALTER TABLE "instructors" ALTER COLUMN "id" SET DEFAULT uuid_generate_v7();

-- AlterTable
ALTER TABLE "lesson_translations" ALTER COLUMN "id" SET DEFAULT uuid_generate_v7();

-- AlterTable
ALTER TABLE "lessons" ALTER COLUMN "id" SET DEFAULT uuid_generate_v7();

-- AlterTable
ALTER TABLE "module_translations" ALTER COLUMN "id" SET DEFAULT uuid_generate_v7();

-- AlterTable
ALTER TABLE "modules" ALTER COLUMN "id" SET DEFAULT uuid_generate_v7();

-- AlterTable
ALTER TABLE "sessions" ALTER COLUMN "id" SET DEFAULT uuid_generate_v7();

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT uuid_generate_v7();
