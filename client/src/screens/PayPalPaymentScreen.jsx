import React, { useEffect, useState, useRef, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { loadPayPalSDK } from '../utils/loadPayPal';
import { Store } from '../context/StoreContext';

const PayPalPaymentScreen = () => {
    const { id: orderId } = useParams();
    const navigate = useNavigate();
    const { state, dispatch: ctxDispatch } = useContext(Store);
    const { userInfo } = state;
    
    const paypalButtonContainerRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [order, setOrder] = useState(null);
    const [paypalReady, setPaypalReady] = useState(false);
    const initializedRef = useRef(false);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await apiFetch(`/api/orders/${orderId}`, {
                    headers: { Authorization: `Bearer ${userInfo.token}` },
                });
                const data = await res.json();
                if (res.ok) {
                    setOrder(data);
                } else {
                    setError('Commande non trouvée');
                    setLoading(false);
                }
            } catch (err) {
                setError('Erreur lors du chargement de la commande');
                setLoading(false);
            }
        };

        if (userInfo && orderId) {
            fetchOrder();
        } else if (!userInfo) {
            navigate('/login');
        }
    }, [orderId, userInfo, navigate]);

    // Charger le SDK PayPal dès que la commande est disponible
    useEffect(() => {
        if (!order || !userInfo || initializedRef.current) {
            return;
        }

        initializedRef.current = true;

        loadPayPalSDK((err) => {
            if (err) {
                setError('Impossible de charger le SDK PayPal: ' + err.message);
                setLoading(false);
                return;
            }

            if (!window.paypal || !window.paypal.Buttons) {
                setError('PayPal SDK non disponible');
                setLoading(false);
                return;
            }

            setPaypalReady(true);
            setLoading(false);
        });
    }, [order, userInfo]);

    // Initialiser les boutons PayPal une fois que le SDK est prêt et le ref est disponible
    useEffect(() => {
        if (!paypalReady || !order || !paypalButtonContainerRef.current) {
            return;
        }

        let paypalButtons = null;

        try {
            paypalButtonContainerRef.current.innerHTML = '';

            paypalButtons = window.paypal.Buttons({
                style: {
                    layout: 'vertical',
                    color: 'gold',
                    shape: 'rect',
                    label: 'paypal'
                },
                createOrder: async () => {
                    try {
                        const createRes = await apiFetch('/api/payment/paypal/create-order', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${userInfo.token}`,
                            },
                            body: JSON.stringify({
                                orderId: orderId,
                            }),
                        });

                        const createData = await createRes.json();

                        if (!createRes.ok) {
                            throw new Error(createData.error || 'Erreur lors de la création de la commande PayPal');
                        }

                        return createData.orderId;
                    } catch (error) {
                        setError('Erreur lors de la création de la commande PayPal: ' + error.message);
                        throw error;
                    }
                },
                onApprove: async (data, actions) => {
                    try {
                        const details = await actions.order.capture();
                        
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

                        if (response.ok) {
                            ctxDispatch({ type: 'CART_CLEAR' });
                            localStorage.removeItem('cartItems');
                            navigate(`/order/${orderId}?success=true`);
                        } else {
                            setError('Erreur lors de la validation de la commande: ' + (responseData.message || 'Erreur inconnue'));
                        }
                    } catch (error) {
                        setError('Erreur lors du paiement: ' + (error.message || 'Une erreur est survenue'));
                    }
                },
                onError: (err) => {
                    setError('Erreur lors de l\'initialisation du paiement PayPal');
                },
                onCancel: () => {
                    navigate(`/order/${orderId}`);
                }
            });

            paypalButtons.render(paypalButtonContainerRef.current);
        } catch (err) {
            setError('Erreur lors de l\'initialisation des boutons PayPal: ' + err.message);
        }

        return () => {
            if (paypalButtons && paypalButtonContainerRef.current) {
                paypalButtonContainerRef.current.innerHTML = '';
            }
        };
    }, [paypalReady, order, userInfo, orderId, navigate, ctxDispatch]);

    if (loading) {
        return (
            <div className="min-h-screen bg-luxe-cream dark:bg-luxe-charcoal flex items-center justify-center">
                <div className="text-center">
                    <div className="text-luxe-black dark:text-luxe-cream text-xl mb-4">Initialisation du paiement PayPal...</div>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxe-gold mx-auto"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-luxe-cream dark:bg-luxe-charcoal flex items-center justify-center">
                <div className="bg-luxe-warm-white dark:bg-luxe-charcoal border border-luxe-charcoal/10 dark:border-luxe-gold/30 p-8 max-w-md">
                    <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
                    <button
                        onClick={() => navigate(`/order/${orderId}`)}
                        className="btn-luxe-secondary w-full"
                    >
                        Retour à la commande
                    </button>
                </div>
            </div>
        );
    }

    if (!order) {
        return null;
    }

    return (
        <div className="min-h-screen bg-luxe-cream dark:bg-luxe-charcoal">
            <div className="max-w-2xl mx-auto px-4 py-12">
                <h1 className="font-serif text-4xl font-light text-luxe-black dark:text-luxe-cream mb-8">
                    Paiement PayPal
                </h1>
                
                <div className="bg-luxe-warm-white dark:bg-luxe-charcoal border border-luxe-charcoal/10 dark:border-luxe-gold/30 p-8 mb-6">
                    <h2 className="font-serif text-2xl font-light text-luxe-black dark:text-luxe-cream mb-4">
                        Résumé de la commande
                    </h2>
                    <div className="space-y-2 mb-6">
                        <div className="flex justify-between">
                            <span className="text-luxe-charcoal/70 dark:text-luxe-cream/70">Articles</span>
                            <span className="text-luxe-black dark:text-luxe-cream">
                                {(() => {
                                    const itemsTotal = order.itemsPrice || order.orderItems?.reduce((sum, item) => {
                                        return sum + (parseFloat(item.price || 0) * parseInt(item.qty || 0));
                                    }, 0) || 0;
                                    return itemsTotal.toFixed(2) + ' €';
                                })()}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-luxe-charcoal/70 dark:text-luxe-cream/70">Livraison</span>
                            <span className="text-luxe-black dark:text-luxe-cream">{(order.shippingPrice || 0).toFixed(2)} €</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-luxe-charcoal/70 dark:text-luxe-cream/70">TVA</span>
                            <span className="text-luxe-black dark:text-luxe-cream">{(order.taxPrice || 0).toFixed(2)} €</span>
                        </div>
                        <div className="flex justify-between pt-4 border-t border-luxe-charcoal/10">
                            <span className="font-medium text-luxe-black dark:text-luxe-cream">Total</span>
                            <span className="font-serif text-2xl text-luxe-black dark:text-luxe-cream">
                                {(order.totalPrice || 0).toFixed(2)} €
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-luxe-warm-white dark:bg-luxe-charcoal border border-luxe-charcoal/10 dark:border-luxe-gold/30 p-8">
                    <h2 className="font-serif text-2xl font-light text-luxe-black dark:text-luxe-cream mb-6">
                        Finaliser le paiement
                    </h2>
                    <div ref={paypalButtonContainerRef} className="min-h-[100px]"></div>
                    <button
                        onClick={() => navigate(`/order/${orderId}`)}
                        className="mt-4 btn-luxe-secondary w-full"
                    >
                        Annuler et retourner à la commande
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PayPalPaymentScreen;
