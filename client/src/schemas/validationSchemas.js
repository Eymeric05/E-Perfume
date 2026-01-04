import { z } from 'zod';

// Schéma de validation pour l'inscription
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes'),
  email: z
    .string()
    .min(1, 'L\'email est requis')
    .email('Format d\'email invalide')
    .toLowerCase(),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
    .regex(/[^A-Za-z0-9]/, 'Le mot de passe doit contenir au moins un caractère spécial'),
  confirmPassword: z.string(),
  recaptchaToken: z.string().min(1, 'Veuillez valider le captcha'), // Obligatoire pour reCAPTCHA
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

// Schéma de validation pour la connexion
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'L\'email est requis')
    .email('Format d\'email invalide')
    .toLowerCase(),
  password: z
    .string()
    .min(1, 'Le mot de passe est requis'),
  recaptchaToken: z.string().min(1, 'Veuillez valider le captcha'), // Obligatoire pour reCAPTCHA
});

// Schéma de validation pour l'adresse de livraison
export const shippingAddressSchema = z.object({
  address: z
    .string()
    .min(5, 'L\'adresse doit contenir au moins 5 caractères')
    .max(200, 'L\'adresse ne peut pas dépasser 200 caractères'),
  city: z
    .string()
    .min(2, 'La ville doit contenir au moins 2 caractères')
    .max(100, 'La ville ne peut pas dépasser 100 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'La ville ne peut contenir que des lettres, espaces, tirets et apostrophes'),
  postalCode: z
    .string()
    .min(4, 'Le code postal doit contenir au moins 4 caractères')
    .max(10, 'Le code postal ne peut pas dépasser 10 caractères')
    .regex(/^[0-9A-Za-z\s-]+$/, 'Format de code postal invalide'),
  country: z
    .string()
    .min(2, 'Le pays est requis')
    .max(100, 'Le pays ne peut pas dépasser 100 caractères'),
});

// Schéma de validation pour la méthode de paiement
export const paymentMethodSchema = z.object({
  paymentMethod: z
    .enum(['Stripe', 'PayPal'], {
      errorMap: () => ({ message: 'Veuillez sélectionner une méthode de paiement' }),
    }),
});

// Schéma de validation pour la mise à jour du profil
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes')
    .optional(),
  email: z
    .string()
    .email('Format d\'email invalide')
    .toLowerCase()
    .optional(),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
    .regex(/[^A-Za-z0-9]/, 'Le mot de passe doit contenir au moins un caractère spécial')
    .optional(),
});
