const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createUser, findUserByEmail, getDepartmentByDepartmentId } = require('../models/userModel');

const signup = async (req, res, next) => {
  try {
    const { name, email, password, role, department, session } = req.body;

    console.log('Signup request received:', { name, email, role, department, session });

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    const validRoles = ['super_admin', 'department_admin', 'teacher', 'student'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role.' });
    }
    // Require departmentId for all roles except super_admin
    let departmentId = null;
    if (role !== 'super_admin') {
      if (!department || department.toString().trim() === '') {
        return res.status(400).json({ error: 'Department ID is required for this role.' });
      }
      departmentId = department;
    }
    // Require session if role is student
    if (role === 'student' && (!session || session.trim() === '')) {
      return res.status(400).json({ error: 'Session is required for students.' });
    }
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered.' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    // Pass session to createUser
    const user = await createUser(name, email, passwordHash, role, departmentId, session);
    res.status(201).json({ message: 'User registered successfully.', user: { id: user.id, name: user.name, email: user.email, role: user.role, departmentId: user.department_id, session: user.session } });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    // Set token in HttpOnly, Secure cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000 // 1 hour
    });
    res.json({ role: user.role, email: user.email });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    // req.user is set by authenticateToken middleware
    const { userId, email } = req.user;
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    let departmentName = null;
    if (user.departmentId) {
      const department = await getDepartmentByDepartmentId(user.departmentId);
      departmentName = department ? department.name : null;
    }

    user.department = departmentName;
    
    const { password_hash, ...userWithoutPassword } = user;
    res.json({ ...userWithoutPassword});
  } catch (err) {
    next(err);
  }
};

module.exports = { signup, login, getMe };
