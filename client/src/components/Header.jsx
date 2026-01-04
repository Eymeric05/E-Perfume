import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaSearch, FaTimes, FaBars, FaUserShield, FaHeart } from 'react-icons/fa';
import { Store } from '../context/StoreContext';
import ThemeToggle from './ThemeToggle';
import { apiFetch } from '../utils/api';

const Header = () => {
  const { state } = useContext(Store);
  const { cart, userInfo } = state;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const cartItemsCount = cart.cartItems.reduce((a, c) => a + c.quantity, 0);
  const wishlistCount = state.wishlist?.length || 0;

  const isActiveRoute = (path) => {
    if (path === '/') return location.pathname === '/';
    if (path.includes('?')) {
      const [basePath, query] = path.split('?');
      const [queryKey, queryValue] = query.split('=');
      const urlParams = new URLSearchParams(location.search);
      return location.pathname.startsWith(basePath) && urlParams.get(queryKey) === queryValue;
    }
    return location.pathname.startsWith(path);
  };

  useEffect(() => {
    setIsSidebarOpen(false);
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };

    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isSidebarOpen]);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length > 0) {
      try {
        const response = await apiFetch(`/api/products/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setSearchResults(Array.isArray(data) ? data.slice(0, 5) : []);
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

  const navLinks = [
    { path: '/', label: 'COLLECTIONS' },
    { path: '/products', label: 'PARFUMS', excludeQuery: 'category=skincare' },
    { path: '/products?category=skincare', label: 'ESTHÉTIQUE' },
  ];

  const getNavLinkClass = (link) => {
    const isActive = link.excludeQuery
      ? isActiveRoute(link.path) && !location.search.includes(link.excludeQuery)
      : isActiveRoute(link.path);
    
    return `relative font-sans text-xs font-medium tracking-[0.2em] uppercase transition-all duration-300 pb-1 ${
      isActive
        ? 'text-luxe-gold'
        : 'text-luxe-black dark:text-luxe-cream hover:text-luxe-gold'
    }`;
  };

  const getSidebarLinkClass = (isActive = false) => {
    return `block font-sans text-sm font-medium tracking-[0.2em] uppercase transition-all duration-300 py-4 border-b ${
      isActive
        ? 'text-luxe-gold border-luxe-gold'
        : 'text-luxe-black dark:text-luxe-cream hover:text-luxe-gold border-luxe-charcoal/10 dark:border-luxe-cream/10'
    }`;
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-luxe-cream dark:bg-luxe-charcoal border-b border-luxe-charcoal/20 dark:border-luxe-cream/20 shadow-[0_2px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_20px_rgba(255,255,255,0.05)] transition-all duration-300">
        <div className="w-full mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-24">
            {/* Logo */}
            <Link to="/" className="flex items-center hover:opacity-80 transition-opacity duration-300">
              <img 
                src="/images/E-perfume-logo.png" 
                alt="E-perfume" 
                className="h-10 w-auto"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-12 absolute left-1/2 transform -translate-x-1/2" role="navigation" aria-label="Navigation principale">
              {navLinks.map((link) => {
                const isActive = link.excludeQuery
                  ? isActiveRoute(link.path) && !location.search.includes(link.excludeQuery)
                  : isActiveRoute(link.path);
                
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={getNavLinkClass(link)}
                    aria-label={link.label}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-px bg-luxe-gold" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Side Actions - Simplifié */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`relative flex items-center space-x-2 px-4 py-2.5 border transition-all duration-300 focus:outline-none ${
                  isSearchOpen
                    ? 'border-luxe-gold text-luxe-gold bg-luxe-gold/5'
                    : 'border-luxe-charcoal/30 dark:border-luxe-cream/30 text-luxe-black dark:text-luxe-cream hover:border-luxe-gold hover:text-luxe-gold'
                }`}
                aria-label={isSearchOpen ? "Fermer la recherche" : "Ouvrir la recherche"}
                aria-expanded={isSearchOpen}
                aria-controls="search-overlay"
              >
                <FaSearch className="w-4 h-4" aria-hidden="true" />
                <span className="hidden xl:inline font-sans text-xs font-light tracking-wider uppercase">Rechercher</span>
              </button>

              {/* Cart */}
              <Link
                to="/cart"
                className={`relative flex items-center transition-all duration-300 focus:outline-none ${
                  isActiveRoute('/cart')
                    ? 'text-luxe-gold'
                    : 'text-luxe-black dark:text-luxe-cream hover:text-luxe-gold'
                }`}
                aria-label={`Panier${cartItemsCount > 0 ? ` avec ${cartItemsCount} article${cartItemsCount > 1 ? 's' : ''}` : ' (vide)'}`}
              >
                <FaShoppingCart className="w-5 h-5" aria-hidden="true" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-luxe-gold text-luxe-black text-[10px] font-medium rounded-full w-4 h-4 flex items-center justify-center" aria-label={`${cartItemsCount} article${cartItemsCount > 1 ? 's' : ''} dans le panier`}>
                    {cartItemsCount}
                  </span>
                )}
              </Link>

              {/* Menu Button */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`flex items-center transition-all duration-300 focus:outline-none ${
                  isSidebarOpen
                    ? 'text-luxe-gold'
                    : 'text-luxe-black dark:text-luxe-cream hover:text-luxe-gold'
                }`}
                aria-label={isSidebarOpen ? "Fermer le menu" : "Ouvrir le menu"}
                aria-expanded={isSidebarOpen}
                aria-controls="sidebar-menu"
              >
                {isSidebarOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Search Overlay */}
        {isSearchOpen && (
          <div 
            ref={searchRef}
            id="search-overlay"
            className="absolute top-full left-0 right-0 bg-luxe-cream dark:bg-luxe-charcoal border-b border-luxe-charcoal/10 dark:border-luxe-cream/10 shadow-xl"
            role="dialog"
            aria-label="Recherche de produits"
          >
            <div className="w-full mx-auto px-6 lg:px-12 py-8">
              <form onSubmit={handleSearchSubmit} className="relative max-w-4xl mx-auto" role="search">
                <label htmlFor="search-input" className="sr-only">Rechercher un produit</label>
                <div className="relative flex items-center border-b-2 border-luxe-charcoal/30 dark:border-luxe-cream/30 focus-within:border-luxe-gold transition-colors duration-300">
                  <FaSearch className="absolute left-0 w-5 h-5 text-luxe-charcoal/50 dark:text-luxe-cream/50" aria-hidden="true" />
                  <input
                    id="search-input"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Rechercher un parfum, une note olfactive..."
                    className="w-full pl-8 pr-12 py-4 bg-transparent text-luxe-black dark:text-luxe-cream font-sans text-base font-light tracking-wide focus:outline-none placeholder:text-luxe-charcoal/40 dark:placeholder:text-luxe-cream/40"
                    autoFocus
                    aria-label="Rechercher un produit"
                    aria-describedby={searchResults.length > 0 ? "search-results" : undefined}
                  />
                  <button
                    type="submit"
                    className="absolute right-0 text-luxe-gold hover:text-luxe-black dark:hover:text-luxe-cream transition-colors focus:outline-none p-2"
                    aria-label="Lancer la recherche"
                  >
                    <FaSearch className="w-5 h-5" aria-hidden="true" />
                  </button>
                </div>
              </form>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div id="search-results" className="mt-6 space-y-1 max-w-4xl mx-auto" role="listbox" aria-label="Résultats de recherche">
                  {searchResults.map((product) => (
                    <Link
                      key={product._id}
                      to={`/product/${product._id}`}
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="block px-4 py-3 border-b border-luxe-charcoal/5 dark:border-luxe-cream/10 hover:bg-luxe-gold/10 dark:hover:bg-luxe-champagne/20 transition-all duration-200 focus:outline-none"
                      role="option"
                      aria-label={`${product.name} par ${product.brand}`}
                      tabIndex={0}
                    >
                      <div className="font-sans text-sm font-light text-luxe-black dark:text-luxe-cream tracking-wide">{product.name}</div>
                      <div className="font-sans text-xs text-luxe-charcoal/50 dark:text-luxe-cream/50 mt-0.5 tracking-wider uppercase">{product.brand}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Sidebar Menu */}
      <div
        id="sidebar-menu"
        className={`fixed top-0 right-0 h-full w-80 bg-luxe-cream dark:bg-luxe-charcoal border-l border-luxe-charcoal/20 dark:border-luxe-cream/20 shadow-2xl transform transition-transform duration-500 ease-out z-40 ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="navigation"
        aria-label="Menu latéral"
        aria-hidden={!isSidebarOpen}
      >
        <div className="p-8 h-full flex flex-col">
          <div className="flex justify-between items-center mb-12">
            <h2 className="font-serif text-xl font-light tracking-[0.15em] text-luxe-black dark:text-luxe-cream uppercase">Menu</h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 text-luxe-black dark:text-luxe-cream hover:text-luxe-gold transition-colors duration-300 focus:outline-none"
              aria-label="Fermer le menu"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-2" role="navigation" aria-label="Navigation">
            {/* Navigation Links */}
            {navLinks.map((link) => {
              const isActive = link.excludeQuery
                ? isActiveRoute(link.path) && !location.search.includes(link.excludeQuery)
                : isActiveRoute(link.path);
              
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={getSidebarLinkClass(isActive)}
                >
                  {link.label.replace('COLLECTIONS', 'Collections').replace('PARFUMS', 'Parfums').replace('ESTHÉTIQUE', 'Esthétique')}
                </Link>
              );
            })}

            {/* Wishlist */}
            <Link
              to="/wishlist"
              onClick={() => setIsSidebarOpen(false)}
              className={`${getSidebarLinkClass(isActiveRoute('/wishlist'))} flex items-center gap-3`}
            >
              <FaHeart className="w-4 h-4" />
              Liste de Souhaits {wishlistCount > 0 && <span className="text-luxe-gold">({wishlistCount})</span>}
            </Link>

            {/* User Account */}
            {userInfo ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setIsSidebarOpen(false)}
                  className={`${getSidebarLinkClass(isActiveRoute('/profile'))} flex items-center gap-3`}
                >
                  <FaUser className="w-4 h-4" />
                  Mon Compte
                </Link>
                {userInfo.isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setIsSidebarOpen(false)}
                    className={`${getSidebarLinkClass(isActiveRoute('/admin'))} flex items-center gap-3`}
                  >
                    <FaUserShield className="w-4 h-4" />
                    Administration
                  </Link>
                )}
                <Link
                  to="/logout"
                  onClick={() => setIsSidebarOpen(false)}
                  className="block font-sans text-sm font-medium tracking-[0.2em] uppercase text-luxe-black dark:text-luxe-cream hover:text-luxe-gold transition-all duration-300 py-4 border-b border-luxe-charcoal/10 dark:border-luxe-cream/10"
                >
                  Déconnexion
                </Link>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsSidebarOpen(false)}
                className={getSidebarLinkClass(isActiveRoute('/login'))}
              >
                Connexion
              </Link>
            )}

            {/* Theme Toggle */}
            <div className="pt-4 border-t border-luxe-charcoal/10 dark:border-luxe-cream/10">
              <div className="flex items-center justify-between py-2">
                <span className="font-sans text-sm font-medium tracking-[0.2em] uppercase text-luxe-black dark:text-luxe-cream">Thème</span>
                <ThemeToggle />
              </div>
            </div>
          </nav>
        </div>
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-luxe-black/20 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Spacer */}
      <div className="h-24" />
    </>
  );
};

export default Header;
