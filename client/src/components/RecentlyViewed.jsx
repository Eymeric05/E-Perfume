import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Store } from '../context/StoreContext';
import Product from './Product';

const RecentlyViewed = () => {
  const { state } = useContext(Store);
  const { viewedProducts } = state;

  if (!viewedProducts || viewedProducts.length === 0) return null;

  const recentProducts = Array.isArray(viewedProducts)
    ? viewedProducts.slice(0, 6)
    : [];

  if (recentProducts.length === 0) return null;

  return (
    <section className="section-spacing bg-luxe-cream">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="font-serif text-4xl md:text-5xl font-light text-luxe-black mb-4">
              Récemment consultés
            </h2>
            <p className="font-sans text-lg text-luxe-charcoal/70">
              Vos dernières visites
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {recentProducts
            .filter((product) => product && product._id) // Filtrer les produits sans ID
            .map((product, index) => (
              <Product key={product._id || `product-${index}`} product={product} index={index} />
            ))}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewed;



