const Resort = require('../models/Resort');
const User = require('../models/User');
const Booking = require('../models/Booking');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
    try {
        console.log('Fetching dashboard stats...');
        
        // Get total resorts
        const totalResorts = await Resort.countDocuments();
        console.log('Total resorts:', totalResorts);

        // Get total users (including admins)
        const totalUsers = await User.countDocuments();
        console.log('Total users:', totalUsers);

        // Get average rating
        const resorts = await Resort.find({}, 'rating');
        const totalRatings = resorts.reduce((acc, resort) => acc + (resort.rating || 0), 0);
        const averageRating = resorts.length > 0 ? totalRatings / resorts.length : 0;
        console.log('Average rating:', averageRating);

        const response = {
            totalResorts,
            totalUsers,
            averageRating
        };
        console.log('Sending response:', response);
        
        res.json(response);
    } catch (error) {
        console.error('Error getting dashboard stats:', error);
        res.status(500).json({ message: 'Error fetching dashboard statistics' });
    }
};

// @desc    Get popular resorts
// @route   GET /api/admin/resorts/popular
// @access  Private/Admin
exports.getPopularResorts = async (req, res) => {
    try {
        console.log('Fetching popular resorts...');
        
        // Get top 5 resorts by rating
        const popularResorts = await Resort.find()
            .sort({ rating: -1 })
            .limit(5)
            .select('title location price rating imgSrc');
            
        console.log('Popular resorts found:', popularResorts);
        
        // Transform the data to match the frontend expectations
        const transformedResorts = popularResorts.map(resort => ({
            name: resort.title,  // Map title to name for frontend compatibility
            location: resort.location,
            price: resort.price,
            rating: resort.rating,
            image: resort.imgSrc  // Map imgSrc to image for frontend compatibility
        }));
        
        res.json(transformedResorts);
    } catch (error) {
        console.error('Error getting popular resorts:', error);
        res.status(500).json({ message: 'Error fetching popular resorts' });
    }
}; 