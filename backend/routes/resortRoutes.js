const express = require('express');
const router = express.Router();

// Controller functions
const {
  getAllResorts,
  createResort,
  getResortById,
  updateResort,
  deleteResort,
  searchResorts,
} = require('../controllers/resortController');

// Middleware (check if files exist)
let auth, isAdmin, upload;
try {
  auth = require('../middleware/auth');       // Auth check
  isAdmin = require('../middleware/isAdmin'); // Admin check
  upload = require('../middleware/upload');   // Multer file upload
} catch (err) {
  console.error("Middleware import error:", err.message);
}

// ---------------------------------------------
// PUBLIC ROUTES
// ---------------------------------------------

// @route   GET /api/resorts/search
router.get('/search', searchResorts);

// @route   GET /api/resorts
router.get('/', getAllResorts);

// @route   GET /api/resorts/:id
router.get('/:id', getResortById);

// ---------------------------------------------
// PROTECTED ADMIN ROUTES
// ---------------------------------------------
if (auth && isAdmin && upload) {
  router.post(
    '/',
    auth,
    isAdmin,
    upload.fields([
      { name: 'imgSrc', maxCount: 1 },
      { name: 'photos', maxCount: 10 }
    ]),
    createResort
  );

  router.put(
    '/:id',
    auth,
    isAdmin,
    upload.fields([
      { name: 'imgSrc', maxCount: 1 },
      { name: 'photos', maxCount: 10 }
    ]),
    updateResort
  );

  router.delete('/:id', auth, isAdmin, deleteResort);
} else {
  console.warn("Admin routes not registered due to missing middleware(s).");
}

module.exports = router;
