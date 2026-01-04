import React from 'react';
import '../styles/components/ProductBadges.css';

const ProductBadges = ({ product }) => {
  if (!product) return null;

  const badges = [];

  if (product.isNew) {
    badges.push({
      label: 'Nouveau',
      className: 'bg-luxe-gold text-luxe-black',
    });
  }

  if (product.isBestseller) {
    badges.push({
      label: 'Best-seller',
      className: 'bg-luxe-black text-luxe-cream',
    });
  }

  if (product.onSale && product.salePrice) {
    const discount = Math.round(((product.price - product.salePrice) / product.price) * 100);
    badges.push({
      label: `-${discount}%`,
      className: 'bg-red-600 text-white',
    });
  }

  if (product.featured) {
    badges.push({
      label: 'Exclusif',
      className: 'bg-luxe-charcoal text-luxe-gold',
    });
  }

  if (badges.length === 0) return null;

  return (
    <div className="product-badges-container">
      {badges.map((badge, index) => (
        <span
          key={index}
          className={`product-badge ${badge.className}`}
        >
          {badge.label}
        </span>
      ))}
    </div>
  );
};

export default ProductBadges;



