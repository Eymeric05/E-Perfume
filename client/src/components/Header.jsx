import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaSearch, FaTimes, FaBars, FaUserShield, FaHeart } from 'react-icons/fa';
import { Store } from '../context/StoreContext';

const Header = () => {
  const { state } = useContext(Store);
  const { cart, userInfo } = state;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Reset menu state when location changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  }, [location.pathname]);

  const cartItemsCount = cart.cartItems.reduce((a, c) => a + c.quantity, 0);
  const wishlistCount = state.wishlist?.length || 0;

  // Helper function to check if a route is active
  const isActiveRoute = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    if (path.includes('?')) {
      const [basePath, query] = path.split('?');
      const [queryKey, queryValue] = query.split('=');
      const urlParams = new URLSearchParams(location.search);
      return location.pathname.startsWith(basePath) && urlParams.get(queryKey) === queryValue;
    }
    return location.pathname.startsWith(path);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };

    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchOpen]);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length > 0) {
      try {
        const response = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        setSearchResults(data.slice(0, 5));
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-luxe-cream/95 backdrop-blur-lg border-b-2 border-luxe-charcoal/20 shadow-lg transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center hover:opacity-90 transition-opacity duration-200 active:scale-95"
            >
              <img 
                src="/images/E-perfume-logo.png" 
                alt="E-perfume" 
                className="h-10 md:h-12 w-auto drop-shadow-sm"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6" role="navigation" aria-label="Navigation principale">
              <Link 
                to="/" 
                className={`relative px-4 py-2 font-sans text-sm font-semibold tracking-wider uppercase transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxe-gold focus:ring-offset-2 ${
                  isActiveRoute('/') 
                    ? 'text-luxe-gold bg-luxe-gold/10 shadow-md' 
                    : 'text-luxe-black hover:text-luxe-gold hover:bg-luxe-champagne/50'
                } active:scale-95 active:bg-luxe-gold/20`}
                aria-label="Aller à la page d'accueil"
              >
                Collections
                {isActiveRoute('/') && (
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-luxe-gold rounded-full" />
                )}
              </Link>
              <Link 
                to="/products" 
                className={`relative px-4 py-2 font-sans text-sm font-semibold tracking-wider uppercase transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxe-gold focus:ring-offset-2 ${
                  isActiveRoute('/products') && !location.search.includes('category=skincare')
                    ? 'text-luxe-gold bg-luxe-gold/10 shadow-md' 
                    : 'text-luxe-black hover:text-luxe-gold hover:bg-luxe-champagne/50'
                } active:scale-95 active:bg-luxe-gold/20`}
                aria-label="Voir tous les parfums"
              >
                Parfums
                {isActiveRoute('/products') && !location.search.includes('category=skincare') && (
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-luxe-gold rounded-full" />
                )}
              </Link>
              <Link 
                to="/products?category=skincare" 
                className={`relative px-4 py-2 font-sans text-sm font-semibold tracking-wider uppercase transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxe-gold focus:ring-offset-2 ${
                  isActiveRoute('/products?category=skincare')
                    ? 'text-luxe-gold bg-luxe-gold/10 shadow-md' 
                    : 'text-luxe-black hover:text-luxe-gold hover:bg-luxe-champagne/50'
                } active:scale-95 active:bg-luxe-gold/20`}
                aria-label="Voir les produits esthétique et soins"
              >
                Esthétique
                {isActiveRoute('/products?category=skincare') && (
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-luxe-gold rounded-full" />
                )}
              </Link>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Search Button */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`relative p-2.5 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-luxe-gold focus:ring-offset-2 ${
                  isSearchOpen
                    ? 'text-luxe-gold bg-luxe-gold/10 shadow-md'
                    : 'text-luxe-black hover:text-luxe-gold hover:bg-luxe-champagne/50'
                } active:scale-95 active:bg-luxe-gold/20`}
                aria-label={isSearchOpen ? "Fermer la recherche" : "Ouvrir la recherche"}
                aria-expanded={isSearchOpen}
                aria-controls="search-overlay"
              >
                <FaSearch className="w-5 h-5" aria-hidden="true" />
              </button>

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className={`relative p-2.5 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-luxe-gold focus:ring-offset-2 ${
                  isActiveRoute('/wishlist')
                    ? 'text-luxe-gold bg-luxe-gold/10 shadow-md'
                    : 'text-luxe-black hover:text-luxe-gold hover:bg-luxe-champagne/50'
                } active:scale-95 active:bg-luxe-gold/20`}
                aria-label={`Liste de souhaits${wishlistCount > 0 ? ` avec ${wishlistCount} produit${wishlistCount > 1 ? 's' : ''}` : ' (vide)'}`}
              >
                <FaHeart className="w-5 h-5" aria-hidden="true" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg border-2 border-luxe-cream" aria-label={`${wishlistCount} produit${wishlistCount > 1 ? 's' : ''} dans la liste de souhaits`}>
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                to="/cart"
                className={`relative p-2.5 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-luxe-gold focus:ring-offset-2 ${
                  isActiveRoute('/cart')
                    ? 'text-luxe-gold bg-luxe-gold/10 shadow-md'
                    : 'text-luxe-black hover:text-luxe-gold hover:bg-luxe-champagne/50'
                } active:scale-95 active:bg-luxe-gold/20`}
                aria-label={`Panier${cartItemsCount > 0 ? ` avec ${cartItemsCount} article${cartItemsCount > 1 ? 's' : ''}` : ' (vide)'}`}
              >
                <FaShoppingCart className="w-5 h-5" aria-hidden="true" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-luxe-gold text-luxe-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg border-2 border-luxe-cream" aria-label={`${cartItemsCount} article${cartItemsCount > 1 ? 's' : ''} dans le panier`}>
                    {cartItemsCount}
                  </span>
                )}
              </Link>

              {/* Admin Panel Link - Only visible to admins */}
              {userInfo?.isAdmin && (
                <Link
                  to="/admin"
                  className={`p-2.5 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-luxe-gold focus:ring-offset-2 ${
                    isActiveRoute('/admin')
                      ? 'text-luxe-gold bg-luxe-gold/10 shadow-md'
                      : 'text-luxe-gold hover:text-luxe-black hover:bg-luxe-champagne/50'
                  } active:scale-95 active:bg-luxe-gold/20`}
                  title="Panel Administrateur"
                >
                  <FaUserShield className="w-5 h-5" />
                </Link>
              )}

              {/* User Account */}
              {userInfo ? (
                <Link
                  to="/profile"
                  className={`p-2.5 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-luxe-gold focus:ring-offset-2 ${
                    isActiveRoute('/profile')
                      ? 'text-luxe-gold bg-luxe-gold/10 shadow-md'
                      : 'text-luxe-black hover:text-luxe-gold hover:bg-luxe-champagne/50'
                  } active:scale-95 active:bg-luxe-gold/20`}
                >
                  <FaUser className="w-5 h-5" />
                </Link>
              ) : (
                <Link
                  to="/login"
                  className={`p-2.5 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-luxe-gold focus:ring-offset-2 ${
                    isActiveRoute('/login')
                      ? 'text-luxe-gold bg-luxe-gold/10 shadow-md'
                      : 'text-luxe-black hover:text-luxe-gold hover:bg-luxe-champagne/50'
                  } active:scale-95 active:bg-luxe-gold/20`}
                >
                  <FaUser className="w-5 h-5" />
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`md:hidden p-2.5 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-luxe-gold focus:ring-offset-2 ${
                  isMenuOpen
                    ? 'text-luxe-gold bg-luxe-gold/10 shadow-md'
                    : 'text-luxe-black hover:text-luxe-gold hover:bg-luxe-champagne/50'
                } active:scale-95 active:bg-luxe-gold/20`}
                aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
              >
                {isMenuOpen ? <FaTimes className="w-5 h-5" aria-hidden="true" /> : <FaBars className="w-5 h-5" aria-hidden="true" />}
              </button>
            </div>
          </div>
        </div>

        {/* Search Overlay */}
        {isSearchOpen && (
          <div 
            id="search-overlay"
            className="absolute top-full left-0 right-0 bg-luxe-cream border-b border-luxe-charcoal/10 shadow-lg"
            role="dialog"
            aria-label="Recherche de produits"
          >
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
              <form onSubmit={handleSearchSubmit} className="relative" role="search">
                <label htmlFor="search-input" className="sr-only">Rechercher un produit</label>
                <input
                  id="search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Rechercher un parfum, une note olfactive..."
                  className="w-full px-6 py-4 bg-luxe-warm-white border border-luxe-charcoal/20 text-luxe-black font-sans text-lg focus:outline-none focus:border-luxe-gold focus:ring-2 focus:ring-luxe-gold transition-all duration-200"
                  autoFocus
                  aria-label="Rechercher un produit"
                  aria-describedby={searchResults.length > 0 ? "search-results" : undefined}
                />
                <button
                  type="submit"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-luxe-gold hover:text-luxe-black transition-colors focus:outline-none focus:ring-2 focus:ring-luxe-gold focus:ring-offset-2 rounded p-1"
                  aria-label="Lancer la recherche"
                >
                  <FaSearch className="w-5 h-5" aria-hidden="true" />
                </button>
              </form>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div id="search-results" className="mt-4 space-y-2" role="listbox" aria-label="Résultats de recherche">
                  {searchResults.map((product, index) => (
                    <Link
                      key={product._id}
                      to={`/product/${product._id}`}
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="block p-3 bg-luxe-warm-white border border-luxe-charcoal/10 hover:border-luxe-gold hover:bg-luxe-champagne/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-luxe-gold focus:ring-offset-2"
                      role="option"
                      aria-label={`${product.name} par ${product.brand}`}
                      tabIndex={0}
                    >
                      <div className="font-sans text-sm font-medium text-luxe-black">{product.name}</div>
                      <div className="font-sans text-xs text-luxe-charcoal/60 mt-1">{product.brand}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Side Navigation */}
      <div
        id="mobile-menu"
        className={`fixed top-0 right-0 h-full w-80 bg-luxe-cream border-l border-luxe-charcoal/10 shadow-2xl transform transition-transform duration-500 ease-out z-40 ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="navigation"
        aria-label="Menu de navigation mobile"
        aria-hidden={!isMenuOpen}
      >
        <div className="p-8 h-full flex flex-col">
          <div className="flex justify-between items-center mb-12">
            <h2 className="font-serif text-2xl font-light tracking-wider text-luxe-black">Menu</h2>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 text-luxe-black hover:text-luxe-gold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-luxe-gold focus:ring-offset-2 rounded"
              aria-label="Fermer le menu"
            >
              <FaTimes className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          <nav className="flex-1 space-y-4" role="navigation" aria-label="Navigation mobile">
            <Link
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className={`block font-sans text-base font-semibold tracking-wider uppercase transition-all duration-200 py-3 px-4 rounded-lg border-b-2 ${
                isActiveRoute('/')
                  ? 'text-luxe-gold bg-luxe-gold/10 border-luxe-gold'
                  : 'text-luxe-black hover:text-luxe-gold hover:bg-luxe-champagne/30 border-transparent hover:border-luxe-gold/30'
              } active:scale-95 active:bg-luxe-gold/20`}
            >
              Accueil
            </Link>
            <Link
              to="/products"
              onClick={() => setIsMenuOpen(false)}
              className={`block font-sans text-base font-semibold tracking-wider uppercase transition-all duration-200 py-3 px-4 rounded-lg border-b-2 ${
                isActiveRoute('/products') && !location.search.includes('category=skincare')
                  ? 'text-luxe-gold bg-luxe-gold/10 border-luxe-gold'
                  : 'text-luxe-black hover:text-luxe-gold hover:bg-luxe-champagne/30 border-transparent hover:border-luxe-gold/30'
              } active:scale-95 active:bg-luxe-gold/20`}
            >
              Tous les Parfums
            </Link>
            <Link
              to="/products?category=skincare"
              onClick={() => setIsMenuOpen(false)}
              className={`block font-sans text-base font-semibold tracking-wider uppercase transition-all duration-200 py-3 px-4 rounded-lg border-b-2 ${
                isActiveRoute('/products?category=skincare')
                  ? 'text-luxe-gold bg-luxe-gold/10 border-luxe-gold'
                  : 'text-luxe-black hover:text-luxe-gold hover:bg-luxe-champagne/30 border-transparent hover:border-luxe-gold/30'
              } active:scale-95 active:bg-luxe-gold/20`}
            >
              Esthétique
            </Link>
            <Link
              to="/wishlist"
              onClick={() => setIsMenuOpen(false)}
              className={`block font-sans text-base font-semibold tracking-wider uppercase transition-all duration-200 py-3 px-4 rounded-lg border-b-2 flex items-center gap-2 ${
                isActiveRoute('/wishlist')
                  ? 'text-luxe-gold bg-luxe-gold/10 border-luxe-gold'
                  : 'text-luxe-black hover:text-luxe-gold hover:bg-luxe-champagne/30 border-transparent hover:border-luxe-gold/30'
              } active:scale-95 active:bg-luxe-gold/20`}
            >
              <FaHeart className="w-4 h-4" />
              Liste de Souhaits {wishlistCount > 0 && <span className="text-red-500">({wishlistCount})</span>}
            </Link>
            <Link
              to="/cart"
              onClick={() => setIsMenuOpen(false)}
              className={`block font-sans text-base font-semibold tracking-wider uppercase transition-all duration-200 py-3 px-4 rounded-lg border-b-2 ${
                isActiveRoute('/cart')
                  ? 'text-luxe-gold bg-luxe-gold/10 border-luxe-gold'
                  : 'text-luxe-black hover:text-luxe-gold hover:bg-luxe-champagne/30 border-transparent hover:border-luxe-gold/30'
              } active:scale-95 active:bg-luxe-gold/20`}
            >
              Panier <span className={cartItemsCount > 0 ? 'text-luxe-gold' : ''}>({cartItemsCount})</span>
            </Link>
            {userInfo ? (
              <>
                {userInfo.isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className={`block font-sans text-base font-semibold tracking-wider uppercase transition-all duration-200 py-3 px-4 rounded-lg border-b-2 flex items-center gap-2 ${
                      isActiveRoute('/admin')
                        ? 'text-luxe-gold bg-luxe-gold/10 border-luxe-gold'
                        : 'text-luxe-gold hover:text-luxe-black hover:bg-luxe-champagne/30 border-transparent hover:border-luxe-gold/30'
                    } active:scale-95 active:bg-luxe-gold/20`}
                  >
                    <FaUserShield className="w-4 h-4" />
                    Administration
                  </Link>
                )}
                <Link
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block font-sans text-base font-semibold tracking-wider uppercase transition-all duration-200 py-3 px-4 rounded-lg border-b-2 ${
                    isActiveRoute('/profile')
                      ? 'text-luxe-gold bg-luxe-gold/10 border-luxe-gold'
                      : 'text-luxe-black hover:text-luxe-gold hover:bg-luxe-champagne/30 border-transparent hover:border-luxe-gold/30'
                  } active:scale-95 active:bg-luxe-gold/20`}
                >
                  Mon Compte
                </Link>
                <Link
                  to="/logout"
                  onClick={() => setIsMenuOpen(false)}
                  className="block font-sans text-base font-semibold tracking-wider uppercase text-luxe-black hover:text-luxe-gold hover:bg-luxe-champagne/30 transition-all duration-200 py-3 px-4 rounded-lg border-b-2 border-transparent hover:border-luxe-gold/30 active:scale-95 active:bg-luxe-gold/20"
                >
                  Déconnexion
                </Link>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className={`block font-sans text-base font-semibold tracking-wider uppercase transition-all duration-200 py-3 px-4 rounded-lg border-b-2 ${
                  isActiveRoute('/login')
                    ? 'text-luxe-gold bg-luxe-gold/10 border-luxe-gold'
                    : 'text-luxe-black hover:text-luxe-gold hover:bg-luxe-champagne/30 border-transparent hover:border-luxe-gold/30'
                } active:scale-95 active:bg-luxe-gold/20`}
              >
                Connexion
              </Link>
            )}
          </nav>
        </div>
      </div>

      {/* Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-luxe-black/20 backdrop-blur-sm z-30"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Spacer for fixed header */}
      <div className="h-20" />
    </>
  );
};

export default Header;
