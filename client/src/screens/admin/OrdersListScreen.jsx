import React, { useContext, useEffect, useReducer, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store } from '../../context/StoreContext';
import AdminLayout from '../../components/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FaEye, FaCheck, FaTimes, FaSearch } from 'react-icons/fa';
import { apiFetch } from '../../utils/api';

const reducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_REQUEST':
            return { ...state, loading: true };
        case 'FETCH_SUCCESS':
            return { ...state, loading: false, orders: action.payload };
        case 'FETCH_FAIL':
            return { ...state, loading: false, error: action.payload };
        case 'UPDATE_REQUEST':
            return { ...state, loadingUpdate: true };
        case 'UPDATE_SUCCESS':
            return { ...state, loadingUpdate: false };
        case 'UPDATE_FAIL':
            return { ...state, loadingUpdate: false };
        default:
            return state;
    }
};

const OrdersListScreen = () => {
    const navigate = useNavigate();
    const { state } = useContext(Store);
    const { userInfo } = state;
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const [{ loading, error, orders, loadingUpdate }, dispatch] = useReducer(reducer, {
        loading: true,
        error: '',
        orders: [],
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                dispatch({ type: 'FETCH_REQUEST' });
                const res = await apiFetch('/api/orders', {
                    headers: {
                        Authorization: `Bearer ${userInfo.token}`,
                    },
                });
                const data = await res.json();
                const ordersArray = Array.isArray(data) ? data : [];
                dispatch({ type: 'FETCH_SUCCESS', payload: ordersArray });
            } catch (err) {
                dispatch({ type: 'FETCH_FAIL', payload: err.message });
            }
        };
        if (userInfo) {
            fetchData();
        }
    }, [userInfo]);

    const updateOrderStatus = async (orderId, status) => {
        try {
            dispatch({ type: 'UPDATE_REQUEST' });
            await fetch(`/api/orders/${orderId}/${status}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            });
            dispatch({ type: 'UPDATE_SUCCESS' });
            // Refresh orders
            const res = await apiFetch('/api/orders', {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            });
            const data = await res.json();
            dispatch({ type: 'FETCH_SUCCESS', payload: data });
        } catch (err) {
            dispatch({ type: 'UPDATE_FAIL' });
            alert('Erreur lors de la mise à jour de la commande');
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
        }).format(price || 0);
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const filteredOrders = (orders || []).filter((order) => {
        const matchesSearch =
            !searchTerm ||
            order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.user && order.user.name && order.user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (order.user && order.user.email && order.user.email.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus =
            filterStatus === 'all' ||
            (filterStatus === 'paid' && order.isPaid) ||
            (filterStatus === 'unpaid' && !order.isPaid) ||
            (filterStatus === 'delivered' && order.isDelivered) ||
            (filterStatus === 'pending' && !order.isDelivered && order.isPaid);

        return matchesSearch && matchesStatus;
    });

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="font-serif text-4xl md:text-5xl font-light text-luxe-black mb-2">
                        Commandes
                    </h1>
                    <p className="font-sans text-sm text-luxe-charcoal/70">
                        {filteredOrders.length} {filteredOrders.length === 1 ? 'commande' : 'commandes'}
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-luxe-charcoal/40 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Rechercher une commande..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-luxe pl-11 w-full"
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="input-luxe w-full md:w-auto"
                    >
                        <option value="all">Toutes les commandes</option>
                        <option value="unpaid">Non payées</option>
                        <option value="paid">Payées</option>
                        <option value="pending">En attente</option>
                        <option value="delivered">Livrées</option>
                    </select>
                </div>

                {/* Loading States */}
                {loadingUpdate && (
                    <div className="p-4 bg-luxe-champagne/30 border border-luxe-gold/30 rounded-lg">
                        <p className="font-sans text-sm text-luxe-black">Mise à jour en cours...</p>
                    </div>
                )}

                {/* Orders Table */}
                {loading ? (
                    <LoadingSpinner text="Chargement des commandes..." />
                ) : error ? (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="font-sans text-sm text-red-700">{error}</p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="font-sans text-lg text-luxe-charcoal/70">
                            Aucune commande trouvée
                        </p>
                    </div>
                ) : (
                    <div className="bg-luxe-warm-white rounded-lg border border-luxe-charcoal/10 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-luxe-champagne/20">
                                    <tr>
                                        <th className="text-left px-6 py-4 font-sans text-xs uppercase tracking-wider text-luxe-charcoal/70">
                                            ID
                                        </th>
                                        <th className="text-left px-6 py-4 font-sans text-xs uppercase tracking-wider text-luxe-charcoal/70">
                                            Client
                                        </th>
                                        <th className="text-left px-6 py-4 font-sans text-xs uppercase tracking-wider text-luxe-charcoal/70">
                                            Date
                                        </th>
                                        <th className="text-left px-6 py-4 font-sans text-xs uppercase tracking-wider text-luxe-charcoal/70">
                                            Total
                                        </th>
                                        <th className="text-left px-6 py-4 font-sans text-xs uppercase tracking-wider text-luxe-charcoal/70">
                                            Payé
                                        </th>
                                        <th className="text-left px-6 py-4 font-sans text-xs uppercase tracking-wider text-luxe-charcoal/70">
                                            Livré
                                        </th>
                                        <th className="text-right px-6 py-4 font-sans text-xs uppercase tracking-wider text-luxe-charcoal/70">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-luxe-charcoal/10">
                                    {filteredOrders.map((order) => (
                                        <tr key={order._id} className="hover:bg-luxe-champagne/10 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-mono text-xs text-luxe-charcoal/70">
                                                    {order._id.substring(0, 8)}...
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-sans text-sm text-luxe-black">
                                                    {order.user?.name || 'N/A'}
                                                </p>
                                                <p className="font-sans text-xs text-luxe-charcoal/60">
                                                    {order.user?.email || 'N/A'}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-sans text-sm text-luxe-charcoal/70">
                                                    {formatDate(order.createdAt)}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-serif text-base text-luxe-black">
                                                    {formatPrice(order.totalPrice)}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                {order.isPaid ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs">
                                                        <FaCheck className="w-3 h-3" />
                                                        Payé
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs">
                                                        <FaTimes className="w-3 h-3" />
                                                        Non payé
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {order.isDelivered ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs">
                                                        <FaCheck className="w-3 h-3" />
                                                        Livré
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs">
                                                        En attente
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => navigate(`/order/${order._id}`)}
                                                        className="p-2 text-luxe-gold hover:bg-luxe-champagne/30 rounded transition-colors"
                                                        title="Voir les détails"
                                                    >
                                                        <FaEye className="w-4 h-4" />
                                                    </button>
                                                    {!order.isDelivered && order.isPaid && (
                                                        <button
                                                            onClick={() => updateOrderStatus(order._id, 'deliver')}
                                                            className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                                                            title="Marquer comme livré"
                                                        >
                                                            Livrer
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default OrdersListScreen;

