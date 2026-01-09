import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import LoginModal from './LoginModal';
import './Navbar.css';

const Navbar = ({ onAdminClick }) => {
    const [scrolled, setScrolled] = useState(false);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const { user, role } = useAuth(); // Get user from context
    
    useEffect(() => {
        const handleScroll = () => {
            const offset = window.scrollY;
            if (offset > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <>
            <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
                <div className="navbar-container">
                    <div className="navbar-logo" onClick={() => onAdminClick('home')}>
                        <img src="/logocritia.png" alt="GameCritia Logo" className="logo-img" />
                        <span className="logo-text">GameCritia</span>
                    </div>
                    <div className="navbar-links">
                        <a href="#reviews" className="nav-link" onClick={() => onAdminClick('home')}>Reseñas</a>
                        <a href="#ranking" className="nav-link" onClick={() => onAdminClick('home')}>Ranking</a>
                        <a href="#about" className="nav-link" onClick={() => onAdminClick('home')}>Sobre Nosotros</a>
                        <a href="#contact" className="nav-link" onClick={() => onAdminClick('home')}>Contacto</a>
                    </div>
                    <div className="navbar-auth">
                        {user ? (
                            <div className="user-menu">
                                {role === 'administrador' && (
                                    <button className="btn-login" onClick={() => onAdminClick('admin')}>Panel de Admin</button>
                                )}
                                <span className="user-greeting">Hola, {role === 'administrador' ? 'Admin' : 'Usuario'}</span>
                                <button className="btn-login" onClick={handleLogout}>Cerrar Sesión</button>
                            </div>
                        ) : (
                            <button className="btn-login" onClick={() => setIsLoginOpen(true)}>Iniciar Sesión</button>
                        )}
                    </div>
                </div>
            </nav>

            <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
        </>
    );
};

export default Navbar;
