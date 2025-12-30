import React, { useState, useRef, useEffect } from 'react';
import { FaTimes, FaChevronLeft, FaChevronRight, FaExpand } from 'react-icons/fa';

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
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
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
      className="fixed inset-0 bg-luxe-black/95 z-[100] flex items-center justify-center"
      onClick={onClose}
    >
      <div
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center p-4"
        onWheel={handleWheel}
        onMouseMove={handleMouseMove}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-3 text-luxe-cream hover:text-luxe-gold transition-colors"
          aria-label="Fermer"
        >
          <FaTimes className="w-6 h-6" />
        </button>

        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 z-10 p-3 text-luxe-cream hover:text-luxe-gold transition-colors bg-luxe-black/50 rounded-full"
              aria-label="Image précédente"
            >
              <FaChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 z-10 p-3 text-luxe-cream hover:text-luxe-gold transition-colors bg-luxe-black/50 rounded-full"
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
            className="max-w-full max-h-[90vh] object-contain transition-transform duration-300"
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
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-luxe-cream text-sm font-sans">
              Double-clic pour réinitialiser le zoom
            </div>
          )}
        </div>

        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => {
                  setActiveIndex(index);
                  setZoomLevel(1);
                  setPosition({ x: 0, y: 0 });
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === activeIndex ? 'bg-luxe-gold w-8' : 'bg-luxe-cream/50'
                }`}
                aria-label={`Image ${index + 1}`}
              />
            ))}
          </div>
        )}

        <div className="absolute top-4 left-4 text-luxe-cream/70 text-sm font-sans">
          {safeActiveIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  );
};

export default ImageZoom;

