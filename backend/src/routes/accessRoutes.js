const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const accessController = require('../controllers/accessController');


// Grant access to a user (Super Admin only)
router.post(
  '/grant-access',
  authenticateToken,
  authorizeRoles('super_admin', 'department_admin', 'teacher'),
  accessController.grantAccess
);

// Remove access from a user (Super Admin only)
router.post(
  '/remove-access',
  authenticateToken,
  authorizeRoles('super_admin', 'department_admin', 'teacher'),
  accessController.removeAccess
);

module.exports = router;