import { apiFetch } from './api';

/**
 * Nettoie les produits consultés de manière optimisée (vérifie par batch)
 * @param {Function} dispatch - Fonction dispatch du StoreContext
 * @param {number} batchSize - Nombre de produits à vérifier en parallèle (défaut: 5)
 * @returns {Promise<void>}
 */
export const cleanViewedProductsOptimized = async (dispatch, batchSize = 5) => {
  try {
    const viewedProductsStr = localStorage.getItem('viewedProducts');
    if (!viewedProductsStr) {
      return;
    }

    const viewedProducts = JSON.parse(viewedProductsStr);
    if (!Array.isArray(viewedProducts) || viewedProducts.length === 0) {
      return;
    }

    const validProducts = [];

    for (let i = 0; i < viewedProducts.length; i += batchSize) {
      const batch = viewedProducts.slice(i, i + batchSize);
      
      const batchChecks = batch.map(async (product) => {
        if (!product || !product._id || product._id.length !== 24) {
          return null;
        }

        try {
          const res = await apiFetch(`/api/products/${product._id}`);
          if (res.ok) {
            const data = await res.json();
            if (data && data._id) {
              return { ...data, viewedAt: product.viewedAt || new Date().toISOString() };
            }
          }
          return null;
        } catch (error) {
          return null;
        }
      });

      const batchResults = await Promise.all(batchChecks);
      validProducts.push(...batchResults.filter((p) => p !== null));
    }

    if (validProducts.length !== viewedProducts.length) {
      const limited = validProducts.slice(0, 12);
      localStorage.setItem('viewedProducts', JSON.stringify(limited));
      dispatch({ type: 'CLEAN_VIEWED_PRODUCTS' });
    }
  } catch (error) {
    console.error('Erreur lors du nettoyage des produits consultés:', error);
  }
};
