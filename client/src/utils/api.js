// Configuration de l'URL de l'API backend
// En production, utilise l'URL du backend sur Render
// En développement, utilise le proxy Vite (localhost:5000)
const API_URL = import.meta.env.VITE_API_URL || '';

// Fonction utilitaire pour construire l'URL complète de l'API
export const getApiUrl = (endpoint) => {
  // Si endpoint commence déjà par http, retourner tel quel
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  
  // Enlever le slash initial si présent
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  // Si API_URL est défini, l'utiliser
  if (API_URL) {
    return `${API_URL}/${cleanEndpoint}`;
  }
  
  // Sinon, utiliser l'endpoint relatif (pour le proxy Vite en développement)
  return `/${cleanEndpoint}`;
};

// Fonction utilitaire pour les appels fetch avec gestion automatique de l'URL
export const apiFetch = async (endpoint, options = {}) => {
  const url = getApiUrl(endpoint);
  return fetch(url, options);
};

