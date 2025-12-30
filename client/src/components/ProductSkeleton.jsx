import React from 'react';

const ProductSkeleton = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="product-card">
          <div className="aspect-square bg-luxe-charcoal/5 skeleton mb-4"></div>
          <div className="p-4 space-y-3">
            <div className="h-5 bg-luxe-charcoal/10 skeleton rounded w-3/4"></div>
            <div className="h-3 bg-luxe-charcoal/10 skeleton rounded w-1/2"></div>
            <div className="h-4 bg-luxe-charcoal/10 skeleton rounded w-1/3"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductSkeleton;

