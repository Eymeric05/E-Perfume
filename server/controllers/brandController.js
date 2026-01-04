const asyncHandler = require('express-async-handler');
const Brand = require('../models/Brand');

// @desc    Get all brands
// @route   GET /api/brands
// @access  Public
const getBrands = asyncHandler(async (req, res) => {
    const Product = require('../models/Product');
    
    // Get all unique brands from products
    const products = await Product.find({}).distinct('brand');
    
    // Get brands from Brand collection
    const brandDocs = await Brand.find({}).sort({ name: 1 });
    const brandNames = brandDocs.map(b => b.name.toLowerCase());
    
    // Add brands from products that don't have a Brand document yet
    const allBrands = [...brandDocs];
    for (const productBrand of products) {
        if (productBrand && !brandNames.includes(productBrand.toLowerCase())) {
            allBrands.push({
                name: productBrand,
                brandLogo: '',
                heroImage: '',
                description: '',
            });
        }
    }
    
    // Sort by name
    allBrands.sort((a, b) => {
        const nameA = a.name?.toLowerCase() || '';
        const nameB = b.name?.toLowerCase() || '';
        return nameA.localeCompare(nameB);
    });
    
    res.json(allBrands);
});

// @desc    Get brand by name
// @route   GET /api/brands/:name
// @access  Public
const getBrandByName = asyncHandler(async (req, res) => {
    const brandName = decodeURIComponent(req.params.name);
    const brand = await Brand.findOne({ name: { $regex: new RegExp(`^${brandName}$`, 'i') } });

    if (brand) {
        res.json(brand);
    } else {
        res.status(404);
        throw new Error('Brand not found');
    }
});

// @desc    Create or update brand
// @route   PUT /api/brands/:name
// @access  Private/Admin
const updateBrand = asyncHandler(async (req, res) => {
    const brandName = decodeURIComponent(req.params.name);
    const { brandLogo, heroImage, description } = req.body;

    let brand = await Brand.findOne({ name: { $regex: new RegExp(`^${brandName}$`, 'i') } });

    if (brand) {
        // Update existing brand
        if (brandLogo !== undefined) {
            brand.brandLogo = brandLogo;
        }
        if (heroImage !== undefined) {
            brand.heroImage = heroImage;
        }
        if (description !== undefined) {
            brand.description = description;
        }
        const updatedBrand = await brand.save();
        res.json(updatedBrand);
    } else {
        // Create new brand
        brand = new Brand({
            name: brandName,
            brandLogo: brandLogo || '',
            heroImage: heroImage || '',
            description: description || '',
        });
        const createdBrand = await brand.save();
        res.status(201).json(createdBrand);
    }
});

module.exports = {
    getBrands,
    getBrandByName,
    updateBrand,
};
