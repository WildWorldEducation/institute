
function checkRoleHierarchy(requiredRole) {
    return function(req, res, next) {
      if (req.session && req.session.role) {
        const userRole = req.session.role;
        const roleHierarchy = {
          'student': 1,
          'instructor': 2,
          'editor': 3,
          'admin': 4
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
  