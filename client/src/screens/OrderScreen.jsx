import React, { useContext, useEffect, useReducer, useState, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Store } from '../context/StoreContext';
import { loadStripe } from '@stripe/stripe-js';
import { apiFetch } from '../utils/api';
import { loadPayPalSDK } from '../utils/loadPayPal';
import {
    Elements,
    CardElement,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';
import '../styles/screens/_order.scss';

function reducer(state, action) {
    switch (action.type) {
        case 'FETCH_REQUEST':
            return { ...state, loading: true, error: '' };
        case 'FETCH_SUCCESS':
            return { ...state, loading: false, order: action.payload, error: '' };
        case 'FETCH_FAIL':
            return { ...state, loading: false, error: action.payload };
        case 'PAY_REQUEST':
            return { ...state, loadingPay: true };
        case 'PAY_SUCCESS':
            return { ...state, loadingPay: false, successPay: true };
        case 'PAY_FAIL':
            return { ...state, loadingPay: false, errorPay: action.payload };
        case 'PAY_RESET':
            return { ...state, loadingPay: false, successPay: false };
        default:
            return state;
    }
}

const PayPalButton = ({ order, orderId, onPaymentSuccess, userInfo, ctxDispatch }) => {
    const paypalButtonContainerRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sdkLoaded, setSdkLoaded] = useState(false);

    useEffect(() => {
        // Charger le SDK PayPal dynamiquement
        loadPayPalSDK((err) => {
            if (err) {
                console.error('Erreur lors du chargement du SDK PayPal:', err);
                setError('Impossible de charger le SDK PayPal. Veuillez recharger la page.');
                setLoading(false);
                return;
            }
            
            if (window.paypal && window.paypal.Buttons) {
                setSdkLoaded(true);
                setLoading(false);
            } else {
                setError('PayPal SDK non disponible. Veuillez recharger la page.');
                setLoading(false);
            }
        });
    }, []);

    useEffect(() => {
        // Ne pas continuer si le SDK n'est pas chargé ou si le conteneur n'existe pas
        if (!sdkLoaded || !window.paypal || !paypalButtonContainerRef.current) {
            return;
        }

        let paypalButtons = null;

        const renderPayPalButtons = async () => {
            try {
                setLoading(true);

                // Vider le conteneur avant de créer de nouveaux boutons
                if (paypalButtonContainerRef.current) {
                    paypalButtonContainerRef.current.innerHTML = '';
                }

                paypalButtons = window.paypal.Buttons({
                    style: {
                        layout: 'vertical',
                        color: 'gold',
                        shape: 'rect',
                        label: 'paypal'
                    },
                    createOrder: async (data, actions) => {
                        try {
                            // Créer une commande PayPal côté serveur
                            const createRes = await apiFetch('/api/payment/paypal/create-order', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${userInfo.token}`,
                                },
                                body: JSON.stringify({
                                    items: order.orderItems.map(item => ({
                                        name: item.name,
                                        price: parseFloat(item.price || 0),
                                        quantity: parseInt(item.qty || 1),
                                        brand: item.brand || ''
                                    })),
                                    orderId: orderId,
                                }),
                            });

                            const createData = await createRes.json();

                            if (!createRes.ok) {
                                throw new Error(createData.error || 'Erreur lors de la création de la commande PayPal');
                            }

                            // Retourner l'orderId PayPal
                            return createData.orderId;
                        } catch (error) {
                            console.error('Erreur lors de la création de la commande PayPal:', error);
                            throw error;
                        }
                    },
                    onApprove: async (data, actions) => {
                        try {
                            console.log('PayPal onApprove appelé, orderID:', data.orderID);
                            
                            // 1. Le paiement est validé par PayPal - capturer la commande
                            const details = await actions.order.capture();
                            console.log('Paiement PayPal capturé:', details);
                            
                            // 2. On prévient notre serveur Render pour mettre à jour la BDD
                            const response = await apiFetch(`/api/orders/${orderId}/pay`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${userInfo.token}`
                                },
                                body: JSON.stringify({
                                    id: details.id,
                                    status: details.status,
                                    update_time: details.update_time || new Date().toISOString(),
                                    email_address: details.payer?.email_address || details.payer?.payer_info?.email || '',
                                }),
                            });

                            const responseData = await response.json();
                            console.log('Réponse serveur:', responseData);

                            if (response.ok) {
                                // 3. C'est ici que tu peux vider le panier et rediriger
                                ctxDispatch({ type: 'CART_CLEAR' });
                                localStorage.removeItem('cartItems');
                                
                                // Appeler la fonction de succès pour mettre à jour l'état
                                if (onPaymentSuccess) {
                                    onPaymentSuccess(responseData);
                                }
                                
                                // Recharger la page pour afficher le statut mis à jour
                                window.location.href = `/order/${orderId}?success=true&paypal_order_id=${details.id}`;
                            } else {
                                alert('Erreur lors de la validation de la commande: ' + (responseData.message || 'Erreur inconnue'));
                            }
                        } catch (error) {
                            console.error('Erreur lors de la capture PayPal:', error);
                            alert('Erreur lors du paiement: ' + (error.message || 'Une erreur est survenue'));
                        }
                    },
                    onError: (err) => {
                        console.error('Erreur PayPal:', err);
                        alert('Erreur lors de l\'initialisation du paiement PayPal');
                    },
                    onCancel: () => {
                        console.log('Paiement PayPal annulé');
                    }
                });

                if (paypalButtonContainerRef.current) {
                    paypalButtons.render(paypalButtonContainerRef.current);
                }
            } catch (error) {
                console.error('Erreur lors du rendu des boutons PayPal:', error);
                setError('Erreur lors du chargement de PayPal. Veuillez recharger la page.');
                if (paypalButtonContainerRef.current) {
                    paypalButtonContainerRef.current.innerHTML = 
                        '<div style="color: red; padding: 10px; text-align: center;">Erreur lors du chargement de PayPal. Veuillez recharger la page.</div>';
                }
            } finally {
                setLoading(false);
            }
        };

        renderPayPalButtons();

        return () => {
            if (paypalButtons) {
                paypalButtons.close();
            }
        };
    }, [order, orderId, userInfo, ctxDispatch, onPaymentSuccess, sdkLoaded]);

    if (error) {
        return (
            <div style={{ padding: '20px', textAlign: 'center', border: '1px solid', borderRadius: '4px' }} className="text-red-600 dark:text-red-400 border-red-600 dark:border-red-400">
                {error}
            </div>
        );
    }

    if (loading) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }} className="text-luxe-black dark:text-luxe-cream">
                <div>Chargement de PayPal...</div>
                <div style={{ marginTop: '10px', fontSize: '14px' }} className="text-luxe-charcoal/70 dark:text-luxe-cream/70">
                    Veuillez patienter pendant que nous initialisons le paiement sécurisé
                </div>
            </div>
        );
    }

    return (
        <div>
            <div ref={paypalButtonContainerRef} style={{ minHeight: '50px' }}></div>
            {!loading && !error && paypalButtonContainerRef.current && paypalButtonContainerRef.current.children.length === 0 && (
                <div style={{ padding: '10px', textAlign: 'center', fontSize: '14px' }} className="text-luxe-charcoal/70 dark:text-luxe-cream/70">
                    Le bouton PayPal devrait apparaître ici. Si ce n'est pas le cas, rechargez la page.
                </div>
            )}
        </div>
    );
};

const CheckoutForm = ({ order, handlePaymentSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setProcessing(true);

        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: elements.getElement(CardElement),
        });

        if (error) {
            setError(error.message);
            setProcessing(false);
        } else {
            // Create PaymentIntent on backend
            const res = await apiFetch('/api/payment/create-payment-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: Math.round((order.totalPrice || 0) * 100) }),
            });
            const { clientSecret } = await res.json();

            const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(
                clientSecret,
                {
                    payment_method: paymentMethod.id,
                }
            );

            if (confirmError) {
                setError(confirmError.message);
                setProcessing(false);
            } else {
                if (paymentIntent.status === 'succeeded') {
                    handlePaymentSuccess(paymentIntent);
                }
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="checkout-form">
            <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
            <button
                type="submit"
                disabled={!stripe || processing}
                className="btn btn-block checkout-button"
            >
                {processing ? 'Traitement...' : 'Payer'}
            </button>
            {error && <div className="checkout-error">{error}</div>}
        </form>
    );
};

const OrderScreen = () => {
    const { state, dispatch: ctxDispatch } = useContext(Store);
    const { userInfo } = state;
    const params = useParams();
    const { id: orderId } = params;
    const navigate = useNavigate();

    const [{ loading, error, order, successPay, loadingPay }, dispatch] = useReducer(reducer, {
        loading: true,
        order: {},
        error: '',
        successPay: false,
        loadingPay: false,
    });

    const [stripePromise, setStripePromise] = useState(null);

    useEffect(() => {
        const fetchStripeKey = async () => {
            try {
                const res = await apiFetch('/api/config/stripe');
                const key = await res.text();
                if (key && key.trim()) {
                    setStripePromise(loadStripe(key.trim()));
                }
            } catch (err) {
                console.error('Erreur lors de la récupération de la clé Stripe:', err);
            }
        };
        fetchStripeKey();
    }, []);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                dispatch({ type: 'FETCH_REQUEST' });
                const res = await apiFetch(`/api/orders/${orderId}`, {
                    headers: { Authorization: `Bearer ${userInfo.token}` },
                });
                const data = await res.json();
                if (res.ok) {
                    dispatch({ type: 'FETCH_SUCCESS', payload: data });
                } else {
                    dispatch({ type: 'FETCH_FAIL', payload: data.message });
                }
            } catch (err) {
                dispatch({ type: 'FETCH_FAIL', payload: err.message });
            }
        };

        const verifyPayment = async () => {
            try {
                // Vérifier si on vient de Stripe avec success
                const urlParams = new URLSearchParams(window.location.search);
                const sessionId = urlParams.get('session_id');
                const paypalOrderId = urlParams.get('paypal_order_id');

                if (sessionId) {
                    // Vérifier le paiement Stripe
                    const res = await apiFetch('/api/payment/verify-payment', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${userInfo.token}`,
                        },
                        body: JSON.stringify({ sessionId, orderId }),
                    });
                    const data = await res.json();
                    
                    if (data.isPaid) {
                        // Vider le panier après paiement réussi
                        ctxDispatch({ type: 'CART_CLEAR' });
                        localStorage.removeItem('cartItems');
                        // Recharger la commande
                        await fetchOrder();
                        // Nettoyer l'URL
                        window.history.replaceState({}, '', `/order/${orderId}`);
                    }
                } else if (paypalOrderId) {
                    // Vérifier le paiement PayPal
                    const res = await apiFetch('/api/payment/paypal/verify-payment', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${userInfo.token}`,
                        },
                        body: JSON.stringify({ paypalOrderId, orderId }),
                    });
                    const data = await res.json();
                    
                    if (data.isPaid) {
                        // Vider le panier après paiement réussi
                        ctxDispatch({ type: 'CART_CLEAR' });
                        localStorage.removeItem('cartItems');
                        // Recharger la commande
                        await fetchOrder();
                        // Nettoyer l'URL
                        window.history.replaceState({}, '', `/order/${orderId}`);
                    }
                }
            } catch (err) {
                console.error('Erreur lors de la vérification du paiement:', err);
            }
        };

        if (!userInfo) {
            return navigate('/login');
        }
        if (!order._id || successPay || (order._id && order._id !== orderId)) {
            fetchOrder().then(() => {
                // Vérifier le paiement après avoir chargé la commande
                const urlParams = new URLSearchParams(window.location.search);
                const success = urlParams.get('success');
                
                if (success === 'true') {
                    verifyPayment();
                }
            });
            if (successPay) {
                dispatch({ type: 'PAY_RESET' });
            }
        }
    }, [order, userInfo, orderId, navigate, successPay]);

    const handlePaymentSuccess = async (paymentResult) => {
        try {
            dispatch({ type: 'PAY_REQUEST' });
            const res = await apiFetch(`/api/orders/${orderId}/pay`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`,
                },
                body: JSON.stringify(paymentResult),
            });
            const data = await res.json();
            if (res.ok) {
                dispatch({ type: 'PAY_SUCCESS', payload: data });
                alert('Payment Successful');
            } else {
                dispatch({ type: 'PAY_FAIL', payload: data.message });
                alert('Payment Failed');
            }
        } catch (err) {
            dispatch({ type: 'PAY_FAIL', payload: err.message });
            alert('Payment Failed');
        }
    };

    return loading ? (
        <div className="text-center py-20 text-luxe-black dark:text-luxe-cream">Chargement...</div>
    ) : error ? (
        <div className="order-error">{error}</div>
    ) : (
        <div className="order-container">
            <h1 className="text-luxe-black dark:text-luxe-cream">Commande {orderId}</h1>
            <div className="order-grid">
                <div className="order-main">
                    <div className="order-card">
                        <h2>Livraison</h2>
                        <p>
                            <strong>Nom:</strong> {order.user?.name || 'N/A'} <br />
                            <strong>Email:</strong> {order.user?.email || 'N/A'} <br />
                            <strong>Adresse:</strong> {order.shippingAddress?.address || 'N/A'},{' '}
                            {order.shippingAddress?.city || 'N/A'}, {order.shippingAddress?.postalCode || 'N/A'},{' '}
                            {order.shippingAddress?.country || 'N/A'}
                        </p>
                        {order.isDelivered ? (
                            <div className="order-status-success">Livré le {order.deliveredAt?.substring(0, 10) || 'N/A'}</div>
                        ) : (
                            <div className="order-status-danger">Non Livré</div>
                        )}
                    </div>

                    <div className="order-card">
                        <h2>Paiement</h2>
                        <p>
                            <strong>Méthode:</strong> {order.paymentMethod || 'N/A'}
                        </p>
                        {order.isPaid ? (
                            <div className="order-status-success">Payé le {order.paidAt?.substring(0, 10) || 'N/A'}</div>
                        ) : (
                            <div className="order-status-danger">Non Payé</div>
                        )}
                    </div>

                    <div className="order-card">
                        <h2>Articles</h2>
                        <ul className="order-items-list">
                            {order.orderItems?.map((item) => (
                                <li key={item._id} className="order-item">
                                    <div className="order-item-content">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="order-item-image"
                                        />
                                        <Link to={`/product/${item.product}`}>{item.name}</Link>
                                    </div>
                                    <div>
                                        {item.qty} x {(item.price || 0).toFixed(2)} € = {((item.qty || 0) * (item.price || 0)).toFixed(2)} €
                                    </div>
                                </li>
                            )) || <li>Aucun article</li>}
                        </ul>
                    </div>
                </div>

                <div className="order-sidebar">
                    <div className="order-summary">
                        <h2>Résumé</h2>
                        <div className="order-summary-item">
                            <span>Articles</span>
                            <span>{(order.itemsPrice || 0).toFixed(2)} €</span>
                        </div>
                        <div className="order-summary-item">
                            <span>Livraison</span>
                            <span>{(order.shippingPrice || 0).toFixed(2)} €</span>
                        </div>
                        <div className="order-summary-item">
                            <span>TVA</span>
                            <span>{(order.taxPrice || 0).toFixed(2)} €</span>
                        </div>
                        <div className="order-summary-item">
                            <strong>Total</strong>
                            <strong>{(order.totalPrice || 0).toFixed(2)} €</strong>
                        </div>
                        {!order.isPaid && (
                            <div className="checkout-button">
                                {(() => {
                                    const urlParams = new URLSearchParams(window.location.search);
                                    const isPayPal = urlParams.get('paypal') === 'true' || order.paymentMethod === 'PayPal';
                                    
                                    if (isPayPal) {
                                        return (
                                            <PayPalButton 
                                                order={order} 
                                                orderId={orderId}
                                                onPaymentSuccess={handlePaymentSuccess}
                                                userInfo={userInfo}
                                                ctxDispatch={ctxDispatch}
                                            />
                                        );
                                    } else if (stripePromise && order.paymentMethod === 'Stripe') {
                                        return (
                                            <Elements stripe={stripePromise}>
                                                <CheckoutForm order={order} handlePaymentSuccess={handlePaymentSuccess} />
                                            </Elements>
                                        );
                                    }
                                    return null;
                                })()}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderScreen;
