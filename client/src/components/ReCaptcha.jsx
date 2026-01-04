/**
 * Composant ReCAPTCHA v3 - reCAPTCHA v3 est invisible
 * 
 * reCAPTCHA v3 ne nécessite pas de composant visible.
 * Utilisez directement le hook useGoogleReCaptcha dans vos formulaires.
 * 
 * Exemple d'utilisation :
 * 
 * import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
 * 
 * const { executeRecaptcha } = useGoogleReCaptcha();
 * 
 * const handleSubmit = async (e) => {
 *   e.preventDefault();
 *   if (!executeRecaptcha) {
 *     return;
 *   }
 *   const token = await executeRecaptcha('submit');
 *   // Envoyer le token au backend
 * };
 */

// Ce fichier est maintenant un placeholder/documentation
// reCAPTCHA v3 est utilisé directement via le hook useGoogleReCaptcha dans les formulaires
const ReCaptcha = () => {
  // reCAPTCHA v3 est invisible, donc on ne retourne rien
  return null;
};

export default ReCaptcha;
