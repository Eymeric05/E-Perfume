import React from 'react';
import '../styles/components/LoadingSpinner.css';

const LoadingSpinner = ({ size = 'md', text = 'Chargement...' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className="loading-spinner-container">
      <div className={`spinner-luxe ${sizeClasses[size]} mx-auto`}></div>
      {text && (
        <div className="loading-spinner-text">
          <p>{text}</p>
          <div className="loading-spinner-dots">
            <div className="loading-spinner-dot"></div>
            <div className="loading-spinner-dot"></div>
            <div className="loading-spinner-dot"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;

