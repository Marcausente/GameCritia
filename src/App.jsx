import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import AllReviews from './pages/AllReviews';
import ReviewDetail from './pages/ReviewDetail';
import AdminPanel from './components/AdminPanel';
import { AuthProvider } from './context/AuthContext';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/resenas" element={<AllReviews />} />
              <Route path="/resenas/:id" element={<ReviewDetail />} />
              {/* Fallback to Home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <footer className="footer">
            <p>&copy; 2024 GameCritia. All rights reserved.</p>
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
