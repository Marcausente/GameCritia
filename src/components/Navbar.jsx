import React, { useState, useEffect } from 'react';
import './Navbar.css';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);

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

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="navbar-container">
                <div className="navbar-logo">
                    <img src="/logocritia.png" alt="GameCritia Logo" className="logo-img" />
                    <span className="logo-text">GameCritia</span>
                </div>
                <div className="navbar-links">
                    <a href="#reviews" className="nav-link">Reseñas</a>
                    <a href="#ranking" className="nav-link">Ranking</a>
                    <a href="#about" className="nav-link">Sobre Nosotros</a>
                </div>
                <div className="navbar-auth">
                    <button className="btn-login">Iniciar Sesión</button>
                    <button className="btn-signup">Registrarse</button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
```
