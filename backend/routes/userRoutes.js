const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallbacksecret';

// ---------------------------------------------
// POST /api/auth/register — Register a new user
// ---------------------------------------------
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, address, phone, password } = req.body;

    console.log("📩 Received signup data:", req.body);

    if (!fullName || !email || !address || !phone || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const user = new User({ fullName, email, address, phone, password });
    await user.save();

    const token = jwt.sign({ userId: user._id, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ message: 'Registration successful', token });
  } catch (err) {
    console.error('❌ Error in POST /register:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// ---------------------------------------------
// POST /api/auth/login — User login
// ---------------------------------------------
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if trying to login as regular user but is admin
    if (user.role === 'admin') {
      return res.status(401).json({ message: 'Please use admin login for admin accounts' });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({ message: 'Login successful', token, user: userObj });
  } catch (err) {
    console.error('❌ Error in POST /login:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// ----------------------------------------------------------
// POST /api/auth/admin/login — Admin-only login route
// ----------------------------------------------------------
router.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const admin = await User.findOne({ 
      email: email.toLowerCase().trim(),
      role: 'admin'
    }).select('+password').exec();

    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const token = jwt.sign({ 
      userId: admin._id, 
      role: admin.role,
      email: admin.email 
    }, JWT_SECRET, { expiresIn: '2d' });

    const adminObj = admin.toObject();
    delete adminObj.password;

    res.status(200).json({ message: 'Admin login successful', token, user: adminObj });
  } catch (err) {
    console.error('❌ Error in POST /admin/login:', err);
    res.status(500).json({ message: 'Server error during admin login' });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const updates = req.body;
    const allowedUpdates = [
      'name', 'email', 'phone', 'address', 'dateOfBirth',
      'gender', 'nationality', 'preferences', 'documents'
    ];
    
    const isValidOperation = Object.keys(updates).every(update => 
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      return res.status(400).json({ message: 'Invalid updates' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    Object.keys(updates).forEach(update => {
      if (update === 'preferences' || update === 'documents') {
        user[update] = { ...user[update], ...updates[update] };
      } else {
        user[update] = updates[update];
      }
    });

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: 'Update failed', error: error.message });
  }
});

// Upload profile picture
router.post('/profile/picture', auth, upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.profileImage = req.file.filename;
    await user.save();
    
    res.json({ 
      message: 'Profile picture updated successfully',
      profileImage: user.profileImage 
    });
  } catch (error) {
    res.status(400).json({ message: 'Upload failed', error: error.message });
  }
});

// Add saved traveler
router.post('/profile/travelers', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.savedTravelers.push(req.body);
    await user.save();
    
    res.status(201).json({
      message: 'Traveler added successfully',
      traveler: user.savedTravelers[user.savedTravelers.length - 1]
    });
  } catch (error) {
    res.status(400).json({ message: 'Failed to add traveler', error: error.message });
  }
});

// Update saved traveler
router.put('/profile/travelers/:travelerId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const traveler = user.savedTravelers.id(req.params.travelerId);
    if (!traveler) {
      return res.status(404).json({ message: 'Traveler not found' });
    }

    Object.assign(traveler, req.body);
    await user.save();
    
    res.json({
      message: 'Traveler updated successfully',
      traveler
    });
  } catch (error) {
    res.status(400).json({ message: 'Failed to update traveler', error: error.message });
  }
});

// Delete saved traveler
router.delete('/profile/travelers/:travelerId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.savedTravelers.pull(req.params.travelerId);
    await user.save();
    
    res.json({ message: 'Traveler removed successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Failed to remove traveler', error: error.message });
  }
});

// Update travel documents
router.put('/profile/documents', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.documents = { ...user.documents, ...req.body };
    await user.save();
    
    res.json({
      message: 'Documents updated successfully',
      documents: user.documents
    });
  } catch (error) {
    res.status(400).json({ message: 'Failed to update documents', error: error.message });
  }
});

// Update travel preferences
router.put('/profile/preferences', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.preferences = { ...user.preferences, ...req.body };
    await user.save();
    
    res.json({
      message: 'Preferences updated successfully',
      preferences: user.preferences
    });
  } catch (error) {
    res.status(400).json({ message: 'Failed to update preferences', error: error.message });
  }
});

// Update user stats
router.put('/profile/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.stats = { ...user.stats, ...req.body };
    await user.save();
    
    res.json({
      message: 'Stats updated successfully',
      stats: user.stats
    });
  } catch (error) {
    res.status(400).json({ message: 'Failed to update stats', error: error.message });
  }
});

module.exports = router;
