const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const superAdminController = require('../controllers/superAdminController');

// Super Admin dashboard
router.get('/dashboard/super-admin', authenticateToken, authorizeRoles('super_admin'), (req, res) => {
  res.json({ message: 'Super Admin dashboard data' });
});

// Add new department (Super Admin only)
router.post(
  '/dashboard/super-admin/department',
  authenticateToken,
  authorizeRoles('super_admin'),
  superAdminController.addDepartment
);

// Add new room (Super Admin only)
router.post(
  '/dashboard/super-admin/room',
  authenticateToken,
  authorizeRoles('super_admin'),
  superAdminController.addRoom
);

// Add new lab (Super Admin only)
router.post(
  '/dashboard/super-admin/lab',
  authenticateToken,
  authorizeRoles('super_admin'),
  superAdminController.addLab
);

// Delete department (Super Admin only)
router.delete(
  '/dashboard/super-admin/department/:id',
  authenticateToken,
  authorizeRoles('super_admin'),
  superAdminController.deleteDepartment
);

// Get all users (Super Admin only)
router.get(
  '/dashboard/super-admin/users',
  authenticateToken,
  authorizeRoles('super_admin'),
  superAdminController.getAllUsers
);

// Delete user (Super Admin only)
router.delete(
  '/dashboard/super-admin/user/:id',
  authenticateToken,
  authorizeRoles('super_admin'),
  superAdminController.deleteUser
);

module.exports = router;
