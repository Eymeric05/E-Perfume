import React, { useState, useRef, useEffect } from 'react';

const PriceSlider = ({ min = 0, max = 500, onRangeChange, initialMin, initialMax }) => {
  const [minValue, setMinValue] = useState(initialMin !== undefined ? initialMin : min);
  const [maxValue, setMaxValue] = useState(initialMax !== undefined ? initialMax : max);
  const [isDragging, setIsDragging] = useState(null);
  const [hasMoved, setHasMoved] = useState(false);
  const sliderRef = useRef(null);
  const startPosRef = useRef(null);

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
        if (!hasMoved) {
          setHasMoved(true);
        }
        updateValue(e.clientX, isDragging);
      };

      const handleUp = (e) => {
        // If we didn't move, it was a click - update position
        if (!hasMoved && startPosRef.current !== null) {
          updateValue(startPosRef.current, isDragging);
        }
        setIsDragging(null);
        setHasMoved(false);
        startPosRef.current = null;
      };

      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleUp);
      document.addEventListener('mouseleave', handleUp); // Stop dragging if mouse leaves window
      return () => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleUp);
        document.removeEventListener('mouseleave', handleUp);
      };
    }
  }, [isDragging, hasMoved, minValue, maxValue, min, max, onRangeChange]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <span className="font-sans text-sm text-luxe-charcoal/70">
          {minValue}€ - {maxValue}€
        </span>
      </div>
      <div
        ref={sliderRef}
        className="relative h-2 bg-luxe-charcoal/10 rounded-full cursor-pointer"
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
              startPosRef.current = e.clientX;
              setHasMoved(false);
              setIsDragging('min');
            } else {
              startPosRef.current = e.clientX;
              setHasMoved(false);
              setIsDragging('max');
            }
          }
        }}
      >
        <div
          className="absolute h-2 bg-luxe-gold rounded-full transition-all duration-200 slider-range pointer-events-none"
          style={{
            left: `${percentage(minValue)}%`,
            width: `${percentage(maxValue) - percentage(minValue)}%`,
          }}
        />
        <div
          className="absolute w-4 h-4 bg-luxe-gold rounded-full shadow-lg cursor-grab active:cursor-grabbing transform -translate-y-1 transition-all duration-200 hover:scale-110 hover:shadow-xl z-10 slider-handle"
          style={{ left: `calc(${percentage(minValue)}% - 8px)` }}
          onMouseDown={(e) => {
            e.stopPropagation();
            startPosRef.current = e.clientX;
            setHasMoved(false);
            setIsDragging('min');
          }}
        />
        <div
          className="absolute w-4 h-4 bg-luxe-gold rounded-full shadow-lg cursor-grab active:cursor-grabbing transform -translate-y-1 transition-all duration-200 hover:scale-110 hover:shadow-xl z-10 slider-handle"
          style={{ left: `calc(${percentage(maxValue)}% - 8px)` }}
          onMouseDown={(e) => {
            e.stopPropagation();
            startPosRef.current = e.clientX;
            setHasMoved(false);
            setIsDragging('max');
          }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-luxe-charcoal/50">
        <span>{min}€</span>
        <span>{max}€</span>
      </div>
    </div>
  );
};

export default PriceSlider;

