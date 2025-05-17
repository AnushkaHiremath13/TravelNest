const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

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

    const token = jwt.sign({ userId: user._id, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: '1h' });

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
    const admin = await User.findOne({ email });

    if (!admin || !admin.isAdmin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials or not an admin' });
    }

    const token = jwt.sign({ userId: admin._id, isAdmin: true }, JWT_SECRET, { expiresIn: '2d' });

    const adminObj = admin.toObject();
    delete adminObj.password;

    res.status(200).json({ message: 'Admin login successful', token, user: adminObj });
  } catch (err) {
    console.error('❌ Error in POST /admin/login:', err);
    res.status(500).json({ message: 'Server error during admin login' });
  }
});

module.exports = router;
