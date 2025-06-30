-- CreateTable
CREATE TABLE "Lab" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "departmentId" INTEGER NOT NULL,

    CONSTRAINT "Lab_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "semesters" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "session" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "examStartDate" TIMESTAMP(3) NOT NULL,
    "examEndDate" TIMESTAMP(3) NOT NULL,
    "departmentId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "semesters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "semester_courses" (
    "id" SERIAL NOT NULL,
    "semesterId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,

    CONSTRAINT "semester_courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "semester_labs" (
    "id" SERIAL NOT NULL,
    "semesterId" INTEGER NOT NULL,
    "labId" INTEGER NOT NULL,

    CONSTRAINT "semester_labs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "semester_rooms" (
    "id" SERIAL NOT NULL,
    "semesterId" INTEGER NOT NULL,
    "roomId" INTEGER NOT NULL,

    CONSTRAINT "semester_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "semester_course_teachers" (
    "id" SERIAL NOT NULL,
    "semesterId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "teacherId" INTEGER NOT NULL,

    CONSTRAINT "semester_course_teachers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lab_code_key" ON "Lab"("code");

-- CreateIndex
CREATE UNIQUE INDEX "semesters_name_session_departmentId_key" ON "semesters"("name", "session", "departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "semester_courses_semesterId_courseId_key" ON "semester_courses"("semesterId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "semester_labs_semesterId_labId_key" ON "semester_labs"("semesterId", "labId");

-- CreateIndex
CREATE UNIQUE INDEX "semester_rooms_semesterId_roomId_key" ON "semester_rooms"("semesterId", "roomId");

-- CreateIndex
CREATE UNIQUE INDEX "semester_course_teachers_semesterId_courseId_teacherId_key" ON "semester_course_teachers"("semesterId", "courseId", "teacherId");

-- AddForeignKey
ALTER TABLE "Lab" ADD CONSTRAINT "Lab_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "semesters" ADD CONSTRAINT "semesters_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "semester_courses" ADD CONSTRAINT "semester_courses_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "semesters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "semester_courses" ADD CONSTRAINT "semester_courses_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "semester_labs" ADD CONSTRAINT "semester_labs_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "semesters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "semester_labs" ADD CONSTRAINT "semester_labs_labId_fkey" FOREIGN KEY ("labId") REFERENCES "Lab"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "semester_rooms" ADD CONSTRAINT "semester_rooms_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "semesters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "semester_rooms" ADD CONSTRAINT "semester_rooms_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "semester_course_teachers" ADD CONSTRAINT "semester_course_teachers_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "semesters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "semester_course_teachers" ADD CONSTRAINT "semester_course_teachers_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "semester_course_teachers" ADD CONSTRAINT "semester_course_teachers_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
