const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const semesterController = require('../controllers/semesterController');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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