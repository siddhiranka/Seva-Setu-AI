const express = require('express');
const router = express.Router();
const multer = require('multer');
const { createComplaint, getComplaints, updateComplaint, deleteComplaint } = require('../controllers/complaintController');
const { protect } = require('../middleware/authMiddleware');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // limit size to 5MB
});

router.route('/')
  .post(protect, upload.single('image'), createComplaint)
  .get(protect, getComplaints);

router.route('/:id')
  .patch(protect, updateComplaint)
  .delete(protect, deleteComplaint);

module.exports = router;
