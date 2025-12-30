import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FaBox, FaShoppingCart, FaUsers, FaArrowRight } from 'react-icons/fa';

const DashboardScreen = () => {
    const [stats, setStats] = useState({
        products: 0,
        orders: 0,
        users: 0,
        loading: true,
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('userInfo')
                    ? JSON.parse(localStorage.getItem('userInfo')).token
                    : null;

                const headers = token ? { Authorization: `Bearer ${token}` } : {};

                const [productsRes, ordersRes, usersRes] = await Promise.all([
                    fetch('/api/products?all=true'), // Get all products including skincare for admin
                    fetch('/api/orders', { headers }).catch(() => null),
                    fetch('/api/users', { headers }).catch(() => null),
                ]);

                const products = await productsRes.json();
                const orders = ordersRes ? await ordersRes.json() : [];
                const users = usersRes ? await usersRes.json() : [];

                setStats({
                    products: Array.isArray(products) ? products.length : 0,
                    orders: Array.isArray(orders) ? orders.length : 0,
                    users: Array.isArray(users) ? users.length : 0,
                    loading: false,
                });
            } catch (error) {
                console.error('Error fetching stats:', error);
                setStats((prev) => ({ ...prev, loading: false }));
            }
        };

        fetchStats();
    }, []);

    const statCards = [
        {
            title: 'Produits',
            value: stats.products,
            icon: FaBox,
            color: 'bg-luxe-gold',
            link: '/admin/products',
        },
        {
            title: 'Commandes',
            value: stats.orders,
            icon: FaShoppingCart,
            color: 'bg-blue-500',
            link: '/admin/orders',
        },
        {
            title: 'Utilisateurs',
            value: stats.users,
            icon: FaUsers,
            color: 'bg-green-500',
            link: '/admin/users',
        },
    ];

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="font-serif text-4xl md:text-5xl font-light text-luxe-black mb-2">
                        Tableau de bord
                    </h1>
                    <p className="font-sans text-sm text-luxe-charcoal/70">
                        Vue d'ensemble de votre boutique
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {statCards.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <Link
                                key={index}
                                to={stat.link}
                                className="bg-luxe-warm-white rounded-lg border border-luxe-charcoal/10 p-6 hover:shadow-lg transition-shadow duration-200"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`${stat.color} p-3 rounded-lg`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <FaArrowRight className="w-4 h-4 text-luxe-charcoal/40" />
                                </div>
                                <h3 className="font-sans text-sm text-luxe-charcoal/70 mb-1">
                                    {stat.title}
                                </h3>
                                {stats.loading ? (
                                    <div className="w-16 h-10 bg-luxe-charcoal/5 skeleton rounded"></div>
                                ) : (
                                    <p className="font-serif text-3xl font-light text-luxe-black fade-in">
                                        {stat.value}
                                    </p>
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* Quick Actions */}
                <div className="bg-luxe-warm-white rounded-lg border border-luxe-charcoal/10 p-6">
                    <h2 className="font-serif text-2xl font-light text-luxe-black mb-4">
                        Actions rapides
                    </h2>
                    <div className="flex flex-wrap gap-4">
                        <Link
                            to="/admin/products"
                            className="btn-luxe-gold flex items-center gap-2"
                        >
                            <FaBox className="w-4 h-4" />
                            Gérer les produits
                        </Link>
                        <Link
                            to="/admin/reviews"
                            className="btn-luxe-secondary flex items-center gap-2"
                        >
                            <FaBox className="w-4 h-4" />
                            Modérer les avis
                        </Link>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default DashboardScreen;

