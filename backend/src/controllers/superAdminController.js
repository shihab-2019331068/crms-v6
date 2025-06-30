const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.addDepartment = async (req, res) => {
  const { name, acronym } = req.body;
  try {
    const department = await prisma.department.create({
      data: {
        name,
        acronym,
      },
    });

    // Create 8 semesters for the new department
    const semesterNames = [
      '1st year 1st semester',
      '1st year 2nd semester',
      '2nd year 1st semester',
      '2nd year 2nd semester',
      '3rd year 1st semester',
      '3rd year 2nd semester',
      '4th year 1st semester',
      '4th year 2nd semester',
    ];
    const semestersData = semesterNames.map((name) => ({
      name,
      session: null, // session is optional and can be edited later
      departmentId: department.id,
    }));
    await prisma.semester.createMany({ data: semestersData });

    res.status(201).json(department);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.addRoom = async (req, res) => {
  const { roomNumber, capacity, departmentId } = req.body;
  try {
    const room = await prisma.room.create({
      data: {
        roomNumber,
        capacity,
        departmentId,
      },
    });
    res.status(201).json(room);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.addLab = async (req, res) => {
  const { name, labNumber, capacity, departmentId } = req.body;
  try {
    const lab = await prisma.lab.create({
      data: {
        name,
        labNumber,
        capacity,
        departmentId,
        status: "AVAILABLE",
      },
    });
    res.status(201).json(lab);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteDepartment = async (req, res) => {
  const { id } = req.params;
  try {
    // Delete all related entities before deleting the department
    const semesters = await prisma.semester.findMany({ where: { departmentId: Number(id) } });
    const semesterIds = semesters.map(s => s.id);

    // 2. Delete all weekly schedules for those semesters
    await prisma.weeklySchedule.deleteMany({ where: { semesterId: { in: semesterIds } } });

    // 3. Delete all semester-teacher relations
    await prisma.semesterTeacher.deleteMany({ where: { semesterId: { in: semesterIds } } });

    // 4. Disconnect courses from semesters (many-to-many)
    if (semesterIds.length > 0) {
      // Set semesterId to null for courses in these semesters (new schema)
      await prisma.course.updateMany({
        where: { semesterId: { in: semesterIds } },
        data: { semesterId: null }
      });
      await prisma.$executeRawUnsafe(`DELETE FROM "_SemesterLabs" WHERE "A" IN (${semesterIds.join(',')})`);
      await prisma.$executeRawUnsafe(`DELETE FROM "_SemesterRooms" WHERE "A" IN (${semesterIds.join(',')})`);
    }

    // 5. Delete all semesters
    await prisma.semester.deleteMany({ where: { id: { in: semesterIds } } });

    // 6. Delete all courses for the department
    await prisma.course.deleteMany({ where: { departmentId: Number(id) } });

    // 7. Delete all rooms for the department
    await prisma.room.deleteMany({ where: { departmentId: Number(id) } });

    // 8. Delete all labs for the department
    await prisma.lab.deleteMany({ where: { departmentId: Number(id) } });

    // 9. Delete all users in this department
    await prisma.user.deleteMany({ where: { departmentId: Number(id) } });

    // 10. Finally, delete the department
    await prisma.department.delete({ where: { id: Number(id) } });

    res.status(200).json({ message: 'Department deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        department: true,
      },
    });
    // Map users to include session if available
    const usersWithSession = users.map(user => ({
      ...user,
      session: user.session || null, // Ensure session is included, or null if not present
    }));
    res.status(200).json(usersWithSession);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    // Check if user is a super admin
    const user = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.role === 'super_admin' || user.role === 'superadmin' || user.role === 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Cannot delete a super admin user' });
    }
    await prisma.user.delete({ where: { id: Number(id) } });
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
