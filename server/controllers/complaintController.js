const Complaint = require('../models/Complaint');
const { getComplaintSummary } = require('../services/geminiService');
const cloudinary = require('../config/cloudinary');

// Helper to upload image buffer to Cloudinary
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'seva_setu_complaints' },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return reject(error);
        }
        resolve(result.secure_url);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

// @desc    Create a new complaint (analyzes via Gemini, uploads photo if any)
// @route   POST /api/complaint
// @access  Private
const createComplaint = async (req, res) => {
  const { unstructuredComplaint, language } = req.body;
  const userId = req.user._id;

  if (!unstructuredComplaint) {
    return res.status(400).json({ message: 'Complaint description/transcription is required' });
  }

  try {
    let imageUrl = '';
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer);
    }

    // Use Gemini to structure the complaint
    const summary = await getComplaintSummary(unstructuredComplaint, language || 'en');

    const complaint = await Complaint.create({
      userId,
      department: summary.department || 'Municipal Administration',
      issue: summary.issue || 'Civic Grievance',
      description: summary.description || unstructuredComplaint,
      priority: summary.priority || 'Medium',
      suggestedSubject: summary.suggestedSubject || 'Grievance Redressal Request',
      imageUrl,
      status: 'Pending',
    });

    res.status(201).json(complaint);
  } catch (error) {
    console.error('Create complaint error:', error.message);
    res.status(500).json({ message: 'Error creating complaint' });
  }
};

// @desc    Get user complaints
// @route   GET /api/complaint
// @access  Private
const getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    console.error('Get complaints error:', error.message);
    res.status(500).json({ message: 'Error fetching complaints' });
  }
};

// @desc    Update complaint status (simulated review/resolve updates)
// @route   PATCH /api/complaint/:id
// @access  Private
const updateComplaint = async (req, res) => {
  const { status, priority, department, issue, description } = req.body;

  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Ensure user owns complaint
    if (complaint.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    if (status) complaint.status = status;
    if (priority) complaint.priority = priority;
    if (department) complaint.department = department;
    if (issue) complaint.issue = issue;
    if (description) complaint.description = description;

    const updatedComplaint = await complaint.save();
    res.json(updatedComplaint);
  } catch (error) {
    console.error('Update complaint error:', error.message);
    res.status(500).json({ message: 'Error updating complaint' });
  }
};

// @desc    Delete a complaint
// @route   DELETE /api/complaint/:id
// @access  Private
const deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Ensure user owns complaint
    if (complaint.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await complaint.deleteOne();
    res.json({ message: 'Complaint removed successfully' });
  } catch (error) {
    console.error('Delete complaint error:', error.message);
    res.status(500).json({ message: 'Error deleting complaint' });
  }
};

module.exports = {
  createComplaint,
  getComplaints,
  updateComplaint,
  deleteComplaint,
};
