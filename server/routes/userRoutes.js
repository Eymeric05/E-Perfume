const express = require('express');
const router = express.Router();
const {
    authUser,
    registerUser,
    getUserProfile,
    getUsers,
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    verifyEmail,
    forgotPassword,
    resetPassword,
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', registerUser);
router.post('/login', authUser);
router.get('/verify/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.route('/profile').get(protect, getUserProfile);
router.route('/').get(protect, admin, getUsers);
router.route('/wishlist').get(protect, getWishlist);
router.route('/wishlist/:productId').post(protect, addToWishlist).delete(protect, removeFromWishlist);

module.exports = router;
