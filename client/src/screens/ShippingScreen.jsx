import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store } from '../context/StoreContext';

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
        <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
            <h1 style={{ marginBottom: '1rem' }}>Adresse de Livraison</h1>
            <form onSubmit={submitHandler}>
                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="address" style={{ display: 'block', marginBottom: '0.5rem' }}>Adresse</label>
                    <input
                        type="text"
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        style={inputStyle}
                        required
                    />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="city" style={{ display: 'block', marginBottom: '0.5rem' }}>Ville</label>
                    <input
                        type="text"
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        style={inputStyle}
                        required
                    />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="postalCode" style={{ display: 'block', marginBottom: '0.5rem' }}>Code Postal</label>
                    <input
                        type="text"
                        id="postalCode"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        style={inputStyle}
                        required
                    />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="country" style={{ display: 'block', marginBottom: '0.5rem' }}>Pays</label>
                    <input
                        type="text"
                        id="country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        style={inputStyle}
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

const inputStyle = {
    width: '100%',
    padding: '0.8rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
};

export default ShippingScreen;
