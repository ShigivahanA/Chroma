import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const specimens = [
  { hex: "#000100", label: "Obsidian", num: "01" },
  { hex: "#A1A6B4", label: "Pewter", num: "02" },
  { hex: "#94C5CC", label: "Celadon", num: "03" },
  { hex: "#B4D2E7", label: "Glacier", num: "04" },
  { hex: "#F8F8F8", label: "Ivory", num: "05" },
];

const GalleryTeaser = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <section className="w-full bg-art-white py-16 sm:py-24 md:py-36 px-4 sm:px-6 md:px-12 lg:px-24 border-t border-art-black/10 overflow-hidden select-none">

      {/* Hyper-Responsive Clean Editorial Header */}
      <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 sm:mb-16 md:mb-24 px-2 md:px-8 gap-6">
        <div>
          <p className="font-sans text-[9px] sm:text-[10px] tracking-[0.4em] uppercase text-art-gray font-bold mb-3 sm:mb-4 flex items-center gap-3">
            <span className="w-6 h-px bg-art-gray"></span>
            03 . The Archives
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-serif tracking-tighter text-art-black leading-none">
            The Permanent <span className="italic text-art-gray font-light">Collection.</span>
          </h2>
        </div>
        <Link
          to="/popular"
          className="font-sans text-[10px] sm:text-xs tracking-[0.25em] uppercase border-b border-art-black pb-1 hover:text-art-teal hover:border-art-teal transition-all duration-300 shrink-0 font-bold"
        >
          Enter Gallery →
        </Link>
      </div>

      {/* Overlapping Shifting Deck Accordion Container */}
      <div className="w-full max-w-[1400px] mx-auto px-2 md:px-8">
        <div
          className="relative w-full h-[45vh] sm:h-[55vh] md:h-[65vh] overflow-hidden rounded-[1.8rem] sm:rounded-[2.5rem]"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {specimens.map((specimen, i) => {
            const isLight = specimen.hex === "#F8F8F8" || specimen.hex === "#B4D2E7" || specimen.hex === "#94C5CC";
            const textColor = isLight ? "text-art-black" : "text-art-white";
            const subTextColor = isLight ? "text-art-black/45" : "text-art-white/45";
            const borderColor = isLight ? "rgba(0,1,0,0.06)" : "rgba(248,248,248,0.08)";

            const isActive = hoveredIndex === i;
            const isAnyHovered = hoveredIndex !== null;

            // Mathematical offsets for beautiful horizontal shifting overlap
            const width = !isAnyHovered
              ? 35 // Equal collapsed width
              : isActive
                ? 53 // Expanded card width
                : 17; // Shrunk card width

            let left = 0;
            if (!isAnyHovered) {
              left = i * 17; // Clean overlapping spread
            } else {
              if (i < hoveredIndex) {
                left = i * 11;
              } else if (i === hoveredIndex) {
                left = i * 11;
              } else {
                left = (i - 1) * 11 + 48; // Shift right to let active card dominate
              }
            }

            return (
              <motion.div
                key={specimen.hex}
                animate={{
                  left: `${left}%`,
                  width: `${i === specimens.length - 1 ? 100 - left : width}%`,
                  zIndex: 10 + i,
                  scale: isActive ? 1.015 : 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 130,
                  damping: 19,
                  mass: 0.8
                }}
                onMouseEnter={() => setHoveredIndex(i)}
                onTouchStart={() => setHoveredIndex(i)} // Seamless touch support for mobile
                className="absolute top-0 bottom-0 rounded-l-[1.8rem] sm:rounded-l-[2.5rem] rounded-r-none p-4 sm:p-8 md:p-10 flex flex-col justify-between cursor-pointer border overflow-hidden shadow-2xl transition-shadow duration-500"
                style={{
                  backgroundColor: specimen.hex,
                  borderColor: borderColor,
                  boxShadow: isActive
                    ? "0 35px 80px -20px rgba(0,0,0,0.4)"
                    : "0 15px 40px -15px rgba(0,0,0,0.15)",
                }}
              >
                {/* Micro-canvas grid weave texture */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                  style={{
                    backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 3h1v1H1V3zm2-2h1v1H3V1z' fill='%23000' fill-opacity='1'/%3E%3C/svg%3E\")",
                  }}
                />

                {/* Top: Card Number & Breathing pulse dot */}
                <div className="relative z-10 flex justify-between items-start">
                  <span className={`font-serif italic text-lg sm:text-2xl md:text-3xl leading-none ${textColor}`}>
                    ({specimen.num})
                  </span>
                  <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-current transition-opacity duration-300 ${isActive ? 'opacity-100 animate-pulse' : 'opacity-0'}`} />
                </div>

                {/* Left: Vertical compressed title (visible when collapsed, hides when expanded, sits on the exposed left edge) */}
                <div className={`absolute left-5 sm:left-8 md:left-10 top-1/2 -translate-y-1/2 pointer-events-none z-10 transition-opacity duration-500 ${isActive ? 'opacity-0' : 'opacity-70'}`}>
                  <span
                    className={`inline-block font-sans text-[8px] sm:text-[10px] md:text-xs tracking-[0.4em] sm:tracking-[0.5em] uppercase font-bold -rotate-90 origin-left translate-y-1/2 whitespace-nowrap ${textColor}`}
                  >
                    {specimen.label}
                  </span>
                </div>

                {/* Bottom Content: Fades in on expand with fine-line design finish */}
                <div className={`relative z-20 transition-all duration-700 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'}`}>
                  <div className="space-y-1 sm:space-y-2 md:space-y-4">
                    <h3 className={`font-serif italic text-xl sm:text-4xl md:text-5xl lg:text-[3.5rem] tracking-tight leading-none ${textColor}`}>
                      {specimen.label}
                    </h3>

                    {/* Divider line inside card */}
                    <div className="w-12 h-px bg-current opacity-20 my-2" />

                    <p className={`font-mono text-[9px] sm:text-[10px] tracking-wider ${subTextColor}`}>
                      {specimen.hex}
                    </p>
                  </div>
                </div>

              </motion.div>
            );
          })}
        </div>
      </div>

    </section>
  );
};

export default GalleryTeaser;
