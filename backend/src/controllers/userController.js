const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get department users
exports.getDeptUsers = async (req, res) => {
    try {
        const { departmentId } = req.params;
        const users = await prisma.user.findMany({
            where: { departmentId: parseInt(departmentId, 10) },
            // include: { accesses: true },
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};