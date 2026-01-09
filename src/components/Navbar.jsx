import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import LoginModal from './LoginModal';
import './Navbar.css';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const { user, role } = useAuth();
    const navigate = useNavigate();
    
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
        navigate('/'); // Redirect to home on logout
    };

    return (
        <>
            <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
                <div className="navbar-container">
                    <Link to="/" className="navbar-logo">
                        <img src="/logocritia.png" alt="GameCritia Logo" className="logo-img" />
                        <span className="logo-text">GameCritia</span>
                    </Link>
                    <div className="navbar-links">
                        <Link to="/resenas" className="nav-link">Reseñas</Link>
                        {/* 
                          Note: Anchor links like #ranking, #about, #contact only work if we are on the home page.
                          For now, we can link them to home with hash for simplicity, or implement scroll logic.
                        */}
                        <a href="/#ranking" className="nav-link">Ranking</a>
                        <a href="/#about" className="nav-link">Sobre Nosotros</a>
                        <a href="/#contact" className="nav-link">Contacto</a>
                    </div>
                    <div className="navbar-auth">
                        {user ? (
                            <div className="user-menu">
                                {role === 'administrador' && (
                                    <Link to="/admin" className="btn-login" style={{textDecoration: 'none'}}>Panel de Admin</Link>
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
