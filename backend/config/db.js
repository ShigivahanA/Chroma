const mongoose = require('mongoose');

const seedTemplates = async () => {
  try {
    const Palette = require('../models/Palette');
    
    const curationSeeds = [
      // Earth
      { name: 'Terracotta Dune', colors: ['#4E2A22', '#864332', '#C67A5C', '#E4B59D', '#F4DFD2'], likes: 142, tags: ['earth', 'nature'], published: true },
      { name: 'Olive Timber', colors: ['#2F3E30', '#566A55', '#8C9B86', '#C0C8BC', '#E4E8E2'], likes: 98, tags: ['earth', 'nature'], published: true },
      { name: 'Warm Ochre', colors: ['#5E4523', '#A4804D', '#DAB982', '#ECD6AD', '#FAF4EB'], likes: 114, tags: ['earth', 'nature'], published: true },
      // Dark
      { name: 'Stark Void', colors: ['#0A0A0A', '#1C1C1C', '#333333', '#777777', '#E5E5E5'], likes: 254, tags: ['dark', 'noir'], published: true },
      { name: 'Obsidian Teal', colors: ['#0A1211', '#122523', '#1F4743', '#4E938D', '#AEE2DC'], likes: 189, tags: ['dark', 'noir'], published: true },
      { name: 'Carbon Dusk', colors: ['#0E0D12', '#1C1A24', '#3D394D', '#8C85A8', '#E5E2F0'], likes: 137, tags: ['dark', 'noir'], published: true },
      // Ocean
      { name: 'Seaglass Ice', colors: ['#0F2537', '#1D4E76', '#4D96C4', '#9AD2EC', '#E5F6FD'], likes: 211, tags: ['ocean', 'water'], published: true },
      { name: 'Pacific Coral', colors: ['#0A2A3A', '#1F5E7B', '#5FA8C6', '#F5C2C1', '#FDF5F5'], likes: 167, tags: ['ocean', 'water'], published: true },
      { name: 'Ethereal Mist', colors: ['#1A2B32', '#3D5E6B', '#7BA6B5', '#BCDDE6', '#F3FAF5'], likes: 122, tags: ['ocean', 'water'], published: true },
      // Neon
      { name: 'Cyber Apocalypse', colors: ['#08020F', '#2A044A', '#7209B7', '#F72585', '#4CC9F0'], likes: 312, tags: ['neon', 'bright'], published: true },
      { name: 'Toxic Lime', colors: ['#0F1E0C', '#22481A', '#3C8A27', '#80ED99', '#C7F9CC'], likes: 178, tags: ['neon', 'bright'], published: true },
      { name: 'Volcanic Acid', colors: ['#1C0707', '#4E1111', '#B91C1C', '#F97316', '#FACC15'], likes: 245, tags: ['neon', 'bright'], published: true }
    ];

    for (const seed of curationSeeds) {
      // Find by match of exact colors array elements
      let doc = await Palette.findOne({
        colors: { $all: seed.colors }
      });
      if (!doc) {
        await Palette.create(seed);
        console.log(`Seeded dynamic template: ${seed.name}`);
      } else if (doc.published !== true) {
        doc.published = true;
        await doc.save();
        console.log(`Updated seed template to published: ${doc.name}`);
      }
    }
  } catch (err) {
    console.error(`Failed to seed templates: ${err.message}`);
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await seedTemplates();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
