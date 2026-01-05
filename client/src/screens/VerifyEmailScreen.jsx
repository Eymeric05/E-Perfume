import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { apiFetch } from '../utils/api';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';

const VerifyEmailScreen = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verifyEmail = async () => {
            if (!token) {
                setStatus('error');
                setMessage('Token de vérification manquant dans l\'URL.');
                return;
            }

            try {
                const res = await apiFetch(`/api/users/verify/${token}`, {
                    method: 'GET',
                });

                if (res.ok) {
                    const data = await res.json();
                    setStatus('success');
                    setMessage(data.message || 'Email vérifié avec succès. Vous pouvez maintenant vous connecter.');
                } else {
                    const errorData = await res.json().catch(() => ({ message: 'Erreur lors de la vérification' }));
                    setStatus('error');
                    setMessage(errorData.message || 'Erreur lors de la vérification de l\'email.');
                }
            } catch (err) {
                setStatus('error');
                setMessage(err.message || 'Une erreur est survenue. Veuillez réessayer.');
            }
        };

        verifyEmail();
    }, [token]);

    return (
        <div className="min-h-screen bg-luxe-cream dark:bg-luxe-charcoal flex items-center justify-center py-12 px-4">
            <Helmet>
                <title>Vérification de l'email - E-perfume</title>
            </Helmet>

            <div className="w-full max-w-md">
                <div className="bg-luxe-warm-white dark:bg-luxe-charcoal rounded-lg shadow-lg border border-luxe-charcoal/10 dark:border-luxe-gold/20 p-8">
                    <div className="text-center mb-8">
                        <h1 className="font-serif text-4xl md:text-5xl font-light text-luxe-black dark:text-luxe-cream mb-2">
                            Vérification de l'email
                        </h1>
                    </div>

                    <div className="text-center">
                        {status === 'loading' && (
                            <>
                                <div className="flex justify-center mb-4">
                                    <FaSpinner className="w-16 h-16 text-luxe-gold animate-spin" />
                                </div>
                                <p className="font-sans text-sm text-luxe-charcoal/70 dark:text-luxe-cream/70">
                                    Vérification en cours...
                                </p>
                            </>
                        )}

                        {status === 'success' && (
                            <>
                                <div className="flex justify-center mb-4">
                                    <FaCheckCircle className="w-16 h-16 text-green-500" />
                                </div>
                                <p className="font-sans text-base text-luxe-charcoal dark:text-luxe-cream mb-6">
                                    {message}
                                </p>
                                <Link
                                    to="/login"
                                    className="btn-luxe-gold inline-block"
                                >
                                    Se connecter
                                </Link>
                            </>
                        )}

                        {status === 'error' && (
                            <>
                                <div className="flex justify-center mb-4">
                                    <FaTimesCircle className="w-16 h-16 text-red-500" />
                                </div>
                                <p className="font-sans text-base text-red-600 dark:text-red-400 mb-6">
                                    {message}
                                </p>
                                <div className="space-y-3">
                                    <Link
                                        to="/register"
                                        className="btn-luxe-gold inline-block w-full"
                                    >
                                        Créer un compte
                                    </Link>
                                    <Link
                                        to="/login"
                                        className="block text-center font-sans text-sm text-luxe-charcoal/70 dark:text-luxe-cream/70 hover:text-luxe-gold transition-colors duration-200"
                                    >
                                        Aller à la connexion
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmailScreen;
