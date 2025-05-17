const router = require('express').Router();
const auth   = require('../middleware/auth');
const { getMe, updateMe } = require('../controllers/userController');

router.get('/me', auth, getMe);
router.put('/me', auth, updateMe);

module.exports = router;
