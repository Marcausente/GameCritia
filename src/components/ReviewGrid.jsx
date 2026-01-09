import React from 'react';
import ReviewCard from './ReviewCard';
import './ReviewGrid.css';

const ReviewGrid = ({ reviews }) => {
    return (
        <div className="review-grid">
            {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
            ))}
        </div>
    );
};

export default ReviewGrid;
