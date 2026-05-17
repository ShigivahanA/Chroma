import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { bulkImportPalettes } from '../utils/api';

const playSoundFeedback = (type) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    const gain = ctx.createGain();
    gain.connect(ctx.destination);

    if (type === 'success') {
      const notes = [261.63, 329.63, 392.00, 523.25];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);

        const noteGain = ctx.createGain();
        noteGain.gain.setValueAtTime(0.0001, ctx.currentTime + idx * 0.12);
        noteGain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + idx * 0.12 + 0.03);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.12 + 0.8);

        osc.connect(noteGain);
        noteGain.connect(gain);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.9);
      });
    } else if (type === 'validate') {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);

      osc.connect(gain);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } else if (type === 'error') {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);

      osc.connect(gain);
      osc.start();
      osc.stop(ctx.currentTime + 0.55);
    }
  } catch (e) { }
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
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
};

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

  if (avgLgt < 25) return 'dark';
  if (avgSat < 15) return 'nordic';
  if (avgLgt > 75 && avgSat < 50) return 'pastel';
  if (avgSat > 65 && avgLgt > 40 && avgLgt < 75) return 'neon';
  if (avgHue >= 80 && avgHue < 155) return 'forest';
  if (avgHue >= 155 && avgHue < 255) return 'ocean';
  if (avgHue >= 255 && avgHue < 320) return 'cosmic';
  if ((avgHue < 50 || avgHue >= 320) && avgSat > 50) return 'sunset';
  if (avgSat < 35) return 'retro';
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
  earth: { title: "Terran Archive", icon: "🟫", color: "bg-amber-800/10 text-amber-800 border-amber-800/20" },
  dark: { title: "Obsidian Noir", icon: "⬛", color: "bg-zinc-800/10 text-zinc-800 border-zinc-800/20" },
  ocean: { title: "Pacific Vapor", icon: "🌊", color: "bg-sky-800/10 text-sky-800 border-sky-800/20" },
  neon: { title: "Kinetic Chroma", icon: "⚡", color: "bg-emerald-800/10 text-emerald-800 border-emerald-800/20" },
  pastel: { title: "Sakura Blossom", icon: "🌸", color: "bg-rose-800/10 text-rose-800 border-rose-800/20" },
  forest: { title: "Boreal Forest", icon: "🌲", color: "bg-green-800/10 text-green-800 border-green-800/20" },
  sunset: { title: "Solar Flare", icon: "🌅", color: "bg-orange-800/10 text-orange-800 border-orange-800/20" },
  cosmic: { title: "Cosmic Nebula", icon: "🌌", color: "bg-violet-800/10 text-violet-800 border-violet-800/20" },
  retro: { title: "Vintage Patina", icon: "🪙", color: "bg-yellow-800/10 text-yellow-800 border-yellow-800/20" },
  nordic: { title: "Nordic Minimal", icon: "🧊", color: "bg-slate-800/10 text-slate-800 border-slate-800/20" }
};

const Import = () => {
  const [importTarget, setImportTarget] = useState('exhibit'); // 'exhibit' or 'templates'
  const [fileData, setFileData] = useState(null);
  const [groupedTemplates, setGroupedTemplates] = useState({
    earth: [], dark: [], ocean: [], neon: [], pastel: [],
    forest: [], sunset: [], cosmic: [], retro: [], nordic: []
  });
  const [isDragActive, setIsDragActive] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle', 'validated', 'importing', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [importResult, setImportResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const processJsonFile = (file) => {
    if (!file) return;

    if (file.type !== "application/json" && !file.name.endsWith(".json")) {
      setStatus('error');
      setErrorMessage('Invalid file format. Please drop a premium .json file.');
      playSoundFeedback('error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        const list = json.palettes || json;

        if (!Array.isArray(list)) {
          throw new Error('Palettes must be a root array, or placed inside a "palettes" property.');
        }

        const validated = [];
        const groups = {
          earth: [], dark: [], ocean: [], neon: [], pastel: [],
          forest: [], sunset: [], cosmic: [], retro: [], nordic: []
        };

        list.forEach((p, idx) => {
          if (p.colors && Array.isArray(p.colors) && p.colors.length >= 2 && p.colors.length <= 7) {
            const formattedColors = p.colors.map(c => c.startsWith('#') ? c : `#${c}`);

            // Build the specimen item
            const specimen = {
              name: p.name || `Archived Palette #${idx + 1}`,
              colors: formattedColors,
              tags: Array.isArray(p.tags) ? p.tags : []
            };

            // If template mode, analyze client-side grouping and append appropriate tags
            if (importTarget === 'templates') {
              const cat = categorizePalette(specimen);
              if (!specimen.tags.includes(cat)) {
                specimen.tags.push(cat);
              }
              groups[cat].push(specimen);
            }

            validated.push(specimen);
          }
        });

        if (validated.length === 0) {
          throw new Error('No valid palettes found. Ensure each has a colors array with 2 to 7 elements.');
        }

        setFileData(validated);
        setGroupedTemplates(groups);
        setStatus('validated');
        playSoundFeedback('validate');
        setErrorMessage('');
      } catch (err) {
        setStatus('error');
        setErrorMessage(`Parsing Failed: ${err.message}`);
        playSoundFeedback('error');
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processJsonFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      processJsonFile(e.target.files[0]);
    }
  };

  const triggerUpload = async () => {
    if (!fileData || fileData.length === 0) return;
    setStatus('importing');

    try {
      const result = await bulkImportPalettes(fileData);
      setImportResult(result);
      setStatus('success');
      playSoundFeedback('success');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err.response?.data?.message || err.message || 'Import failed.');
      playSoundFeedback('error');
    }
  };

  const resetImporter = () => {
    setFileData(null);
    setGroupedTemplates({
      earth: [], dark: [], ocean: [], neon: [], pastel: [],
      forest: [], sunset: [], cosmic: [], retro: [], nordic: []
    });
    setStatus('idle');
    setImportResult(null);
    setErrorMessage('');
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full h-screen overflow-hidden flex flex-col items-center justify-center bg-art-white px-6 md:px-12 relative">
      <div className="w-full max-w-4xl space-y-8 z-10">
        
        {/* Minimal Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-8xl font-sans font-black tracking-tighter text-art-black uppercase leading-none select-none">
            ARCHIVE.
          </h1>
          <div className="flex justify-center gap-4 bg-art-black/5 p-1.5 rounded-full w-max mx-auto text-[10px] font-mono tracking-[0.2em] font-extrabold uppercase">
            <button
              onClick={() => { resetImporter(); setImportTarget('exhibit'); }}
              disabled={status === 'importing'}
              className={`px-6 py-2 rounded-full transition-all ${
                importTarget === 'exhibit' ? 'bg-art-black text-art-white' : 'text-art-gray hover:text-art-black'
              }`}
            >
              Exhibit
            </button>
            <button
              onClick={() => { resetImporter(); setImportTarget('templates'); }}
              disabled={status === 'importing'}
              className={`px-6 py-2 rounded-full transition-all ${
                importTarget === 'templates' ? 'bg-art-black text-art-white' : 'text-art-gray hover:text-art-black'
              }`}
            >
              Templates
            </button>
          </div>
        </div>

        {/* Central Action Area */}
        <div className="bg-white border-2 border-art-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-3xl p-8 md:p-12 relative min-h-[300px] flex flex-col items-center justify-center transition-all duration-300">
          <AnimatePresence mode="wait">
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute top-6 left-6 right-6 bg-red-100 text-red-800 text-xs font-mono p-3 border-2 border-red-800 text-center uppercase tracking-widest font-black z-20"
              >
                {errorMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {status === 'idle' || status === 'error' ? (
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full h-full flex flex-col items-center justify-center gap-6 cursor-pointer text-center transition-all ${
                isDragActive ? 'scale-105 opacity-50' : 'hover:scale-[1.02]'
              }`}
            >
              <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileSelect} className="hidden" />
              <div className="text-8xl opacity-10 select-none">📥</div>
              <div>
                <h3 className="font-sans font-black text-2xl uppercase">Drop JSON File</h3>
                <p className="text-art-gray font-mono text-xs uppercase tracking-widest mt-2">Format: Array / Limit: 1000+</p>
              </div>
            </div>
          ) : status === 'validated' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full flex flex-col items-center justify-center text-center space-y-8"
            >
              <div className="space-y-2">
                <h3 className="font-sans font-black text-3xl uppercase text-art-teal">File Validated</h3>
                <p className="font-mono text-sm text-art-gray uppercase tracking-widest">
                  Target: {importTarget} / Count: {fileData?.length}
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={resetImporter}
                  className="px-8 py-4 border-2 border-art-black rounded-xl font-black uppercase tracking-widest text-xs hover:bg-art-black/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={triggerUpload}
                  className="px-8 py-4 bg-art-black text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-art-teal hover:text-art-black transition-colors"
                >
                  Confirm Import
                </button>
              </div>
            </motion.div>
          ) : status === 'importing' ? (
            <div className="flex flex-col items-center justify-center gap-6">
              <span className="w-12 h-12 border-4 border-art-black border-t-art-teal rounded-full animate-spin" />
              <h3 className="font-sans font-black text-xl uppercase tracking-widest animate-pulse">Writing to Database...</h3>
            </div>
          ) : status === 'success' ? (
            <div className="flex flex-col items-center justify-center text-center space-y-8">
              <div className="space-y-2">
                <h3 className="font-sans font-black text-3xl uppercase text-art-teal">Import Complete</h3>
                <p className="font-mono text-sm text-art-gray uppercase tracking-widest">
                  Processed: {importResult?.processedCount} / Saved: {importResult?.importedCount}
                </p>
              </div>
              <Link
                to="/popular"
                className="px-8 py-4 bg-art-black text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-transparent hover:text-art-black border-2 border-art-black transition-all"
              >
                Go to Gallery
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Import;
