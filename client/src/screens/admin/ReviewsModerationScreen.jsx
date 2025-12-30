import React, { useContext, useEffect, useReducer, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store } from '../../context/StoreContext';
import AdminLayout from '../../components/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FaCheck, FaTimes, FaEye, FaStar } from 'react-icons/fa';
import { apiFetch } from '../../utils/api';

const reducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_REQUEST':
            return { ...state, loading: true };
        case 'FETCH_SUCCESS':
            return { ...state, loading: false, products: action.payload };
        case 'FETCH_FAIL':
            return { ...state, loading: false, error: action.payload };
        case 'MODERATE_REQUEST':
            return { ...state, moderating: true };
        case 'MODERATE_SUCCESS':
            return { ...state, moderating: false };
        case 'MODERATE_FAIL':
            return { ...state, moderating: false };
        default:
            return state;
    }
};

const ReviewsModerationScreen = () => {
    const navigate = useNavigate();
    const { state } = useContext(Store);
    const { userInfo } = state;

    const [{ loading, error, products, moderating }, dispatch] = useReducer(reducer, {
        loading: true,
        error: '',
        products: [],
    });

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [unmoderatedOnly, setUnmoderatedOnly] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                dispatch({ type: 'FETCH_REQUEST' });
                const res = await apiFetch('/api/products?all=true', {
                    headers: { Authorization: `Bearer ${userInfo.token}` },
                });
                const data = await res.json();
                
                // Filter products with reviews
                const productsWithReviews = Array.isArray(data)
                    ? data.filter(p => p.reviews && p.reviews.length > 0)
                    : [];
                
                dispatch({ type: 'FETCH_SUCCESS', payload: productsWithReviews });
            } catch (err) {
                dispatch({ type: 'FETCH_FAIL', payload: err.message });
            }
        };

        if (userInfo) {
            fetchData();
        }
    }, [userInfo]);

    const moderateReview = async (productId, reviewId, action) => {
        try {
            dispatch({ type: 'MODERATE_REQUEST' });
            const res = await apiFetch(`/api/products/${productId}/reviews/${reviewId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`,
                },
                body: JSON.stringify({ action }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ message: 'Erreur lors de la modération' }));
                throw new Error(errorData.message || 'Erreur lors de la modération');
            }

            dispatch({ type: 'MODERATE_SUCCESS' });
            
            // Reload data
            const productsRes = await apiFetch('/api/products?all=true', {
                headers: { Authorization: `Bearer ${userInfo.token}` },
            });
            const productsData = await productsRes.json();
            const productsWithReviews = Array.isArray(productsData)
                ? productsData.filter(p => p.reviews && p.reviews.length > 0)
                : [];
            dispatch({ type: 'FETCH_SUCCESS', payload: productsWithReviews });
            
            if (selectedProduct) {
                const updatedProduct = productsWithReviews.find(p => p._id === selectedProduct._id);
                setSelectedProduct(updatedProduct || null);
            }
        } catch (err) {
            dispatch({ type: 'MODERATE_FAIL' });
            alert(err.message || 'Erreur lors de la modération de l\'avis');
        }
    };

    const getUnmoderatedReviews = () => {
        if (!selectedProduct) return [];
        return selectedProduct.reviews.filter(r => !r.isModerated);
    };

    const getAllReviews = () => {
        if (!selectedProduct) return [];
        return selectedProduct.reviews;
    };

    const reviewsToShow = unmoderatedOnly ? getUnmoderatedReviews() : getAllReviews();

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="font-serif text-4xl md:text-5xl font-light text-luxe-black dark:text-luxe-cream mb-2">
                        Modération des Avis
                    </h1>
                    <p className="font-sans text-sm text-luxe-charcoal/70 dark:text-luxe-cream/70">
                        Gérez et modérez les avis clients
                    </p>
                </div>

                {loading ? (
                    <LoadingSpinner text="Chargement des avis..." />
                ) : error ? (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="font-sans text-sm text-red-700">{error}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Products List */}
                        <div className="lg:col-span-1">
                            <div className="bg-luxe-warm-white dark:bg-luxe-charcoal rounded-lg border border-luxe-charcoal/10 dark:border-luxe-gold/20 p-4 mb-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={unmoderatedOnly}
                                        onChange={(e) => setUnmoderatedOnly(e.target.checked)}
                                        className="rounded"
                                    />
                                    <span className="font-sans text-sm text-luxe-black dark:text-luxe-cream">
                                        Afficher uniquement les avis non modérés
                                    </span>
                                </label>
                            </div>
                            <div className="space-y-2 max-h-[calc(100vh-12rem)] overflow-y-auto">
                                {products.map((product) => {
                                    const unmoderatedCount = product.reviews.filter(r => !r.isModerated).length;
                                    if (unmoderatedOnly && unmoderatedCount === 0) return null;
                                    
                                    return (
                                        <button
                                            key={product._id}
                                            onClick={() => setSelectedProduct(product)}
                                            className={`w-full text-left p-4 rounded-lg border transition-all ${
                                                selectedProduct?._id === product._id
                                                    ? 'border-luxe-gold bg-luxe-champagne/20 dark:bg-luxe-gold/20'
                                                    : 'border-luxe-charcoal/10 dark:border-luxe-gold/20 bg-luxe-warm-white dark:bg-luxe-charcoal hover:border-luxe-gold/50'
                                            }`}
                                        >
                                            <h3 className="font-serif text-lg font-normal text-luxe-black dark:text-luxe-cream mb-1">
                                                {product.name}
                                            </h3>
                                            <p className="font-sans text-xs text-luxe-charcoal/60 dark:text-luxe-cream/70 mb-2">
                                                {product.brand}
                                            </p>
                                            {unmoderatedCount > 0 && (
                                                <span className="inline-block px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                                                    {unmoderatedCount} non modéré{unmoderatedCount > 1 ? 's' : ''}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Reviews List */}
                        <div className="lg:col-span-2">
                            {selectedProduct ? (
                                <div className="space-y-4">
                                    <div className="bg-luxe-warm-white dark:bg-luxe-charcoal rounded-lg border border-luxe-charcoal/10 dark:border-luxe-gold/20 p-6">
                                        <h2 className="font-serif text-2xl font-light text-luxe-black dark:text-luxe-cream mb-2">
                                            {selectedProduct.name}
                                        </h2>
                                        <p className="font-sans text-sm text-luxe-charcoal/70 dark:text-luxe-cream/70">
                                            {selectedProduct.brand}
                                        </p>
                                    </div>

                                    {reviewsToShow.length > 0 ? (
                                        <div className="space-y-4">
                                            {reviewsToShow.map((review) => (
                                                <div
                                                    key={review._id}
                                                    className={`bg-luxe-warm-white dark:bg-luxe-charcoal rounded-lg border p-6 ${
                                                        review.isModerated
                                                            ? 'border-green-200 dark:border-green-500/30 bg-green-50/30 dark:bg-green-900/20'
                                                            : 'border-yellow-200 dark:border-yellow-500/30 bg-yellow-50/30 dark:bg-yellow-900/20'
                                                    }`}
                                                >
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <h4 className="font-serif text-lg font-normal text-luxe-black dark:text-luxe-cream">
                                                                    {review.name}
                                                                </h4>
                                                                <div className="flex items-center gap-1">
                                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                                        <FaStar
                                                                            key={star}
                                                                            className={`w-4 h-4 ${
                                                                                star <= review.rating
                                                                                    ? 'text-luxe-gold'
                                                                                    : 'text-luxe-charcoal/20 dark:text-luxe-cream/30'
                                                                            }`}
                                                                        />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <p className="font-sans text-xs text-luxe-charcoal/60 dark:text-luxe-cream/70 mb-3">
                                                                {new Date(review.createdAt).toLocaleDateString('fr-FR', {
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                })}
                                                            </p>
                                                            <p className="font-sans text-sm text-luxe-charcoal/70 dark:text-luxe-cream/70 leading-relaxed">
                                                                {review.comment}
                                                            </p>
                                                        </div>
                                                        {review.isModerated && (
                                                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full whitespace-nowrap ml-4">
                                                                Modéré
                                                            </span>
                                                        )}
                                                    </div>

                                                    {!review.isModerated && (
                                                        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-luxe-charcoal/10 dark:border-luxe-gold/20">
                                                            <button
                                                                onClick={() => moderateReview(selectedProduct._id, review._id, 'approve')}
                                                                disabled={moderating}
                                                                className="btn-luxe-gold flex items-center gap-2 flex-1"
                                                            >
                                                                <FaCheck className="w-4 h-4" />
                                                                Approuver
                                                            </button>
                                                            <button
                                                                onClick={() => moderateReview(selectedProduct._id, review._id, 'reject')}
                                                                disabled={moderating}
                                                                className="btn-luxe-secondary flex items-center gap-2 flex-1"
                                                            >
                                                                <FaTimes className="w-4 h-4" />
                                                                Rejeter
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="bg-luxe-warm-white dark:bg-luxe-charcoal rounded-lg border border-luxe-charcoal/10 dark:border-luxe-gold/20 p-12 text-center">
                                            <p className="font-sans text-sm text-luxe-charcoal/70 dark:text-luxe-cream/70">
                                                {unmoderatedOnly
                                                    ? 'Aucun avis non modéré pour ce produit'
                                                    : 'Aucun avis pour ce produit'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-luxe-warm-white dark:bg-luxe-charcoal rounded-lg border border-luxe-charcoal/10 dark:border-luxe-gold/20 p-12 text-center">
                                    <FaEye className="w-12 h-12 text-luxe-charcoal/20 dark:text-luxe-cream/30 mx-auto mb-4" />
                                    <p className="font-sans text-sm text-luxe-charcoal/70 dark:text-luxe-cream/70">
                                        Sélectionnez un produit pour voir ses avis
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default ReviewsModerationScreen;

