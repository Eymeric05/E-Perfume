import React, { useEffect, useReducer, useState, useRef, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Product from '../components/Product';
import ProductSkeleton from '../components/ProductSkeleton';
import RecentlyViewed from '../components/RecentlyViewed';
import { apiFetch } from '../utils/api';
import { Store } from '../context/StoreContext';

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

const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov'];

const isVideo = (url) => {
  if (!url) return false;
  return VIDEO_EXTENSIONS.some(ext => url.toLowerCase().endsWith(ext));
};

const HomeScreen = () => {
  const { state } = useContext(Store);
  const { userInfo } = state;
  
  const [{ loading, error, products }, dispatch] = useReducer(reducer, {
    products: [],
    loading: true,
    error: '',
  });

  const [currentSlide, setCurrentSlide] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const videoRefs = useRef({});

  const heroSlides = [
    {
      id: 'produits-luxe',
      title: 'Produits Haut de Gamme',
      subtitle: 'Produits de Luxe',
      description: 'Découvrez nos produits de luxe',
      image: '/videos/video-accueil-e-perfume.mp4',
      link: '/products?category=skincare',
    },
    {
      id: 'art-parfumerie',
      title: 'L\'Art de la Parfumerie',
      subtitle: 'Notes Olfactives Uniques',
      description: 'Chaque fragrance raconte une histoire',
      image: '/videos/video-accueil-collection-parfums.mp4',
      link: '/products',
    },
    {
      id: 'collection-ephemere',
      title: 'Collection Éphémère',
      subtitle: 'Parfums d\'exception',
      description: 'Découvrez notre sélection limitée de fragrances rares',
      image: '/videos/collection-ephemere.gif',
      link: '/products?featured=true',
    },
  ];

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
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  useEffect(() => {
    const currentVideo = videoRefs.current[heroSlides[currentSlide]?.id];
    if (currentVideo) {
      // Ne remettre à 0 que lors du changement de slide, pas lors du scroll
      currentVideo.currentTime = 0;
      currentVideo.play().catch(() => {
        // Ignore autoplay errors
      });
    }
  }, [currentSlide]);

  const featuredProducts = React.useMemo(() => {
    if (products.length === 0) return [];
    
    const limitedEdition = products.filter((p) => p.isLimitedEdition === true);
    return limitedEdition.length > 0 ? limitedEdition.slice(0, 6) : [];
  }, [products]);

  const renderSlideBackground = (slide, index) => {
    const isActive = index === currentSlide;
    const parallaxTransform = `translateY(${scrollY * 0.3}px)`;

    if (isVideo(slide.image)) {
      return (
        <video
          ref={(el) => {
            if (el) videoRefs.current[slide.id] = el;
          }}
          key={slide.id}
          className="absolute inset-0 w-full h-full object-cover parallax-slow"
          autoPlay={isActive}
          loop
          muted
          playsInline
          style={{ transform: parallaxTransform }}
        >
          <source src={slide.image} type="video/mp4" />
          Votre navigateur ne supporte pas la lecture de vidéos.
        </video>
      );
    }

    return (
      <div
        className="absolute inset-0 bg-cover bg-center parallax-slow"
        style={{
          backgroundImage: `url(${slide.image})`,
          transform: parallaxTransform,
        }}
      />
    );
  };

  return (
    <div className="min-h-screen bg-luxe-cream dark:bg-luxe-charcoal">
      <Helmet>
        <title>E-perfume - Parfums de Luxe & Esthétique Haut de Gamme</title>
      </Helmet>

      {/* Hero Carousel */}
      <section className="relative h-screen overflow-hidden">
        {heroSlides.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                isActive ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
              }`}
              style={{
                transform: `translateY(${isActive ? scrollY * 0.5 : 0}px)`,
              }}
            >
              {renderSlideBackground(slide, index)}
              <div className="absolute inset-0 bg-luxe-black/40" />
              <div className="relative h-full flex items-center justify-center z-10">
                <div className="text-center px-4 max-w-4xl mx-auto animate-fade-in">
                  <p className="font-sans text-sm tracking-widest uppercase text-luxe-gold mb-4">
                    {slide.subtitle}
                  </p>
                  <h1 className="font-serif text-6xl md:text-8xl font-light text-luxe-cream mb-6 text-balance">
                    {slide.title}
                  </h1>
                  <p className="font-sans text-lg md:text-xl text-luxe-cream/90 mb-8 max-w-2xl mx-auto">
                    {slide.description}
                  </p>
                  <Link
                    to={slide.link}
                    className="inline-block btn-luxe-gold relative z-20"
                  >
                    Découvrir
                  </Link>
                </div>
              </div>
            </div>
          );
        })}

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {heroSlides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => setCurrentSlide(index)}
              className={`h-1 transition-all duration-300 ${
                index === currentSlide
                  ? 'w-8 bg-luxe-gold'
                  : 'w-1 bg-luxe-cream/50 hover:bg-luxe-cream/75'
              }`}
              aria-label={`Slide ${index + 1}: ${slide.title}`}
            />
          ))}
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 right-8 animate-bounce">
          <div className="w-6 h-10 border-2 border-luxe-cream/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-luxe-cream/50 rounded-full mt-2" />
          </div>
        </div>
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
          ) : (
            <div className="text-center py-20 text-luxe-charcoal/70 dark:text-luxe-cream/70">
              <p className="mb-4">Aucune collection limitée disponible pour le moment</p>
              {userInfo?.isAdmin && (
                <p className="text-sm">Marquez des produits comme "Collection limitée" dans l'administration pour les afficher ici</p>
              )}
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
