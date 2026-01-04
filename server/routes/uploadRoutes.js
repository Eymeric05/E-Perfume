const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const express = require('express');
const router = express.Router();

// Configuration avec les variables d'environnement
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Utiliser multer memoryStorage pour gérer manuellement l'upload vers Cloudinary
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

// Route pour uploader une image
router.post('/', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Aucun fichier téléchargé' });
        }

        const isSvg = req.file.mimetype === 'image/svg+xml' || req.file.originalname.toLowerCase().endsWith('.svg');
        
        // Convertir le buffer en string base64 pour Cloudinary
        const uploadStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        
        let result;
        if (isSvg) {
            // Pour les SVG, utiliser upload_stream avec resource_type: 'raw'
            result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        resource_type: 'raw',
                        folder: 'e-perfume',
                    },
                    (error, result) => {
                        if (error) {
                            console.error('Erreur upload SVG:', error);
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    }
                );
                uploadStream.end(req.file.buffer);
            });
        } else {
            // Pour les autres images
            result = await cloudinary.uploader.upload(uploadStr, {
                folder: 'e-perfume',
                allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
            });
        }

        res.send(result.secure_url || result.url);
    } catch (error) {
        console.error('Erreur upload Cloudinary:', error);
        res.status(400).json({ message: error.message || 'Erreur lors de l\'upload du fichier' });
    }
});

module.exports = router;
