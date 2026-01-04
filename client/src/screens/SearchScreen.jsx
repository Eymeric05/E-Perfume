import React, { useEffect, useReducer } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Product from '../components/Product';
import { Helmet } from 'react-helmet-async';
import { FaSearch } from 'react-icons/fa';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, products: action.payload };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

const SearchScreen = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [{ loading, error, products }, dispatch] = useReducer(reducer, {
    loading: true,
    products: [],
    error: '',
  });

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query.trim()) {
        dispatch({ type: 'FETCH_SUCCESS', payload: [] });
        return;
      }

      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const response = await apiFetch(`/api/products/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        dispatch({ type: 'FETCH_SUCCESS', payload: Array.isArray(data) ? data : [] });
      } catch (err) {
        console.error('Error fetching search results:', err);
        dispatch({ type: 'FETCH_FAIL', payload: err.message });
      }
    };

    fetchSearchResults();
  }, [query]);

  return (
    <div className="min-h-screen bg-luxe-cream dark:bg-luxe-charcoal pt-32 pb-16">
      <Helmet>
        <title>{query ? `Recherche: ${query} - E-perfume` : 'Recherche - E-perfume'}</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-serif text-4xl md:text-5xl font-light text-luxe-black dark:text-luxe-cream mb-4">
            Résultats de recherche
          </h1>
          {query && (
            <p className="font-sans text-lg text-luxe-charcoal/70 dark:text-luxe-cream/70">
              Recherche pour : <span className="font-medium text-luxe-black dark:text-luxe-cream">"{query}"</span>
            </p>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-20">
            <LoadingSpinner text="Recherche en cours..." />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="py-20 text-center">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg max-w-md mx-auto">
              <p className="font-sans text-sm text-red-700 dark:text-red-400">
                Erreur lors de la recherche: {error}
              </p>
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && !error && query && products.length === 0 && (
          <div className="py-20 text-center">
            <FaSearch className="w-16 h-16 text-luxe-charcoal/30 dark:text-luxe-cream/30 mx-auto mb-6" />
            <h2 className="font-serif text-3xl font-light text-luxe-black dark:text-luxe-cream mb-4">
              Aucun résultat trouvé
            </h2>
            <p className="font-sans text-lg text-luxe-charcoal/70 dark:text-luxe-cream/70 mb-8">
              Aucun produit ne correspond à votre recherche "{query}"
            </p>
            <Link to="/products" className="btn-luxe-gold">
              Voir tous les produits
            </Link>
          </div>
        )}

        {/* No Query */}
        {!loading && !error && !query && (
          <div className="py-20 text-center">
            <FaSearch className="w-16 h-16 text-luxe-charcoal/30 dark:text-luxe-cream/30 mx-auto mb-6" />
            <h2 className="font-serif text-3xl font-light text-luxe-black dark:text-luxe-cream mb-4">
              Aucune recherche effectuée
            </h2>
            <p className="font-sans text-lg text-luxe-charcoal/70 dark:text-luxe-cream/70 mb-8">
              Veuillez entrer un terme de recherche
            </p>
            <Link to="/products" className="btn-luxe-gold">
              Voir tous les produits
            </Link>
          </div>
        )}

        {/* Results */}
        {!loading && !error && products.length > 0 && (
          <>
            <div className="mb-8">
              <p className="font-sans text-sm text-luxe-charcoal/70 dark:text-luxe-cream/70">
                {products.length} {products.length === 1 ? 'produit trouvé' : 'produits trouvés'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <Product key={product._id} product={product} index={index} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SearchScreen;
