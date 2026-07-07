const express = require('express');
const router = express.Router();
const { sendChatMessage, getChatHistory, getServiceChecklist, deleteChat } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, sendChatMessage);
router.get('/history', protect, getChatHistory);
router.post('/checklist', protect, getServiceChecklist);
router.delete('/:id', protect, deleteChat);

module.exports = router;
