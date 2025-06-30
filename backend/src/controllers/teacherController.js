const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get courses for a specific teacher
exports.getTeacherCourses = async (req, res) => {
  const teacherId = Number(req.params.teacherId);
  if (isNaN(teacherId)) {
    return res.status(400).json({ error: 'Invalid teacherId' });
  }
  try {
    const teacher = await prisma.user.findUnique({
      where: { id: teacherId },
      include: { coursesTaught: true },
    });
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    res.status(200).json(teacher.coursesTaught);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch courses for teacher' });
  }
};
