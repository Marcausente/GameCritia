import React from 'react';
import ReviewCard from './ReviewCard';
import './ReviewGrid.css';

const ReviewGrid = ({ reviews }) => {
    return (
        <div className="review-grid-container">
            <h2 className="section-title">Últimas Reseñas</h2>
            <div className="review-grid">
                {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                ))}
            </div>
        </div>
    );
};

export default ReviewGrid;
