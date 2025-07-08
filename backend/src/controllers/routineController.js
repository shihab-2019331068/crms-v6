// --- START OF FILE routineController.js ---

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

// **UPDATED**: Get weekly schedule by teacher, including teacher's details
exports.getByTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const id = Number(teacherId);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid teacherId' });
    }
    
    const teacher = await prisma.user.findUnique({
        where: { id: id },
        select: { name: true, department: { select: { name: true } } }
    });

    if (!teacher) {
        return res.status(404).json({ message: "Teacher not found." });
    }

    const routine = await prisma.weeklySchedule.findMany({
      where: { teacherId: id },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
      include: { 
          course: { select: { code: true, name: true } },
          teacher: { select: { name: true } },
          room: { select: { roomNumber: true } },
          lab: { select: { labNumber: true } },
          semester: { select: { shortname: true } }
      },
    });
    
    res.status(200).json({ routine, teacher });
  } catch (error) {
    console.error("Error fetching teacher routine:", error);
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

// --- In routineController.js ---

// ... (keep all other functions as they are) ...

// **UPDATED**: Preview generated weekly routine with advanced constraints
exports.previewWeeklyRoutine = async (req, res) => {
  const { departmentId, semesterIds, nonMajorCourseSlots, preferredBreakTime } = req.body;

  if (!departmentId || !Array.isArray(semesterIds) || semesterIds.length === 0) {
    return res.status(400).json({ error: 'departmentId and a non-empty semesterIds array are required.' });
  }
  if (!preferredBreakTime) {
    return res.status(400).json({ error: 'preferredBreakTime is required.' });
  }

  try {
    // --- Fetch required data (same as before) ---
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

    // --- Prepare class blocks (same as before) ---
    const classesToSchedule = [];
    courseTeacherPairs.forEach(pair => {
      const { course, teacherId, semesterId } = pair;
      const baseClassInfo = {
        courseId: course.id, teacherId, semesterId, courseType: course.type,
        courseName: course.name, courseCode: course.code, departmentId: Number(departmentId)
      };
      
      if (course.type === 'LAB' && course.credits > 1.0) {
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
    
    // --- MODIFIED: Smart sorting ---
    classesToSchedule.sort((a, b) => b.duration - a.duration || Math.random() - 0.5);

    // --- MODIFIED: Setup with dynamic time slots ---
    const routine = [];
    const teacherBusy = {}, semesterBusy = {}, roomBusy = {}, labBusy = {};
    const unassignedLog = new Map();
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY'];
    
    const allPossibleSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];
    const timeSlots = allPossibleSlots.filter(slot => slot !== preferredBreakTime); // Dynamic time slots for scheduling

    const timeSlotIndexes = Object.fromEntries(timeSlots.map((t, i) => [t, i]));

    // --- NEW HELPER: The "AI" Cost Function (same as before) ---
    const calculatePlacementCost = (day, startTimeIndex, classInfo) => {
        let cost = 0;
        const slotsToCheck = [];
        for (let i = 0; i < classInfo.duration; i++) {
          slotsToCheck.push(timeSlots[startTimeIndex + i]);
        }
        cost += startTimeIndex * 5;
        const slotBefore = startTimeIndex > 0 ? timeSlots[startTimeIndex - 1] : null;
        const slotAfter = (startTimeIndex + classInfo.duration) < timeSlots.length ? timeSlots[startTimeIndex + classInfo.duration] : null;
        if (slotBefore && teacherBusy[classInfo.teacherId]?.[day]?.includes(slotBefore)) cost += 1000;
        if (slotAfter && teacherBusy[classInfo.teacherId]?.[day]?.includes(slotAfter)) cost += 1000;
        if (slotBefore && semesterBusy[classInfo.semesterId]?.[day]?.includes(slotBefore)) cost += 1500;
        if (slotAfter && semesterBusy[classInfo.semesterId]?.[day]?.includes(slotAfter)) cost += 1500;
        const twoSlotsBefore = startTimeIndex > 1 ? timeSlots[startTimeIndex - 2] : null;
        const twoSlotsAfter = (startTimeIndex + classInfo.duration + 1) < timeSlots.length ? timeSlots[startTimeIndex + classInfo.duration + 1] : null;
        if(slotBefore && !teacherBusy[classInfo.teacherId]?.[day]?.includes(slotBefore) && twoSlotsBefore && teacherBusy[classInfo.teacherId]?.[day]?.includes(twoSlotsBefore)) cost += 200;
        if(slotAfter && !teacherBusy[classInfo.teacherId]?.[day]?.includes(slotAfter) && twoSlotsAfter && teacherBusy[classInfo.teacherId]?.[day]?.includes(twoSlotsAfter)) cost += 200;
        return cost;
    };


    // --- MODIFIED: The Main Scheduling Loop ---
    for (const classToAssign of classesToSchedule) {
      let bestPlacement = null;
      let lowestCost = Infinity;

      for (const day of days) {
        for (let startTimeIndex = 0; startTimeIndex < timeSlots.length; startTimeIndex++) {

          // Constraint 1: Check if block fits within the day's available slots
          if (startTimeIndex + classToAssign.duration > timeSlots.length) continue;
          
          // **NEW** Constraint 1.5: Check for time continuity to avoid scheduling across break time
          if (classToAssign.duration > 1) {
            let isContinuous = true;
            for (let i = 0; i < classToAssign.duration - 1; i++) {
                const currentSlotHour = Number(timeSlots[startTimeIndex + i].slice(0, 2));
                const nextSlotHour = Number(timeSlots[startTimeIndex + i + 1].slice(0, 2));
                if (nextSlotHour !== currentSlotHour + 1) {
                    isContinuous = false;
                    break;
                }
            }
            if (!isContinuous) continue; // This block is not contiguous (e.g., spans the break), so skip.
          }

          // Constraint 2: Check against reserved non-major course slots from request
          let isReserved = false;
          for (let i = 0; i < classToAssign.duration; i++) {
              const slotToCheck = timeSlots[startTimeIndex + i];
              if (nonMajorCourseSlots && nonMajorCourseSlots[day]?.includes(slotToCheck)) {
                  isReserved = true;
                  break;
              }
          }
          if (isReserved) continue;

          // Constraint 3: Check if block is free for teacher and semester
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

          // Constraint 4: Find an available room/lab
          let assignedRoomId = null;
          let assignedLabId = null;
          const roomPool = classToAssign.courseType === 'LAB' ? labRooms : theoryRooms;
          const busyPool = classToAssign.courseType === 'LAB' ? labBusy : roomBusy;

          const availableRoom = roomPool.find(room => {
            for (let i = 0; i < classToAssign.duration; i++) {
              if (busyPool[room.id]?.[day]?.includes(timeSlots[startTimeIndex + i])) return false;
            }
            return true;
          });
          
          if (availableRoom) {
            if (classToAssign.courseType === 'LAB') assignedLabId = availableRoom.id;
            else assignedRoomId = availableRoom.id;
            
            const cost = calculatePlacementCost(day, startTimeIndex, classToAssign);

            if (cost < lowestCost) {
              lowestCost = cost;
              bestPlacement = {
                day, startTimeIndex, assignedRoomId, assignedLabId
              };
            }
          }
        }
      }

      // --- **MODIFIED**: After checking all possibilities, make the best assignment ---
      if (bestPlacement) {
        const { day, startTimeIndex, assignedRoomId, assignedLabId } = bestPlacement;

        // **NEW LOGIC**: Create multiple 1-hour entries for labs, one entry for theory.
        for (let i = 0; i < classToAssign.duration; i++) {
            const currentSlotIndex = startTimeIndex + i;
            const startTime = timeSlots[currentSlotIndex];
            const endTime = `${String(Number(startTime.slice(0, 2)) + 1).padStart(2, '0')}:00`;

            routine.push({
                semesterId: classToAssign.semesterId,
                departmentId: classToAssign.departmentId,
                dayOfWeek: day,
                startTime,
                endTime, // Always a 1-hour duration
                courseId: classToAssign.courseId,
                teacherId: classToAssign.teacherId,
                roomId: assignedRoomId,
                labId: assignedLabId,
                isBreak: false,
            });
        }
        
        // Update all busy trackers for the entire chosen block (this logic is unchanged)
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
      } else {
        // Could not find any valid placement for this class
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

// **NEW**: Cancel a single weekly schedule entry
exports.cancelWeeklyScheduleEntry = async (req, res) => {
    const { entryId } = req.params;
    try {
        const entryToCancel = await prisma.weeklySchedule.findUnique({
            where: { id: Number(entryId) }
        });

        if (!entryToCancel) {
            return res.status(404).json({ error: 'Schedule entry not found.' });
        }

        const updatedEntry = await prisma.weeklySchedule.update({
            where: { id: Number(entryId) },
            data: { CANCELED: true },
        });

        res.status(200).json(updatedEntry);
    } catch (error) {
        console.error("Error canceling schedule entry:", error);
        res.status(500).json({ error: "Failed to cancel the entry." });
    }
};

// **NEW**: Uncancel a single weekly schedule entry
exports.uncancelWeeklyScheduleEntry = async (req, res) => {
    const { entryId } = req.params;
    try {
        const entryToUncancel = await prisma.weeklySchedule.findUnique({
            where: { id: Number(entryId) }
        });

        if (!entryToUncancel) {
            return res.status(404).json({ error: 'Schedule entry not found.' });
        }

        const updatedEntry = await prisma.weeklySchedule.update({
            where: { id: Number(entryId) },
            data: { CANCELED: false },
        });

        res.status(200).json(updatedEntry);
    } catch (error) {
        console.error("Error uncanceling schedule entry:", error);
        res.status(500).json({ error: "Failed to uncancel the entry." });
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

// Delete all weekly schedule entries for a department
exports.deleteAllWeeklyScheduleEntries = async (req, res) => {
    const { departmentId } = req.params;
    try {
        await prisma.weeklySchedule.deleteMany({
            where: { departmentId: Number(departmentId) }
        });
        res.status(200).json({ message: "All entries deleted successfully." });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete entries." });
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