const todoPermission = (req, res, next) => {
    const userRole = req.session.role;

    // Platform admin and editor can use todo route
    if (userRole === 'platform_admin' || userRole === 'editor') {
        return next();
    } else {
        // If the conditions are not met, forbid the action
        return res.status(403).json({
            message: 'Forbidden: You do not have permission to use todo route'
        });
    }
};

module.exports = todoPermission;
