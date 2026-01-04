import React, { useEffect, useReducer, useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Store } from '../../context/StoreContext';
import AdminLayout from '../../components/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FaEdit, FaImage, FaSearch } from 'react-icons/fa';
import { apiFetch } from '../../utils/api';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, brands: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

const BrandListScreen = () => {
  const navigate = useNavigate();
  const { state } = useContext(Store);
  const { userInfo } = state;

  const [{ loading, error, brands }, dispatch] = useReducer(reducer, {
    brands: [],
    loading: true,
    error: '',
  });

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchBrands = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const res = await apiFetch('/api/brands');
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        dispatch({ type: 'FETCH_SUCCESS', payload: Array.isArray(data) ? data : [] });
      } catch (err) {
        console.error('Error fetching brands:', err);
        dispatch({ type: 'FETCH_FAIL', payload: err.message });
      }
    };

    fetchBrands();
  }, []);

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl font-light text-luxe-black dark:text-luxe-cream mb-2">
              Gestion des Marques
            </h1>
            <p className="font-sans text-sm text-luxe-charcoal/70 dark:text-luxe-cream/70">
              Personnalisez les images hero et logos des marques
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-luxe-charcoal/40 dark:text-luxe-cream/40 w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher une marque..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-luxe pl-10 w-full md:w-96"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="font-sans text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Brands List */}
        {loading ? (
          <LoadingSpinner />
        ) : filteredBrands.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBrands.map((brand) => (
              <div
                key={brand._id || brand.name}
                className="bg-luxe-warm-white dark:bg-luxe-charcoal rounded-lg border border-luxe-charcoal/10 dark:border-luxe-gold/20 overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                {/* Brand Hero Image Preview */}
                <div className="relative h-48 bg-gradient-to-br from-luxe-cream dark:from-luxe-charcoal to-luxe-warm-white dark:to-luxe-charcoal">
                  {brand.heroImage ? (
                    <img
                      src={brand.heroImage}
                      alt={brand.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FaImage className="w-12 h-12 text-luxe-charcoal/20 dark:text-luxe-cream/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-luxe-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    {brand.brandLogo && (
                      <img
                        src={brand.brandLogo}
                        alt={brand.name}
                        className="h-8 w-auto object-contain mb-2"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    <h3 className="font-serif text-2xl font-light text-luxe-cream">
                      {brand.name}
                    </h3>
                  </div>
                </div>

                {/* Brand Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-sans text-xs text-luxe-charcoal/60 dark:text-luxe-cream/60 mb-2">
                        {brand.heroImage ? 'Image hero configurée' : 'Aucune image hero'}
                      </p>
                      {brand.description && (
                        <p className="font-sans text-sm text-luxe-charcoal/70 dark:text-luxe-cream/70 line-clamp-2">
                          {brand.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link
                      to={`/admin/brands/${encodeURIComponent(brand.name)}`}
                      className="btn-luxe-secondary w-full flex items-center justify-center gap-2"
                    >
                      <FaEdit className="w-4 h-4" />
                      Modifier
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-luxe-warm-white dark:bg-luxe-charcoal rounded-lg border border-luxe-charcoal/10 dark:border-luxe-gold/20">
            <p className="font-sans text-lg text-luxe-charcoal/70 dark:text-luxe-cream/70">
              {searchTerm ? 'Aucune marque trouvée' : 'Aucune marque configurée'}
            </p>
            <p className="font-sans text-sm text-luxe-charcoal/50 dark:text-luxe-cream/50 mt-2">
              {searchTerm
                ? 'Essayez avec un autre terme de recherche'
                : 'Les marques seront créées automatiquement lors de la personnalisation'}
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default BrandListScreen;
