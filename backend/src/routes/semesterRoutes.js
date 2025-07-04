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

// router.delete(
//   '/delete-semester/:semesterId',
//   authenticateToken,
//   authorizeRoles('department_admin', 'teacher'),
//   semesterController.deleteSemester
// );

router.post(
  '/add-semesterCourseTeacher',
  authenticateToken,
  authorizeRoles('department_admin', 'teacher'),
  semesterController.assignTeacherToCourse
);

module.exports = router;