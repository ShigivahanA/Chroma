import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/Navbar';
import CookieConsent from './components/CookieConsent';
import Home from './pages/Home';
import Popular from './pages/Popular';
import Studio from './pages/Studio';
import Import from './pages/Import';
import Connect from './pages/Connect';
import Lens from './pages/Lens';
import Contrast from './pages/Contrast';
import Morph from './pages/Morph';
import './App.css';

function App() {
  return (
    <HelmetProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-art-white relative w-full overflow-x-clip">
          <Navbar />
          <CookieConsent />
          
          <main className="flex-1 relative z-10 w-full">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/popular" element={<Popular />} />
              <Route path="/studio" element={<Studio />} />
              <Route path="/import" element={<Import />} />
              <Route path="/connect" element={<Connect />} />
              <Route path="/lens" element={<Lens />} />
              <Route path="/contrast" element={<Contrast />} />
              <Route path="/morph" element={<Morph />} />
            </Routes>
          </main>
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App;
