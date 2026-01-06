import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Store } from '../context/StoreContext';
import { Helmet } from 'react-helmet-async';
import { FaArrowLeft, FaStar, FaStarHalfAlt, FaRegStar, FaShoppingCart, FaPlus, FaMinus, FaExpand, FaTruck, FaUndo, FaShieldAlt } from 'react-icons/fa';
import ImageZoom from '../components/ImageZoom';
import WishlistButton from '../components/WishlistButton';
import SimilarProducts from '../components/SimilarProducts';
import ProductBadges from '../components/ProductBadges';
import FragranceNotes from '../components/FragranceNotes';
import { apiFetch } from '../utils/api';

const ReviewForm = ({ productId, onReviewAdded }) => {
  const { state } = useContext(Store);
  const { userInfo } = state;
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!rating || !comment.trim()) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await apiFetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify({ rating, comment }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Erreur lors de l\'ajout de l\'avis');
      }

      setSuccess(true);
      setRating(0);
      setComment('');
      setHoveredRating(0);
      
      if (onReviewAdded) {
        onReviewAdded();
      }

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'ajout de l\'avis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-luxe-warm-white dark:bg-luxe-charcoal rounded-lg border border-luxe-charcoal/10 dark:border-luxe-gold/20 p-6 mb-8">
      <h3 className="font-serif text-xl font-normal text-luxe-black dark:text-luxe-cream mb-4">
        Laisser un avis
      </h3>
      <form onSubmit={submitHandler}>
        <div className="mb-4">
          <label className="block font-sans text-sm font-medium text-luxe-black dark:text-luxe-cream mb-2">
            Note
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="focus:outline-none"
              >
                <span className="text-luxe-gold">
                  {(hoveredRating || rating) >= star ? (
                    <FaStar className="w-6 h-6" />
                  ) : (
                    <FaRegStar className="w-6 h-6 text-luxe-charcoal/30 dark:text-luxe-cream/30" />
                  )}
                </span>
              </button>
            ))}
            {rating > 0 && (
              <span className="font-sans text-sm text-luxe-charcoal/70 dark:text-luxe-cream/70 ml-2">
                {rating}/5
              </span>
            )}
          </div>
        </div>

        <div className="mb-4">
          <label className="block font-sans text-sm font-medium text-luxe-black dark:text-luxe-cream mb-2">
            Commentaire
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows="4"
            className="input-luxe w-full"
            placeholder="Partagez votre expérience avec ce produit..."
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
            {userInfo?.isAdmin 
              ? 'Votre avis a été publié avec succès.'
              : 'Votre avis a été soumis et sera publié après modération.'}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !rating || !comment.trim()}
          className="btn-luxe-gold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Envoi...' : 'Publier l\'avis'}
        </button>
      </form>
    </div>
  );
};

const ProductScreen = () => {
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const { id } = useParams();
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart, userInfo } = state;

  useEffect(() => {
    // Scroll to top immediately when component mounts or product ID changes
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Vérifier que l'ID est valide (format MongoDB ObjectId)
        if (!id || id.length !== 24) {
          throw new Error('ID de produit invalide');
        }
        
        const res = await apiFetch(`/api/products/${id}`);
        
        if (!res.ok) {
          // Si le produit n'existe pas, le supprimer de la liste des produits consultés
          if (res.status === 404) {
            ctxDispatch({ type: 'REMOVE_VIEWED_PRODUCT', payload: id });
          }
          throw new Error('Produit non trouvé');
        }
        
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await res.text();
          throw new Error(`Réponse invalide du serveur: ${text.substring(0, 100)}`);
        }
        
        const data = await res.json();
        
        if (!data || !data._id) {
          throw new Error('Données de produit invalides');
        }
        
        setProduct(data);
        
        // Initialize image selection - use images array if available, otherwise use single image
        if (data.images && Array.isArray(data.images) && data.images.length > 0 && data.images.some(img => img)) {
          setSelectedImage(0);
        } else {
          setSelectedImage(0); // Always reset to first image
        }
        
        ctxDispatch({ type: 'ADD_VIEWED_PRODUCT', payload: data });
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (error) {
        console.error('Error fetching product:', error);
        setError(error.message || 'Erreur lors du chargement du produit');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, ctxDispatch]);

  const addToCartHandler = async () => {
    if (!product?._id) return;
    
    const existItem = cart.cartItems.find((x) => x._id === product._id);
    const newQuantity = existItem ? existItem.quantity + quantity : quantity;

    if (product.countInStock < newQuantity) {
      window.alert('Désolé, le produit est en rupture de stock');
      return;
    }

    ctxDispatch({
      type: 'CART_ADD_ITEM',
      payload: { ...product, quantity },
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price || 0);
  };

  // Determine if product is skincare or perfume
  const isSkincare = product?.category === 'skincare';
  
  // Extract fragrance notes for perfumes (handle both array and undefined)
  const fragranceNotes = product?.fragranceNotes && Array.isArray(product.fragranceNotes) && product.fragranceNotes.length > 0 
    ? product.fragranceNotes 
    : [];
  
  // Extract benefits for skincare (handle both array and undefined)
  const benefits = product?.benefits && Array.isArray(product.benefits) && product.benefits.length > 0 
    ? product.benefits 
    : [];

  // Handle images: combine main image with additional images
  // Always ensure we have at least the main image
  const mainImage = product?.image || '';
  const imagesFromDB = product?.images && Array.isArray(product.images) 
    ? product.images.filter(img => img && img.trim() !== '') 
    : [];
  
  // Combine: main image first, then additional images (remove duplicates)
  // Filter out the main image from the array to avoid duplicates
  const additionalImages = imagesFromDB.filter(img => img !== mainImage);
  const allImages = mainImage ? [mainImage, ...additionalImages] : additionalImages;
  const images = allImages.filter(img => img && img.trim() !== '');

  const Rating = ({ value, text }) => {
    const numValue = Number(value) || 0;
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className="text-luxe-gold">
            {numValue >= star ? (
              <FaStar className="w-4 h-4" />
            ) : numValue >= star - 0.5 ? (
              <FaStarHalfAlt className="w-4 h-4" />
            ) : (
              <FaRegStar className="w-4 h-4 text-luxe-charcoal/30 dark:text-luxe-cream/30" />
            )}
          </span>
        ))}
        {text && (
          <span className="font-sans text-sm text-luxe-charcoal/60 dark:text-luxe-cream/70 ml-3">
            {text}
          </span>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-luxe-cream dark:bg-luxe-charcoal flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="spinner-luxe w-12 h-12 mx-auto"></div>
          <div className="space-y-2">
            <p className="font-serif text-lg text-luxe-black dark:text-luxe-cream">Chargement...</p>
            <p className="font-sans text-sm text-luxe-charcoal/60 dark:text-luxe-cream/70">Préparation de votre expérience</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-luxe-cream dark:bg-luxe-charcoal">
        <Helmet>
          <title>Produit non trouvé - E-perfume</title>
        </Helmet>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 font-sans text-sm text-luxe-charcoal/70 dark:text-luxe-cream/70 hover:text-luxe-gold transition-colors duration-200 mb-8"
          >
            <FaArrowLeft className="w-4 h-4" />
            Retour aux collections
          </Link>
          <div className="text-center py-20">
            <p className="font-sans text-lg text-luxe-charcoal/70 dark:text-luxe-cream/70 mb-4">
              {error || 'Produit non trouvé'}
            </p>
            <Link to="/products" className="btn-luxe-gold">
              Retour aux produits
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luxe-cream dark:bg-luxe-charcoal">
      <Helmet>
        <title>{product?.name || 'Produit'} - E-perfume</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 fade-in">
        {/* Back Button */}
        <Link
          to="/products"
          className="inline-flex items-center gap-2 font-sans text-sm text-luxe-charcoal/70 dark:text-luxe-cream/70 hover:text-luxe-gold transition-all duration-300 mb-8 group hover:gap-3"
        >
          <FaArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
          Retour aux collections
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 mb-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <figure className="relative aspect-square bg-luxe-warm-white dark:bg-luxe-charcoal overflow-hidden group">
              <ProductBadges product={product} />
              <img
                src={
                  images.length > 0 && images[selectedImage] && images[selectedImage].trim() !== ''
                    ? images[selectedImage]
                    : (product?.image || 'https://via.placeholder.com/800')
                }
                alt={product?.name || 'Produit'}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 cursor-zoom-in"
                onClick={() => setIsZoomOpen(true)}
                itemProp="image"
                onError={(e) => {
                  const fallbackImage = product?.image || 'https://via.placeholder.com/800';
                  if (e.target.src !== fallbackImage) {
                    e.target.src = fallbackImage;
                  }
                }}
              />
              <figcaption className="sr-only">{product?.name || 'Produit'}</figcaption>
              <div className="absolute inset-0 bg-gradient-to-t from-luxe-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <button
                onClick={() => setIsZoomOpen(true)}
                className="absolute bottom-4 right-4 p-3 bg-luxe-black/70 text-luxe-cream hover:bg-luxe-gold hover:text-luxe-black transition-all duration-300 opacity-0 group-hover:opacity-100"
                aria-label="Agrandir l'image"
              >
                <FaExpand className="w-5 h-5" />
              </button>
            </figure>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square overflow-hidden border-2 transition-all duration-200 rounded ${selectedImage === index
                        ? 'border-luxe-gold ring-2 ring-luxe-gold/30'
                        : 'border-luxe-charcoal/10 dark:border-luxe-gold/20 hover:border-luxe-charcoal/30 dark:hover:border-luxe-gold/40'
                      }`}
                  >
                    <img
                      src={img || product?.image}
                      alt={`${product?.name || 'Produit'} - Vue ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = product?.image || 'https://via.placeholder.com/200';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {product?.brand && (
              <Link
                to={`/brand/${encodeURIComponent(product.brand)}`}
                className="inline-flex items-center gap-2 font-sans text-sm tracking-widest uppercase text-luxe-gold hover:text-luxe-gold/80 transition-colors duration-200 group"
              >
                {product.brandLogo && (
                  <img
                    src={product.brandLogo}
                    alt={product.brand}
                    className="h-5 w-auto object-contain opacity-80 dark:brightness-0 dark:invert dark:opacity-90 group-hover:opacity-100 transition-opacity duration-200"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                <span>{product.brand}</span>
                <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
              </Link>
            )}

            <h1 className="font-serif text-4xl md:text-6xl font-light text-luxe-black dark:text-luxe-cream">
              {product?.name || 'Chargement...'}
            </h1>

            {product?.rating !== undefined && (
              <Rating value={product.rating} text={`${product.numReviews || 0} avis`} />
            )}

            {product?.price !== undefined && (
              <div className="pt-4 border-t border-luxe-charcoal/10 dark:border-luxe-gold/20 flex items-center justify-between">
                <div>
                  <span className="font-serif text-3xl md:text-4xl font-normal text-luxe-black dark:text-luxe-cream">
                    {formatPrice(product.onSale && product.salePrice ? product.salePrice : product.price)}
                  </span>
                  {product.onSale && product.salePrice && (
                    <span className="font-sans text-lg text-luxe-charcoal/50 dark:text-luxe-cream/50 line-through ml-3">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>
                <div className="flex gap-3">
                  <WishlistButton product={product} />
                </div>
              </div>
            )}

            {/* Fragrance Notes for Perfumes */}
            {!isSkincare && <FragranceNotes fragranceNotes={fragranceNotes} />}

            {/* Benefits for Skincare */}
            {isSkincare && benefits && benefits.length > 0 && (
              <div className="py-6 border-t border-b border-luxe-charcoal/10 dark:border-luxe-gold/20">
                <h3 className="font-serif text-xl font-normal text-luxe-black dark:text-luxe-cream mb-4">
                  Bienfaits
                </h3>
                <div className="flex flex-wrap gap-2">
                  {benefits.map((benefit, index) => (
                    <span
                      key={index}
                      className="tag-filter"
                    >
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Ingredients for Skincare */}
            {isSkincare && product?.ingredients && (
              <div className="py-6 border-t border-b border-luxe-charcoal/10 dark:border-luxe-gold/20">
                <h3 className="font-serif text-xl font-normal text-luxe-black dark:text-luxe-cream mb-4">
                  Ingrédients
                </h3>
                <p className="font-sans text-sm text-luxe-charcoal/70 leading-relaxed">
                  {product.ingredients}
                </p>
              </div>
            )}

            {/* Skin Type for Skincare */}
            {isSkincare && product?.skinType && (
              <div className="py-6 border-t border-b border-luxe-charcoal/10 dark:border-luxe-gold/20">
                <h3 className="font-serif text-xl font-normal text-luxe-black dark:text-luxe-cream mb-4">
                  Type de Peau
                </h3>
                <span className="tag-filter">
                  {product.skinType}
                </span>
              </div>
            )}

            {/* Description */}
            {product?.description && (
              <div className="space-y-4">
                <h3 className="font-serif text-xl font-normal text-luxe-black dark:text-luxe-cream">Description</h3>
                <div className="font-sans text-base text-luxe-charcoal/70 dark:text-luxe-cream/70 leading-relaxed">
                  {product.description.split(/\n\s*\n/).map((paragraph, index) => {
                    const trimmedParagraph = paragraph.trim();
                    if (!trimmedParagraph) return null;
                    
                    // Détecter les titres en majuscules (sections comme "LA CRÉATION", "NOTES OLFACTIVES")
                    const isTitle = trimmedParagraph.length > 0 && 
                                   trimmedParagraph.length < 60 && 
                                   trimmedParagraph === trimmedParagraph.toUpperCase() &&
                                   !trimmedParagraph.includes('.') &&
                                   !trimmedParagraph.match(/[0-9]/);
                    
                    if (isTitle) {
                      return (
                        <h4 key={index} className="font-serif text-lg font-medium text-luxe-black dark:text-luxe-cream mt-6 mb-3 first:mt-0">
                          {trimmedParagraph}
                        </h4>
                      );
                    }
                    
                    // Pour les paragraphes normaux, préserver les sauts de ligne simples
                    return (
                      <p key={index} className="mb-4 last:mb-0 whitespace-pre-line">
                        {trimmedParagraph}
                      </p>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Add to Cart */}
            {product?._id && (
              <div className="pt-6 border-t border-luxe-charcoal/10 dark:border-luxe-gold/20 space-y-4">
                {product.countInStock > 0 ? (
                <>
                  <div className="flex items-center gap-4">
                    <span className="font-sans text-sm uppercase tracking-wider text-luxe-charcoal/70 dark:text-luxe-cream/70">
                      Quantité
                    </span>
                    <div className="flex items-center gap-3 border border-luxe-charcoal/20 dark:border-luxe-gold/30">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-2 hover:bg-luxe-champagne/30 transition-colors"
                        disabled={quantity <= 1}
                      >
                        <FaMinus className="w-3 h-3" />
                      </button>
                      <span className="font-sans text-base w-12 text-center text-luxe-black dark:text-luxe-cream">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(product.countInStock, quantity + 1))}
                        className="p-2 hover:bg-luxe-champagne/30 transition-colors"
                        disabled={quantity >= product.countInStock}
                      >
                        <FaPlus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="font-sans text-xs text-luxe-charcoal/60">
                      {product.countInStock} en stock
                    </span>
                  </div>

                  <button
                    onClick={addToCartHandler}
                    className="w-full btn-luxe-gold flex items-center justify-center gap-2 ripple hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200 group"
                  >
                    <FaShoppingCart className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                    Ajouter au Panier
                  </button>
                </>
              ) : (
                <div className="p-4 bg-luxe-charcoal/5 dark:bg-luxe-gold/10 border border-luxe-charcoal/20 dark:border-luxe-gold/30 text-center">
                  <p className="font-sans text-sm text-luxe-charcoal/70 dark:text-luxe-cream/70">
                    Ce produit est actuellement épuisé
                  </p>
                </div>
              )}
              </div>
            )}
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-luxe-charcoal/10 dark:border-luxe-gold/20">
          <div>
            <h4 className="font-serif text-lg font-normal text-luxe-black dark:text-luxe-cream mb-2 flex items-center gap-2">
              <FaTruck className="text-luxe-gold" />
              Livraison
            </h4>
            <p className="font-sans text-sm text-luxe-charcoal/70 dark:text-luxe-cream/70">
              Livraison gratuite à partir de 100€
            </p>
          </div>
          <div>
            <h4 className="font-serif text-lg font-normal text-luxe-black dark:text-luxe-cream mb-2 flex items-center gap-2">
              <FaUndo className="text-luxe-gold" />
              Retours
            </h4>
            <p className="font-sans text-sm text-luxe-charcoal/70 dark:text-luxe-cream/70">
              Retours gratuits sous 30 jours
            </p>
          </div>
          <div>
            <h4 className="font-serif text-lg font-normal text-luxe-black dark:text-luxe-cream mb-2 flex items-center gap-2">
              <FaShieldAlt className="text-luxe-gold" />
              Garantie
            </h4>
            <p className="font-sans text-sm text-luxe-charcoal/70 dark:text-luxe-cream/70">
              Produits authentiques garantis
            </p>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="pt-16 border-t border-luxe-charcoal/10 mt-16">
          <h2 className="font-serif text-3xl md:text-4xl font-light text-luxe-black dark:text-luxe-cream mb-8">
            Avis clients
          </h2>

          {/* Review Form */}
          {userInfo ? (
            <ReviewForm productId={id} onReviewAdded={() => {
              // Reload product data
              apiFetch(`/api/products/${id}`)
                .then(res => res.json())
                .then(data => setProduct(data))
                .catch(err => console.error('Error reloading product:', err));
            }} />
          ) : (
            <div className="bg-luxe-warm-white dark:bg-luxe-charcoal rounded-lg border border-luxe-charcoal/10 dark:border-luxe-gold/20 p-6 mb-8">
              <p className="font-sans text-sm text-luxe-charcoal/70 dark:text-luxe-cream/70 mb-4">
                Connectez-vous pour laisser un avis
              </p>
              <Link to="/login" className="btn-luxe-secondary">
                Se connecter
              </Link>
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-6 mt-8">
            {product?.reviews && product.reviews.length > 0 ? (
              product.reviews.map((review) => (
                <article
                  key={review._id}
                  className="bg-luxe-warm-white dark:bg-luxe-charcoal rounded-lg border border-luxe-charcoal/10 dark:border-luxe-gold/20 p-6"
                  itemScope
                  itemType="http://schema.org/Review"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-serif text-lg font-normal text-luxe-black dark:text-luxe-cream mb-1">
                        {review.name}
                      </h4>
                      <Rating value={review.rating} />
                    </div>
                    <span className="font-sans text-xs text-luxe-charcoal/60">
                      {new Date(review.createdAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="font-sans text-sm text-luxe-charcoal/70 dark:text-luxe-cream/70 leading-relaxed" itemProp="reviewBody">
                    {review.comment}
                  </p>
                </article>
              ))
            ) : (
              <div className="bg-luxe-warm-white dark:bg-luxe-charcoal rounded-lg border border-luxe-charcoal/10 dark:border-luxe-gold/20 p-12 text-center">
                <p className="font-sans text-sm text-luxe-charcoal/70 dark:text-luxe-cream/70">
                  Aucun avis pour le moment. Soyez le premier à laisser un avis !
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Similar Products */}
        <SimilarProducts product={product} />
      </div>

      {/* Image Zoom Modal */}
      <ImageZoom
        images={images}
        currentIndex={selectedImage}
        isOpen={isZoomOpen}
        onClose={() => setIsZoomOpen(false)}
        productName={product?.name}
      />
    </div>
  );
};

export default ProductScreen;
