function checkRoleHierarchy(requiredRole) {
    return function (req, res, next) {
        if (req.session && req.session.role) {
            const userRole = req.session.role;
            const roleHierarchy = {
                partner: 1,
                student: 1,
                instructor: 2,
                editor: 3,
                school_admin: 3,
                platform_admin: 4
            };

            if (roleHierarchy[userRole] >= roleHierarchy[requiredRole]) {
                return next();
            } else {
                return res.status(403).json({ message: 'Forbidden' });
            }
        } else {
            return res.status(401).json({ message: 'Unauthorized' });
        }
    };
}

module.exports = checkRoleHierarchy;
