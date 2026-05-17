import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if consent has already been given
    const consent = localStorage.getItem('chroma_cookie_consent');
    if (!consent) {
      // Show consent banner 5.2s after page load (Navbar appears after 4.5s)
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 5200);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    // Listen for custom trigger to reopen cookie settings from the footer
    const handleOpenSettings = () => {
      setIsVisible(true);
    };

    window.addEventListener('open-cookie-settings', handleOpenSettings);
    return () => window.removeEventListener('open-cookie-settings', handleOpenSettings);
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = { necessary: true, analytics: true, personalization: true };
    localStorage.setItem('chroma_cookie_consent', JSON.stringify(allAccepted));
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    const minAccepted = { necessary: true, analytics: false, personalization: false };
    localStorage.setItem('chroma_cookie_consent', JSON.stringify(minAccepted));
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-6 right-6 left-6 md:left-auto md:w-96 bg-art-black border border-art-white/10 text-art-white p-5 shadow-2xl z-50 rounded-none flex flex-col gap-4"
          style={{
            backdropFilter: 'blur(12px)',
            backgroundColor: 'rgba(0, 1, 0, 0.95)',
          }}
        >
          {/* Header & Simple Text */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="font-serif italic text-lg text-art-white tracking-wide">
                cookies.
              </span>
              <span className="font-mono text-[9px] tracking-widest text-art-teal uppercase">
                [ ad-free ]
              </span>
            </div>
            <p className="font-sans text-xs text-art-gray leading-relaxed font-light">
              We use cookies to save your custom color palettes and see how visitors use our site. Chroma is completely ad-free and we never sell your data.
            </p>
          </div>

          {/* Action Row */}
          <div className="flex gap-3">
            <button
              onClick={handleAcceptAll}
              className="flex-1 py-2 px-4 bg-art-white text-art-black font-sans text-xs font-semibold tracking-wider uppercase hover:bg-art-teal hover:text-art-black transition-colors duration-200 cursor-pointer"
            >
              Accept
            </button>
            <button
              onClick={handleRejectAll}
              className="flex-1 py-2 px-4 border border-art-white/20 hover:border-art-white/50 font-sans text-xs font-semibold tracking-wider uppercase text-art-white hover:bg-art-white/5 transition-colors duration-200 cursor-pointer"
            >
              Decline
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
