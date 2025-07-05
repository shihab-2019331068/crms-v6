const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Department Admin: Add Semester (must specify department, only for own department)
exports.addSemester = async (req, res) => {
  const { name, session, departmentId } = req.body;
  const user = req.user;
  try {
    // Validate required fields
    if (!name || !session || !departmentId) {
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
        departmentId
      },
    });
    res.status(201).json(semester);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// delete a semester (UPDATED FUNCTION)
exports.deleteSemester = async (req, res) => {
  const { semesterId } = req.params;
  const semesterIdNum = Number(semesterId);

  try {
    if (!semesterId) {
      return res.status(400).json({ error: 'Semester ID is required' });
    }

    // A transaction is crucial here. All operations must succeed or none will.
    const transaction = await prisma.$transaction([
      // 1. Delete all related SemesterCourseTeacher entries
      prisma.semesterCourseTeacher.deleteMany({
        where: { semesterId: semesterIdNum },
      }),

      // 2. Delete all related SemesterTeacher entries
      prisma.semesterTeacher.deleteMany({
        where: { semesterId: semesterIdNum },
      }),

      // 3. Delete all related WeeklySchedule entries
      prisma.weeklySchedule.deleteMany({
        where: { semesterId: semesterIdNum },
      }),

      // 4. Disconnect many-to-many relations. This clears the join tables.
      prisma.semester.update({
        where: { id: semesterIdNum },
        data: {
          courses: { set: [] },
          labs: { set: [] },
          rooms: { set: [] },
        },
      }),

      // 5. Finally, delete the semester itself now that dependencies are removed
      prisma.semester.delete({
        where: { id: semesterIdNum },
      }),
    ]);

    res.status(200).json({ message: 'Semester and all related data deleted successfully.' });
  } catch (error) {
    console.error('Error deleting semester:', error); // Log the full error for debugging
    // Check if the error is because the semester was not found (e.g., already deleted)
    if (error.code === 'P2025') {
       return res.status(404).json({ error: 'Semester not found. It may have already been deleted.' });
    }
    res.status(500).json({ error: 'Failed to delete semester. Please check server logs for details.' });
  }
};

//archive a semester
exports.archiveSemester = async (req, res) => {
  const { semesterId } = req.params;
  try {
    if (!semesterId) {
      return res.status(400).json({ error: 'Semester ID is required' });
    }
    const archivedSemester = await prisma.semester.update({
      where: { id: Number(semesterId) },
      data: { isArchived: true },
    });
    res.status(200).json(archivedSemester);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//unarchive a semester
exports.unarchiveSemester = async (req, res) => {
  const { semesterId } = req.params;
  try {
    if (!semesterId) {
      return res.status(400).json({ error: 'Semester ID is required' });
    }
    const unarchivedSemester = await prisma.semester.update({
      where: { id: Number(semesterId) },
      data: { isArchived: false },
    });
    res.status(200).json(unarchivedSemester);
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

exports.getSemesterCourses = async (req, res) => {
  const { semesterId } = req.params;
  
  if (!semesterId) {
    return res.status(400).json({ error: 'Semester ID is required' });
  }
  
  try {
    const coursesInSemester = await prisma.course.findMany({
      where: {
        // Find courses that are part of the given semester
        semesters: {
          some: {
            id: parseInt(semesterId),
          },
        },
      },
      // For each course found, include its teacher assignment details
      include: {
        // This is the relation from the Course model
        semesterCourseTeachers: {
          // IMPORTANT: Only include the assignment for the CURRENT semester
          where: {
            semesterId: parseInt(semesterId),
          },
          // And include the teacher's name from that assignment
          include: {
            teacher: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
          name: 'asc' // Optional: sort courses alphabetically
      }
    });

    res.json(coursesInSemester);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch semester courses' });
  }
// }
}

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
        semesters: {
          disconnect: { id: Number(semesterId) }, // 👈 this removes the link in the join table
        },
      },
    });

    res.status(200).json({ message: 'Course removed from semester successfully.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.assignTeacherToCourse = async (req, res) => {
  const { semesterId, courseId, teacherId } = req.body;

  try {
    if (!semesterId || !courseId || !teacherId) {
      return res.status(400).json({ error: 'semesterId, courseId, and teacherId are required.' });
    }

    // Optional: Check if the relation already exists to prevent duplicates
    const existing = await prisma.semesterCourseTeacher.findUnique({
      where: {
        semesterId_courseId: {
          semesterId: Number(semesterId),
          courseId: Number(courseId),
        },
      },
    });

    if (existing) {
      // remove the previous assignment
      await prisma.semesterCourseTeacher.delete({
        where: {
          id: existing.id,
        },
      });

      // return res.status(400).json({ error: 'This course already has a teacher assigned for this semester.' });
    }

    // Create the assignment
    const assignment = await prisma.semesterCourseTeacher.create({
      data: {
        semester: { connect: { id: Number(semesterId) } },
        course:   { connect: { id: Number(courseId) } },
        teacher:  { connect: { id: Number(teacherId) } },
      },
    });

    res.status(201).json({
      message: 'Teacher assigned to course successfully.',
      assignment,
    });
  } catch (error) {
    console.error('Error assigning teacher to course:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};