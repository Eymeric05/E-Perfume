import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store } from '../context/StoreContext';
import '../styles/screens/_payment.scss';

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
                    <div className={`payment-option ${paymentMethodName === 'Stripe' ? 'selected' : ''}`}>
                        <input
                            type="radio"
                            id="Stripe"
                            label="Stripe"
                            value="Stripe"
                            checked={paymentMethodName === 'Stripe'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <label htmlFor="Stripe" style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                            <img 
                                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/stripe/stripe-original.svg" 
                                alt="Stripe" 
                                style={{ width: '48px', height: '32px', objectFit: 'contain' }}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                            <span>Stripe / Carte Bancaire</span>
                        </label>
                    </div>
                    <div className={`payment-option ${paymentMethodName === 'PayPal' ? 'selected' : ''}`}>
                        <input
                            type="radio"
                            id="PayPal"
                            label="PayPal"
                            value="PayPal"
                            checked={paymentMethodName === 'PayPal'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <label htmlFor="PayPal" style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                            <img 
                                src="https://www.paypalobjects.com/webstatic/mktg/logo-center/PP_Acceptance_Marks_for_LogoCenter_76x48.png" 
                                alt="PayPal" 
                                style={{ width: '80px', height: '32px', objectFit: 'contain' }}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                            <span>PayPal</span>
                        </label>
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
