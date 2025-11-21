const express = require('express');
const User = require('../models/User');
const Resort = require('../models/Resort');
const Payment = require('../models/Payment');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const upload = require('../middleware/upload');
const { getAllResorts, createResort, getResortById, updateResort, deleteResort } = require('../controllers/resortController');

const router = express.Router();

// Get dashboard stats
router.get('/dashboard/stats', adminAuth, async (req, res) => {
    try {
        // Get total users (excluding admins)
        const totalUsers = await User.countDocuments({ role: 'user' });

        // Get total resorts
        const totalResorts = await Resort.countDocuments();

        // Get total bookings and revenue
        const payments = await Payment.find();
        const totalBookings = payments.length;
        const totalRevenue = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

        // Calculate average rating
        const resorts = await Resort.find({}, 'rating');
        const totalRatings = resorts.reduce((sum, resort) => sum + (resort.rating || 0), 0);
        const averageRating = resorts.length > 0 ? totalRatings / resorts.length : 0;

        res.json({
            totalUsers,
            totalResorts,
            totalBookings,
            totalRevenue,
            averageRating: parseFloat(averageRating.toFixed(1))
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Error fetching dashboard statistics' });
    }
});

// Get popular resorts
router.get('/resorts/popular', adminAuth, async (req, res) => {
    try {
        // Get all resorts sorted by rating
        const resorts = await Resort.find()
            .sort({ rating: -1 })
            .limit(5)
            .select('title location price rating imgSrc');

        // Transform the data to match frontend expectations
        const popularResorts = resorts.map(resort => ({
            _id: resort._id,
            title: resort.title,
            location: resort.location,
            price: resort.price,
            rating: resort.rating || 0,
            imgSrc: resort.imgSrc
        }));

        res.json(popularResorts);
    } catch (error) {
        console.error('Error fetching popular resorts:', error);
        res.status(500).json({ message: 'Error fetching popular resorts' });
    }
});

// Get all users (admin only)
router.get('/users', adminAuth, async (req, res) => {
    try {
        const users = await User.find({})
            .select('-password')
            .sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// Get single user (admin only)
router.get('/users/:id', adminAuth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Error fetching user' });
    }
});

// Update user (admin only)
router.put('/users/:id', adminAuth, async (req, res) => {
    try {
        const updates = req.body;
        const allowedUpdates = ['name', 'email', 'role', 'isActive'];
        
        const isValidOperation = Object.keys(updates).every(update => 
            allowedUpdates.includes(update)
        );

        if (!isValidOperation) {
            return res.status(400).json({ message: 'Invalid updates' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        Object.keys(updates).forEach(update => {
            user[update] = updates[update];
        });

        await user.save();
        res.json(user);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(400).json({ message: 'Update failed', error: error.message });
    }
});

// Delete user (admin only)
router.delete('/users/:id', adminAuth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent deleting other admins
        if (user.role === 'admin' && user._id.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Cannot delete other admin users' });
        }

        await user.remove();
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error deleting user' });
    }
});

// Resort Management Routes
router.get('/resorts', adminAuth, getAllResorts);
router.post('/resorts', adminAuth, upload.fields([
    { name: 'imgSrc', maxCount: 1 },
    { name: 'photos', maxCount: 10 }
]), createResort);
router.get('/resorts/:id', adminAuth, getResortById);
router.put('/resorts/:id', adminAuth, upload.fields([
    { name: 'imgSrc', maxCount: 1 },
    { name: 'photos', maxCount: 10 }
]), updateResort);
router.delete('/resorts/:id', adminAuth, deleteResort);

module.exports = router; 