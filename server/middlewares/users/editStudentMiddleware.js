const conn = require('../../config/db');

const editStudentPermission = (req, res, next) => {
    const instructorId = req.session.userId;
    const userToEditId = req.params.id;

    const sqlQuery = `SELECT instructor_id, student_id FROM instructor_students WHERE student_id = ? AND instructor_id = ?`;

    conn.query(sqlQuery, [userToEditId, instructorId], (err, results) => {
        if (err) {
            return res.status(500).json({
                message: 'Internal Server Error',
                error: err.message
            });
        }

        // Check if the instructor has permission
        if (results.length > 0) {
            return next();
        } else {
            return res.status(403).json({
                message: 'Forbidden: You do not have permission to edit this user'
            });
        }
    });
};

module.exports = editStudentPermission;
