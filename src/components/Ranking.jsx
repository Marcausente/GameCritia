import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import './Ranking.css';

const Ranking = () => {
    const [topGames, setTopGames] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTopGames = async () => {
            try {
                const { data, error } = await supabase
                    .from('reviews')
                    .select('*')
                    .gte('rating', 8)
                    .lte('rating', 10)
                    .order('rating', { ascending: false });

                if (error) {
                    console.error('Error fetching top games:', error);
                    setTopGames([]);
                } else {
                    setTopGames(data || []);
                }
            } catch (err) {
                console.error('Error:', err);
                setTopGames([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTopGames();
    }, []);

    const getMedalEmoji = (position) => {
        if (position === 0) return '🥇';
        if (position === 1) return '🥈';
        if (position === 2) return '🥉';
        return null;
    };

    const getRatingColor = (rating) => {
        if (rating >= 9.5) return '#FFD700'; // Gold
        if (rating >= 9) return '#20B2AA'; // Teal
        if (rating >= 8.5) return '#90EE90'; // Light Green
        return '#FFFF00'; // Yellow
    };

    if (loading) {
        return (
            <section id="ranking" className="ranking-section">
                <div className="ranking-container">
                    <h2 className="ranking-title">🏆 Ranking de Juegos</h2>
                    <p className="ranking-loading">Cargando ranking...</p>
                </div>
            </section>
        );
    }

    if (topGames.length === 0) {
        return (
            <section id="ranking" className="ranking-section">
                <div className="ranking-container">
                    <h2 className="ranking-title">🏆 Ranking de Juegos</h2>
                    <p className="ranking-empty">No hay juegos con nota entre 8 y 10 todavía.</p>
                </div>
            </section>
        );
    }

    return (
        <section id="ranking" className="ranking-section">
            <div className="ranking-container">
                <h2 className="ranking-title">🏆 Ranking de Juegos</h2>
                <p className="ranking-subtitle">Los mejores juegos valorados entre 8 y 10</p>

                <div className="ranking-list">
                    {topGames.map((game, index) => {
                        const medal = getMedalEmoji(index);
                        const position = index + 1;
                        const isPodium = position <= 3;

                        return (
                            <Link
                                to={`/resenas/${game.id}`}
                                key={game.id}
                                className={`ranking-item ${isPodium ? `podium-${position}` : ''}`}
                                style={{ textDecoration: 'none' }}
                            >
                                <div className="ranking-position">
                                    {medal ? (
                                        <span className="medal">{medal}</span>
                                    ) : (
                                        <span className="position-number">{position}</span>
                                    )}
                                </div>

                                <div className="ranking-image-container">
                                    <img
                                        src={game.cover_image}
                                        alt={game.title}
                                        className="ranking-image"
                                    />
                                </div>

                                <div className="ranking-info">
                                    <h3 className="ranking-game-title">{game.title}</h3>
                                    {game.subtitle && (
                                        <p className="ranking-game-subtitle">{game.subtitle}</p>
                                    )}
                                    <span className="ranking-author">{game.author || 'Anónimo'}</span>
                                </div>

                                <div
                                    className="ranking-rating"
                                    style={{ backgroundColor: getRatingColor(game.rating) }}
                                >
                                    {game.rating}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default Ranking;
