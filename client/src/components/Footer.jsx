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
          
          {/* Payment Methods */}
          <div className="mt-6 pt-6 border-t border-luxe-cream/10">
            <div className="flex flex-col items-center gap-4">
              <p className="font-sans text-xs text-luxe-cream/50 mb-2">Moyens de paiement acceptés</p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                {/* Stripe Logo */}
                <div className="bg-white rounded px-3 py-2 flex items-center justify-center h-8">
                  <svg width="50" height="20" viewBox="0 0 468 222" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M414 113.4c0-25.6-12.4-45.8-36.1-45.8-23.8 0-38.2 20.2-38.2 45.6 0 30.1 17 45.3 41.4 45.3 11.9 0 20.9-2.7 27.7-6.4V145c-6.8 3.7-14.6 5.5-24.5 5.5-9.7 0-18.3-3.4-19.4-15.2h48.9c0-1.3.2-6.5.2-13.9zm-49.4-9.2c0-11.3 6.9-16 13.2-16 6.1 0 12.6 4.7 12.6 16h-25.8z" fill="#635BFF"/>
                    <path d="M301.1 99.7h-9.5l-1.6 8.8c-.6-3-2.8-8.8-9.6-8.8-7.1 0-12.3 4.5-12.3 12.9 0 14.1 9.1 18.5 17.2 18.5 4.6 0 7.5-.8 9.8-2.1v-8.3c-2.3 1.3-5.1 2.1-8.9 2.1-3.8 0-6.3-1.3-6.3-4.2 0-2.6 1.9-4.1 5.7-4.1 3.7 0 6.9.7 10.5 2.1v-17.9z" fill="#635BFF"/>
                    <path d="M223.4 99.7h-11.1v25.6c0 5.2 3.3 8.4 8.1 8.4 4.9 0 7.9-3.2 7.9-8.4v-25.6zm-11.1-9.2c-3.8 0-6.9-2.9-6.9-6.6 0-3.7 3.1-6.6 6.9-6.6 3.9 0 6.9 2.9 6.9 6.6 0 3.7-3 6.6-6.9 6.6z" fill="#635BFF"/>
                    <path d="M193.1 99.7h-11.1v34.8h11.1v-25.6c0-5.2-3.2-8.4-8.1-8.4-4.8 0-8.1 3.2-8.1 8.4v9.2h11.1v-9.2c0-2.6 1.4-4.1 3.5-4.1s3.5 1.5 3.5 4.1v9.2h11.1v-9.2c0-5.2-3.2-8.4-8.1-8.4z" fill="#635BFF"/>
                    <path d="M152.9 99.7h-11.1v34.8h11.1v-5.2c1.3 1.5 3.1 2.4 5.3 2.4 5.5 0 9.1-4.7 9.1-11.1 0-6.5-3.6-11.1-9.1-11.1-2.2 0-4 .9-5.3 2.4v-4.2zm-1.1 20.1c-2.6 0-4.7-2.1-4.7-4.8s2.1-4.8 4.7-4.8 4.7 2.1 4.7 4.8-2.1 4.8-4.7 4.8z" fill="#635BFF"/>
                    <path d="M120.6 99.7h-11.1v34.8h11.1v-5.2c1.3 1.5 3.1 2.4 5.3 2.4 5.5 0 9.1-4.7 9.1-11.1 0-6.5-3.6-11.1-9.1-11.1-2.2 0-4 .9-5.3 2.4v-4.2zm-1.1 20.1c-2.6 0-4.7-2.1-4.7-4.8s2.1-4.8 4.7-4.8 4.7 2.1 4.7 4.8-2.1 4.8-4.7 4.8z" fill="#635BFF"/>
                    <path d="M88.3 99.7h-11.1v34.8h11.1v-5.2c1.3 1.5 3.1 2.4 5.3 2.4 5.5 0 9.1-4.7 9.1-11.1 0-6.5-3.6-11.1-9.1-11.1-2.2 0-4 .9-5.3 2.4v-4.2zm-1 7.4c-3.8 0-6.9-2.9-6.9-6.6 0-3.7 3.1-6.6 6.9-6.6 3.9 0 6.9 2.9 6.9 6.6 0 3.7-3 6.6-6.9 6.6z" fill="#635BFF"/>
                  </svg>
                </div>
                
                {/* PayPal Logo */}
                <div className="bg-white rounded px-3 py-2 flex items-center justify-center h-8">
                  <svg width="50" height="20" viewBox="0 0 468 222" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M393.1 9.3c-2.6-1.5-5.9-2.3-9.9-2.3h-44.9c-1 0-1.9.7-2.2 1.7l-34.6 87.2c-.1.3-.1.5-.1.7 0 .6.4 1.1 1 1.1h29.1c.8 0 1.5-.5 1.8-1.3l.1-.3 7.5-19.2.1-.3c.2-.8.9-1.3 1.8-1.3h11.1c8.3 0 14.8-1.1 19.3-3.4 5.8-2.9 9.9-7.4 12.1-13.3 1.1-3 1.6-6.3 1.5-9.6-.2-5.1-1.8-9.3-4.9-12.5zm-30.7 42.8c-1.4 3.7-4.1 6.6-7.9 8.3-2.9 1.3-6.8 2-11.5 2h-8.7l6-15.4c.2-.5.7-.8 1.2-.8h5.5c3.8 0 6.7.5 8.7 1.5 3.2 1.6 5.3 4.2 6.7 7.4.5 1.2.8 2.5.8 3.8-.1 1.8-.4 3.2-1 4.2z" fill="#003087"/>
                    <path d="M308.1 99.6c-1.4 3.7-4.1 6.6-7.9 8.3-2.9 1.3-6.8 2-11.5 2h-8.7l6-15.4c.2-.5.7-.8 1.2-.8h5.5c3.8 0 6.7.5 8.7 1.5 3.2 1.6 5.3 4.2 6.7 7.4.5 1.2.8 2.5.8 3.8-.1 1.8-.4 3.2-1 4.2z" fill="#009CDE"/>
                  </svg>
                </div>
                
                {/* Visa Logo */}
                <div className="bg-white rounded px-3 py-2 flex items-center justify-center h-8">
                  <svg width="50" height="20" viewBox="0 0 468 222" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M186.4 169.9l-22.7-131.2h-28.1l22.7 131.2h28.1zm91.1-91.5c-2.1-8.1-8.5-13.4-16.2-13.4-8.9 0-14.3 4.8-14.3 11.7 0 5.1 4.2 7.9 7.4 9.6 3.3 1.8 4.5 3 4.5 4.6 0 2.5-2.7 3.6-5.2 3.6-4.4 0-6.8-.8-10.4-2.7l-1.8-.8-1.9 11.2c3.2 1.1 9.1 2.1 15.2 2.1 16.8 0 27.7-8.8 27.7-22.4.1-9.5-5.1-16.7-12.2-20.2zm75.1 13.2c3.1 7.7 7.5 14.3 13.4 18.1l-9.5 5.5c-2.6-4.1-5.3-8.4-7.2-11.8l-12.7 7.3 12.7 75.1h29.8l22.1-131.2h-28l-10.5 75.1zm-59.1-75.1l-20.9 131.2h26.9l20.9-131.2h-26.9z" fill="#1434CB"/>
                  </svg>
                </div>
                
                {/* Mastercard Logo */}
                <div className="bg-white rounded px-3 py-2 flex items-center justify-center h-8">
                  <svg width="50" height="20" viewBox="0 0 468 222" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="152.5" cy="111" r="60" fill="#EB001B"/>
                    <circle cx="315.5" cy="111" r="60" fill="#F79E1B"/>
                    <path d="M234 81.2c-16.4 12.3-27.1 31.6-27.1 53.3 0 21.7 10.7 41 27.1 53.3 16.4-12.3 27.1-31.6 27.1-53.3 0-21.7-10.7-41-27.1-53.3z" fill="#FF5F00"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
