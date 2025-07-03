const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const deptResourceController = require('../controllers/deptResourceController');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.post(
  '/lab/:labId/status',
  authenticateToken,
  authorizeRoles('super_admin', 'department_admin', 'teacher'),
  deptResourceController.updateLabStatus
);

router.post(
  '/lab/:labId/capacity',
  authenticateToken,
  authorizeRoles('super_admin', 'department_admin', 'teacher'),
  deptResourceController.updateLabCapacity
);

module.exports = router;