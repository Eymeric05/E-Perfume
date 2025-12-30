import React, { useContext, useEffect, useReducer, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Store } from '../context/StoreContext';
import { loadStripe } from '@stripe/stripe-js';
import { apiFetch } from '../utils/api';
import {
    Elements,
    CardElement,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';

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
                body: JSON.stringify({ amount: Math.round(order.totalPrice * 100) }),
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
        <form onSubmit={handleSubmit}>
            <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
            <button
                type="submit"
                disabled={!stripe || processing}
                className="btn btn-block"
                style={{ marginTop: '1rem' }}
            >
                {processing ? 'Traitement...' : 'Payer'}
            </button>
            {error && <div style={{ color: 'red', marginTop: '0.5rem' }}>{error}</div>}
        </form>
    );
};

const OrderScreen = () => {
    const { state } = useContext(Store);
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
            const res = await apiFetch('/api/config/stripe');
            const key = await res.text();
            setStripePromise(loadStripe(key));
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

        if (!userInfo) {
            return navigate('/login');
        }
        if (!order._id || successPay || (order._id && order._id !== orderId)) {
            fetchOrder();
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
        <div>Chargement...</div>
    ) : error ? (
        <div style={{ color: 'red' }}>{error}</div>
    ) : (
        <div style={{ padding: '2rem 0' }}>
            <h1 style={{ marginBottom: '1rem' }}>Commande {orderId}</h1>
            <div style={gridStyle}>
                <div style={{ flex: 2 }}>
                    <div style={cardStyle}>
                        <h2>Livraison</h2>
                        <p>
                            <strong>Nom:</strong> {order.user.name} <br />
                            <strong>Email:</strong> {order.user.email} <br />
                            <strong>Adresse:</strong> {order.shippingAddress.address},{' '}
                            {order.shippingAddress.city}, {order.shippingAddress.postalCode},{' '}
                            {order.shippingAddress.country}
                        </p>
                        {order.isDelivered ? (
                            <div style={successStyle}>Livré le {order.deliveredAt.substring(0, 10)}</div>
                        ) : (
                            <div style={dangerStyle}>Non Livré</div>
                        )}
                    </div>

                    <div style={cardStyle}>
                        <h2>Paiement</h2>
                        <p>
                            <strong>Méthode:</strong> {order.paymentMethod}
                        </p>
                        {order.isPaid ? (
                            <div style={successStyle}>Payé le {order.paidAt.substring(0, 10)}</div>
                        ) : (
                            <div style={dangerStyle}>Non Payé</div>
                        )}
                    </div>

                    <div style={cardStyle}>
                        <h2>Articles</h2>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {order.orderItems.map((item) => (
                                <li key={item._id} style={itemStyle}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                                        />
                                        <Link to={`/product/${item.product}`}>{item.name}</Link>
                                    </div>
                                    <div>
                                        {item.qty} x {item.price} € = {item.qty * item.price} €
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div style={{ flex: 1 }}>
                    <div style={cardStyle}>
                        <h2>Résumé</h2>
                        <div style={rowStyle}>
                            <span>Articles</span>
                            <span>{order.itemsPrice.toFixed(2)} €</span>
                        </div>
                        <div style={rowStyle}>
                            <span>Livraison</span>
                            <span>{order.shippingPrice.toFixed(2)} €</span>
                        </div>
                        <div style={rowStyle}>
                            <span>TVA</span>
                            <span>{order.taxPrice.toFixed(2)} €</span>
                        </div>
                        <div style={rowStyle}>
                            <strong>Total</strong>
                            <strong>{order.totalPrice.toFixed(2)} €</strong>
                        </div>
                        {!order.isPaid && stripePromise && (
                            <div style={{ marginTop: '1rem' }}>
                                <Elements stripe={stripePromise}>
                                    <CheckoutForm order={order} handlePaymentSuccess={handlePaymentSuccess} />
                                </Elements>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const gridStyle = {
    display: 'flex',
    gap: '2rem',
    flexWrap: 'wrap',
};

const cardStyle = {
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    padding: '1.5rem',
    background: '#fff',
    marginBottom: '1rem',
};

const itemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem 0',
    borderBottom: '1px solid #eee',
};

const rowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
};

const successStyle = {
    color: '#155724',
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
    padding: '0.75rem 1.25rem',
    marginBottom: '1rem',
    borderRadius: '0.25rem',
};

const dangerStyle = {
    color: '#721c24',
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
    padding: '0.75rem 1.25rem',
    marginBottom: '1rem',
    borderRadius: '0.25rem',
};

export default OrderScreen;
