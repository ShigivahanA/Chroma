const express = require('express');
const router = express.Router();
const {
  getPalettes,
  getPaletteById,
  createPalette,
  likePalette,
  generateRandomPalette,
  bulkImportPalettes
} = require('../controllers/paletteController');

router.get('/generate/random', generateRandomPalette);
router.post('/bulk-import', bulkImportPalettes);

router.route('/')
  .get(getPalettes)
  .post(createPalette);

router.route('/:id')
  .get(getPaletteById);

router.route('/:id/like')
  .put(likePalette);

module.exports = router;
