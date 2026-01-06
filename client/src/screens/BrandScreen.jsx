import React, { useEffect, useReducer, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Product from '../components/Product';
import ProductSkeleton from '../components/ProductSkeleton';
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

const BrandScreen = () => {
  const { brandName } = useParams();
  const decodedBrandName = decodeURIComponent(brandName || '');

  const [{ loading, error, products }, dispatch] = useReducer(reducer, {
    products: [],
    loading: true,
    error: '',
  });

  const [brandInfo, setBrandInfo] = useState({
    brandLogo: null,
    heroImage: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        // Fetch brand info and products in parallel
        const [brandResult, productsResult] = await Promise.all([
          apiFetch(`/api/brands/${encodeURIComponent(decodedBrandName)}`).catch(() => null),
          apiFetch(`/api/products?brand=${encodeURIComponent(decodedBrandName)}`),
        ]);

        if (!productsResult.ok) {
          throw new Error(`HTTP error! status: ${productsResult.status}`);
        }
        const productsData = await productsResult.json();
        dispatch({ type: 'FETCH_SUCCESS', payload: Array.isArray(productsData) ? productsData : [] });

        // Try to get brand info from Brand model
        let brandData = null;
        if (brandResult && brandResult.ok) {
          try {
            brandData = await brandResult.json();
          } catch (e) {
            // Ignore JSON parse errors
          }
        }

        // Extract logo and hero image - prioritize Brand model, fallback to products
        if (productsData.length > 0) {
          const firstProduct = productsData[0];
          // Chercher une image de collection dans le nom de fichier ou utiliser la première image disponible
          const collectionImage = productsData.find(p => 
            p.images?.some(img => img && img.toLowerCase().includes('collection')) ||
            (p.image && p.image.toLowerCase().includes('collection'))
          );
          
          setBrandInfo({
            brandLogo: brandData?.brandLogo || firstProduct.brandLogo || null,
            heroImage: brandData?.heroImage || 
                       (collectionImage?.images?.[0] || collectionImage?.image) ||
                       (firstProduct.images?.[0] || firstProduct.image) || 
                       null,
          });
        } else if (brandData) {
          // If no products but brand data exists, use brand data
          setBrandInfo({
            brandLogo: brandData.brandLogo || null,
            heroImage: brandData.heroImage || null,
          });
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        dispatch({ type: 'FETCH_FAIL', payload: err.message });
      }
    };
    fetchData();
  }, [decodedBrandName]);

  // Image de collection - utiliser l'image héro depuis Brand model si disponible, sinon utiliser une image de produit
  const collectionHeroImage = brandInfo.heroImage || 
    (products.length > 0 && (products[0]?.images?.[0] || products[0]?.image)) ||
    '/images/collection-hero-default.jpg';

  return (
    <div className="min-h-screen bg-luxe-cream dark:bg-luxe-charcoal transition-colors duration-300">
      <Helmet>
        <title>{decodedBrandName} - E-perfume</title>
      </Helmet>

      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[70vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${collectionHeroImage})`,
          }}
        >
          <div className="absolute inset-0 bg-luxe-black/50" />
        </div>
        <div className="relative h-full flex items-center justify-center z-10">
          <div className="text-center px-4 max-w-4xl mx-auto">
            {brandInfo.brandLogo && (
              <div className="mb-6 flex justify-center">
                <img
                  src={brandInfo.brandLogo}
                  alt={decodedBrandName}
                  className="h-16 md:h-20 w-auto object-contain opacity-90"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
            <h1 className="font-serif text-5xl md:text-7xl font-light text-luxe-cream mb-4">
              {decodedBrandName}
            </h1>
            <p className="font-sans text-lg md:text-xl text-luxe-cream/90">
              Collection exclusive
            </p>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-serif text-4xl md:text-5xl font-light text-luxe-black dark:text-luxe-cream mb-2">
                Nos Produits
              </h2>
              <p className="font-sans text-lg text-luxe-charcoal/70 dark:text-luxe-cream/70">
                {products.length} {products.length === 1 ? 'produit' : 'produits'} disponibles
              </p>
            </div>
            <Link
              to="/products"
              className="hidden md:block btn-luxe-secondary"
            >
              Voir Toutes les Collections
            </Link>
          </div>
        </div>

        {loading ? (
          <ProductSkeleton count={8} />
        ) : error ? (
          <div className="text-center py-20">
            <p className="font-sans text-lg text-luxe-charcoal/70 dark:text-luxe-cream/70 mb-4">
              {error}
            </p>
            <Link to="/products" className="btn-luxe-secondary">
              Retour aux Collections
            </Link>
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <div key={product._id} className="stagger-item" style={{ animationDelay: `${index * 50}ms` }}>
                  <Product product={product} index={index} />
                </div>
              ))}
            </div>
            <div className="text-center mt-12 md:hidden">
              <Link to="/products" className="btn-luxe-secondary">
                Voir Toutes les Collections
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <p className="font-sans text-lg text-luxe-charcoal/70 dark:text-luxe-cream/70 mb-4">
              Aucun produit trouvé pour cette marque
            </p>
            <Link to="/products" className="btn-luxe-secondary">
              Retour aux Collections
            </Link>
          </div>
        )}
      </section>
    </div>
  );
};

export default BrandScreen;
