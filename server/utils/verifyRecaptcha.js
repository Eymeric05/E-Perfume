const axios = require('axios');

/**
 * Vérifie le token reCAPTCHA auprès de Google
 * @param {string} recaptchaToken - Le token reCAPTCHA à vérifier
 * @returns {Promise<boolean>} - true si le token est valide, false sinon
 */
const verifyRecaptcha = async (recaptchaToken) => {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  // Si reCAPTCHA n'est pas configuré, on retourne true (mode développement)
  if (!secretKey) {
    console.warn('reCAPTCHA_SECRET_KEY non configuré, la vérification est ignorée');
    return true;
  }

  // Si aucun token n'est fourni, on retourne false
  if (!recaptchaToken) {
    return false;
  }

  try {
    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: secretKey,
          response: recaptchaToken,
        },
      }
    );

    // Vérifier que la réponse indique un succès
    return response.data.success === true;
  } catch (error) {
    console.error('Erreur lors de la vérification reCAPTCHA:', error.message);
    return false;
  }
};

module.exports = verifyRecaptcha;
