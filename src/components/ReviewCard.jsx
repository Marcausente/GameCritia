import React from 'react';
import { Link } from 'react-router-dom';
import './ReviewCard.css';

const ReviewCard = ({ review }) => {
    // Handle both old mock data structure and new DB structure
    const title = review.title;
    const subtitle = review.subtitle || review.excerpt;
    const image = review.cover_image || review.image;
    const author = review.author || 'Anónimo';
    const rating = review.rating || 0;

    // Determine color based on rating
    let ratingColor = '#8B0000'; // Default Deep Red
    if (rating >= 9.5) ratingColor = '#FFD700'; // Gold
    else if (rating >= 8) ratingColor = '#20B2AA'; // Teal
    else if (rating >= 7) ratingColor = '#90EE90'; // Light Green
    else if (rating >= 6) ratingColor = '#FFFF00'; // Yellow
    else if (rating >= 5) ratingColor = '#808080'; // Gray
    else if (rating >= 3) ratingColor = '#FF4500'; // Orange

    return (
        <Link to={`/resenas/${review.id}`} className="review-card-link" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="review-card">
                <div className="review-image-container">
                    <img src={image} alt={title} className="review-image" />
                    <div className="review-rating" style={{ backgroundColor: ratingColor }}>
                        {rating}
                    </div>
                </div>
                <div className="review-content">
                    <h3 className="review-title">{title}</h3>
                    <p className="review-subtitle">{subtitle}</p>
                    <div className="review-footer">
                        <span className="review-author">{author}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ReviewCard;
