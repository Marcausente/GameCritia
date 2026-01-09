import Hero from '../components/Hero';
import ReviewGrid from '../components/ReviewGrid';
import AboutUs from '../components/AboutUs';
import { mockReviews } from '../data/mockReviews';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

const Home = () => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    // Fetch latest 6 reviews from DB
    const fetchLatestReviews = async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);
      
      if (data) {
        setReviews(data);
      } else {
        // Fallback or empty
        setReviews([]);
      }
    };

    fetchLatestReviews();
  }, []);

  return (
    <>
      <Hero />
      <section id="reviews" style={{ padding: '2rem 2rem 4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: '2rem', 
            marginBottom: '2rem', 
            color: 'white',
            textAlign: 'center' 
          }}>Últimas Reseñas</h2>
          
          <ReviewGrid reviews={reviews} />

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <Link to="/resenas" className="btn-primary" style={{ 
                  display: 'inline-block',
                  padding: '0.8rem 2rem', 
                  background: 'var(--primary)', 
                  color: 'white', 
                  borderRadius: '50px',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  transition: 'transform 0.2s'
              }}>
                  Ver todas las reseñas
              </Link>
          </div>
      </section>
      <AboutUs />
    </>
  );
};

export default Home;
