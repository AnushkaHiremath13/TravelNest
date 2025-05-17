const express = require('express');
const router = express.Router();

// Import middlewares to protect the route
const auth = require('../middleware/auth');     // Verifies JWT token
const isAdmin = require('../middleware/isAdmin'); // Checks if the user is an admin

// ✅ Correct import name to match the controller
const { createResort } = require('../controllers/resortController');

// @route   POST /api/admin/resorts
// @desc    Allows an admin to add a new resort to the database
// @access  Private/Admin
router.post('/resorts', auth, isAdmin, createResort);

// Export the router to be used in the main app
module.exports = router;
