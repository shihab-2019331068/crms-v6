const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const semesterController = require('../controllers/semesterController');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Configure multer for file uploads
const multer = require('multer');
const storage = multer.memoryStorage(); // Use memory storage for efficiency
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB file size limit
});

router.post(
  '/add-semester',
  authenticateToken,
  authorizeRoles('department_admin', 'teacher'),
  semesterController.addSemester
);

router.delete(
  '/delete-semester/:semesterId',
  authenticateToken,
  authorizeRoles('department_admin', 'teacher'),
  semesterController.deleteSemester
);

// archive semester
router.post(
  '/archive-semester/:semesterId',
  authenticateToken,
  authorizeRoles('department_admin', 'teacher'),
  semesterController.archiveSemester
);

// unarchive semester
router.post(
  '/unarchive-semester/:semesterId',
  authenticateToken,
  authorizeRoles('department_admin', 'teacher'),
  semesterController.unarchiveSemester
);

router.post(
  '/add-semesterCourseTeacher',
  authenticateToken,
  authorizeRoles('department_admin', 'teacher'),
  semesterController.assignTeacherToCourse
);

router.get(
  '/get-semester-courses/:semesterId',
  authenticateToken,
  authorizeRoles('department_admin', 'teacher'),
  semesterController.getSemesterCourses
);

// [NEW] Add courses to a semester via CSV upload
router.post(
  '/dashboard/department-admin/semester/course/upload-csv',
  authenticateToken,
  authorizeRoles('department_admin', 'super_admin'),
  upload.single('file'), // Multer middleware to handle single file upload with field name 'file'
  semesterController.addCoursesFromCSV
);

// Remove course from semester (Department Admin only)
router.delete(
  '/semester/:semesterId/course/:courseId',
  authenticateToken,
  authorizeRoles('department_admin', 'super_admin'),
  semesterController.removeCourseFromSemester
);


// Set the session of a semester (Department Admin only)
router.post(
  '/semester/set-session',
  authenticateToken,
  authorizeRoles('department_admin', 'super_admin'),
  semesterController.setSemesterSession
);

module.exports = router;