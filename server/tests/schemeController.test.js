const { getRecommendedSchemes } = require('../controllers/schemeController');
const SavedScheme = require('../models/SavedScheme');
const { recommendSchemes } = require('../services/geminiService');

// Mock dependencies
jest.mock('../models/SavedScheme');
jest.mock('../services/geminiService');

describe('Scheme Controller', () => {
  let req;
  let res;

  beforeEach(() => {
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

  describe('getRecommendedSchemes', () => {
    it('should return recommended schemes from gemini service', async () => {
      req.body = {
        age: 65,
        occupation: 'Retired',
        incomeRange: 'Low',
        isStudent: false,
        isSenior: true,
        location: 'Maharashtra',
        language: 'mr'
      };

      const mockRecommendations = [
        { schemeName: 'Senior Citizen Pension', benefits: 'Rs 1000/month' }
      ];

      recommendSchemes.mockResolvedValue(mockRecommendations);

      await getRecommendedSchemes(req, res);

      expect(recommendSchemes).toHaveBeenCalledWith(
        {
          age: 65,
          occupation: 'Retired',
          incomeRange: 'Low',
          isStudent: false,
          isSenior: true,
          location: 'Maharashtra'
        },
        'mr'
      );
      expect(res.json).toHaveBeenCalledWith(mockRecommendations);
    });

    it('should handle errors correctly', async () => {
      req.body.age = 20;
      recommendSchemes.mockRejectedValue(new Error('Gemini failed'));

      await getRecommendedSchemes(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error recommending schemes' });
    });
  });
});
