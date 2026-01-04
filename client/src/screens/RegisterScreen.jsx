import React, { useState, useContext, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Store } from '../context/StoreContext';
import { apiFetch } from '../utils/api';
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

    const { state, dispatch: ctxDispatch } = useContext(Store);
    const { userInfo } = state;

    const submitHandler = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        try {
            const res = await apiFetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            });

            if (res.ok) {
                const data = await res.json();
                ctxDispatch({ type: 'USER_SIGNIN', payload: data });
                localStorage.setItem('userInfo', JSON.stringify(data));
                navigate(redirect);
            } else {
                alert('Invalid user data');
            }
        } catch (err) {
            alert('Invalid user data');
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
            <form onSubmit={submitHandler}>
                <div className="register-form-group">
                    <label htmlFor="name" className="register-label">Nom</label>
                    <input
                        type="text"
                        id="name"
                        placeholder="Entrez votre nom"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="register-input"
                        required
                    />
                </div>
                <div className="register-form-group">
                    <label htmlFor="email" className="register-label">Email</label>
                    <input
                        type="email"
                        id="email"
                        placeholder="Entrez votre email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="register-input"
                        required
                    />
                </div>
                <div className="register-form-group">
                    <label htmlFor="password" className="register-label">Mot de passe</label>
                    <input
                        type="password"
                        id="password"
                        placeholder="Entrez votre mot de passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="register-input"
                        required
                    />
                </div>
                <div className="register-form-group">
                    <label htmlFor="confirmPassword" className="register-label">Confirmer mot de passe</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        placeholder="Confirmez votre mot de passe"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="register-input"
                        required
                    />
                </div>
                <div className="register-form-group" style={{ marginTop: '1.5rem' }}>
                    <button type="submit" className="btn-luxe-gold w-full">
                        S'inscrire
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
