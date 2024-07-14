function isAdmin(req, res, next) {
    if (req.session && req.session.role === 'admin') {
        return next();
    } else {
        return res.status(403).json({ message: 'Forbidden' });
    }
}
module.exports = isAdmin;
  