import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../components/SEO';
import { savePalette } from '../utils/api';

// Conversion helpers
const rgbToHex = (r, g, b) => {
  const f = (c) => Math.min(255, Math.max(0, c)).toString(16).padStart(2, '0');
  return `#${f(r)}${f(g)}${f(b)}`.toUpperCase();
};

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

const playSimpleTone = (freq, duration = 0.5, type = 'sine') => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration + 0.1);
  } catch (e) { }
};

const Lens = () => {
  const navigate = useNavigate();
  const [imageSrc, setImageSrc] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [colorCount, setColorCount] = useState(5);
  const [imageAspectRatio, setImageAspectRatio] = useState(4 / 3);
  const [colors, setColors] = useState(['#94C5CC', '#B4D2E7', '#A1A6B4', '#F8F8F8', '#000100']);
  const [pins, setPins] = useState([
    { id: 0, x: 20, y: 30, color: '#94C5CC' },
    { id: 1, x: 40, y: 45, color: '#B4D2E7' },
    { id: 2, x: 50, y: 60, color: '#A1A6B4' },
    { id: 3, x: 60, y: 35, color: '#F8F8F8' },
    { id: 4, x: 80, y: 70, color: '#000100' }
  ]);
  const [activePin, setActivePin] = useState(null);
  const [extractionMode, setExtractionMode] = useState('geometric');
  const [copiedHex, setCopiedHex] = useState(null);
  const [infoOpen, setInfoOpen] = useState(false);

  // Save Modal States
  const [saveOpen, setSaveOpen] = useState(false);
  const [paletteName, setPaletteName] = useState('');
  const [isPublished, setIsPublished] = useState(true);

  // Refs for canvas and container
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Synesthesia Web Audio refs
  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);
  const gainRef = useRef(null);

  // Handle Drag Over
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  // Handle Drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      loadImage(e.dataTransfer.files[0]);
    }
  };

  const adjustColorCount = (diff) => {
    const newCount = Math.min(7, Math.max(2, colorCount + diff));
    if (newCount === colorCount) return;

    setColorCount(newCount);
    playSimpleTone(349.23 + (newCount * 40), 0.15, 'sine');

    // If no image is loaded, update pins and colors lists to match default palette size
    if (!imageSrc) {
      const defaultSwatches = ['#94C5CC', '#B4D2E7', '#A1A6B4', '#F8F8F8', '#000100', '#E5C1CD', '#D2E3C8'];
      const defaultPins = [
        { id: 0, x: 20, y: 30, color: '#94C5CC' },
        { id: 1, x: 40, y: 45, color: '#B4D2E7' },
        { id: 2, x: 50, y: 60, color: '#A1A6B4' },
        { id: 3, x: 60, y: 35, color: '#F8F8F8' },
        { id: 4, x: 80, y: 70, color: '#000100' },
        { id: 5, x: 30, y: 75, color: '#E5C1CD' },
        { id: 6, x: 70, y: 25, color: '#D2E3C8' }
      ];

      setColors(defaultSwatches.slice(0, newCount));
      setPins(defaultPins.slice(0, newCount));
    }
  };

  // Handle File Input Select
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      loadImage(e.target.files[0]);
    }
  };

  // Load image into state
  const loadImage = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target.result);
      setExtractionMode('geometric');
      playSimpleTone(440, 0.4, 'sine');
    };
    reader.readAsDataURL(file);
  };

  // Initialize hidden Canvas and sample colors when imageSrc or pins change
  useEffect(() => {
    if (!imageSrc) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    img.onload = () => {
      const ar = img.naturalWidth / img.naturalHeight;
      setImageAspectRatio(ar);

      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      // Trigger automatic extraction based on selected mode
      extractColors(img, ctx);
    };
  }, [imageSrc, extractionMode, colorCount]);

  // Extract color at specified relative percentages (0 to 100)
  const sampleColorAtPercent = (ctx, img, px, py) => {
    const x = Math.floor((px / 100) * img.naturalWidth);
    const y = Math.floor((py / 100) * img.naturalHeight);

    const clampedX = Math.min(img.naturalWidth - 1, Math.max(0, x));
    const clampedY = Math.min(img.naturalHeight - 1, Math.max(0, y));

    const pixelData = ctx.getImageData(clampedX, clampedY, 1, 1).data;
    return rgbToHex(pixelData[0], pixelData[1], pixelData[2]);
  };

  // Main automatic extraction switch
  const extractColors = (img, ctx) => {
    let newPins = [];

    if (extractionMode === 'geometric') {
      // Stark geometric grid points distributed dynamically based on colorCount
      const coords = [];
      for (let i = 0; i < colorCount; i++) {
        const px = 15 + (i * (70 / (colorCount - 1 || 1)));
        const py = 30 + ((i % 2 === 0 ? 1 : -1) * 12) + 20;
        coords.push({ x: Math.round(px), y: Math.round(py) });
      }
      newPins = coords.map((c, i) => {
        const color = sampleColorAtPercent(ctx, img, c.x, c.y);
        return { id: i, x: c.x, y: c.y, color };
      });
    } else {
      // Smart clustering: sample grid of 120 pixels, sort by vibrant, dark, light, muted
      const gridX = 10;
      const gridY = 12;
      const samples = [];

      for (let i = 1; i < gridX; i++) {
        for (let j = 1; j < gridY; j++) {
          const px = Math.floor((i / gridX) * 100);
          const py = Math.floor((j / gridY) * 100);
          const hex = sampleColorAtPercent(ctx, img, px, py);
          const hsl = hexToHsl(hex);
          samples.push({ px, py, hex, hsl });
        }
      }

      if (extractionMode === 'vibrant') {
        // High saturation points
        samples.sort((a, b) => b.hsl.s - a.hsl.s);
      } else if (extractionMode === 'muted') {
        // Low saturation, mid brightness
        samples.sort((a, b) => a.hsl.s - b.hsl.s);
      } else if (extractionMode === 'dark') {
        // Low lightness
        samples.sort((a, b) => a.hsl.l - b.hsl.l);
      } else if (extractionMode === 'light') {
        // High lightness
        samples.sort((a, b) => b.hsl.l - a.hsl.l);
      }

      // Pick sufficiently spaced separate points to capture distinct colors
      const picked = [];
      const distanceThreshold = 14; // percent distance to prevent overlapping pins and guarantee separate colors

      for (let s of samples) {
        if (picked.length >= colorCount) break;

        const isTooClose = picked.some(p => {
          const dist = Math.sqrt(Math.pow(p.px - s.px, 2) + Math.pow(p.py - s.py, 2));
          return dist < distanceThreshold;
        });

        if (!isTooClose) picked.push(s);
      }

      // Fallback if not enough points found
      while (picked.length < colorCount && samples.length > picked.length) {
        picked.push(samples[picked.length]);
      }

      newPins = Array.from({ length: colorCount }).map((_, idx) => {
        const item = picked[idx] || { px: 50, py: 50, hex: '#A1A6B4' };
        return { id: idx, x: item.px, y: item.py, color: item.hex };
      });
    }

    setPins(newPins);
    setColors(newPins.map(p => p.color));
  };

  // Synesthesia drag synthesizer triggers
  const startDragSynth = (hex) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      if (oscRef.current) {
        try { oscRef.current.stop(); } catch (e) { }
      }

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'triangle';

      const hsl = hexToHsl(hex);
      const freq = 120 + (hsl.h * 1.5);
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gainNode.gain.setValueAtTime(0.0001, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.025, ctx.currentTime + 0.05);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();

      oscRef.current = osc;
      gainRef.current = gainNode;
    } catch (e) { }
  };

  const updateDragSynth = (hex) => {
    try {
      if (!oscRef.current || !audioCtxRef.current) return;
      const ctx = audioCtxRef.current;
      const hsl = hexToHsl(hex);
      const freq = 120 + (hsl.h * 1.5);

      // Smooth slide to new pitch
      oscRef.current.frequency.setTargetAtTime(freq, ctx.currentTime, 0.03);
    } catch (e) { }
  };

  const stopDragSynth = () => {
    try {
      if (gainRef.current && audioCtxRef.current) {
        const ctx = audioCtxRef.current;
        gainRef.current.gain.setValueAtTime(gainRef.current.gain.value, ctx.currentTime);
        gainRef.current.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);

        const osc = oscRef.current;
        setTimeout(() => {
          try { osc.stop(); } catch (e) { }
        }, 220);
      }
      oscRef.current = null;
      gainRef.current = null;
    } catch (e) { }
  };

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (oscRef.current) {
        try { oscRef.current.stop(); } catch (e) { }
      }
    };
  }, []);

  // Draggable logic for pins (Supports mouse & touch)
  const handlePointerDown = (pinId, e) => {
    e.preventDefault();
    e.stopPropagation();
    setActivePin(pinId);

    const pin = pins.find(p => p.id === pinId);
    if (pin) {
      startDragSynth(pin.color);
    }
  };

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (activePin === null || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      let x = ((clientX - containerRect.left) / containerRect.width) * 100;
      let y = ((clientY - containerRect.top) / containerRect.height) * 100;

      // Restrict bounds (0% to 100%)
      x = Math.min(100, Math.max(0, x));
      y = Math.min(100, Math.max(0, y));

      // Draw offscreen canvas to sample
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.src = imageSrc;

        const hex = sampleColorAtPercent(ctx, img, x, y);
        updateDragSynth(hex);

        setPins(prev => prev.map(p => p.id === activePin ? { ...p, x, y, color: hex } : p));
        setColors(prev => {
          const next = [...prev];
          next[activePin] = hex;
          return next;
        });
      }
    };

    const handlePointerUp = () => {
      if (activePin !== null) {
        setActivePin(null);
        stopDragSynth();
      }
    };

    if (activePin !== null) {
      window.addEventListener('mousemove', handlePointerMove);
      window.addEventListener('mouseup', handlePointerUp);
      window.addEventListener('touchmove', handlePointerMove);
      window.addEventListener('touchend', handlePointerUp);
    }

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [activePin, imageSrc, pins]);

  // Export to Studio Page
  const handleOpenInStudio = () => {
    playSimpleTone(523.25, 0.5, 'sine'); // Soft chime
    navigate('/studio', { state: { colors } });
  };

  // Copy swatch Hex to clipboard
  const handleCopyHex = (hex, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    playSimpleTone(587.33, 0.25, 'sine'); // Shimmering high tone
    setTimeout(() => setCopiedHex(null), 2500);
  };

  // Save Palette handler
  const handleSavePalette = async (e) => {
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
      setCopiedHex("SAVED");
      setTimeout(() => setCopiedHex(null), 2500);
      playSimpleTone(523.25, 0.6, 'sine');
    } catch (err) { }
  };

  return (
    <section className="w-full h-screen bg-art-white flex flex-col pt-20 sm:pt-24 pb-6 sm:pb-8 select-none overflow-hidden">
      <SEO
        title="Chromatic Lens"
        description="Extract beautiful color swatches directly from images. Drag pins to sample colors and hear live sound feedback."
        path="/lens"
      />

      <div className="flex-1 min-h-0 w-full max-w-7xl mx-auto px-4 sm:px-8 md:px-12 flex flex-col gap-4 sm:gap-6 justify-between">
        {/* Stark Header Title */}
        <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-3 border-b border-art-black/10 pb-3 flex-shrink-0">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-sans font-black tracking-tighter text-art-black uppercase leading-none flex items-center gap-2 select-none">
                LENS.
                <button
                  type="button"
                  onClick={() => { setInfoOpen(true); playSimpleTone(440, 0.15, 'sine'); }}
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-art-black/20 hover:border-art-black hover:bg-art-black hover:text-white transition-all font-serif italic text-xs flex items-center justify-center cursor-pointer select-none font-bold text-art-gray shrink-0 shadow-sm"
                  title="View Guidebook"
                >
                  i
                </button>
              </h1>
            </div>
            <p className="font-mono text-[8px] sm:text-[9px] text-art-gray tracking-[0.25em] uppercase mt-1">
              Extract beautiful color palettes directly from your images
            </p>
          </div>

          {/* Preset switch algorithms */}
          {imageSrc && (
            <div className="flex items-center gap-1 bg-art-black/5 p-1 rounded-full text-[8px] sm:text-[9px] font-mono tracking-widest font-extrabold uppercase overflow-x-auto w-full md:w-auto">
              {['geometric', 'vibrant', 'muted', 'dark', 'light'].map(mode => (
                <button
                  key={mode}
                  onClick={() => {
                    setExtractionMode(mode);
                    playSimpleTone(293.66, 0.15, 'sine');
                  }}
                  className={`px-3 py-1 rounded-full transition-all shrink-0 cursor-pointer ${extractionMode === mode ? 'bg-art-black text-art-white' : 'text-art-gray hover:text-art-black'
                    }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dynamic Canvas Workspace split */}
        <div className="flex flex-col lg:flex-row flex-1 min-h-0 w-full gap-6 md:gap-8 items-stretch pb-4">

          {/* Left panel: Image Dropper/Canvas Display */}
          <div className="flex-1 min-h-0 flex flex-col items-center justify-center w-full lg:w-7/12">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
            {!imageSrc ? (
              // Importer Drag Drop Box
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-full max-w-2xl bg-white border-4 border-art-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center gap-4 p-6 cursor-pointer text-center select-none transition-all duration-350 hover:translate-y-[-2px] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <span className="text-5xl sm:text-6xl select-none opacity-20">📷</span>
                <div>
                  <h3 className="font-sans font-black text-lg sm:text-xl uppercase tracking-tight">Drop Image </h3>
                  <p className="text-art-gray font-mono text-[8px] sm:text-[9px] tracking-widest uppercase mt-1">
                    Click to browse / drag files here
                  </p>
                </div>
              </div>
            ) : (
              // Image canvas container overlayed with draggable pins
              <div className="w-full h-full flex flex-col items-center justify-center select-none min-h-0">
                {/* Sleek dynamic control bar above image frame */}
                <div className="w-full max-w-2xl flex items-center justify-between gap-3 mb-2 flex-shrink-0 select-none">
                  <span className="font-mono text-[8px] sm:text-[9px] tracking-wider text-art-gray uppercase">
                    [ Active Image ]
                  </span>
                  <div className="flex items-center gap-2">
                    {/* Change Image Button */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 sm:py-1.5 border border-art-black rounded-lg font-mono text-[8px] tracking-widest font-extrabold uppercase hover:bg-art-black hover:text-white transition-all cursor-pointer select-none shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none"
                    >
                      Change Image
                    </button>

                    {/* Remove Image Button */}
                    <button
                      onClick={() => {
                        setImageSrc(null);
                        setImageAspectRatio(4 / 3);
                        const defaultSwatches = ['#94C5CC', '#B4D2E7', '#A1A6B4', '#F8F8F8', '#000100', '#E5C1CD', '#D2E3C8'];
                        const defaultPins = [
                          { id: 0, x: 20, y: 30, color: '#94C5CC' },
                          { id: 1, x: 40, y: 45, color: '#B4D2E7' },
                          { id: 2, x: 50, y: 60, color: '#A1A6B4' },
                          { id: 3, x: 60, y: 35, color: '#F8F8F8' },
                          { id: 4, x: 80, y: 70, color: '#000100' },
                          { id: 5, x: 30, y: 75, color: '#E5C1CD' },
                          { id: 6, x: 70, y: 25, color: '#D2E3C8' }
                        ];
                        setColors(defaultSwatches.slice(0, colorCount));
                        setPins(defaultPins.slice(0, colorCount));
                        playSimpleTone(220, 0.3, 'sine');
                      }}
                      className="px-2.5 py-1 sm:py-1.5 border border-red-500 text-red-500 rounded-lg font-mono text-[8px] tracking-widest font-extrabold uppercase hover:bg-red-500 hover:text-white transition-all cursor-pointer select-none shadow-[1px_1px_0px_0px_rgba(239,68,68,1)] active:translate-y-[1px] active:shadow-none"
                    >
                      🗑️ Remove Image
                    </button>
                  </div>
                </div>

                <div
                  ref={containerRef}
                  className="w-full h-full max-w-2xl bg-white border-4 border-art-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden relative select-none max-h-[35vh] lg:max-h-full"
                  style={{
                    aspectRatio: imageAspectRatio,
                    maxHeight: '100%'
                  }}
                >
                  {/* Invisible working pixel sampling canvas */}
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Rendered source image */}
                  <img
                    src={imageSrc}
                    alt="Image"
                    className="w-full h-full object-cover select-none pointer-events-none"
                    draggable="false"
                  />

                  {/* Pins Overlay */}
                  {pins.map((pin) => {
                    const pinColorHsl = hexToHsl(pin.color);
                    const isPinLight = pinColorHsl.l > 60;
                    const ringColor = isPinLight ? 'border-art-black' : 'border-art-white';
                    const textColor = isPinLight ? 'text-art-black' : 'text-art-white';

                    return (
                      <div
                        key={pin.id}
                        onMouseDown={(e) => handlePointerDown(pin.id, e)}
                        onTouchStart={(e) => handlePointerDown(pin.id, e)}
                        className={`absolute w-7 h-7 sm:w-9 sm:h-9 -ml-3.5 -mt-3.5 sm:-ml-4.5 sm:-mt-4.5 rounded-full border-2 ${ringColor} flex items-center justify-center cursor-move select-none z-30 transition-shadow duration-300 shadow-md ${activePin === pin.id ? 'scale-110 shadow-lg ring-4 ring-art-teal/40' : ''
                          }`}
                        style={{
                          left: `${pin.x}%`,
                          top: `${pin.y}%`,
                          backgroundColor: pin.color,
                          touchAction: 'none'
                        }}
                      >
                        <span className={`font-mono text-[9px] sm:text-xs font-bold select-none ${textColor}`}>
                          {pin.id + 1}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right panel: Extracted Swatch Cards & Dashboard */}
          <div className="flex-1 lg:flex-initial lg:w-5/12 flex flex-col justify-center min-h-0 w-full">
            <div className="bg-white border-2 border-art-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-3xl p-3.5 sm:p-5 flex flex-col gap-3.5 sm:gap-5 min-h-0 h-full justify-between overflow-hidden">

              <AnimatePresence mode="wait">
                {!saveOpen ? (
                  /* State A: Swatches sequence & standard controls */
                  <motion.div
                    key="swatches"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col flex-1 min-h-0 gap-3 sm:gap-4 justify-between"
                  >
                    <div className="space-y-0.5 flex-shrink-0">
                      <span className="font-mono text-[7px] sm:text-[8px] tracking-[0.25em] text-art-teal font-extrabold uppercase select-none">
                        [ Palette Colors ]
                      </span>
                      <h3 className="font-sans font-black text-lg sm:text-xl uppercase tracking-tighter select-none">
                        Extracted Colors
                      </h3>
                    </div>

                    {/* Dynamic Swatch Count Controls */}
                    <div className="flex items-center justify-between bg-art-white/50 border border-art-black/10 p-1.5 sm:p-2 rounded-xl flex-shrink-0 select-none">
                      <div className="flex flex-col">
                        <span className="font-mono text-[7px] tracking-wider text-art-gray uppercase select-none">Size</span>
                        <span className="font-sans font-black text-[10px] sm:text-[11px] uppercase text-art-black mt-0.5">{colorCount} Colors</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => adjustColorCount(-1)}
                          disabled={colorCount <= 2}
                          className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center border-2 border-art-black rounded-lg font-mono font-bold hover:bg-art-black hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-art-black transition-all cursor-pointer select-none text-[10px]"
                        >
                          -
                        </button>
                        <button
                          type="button"
                          onClick={() => adjustColorCount(1)}
                          disabled={colorCount >= 7}
                          className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center border-2 border-art-black rounded-lg font-mono font-bold hover:bg-art-black hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-art-black transition-all cursor-pointer select-none text-[10px]"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Swatch Sequence - Scrollable inside if it overflows! */}
                    <div className="flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col gap-2">
                      {colors.map((color, idx) => {
                        const hsl = hexToHsl(color);
                        const isLight = hsl.l > 60;
                        const dotColor = isLight ? 'border-art-black/15' : 'border-art-white/15';

                        return (
                          <motion.div
                            key={idx}
                            onClick={(e) => handleCopyHex(color, e)}
                            className="group flex items-center justify-between p-2 rounded-xl cursor-pointer border border-art-black/5 hover:border-art-black/15 transition-all select-none bg-art-white/30"
                            whileHover={{ x: 2 }}
                          >
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border ${dotColor} flex items-center justify-center shadow-inner relative overflow-hidden`}
                                style={{ backgroundColor: color }}
                              >
                                <span className={`font-mono text-[8px] font-bold ${isLight ? 'text-art-black' : 'text-art-white'}`}>
                                  {idx + 1}
                                </span>
                              </div>

                              <div className="flex flex-col select-none">
                                <span className="font-mono font-bold text-xs uppercase tracking-tight text-art-black group-hover:text-art-teal transition-colors">
                                  {color}
                                </span>
                                <span className="font-mono text-[7px] tracking-wider text-art-gray uppercase select-none mt-0.5">
                                  HSL: {hsl.h}° {hsl.s}% {hsl.l}%
                                </span>
                              </div>
                            </div>

                            {/* Copy Indicator */}
                            <span className="font-sans text-[7px] tracking-widest text-art-gray/40 group-hover:text-art-black uppercase font-bold transition-colors select-none">
                              Copy
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Large Action Dock */}
                    <div className="grid grid-cols-2 gap-2.5 pt-1.5 select-none flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => { setSaveOpen(true); playSimpleTone(440, 0.15, 'sine'); }}
                        className="px-2 py-2 border-2 border-art-black hover:border-art-teal rounded-xl font-sans text-[8px] sm:text-[9px] tracking-[0.15em] font-extrabold uppercase transition-all bg-transparent select-none cursor-pointer flex items-center justify-center gap-1.5 group/save shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                      >
                        Save Palette
                      </button>

                      <button
                        type="button"
                        onClick={handleOpenInStudio}
                        className="px-2 py-2 bg-art-black text-art-white hover:bg-art-teal hover:text-art-black border-2 border-art-black rounded-xl font-sans text-[8px] sm:text-[9px] tracking-[0.15em] font-extrabold uppercase transition-all select-none cursor-pointer flex items-center justify-center gap-1.5 group/studio shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                      >
                        Open in Studio
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  /* State B: In-place Save Form */
                  <motion.form
                    key="saveForm"
                    onSubmit={handleSavePalette}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col flex-1 min-h-0 gap-3 sm:gap-4 justify-between animate-fade-in"
                  >
                    <div className="space-y-0.5 flex-shrink-0">
                      <span className="font-mono text-[7px] sm:text-[8px] tracking-[0.25em] text-art-teal font-extrabold uppercase select-none">
                        [ Export Palette ]
                      </span>
                      <h3 className="font-sans font-black text-lg sm:text-xl uppercase tracking-tighter select-none">
                        Save Palette
                      </h3>
                    </div>

                    {/* Highly Compact Pill Row Review */}
                    <div className="flex justify-center items-center gap-1.5 py-1.5 flex-shrink-0 select-none overflow-x-auto w-full">
                      {colors.map((c, i) => {
                        const hsl = hexToHsl(c);
                        const isLight = hsl.l > 60;
                        return (
                          <motion.div
                            key={i}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: i * 0.03, duration: 0.2 }}
                            className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-art-black/10 flex items-center justify-center shadow-sm shrink-0"
                            style={{ backgroundColor: c }}
                          >
                            <span className={`font-mono text-[8px] font-black ${isLight ? 'text-art-black' : 'text-art-white'}`}>
                              {i + 1}
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Centered Input box */}
                    <div className="space-y-0.5 w-full flex-shrink-0">
                      <label className="font-mono text-[7px] tracking-widest text-art-gray uppercase block mb-0.5 text-center">
                        Palette Name
                      </label>
                      <input
                        type="text"
                        required
                        value={paletteName}
                        onChange={(e) => setPaletteName(e.target.value)}
                        placeholder="e.g. MOJAVE"
                        autoFocus
                        className="w-full bg-art-black/5 border border-art-black/10 hover:border-art-teal/40 focus:border-art-black py-2 px-3 rounded-xl text-xs font-mono tracking-widest uppercase text-art-black placeholder-art-black/25 focus:outline-none transition-all duration-300 text-center font-bold"
                      />
                    </div>

                    {/* Action button rows */}
                    <div className="flex flex-col gap-2 pt-1.5 w-full flex-shrink-0 border-t border-art-black/5">
                      <div
                        className="flex items-center justify-center gap-2 select-none cursor-pointer group py-0.5"
                        onClick={() => setIsPublished(prev => !prev)}
                      >
                        <div className={`w-3.5 h-3.5 border flex items-center justify-center rounded transition-all duration-300 ${isPublished ? 'bg-art-black border-art-black text-art-white' : 'border-art-black/20 text-transparent bg-transparent group-hover:border-art-black/40'}`}>
                          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="font-mono text-[7px] tracking-widest uppercase text-art-gray group-hover:text-art-black transition-colors font-bold">
                          Publish to Exhibit
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => { setSaveOpen(false); setPaletteName(''); playSimpleTone(220, 0.25, 'sine'); }}
                          className="px-2 py-2 border-2 border-art-black rounded-xl font-mono text-[8px] sm:text-[9px] tracking-widest uppercase text-art-gray hover:text-art-black font-black transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)] active:translate-y-[1px] active:shadow-none"
                        >
                          Cancel
                        </button>

                        <button
                          type="submit"
                          className="px-2 py-2 bg-art-black text-art-white hover:bg-art-teal hover:text-art-black border-2 border-art-black rounded-xl font-mono text-[8px] sm:text-[9px] tracking-widest uppercase font-black transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none flex items-center justify-center gap-1"
                        >
                          <span>Save</span>
                          <span>→</span>
                        </button>
                      </div>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

            </div>
          </div>

        </div>
      </div>



      {/* Dynamic Gutter copied notifier */}
      <motion.div
        animate={{
          backgroundColor: copiedHex ? (copiedHex.startsWith("#") ? copiedHex : "#94C5CC") : "#F8F8F8"
        }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="w-full h-7 border-t border-art-black/5 flex items-center justify-center fixed bottom-0 left-0 w-full overflow-hidden z-40"
      >
        <AnimatePresence mode="wait">
          {copiedHex ? (
            <motion.div
              key="alert"
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -15, opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className={`font-sans text-[10px] tracking-[0.25em] uppercase font-bold text-center ${hexToHsl(copiedHex.startsWith("#") ? copiedHex : "#94C5CC").l > 60 ? 'text-art-black' : 'text-art-white'
                }`}
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
              Chroma Lens Laboratory
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
              onClick={() => { setInfoOpen(false); playSimpleTone(261.63, 0.2, 'sine'); }}
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
                    How Chromatic Lens Works
                  </h3>
                </div>

                <div className="space-y-4 font-sans text-xs sm:text-sm leading-relaxed pr-1 flex flex-col gap-2">
                  
                  {/* Card 1: Import */}
                  <div className="bg-white border-2 border-art-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl p-4 flex flex-col gap-1">
                    <h5 className="font-sans font-black uppercase tracking-wider text-art-black text-[10px] sm:text-xs">
                      1. Import Your Image
                    </h5>
                    <p className="text-[11px] sm:text-xs text-art-black/80">
                      Drag and drop any photograph or picture directly into the layout box, or tap the upload box to browse files from your device.
                    </p>
                  </div>

                  {/* Card 2: Algorithms */}
                  <div className="bg-[#94C5CC] border-2 border-art-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl p-4 flex flex-col gap-1 text-art-black">
                    <h5 className="font-sans font-black uppercase tracking-wider text-art-black text-[10px] sm:text-xs">
                      2. Switch Extract Modes
                    </h5>
                    <p className="text-[11px] sm:text-xs text-art-black/80 font-medium">
                      Switch between different mood filters (Geometric, Vibrant, Muted, Dark, or Light) to automatically snap color pins to beautiful color regions.
                    </p>
                  </div>

                  {/* Card 3: Pins */}
                  <div className="bg-[#B4D2E7] border-2 border-art-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl p-4 flex flex-col gap-1 text-art-black">
                    <h5 className="font-sans font-black uppercase tracking-wider text-art-black text-[10px] sm:text-xs">
                      3. Nudge Color Pins
                    </h5>
                    <p className="text-[11px] sm:text-xs text-art-black/80 font-medium">
                      Tap and hold any coordinate pin to drag it across the image. The sampler grabs the exact pixel color beneath the pointer in real-time.
                    </p>
                  </div>

                  {/* Card 4: Hear & Save */}
                  <div className="bg-white border-2 border-art-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl p-4 flex flex-col gap-1">
                    <h5 className="font-sans font-black uppercase tracking-wider text-art-black text-[10px] sm:text-xs">
                      4. Hear & Save Palette
                    </h5>
                    <p className="text-[11px] sm:text-xs text-art-black/80">
                      Dragging pins plays a live sound wave sweep. Tap any color card to instantly copy its Hex value, or hit Save to store your palette.
                    </p>
                  </div>

                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => { setInfoOpen(false); playSimpleTone(261.63, 0.2, 'sine'); }}
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

export default Lens;
