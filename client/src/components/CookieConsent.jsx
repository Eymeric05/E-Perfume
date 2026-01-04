import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà donné son consentement
    const consent = localStorage.getItem('cookieConsent');
    
    if (!consent) {
      // Afficher la bannière après un court délai pour une meilleure UX
      setTimeout(() => {
        setShowBanner(true);
        setTimeout(() => setIsVisible(true), 100);
      }, 1000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', JSON.stringify({
      accepted: true,
      timestamp: new Date().toISOString(),
      analytics: true,
      functional: true,
    }));
    setIsVisible(false);
    setTimeout(() => setShowBanner(false), 300);
  };

  const handleReject = () => {
    localStorage.setItem('cookieConsent', JSON.stringify({
      accepted: false,
      timestamp: new Date().toISOString(),
      analytics: false,
      functional: false,
    }));
    setIsVisible(false);
    setTimeout(() => setShowBanner(false), 300);
  };

  const handleCustomize = () => {
    // Pour l'instant, on accepte tout lors de la personnalisation
    // Cette fonctionnalité peut être étendue plus tard
    handleAccept();
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
    >
      <div className="bg-luxe-black text-luxe-cream border-t-2 border-luxe-gold shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <h3
                id="cookie-consent-title"
                className="font-serif text-xl md:text-2xl font-light mb-2"
              >
                Gestion des cookies
              </h3>
              <p
                id="cookie-consent-description"
                className="font-sans text-sm md:text-base text-luxe-cream/90 mb-2"
              >
                Nous utilisons des cookies pour améliorer votre expérience de navigation, 
                analyser le trafic du site et personnaliser le contenu. En cliquant sur 
                "Accepter", vous acceptez notre utilisation des cookies conformément à notre 
                politique de confidentialité et au RGPD.
              </p>
              <Link
                to="/privacy"
                className="font-sans text-sm text-luxe-gold hover:text-luxe-champagne underline transition-colors"
                aria-label="En savoir plus sur notre politique de confidentialité"
              >
                En savoir plus
              </Link>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <button
                onClick={handleReject}
                className="btn-luxe-secondary bg-transparent border-luxe-cream text-luxe-cream hover:bg-luxe-cream hover:text-luxe-black px-6 py-2 text-sm font-sans"
                aria-label="Refuser les cookies"
              >
                Refuser
              </button>
              <button
                onClick={handleAccept}
                className="btn-luxe-gold bg-luxe-gold text-luxe-black hover:bg-luxe-champagne px-6 py-2 text-sm font-sans"
                aria-label="Accepter les cookies"
              >
                Accepter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;



