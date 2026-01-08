import React from 'react';
import './ReviewCard.css';

const ReviewCard = ({ review }) => {
    return (
        <div className="review-card">
            <div className="card-image-container">
                <img src={review.image} alt={review.title} className="card-image" />
                <div className="card-rating">{review.rating}</div>
            </div>
            <div className="card-content">
                <h3 className="card-title">{review.title}</h3>
                <p className="card-excerpt">{review.excerpt}</p>
                <div className="card-footer">
                    <span className="card-author">by {review.author}</span>
                    <span className="card-date">{review.date}</span>
                </div>
            </div>
        </div>
    );
};

export default ReviewCard;
