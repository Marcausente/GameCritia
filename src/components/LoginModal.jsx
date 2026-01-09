import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import './LoginModal.css';

const LoginModal = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const loginPromise = supabase.auth.signInWithPassword({
                email,
                password,
            });
            
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Login timeout')), 8000) // 8 seconds timeout
            );

            const { data, error } = await Promise.race([loginPromise, timeoutPromise]);

            if (error) {
                // Map Supabase errors to user-friendly messages
                if (error.message.includes("Login timeout")) {
                    setError("El servidor tarda en responder. Inténtalo de nuevo.");
                } else if (error.message.includes("Invalid login credentials")) {
                    setError("Correo o contraseña incorrectos");
                } else if (error.message.includes("Email not confirmed")) {
                    setError("Por favor, confirma tu correo electrónico");
                } else {
                    setError("Error al iniciar sesión: " + error.message);
                }
            } else {
                // Success
                onClose();
                // Reset form
                setEmail('');
                setPassword('');
            }
        } catch (err) {
            setError("Ocurrió un error inesperado");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>&times;</button>
                
                <h2 className="modal-title">Iniciar Sesión</h2>
                
                {error && <div className="error-message">{error}</div>}
                
                <form className="login-form" onSubmit={handleLogin}>
                    <div className="form-group">
                        <label htmlFor="email">Correo Electrónico</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="admin@gamecritia.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    
                    <button type="submit" className="login-btn-submit" disabled={loading}>
                        {loading ? 'Entrando...' : 'Acceder'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginModal;
