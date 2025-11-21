const express = require('express');
const router = express.Router();
const Resort = require('../models/Resort');
const auth = require('../middleware/auth');
const {
  getResorts, getResortById,
  createResort, updateResort, deleteResort
} = require('../controllers/resortController');

// Get all resorts
router.get('/', async (req, res) => {
  try {
    const resorts = await Resort.find().sort({ createdAt: -1 });
    res.json(resorts);
  } catch (error) {
    console.error('Error fetching resorts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single resort
router.get('/:id', async (req, res) => {
  try {
    const resort = await Resort.findById(req.params.id);
    if (!resort) {
      return res.status(404).json({ message: 'Resort not found' });
    }
    res.json(resort);
  } catch (error) {
    console.error('Error fetching resort:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create resort (admin only)
router.post('/', auth, async (req, res) => {
  try {
    const resort = new Resort(req.body);
    await resort.save();
    res.status(201).json(resort);
  } catch (error) {
    console.error('Error creating resort:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update resort (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const resort = await Resort.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!resort) {
      return res.status(404).json({ message: 'Resort not found' });
    }
    res.json(resort);
  } catch (error) {
    console.error('Error updating resort:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete resort (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const resort = await Resort.findByIdAndDelete(req.params.id);
    if (!resort) {
      return res.status(404).json({ message: 'Resort not found' });
    }
    res.json({ message: 'Resort deleted successfully' });
  } catch (error) {
    console.error('Error deleting resort:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
