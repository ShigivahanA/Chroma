const Palette = require('../models/Palette');

// @desc    Get all palettes
// @route   GET /api/palettes
// @access  Public
const getPalettes = async (req, res) => {
  try {
    const { sort, limit = 20, page = 1 } = req.query;
    let sortOptions = { createdAt: -1 }; // default: newest

    if (sort === 'popular') {
      sortOptions = { likes: -1 };
    }

    const palettes = await Palette.find({ published: true })
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Palette.countDocuments({ published: true });

    res.json({
      palettes,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get single palette by ID
// @route   GET /api/palettes/:id
// @access  Public
const getPaletteById = async (req, res) => {
  try {
    const palette = await Palette.findById(req.params.id);
    if (palette) {
      res.json(palette);
    } else {
      res.status(404).json({ message: 'Palette not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create a new palette
// @route   POST /api/palettes
// @access  Public
const createPalette = async (req, res) => {
  try {
    const { colors, name, tags, published } = req.body;

    if (!colors || colors.length === 0) {
      return res.status(400).json({ message: 'Colors array is required' });
    }

    const palette = new Palette({
      colors,
      name,
      tags,
      published: typeof published === 'boolean' ? published : false
    });

    const createdPalette = await palette.save();
    res.status(201).json(createdPalette);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Like a palette
// @route   PUT /api/palettes/:id/like
// @access  Public
const likePalette = async (req, res) => {
  try {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const palette = await Palette.findById(req.params.id);
    if (palette) {
      if (!palette.likedIPs) {
        palette.likedIPs = [];
      }
      
      if (palette.likedIPs.includes(ip)) {
        return res.status(400).json({ message: 'You have already liked this palette.' });
      }

      palette.likedIPs.push(ip);
      palette.likes += 1;
      const updatedPalette = await palette.save();
      res.json(updatedPalette);
    } else {
      res.status(404).json({ message: 'Palette not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Generate a random palette (returns without saving to DB)
// @route   GET /api/palettes/generate/random
// @access  Public
const generateRandomPalette = (req, res) => {
  const generateHex = () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  
  // Standard palette size is 5 colors
  const colors = [generateHex(), generateHex(), generateHex(), generateHex(), generateHex()];
  
  res.json({
    colors,
    name: 'Generated Palette'
  });
};

// @desc    Bulk Import color palettes from JSON
// @route   POST /api/palettes/bulk-import
// @access  Public
const bulkImportPalettes = async (req, res) => {
  try {
    const { palettes } = req.body;

    if (!palettes || !Array.isArray(palettes)) {
      return res.status(400).json({ message: 'Invalid palettes array format.' });
    }

    const validPalettes = [];
    const seenColors = new Set();

    for (const p of palettes) {
      if (!p.colors || !Array.isArray(p.colors) || p.colors.length < 2 || p.colors.length > 7) {
        continue;
      }
      
      const normalizedColors = p.colors.map(c => c.toUpperCase());
      const signature = normalizedColors.join(',');

      if (seenColors.has(signature)) {
        continue;
      }
      seenColors.add(signature);

      validPalettes.push({
        name: (p.name || 'Imported Palette').trim(),
        colors: normalizedColors,
        likes: typeof p.likes === 'number' ? p.likes : Math.floor(Math.random() * 50) + 1,
        tags: Array.isArray(p.tags) ? p.tags : [],
        published: true
      });
    }

    if (validPalettes.length === 0) {
      return res.status(400).json({ message: 'No valid palettes found to import.' });
    }

    // High performance bulkWrite with upsert filter to prevent exact duplicate color palette entry
    const bulkOps = validPalettes.map(palette => ({
      updateOne: {
        filter: { colors: palette.colors },
        update: { $setOnInsert: palette },
        upsert: true
      }
    }));

    const result = await Palette.bulkWrite(bulkOps);

    res.json({
      message: 'Bulk import completed successfully.',
      importedCount: result.upsertedCount + result.modifiedCount,
      processedCount: validPalettes.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Bulk Import Failed', error: error.message });
  }
};

module.exports = {
  getPalettes,
  getPaletteById,
  createPalette,
  likePalette,
  generateRandomPalette,
  bulkImportPalettes
};
