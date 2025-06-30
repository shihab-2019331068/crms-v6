/*
  Warnings:

  - You are about to drop the column `code` on the `Lab` table. All the data in the column will be lost.
  - You are about to drop the column `credits` on the `Lab` table. All the data in the column will be lost.
  - You are about to drop the `semester_course_teachers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `semester_courses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `semester_labs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `semester_rooms` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[labNumber]` on the table `Lab` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `capacity` to the `Lab` table without a default value. This is not possible if the table is not empty.
  - Added the required column `labNumber` to the `Lab` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Lab` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY');

-- DropForeignKey
ALTER TABLE "semester_course_teachers" DROP CONSTRAINT "semester_course_teachers_courseId_fkey";

-- DropForeignKey
ALTER TABLE "semester_course_teachers" DROP CONSTRAINT "semester_course_teachers_semesterId_fkey";

-- DropForeignKey
ALTER TABLE "semester_course_teachers" DROP CONSTRAINT "semester_course_teachers_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "semester_courses" DROP CONSTRAINT "semester_courses_courseId_fkey";

-- DropForeignKey
ALTER TABLE "semester_courses" DROP CONSTRAINT "semester_courses_semesterId_fkey";

-- DropForeignKey
ALTER TABLE "semester_labs" DROP CONSTRAINT "semester_labs_labId_fkey";

-- DropForeignKey
ALTER TABLE "semester_labs" DROP CONSTRAINT "semester_labs_semesterId_fkey";

-- DropForeignKey
ALTER TABLE "semester_rooms" DROP CONSTRAINT "semester_rooms_roomId_fkey";

-- DropForeignKey
ALTER TABLE "semester_rooms" DROP CONSTRAINT "semester_rooms_semesterId_fkey";

-- DropIndex
DROP INDEX "Lab_code_key";

-- AlterTable
ALTER TABLE "Lab" DROP COLUMN "code",
DROP COLUMN "credits",
ADD COLUMN     "capacity" INTEGER NOT NULL,
ADD COLUMN     "labNumber" TEXT NOT NULL,
ADD COLUMN     "status" "RoomStatus" NOT NULL;

-- DropTable
DROP TABLE "semester_course_teachers";

-- DropTable
DROP TABLE "semester_courses";

-- DropTable
DROP TABLE "semester_labs";

-- DropTable
DROP TABLE "semester_rooms";

-- CreateTable
CREATE TABLE "semester_teachers" (
    "id" SERIAL NOT NULL,
    "semesterId" INTEGER NOT NULL,
    "teacherId" INTEGER NOT NULL,

    CONSTRAINT "semester_teachers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weekly_schedules" (
    "id" SERIAL NOT NULL,
    "semesterId" INTEGER NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "courseId" INTEGER,
    "labId" INTEGER,
    "roomId" INTEGER,
    "isBreak" BOOLEAN NOT NULL DEFAULT false,
    "breakName" TEXT,

    CONSTRAINT "weekly_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_SemesterCourses" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_SemesterCourses_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_SemesterLabs" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_SemesterLabs_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_SemesterRooms" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_SemesterRooms_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "semester_teachers_semesterId_teacherId_key" ON "semester_teachers"("semesterId", "teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "weekly_schedules_semesterId_dayOfWeek_startTime_key" ON "weekly_schedules"("semesterId", "dayOfWeek", "startTime");

-- CreateIndex
CREATE INDEX "_SemesterCourses_B_index" ON "_SemesterCourses"("B");

-- CreateIndex
CREATE INDEX "_SemesterLabs_B_index" ON "_SemesterLabs"("B");

-- CreateIndex
CREATE INDEX "_SemesterRooms_B_index" ON "_SemesterRooms"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Lab_labNumber_key" ON "Lab"("labNumber");

-- AddForeignKey
ALTER TABLE "semester_teachers" ADD CONSTRAINT "semester_teachers_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "semesters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "semester_teachers" ADD CONSTRAINT "semester_teachers_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_schedules" ADD CONSTRAINT "weekly_schedules_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "semesters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_schedules" ADD CONSTRAINT "weekly_schedules_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_schedules" ADD CONSTRAINT "weekly_schedules_labId_fkey" FOREIGN KEY ("labId") REFERENCES "Lab"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_schedules" ADD CONSTRAINT "weekly_schedules_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SemesterCourses" ADD CONSTRAINT "_SemesterCourses_A_fkey" FOREIGN KEY ("A") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SemesterCourses" ADD CONSTRAINT "_SemesterCourses_B_fkey" FOREIGN KEY ("B") REFERENCES "semesters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SemesterLabs" ADD CONSTRAINT "_SemesterLabs_A_fkey" FOREIGN KEY ("A") REFERENCES "Lab"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SemesterLabs" ADD CONSTRAINT "_SemesterLabs_B_fkey" FOREIGN KEY ("B") REFERENCES "semesters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SemesterRooms" ADD CONSTRAINT "_SemesterRooms_A_fkey" FOREIGN KEY ("A") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SemesterRooms" ADD CONSTRAINT "_SemesterRooms_B_fkey" FOREIGN KEY ("B") REFERENCES "semesters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
