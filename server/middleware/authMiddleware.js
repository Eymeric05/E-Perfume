const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';
            const decoded = jwt.verify(token, JWT_SECRET);

            req.user = await User.findById(decoded.id).select('-password');

            next();
        } catch (error) {
            console.error(error);
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

const admin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(401);
        throw new Error('Not authorized as an admin');
    }
};

// Optional authentication - sets req.user if token is valid, but doesn't require it
const optionalAuth = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';
            const decoded = jwt.verify(token, JWT_SECRET);

            req.user = await User.findById(decoded.id).select('-password');
        } catch (error) {
            // If token is invalid, just continue without setting req.user
            req.user = null;
        }
    }

    next();
});

module.exports = { protect, admin, optionalAuth };
