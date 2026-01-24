/*
  Warnings:

  - Made the column `createdAt` on table `sessions` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "sessions" ALTER COLUMN "createdAt" SET NOT NULL;
