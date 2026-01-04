import React, { useContext, useEffect } from 'react';
import { Store } from '../context/StoreContext';

const LogoutScreen = () => {
    const { dispatch: ctxDispatch } = useContext(Store);

    useEffect(() => {
        // Effectuer la déconnexion
        ctxDispatch({ type: 'USER_SIGNOUT' });
        localStorage.removeItem('userInfo');
        localStorage.removeItem('shippingAddress');
        localStorage.removeItem('paymentMethod');
        
        // Rediriger vers la page d'accueil avec un rechargement complet pour éviter les problèmes d'état
        window.location.href = '/';
    }, [ctxDispatch]);

    return null;
};

export default LogoutScreen;

