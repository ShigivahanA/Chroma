import React, { useState } from 'react';

const row1Pattern = [
  { hex: "#000100", width: 140 },
  { hex: "#A1A6B4", width: 280 },
  { hex: "#94C5CC", width: 180 },
  { hex: "#B4D2E7", width: 340 },
  { hex: "#F8F8F8", width: 160 },
  { hex: "#000100", width: 220 },
  { hex: "#94C5CC", width: 120 },
  { hex: "#B4D2E7", width: 300 },
  { hex: "#A1A6B4", width: 200 },
  { hex: "#F8F8F8", width: 260 },
];

const row2Pattern = [
  { hex: "#94C5CC", width: 300 },
  { hex: "#B4D2E7", width: 160 },
  { hex: "#F8F8F8", width: 220 },
  { hex: "#000100", width: 120 },
  { hex: "#A1A6B4", width: 340 },
  { hex: "#94C5CC", width: 200 },
  { hex: "#B4D2E7", width: 260 },
  { hex: "#000100", width: 180 },
  { hex: "#A1A6B4", width: 140 },
  { hex: "#F8F8F8", width: 280 },
];

const row3Pattern = [
  { hex: "#B4D2E7", width: 180 },
  { hex: "#F8F8F8", width: 340 },
  { hex: "#000100", width: 160 },
  { hex: "#A1A6B4", width: 200 },
  { hex: "#94C5CC", width: 280 },
  { hex: "#B4D2E7", width: 120 },
  { hex: "#000100", width: 300 },
  { hex: "#94C5CC", width: 220 },
  { hex: "#A1A6B4", width: 260 },
  { hex: "#F8F8F8", width: 140 },
];

const ColorBlock = ({ hex, width, heightClass }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isLight = hex === "#F8F8F8" || hex === "#B4D2E7" || hex === "#94C5CC";
  const textColor = isLight ? "text-art-black" : "text-art-white";
  const overlayBg = isLight ? "bg-white/20" : "bg-black/25";

  return (
    <div 
      onClick={handleCopy}
      className={`relative shrink-0 cursor-pointer overflow-hidden group border-r border-art-black/5 transition-all duration-300 hover:scale-[0.98] ${heightClass}`}
      style={{ backgroundColor: hex, width: `${width}px` }}
    >
      {/* Hover Glass Layer displaying Hex and Copy symbol directly in the block */}
      <div className={`absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${textColor} ${overlayBg} backdrop-blur-[2px] z-10`}>
        <span className="font-mono text-[9px] md:text-xs font-bold tracking-widest mb-2 select-none">
          {copied ? "SAMPLED" : hex}
        </span>
        <svg 
          className={`w-4 h-4 transition-transform duration-300 ${copied ? 'scale-125' : 'opacity-60 group-hover:opacity-100'}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
          strokeWidth="2.5"
        >
          {copied ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          )}
        </svg>
      </div>
    </div>
  );
};

const Marquee = () => {
  // Multiply sets so the marquee easily overflows horizontally and loops seamlessly
  const duplicateRow1 = [...row1Pattern, ...row1Pattern, ...row1Pattern, ...row1Pattern];
  const duplicateRow2 = [...row2Pattern, ...row2Pattern, ...row2Pattern, ...row2Pattern];
  const duplicateRow3 = [...row3Pattern, ...row3Pattern, ...row3Pattern, ...row3Pattern];

  return (
    <section className="w-full bg-art-white py-12 md:py-24 border-y border-art-black/10 overflow-hidden flex flex-col gap-4 relative">
      
      {/* Row 1: Flowing Left, Slow */}
      <div className="w-full overflow-hidden flex items-center">
        <div className="animate-marquee-left flex items-center" style={{ animationDuration: '50s' }}>
          <div className="flex items-center shrink-0">
            {duplicateRow1.map((color, index) => (
              <ColorBlock key={`r1-set1-${index}`} hex={color.hex} width={color.width} heightClass="h-20 md:h-28" />
            ))}
          </div>
          <div className="flex items-center shrink-0">
            {duplicateRow1.map((color, index) => (
              <ColorBlock key={`r1-set2-${index}`} hex={color.hex} width={color.width} heightClass="h-20 md:h-28" />
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Flowing Right, Fast */}
      <div className="w-full overflow-hidden flex items-center">
        <div className="animate-marquee-right flex items-center" style={{ animationDuration: '40s' }}>
          <div className="flex items-center shrink-0">
            {duplicateRow2.map((color, index) => (
              <ColorBlock key={`r2-set1-${index}`} hex={color.hex} width={color.width} heightClass="h-24 md:h-36" />
            ))}
          </div>
          <div className="flex items-center shrink-0">
            {duplicateRow2.map((color, index) => (
              <ColorBlock key={`r2-set2-${index}`} hex={color.hex} width={color.width} heightClass="h-24 md:h-36" />
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Flowing Left, Medium Speed */}
      <div className="w-full overflow-hidden flex items-center">
        <div className="animate-marquee-left flex items-center" style={{ animationDuration: '60s' }}>
          <div className="flex items-center shrink-0">
            {duplicateRow3.map((color, index) => (
              <ColorBlock key={`r3-set1-${index}`} hex={color.hex} width={color.width} heightClass="h-16 md:h-24" />
            ))}
          </div>
          <div className="flex items-center shrink-0">
            {duplicateRow3.map((color, index) => (
              <ColorBlock key={`r3-set2-${index}`} hex={color.hex} width={color.width} heightClass="h-16 md:h-24" />
            ))}
          </div>
        </div>
      </div>

    </section>
  );
};

export default Marquee;
