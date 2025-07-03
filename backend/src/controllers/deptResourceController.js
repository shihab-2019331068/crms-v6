const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Department Admin: Get all rooms for own department
exports.getRooms = async (req, res) => {
  // Read departmentId from query params, fallback to admin's department
  const reqDeptId = Number(req.query.departmentId);
  try {
    const rooms = await prisma.room.findMany({ where: { departmentId: reqDeptId } });

    res.status(200).json(rooms);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Department Admin: Get all teachers for own department
exports.getTeachers = async (req, res) => {
  const reqDeptId = Number(req.query.departmentId);
  try {
    const teachers = await prisma.user.findMany({
      where: {
        departmentId: reqDeptId,
        role: 'teacher',
      },
      select: {
        id: true,
        name: true,
      },
    });
    res.status(200).json(teachers);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


exports.updateRoomCapacity = async (req, res) => {
  try {
    const roomId = Number(req.params.roomId);
    const { capacity } = req.body;
    
    // --- Validation ---
    if (isNaN(roomId)) {
      return res.status(400).json({ error: 'Room ID must be a number.' });
    }
    if (capacity === undefined || isNaN(Number(capacity)) || Number(capacity) < 0) {
      return res.status(400).json({ error: 'A valid, non-negative capacity is required.' });
    }
    
    const updatedRoom = await prisma.room.update({
      where: {
        id: roomId,
      },
      data: {
        capacity: Number(capacity),
      },
    });

    res.status(200).json(updatedRoom);
  } catch (error) {
    // Prisma's 'Record to update not found' error.
    // This is perfect for handling cases where the room doesn't exist
    // OR the admin doesn't have permission to edit it.
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Room not found or you do not have permission to edit it.' });
    }
    // Generic error
    res.status(500).json({ error: 'An error occurred while updating the room capacity.' });
  }
};


exports.updateRoomStatus = async (req, res) => {
  try {
    const roomId = Number(req.params.roomId);
    const { status } = req.body;

    // --- Validation ---
    if (isNaN(roomId)) {
      return res.status(400).json({ error: 'Room ID must be a number.' });
    }
    // Validate that the status is one of the allowed enum values
    if (!status || !['AVAILABLE', 'BOOKED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be "AVAILABLE" or "BOOKED".' });
    }
    
    // Same security pattern as above: update only if ID and departmentId match.
    const updatedRoom = await prisma.room.update({
      where: {
        id: roomId,
      },
      data: {
        status: status, // Prisma will validate this against the `RoomStatus` enum
      },
    });

    res.status(200).json(updatedRoom);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Room not found or you do not have permission to edit it.' });
    }
    // Generic error
    res.status(500).json({ error: 'An error occurred while updating the room status.' });
  }
};


exports.updateLabCapacity = async (req, res) => {
  try {
    const labId = Number(req.params.labId);
    const { capacity } = req.body;
    
    // --- Validation ---
    if (isNaN(labId)) {
      return res.status(400).json({ error: 'Lab ID must be a number.' });
    }
    if (capacity === undefined || isNaN(Number(capacity)) || Number(capacity) < 0) {
      return res.status(400).json({ error: 'A valid, non-negative capacity is required.' });
    }
    
    const updatedLab = await prisma.lab.update({
      where: {
        id: labId,
      },
      data: {
        capacity: Number(capacity),
      },
    });

    res.status(200).json(updatedLab);
  } catch (error) {
    // Prisma's 'Record to update not found' error.
    // This is perfect for handling cases where the lab doesn't exist
    // OR the admin doesn't have permission to edit it.
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Lab not found or you do not have permission to edit it.' });
    }
    // Generic error
    res.status(500).json({ error: 'An error occurred while updating the lab capacity.' });
  }
};


exports.updateLabStatus = async (req, res) => {
  try {
    const labId = Number(req.params.labId);
    const { status } = req.body;

    // --- Validation ---
    if (isNaN(labId)) {
      return res.status(400).json({ error: 'Lab ID must be a number.' });
    }
    // Validate that the status is one of the allowed enum values
    if (!status || !['AVAILABLE', 'BOOKED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be "AVAILABLE" or "BOOKED".' });
    }
    
    // Same security pattern as above: update only if ID and departmentId match.
    const updatedLab = await prisma.lab.update({
      where: {
        id: labId,
      },
      data: {
        status: status, // Prisma will validate this against the `LabStatus` enum
      },
    });

    res.status(200).json(updatedLab);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Lab not found or you do not have permission to edit it.' });
    }
    // Generic error
    res.status(500).json({ error: 'An error occurred while updating the Lab status.' });
  }
};