// Utilitaire pour charger le SDK PayPal dynamiquement avec la variable d'environnement
export const loadPayPalSDK = (callback) => {
  // Si PayPal est déjà chargé, appeler le callback immédiatement
  if (window.paypal) {
    callback();
    return;
  }

  // Récupérer le client_id depuis les variables d'environnement Vite
  const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || 
                   'AaHD6tvQUQe95QIEtFDVxerfNCbLVSwAtpmXtSFpGbiIQ6k2eDFLWYxkvDDqf-bQcfaxds1q8WKgR0Fe';
  
  // Vérifier si le script existe déjà
  const existingScript = document.querySelector('script[data-paypal-sdk]');
  if (existingScript) {
    // Attendre que le script soit chargé
    existingScript.onload = () => callback();
    if (window.paypal) {
      callback();
    }
    return;
  }

  // Créer et charger le script PayPal
  const script = document.createElement('script');
  script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=EUR`;
  script.setAttribute('data-paypal-sdk', 'true');
  script.async = true;
  script.onload = () => {
    console.log('PayPal SDK chargé avec client_id:', clientId.substring(0, 20) + '...');
    callback();
  };
  script.onerror = () => {
    console.error('Erreur lors du chargement du SDK PayPal');
    callback(new Error('Impossible de charger le SDK PayPal'));
  };
  document.head.appendChild(script);
};
