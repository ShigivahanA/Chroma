import React, { useState } from 'react';
import { motion } from 'framer-motion';

const PaletteItem = ({ palette, onLike, isPopularItem = false }) => {
  const [copiedColor, setCopiedColor] = useState(null);
  const [hasLiked, setHasLiked] = useState(false);

  const handleCopy = (color) => {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 1500);
  };

  const handleLike = () => {
    if (!hasLiked && onLike) {
      onLike(palette._id);
      setHasLiked(true);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex h-48 md:h-64 w-full shadow-2xl shadow-art-black/10">
        {palette.colors.map((color, index) => (
          <motion.div
            key={index}
            className="flex-1 relative group cursor-pointer"
            style={{ backgroundColor: color }}
            whileHover={{ flex: 1.2 }}
            transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
            onClick={() => handleCopy(color)}
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-art-black/10 backdrop-blur-sm">
              <span className="text-art-white font-sans text-sm tracking-widest uppercase">
                {copiedColor === color ? 'Copied' : 'Copy'}
              </span>
            </div>
            <div className="absolute bottom-6 left-0 right-0 text-center">
              <span className="text-art-black font-sans text-xs tracking-widest uppercase bg-art-white/80 px-3 py-1">
                {color}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <h3 className="text-art-black font-serif text-2xl italic">{palette.name || 'Untitled'}</h3>
          {palette.tags && palette.tags.length > 0 && (
            <div className="flex gap-2">
              {palette.tags.map(tag => (
                <span key={tag} className="text-xs text-art-gray font-sans tracking-widest uppercase">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
        
        {isPopularItem && (
          <button
            onClick={handleLike}
            disabled={hasLiked}
            className={`font-sans text-xs tracking-widest uppercase transition-colors duration-500 ${
              hasLiked ? 'text-art-teal' : 'text-art-gray hover:text-art-black'
            }`}
          >
            {hasLiked ? 'Loved' : 'Love'} ({palette.likes + (hasLiked ? 1 : 0)})
          </button>
        )}
      </div>
    </div>
  );
};

export default PaletteItem;
