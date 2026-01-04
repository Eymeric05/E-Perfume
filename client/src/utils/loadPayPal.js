// Utilitaire pour charger le SDK PayPal dynamiquement avec la variable d'environnement
export const loadPayPalSDK = (callback) => {
  // Si PayPal est déjà chargé, appeler le callback immédiatement
  if (window.paypal && window.paypal.Buttons) {
    callback();
    return;
  }

  // Récupérer le client_id depuis les variables d'environnement Vite
  const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || 
                   'AaHD6tvQUQe95QIEtFDVxerfNCbLVSwAtpmXtSFpGbiIQ6k2eDFLWYxkvDDqf-bQcfaxds1q8WKgR0Fe';
  
  // Vérifier si le script existe déjà
  const existingScript = document.querySelector('script[data-paypal-sdk]');
  if (existingScript) {
    // Si le script existe mais PayPal n'est pas encore disponible, attendre
    if (window.paypal && window.paypal.Buttons) {
      callback();
      return;
    }
    
    // Attendre que PayPal soit disponible
    const checkInterval = setInterval(() => {
      if (window.paypal && window.paypal.Buttons) {
        clearInterval(checkInterval);
        callback();
      }
    }, 100);
    
    // Timeout après 10 secondes
    setTimeout(() => {
      clearInterval(checkInterval);
      if (!window.paypal || !window.paypal.Buttons) {
        callback(new Error('Timeout lors du chargement du SDK PayPal'));
      }
    }, 10000);
    
    return;
  }

  // Créer et charger le script PayPal
  const script = document.createElement('script');
  script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=EUR`;
  script.setAttribute('data-paypal-sdk', 'true');
  script.async = true;
  
  script.onload = () => {
    // Attendre que window.paypal soit disponible après le chargement du script
    const checkPayPal = setInterval(() => {
      if (window.paypal && window.paypal.Buttons) {
        clearInterval(checkPayPal);
        callback();
      }
    }, 100);
    
    // Timeout après 10 secondes
    setTimeout(() => {
      clearInterval(checkPayPal);
      if (!window.paypal || !window.paypal.Buttons) {
        callback(new Error('PayPal SDK non disponible après le chargement du script'));
      }
    }, 10000);
  };
  
  script.onerror = () => {
    callback(new Error('Impossible de charger le SDK PayPal'));
  };
  
  document.head.appendChild(script);
};
