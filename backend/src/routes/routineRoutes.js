const express = require('express');
const router = express.Router();
const routineController = require('../controllers/routineController');

// Get weekly schedule by room
router.get('/routine/room/:roomId', routineController.getByRoom);
// Get weekly schedule by semester
router.get('/routine/semester/:semesterId', routineController.getBySemester);
// Get weekly schedule by teacher
router.get('/routine/teacher/:teacherId', routineController.getByTeacher);
// Get weekly schedule by course
router.get('/routine/course/:courseId', routineController.getByCourse);
// Preview generated weekly routine for a department (does not save to DB)
router.post('/routine/preview', routineController.previewWeeklyRoutine);
// Get final routine for a department (read-only)
router.get('/routine/final', routineController.getFinalRoutine);
// Save finalized weekly routine
router.post('/routine/generate', routineController.generateWeeklyRoutine);

module.exports = router;
