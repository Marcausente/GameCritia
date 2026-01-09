import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ReviewGrid from './components/ReviewGrid';
import AboutUs from './components/AboutUs';
import AdminPanel from './components/AdminPanel'; // Import AdminPanel
import { mockReviews } from './data/mockReviews';
import { AuthProvider } from './context/AuthContext';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home' or 'admin'

  return (
    <AuthProvider>
      <div className="app">
        <Navbar onAdminClick={setCurrentView} />
        <main>
          {currentView === 'home' ? (
            <>
              <Hero />
              <section id="reviews">
                <ReviewGrid reviews={mockReviews} />
              </section>
              <AboutUs />
            </>
          ) : (
            <AdminPanel />
          )}
        </main>
        <footer className="footer">
          <p>&copy; 2024 GameCritia. All rights reserved.</p>
        </footer>
      </div>
    </AuthProvider>
  );
}

export default App;
