import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';

const statements = [
  {
    num: "01",
    label: "Sensory",
    desc: "Hear, see, and interact with colors in their purest digital form.",
    color: "#94C5CC"
  },
  {
    num: "02",
    label: "Harmonious",
    desc: "Generate and analyze color palettes using human sight science and contrast rules.",
    color: "#B4D2E7"
  },
  {
    num: "03",
    label: "Fluid",
    desc: "A simple, quiet space to drag image pins, blend gradients, and build perfect palettes.",
    color: "#F8F8F8"
  }
];

const Manifesto = () => {
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Track scroll position across the 300vh scroll height of the manifesto
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Map scroll progress to the 3 discrete active indices
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest < 0.35) {
      setActiveIndex(0);
    } else if (latest < 0.70) {
      setActiveIndex(1);
    } else {
      setActiveIndex(2);
    }
  });

  const activeColor = statements[activeIndex].color;

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[450vh] bg-art-black"
    >
      {/* Sticky Viewport Container (Locks scroll progress on screen) */}
      <div className="sticky top-0 h-screen w-full flex flex-col lg:flex-row items-stretch overflow-hidden select-none">

        {/* Left Panel: Giant Word Coordinates (60% Width) */}
        <div className="w-full lg:w-[60%] h-[45vh] lg:h-full flex flex-col justify-center px-6 sm:px-12 md:px-24 lg:px-32 bg-art-black z-10">

          {/* Section Subtitle Tag */}
          <div className="mb-6 lg:mb-12">
            <p className="font-sans text-[10px] tracking-[0.4em] uppercase text-art-gray/40 font-bold mb-3 sm:mb-4 flex items-center gap-3">
              <span className="w-6 h-px bg-art-gray/20"></span>
              01 . Philosophy
            </p>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif text-art-white/90 tracking-tight">
              Color is experienced, not just seen.
            </h2>
          </div>

          {/* Words Stack */}
          <div className="flex flex-col gap-3 sm:gap-6 lg:gap-10">
            {statements.map((statement, idx) => {
              const isActive = activeIndex === idx;

              return (
                <div
                  key={statement.num}
                  className="flex gap-4 sm:gap-6 lg:gap-8 items-center py-1 transition-all duration-500"
                >
                  {/* Pinned bullet line */}
                  <motion.div
                    animate={{
                      width: isActive ? 24 : 0,
                      backgroundColor: isActive ? statement.color : "rgba(255,255,255,0)"
                    }}
                    className="h-[2px] rounded hidden sm:block"
                  />

                  {/* Index Number */}
                  <span className={`font-mono text-[9px] sm:text-[10px] tracking-widest ${isActive ? 'text-art-white' : 'text-art-gray/20'} transition-colors duration-500`}>
                    ({statement.num})
                  </span>

                  {/* Clean text header */}
                  <h3
                    className={`font-serif text-3xl sm:text-5xl lg:text-[4.5rem] tracking-tight leading-none transition-all duration-[0.8s] ease-[cubic-bezier(0.16,1,0.3,1)] ${isActive ? 'text-art-white italic translate-x-2' : 'text-art-gray/20'}`}
                  >
                    {statement.label}
                  </h3>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Panel: Solid Morphing Color Curtain with Floating Quote (40% Width) */}
        <div
          className="w-full lg:w-[40%] h-[55vh] lg:h-full flex flex-col justify-center p-8 sm:p-12 lg:p-20 relative transition-all duration-[1s] ease-[cubic-bezier(0.16,1,0.3,1)] z-20"
          style={{ backgroundColor: activeColor }}
        >

          <div className="relative overflow-hidden w-full max-w-md mx-auto">
            {/* AnimatePresence makes quotes slide and fade in/out elegantly during scroll shifts */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6 sm:space-y-8"
              >
                {/* Majestic Quote */}
                <p className="font-serif italic text-2xl sm:text-3xl lg:text-[2.6rem] leading-[1.3] text-art-black">
                  "{statements[activeIndex].desc}"
                </p>

                {/* Micro Hex Code Tag */}
                <div className="font-mono text-[10px] tracking-widest text-art-black/50 border-t border-art-black/10 pt-4 w-fit">
                  {statements[activeIndex].color}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom subtle coordinate */}
          <div className="absolute bottom-8 right-8 font-mono text-[8px] tracking-[0.3em] uppercase opacity-20 hidden lg:block">
            CHROMA // MATRIX_01
          </div>

        </div>

      </div>
    </section>
  );
};

export default Manifesto;
