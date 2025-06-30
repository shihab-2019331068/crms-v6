const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const teacherController = require('../controllers/teacherController');

// Teacher dashboard
router.get('/dashboard/teacher', authenticateToken, authorizeRoles('teacher'), (req, res) => {
  res.json({ message: 'Teacher dashboard data' });
});

// Route to get courses of a teacher
router.get('/teacher/:teacherId/courses', authenticateToken, authorizeRoles('teacher', 'super_admin', 'department_admin'), teacherController.getTeacherCourses);

module.exports = router;
