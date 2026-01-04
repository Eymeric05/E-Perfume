import React, { useState, useContext, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Store } from '../context/StoreContext';
import { Helmet } from 'react-helmet-async';
import { FaLock, FaEnvelope } from 'react-icons/fa';
import { apiFetch } from '../utils/api';
import { loginSchema } from '../schemas/validationSchemas';
import { safeValidateForm } from '../utils/formValidation';
import ReCaptcha from '../components/ReCaptcha';

const LoginScreen = () => {
    const navigate = useNavigate();
    const { search } = useLocation();
    const redirectInUrl = new URLSearchParams(search).get('redirect');
    const redirect = redirectInUrl ? redirectInUrl : '/';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [recaptchaToken, setRecaptchaToken] = useState('');
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { state, dispatch: ctxDispatch } = useContext(Store);
    const { userInfo } = state;

    const handleRecaptchaVerify = (token) => {
        setRecaptchaToken(token);
    };

    const handleRecaptchaExpire = () => {
        setRecaptchaToken('');
    };

    const handleRecaptchaError = (error) => {
        console.error('reCAPTCHA error:', error);
        setRecaptchaToken('');
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        setErrors({});
        setIsSubmitting(true);

        // Validation avec Zod
        const validation = safeValidateForm(loginSchema, {
            email,
            password,
            recaptchaToken: recaptchaToken, // Obligatoire pour reCAPTCHA
        });

        if (!validation.success) {
            setErrors(validation.errors);
            setIsSubmitting(false);
            return;
        }

        try {
            const res = await apiFetch('/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: validation.data.email,
                    password: validation.data.password,
                    recaptchaToken: validation.data.recaptchaToken, // Envoyer le token au backend
                }),
            });

            if (res.ok) {
                const data = await res.json();
                ctxDispatch({ type: 'USER_SIGNIN', payload: data });
                localStorage.setItem('userInfo', JSON.stringify(data));
                navigate(redirect);
            } else {
                const errorData = await res.json().catch(() => ({ message: 'Email ou mot de passe incorrect' }));
                setErrors({ submit: errorData.message || 'Email ou mot de passe incorrect' });
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
        <div className="min-h-screen bg-luxe-cream dark:bg-luxe-charcoal flex items-center justify-center py-12 px-4">
            <Helmet>
                <title>Connexion - E-perfume</title>
            </Helmet>

            <div className="w-full max-w-md">
                <div className="bg-luxe-warm-white dark:bg-luxe-charcoal rounded-lg shadow-lg border border-luxe-charcoal/10 dark:border-luxe-gold/20 p-8">
                    <div className="text-center mb-8">
                        <h1 className="font-serif text-4xl md:text-5xl font-light text-luxe-black dark:text-luxe-cream mb-2">
                            Connexion
                        </h1>
                        <p className="font-sans text-sm text-luxe-charcoal/70 dark:text-luxe-cream/70">
                            Accédez à votre compte E-perfume
                        </p>
                    </div>

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

                        <div>
                            <label htmlFor="password" className="block font-sans text-sm font-medium text-luxe-black dark:text-luxe-cream mb-2">
                                Mot de passe
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <FaLock className="w-5 h-5 text-luxe-charcoal/40 dark:text-luxe-cream/40" />
                                </div>
                                <input
                                    type="password"
                                    id="password"
                                    placeholder="Entrez votre mot de passe"
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
                        </div>

                        {/* reCAPTCHA - Préparé pour l'intégration future */}
                        <div>
                            <ReCaptcha
                                onVerify={handleRecaptchaVerify}
                                onExpire={handleRecaptchaExpire}
                                onError={handleRecaptchaError}
                                theme="light"
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn-luxe-gold w-full"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Connexion en cours...' : 'Se connecter'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="font-sans text-sm text-luxe-charcoal/70 dark:text-luxe-cream/70">
                            Nouveau client ?{' '}
                            <Link
                                to={`/register?redirect=${redirect}`}
                                className="text-luxe-gold hover:text-luxe-black dark:hover:text-luxe-cream transition-colors duration-200 font-medium"
                            >
                                Créer un compte
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
