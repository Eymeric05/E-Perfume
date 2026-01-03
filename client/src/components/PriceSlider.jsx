import React, { useState, useRef, useEffect } from 'react';

const PriceSlider = ({ min = 0, max = 500, onRangeChange, initialMin, initialMax }) => {
  const [minValue, setMinValue] = useState(initialMin !== undefined ? initialMin : min);
  const [maxValue, setMaxValue] = useState(initialMax !== undefined ? initialMax : max);
  const [isDragging, setIsDragging] = useState(null);
  const sliderRef = useRef(null);

  const percentage = (value) => ((value - min) / (max - min)) * 100;

  // Update values when initialMin/initialMax change (for reset)
  useEffect(() => {
    if (initialMin !== undefined) {
      setMinValue(initialMin);
    } else {
      setMinValue(min);
    }
    if (initialMax !== undefined) {
      setMaxValue(initialMax);
    } else {
      setMaxValue(max);
    }
  }, [initialMin, initialMax, min, max]);

  const updateValue = (clientX, type) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const value = Math.round(min + (percent / 100) * (max - min));

    if (type === 'min') {
      const newMin = Math.min(value, maxValue - 10);
      setMinValue(newMin);
      onRangeChange({ min: newMin, max: maxValue });
    } else if (type === 'max') {
      const newMax = Math.max(value, minValue + 10);
      setMaxValue(newMax);
      onRangeChange({ min: minValue, max: newMax });
    }
  };

  useEffect(() => {
    if (isDragging) {
      const handleMove = (e) => {
        e.preventDefault();
        updateValue(e.clientX, isDragging);
      };

      const handleUp = () => {
        setIsDragging(null);
      };

      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleUp);
      document.addEventListener('mouseleave', handleUp);
      return () => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleUp);
        document.removeEventListener('mouseleave', handleUp);
      };
    }
  }, [isDragging, minValue, maxValue, min, max, onRangeChange]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <span className="font-sans text-sm text-luxe-charcoal/70 dark:text-luxe-cream/70">
          {minValue}€ - {maxValue}€
        </span>
      </div>
      <div
        ref={sliderRef}
        className="relative h-2 bg-luxe-charcoal/10 dark:bg-luxe-cream/10 rounded-full cursor-pointer"
        onMouseDown={(e) => {
          // Only handle click on the bar itself, not on handles or active range
          const target = e.target;
          const isHandle = target.classList.contains('slider-handle') || 
                          target.closest('.slider-handle');
          const isActiveRange = target.classList.contains('slider-range') ||
                               target.closest('.slider-range');
          
          if (!isHandle && !isActiveRange) {
            const rect = sliderRef.current.getBoundingClientRect();
            const percent = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
            const value = Math.round(min + (percent / 100) * (max - min));
            
            // Determine which handle is closer
            const distToMin = Math.abs(value - minValue);
            const distToMax = Math.abs(value - maxValue);
            
            if (distToMin < distToMax) {
              setIsDragging('min');
              updateValue(e.clientX, 'min');
            } else {
              setIsDragging('max');
              updateValue(e.clientX, 'max');
            }
          }
        }}
      >
        <div
          className="absolute h-2 bg-luxe-gold rounded-full transition-all duration-300 ease-out slider-range pointer-events-none"
          style={{
            left: `${percentage(minValue)}%`,
            width: `${percentage(maxValue) - percentage(minValue)}%`,
          }}
        />
        <div
          className={`absolute w-5 h-5 bg-luxe-gold rounded-full shadow-lg cursor-grab active:cursor-grabbing transform -translate-y-1.5 transition-all duration-300 hover:scale-125 hover:shadow-xl z-10 slider-handle ${
            isDragging === 'min' ? 'scale-125 shadow-2xl' : ''
          }`}
          style={{ left: `calc(${percentage(minValue)}% - 10px)` }}
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setIsDragging('min');
          }}
        />
        <div
          className={`absolute w-5 h-5 bg-luxe-gold rounded-full shadow-lg cursor-grab active:cursor-grabbing transform -translate-y-1.5 transition-all duration-300 hover:scale-125 hover:shadow-xl z-10 slider-handle ${
            isDragging === 'max' ? 'scale-125 shadow-2xl' : ''
          }`}
          style={{ left: `calc(${percentage(maxValue)}% - 10px)` }}
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setIsDragging('max');
          }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-luxe-charcoal/50 dark:text-luxe-cream/50">
        <span>{min}€</span>
        <span>{max}€</span>
      </div>
    </div>
  );
};

export default PriceSlider;

