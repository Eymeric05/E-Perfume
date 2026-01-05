import React, { useState, useContext, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { Store } from '../context/StoreContext';
import { apiFetch } from '../utils/api';
import { registerSchema } from '../schemas/validationSchemas';
import { safeValidateForm } from '../utils/formValidation';
import '../styles/screens/_register.scss';

const RegisterScreen = () => {
    const navigate = useNavigate();
    const { search } = useLocation();
    const redirectInUrl = new URLSearchParams(search).get('redirect');
    const redirect = redirectInUrl ? redirectInUrl : '/';

    const { executeRecaptcha } = useGoogleReCaptcha();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const { state, dispatch: ctxDispatch } = useContext(Store);
    const { userInfo } = state;

    const submitHandler = async (e) => {
        e.preventDefault();
        setErrors({});
        setIsSubmitting(true);

        // Exécuter reCAPTCHA v3 pour obtenir le token
        let recaptchaToken = '';
        if (!executeRecaptcha) {
            console.error('executeRecaptcha n\'est pas disponible');
            setErrors({ recaptchaToken: 'reCAPTCHA n\'est pas disponible. Vérifiez la configuration.' });
            setIsSubmitting(false);
            return;
        }

        try {
            recaptchaToken = await executeRecaptcha('register');
            if (!recaptchaToken) {
                setErrors({ recaptchaToken: 'Erreur lors de la génération du token reCAPTCHA. Veuillez réessayer.' });
                setIsSubmitting(false);
                return;
            }
        } catch (error) {
            console.error('Erreur reCAPTCHA:', error);
            setErrors({ recaptchaToken: 'Erreur lors de la vérification reCAPTCHA. Veuillez réessayer.' });
            setIsSubmitting(false);
            return;
        }

        // Validation avec Zod
        const validation = safeValidateForm(registerSchema, {
            name,
            email,
            password,
            confirmPassword,
            recaptchaToken: recaptchaToken, // Obligatoire pour reCAPTCHA
        });

        if (!validation.success) {
            setErrors(validation.errors);
            setIsSubmitting(false);
            return;
        }

        try {
            const res = await apiFetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: validation.data.name,
                    email: validation.data.email,
                    password: validation.data.password,
                    recaptchaToken: validation.data.recaptchaToken, // Envoyer le token au backend
                }),
            });

            if (res.ok) {
                const data = await res.json();
                // Afficher le message de succès
                setSuccessMessage(data.message || 'Compte créé avec succès. Veuillez vérifier votre email pour activer votre compte.');
                setErrors({});
                // Ne pas connecter automatiquement, l'utilisateur doit vérifier son email
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                const errorData = await res.json().catch(() => ({ message: 'Erreur lors de l\'inscription' }));
                setSuccessMessage('');
                setErrors({ submit: errorData.message || 'Erreur lors de l\'inscription' });
            }
        } catch (err) {
            setErrors({ submit: err.message || 'Une erreur est survenue. Veuillez réessayer.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (userInfo) {
            navigate(redirect);
        }
    }, [navigate, redirect, userInfo]);

    return (
        <div className="register-container">
            <h1>Inscription</h1>
            {successMessage && (
                <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="font-sans text-sm text-green-700 dark:text-green-400">{successMessage}</p>
                    <p className="font-sans text-xs text-green-600 dark:text-green-500 mt-2">Redirection vers la page de connexion...</p>
                </div>
            )}
            {errors.submit && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="font-sans text-sm text-red-700 dark:text-red-400">{errors.submit}</p>
                </div>
            )}
            <form onSubmit={submitHandler}>
                <div className="register-form-group">
                    <label htmlFor="name" className="register-label dark:text-luxe-cream/70">Nom</label>
                    <input
                        type="text"
                        id="name"
                        placeholder="Entrez votre nom"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            if (errors.name) setErrors({ ...errors, name: undefined });
                        }}
                        className={`register-input ${errors.name ? 'border-red-500' : ''}`}
                        required
                    />
                    {errors.name && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                    )}
                </div>
                <div className="register-form-group">
                    <label htmlFor="email" className="register-label dark:text-luxe-cream/70">Email</label>
                    <input
                        type="email"
                        id="email"
                        placeholder="Entrez votre email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (errors.email) setErrors({ ...errors, email: undefined });
                        }}
                        className={`register-input ${errors.email ? 'border-red-500' : ''}`}
                        required
                    />
                    {errors.email && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                    )}
                </div>
                <div className="register-form-group">
                    <label htmlFor="password" className="register-label dark:text-luxe-cream/70">Mot de passe</label>
                    <input
                        type="password"
                        id="password"
                        placeholder="Entrez votre mot de passe"
                        value={password}
                        onChange={(e) => {
                            const newPassword = e.target.value;
                            setPassword(newPassword);
                            
                            // Effacer l'erreur du mot de passe si elle existe
                            const newErrors = { ...errors };
                            if (errors.password) {
                                delete newErrors.password;
                            }
                            
                            // Revalider la confirmation si elle a déjà une valeur
                            if (confirmPassword) {
                                if (newPassword && confirmPassword && newPassword !== confirmPassword) {
                                    newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
                                } else if (newPassword && confirmPassword && newPassword === confirmPassword) {
                                    delete newErrors.confirmPassword;
                                }
                            }
                            
                            setErrors(newErrors);
                        }}
                        className={`register-input ${errors.password ? 'border-red-500' : ''}`}
                        required
                    />
                    {errors.password && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                    )}
                    {!errors.password && password && (
                        <p className="mt-1 text-xs text-luxe-charcoal/50 dark:text-luxe-cream/50">
                            Minimum 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial
                        </p>
                    )}
                </div>
                <div className="register-form-group">
                    <label htmlFor="confirmPassword" className="register-label dark:text-luxe-cream/70">Confirmer mot de passe</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        placeholder="Confirmez votre mot de passe"
                        value={confirmPassword}
                        onChange={(e) => {
                            const newConfirmPassword = e.target.value;
                            setConfirmPassword(newConfirmPassword);
                            
                            // Validation en temps réel
                            if (newConfirmPassword && password && newConfirmPassword !== password) {
                                setErrors({ ...errors, confirmPassword: 'Les mots de passe ne correspondent pas' });
                            } else if (newConfirmPassword && password && newConfirmPassword === password) {
                                // Effacer l'erreur si les mots de passe correspondent
                                const newErrors = { ...errors };
                                delete newErrors.confirmPassword;
                                setErrors(newErrors);
                            } else if (errors.confirmPassword) {
                                // Effacer l'erreur si le champ est vide
                                const newErrors = { ...errors };
                                delete newErrors.confirmPassword;
                                setErrors(newErrors);
                            }
                        }}
                        onBlur={(e) => {
                            // Validation supplémentaire au blur
                            if (e.target.value && password && e.target.value !== password) {
                                setErrors({ ...errors, confirmPassword: 'Les mots de passe ne correspondent pas' });
                            }
                        }}
                        className={`register-input ${errors.confirmPassword ? 'border-red-500' : ''}`}
                        required
                    />
                    {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
                    )}
                </div>

                {/* reCAPTCHA v3 est invisible et s'exécute lors de la soumission */}
                {errors.recaptchaToken && (
                    <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="font-sans text-sm text-red-700 dark:text-red-400">{errors.recaptchaToken}</p>
                    </div>
                )}

                <div className="register-form-group" style={{ marginTop: '1.5rem' }}>
                    <button
                        type="submit"
                        className="btn-luxe-gold w-full"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Inscription en cours...' : "S'inscrire"}
                    </button>
                </div>
            </form>
            <div className="mt-6 text-center">
                <p className="font-sans text-sm text-luxe-charcoal/70 dark:text-luxe-cream/70 mb-3">
                    Déjà un compte ?
                </p>
                <Link
                    to={`/login?redirect=${redirect}`}
                    className="inline-block btn-luxe-gold w-full text-center"
                >
                    Se connecter
                </Link>
            </div>
        </div>
    );
};

export default RegisterScreen;
