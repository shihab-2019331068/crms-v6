const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Department Admin: Add Semester (must specify department, only for own department)
exports.addSemester = async (req, res) => {
  const { name, session, startDate, endDate, examStartDate, examEndDate, departmentId } = req.body;
  const user = req.user;
  try {
    // Validate required fields
    if (!name || !session || !startDate || !endDate || !examStartDate || !examEndDate || !departmentId) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    // Fetch the admin's user record
    const admin = await prisma.user.findUnique({
      where: { id: user.userId },
    });
    if (!admin || !admin.departmentId) {
      return res.status(403).json({ error: 'Department admin must belong to a department.' });
    }
    if (admin.departmentId !== departmentId) {
      return res.status(403).json({ error: 'You can only add semesters to your own department.' });
    }
    // Create the semester
    const semester = await prisma.semester.create({
      data: {
        name,
        session,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        examStartDate: new Date(examStartDate),
        examEndDate: new Date(examEndDate),
        departmentId
      },
    });
    res.status(201).json(semester);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Department Admin: Get all semesters for own department
exports.getSemesters = async (req, res) => {
  // Read departmentId from query params, fallback to admin's department
  const reqDeptId = Number(req.query.departmentId);
  // console.log("rpd = ", reqDeptId);
  
  try {
    const semesters = await prisma.semester.findMany({ where: { departmentId: reqDeptId } });
    res.status(200).json(semesters);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


// Department Admin: Set the session of a semester
exports.setSemesterSession = async (req, res) => {
  const { semesterId, session } = req.body;
  const user = req.user;
  try {
    if (!semesterId || !session) {
      return res.status(400).json({ error: 'semesterId and session are required.' });
    }
    // Validate session format (e.g., 2019-2020)
    if (!/^\d{4}-\d{4}$/.test(session)) {
      return res.status(400).json({ error: 'Session must be in the format YYYY-YYYY.' });
    }
    // Update the session
    const updatedSemester = await prisma.semester.update({
      where: { id: Number(semesterId) },
      data: { session },
    });
    res.status(200).json(updatedSemester);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Department Admin: Add Course to a Semester (only for own department)
exports.addCourseToSemester = async (req, res) => {
  const { semesterId, courseIds, courseId } = req.body;
  const user = req.user;
  try {
    // Accept either courseIds (array) or courseId (single)
    let courseIdList = [];
    if (Array.isArray(courseIds) && courseIds.length > 0) {
      courseIdList = courseIds.map(Number);
    } else if (courseId) {
      courseIdList = [Number(courseId)];
    }
    if (!semesterId || courseIdList.length === 0) {
      return res.status(400).json({ error: 'semesterId and at least one courseId are required.' });
    }
    // Fetch the admin's user record
    const admin = await prisma.user.findUnique({
      where: { id: user.userId },
    });
    // Fetch the semester and check department
    const semester = await prisma.semester.findUnique({
      where: { id: semesterId },
    });
    // Fetch all courses and check department
    const courses = await prisma.course.findMany({
      where: { id: { in: courseIdList } },
    });
    // Connect all courses to the semester
    const updatedSemester = await prisma.semester.update({
      where: { id: semesterId },
      data: {
        courses: {
          connect: courseIdList.map(id => ({ id })),
        },
      },
      include: { courses: true },
    });
    
    res.status(200).json(updatedSemester);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Department Admin: Remove Course from a Semester
exports.removeCourseFromSemester = async (req, res) => {
  const { semesterId, courseId } = req.params;

  try {
    if (!semesterId || !courseId) {
      return res.status(400).json({ error: 'semesterId and courseId are required.' });
    }

    await prisma.course.update({
        where: { id: Number(courseId) },
        data: {
            semesterId: null,
        },
    });

    res.status(200).json({ message: 'Course removed from semester successfully.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};