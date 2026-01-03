import React from 'react';

const LoadingSpinner = ({ size = 'md', text = 'Chargement...' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <div className={`spinner-luxe ${sizeClasses[size]} mx-auto`}></div>
      {text && (
        <div className="space-y-2 text-center">
          <p className="font-serif text-lg text-luxe-black dark:text-luxe-cream">{text}</p>
          <div className="flex gap-1 justify-center">
            <div className="w-1 h-1 bg-luxe-gold rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1 h-1 bg-luxe-gold rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
            <div className="w-1 h-1 bg-luxe-gold rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;

