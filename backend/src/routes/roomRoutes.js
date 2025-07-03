const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const deptResourceController = require('../controllers/deptResourceController');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.post(
  '/room/:roomId/status',
  authenticateToken,
  authorizeRoles('super_admin', 'department_admin', 'teacher'),
  deptResourceController.updateRoomStatus
);

router.post(
  '/room/:roomId/capacity',
  authenticateToken,
  authorizeRoles('super_admin', 'department_admin', 'teacher'),
  deptResourceController.updateRoomCapacity
);

module.exports = router;