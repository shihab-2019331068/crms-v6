/*
  Warnings:

  - You are about to drop the `_SemesterCourses` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "CourseType" AS ENUM ('THEORY', 'LAB', 'PROJECT', 'THESIS');

-- DropForeignKey
ALTER TABLE "_SemesterCourses" DROP CONSTRAINT "_SemesterCourses_A_fkey";

-- DropForeignKey
ALTER TABLE "_SemesterCourses" DROP CONSTRAINT "_SemesterCourses_B_fkey";

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "semesterId" INTEGER,
ADD COLUMN     "type" "CourseType";

-- DropTable
DROP TABLE "_SemesterCourses";

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "semesters"("id") ON DELETE SET NULL ON UPDATE CASCADE;
