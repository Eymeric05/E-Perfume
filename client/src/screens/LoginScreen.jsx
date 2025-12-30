import React, { useState, useContext, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Store } from '../context/StoreContext';
import { Helmet } from 'react-helmet-async';
import { FaLock, FaEnvelope } from 'react-icons/fa';

const LoginScreen = () => {
    const navigate = useNavigate();
    const { search } = useLocation();
    const redirectInUrl = new URLSearchParams(search).get('redirect');
    const redirect = redirectInUrl ? redirectInUrl : '/';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const { state, dispatch: ctxDispatch } = useContext(Store);
    const { userInfo } = state;

    const submitHandler = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await fetch('/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (res.ok) {
                const data = await res.json();
                ctxDispatch({ type: 'USER_SIGNIN', payload: data });
                localStorage.setItem('userInfo', JSON.stringify(data));
                navigate(redirect);
            } else {
                setError('Email ou mot de passe incorrect');
            }
        } catch (err) {
            setError('Une erreur est survenue. Veuillez réessayer.');
        }
    };

    useEffect(() => {
        if (userInfo) {
            navigate(redirect);
        }
    }, [navigate, redirect, userInfo]);

    return (
        <div className="min-h-screen bg-luxe-cream flex items-center justify-center py-12 px-4">
            <Helmet>
                <title>Connexion - E-perfume</title>
            </Helmet>

            <div className="w-full max-w-md">
                <div className="bg-luxe-warm-white rounded-lg shadow-lg border border-luxe-charcoal/10 p-8">
                    <div className="text-center mb-8">
                        <h1 className="font-serif text-4xl md:text-5xl font-light text-luxe-black mb-2">
                            Connexion
                        </h1>
                        <p className="font-sans text-sm text-luxe-charcoal/70">
                            Accédez à votre compte E-perfume
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="font-sans text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <form onSubmit={submitHandler} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block font-sans text-sm font-medium text-luxe-black mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <FaEnvelope className="w-5 h-5 text-luxe-charcoal/40" />
                                </div>
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="Entrez votre email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-luxe pl-12 w-full"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block font-sans text-sm font-medium text-luxe-black mb-2">
                                Mot de passe
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <FaLock className="w-5 h-5 text-luxe-charcoal/40" />
                                </div>
                                <input
                                    type="password"
                                    id="password"
                                    placeholder="Entrez votre mot de passe"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-luxe pl-12 w-full"
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn-luxe-gold w-full">
                            Se connecter
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="font-sans text-sm text-luxe-charcoal/70">
                            Nouveau client ?{' '}
                            <Link 
                                to={`/register?redirect=${redirect}`}
                                className="text-luxe-gold hover:text-luxe-black transition-colors duration-200 font-medium"
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
