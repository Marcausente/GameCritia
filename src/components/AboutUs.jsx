import React from 'react';
import './AboutUs.css';

const AboutUs = () => {
    return (
        <section id="about" className="about-section">
            <div className="about-background-glow"></div>
            <div className="about-container">

                <div className="about-header">
                    <h2 className="section-title">Sobre Nosotros</h2>
                    <div className="title-underline"></div>
                </div>

                <div className="about-single-card">
                    <p>
                        Soy <strong>Marcausente</strong>, tengo 21 años y soy un apasionado de los videojuegos desde que tengo memoria. A lo largo de los años he jugado a títulos de todo tipo y género, disfrutándolos como pocas cosas en el mundo, siempre con la curiosidad de entender qué los hace especiales… o por qué, en algunos casos, no terminan de funcionar conmigo.
                    </p>
                    <p>
                        Desde hace un tiempo rondaba por mi cabeza la idea de crear un portal de críticas de videojuegos. Un espacio donde, tras terminar un juego, pudiera plasmar mi experiencia de forma honesta y personal, analizando no solo sus mecánicas o apartado técnico, sino también las sensaciones y emociones que me ha transmitido durante las horas de juego.
                    </p>
                    <p>
                        El objetivo de <strong>GameCritia</strong> es mirar los videojuegos desde otra perspectiva: más analítica, reflexiva y cercana. Darle una segunda vuelta a títulos que he disfrutado enormemente, pero también revisitar aquellos que en su momento no encajaron conmigo, con la intención de descubrir si, bajo un análisis más profundo, esconden joyas en bruto que pasé por alto.
                    </p>
                    <p>
                        Este proyecto nace del amor por el medio y de las ganas de compartir una visión sincera, crítica y personal de cada experiencia jugable.
                    </p>
                </div>

            </div>
        </section>
    );
};

export default AboutUs;
