const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const csv = require('csv-parser');
const { Readable } = require('stream');

// NOTE: To handle CSV uploads, ensure you have 'multer' or a similar file-handling middleware configured for the corresponding route.
// e.g., router.post('/courses/csv', upload.single('csvFile'), courseController.addCoursesFromCSV);

// Department Admin: Add Course (must specify department, teacherId is not required)
exports.addCourse = async (req, res) => {
  const { name, code, credits, departmentId, isMajor, forDept, type } = req.body;
  const user = req.user;
  try {
    // Validate required fields
    if (!name || !code || !departmentId) {
      return res.status(400).json({ error: 'name, code, and departmentId are required.' });
    }
    if (typeof isMajor !== 'boolean') {
      return res.status(400).json({ error: 'isMajor (boolean) is required.' });
    }
    if (!forDept) {
      return res.status(400).json({ error: 'forDept (int) is required.' });
    }
    // Fetch the admin's user record to ensure they are authorized (optional but good practice)
    const admin = await prisma.user.findUnique({
      where: { id: user.userId },
    });
    if (admin.role !== 'super_admin' && admin.departmentId !== departmentId) {
        return res.status(403).json({ error: 'You are not authorized to add courses to this department.' });
    }

    // Create the course in the specified department
    const course = await prisma.course.create({
      data: {
        name,
        code,
        credits,
        departmentId,
        isMajor,
        forDept,
        type
      },
    });
    res.status(201).json(course);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// NEW: Department Admin: Add multiple courses from a CSV file
// Suggested Route: POST /dashboard/department-admin/courses/csv
exports.addCoursesFromCSV = async (req, res) => {
    const user = req.user;
    const departmentId = parseInt(req.body.departmentId, 10);
  
    if (!req.file) {
      return res.status(400).json({ error: 'No CSV file uploaded.' });
    }
    if (!departmentId) {
      return res.status(400).json({ error: 'Department ID is required.' });
    }
  
    // Authorization: check if user is admin of the target department or super_admin
    const admin = await prisma.user.findUnique({ where: { id: user.userId } });
    if (admin.role !== 'super_admin' && admin.departmentId !== departmentId) {
      return res.status(403).json({ error: 'You are not authorized to add courses to this department.' });
    }
  
    const coursesToAdd = [];
    const errors = [];
    
    // Fetch all departments to map acronyms to IDs for the 'forDept' column
    const departments = await prisma.department.findMany({ select: { id: true, acronym: true } });
    const deptMap = new Map(departments.map(d => [d.acronym, d.id]));
    
    const buffer = req.file.buffer;
    const stream = Readable.from(buffer.toString());
  
    stream
      .pipe(csv())
      .on('data', (row) => {
        const { name, code, credits, type, isMajor, forDeptAcronym } = row;
        if (!name || !code || !credits || !type || !isMajor) {
          errors.push(`Invalid data for course code ${code || 'N/A'}: missing required fields (name, code, credits, type, isMajor).`);
          return;
        }
        
        const isMajorBool = isMajor.toLowerCase() === 'true';
        let forDeptId;
        
        if (isMajorBool) {
          forDeptId = departmentId;
        } else {
          if (!forDeptAcronym || !deptMap.has(forDeptAcronym)) {
              errors.push(`Invalid or missing 'forDeptAcronym' for non-major course with code ${code}.`);
              return;
          }
          forDeptId = deptMap.get(forDeptAcronym);
        }
        
        coursesToAdd.push({
          name,
          code,
          credits: parseFloat(credits),
          type,
          isMajor: isMajorBool,
          forDept: forDeptId,
          departmentId: departmentId,
        });
      })
      .on('end', async () => {
        if (errors.length > 0) {
          return res.status(400).json({ error: 'Errors found in CSV file', details: errors });
        }
  
        try {
          const result = await prisma.course.createMany({
            data: coursesToAdd,
            skipDuplicates: true, // Skip if a course with a unique constraint (e.g., code) already exists
          });
          res.status(201).json({ message: `${result.count} of ${coursesToAdd.length} courses added successfully. Duplicates were skipped.` });
        } catch (error) {
          res.status(500).json({ error: 'Failed to add courses to the database.', details: error.message });
        }
      })
      .on('error', (error) => {
          res.status(500).json({ error: 'Error parsing CSV file.', details: error.message });
      });
  };

// Department Admin: Get all courses for own department (active or archived)
exports.getCourses = async (req, res) => {
  const reqDeptId = Number(req.query.departmentId);
  const showArchived = req.query.isArchived === 'true'; // Check for archived flag

  
  try {
    const courses = await prisma.course.findMany({
      where: {
        AND: [
            { isArchived: showArchived }, // Filter by archived status
            {
                OR: [
                  { forDept: reqDeptId },
                  { departmentId: reqDeptId }
                ]
            }
        ]
      },
    });
    res.status(200).json(courses);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Department Admin: Delete a Course (only from own department)
exports.deleteCourse = async (req, res) => {
  const { courseId } = req.body;
  const user = req.user;
  try {
    if (!courseId) {
      return res.status(400).json({ error: 'courseId is required.' });
    }
    // Authorization Check
    const admin = await prisma.user.findUnique({ where: { id: user.userId } });
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
        return res.status(404).json({ error: 'Course not found.' });
    }
    if (admin.role !== 'super_admin' && admin.departmentId !== course.departmentId) {
        return res.status(403).json({ error: 'You are not authorized to delete this course.' });
    }

    // Delete teachers assigned to the course
    await prisma.semesterCourseTeacher.deleteMany({ where: { courseId } });

    // Delete the course
    await prisma.course.delete({ where: { id: courseId } });
    res.status(200).json({ message: 'Course deleted successfully.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Department Admin: Assign Teacher to Course
exports.assignTeacherToCourse = async (req, res) => {
  const { courseId, teacherId } = req.body;
  try {
    if (!courseId || !teacherId) {
      return res.status(400).json({ error: 'courseId and teacherId are required.' });
    }
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) {
      return res.status(404).json({ error: 'Course not found.' });
    }
    const teacher = await prisma.user.findUnique({
      where: { id: teacherId },
    });
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(400).json({ error: 'Teacher not found or is not a teacher.' });
    }
    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: { teacherId },
    });
    res.status(200).json(updatedCourse);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Department Admin: Get all courses for a specific semester (only for own department)
exports.getCoursesForSemester = async (req, res) => {
  const { semesterId } = req.params;
  try {
    if (!semesterId) {
      return res.status(400).json({ error: 'semesterId is required.' });
    }
    const semester = await prisma.semester.findUnique({
      where: { id: Number(semesterId) },
      include: { courses: { where: { isArchived: false } }, forDept: true }, // Only include active courses in a semester
    });
    res.status(200).json(semester.courses);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


// NEW: Department Admin: Archive a Course
// Suggested Route: PATCH /dashboard/department-admin/course/archive
exports.archiveCourse = async (req, res) => {
    const { courseId } = req.body;
    const user = req.user;
    try {
      if (!courseId) {
        return res.status(400).json({ error: 'courseId is required.' });
      }
      const admin = await prisma.user.findUnique({ where: { id: user.userId } });
      const course = await prisma.course.findUnique({ where: { id: courseId } });
      if (!course) {
        return res.status(404).json({ error: 'Course not found.' });
      }
      if (admin.role !== 'super_admin' && admin.departmentId !== course.departmentId) {
        return res.status(403).json({ error: 'You are not authorized to archive this course.' });
      }
      
      const updatedCourse = await prisma.course.update({
        where: { id: courseId },
        data: { isArchived: true },
      });

      res.status(200).json({ message: 'Course archived successfully.', course: updatedCourse });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
};

// NEW: Department Admin: Unarchive a Course
// Suggested Route: PATCH /dashboard/department-admin/course/unarchive
exports.unarchiveCourse = async (req, res) => {
    const { courseId } = req.body;
    const user = req.user;

    try {
      if (!courseId) {
        return res.status(400).json({ error: 'courseId is required.' });
      }
      const admin = await prisma.user.findUnique({ where: { id: user.userId } });
      const course = await prisma.course.findUnique({ where: { id: courseId } });
      if (!course) {
        return res.status(404).json({ error: 'Course not found.' });
      }
      if (admin.role !== 'super_admin' && admin.departmentId !== course.departmentId) {
        return res.status(403).json({ error: 'You are not authorized to unarchive this course.' });
      }
      
      const updatedCourse = await prisma.course.update({
        where: { id: courseId },
        data: { isArchived: false },
      });

      res.status(200).json({ message: 'Course unarchived successfully.', course: updatedCourse });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
};