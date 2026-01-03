import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store } from '../context/StoreContext';

const LogoutScreen = () => {
    const { dispatch: ctxDispatch } = useContext(Store);
    const navigate = useNavigate();

    useEffect(() => {
        // Effectuer la déconnexion
        ctxDispatch({ type: 'USER_SIGNOUT' });
        localStorage.removeItem('userInfo');
        localStorage.removeItem('shippingAddress');
        localStorage.removeItem('paymentMethod');
        
        // Rediriger vers la page de connexion
        navigate('/login');
    }, [ctxDispatch, navigate]);

    return null;
};

export default LogoutScreen;

