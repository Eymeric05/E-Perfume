const express = require('express');
const router = express.Router();
const {
    getBrands,
    getBrandByName,
    updateBrand,
} = require('../controllers/brandController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(getBrands);
router.route('/:name').get(getBrandByName).put(protect, admin, updateBrand);

module.exports = router;
