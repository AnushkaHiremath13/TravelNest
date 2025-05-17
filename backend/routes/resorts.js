const router = require('express').Router();
const auth   = require('../middleware/auth');
const {
  getResorts, getResortById,
  createResort, updateResort, deleteResort
} = require('../controllers/resortController');

router.get('/',       getResorts);
router.get('/:id',    getResortById);
router.post('/',      auth, createResort);
router.put('/:id',    auth, updateResort);
router.delete('/:id', auth, deleteResort);

module.exports = router;
