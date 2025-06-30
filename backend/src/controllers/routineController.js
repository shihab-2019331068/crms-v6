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
    // Find all courses taught by this teacher
    const courses = await prisma.course.findMany({
      where: { teacherId: Number(teacherId) },
      select: { id: true },
    });
    const courseIds = courses.map(c => c.id);
    const schedules = await prisma.weeklySchedule.findMany({
      where: { courseId: { in: courseIds } },
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

// Generate a weekly routine: now just saves a finalized routine from frontend
exports.generateWeeklyRoutine = async (req, res) => {
  const { routine } = req.body;
  if (!Array.isArray(routine) || routine.length === 0) {
    return res.status(400).json({ error: 'Routine array is required.' });
  }
  try {
    // Delete all existing weeklySchedules for the same departmentId
    const departmentId = routine[0]?.departmentId;
    if (!departmentId) {
      return res.status(400).json({ error: 'departmentId is required in routine entries.' });
    }
    await prisma.weeklySchedule.deleteMany({ where: { departmentId } });
    // Save all entries in bulk
    const created = await prisma.weeklySchedule.createMany({ data: routine });
    res.status(201).json({ message: 'Routine saved.', createdCount: created.count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Preview generated weekly routine for a department (does not save to DB)
exports.previewWeeklyRoutine = async (req, res) => {
  const { departmentId } = req.body;
  if (!departmentId) {
    return res.status(400).json({ error: 'departmentId is required.' });
  }

  try {
    // 0. Delete existing department schedules
    await prisma.weeklySchedule.deleteMany({ where: { departmentId: Number(departmentId) } });

    // 1. Fetch all necessary data
    const activeSemesters = await prisma.semester.findMany({
      where: { departmentId: Number(departmentId), session: { not: null } },
    });
    if (!activeSemesters.length) return res.status(404).json({ error: 'No active semesters found.' });

    const courses = await prisma.course.findMany({
      where: { semesterId: { in: activeSemesters.map(s => s.id) }, teacherId: { not: null } },
      include: { teacher: true, semester: true },
    });
    if (!courses.length) return res.status(404).json({ error: 'No courses with teachers found.' });

    const theoryRooms = await prisma.room.findMany({ where: { departmentId: Number(departmentId), status: 'AVAILABLE' } });
    const labRooms = await prisma.lab.findMany({ where: { departmentId: Number(departmentId), status: 'AVAILABLE' } });
    if (!theoryRooms.length && !labRooms.length) return res.status(404).json({ error: 'No rooms or labs found.' });

    // 2. Build busy trackers
    const teacherBusy = {}; // { teacherId: { day: [startTime] } }
    const semesterBusy = {}; // { semesterId: { day: [startTime] } }
    const roomBusy = {};     // { roomId: { day: [startTime] } }
    const labBusy = {};      // { labId: { day: [startTime] } }
    const dayBusy = {};
    
    // 3. Create a flat list of all classes to be scheduled
    const classesToSchedule = [];
    courses.forEach(course => {
      const requiredClasses = course.type === 'LAB' ? 1 : Math.floor(course.credits);
      for (let i = 0; i < requiredClasses; i++) {
        classesToSchedule.push(course);
      }
    });

    // Shuffle classesToSchedule to randomize assignment order
    for (let i = classesToSchedule.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [classesToSchedule[i], classesToSchedule[j]] = [classesToSchedule[j], classesToSchedule[i]];
    }

    // 4. Simple iterative assignment
    const routine = [];
    const unassignedCourses = [];
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY'];
    const timeSlots = [];
    for (let hour = 8; hour < 17; hour++) {
      const start = hour.toString().padStart(2, '0') + ':00';
      const end = (hour + 1).toString().padStart(2, '0') + ':00';
      timeSlots.push({ start, end });
    }

    for (let i = 0; i < classesToSchedule.length; i++) {
      let assignedRoomId = null, assignedLabId = null;
      const course = classesToSchedule[i];

      // Shuffle days and timeSlots for more random assignment
      const shuffledDays = [...days];
      for (let d = shuffledDays.length - 1; d > 0; d--) {
        const j = Math.floor(Math.random() * (d + 1));
        [shuffledDays[d], shuffledDays[j]] = [shuffledDays[j], shuffledDays[d]];
      }
      const shuffledTimeSlots = [...timeSlots];
      for (let t = shuffledTimeSlots.length - 1; t > 0; t--) {
        const j = Math.floor(Math.random() * (t + 1));
        [shuffledTimeSlots[t], shuffledTimeSlots[j]] = [shuffledTimeSlots[j], shuffledTimeSlots[t]];
      }

      for (const slot of timeSlots) {
      
        for (const day of days) {
          if (assignedLabId || assignedRoomId) break;
          const dayIsBusy = dayBusy[course.id]?.includes(day);

          if (dayIsBusy) continue;
          
          const teacherIsBusy = teacherBusy[course.teacherId]?.[day]?.includes(slot.start);
          const semesterIsBusy = semesterBusy[course.semesterId]?.[day]?.includes(slot.start);
          
          if (!teacherIsBusy && !semesterIsBusy) {
            
            if (course.type === 'LAB') {
              const availableLab = labRooms.find(lab => !labBusy[lab.id]?.[day]?.includes(slot.start));
              if (availableLab) assignedLabId = availableLab.id;
            } else {
              const availableRoom = theoryRooms.find(room => !roomBusy[room.id]?.[day]?.includes(slot.start));
              if (availableRoom) assignedRoomId = availableRoom.id;
            }
            
            if (assignedRoomId || assignedLabId) {
              routine.push({
                semesterId: course.semesterId,
                departmentId: Number(departmentId),
                dayOfWeek: day,
                startTime: slot.start,
                endTime: slot.end,
                courseId: course.id,
                teacherId: course.teacherId,
                roomId: assignedRoomId,
                labId: assignedLabId,
                isBreak: false,
              });
              
              // Update busy trackers
              teacherBusy[course.teacherId] = { ...teacherBusy[course.teacherId], [day]: [...(teacherBusy[course.teacherId]?.[day] || []), slot.start] };
              semesterBusy[course.semesterId] = { ...semesterBusy[course.semesterId], [day]: [...(semesterBusy[course.semesterId]?.[day] || []), slot.start] };
              if (assignedRoomId) roomBusy[assignedRoomId] = { ...roomBusy[assignedRoomId], [day]: [...(roomBusy[assignedRoomId]?.[day] || []), slot.start] };
              if (assignedLabId) labBusy[assignedLabId] = { ...labBusy[assignedLabId], [day]: [...(labBusy[assignedLabId]?.[day] || []), slot.start] };
              dayBusy[course.id] = [...(dayBusy[course.id] || []), day];
              
              break; // Move to the next slot
            }
          }
        }
      }
      if (!(assignedLabId || assignedRoomId)) {
        unassignedCourses.push(course);
      }
    }

    res.status(200).json({ routine, unassigned: unassignedCourses });

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
    // Get all semesters for the department
    const semesters = await prisma.semester.findMany({ where: { departmentId: Number(departmentId) } });
    if (!semesters.length) return res.status(404).json({ error: 'No semesters found for department.' });
    const semesterIds = semesters.map(s => s.id);

    // Get all weekly schedule entries for these semesters
    const routine = await prisma.weeklySchedule.findMany({
      where: { semesterId: { in: semesterIds } },
      orderBy: [{ startTime: 'asc' }],
    });
    res.status(200).json({ routine });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Department Admin: Add Weekly Schedule (Routine) for a Semester
exports.addWeeklySchedule = async (req, res) => {
  const { semesterId, dayOfWeek, startTime, endTime, courseId, labId, roomId, isBreak, breakName } = req.body;
  const user = req.user;
  try {
    // Validate required fields
    if (!semesterId || !dayOfWeek || !startTime || !endTime) {
      return res.status(400).json({ error: 'semesterId, dayOfWeek, startTime, and endTime are required.' });
    }
    // Fetch the admin's user record
    const admin = await prisma.user.findUnique({
      where: { id: user.userId },
    });
    if (!admin || !admin.departmentId) {
      return res.status(403).json({ error: 'Department admin must belong to a department.' });
    }
    // Fetch the semester and check department
    const semester = await prisma.semester.findUnique({
      where: { id: semesterId },
    });
    if (!semester || semester.departmentId !== admin.departmentId) {
      return res.status(403).json({ error: 'You can only add routines to semesters in your own department.' });
    }
    // Create the weekly schedule
    const weeklySchedule = await prisma.weeklySchedule.create({
      data: {
        semesterId,
        dayOfWeek,
        startTime,
        endTime,
        courseId: courseId || null,
        labId: labId || null,
        roomId: roomId || null,
        isBreak: isBreak || false,
        breakName: breakName || null
      },
    });
    res.status(201).json(weeklySchedule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Department Admin: Get all weekly schedules for own department
exports.getWeeklySchedules = async (req, res) => {
  const user = req.user;
  try {
    const admin = await prisma.user.findUnique({ where: { id: user.userId } });
    if (!admin || !admin.departmentId) {
      return res.status(403).json({ error: 'Department admin must belong to a department.' });
    }
    // Get all semesters for the department
    const semesters = await prisma.semester.findMany({ where: { departmentId: admin.departmentId } });
    const semesterIds = semesters.map(s => s.id);
    // Get all weekly schedules for those semesters
    const weeklySchedules = await prisma.weeklySchedule.findMany({ where: { semesterId: { in: semesterIds } } });
    res.status(200).json(weeklySchedules);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};



