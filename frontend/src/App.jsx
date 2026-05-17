import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Popular from './pages/Popular';
import Studio from './pages/Studio';
import Import from './pages/Import';
import Connect from './pages/Connect';
import './App.css';

function App() {
  return (
    <HelmetProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-art-white relative w-full overflow-x-clip">
          <Navbar />
          
          <main className="flex-1 relative z-10 w-full">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/popular" element={<Popular />} />
              <Route path="/studio" element={<Studio />} />
              <Route path="/import" element={<Import />} />
              <Route path="/connect" element={<Connect />} />
            </Routes>
          </main>
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App;
