const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    isModerated: { type: Boolean, default: false },
    moderatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    moderatedAt: { type: Date },
}, {
    timestamps: true,
});

const productSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    name: { type: String, required: true },
    image: { type: String, required: true },
    brand: { type: String, required: true },
    brandLogo: { type: String }, // Logo de la marque
    category: { type: String, required: true },
    fragranceFamily: { type: String }, // Floral, Oriental, Boisé, etc.
    skinType: { type: String }, // Pour les produits skincare: sèche, grasse, mixte, sensible
    description: { type: String, required: true },
    ingredients: { type: String }, // Ingrédients pour les soins
    fragranceNotes: [{
        type: { type: String, enum: ['Top', 'Coeur', 'Base'] },
        notes: [String]
    }],
    benefits: [String],
    reviews: [reviewSchema],
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
    price: { type: Number, required: true, default: 0 },
    countInStock: { type: Number, required: true, default: 0 },
    featured: { type: Boolean, default: false },
    isNew: { type: Boolean, default: false },
    isBestseller: { type: Boolean, default: false },
    onSale: { type: Boolean, default: false },
    salePrice: { type: Number },
    images: [String],
}, {
    timestamps: true,
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
