const Resort = require('../models/Resort');
const mongoose = require('mongoose');

// @desc    Get all resorts
// @route   GET /api/resorts
// @access  Public
exports.getAllResorts = async (req, res) => {
  try {
    console.log('Fetching all resorts...');
    
    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      console.error('Database not connected. State:', mongoose.connection.readyState);
      throw new Error('Database connection error');
    }

    // Count total resorts
    const count = await Resort.countDocuments();
    console.log('Total resorts in database:', count);

    // Fetch all resorts
    const resorts = await Resort.find({})
      .sort({ createdAt: -1 }) // Sort by newest first
      .select('-__v'); // Exclude version key

    console.log(`Found ${resorts.length} resorts`);
    
    // Log resort titles for debugging
    console.log('Resort titles:', resorts.map(r => r.title));

    res.status(200).json(resorts);
  } catch (error) {
    console.error('Error in getAllResorts:', error);
    res.status(500).json({ 
      message: 'Failed to fetch resorts', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Create a new resort
// @route   POST /api/resorts
// @access  Private/Admin
exports.createResort = async (req, res) => {
  try {
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB not connected. Connection state:', mongoose.connection.readyState);
      throw new Error('Database connection error');
    }

    console.log('Creating new resort...');
    console.log('Request body:', {
      ...req.body,
      // Hide sensitive data if any
      photos: req.body.photos ? `${req.body.photos.length} photos` : 'none'
    });

    // Validate required fields
    const requiredFields = ['title', 'location', 'price', 'rating', 'shortDescription'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    const {
      title,
      location,
      price,
      originalPrice,
      roomType,
      occupancy,
      rating,
      ratingPhrase,
      amenitiesRating,
      amenities,
      shortDescription,
      description,
      mapLink,
      vlogLink,
      packages,
      nearbyAttractions
    } = req.body;

    // Validate numeric fields
    if (isNaN(Number(price)) || isNaN(Number(rating))) {
      throw new Error('Price and rating must be valid numbers');
    }

    // Build new resort object
    const resortData = {
      title,
      location,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      roomType,
      occupancy: occupancy ? Number(occupancy) : undefined,
      rating: Number(rating),
      ratingPhrase,
      amenitiesRating: amenitiesRating ? Number(amenitiesRating) : undefined,
      shortDescription,
      mapLink,
      vlogLink,
      amenities: JSON.parse(amenities || '[]'),
      description: JSON.parse(description || '[]'),
      packages: JSON.parse(packages || '[]'),
      nearbyAttractions: JSON.parse(nearbyAttractions || '[]'),
      imgSrc: '',
      photos: []
    };

    // Handle file uploads
    if (req.files) {
      console.log('Processing uploaded files:', {
        mainImage: req.files.imgSrc ? 'Present' : 'Not present',
        additionalPhotos: req.files.photos ? `${req.files.photos.length} photos` : 'None'
      });
      
      // Handle main image
      if (req.files.imgSrc && req.files.imgSrc[0]) {
        resortData.imgSrc = `uploads/${req.files.imgSrc[0].filename}`;
        console.log('Main image path:', resortData.imgSrc);
      }

      // Handle gallery images
      if (req.files.photos && req.files.photos.length > 0) {
        resortData.photos = req.files.photos.map(file => `uploads/${file.filename}`);
        console.log('Number of gallery images:', resortData.photos.length);
      }
    }

    console.log('Attempting to save resort with data:', {
      ...resortData,
      photos: `${resortData.photos.length} photos` // Don't log full paths
    });

    // Create and save resort with explicit error handling
    let resort;
    try {
      resort = new Resort(resortData);
      console.log('Created new Resort instance');
      
      const savedResort = await resort.save();
      console.log('Resort saved successfully. ID:', savedResort._id);
      
      // Verify the save by fetching it back
      const verifiedResort = await Resort.findById(savedResort._id);
      if (!verifiedResort) {
        throw new Error('Resort was not saved properly');
      }
      
      console.log('Resort verified in database');
      res.status(201).json({ 
        message: 'Resort created successfully', 
        resort: savedResort
      });
    } catch (saveError) {
      console.error('Error during resort save:', saveError);
      if (saveError.name === 'ValidationError') {
        const validationErrors = Object.values(saveError.errors).map(err => err.message);
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }
      throw saveError;
    }
  } catch (error) {
    console.error('Error creating resort:', error);
    const statusCode = error.message.includes('Validation') ? 400 : 500;
    res.status(statusCode).json({ 
      message: 'Failed to create resort', 
      error: error.message 
    });
  }
};

// @desc    Get a single resort by ID
// @route   GET /api/resorts/:id
// @access  Public
exports.getResortById = async (req, res) => {
  try {
    const resort = await Resort.findById(req.params.id);
    if (!resort) {
      return res.status(404).json({ message: 'Resort not found' });
    }
    res.status(200).json(resort);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch resort', error: error.message });
  }
};

// @desc    Update resort by ID
// @route   PUT /api/resorts/:id
// @access  Private/Admin
exports.updateResort = async (req, res) => {
  try {
    const {
      title,
      location,
      price,
      originalPrice,
      roomType,
      occupancy,
      rating,
      ratingPhrase,
      amenitiesRating,
      amenities,
      shortDescription,
      description,
      mapLink,
      vlogLink,
      packages,
      nearbyAttractions
    } = req.body;

    const updatedData = {
      title,
      location,
      price,
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      roomType,
      occupancy: occupancy ? Number(occupancy) : undefined,
      rating,
      ratingPhrase,
      amenitiesRating: amenitiesRating ? Number(amenitiesRating) : undefined,
      shortDescription,
      mapLink,
      vlogLink,
      amenities: JSON.parse(amenities || '[]'),
      description: JSON.parse(description || '[]'),
      packages: JSON.parse(packages || '[]'),
      nearbyAttractions: JSON.parse(nearbyAttractions || '[]')
    };

    // Handle new image uploads (overwrite old if uploaded)
    if (req.files) {
      if (req.files.imgSrc && req.files.imgSrc[0]) {
        updatedData.imgSrc = `uploads/${req.files.imgSrc[0].filename}`;
      }
      if (req.files.photos && req.files.photos.length > 0) {
        updatedData.photos = req.files.photos.map(file => `uploads/${file.filename}`);
      }
    }

    const resort = await Resort.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
      runValidators: true
    });

    if (!resort) {
      return res.status(404).json({ message: 'Resort not found' });
    }

    res.status(200).json({ message: 'Resort updated successfully', resort });
  } catch (error) {
    console.log('Update resort error caught!');
    console.error('Error updating resort:', error);
    res.status(500).json({ message: 'Failed to update resort', error: error.message });
  }
};

// @desc    Delete resort by ID
// @route   DELETE /api/resorts/:id
// @access  Private/Admin
exports.deleteResort = async (req, res) => {
  try {
    const resort = await Resort.findByIdAndDelete(req.params.id);
    if (!resort) {
      return res.status(404).json({ message: 'Resort not found' });
    }
    res.status(200).json({ message: 'Resort deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete resort', error: error.message });
  }
};

// @desc    Search resorts by destination or title
// @route   GET /api/resorts/search?destination=Goa or ?title=Ocean
// @access  Public
exports.searchResorts = async (req, res) => {
  try {
    const { destination, title } = req.query;
    let resorts;

    if (destination) {
      resorts = await Resort.find({
        $or: [
          { location: { $regex: destination, $options: 'i' } },
          { title: { $regex: destination, $options: 'i' } }
        ]
      });
    } else if (title) {
      resorts = await Resort.find({
        title: { $regex: title, $options: 'i' }
      });
    } else {
      resorts = await Resort.find({});
    }

    res.status(200).json(resorts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to search resorts', error: error.message });
  }
};
