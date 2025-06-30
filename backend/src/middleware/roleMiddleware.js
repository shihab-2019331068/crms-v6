// Middleware to check if user has one of the allowed roles
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // Option 2: compare lowercase
    const userRole = req.user?.role?.toLowerCase();
    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: 'Forbidden: insufficient permissions.' });
    }
    next();
  };
};

module.exports = authorizeRoles;
