-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "forDept" INTEGER,
ADD COLUMN     "isMajor" BOOLEAN NOT NULL DEFAULT true;
