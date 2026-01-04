const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const express = require('express');
const router = express.Router();

// Configuration avec les variables d'environnement
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        // Pour les SVG, utiliser resource_type: 'raw' car Cloudinary les traite comme des fichiers bruts
        const isSvg = file.mimetype === 'image/svg+xml' || file.originalname.toLowerCase().endsWith('.svg');
        
        if (isSvg) {
            return {
                folder: 'e-perfume',
                resource_type: 'raw',
                format: 'svg',
            };
        }
        
        // Pour les autres images
        return {
            folder: 'e-perfume',
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        };
    },
});

const upload = multer({ storage: storage });

// Route pour uploader une image
router.post('/', upload.single('image'), (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Aucun fichier téléchargé' });
    }
    res.send(req.file.path); // Renvoie l'URL Cloudinary de l'image
}, (error, req, res, next) => {
    // Gestion des erreurs Multer
    if (error) {
        console.error('Erreur upload:', error);
        return res.status(400).json({ message: error.message || 'Erreur lors de l\'upload du fichier' });
    }
    next();
});

module.exports = router;
