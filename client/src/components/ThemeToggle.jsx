import React from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-1.5 transition-all duration-300 focus:outline-none opacity-60 hover:opacity-100 ${
        isDark
          ? 'text-luxe-gold'
          : 'text-luxe-black dark:text-luxe-cream hover:text-luxe-gold'
      }`}
      aria-label={isDark ? 'Activer le mode clair' : 'Activer le mode nuit'}
      title={isDark ? 'Mode nuit' : 'Mode clair'}
    >
      {isDark ? (
        <FaSun className="w-4 h-4" aria-hidden="true" />
      ) : (
        <FaMoon className="w-4 h-4" aria-hidden="true" />
      )}
    </button>
  );
};

export default ThemeToggle;

