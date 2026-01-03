import React, { useContext } from 'react';
import { Store } from '../context/StoreContext';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaPlus, FaMinus, FaShoppingBag } from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';

const CartScreen = () => {
  const navigate = useNavigate();
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const {
    cart: { cartItems },
  } = state;

  const updateCartHandler = async (item, quantity) => {
    ctxDispatch({
      type: 'CART_ADD_ITEM',
      payload: { ...item, quantity },
    });
  };

  const removeItemHandler = (item) => {
    ctxDispatch({ type: 'CART_REMOVE_ITEM', payload: item });
  };

  const checkoutHandler = () => {
    if (!state.userInfo) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price || 0);
  };

  const subtotal = cartItems.reduce((a, c) => a + c.price * c.quantity, 0);
  const shipping = subtotal >= 100 ? 0 : 9.99;
  const total = subtotal + shipping;
  const itemsCount = cartItems.reduce((a, c) => a + c.quantity, 0);

  return (
    <div className="min-h-screen bg-luxe-cream dark:bg-luxe-charcoal">
      <Helmet>
        <title>Panier - E-perfume</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <h1 className="font-serif text-5xl md:text-6xl font-light text-luxe-black dark:text-luxe-cream mb-12">
          Panier
        </h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-20">
            <FaShoppingBag className="w-16 h-16 text-luxe-charcoal/30 dark:text-luxe-cream/30 mx-auto mb-6" />
            <h2 className="font-serif text-3xl font-light text-luxe-black dark:text-luxe-cream mb-4">
              Votre panier est vide
            </h2>
            <p className="font-sans text-lg text-luxe-charcoal/70 dark:text-luxe-cream/70 mb-8">
              Découvrez nos collections de parfums de luxe
            </p>
            <Link to="/products" className="btn-luxe-gold">
              Explorer les Collections
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className="bg-luxe-warm-white dark:bg-luxe-charcoal/50 border border-luxe-charcoal/10 dark:border-luxe-gold/20 p-6 flex flex-col md:flex-row gap-6 group hover:border-luxe-gold/30 transition-all duration-300"
                >
                  {/* Product Image */}
                  <Link
                    to={`/product/${item._id}`}
                    className="flex-shrink-0 w-32 h-32 md:w-40 md:h-40 overflow-hidden bg-luxe-cream dark:bg-luxe-charcoal"
                  >
                    <img
                      src={item.image || 'https://via.placeholder.com/400'}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <Link
                        to={`/product/${item._id}`}
                        className="font-serif text-xl font-normal text-luxe-black dark:text-luxe-cream hover:text-luxe-gold transition-colors duration-200 mb-2"
                      >
                        {item.name}
                      </Link>
                      {item.brand && (
                        <p className="font-sans text-xs uppercase tracking-wider text-luxe-charcoal/60 dark:text-luxe-cream/60 mb-4">
                          {item.brand}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3 border border-luxe-charcoal/20 dark:border-luxe-gold/30">
                        <button
                          onClick={() => updateCartHandler(item, Math.max(1, item.quantity - 1))}
                          className="p-2 hover:bg-luxe-champagne/30 dark:hover:bg-luxe-gold/20 transition-colors text-luxe-black dark:text-luxe-cream"
                          disabled={item.quantity <= 1}
                        >
                          <FaMinus className="w-3 h-3" />
                        </button>
                        <span className="font-sans text-base w-12 text-center text-luxe-black dark:text-luxe-cream">{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateCartHandler(
                              item,
                              Math.min(item.countInStock, item.quantity + 1)
                            )
                          }
                          className="p-2 hover:bg-luxe-champagne/30 dark:hover:bg-luxe-gold/20 transition-colors text-luxe-black dark:text-luxe-cream"
                          disabled={item.quantity >= item.countInStock}
                        >
                          <FaPlus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="font-serif text-xl font-normal text-luxe-black dark:text-luxe-cream">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                        {item.quantity > 1 && (
                          <p className="font-sans text-xs text-luxe-charcoal/60 dark:text-luxe-cream/60">
                            {formatPrice(item.price)} × {item.quantity}
                          </p>
                        )}
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItemHandler(item)}
                        className="p-2 text-luxe-charcoal/50 dark:text-luxe-cream/50 hover:text-luxe-gold transition-colors duration-200"
                        aria-label="Retirer du panier"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-luxe-warm-white dark:bg-luxe-charcoal/50 border border-luxe-charcoal/10 dark:border-luxe-gold/20 p-6">
                <h2 className="font-serif text-2xl font-light text-luxe-black dark:text-luxe-cream mb-6">
                  Récapitulatif
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="font-sans text-sm text-luxe-charcoal/70 dark:text-luxe-cream/70">
                      Sous-total ({itemsCount} {itemsCount === 1 ? 'article' : 'articles'})
                    </span>
                    <span className="font-serif text-lg font-normal text-luxe-black dark:text-luxe-cream">
                      {formatPrice(subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-sans text-sm text-luxe-charcoal/70 dark:text-luxe-cream/70">Livraison</span>
                    <span className="font-serif text-lg font-normal text-luxe-black dark:text-luxe-cream">
                      {shipping === 0 ? (
                        <span className="text-luxe-gold">Gratuite</span>
                      ) : (
                        formatPrice(shipping)
                      )}
                    </span>
                  </div>

                  {subtotal < 100 && (
                    <p className="font-sans text-xs text-luxe-gold">
                      Ajoutez {formatPrice(100 - subtotal)} pour la livraison gratuite
                    </p>
                  )}

                  <div className="pt-4 border-t border-luxe-charcoal/10 dark:border-luxe-gold/20">
                    <div className="flex justify-between items-center">
                      <span className="font-sans font-medium text-luxe-black dark:text-luxe-cream">Total</span>
                      <span className="font-serif text-2xl font-normal text-luxe-black dark:text-luxe-cream">
                        {formatPrice(total)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={checkoutHandler}
                  className="w-full btn-luxe-gold"
                  disabled={cartItems.length === 0}
                >
                  Passer la Commande
                </button>

                <Link
                  to="/products"
                  className="block text-center mt-4 font-sans text-sm text-luxe-charcoal/70 dark:text-luxe-cream/70 hover:text-luxe-gold transition-colors duration-200"
                >
                  Continuer les achats
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartScreen;
