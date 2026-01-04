import React, { useState, useContext, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Store } from '../context/StoreContext';
import { apiFetch } from '../utils/api';
import { registerSchema } from '../schemas/validationSchemas';
import { safeValidateForm } from '../utils/formValidation';
import ReCaptcha from '../components/ReCaptcha';
import '../styles/screens/_register.scss';

const RegisterScreen = () => {
    const navigate = useNavigate();
    const { search } = useLocation();
    const redirectInUrl = new URLSearchParams(search).get('redirect');
    const redirect = redirectInUrl ? redirectInUrl : '/';

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
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
                ctxDispatch({ type: 'USER_SIGNIN', payload: data });
                localStorage.setItem('userInfo', JSON.stringify(data));
                navigate(redirect);
            } else {
                const errorData = await res.json().catch(() => ({ message: 'Erreur lors de l\'inscription' }));
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
                            setPassword(e.target.value);
                            if (errors.password) setErrors({ ...errors, password: undefined });
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
                            setConfirmPassword(e.target.value);
                            if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                        }}
                        className={`register-input ${errors.confirmPassword ? 'border-red-500' : ''}`}
                        required
                    />
                    {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
                    )}
                </div>

                {/* reCAPTCHA - Préparé pour l'intégration future */}
                <div className="register-form-group">
                    <ReCaptcha
                        onVerify={handleRecaptchaVerify}
                        onExpire={handleRecaptchaExpire}
                        onError={handleRecaptchaError}
                        theme="light"
                    />
                </div>

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
            <div className="register-footer">
                Déjà un compte ?{' '}
                <Link to={`/login?redirect=${redirect}`}>Se connecter</Link>
            </div>
        </div>
    );
};

export default RegisterScreen;
