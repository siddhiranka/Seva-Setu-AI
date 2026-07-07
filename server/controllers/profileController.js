const User = require('../models/User');
const Complaint = require('../models/Complaint');
const SavedScheme = require('../models/SavedScheme');
const Chat = require('../models/Chat');
const bcrypt = require('bcryptjs');

// @desc    Get user profile data including stats
// @route   GET /api/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user statistics
    const totalComplaints = await Complaint.countDocuments({ userId: req.user._id });
    const totalSavedSchemes = await SavedScheme.countDocuments({ userId: req.user._id });
    const totalChats = await Chat.countDocuments({ userId: req.user._id });

    // Fetch recent items for display
    const recentComplaints = await Complaint.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(3);
      
    const recentSavedSchemes = await SavedScheme.find({ userId: req.user._id })
      .sort({ savedAt: -1 })
      .limit(3);

    res.json({
      user,
      stats: {
        totalComplaints,
        totalSavedSchemes,
        totalChats,
      },
      recentComplaints,
      recentSavedSchemes,
    });
  } catch (error) {
    console.error('Get profile error:', error.message);
    res.status(500).json({ message: 'Error retrieving profile data' });
  }
};

// @desc    Update user profile details
// @route   PUT /api/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.preferredLanguage = req.body.preferredLanguage || user.preferredLanguage;

    if (req.body.password) {
      user.password = req.body.password; // pre-save hook will hash it automatically
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      preferredLanguage: updatedUser.preferredLanguage,
    });
  } catch (error) {
    console.error('Update profile error:', error.message);
    res.status(500).json({ message: 'Error updating profile data' });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
};
