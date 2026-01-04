import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store } from '../context/StoreContext';
import { shippingAddressSchema } from '../schemas/validationSchemas';
import { safeValidateForm } from '../utils/formValidation';
import '../styles/screens/_shipping.scss';

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
    const [country, setCountry] = useState(shippingAddress.country || 'France');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!userInfo) {
            navigate('/login?redirect=/shipping');
        }
    }, [userInfo, navigate]);

    const submitHandler = (e) => {
        e.preventDefault();
        setErrors({});

        // Validation avec Zod
        const validation = safeValidateForm(shippingAddressSchema, {
            address,
            city,
            postalCode,
            country,
        });

        if (!validation.success) {
            setErrors(validation.errors);
            return;
        }

        // Si la validation réussit, sauvegarder et continuer
        ctxDispatch({
            type: 'SAVE_SHIPPING_ADDRESS',
            payload: validation.data,
        });
        localStorage.setItem(
            'shippingAddress',
            JSON.stringify(validation.data)
        );
        navigate('/payment');
    };

    return (
        <div className="shipping-container">
            <h1>Adresse de Livraison</h1>
            <form onSubmit={submitHandler}>
                <div className="shipping-form-group">
                    <label htmlFor="address" className="shipping-label dark:text-luxe-cream/70">Adresse</label>
                    <input
                        type="text"
                        id="address"
                        value={address}
                        onChange={(e) => {
                            setAddress(e.target.value);
                            if (errors.address) setErrors({ ...errors, address: undefined });
                        }}
                        className={`shipping-input ${errors.address ? 'border-red-500' : ''}`}
                        required
                    />
                    {errors.address && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.address}</p>
                    )}
                </div>
                <div className="shipping-form-group">
                    <label htmlFor="city" className="shipping-label dark:text-luxe-cream/70">Ville</label>
                    <input
                        type="text"
                        id="city"
                        value={city}
                        onChange={(e) => {
                            setCity(e.target.value);
                            if (errors.city) setErrors({ ...errors, city: undefined });
                        }}
                        className={`shipping-input ${errors.city ? 'border-red-500' : ''}`}
                        required
                    />
                    {errors.city && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.city}</p>
                    )}
                </div>
                <div className="shipping-form-group">
                    <label htmlFor="postalCode" className="shipping-label dark:text-luxe-cream/70">Code Postal</label>
                    <input
                        type="text"
                        id="postalCode"
                        value={postalCode}
                        onChange={(e) => {
                            setPostalCode(e.target.value);
                            if (errors.postalCode) setErrors({ ...errors, postalCode: undefined });
                        }}
                        className={`shipping-input ${errors.postalCode ? 'border-red-500' : ''}`}
                        required
                    />
                    {errors.postalCode && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.postalCode}</p>
                    )}
                </div>
                <div className="shipping-form-group">
                    <label htmlFor="country" className="shipping-label dark:text-luxe-cream/70">Pays</label>
                    <input
                        type="text"
                        id="country"
                        value={country}
                        onChange={(e) => {
                            setCountry(e.target.value);
                            if (errors.country) setErrors({ ...errors, country: undefined });
                        }}
                        className={`shipping-input ${errors.country ? 'border-red-500' : ''}`}
                        required
                    />
                    {errors.country && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.country}</p>
                    )}
                </div>
                <button type="submit" className="btn btn-block">
                    Continuer
                </button>
            </form>
        </div>
    );
};

export default ShippingScreen;
