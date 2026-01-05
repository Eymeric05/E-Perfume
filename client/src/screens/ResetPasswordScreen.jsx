import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaLock } from 'react-icons/fa';
import { apiFetch } from '../utils/api';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import { resetPasswordSchema } from '../schemas/validationSchemas';
import { safeValidateForm } from '../utils/formValidation';

const ResetPasswordScreen = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState('form'); // 'form', 'loading', 'success', 'error'
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Token de réinitialisation manquant dans l\'URL.');
        }
    }, [token]);

    const submitHandler = async (e) => {
        e.preventDefault();
        setErrors({});
        setIsSubmitting(true);

        // Validation avec Zod
        const validation = safeValidateForm(resetPasswordSchema, {
            password,
            confirmPassword,
            token: token || '',
        });

        if (!validation.success) {
            setErrors(validation.errors);
            setIsSubmitting(false);
            return;
        }

        try {
            const res = await apiFetch('/api/users/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: validation.data.token,
                    password: validation.data.password,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setStatus('success');
                setMessage(data.message || 'Mot de passe réinitialisé avec succès.');
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                const errorData = await res.json().catch(() => ({ message: 'Erreur lors de la réinitialisation' }));
                setStatus('error');
                setMessage(errorData.message || 'Erreur lors de la réinitialisation du mot de passe.');
            }
        } catch (err) {
            setStatus('error');
            setMessage(err.message || 'Une erreur est survenue. Veuillez réessayer.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (status === 'error' && !token) {
        return (
            <div className="min-h-screen bg-luxe-cream dark:bg-luxe-charcoal flex items-center justify-center py-12 px-4">
                <Helmet>
                    <title>Erreur - Réinitialisation de mot de passe - E-perfume</title>
                </Helmet>

                <div className="w-full max-w-md">
                    <div className="bg-luxe-warm-white dark:bg-luxe-charcoal rounded-lg shadow-lg border border-luxe-charcoal/10 dark:border-luxe-gold/20 p-8">
                        <div className="text-center">
                            <div className="flex justify-center mb-4">
                                <FaTimesCircle className="w-16 h-16 text-red-500" />
                            </div>
                            <p className="font-sans text-base text-red-600 dark:text-red-400 mb-6">
                                {message}
                            </p>
                            <Link
                                to="/forgot-password"
                                className="btn-luxe-gold inline-block"
                            >
                                Demander un nouveau lien
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="min-h-screen bg-luxe-cream dark:bg-luxe-charcoal flex items-center justify-center py-12 px-4">
                <Helmet>
                    <title>Mot de passe réinitialisé - E-perfume</title>
                </Helmet>

                <div className="w-full max-w-md">
                    <div className="bg-luxe-warm-white dark:bg-luxe-charcoal rounded-lg shadow-lg border border-luxe-charcoal/10 dark:border-luxe-gold/20 p-8">
                        <div className="text-center">
                            <div className="flex justify-center mb-4">
                                <FaCheckCircle className="w-16 h-16 text-green-500" />
                            </div>
                            <p className="font-sans text-base text-luxe-charcoal dark:text-luxe-cream mb-6">
                                {message}
                            </p>
                            <p className="font-sans text-sm text-luxe-charcoal/70 dark:text-luxe-cream/70 mb-6">
                                Redirection vers la page de connexion...
                            </p>
                            <Link
                                to="/login"
                                className="btn-luxe-gold inline-block"
                            >
                                Aller à la connexion
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-luxe-cream dark:bg-luxe-charcoal flex items-center justify-center py-12 px-4">
            <Helmet>
                <title>Réinitialiser le mot de passe - E-perfume</title>
            </Helmet>

            <div className="w-full max-w-md">
                <div className="bg-luxe-warm-white dark:bg-luxe-charcoal rounded-lg shadow-lg border border-luxe-charcoal/10 dark:border-luxe-gold/20 p-8">
                    <div className="text-center mb-8">
                        <h1 className="font-serif text-4xl md:text-5xl font-light text-luxe-black dark:text-luxe-cream mb-2">
                            Nouveau mot de passe
                        </h1>
                        <p className="font-sans text-sm text-luxe-charcoal/70 dark:text-luxe-cream/70">
                            Entrez votre nouveau mot de passe
                        </p>
                    </div>

                    {errors.submit && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="font-sans text-sm text-red-700 dark:text-red-400">{errors.submit}</p>
                        </div>
                    )}

                    <form onSubmit={submitHandler} className="space-y-6">
                        <div>
                            <label htmlFor="password" className="block font-sans text-sm font-medium text-luxe-black dark:text-luxe-cream mb-2">
                                Nouveau mot de passe
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <FaLock className="w-5 h-5 text-luxe-charcoal/40 dark:text-luxe-cream/40" />
                                </div>
                                <input
                                    type="password"
                                    id="password"
                                    placeholder="Entrez votre nouveau mot de passe"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (errors.password) setErrors({ ...errors, password: undefined });
                                    }}
                                    className={`input-luxe pl-12 w-full ${errors.password ? 'border-red-500 dark:border-red-400' : ''}`}
                                    required
                                />
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                            )}
                            {!errors.password && password && (
                                <p className="mt-1 text-xs text-luxe-charcoal/50 dark:text-luxe-cream/50">
                                    Minimum 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block font-sans text-sm font-medium text-luxe-black dark:text-luxe-cream mb-2">
                                Confirmer le mot de passe
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <FaLock className="w-5 h-5 text-luxe-charcoal/40 dark:text-luxe-cream/40" />
                                </div>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    placeholder="Confirmez votre nouveau mot de passe"
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
                                    className={`input-luxe pl-12 w-full ${errors.confirmPassword ? 'border-red-500 dark:border-red-400' : ''}`}
                                    required
                                />
                            </div>
                            {errors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="btn-luxe-gold w-full"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Réinitialisation en cours...' : 'Réinitialiser le mot de passe'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link
                            to="/login"
                            className="font-sans text-sm text-luxe-gold hover:text-luxe-black dark:hover:text-luxe-cream transition-colors duration-200 font-medium"
                        >
                            Retour à la connexion
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordScreen;
