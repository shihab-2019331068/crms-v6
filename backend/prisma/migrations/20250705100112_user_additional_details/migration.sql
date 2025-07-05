/*
  Warnings:

  - A unique constraint covering the columns `[regNo]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "degree" TEXT,
ADD COLUMN     "mobile" TEXT,
ADD COLUMN     "regNo" TEXT,
ADD COLUMN     "school" TEXT,
ADD COLUMN     "semester" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_regNo_key" ON "users"("regNo");
