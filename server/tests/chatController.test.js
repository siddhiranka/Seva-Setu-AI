const { sendChatMessage, getServiceChecklist } = require('../controllers/chatController');
const Chat = require('../models/Chat');
const { getChatResponse, getDocumentChecklist } = require('../services/geminiService');

// Mock dependencies
jest.mock('../models/Chat');
jest.mock('../services/geminiService');

describe('Chat Controller', () => {
  let req;
  let res;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    req = {
      body: {},
      user: {
        _id: 'user123',
        preferredLanguage: 'en'
      }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('sendChatMessage', () => {
    it('should return 400 if prompt is missing', async () => {
      await sendChatMessage(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Prompt is required' });
    });

    it('should return 500 if geminiService throws an error', async () => {
      req.body.prompt = 'Hello';
      getChatResponse.mockRejectedValue(new Error('API Error'));

      await sendChatMessage(req, res);

      expect(getChatResponse).toHaveBeenCalledWith('Hello', 'en');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error processing chat message' });
    });

    it('should save and return chat if successful', async () => {
      req.body.prompt = 'How to get a passport?';
      
      const mockAiResponse = {
        response: 'Go to passport seva portal.',
        simpleResponse: 'Apply online.',
        bulletSummary: ['Apply online', 'Pay fee']
      };
      
      getChatResponse.mockResolvedValue(mockAiResponse);
      
      const mockSavedChat = {
        _id: 'chat123',
        userId: 'user123',
        prompt: 'How to get a passport?',
        ...mockAiResponse,
        language: 'en'
      };
      
      Chat.create.mockResolvedValue(mockSavedChat);

      await sendChatMessage(req, res);

      expect(getChatResponse).toHaveBeenCalledWith('How to get a passport?', 'en');
      expect(Chat.create).toHaveBeenCalledWith({
        userId: 'user123',
        prompt: 'How to get a passport?',
        response: mockAiResponse.response,
        simpleResponse: mockAiResponse.simpleResponse,
        bulletSummary: mockAiResponse.bulletSummary,
        language: 'en'
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockSavedChat);
    });
  });

  describe('getServiceChecklist', () => {
    it('should return 400 if service is missing', async () => {
      await getServiceChecklist(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Service name is required' });
    });

    it('should return checklist from geminiService', async () => {
      req.body.service = 'Aadhaar';
      const mockChecklist = { documents: ['Proof of Identity', 'Proof of Address'] };
      
      getDocumentChecklist.mockResolvedValue(mockChecklist);

      await getServiceChecklist(req, res);

      expect(getDocumentChecklist).toHaveBeenCalledWith('Aadhaar', 'en');
      expect(res.json).toHaveBeenCalledWith(mockChecklist);
    });
  });
});
