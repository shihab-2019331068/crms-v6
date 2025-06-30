/*
  Warnings:

  - You are about to drop the column `headId` on the `Department` table. All the data in the column will be lost.
  - Added the required column `acronym` to the `Department` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Department" DROP CONSTRAINT "Department_headId_fkey";

-- DropIndex
DROP INDEX "Department_headId_key";

-- AlterTable
ALTER TABLE "Department" DROP COLUMN "headId",
ADD COLUMN     "acronym" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "semesters" ALTER COLUMN "startDate" DROP NOT NULL,
ALTER COLUMN "endDate" DROP NOT NULL,
ALTER COLUMN "examStartDate" DROP NOT NULL,
ALTER COLUMN "examEndDate" DROP NOT NULL;
