import React from 'react';
import { cn } from '../../utils/cn';

const Button = React.forwardRef(({ 
  className, 
  variant = 'default', 
  size = 'default',
  children, 
  ...props 
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-sans font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-luxe-gold focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  
  const variants = {
    default: 'bg-luxe-gold text-luxe-black hover:bg-luxe-gold/90 hover:scale-105 active:scale-95',
    secondary: 'bg-luxe-warm-white text-luxe-black border border-luxe-charcoal/10 hover:bg-luxe-champagne/30 hover:border-luxe-gold',
    outline: 'border border-luxe-charcoal/20 text-luxe-black hover:bg-luxe-warm-white hover:border-luxe-gold',
    ghost: 'hover:bg-luxe-champagne/30 text-luxe-charcoal hover:text-luxe-black',
    link: 'text-luxe-gold underline-offset-4 hover:underline',
  };
  
  const sizes = {
    default: 'h-11 px-6 py-2 text-sm',
    sm: 'h-9 px-4 text-xs',
    lg: 'h-12 px-8 text-base',
    icon: 'h-10 w-10',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;






