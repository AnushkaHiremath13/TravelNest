const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({
      status: 'fail',
      message: 'Authorization token required'
    });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email
    };
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(401).json({
      status: 'fail',
      message: err.name === 'TokenExpiredError'
        ? 'Session expired, please login again'
        : 'Invalid authentication token'
    });
  }
};