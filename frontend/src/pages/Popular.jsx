import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getPopularPalettes, likePalette } from '../utils/api';
import SEO from '../components/SEO';

// Soft crystalline audio chime for copying
const hexToHsl = (hex) => {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;

  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
};

const playGalleryTone = (hex, i) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const hsl = hexToHsl(hex);
    const freq = 200 + (hsl.h * 0.9) + (i * 12);
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gainNode.gain.setValueAtTime(0.0001, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 0.04);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.9);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 1.0);
  } catch (e) {
    // blocked
  }
};

const GalleryPaletteItem = ({ palette, onLike, likedPalettes, handleCopy, handleCopyAll }) => {
  const isLiked = likedPalettes.includes(palette._id);
  const colorsParam = palette.colors.map(c => c.replace('#', '')).join(',');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-4 group"
    >
      {/* Seamless, soft-curved swatch deck */}
      <div className="flex h-32 rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-500 border border-art-black/5">
        {palette.colors.map((color, index) => (
          <div
            key={index}
            className="flex-1 relative cursor-pointer group/swatch transition-all duration-[0.4s] ease-[cubic-bezier(0.16,1,0.3,1)] hover:flex-[1.65]"
            style={{ backgroundColor: color }}
            onClick={() => handleCopy(color, index)}
          >
            <div className="absolute inset-0 bg-art-black/5 opacity-0 group-hover/swatch:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <span className="text-[9px] font-sans tracking-widest text-art-white uppercase font-bold bg-art-black/25 px-2 py-0.5 rounded">
                Copy
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Elegant, clean card footer */}
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-4 min-w-0">
          <h3 className="font-serif italic text-lg sm:text-xl text-art-black truncate">
            {palette.name || 'Untitled'}
          </h3>
        </div>

        <div className="flex items-center gap-3.5 shrink-0">
          {/* Subtle Love Count button */}
          <button
            onClick={() => onLike(palette._id)}
            disabled={isLiked}
            className={`flex items-center gap-1.5 text-[10px] font-sans tracking-widest transition-colors duration-300 cursor-pointer ${isLiked ? 'text-art-teal font-bold' : 'text-art-gray hover:text-art-black'
              }`}
          >
            <svg
              className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : 'stroke-current fill-none'}`}
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span className="text-2xs font-bold">{palette.likes}</span>
          </button>

          {/* Copy All Icon Button */}
          <button
            onClick={() => handleCopyAll(palette.colors)}
            title="Copy all colors to clipboard"
            className="text-art-gray hover:text-art-black transition-colors focus:outline-none flex items-center justify-center cursor-pointer p-0.5"
          >
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </button>

          {/* Simple Open Link */}
          <Link
            to="/studio"
            state={{ colors: palette.colors }}
            className="text-[10px] font-sans tracking-widest uppercase text-art-gray hover:text-art-black transition-colors border-b border-transparent hover:border-art-black pb-0.5 font-bold"
          >
            Open
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

// High-Precision Color Science categorization based on HSL analysis
const analyzeColorPaletteTheme = (colors) => {
  if (!colors || colors.length === 0) return 'earth';
  
  let totalLgt = 0;
  let totalSat = 0;
  let totalHue = 0;
  
  colors.forEach(hex => {
    const hsl = hexToHsl(hex);
    totalLgt += hsl.l;
    totalSat += hsl.s;
    totalHue += hsl.h;
  });
  
  const avgLgt = totalLgt / colors.length;
  const avgSat = totalSat / colors.length;
  const avgHue = totalHue / colors.length;
  
  // 1. Dark Theme: super low average lightness
  if (avgLgt < 25) return 'dark';

  // 2. Nordic Minimal: ultra low average saturation
  if (avgSat < 15) return 'nordic';

  // 3. Pastel: high lightness and low saturation
  if (avgLgt > 75 && avgSat < 50) return 'pastel';

  // 4. Neon: high saturation and mid-lightness
  if (avgSat > 65 && avgLgt > 40 && avgLgt < 75) return 'neon';

  // 5. Forest: Green hues (80 to 155)
  if (avgHue >= 80 && avgHue < 155) return 'forest';

  // 6. Ocean: Blue/teal hues (155 to 255)
  if (avgHue >= 155 && avgHue < 255) return 'ocean';

  // 7. Cosmic: Purple/violet/magenta (255 to 320)
  if (avgHue >= 255 && avgHue < 320) return 'cosmic';

  // 8. Sunset: Reds, oranges, gold (0 to 50, or 320 to 360) with high saturation
  if ((avgHue < 50 || avgHue >= 320) && avgSat > 50) return 'sunset';

  // 9. Retro/Patina fallback
  if (avgSat < 35) return 'retro';

  // 10. Earth fallback
  return 'earth';
};

const categorizePalette = (palette) => {
  const name = (palette.name || '').toLowerCase();
  const tags = (palette.tags || []).map(t => t.toLowerCase());
  
  if (name.includes('sunset') || name.includes('solar') || name.includes('flare') || name.includes('gold') || name.includes('fire') || name.includes('sun') || tags.includes('sunset') || tags.includes('solar')) {
    return 'sunset';
  }
  if (name.includes('cherry') || name.includes('blossom') || name.includes('sakura') || name.includes('rose') || name.includes('peach') || name.includes('pink') || tags.includes('pastel') || tags.includes('sakura') || tags.includes('peach')) {
    return 'pastel';
  }
  if (name.includes('forest') || name.includes('boreal') || name.includes('pine') || name.includes('moss') || name.includes('emerald') || name.includes('sage') || name.includes('green') || tags.includes('forest') || tags.includes('green')) {
    return 'forest';
  }
  if (name.includes('cosmic') || name.includes('nebula') || name.includes('violet') || name.includes('purple') || name.includes('space') || name.includes('galaxy') || tags.includes('cosmic') || tags.includes('purple')) {
    return 'cosmic';
  }
  if (name.includes('vintage') || name.includes('patina') || name.includes('retro') || name.includes('classic') || name.includes('copper') || tags.includes('retro') || tags.includes('vintage')) {
    return 'retro';
  }
  if (name.includes('nordic') || name.includes('minimal') || name.includes('ash') || name.includes('slate') || name.includes('platinum') || tags.includes('minimal') || tags.includes('nordic')) {
    return 'nordic';
  }
  if (
    name.includes('earth') || name.includes('sand') || name.includes('wood') ||
    name.includes('clay') || name.includes('stone') || name.includes('warm') || name.includes('terracotta') ||
    name.includes('nature') || tags.includes('earth') || tags.includes('nature')
  ) {
    return 'earth';
  }
  if (
    name.includes('dark') || name.includes('obsidian') || name.includes('black') || name.includes('noir') ||
    name.includes('dusk') || name.includes('night') || name.includes('carbon') || name.includes('stark') ||
    tags.includes('dark') || tags.includes('noir')
  ) {
    return 'dark';
  }
  if (
    name.includes('ocean') || name.includes('sea') || name.includes('water') || name.includes('sky') ||
    name.includes('ice') || name.includes('teal') || name.includes('mist') || name.includes('vapor') ||
    tags.includes('ocean') || tags.includes('water')
  ) {
    return 'ocean';
  }
  if (
    name.includes('neon') || name.includes('cyber') || name.includes('acid') || name.includes('electric') ||
    name.includes('bright') || tags.includes('neon')
  ) {
    return 'neon';
  }
  
  return analyzeColorPaletteTheme(palette.colors);
};

const themeMetadata = {
  earth: {
    title: "Terran Archive",
    icon: "🟫",
    desc: "Natural, organic earth tones inspired by dried clay, mossy timber, and volcanic dust."
  },
  dark: {
    title: "Obsidian Noir",
    icon: "⬛",
    desc: "Deep obsidian carbon bases, stark graphite shadows, and dim atmospheric blacks."
  },
  ocean: {
    title: "Pacific Vapor",
    icon: "🌊",
    desc: "Cool sub-zero icebergs, maritime blues, misty shoreline vapors, and seaglass teals."
  },
  neon: {
    title: "Kinetic Chroma",
    icon: "⚡",
    desc: "Electric cyber neon accents, hot magma, radioactive lime highlights, and pure neon saturations."
  },
  pastel: {
    title: "Sakura Blossom",
    icon: "🌸",
    desc: "Soft dream-like cherry blossoms, mellow peaches, chalk pinks, and cream pastels."
  },
  forest: {
    title: "Boreal Forest",
    icon: "🌲",
    desc: "Deep pine greens, botanical sage, wild moss, and organic emeralds."
  },
  sunset: {
    title: "Solar Flare",
    icon: "🌅",
    desc: "Fiery sunburst oranges, golden embers, radiant sunset reds, and solar light."
  },
  cosmic: {
    title: "Cosmic Nebula",
    icon: "🌌",
    desc: "Celestial ultraviolet, deep stellar indigo, galactic purple, and starlight."
  },
  retro: {
    title: "Vintage Patina",
    icon: "🪙",
    desc: "Nostalgic antique golds, faded copper greens, warm cardboards, and classic retro dust."
  },
  nordic: {
    title: "Nordic Minimal",
    icon: "🧊",
    desc: "Ultra-low saturation cool slates, ash grays, platinum whites, and polar minimalisms."
  }
};

const Popular = () => {
  const [palettes, setPalettes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortMode, setSortMode] = useState('popular'); // 'popular' or 'latest'
  const [viewMode, setViewMode] = useState('gallery'); // 'gallery' or 'templates'
  const [likedPalettes, setLikedPalettes] = useState([]);
  const [copiedHex, setCopiedHex] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [visibleLimits, setVisibleLimits] = useState({
    earth: 10, dark: 10, ocean: 10, neon: 10, pastel: 10,
    forest: 10, sunset: 10, cosmic: 10, retro: 10, nordic: 10
  });
  const observerRef = useRef(null);

  useEffect(() => {
    setVisibleLimits({
      earth: 10, dark: 10, ocean: 10, neon: 10, pastel: 10,
      forest: 10, sunset: 10, cosmic: 10, retro: 10, nordic: 10
    });
  }, [viewMode, sortMode]);

  useEffect(() => {
    if (!hasMore || isLoading || isLoadingMore || viewMode !== 'gallery') return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        handleLoadMore();
      }
    }, { threshold: 0.1, rootMargin: '200px' });

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [hasMore, isLoading, isLoadingMore, viewMode, currentPage, sortMode]);

  useEffect(() => {
    const localLiked = localStorage.getItem('chroma_liked_palettes');
    if (localLiked) {
      setLikedPalettes(JSON.parse(localLiked));
    }
  }, []);

  useEffect(() => {
    fetchPalettes();
  }, [sortMode, viewMode]);

  const fetchPalettes = async () => {
    setIsLoading(true);
    try {
      const limit = viewMode === 'templates' ? 1000 : 20;
      const data = await getPopularPalettes(1, sortMode, limit);
      setPalettes(data.palettes || []);
      setCurrentPage(1);
      setHasMore(data.currentPage < data.totalPages);
    } catch (error) {
      console.error('Failed to fetch palettes', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const data = await getPopularPalettes(nextPage, sortMode);
      setPalettes(prev => [...prev, ...(data.palettes || [])]);
      setCurrentPage(nextPage);
      setHasMore(data.currentPage < data.totalPages);
    } catch (error) {
      console.error('Failed to fetch more palettes', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleLike = async (id) => {
    if (likedPalettes.includes(id)) return;
    try {
      await likePalette(id);
      // Instantly update the count in local state directly
      setPalettes(prev => prev.map(p => p._id === id ? { ...p, likes: p.likes + 1 } : p));
      
      const updated = [...likedPalettes, id];
      setLikedPalettes(updated);
      localStorage.setItem('chroma_liked_palettes', JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to like palette', error);
    }
  };

  const handleCopyColor = (hex, i) => {
    navigator.clipboard.writeText(hex);
    playGalleryTone(hex, i);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
  };

  const handleCopyAllColors = (colors) => {
    const text = colors.join(', ');
    navigator.clipboard.writeText(text);
    playGalleryTone(colors[0], 0);
    setCopiedHex('ALL');
    setTimeout(() => setCopiedHex(null), 1500);
  };

  const getThemedPalettes = () => {
    const themes = {
      earth: [],
      dark: [],
      ocean: [],
      neon: [],
      pastel: [],
      forest: [],
      sunset: [],
      cosmic: [],
      retro: [],
      nordic: []
    };

    palettes.forEach(p => {
      const category = categorizePalette(p);
      const isDuplicate = themes[category].some(x => 
        x.colors.join(',').toLowerCase() === p.colors.join(',').toLowerCase()
      );
      if (!isDuplicate) {
        themes[category].push(p); // Dynamically slot backend palettes into respective shelves
      }
    });

    return themes;
  };

  const themedPalettes = getThemedPalettes();

  return (
    <div className="w-full max-w-7xl mx-auto px-6 md:px-12 pt-36 pb-24 space-y-16 sm:space-y-24 bg-art-white min-h-screen">
      <SEO
        title="Gallery"
        description="Explore 1000+ curated color palettes. Browse popular, newest, and trending color combinations for your next design project."
        path="/popular"
      />
      {/* High-Precision Bold Split Header */}
      <div className="w-full flex flex-col lg:flex-row justify-between items-start lg:items-end border-b border-art-black/10 pb-8 sm:pb-12 gap-8">
        {/* Left: Giant Bold Title with Intersection Toggle */}
        <div className="flex items-center gap-4 sm:gap-6">
          <motion.h1
            key={viewMode}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl sm:text-7xl lg:text-8xl font-sans font-black tracking-tighter text-art-black uppercase leading-none select-none"
          >
            {viewMode === 'gallery' ? 'EXHIBIT' : 'TEMPLATES'}
          </motion.h1>

          {/* Venn Diagram / Intersection SVG Toggle Button */}
          <button
            onClick={() => setViewMode(prev => prev === 'gallery' ? 'templates' : 'gallery')}
            title={viewMode === 'gallery' ? "Switch to Curated Themes" : "Switch to Grid Gallery"}
            className={`p-2.5 sm:p-3.5 rounded-full border transition-all duration-300 flex items-center justify-center cursor-pointer focus:outline-none shrink-0 ${
              viewMode === 'templates' 
                ? 'bg-art-black border-art-black text-art-white scale-105 shadow-md' 
                : 'border-art-black/15 hover:border-art-black bg-transparent text-art-gray hover:text-art-black hover:scale-105'
            }`}
          >
            <svg className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 17H4" />
              <path d="M8 21l-4-4 4-4" />
              <path d="M4 7h16" />
              <path d="M16 3l4 4-4 4" />
            </svg>
          </button>
        </div>

        {/* Right: Description & Custom Sort Pill */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between lg:justify-end gap-6 sm:gap-12 w-full lg:w-auto">
          <p className="text-art-gray text-xs sm:text-sm md:text-base font-sans tracking-wide max-w-xs font-medium leading-relaxed">
            A beautiful, collaborative collective of custom color palettes cataloged by curators worldwide.
          </p>

          {/* High-Precision Switcher Pill (only visible in gallery mode) */}
          {viewMode === 'gallery' && (
            <div className="flex items-center gap-4 bg-art-white/5 border border-art-black/15 px-5 py-3 rounded-full select-none text-[10px] sm:text-xs font-sans tracking-[0.2em] font-extrabold shadow-sm shrink-0">
              <button
                onClick={() => setSortMode('popular')}
                className={`transition-all duration-300 cursor-pointer ${sortMode === 'popular' ? 'text-art-teal scale-105 font-black' : 'text-art-gray hover:text-art-black'
                  }`}
              >
                LOVED
              </button>
              <span className="text-art-gray/20 font-light">/</span>
              <button
                onClick={() => setSortMode('latest')}
                className={`transition-all duration-300 cursor-pointer ${sortMode === 'latest' ? 'text-art-teal scale-105 font-black' : 'text-art-gray hover:text-art-black'
                  }`}
              >
                NEWEST
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Content: Gallery Grid vs Themed Shelves */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-48 space-y-4 w-full">
          <span className="text-xs sm:text-sm md:text-base font-sans tracking-[0.3em] font-black uppercase text-art-black animate-pulse">
            LOADING PALETTES...
          </span>
          <div className="w-16 h-[2px] bg-art-black/10 overflow-hidden relative rounded-full">
            <motion.div
              animate={{ x: [-64, 64] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
              className="w-10 h-full bg-art-teal absolute top-0 left-0"
            />
          </div>
        </div>
      ) : viewMode === 'gallery' ? (
        <>
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12"
          >
            <AnimatePresence mode="popLayout">
              {palettes.map((palette) => (
                <GalleryPaletteItem
                  key={palette._id}
                  palette={palette}
                  onLike={handleLike}
                  likedPalettes={likedPalettes}
                  handleCopy={handleCopyColor}
                  handleCopyAll={handleCopyAllColors}
                />
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Brutalist Pagination Trigger */}
          {palettes.length > 0 && (
            <div 
              ref={observerRef}
              className="w-full flex justify-center py-16 border-t border-art-black/5 mt-16"
            >
              {hasMore ? (
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-art-teal animate-ping" />
                  <span className="font-sans text-xs tracking-[0.2em] font-extrabold uppercase text-art-gray">
                    HYDRATING COLOR MATRIX...
                  </span>
                </div>
              ) : (
                <div className="font-sans text-[10px] sm:text-xs tracking-[0.25em] text-art-gray/50 uppercase font-black">
                  [ END OF ARCHIVE — {palettes.length} MATRIXES PERSISTED ]
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {palettes.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-48 text-center text-art-gray font-sans text-xs sm:text-sm tracking-[0.35em] font-extrabold uppercase"
            >
              [ ARCHIVE IS EMPTY ]
            </motion.div>
          )}
        </>
      ) : (
        <div className="space-y-24 sm:space-y-32">
          {Object.entries(themeMetadata).map(([key, meta]) => {
            const list = themedPalettes[key] || [];
            if (list.length === 0) return null;

            const limit = visibleLimits[key] || 10;
            const visibleItems = list.slice(0, limit);
            const hasMoreItems = list.length > limit;

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-8"
              >
                {/* Theme Shelf Header */}
                <div className="border-b border-art-black/10 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
                  <div className="space-y-1">
                    <h2 className="text-2xl sm:text-3xl font-sans font-black tracking-tight text-art-black uppercase flex items-center gap-2.5">
                      <span>{meta.icon}</span>
                      <span>{meta.title}</span>
                    </h2>
                    <p className="text-art-gray text-xs sm:text-sm font-sans tracking-wide max-w-xl font-medium">
                      {meta.desc}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono tracking-widest text-art-gray font-extrabold uppercase bg-art-black/5 px-3 py-1 rounded-full">
                    {list.length} {list.length === 1 ? 'palette' : 'palettes'}
                  </span>
                </div>

                {/* Theme Shelf Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
                  {visibleItems.map((palette) => (
                    <GalleryPaletteItem
                      key={palette._id}
                      palette={palette}
                      onLike={handleLike}
                      likedPalettes={likedPalettes}
                      handleCopy={handleCopyColor}
                      handleCopyAll={handleCopyAllColors}
                    />
                  ))}
                </div>

                {/* Show 10 More Button */}
                {hasMoreItems && (
                  <div className="w-full flex justify-center pt-8 border-t border-art-black/5">
                    <button
                      onClick={() => setVisibleLimits(prev => ({
                        ...prev,
                        [key]: prev[key] + 10
                      }))}
                      className="px-6 py-3 border border-art-black text-art-black hover:bg-art-black hover:text-art-white hover:border-art-black transition-all duration-350 font-sans text-[10px] sm:text-xs tracking-[0.2em] font-extrabold uppercase rounded-xl cursor-pointer shadow-sm active:scale-95"
                    >
                      SHOW 10 MORE {meta.title.toUpperCase()} SPECIMENS
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* High-Precision HUD Copy Alert */}
      <AnimatePresence>
        {copiedHex && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-art-black text-art-white px-6 py-3.5 rounded-2xl shadow-2xl z-50 flex items-center gap-3 border border-white/10"
          >
            {copiedHex === 'ALL' ? (
              <>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-art-teal" />
                  <div className="w-2 h-2 rounded-full bg-art-teal" />
                </div>
                <span className="font-sans text-[10px] sm:text-xs tracking-[0.25em] uppercase font-black text-art-white">
                  ALL COLORS COPIED
                </span>
              </>
            ) : (
              <>
                <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: copiedHex }} />
                <span className="font-sans text-[10px] sm:text-xs tracking-[0.25em] uppercase font-black text-art-white">
                  {copiedHex} COPIED
                </span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Popular;
