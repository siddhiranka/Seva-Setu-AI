const express = require('express');
const router = express.Router();
const { getRecommendedSchemes, saveScheme, getSavedSchemes, unsaveScheme } = require('../controllers/schemeController');
const { protect } = require('../middleware/authMiddleware');

router.post('/recommend', protect, getRecommendedSchemes);
router.post('/save', protect, saveScheme);
router.get('/saved', protect, getSavedSchemes);
router.delete('/saved/:id', protect, unsaveScheme);

module.exports = router;
