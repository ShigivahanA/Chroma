import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const features = [
  {
    num: "01",
    title: "Infinite Canvas",
    subtitle: "Scale",
    desc: "Every palette is meticulously generated through a highly-tuned algorithmic engine, ensuring absolute mathematical contrast across over 100 million permutations.",
    bg: "#000100",
    accent: "#94C5CC",
  },
  {
    num: "02",
    title: "Zero Friction",
    subtitle: "Access",
    desc: "An exhibition should never be locked away. No accounts. No paywalls. Pure, immediate, and frictionless access to the generative studio.",
    bg: "#94C5CC",
    accent: "#000100",
  },
  {
    num: "03",
    title: "Global Archive",
    subtitle: "Legacy",
    desc: "A definitive global collection. Save your masterpieces to the gallery for the entire world to witness, curate, and utilize in their own creations.",
    bg: "#B4D2E7",
    accent: "#000100",
  }
];

/* Individual Card with its own scroll-driven animations */
const FeatureCard = ({ feature, index, totalCards }) => {
  const cardRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "start 0.35"]
  });

  const scale = useTransform(scrollYProgress, [0, 1], [0.85, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [120, 0]);
  const rotate = useTransform(scrollYProgress, [0, 1], [2, 0]);

  const isLight = feature.bg !== "#000100";
  const textColor = isLight ? "#000100" : "#F8F8F8";
  const subTextColor = isLight ? "rgba(0,1,0,0.6)" : "rgba(248,248,248,0.6)";
  const borderColor = isLight ? "rgba(0,1,0,0.1)" : "rgba(248,248,248,0.1)";

  return (
    <motion.div
      ref={cardRef}
      className="sticky w-full will-change-transform"
      style={{
        top: `${6 + index * 3}rem`,
        zIndex: index + 1,
        scale,
        opacity,
        y,
        rotateX: rotate,
      }}
    >
      <div
        className="w-full min-h-[55vh] sm:min-h-[60vh] md:min-h-[70vh] rounded-2xl sm:rounded-[2rem] md:rounded-[3rem] p-6 sm:p-10 md:p-16 lg:p-24 flex flex-col justify-between overflow-hidden relative"
        style={{
          backgroundColor: feature.bg,
          color: textColor,
          boxShadow: `0 25px 80px -15px rgba(0,0,0,0.3), 0 0 0 1px ${borderColor}`,
        }}
      >

        {/* Top Row */}
        <div className="flex justify-between items-start relative z-10">
          <div
            className="flex items-center gap-3 sm:gap-4 md:gap-6 px-3 sm:px-4 md:px-6 py-2 md:py-3 rounded-full backdrop-blur-md"
            style={{ backgroundColor: isLight ? 'rgba(0,1,0,0.05)' : 'rgba(248,248,248,0.08)' }}
          >
            <div
              className="w-2 h-2 md:w-3 md:h-3 rounded-full animate-pulse"
              style={{ backgroundColor: feature.accent }}
            />
            <span className="font-sans text-[9px] sm:text-[10px] md:text-xs tracking-[0.3em] uppercase font-bold" style={{ color: subTextColor }}>
              Phase {feature.num} · {feature.subtitle}
            </span>
          </div>
          <span
            className="font-serif italic text-4xl sm:text-5xl md:text-7xl lg:text-8xl leading-none select-none"
            style={{ color: isLight ? 'rgba(0,1,0,0.06)' : 'rgba(248,248,248,0.06)' }}
          >
            {feature.num}
          </span>
        </div>

        {/* Bottom Row */}
        <div className="max-w-4xl mt-12 sm:mt-16 md:mt-0 relative z-10">
          <h3 className="text-4xl sm:text-5xl md:text-7xl lg:text-[6.5rem] font-serif tracking-tight leading-[0.9] mb-6 sm:mb-8 md:mb-12">
            {feature.title}
          </h3>
          <p
            className="font-sans text-sm sm:text-base md:text-lg font-light leading-[1.8] sm:leading-[2] max-w-2xl pl-4 sm:pl-6"
            style={{ color: subTextColor, borderLeft: `2px solid ${borderColor}` }}
          >
            {feature.desc}
          </p>
        </div>

        {/* Decorative Circles */}
        <div
          className="absolute -top-24 sm:-top-32 -right-24 sm:-right-32 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 rounded-full pointer-events-none"
          style={{ border: `1px solid ${borderColor}` }}
        />
        <div
          className="absolute bottom-12 right-8 sm:right-12 md:right-24 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 rounded-full pointer-events-none hidden sm:block"
          style={{ border: `1px solid ${borderColor}` }}
        />
      </div>
    </motion.div>
  );
};

/* Master Header with scroll-driven animation */
const SectionHeader = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const headerY = useTransform(scrollYProgress, [0, 1], [100, -60]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.3, 0.8], [0, 1, 1]);

  return (
    <motion.div
      ref={ref}
      style={{ y: headerY, opacity: headerOpacity }}
      className="max-w-[1400px] mx-auto flex flex-col lg:flex-row justify-between items-start lg:items-end mb-24 sm:mb-32 md:mb-48 gap-8 sm:gap-12 lg:gap-8 px-2 md:px-8"
    >
      <div>
        <p className="font-sans text-[10px] tracking-[0.4em] uppercase text-art-black font-bold mb-6 sm:mb-8 flex items-center gap-4">
          <span className="w-6 sm:w-8 h-px bg-art-black"></span>
          02. The Engine
        </p>
        <h2 className="text-5xl sm:text-6xl md:text-[6rem] lg:text-[8rem] font-serif leading-[0.85] tracking-tighter text-art-black">
          System <br />
          <span className="italic text-art-gray font-light">Architecture.</span>
        </h2>
      </div>
      <div className="max-w-xs sm:max-w-sm lg:pb-4 border-l border-art-black/20 pl-4 sm:pl-6">
        <p className="font-sans text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.25em] text-art-gray leading-[2] sm:leading-[2.5]">
          Three pillars of generative design. Scroll to explore the foundation of the chroma. platform.
        </p>
      </div>
    </motion.div>
  );
};

const Features = () => {
  return (
    <section className="w-full bg-art-white py-10 sm:py-12 md:py-16 px-3 sm:px-4 md:px-12 border-t border-art-black/10">
      <SectionHeader />

      {/* Sticky Cards Deck */}
      <div className="w-full max-w-[1200px] mx-auto relative pb-12 sm:pb-16 md:pb-24 px-1 sm:px-2 md:px-8">
        {features.map((feature, i) => (
          <div key={i} className="mb-8 sm:mb-12 md:mb-20">
            <FeatureCard
              feature={feature}
              index={i}
              totalCards={features.length}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
