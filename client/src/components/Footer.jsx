import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-luxe-black text-luxe-cream mt-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="mb-4">
              <img 
                src="/images/E-perfume-logo.png" 
                alt="E-perfume" 
                className="h-8 w-auto"
              />
            </div>
            <p className="font-sans text-sm text-luxe-cream/70 leading-relaxed max-w-md">
              L'art de la parfumerie de luxe et des produits esthétiques haut de gamme. 
              Chaque fragrance raconte une histoire unique.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-sans text-sm font-medium tracking-wider uppercase mb-4">Navigation</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="font-sans text-sm text-luxe-cream/70 hover:text-luxe-gold transition-colors duration-200">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/products" className="font-sans text-sm text-luxe-cream/70 hover:text-luxe-gold transition-colors duration-200">
                  Collections
                </Link>
              </li>
              <li>
                <Link to="/cart" className="font-sans text-sm text-luxe-cream/70 hover:text-luxe-gold transition-colors duration-200">
                  Panier
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-sans text-sm font-medium tracking-wider uppercase mb-4">Contact</h4>
            <ul className="space-y-2">
              <li className="font-sans text-sm text-luxe-cream/70">eperfume@atomicmail.io</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-luxe-cream/10 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="font-sans text-xs text-luxe-cream/50 text-center md:text-left">
              &copy; {new Date().getFullYear()} E-perfume. Tous droits réservés.
            </p>
            <div className="flex gap-4">
              <Link
                to="/privacy"
                className="font-sans text-xs text-luxe-cream/50 hover:text-luxe-gold transition-colors duration-200"
              >
                Politique de confidentialité
              </Link>
              <Link
                to="/legal"
                className="font-sans text-xs text-luxe-cream/50 hover:text-luxe-gold transition-colors duration-200"
              >
                Mentions légales
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
