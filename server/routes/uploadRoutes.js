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
    params: {
        folder: 'e-perfume', // Nom du dossier sur Cloudinary
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'svg'],
    },
});

const upload = multer({ storage: storage });

// Route pour uploader une image
router.post('/', upload.single('image'), (req, res) => {
    res.send(req.file.path); // Renvoie l'URL Cloudinary de l'image
});

module.exports = router;
