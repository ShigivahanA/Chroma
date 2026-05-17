import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const specimens = [
  { hex: "#000100", label: "Obsidian" },
  { hex: "#A1A6B4", label: "Pewter" },
  { hex: "#94C5CC", label: "Celadon" },
  { hex: "#B4D2E7", label: "Glacier" },
  { hex: "#F8F8F8", label: "Ivory" },
];

const Footer = () => {
  const [hoveredHex, setHoveredHex] = useState(null);
  const [clickCount, setClickCount] = useState(0);
  const navigate = useNavigate();

  const handleChromaClick = (e) => {
    e.preventDefault();
    const nextCount = clickCount + 1;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        const pitch = 220 + (nextCount * 44);
        osc.frequency.setValueAtTime(pitch, ctx.currentTime);
        osc.type = 'sine';

        gainNode.gain.setValueAtTime(0.015, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);

        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      }
    } catch (err) { }

    if (nextCount >= 10) {
      setClickCount(0);
      navigate('/import');
    } else {
      setClickCount(nextCount);
    }
  };

  return (
    <footer className="w-full bg-art-black text-art-white pt-16 pb-8 px-6 sm:px-12 md:px-24 relative overflow-hidden flex flex-col justify-between min-h-[30vh] md:min-h-[35vh] group">

      {/* Top Row: Clean Horizontal Spread */}
      <div className="w-full max-w-[1400px] mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8 pb-12">

        {/* Brand Serif Logo */}
        <div className="space-y-2 select-none">
          <a
            href="/"
            onClick={handleChromaClick}
            className="inline-block text-2xl sm:text-3xl font-serif italic text-art-white tracking-tight hover:text-art-teal transition-all duration-150 active:scale-95 cursor-pointer"
          >
            chroma.
          </a>
          <p className={`font-mono text-[9px] tracking-widest uppercase transition-all duration-300 ${clickCount >= 7 ? 'text-art-teal font-extrabold animate-pulse' : 'text-art-gray/40'}`}>
            {clickCount === 7 ? '✦ 3 clicks left...' :
              clickCount === 8 ? '✦ 2 clicks left...' :
                clickCount === 9 ? '✦ 1 click left!' :
                  'Color Lab'}
          </p>
        </div>

        {/* Minimal Quick Links Row */}
        <nav className="flex flex-wrap gap-x-8 gap-y-3">
          <Link
            to="/studio"
            className="font-sans text-[10px] sm:text-xs tracking-[0.25em] uppercase text-art-gray hover:text-art-teal transition-colors duration-300 font-bold"
          >
            Studio
          </Link>
          <Link
            to="/lens"
            className="font-sans text-[10px] sm:text-xs tracking-[0.25em] uppercase text-art-gray hover:text-art-teal transition-colors duration-300 font-bold"
          >
            Lens
          </Link>
          <Link
            to="/contrast"
            className="font-sans text-[10px] sm:text-xs tracking-[0.25em] uppercase text-art-gray hover:text-art-teal transition-colors duration-300 font-bold"
          >
            Contrast
          </Link>
          <Link
            to="/morph"
            className="font-sans text-[10px] sm:text-xs tracking-[0.25em] uppercase text-art-gray hover:text-art-teal transition-colors duration-300 font-bold"
          >
            Morph
          </Link>
          <Link
            to="/popular"
            className="font-sans text-[10px] sm:text-xs tracking-[0.25em] uppercase text-art-gray hover:text-art-teal transition-colors duration-300 font-bold"
          >
            Popular
          </Link>
          <Link
            to="/connect"
            className="font-sans text-[10px] sm:text-xs tracking-[0.25em] uppercase text-art-gray hover:text-art-teal transition-colors duration-300 font-bold"
          >
            Connect
          </Link>
        </nav>

      </div>

      {/* Middle Row: Fine Hairline Divider */}
      <div className="w-full max-w-[1400px] mx-auto border-t border-art-white/10 my-6 transition-colors duration-500 group-hover:border-art-white/20" />

      {/* Bottom Row: Micro Metadata & Copyright */}
      <div className="w-full max-w-[1400px] mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pt-6 relative z-10">

        {/* Micro Copyright */}
        <div className="font-sans text-[9px] tracking-[0.25em] text-art-gray uppercase">
          © {new Date().getFullYear()} CHROMA
        </div>


      </div>

      {/* Bottom Full-Bleed Spectrum Ribbon (Frees footer from vertical length and provides visual treat) */}
      <div className="absolute bottom-0 left-0 right-0 h-1 sm:h-1.5 flex gap-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:h-4 z-20">
        {specimens.map((specimen) => (
          <div
            key={specimen.hex}
            className="flex-1 h-full cursor-pointer transition-all duration-300 relative group/band hover:flex-[1.5]"
            style={{ backgroundColor: specimen.hex }}
            onMouseEnter={() => setHoveredHex(specimen.hex)}
            onMouseLeave={() => setHoveredHex(null)}
          >
            {/* Soft, beautiful floating tooltip displaying hex values */}
            <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 bg-art-black border border-art-white/10 px-2.5 py-1 rounded text-[9px] font-mono tracking-widest text-art-white transition-all duration-300 pointer-events-none whitespace-nowrap shadow-xl ${hoveredHex === specimen.hex ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
              {specimen.label} // {specimen.hex}
            </div>
          </div>
        ))}
      </div>

    </footer>
  );
};

export default Footer;
