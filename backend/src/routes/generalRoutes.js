// --- START OF FILE generalRoutes.js ---
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const superAdminController = require('../controllers/superAdminController');
const userController = require('../controllers/userController');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


// Get all users (Super Admin only)
router.get(
  '/users',
  authenticateToken,
  authorizeRoles('super_admin', 'department_admin', 'teacher'),
  superAdminController.getAllUsers
);

// Get department users
router.get(
  '/department/:departmentId/users',
  authenticateToken,
  authorizeRoles('super_admin', 'department_admin', 'teacher'),
  userController.getDeptUsers
)

// Get all rooms (Prisma) - MODIFIED
router.get('/rooms', async (req, res) => {
  try {
    const { departmentId } = req.query;
    const whereClause = departmentId ? { departmentId: parseInt(departmentId, 10) } : {};

    const rooms = await prisma.room.findMany({
      where: whereClause,
      include: {
        department: {
          select: { acronym: true }
        }
      }
    });
    // Map to include departmentAcronym at top level
    const roomsWithAcronym = rooms.map(room => ({
      ...room,
      departmentAcronym: room.department?.acronym || null,
      department: undefined // Remove nested department
    }));
    res.json(roomsWithAcronym);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all departments (Prisma)
router.get('/departments', async (req, res) => {
  try {
    const departments = await prisma.department.findMany();
    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user details by email (Prisma) - REVISED
router.get('/user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        // Include the related department to get its name
        department: {
          select: {
            name: true,
            id: true,
            acronym: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Destructure to remove sensitive data and the nested department object
    const { passwordHash, department, departmentId, ...userWithoutPassword } = user;

    // Create a response object that matches the frontend's expectations.
    // The `department` field is flattened to a string, and fallbacks are provided.
    const userDetails = {
      ...userWithoutPassword,
      department: department?.name || 'N/A',
      regNo: user.regNo || 'N/A',
      mobile: user.mobile || 'N/A',
      degree: user.degree || 'N/A',
      school: user.school || 'N/A',
      semester: user.semester || 'N/A',
      session: user.session || 'N/A',
      departmentId: department?.id || 'N/A',
      departmentAcronym: department?.acronym || 'N/A',
    };

    res.json(userDetails);
  } catch (error) {
    console.error('API Error fetching user by email:', error);
    res.status(500).json({ error: 'Failed to retrieve user details from the server.' });
  }
});

// Get department by ID (Prisma)
router.get('/department/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const department = await prisma.department.findUnique({
      where: { id: parseInt(id, 10) },
    });
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }
    res.json(department);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all labs (Prisma) - MODIFIED
router.get('/labs', async (req, res) => {
  try {
    const { departmentId } = req.query;
    const whereClause = departmentId ? { departmentId: parseInt(departmentId, 10) } : {};
    
    const labs = await prisma.lab.findMany({
      where: whereClause,
      include: {
        department: {
          select: { acronym: true }
        }
      }
    });
    // Map to include departmentAcronym at top level
    const labsWithAcronym = labs.map(lab => ({
      ...lab,
      departmentAcronym: lab.department?.acronym || null,
      department: undefined // Remove nested department
    }));
    res.json(labsWithAcronym);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get semesters by department (Prisma)
router.get('/semesters', async (req, res) => {
  try {
    const { departmentId } = req.query;
    const whereClause = departmentId ? { departmentId: parseInt(departmentId, 10) } : {};
    const semesters = await prisma.semester.findMany({
      where: whereClause,
    });
    res.json(semesters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get courses by department (Prisma)
router.get('/courses', async (req, res) => {
  try {
    const { departmentId } = req.query;
    const whereClause = departmentId ? { forDept: parseInt(departmentId, 10) } : {};
    const courses = await prisma.course.findMany({
      where: whereClause,
    });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get teachers by department (Prisma) - MODIFIED
router.get('/teachers', async (req, res) => {
  try {
    const { departmentId } = req.query;
    const whereClause = departmentId ? { departmentId: parseInt(departmentId, 10) } : {};
    const teachers = await prisma.user.findMany({
      where: { 
        role: "teacher", 
        ...whereClause 
      },
      select: {
          id: true,
          name: true,
      }
    });
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;