import React, { useState, useRef, useEffect } from 'react';
import { FaTimes, FaChevronLeft, FaChevronRight, FaExpand } from 'react-icons/fa';
import '../styles/components/_image-zoom.scss';

const ImageZoom = ({ images, currentIndex = 0, isOpen, onClose, productName }) => {
  const [activeIndex, setActiveIndex] = useState(currentIndex);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    setActiveIndex(currentIndex);
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  }, [currentIndex, isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeIndex]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleWheel = (e) => {
    if (!isZooming) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoomLevel((prev) => Math.max(1, Math.min(3, prev + delta)));
  };

  const handleMouseMove = (e) => {
    if (!isZooming || zoomLevel <= 1) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 100;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 100;
    setPosition({ x, y });
  };

  if (!isOpen || !images || !Array.isArray(images) || images.length === 0) return null;
  
  // Ensure activeIndex is within bounds
  const safeActiveIndex = Math.min(activeIndex, images.length - 1);

  return (
    <div
      className="image-zoom-overlay"
      onClick={onClose}
    >
      <div
        ref={containerRef}
        className="image-zoom-container"
        onWheel={handleWheel}
        onMouseMove={handleMouseMove}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="image-zoom-close"
          aria-label="Fermer"
        >
          <FaTimes className="w-6 h-6" />
        </button>

        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="image-zoom-nav image-zoom-nav-prev"
              aria-label="Image précédente"
            >
              <FaChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="image-zoom-nav image-zoom-nav-next"
              aria-label="Image suivante"
            >
              <FaChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        <div className="relative max-w-7xl max-h-full">
          <img
            ref={imageRef}
            src={images[safeActiveIndex] || images[0]}
            alt={productName || 'Produit'}
            className="image-zoom-image"
            style={{
              transform: `scale(${zoomLevel}) translate(${position.x}%, ${position.y}%)`,
              cursor: zoomLevel > 1 ? 'move' : 'zoom-in',
            }}
            onDoubleClick={() => {
              setIsZooming(true);
              setZoomLevel(zoomLevel > 1 ? 1 : 2);
              if (zoomLevel <= 1) setIsZooming(false);
            }}
            onMouseLeave={() => {
              if (zoomLevel <= 1) setIsZooming(false);
            }}
          />

          {zoomLevel > 1 && (
            <div className="image-zoom-hint">
              Double-clic pour réinitialiser le zoom
            </div>
          )}
        </div>

        {images.length > 1 && (
          <div className="image-zoom-indicators">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => {
                  setActiveIndex(index);
                  setZoomLevel(1);
                  setPosition({ x: 0, y: 0 });
                }}
                className={`image-zoom-indicator ${index === activeIndex ? 'active' : ''}`}
                aria-label={`Image ${index + 1}`}
              />
            ))}
          </div>
        )}

        <div className="image-zoom-counter">
          {safeActiveIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  );
};

export default ImageZoom;

