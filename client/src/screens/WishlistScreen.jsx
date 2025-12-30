import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Store } from '../context/StoreContext';
import { Helmet } from 'react-helmet-async';
import Product from '../components/Product';
import ProductSkeleton from '../components/ProductSkeleton';
import { FaHeart, FaTrash } from 'react-icons/fa';
import { apiFetch } from '../utils/api';

const WishlistScreen = () => {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { wishlist, userInfo } = state;
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (wishlist.length === 0) {
        setProducts([]);
        return;
      }

      setLoading(true);
      try {
        if (userInfo?.token) {
          const response = await apiFetch('/api/users/wishlist', {
            headers: {
              Authorization: `Bearer ${userInfo.token}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            setProducts(data);
          }
        } else {
          setProducts(wishlist);
        }
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        setProducts(wishlist);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistProducts();
  }, [wishlist, userInfo]);

  const removeFromWishlist = async (productId) => {
    ctxDispatch({ type: 'WISHLIST_REMOVE_ITEM', payload: { _id: productId } });
    
    if (userInfo?.token) {
      try {
        await apiFetch(`/api/users/wishlist/${productId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        });
      } catch (error) {
        console.error('Error removing from wishlist:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-luxe-cream">
      <Helmet>
        <title>Ma Liste de Souhaits - E-perfume</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="font-serif text-5xl md:text-6xl font-light text-luxe-black mb-4">
              Ma Liste de Souhaits
            </h1>
            <p className="font-sans text-lg text-luxe-charcoal/70">
              {products.length} {products.length === 1 ? 'produit' : 'produits'} sauvegardé{products.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {loading ? (
          <ProductSkeleton count={6} />
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <FaHeart className="w-20 h-20 text-luxe-charcoal/20 mx-auto mb-6" />
            <p className="font-serif text-2xl text-luxe-black mb-4">
              Votre liste de souhaits est vide
            </p>
            <p className="font-sans text-lg text-luxe-charcoal/70 mb-8">
              Ajoutez des produits à votre liste de souhaits pour les retrouver facilement
            </p>
            <Link to="/products" className="btn-luxe-gold">
              Découvrir nos collections
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <div key={product._id} className="relative">
                <Product product={product} index={index} />
                <button
                  onClick={() => removeFromWishlist(product._id)}
                  className="absolute top-4 right-4 z-10 p-2 bg-white/90 rounded-full text-red-500 hover:bg-white transition-all shadow-lg"
                  aria-label="Retirer de la liste de souhaits"
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistScreen;



