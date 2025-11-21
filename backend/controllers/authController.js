const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const validator = require('validator');

// Validate environment variables
if (!process.env.JWT_SECRET) {
  console.error('❌ ERROR: JWT_SECRET environment variable is not set');
  process.exit(1);
}

if (!process.env.ADMIN_KEY_HASH) {
  console.error('❌ ERROR: ADMIN_KEY_HASH environment variable is not set');
  process.exit(1);
}

const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_KEY_HASH = process.env.ADMIN_KEY_HASH;

// Helper functions
const sanitizeInput = (data) => typeof data === 'string' ? data.trim() : '';
const isValidEmail = (email) => validator.isEmail(email);
const isValidPhone = (phone) => /^\d{10}$/.test(phone); // Strict 10-digit validation

exports.register = async (req, res) => {
  const { name, email, address, phone, password, adminKey } = req.body;

  try {
    // Validate required fields
    const requiredFields = { name, email, address, phone, password };
    if (Object.values(requiredFields).some(field => !field)) {
      return res.status(400).json({ msg: 'All fields are required' });
    }

    // Sanitize and validate inputs
    const sanitized = {
      email: sanitizeInput(email).toLowerCase(),
      name: sanitizeInput(name),
      address: sanitizeInput(address),
      phone: sanitizeInput(phone)
    };

    if (!isValidEmail(sanitized.email)) {
      return res.status(400).json({ msg: 'Invalid email format' });
    }

    if (!isValidPhone(sanitized.phone)) {
      return res.status(400).json({ msg: 'Phone must be 10 digits' });
    }

    // Password validation
    const passwordRegex = /^(?=.*[!@#$%^&*])(?=.{8,})/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        msg: 'Password must be at least 8 characters with a special character'
      });
    }

    // Check existing user
    const existingUser = await User.findOne({ email: sanitized.email });
    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Handle admin registration
    let role = 'user';
    if (adminKey) {
      const validAdminKey = await bcrypt.compare(adminKey, ADMIN_KEY_HASH);
      if (!validAdminKey) {
        return res.status(403).json({ msg: 'Invalid admin key' });
      }
      role = 'admin';
    }

    // Create user
    const user = await User.create({
      name: sanitized.name,
      email: sanitized.email,
      address: sanitized.address,
      phone: sanitized.phone,
      password,
      role
    });

    // Generate JWT
    const expiresIn = role === 'admin' ? '1h' : '24h';
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error('❌ Registration Error:', err);
    res.status(500).json({ msg: 'Registration failed. Please try again.' });
  }
};

// Login function remains the same
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ msg: 'Email and password are required' });
    }

    const sanitizedEmail = sanitizeInput(email).toLowerCase();
    const user = await User.findOne({ email: sanitizedEmail }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ msg: 'Invalid credentials' });
    }

    const expiresIn = user.role === 'admin' ? '1h' : '24h';
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn }
    );

    console.log(`✅ Successful login: ${user.email}`);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error('❌ Login Error:', err);
    res.status(500).json({ msg: 'Login failed. Please try again.' });
  }
};

// Other utility functions remain the same
exports.generateAdminKeyHash = async (plainAdminKey) => {
  try {
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(plainAdminKey, salt);
    console.log('ADMIN_KEY_HASH:', hash);
    return hash;
  } catch (err) {
    console.error('Failed to generate admin key hash:', err);
    throw err;
  }
};

exports.logout = (req, res) => {
  res.json({ msg: 'Logout successful' });
};