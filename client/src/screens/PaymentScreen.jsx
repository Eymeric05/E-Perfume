import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store } from '../context/StoreContext';
import '../styles/screens/PaymentScreen.css';

const PaymentScreen = () => {
    const navigate = useNavigate();
    const { state, dispatch: ctxDispatch } = useContext(Store);
    const {
        cart: { shippingAddress, paymentMethod },
    } = state;

    const [paymentMethodName, setPaymentMethod] = useState(
        paymentMethod || 'Stripe'
    );

    useEffect(() => {
        if (!shippingAddress.address) {
            navigate('/shipping');
        }
    }, [shippingAddress, navigate]);

    const submitHandler = (e) => {
        e.preventDefault();
        ctxDispatch({ type: 'SAVE_PAYMENT_METHOD', payload: paymentMethodName });
        localStorage.setItem('paymentMethod', paymentMethodName);
        navigate('/placeorder');
    };

    return (
        <div className="payment-container">
            <h1>Méthode de Paiement</h1>
            <form onSubmit={submitHandler}>
                <div className="payment-options">
                    <div className="payment-option">
                        <input
                            type="radio"
                            id="Stripe"
                            label="Stripe"
                            value="Stripe"
                            checked={paymentMethodName === 'Stripe'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <label htmlFor="Stripe">Stripe / Carte Bancaire</label>
                    </div>
                    <div className="payment-option">
                        <input
                            type="radio"
                            id="PayPal"
                            label="PayPal"
                            value="PayPal"
                            checked={paymentMethodName === 'PayPal'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <label htmlFor="PayPal">PayPal</label>
                    </div>
                </div>
                <button type="submit" className="btn btn-block">
                    Continuer
                </button>
            </form>
        </div>
    );
};

export default PaymentScreen;
