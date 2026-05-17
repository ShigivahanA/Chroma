import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { savePalette } from '../utils/api';
import SEO from '../components/SEO';

// HSL <-> Hex color science
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

const hslToHex = (h, s, l) => {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
};

const generateRandomHex = () => {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase();
};

const generateHarmony = (mode, count = 5) => {
  const baseH = Math.floor(Math.random() * 360);
  const baseS = Math.floor(Math.random() * 20) + 50;
  const baseL = Math.floor(Math.random() * 20) + 40;

  switch (mode) {
    case 'monochrome': {
      const step = 65 / (count + 1);
      return Array.from({ length: count }, (_, i) => {
        const lVal = Math.min(93, Math.max(10, 15 + (i + 1) * step));
        return hslToHex(baseH, baseS - (i % 2 === 0 ? 5 : 0), lVal);
      });
    }
    case 'analogous': {
      if (count === 1) return [hslToHex(baseH, baseS, baseL)];
      const step = 60 / (count - 1);
      return Array.from({ length: count }, (_, i) => {
        const hVal = (baseH - 30 + i * step + 360) % 360;
        return hslToHex(hVal, baseS - (i % 2 === 0 ? 3 : 0), baseL + (i % 2 === 0 ? 2 : -2));
      });
    }
    case 'triadic': {
      return Array.from({ length: count }, (_, i) => {
        const pole = i % 3;
        const hVal = (baseH + pole * 120) % 360;
        const lVal = Math.min(90, Math.max(15, baseL - 8 + (i % 2) * 12));
        return hslToHex(hVal, baseS - (i % 2 === 0 ? 6 : 0), lVal);
      });
    }
    case 'random':
    default:
      return Array.from({ length: count }, () => generateRandomHex());
  }
};

// Advanced Multi-Signature Synesthesia Sound Engine (Custom acoustic landscape per harmony!)
const playSynesthesiaTone = (colorsList, mode) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    colorsList.forEach((hex, i) => {
      const hsl = hexToHsl(hex);

      let freq = 140 + (hsl.h * 1.2);
      let type = 'sine';
      let duration = 1.0;
      let delay = i * 0.07;
      let peakGain = 0.025;

      if (mode === 'analogous') {
        // Soothing, closely clustered crystalline chimes (Sine, close frequencies)
        freq = 200 + (hsl.h * 0.9) + (i * 12);
        type = 'sine';
        delay = i * 0.05; // Tight flowing arpeggio
        duration = 0.8;
      } else if (mode === 'monochrome') {
        // Deep, rich resonant atmospheric bass drone (Triangle, low octave fifths)
        freq = 70 + (hsl.l * 1.2) + (i * 30);
        if (i === 2) freq = freq * 1.5; // Perfect fifth ratio
        type = 'triangle';
        delay = i * 0.12; // Slow, echoing resonance
        duration = 1.6;
        peakGain = 0.04;
      } else if (mode === 'triadic') {
        // Vibrant, mathematical wide-interval synth triads (Sine/Saw, large jumps)
        freq = 150 + (hsl.h * 1.4);
        if (i === 1) freq *= 1.5; // Perfect 5th
        if (i === 3) freq *= 2.0; // Octave
        if (i === 4) freq *= 2.5; // Major 3rd octave
        type = 'sine';
        delay = i * 0.035; // Sparkling fast arpeggio
        duration = 1.1;
      } else {
        // Playful, retro digital abstract blips (Cascading random wave shapes)
        freq = 120 + (Math.random() * 450);
        type = Math.random() > 0.5 ? 'triangle' : 'sine';
        delay = i * 0.09;
        duration = 0.7;
      }

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      const startTime = ctx.currentTime + delay;
      // Web Audio API Envelope Math: Always start/end from 0.0001 (never exactly 0) to prevent exponential math failures!
      gainNode.gain.setValueAtTime(0.0001, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.0001, startTime);
      gainNode.gain.linearRampToValueAtTime(peakGain, startTime + 0.04);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.1);
    });
  } catch (e) {
    // Web audio blocked or not supported
  }
};

const Studio = () => {
  const location = useLocation();

  const [colors, setColors] = useState(() => {
    if (location.state && location.state.colors) {
      return location.state.colors;
    }
    const params = new URLSearchParams(window.location.search);
    const colorsParam = params.get('colors');
    if (colorsParam) {
      return colorsParam.split(',').map(c => c.startsWith('#') ? c : `#${c}`);
    }
    return ["#000100", "#A1A6B4", "#94C5CC", "#B4D2E7", "#F8F8F8"];
  });

  const [locked, setLocked] = useState(() => {
    if (location.state && location.state.colors) {
      return Array(location.state.colors.length).fill(false);
    }
    const params = new URLSearchParams(window.location.search);
    const colorsParam = params.get('colors');
    if (colorsParam) {
      const len = colorsParam.split(',').length;
      return Array(len).fill(false);
    }
    return [false, false, false, false, false];
  });

  const [algoMode, setAlgoMode] = useState('analogous');

  // Dynamic Bento active index (Initially set to 0 so the first swatch is beautifully expanded on load!)
  const [hoveredIdx, setHoveredIdx] = useState(0);

  // Responsive state
  const [isMobile, setIsMobile] = useState(false);

  // Copied hex state
  const [copiedHex, setCopiedHex] = useState(null);

  // Notifications & overlays
  const [saveOpen, setSaveOpen] = useState(false);
  const [paletteName, setPaletteName] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [activeMenuIdx, setActiveMenuIdx] = useState(null);

  const hasLoadedUrlColors = useRef(false);

  // Separate Resize listener
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // React to reactive state/URL handover (including client-side router transitions)
  useEffect(() => {
    if (location.state && location.state.colors) {
      setColors(location.state.colors);
      setLocked(Array(location.state.colors.length).fill(false));
    } else {
      const params = new URLSearchParams(location.search);
      const colorsParam = params.get('colors');
      if (colorsParam) {
        const parsedColors = colorsParam.split(',').map(c => c.startsWith('#') ? c : `#${c}`);
        setColors(parsedColors);
        setLocked(Array(parsedColors.length).fill(false));
      } else {
        if (!hasLoadedUrlColors.current) {
          hasLoadedUrlColors.current = true;
          handleGenerate(true);
        }
      }
    }
  }, [location.state, location.search]);

  // Synchronous User harmony mode changer (Immune to mount race conditions!)
  const handleHarmonyChange = (mode) => {
    setAlgoMode(mode);
    const newColors = generateHarmony(mode, colors.length);
    const finalColors = colors.map((c, i) => locked[i] ? c : newColors[i]);
    setColors(finalColors);
  };

  // Spacebar generative triggers
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && !saveOpen) {
        e.preventDefault();
        handleGenerate();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [colors, locked, algoMode, saveOpen]);

  const handleGenerate = (silent = false) => {
    const newColors = generateHarmony(algoMode, colors.length);
    const finalColors = colors.map((c, i) => locked[i] ? c : newColors[i]);
    setColors(finalColors);
    if (!silent) {
      playSynesthesiaTone(finalColors, algoMode);
    }
  };

  const toggleLock = (index, e) => {
    e.stopPropagation();
    setLocked(prev => {
      const copy = [...prev];
      copy[index] = !copy[index];
      return copy;
    });
  };

  const addColor = (index, e) => {
    e.stopPropagation();
    if (colors.length >= 7) return;

    const baseColor = colors[index];
    const baseHsl = hexToHsl(baseColor);
    const newHue = (baseHsl.h + 24) % 360;
    const newHex = hslToHex(newHue, baseHsl.s, baseHsl.l);

    const newColors = [...colors];
    newColors.splice(index + 1, 0, newHex);

    const newLocked = [...locked];
    newLocked.splice(index + 1, 0, false);

    setColors(newColors);
    setLocked(newLocked);
    setActiveMenuIdx(null);
    playSynesthesiaTone(newColors, algoMode);
  };

  const removeColor = (index, e) => {
    e.stopPropagation();
    if (colors.length <= 2) return;

    const newColors = colors.filter((_, i) => i !== index);
    const newLocked = locked.filter((_, i) => i !== index);

    setColors(newColors);
    setLocked(newLocked);
    setActiveMenuIdx(null);

    if (hoveredIdx === index) {
      setHoveredIdx(null);
    } else if (hoveredIdx > index) {
      setHoveredIdx(hoveredIdx - 1);
    }
    playSynesthesiaTone(newColors, algoMode);
  };

  // HSL slider updates
  const handleSliderChange = (index, channel, value) => {
    setColors(prev => {
      const copy = [...prev];
      const hsl = hexToHsl(copy[index]);
      hsl[channel] = parseInt(value);
      copy[index] = hslToHex(hsl.h, hsl.s, hsl.l);
      return copy;
    });
  };

  const copyToClipboard = (hex, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hex);
    setActiveMenuIdx(null);

    // Set active copied hex and reset after a delay
    setCopiedHex(hex);
    playSynesthesiaTone([hex, hex, hex], 'analogous'); // Use soft adjacent chime for copy action
    setTimeout(() => {
      setCopiedHex(null);
    }, 2500);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!paletteName.trim()) return;

    try {
      await savePalette({
        colors,
        name: paletteName.trim(),
        published: isPublished
      });
      setSaveOpen(false);
      setPaletteName('');
      // Trigger a success flash on the bottom bar
      setCopiedHex("SAVED");
      setTimeout(() => setCopiedHex(null), 2500);
    } catch (err) {
      // failed
    }
  };

  // Calculate dynamic Flex horizontal columns based on hover/focus state (Dynamic grid math!)
  const getColFlex = (colIndex) => {
    if (hoveredIdx === null) {
      if (colIndex === 0) return 1.3;
      if (colIndex === 1) return 1.2;
      return 1.0;
    }

    const hoveredCol = hoveredIdx % 3;
    if (colIndex === hoveredCol) return 1.8;
    return 0.8;
  };

  // Calculate dynamic Flex vertical rows inside column split tracks (Fully generic modular scaling!)
  const getRowFlex = (blockIndex) => {
    if (hoveredIdx === null) return 1.0;

    const blockCol = blockIndex % 3;
    const hoveredCol = hoveredIdx % 3;

    // If this block is in a different column than the focused block, keep height standard
    if (blockCol !== hoveredCol) return 1.0;

    // If this is the focused block, it swells elastically!
    if (blockIndex === hoveredIdx) return 1.7;

    // Otherwise, compress other blocks in the same column to make room
    const colBlocksCount = colors.filter((_, i) => i % 3 === blockCol).length;
    return colBlocksCount > 1 ? 0.6 : 1.0;
  };

  // Render a single bento cell component to keep layout neat and tidy
  const renderBentoCell = (idx) => {
    const color = colors[idx];
    const hsl = hexToHsl(color);
    const isLightColor = hsl.l > 60;
    const textClass = isLightColor ? 'text-art-black' : 'text-art-white';
    const isColorLocked = locked[idx];
    const isThisHovered = hoveredIdx === idx;

    const rowFlexVal = getRowFlex(idx);

    return (
      <motion.div
        key={idx}
        onMouseEnter={() => !isMobile && activeMenuIdx === null && setHoveredIdx(idx)}
        onMouseLeave={() => !isMobile && activeMenuIdx === null && setHoveredIdx(null)}
        onClick={(e) => {
          // Bulletproof Detached-DOM Parent Traversal Guard:
          let curr = e.target;
          while (curr && curr !== e.currentTarget) {
            if (
              curr.tagName === 'BUTTON' ||
              (curr.classList && curr.classList.contains('sliders-container'))
            ) {
              return; // Clicked on a button or inside HSL sliders, do not trigger card copy/expansion!
            }
            curr = curr.parentNode;
          }

          e.stopPropagation();
          if (isMobile) {
            if (hoveredIdx === idx) {
              copyToClipboard(color, e);
            } else {
              setHoveredIdx(idx);
            }
          } else {
            copyToClipboard(color, e);
          }
        }}
        className="relative cursor-pointer overflow-hidden flex flex-col justify-between p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl w-full select-none"
        style={{
          backgroundColor: color,
          flex: `${rowFlexVal} 1 0%`,
          boxShadow: `inset 0 0 40px rgba(0,0,0,0.02)`,
          transition: "flex 0.5s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      >

        {/* Top bar details: index & Lock ring (z-30 relative to sit on top of sliders!) */}
        <div className="flex justify-between items-center w-full z-30 relative">
          {activeMenuIdx === idx ? (
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: -10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row items-center gap-1 bg-art-black/15 backdrop-blur-md border border-current/15 p-1 sm:p-0.5 rounded-full z-30"
              onClick={(e) => e.stopPropagation()}
            >
              {colors.length > 2 && (
                <button
                  onClick={(e) => removeColor(idx, e)}
                  className={`w-6 h-6 rounded-full flex items-center justify-center hover:bg-current/15 transition-colors focus:outline-none ${textClass}`}
                  title="Remove Color"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                  </svg>
                </button>
              )}

              {colors.length < 7 && (
                <button
                  onClick={(e) => addColor(idx, e)}
                  className={`w-6 h-6 rounded-full flex items-center justify-center hover:bg-current/15 transition-colors focus:outline-none ${textClass}`}
                  title="Add Color"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>
              )}

              <button
                onClick={(e) => { e.stopPropagation(); setActiveMenuIdx(null); }}
                className={`w-6 h-6 rounded-full flex items-center justify-center hover:bg-current/15 transition-colors focus:outline-none ${textClass}`}
                title="Close"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setHoveredIdx(idx); // Instantly expand this card so it swells in and shows all options!
                setActiveMenuIdx(idx);
              }}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-current/10 hover:border-current/30 hover:bg-current/5 flex items-center justify-center relative focus:outline-none transition-all duration-300 group/dots"
            >
              <svg
                className={`w-3.5 h-3.5 ${textClass} opacity-40 group-hover/dots:opacity-85 transition-opacity`}
                viewBox="0 0 24 24"
                fill="currentColor"
                style={{ pointerEvents: 'none' }}
              >
                <circle cx="12" cy="12" r="2" />
                <circle cx="19" cy="12" r="2" />
                <circle cx="5" cy="12" r="2" />
              </svg>
            </button>
          )}

          <button
            onClick={(e) => toggleLock(idx, e)}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-current/10 hover:border-current/30 hover:bg-current/5 flex items-center justify-center relative focus:outline-none transition-all duration-300 group/lock"
          >
            <svg
              className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${textClass} transition-all duration-300 transform ${isColorLocked ? 'scale-110 opacity-100' : 'opacity-35 group-hover/lock:opacity-80'}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {isColorLocked ? (
                <>
                  {/* Closed Lock */}
                  <rect x="5" y="11" width="14" height="10" rx="2" ry="2" />
                  <path d="M12 15v3" />
                  <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                </>
              ) : (
                <>
                  {/* Open Lock */}
                  <rect x="5" y="11" width="14" height="10" rx="2" ry="2" />
                  <path d="M12 15v3" />
                  <path d="M8 11V7a4 4 0 0 1 8 0" />
                </>
              )}
            </svg>
          </button>
        </div>

        {/* Middle bar details: Hex & Coordinates (Spring-translated upwards on hover to prevent layout jumps!) */}
        <motion.div
          animate={{ y: isThisHovered ? (isMobile ? -14 : -35) : 0 }}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
          className="flex-1 flex flex-col justify-center items-start z-10 mt-2"
        >
          <div className="flex items-center gap-3 group/hex">
            <span className={`font-mono uppercase font-bold text-sm xs:text-base sm:text-lg md:text-[1.8rem] lg:text-[2.2rem] tracking-tighter transition-all duration-300 group-hover/hex:translate-x-1 ${textClass}`}>
              {color}
            </span>
          </div>

          <span className={`font-mono text-[7px] sm:text-[8px] tracking-[0.2em] uppercase opacity-40 mt-1 block sm:inline ${textClass}`}>
            HSL: {hsl.h}° {hsl.s}% {hsl.l}%
          </span>
        </motion.div>

        {/* Bottom bar details: Absolute-positioned HSL adjustment sliders (Zero layout shifting on unmount!) */}
        <div className="absolute bottom-3.5 left-3.5 right-3.5 sm:bottom-5 sm:left-5 sm:right-5 z-20 sliders-container">
          <AnimatePresence>
            {isThisHovered && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="w-full space-y-1 sm:space-y-1.5 bg-art-black/10 backdrop-blur-md p-1.5 sm:p-2 rounded-xl border border-current/10"
                style={{ color: color }}
              >
                {/* Hue slider */}
                <div className="flex items-center gap-1 sm:gap-2">
                  <span className={`text-[6px] sm:text-[7px] font-mono tracking-widest min-w-[20px] opacity-75 ${textClass}`}>HUE</span>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={hsl.h}
                    onChange={(e) => handleSliderChange(idx, 'h', e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className={`flex-1 h-[1px] sm:h-[1.5px] appearance-none bg-current outline-none rounded cursor-pointer ${textClass}`}
                    style={{ color: isLightColor ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.2)' }}
                  />
                  <span className={`text-[6px] sm:text-[7px] font-mono min-w-[24px] text-right opacity-75 ${textClass}`}>{hsl.h}°</span>
                </div>

                {/* Saturation slider */}
                <div className="flex items-center gap-1 sm:gap-2">
                  <span className={`text-[6px] sm:text-[7px] font-mono tracking-widest min-w-[20px] opacity-75 ${textClass}`}>SAT</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={hsl.s}
                    onChange={(e) => handleSliderChange(idx, 's', e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className={`flex-1 h-[1px] sm:h-[1.5px] appearance-none bg-current outline-none rounded cursor-pointer ${textClass}`}
                    style={{ color: isLightColor ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.2)' }}
                  />
                  <span className={`text-[6px] sm:text-[7px] font-mono min-w-[24px] text-right opacity-75 ${textClass}`}>{hsl.s}%</span>
                </div>

                {/* Lightness slider */}
                <div className="flex items-center gap-1 sm:gap-2">
                  <span className={`text-[6px] sm:text-[7px] font-mono tracking-widest min-w-[20px] opacity-75 ${textClass}`}>LGT</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={hsl.l}
                    onChange={(e) => handleSliderChange(idx, 'l', e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className={`flex-1 h-[1px] sm:h-[1.5px] appearance-none bg-current outline-none rounded cursor-pointer ${textClass}`}
                    style={{ color: isLightColor ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.2)' }}
                  />
                  <span className={`text-[6px] sm:text-[7px] font-mono min-w-[24px] text-right opacity-75 ${textClass}`}>{hsl.l}%</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </motion.div>
    );
  };

  // Determine bottom gutter strip styles based on active copied color
  const copiedHsl = copiedHex && copiedHex.startsWith("#") ? hexToHsl(copiedHex) : null;
  const isCopiedLight = copiedHsl ? copiedHsl.l > 60 : true;
  const bottomGutterTextClass = isCopiedLight ? 'text-art-black' : 'text-art-white';

  return (
    <section
      onClick={() => { setHoveredIdx(null); setActiveMenuIdx(null); }}
      className="relative w-full h-screen bg-art-white flex flex-col justify-between overflow-hidden pt-4 select-none"
    >
      <SEO
        title="Studio"
        description="Create your own color palettes with Chroma Studio. Generate random palettes, fine-tune individual colors, and publish your creations."
        path="/studio"
      />
      {/* The Dynamic Asymmetrical Bento Grid Canvas */}
      <div className="flex-1 w-full p-2.5 sm:p-6 flex flex-row gap-2 sm:gap-4 bg-art-white relative z-10 overflow-hidden">

        {/* Column 0: Left Column (Modulo i % 3 === 0) */}
        <div
          className="flex flex-col gap-2 sm:gap-4 h-full"
          style={{
            flex: `${getColFlex(0)} 1 0%`,
            transition: "flex 0.5s cubic-bezier(0.16, 1, 0.3, 1)"
          }}
        >
          {colors.map((_, i) => i % 3 === 0 && renderBentoCell(i))}
        </div>

        {/* Column 1: Center Column (Modulo i % 3 === 1) */}
        <div
          className="flex flex-col gap-2 sm:gap-4 h-full"
          style={{
            flex: `${getColFlex(1)} 1 0%`,
            transition: "flex 0.5s cubic-bezier(0.16, 1, 0.3, 1)"
          }}
        >
          {colors.map((_, i) => i % 3 === 1 && renderBentoCell(i))}
        </div>

        {/* Column 2: Right Column (Modulo i % 3 === 2) (Only rendered if there are 3 or more colors in the palette!) */}
        {colors.some((_, i) => i % 3 === 2) && (
          <div
            className="flex flex-col gap-2 sm:gap-4 h-full"
            style={{
              flex: `${getColFlex(2)} 1 0%`,
              transition: "flex 0.5s cubic-bezier(0.16, 1, 0.3, 1)"
            }}
          >
            {colors.map((_, i) => i % 3 === 2 && renderBentoCell(i))}
          </div>
        )}

      </div>

      {/* Stark Museum-Gallery Controls label dock */}
      <div className="w-full bg-art-black text-art-white py-3 px-3 sm:py-5 sm:px-12 md:px-24 flex justify-between items-center gap-4 z-20 overflow-hidden relative min-h-[70px] sm:min-h-[88px] border-t border-white/5">
        <AnimatePresence mode="wait">
          {!saveOpen ? (
            <motion.div
              key="controls"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex flex-col md:flex-row justify-between items-center gap-4"
            >
              {/* Left: Home link and harmonies selectors */}
              <div className="flex items-center justify-between w-full md:w-auto gap-3 sm:gap-8 flex-wrap sm:flex-nowrap">
                {/* Minimalist Dual Portal Navigation (Home & Popular/Fire) */}
                <div className="flex items-center gap-2">
                  {/* Home portal (goes to `/`) */}
                  <Link
                    to="/"
                    title="Home"
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-art-gray/20 hover:border-art-teal hover:bg-art-white/5 flex items-center justify-center text-art-gray hover:text-art-teal transition-all duration-300 focus:outline-none"
                  >
                    <svg
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                  </Link>

                  {/* Popular/Fire portal (goes to `/popular`) */}
                  <Link
                    to="/popular"
                    title="Exhibition Gallery"
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-art-gray/20 hover:border-art-teal hover:bg-art-white/5 flex items-center justify-center text-art-gray hover:text-art-teal transition-all duration-300 focus:outline-none"
                  >
                    <svg
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                    </svg>
                  </Link>
                </div>

                <div className="w-px h-3 bg-art-gray/20 hidden sm:block" />

                {/* The Unified Morphing Spectrograph Harmonies Console (Silky Sliding Indicator!) */}
                <div className="flex items-center gap-1 bg-art-white/5 border border-art-white/10 p-1 sm:p-1.5 rounded-full select-none relative">
                  {['analogous', 'monochrome', 'triadic', 'random'].map(mode => {
                    const isActive = algoMode === mode;

                    // Custom tactile icon representing color mathematical theory
                    const renderModeIcon = () => {
                      if (mode === 'analogous') {
                        return (
                          <div className="flex gap-[2px] items-center">
                            <div className={`w-[2.5px] h-2 sm:w-[3px] sm:h-2.5 rounded-full ${isActive ? 'bg-art-black' : 'bg-art-teal'}`} />
                            <div className={`w-[2.5px] h-1.5 sm:w-[3px] sm:h-2 rounded-full opacity-60 ${isActive ? 'bg-art-black' : 'bg-art-teal'}`} />
                            <div className={`w-[2.5px] h-1 sm:w-[3px] sm:h-1.5 rounded-full opacity-30 ${isActive ? 'bg-art-black' : 'bg-art-teal'}`} />
                          </div>
                        );
                      }
                      if (mode === 'monochrome') {
                        return (
                          <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded relative overflow-hidden border border-current/25 ${isActive ? 'bg-art-black' : 'bg-art-teal'}`}>
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-art-black/40" />
                          </div>
                        );
                      }
                      if (mode === 'triadic') {
                        return <span className={`text-[9px] sm:text-[10px] font-sans leading-none ${isActive ? 'text-art-black' : 'text-art-teal'}`}>▲</span>;
                      }
                      // random
                      return <span className={`text-[10px] sm:text-[11px] font-bold leading-none animate-spin-slow ${isActive ? 'text-art-black' : 'text-art-teal'}`}>✦</span>;
                    };

                    return (
                      <button
                        key={mode}
                        onClick={(e) => { e.stopPropagation(); handleHarmonyChange(mode); }}
                        className="px-2.5 py-1 sm:px-4 sm:py-1.5 rounded-full font-sans text-[8px] sm:text-[9px] tracking-[0.15em] sm:tracking-[0.2em] uppercase font-bold relative focus:outline-none group/btn cursor-pointer"
                      >
                        {/* Fluid sliding active background pill */}
                        {isActive && (
                          <motion.div
                            layoutId="activeHarmonyTab"
                            className="absolute inset-0 bg-art-teal rounded-full z-0"
                            transition={{ type: "spring", stiffness: 380, damping: 28 }}
                          />
                        )}

                        {/* Content sitting cleanly above sliding pill */}
                        <span className={`relative z-10 flex items-center gap-1.5 transition-colors duration-300 ${isActive ? 'text-art-black' : 'text-art-gray group-hover/btn:text-art-white'
                          }`}>
                          {renderModeIcon()}
                          <span className="hidden xs:inline">{mode}</span>
                          <span className="xs:hidden">{mode === 'analogous' ? 'analog' : mode === 'monochrome' ? 'mono' : mode === 'triadic' ? 'triad' : 'rand'}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right: Gallery Publication and Harmonize action triggers */}
              <div className="flex items-center justify-between w-full md:w-auto gap-3 sm:gap-8 flex-wrap sm:flex-nowrap">
                {/* The Vintage Museum Perforated Ticket Stub Button */}
                <button
                  onClick={(e) => { e.stopPropagation(); setSaveOpen(true); }}
                  className="group/save relative flex items-center gap-2 sm:gap-3.5 border border-art-gray/25 hover:border-art-teal px-3.5 py-1.5 sm:px-6 sm:py-2.5 rounded-xl transition-all duration-350 focus:outline-none bg-transparent select-none cursor-pointer"
                >
                  {/* Hollow circle ticket-punches */}
                  <div className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-art-black border border-art-black" />
                  <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-art-black border border-art-black" />

                  <span className="relative z-10 font-sans text-[8px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.25em] uppercase text-art-gray group-hover/save:text-art-teal font-bold transition-colors duration-300">
                    Save Palette
                  </span>

                  <div className="w-[1px] h-3 sm:h-3.5 bg-art-gray/30 group-hover/save:bg-art-teal/40 transition-colors duration-300" />

                  {/* Palette Barcode Graphic tag */}
                  <div className="hidden xs:flex gap-[1.5px] items-center h-2.5 opacity-35 group-hover/save:opacity-95 group-hover/save:text-art-teal transition-all duration-300">
                    <div className="w-[1px] h-2.5 bg-current" />
                    <div className="w-[2px] h-2.5 bg-current" />
                    <div className="w-[1px] h-2.5 bg-current" />
                    <div className="w-[3px] h-2.5 bg-current" />
                  </div>
                </button>

                {/* The Orbital Harmonize Button */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleGenerate(); }}
                  className="group/harmonize relative overflow-hidden px-3.5 py-1.5 sm:px-5 sm:py-2.5 bg-art-white text-art-black rounded-full hover:bg-art-black border border-art-white/10 hover:border-art-teal/30 hover:text-art-white transition-all duration-500 text-[8px] sm:text-[10px] font-sans tracking-[0.15em] sm:tracking-[0.25em] uppercase font-bold flex items-center gap-1.5 sm:gap-3 focus:outline-none cursor-pointer"
                >
                  <span>Harmonize</span>

                  {/* 3 dynamic overlapping color rings representing active spectrum */}
                  <div className="flex items-center -space-x-1 sm:-space-x-1.5 relative w-6 sm:w-8 h-3 sm:h-3.5">
                    <motion.div
                      className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full border border-art-black/20 group-hover/harmonize:translate-x-[-2px] sm:group-hover/harmonize:translate-x-[-3px] group-hover/harmonize:scale-110 transition-all duration-300"
                      style={{ backgroundColor: colors[0] }}
                    />
                    <motion.div
                      className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full border border-art-black/20 group-hover/harmonize:scale-125 group-hover/harmonize:rotate-45 transition-all duration-300"
                      style={{ backgroundColor: colors[Math.floor(colors.length / 2)] }}
                    />
                    <motion.div
                      className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full border border-art-black/20 group-hover/harmonize:translate-x-[2px] sm:group-hover/harmonize:translate-x-[3px] group-hover/harmonize:scale-110 transition-all duration-300"
                      style={{ backgroundColor: colors[colors.length - 1] }}
                    />
                  </div>
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="archive-form"
              onSubmit={handleSave}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6"
            >
              {/* Left: Palette Identifier & Interactive Pills */}
              <div className="flex items-center gap-4 sm:gap-6 w-full md:w-auto flex-wrap sm:flex-nowrap">
                <span className="font-sans text-[8px] sm:text-[9px] tracking-[0.25em] text-art-teal font-extrabold uppercase animate-pulse">
                  [!] ARCHIVING Palette
                </span>

                {/* Micro preview color dots sequence */}
                <div className="flex -space-x-1.5 sm:-space-x-2">
                  {colors.map((c, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-art-black shadow-lg"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>

                <div className="flex-1 min-w-[200px] sm:min-w-[280px]">
                  <input
                    type="text"
                    required
                    value={paletteName}
                    onChange={(e) => setPaletteName(e.target.value)}
                    placeholder="e.g. STARK OBSIDIAN"
                    autoFocus
                    className="w-full bg-transparent border-b border-art-white/20 hover:border-art-teal/50 focus:border-art-teal py-1.5 text-xs sm:text-sm font-sans tracking-[0.18em] uppercase text-art-white placeholder-art-white/20 focus:outline-none transition-all duration-300 font-bold"
                  />
                </div>
              </div>

              {/* Right: Cancel & Register Confirm Actions */}
              <div className="flex items-center gap-5 sm:gap-7 w-full md:w-auto justify-end">
                {/* Publication toggle checkbox */}
                <div
                  className="flex items-center gap-2 select-none cursor-pointer"
                  onClick={() => setIsPublished(prev => !prev)}
                >
                  <div className={`w-3.5 h-3.5 sm:w-4 sm:h-4 border flex items-center justify-center rounded transition-all duration-300 ${isPublished ? 'bg-art-teal border-art-teal text-art-black' : 'border-art-white/30 text-transparent bg-transparent'}`}>
                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="font-sans text-[8px] sm:text-[9px] tracking-[0.15em] uppercase text-art-gray hover:text-art-white font-bold transition-colors">
                    Publish to Exhibit
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => { setSaveOpen(false); setPaletteName(''); }}
                  className="font-sans text-[8px] sm:text-[9px] tracking-[0.2em] uppercase text-art-gray hover:text-art-white font-bold transition-colors py-2 focus:outline-none cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="group/register relative px-5 py-2.5 sm:px-8 sm:py-3 bg-art-teal text-art-black rounded-xl hover:bg-art-white hover:text-art-black transition-all duration-300 font-sans text-[8px] sm:text-[9px] tracking-[0.2em] uppercase font-bold focus:outline-none flex items-center gap-2 cursor-pointer"
                >
                  <span>SECURE Palette</span>
                  <span className="group-hover/register:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* The Dynamic Bottom Gutter Strip (Fills with copied hex and micro-details!) */}
      <motion.div
        animate={{
          backgroundColor: copiedHex ? (copiedHex.startsWith("#") ? copiedHex : "#94C5CC") : "#F8F8F8"
        }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="w-full h-7 border-t border-art-black/5 flex items-center justify-center relative overflow-hidden z-20"
      >
        <AnimatePresence mode="wait">
          {copiedHex ? (
            <motion.div
              key="alert"
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -15, opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className={`font-sans text-[10px] tracking-[0.25em] uppercase font-bold text-center ${bottomGutterTextClass}`}
            >
              {copiedHex.startsWith("#") ? `${copiedHex} Copied` : "Palette Saved"}
            </motion.div>
          ) : (
            <motion.div
              key="default"
              initial={{ y: -15, opacity: 0 }}
              animate={{ y: 0, opacity: 0.25 }}
              exit={{ y: 15, opacity: 0 }}
              className="font-serif italic text-[10px] tracking-[0.15em] text-art-black text-center"
            >
              Chroma Studio
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

    </section>
  );
};

export default Studio;
