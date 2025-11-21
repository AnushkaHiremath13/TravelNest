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
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  roomType: {
    type: String,
    trim: true,
    default: 'Standard Room'
  },
  occupancy: {
    type: Number,
    min: [1, 'Occupancy must be at least 1'],
    default: 2
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot be more than 5']
  },
  ratingPhrase: {
    type: String,
    trim: true,
    default: 'Good'
  },
  amenitiesRating: {
    type: Number,
    min: [0, 'Amenities rating cannot be less than 0'],
    max: [5, 'Amenities rating cannot be more than 5'],
    default: 4
  },
  imgSrc: {
    type: String,
    trim: true,
    default: ''
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
    trim: true,
    required: [true, 'Short description is required']
  },
  description: {
    type: [String],
    default: []
  },
  mapLink: {
    type: String,
    trim: true,
    required: [true, 'Map link is required'],
    validate: {
      validator: function(v) {
        return v.includes('google.com/maps/embed');
      },
      message: props => `${props.value} is not a valid Google Maps embed link!`
    }
  },
  vlogLink: {
    type: String,
    trim: true,
    default: ''
  },
  packages: [{
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    image: {
      type: String,
      // required: true // Make package image optional for now
    },
    duration: {
      type: String,
      required: true
    },
    highlights: {
      type: [String],
      default: []
    },
    inclusions: {
      type: [String],
      default: []
    }
  }],
  nearbyAttractions: {
    type: [String],
    default: []
  },
  reviews: [{
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    title: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: true
    },
    author: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  collection: 'resorts' // Explicitly set collection name
});

// Add index for better query performance
resortSchema.index({ title: 1, location: 1 });

// Pre-save middleware to ensure arrays are initialized
resortSchema.pre('save', function(next) {
  if (!this.photos) this.photos = [];
  if (!this.amenities) this.amenities = [];
  if (!this.description) this.description = [];
  next();
});

// Create and export the model
const Resort = mongoose.model('Resort', resortSchema);
module.exports = Resort;
