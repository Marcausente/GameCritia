import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import ReviewGrid from '../components/ReviewGrid';

const AllReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (data) setReviews(data);
        setLoading(false);
    };

    const filteredReviews = reviews.filter(review => 
        review.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ paddingTop: '8rem', paddingBottom: '4rem', minHeight: '100vh', maxWidth: '1200px', margin: '0 auto', paddingLeft: '2rem', paddingRight: '2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'white' }}>Todas las Reseñas</h1>
                <input 
                    type="text" 
                    placeholder="Buscar por título..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        padding: '1rem 1.5rem',
                        width: '100%',
                        maxWidth: '500px',
                        borderRadius: '50px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(0,0,0,0.3)',
                        color: 'white',
                        fontSize: '1.1rem',
                        outline: 'none'
                    }}
                />
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', color: '#aaa' }}>Cargando reseñas...</div>
            ) : (
                <ReviewGrid reviews={filteredReviews} />
            )}
            
            {!loading && filteredReviews.length === 0 && (
                <div style={{ textAlign: 'center', color: '#aaa', marginTop: '2rem' }}>
                    No se encontraron reseñas con ese título.
                </div>
            )}
        </div>
    );
};

export default AllReviews;
