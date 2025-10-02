const createUserPermission = (req, res, next) => {
    const userRole = req.session.role;
    const { role } = req.body;

    // Platform admin can create any type of user
    if (userRole === 'platform_admin') {
        return next();
    }

    // Instructor and Partner can only create student accounts
    if (userRole === 'school_admin' && role === 'instructor') {
        return next();
    }

    // Instructor and Partner or school admin can only create student accounts
    if (
        (userRole === 'instructor' || userRole === 'partner' || userRole === 'school_admin') &&
        role === 'student'
    ) {
        return next();
    }

    // If the conditions are not met, forbid the action
    return res.status(403).json({
        message:
            'Forbidden: You do not have permission to create this type of user'
    });
};

module.exports = createUserPermission;
