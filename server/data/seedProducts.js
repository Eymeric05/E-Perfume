const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');
const User = require('../models/User');
const { searchFragrances, transformFragranceToProduct } = require('../utils/fragranceApi');

dotenv.config();

const products = [
  {
    name: 'Sauvage',
    image: '/images/sauvage.jpg',
    brand: 'Dior',
    category: 'Homme',
    description: 'Un parfum frais et épicé avec des notes de bergamote, poivre et ambroxan. Un classique moderne et intemporel.',
    price: 89.99,
    countInStock: 50,
    rating: 4.5,
    numReviews: 12,
    fragranceNotes: [
      { type: 'Top', notes: ['Bergamote de Calabre', 'Poivre de Sichuan'] },
      { type: 'Coeur', notes: ['Lavande', 'Poivre rose', 'Girofle', 'Muscade', 'Géranium', 'Patchouli', 'Vétiver'] },
      { type: 'Base', notes: ['Ambroxan', 'Labdanum', 'Cèdre'] }
    ],
  },
  {
    name: 'Bleu de Chanel',
    image: '/images/bleu-chanel.webp',
    brand: 'Chanel',
    category: 'Homme',
    description: 'Un parfum élégant et raffiné aux notes de citron, menthe et encens. Sophistiqué et polyvalent.',
    price: 95.00,
    countInStock: 30,
    rating: 4.7,
    numReviews: 18,
    fragranceNotes: [
      { type: 'Top', notes: ['Citron', 'Menthe', 'Pamplemousse rose', 'Gingembre', 'Bergamote'] },
      { type: 'Coeur', notes: ['Jasmin', 'Nuances fruitées', 'Neroli'] },
      { type: 'Base', notes: ['Encens', 'Cèdre', 'Santal', 'Patchouli', 'Labdanum', 'Ambre gris'] }
    ],
  },
  {
    name: 'La Vie Est Belle',
    image: '/images/la-vie-est-belle.webp',
    brand: 'Lancôme',
    category: 'Femme',
    description: 'Un parfum floral gourmand avec des notes de framboise, iris et patchouli. Lumineux et joyeux.',
    price: 92.50,
    countInStock: 45,
    rating: 4.6,
    numReviews: 25,
    fragranceNotes: [
      { type: 'Top', notes: ['Framboise', 'Poire', 'Cassis'] },
      { type: 'Coeur', notes: ['Iris', 'Jasmin', 'Fleur d\'oranger'] },
      { type: 'Base', notes: ['Patchouli', 'Praliné', 'Vanille', 'Ambre'] }
    ],
  },
  {
    name: 'Coco Mademoiselle',
    image: '/images/coco-mademoiselle.webp',
    brand: 'Chanel',
    category: 'Femme',
    description: 'Un parfum chypré floral aux notes d\'orange, jasmin et patchouli. Féminin et audacieux.',
    price: 98.00,
    countInStock: 35,
    rating: 4.8,
    numReviews: 20,
    fragranceNotes: [
      { type: 'Top', notes: ['Orange', 'Mandarine', 'Bergamote', 'Pamplemousse'] },
      { type: 'Coeur', notes: ['Jasmin', 'Rose de Mai', 'Mimosa'] },
      { type: 'Base', notes: ['Patchouli', 'Vétiver', 'Vanille', 'Encens', 'Blanc musqué'] }
    ],
  },
  {
    name: 'Acqua di Gio',
    image: 'https://i1.perfumesclub.com/grande/195686-4.jpg',
    brand: 'Giorgio Armani',
    category: 'Homme',
    description: 'Un parfum aquatique frais avec des notes marines, bergamote et musc. Frais et dynamique.',
    price: 75.00,
    countInStock: 60,
    rating: 4.4,
    numReviews: 15,
    fragranceNotes: [
      { type: 'Top', notes: ['Bergamote', 'Neroli', 'Marine', 'Mandarine'] },
      { type: 'Coeur', notes: ['Jasmin', 'Romarin', 'Persil', 'Muguet', 'Sauge'] },
      { type: 'Base', notes: ['Musc', 'Patchouli', 'Cèdre', 'Ambre'] }
    ],
  },
  {
    name: 'J\'adore',
    image: '/images/jadoredior.webp',
    brand: 'Dior',
    category: 'Femme',
    description: 'Un parfum floral élégant aux notes d\'ylang-ylang, jasmin et rose. Féminin et sophistiqué.',
    price: 88.00,
    countInStock: 40,
    rating: 4.7,
    numReviews: 22,
    fragranceNotes: [
      { type: 'Top', notes: ['Ylang-Ylang', 'Bergamote', 'Amandier'] },
      { type: 'Coeur', notes: ['Jasmin de Grasse', 'Rose de Damas', 'Orchidée', 'Freesia'] },
      { type: 'Base', notes: ['Ambre', 'Musc', 'Vanille'] }
    ],
  },
  {
    name: 'One Million',
    image: '/images/onemillion.webp',
    brand: 'Paco Rabanne',
    category: 'Homme',
    description: 'Un parfum orienté épicé avec des notes de menthe, épices et cuir. Audacieux et séducteur.',
    price: 72.50,
    countInStock: 55,
    rating: 4.3,
    numReviews: 10,
    fragranceNotes: [
      { type: 'Top', notes: ['Menthe', 'Pamplemousse rose', 'Sangria', 'Épices'] },
      { type: 'Coeur', notes: ['Rose', 'Cannelle', 'Épices', 'Fleur de mimosa'] },
      { type: 'Base', notes: ['Cuir', 'Ambre', 'Blond tabac', 'Patchouli', 'Musc blanc'] }
    ],
  },
  {
    name: 'Black Opium',
    image: '/images/black-opium-eau-de-parfum.webp',
    brand: 'Yves Saint Laurent',
    category: 'Femme',
    description: 'Un parfum gourmand sensuel aux notes de café, vanille et jasmin. Intense et envoûtant.',
    price: 85.00,
    countInStock: 38,
    rating: 4.6,
    numReviews: 19,
    fragranceNotes: [
      { type: 'Top', notes: ['Poire', 'Pink Pepper', 'Orange'] },
      { type: 'Coeur', notes: ['Café', 'Jasmin', 'Fleur d\'amandier'] },
      { type: 'Base', notes: ['Vanille', 'Patchouli', 'Cèdre', 'Cashmeran'] }
    ],
  },
  {
    name: 'Eros',
    image: '/images/eros.webp',
    brand: 'Versace',
    category: 'Homme',
    description: 'Un parfum frais et boisé aux notes de menthe, pomme verte et vanille. Énergique et séduisant.',
    price: 68.00,
    countInStock: 48,
    rating: 4.5,
    numReviews: 14,
    fragranceNotes: [
      { type: 'Top', notes: ['Menthe', 'Pomme verte', 'Citron', 'Amandier'] },
      { type: 'Coeur', notes: ['Tonka', 'Ambroxan', 'Géranium'] },
      { type: 'Base', notes: ['Vanille', 'Vétiver', 'Bois de cèdre', 'Musc', 'Mousse'] }
    ],
  },
  {
    name: 'Flowerbomb',
    image: '/images/flowerbomb.webp',
    brand: 'Viktor & Rolf',
    category: 'Femme',
    description: 'Un parfum floral explosif aux notes de rose, orchidée et patchouli. Féminin et puissant.',
    price: 94.00,
    countInStock: 32,
    rating: 4.7,
    numReviews: 21,
    fragranceNotes: [
      { type: 'Top', notes: ['Bergamote', 'Thé vert'] },
      { type: 'Coeur', notes: ['Rose', 'Orchidée', 'Jasmin', 'Freesia', 'Osmanthus'] },
      { type: 'Base', notes: ['Patchouli', 'Musc', 'Ambre'] }
    ],
  },
  // Produits Skincare
  {
    name: 'Sérum Vitamine C Éclat',
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80',
    brand: 'Curology',
    category: 'skincare',
    description: 'Sérum concentré en vitamine C pure pour unifier le teint et réduire les taches pigmentaires. Texture légère et non grasse, idéal pour tous les types de peaux.',
    price: 45.00,
    countInStock: 50,
    rating: 4.8,
    numReviews: 127,
  },
  {
    name: 'Crème Hydratante Anti-Âge',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80',
    brand: 'Curology',
    category: 'skincare',
    description: 'Crème riche en peptides et acide hyaluronique pour hydrater intensément et lisser les rides. Formule anti-âge efficace pour une peau repulpée et éclatante.',
    price: 55.00,
    countInStock: 40,
    rating: 4.6,
    numReviews: 89,
  },
  {
    name: 'Masque Purifiant à l\'Argile',
    image: 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=800&q=80',
    brand: 'Curology',
    category: 'skincare',
    description: 'Masque purifiant à l\'argile verte pour détoxifier et matifier la peau. Élimine les impuretés et resserre les pores pour un teint net et lumineux.',
    price: 28.00,
    countInStock: 65,
    rating: 4.7,
    numReviews: 156,
  },
  {
    name: 'Sublimage La Crème',
    image: '/images/sublimagelacreme_1.webp',
    brand: 'Chanel',
    category: 'skincare',
    description: 'Crème de soin anti-âge ultime de Chanel. Formule exclusive au planifolia pour régénérer la peau et restaurer son éclat naturel. Texture onctueuse et luxueuse.',
    price: 185.00,
    countInStock: 25,
    rating: 4.9,
    numReviews: 203,
  },
  {
    name: 'Le Lift Crème Anti-Âge',
    image: '/images/le-lift-creme.webp',
    brand: 'Chanel',
    category: 'skincare',
    description: 'Crème liftante aux extraits de plantes pour raffermir et lisser la peau. Action visible sur les signes de l\'âge avec une texture légère et pénétrante.',
    price: 95.00,
    countInStock: 35,
    rating: 4.7,
    numReviews: 142,
  },
  {
    name: 'Hydrating Shampoo',
    image: '/images/shampoing-hydratant-moroccanoil_1.webp',
    brand: 'OUAI',
    category: 'skincare',
    description: 'Shampooing hydratant pour cheveux secs et abîmés. Enrichi en acides aminés et huiles nourrissantes pour restaurer la douceur et la brillance des cheveux.',
    price: 32.00,
    countInStock: 70,
    rating: 4.8,
    numReviews: 234,
  },
  {
    name: 'Hair Oil',
    image: 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=800&q=80',
    brand: 'OUAI',
    category: 'skincare',
    description: 'Huile capillaire multi-usages pour nourrir, protéger et lisser les cheveux. Formule légère qui ne graisse pas, parfaite pour tous les types de cheveux.',
    price: 38.00,
    countInStock: 55,
    rating: 4.6,
    numReviews: 178,
  },
  {
    name: 'Detox Shampoo',
    image: '/images/ouaidetox.webp',
    brand: 'OUAI',
    category: 'skincare',
    description: 'Shampooing détoxifiant pour purifier le cuir chevelu et éliminer les résidus. Formule clarifiante qui nettoie en profondeur sans dessécher.',
    price: 30.00,
    countInStock: 60,
    rating: 4.5,
    numReviews: 145,
  },
  {
    name: 'Toleriane Double Repair Moisturizer',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80',
    brand: 'La Roche-Posay',
    category: 'skincare',
    description: 'Crème hydratante pour peaux sensibles. Formule apaisante avec prébiotiques et niacinamide pour restaurer la barrière cutanée et hydrater intensément.',
    price: 22.00,
    countInStock: 85,
    rating: 4.7,
    numReviews: 312,
  },
  {
    name: 'Anthelios UVmune 400 Invisible Fluid',
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80',
    brand: 'La Roche-Posay',
    category: 'skincare',
    description: 'Protection solaire SPF50+ invisible et légère. Protège contre les UVA, UVB et les rayons UVA longs. Texture fluide non grasse, idéale pour tous les jours.',
    price: 18.50,
    countInStock: 90,
    rating: 4.8,
    numReviews: 267,
  },
  {
    name: 'Effaclar Duo+',
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80',
    brand: 'La Roche-Posay',
    category: 'skincare',
    description: 'Soin correcteur anti-imperfections. Formule avec acide salicylique et niacinamide pour réduire les boutons et unifier le teint. Texture légère et matifiante.',
    price: 19.90,
    countInStock: 75,
    rating: 4.6,
    numReviews: 198,
  },
  {
    name: 'Cicaplast Baume B5',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80',
    brand: 'La Roche-Posay',
    category: 'skincare',
    description: 'Baume réparateur multi-usages pour apaiser et réparer la peau irritée. Enrichi en panthénol et madecassoside pour accélérer la cicatrisation.',
    price: 12.90,
    countInStock: 100,
    rating: 4.9,
    numReviews: 445,
  },
];

const seedProducts = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/e-parfume';
    
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected');

    // Vérifier ou créer un utilisateur admin pour les produits
    let adminUser = await User.findOne({ isAdmin: true });
    
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Admin',
        email: 'admin@eparfume.com',
        password: 'admin123',
        isAdmin: true,
      });
      console.log('Admin user created');
    }

    // Supprimer les produits existants (optionnel)
    await Product.deleteMany({});
    console.log('Products deleted');

    let productsToSeed = [];

    // Essayer de récupérer les produits depuis l'API FragranceFinder
    const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
    
    if (RAPIDAPI_KEY) {
      try {
        console.log('Fetching fragrances from API...');
        
        // Rechercher des parfums avec différents termes pour obtenir une variété
        const searchTerms = ['dior', 'chanel', 'versace', 'armani', 'ysl', 'lancome'];
        const allFragrances = [];
        
        // Faire plusieurs recherches pour obtenir une variété de parfums
        for (const term of searchTerms.slice(0, 3)) { // Limiter à 3 recherches pour éviter trop d'appels
          try {
            console.log(`Searching for: ${term}...`);
            const results = await searchFragrances(RAPIDAPI_KEY, term, 5);
            if (results && results.length > 0) {
              allFragrances.push(...results);
              // Petite pause entre les requêtes pour éviter de surcharger l'API
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          } catch (err) {
            console.warn(`Error searching for ${term}:`, err.message);
          }
        }
        
        // Si aucune recherche n'a fonctionné, essayer une recherche vide
        if (allFragrances.length === 0) {
          console.log('Trying general search...');
          const generalResults = await searchFragrances(RAPIDAPI_KEY, '', 20);
          if (generalResults && generalResults.length > 0) {
            allFragrances.push(...generalResults);
          }
        }
        
        if (allFragrances.length > 0) {
          // Limiter à 20 produits et supprimer les doublons basés sur le nom
          const uniqueFragrances = [];
          const seenNames = new Set();
          
          for (const fragrance of allFragrances) {
            const name = fragrance.name || fragrance.fragrance_name || fragrance.title;
            if (name && !seenNames.has(name.toLowerCase())) {
              seenNames.add(name.toLowerCase());
              uniqueFragrances.push(fragrance);
              if (uniqueFragrances.length >= 20) break;
            }
          }
          
          console.log(`Fetched ${uniqueFragrances.length} unique fragrances from API`);
          productsToSeed = uniqueFragrances.map(fragrance => 
            transformFragranceToProduct(fragrance, adminUser._id)
          );
        } else {
          console.log('No fragrances returned from API, using fallback data');
          productsToSeed = products.map(product => ({
            ...product,
            user: adminUser._id,
          }));
        }
      } catch (apiError) {
        console.warn('Error fetching from API, using fallback data:', apiError.message);
        productsToSeed = products.map(product => ({
          ...product,
          user: adminUser._id,
        }));
      }
    } else {
      console.log('RAPIDAPI_KEY not found, using fallback data');
      console.log('To use the FragranceFinder API, add RAPIDAPI_KEY to your .env file');
      productsToSeed = products.map(product => ({
        ...product,
        user: adminUser._id,
      }));
    }

    await Product.insertMany(productsToSeed);
    console.log(`Successfully seeded ${productsToSeed.length} products`);

    process.exit();
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
};

seedProducts();

