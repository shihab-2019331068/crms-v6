const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all rooms (Prisma)
router.get('/rooms', async (req, res) => {
  try {
    const rooms = await prisma.room.findMany({
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

// Get user details by email (Prisma)
router.get('/user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const { passwordHash, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: error.message });
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

// Get all labs (Prisma)
router.get('/labs', async (req, res) => {
  try {
    const labs = await prisma.lab.findMany({
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

// Get teachers by department (Prisma)
router.get('/teachers', async (req, res) => {
  try {
    const { departmentId } = req.query;
    const whereClause = {};
    const teachers = await prisma.user.findMany({
      where: { role: "teacher", ...whereClause },
    });
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;