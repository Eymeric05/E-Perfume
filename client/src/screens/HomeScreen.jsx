import React, { useEffect, useReducer, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Product from '../components/Product';
import ProductSkeleton from '../components/ProductSkeleton';
import RecentlyViewed from '../components/RecentlyViewed';
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

const HomeScreen = () => {
  const [{ loading, error, products }, dispatch] = useReducer(reducer, {
    products: [],
    loading: true,
    error: '',
  });

  const [isScrollLocked, setIsScrollLocked] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const result = await apiFetch('/api/products');
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
  }, []);

  useEffect(() => {
    // Empêcher le scroll pendant 7-8 secondes
    const lockScroll = () => {
      if (isScrollLocked) {
        document.body.style.overflow = 'hidden';
        document.body.style.height = '100vh';
      }
    };

    const unlockScroll = () => {
      document.body.style.overflow = '';
      document.body.style.height = '';
      setIsScrollLocked(false);
    };

    lockScroll();

    // Débloquer le scroll après 7.5 secondes
    const timer = setTimeout(() => {
      unlockScroll();
    }, 7500);

    return () => {
      clearTimeout(timer);
      unlockScroll();
    };
  }, [isScrollLocked]);

  useEffect(() => {
    // Démarrer la vidéo automatiquement
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.log('Autoplay prevented:', error);
      });
    }
  }, []);

  // Show featured products or top rated, or just show first 6 if no featured/rated products
  const featuredProducts = products.length > 0 
    ? (products.filter((p) => p.featured || (p.rating && p.rating >= 4)).length > 0
        ? products.filter((p) => p.featured || (p.rating && p.rating >= 4)).slice(0, 6)
        : products.slice(0, 6))
    : [];

  return (
    <div className="min-h-screen bg-luxe-cream dark:bg-luxe-charcoal">
      <Helmet>
        <title>E-perfume - Parfums de Luxe & Esthétique Haut de Gamme</title>
      </Helmet>

      {/* Hero Video */}
      <section className="relative h-screen overflow-hidden">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/videos/video-accueil-e-perfume.mp4" type="video/mp4" />
          Votre navigateur ne supporte pas la lecture de vidéos.
        </video>
        <div className="absolute inset-0 bg-luxe-black/20" />
        
        {/* Scroll Indicator - apparaît après le déblocage du scroll */}
        {!isScrollLocked && (
          <div className="absolute bottom-8 right-8 animate-bounce z-10">
            <div className="w-6 h-10 border-2 border-luxe-cream/50 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-luxe-cream/50 rounded-full mt-2" />
            </div>
          </div>
        )}
      </section>

      {/* Featured Collections */}
      <section className="section-spacing bg-luxe-warm-white dark:bg-luxe-charcoal">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <p className="font-sans text-sm tracking-widest uppercase text-luxe-gold mb-4">
              Sélection Exclusive
            </p>
            <h2 className="font-serif text-5xl md:text-6xl font-light text-luxe-black dark:text-luxe-cream mb-6">
              Collections Éphémères
            </h2>
            <p className="font-sans text-lg text-luxe-charcoal/70 max-w-2xl mx-auto">
              Des fragrances rares et des soins d'exception, soigneusement sélectionnés pour vous
            </p>
          </div>

          {loading ? (
            <ProductSkeleton count={6} />
          ) : error ? (
            <div className="text-center py-20 text-luxe-charcoal/70">
              <p className="mb-4">{error}</p>
              <p className="text-sm">Vérifiez que le serveur est démarré et que la base de données est accessible.</p>
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product, index) => (
                <div
                  key={product._id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Product product={product} index={index} />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.slice(0, 6).map((product, index) => (
                <div
                  key={product._id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Product product={product} index={index} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-luxe-charcoal/70">
              <p className="mb-4">Aucun produit disponible pour le moment</p>
              <p className="text-sm">Total de produits chargés: {products.length}</p>
            </div>
          )}
        </div>
      </section>

      {/* All Products Preview */}
      {products.length > 0 && (
        <section className="section-spacing bg-luxe-cream dark:bg-luxe-charcoal">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="font-serif text-5xl md:text-6xl font-light text-luxe-black dark:text-luxe-cream mb-4">
                  Nos Collections les plus vendues
                </h2>
                <p className="font-sans text-lg text-luxe-charcoal/70 dark:text-luxe-cream/70">
                  Découvrez nos collections les plus populaires
                </p>
              </div>
              <Link
                to="/products"
                className="hidden md:block btn-luxe-secondary"
              >
                Voir Tout
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {products.slice(0, 12).map((product, index) => (
                <div
                  key={product._id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <Product product={product} index={index} />
                </div>
              ))}
            </div>

            <div className="text-center mt-12 md:hidden">
              <Link to="/products" className="btn-luxe-secondary">
                Voir Tout
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Recently Viewed Products */}
      <RecentlyViewed />
    </div>
  );
};

export default HomeScreen;