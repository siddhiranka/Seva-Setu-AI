const mongoose = require('mongoose');

const SavedSchemeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  schemeTitle: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  benefits: {
    type: String,
  },
  eligibility: {
    type: String,
  },
  applySteps: {
    type: [String],
    default: [],
  },
  savedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('SavedScheme', SavedSchemeSchema);
