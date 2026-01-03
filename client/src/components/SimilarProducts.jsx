import React, { useEffect, useState } from 'react';
import Product from './Product';

const SimilarProducts = ({ product }) => {
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSimilarProducts = async () => {
      if (!product?._id) return;
      
      try {
        setLoading(true);
        let url = '/api/products?';
        
        if (product.fragranceFamily) {
          url += `fragranceFamily=${encodeURIComponent(product.fragranceFamily)}`;
        } else if (product.category) {
          url += `category=${encodeURIComponent(product.category)}`;
        } else {
          setLoading(false);
          return;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        const filtered = Array.isArray(data)
          ? data.filter((p) => p._id !== product._id).slice(0, 6)
          : [];
        
        setSimilarProducts(filtered);
      } catch (error) {
        console.error('Error fetching similar products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarProducts();
  }, [product]);

  if (loading || similarProducts.length === 0) return null;

  return (
    <section className="section-spacing bg-luxe-warm-white mt-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl md:text-5xl font-light text-luxe-black mb-4">
            Vous pourriez aussi aimer
          </h2>
          <p className="font-sans text-lg text-luxe-charcoal/70">
            Des produits similaires qui pourraient vous intéresser
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {similarProducts.map((similarProduct, index) => (
            <Product key={similarProduct._id} product={similarProduct} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SimilarProducts;



