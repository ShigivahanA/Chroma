import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getPopularPalettes } from '../utils/api';

// --- COLOR SCIENCE UTILS ---

// Convert hex to RGB
const hexToRgb = (hex) => {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return { r, g, b };
};

// Convert RGB to HSL
const rgbToHsl = (r, g, b) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
};

// Convert HSL back to Hex
const hslToHex = (h, s, l) => {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) { r = c; g = x; b = 0; }
  else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
  else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
  else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
  else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
  else if (300 <= h && h < 360) { r = c; g = 0; b = x; }

  const toHexStr = (val) => {
    const hex = Math.round((val + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHexStr(r)}${toHexStr(g)}${toHexStr(b)}`.toUpperCase();
};

// Relative Luminance channel calculation
const getChannelLuminance = (c) => {
  c /= 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};

// Calculate relative luminance of a color
const getRelativeLuminance = (rgb) => {
  const rL = getChannelLuminance(rgb.r);
  const gL = getChannelLuminance(rgb.g);
  const bL = getChannelLuminance(rgb.b);
  return 0.2126 * rL + 0.7152 * gL + 0.0722 * bL;
};

// Calculate contrast ratio
const calculateContrast = (hex1, hex2) => {
  try {
    const rgb1 = hexToRgb(hex1);
    const rgb2 = hexToRgb(hex2);
    const l1 = getRelativeLuminance(rgb1);
    const l2 = getRelativeLuminance(rgb2);
    const brighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (brighter + 0.05) / (darker + 0.05);
  } catch (e) {
    return 1.0;
  }
};

// Intelligent Lightness Nudger to achieve target ratio with minimum lightness delta
const nudgeToPass = (fgHex, bgHex, targetRatio = 4.5) => {
  try {
    const fgRgb = hexToRgb(fgHex);
    const fgHsl = rgbToHsl(fgRgb.r, fgRgb.g, fgRgb.b);

    let bestHex = fgHex;
    let minShift = 101;

    for (let l = 0; l <= 100; l++) {
      const testHex = hslToHex(fgHsl.h, fgHsl.s, l);
      const ratio = calculateContrast(testHex, bgHex);
      if (ratio >= targetRatio) {
        const shift = Math.abs(l - fgHsl.l);
        if (shift < minShift) {
          minShift = shift;
          bestHex = testHex;
        }
      }
    }
    return bestHex;
  } catch (e) {
    return fgHex;
  }
};

// FALLBACK PRESETS IN SIMPLE WORDS
const FALLBACK_PRESETS = [
  { name: 'Paper White', colors: ['#FAF6F0', '#1C1A17', '#EAE3D2', '#7A7363', '#000000'] },
  { name: 'Dark Mode', colors: ['#0A0B0E', '#14F195', '#ECEFF4', '#7D8491', '#FFFFFF'] },
  { name: 'Coral Beach', colors: ['#FFFBF4', '#FF5A5F', '#FFE5D9', '#087E8B', '#111111'] },
  { name: 'Electric Neon', colors: ['#0C001C', '#00FFFF', '#FF00A0', '#9D00FF', '#FFFFFF'] },
  { name: 'Forest Moss', colors: ['#142417', '#C4F1BE', '#F9FBF2', '#35603C', '#FFFFFF'] },
  { name: 'Solar Gold', colors: ['#FFFDF9', '#D4AF37', '#FAF0D7', '#8C7853', '#111111'] },
  { name: 'Ocean Mist', colors: ['#F0F8FF', '#008080', '#E0FFFF', '#4682B4', '#0F0F0F'] },
  { name: 'Retro Rusty', colors: ['#FFFBF5', '#C2593F', '#F4EAE1', '#5C6E58', '#1A1A1A'] }
];

const INITIAL_COLORS = ['#0F1115', '#14F195', '#FF3B30', '#34C759', '#FFFFFF'];

// --- ACOUSTIC SOUND DIAGNOSTIC ENGINE ---
const playContrastSound = (status) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (status === 'AAA') {
      const freqs = [261.63, 392.00, 523.25]; // C4 + G4 + C5 (Harp Chord)
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const stagger = idx * 0.05;

        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.02, ctx.currentTime + stagger + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + stagger + 0.65);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + stagger);
        osc.stop(ctx.currentTime + stagger + 0.75);
      });
    } else if (status === 'AA') {
      const freqs = [261.63, 329.63]; // C4 + E4 (Major Third Chime)
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const stagger = idx * 0.03;

        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.02, ctx.currentTime + stagger + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + stagger + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + stagger);
        osc.stop(ctx.currentTime + stagger + 0.6);
      });
    } else {
      const freqs = [135.00, 190.92]; // Tritone Warning Sweep
      freqs.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(freq - 20, ctx.currentTime + 0.3);

        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.012, ctx.currentTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      });
    }
  } catch (e) { }
};

const Contrast = () => {
  const navigate = useNavigate();
  const [colors, setColors] = useState(INITIAL_COLORS);
  const [bgIndex, setBgIndex] = useState(0); // Row
  const [fgIndex, setFgIndex] = useState(1); // Column
  const [copierText, setCopierText] = useState(null);
  const [infoOpen, setInfoOpen] = useState(false);

  // Real Database Palettes States
  const [dbPalettes, setDbPalettes] = useState([]);
  const [displayedPresets, setDisplayedPresets] = useState(FALLBACK_PRESETS);

  // Independent Tab States for desktop / mobile synchronization
  const [mobileTab, setMobileTab] = useState('grid'); // 'grid' | 'swatches' | 'scores' | 'preview'
  const [leftTab, setLeftTab] = useState('grid'); // 'grid' | 'swatches'
  const [rightTab, setRightTab] = useState('scores'); // 'scores' | 'preview'

  // Load community presets from DB
  useEffect(() => {
    const loadCommunityPresets = async () => {
      try {
        const data = await getPopularPalettes(1, 'latest', 100);
        if (data && data.palettes && data.palettes.length > 0) {
          const formatted = data.palettes
            .filter(p => p.colors && p.colors.length >= 5)
            .map(p => ({
              name: p.name || 'Community Set',
              colors: p.colors.slice(0, 5)
            }));

          if (formatted.length > 0) {
            setDbPalettes(formatted);
            setDisplayedPresets(formatted.slice(0, 8));
          }
        }
      } catch (err) {
        console.error('Failed to load DB palettes', err);
      }
    };
    loadCommunityPresets();
  }, []);

  // Shuffle Presets function
  const handleShufflePresets = () => {
    playContrastSound('AA');
    const sourcePool = dbPalettes.length > 0 ? dbPalettes : FALLBACK_PRESETS;

    // Pick 8 unique items randomly
    const shuffled = [...sourcePool].sort(() => 0.5 - Math.random());
    setDisplayedPresets(shuffled.slice(0, 8));

    setTimeout(() => setCopierText(null), 2500);
  };

  // Current active colors
  const activeBg = colors[bgIndex] || colors[0];
  const activeFg = colors[fgIndex] || colors[1];
  const activeRatio = calculateContrast(activeFg, activeBg);

  const aaNormal = activeRatio >= 4.5;
  const aaaNormal = activeRatio >= 7.0;
  const aaLarge = activeRatio >= 3.0;
  const aaaLarge = activeRatio >= 4.5;

  const getStatusString = (ratio) => {
    if (ratio >= 7.0) return 'Perfect';
    if (ratio >= 4.5) return 'Good';
    return 'Poor';
  };

  const getStatusKey = (ratio) => {
    if (ratio >= 7.0) return 'AAA';
    if (ratio >= 4.5) return 'AA';
    return 'FAIL';
  };

  const handleCellClick = (row, col) => {
    if (row === col) return;
    setBgIndex(row);
    setFgIndex(col);
    const ratio = calculateContrast(colors[col], colors[row]);
    playContrastSound(getStatusKey(ratio));
  };

  const handleColorChange = (index, value) => {
    if (!value.startsWith('#') || value.length > 7) return;
    const updated = [...colors];
    updated[index] = value.toUpperCase();
    setColors(updated);
  };

  const handleApplyPreset = (presetColors) => {
    setColors(presetColors);
    setBgIndex(0);
    setFgIndex(1);
    const ratio = calculateContrast(presetColors[1], presetColors[0]);
    playContrastSound(getStatusKey(ratio));
  };

  const handleAutoFix = (target) => {
    const targetRatio = target === 'AAA' ? 7.0 : 4.5;
    const fixedHex = nudgeToPass(activeFg, activeBg, targetRatio);
    if (fixedHex === activeFg) return;

    const updated = [...colors];
    updated[fgIndex] = fixedHex;
    setColors(updated);

    playContrastSound(target);

    setCopierText(`Nudged Color to ${fixedHex}`);
    setTimeout(() => setCopierText(null), 3000);
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopierText(`${label} copied!`);
    setTimeout(() => setCopierText(null), 2000);
    playContrastSound('AA');
  };

  return (
    <section className="h-screen bg-art-white text-art-black flex flex-col pt-16 sm:pt-24 pb-8 px-4 sm:px-6 md:px-8 select-none relative w-full overflow-hidden">

      {/* Title block & back button & guidebook trigger */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2.5 flex-shrink-0 mb-4 select-none">
        <div className="flex items-center gap-3 select-none">
          <div className="space-y-0.5">
            <span className="font-mono text-[8px] sm:text-[9px] tracking-[0.25em] text-art-teal font-extrabold uppercase block">
              [ Readability Testing ]
            </span>
            <h2 className="text-2xl sm:text-3xl font-sans font-black uppercase tracking-tight leading-none">
              Stark Contrast
            </h2>
          </div>
          <button
            type="button"
            onClick={() => { setInfoOpen(true); playContrastSound('AA'); }}
            className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-art-black hover:bg-art-black hover:text-white flex items-center justify-center font-serif text-[10px] sm:text-xs font-bold transition-all cursor-pointer shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-none select-none"
            title="How to use this page"
          >
            ?
          </button>
        </div>
        <p className="font-serif italic text-[10px] sm:text-xs text-art-gray max-w-sm md:text-right select-none">
          Verify text readability on any background through colors and synth sounds.
        </p>
      </div>

      {/* MOBILE / TABLET UNIFIED TAB SELECTOR (visible strictly below lg breakpoint) */}
      <div className="flex lg:hidden w-full border-2 border-art-black rounded-2xl overflow-hidden shrink-0 select-none mb-3 bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        {['grid', 'swatches', 'scores', 'preview'].map((tab) => {
          const label = tab === 'grid' ? 'Grid' : tab === 'swatches' ? 'Swatches' : tab === 'scores' ? 'Scores' : 'Preview';
          const isActive = mobileTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setMobileTab(tab);
                if (tab === 'grid' || tab === 'swatches') setLeftTab(tab);
                if (tab === 'scores' || tab === 'preview') setRightTab(tab);
                playContrastSound('AA');
              }}
              className={`flex-1 py-2 font-mono text-[9px] sm:text-[10px] tracking-wider uppercase font-extrabold transition-all cursor-pointer ${isActive ? 'bg-art-black text-art-white' : 'bg-transparent text-art-black hover:bg-art-black/5'
                }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Main double-console grid container */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 w-full items-stretch">

        {/* COLUMN 1: LEFT CONSOLE (Grid / Swatches) */}
        <div className={`flex-col min-h-0 flex-1 ${['grid', 'swatches'].includes(mobileTab) ? 'flex' : 'hidden lg:flex'}`}>

          {/* Desktop Left tabs selector */}
          <div className="hidden lg:flex w-full border-2 border-art-black rounded-2xl overflow-hidden shrink-0 select-none mb-2.5 bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            {['grid', 'swatches'].map((tab) => {
              const label = tab === 'grid' ? '1. Contrast Grid' : '2. Colors & Presets';
              const isActive = leftTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setLeftTab(tab);
                    setMobileTab(tab);
                    playContrastSound('AA');
                  }}
                  className={`flex-1 py-2 font-mono text-xs tracking-wider uppercase font-extrabold transition-all cursor-pointer ${isActive ? 'bg-art-black text-art-white' : 'bg-transparent text-art-black hover:bg-art-black/5'
                    }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Left panel contents */}
          <div className="flex-1 min-h-0 flex flex-col">
            {leftTab === 'grid' ? (
              /* TAB A: Grid Matrix */
              <div className="bg-white border-2 border-art-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-3xl p-3 sm:p-4 flex flex-col gap-3 min-h-0 flex-1 justify-between overflow-hidden">
                <div className="flex items-center justify-between flex-shrink-0">
                  <div className="space-y-0.5">
                    <span className="font-mono text-[7px] sm:text-[8px] tracking-[0.2em] text-art-teal uppercase font-bold select-none">[ Contrast Grid ]</span>
                    <h4 className="font-sans font-black text-xs sm:text-base uppercase select-none">Check Contrast</h4>
                  </div>
                  <span className="font-mono text-[8px] text-art-gray uppercase select-none hidden sm:inline">Box = Background / Letters = Text</span>
                </div>

                {/* Matrix Grid Area */}
                <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-1 flex flex-col items-center justify-start">
                  <div className="grid grid-cols-5 gap-1.5 sm:gap-2 w-full max-w-lg aspect-square select-none my-auto shrink-0">
                    {colors.map((rowColor, rIdx) =>
                      colors.map((colColor, cIdx) => {
                        const isSelf = rIdx === cIdx;
                        const ratio = calculateContrast(colColor, rowColor);
                        const status = getStatusString(ratio);
                        const isActive = rIdx === bgIndex && cIdx === fgIndex;

                        let bgBadge = 'bg-red-500/10 text-red-600 border border-red-500/20';
                        if (status === 'Perfect') bgBadge = 'bg-art-teal/15 text-art-teal border border-art-teal/30';
                        else if (status === 'Good') bgBadge = 'bg-blue-500/10 text-blue-600 border border-blue-500/20';

                        if (isSelf) {
                          return (
                            <div
                              key={`${rIdx}-${cIdx}`}
                              className="rounded-xl border-2 border-dashed border-art-black/10 flex flex-col items-center justify-center p-1 bg-art-white/30 text-art-gray/40 select-none cursor-not-allowed"
                            >
                              <span className="font-mono text-[8px] font-bold">N/A</span>
                            </div>
                          );
                        }

                        return (
                          <motion.button
                            key={`${rIdx}-${cIdx}`}
                            onClick={() => handleCellClick(rIdx, cIdx)}
                            className={`rounded-xl border-2 p-1 flex flex-col justify-between items-center transition-all select-none cursor-pointer overflow-hidden ${isActive
                              ? 'border-art-teal bg-art-black text-art-white scale-[1.02] shadow-md z-10'
                              : 'border-art-black hover:border-art-teal bg-art-white text-art-black hover:scale-[1.01]'
                              }`}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div
                              className="w-full h-4 sm:h-5 rounded-md flex items-center justify-center font-bold text-[9px] sm:text-xs select-none border border-art-black/5 shrink-0"
                              style={{ backgroundColor: rowColor, color: colColor }}
                            >
                              Aa
                            </div>

                            <div className="text-center w-full mt-1 shrink-0">
                              <span className={`font-mono text-[7px] sm:text-[9px] font-black block tracking-tighter ${isActive ? 'text-art-teal' : 'text-art-black'}`}>
                                {ratio.toFixed(1)}:1
                              </span>
                              <span className={`text-[5px] sm:text-[7px] font-mono tracking-widest uppercase block px-0.5 rounded mt-0.5 font-bold ${bgBadge} truncate`}>
                                {status}
                              </span>
                            </div>
                          </motion.button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Grid guidelines */}
                <div className="pt-2 border-t border-art-black/5 text-center flex-shrink-0">
                  <span className="font-mono text-[8px] tracking-wider text-art-gray uppercase select-none">
                    Tip: Tap any grid cell above to test that color pair!
                  </span>
                </div>
              </div>
            ) : (
              /* TAB B: Swatches & Presets */
              <div className="bg-white border-2 border-art-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-3xl p-4 flex flex-col gap-4 min-h-0 flex-1 overflow-hidden">
                <div className="flex-1 overflow-y-auto overflow-x-hidden pr-1 flex flex-col gap-4 my-auto justify-start">

                  {/* Swatches Editor */}
                  <div className="flex flex-col gap-2 shrink-0 select-none">
                    <div className="space-y-0.5">
                      <span className="font-mono text-[7px] sm:text-[8px] tracking-[0.2em] text-art-teal uppercase font-bold">[ Adjust Colors ]</span>
                      <h4 className="font-sans font-black text-sm uppercase select-none">Palette Swatches</h4>
                    </div>

                    <div className="grid grid-cols-5 gap-2 w-full">
                      {colors.map((c, idx) => {
                        const isActiveBG = idx === bgIndex;
                        const isActiveFG = idx === fgIndex;
                        const roleBadge = isActiveBG ? 'BG' : isActiveFG ? 'TXT' : null;
                        const roleColor = isActiveBG
                          ? 'bg-art-black text-art-white border-art-black'
                          : isActiveFG
                            ? 'bg-art-teal text-art-black border-art-teal'
                            : 'bg-transparent border-art-black/10';

                        return (
                          <div key={idx} className="flex flex-col gap-1">
                            <div
                              className="w-full h-10 sm:h-12 rounded-xl border border-art-black/10 flex items-center justify-between p-1 shadow-inner relative overflow-hidden shrink-0"
                              style={{ backgroundColor: c }}
                            >
                              <input
                                type="color"
                                value={c}
                                onChange={(e) => handleColorChange(idx, e.target.value)}
                                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                              />
                              {roleBadge && (
                                <span className={`font-mono text-[7px] font-black px-1 py-0.5 rounded border leading-none absolute top-1 right-1 ${roleColor}`}>
                                  {roleBadge}
                                </span>
                              )}
                            </div>
                            <input
                              type="text"
                              maxLength={7}
                              value={c}
                              onChange={(e) => handleColorChange(idx, e.target.value)}
                              className="w-full text-[8px] sm:text-[10px] font-mono tracking-tighter uppercase text-center bg-transparent border-b border-art-black/15 focus:border-art-black py-0.5 select-all focus:outline-none font-bold"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Pre-made color sets grid */}
                  <div className="flex flex-col gap-2 shrink-0 select-none pt-4 border-t border-art-black/5">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="font-mono text-[7px] sm:text-[8px] tracking-[0.2em] text-art-teal uppercase font-bold">[ Community Presets ]</span>
                        <h4 className="font-sans font-black text-sm uppercase select-none">Pre-Made Color Sets</h4>
                      </div>

                      {/* DB Shuffle Button */}
                      <button
                        onClick={handleShufflePresets}
                        className="px-2.5 py-1 border-2 border-art-black rounded-xl font-mono text-[9px] uppercase font-black bg-white text-art-black hover:bg-art-black hover:text-white transition-all shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-none cursor-pointer flex items-center gap-1 select-none shrink-0"
                        title="Shuffle Palettes from DB"
                      >
                        <span>SHUFFLE</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {displayedPresets.map((p, idx) => {
                        return (
                          <button
                            key={`${p.name}-${idx}`}
                            onClick={() => handleApplyPreset(p.colors)}
                            className={`p-2 border-2 border-art-black hover:border-art-teal bg-art-white/35 rounded-xl transition-all cursor-pointer flex-col justify-between text-left gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none min-w-0 ${idx >= 5 ? 'hidden md:flex' : 'flex'}`}
                          >
                            <span className="font-mono text-[8px] sm:text-[9px] tracking-wider uppercase font-black truncate max-w-full block">{p.name}</span>
                            <div className="flex gap-1.5 w-full">
                              {p.colors.map((pc, pIdx) => (
                                <div key={pIdx} className="w-3.5 h-3.5 rounded-full border border-art-black/10 shrink-0" style={{ backgroundColor: pc }} />
                              ))}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 2: RIGHT CONSOLE (Scores / Live Preview) */}
        <div className={`flex-col min-h-0 flex-1 ${['scores', 'preview'].includes(mobileTab) ? 'flex' : 'hidden lg:flex'}`}>

          {/* Desktop Right tabs selector */}
          <div className="hidden lg:flex w-full border-2 border-art-black rounded-2xl overflow-hidden shrink-0 select-none mb-2.5 bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            {['scores', 'preview'].map((tab) => {
              const label = tab === 'scores' ? '3. Readability Score' : '4. Live UI Preview';
              const isActive = rightTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setRightTab(tab);
                    setMobileTab(tab);
                    playContrastSound('AA');
                  }}
                  className={`flex-1 py-2 font-mono text-xs tracking-wider uppercase font-extrabold transition-all cursor-pointer ${isActive ? 'bg-art-black text-art-white' : 'bg-transparent text-art-black hover:bg-art-black/5'
                    }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Right panel contents */}
          <div className="flex-1 min-h-0 flex flex-col">
            {rightTab === 'scores' ? (
              /* TAB C: Readability Scores & Diagnostics */
              <div className="bg-white border-2 border-art-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-3xl p-4 flex flex-col gap-4 min-h-0 flex-1 justify-between overflow-hidden">
                <div className="flex-1 flex flex-col gap-4 min-h-0 justify-center">

                  <div className="space-y-0.5 flex-shrink-0">
                    <span className="font-mono text-[7px] sm:text-[8px] tracking-[0.2em] text-art-teal uppercase font-bold">[ Readability Ratings ]</span>
                    <h4 className="font-sans font-black text-sm uppercase select-none">Results</h4>
                  </div>

                  {/* Giant LCD Readout bar */}
                  <div className="flex items-center justify-between gap-4 py-3 border-y-2 border-art-black flex-shrink-0 select-none bg-art-white/35 p-3 rounded-2xl">
                    <div className="flex flex-col">
                      <span className="font-mono text-[8px] tracking-wider text-art-gray uppercase select-none">Contrast Ratio</span>
                      <span className="font-sans font-black text-3xl sm:text-4xl tracking-tighter text-art-black mt-0.5 leading-none">
                        {activeRatio.toFixed(2)}:1
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-mono text-[8px] tracking-wider text-art-gray uppercase select-none">Score</span>
                      <span className={`font-sans font-black text-base sm:text-lg uppercase px-3.5 py-1.5 rounded-xl mt-0.5 border-2 ${activeRatio >= 7.0
                        ? 'bg-art-teal/15 text-art-teal border-art-teal'
                        : activeRatio >= 4.5
                          ? 'bg-blue-500/10 text-blue-600 border-blue-500/30'
                          : 'bg-red-500/10 text-red-600 border-red-500/30 animate-pulse'
                        }`}>
                        {getStatusString(activeRatio)}
                      </span>
                    </div>
                  </div>

                  {/* AA / AAA Pass Lists */}
                  <div className="grid grid-cols-2 gap-2 select-none shrink-0">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-art-white/30 border border-art-black/10 min-w-0">
                      <span className="font-mono text-[7px] sm:text-[8.5px] tracking-wider text-art-gray uppercase select-none truncate">Small (Good)</span>
                      <span className={`font-mono text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded shrink-0 ${aaNormal ? 'bg-art-teal/15 text-art-teal' : 'bg-red-500/15 text-red-600'}`}>
                        {aaNormal ? 'YES' : 'NO'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-art-white/30 border border-art-black/10 min-w-0">
                      <span className="font-mono text-[7px] sm:text-[8.5px] tracking-wider text-art-gray uppercase select-none truncate">Small (Best)</span>
                      <span className={`font-mono text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded shrink-0 ${aaaNormal ? 'bg-art-teal/15 text-art-teal' : 'bg-red-500/15 text-red-600'}`}>
                        {aaaNormal ? 'YES' : 'NO'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-art-white/30 border border-art-black/10 min-w-0">
                      <span className="font-mono text-[7px] sm:text-[8.5px] tracking-wider text-art-gray uppercase select-none truncate">Large (Good)</span>
                      <span className={`font-mono text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded shrink-0 ${aaLarge ? 'bg-art-teal/15 text-art-teal' : 'bg-red-500/15 text-red-600'}`}>
                        {aaLarge ? 'YES' : 'NO'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-art-white/30 border border-art-black/10 min-w-0">
                      <span className="font-mono text-[7px] sm:text-[8.5px] tracking-wider text-art-gray uppercase select-none truncate">Large (Best)</span>
                      <span className={`font-mono text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded shrink-0 ${aaaLarge ? 'bg-art-teal/15 text-art-teal' : 'bg-red-500/15 text-red-600'}`}>
                        {aaaLarge ? 'YES' : 'NO'}
                      </span>
                    </div>
                  </div>

                  {/* Auto-Fix intelligent corrector triggers */}
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-art-black/5 select-none shrink-0">
                    <button
                      onClick={() => handleAutoFix('AA')}
                      disabled={aaNormal}
                      className="px-2.5 py-2.5 border-2 border-art-black hover:border-art-teal rounded-xl font-mono text-[8px] sm:text-[9px] tracking-widest uppercase font-black transition-all bg-transparent disabled:opacity-20 disabled:pointer-events-none select-none cursor-pointer flex items-center justify-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none"
                    >
                      Make Readable (AA)
                    </button>
                    <button
                      onClick={() => handleAutoFix('AAA')}
                      disabled={aaaNormal}
                      className="px-2.5 py-2.5 bg-art-black text-art-white hover:bg-art-teal hover:text-art-black border-2 border-art-black rounded-xl font-mono text-[8px] sm:text-[9px] tracking-widest uppercase font-black transition-all disabled:opacity-20 disabled:pointer-events-none select-none cursor-pointer flex items-center justify-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none"
                    >
                      Make Perfect (AAA)
                    </button>
                  </div>

                </div>
              </div>
            ) : (
              /* TAB D: Live UI Preview Simulator */
              <div className="bg-white border-2 border-art-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-3xl p-4 flex flex-col gap-3.5 min-h-0 flex-1 justify-between overflow-hidden select-none">
                <div className="space-y-0.5 flex-shrink-0">
                  <span className="font-mono text-[7px] sm:text-[8px] tracking-[0.2em] text-art-teal uppercase font-bold">[ Live Demo ]</span>
                  <h4 className="font-sans font-black text-sm uppercase">UI Preview</h4>
                </div>

                {/* Canvas Wireframe Sandbox */}
                <div
                  className="flex-1 min-h-0 rounded-2xl border-2 border-art-black p-3 sm:p-4 flex flex-col gap-3 sm:gap-4 justify-start overflow-y-auto shadow-inner transition-colors duration-300 relative select-none"
                  style={{ backgroundColor: activeBg, color: activeFg }}
                >
                  {/* Alert mockup */}
                  <div
                    className="w-full p-2.5 sm:p-3 rounded-xl border border-current flex items-start gap-2 text-[10px] sm:text-xs select-none"
                    style={{ opacity: 0.95 }}
                  >
                    <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center shrink-0 font-bold font-mono text-[9px]">
                      !
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <span className="font-sans font-black uppercase block tracking-wide text-[9px] sm:text-[10px]">Legibility Alert</span>
                      <p className="font-mono text-[8px] sm:text-[9px] leading-tight select-none">
                        Alert: Contrast ratio is too low for normal eyes.
                      </p>
                    </div>
                  </div>

                  {/* Button mockup */}
                  <div className="w-full flex items-center justify-between border-t border-b border-current py-2.5 select-none shrink-0">
                    <span className="font-sans text-[10px] font-black uppercase select-none">Action Button</span>
                    <button
                      type="button"
                      className="px-3.5 py-1.5 rounded-lg border-2 border-current font-mono text-[8px] uppercase font-black transition-all hover:scale-[1.03] select-none cursor-pointer"
                      style={{ backgroundColor: activeFg, color: activeBg }}
                    >
                      Action Button
                    </button>
                  </div>

                  {/* Large Typography specimen */}
                  <div className="space-y-1.5 select-none flex-1">
                    <span className="font-mono text-[7px] tracking-wider uppercase block select-none" style={{ opacity: 0.6 }}>
                      Text Specimen
                    </span>
                    <p className="font-serif italic text-xs leading-normal select-none">
                      "Chroma accessibility ensures absolute clarity across digital interfaces, empowering engineers to construct accessible architectures."
                    </p>
                    <p className="font-mono text-[9px] leading-relaxed select-none" style={{ opacity: 0.85 }}>
                      The diagnostic grid ensures compliance with strict WCAG standards through mathematical optimization.
                    </p>
                  </div>

                  {/* Status indicator bar */}
                  <div className="flex items-center gap-1.5 select-none mt-1 shrink-0">
                    <span className="font-sans text-[7px] uppercase font-bold tracking-widest" style={{ opacity: 0.7 }}>
                      Status:
                    </span>
                    <div className="px-2 py-0.5 rounded-full border border-current font-mono text-[7px] font-black uppercase select-none">
                      {getStatusString(activeRatio)}
                    </div>
                  </div>
                </div>

                {/* Clipboard copy exports */}
                <div className="flex gap-2.5 pt-3 flex-shrink-0 border-t border-art-black/5 select-none">
                  <button
                    onClick={() => copyToClipboard(activeBg, 'Background')}
                    className="flex-1 px-2 py-1.5 border border-art-black/15 hover:border-art-black rounded-lg font-mono text-[7px] sm:text-[8px] tracking-wider uppercase font-bold select-none cursor-pointer text-center bg-art-white/35"
                  >
                    BG ({activeBg})
                  </button>
                  <button
                    onClick={() => copyToClipboard(activeFg, 'Foreground')}
                    className="flex-1 px-2 py-1.5 border border-art-black/15 hover:border-art-black rounded-lg font-mono text-[7px] sm:text-[8px] tracking-wider uppercase font-bold select-none cursor-pointer text-center bg-art-white/35"
                  >
                    Text ({activeFg})
                  </button>
                </div>

              </div>
            )}
          </div>

        </div>

      </div>

      {/* Dynamic Copied alert bar */}
      <motion.div
        animate={{
          backgroundColor: copierText ? "#14F195" : "#F8F8F8"
        }}
        transition={{ duration: 0.4 }}
        className="w-full h-7 border-t border-art-black/5 flex items-center justify-center fixed bottom-0 left-0 w-full overflow-hidden z-40"
      >
        <AnimatePresence mode="wait">
          {copierText ? (
            <motion.div
              key="alert"
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -15, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="font-sans text-[10px] tracking-[0.25em] uppercase font-bold text-art-black text-center"
            >
              {copierText}
            </motion.div>
          ) : (
            <motion.div
              key="default"
              initial={{ y: -15, opacity: 0 }}
              animate={{ y: 0, opacity: 0.25 }}
              exit={{ y: 15, opacity: 0 }}
              className="font-serif italic text-[10px] tracking-[0.15em] text-art-black text-center"
            >
              Chroma Diagnostics Laboratory
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* INFO DRAWER / OVERLAY (Smooth Slide-Up Sheet) */}
      <AnimatePresence>
        {infoOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center overflow-hidden">

            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-art-black/60 backdrop-blur-sm"
              onClick={() => { setInfoOpen(false); playContrastSound('AA'); }}
            />

            {/* Stark Info Panel */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 280 }}
              className="relative w-full max-w-2xl bg-art-white border-t-4 border-art-black rounded-t-[2.5rem] p-6 sm:p-8 shadow-[0_-8px_30px_rgba(0,0,0,0.3)] z-10 max-h-[85vh] overflow-y-auto flex flex-col justify-between text-art-black select-none"
            >
              <div className="space-y-6">
                {/* Header */}
                <div className="text-center space-y-1.5 mb-2 select-none">
                  <span className="font-mono text-[8px] tracking-[0.25em] text-art-teal font-black uppercase block">
                    [ Guidebook ]
                  </span>
                  <h3 className="text-xl sm:text-2xl font-sans font-black tracking-tight uppercase">
                    How Stark Contrast Works
                  </h3>
                </div>

                {/* Body Details in Simple Words */}
                <div className="space-y-4 font-sans text-xs sm:text-sm leading-relaxed pr-1 flex flex-col gap-2">

                  {/* Card 1: Grid */}
                  <div className="bg-white border-2 border-art-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl p-4 flex flex-col gap-1">
                    <h5 className="font-sans font-black uppercase tracking-wider text-art-black text-[10px] sm:text-xs">
                      1. The Color Grid
                    </h5>
                    <p className="text-[11px] sm:text-xs text-art-black/80">
                      The large grid mixes all 5 colors of your palette. The block's background color is the Background, and the letters ("Aa") show the Text color. Tap any box to lock it for testing.
                    </p>
                  </div>

                  {/* Card 2: Scores */}
                  <div className="bg-[#94C5CC] border-2 border-art-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl p-4 flex flex-col gap-1 text-art-black">
                    <h5 className="font-sans font-black uppercase tracking-wider text-art-black text-[10px] sm:text-xs">
                      2. Readability Scores
                    </h5>
                    <p className="text-[11px] sm:text-xs text-art-black/80 font-medium">
                      We score each pair so it is easy to read: Poor (Hard to read, low contrast), Good (Passes standard rules, comfortable), or Perfect (Extremely clear reading comfort).
                    </p>
                  </div>

                  {/* Card 3: Auto-Fix */}
                  <div className="bg-[#B4D2E7] border-2 border-art-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl p-4 flex flex-col gap-1 text-art-black">
                    <h5 className="font-sans font-black uppercase tracking-wider text-art-black text-[10px] sm:text-xs">
                      3. Smart Auto-Fix
                    </h5>
                    <p className="text-[11px] sm:text-xs text-art-black/80 font-medium">
                      Is a color failing to read? Tap "Make Readable" or "Make Perfect". The system will automatically nudge the brightness until it is perfectly readable without changing the color shade.
                    </p>
                  </div>

                  {/* Card 4: Sound chimes */}
                  <div className="bg-white border-2 border-art-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl p-4 flex flex-col gap-1">
                    <h5 className="font-sans font-black uppercase tracking-wider text-art-black text-[10px] sm:text-xs">
                      4. Synthesizer Sounds
                    </h5>
                    <p className="text-[11px] sm:text-xs text-art-black/80">
                      Hear your palette! Readable colors play a clean, harmonious chime. Pairing colors that are too close in contrast plays a low, alert sound so you know immediately.
                    </p>
                  </div>

                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => { setInfoOpen(false); playContrastSound('AA'); }}
                className="mt-6 w-full py-3 bg-art-black text-art-white hover:bg-art-teal hover:text-art-black rounded-xl transition-all duration-300 font-mono text-[9px] sm:text-[10px] tracking-widest uppercase font-black cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,0.15)] active:translate-y-[1px] active:shadow-none"
              >
                Close Guidebook
              </button>

            </motion.div>

          </div>
        )}
      </AnimatePresence>

    </section>
  );
};

export default Contrast;
