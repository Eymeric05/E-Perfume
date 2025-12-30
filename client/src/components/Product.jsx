import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import ProductBadges from './ProductBadges';
import WishlistButton from './WishlistButton';

const Product = ({ product, index = 0 }) => {
  const navigate = useNavigate();
  
  if (!product || !product._id) {
    return null;
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price || 0);
  };

  const displayPrice = product.onSale && product.salePrice ? product.salePrice : product.price;
  const originalPrice = product.onSale && product.salePrice ? product.price : null;

  const handleProductClick = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    navigate(`/product/${product._id}`);
  };

  return (
    <div 
      className="group relative bg-luxe-warm-white rounded-lg overflow-hidden border border-luxe-charcoal/10 transition-all duration-500 ease-out hover:shadow-2xl hover:shadow-luxe-gold/10 hover:-translate-y-2 hover:border-luxe-gold/30 cursor-pointer"
      onClick={handleProductClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleProductClick(e);
        }
      }}
      aria-label={`Voir ${product.name}`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="relative aspect-square bg-gradient-to-br from-luxe-cream to-luxe-warm-white overflow-hidden">
        <ProductBadges product={product} />
        <div className="absolute inset-0 bg-gradient-to-t from-luxe-black/20 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <img
          src={product.image || product.images?.[0] || 'https://via.placeholder.com/400'}
          alt={product.name || 'Product'}
          className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:brightness-105"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400';
          }}
          onLoad={(e) => {
            e.target.classList.add('loaded');
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-luxe-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div 
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 flex gap-2 z-20"
          onClick={(e) => e.stopPropagation()}
        >
          <WishlistButton product={product} className="w-10 h-10 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl hover:bg-white hover:scale-110 transition-all duration-300" />
        </div>
        <div 
          className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-20"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-10 h-10 bg-luxe-gold rounded-full flex items-center justify-center shadow-xl hover:bg-luxe-gold/90 transition-all duration-300 hover:scale-110">
            <span className="text-luxe-black font-serif text-lg">→</span>
          </div>
        </div>
      </div>

      <div className="p-5 bg-luxe-warm-white">
        {product.brand && (
          <p className="font-sans text-xs text-luxe-charcoal/60 mb-1.5 uppercase tracking-widest font-medium">
            {product.brand}
          </p>
        )}
        <h3 className="font-serif text-lg font-normal text-luxe-black mb-3 hover:text-luxe-gold transition-colors duration-200 line-clamp-2 leading-tight">
          {product.name || 'Sans nom'}
        </h3>

        <div className="mb-4">
          <Rating
            value={product.rating || 0}
            text={`${product.numReviews || 0}`}
          />
        </div>

        <div className="flex items-baseline justify-between pt-3 border-t border-luxe-charcoal/10">
          <div className="flex flex-col gap-1">
            <span className="font-serif text-xl font-semibold text-luxe-black">
              {formatPrice(displayPrice)}
            </span>
            {originalPrice && (
              <span className="font-sans text-sm text-luxe-charcoal/50 line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
          {product.countInStock === 0 ? (
            <span className="font-sans text-xs text-red-500/70 uppercase tracking-wider font-medium">
              Épuisé
            </span>
          ) : (
            <span className="font-sans text-xs text-green-600/70 uppercase tracking-wider font-medium">
              En stock
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const Rating = ({ value = 0, text }) => {
  const numValue = Number(value) || 0;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className="text-luxe-gold">
          {numValue >= star ? (
            <FaStar className="w-3 h-3" />
          ) : numValue >= star - 0.5 ? (
            <FaStarHalfAlt className="w-3 h-3" />
          ) : (
            <FaRegStar className="w-3 h-3 text-luxe-charcoal/30" />
          )}
        </span>
      ))}
      {text && (
        <span className="font-sans text-xs text-luxe-charcoal/60 ml-2">
          ({text})
        </span>
      )}
    </div>
  );
};

export default Product;
