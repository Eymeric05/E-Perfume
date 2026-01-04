import React, { useContext, useEffect, useReducer } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store } from '../context/StoreContext';
import { apiFetch } from '../utils/api';
import '../styles/screens/_place-order.scss';

const reducer = (state, action) => {
    switch (action.type) {
        case 'CREATE_REQUEST':
            return { ...state, loading: true };
        case 'CREATE_SUCCESS':
            return { ...state, loading: false };
        case 'CREATE_FAIL':
            return { ...state, loading: false };
        default:
            return state;
    }
};

const PlaceOrderScreen = () => {
    const navigate = useNavigate();
    const [{ loading }, dispatch] = useReducer(reducer, {
        loading: false,
    });
    const { state, dispatch: ctxDispatch } = useContext(Store);
    const { cart, userInfo } = state;

    const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100;
    cart.itemsPrice = round2(
        cart.cartItems.reduce((a, c) => a + c.quantity * c.price, 0)
    );
    cart.shippingPrice = cart.itemsPrice > 100 ? round2(0) : round2(10);
    cart.taxPrice = round2(0.15 * cart.itemsPrice);
    cart.totalPrice = cart.itemsPrice + cart.shippingPrice + cart.taxPrice;

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
                    shippingAddress: cart.shippingAddress,
                    paymentMethod: cart.paymentMethod,
                    itemsPrice: cart.itemsPrice,
                    shippingPrice: cart.shippingPrice,
                    taxPrice: cart.taxPrice,
                    totalPrice: cart.totalPrice,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                // Si la méthode de paiement est Stripe, créer une session Checkout
                if (cart.paymentMethod === 'Stripe') {
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
                            // Rediriger vers Stripe Checkout
                            window.location.href = stripeData.url;
                            return;
                        } else {
                            throw new Error(stripeData.error || 'Erreur lors de la création de la session Stripe');
                        }
                    } catch (stripeErr) {
                        console.error('Erreur Stripe:', stripeErr);
                        dispatch({ type: 'CREATE_FAIL' });
                        alert('Erreur lors de l\'initialisation du paiement: ' + (stripeErr.message || stripeErr));
                        return;
                    }
                } else if (cart.paymentMethod === 'PayPal') {
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
                dispatch({ type: 'CREATE_FAIL' });
                alert('Erreur lors de la création de la commande');
            }

        } catch (err) {
            dispatch({ type: 'CREATE_FAIL' });
            alert('Erreur lors de la création de la commande: ' + err.message);
        }
    };

    useEffect(() => {
        if (!cart.paymentMethod) {
            navigate('/payment');
        }
    }, [cart, navigate]);

    return (
        <div className="place-order-container">
            <h1>Récapitulatif de la Commande</h1>
            <div className="place-order-grid">
                <div className="place-order-main">
                    <div className="place-order-card">
                        <h2>Livraison</h2>
                        <p>
                            <strong>Nom:</strong> {userInfo.name} <br />
                            <strong>Adresse:</strong> {cart.shippingAddress.address},{' '}
                            {cart.shippingAddress.city}, {cart.shippingAddress.postalCode},{' '}
                            {cart.shippingAddress.country}
                        </p>
                        <Link to="/shipping">Modifier</Link>
                    </div>

                    <div className="place-order-card">
                        <h2>Paiement</h2>
                        <p>
                            <strong>Méthode:</strong> {cart.paymentMethod}
                        </p>
                        <Link to="/payment">Modifier</Link>
                    </div>

                    <div className="place-order-card">
                        <h2>Articles</h2>
                        <ul className="place-order-items-list">
                            {cart.cartItems.map((item) => (
                                <li key={item._id} className="place-order-item">
                                    <div className="place-order-item-content">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="place-order-item-image"
                                        />
                                        <Link to={`/product/${item._id}`}>{item.name}</Link>
                                    </div>
                                    <div>
                                        {item.quantity} x {item.price} € = {item.quantity * item.price} €
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <Link to="/cart">Modifier</Link>
                    </div>
                </div>

                <div className="place-order-sidebar">
                    <div className="place-order-summary">
                        <h2>Résumé</h2>
                        <div className="place-order-summary-item">
                            <span>Articles</span>
                            <span>{cart.itemsPrice.toFixed(2)} €</span>
                        </div>
                        <div className="place-order-summary-item">
                            <span>Livraison</span>
                            <span>{cart.shippingPrice.toFixed(2)} €</span>
                        </div>
                        <div className="place-order-summary-item">
                            <span>TVA</span>
                            <span>{cart.taxPrice.toFixed(2)} €</span>
                        </div>
                        <div className="place-order-summary-item">
                            <strong>Total</strong>
                            <strong>{cart.totalPrice.toFixed(2)} €</strong>
                        </div>
                        <button
                            type="button"
                            className="btn btn-block"
                            onClick={placeOrderHandler}
                            disabled={cart.cartItems.length === 0 || loading}
                        >
                            {loading ? 'Chargement...' : 'Commander'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlaceOrderScreen;
