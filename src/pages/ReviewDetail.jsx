import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './ReviewDetail.css';

const ReviewDetail = () => {
    const { id } = useParams();
    const [review, setReview] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReview = async () => {
            if (!id) return;
            const { data, error } = await supabase
                .from('reviews')
                .select('*')
                .eq('id', id)
                .single();
            
            if (data) setReview(data);
            setLoading(false);
        };
        fetchReview();
    }, [id]);

    const getRatingColor = (rating) => {
        if (rating >= 9.5) return '#FFD700'; // Gold
        if (rating >= 8) return '#20B2AA'; // Teal
        if (rating >= 7) return '#90EE90'; // Light Green
        if (rating >= 6) return '#FFFF00'; // Yellow
        if (rating >= 5) return '#808080'; // Gray
        if (rating >= 3) return '#FF4500'; // Orange
        return '#8B0000'; // Deep Red
    };

    if (loading) return <div className="loading-state">Cargando reseña...</div>;
    if (!review) return <div className="error-state">Reseña no encontrada. <Link to="/resenas">Volver</Link></div>;

    return (
        <div className="review-detail-page">
            <div className="review-hero" style={{ backgroundImage: review.cover_image ? `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.8)), url(${review.cover_image})` : 'none' }}>
                <div className="hero-content">
                    <h1>{review.title}</h1>
                    <p className="subtitle">{review.subtitle}</p>
                    <div className="meta-info">
                        <span>Por <strong>{review.author || 'Anónimo'}</strong></span>
                        <span> • </span>
                        <span>{new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="rating-badge" style={{ backgroundColor: getRatingColor(review.rating) }}>
                        {review.rating}
                    </div>
                </div>
            </div>

            <div className="review-content-body">
                {review.content && review.content.length > 0 ? (
                    review.content.map((block, index) => {
                        switch (block.type) {
                            case 'header':
                                return <h2 key={index} className="review-section-header">{block.value}</h2>;
                            case 'text':
                                return <p key={index} className="review-paragraph">{block.value}</p>;
                            case 'image':
                                return (
                                    <div key={index} className="review-image-container">
                                        <img src={block.value} alt={block.caption || "Imagen de la reseña"} />
                                        {block.caption && <span className="image-caption">{block.caption}</span>}
                                    </div>
                                );
                            default:
                                return <div key={index}>Contenido desconocido</div>;
                        }
                    })
                ) : (
                    <p>Esta reseña no tiene contenido detallado.</p>
                )}
            </div>
            
            <div className="review-footer">
                <Link to="/resenas" className="back-link">← Volver a todas las reseñas</Link>
            </div>
        </div>
    );
};

export default ReviewDetail;
