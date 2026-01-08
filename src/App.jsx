import { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ReviewGrid from './components/ReviewGrid';
import { mockReviews } from './data/mockReviews';
import './App.css';

function App() {
  return (
    <div className="app">
      <Navbar />
      <main>
        <Hero />
        <section id="reviews">
          <ReviewGrid reviews={mockReviews} />
        </section>
      </main>
      <footer className="footer">
        <p>&copy; 2024 GameCritia. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
