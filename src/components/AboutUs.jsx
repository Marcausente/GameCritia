import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './AboutUs.css';

const AboutUs = () => {
    // Default content fallback
    const [content, setContent] = useState({
        bio_p1: 'Soy Marcausente, tengo 21 años y soy un apasionado de los videojuegos desde que tengo memoria. A lo largo de los años he jugado a títulos de todo tipo y género, disfrutándolos como pocas cosas en el mundo, siempre con la curiosidad de entender qué los hace especiales… o por qué, en algunos casos, no terminan de funcionar conmigo.',
        bio_p2: 'Desde hace un tiempo rondaba por mi cabeza la idea de crear un portal de críticas de videojuegos. Un espacio donde, tras terminar un juego, pudiera plasmar mi experiencia de forma honesta y personal, analizando no solo sus mecánicas o apartado técnico, sino también las sensaciones y emociones que me ha transmitido durante las horas de juego.',
        bio_p3: 'El objetivo de GameCritia es mirar los videojuegos desde otra perspectiva: más analítica, reflexiva y cercana. Darle una segunda vuelta a títulos que he disfrutado enormemente, pero también revisitar aquellos que en su momento no encajaron conmigo, con la intención de descubrir si, bajo un análisis más profundo, esconden joyas en bruto que pasé por alto.',
        bio_p4: 'Este proyecto nace del amor por el medio y de las ganas de compartir una visión sincera, crítica y personal de cada experiencia jugable.',
        contact_name: 'Marc Fernández Messa',
        contact_email: 'marcausente@gmail.com',
        contact_twitter_url: 'https://x.com/marcausente',
        contact_twitter_handle: '@marcausente'
    });
    
    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [status, setStatus] = useState('idle'); // idle, sending, success, error

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        try {
            // Fetch About Us
            const { data: aboutData, error: aboutError } = await supabase.from('about_us_content').select('*').single();
            if (aboutError && aboutError.code !== 'PGRST116') throw aboutError;

            // Fetch Contact Info
            const { data: contactData, error: contactError } = await supabase.from('contact_info').select('*').single();
            if (contactError && contactError.code !== 'PGRST116') throw contactError;
            
            // Merge into content state
            const newContent = { ...content };
            
            if (aboutData) {
                newContent['bio'] = aboutData.bio;
            }

            if (contactData) {
                newContent['contact_name'] = contactData.name;
                newContent['contact_email'] = contactData.email;
                newContent['contact_twitter_url'] = contactData.twitter_url;
                newContent['contact_twitter_handle'] = contactData.twitter_handle;
            }

            setContent(newContent);
        } catch (error) {
            if (error.name !== 'AbortError' && error.message !== 'AbortError: The operation was aborted.') {
                console.error('Error fetching content:', error);
            }
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('sending');

        try {
            const response = await fetch(`https://formsubmit.co/ajax/${content.contact_email}`, {
                method: "POST",
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    message: formData.message,
                    _subject: `Nuevo mensaje de ${formData.name} - GameCritia`
                })
            });

            if (response.ok) {
                setStatus('success');
                setFormData({ name: '', email: '', message: '' });
                setTimeout(() => setStatus('idle'), 5000);
            } else {
                setStatus('error');
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            setStatus('error');
        }
    };

    return (
        <section id="about" className="about-section">
            <div className="about-background-glow"></div>
            <div className="about-container">

                <div className="about-header">
                    <h2 className="section-title">Sobre Nosotros</h2>
                    <div className="title-underline"></div>
                </div>

                <div className="about-single-card">
                    <p style={{ whiteSpace: 'pre-wrap' }}>{content.bio}</p>
                </div>

                <div id="contact" className="contact-section">
                    <div className="about-header">
                        <h2 className="section-title">Contacto</h2>
                        <div className="title-underline"></div>
                    </div>

                    <div className="contact-content">
                        <div className="contact-info">
                            <h3>Hablemos</h3>
                            <p className="contact-name"><strong>{content.contact_name}</strong></p>
                            <div className="contact-links">
                                <a href={`mailto:${content.contact_email}`} className="contact-link">
                                    <span className="icon">✉️</span> {content.contact_email}
                                </a>
                                <a href={content.contact_twitter_url} target="_blank" rel="noopener noreferrer" className="contact-link">
                                    <span className="icon">✖️</span> {content.contact_twitter_handle}
                                </a>
                            </div>
                        </div>

                        <form className="contact-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <input 
                                    type="text" 
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Tu Nombre" 
                                    className="form-input" 
                                    required 
                                    disabled={status === 'sending'}
                                />
                            </div>
                            <div className="form-group">
                                <input 
                                    type="email" 
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Tu Email" 
                                    className="form-input" 
                                    required 
                                    disabled={status === 'sending'}
                                />
                            </div>
                            <div className="form-group">
                                <textarea 
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder="Tu Mensaje" 
                                    className="form-textarea" 
                                    rows="5" 
                                    required
                                    disabled={status === 'sending'}
                                ></textarea>
                            </div>
                            
                            <button type="submit" className={`submit-btn ${status}`} disabled={status === 'sending' || status === 'success'}>
                                {status === 'sending' ? 'Enviando...' : 
                                 status === 'success' ? '¡Enviado con éxito!' : 
                                 status === 'error' ? 'Error. Intentar de nuevo' : 'Enviar Mensaje'}
                            </button>
                            
                            {status === 'success' && (
                                <div className="success-message">
                                    ¡Gracias por tu mensaje! Me pondré en contacto contigo pronto.
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutUs;
