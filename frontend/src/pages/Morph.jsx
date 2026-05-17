import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';

// --- COLOR SCIENCE MATHEMATICAL SYSTEMS ---

const hexToRgb = (hex) => {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return { r, g, b };
};

const rgbToHex = (r, g, b) => {
  const toHexStr = (val) => {
    const hex = Math.min(255, Math.max(0, Math.round(val))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHexStr(r)}${toHexStr(g)}${toHexStr(b)}`.toUpperCase();
};

const rgbToHsl = (r, g, b) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
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

// --- CIE L*a*b* PERCEPTUAL MATHEMATICS ---
const rgbToXyz = (r, g, b) => {
  let rL = r / 255;
  let gL = g / 255;
  let bL = b / 255;

  rL = rL > 0.04045 ? Math.pow((rL + 0.055) / 1.055, 2.4) : rL / 12.92;
  gL = gL > 0.04045 ? Math.pow((gL + 0.055) / 1.055, 2.4) : gL / 12.92;
  bL = bL > 0.04045 ? Math.pow((bL + 0.055) / 1.055, 2.4) : bL / 12.92;

  rL *= 100; gL *= 100; bL *= 100;

  const x = rL * 0.4124 + gL * 0.3576 + bL * 0.1805;
  const y = rL * 0.2126 + gL * 0.7152 + bL * 0.0722;
  const z = rL * 0.0193 + gL * 0.1192 + bL * 0.9505;
  return { x, y, z };
};

const xyzToLab = (x, y, z) => {
  const xR = 95.047;
  const yR = 100.000;
  const zR = 108.883;

  let fX = x / xR;
  let fY = y / yR;
  let fZ = z / zR;

  fX = fX > 0.008856 ? Math.pow(fX, 1/3) : (7.787 * fX) + (16 / 116);
  fY = fY > 0.008856 ? Math.pow(fY, 1/3) : (7.787 * fY) + (16 / 116);
  fZ = fZ > 0.008856 ? Math.pow(fZ, 1/3) : (7.787 * fZ) + (16 / 116);

  const l = (116 * fY) - 16;
  const a = 500 * (fX - fY);
  const b = 200 * (fY - fZ);
  return { l, a, b };
};

const labToXyz = (l, a, b) => {
  const y = (l + 16) / 116;
  const x = a / 500 + y;
  const z = y - b / 200;

  const y3 = Math.pow(y, 3);
  const x3 = Math.pow(x, 3);
  const z3 = Math.pow(z, 3);

  const fY = y3 > 0.008856 ? y3 : (y - 16 / 116) / 7.787;
  const fX = x3 > 0.008856 ? x3 : (x - 16 / 116) / 7.787;
  const fZ = z3 > 0.008856 ? z3 : (z - 16 / 116) / 7.787;

  const xR = 95.047;
  const yR = 100.000;
  const zR = 108.883;

  return {
    x: fX * xR,
    y: fY * yR,
    z: fZ * zR
  };
};

const xyzToRgb = (x, y, z) => {
  x /= 100; y /= 100; z /= 100;

  let r = x * 3.2406 + y * -1.5372 + z * -0.4986;
  let g = x * -0.9689 + y * 1.8758 + z * 0.0415;
  let b = x * 0.0557 + y * -0.2040 + z * 1.0570;

  r = r > 0.0031308 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : r * 12.92;
  g = g > 0.0031308 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : g * 12.92;
  b = b > 0.0031308 ? 1.055 * Math.pow(b, 1 / 2.4) - 0.055 : b * 12.92;

  r = Math.min(255, Math.max(0, Math.round(r * 255)));
  g = Math.min(255, Math.max(0, Math.round(g * 255)));
  b = Math.min(255, Math.max(0, Math.round(b * 255)));
  return { r, g, b };
};

// --- INTERPOLATORS ---

const rgbInterpolate = (color1, color2, ratio) => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * ratio);
  const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * ratio);
  const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * ratio);
  return rgbToHex(r, g, b);
};

const hslInterpolate = (color1, color2, ratio) => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  const hsl1 = rgbToHsl(rgb1.r, rgb1.g, rgb1.b);
  const hsl2 = rgbToHsl(rgb2.r, rgb2.g, rgb2.b);

  let h1 = hsl1.h;
  let h2 = hsl2.h;
  let dh = h2 - h1;
  if (dh > 180) { h1 += 360; }
  else if (dh < -180) { h2 += 360; }
  let h = (h1 + (h2 - h1) * ratio) % 360;
  if (h < 0) h += 360;

  const s = Math.round(hsl1.s + (hsl2.s - hsl1.s) * ratio);
  const l = Math.round(hsl1.l + (hsl2.l - hsl1.l) * ratio);
  return hslToHex(h, s, l);
};

const labInterpolate = (color1, color2, ratio) => {
  try {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);

    const xyz1 = rgbToXyz(rgb1.r, rgb1.g, rgb1.b);
    const xyz2 = rgbToXyz(rgb2.r, rgb2.g, rgb2.b);

    const lab1 = xyzToLab(xyz1.x, xyz1.y, xyz1.z);
    const lab2 = xyzToLab(xyz2.x, xyz2.y, xyz2.z);

    const l = lab1.l + (lab2.l - lab1.l) * ratio;
    const a = lab1.a + (lab2.a - lab1.a) * ratio;
    const b = lab1.b + (lab2.b - lab1.b) * ratio;

    const xyz = labToXyz(l, a, b);
    const rgb = xyzToRgb(xyz.x, xyz.y, xyz.z);
    return rgbToHex(rgb.r, rgb.g, rgb.b);
  } catch (e) {
    return rgbInterpolate(color1, color2, ratio);
  }
};

// --- PRESET SEED TRANSITIONS ---
const MORPH_SEEDS = [
  { name: 'Sunset Flare', start: '#FF416C', end: '#FF4B2B' },
  { name: 'Poison Lime', start: '#00FF87', end: '#60EFFF' },
  { name: 'Cosmic Sky', start: '#8A2387', end: '#E94057' },
  { name: 'Nordic Slate', start: '#1F1C2C', end: '#928DAB' },
  { name: 'Royal Velvet', start: '#DA4453', end: '#89216B' },
  { name: 'Deep Sea', start: '#00C9FF', end: '#92FE9D' }
];

// --- SOUND FEEDBACK CASCASE ---
const playMorphSound = (frequency = 330, duration = 0.15, type = 'sine') => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    gainNode.gain.setValueAtTime(0.0001, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration + 0.05);
  } catch (e) {}
};

const playCascadeTones = (stopsList) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    stopsList.forEach((hex, idx) => {
      const rgb = hexToRgb(hex);
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      const freq = 220 + (hsl.h * 0.9) + (idx * 24);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      const stagger = idx * 0.06;

      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.015, ctx.currentTime + stagger + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + stagger + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + stagger);
      osc.stop(ctx.currentTime + stagger + 0.55);
    });
  } catch (e) {}
};

const Morph = () => {
  const navigate = useNavigate();

  // Core Morph Configuration
  const [startColor, setStartColor] = useState('#FF416C');
  const [endColor, setEndColor] = useState('#FF4B2B');
  const [steps, setSteps] = useState(6);
  const [space, setSpace] = useState('lab'); // 'rgb' | 'hsl' | 'lab'

  // Gradient visualizer controls
  const [angle, setAngle] = useState(90);
  const [gradientType, setGradientType] = useState('linear'); // 'linear' | 'radial' | 'conic'

  // UX Feedback states
  const [activeTab, setActiveTab] = useState('interpolate'); // 'interpolate' | 'gradient'
  const [notifier, setNotifier] = useState(null);
  const [infoOpen, setInfoOpen] = useState(false);

  // Generated stops
  const [stops, setStops] = useState([]);

  useEffect(() => {
    const list = [];
    for (let i = 0; i < steps; i++) {
      const ratio = steps > 1 ? i / (steps - 1) : 0;
      let hex = '#000000';
      if (space === 'rgb') hex = rgbInterpolate(startColor, endColor, ratio);
      else if (space === 'hsl') hex = hslInterpolate(startColor, endColor, ratio);
      else if (space === 'lab') hex = labInterpolate(startColor, endColor, ratio);
      list.push(hex);
    }
    setStops(list);
  }, [startColor, endColor, steps, space]);

  const handleApplySeed = (seed) => {
    setStartColor(seed.start);
    setEndColor(seed.end);
    playMorphSound(440, 0.2);
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setNotifier(`${label} copied!`);
    playMorphSound(523.25, 0.15);
    setTimeout(() => setNotifier(null), 2000);
  };

  const triggerCascadePreview = () => {
    playCascadeTones(stops);
  };

  // Open full generated stops in /studio
  const handleOpenInStudio = () => {
    playMorphSound(587.33, 0.25);
    navigate('/studio', { state: { colors: stops.slice(0, 5) } });
  };

  // Construct CSS background string
  const getGradientCSS = () => {
    const colorsString = stops.map((c, i) => {
      const pct = Math.round((i / (stops.length - 1)) * 100);
      return `${c} ${pct}%`;
    }).join(', ');

    if (gradientType === 'radial') {
      return `radial-gradient(circle, ${colorsString})`;
    }
    if (gradientType === 'conic') {
      return `conic-gradient(from ${angle}deg, ${colorsString})`;
    }
    return `linear-gradient(${angle}deg, ${colorsString})`;
  };

  return (
    <section className="h-screen bg-art-white text-art-black flex flex-col pt-16 sm:pt-24 pb-8 px-4 sm:px-6 md:px-8 select-none relative w-full overflow-hidden">
      <SEO
        title="Palette Morph"
        description="Interpolate colors in D65 CIE L*a*b* space and build gorgeous, highly optimized responsive gradients."
        path="/morph"
      />

      {/* Header and Title */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2.5 flex-shrink-0 mb-4 select-none">
        <div className="flex items-center gap-3 select-none">
          <div className="space-y-0.5">
            <span className="font-mono text-[8px] sm:text-[9px] tracking-[0.25em] text-art-teal font-extrabold uppercase block">
              [ Color Interpolation ]
            </span>
            <h2 className="text-2xl sm:text-3xl font-sans font-black uppercase tracking-tight leading-none">
              Palette Morph
            </h2>
          </div>
          <button 
            type="button"
            onClick={() => { setInfoOpen(true); playMorphSound(440, 0.15); }}
            className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-art-black hover:bg-art-black hover:text-white flex items-center justify-center font-serif text-[10px] sm:text-xs font-bold transition-all cursor-pointer shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-none select-none"
            title="How to use morph page"
          >
            ?
          </button>
        </div>
        <p className="font-serif italic text-[10px] sm:text-xs text-art-gray max-w-sm md:text-right select-none">
          Perceptually transition colors across space and build gorgeous gradients.
        </p>
      </div>

      {/* MOBILE TAB BAR SELECTOR */}
      <div className="flex lg:hidden w-full border-2 border-art-black rounded-2xl overflow-hidden shrink-0 select-none mb-3 bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        {['interpolate', 'gradient'].map((tab) => {
          const label = tab === 'interpolate' ? 'Interpolator' : 'Gradient Architect';
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => { setActiveTab(tab); playMorphSound(329.63, 0.15); }}
              className={`flex-1 py-2 font-mono text-[9px] sm:text-[10px] tracking-wider uppercase font-extrabold transition-all cursor-pointer ${
                isActive ? 'bg-art-black text-art-white' : 'bg-transparent text-art-black hover:bg-art-black/5'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Main Grid Dashboards */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 w-full items-stretch">
        
        {/* COLUMN 1: CONTROLS & SEEDS (Visible in 'interpolate' tab or desktop) */}
        <div className={`flex-col min-h-0 flex-1 ${activeTab === 'interpolate' ? 'flex' : 'hidden lg:flex'}`}>
          <div className="bg-white border-2 border-art-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-3xl p-4 flex flex-col gap-4 min-h-0 flex-1 overflow-hidden">
            
            {/* Scrollable Container */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden pr-1 flex flex-col gap-4 my-auto justify-start">
              
              {/* Color Node Adjusters */}
              <div className="space-y-2 shrink-0 select-none">
                <span className="font-mono text-[7px] sm:text-[8px] tracking-[0.2em] text-art-teal uppercase font-bold">[ Colors to Mix ]</span>
                <h4 className="font-sans font-black text-sm uppercase">Choose Colors</h4>

                <div className="grid grid-cols-2 gap-4">
                  {/* Start Node */}
                  <div className="p-3 border-2 border-art-black rounded-2xl bg-art-white/35 flex flex-col gap-2 relative">
                    <span className="font-mono text-[8px] tracking-wider text-art-gray uppercase block">Start Color</span>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-xl border border-art-black/10 flex items-center justify-between p-1 shadow-inner relative overflow-hidden shrink-0"
                        style={{ backgroundColor: startColor }}
                      >
                        <input 
                          type="color"
                          value={startColor}
                          onChange={(e) => setStartColor(e.target.value)}
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                        />
                      </div>
                      <input 
                        type="text"
                        maxLength={7}
                        value={startColor}
                        onChange={(e) => setStartColor(e.target.value.toUpperCase())}
                        className="flex-1 text-xs font-mono tracking-tight uppercase border-b border-art-black/15 focus:border-art-black py-1 select-all focus:outline-none font-bold bg-transparent"
                      />
                    </div>
                  </div>

                  {/* End Node */}
                  <div className="p-3 border-2 border-art-black rounded-2xl bg-art-white/35 flex flex-col gap-2 relative">
                    <span className="font-mono text-[8px] tracking-wider text-art-gray uppercase block">End Color</span>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-xl border border-art-black/10 flex items-center justify-between p-1 shadow-inner relative overflow-hidden shrink-0"
                        style={{ backgroundColor: endColor }}
                      >
                        <input 
                          type="color"
                          value={endColor}
                          onChange={(e) => setEndColor(e.target.value)}
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                        />
                      </div>
                      <input 
                        type="text"
                        maxLength={7}
                        value={endColor}
                        onChange={(e) => setEndColor(e.target.value.toUpperCase())}
                        className="flex-1 text-xs font-mono tracking-tight uppercase border-b border-art-black/15 focus:border-art-black py-1 select-all focus:outline-none font-bold bg-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Seed Transitions */}
              <div className="space-y-2 shrink-0 select-none border-t border-art-black/5 pt-4 mt-1">
                <span className="font-mono text-[7px] sm:text-[8px] tracking-[0.2em] text-art-teal uppercase font-bold">[ Presets ]</span>
                <h4 className="font-sans font-black text-sm uppercase">Quick Mixes</h4>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {MORPH_SEEDS.map((seed, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleApplySeed(seed)}
                      className="p-2 border-2 border-art-black hover:border-art-teal bg-art-white/35 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-2 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] hover:shadow-[2.5px_2.5px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none min-w-0"
                    >
                      <span className="font-mono text-[8px] tracking-wider uppercase font-black truncate">{seed.name}</span>
                      <div className="flex gap-0.5 shrink-0">
                        <div className="w-2.5 h-2.5 rounded-full border border-art-black/5" style={{ backgroundColor: seed.start }} />
                        <div className="w-2.5 h-2.5 rounded-full border border-art-black/5" style={{ backgroundColor: seed.end }} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Engine controls */}
              <div className="space-y-4 shrink-0 select-none border-t border-art-black/5 pt-4 mt-1">
                <span className="font-mono text-[7px] sm:text-[8px] tracking-[0.2em] text-art-teal uppercase font-bold">[ Settings ]</span>
                <h4 className="font-sans font-black text-sm uppercase">Mix Settings</h4>

                {/* Steps slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] uppercase font-bold text-art-gray">Color Steps</span>
                    <span className="font-mono text-xs uppercase font-black text-art-teal">{steps} stops</span>
                  </div>
                  <input 
                    type="range"
                    min={3}
                    max={12}
                    value={steps}
                    onChange={(e) => { setSteps(Number(e.target.value)); playMorphSound(330 + Number(e.target.value) * 15, 0.08); }}
                    className="w-full accent-art-black cursor-pointer bg-art-black/10 rounded-lg h-1.5 appearance-none"
                  />
                </div>

                {/* Interpolation Space */}
                <div className="space-y-2">
                  <span className="font-mono text-[9px] uppercase font-bold text-art-gray block">Blend Method</span>
                  <div className="grid grid-cols-3 gap-2 border-2 border-art-black rounded-2xl overflow-hidden bg-white shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
                    {[
                      { key: 'rgb', label: 'RGB', desc: 'Standard' },
                      { key: 'hsl', label: 'HSL', desc: 'Cylindrical' },
                      { key: 'lab', label: 'L*a*b*', desc: 'Perceptual' }
                    ].map((sp) => {
                      const isActive = space === sp.key;
                      return (
                        <button
                          key={sp.key}
                          onClick={() => { setSpace(sp.key); playMorphSound(380, 0.15); }}
                          className={`py-2 px-1 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-0.5 ${
                            isActive ? 'bg-art-black text-art-white' : 'bg-transparent text-art-black hover:bg-art-black/5'
                          }`}
                        >
                          <span className="font-sans text-[9px] font-black uppercase tracking-tight">{sp.label}</span>
                          <span className={`text-[6.5px] font-mono tracking-widest uppercase block ${isActive ? 'text-art-teal' : 'text-art-gray'}`}>{sp.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* COLUMN 2: VISUAL STOPS & GRADIENT (Visible in 'gradient' tab or desktop) */}
        <div className={`flex-col min-h-0 flex-1 ${activeTab === 'gradient' ? 'flex' : 'hidden lg:flex'}`}>
          <div className="bg-white border-2 border-art-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-3xl p-4 flex flex-col gap-4 min-h-0 flex-1 overflow-hidden">
            
            {/* Scrollable Container */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden pr-1 flex flex-col gap-4 my-auto justify-start">
              
              {/* Swatch Stop Cascade */}
              <div className="space-y-2 shrink-0 select-none">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-mono text-[7px] sm:text-[8px] tracking-[0.2em] text-art-teal uppercase font-bold">[ Results ]</span>
                    <h4 className="font-sans font-black text-sm uppercase">Generated Steps</h4>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={triggerCascadePreview}
                      className="px-2 py-1 border-2 border-art-black rounded-lg font-mono text-[8px] uppercase font-black bg-white text-art-black hover:bg-art-black hover:text-white transition-all shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-none cursor-pointer flex items-center gap-1 select-none"
                      title="Play cascading sound synesthesia sweep"
                    >
                      🔊 Play Sound
                    </button>
                    <button
                      onClick={handleOpenInStudio}
                      className="px-2 py-1 bg-art-black text-art-white border-2 border-art-black rounded-lg font-mono text-[8px] uppercase font-black hover:bg-art-teal hover:text-art-black transition-all shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-none cursor-pointer flex items-center gap-1 select-none"
                      title="Open generated palette in Studio Page"
                    >
                      Open Lab →
                    </button>
                  </div>
                </div>

                {/* Horizontal scroll stops bar */}
                <div className="flex items-center gap-2 overflow-x-auto p-1.5 border-2 border-dashed border-art-black/10 rounded-2xl bg-art-white/20 select-none">
                  {stops.map((hex, idx) => {
                    const rgb = hexToRgb(hex);
                    const l = rgbToHsl(rgb.r, rgb.g, rgb.b).l;
                    return (
                      <div 
                        key={idx}
                        onClick={() => copyToClipboard(hex, `Color Stop ${hex}`)}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl border-2 border-art-black flex flex-col justify-between p-1 cursor-pointer hover:scale-[1.03] transition-all relative group select-none shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] shrink-0"
                        style={{ backgroundColor: hex }}
                      >
                        <span className={`font-mono text-[7px] font-bold select-none ${l > 60 ? 'text-black' : 'text-white'}`}>
                          {idx + 1}
                        </span>
                        <div className="text-center w-full">
                          <span className={`font-mono text-[7px] font-black uppercase block tracking-tighter ${l > 60 ? 'text-black' : 'text-white'}`}>
                            {hex}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Gradient Architect Visualizer Sandbox */}
              <div className="space-y-3 shrink-0 select-none border-t border-art-black/5 pt-4">
                <span className="font-mono text-[7px] sm:text-[8px] tracking-[0.2em] text-art-teal uppercase font-bold">[ Preview ]</span>
                <h4 className="font-sans font-black text-sm uppercase">Gradient Preview</h4>

                {/* Visual Canvas screen */}
                <div 
                  className="w-full h-32 sm:h-36 rounded-2xl border-2 border-art-black relative shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex items-end justify-between p-3 select-none"
                  style={{ background: getGradientCSS() }}
                >
                  <span className="font-mono text-[7.5px] uppercase font-black bg-white text-art-black border border-art-black px-2 py-0.5 rounded shadow">
                    Gradient Preview
                  </span>
                  <button
                    onClick={() => copyToClipboard(getGradientCSS(), 'CSS Code')}
                    className="px-2 py-1 bg-art-black text-art-white border border-art-black/35 rounded-lg font-mono text-[7.5px] uppercase font-black hover:bg-white hover:text-art-black transition-all cursor-pointer shadow active:scale-95 select-none"
                  >
                    Copy CSS
                  </button>
                </div>

                {/* Sandbox Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Type options */}
                  <div className="space-y-1">
                    <span className="font-mono text-[8px] uppercase font-bold text-art-gray block">Shape</span>
                    <div className="grid grid-cols-3 gap-1 border-2 border-art-black rounded-xl overflow-hidden bg-white text-[9px] font-sans font-black select-none">
                      {['linear', 'radial', 'conic'].map((tp) => {
                        const isActive = gradientType === tp;
                        return (
                          <button
                            key={tp}
                            onClick={() => { setGradientType(tp); playMorphSound(340, 0.1); }}
                            className={`py-1.5 uppercase transition-all cursor-pointer ${
                              isActive ? 'bg-art-black text-art-white' : 'bg-transparent text-art-black hover:bg-art-black/5'
                            }`}
                          >
                            {tp}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Angle controls */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[8px] uppercase font-bold text-art-gray">Angle</span>
                      <span className="font-mono text-[8.5px] uppercase font-black text-art-teal">{angle}°</span>
                    </div>
                    <input 
                      type="range"
                      min={0}
                      max={360}
                      value={angle}
                      disabled={gradientType === 'radial'}
                      onChange={(e) => { setAngle(Number(e.target.value)); }}
                      className="w-full accent-art-black cursor-pointer bg-art-black/10 rounded-lg h-1 appearance-none disabled:opacity-20 disabled:pointer-events-none"
                    />
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>

      {/* Dynamic Notifier bar */}
      <motion.div
        animate={{
          backgroundColor: notifier ? "#14F195" : "#F8F8F8"
        }}
        transition={{ duration: 0.4 }}
        className="w-full h-7 border-t border-art-black/5 flex items-center justify-center fixed bottom-0 left-0 w-full overflow-hidden z-40"
      >
        <AnimatePresence mode="wait">
          {notifier ? (
            <motion.div
              key="alert"
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -15, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="font-sans text-[10px] tracking-[0.25em] uppercase font-bold text-art-black text-center"
            >
              {notifier}
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

      {/* INFO SHEET OVERLAY */}
      <AnimatePresence>
        {infoOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center overflow-hidden">
            
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-art-black/60 backdrop-blur-sm"
              onClick={() => { setInfoOpen(false); playMorphSound(261.63, 0.2); }}
            />

            {/* Info sheet panel */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 280 }}
              className="relative w-full max-w-2xl bg-art-white border-t-4 border-art-black rounded-t-[2.5rem] p-6 sm:p-8 shadow-[0_-8px_30px_rgba(0,0,0,0.3)] z-10 max-h-[85vh] overflow-y-auto flex flex-col justify-between text-art-black select-none"
            >
              <div className="space-y-6">
                <div className="text-center space-y-1.5 mb-2 select-none">
                  <span className="font-mono text-[8px] tracking-[0.25em] text-art-teal font-black uppercase block">
                    [ Guidebook ]
                  </span>
                  <h3 className="text-xl sm:text-2xl font-sans font-black tracking-tight uppercase">
                    How Colors Blend
                  </h3>
                </div>

                <div className="space-y-4 font-sans text-xs sm:text-sm leading-relaxed pr-1 flex flex-col gap-2">
                  
                  {/* Card 1: RGB */}
                  <div className="bg-white border-2 border-art-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl p-4 flex flex-col gap-1">
                    <h5 className="font-sans font-black uppercase tracking-wider text-art-black text-[10px] sm:text-xs">
                      1. RGB Method (Standard)
                    </h5>
                    <p className="text-[11px] sm:text-xs text-art-black/80">
                      Mixes colors in a straight mathematical line. It is simple and direct, but can sometimes look slightly dull or grey in the middle.
                    </p>
                  </div>

                  {/* Card 2: HSL */}
                  <div className="bg-[#94C5CC] border-2 border-art-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl p-4 flex flex-col gap-1 text-art-black">
                    <h5 className="font-sans font-black uppercase tracking-wider text-art-black text-[10px] sm:text-xs">
                      2. HSL Method (Rainbow)
                    </h5>
                    <p className="text-[11px] sm:text-xs text-art-black/80 font-medium">
                      Mixes colors by spinning around the color wheel. It creates super bright, vibrant, and rich transitions like a natural rainbow.
                    </p>
                  </div>

                  {/* Card 3: L*a*b* */}
                  <div className="bg-[#B4D2E7] border-2 border-art-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl p-4 flex flex-col gap-1 text-art-black">
                    <h5 className="font-sans font-black uppercase tracking-wider text-art-black text-[10px] sm:text-xs">
                      3. L*a*b* Method (Natural)
                    </h5>
                    <p className="text-[11px] sm:text-xs text-art-black/80 font-medium">
                      Mixes colors based on how human eyes actually see light. It ensures colors transition perfectly smoothly without looking muddy or losing brightness.
                    </p>
                  </div>

                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => { setInfoOpen(false); playMorphSound(261.63, 0.2); }}
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

export default Morph;
