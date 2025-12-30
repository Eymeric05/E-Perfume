import React from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2.5 rounded-lg transition-all duration-200 focus:outline-none ${
        isDark
          ? 'text-luxe-gold bg-luxe-gold/10 shadow-md'
          : 'text-luxe-black hover:text-luxe-gold hover:bg-luxe-champagne/50'
      } active:scale-95 active:bg-luxe-gold/20 dark:text-luxe-gold dark:hover:bg-luxe-gold/20`}
      aria-label={isDark ? 'Activer le mode clair' : 'Activer le mode nuit'}
      title={isDark ? 'Mode nuit' : 'Mode clair'}
    >
      {isDark ? (
        <FaSun className="w-5 h-5" aria-hidden="true" />
      ) : (
        <FaMoon className="w-5 h-5" aria-hidden="true" />
      )}
    </button>
  );
};

export default ThemeToggle;

