import React from 'react';

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
    <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
      {badges.map((badge, index) => (
        <span
          key={index}
          className={`${badge.className} px-3 py-1 text-xs font-sans font-bold uppercase tracking-wider shadow-lg animate-fade-in`}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {badge.label}
        </span>
      ))}
    </div>
  );
};

export default ProductBadges;






