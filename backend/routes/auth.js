const express = require("express");
const router = express.Router();
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const crypto = require("crypto");

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

// Admin forgot password route
router.post("/admin/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return sendError(res, 400, 'Email is required');
    }

    // Find admin by email
    const admin = await User.findOne({ 
      email: email.toLowerCase().trim(),
      role: 'admin'
    });
    
    if (!admin) {
      // For security reasons, we still return success even if email not found
      return res.status(200).json({
        status: 'success',
        message: 'If a matching admin account is found, a password reset email will be sent'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Save hashed token to database
    admin.resetPasswordToken = hashedToken;
    admin.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // Token expires in 30 minutes
    await admin.save({ validateBeforeSave: false });

    // In a real application, you would send an email here with the reset link
    // For demo purposes, we'll just return the token in the response
    res.status(200).json({
      status: 'success',
      message: 'Password reset instructions sent to email',
      // REMOVE THIS IN PRODUCTION - just for testing
      resetToken: resetToken
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    sendError(res, 500, 'Failed to process password reset request');
  }
});

// Admin reset password route
router.post("/admin/reset-password", async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return sendError(res, 400, 'Reset token and new password are required');
    }

    // Hash the token from the request to compare with stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Find admin with valid reset token and token not expired
    const admin = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
      role: 'admin'
    }).select('+password +resetPasswordToken +resetPasswordExpires');

    if (!admin) {
      return sendError(res, 400, 'Invalid or expired reset token');
    }

    // Validate password format
    const passwordRegex = /^(?=.*[!@#$%^&*])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return sendError(res, 400, 'Password must be at least 8 characters with a special character and number');
    }

    // Update password and clear reset token fields
    admin.password = newPassword;
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpires = undefined;
    await admin.save();

    res.status(200).json({
      status: 'success',
      message: 'Password has been reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    sendError(res, 500, 'Failed to reset password');
  }
});

// Admin registration route
router.post("/admin/register", async (req, res) => {
  try {
    const { fullName: name, email, address, phone, password, adminKey } = req.body;

    // Validate required fields
    const missingFields = [];
    if (!name) missingFields.push('name');
    if (!email) missingFields.push('email');
    if (!address) missingFields.push('address');
    if (!phone) missingFields.push('phone');
    if (!password) missingFields.push('password');
    if (!adminKey) missingFields.push('adminKey');

    if (missingFields.length > 0) {
      return res.status(400).json({ 
        status: 'error',
        message: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Invalid email format'
      });
    }

    // Validate phone number (10 digits)
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Phone number must be 10 digits'
      });
    }

    // Validate password format
    const passwordRegex = /^(?=.*[!@#$%^&*])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Password must be at least 8 characters with a special character and number'
      });
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
      return res.status(409).json({ 
        status: 'error',
        message: `${field} already exists` 
      });
    }

    // Verify admin key
    console.log('Received admin key:', adminKey);
    console.log('Expected admin key:', process.env.ADMIN_SECRET_KEY);
    
    // Use the correct admin key
    const ADMIN_KEY = 'tn@12345';
    if (adminKey !== ADMIN_KEY) {
      return res.status(403).json({ 
        status: 'error',
        message: 'Invalid admin key' 
      });
    }

    // Create new admin user
    const user = new User({
      name,
      email: email.toLowerCase().trim(),
      address: address.trim(),
      phone: phone.trim(),
      password,
      role: 'admin'
    });

    await user.save();

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      status: 'success',
      message: 'Admin registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Registration failed. Please try again.' 
    });
  }
});

module.exports = router;
