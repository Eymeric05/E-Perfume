import React, { useContext, useEffect, useReducer, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Store } from '../../context/StoreContext';
import AdminLayout from '../../components/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FaArrowLeft, FaUpload, FaSave, FaImage } from 'react-icons/fa';
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

const BrandEditScreen = () => {
  const navigate = useNavigate();
  const params = useParams();
  const { brandName } = params;
  const decodedBrandName = decodeURIComponent(brandName || '');
  const { state } = useContext(Store);
  const { userInfo } = state;

  const [{ loading, error, loadingUpdate, loadingUpload }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  const [brandLogo, setBrandLogo] = useState('');
  const [heroImage, setHeroImage] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const fetchBrand = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const res = await apiFetch(`/api/brands/${encodeURIComponent(decodedBrandName)}`);
        
        if (res.status === 404) {
          // Brand doesn't exist yet, that's ok
          dispatch({ type: 'FETCH_SUCCESS' });
          return;
        }

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
        setBrandLogo(data.brandLogo || '');
        setHeroImage(data.heroImage || '');
        setDescription(data.description || '');
        dispatch({ type: 'FETCH_SUCCESS' });
      } catch (err) {
        console.error('Error fetching brand:', err);
        dispatch({ type: 'FETCH_FAIL', payload: err.message });
      }
    };

    if (decodedBrandName) {
      fetchBrand();
    }
  }, [decodedBrandName]);

  const uploadFileHandler = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const bodyFormData = new FormData();
    bodyFormData.append('image', file);

    try {
      dispatch({ type: 'UPLOAD_REQUEST' });
      const res = await apiFetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: bodyFormData,
      });

      if (!res.ok) {
        throw new Error('Upload failed');
      }

      // The upload route returns the URL directly as text, not JSON
      const imageUrl = await res.text();
      
      if (type === 'logo') {
        setBrandLogo(imageUrl);
      } else if (type === 'hero') {
        setHeroImage(imageUrl);
      }
      
      dispatch({ type: 'UPLOAD_SUCCESS' });
    } catch (err) {
      console.error('Error uploading image:', err);
      dispatch({ type: 'UPLOAD_FAIL' });
      alert('Erreur lors du téléchargement de l\'image');
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      dispatch({ type: 'UPDATE_REQUEST' });
      
      const res = await apiFetch(`/api/brands/${encodeURIComponent(decodedBrandName)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify({
          brandLogo,
          heroImage,
          description,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      dispatch({ type: 'UPDATE_SUCCESS' });
      navigate('/admin/brands');
    } catch (err) {
      console.error('Error updating brand:', err);
      dispatch({ type: 'UPDATE_FAIL' });
      alert(err.message || 'Erreur lors de la mise à jour de la marque');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            to="/admin/brands"
            className="p-2 text-luxe-charcoal/70 dark:text-luxe-cream/70 hover:text-luxe-gold transition-colors"
          >
            <FaArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-serif text-4xl font-light text-luxe-black dark:text-luxe-cream mb-2">
              {decodedBrandName}
            </h1>
            <p className="font-sans text-sm text-luxe-charcoal/70 dark:text-luxe-cream/70">
              Personnaliser l'image hero et le logo de la marque
            </p>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="font-sans text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        ) : (
          <form onSubmit={submitHandler} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Images */}
              <div className="space-y-6">
                {/* Hero Image */}
                <div className="bg-luxe-warm-white dark:bg-luxe-charcoal rounded-lg border border-luxe-charcoal/10 dark:border-luxe-gold/20 p-6 space-y-4">
                  <h2 className="font-serif text-2xl font-light text-luxe-black dark:text-luxe-cream mb-4">
                    Image Hero
                  </h2>
                  
                  <div className="relative">
                    <label className="block font-sans text-sm font-medium text-luxe-charcoal/70 dark:text-luxe-cream/70 mb-2">
                      Image d'arrière-plan (recommandé: 1920x1080px)
                    </label>
                    <div className="relative h-64 bg-gradient-to-br from-luxe-cream dark:from-luxe-charcoal to-luxe-warm-white dark:to-luxe-charcoal rounded-lg overflow-hidden border border-luxe-charcoal/20 dark:border-luxe-gold/20">
                      {heroImage ? (
                        <img
                          src={heroImage}
                          alt="Hero"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FaImage className="w-16 h-16 text-luxe-charcoal/20 dark:text-luxe-cream/20" />
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex gap-4">
                      <label className="btn-luxe-secondary flex items-center gap-2 cursor-pointer">
                        <FaUpload className="w-4 h-4" />
                        {loadingUpload ? 'Upload...' : 'Upload'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => uploadFileHandler(e, 'hero')}
                          className="hidden"
                          disabled={loadingUpload}
                        />
                      </label>
                      <input
                        type="text"
                        placeholder="Ou entrer une URL"
                        value={heroImage}
                        onChange={(e) => setHeroImage(e.target.value)}
                        className="input-luxe flex-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Brand Logo */}
                <div className="bg-luxe-warm-white dark:bg-luxe-charcoal rounded-lg border border-luxe-charcoal/10 dark:border-luxe-gold/20 p-6 space-y-4">
                  <h2 className="font-serif text-2xl font-light text-luxe-black dark:text-luxe-cream mb-4">
                    Logo de la Marque
                  </h2>
                  
                  <div className="relative">
                    <label className="block font-sans text-sm font-medium text-luxe-charcoal/70 dark:text-luxe-cream/70 mb-2">
                      Logo (recommandé: format PNG avec fond transparent)
                    </label>
                    <div className="relative h-32 bg-luxe-cream dark:bg-luxe-charcoal rounded-lg overflow-hidden border border-luxe-charcoal/20 dark:border-luxe-gold/20 flex items-center justify-center">
                      {brandLogo ? (
                        <img
                          src={brandLogo}
                          alt="Logo"
                          className="h-full w-auto object-contain"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <FaImage className="w-12 h-12 text-luxe-charcoal/20 dark:text-luxe-cream/20" />
                      )}
                    </div>
                    <div className="mt-4 flex gap-4">
                      <label className="btn-luxe-secondary flex items-center gap-2 cursor-pointer">
                        <FaUpload className="w-4 h-4" />
                        {loadingUpload ? 'Upload...' : 'Upload'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => uploadFileHandler(e, 'logo')}
                          className="hidden"
                          disabled={loadingUpload}
                        />
                      </label>
                      <input
                        type="text"
                        placeholder="Ou entrer une URL"
                        value={brandLogo}
                        onChange={(e) => setBrandLogo(e.target.value)}
                        className="input-luxe flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Description */}
              <div className="space-y-6">
                <div className="bg-luxe-warm-white dark:bg-luxe-charcoal rounded-lg border border-luxe-charcoal/10 dark:border-luxe-gold/20 p-6 space-y-4">
                  <h2 className="font-serif text-2xl font-light text-luxe-black dark:text-luxe-cream mb-4">
                    Description
                  </h2>
                  
                  <div>
                    <label className="block font-sans text-sm font-medium text-luxe-charcoal/70 dark:text-luxe-cream/70 mb-2">
                      Description de la marque (optionnel)
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={10}
                      className="input-luxe w-full resize-none"
                      placeholder="Décrivez la marque..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-luxe-charcoal/10 dark:border-luxe-gold/20">
              <Link
                to="/admin/brands"
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

export default BrandEditScreen;
