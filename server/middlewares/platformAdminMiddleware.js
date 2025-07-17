function isPlatformAdmin(req, res, next) {
    if (req.session && req.session.role === 'platform_admin') {
        return next();
    } else {
        return res.status(403).json({ message: 'Forbidden' });
    }
}
module.exports = isPlatformAdmin;
