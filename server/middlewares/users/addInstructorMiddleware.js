const conn = require('../../config/db');

const addInstructorPermission = (req, res, next) => {
  const userRole = req.session.role;
  const userId = req.session.userId;
  const { instructor_id } = req.body;

  // Admin can add any instructor to student
  if (userRole === 'admin') {
    return next();
  }

  // Instructor can only add themselves to student
  else if (userRole === 'instructor' && instructor_id === userId) {
    return next();
  }

  // Student can't change instructor if one already exists
  else if (userRole === 'student') {
    let sqlQuery = "SELECT COUNT(*) as count FROM instructor_students WHERE student_id = ?";
    let query = conn.query(sqlQuery, [userId], (err, results) => {
      if (err) {
        return next(err);
      }
      try {
        if (results[0].count < 1) {
          return next();
        } else {
          return res.status(403).json({ message: 'Forbidden: You do not have permission to change instructor' });
        }
      } catch (err) {
        next(err);
      }
    });
  } else {
    // If the conditions are not met, forbid the action
    return res.status(403).json({ message: 'Forbidden: You do not have permission to add this instructor!' });
  }
};

module.exports = addInstructorPermission;
