import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store } from '../context/StoreContext';
import '../styles/screens/ShippingScreen.css';

const ShippingScreen = () => {
    const navigate = useNavigate();
    const { state, dispatch: ctxDispatch } = useContext(Store);
    const {
        userInfo,
        cart: { shippingAddress },
    } = state;

    const [address, setAddress] = useState(shippingAddress.address || '');
    const [city, setCity] = useState(shippingAddress.city || '');
    const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || '');
    const [country, setCountry] = useState(shippingAddress.country || '');

    useEffect(() => {
        if (!userInfo) {
            navigate('/login?redirect=/shipping');
        }
    }, [userInfo, navigate]);

    const submitHandler = (e) => {
        e.preventDefault();
        ctxDispatch({
            type: 'SAVE_SHIPPING_ADDRESS',
            payload: {
                address,
                city,
                postalCode,
                country,
            },
        });
        localStorage.setItem(
            'shippingAddress',
            JSON.stringify({
                address,
                city,
                postalCode,
                country,
            })
        );
        navigate('/payment');
    };

    return (
        <div className="shipping-container">
            <h1>Adresse de Livraison</h1>
            <form onSubmit={submitHandler}>
                <div className="shipping-form-group">
                    <label htmlFor="address" className="shipping-label">Adresse</label>
                    <input
                        type="text"
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="shipping-input"
                        required
                    />
                </div>
                <div className="shipping-form-group">
                    <label htmlFor="city" className="shipping-label">Ville</label>
                    <input
                        type="text"
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="shipping-input"
                        required
                    />
                </div>
                <div className="shipping-form-group">
                    <label htmlFor="postalCode" className="shipping-label">Code Postal</label>
                    <input
                        type="text"
                        id="postalCode"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="shipping-input"
                        required
                    />
                </div>
                <div className="shipping-form-group">
                    <label htmlFor="country" className="shipping-label">Pays</label>
                    <input
                        type="text"
                        id="country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="shipping-input"
                        required
                    />
                </div>
                <button type="submit" className="btn btn-block">
                    Continuer
                </button>
            </form>
        </div>
    );
};

export default ShippingScreen;
