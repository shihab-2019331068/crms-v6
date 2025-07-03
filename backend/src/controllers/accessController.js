const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Super Admin: Grant Access to a User
exports.grantAccess = async (req, res) => {
  const { userId, access } = req.body; // 'access' can be an array of strings
  
  try {
    if (!userId || !access) {
      return res.status(400).json({ error: 'userId and access are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    let currentAccesses = user.accesses || [];
    currentAccesses = [...new Set([...access])];

    const updatedUser = await prisma.user.update({
      where: { id: Number(userId) },
      data: { accesses: currentAccesses },
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Super Admin: Remove Access from a User
exports.removeAccess = async (req, res) => {
  const { userId, access } = req.body; // 'access' can be a string or an array of strings
  try {
    if (!userId || !access) {
      return res.status(400).json({ error: 'userId and access are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    let currentAccesses = user.accesses || [];
    const accessesToRemove = Array.isArray(access) ? access : [access];
    currentAccesses = currentAccesses.filter(item => !accessesToRemove.includes(item));

    const updatedUser = await prisma.user.update({
      where: { id: Number(userId) },
      data: { accesses: currentAccesses },
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/*
change this button to control access of the user. clicking this should show the accesses of the user and at the bottom of the access list, there will be an option to add more, clicking add more button would show a list of grantable options. create a list of strings called grantableAccesses. fetch user details and check the user role. if the user is super_admin, he can only grant access to manage accesses to a user, so the list should contain only the string "accessManager". or else if the user's accesses contains the access "accessManager", he can grant all accesses which are "roomManager", courseManager", accessManager", "routineManager", "semesterManager", "teacherManager". implement these for now
*/