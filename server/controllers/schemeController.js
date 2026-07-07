const SavedScheme = require('../models/SavedScheme');
const { recommendSchemes } = require('../services/geminiService');

// @desc    Recommend government schemes based on user demographic factors
// @route   POST /api/schemes/recommend
// @access  Private
const getRecommendedSchemes = async (req, res) => {
  const { age, occupation, incomeRange, isStudent, isSenior, location, language } = req.body;
  const selectedLanguage = language || req.user.preferredLanguage || 'en';

  try {
    const recommendations = await recommendSchemes(
      { age, occupation, incomeRange, isStudent, isSenior, location },
      selectedLanguage
    );
    res.json(recommendations);
  } catch (error) {
    console.error('Recommend schemes controller error:', error.message);
    res.status(500).json({ message: 'Error recommending schemes' });
  }
};

// @desc    Bookmark/Save a recommended scheme
// @route   POST /api/schemes/save
// @access  Private
const saveScheme = async (req, res) => {
  const { schemeTitle, description, benefits, eligibility, applySteps } = req.body;
  const userId = req.user._id;

  if (!schemeTitle) {
    return res.status(400).json({ message: 'Scheme title is required' });
  }

  try {
    // Check if already saved
    const exists = await SavedScheme.findOne({ userId, schemeTitle });
    if (exists) {
      return res.status(400).json({ message: 'Scheme is already saved' });
    }

    const saved = await SavedScheme.create({
      userId,
      schemeTitle,
      description,
      benefits,
      eligibility,
      applySteps: applySteps || [],
    });

    res.status(201).json(saved);
  } catch (error) {
    console.error('Save scheme controller error:', error.message);
    res.status(500).json({ message: 'Error saving scheme' });
  }
};

// @desc    Get user's bookmarked schemes
// @route   GET /api/schemes/saved
// @access  Private
const getSavedSchemes = async (req, res) => {
  try {
    const saved = await SavedScheme.find({ userId: req.user._id }).sort({ savedAt: -1 });
    res.json(saved);
  } catch (error) {
    console.error('Get saved schemes controller error:', error.message);
    res.status(500).json({ message: 'Error fetching saved schemes' });
  }
};

// @desc    Remove a bookmarked scheme
// @route   DELETE /api/schemes/saved/:id
// @access  Private
const unsaveScheme = async (req, res) => {
  try {
    const scheme = await SavedScheme.findById(req.params.id);

    if (!scheme) {
      return res.status(404).json({ message: 'Saved scheme not found' });
    }

    // Ensure user owns scheme
    if (scheme.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await scheme.deleteOne();
    res.json({ message: 'Scheme removed from saved list' });
  } catch (error) {
    console.error('Unsave scheme controller error:', error.message);
    res.status(500).json({ message: 'Error removing saved scheme' });
  }
};

module.exports = {
  getRecommendedSchemes,
  saveScheme,
  getSavedSchemes,
  unsaveScheme,
};
