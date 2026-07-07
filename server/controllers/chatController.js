const Chat = require('../models/Chat');
const { getChatResponse, getDocumentChecklist } = require('../services/geminiService');

// @desc    Send chat message to Gemini AI and get response
// @route   POST /api/chat
// @access  Private
const sendChatMessage = async (req, res) => {
  const { prompt, language } = req.body;
  const userId = req.user._id;

  if (!prompt) {
    return res.status(400).json({ message: 'Prompt is required' });
  }

  const selectedLanguage = language || req.user.preferredLanguage || 'en';

  try {
    const aiData = await getChatResponse(prompt, selectedLanguage);

    const chat = await Chat.create({
      userId,
      prompt,
      response: aiData.response,
      simpleResponse: aiData.simpleResponse,
      bulletSummary: aiData.bulletSummary,
      language: selectedLanguage,
    });

    res.status(201).json(chat);
  } catch (error) {
    console.error('Chat controller error:', error.message);
    res.status(500).json({ message: 'Error processing chat message' });
  }
};

// @desc    Get user chat history
// @route   GET /api/chat/history
// @access  Private
const getChatHistory = async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(20);
    res.json(chats);
  } catch (error) {
    console.error('Chat history error:', error.message);
    res.status(500).json({ message: 'Error retrieving chat history' });
  }
};

// @desc    Generate document checklist for a service
// @route   POST /api/chat/checklist
// @access  Private
const getServiceChecklist = async (req, res) => {
  const { service, language } = req.body;
  const selectedLanguage = language || req.user.preferredLanguage || 'en';

  if (!service) {
    return res.status(400).json({ message: 'Service name is required' });
  }

  try {
    const checklist = await getDocumentChecklist(service, selectedLanguage);
    res.json(checklist);
  } catch (error) {
    console.error('Checklist controller error:', error.message);
    res.status(500).json({ message: 'Error generating checklist' });
  }
};

// @desc    Delete a specific chat message
// @route   DELETE /api/chat/:id
// @access  Private
const deleteChat = async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId: req.user._id });
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    await chat.deleteOne();
    res.json({ message: 'Chat removed' });
  } catch (error) {
    console.error('Delete chat error:', error.message);
    res.status(500).json({ message: 'Error deleting chat' });
  }
};

module.exports = {
  sendChatMessage,
  getChatHistory,
  getServiceChecklist,
  deleteChat,
};
