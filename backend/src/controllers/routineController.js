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


// Save generated weekly routine for a specific semester
exports.generateWeeklyRoutine = async (req, res) => {
  const { routine, semesterId, departmentId } = req.body;

  if (!Array.isArray(routine) || !semesterId || !departmentId) {
    return res.status(400).json({ error: 'Routine array, semesterId, and departmentId are required.' });
  }

  try {
    // Use a transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // Delete all existing weeklySchedules for the specific semester
      await tx.weeklySchedule.deleteMany({
        where: {
          semesterId: Number(semesterId),
          departmentId: Number(departmentId)
        }
      });

      // Save all new entries in bulk, if any
      if (routine.length > 0) {
        await tx.weeklySchedule.createMany({ data: routine });
      }
    });

    res.status(201).json({ message: 'Routine saved successfully for the semester.' });
  } catch (error) {
    console.error("Error saving routine:", error);
    res.status(500).json({ error: "Failed to save routine. " + error.message });
  }
};

// **UPDATED**: Preview generated weekly routine for a department and semester
exports.previewWeeklyRoutine = async (req, res) => {
  const { departmentId, semesterId } = req.body;
  if (!departmentId || !semesterId) {
    return res.status(400).json({ error: 'departmentId and semesterId are required.' });
  }

  try {
    // 1. Fetch all necessary data for the specific semester
    // Get all (Course, Teacher) assignments for THIS semester that are MAJOR courses
    const courseTeacherPairs = await prisma.semesterCourseTeacher.findMany({
      where: {
        semesterId: Number(semesterId),
        course: {
          isMajor: true, // IMPORTANT: Only schedule major courses automatically
        },
      },
      include: {
        course: true,
      },
    });

    if (!courseTeacherPairs.length) {
      return res.status(404).json({
        error: 'No major courses with assigned teachers found for this semester. Please assign teachers to courses first.'
      });
    }

    const theoryRooms = await prisma.room.findMany({ where: { departmentId: Number(departmentId), status: 'AVAILABLE' } });
    const labRooms = await prisma.lab.findMany({ where: { departmentId: Number(departmentId), status: 'AVAILABLE' } });

    if (!theoryRooms.length && !labRooms.length) {
        return res.status(404).json({ error: 'No available rooms or labs found for this department.' });
    }

    // 2. Build busy trackers
    const teacherBusy = {}; // { teacherId: { day: [startTime] } }
    const semesterBusy = {}; // { semesterId: { day: [startTime] } }
    const roomBusy = {};     // { roomId: { day: [startTime] } }
    const labBusy = {};      // { labId: { day: [startTime] } }
    
    // 3. Create a flat list of all classes to be scheduled based on credits
    const classesToSchedule = [];
    courseTeacherPairs.forEach(pair => {
      const requiredClasses = Math.ceil(pair.course.credits);
      for (let i = 0; i < requiredClasses; i++) {
        classesToSchedule.push({
          courseId: pair.courseId,
          teacherId: pair.teacherId,
          courseType: pair.course.type,
          courseName: pair.course.name, // For unassigned list
          courseCode: pair.course.code, // For unassigned list
        });
      }
    });
    
    // Shuffle to randomize
    classesToSchedule.sort(() => Math.random() - 0.5);

    // 4. Simple iterative assignment
    const routine = [];
    const unassignedLog = new Map();
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY'];
    const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];

    for (const classToAssign of classesToSchedule) {
      let isAssigned = false;
      
      for (const day of days) {
        if (isAssigned) break;
        for (const time of timeSlots) {
            
          const teacherIsBusy = teacherBusy[classToAssign.teacherId]?.[day]?.includes(time);
          const semesterIsBusy = semesterBusy[semesterId]?.[day]?.includes(time);

          if (teacherIsBusy || semesterIsBusy) continue;

          let assignedRoomId = null;
          let assignedLabId = null;

          if (classToAssign.courseType === 'LAB') {
            const availableLab = labRooms.find(lab => !labBusy[lab.id]?.[day]?.includes(time));
            if (availableLab) {
                assignedLabId = availableLab.id;
                labBusy[assignedLabId] = { ...labBusy[assignedLabId], [day]: [...(labBusy[assignedLabId]?.[day] || []), time] };
            }
          } else { // THEORY, PROJECT, etc.
            const availableRoom = theoryRooms.find(room => !roomBusy[room.id]?.[day]?.includes(time));
            if (availableRoom) {
                assignedRoomId = availableRoom.id;
                roomBusy[assignedRoomId] = { ...roomBusy[assignedRoomId], [day]: [...(roomBusy[assignedRoomId]?.[day] || []), time] };
            }
          }

          if (assignedRoomId || assignedLabId) {
            routine.push({
              semesterId: Number(semesterId),
              departmentId: Number(departmentId),
              dayOfWeek: day,
              startTime: time,
              endTime: `${String(Number(time.slice(0, 2)) + 1).padStart(2, '0')}:00`,
              courseId: classToAssign.courseId,
              teacherId: classToAssign.teacherId,
              roomId: assignedRoomId,
              labId: assignedLabId,
              isBreak: false,
            });

            // Update busy trackers
            teacherBusy[classToAssign.teacherId] = { ...teacherBusy[classToAssign.teacherId], [day]: [...(teacherBusy[classToAssign.teacherId]?.[day] || []), time] };
            semesterBusy[semesterId] = { ...semesterBusy[semesterId], [day]: [...(semesterBusy[semesterId]?.[day] || []), time] };
            
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
      include: { // Include related data for display
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
        // Basic validation
        if (!departmentId || !semesterId || !dayOfWeek || !startTime || !endTime) {
            return res.status(400).json({ error: 'Core fields are missing.' });
        }

        // --- Conflict Checking ---
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


// Get a specific student's weekly routine
exports.getStudentRoutine = async (req, res) => {
  const { studentId } = req.params;

  
  
  try {
    // 1. Find the student to get their session and department.
    const student = await prisma.user.findUnique({
      where: { id: Number(studentId) },
      select: { session: true, departmentId: true, name: true, role: true }
    });
    
    if (!student || student.role !== 'student') {
      return res.status(404).json({ error: 'Student not found.' });
    }
    if (!student.session || !student.departmentId) {
      return res.status(404).json({ error: 'Student not assigned to a session or department.' });
    }
    
    // 2. Find the student's current semester based on their session and department.
    const semester = await prisma.semester.findFirst({
      where: {
        session: student.session,
        departmentId: student.departmentId,
      },
      select: { id: true, name: true, session: true }
    });

    if (!semester) {
      return res.status(404).json({ routine: [], message: 'Could not determine your current semester.' });
    }

    // 3. Find all courses the student is enrolled in.
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: Number(studentId) },
      select: { courseId: true }
    });
    const enrolledCourseIds = enrollments.map(e => e.courseId);

    // 4. Get the weekly schedule for the semester, including the student's courses and any breaks.
    const routine = await prisma.weeklySchedule.findMany({
      where: {
        semesterId: semester.id,
        OR: [
            { courseId: { in: enrolledCourseIds } },
            { isBreak: true }
        ]
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