import React, { useContext, useEffect, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store } from '../../context/StoreContext';
import AdminLayout from '../../components/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';

const reducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_REQUEST':
            return { ...state, loading: true };
        case 'FETCH_SUCCESS':
            return { ...state, loading: false, products: action.payload };
        case 'FETCH_FAIL':
            return { ...state, loading: false, error: action.payload };
        case 'DELETE_REQUEST':
            return { ...state, loadingDelete: true, successDelete: false };
        case 'DELETE_SUCCESS':
            return { ...state, loadingDelete: false, successDelete: true };
        case 'DELETE_FAIL':
            return { ...state, loadingDelete: false, successDelete: false };
        case 'DELETE_RESET':
            return { ...state, successDelete: false };
        case 'CREATE_REQUEST':
            return { ...state, loadingCreate: true };
        case 'CREATE_SUCCESS':
            return { ...state, loadingCreate: false };
        case 'CREATE_FAIL':
            return { ...state, loadingCreate: false };
        default:
            return state;
    }
};

const ProductListScreen = () => {
    const navigate = useNavigate();
    const { state } = useContext(Store);
    const { userInfo } = state;
    const [searchTerm, setSearchTerm] = React.useState('');
    const [{ loading, error, products, loadingCreate, loadingDelete, successDelete }, dispatch] = useReducer(reducer, {
        loading: true,
        error: '',
        products: [],
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                dispatch({ type: 'FETCH_REQUEST' });
                // Use 'all=true' to get all products including skincare for admin panel
                const res = await fetch('/api/products?all=true');
                const data = await res.json();
                // Ensure data is an array
                const productsArray = Array.isArray(data) ? data : [];
                dispatch({ type: 'FETCH_SUCCESS', payload: productsArray });
            } catch (err) {
                dispatch({ type: 'FETCH_FAIL', payload: err.message });
            }
        };
        if (successDelete) {
            dispatch({ type: 'DELETE_RESET' });
        } else {
            fetchData();
        }
    }, [userInfo, successDelete]);

    const createHandler = async () => {
        try {
            dispatch({ type: 'CREATE_REQUEST' });
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { Authorization: `Bearer ${userInfo.token}` },
            });
            const data = await res.json();
            dispatch({ type: 'CREATE_SUCCESS' });
            navigate(`/admin/product/${data._id}`);
        } catch (err) {
            dispatch({ type: 'CREATE_FAIL' });
            alert('Erreur lors de la création du produit');
        }
    };

    const deleteHandler = async (product) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${product.name}" ?`)) {
            try {
                dispatch({ type: 'DELETE_REQUEST' });
                await fetch(`/api/products/${product._id}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${userInfo.token}` },
                });
                dispatch({ type: 'DELETE_SUCCESS' });
            } catch (err) {
                dispatch({ type: 'DELETE_FAIL' });
                alert('Erreur lors de la suppression du produit');
            }
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
        }).format(price || 0);
    };

    const filteredProducts = (products || []).filter((product) => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
            product.name?.toLowerCase().includes(search) ||
            product.brand?.toLowerCase().includes(search) ||
            product.category?.toLowerCase().includes(search)
        );
    });

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="font-serif text-4xl md:text-5xl font-light text-luxe-black mb-2">
                            Produits
                        </h1>
                        <p className="font-sans text-sm text-luxe-charcoal/70">
                            {filteredProducts.length} {filteredProducts.length === 1 ? 'produit' : 'produits'}
                        </p>
                    </div>
                    <button
                        onClick={createHandler}
                        className="btn-luxe-gold flex items-center justify-center gap-2"
                        disabled={loadingCreate}
                    >
                        <FaPlus className="w-4 h-4" />
                        {loadingCreate ? 'Création...' : 'Créer un produit'}
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-luxe-charcoal/40 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Rechercher un produit..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-luxe pl-11 w-full"
                    />
                </div>

                {/* Loading States */}
                {loadingDelete && (
                    <div className="p-4 bg-luxe-champagne/30 border border-luxe-gold/30 rounded-lg">
                        <p className="font-sans text-sm text-luxe-black">Suppression en cours...</p>
                    </div>
                )}

                {/* Products Table */}
                {loading ? (
                    <LoadingSpinner text="Chargement des produits..." />
                ) : error ? (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="font-sans text-sm text-red-700">{error}</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="font-sans text-lg text-luxe-charcoal/70 mb-4">
                            {searchTerm ? 'Aucun produit ne correspond à votre recherche' : 'Aucun produit'}
                        </p>
                        {!searchTerm && (
                            <button onClick={createHandler} className="btn-luxe-gold">
                                Créer le premier produit
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="bg-luxe-warm-white rounded-lg border border-luxe-charcoal/10 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-luxe-champagne/20">
                                    <tr>
                                        <th className="text-left px-6 py-4 font-sans text-xs uppercase tracking-wider text-luxe-charcoal/70">
                                            Image
                                        </th>
                                        <th className="text-left px-6 py-4 font-sans text-xs uppercase tracking-wider text-luxe-charcoal/70">
                                            Nom
                                        </th>
                                        <th className="text-left px-6 py-4 font-sans text-xs uppercase tracking-wider text-luxe-charcoal/70">
                                            Marque
                                        </th>
                                        <th className="text-left px-6 py-4 font-sans text-xs uppercase tracking-wider text-luxe-charcoal/70">
                                            Catégorie
                                        </th>
                                        <th className="text-left px-6 py-4 font-sans text-xs uppercase tracking-wider text-luxe-charcoal/70">
                                            Prix
                                        </th>
                                        <th className="text-left px-6 py-4 font-sans text-xs uppercase tracking-wider text-luxe-charcoal/70">
                                            Stock
                                        </th>
                                        <th className="text-right px-6 py-4 font-sans text-xs uppercase tracking-wider text-luxe-charcoal/70">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-luxe-charcoal/10">
                                    {filteredProducts.map((product) => (
                                        <tr key={product._id} className="hover:bg-luxe-champagne/10 transition-colors">
                                            <td className="px-6 py-4">
                                                <img
                                                    src={product.image || 'https://via.placeholder.com/60'}
                                                    alt={product.name}
                                                    className="w-16 h-16 object-cover rounded"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-serif text-base text-luxe-black">{product.name}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-sans text-sm text-luxe-charcoal/70">{product.brand}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-block px-3 py-1 rounded-full bg-luxe-champagne/30 text-luxe-charcoal/70 font-sans text-xs">
                                                    {product.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-serif text-base text-luxe-black">{formatPrice(product.price)}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`font-sans text-sm ${
                                                    product.countInStock > 0 ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                    {product.countInStock}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button
                                                        onClick={() => navigate(`/admin/product/${product._id}`)}
                                                        className="p-2 text-luxe-gold hover:bg-luxe-champagne/30 rounded transition-colors"
                                                        title="Modifier"
                                                    >
                                                        <FaEdit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteHandler(product)}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                                                        title="Supprimer"
                                                    >
                                                        <FaTrash className="w-4 h-4" />
                                                    </button>
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

export default ProductListScreen;
