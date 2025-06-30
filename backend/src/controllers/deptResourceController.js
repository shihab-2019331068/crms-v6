const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Department Admin: Get all rooms for own department
exports.getRooms = async (req, res) => {
  // Read departmentId from query params, fallback to admin's department
  const reqDeptId = Number(req.query.departmentId);
  try {
    const rooms = await prisma.room.findMany({ where: { departmentId: reqDeptId } });

    res.status(200).json(rooms);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Department Admin: Get all teachers for own department
exports.getTeachers = async (req, res) => {
  const reqDeptId = Number(req.query.departmentId);
  try {
    const teachers = await prisma.user.findMany({
      where: {
        departmentId: reqDeptId,
        role: 'teacher',
      },
      select: {
        id: true,
        name: true,
      },
    });
    res.status(200).json(teachers);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
