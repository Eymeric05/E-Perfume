const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductById,
    deleteProduct,
    updateProduct,
    createProduct,
    searchProducts,
    createProductReview,
    moderateReview,
} = require('../controllers/productController');
const { protect, admin, optionalAuth } = require('../middleware/authMiddleware');

router.route('/').get(optionalAuth, getProducts).post(protect, admin, createProduct);
router.route('/search').get(searchProducts);
router.route('/:id/reviews').post(protect, createProductReview);
router.route('/:id/reviews/:reviewId').put(protect, admin, moderateReview);
router
    .route('/:id')
    .get(optionalAuth, getProductById)
    .delete(protect, admin, deleteProduct)
    .put(protect, admin, updateProduct);

module.exports = router;
