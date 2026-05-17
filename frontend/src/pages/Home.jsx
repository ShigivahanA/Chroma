import React from 'react';
import SEO from '../components/SEO';
import Hero from '../components/Hero';
import Manifesto from '../components/Manifesto';
import Marquee from '../components/Marquee';
import Features from '../components/Features';
import GalleryTeaser from '../components/GalleryTeaser';
import Footer from '../components/Footer';

const Home = () => {
  return (
    <div className="w-full flex flex-col bg-art-white">
      <SEO
        title="Home"
        description="Chroma is a free online color palette generator. Create, explore, and save beautiful color combinations for your designs. Browse 1000+ curated palettes."
        path="/"
      />
      <Hero />
      <Manifesto />
      <Features />
      {/* <GalleryTeaser />
      <Marquee /> */}
      <Footer />
    </div>
  );
};

export default Home;
