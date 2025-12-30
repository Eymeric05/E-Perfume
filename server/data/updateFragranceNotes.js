const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');

dotenv.config();

// Notes olfactives pour chaque parfum
const fragranceNotesData = {
  'Sauvage': [
    { type: 'Top', notes: ['Bergamote de Calabre', 'Poivre de Sichuan'] },
    { type: 'Coeur', notes: ['Lavande', 'Poivre rose', 'Girofle', 'Muscade', 'Géranium', 'Patchouli', 'Vétiver'] },
    { type: 'Base', notes: ['Ambroxan', 'Labdanum', 'Cèdre'] }
  ],
  'Bleu de Chanel': [
    { type: 'Top', notes: ['Citron', 'Menthe', 'Pamplemousse rose', 'Gingembre', 'Bergamote'] },
    { type: 'Coeur', notes: ['Jasmin', 'Nuances fruitées', 'Neroli'] },
    { type: 'Base', notes: ['Encens', 'Cèdre', 'Santal', 'Patchouli', 'Labdanum', 'Ambre gris'] }
  ],
  'La Vie Est Belle': [
    { type: 'Top', notes: ['Framboise', 'Poire', 'Cassis'] },
    { type: 'Coeur', notes: ['Iris', 'Jasmin', 'Fleur d\'oranger'] },
    { type: 'Base', notes: ['Patchouli', 'Praliné', 'Vanille', 'Ambre'] }
  ],
  'Coco Mademoiselle': [
    { type: 'Top', notes: ['Orange', 'Mandarine', 'Bergamote', 'Pamplemousse'] },
    { type: 'Coeur', notes: ['Jasmin', 'Rose de Mai', 'Mimosa'] },
    { type: 'Base', notes: ['Patchouli', 'Vétiver', 'Vanille', 'Encens', 'Blanc musqué'] }
  ],
  'Acqua di Gio': [
    { type: 'Top', notes: ['Bergamote', 'Neroli', 'Marine', 'Mandarine'] },
    { type: 'Coeur', notes: ['Jasmin', 'Romarin', 'Persil', 'Muguet', 'Sauge'] },
    { type: 'Base', notes: ['Musc', 'Patchouli', 'Cèdre', 'Ambre'] }
  ],
  'J\'adore': [
    { type: 'Top', notes: ['Ylang-Ylang', 'Bergamote', 'Amandier'] },
    { type: 'Coeur', notes: ['Jasmin de Grasse', 'Rose de Damas', 'Orchidée', 'Freesia'] },
    { type: 'Base', notes: ['Ambre', 'Musc', 'Vanille'] }
  ],
  'One Million': [
    { type: 'Top', notes: ['Menthe', 'Pamplemousse rose', 'Sangria', 'Épices'] },
    { type: 'Coeur', notes: ['Rose', 'Cannelle', 'Épices', 'Fleur de mimosa'] },
    { type: 'Base', notes: ['Cuir', 'Ambre', 'Blond tabac', 'Patchouli', 'Musc blanc'] }
  ],
  'Black Opium': [
    { type: 'Top', notes: ['Poire', 'Pink Pepper', 'Orange'] },
    { type: 'Coeur', notes: ['Café', 'Jasmin', 'Fleur d\'amandier'] },
    { type: 'Base', notes: ['Vanille', 'Patchouli', 'Cèdre', 'Cashmeran'] }
  ],
  'Eros': [
    { type: 'Top', notes: ['Menthe', 'Pomme verte', 'Citron', 'Amandier'] },
    { type: 'Coeur', notes: ['Tonka', 'Ambroxan', 'Géranium'] },
    { type: 'Base', notes: ['Vanille', 'Vétiver', 'Bois de cèdre', 'Musc', 'Mousse'] }
  ],
  'Flowerbomb': [
    { type: 'Top', notes: ['Bergamote', 'Thé vert'] },
    { type: 'Coeur', notes: ['Rose', 'Orchidée', 'Jasmin', 'Freesia', 'Osmanthus'] },
    { type: 'Base', notes: ['Patchouli', 'Musc', 'Ambre'] }
  ],
};

const updateFragranceNotes = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/e-parfume';
    
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected');

    let updatedCount = 0;

    for (const [productName, notes] of Object.entries(fragranceNotesData)) {
      const result = await Product.updateMany(
        { name: productName, category: { $ne: 'skincare' } },
        { $set: { fragranceNotes: notes } }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`✓ Updated ${productName}: ${result.modifiedCount} product(s)`);
        updatedCount += result.modifiedCount;
      } else {
        console.log(`- ${productName}: No products found or already updated`);
      }
    }

    console.log(`\n✅ Successfully updated ${updatedCount} products with fragrance notes`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating fragrance notes:', error);
    process.exit(1);
  }
};

updateFragranceNotes();

