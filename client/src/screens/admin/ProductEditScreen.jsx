import React, { useContext, useEffect, useReducer, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Store } from '../../context/StoreContext';
import AdminLayout from '../../components/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FaArrowLeft, FaUpload, FaPlus, FaTimes, FaSave } from 'react-icons/fa';
import { apiFetch } from '../../utils/api';

const reducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_REQUEST':
            return { ...state, loading: true };
        case 'FETCH_SUCCESS':
            return { ...state, loading: false };
        case 'FETCH_FAIL':
            return { ...state, loading: false, error: action.payload };
        case 'UPDATE_REQUEST':
            return { ...state, loadingUpdate: true };
        case 'UPDATE_SUCCESS':
            return { ...state, loadingUpdate: false };
        case 'UPDATE_FAIL':
            return { ...state, loadingUpdate: false };
        case 'UPLOAD_REQUEST':
            return { ...state, loadingUpload: true };
        case 'UPLOAD_SUCCESS':
            return { ...state, loadingUpload: false };
        case 'UPLOAD_FAIL':
            return { ...state, loadingUpload: false };
        default:
            return state;
    }
};

const ProductEditScreen = () => {
    const navigate = useNavigate();
    const params = useParams();
    const { id: productId } = params;
    const { state } = useContext(Store);
    const { userInfo } = state;

    const [{ loading, error, loadingUpdate, loadingUpload }, dispatch] = useReducer(reducer, {
        loading: true,
        error: '',
    });

    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [image, setImage] = useState('');
    const [category, setCategory] = useState('');
    const [productType, setProductType] = useState('parfum'); // 'parfum' or 'skincare'
    const [gender, setGender] = useState(''); // 'Homme' or 'Femme' for perfumes
    const [countInStock, setCountInStock] = useState('');
    const [brand, setBrand] = useState('');
    const [brandLogo, setBrandLogo] = useState('');
    const [description, setDescription] = useState('');
    const [fragranceNotes, setFragranceNotes] = useState([]);
    const [benefits, setBenefits] = useState([]);
    const [fragranceFamily, setFragranceFamily] = useState('');
    const [skinType, setSkinType] = useState('');
    const [ingredients, setIngredients] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            // Si c'est un nouveau produit, ne pas faire de fetch
            if (productId === 'new') {
                dispatch({ type: 'FETCH_SUCCESS' });
                return;
            }

            try {
                dispatch({ type: 'FETCH_REQUEST' });
                const res = await apiFetch(`/api/products/${productId}`);
                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(errorText || `HTTP error! status: ${res.status}`);
                }
                const contentType = res.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    const text = await res.text();
                    throw new Error(`Expected JSON but got: ${text.substring(0, 100)}`);
                }
                const data = await res.json();
                setName(data.name || '');
                setPrice(data.price || '');
                setImage(data.image || '');
                const cat = data.category || '';
                setCategory(cat);
                if (cat === 'skincare') {
                    setProductType('skincare');
                    setGender('');
                } else {
                    setProductType('parfum');
                    setGender(cat);
                }
                setCountInStock(data.countInStock || '');
                setBrand(data.brand || '');
                setBrandLogo(data.brandLogo || '');
                setDescription(data.description || '');
                setFragranceNotes(data.fragranceNotes || []);
                setBenefits(data.benefits || []);
                setFragranceFamily(data.fragranceFamily || '');
                setSkinType(data.skinType || '');
                setIngredients(data.ingredients || '');
                dispatch({ type: 'FETCH_SUCCESS' });
            } catch (err) {
                dispatch({ type: 'FETCH_FAIL', payload: err.message });
            }
        };
        fetchData();
    }, [productId]);

    const isSkincare = productType === 'skincare';
    const finalCategory = isSkincare ? 'skincare' : gender;

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            dispatch({ type: 'UPDATE_REQUEST' });
            
            const isNewProduct = productId === 'new';
            const url = isNewProduct ? '/api/products' : `/api/products/${productId}`;
            const method = isNewProduct ? 'POST' : 'PUT';
            
            const response = await apiFetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`,
                },
                body: JSON.stringify({
                    name,
                    price: parseFloat(price),
                    image,
                    category: finalCategory,
                    brand,
                    brandLogo,
                    countInStock: parseInt(countInStock),
                    description,
                    fragranceNotes: isSkincare ? [] : fragranceNotes,
                    benefits: isSkincare ? benefits : [],
                    fragranceFamily: isSkincare ? '' : fragranceFamily,
                    skinType: isSkincare ? skinType : '',
                    ingredients: isSkincare ? ingredients : '',
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `HTTP error! status: ${response.status}`);
            }
            
            const contentType = response.headers.get('content-type');
            let result = null;
            if (contentType && contentType.includes('application/json')) {
                result = await response.json();
            } else {
                const text = await response.text();
                // Si ce n'est pas du JSON, essayer de parser quand même si c'est un nouveau produit
                if (isNewProduct && text) {
                    try {
                        result = JSON.parse(text);
                    } catch (e) {
                        throw new Error(`Réponse invalide du serveur: ${text.substring(0, 100)}`);
                    }
                }
            }

            dispatch({ type: 'UPDATE_SUCCESS' });
            alert(isNewProduct ? 'Produit créé avec succès' : 'Produit mis à jour avec succès');
            
            // Si c'est un nouveau produit, rediriger vers la page d'édition du produit créé
            if (isNewProduct && result && result._id) {
                navigate(`/admin/product/${result._id}`);
            } else {
                navigate('/admin/products');
            }
        } catch (err) {
            dispatch({ type: 'UPDATE_FAIL' });
            alert(`Erreur lors de ${productId === 'new' ? 'la création' : 'la mise à jour'} du produit: ${err.message}`);
        }
    };

    const uploadFileHandler = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);
        try {
            dispatch({ type: 'UPLOAD_REQUEST' });
            const res = await apiFetch('/api/upload', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
                body: formData,
            });
            const data = await res.text();
            dispatch({ type: 'UPLOAD_SUCCESS' });
            setImage(data);
            alert('Image téléchargée avec succès');
        } catch (err) {
            dispatch({ type: 'UPLOAD_FAIL' });
            alert('Erreur lors du téléchargement de l\'image');
        }
    };

    const addFragranceNoteGroup = () => {
        setFragranceNotes([...fragranceNotes, { type: 'Top', notes: [] }]);
    };

    const updateFragranceNoteGroup = (index, field, value) => {
        const updated = [...fragranceNotes];
        updated[index] = { ...updated[index], [field]: value };
        setFragranceNotes(updated);
    };

    const addNoteToGroup = (groupIndex, note) => {
        const updated = [...fragranceNotes];
        if (!updated[groupIndex].notes) {
            updated[groupIndex].notes = [];
        }
        updated[groupIndex].notes.push(note);
        setFragranceNotes(updated);
    };

    const removeNoteFromGroup = (groupIndex, noteIndex) => {
        const updated = [...fragranceNotes];
        updated[groupIndex].notes.splice(noteIndex, 1);
        setFragranceNotes(updated);
    };

    const removeFragranceNoteGroup = (index) => {
        setFragranceNotes(fragranceNotes.filter((_, i) => i !== index));
    };

    const addBenefit = () => {
        const benefit = prompt('Entrez un bienfait:');
        if (benefit && benefit.trim()) {
            setBenefits([...benefits, benefit.trim()]);
        }
    };

    const removeBenefit = (index) => {
        setBenefits(benefits.filter((_, i) => i !== index));
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link
                        to="/admin/products"
                        className="p-2 text-luxe-charcoal/70 hover:text-luxe-gold transition-colors"
                    >
                        <FaArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="font-serif text-4xl md:text-5xl font-light text-luxe-black dark:text-luxe-cream">
                            {productId === 'new' ? 'Nouveau Produit' : 'Modifier le Produit'}
                        </h1>
                        <p className="font-sans text-sm text-luxe-charcoal/70 mt-1">
                            {productId === 'new' ? 'Créer un nouveau produit' : `ID: ${productId.substring(0, 8)}...`}
                        </p>
                    </div>
                </div>

                {loading ? (
                    <LoadingSpinner text="Chargement du produit..." />
                ) : error ? (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="font-sans text-sm text-red-700">{error}</p>
                    </div>
                ) : (
                    <form onSubmit={submitHandler} className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div className="space-y-6">
                                {/* Basic Information */}
                                <div className="bg-luxe-warm-white rounded-lg border border-luxe-charcoal/10 p-6 space-y-4">
                                    <h2 className="font-serif text-2xl font-light text-luxe-black mb-4">
                                        Informations de base
                                    </h2>

                                    <div>
                                        <label className="block font-sans text-sm font-medium text-luxe-charcoal/70 mb-2">
                                            Nom du produit *
                                        </label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="input-luxe w-full"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-sans text-sm font-medium text-luxe-charcoal/70 mb-2">
                                            Marque *
                                        </label>
                                        <input
                                            type="text"
                                            value={brand}
                                            onChange={(e) => setBrand(e.target.value)}
                                            className="input-luxe w-full"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-sans text-sm font-medium text-luxe-charcoal/70 mb-2">
                                            Logo de la marque
                                        </label>
                                        <input
                                            type="text"
                                            value={brandLogo}
                                            onChange={(e) => setBrandLogo(e.target.value)}
                                            className="input-luxe w-full"
                                            placeholder="URL du logo de la marque"
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-sans text-sm font-medium text-luxe-charcoal/70 mb-2">
                                            Ou télécharger un logo
                                        </label>
                                        <label className="flex items-center gap-2 btn-luxe-secondary cursor-pointer dark:text-luxe-cream">
                                            <FaUpload className="w-4 h-4 dark:text-luxe-cream" />
                                            {loadingUpload ? 'Téléchargement...' : 'Choisir un fichier logo'}
                                            <input
                                                type="file"
                                                onChange={async (e) => {
                                                    const file = e.target.files[0];
                                                    if (!file) return;

                                                    const formData = new FormData();
                                                    formData.append('image', file);
                                                    try {
                                                        dispatch({ type: 'UPLOAD_REQUEST' });
                                                        const res = await apiFetch('/api/upload', {
                                                            method: 'POST',
                                                            headers: {
                                                                Authorization: `Bearer ${userInfo.token}`,
                                                            },
                                                            body: formData,
                                                        });
                                                        const data = await res.text();
                                                        dispatch({ type: 'UPLOAD_SUCCESS' });
                                                        setBrandLogo(data);
                                                        alert('Logo téléchargé avec succès');
                                                    } catch (err) {
                                                        dispatch({ type: 'UPLOAD_FAIL' });
                                                        alert('Erreur lors du téléchargement du logo');
                                                    }
                                                }}
                                                className="hidden"
                                                accept="image/svg+xml,image/jpeg,image/jpg,image/png,image/webp"
                                            />
                                        </label>
                                    </div>

                                    {brandLogo && (
                                        <div className="mt-4">
                                            <img
                                                src={brandLogo}
                                                alt="Logo de la marque"
                                                className="h-16 w-auto object-contain rounded-lg border border-luxe-charcoal/10"
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <label className="block font-sans text-sm font-medium text-luxe-charcoal/70 mb-2">
                                            Type de produit *
                                        </label>
                                        <select
                                            value={productType}
                                            onChange={(e) => {
                                                setProductType(e.target.value);
                                                if (e.target.value === 'skincare') {
                                                    setGender('');
                                                } else if (!gender) {
                                                    setGender('Homme');
                                                }
                                            }}
                                            className="input-luxe w-full"
                                            required
                                        >
                                            <option value="parfum">Parfum</option>
                                            <option value="skincare">Skincare</option>
                                        </select>
                                    </div>

                                    {productType === 'parfum' && (
                                        <div>
                                            <label className="block font-sans text-sm font-medium text-luxe-charcoal/70 mb-2">
                                                Genre *
                                            </label>
                                            <select
                                                value={gender}
                                                onChange={(e) => setGender(e.target.value)}
                                                className="input-luxe w-full"
                                                required
                                            >
                                                <option value="">Sélectionner un genre</option>
                                                <option value="Homme">Homme</option>
                                                <option value="Femme">Femme</option>
                                            </select>
                                        </div>
                                    )}

                                    {!isSkincare && (
                                        <div>
                                            <label className="block font-sans text-sm font-medium text-luxe-charcoal/70 mb-2">
                                                Famille Olfactive
                                            </label>
                                            <select
                                                value={fragranceFamily}
                                                onChange={(e) => setFragranceFamily(e.target.value)}
                                                className="input-luxe w-full"
                                            >
                                                <option value="">Sélectionner une famille</option>
                                                <option value="Floral">Floral</option>
                                                <option value="Oriental">Oriental</option>
                                                <option value="Boisé">Boisé</option>
                                                <option value="Frais">Frais</option>
                                                <option value="Fruité">Fruité</option>
                                                <option value="Aquatique">Aquatique</option>
                                                <option value="Gourmand">Gourmand</option>
                                            </select>
                                        </div>
                                    )}

                                    {isSkincare && (
                                        <div>
                                            <label className="block font-sans text-sm font-medium text-luxe-charcoal/70 mb-2">
                                                Type de Peau
                                            </label>
                                            <select
                                                value={skinType}
                                                onChange={(e) => setSkinType(e.target.value)}
                                                className="input-luxe w-full"
                                            >
                                                <option value="">Sélectionner un type</option>
                                                <option value="Sèche">Sèche</option>
                                                <option value="Grasse">Grasse</option>
                                                <option value="Mixte">Mixte</option>
                                                <option value="Sensible">Sensible</option>
                                                <option value="Normale">Normale</option>
                                                <option value="Tous types">Tous types</option>
                                            </select>
                                        </div>
                                    )}

                                    {isSkincare && (
                                        <div>
                                            <label className="block font-sans text-sm font-medium text-luxe-charcoal/70 mb-2">
                                                Ingrédients
                                            </label>
                                            <textarea
                                                value={ingredients}
                                                onChange={(e) => setIngredients(e.target.value)}
                                                className="input-luxe w-full"
                                                rows="3"
                                                placeholder="Liste des ingrédients principaux..."
                                            />
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block font-sans text-sm font-medium text-luxe-charcoal/70 mb-2">
                                                Prix (€) *
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={price}
                                                onChange={(e) => setPrice(e.target.value)}
                                                className="input-luxe w-full"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-sans text-sm font-medium text-luxe-charcoal/70 mb-2">
                                                Stock *
                                            </label>
                                            <input
                                                type="number"
                                                value={countInStock}
                                                onChange={(e) => setCountInStock(e.target.value)}
                                                className="input-luxe w-full"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block font-sans text-sm font-medium text-luxe-charcoal/70 mb-2">
                                            Description *
                                        </label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="input-luxe w-full"
                                            rows="4"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Image Upload */}
                                <div className="bg-luxe-warm-white rounded-lg border border-luxe-charcoal/10 p-6 space-y-4">
                                    <h2 className="font-serif text-2xl font-light text-luxe-black mb-4">
                                        Image
                                    </h2>

                                    <div>
                                        <label className="block font-sans text-sm font-medium text-luxe-charcoal/70 mb-2">
                                            URL de l'image *
                                        </label>
                                        <input
                                            type="text"
                                            value={image}
                                            onChange={(e) => setImage(e.target.value)}
                                            className="input-luxe w-full"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-sans text-sm font-medium text-luxe-charcoal/70 mb-2">
                                            Ou télécharger une image
                                        </label>
                                        <label className="flex items-center gap-2 btn-luxe-secondary cursor-pointer dark:text-luxe-cream">
                                            <FaUpload className="w-4 h-4" />
                                            {loadingUpload ? 'Téléchargement...' : 'Choisir un fichier'}
                                            <input
                                                type="file"
                                                onChange={uploadFileHandler}
                                                className="hidden"
                                                accept="image/svg+xml,image/jpeg,image/jpg,image/png,image/webp"
                                            />
                                        </label>
                                    </div>

                                    {image && (
                                        <div className="mt-4">
                                            <img
                                                src={image}
                                                alt="Preview"
                                                className="w-full h-64 object-cover rounded-lg border border-luxe-charcoal/10"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                {/* Fragrance Notes (for perfumes) */}
                                {!isSkincare && (
                                    <div className="bg-luxe-warm-white rounded-lg border border-luxe-charcoal/10 p-6 space-y-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="font-serif text-2xl font-light text-luxe-black">
                                                Notes Olfactives
                                            </h2>
                                            <button
                                                type="button"
                                                onClick={addFragranceNoteGroup}
                                                className="btn-luxe-secondary flex items-center gap-2"
                                            >
                                                <FaPlus className="w-4 h-4" />
                                                Ajouter un groupe
                                            </button>
                                        </div>

                                        {fragranceNotes.map((group, groupIndex) => (
                                            <div key={groupIndex} className="p-4 bg-luxe-champagne/20 rounded-lg space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <select
                                                        value={group.type || 'Top'}
                                                        onChange={(e) => updateFragranceNoteGroup(groupIndex, 'type', e.target.value)}
                                                        className="input-luxe w-auto"
                                                    >
                                                        <option value="Top">Top</option>
                                                        <option value="Coeur">Coeur</option>
                                                        <option value="Base">Base</option>
                                                    </select>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFragranceNoteGroup(groupIndex)}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                                                    >
                                                        <FaTimes className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {group.notes && group.notes.map((note, noteIndex) => (
                                                        <span
                                                            key={noteIndex}
                                                            className="inline-flex items-center gap-2 px-3 py-1 bg-luxe-warm-white rounded-full text-sm"
                                                        >
                                                            {note}
                                                            <button
                                                                type="button"
                                                                onClick={() => removeNoteFromGroup(groupIndex, noteIndex)}
                                                                className="text-red-500 hover:text-red-700"
                                                            >
                                                                <FaTimes className="w-3 h-3" />
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Ajouter une note..."
                                                        className="input-luxe flex-1"
                                                        onKeyPress={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                const note = e.target.value.trim();
                                                                if (note) {
                                                                    addNoteToGroup(groupIndex, note);
                                                                    e.target.value = '';
                                                                }
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Benefits (for skincare) */}
                                {isSkincare && (
                                    <div className="bg-luxe-warm-white rounded-lg border border-luxe-charcoal/10 p-6 space-y-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="font-serif text-2xl font-light text-luxe-black">
                                                Bienfaits
                                            </h2>
                                            <button
                                                type="button"
                                                onClick={addBenefit}
                                                className="btn-luxe-secondary flex items-center gap-2"
                                            >
                                                <FaPlus className="w-4 h-4" />
                                                Ajouter
                                            </button>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {benefits.map((benefit, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center gap-2 px-3 py-1 bg-luxe-champagne/30 rounded-full text-sm"
                                                >
                                                    {benefit}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeBenefit(index)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <FaTimes className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex items-center justify-end gap-4 pt-6 border-t border-luxe-charcoal/10">
                            <Link
                                to="/admin/products"
                                className="btn-luxe-secondary"
                            >
                                Annuler
                            </Link>
                            <button
                                type="submit"
                                className="btn-luxe-gold flex items-center gap-2"
                                disabled={loadingUpdate}
                            >
                                <FaSave className="w-4 h-4" />
                                {loadingUpdate ? 'Enregistrement...' : 'Enregistrer'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </AdminLayout>
    );
};

export default ProductEditScreen;
