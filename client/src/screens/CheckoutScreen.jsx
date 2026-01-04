import React, { useState, useContext, useEffect, useReducer } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Store } from '../context/StoreContext';
import { Helmet } from 'react-helmet-async';
import { FaCheck, FaLock, FaCreditCard, FaTruck } from 'react-icons/fa';
import { apiFetch } from '../utils/api';

const reducer = (state, action) => {
  switch (action.type) {
    case 'CREATE_REQUEST':
      return { ...state, loading: true };
    case 'CREATE_SUCCESS':
      return { ...state, loading: false };
    case 'CREATE_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

const CheckoutScreen = () => {
  const navigate = useNavigate();
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart, userInfo } = state;
  const [{ loading, error }, dispatch] = useReducer(reducer, {
    loading: false,
    error: '',
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [shippingData, setShippingData] = useState({
    address: cart.shippingAddress?.address || '',
    city: cart.shippingAddress?.city || '',
    postalCode: cart.shippingAddress?.postalCode || '',
    country: cart.shippingAddress?.country || 'France',
  });
  const [paymentMethod, setPaymentMethod] = useState(cart.paymentMethod || 'Stripe');

  useEffect(() => {
    if (!userInfo) {
      navigate('/login?redirect=/checkout');
    }
    if (cart.cartItems.length === 0) {
      navigate('/cart');
    }
  }, [userInfo, cart.cartItems.length, navigate]);

  const steps = [
    { id: 1, title: 'Livraison', icon: FaTruck },
    { id: 2, title: 'Paiement', icon: FaCreditCard },
    { id: 3, title: 'Confirmation', icon: FaLock },
  ];

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    ctxDispatch({
      type: 'SAVE_SHIPPING_ADDRESS',
      payload: shippingData,
    });
    localStorage.setItem('shippingAddress', JSON.stringify(shippingData));
    setCurrentStep(2);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    ctxDispatch({ type: 'SAVE_PAYMENT_METHOD', payload: paymentMethod });
    localStorage.setItem('paymentMethod', paymentMethod);
    setCurrentStep(3);
  };

  const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100;
  const itemsPrice = round2(cart.cartItems.reduce((a, c) => a + c.quantity * c.price, 0));
  const shippingPrice = itemsPrice > 100 ? round2(0) : round2(9.99);
  const taxPrice = round2(0.2 * itemsPrice);
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  const placeOrderHandler = async () => {
    try {
      dispatch({ type: 'CREATE_REQUEST' });
      
      // Créer la commande
      const res = await apiFetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify({
          orderItems: cart.cartItems,
          shippingAddress: shippingData,
          paymentMethod: paymentMethod,
          itemsPrice: itemsPrice,
          shippingPrice: shippingPrice,
          taxPrice: taxPrice,
          totalPrice: totalPrice,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Si la méthode de paiement est Stripe, créer une session Checkout
        if (paymentMethod === 'Stripe') {
          try {
            const stripeRes = await apiFetch('/api/payment/create-checkout-session', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userInfo.token}`,
              },
              body: JSON.stringify({
                items: cart.cartItems,
                orderId: data._id,
              }),
            });

            const stripeData = await stripeRes.json();
            
            if (stripeRes.ok && stripeData.url) {
              // Ne pas vider le panier maintenant, on le fera après le retour de Stripe
              // Rediriger vers Stripe Checkout
              window.location.href = stripeData.url;
              return;
            } else {
              throw new Error(stripeData.error || 'Erreur lors de la création de la session Stripe');
            }
          } catch (stripeErr) {
            console.error('Erreur Stripe:', stripeErr);
            dispatch({ type: 'CREATE_FAIL', payload: stripeErr.message || 'Erreur lors de l\'initialisation du paiement' });
            return;
          }
        } else if (paymentMethod === 'PayPal') {
          // Pour PayPal, NE PAS vider le panier maintenant - on le fera après le paiement réussi
          // Rediriger vers la page de commande où le bouton PayPal sera affiché
          dispatch({ type: 'CREATE_SUCCESS' });
          navigate(`/order/${data._id}?paypal=true`);
        } else {
          // Pour les autres méthodes de paiement, procéder normalement
          ctxDispatch({ type: 'CART_CLEAR' });
          dispatch({ type: 'CREATE_SUCCESS' });
          localStorage.removeItem('cartItems');
          navigate(`/order/${data._id}`);
        }
      } else {
        dispatch({ type: 'CREATE_FAIL', payload: data.message || 'Erreur lors de la commande' });
      }
    } catch (err) {
      dispatch({ type: 'CREATE_FAIL', payload: err.message });
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price || 0);
  };

  return (
    <div className="min-h-screen bg-luxe-cream">
      <Helmet>
        <title>Commande - E-perfume</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <h1 className="font-serif text-5xl md:text-6xl font-light text-luxe-black mb-12">
          Commande
        </h1>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep >= step.id;
              const isCurrent = currentStep === step.id;

              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        isActive
                          ? 'bg-luxe-gold border-luxe-gold text-luxe-black'
                          : 'bg-luxe-cream border-luxe-charcoal/20 text-luxe-charcoal/40'
                      }`}
                    >
                      {isActive && currentStep > step.id ? (
                        <FaCheck className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <span
                      className={`mt-2 font-sans text-xs uppercase tracking-wider ${
                        isActive ? 'text-luxe-black' : 'text-luxe-charcoal/40'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-4 transition-all duration-300 ${
                        currentStep > step.id ? 'bg-luxe-gold' : 'bg-luxe-charcoal/20'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Shipping */}
            {currentStep === 1 && (
              <div className="bg-luxe-warm-white border border-luxe-charcoal/10 p-8">
                <h2 className="font-serif text-3xl font-light text-luxe-black mb-6">
                  Adresse de Livraison
                </h2>
                <form onSubmit={handleShippingSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="address" className="block font-sans text-sm uppercase tracking-wider text-luxe-charcoal/70 mb-2">
                      Adresse
                    </label>
                    <input
                      type="text"
                      id="address"
                      value={shippingData.address}
                      onChange={(e) =>
                        setShippingData({ ...shippingData, address: e.target.value })
                      }
                      className="input-luxe"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="city" className="block font-sans text-sm uppercase tracking-wider text-luxe-charcoal/70 mb-2">
                        Ville
                      </label>
                      <input
                        type="text"
                        id="city"
                        value={shippingData.city}
                        onChange={(e) =>
                          setShippingData({ ...shippingData, city: e.target.value })
                        }
                        className="input-luxe"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="postalCode" className="block font-sans text-sm uppercase tracking-wider text-luxe-charcoal/70 mb-2">
                        Code Postal
                      </label>
                      <input
                        type="text"
                        id="postalCode"
                        value={shippingData.postalCode}
                        onChange={(e) =>
                          setShippingData({ ...shippingData, postalCode: e.target.value })
                        }
                        className="input-luxe"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="country" className="block font-sans text-sm uppercase tracking-wider text-luxe-charcoal/70 mb-2">
                      Pays
                    </label>
                    <input
                      type="text"
                      id="country"
                      value={shippingData.country}
                      onChange={(e) =>
                        setShippingData({ ...shippingData, country: e.target.value })
                      }
                      className="input-luxe"
                      required
                    />
                  </div>

                  <button type="submit" className="btn-luxe-gold w-full !px-4 md:!px-8 !text-sm md:!text-base">
                    <span className="hidden sm:inline">Continuer vers le Paiement</span>
                    <span className="sm:hidden">Continuer</span>
                  </button>
                </form>
              </div>
            )}

            {/* Step 2: Payment */}
            {currentStep === 2 && (
              <div className="bg-luxe-warm-white border border-luxe-charcoal/10 p-8">
                <h2 className="font-serif text-3xl font-light text-luxe-black mb-6">
                  Méthode de Paiement
                </h2>
                <form onSubmit={handlePaymentSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <label className={`flex items-center p-4 border-2 cursor-pointer transition-all duration-200 ${
                      paymentMethod === 'Stripe' 
                        ? 'border-luxe-gold bg-luxe-gold/5' 
                        : 'border-luxe-charcoal/20 hover:border-luxe-gold/50'
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        value="Stripe"
                        checked={paymentMethod === 'Stripe'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-4 w-4 h-4 text-luxe-gold"
                      />
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex-shrink-0">
                          <img 
                            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/stripe/stripe-original.svg" 
                            alt="Stripe" 
                            className="w-12 h-8 object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'block';
                            }}
                          />
                          <div style={{ display: 'none' }} className="text-2xl font-bold text-[#635BFF]">Stripe</div>
                        </div>
                        <div>
                          <div className="font-sans font-medium text-luxe-black">Carte Bancaire</div>
                          <div className="font-sans text-sm text-luxe-charcoal/60">
                            Paiement sécurisé via Stripe
                          </div>
                        </div>
                      </div>
                    </label>

                    <label className={`flex items-center p-4 border-2 cursor-pointer transition-all duration-200 ${
                      paymentMethod === 'PayPal' 
                        ? 'border-luxe-gold bg-luxe-gold/5' 
                        : 'border-luxe-charcoal/20 hover:border-luxe-gold/50'
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        value="PayPal"
                        checked={paymentMethod === 'PayPal'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-4 w-4 h-4 text-luxe-gold"
                      />
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex-shrink-0">
                          <img 
                            src="https://www.paypalobjects.com/webstatic/mktg/logo-center/PP_Acceptance_Marks_for_LogoCenter_76x48.png" 
                            alt="PayPal" 
                            className="w-20 h-8 object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'block';
                            }}
                          />
                          <div style={{ display: 'none' }} className="text-2xl font-bold text-[#0070BA]">PayPal</div>
                        </div>
                        <div>
                          <div className="font-sans font-medium text-luxe-black">PayPal</div>
                          <div className="font-sans text-sm text-luxe-charcoal/60">
                            Payer avec votre compte PayPal
                          </div>
                        </div>
                      </div>
                    </label>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="btn-luxe-secondary flex-1 !px-4 md:!px-8 !text-sm md:!text-base"
                    >
                      Retour
                    </button>
                    <button type="submit" className="btn-luxe-gold flex-1 !px-4 md:!px-8 !text-sm md:!text-base">
                      <span className="hidden sm:inline">Continuer vers la Confirmation</span>
                      <span className="sm:hidden">Continuer</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {currentStep === 3 && (
              <div className="bg-luxe-warm-white border border-luxe-charcoal/10 p-8 space-y-8">
                <h2 className="font-serif text-3xl font-light text-luxe-black">
                  Récapitulatif de la Commande
                </h2>

                {/* Shipping Summary */}
                <div className="border-b border-luxe-charcoal/10 pb-6">
                  <h3 className="font-serif text-xl font-normal text-luxe-black mb-3">
                    Livraison
                  </h3>
                  <p className="font-sans text-sm text-luxe-charcoal/70">
                    {shippingData.address}
                    <br />
                    {shippingData.city}, {shippingData.postalCode}
                    <br />
                    {shippingData.country}
                  </p>
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="mt-2 font-sans text-sm text-luxe-gold hover:underline"
                  >
                    Modifier
                  </button>
                </div>

                {/* Payment Summary */}
                <div className="border-b border-luxe-charcoal/10 pb-6">
                  <h3 className="font-serif text-xl font-normal text-luxe-black mb-3">
                    Paiement
                  </h3>
                  <p className="font-sans text-sm text-luxe-charcoal/70">{paymentMethod}</p>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="mt-2 font-sans text-sm text-luxe-gold hover:underline"
                  >
                    Modifier
                  </button>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="font-serif text-xl font-normal text-luxe-black mb-4">
                    Articles
                  </h3>
                  <div className="space-y-4">
                    {cart.cartItems.map((item) => (
                      <div
                        key={item._id}
                        className="flex items-center gap-4 pb-4 border-b border-luxe-charcoal/10"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-serif text-base font-normal text-luxe-black">
                            {item.name}
                          </p>
                          <p className="font-sans text-sm text-luxe-charcoal/60">
                            {item.quantity} × {formatPrice(item.price)}
                          </p>
                        </div>
                        <p className="font-serif text-lg font-normal text-luxe-black">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-luxe-charcoal/5 border border-luxe-charcoal/20 text-luxe-charcoal/70">
                    {error}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="btn-luxe-secondary flex-1 !px-4 md:!px-8 !text-sm md:!text-base"
                  >
                    Retour
                  </button>
                  <button
                    onClick={placeOrderHandler}
                    disabled={loading}
                    className="btn-luxe-gold flex-1 !px-4 md:!px-8 !text-sm md:!text-base"
                  >
                    {loading ? (
                      'Traitement...'
                    ) : (
                      <>
                        <span className="hidden sm:inline">Confirmer la Commande</span>
                        <span className="sm:hidden">Confirmer</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-luxe-warm-white border border-luxe-charcoal/10 p-6">
              <h2 className="font-serif text-2xl font-light text-luxe-black mb-6">
                Récapitulatif
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-sans text-sm text-luxe-charcoal/70">
                    Sous-total ({cart.cartItems.reduce((a, c) => a + c.quantity, 0)} articles)
                  </span>
                  <span className="font-serif text-lg font-normal text-luxe-black">
                    {formatPrice(itemsPrice)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-sans text-sm text-luxe-charcoal/70">Livraison</span>
                  <span className="font-serif text-lg font-normal text-luxe-black">
                    {shippingPrice === 0 ? (
                      <span className="text-luxe-gold">Gratuite</span>
                    ) : (
                      formatPrice(shippingPrice)
                    )}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-sans text-sm text-luxe-charcoal/70">TVA</span>
                  <span className="font-serif text-lg font-normal text-luxe-black">
                    {formatPrice(taxPrice)}
                  </span>
                </div>

                <div className="pt-4 border-t border-luxe-charcoal/10">
                  <div className="flex justify-between items-center">
                    <span className="font-sans font-medium text-luxe-black">Total</span>
                    <span className="font-serif text-2xl font-normal text-luxe-black">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                to="/cart"
                className="block text-center font-sans text-sm text-luxe-charcoal/70 hover:text-luxe-gold transition-colors duration-200"
              >
                Modifier le panier
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutScreen;

