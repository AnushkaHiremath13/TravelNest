const express = require("express");
const router = express.Router();
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Helper function for error responses
const sendError = (res, status, message) => {
  return res.status(status).json({
    status: status >= 500 ? 'error' : 'fail',
    message
  });
};

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      role: user.role, 
      email: user.email 
    },
    process.env.JWT_SECRET,
    { expiresIn: user.role === 'admin' ? '1d' : '7d' }
  );
};

// Regular user login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return sendError(res, 400, 'Email and password are required');
    }

    // Find user by email and explicitly select password field
    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('+password')
      .exec();
    
    if (!user) {
      return sendError(res, 401, 'Invalid email or password');
    }

    // Check password using the comparePassword method from the User model
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return sendError(res, 401, 'Invalid email or password');
    }

    // Check if trying to login as regular user but is admin
    if (user.role === 'admin') {
      return sendError(res, 401, 'Please use admin login for admin accounts');
    }

    // Generate token
    const token = generateToken(user);

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false }); // Skip validation on update

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    sendError(res, 500, 'Login failed. Please try again.');
  }
});

// Admin login route
router.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return sendError(res, 400, 'Email and password are required');
    }

    // Find admin by email and explicitly select password field
    const admin = await User.findOne({ 
      email: email.toLowerCase().trim(),
      role: 'admin'
    }).select('+password').exec();
    
    if (!admin) {
      return sendError(res, 401, 'Invalid admin credentials');
    }

    // Check password using the comparePassword method from the User model
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return sendError(res, 401, 'Invalid admin credentials');
    }

    // Generate token with admin privileges
    const token = generateToken(admin);

    // Update last login
    admin.lastLogin = new Date();
    await admin.save({ validateBeforeSave: false }); // Skip validation on update

    res.status(200).json({
      status: 'success',
      message: 'Admin login successful',
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    sendError(res, 500, 'Admin login failed. Please try again.');
  }
});

// Register route - handles both user and admin registration
router.post("/register", async (req, res) => {
  try {
    const { fullName: name, email, address, phone, password, adminKey } = req.body;

    // Validate required fields
    const missingFields = [];
    if (!name) missingFields.push('name');
    if (!email) missingFields.push('email');
    if (!address) missingFields.push('address');
    if (!phone) missingFields.push('phone');
    if (!password) missingFields.push('password');

    if (missingFields.length > 0) {
      return sendError(res, 400, `Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendError(res, 400, 'Invalid email format');
    }

    // Validate phone number (10 digits)
    if (!/^\d{10}$/.test(phone)) {
      return sendError(res, 400, 'Phone number must be 10 digits');
    }

    // Validate password format
    const passwordRegex = /^(?=.*[!@#$%^&*])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      return sendError(res, 400, 'Password must be at least 8 characters with a special character and number');
    }

    // Check for existing user
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase().trim() },
        { phone: phone.trim() }
      ]
    });

    if (existingUser) {
      const field = existingUser.email === email.toLowerCase().trim() ? 'Email' : 'Phone';
      return sendError(res, 409, `${field} already exists`);
    }

    // Determine user role
    let role = 'user';
    if (adminKey) {
      if (adminKey !== process.env.ADMIN_SECRET_KEY) {
        return sendError(res, 403, 'Invalid admin key');
      }
      role = 'admin';
    }

    // Create new user - password will be hashed by the pre-save middleware
    const user = new User({
      name,
      email: email.toLowerCase().trim(),
      address: address.trim(),
      phone: phone.trim(),
      password,
      role
    });

    await user.save();

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      status: 'success',
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    sendError(res, 500, 'Registration failed. Please try again.');
  }
});

module.exports = router;
