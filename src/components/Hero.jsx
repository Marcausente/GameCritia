import React from 'react';
import './Hero.css';

const Hero = () => {
    return (
        <section className="hero">
            <div className="hero-content">
                <h1 className="hero-title">
                    Explora el Mundo del <br />
                    <span className="highlight">Gaming</span>
                </h1>
                <p className="hero-subtitle">
                    Reseñas honestas, análisis profundos y una comunidad de jugadores apasionados.
                    Descubre tu próximo juego favorito con GameCritia.
                </p>
                <div className="hero-buttons">
                    <button className="hero-btn primary">Leer Últimas Reseñas</button>
                </div>
            </div>
            <div className="hero-background-elements">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
            </div>
        </section>
    );
};

export default Hero;
