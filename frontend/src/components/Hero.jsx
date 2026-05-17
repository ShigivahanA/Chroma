import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const brandColors = [
  { hex: '#000100', name: 'art-black' },
  { hex: '#A1A6B4', name: 'art-gray' },
  { hex: '#94C5CC', name: 'art-teal' },
  { hex: '#B4D2E7', name: 'art-blue' },
  { hex: '#F8F8F8', name: 'art-white' }
];

const Hero = () => {
  const [shuffledColors, setShuffledColors] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [copiedColor, setCopiedColor] = useState(null);

  useEffect(() => {
    // Shuffle the brand colors on every visit for a unique majestic composition
    setShuffledColors([...brandColors].sort(() => Math.random() - 0.5));
  }, []);

  const handleCopy = (hex) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden flex bg-art-white">
      
      {/* The 5 Brand Colors Accordion */}
      {shuffledColors.map((color, i) => (
        <motion.div
          key={color.name}
          initial={{ y: i % 2 === 0 ? '-100%' : '100%' }}
          animate={{ y: 0 }}
          transition={{ 
            duration: 1.5, 
            delay: i * 0.1, 
            ease: [0.76, 0, 0.24, 1] 
          }}
          onMouseEnter={() => setHoveredIndex(i)}
          onMouseLeave={() => setHoveredIndex(null)}
          className="h-full relative group border-r border-art-black/5 last:border-r-0 cursor-pointer transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]"
          style={{ 
            backgroundColor: color.hex,
            flex: hoveredIndex === i ? 2 : hoveredIndex === null ? 1 : 0.8
          }}
          onClick={() => handleCopy(color.hex)}
        >
          {/* Horizontal Hex Reveal & Copy at Bottom */}
          <div className="absolute bottom-16 md:bottom-24 left-0 w-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-4 group-hover:translate-y-0">
             <span className={`font-sans text-lg md:text-xl tracking-[0.3em] uppercase font-light pointer-events-none select-none ${color.name === 'art-white' ? 'text-art-black' : 'text-art-white'}`}>
               {copiedColor === color.hex ? 'Sampled' : color.hex}
             </span>
             <span className={`font-sans text-[10px] tracking-[0.2em] uppercase mt-2 opacity-50 pointer-events-none ${color.name === 'art-white' ? 'text-art-black' : 'text-art-white'}`}>
               {copiedColor === color.hex ? '' : 'Click to sample'}
             </span>
          </div>
        </motion.div>
      ))}

      {/* Massive Center Overlay Typography */}
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-10 mix-blend-difference">
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
          className="font-sans text-xs md:text-sm tracking-[0.4em] uppercase text-art-white opacity-80 mb-2 md:mb-4"
        >
          A Generative Exhibition
        </motion.p>
        <motion.h1 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
          className="text-[20vw] leading-none font-serif tracking-tighter italic select-none text-art-white"
        >
          chroma.
        </motion.h1>
      </div>

    </div>
  );
};

export default Hero;
