/*
  Warnings:

  - You are about to drop the column `semesterId` on the `Course` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Course" DROP CONSTRAINT "Course_semesterId_fkey";

-- AlterTable
ALTER TABLE "Course" DROP COLUMN "semesterId";

-- CreateTable
CREATE TABLE "_CourseSemester" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CourseSemester_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CourseSemester_B_index" ON "_CourseSemester"("B");

-- AddForeignKey
ALTER TABLE "_CourseSemester" ADD CONSTRAINT "_CourseSemester_A_fkey" FOREIGN KEY ("A") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CourseSemester" ADD CONSTRAINT "_CourseSemester_B_fkey" FOREIGN KEY ("B") REFERENCES "semesters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
