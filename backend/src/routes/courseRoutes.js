const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const courseController = require('../controllers/courseController');

// 1. --- Import and Configure Multer ---
const multer = require('multer');
// Use memoryStorage to temporarily store the file in memory as a buffer.
// This is perfect for parsing it right away without saving it to disk.
const storage = multer.memoryStorage(); 
const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        // Optional: Add a filter to only accept .csv files
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
            cb(null, true);
        } else {
            cb(new Error('Only .csv files are allowed!'), false);
        }
    }
});

// Add new course (Department Admin only)
router.post(
  '/add-course',
  authenticateToken,
  authorizeRoles('department_admin', 'super_admin'),
  courseController.addCourse
);

// Add multiple courses from a CSV file (Department Admin only)
router.post(
  '/add-courses-from-csv',
  authenticateToken,
  authorizeRoles('department_admin', 'super_admin'),
  upload.single('csvFile'), // <-- THIS IS THE FIX
  courseController.addCoursesFromCSV
);

// Get all courses for department admin
router.get(
  '/get-courses',
  authenticateToken,
  authorizeRoles('department_admin', 'super_admin'),
  courseController.getCourses
);


// Delete a course (Department Admin only)
router.delete(
  '/delete-course',
  authenticateToken,
  authorizeRoles('department_admin', 'super_admin'),
  courseController.deleteCourse
);

// --- START: ADDED ROUTE ---
// Delete all courses for a department (Department Admin only)
router.delete(
    '/delete-all-courses',
    authenticateToken,
    authorizeRoles('department_admin', 'super_admin'),
    courseController.deleteAllCourses
);
// --- END: ADDED ROUTE ---

// Archive a course (Department Admin only)
router.patch(
  '/archive-course',
  authenticateToken,
  authorizeRoles('department_admin', 'teacher'),
  courseController.archiveCourse
);

// Unarchive a course (Department Admin only)
router.patch(
  '/unarchive-course',
  authenticateToken,
  authorizeRoles('department_admin', 'teacher'),
  courseController.unarchiveCourse
);

module.exports = router;