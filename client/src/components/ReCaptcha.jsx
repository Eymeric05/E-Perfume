import React, { useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

/**
 * Composant ReCAPTCHA pour l'intégration de Google reCAPTCHA
 * 
 * Pour activer reCAPTCHA :
 * 1. Obtenir une clé site depuis Google reCAPTCHA Console (https://www.google.com/recaptcha/admin)
 * 2. Ajouter la clé dans .env: VITE_RECAPTCHA_SITE_KEY=your_site_key
 * 3. Ajouter la clé secrète dans le .env du serveur: RECAPTCHA_SECRET_KEY=your_secret_key
 */

const ReCaptcha = ({ onVerify, onExpire, onError, theme = 'light' }) => {
  const recaptchaRef = useRef(null);
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  // Si la clé n'est pas configurée, ne rien afficher (mode développement)
  if (!siteKey) {
    return (
      <div className="text-xs text-luxe-charcoal/50 dark:text-luxe-cream/50 italic">
        reCAPTCHA sera activé en production
      </div>
    );
  }

  const handleChange = (token) => {
    if (token) {
      onVerify?.(token);
    } else {
      // Token expiré ou annulé
      onExpire?.();
    }
  };

  const handleExpired = () => {
    onExpire?.();
  };

  const handleError = () => {
    const error = new Error('Erreur lors de la vérification reCAPTCHA');
    onError?.(error);
  };

  return (
    <div className="flex justify-center">
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={siteKey}
        onChange={handleChange}
        onExpired={handleExpired}
        onError={handleError}
        theme={theme}
        size="normal"
      />
    </div>
  );
};

export default ReCaptcha;
