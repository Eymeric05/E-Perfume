import React, { useContext, useEffect, useReducer, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Store } from '../context/StoreContext';
import { Helmet } from 'react-helmet-async';
import { apiFetch } from '../utils/api';
import { 
  FaSignOutAlt, 
  FaUser, 
  FaEnvelope, 
  FaShoppingBag, 
  FaCheck, 
  FaTimes, 
  FaEye,
  FaCalendarAlt,
  FaCreditCard,
  FaCheckCircle,
  FaExclamationCircle
} from 'react-icons/fa';

function reducer(state, action) {
    switch (action.type) {
        case 'FETCH_REQUEST':
            return { ...state, loading: true };
        case 'FETCH_SUCCESS':
            return { ...state, loading: false, orders: action.payload };
        case 'FETCH_FAIL':
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    }
}

const ProfileScreen = () => {
    const { state, dispatch: ctxDispatch } = useContext(Store);
    const { userInfo } = state;
    const navigate = useNavigate();

    const [{ loading, error, orders }, dispatch] = useReducer(reducer, {
        loading: true,
        error: '',
        orders: [],
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                dispatch({ type: 'FETCH_REQUEST' });
                
                // Récupérer les commandes
                const ordersRes = await apiFetch('/api/orders/myorders', {
                    headers: { Authorization: `Bearer ${userInfo.token}` },
                });
                const ordersData = await ordersRes.json();
                
                // Récupérer le profil pour avoir isVerified à jour
                const profileRes = await apiFetch('/api/users/profile', {
                    headers: { Authorization: `Bearer ${userInfo.token}` },
                });
                if (profileRes.ok) {
                    const profileData = await profileRes.json();
                    // Mettre à jour userInfo avec isVerified
                    const updatedUserInfo = { ...userInfo, ...profileData };
                    ctxDispatch({ type: 'USER_SIGNIN', payload: updatedUserInfo });
                    localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
                }
                
                dispatch({ type: 'FETCH_SUCCESS', payload: ordersData });
            } catch (err) {
                dispatch({ type: 'FETCH_FAIL', payload: err.message });
            }
        };

        if (!userInfo) {
            navigate('/login');
        } else {
            fetchData();
        }
    }, [userInfo, navigate, ctxDispatch]);

    const signoutHandler = () => {
        ctxDispatch({ type: 'USER_SIGNOUT' });
        localStorage.removeItem('userInfo');
        localStorage.removeItem('shippingAddress');
        localStorage.removeItem('paymentMethod');
        window.location.href = '/login';
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
        }).format(price || 0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <div className="min-h-screen bg-luxe-cream dark:bg-luxe-charcoal">
            <Helmet>
                <title>Mon Profil - E-perfume</title>
            </Helmet>

            <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
                {/* Header */}
                <div className="mb-12">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
                        <div>
                            <h1 className="font-serif text-4xl md:text-6xl font-light text-luxe-black dark:text-luxe-cream mb-2">
                                Mon Profil
                            </h1>
                            <p className="font-sans text-sm text-luxe-charcoal/70 dark:text-luxe-cream/70">
                                Gérez vos informations et consultez vos commandes
                            </p>
                        </div>
                        <button
                            onClick={signoutHandler}
                            className="btn-luxe-secondary flex items-center justify-center gap-2 self-start md:self-auto"
                        >
                            <FaSignOutAlt className="w-4 h-4" />
                            Se déconnecter
                        </button>
                    </div>

                    {/* User Info Card */}
                    <div className="bg-luxe-warm-white dark:bg-luxe-charcoal rounded-lg border border-luxe-charcoal/10 dark:border-luxe-cream/10 p-8 mb-8 shadow-sm">
                        <div className="flex items-start gap-6">
                            <div className="w-20 h-20 rounded-full bg-luxe-gold flex items-center justify-center flex-shrink-0">
                                <FaUser className="w-10 h-10 text-luxe-black" />
                            </div>
                            <div className="flex-1">
                                <h2 className="font-serif text-2xl font-normal text-luxe-black mb-2 dark:text-luxe-cream">
                                    {userInfo?.name}
                                </h2>
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-3 text-luxe-charcoal/70 dark:text-luxe-cream">
                                        <FaEnvelope className="w-4 h-4" />
                                        <span className="font-sans text-sm dark:text-luxe-cream">{userInfo?.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        {userInfo?.isVerified ? (
                                            <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
                                                <FaCheckCircle className="w-3 h-3" />
                                                Email vérifié
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-medium">
                                                <FaExclamationCircle className="w-3 h-3" />
                                                Email non vérifié
                                            </span>
                                        )}
                                        {userInfo?.isAdmin && (
                                            <span className="inline-block px-4 py-1 rounded-full bg-luxe-gold text-luxe-black text-xs font-medium tracking-wider uppercase">
                                                Administrateur
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Orders Section */}
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <FaShoppingBag className="w-5 h-5 text-luxe-gold" />
                        <h2 className="font-serif text-3xl font-light text-luxe-black dark:text-luxe-cream">
                            Mes Commandes
                        </h2>
                        {orders.length > 0 && (
                            <span className="px-3 py-1 rounded-full bg-luxe-champagne/30 dark:bg-luxe-champagne/20 text-luxe-charcoal/70 dark:text-luxe-cream/70 text-sm font-sans">
                                {orders.length} {orders.length === 1 ? 'commande' : 'commandes'}
                            </span>
                        )}
                    </div>

                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-luxe-warm-white dark:bg-luxe-charcoal rounded-lg border border-luxe-charcoal/10 dark:border-luxe-cream/10 p-6 animate-pulse">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-3 flex-1">
                                            <div className="h-4 bg-luxe-charcoal/10 dark:bg-luxe-cream/10 rounded w-1/4"></div>
                                            <div className="h-4 bg-luxe-charcoal/10 dark:bg-luxe-cream/10 rounded w-1/3"></div>
                                        </div>
                                        <div className="h-8 bg-luxe-charcoal/10 dark:bg-luxe-cream/10 rounded w-24"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                            <p className="font-sans text-sm text-red-700 dark:text-red-400">{error}</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="bg-luxe-warm-white dark:bg-luxe-charcoal rounded-lg border border-luxe-charcoal/10 dark:border-luxe-cream/10 p-12 text-center">
                            <FaShoppingBag className="w-16 h-16 text-luxe-charcoal/20 dark:text-luxe-cream/20 mx-auto mb-4" />
                            <h3 className="font-serif text-xl font-normal text-luxe-black dark:text-luxe-cream mb-2">
                                Aucune commande
                            </h3>
                            <p className="font-sans text-sm text-luxe-charcoal/70 dark:text-luxe-cream/70 mb-6">
                                Vous n'avez pas encore passé de commande
                            </p>
                            <Link to="/products" className="btn-luxe-gold inline-flex items-center gap-2">
                                Découvrir nos collections
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <div
                                    key={order._id}
                                    className="bg-luxe-warm-white dark:bg-luxe-charcoal rounded-lg border border-luxe-charcoal/10 dark:border-luxe-cream/10 p-6 hover:shadow-lg transition-all duration-300 hover:border-luxe-gold/30 group"
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-center gap-4 flex-wrap">
                                                <div>
                                                    <p className="font-sans text-xs uppercase tracking-wider text-luxe-charcoal/60 dark:text-luxe-cream/60 mb-1">
                                                        Commande
                                                    </p>
                                                    <p className="font-mono text-sm text-luxe-black dark:text-luxe-cream">
                                                        #{order._id.substring(0, 8).toUpperCase()}
                                                    </p>
                                                </div>
                                                <div className="h-8 w-px bg-luxe-charcoal/10 dark:bg-luxe-cream/10"></div>
                                                <div>
                                                    <p className="font-sans text-xs uppercase tracking-wider text-luxe-charcoal/60 dark:text-luxe-cream/60 mb-1">
                                                        Date
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <FaCalendarAlt className="w-3 h-3 text-luxe-charcoal/40 dark:text-luxe-cream/40" />
                                                        <p className="font-sans text-sm text-luxe-black dark:text-luxe-cream">
                                                            {formatDate(order.createdAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="h-8 w-px bg-luxe-charcoal/10 dark:bg-luxe-cream/10"></div>
                                                <div>
                                                    <p className="font-sans text-xs uppercase tracking-wider text-luxe-charcoal/60 dark:text-luxe-cream/60 mb-1">
                                                        Total
                                                    </p>
                                                    <p className="font-serif text-lg font-normal text-luxe-black dark:text-luxe-cream">
                                                        {formatPrice(order.totalPrice)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 flex-wrap">
                                                <div className="flex items-center gap-2">
                                                    {order.isPaid ? (
                                                        <>
                                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs">
                                                                <FaCheck className="w-3 h-3" />
                                                                Payé
                                                            </span>
                                                            {order.paidAt && (
                                                                <span className="font-sans text-xs text-luxe-charcoal/60 dark:text-luxe-cream/60">
                                                                    {formatDate(order.paidAt)}
                                                                </span>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs">
                                                            <FaTimes className="w-3 h-3" />
                                                            Non payé
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {order.isDelivered ? (
                                                        <>
                                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs">
                                                                <FaCheck className="w-3 h-3" />
                                                                Livré
                                                            </span>
                                                            {order.deliveredAt && (
                                                                <span className="font-sans text-xs text-luxe-charcoal/60 dark:text-luxe-cream/60">
                                                                    {formatDate(order.deliveredAt)}
                                                                </span>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs">
                                                            En attente
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => navigate(`/order/${order._id}`)}
                                            className="btn-luxe-gold flex items-center justify-center gap-2 lg:w-auto w-full group-hover:scale-105 transition-transform duration-200"
                                        >
                                            <FaEye className="w-4 h-4" />
                                            Voir les détails
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileScreen;
