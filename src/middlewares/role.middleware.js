// usage: requireRole('admin')
// src/middlewares/role.middleware.js
module.exports = function (role) {
    return function (req, res, next) {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
      if (req.user.role !== role) return res.status(403).json({ message: 'Forbidden' });
      next();
    };
  };
  