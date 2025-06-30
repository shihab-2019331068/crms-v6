const jwt = require('jsonwebtoken');
const { findUserByEmail } = require('../models/userModel');

// Middleware to authenticate JWT and attach user to request
const authenticateToken = async (req, res, next) => {
  // Read token from cookie instead of Authorization header
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'No token provided.' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

module.exports = authenticateToken;