const mongoose = require('mongoose');

// Define the Resort schema
const resortSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 0,
    max: 5
  },
  imgSrc: {
    type: String,
    trim: true
  },
  photos: {
    type: [String],
    default: []
  },
  amenities: {
    type: [String],
    default: []
  },
  shortDescription: {
    type: String,
    trim: true
  },
  description: {
    type: [String],
    default: []
  },
  mapLink: {
    type: String,
    trim: true
  },
  vlogLink: { // ✅ renamed from VlogLink to vlogLink for consistency
    type: String,
    trim: true
  }
}, {
  timestamps: true // ✅ Adds createdAt and updatedAt
});

// Create and export the model
module.exports = mongoose.model('Resort', resortSchema);
