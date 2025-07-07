// --- START OF FILE routineController.js ---
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get weekly schedule by room
exports.getByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const schedules = await prisma.weeklySchedule.findMany({
      where: { roomId: Number(roomId) },
      include: { course: true, lab: true, semester: true, room: true },
    });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get weekly schedule by semester
exports.getBySemester = async (req, res) => {
  try {
    const { semesterId } = req.params;
    const schedules = await prisma.weeklySchedule.findMany({
      where: { semesterId: Number(semesterId) },
      include: { course: true, lab: true, semester: true, room: true },
    });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get weekly schedule by teacher
exports.getByTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const schedules = await prisma.weeklySchedule.findMany({
      where: { teacherId: Number(teacherId) },
      include: { course: true, lab: true, semester: true, room: true },
    });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get weekly schedule by course
exports.getByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const schedules = await prisma.weeklySchedule.findMany({
      where: { courseId: Number(courseId) },
      include: { course: true, lab: true, semester: true, room: true },
    });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// **UPDATED**: Save generated weekly routine for specific semesters
exports.generateWeeklyRoutine = async (req, res) => {
  const { routine, semesterIds, departmentId } = req.body;

  if (!Array.isArray(routine) || !Array.isArray(semesterIds) || semesterIds.length === 0 || !departmentId) {
    return res.status(400).json({ error: 'Routine array, semesterIds array, and departmentId are required.' });
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Delete all existing weeklySchedules for the specific semesters in the department
      await tx.weeklySchedule.deleteMany({
        where: {
          departmentId: Number(departmentId),
          semesterId: {
            in: semesterIds.map(id => Number(id))
          }
        }
      });

      // Save all new entries in bulk, if any
      if (routine.length > 0) {
        await tx.weeklySchedule.createMany({ data: routine });
      }
    });

    res.status(201).json({ message: 'Routine saved successfully for the selected semesters.' });
  } catch (error) {
    console.error("Error saving routine:", error);
    res.status(500).json({ error: "Failed to save routine. " + error.message });
  }
};

// **UPDATED**: Preview generated weekly routine for a department and selected semesters
exports.previewWeeklyRoutine = async (req, res) => {
  const { departmentId, semesterIds } = req.body;
  if (!departmentId || !Array.isArray(semesterIds) || semesterIds.length === 0) {
    return res.status(400).json({ error: 'departmentId and a non-empty semesterIds array are required.' });
  }

  try {
    const courseTeacherPairs = await prisma.semesterCourseTeacher.findMany({
      where: {
        semesterId: { in: semesterIds.map(id => Number(id)) },
        course: { isMajor: true },
      },
      include: { course: true },
    });

    if (!courseTeacherPairs.length) {
      return res.status(404).json({
        error: 'No major courses with assigned teachers found for the selected semesters.'
      });
    }

    const theoryRooms = await prisma.room.findMany({ where: { departmentId: Number(departmentId), status: 'AVAILABLE' } });
    const labRooms = await prisma.lab.findMany({ where: { departmentId: Number(departmentId), status: 'AVAILABLE' } });

    if (!theoryRooms.length && !labRooms.length) {
        return res.status(404).json({ error: 'No available rooms or labs found for this department.' });
    }

    const teacherBusy = {}, semesterBusy = {}, roomBusy = {}, labBusy = {};
    const classesToSchedule = [];

    // --- NEW LOGIC: Prepare class blocks with durations ---
    courseTeacherPairs.forEach(pair => {
      const { course, teacherId, semesterId } = pair;
      const baseClassInfo = {
        courseId: course.id, teacherId, semesterId, courseType: course.type,
        courseName: course.name, courseCode: course.code
      };
      
      if (course.type === 'LAB' && course.credits === 1.5) {
        classesToSchedule.push({ ...baseClassInfo, duration: 3 });
      } else if (course.type === 'LAB' && course.credits === 1.0) {
        classesToSchedule.push({ ...baseClassInfo, duration: 2 });
      } else {
        const requiredClasses = Math.ceil(course.credits);
        for (let i = 0; i < requiredClasses; i++) {
          classesToSchedule.push({ ...baseClassInfo, duration: 1 });
        }
      }
    });
    
    classesToSchedule.sort(() => Math.random() - 0.5);

    const routine = [];
    const unassignedLog = new Map();
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY'];
    const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];
    const timeSlotIndexes = Object.fromEntries(timeSlots.map((t, i) => [t, i]));

    for (const classToAssign of classesToSchedule) {
      let isAssigned = false;
      
      for (const day of days) {
        if (isAssigned) break;
        for (const time of timeSlots) {
          const startTimeIndex = timeSlotIndexes[time];
          if (startTimeIndex + classToAssign.duration > timeSlots.length) continue; // Not enough time left in the day

          // Check if block is free for teacher and semester
          let isBlockFree = true;
          for (let i = 0; i < classToAssign.duration; i++) {
            const slotToCheck = timeSlots[startTimeIndex + i];
            if (teacherBusy[classToAssign.teacherId]?.[day]?.includes(slotToCheck) ||
                semesterBusy[classToAssign.semesterId]?.[day]?.includes(slotToCheck)) {
              isBlockFree = false;
              break;
            }
          }
          if (!isBlockFree) continue;

          // Find an available room/lab for the entire duration
          let assignedRoomId = null;
          let assignedLabId = null;
          
          if (classToAssign.courseType === 'LAB') {
            const availableLab = labRooms.find(lab => {
              for (let i = 0; i < classToAssign.duration; i++) {
                if (labBusy[lab.id]?.[day]?.includes(timeSlots[startTimeIndex + i])) return false;
              }
              return true;
            });
            if (availableLab) assignedLabId = availableLab.id;
          } else {
            const availableRoom = theoryRooms.find(room => {
              for (let i = 0; i < classToAssign.duration; i++) {
                if (roomBusy[room.id]?.[day]?.includes(timeSlots[startTimeIndex + i])) return false;
              }
              return true;
            });
            if (availableRoom) assignedRoomId = availableRoom.id;
          }

          if (assignedRoomId || assignedLabId) {
            // Block is available, assign it and update all busy trackers
            const startTime = time;
            const endTime = `${String(Number(timeSlots[startTimeIndex + classToAssign.duration - 1].slice(0, 2)) + 1).padStart(2, '0')}:00`;

            routine.push({
              semesterId: classToAssign.semesterId,
              departmentId: Number(departmentId),
              dayOfWeek: day,
              startTime, endTime,
              courseId: classToAssign.courseId,
              teacherId: classToAssign.teacherId,
              roomId: assignedRoomId,
              labId: assignedLabId,
              isBreak: false,
            });

            // Update busy trackers for the entire block
            for (let i = 0; i < classToAssign.duration; i++) {
              const slotToBook = timeSlots[startTimeIndex + i];
              teacherBusy[classToAssign.teacherId] = { ...teacherBusy[classToAssign.teacherId], [day]: [...(teacherBusy[classToAssign.teacherId]?.[day] || []), slotToBook] };
              semesterBusy[classToAssign.semesterId] = { ...semesterBusy[classToAssign.semesterId], [day]: [...(semesterBusy[classToAssign.semesterId]?.[day] || []), slotToBook] };
              if (assignedLabId) {
                labBusy[assignedLabId] = { ...labBusy[assignedLabId], [day]: [...(labBusy[assignedLabId]?.[day] || []), slotToBook] };
              }
              if (assignedRoomId) {
                roomBusy[assignedRoomId] = { ...roomBusy[assignedRoomId], [day]: [...(roomBusy[assignedRoomId]?.[day] || []), slotToBook] };
              }
            }
            
            isAssigned = true;
            break; // Move to next class
          }
        }
      }
       if (!isAssigned) {
          unassignedLog.set(classToAssign.courseId, { name: classToAssign.courseName, code: classToAssign.courseCode });
      }
    }

    const unassigned = Array.from(unassignedLog.values());
    res.status(200).json({ routine, unassigned });

  } catch (error) {
    console.error("Error generating routine preview:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get the final routine for a department (read-only, for display)
exports.getFinalRoutine = async (req, res) => {
  const { departmentId } = req.query;
  if (!departmentId) {
    return res.status(400).json({ error: 'departmentId is required.' });
  }
  try {
    const routine = await prisma.weeklySchedule.findMany({
      where: { departmentId: Number(departmentId) },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
      include: {
          course: { select: { code: true, name: true } },
          teacher: { select: { name: true } },
          room: { select: { roomNumber: true } },
          lab: { select: { labNumber: true } },
          semester: { select: { shortname: true } }
      }
    });
    res.status(200).json({ routine });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// **NEW**: Manually add a single weekly schedule entry
exports.addWeeklyScheduleEntry = async (req, res) => {
    const {
        departmentId, semesterId, dayOfWeek, startTime, endTime, courseId,
        teacherId, roomId, labId, isBreak, breakName
    } = req.body;

    try {
        if (!departmentId || !semesterId || !dayOfWeek || !startTime || !endTime) {
            return res.status(400).json({ error: 'Core fields are missing.' });
        }

        const conflictingSlot = await prisma.weeklySchedule.findFirst({
            where: {
                dayOfWeek,
                startTime,
                OR: [
                    { teacherId: teacherId || undefined },
                    { roomId: roomId || undefined },
                    { labId: labId || undefined },
                    { semesterId: semesterId }
                ]
            }
        });
        
        if (conflictingSlot) {
            let conflictSource = "semester";
            if (conflictingSlot.teacherId === teacherId) conflictSource = "teacher";
            if (conflictingSlot.roomId === roomId) conflictSource = "room";
            if (conflictingSlot.labId === labId) conflictSource = "lab";
            return res.status(409).json({ error: `Conflict found. The selected ${conflictSource} is already busy at this time.` });
        }

        const newEntry = await prisma.weeklySchedule.create({
            data: {
                departmentId, semesterId, dayOfWeek, startTime, endTime,
                courseId: courseId || null,
                teacherId: teacherId || null,
                roomId: roomId || null,
                labId: labId || null,
                isBreak: isBreak || false,
                breakName: breakName || null
            }
        });

        res.status(201).json(newEntry);
    } catch (error) {
        console.error("Error adding schedule entry:", error);
        res.status(500).json({ error: "An internal error occurred." });
    }
};

// **NEW**: Delete a single weekly schedule entry
exports.deleteWeeklyScheduleEntry = async (req, res) => {
    const { entryId } = req.params;
    try {
        await prisma.weeklySchedule.delete({
            where: { id: Number(entryId) }
        });
        res.status(200).json({ message: "Entry deleted successfully." });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Entry not found.' });
        }
        res.status(500).json({ error: "Failed to delete entry." });
    }
};


// Get a specific student's weekly routine (REVISED LOGIC)
exports.getStudentRoutine = async (req, res) => {
  const { studentId } = req.params;
  
  try {
    const student = await prisma.user.findUnique({
      where: { id: Number(studentId) },
      select: { session: true, departmentId: true, name: true, role: true }
    });
    
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found.' });
    }
    if (!student.session || !student.departmentId) {
      return res.status(404).json({ message: 'Student is not assigned to a session or department.' });
    }
    
    // Find the student's current semester based on their session and department
    const semester = await prisma.semester.findFirst({
      where: {
        session: student.session,
        departmentId: student.departmentId,
        // Optional: you might want to only find an 'active' semester
        // status: 'ACTIVE', 
      },
      select: { id: true, name: true, session: true }
    });

    if (!semester) {
      // This is a clear message if the semester itself can't be found
      return res.status(200).json({ routine: [], student, semester: null, message: 'Could not determine your current semester schedule.' });
    }

    // --- ** FIX: Fetch ALL entries for the student's semester ---
    // This no longer depends on the enrollment table. It shows the full
    // schedule for the semester the student belongs to.
    const routine = await prisma.weeklySchedule.findMany({
      where: {
        semesterId: semester.id,
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
      include: {
        course: { select: { code: true, name: true } },
        teacher: { select: { name: true } },
        room: { select: { roomNumber: true } },
        lab: { select: { labNumber: true } }
      }
    });

    res.status(200).json({ routine, student, semester });

  } catch (error) {
    console.error("Error fetching student routine:", error);
    res.status(500).json({ error: 'Failed to fetch student routine.' });
  }
};