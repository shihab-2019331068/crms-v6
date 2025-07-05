const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const courseController = require('../controllers/courseController');
const semesterController = require('../controllers/semesterController');
const routineController = require('../controllers/routineController');
const deptResourceController = require('../controllers/deptResourceController');

// Department Admin dashboard
router.get('/dashboard/department-admin', authenticateToken, authorizeRoles('department_admin'), (req, res) => {
  res.json({ message: 'Department Admin dashboard data' });
});

// Add new semester (Department Admin only)
router.post(
  '/dashboard/department-admin/semester',
  authenticateToken,
  authorizeRoles('department_admin', 'super_admin'),
  semesterController.addSemester
);


// Add course to semester (Department Admin only)
router.post(
  '/dashboard/department-admin/semester/course',
  authenticateToken,
  authorizeRoles('department_admin', 'super_admin'),
  semesterController.addCourseToSemester
);


// Get all semesters for department admin
router.get(
  '/dashboard/department-admin/semesters',
  authenticateToken,
  authorizeRoles('department_admin', 'super_admin'),
  semesterController.getSemesters
);


// Get all rooms for department admin
router.get(
  '/dashboard/department-admin/rooms',
  authenticateToken,
  authorizeRoles('department_admin', 'super_admin'),
  deptResourceController.getRooms
);


// Get all courses for a specific semester (Department Admin only)
router.get(
  '/dashboard/department-admin/semester/:semesterId/courses',
  authenticateToken,
  authorizeRoles('department_admin', 'super_admin'),
  courseController.getCoursesForSemester
);

// Get all teachers for department admin
router.get(
  '/dashboard/department-admin/teachers',
  authenticateToken,
  authorizeRoles('department_admin', 'super_admin'),
  deptResourceController.getTeachers
);




module.exports = router;
