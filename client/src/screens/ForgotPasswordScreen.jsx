import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaEnvelope } from 'react-icons/fa';
import { apiFetch } from '../utils/api';

const ForgotPasswordScreen = () => {
    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const submitHandler = async (e) => {
        e.preventDefault();
        setErrors({});
        setSuccessMessage('');
        setIsSubmitting(true);

        if (!email) {
            setErrors({ email: 'Veuillez entrer votre adresse email' });
            setIsSubmitting(false);
            return;
        }

        try {
            const res = await apiFetch('/api/users/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            if (res.ok) {
                const data = await res.json();
                setSuccessMessage(data.message || 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.');
                setEmail('');
            } else {
                const errorData = await res.json().catch(() => ({ message: 'Erreur lors de l\'envoi de l\'email' }));
                setErrors({ submit: errorData.message || 'Erreur lors de l\'envoi de l\'email' });
            }
        } catch (err) {
            setErrors({ submit: err.message || 'Une erreur est survenue. Veuillez réessayer.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-luxe-cream dark:bg-luxe-charcoal flex items-center justify-center py-12 px-4">
            <Helmet>
                <title>Mot de passe oublié - E-perfume</title>
            </Helmet>

            <div className="w-full max-w-md">
                <div className="bg-luxe-warm-white dark:bg-luxe-charcoal rounded-lg shadow-lg border border-luxe-charcoal/10 dark:border-luxe-gold/20 p-8">
                    <div className="text-center mb-8">
                        <h1 className="font-serif text-4xl md:text-5xl font-light text-luxe-black dark:text-luxe-cream mb-2">
                            Mot de passe oublié
                        </h1>
                        <p className="font-sans text-sm text-luxe-charcoal/70 dark:text-luxe-cream/70">
                            Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe
                        </p>
                    </div>

                    {successMessage && (
                        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <p className="font-sans text-sm text-green-700 dark:text-green-400">{successMessage}</p>
                        </div>
                    )}

                    {errors.submit && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="font-sans text-sm text-red-700 dark:text-red-400">{errors.submit}</p>
                        </div>
                    )}

                    <form onSubmit={submitHandler} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block font-sans text-sm font-medium text-luxe-black dark:text-luxe-cream mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <FaEnvelope className="w-5 h-5 text-luxe-charcoal/40 dark:text-luxe-cream/40" />
                                </div>
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="Entrez votre email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (errors.email) setErrors({ ...errors, email: undefined });
                                    }}
                                    className={`input-luxe pl-12 w-full ${errors.email ? 'border-red-500 dark:border-red-400' : ''}`}
                                    required
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="btn-luxe-gold w-full"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
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

export default ForgotPasswordScreen;
