const Resort = require('../models/Resort');

// @desc    Get all resorts
// @route   GET /api/resorts
// @access  Public
exports.getAllResorts = async (req, res) => {
  try {
    const resorts = await Resort.find({});
    res.status(200).json(resorts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch resorts', error: error.message });
  }
};

// @desc    Create a new resort
// @route   POST /api/resorts
// @access  Private/Admin
exports.createResort = async (req, res) => {
  try {
    const {
      title,
      location,
      price,
      rating,
      amenities,
      shortDescription,
      description,
      mapLink,
      VlogLink
    } = req.body;

    // Build new resort object
    const resortData = {
      title,
      location,
      price,
      rating,
      shortDescription,
      mapLink,
      VlogLink,
      amenities: JSON.parse(amenities || '[]'),
      description: JSON.parse(description || '[]'),
      imgSrc: '',
      photos: []
    };

    // Handle image uploads
    if (req.files) {
      if (req.files.imgSrc && req.files.imgSrc[0]) {
        resortData.imgSrc = `/uploads/${req.files.imgSrc[0].filename}`;
      }
      if (req.files.photos && req.files.photos.length > 0) {
        resortData.photos = req.files.photos.map(file => `/uploads/${file.filename}`);
      }
    }

    const resort = new Resort(resortData);
    await resort.save();
    res.status(201).json({ message: 'Resort created successfully', resort });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create resort', error: error.message });
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
      rating,
      amenities,
      shortDescription,
      description,
      mapLink,
      VlogLink
    } = req.body;

    const updatedData = {
      title,
      location,
      price,
      rating,
      shortDescription,
      mapLink,
      VlogLink,
      amenities: JSON.parse(amenities || '[]'),
      description: JSON.parse(description || '[]')
    };

    // Handle new image uploads (overwrite old if uploaded)
    if (req.files) {
      if (req.files.imgSrc && req.files.imgSrc[0]) {
        updatedData.imgSrc = `/uploads/${req.files.imgSrc[0].filename}`;
      }
      if (req.files.photos && req.files.photos.length > 0) {
        updatedData.photos = req.files.photos.map(file => `/uploads/${file.filename}`);
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
