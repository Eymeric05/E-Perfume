const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Comment = require('../models/Comment');

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
    
    // Si all=true et que l'utilisateur est admin, inclure les commentaires depuis la collection Comments
    if (all === 'true' && req.user && req.user.isAdmin) {
        const productsWithComments = await Promise.all(
            products.map(async (product) => {
                const productObj = product.toObject();
                const comments = await Comment.find({ product: product._id })
                    .populate('user', 'name')
                    .sort({ createdAt: -1 });
                
                productObj.reviews = comments.map(c => ({
                    _id: c._id,
                    name: c.name,
                    rating: c.rating,
                    comment: c.comment,
                    user: c.user,
                    isModerated: c.isModerated,
                    moderatedBy: c.moderatedBy,
                    moderatedAt: c.moderatedAt,
                    createdAt: c.createdAt,
                    updatedAt: c.updatedAt,
                }));
                
                return productObj;
            })
        );
        return res.json(productsWithComments);
    }
    
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
        // Récupérer les commentaires depuis la collection Comments
        const isAdmin = req.user && req.user.isAdmin;
        let comments;
        
        if (isAdmin) {
            // Admin voit tous les commentaires
            comments = await Comment.find({ product: product._id })
                .populate('user', 'name')
                .sort({ createdAt: -1 });
        } else {
            // Utilisateurs normaux voient seulement les commentaires modérés ou leurs propres commentaires
            const userId = req.user ? req.user._id : null;
            const query = { 
                product: product._id,
                $or: [{ isModerated: true }]
            };
            if (userId) {
                query.$or.push({ user: userId });
            }
            comments = await Comment.find(query)
                .populate('user', 'name')
                .sort({ createdAt: -1 });
        }
        
        // Convertir les commentaires au format reviews pour compatibilité
        const productObj = product.toObject();
        productObj.reviews = comments.map(c => ({
            _id: c._id,
            name: c.name,
            rating: c.rating,
            comment: c.comment,
            user: c.user,
            isModerated: c.isModerated,
            moderatedBy: c.moderatedBy,
            moderatedAt: c.moderatedAt,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
        }));
        
        res.json(productObj);
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
        // Supprimer tous les commentaires associés au produit
        await Comment.deleteMany({ product: product._id });
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
        isLimitedEdition,
        images,
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
        isLimitedEdition: isLimitedEdition || false,
        images: images || [],
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
        isLimitedEdition,
        images,
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
        if (isLimitedEdition !== undefined) {
            product.isLimitedEdition = isLimitedEdition;
        }
        if (images !== undefined) {
            product.images = images;
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
        // Vérifier si l'utilisateur a déjà laissé un commentaire
        const existingComment = await Comment.findOne({
            product: product._id,
            user: req.user._id,
        });

        if (existingComment) {
            res.status(400);
            throw new Error('Vous avez déjà laissé un avis pour ce produit');
        }

        // Créer le commentaire dans la collection Comments
        // Si l'utilisateur est admin, le commentaire est automatiquement approuvé
        const isAdminComment = req.user.isAdmin === true;
        const newComment = new Comment({
            product: product._id,
            user: req.user._id,
            name: req.user.name,
            rating: Number(rating),
            comment,
            isModerated: isAdminComment,
            moderatedBy: isAdminComment ? req.user._id : undefined,
            moderatedAt: isAdminComment ? new Date() : undefined,
        });

        await newComment.save();

        // Mettre à jour le rating et numReviews du produit
        // Seulement les commentaires modérés (ou admin) comptent pour le rating
        const moderatedComments = await Comment.find({ 
            product: product._id,
            isModerated: true 
        });
        product.numReviews = moderatedComments.length;
        if (moderatedComments.length > 0) {
            product.rating =
                moderatedComments.reduce((acc, item) => item.rating + acc, 0) /
                moderatedComments.length;
        } else {
            product.rating = 0;
        }

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

    if (!product) {
        res.status(404);
        throw new Error('Produit non trouvé');
    }

    // Trouver le commentaire dans la collection Comments
    const comment = await Comment.findById(req.params.reviewId);

    if (!comment) {
        res.status(404);
        throw new Error('Avis non trouvé');
    }

    // Vérifier que le commentaire appartient au produit
    if (comment.product.toString() !== product._id.toString()) {
        res.status(400);
        throw new Error('Le commentaire n\'appartient pas à ce produit');
    }

    if (action === 'approve') {
        comment.isModerated = true;
        comment.moderatedBy = req.user._id;
        comment.moderatedAt = new Date();
        await comment.save();
        
        // Après approbation, recalculer le rating
        const moderatedComments = await Comment.find({ 
            product: product._id,
            isModerated: true 
        });
        product.numReviews = moderatedComments.length;
        if (moderatedComments.length > 0) {
            product.rating =
                moderatedComments.reduce((acc, item) => item.rating + acc, 0) /
                moderatedComments.length;
        } else {
            product.rating = 0;
        }
        await product.save();
    } else if (action === 'reject') {
        // Supprimer le commentaire de la collection Comments
        await Comment.findByIdAndDelete(req.params.reviewId);
        
        // Recalculer le rating du produit (seulement les commentaires modérés)
        const moderatedComments = await Comment.find({ 
            product: product._id,
            isModerated: true 
        });
        product.numReviews = moderatedComments.length;
        if (moderatedComments.length > 0) {
            product.rating =
                moderatedComments.reduce((acc, item) => item.rating + acc, 0) /
                moderatedComments.length;
        } else {
            product.rating = 0;
        }
        await product.save();
    }

    res.json({ message: 'Avis modéré' });
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
