const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const studentController = require('../controllers/studentController');

// Student dashboard
router.get('/dashboard/student', authenticateToken, authorizeRoles('student'), (req, res) => {
  res.json({ message: 'Student dashboard data' });
});

// Student: Get all current courses in their semester (same department and session)
router.get(
  '/student/:studentId/courses',
  authenticateToken,
  authorizeRoles('student'),
  studentController.getStudentCourses
);

module.exports = router;
