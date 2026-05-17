import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';

const getAnimationPair = (isHorizontal) => {
  const horizontalPairs = [
    [{ x: '-100%', y: 0 }, { x: '100%', y: 0 }],
    [{ x: 0, y: '-100%' }, { x: 0, y: '100%' }],
    [{ x: 0, y: '100%' }, { x: 0, y: '-100%' }],
    [{ x: 0, y: '-100%' }, { x: 0, y: '-100%' }],
    [{ x: 0, y: '100%' }, { x: 0, y: '100%' }]
  ];

  const verticalPairs = [
    [{ x: 0, y: '-100%' }, { x: 0, y: '100%' }],
    [{ x: '-100%', y: 0 }, { x: '100%', y: 0 }],
    [{ x: '100%', y: 0 }, { x: '-100%', y: 0 }],
    [{ x: '-100%', y: 0 }, { x: '-100%', y: 0 }],
    [{ x: '100%', y: 0 }, { x: '100%', y: 0 }]
  ];

  const pairs = isHorizontal ? horizontalPairs : verticalPairs;
  return pairs[Math.floor(Math.random() * pairs.length)];
};

const getRandomColors = () => {
  const colors = [
    'bg-art-black',
    'bg-art-white'
  ];
  const c1 = colors[Math.floor(Math.random() * colors.length)];
  let c2 = colors[Math.floor(Math.random() * colors.length)];
  while (c1 === c2) {
    c2 = colors[Math.floor(Math.random() * colors.length)];
  }
  return [c1, c2];
};

const Navbar = () => {
  const location = useLocation();
  if (location.pathname === '/studio') return null;

  const [isOpen, setIsOpen] = useState(false);
  const [panelConfig, setPanelConfig] = useState(null);
  
  // Auto-hide navbar on scroll down, with initial 4.5s delay
  const [isHidden, setIsHidden] = useState(true);
  const [mouseAtTop, setMouseAtTop] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsHidden(false);
    }, 4500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (e.clientY < 70) {
        setMouseAtTop(true);
      } else {
        setMouseAtTop(false);
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    if (isOpen) return; // Never hide if the menu overlay is open
    
    // Don't trigger scroll hide if we are still in the initial delay period
    if (latest > previous && latest > 50) {
      setIsHidden(true); // scrolling down
    } else if (latest < previous) {
      setIsHidden(false); // scrolling up
    }
  });

  const handleToggle = () => {
    if (!isOpen) {
      const isHorizontal = Math.random() > 0.5;
      const [p1Entry, p2Entry] = getAnimationPair(isHorizontal);
      const [c1, c2] = getRandomColors();

      setPanelConfig({
        isHorizontal,
        p1: { initial: p1Entry, colorClass: c1 },
        p2: { initial: p2Entry, colorClass: c2 }
      });
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Studio', path: '/studio' },
    { name: 'Popular', path: '/popular' },
    { name: 'Connect', path: '/connect' },
  ];

  return (
    <>
      <motion.nav 
        initial={{ y: '-100%' }}
        animate={{ y: (isHidden && !mouseAtTop) ? '-100%' : 0 }}
        transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
        className="fixed top-0 left-0 w-full p-6 sm:p-8 flex items-center justify-between z-50 mix-blend-difference text-art-white bg-transparent"
      >
        <Link to="/" className="text-2xl font-serif italic tracking-wide">
          chroma.
        </Link>
        <button
          onClick={handleToggle}
          className="w-10 h-10 flex flex-col items-center justify-center gap-1.5 z-50 focus:outline-none"
        >
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0, y: isOpen ? 8 : 0 }}
            className="w-8 h-px bg-current transition-colors"
          />
          <motion.div
            animate={{ opacity: isOpen ? 0 : 1 }}
            className="w-8 h-px bg-current"
          />
          <motion.div
            animate={{ rotate: isOpen ? -45 : 0, y: isOpen ? -8 : 0 }}
            className="w-8 h-px bg-current transition-colors"
          />
        </button>
      </motion.nav>

      <AnimatePresence>
        {isOpen && panelConfig && (
          <div className="fixed inset-0 z-40 pointer-events-none">

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-8 pointer-events-auto mix-blend-difference"
            >
              {navLinks.map((link, i) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-5xl md:text-7xl font-serif text-art-white hover:opacity-70 transition-opacity duration-300"
                >
                  <motion.span
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="block"
                  >
                    {link.name}
                  </motion.span>
                </Link>
              ))}
            </motion.div>

            {panelConfig.isHorizontal ? (
              <>
                <motion.div
                  initial={panelConfig.p1.initial}
                  animate={{ x: 0, y: 0 }}
                  exit={panelConfig.p1.initial}
                  transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
                  className={`absolute inset-y-0 left-0 w-1/2 pointer-events-auto ${panelConfig.p1.colorClass}`}
                />
                <motion.div
                  initial={panelConfig.p2.initial}
                  animate={{ x: 0, y: 0 }}
                  exit={panelConfig.p2.initial}
                  transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
                  className={`absolute inset-y-0 right-0 w-1/2 pointer-events-auto ${panelConfig.p2.colorClass}`}
                />
              </>
            ) : (
              <>
                <motion.div
                  initial={panelConfig.p1.initial}
                  animate={{ x: 0, y: 0 }}
                  exit={panelConfig.p1.initial}
                  transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
                  className={`absolute inset-x-0 top-0 h-1/2 pointer-events-auto ${panelConfig.p1.colorClass}`}
                />
                <motion.div
                  initial={panelConfig.p2.initial}
                  animate={{ x: 0, y: 0 }}
                  exit={panelConfig.p2.initial}
                  transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
                  className={`absolute inset-x-0 bottom-0 h-1/2 pointer-events-auto ${panelConfig.p2.colorClass}`}
                />
              </>
            )}
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
