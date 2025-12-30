import React, { useContext, useState } from 'react';
import { Store } from '../context/StoreContext';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { apiFetch } from '../utils/api';

const WishlistButton = ({ product, className = '' }) => {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { wishlist, userInfo } = state;
  const [isAnimating, setIsAnimating] = useState(false);
  
  const isInWishlist = wishlist.some((item) => item._id === product._id);

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 600);

    if (isInWishlist) {
      ctxDispatch({ type: 'WISHLIST_REMOVE_ITEM', payload: product });
      
      if (userInfo?.token) {
        try {
          await apiFetch(`/api/users/wishlist/${product._id}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${userInfo.token}`,
            },
          });
        } catch (error) {
          console.error('Error removing from wishlist:', error);
        }
      }
    } else {
      ctxDispatch({ type: 'WISHLIST_ADD_ITEM', payload: product });
      
      if (userInfo?.token) {
        try {
          await apiFetch(`/api/users/wishlist/${product._id}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${userInfo.token}`,
            },
          });
        } catch (error) {
          console.error('Error adding to wishlist:', error);
        }
      }
    }
  };

  return (
    <button
      onClick={toggleWishlist}
      className={`wishlist-button ${className} ${isInWishlist ? 'text-red-500' : 'text-luxe-charcoal/60'} hover:text-red-500 transition-all duration-300 ${
        isAnimating ? 'scale-125' : 'scale-100'
      }`}
      aria-label={isInWishlist ? 'Retirer de la liste de souhaits' : 'Ajouter à la liste de souhaits'}
      title={isInWishlist ? 'Retirer de la liste de souhaits' : 'Ajouter à la liste de souhaits'}
    >
      {isInWishlist ? (
        <FaHeart className="w-5 h-5 fill-current" />
      ) : (
        <FaRegHeart className="w-5 h-5" />
      )}
    </button>
  );
};

export default WishlistButton;

