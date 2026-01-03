import React, { useEffect, useReducer, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Product from '../components/Product';
import ProductSkeleton from '../components/ProductSkeleton';
import PriceSlider from '../components/PriceSlider';
import { FaFilter, FaUndo, FaSyncAlt, FaPepperHot } from 'react-icons/fa';
import { 
  GiFlowerEmblem, 
  GiTreeBranch, 
  GiAppleCore, 
  GiWaterDrop,
  GiPlantRoots,
  GiLeafSwirl,
  GiWaveCrest,
  GiCupcake,
  GiLemon
} from 'react-icons/gi';
import { apiFetch } from '../utils/api';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, products: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

const ProductsListScreen = () => {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category');
  const featured = searchParams.get('featured');

  const [{ loading, error, products }, dispatch] = useReducer(reducer, {
    products: [],
    loading: true,
    error: '',
  });

  const [selectedFilters, setSelectedFilters] = useState({
    families: [],
    fragranceFamilies: [],
    skinTypes: [],
    priceRange: null,
    brands: [],
    priceMin: null,
    priceMax: null,
  });

  const [sortBy, setSortBy] = useState('featured');

  // Extract unique values for filters
  const allFamilies = [...new Set(products.map((p) => p.fragranceFamily || p.category).filter(Boolean))];
  const allFragranceFamilies = [...new Set(products.map((p) => p.fragranceFamily).filter(Boolean))];
  const allSkinTypes = [...new Set(products.map((p) => p.skinType).filter(Boolean))];
  const allBrands = [...new Set(products.map((p) => p.brand).filter(Boolean))];

  // Mapping des icônes de familles olfactives
  const fragranceFamilyIcons = {
    'Floral': GiFlowerEmblem,
    'Oriental': FaPepperHot,
    'Boisé': GiTreeBranch,
    'Fruité': GiAppleCore,
    'Frais': GiWaterDrop,
    'Fougère': GiPlantRoots,
    'Chypré': GiLeafSwirl,
    'Aquatique': GiWaveCrest,
    'Gourmand': GiCupcake,
    'Hespéridé': GiLemon,
  };

  // Récupérer les logos de marque depuis les produits
  const getBrandLogo = (brandName) => {
    const productWithBrand = products.find(p => p.brand === brandName && p.brandLogo);
    return productWithBrand?.brandLogo || null;
  };

  const priceRanges = [
    { label: 'Moins de 50€', min: 0, max: 50 },
    { label: '50€ - 100€', min: 50, max: 100 },
    { label: '100€ - 200€', min: 100, max: 200 },
    { label: 'Plus de 200€', min: 200, max: Infinity },
  ];

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        let url = '/api/products';
        if (category) url += `?category=${category}`;
        if (featured) url += `?featured=true`;

        const result = await apiFetch(url);
        if (!result.ok) {
          throw new Error(`HTTP error! status: ${result.status}`);
        }
        const data = await result.json();
        dispatch({ type: 'FETCH_SUCCESS', payload: Array.isArray(data) ? data : [] });
      } catch (err) {
        console.error('Error fetching products:', err);
        dispatch({ type: 'FETCH_FAIL', payload: err.message });
      }
    };
    fetchData();
  }, [category, featured]);

  const toggleFilter = (type, value) => {
    setSelectedFilters((prev) => {
      if (type === 'families') {
        const newFamilies = prev.families.includes(value)
          ? prev.families.filter((f) => f !== value)
          : [...prev.families, value];
        return { ...prev, families: newFamilies };
      }
      if (type === 'fragranceFamilies') {
        const newFamilies = prev.fragranceFamilies.includes(value)
          ? prev.fragranceFamilies.filter((f) => f !== value)
          : [...prev.fragranceFamilies, value];
        return { ...prev, fragranceFamilies: newFamilies };
      }
      if (type === 'skinTypes') {
        const newTypes = prev.skinTypes.includes(value)
          ? prev.skinTypes.filter((t) => t !== value)
          : [...prev.skinTypes, value];
        return { ...prev, skinTypes: newTypes };
      }
      if (type === 'brands') {
        const newBrands = prev.brands.includes(value)
          ? prev.brands.filter((b) => b !== value)
          : [...prev.brands, value];
        return { ...prev, brands: newBrands };
      }
      if (type === 'priceRange') {
        return { ...prev, priceRange: prev.priceRange === value ? null : value };
      }
      return prev;
    });
  };

  const filteredProducts = products.filter((product) => {
    // Backend already handles category filtering, so we just do additional filters here
    
    // Family filter
    if (selectedFilters.families.length > 0) {
      const productFamily = product.fragranceFamily || product.category;
      if (!selectedFilters.families.includes(productFamily)) return false;
    }

    // Fragrance family filter (only apply if product has fragranceFamily)
    if (selectedFilters.fragranceFamilies.length > 0 && product.fragranceFamily) {
      if (!selectedFilters.fragranceFamilies.includes(product.fragranceFamily)) return false;
    }

    // Skin type filter (only apply if product has skinType)
    if (selectedFilters.skinTypes.length > 0 && product.skinType) {
      if (!selectedFilters.skinTypes.includes(product.skinType)) return false;
    }

    // Brand filter
    if (selectedFilters.brands.length > 0) {
      if (!selectedFilters.brands.includes(product.brand)) return false;
    }

    // Price range filter (buttons)
    if (selectedFilters.priceRange) {
      const range = priceRanges.find((r) => r.label === selectedFilters.priceRange);
      if (range && (product.price < range.min || product.price > range.max)) return false;
    }
    
    // Price slider filter
    if (selectedFilters.priceMin !== null && product.price < selectedFilters.priceMin) return false;
    if (selectedFilters.priceMax !== null && product.price > selectedFilters.priceMax) return false;

    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const clearFilters = () => {
    setSelectedFilters({ 
      families: [], 
      fragranceFamilies: [],
      skinTypes: [],
      priceRange: null, 
      brands: [], 
      priceMin: null, 
      priceMax: null 
    });
  };

  const clearFamilyFilter = () => {
    setSelectedFilters(prev => ({ ...prev, families: [] }));
  };

  const clearBrandFilter = () => {
    setSelectedFilters(prev => ({ ...prev, brands: [] }));
  };

  const clearPriceFilter = () => {
    setSelectedFilters(prev => ({ 
      ...prev, 
      priceRange: null, 
      priceMin: null, 
      priceMax: null 
    }));
  };

  const hasActiveFilters =
    selectedFilters.families.length > 0 ||
    selectedFilters.fragranceFamilies.length > 0 ||
    selectedFilters.skinTypes.length > 0 ||
    selectedFilters.brands.length > 0 ||
    selectedFilters.priceRange !== null ||
    selectedFilters.priceMin !== null ||
    selectedFilters.priceMax !== null;

  return (
    <div className="min-h-screen bg-luxe-cream dark:bg-luxe-charcoal transition-colors duration-300">
      <Helmet>
        <title>Collections - E-perfume</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-serif text-5xl md:text-7xl font-light text-luxe-black dark:text-luxe-cream mb-4">
            {category === 'skincare' ? 'Esthétique' : 'Parfums'}
          </h1>
          <p className="font-sans text-lg text-luxe-charcoal/70 dark:text-luxe-cream/70">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'produit' : 'produits'}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-luxe-gold/30 scrollbar-track-transparent hover:scrollbar-thumb-luxe-gold/50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-2xl font-light text-luxe-black dark:text-luxe-cream flex items-center gap-2">
                  <FaFilter className="w-4 h-4 animate-pulse" />
                  Filtres
                </h2>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="p-1.5 text-luxe-charcoal/50 dark:text-luxe-cream/50 hover:text-luxe-gold transition-all duration-300 hover:rotate-180 hover:scale-110 group"
                    title="Réinitialiser tous les filtres"
                  >
                    <FaSyncAlt className="w-3.5 h-3.5 group-hover:animate-spin" />
                  </button>
                )}
              </div>

              <div className="space-y-8 pb-4">
                {/* Fragrance Families (for perfumes) */}
                {category !== 'skincare' && allFragranceFamilies.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-sans text-sm font-medium uppercase tracking-wider text-luxe-black dark:text-luxe-cream">
                        Famille Olfactive
                      </h3>
                      {selectedFilters.fragranceFamilies.length > 0 && (
                        <button
                          onClick={() => setSelectedFilters(prev => ({ ...prev, fragranceFamilies: [] }))}
                          className="p-1 text-luxe-charcoal/40 dark:text-luxe-cream/40 hover:text-luxe-gold transition-all duration-300 hover:rotate-180 hover:scale-110 group"
                          title="Réinitialiser les familles"
                        >
                          <FaUndo className="w-3 h-3 group-hover:animate-spin" />
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {allFragranceFamilies.map((family, idx) => {
                        const IconComponent = fragranceFamilyIcons[family];
                        return (
                          <button
                            key={family}
                            onClick={() => toggleFilter('fragranceFamilies', family)}
                            className={`tag-filter transition-all duration-300 flex items-center gap-2 ${
                              selectedFilters.fragranceFamilies.includes(family) ? 'tag-filter-active' : ''
                            }`}
                            style={{ animationDelay: `${idx * 30}ms` }}
                          >
                            {IconComponent && (
                              <IconComponent className="h-4 w-4 opacity-80" />
                            )}
                            <span>{family}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Skin Types (for skincare) */}
                {category === 'skincare' && allSkinTypes.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-sans text-sm font-medium uppercase tracking-wider text-luxe-black dark:text-luxe-cream">
                        Type de Peau
                      </h3>
                      {selectedFilters.skinTypes.length > 0 && (
                        <button
                          onClick={() => setSelectedFilters(prev => ({ ...prev, skinTypes: [] }))}
                          className="p-1 text-luxe-charcoal/40 dark:text-luxe-cream/40 hover:text-luxe-gold transition-all duration-300 hover:rotate-180 hover:scale-110 group"
                          title="Réinitialiser les types"
                        >
                          <FaUndo className="w-3 h-3 group-hover:animate-spin" />
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {allSkinTypes.map((type, idx) => (
                        <button
                          key={type}
                          onClick={() => toggleFilter('skinTypes', type)}
                          className={`tag-filter transition-all duration-300 ${
                            selectedFilters.skinTypes.includes(type) ? 'tag-filter-active' : ''
                          }`}
                          style={{ animationDelay: `${idx * 30}ms` }}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Brands */}
                {allBrands.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-sans text-sm font-medium uppercase tracking-wider text-luxe-black dark:text-luxe-cream">
                        Marques
                      </h3>
                      {selectedFilters.brands.length > 0 && (
                        <button
                          onClick={clearBrandFilter}
                          className="p-1 text-luxe-charcoal/40 dark:text-luxe-cream/40 hover:text-luxe-gold transition-all duration-300 hover:rotate-180 hover:scale-110 group"
                          title="Réinitialiser les marques"
                        >
                          <FaUndo className="w-3 h-3 group-hover:animate-spin" />
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {allBrands.map((brand, idx) => {
                        const brandLogo = getBrandLogo(brand);
                        return (
                          <button
                            key={brand}
                            onClick={() => toggleFilter('brands', brand)}
                            className={`tag-filter transition-all duration-300 flex items-center gap-2 ${
                              selectedFilters.brands.includes(brand) ? 'tag-filter-active' : ''
                            }`}
                            style={{ animationDelay: `${idx * 30}ms` }}
                          >
                            {brandLogo && (
                              <img
                                src={brandLogo}
                                alt={brand}
                                className="h-4 w-4 object-contain opacity-80"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            )}
                            <span>{brand}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Price Range - Slider */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-sans text-sm font-medium uppercase tracking-wider text-luxe-black dark:text-luxe-cream">
                      Prix
                    </h3>
                    {(selectedFilters.priceRange || selectedFilters.priceMin !== null || selectedFilters.priceMax !== null) && (
                      <button
                        onClick={clearPriceFilter}
                        className="p-1 text-luxe-charcoal/40 hover:text-luxe-gold transition-all duration-300 hover:rotate-180 hover:scale-110 group"
                        title="Réinitialiser le prix"
                      >
                        <FaUndo className="w-3 h-3 group-hover:animate-spin" />
                      </button>
                    )}
                  </div>
                  <div className="bg-luxe-warm-white dark:bg-luxe-charcoal rounded-lg p-4 border border-luxe-charcoal/10 dark:border-luxe-gold/20">
                    <PriceSlider
                      min={0}
                      max={Math.max(...products.map(p => p.price || 0), 500)}
                      initialMin={selectedFilters.priceMin !== null ? selectedFilters.priceMin : undefined}
                      initialMax={selectedFilters.priceMax !== null ? selectedFilters.priceMax : undefined}
                      onRangeChange={({ min: priceMin, max: priceMax }) => {
                        setSelectedFilters(prev => ({
                          ...prev,
                          priceMin,
                          priceMax,
                          priceRange: null, // Clear button selection when using slider
                        }));
                      }}
                    />
                  </div>
                  <div className="mt-4 space-y-2">
                    {priceRanges.map((range) => (
                      <button
                        key={range.label}
                        onClick={() => {
                          setSelectedFilters(prev => ({
                            ...prev,
                            priceRange: prev.priceRange === range.label ? null : range.label,
                            priceMin: null,
                            priceMax: null, // Clear slider when using buttons
                          }));
                        }}
                        className={`tag-filter w-full text-left transition-all duration-200 ${
                          selectedFilters.priceRange === range.label ? 'tag-filter-active' : ''
                        }`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <main className="flex-1">
            {/* Sort Controls */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-luxe-charcoal/10 dark:border-luxe-cream/10">
              <div className="font-sans text-sm text-luxe-charcoal/70 dark:text-luxe-cream/70">
                Trier par
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-luxe w-auto min-w-[200px]"
              >
                <option value="featured">Recommandé</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
                <option value="rating">Meilleures notes</option>
                <option value="name">Nom A-Z</option>
              </select>
            </div>

            {/* Products */}
            {loading ? (
              <ProductSkeleton count={8} />
            ) : error ? (
              <div className="text-center py-20 text-luxe-charcoal/70 dark:text-luxe-cream/70">{error}</div>
            ) : sortedProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {sortedProducts.map((product, index) => (
                  <div key={product._id} className="stagger-item" style={{ animationDelay: `${index * 50}ms` }}>
                    <Product product={product} index={index} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="font-sans text-lg text-luxe-charcoal/70 dark:text-luxe-cream/70 mb-4">
                  Aucun produit ne correspond à vos critères
                </p>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="btn-luxe-secondary">
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProductsListScreen;

