/**
 * Utilitaires pour la validation de formulaires avec Zod
 */

/**
 * Extrait les erreurs de validation Zod dans un format utilisable
 * @param {Object} error - L'erreur Zod
 * @returns {Object} - Objet avec les erreurs par champ
 */
export const extractValidationErrors = (error) => {
  if (!error || !error.errors) {
    return {};
  }

  const errors = {};
  error.errors.forEach((err) => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });

  return errors;
};

/**
 * Obtient le message d'erreur pour un champ spécifique
 * @param {Object} errors - Objet d'erreurs
 * @param {string} fieldName - Nom du champ
 * @returns {string|null} - Message d'erreur ou null
 */
export const getFieldError = (errors, fieldName) => {
  return errors[fieldName] || null;
};

/**
 * Valide les données d'un formulaire avec un schéma Zod
 * @param {Object} schema - Schéma Zod
 * @param {Object} data - Données à valider
 * @returns {Object} - { success: boolean, data?: Object, errors?: Object }
 */
export const validateForm = (schema, data) => {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    const errors = extractValidationErrors(error);
    return { success: false, errors };
  }
};

/**
 * Valide les données d'un formulaire de manière asynchrone (safe parse)
 * @param {Object} schema - Schéma Zod
 * @param {Object} data - Données à valider
 * @returns {Object} - { success: boolean, data?: Object, errors?: Object }
 */
export const safeValidateForm = (schema, data) => {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    const errors = extractValidationErrors(result.error);
    return { success: false, errors };
  }
};
