// --- START OF FILE routineRoutes.js ---

// --- START OF FILE routineRoutes.js ---
const express = require('express');
const router = express.Router();
const routineController = require('../controllers/routineController');

// Get weekly schedule by room, semester, teacher, course
router.get('/routine/room/:roomId', routineController.getByRoom);
router.get('/routine/semester/:semesterId', routineController.getBySemester);
router.get('/routine/teacher/:teacherId', routineController.getByTeacher);
router.get('/routine/course/:courseId', routineController.getByCourse);

// --- CORE WORKFLOW ROUTES ---
// Preview generated weekly routine for a department (does not save to DB)
router.post('/routine/preview', routineController.previewWeeklyRoutine);
// Save a finalized weekly routine (replaces existing for that semester)
router.post('/routine/generate', routineController.generateWeeklyRoutine);
// Get final routine for a department (read-only, populated with details)
router.get('/routine/final', routineController.getFinalRoutine);

// --- MANUAL MANAGEMENT ROUTES ---
// Add a single manual entry to the schedule
router.post('/routine/entry', routineController.addWeeklyScheduleEntry);
// **NEW**: Cancel a single entry from the schedule
router.patch('/routine/entry/:entryId/cancel', routineController.cancelWeeklyScheduleEntry);
// **NEW**: Cancel a single entry from the schedule
router.patch('/routine/entry/:entryId/uncancel', routineController.uncancelWeeklyScheduleEntry);
// Delete a single entry from the schedule
router.delete('/routine/entry/:entryId', routineController.deleteWeeklyScheduleEntry);
// Delete all dept schedule
router.delete('/routine/department/:departmentId', routineController.deleteAllWeeklyScheduleEntries);


// --- STUDENT-SPECIFIC ROUTE ---
router.get('/routine/student/:studentId', routineController.getStudentRoutine);


module.exports = router;