const createUserPermission = (req, res, next) => {
    const userRole = req.session.role;
    const { role } = req.body;
  
    // Admin can create any type of user
    if (userRole === 'admin') {
      return next();
    }
  
    // Instructor can only create student accounts
    if (userRole === 'instructor' && role === 'student') {
      return next();
    }
    // If the conditions are not met, forbid the action
    return res.status(403).json({ message: 'Forbidden: You do not have permission to create this type of user' });
};
  
module.exports = createUserPermission;
  