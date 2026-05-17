const mongoose = require('mongoose');

const paletteSchema = new mongoose.Schema({
  colors: {
    type: [String],
    required: true,
    validate: {
      validator: function (v) {
        return v && v.length > 0;
      },
      message: 'A palette must have at least one color.'
    }
  },
  name: {
    type: String,
    default: 'Untitled Palette'
  },
  likes: {
    type: Number,
    default: 0
  },
  tags: {
    type: [String],
    default: []
  },
  likedIPs: {
    type: [String],
    default: []
  },
  published: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Palette', paletteSchema);
