const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    brandLogo: {
        type: String,
        default: '',
    },
    heroImage: {
        type: String,
        default: '',
    },
    description: {
        type: String,
        default: '',
    },
}, {
    timestamps: true,
});

const Brand = mongoose.model('Brand', brandSchema);

module.exports = Brand;
