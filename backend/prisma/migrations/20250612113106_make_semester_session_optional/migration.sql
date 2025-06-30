/*
  Warnings:

  - A unique constraint covering the columns `[acronym]` on the table `Department` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "semesters" ALTER COLUMN "session" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Department_acronym_key" ON "Department"("acronym");
