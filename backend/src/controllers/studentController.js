const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get courses for a student
exports.getStudentCourses = async (req, res) => {
  const studentId = Number(req.params.studentId);
  if (isNaN(studentId)) {
    return res.status(400).json({ error: 'Invalid studentId' });
  }
  try {
    // 1. Get the student with session and departmentId
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { session: true, departmentId: true }
    });
    if (!student || !student.session || !student.departmentId) {
      return res.status(404).json({ error: 'Student, session, or department not found' });
    }
    // 2. Find the semester for the department and session
    const semester = await prisma.semester.findFirst({
      where: {
        departmentId: student.departmentId,
        session: student.session
      },
      select: { id: true }
    });
    if (!semester) {
      return res.status(404).json({ error: 'Semester not found for this session and department' });
    }
    // 3. Get courses in that semester
    const courses = await prisma.course.findMany({
      where: { semesterId: semester.id },
    });
    return res.json({ courses });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
