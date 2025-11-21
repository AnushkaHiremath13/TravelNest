const jwt = require('jsonwebtoken');
const User = require('../models/User');

const adminAuth = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'No authentication token, access denied' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallbacksecret');
        
        // Check if the decoded token has the required fields
        if (!decoded.id || !decoded.role) {
            throw new Error('Invalid token format');
        }

        // Find user
        const user = await User.findOne({ 
            _id: decoded.id,
            role: 'admin'
        });

        if (!user) {
            throw new Error('Not authorized as admin');
        }

        // Add user info to request
        req.user = {
            userId: user._id,
            role: user.role,
            email: user.email
        };

        next();
    } catch (error) {
        console.error('Admin auth error:', error);
        res.status(401).json({ message: 'Not authorized as admin' });
    }
};

module.exports = adminAuth; 