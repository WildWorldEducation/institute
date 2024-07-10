const conn = require('../../config/db');

const editUserPermission = (req, res, next) => {
    const userRole = req.session.role;
    const userId = req.session.userId;
    const userToEditId = req.params.id;

    // Admin can add any instructor to student
    if (userRole === 'admin') {
        return next();
    }

    // Instructor can only add themselves to student
    else if (userToEditId == userId ) {
        return next();
    }

    // Student can't change instructor if one already exists
    else if (userRole === 'instructor') {
        let sqlQuery = "SELECT COUNT(*) as count FROM instructor_students WHERE student_id = ? AND instructor_id = ?";
        let query = conn.query(sqlQuery, [userToEditId, userId], (err, results) => {
            if (err) {
                return next(err);
            }
            try {
                if (results[0].count > 0) {
                    return next();
                } else {
                    return res.status(403).json({ message: 'Forbidden: You do not have permission to edit this user' });
                }
            } catch (err) {
                next(err);
            }
        });
    } else {
        // If the conditions are not met, forbid the action
        return res.status(403).json({ message: 'Forbidden: You do not have permission to edit this user' });
    }
};

module.exports = editUserPermission;
