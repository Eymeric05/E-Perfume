import React, { useState, useRef, useEffect } from 'react';
import '../styles/components/_price-slider.scss';

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
    <div className="price-slider-container">
      <div className="price-slider-header">
        <span className="price-slider-range">
          {minValue}€ - {maxValue}€
        </span>
      </div>
      <div
        ref={sliderRef}
        className="price-slider-track"
        onMouseDown={(e) => {
          const target = e.target;
          const isHandle = target.classList.contains('price-slider-handle') || 
                          target.closest('.price-slider-handle');
          const isActiveRange = target.classList.contains('price-slider-active-range') ||
                               target.closest('.price-slider-active-range');
          
          if (!isHandle && !isActiveRange) {
            const rect = sliderRef.current.getBoundingClientRect();
            const percent = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
            const value = Math.round(min + (percent / 100) * (max - min));
            
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
          className="price-slider-active-range"
          style={{
            left: `${percentage(minValue)}%`,
            width: `${percentage(maxValue) - percentage(minValue)}%`,
          }}
        />
        <div
          className={`price-slider-handle ${isDragging === 'min' ? 'active' : ''}`}
          style={{ left: `calc(${percentage(minValue)}% - 10px)` }}
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setIsDragging('min');
          }}
        />
        <div
          className={`price-slider-handle ${isDragging === 'max' ? 'active' : ''}`}
          style={{ left: `calc(${percentage(maxValue)}% - 10px)` }}
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setIsDragging('max');
          }}
        />
      </div>
      <div className="price-slider-labels">
        <span>{min}€</span>
        <span>{max}€</span>
      </div>
    </div>
  );
};

export default PriceSlider;

