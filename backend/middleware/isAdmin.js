// Middleware to restrict access to admin users only
module.exports = (req, res, next) => {
  try {
    // Ensure auth middleware has run and user info exists
    if (!req.user) {
      return res.status(401).json({ msg: 'Unauthorized: User not authenticated' });
    }

    // Check if the authenticated user has admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Forbidden: Admins only' });
    }

    // User is an admin, proceed
    next();
  } catch (err) {
    console.error('isAdmin middleware error:', err);
    res.status(500).json({ msg: 'Internal server error during admin check' });
  }
};
