import React, { useContext, useEffect, useReducer, useState } from 'react';
import { Store } from '../../context/StoreContext';
import AdminLayout from '../../components/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FaSearch, FaUserShield, FaUser } from 'react-icons/fa';
import { apiFetch } from '../../utils/api';

const reducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_REQUEST':
            return { ...state, loading: true };
        case 'FETCH_SUCCESS':
            return { ...state, loading: false, users: action.payload };
        case 'FETCH_FAIL':
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    }
};

const UsersListScreen = () => {
    const { state } = useContext(Store);
    const { userInfo } = state;
    const [searchTerm, setSearchTerm] = useState('');

    const [{ loading, error, users }, dispatch] = useReducer(reducer, {
        loading: true,
        error: '',
        users: [],
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                dispatch({ type: 'FETCH_REQUEST' });
                // Note: You'll need to create this endpoint in the backend
                const res = await apiFetch('/api/users', {
                    headers: {
                        Authorization: `Bearer ${userInfo.token}`,
                    },
                });
                if (!res.ok) {
                    throw new Error('Failed to fetch users');
                }
                const data = await res.json();
                const usersArray = Array.isArray(data) ? data : [];
                dispatch({ type: 'FETCH_SUCCESS', payload: usersArray });
            } catch (err) {
                dispatch({ type: 'FETCH_FAIL', payload: err.message });
            }
        };
        if (userInfo) {
            fetchData();
        }
    }, [userInfo]);

    const filteredUsers = (users || []).filter((user) => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
            user.name?.toLowerCase().includes(search) ||
            user.email?.toLowerCase().includes(search) ||
            user._id?.toLowerCase().includes(search)
        );
    });

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="font-serif text-4xl md:text-5xl font-light text-luxe-black mb-2">
                        Utilisateurs
                    </h1>
                    <p className="font-sans text-sm text-luxe-charcoal/70">
                        {filteredUsers.length} {filteredUsers.length === 1 ? 'utilisateur' : 'utilisateurs'}
                    </p>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-luxe-charcoal/40 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Rechercher un utilisateur..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-luxe pl-11 w-full"
                    />
                </div>

                {/* Users Table */}
                {loading ? (
                    <LoadingSpinner text="Chargement des utilisateurs..." />
                ) : error ? (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="font-sans text-sm text-red-700">
                            {error}. Note: L'endpoint /api/users doit être créé dans le backend.
                        </p>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="font-sans text-lg text-luxe-charcoal/70">
                            Aucun utilisateur trouvé
                        </p>
                    </div>
                ) : (
                    <div className="bg-luxe-warm-white rounded-lg border border-luxe-charcoal/10 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-luxe-champagne/20">
                                    <tr>
                                        <th className="text-left px-6 py-4 font-sans text-xs uppercase tracking-wider text-luxe-charcoal/70">
                                            Nom
                                        </th>
                                        <th className="text-left px-6 py-4 font-sans text-xs uppercase tracking-wider text-luxe-charcoal/70">
                                            Email
                                        </th>
                                        <th className="text-left px-6 py-4 font-sans text-xs uppercase tracking-wider text-luxe-charcoal/70">
                                            Rôle
                                        </th>
                                        <th className="text-left px-6 py-4 font-sans text-xs uppercase tracking-wider text-luxe-charcoal/70">
                                            Date d'inscription
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-luxe-charcoal/10">
                                    {filteredUsers.map((user) => (
                                        <tr key={user._id} className="hover:bg-luxe-champagne/10 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {user.isAdmin ? (
                                                        <FaUserShield className="w-4 h-4 text-luxe-gold" />
                                                    ) : (
                                                        <FaUser className="w-4 h-4 text-luxe-charcoal/40" />
                                                    )}
                                                    <p className="font-sans text-sm text-luxe-black">
                                                        {user.name}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-sans text-sm text-luxe-charcoal/70">
                                                    {user.email}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                {user.isAdmin ? (
                                                    <span className="inline-block px-3 py-1 rounded-full bg-luxe-gold text-luxe-black text-xs font-medium">
                                                        Administrateur
                                                    </span>
                                                ) : (
                                                    <span className="inline-block px-3 py-1 rounded-full bg-luxe-champagne/30 text-luxe-charcoal/70 text-xs">
                                                        Utilisateur
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-sans text-sm text-luxe-charcoal/70">
                                                    {user.createdAt
                                                        ? new Date(user.createdAt).toLocaleDateString('fr-FR')
                                                        : 'N/A'}
                                                </p>
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

export default UsersListScreen;

