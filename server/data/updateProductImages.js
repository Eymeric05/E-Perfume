const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');

dotenv.config();

// Mapping complet des produits avec leurs images webp correctes
const productImageUpdates = [
  // Parfums Homme
  {
    name: 'Sauvage',
    brand: 'Dior',
    image: '/images/sauvage.jpg',
  },
  {
    name: 'Bleu de Chanel',
    brand: 'Chanel',
    image: '/images/bleu-chanel.webp',
  },
  {
    name: 'One Million',
    brand: 'Paco Rabanne',
    image: '/images/onemillion.webp',
  },
  {
    name: 'Eros',
    brand: 'Versace',
    image: '/images/eros.webp',
  },
  // Parfums Femme
  {
    name: 'La Vie Est Belle',
    brand: 'Lancôme',
    image: '/images/la-vie-est-belle.webp',
  },
  {
    name: 'Coco Mademoiselle',
    brand: 'Chanel',
    image: '/images/coco-mademoiselle.webp',
  },
  {
    name: 'J\'adore',
    brand: 'Dior',
    image: '/images/jadoredior.webp',
  },
  {
    name: 'Black Opium',
    brand: 'Yves Saint Laurent',
    image: '/images/black-opium-eau-de-parfum.webp',
  },
  {
    name: 'Flowerbomb',
    brand: 'Viktor & Rolf',
    image: '/images/flowerbomb.webp',
  },
];

const updateProductImages = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/e-parfume';
    
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected');

    let updatedCount = 0;
    let notFoundCount = 0;

    for (const update of productImageUpdates) {
      const product = await Product.findOne({ 
        name: update.name,
        brand: update.brand 
      });

      if (product) {
        product.image = update.image;
        await product.save();
        console.log(`✓ Updated image for: ${update.name} (${update.brand})`);
        updatedCount++;
      } else {
        console.log(`✗ Product not found: ${update.name} (${update.brand})`);
        notFoundCount++;
      }
    }

    console.log(`\n✅ Update complete!`);
    console.log(`   Updated: ${updatedCount} products`);
    console.log(`   Not found: ${notFoundCount} products`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error updating product images:', error);
    process.exit(1);
  }
};

updateProductImages();

