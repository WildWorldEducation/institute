const conn = require('../../config/db');

const editUserPermission = (req, res, next) => {
    const userRole = req.session.role;

    // Admin can edit any
    if (userRole === 'admin') {
        return next();
    }else {
        // If the conditions are not met, forbid the action
        return res.status(403).json({
            message: 'Forbidden: You do not have permission to edit this user'
        });
    }
};

module.exports = editUserPermission;
