import { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ReviewGrid from './components/ReviewGrid';
import AboutUs from './components/AboutUs';
import { mockReviews } from './data/mockReviews';
import { AuthProvider } from './context/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <div className="app">
        <Navbar />
        <main>
          <Hero />
          <section id="reviews">
            <ReviewGrid reviews={mockReviews} />
          </section>
          <AboutUs />
        </main>
        <footer className="footer">
          <p>&copy; 2024 GameCritia. All rights reserved.</p>
        </footer>
      </div>
    </AuthProvider>
  );
}

export default App;
