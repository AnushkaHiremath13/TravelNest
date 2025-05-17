const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {  // Changed from fullName to match frontend/controller
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: validator.isEmail,
      message: 'Please provide a valid email address'
    }
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    validate: {
      validator: v => /^\d{10}$/.test(v),
      message: 'Phone must be 10 digits' // Matched controller message
    },
    trim: true
  },
  // Update password validation to match frontend
  password: {
    type: String,
    required: [true, 'Password is required'],
    select: false, // Don't include password by default in queries
    validate: {
      validator: function (v) {
        return /^(?=.*[!@#$%^&*])(?=.*\d).{8,}$/.test(v);
      },
      message: 'Password must contain at least one special character and number, with minimum 8 characters'
    }
  },

  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user' // Removed required: true since default exists
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Password hashing middleware (keep unchanged)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcryptjs.genSalt(12);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Password comparison method
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcryptjs.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Add indexes for better performance
// In user.js model
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ phone: 1 }, { unique: true });
userSchema.index({ role: 1 });

// Sanitize output (keep unchanged)
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);