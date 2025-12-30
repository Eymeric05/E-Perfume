const https = require('https');

const FRAGRANCE_API_HOST = 'fragrancefinder-api.p.rapidapi.com';
const FRAGRANCE_API_BASE_URL = `https://${FRAGRANCE_API_HOST}`;

/**
 * Recherche des parfums depuis l'API FragranceFinder
 * @param {string} apiKey - Clé API RapidAPI
 * @param {string} query - Terme de recherche (nom de parfum, marque, etc.)
 * @param {number} limit - Nombre de parfums à récupérer (par défaut 20)
 * @returns {Promise<Array>} Liste des parfums
 */
const searchFragrances = async (apiKey, query = '', limit = 20) => {
  return new Promise((resolve, reject) => {
    // Construire le path avec le paramètre de recherche si fourni
    let path = '/search';
    if (query) {
      path += `?q=${encodeURIComponent(query)}`;
    }
    
    const options = {
      hostname: FRAGRANCE_API_HOST,
      path: path,
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': FRAGRANCE_API_HOST,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const parsed = JSON.parse(data);
            // Gérer différents formats de réponse
            let fragrances = [];
            if (Array.isArray(parsed)) {
              fragrances = parsed;
            } else if (parsed.data && Array.isArray(parsed.data)) {
              fragrances = parsed.data;
            } else if (parsed.fragrances && Array.isArray(parsed.fragrances)) {
              fragrances = parsed.fragrances;
            } else if (parsed.results && Array.isArray(parsed.results)) {
              fragrances = parsed.results;
            } else if (typeof parsed === 'object' && parsed !== null) {
              // Si c'est un seul objet, le mettre dans un tableau
              fragrances = [parsed];
            }
            
            // Limiter le nombre de résultats
            fragrances = fragrances.slice(0, limit);
            resolve(fragrances);
          } else {
            let errorMsg = `HTTP ${res.statusCode}`;
            try {
              if (data) {
                const parsed = JSON.parse(data);
                errorMsg = parsed.message || parsed.error || data;
              }
            } catch (e) {
              errorMsg = data || errorMsg;
            }
            reject(new Error(`API Error: ${res.statusCode} - ${errorMsg}`));
          }
        } catch (error) {
          reject(new Error(`Parse Error: ${error.message} - Response: ${data.substring(0, 200)}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
};

/**
 * Récupère une liste de parfums depuis l'API FragranceFinder (alias pour searchFragrances)
 * @param {string} apiKey - Clé API RapidAPI
 * @param {number} limit - Nombre de parfums à récupérer (par défaut 20)
 * @returns {Promise<Array>} Liste des parfums
 */
const fetchFragrances = async (apiKey, limit = 20) => {
  // Recherche avec des termes populaires pour obtenir une variété de parfums
  const popularTerms = ['dior', 'chanel', 'versace', 'armani', 'ysl'];
  const randomTerm = popularTerms[Math.floor(Math.random() * popularTerms.length)];
  return searchFragrances(apiKey, randomTerm, limit);
};

/**
 * Récupère des parfums similaires à un parfum donné
 * @param {string} apiKey - Clé API RapidAPI
 * @param {string} fragranceId - ID du parfum
 * @returns {Promise<Array>} Liste des parfums similaires
 */
const fetchSimilarFragrances = async (apiKey, fragranceId) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: FRAGRANCE_API_HOST,
      path: `/dupes/${fragranceId}`,
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': FRAGRANCE_API_HOST,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const parsed = JSON.parse(data);
            resolve(parsed);
          } else {
            reject(new Error(`API Error: ${res.statusCode} - ${data}`));
          }
        } catch (error) {
          reject(new Error(`Parse Error: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
};

/**
 * Transforme les données de l'API en format compatible avec notre modèle Product
 * @param {Object} fragrance - Données du parfum depuis l'API
 * @param {string} userId - ID de l'utilisateur admin
 * @returns {Object} Produit formaté
 */
const transformFragranceToProduct = (fragrance, userId) => {
  // Normaliser le nom
  const name = fragrance.name || fragrance.fragrance_name || fragrance.title || 'Parfum sans nom';
  
  // Normaliser l'image
  const image = fragrance.image || fragrance.image_url || fragrance.imageUrl || 
                fragrance.photo || fragrance.picture || '/images/default-fragrance.jpg';
  
  // Normaliser la marque
  const brand = fragrance.brand || fragrance.brand_name || fragrance.brandName || 
                fragrance.manufacturer || 'Marque inconnue';
  
  // Normaliser la catégorie/genre
  const category = fragrance.gender || fragrance.category || fragrance.gender_type || 
                   fragrance.type || 'Unisex';
  
  // Normaliser la description
  const description = fragrance.description || fragrance.notes || fragrance.notes_description || 
                     fragrance.desc || fragrance.summary || 'Description non disponible';
  
  // Normaliser le prix (convertir en nombre si c'est une string)
  let price = fragrance.price;
  if (typeof price === 'string') {
    price = parseFloat(price.replace(/[^0-9.]/g, ''));
  }
  if (!price || isNaN(price)) {
    price = Math.floor(Math.random() * 50) + 50; // Prix aléatoire entre 50-100€
  }
  
  // Normaliser le rating
  let rating = fragrance.rating || fragrance.rate || fragrance.score;
  if (typeof rating === 'string') {
    rating = parseFloat(rating);
  }
  if (!rating || isNaN(rating)) {
    rating = parseFloat((Math.random() * 1.5 + 3.5).toFixed(1));
  }
  
  // Normaliser le nombre de reviews
  let numReviews = fragrance.num_reviews || fragrance.numReviews || fragrance.reviews_count || 
                   fragrance.reviewCount;
  if (typeof numReviews === 'string') {
    numReviews = parseInt(numReviews);
  }
  if (!numReviews || isNaN(numReviews)) {
    numReviews = Math.floor(Math.random() * 30) + 5;
  }
  
  // Extraire les notes olfactives si disponibles
  let fragranceNotes = [];
  if (fragrance.notes) {
    // Si notes est un objet avec top, middle, base
    if (fragrance.notes.top || fragrance.notes.middle || fragrance.notes.base) {
      if (fragrance.notes.top) {
        fragranceNotes.push({
          type: 'Top',
          notes: Array.isArray(fragrance.notes.top) ? fragrance.notes.top : [fragrance.notes.top]
        });
      }
      if (fragrance.notes.middle || fragrance.notes.heart) {
        fragranceNotes.push({
          type: 'Coeur',
          notes: Array.isArray(fragrance.notes.middle || fragrance.notes.heart) 
            ? (fragrance.notes.middle || fragrance.notes.heart) 
            : [fragrance.notes.middle || fragrance.notes.heart]
        });
      }
      if (fragrance.notes.base) {
        fragranceNotes.push({
          type: 'Base',
          notes: Array.isArray(fragrance.notes.base) ? fragrance.notes.base : [fragrance.notes.base]
        });
      }
    }
    // Si notes est un tableau de strings
    else if (Array.isArray(fragrance.notes)) {
      // Essayer de les organiser si possible
      fragranceNotes = [{ type: 'Top', notes: fragrance.notes.slice(0, 3) }];
      if (fragrance.notes.length > 3) {
        fragranceNotes.push({ type: 'Coeur', notes: fragrance.notes.slice(3, 6) });
      }
      if (fragrance.notes.length > 6) {
        fragranceNotes.push({ type: 'Base', notes: fragrance.notes.slice(6) });
      }
    }
  }
  
  return {
    user: userId,
    name,
    image,
    brand,
    category,
    description,
    price,
    countInStock: Math.floor(Math.random() * 50) + 10, // Stock aléatoire entre 10-60
    rating,
    numReviews,
    fragranceNotes: fragranceNotes.length > 0 ? fragranceNotes : undefined,
  };
};

module.exports = {
  searchFragrances,
  fetchFragrances,
  fetchSimilarFragrances,
  transformFragranceToProduct,
};

