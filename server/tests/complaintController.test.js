const { createComplaint } = require('../controllers/complaintController');
const Complaint = require('../models/Complaint');
const { getComplaintSummary } = require('../services/geminiService');

// Mock dependencies
jest.mock('../models/Complaint');
jest.mock('../services/geminiService');
jest.mock('../config/cloudinary', () => ({
  uploader: {
    upload_stream: jest.fn((options, callback) => {
      // Mock stream behavior not needed if we simulate req without file, 
      // but let's leave a dummy for now.
      return { end: jest.fn() };
    })
  }
}));

describe('Complaint Controller', () => {
  let req;
  let res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      body: {},
      user: {
        _id: 'user123'
      }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('createComplaint', () => {
    it('should return 400 if unstructuredComplaint is missing', async () => {
      await createComplaint(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Complaint description/transcription is required' });
    });

    it('should structure complaint via Gemini and save it', async () => {
      req.body.unstructuredComplaint = 'Street lights are broken in my area';
      req.body.language = 'en';

      const mockSummary = {
        department: 'Electricity Board',
        issue: 'Broken Street Lights',
        description: 'Street lights are broken in my area',
        priority: 'High',
        suggestedSubject: 'Request to fix street lights'
      };

      getComplaintSummary.mockResolvedValue(mockSummary);

      const mockComplaint = {
        _id: 'comp123',
        userId: 'user123',
        ...mockSummary,
        status: 'Pending',
        imageUrl: ''
      };

      Complaint.create.mockResolvedValue(mockComplaint);

      await createComplaint(req, res);

      expect(getComplaintSummary).toHaveBeenCalledWith('Street lights are broken in my area', 'en');
      expect(Complaint.create).toHaveBeenCalledWith({
        userId: 'user123',
        department: 'Electricity Board',
        issue: 'Broken Street Lights',
        description: 'Street lights are broken in my area',
        priority: 'High',
        suggestedSubject: 'Request to fix street lights',
        imageUrl: '',
        status: 'Pending'
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockComplaint);
    });

    it('should return 500 if an error occurs', async () => {
      req.body.unstructuredComplaint = 'Garbage everywhere';
      getComplaintSummary.mockRejectedValue(new Error('API failure'));

      await createComplaint(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error creating complaint' });
    });
  });
});
