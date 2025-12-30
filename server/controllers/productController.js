const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
    const { category, all, fragranceFamily, skinType } = req.query;
    let query = {};
    
    // If 'all' parameter is true, return all products (for admin panel)
    if (all === 'true') {
        query = {};
    } else if (category) {
        // If category is specified, filter by it
        query = { category };
    } else {
        // If no category specified, exclude skincare (show only perfumes)
        query = { category: { $ne: 'skincare' } };
    }
    
    // Additional filters
    if (fragranceFamily) {
        query.fragranceFamily = fragranceFamily;
    }
    if (skinType) {
        query.skinType = skinType;
    }
    
    const products = await Product.find(query);
    res.json(products);
});

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
const searchProducts = asyncHandler(async (req, res) => {
    const { q } = req.query;
    if (!q) {
        return res.json([]);
    }
    
    const products = await Product.find({
        $or: [
            { name: { $regex: q, $options: 'i' } },
            { brand: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } },
        ],
    }).limit(10);
    
    res.json(products);
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        // Only return moderated reviews for non-admin users
        const isAdmin = req.user && req.user.isAdmin;
        if (!isAdmin) {
            const productObj = product.toObject();
            const userId = req.user ? req.user._id.toString() : '';
            productObj.reviews = productObj.reviews.filter(r => 
                r.isModerated || (userId && r.user.toString() === userId)
            );
            res.json(productObj);
        } else {
            res.json(product);
        }
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        await product.deleteOne();
        res.json({ message: 'Product removed' });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
    const {
        name,
        price,
        description,
        image,
        brand,
        brandLogo,
        category,
        countInStock,
        fragranceNotes,
        benefits,
        fragranceFamily,
        skinType,
        ingredients,
    } = req.body;

    const product = new Product({
        name: name || 'Sample name',
        price: price || 0,
        user: req.user._id,
        image: image || '/images/sample.jpg',
        brand: brand || 'Sample brand',
        brandLogo: brandLogo || '',
        category: category || 'Sample category',
        countInStock: countInStock || 0,
        numReviews: 0,
        description: description || 'Sample description',
        fragranceNotes: fragranceNotes || [],
        benefits: benefits || [],
        fragranceFamily: fragranceFamily || '',
        skinType: skinType || '',
        ingredients: ingredients || '',
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
    const {
        name,
        price,
        description,
        image,
        brand,
        brandLogo,
        category,
        countInStock,
        fragranceNotes,
        benefits,
        fragranceFamily,
        skinType,
        ingredients,
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
        product.name = name;
        product.price = price;
        product.description = description;
        product.image = image;
        product.brand = brand;
        if (brandLogo !== undefined) {
            product.brandLogo = brandLogo;
        }
        product.category = category;
        product.countInStock = countInStock;
        
        // Update fragranceNotes and benefits if provided
        if (fragranceNotes !== undefined) {
            product.fragranceNotes = fragranceNotes;
        }
        if (benefits !== undefined) {
            product.benefits = benefits;
        }
        if (fragranceFamily !== undefined) {
            product.fragranceFamily = fragranceFamily;
        }
        if (skinType !== undefined) {
            product.skinType = skinType;
        }
        if (ingredients !== undefined) {
            product.ingredients = ingredients;
        }

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Create product review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
        const alreadyReviewed = product.reviews.find(
            (r) => r.user.toString() === req.user._id.toString()
        );

        if (alreadyReviewed) {
            res.status(400);
            throw new Error('Vous avez déjà laissé un avis pour ce produit');
        }

        const review = {
            name: req.user.name,
            rating: Number(rating),
            comment,
            user: req.user._id,
            isModerated: false,
        };

        product.reviews.push(review);

        product.numReviews = product.reviews.length;

        product.rating =
            product.reviews.reduce((acc, item) => item.rating + acc, 0) /
            product.reviews.length;

        await product.save();
        res.status(201).json({ message: 'Avis ajouté' });
    } else {
        res.status(404);
        throw new Error('Produit non trouvé');
    }
});

// @desc    Moderate product review
// @route   PUT /api/products/:id/reviews/:reviewId
// @access  Private/Admin
const moderateReview = asyncHandler(async (req, res) => {
    const { action } = req.body; // 'approve' or 'reject'

    const product = await Product.findById(req.params.id);

    if (product) {
        const review = product.reviews.id(req.params.reviewId);

        if (review) {
            if (action === 'approve') {
                review.isModerated = true;
                review.moderatedBy = req.user._id;
                review.moderatedAt = new Date();
            } else if (action === 'reject') {
                // Remove the review
                product.reviews.pull({ _id: req.params.reviewId });
                
                // Recalculate rating
                if (product.reviews.length > 0) {
                    product.rating =
                        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
                        product.reviews.length;
                } else {
                    product.rating = 0;
                }
                product.numReviews = product.reviews.length;
            }

            await product.save();
            res.json({ message: 'Avis modéré' });
        } else {
            res.status(404);
            throw new Error('Avis non trouvé');
        }
    } else {
        res.status(404);
        throw new Error('Produit non trouvé');
    }
});

module.exports = {
    getProducts,
    getProductById,
    deleteProduct,
    createProduct,
    updateProduct,
    searchProducts,
    createProductReview,
    moderateReview,
};
