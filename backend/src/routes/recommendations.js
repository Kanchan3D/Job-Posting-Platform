const express = require('express');
const multer = require('multer');
const path = require('path');
const { auth } = require('../middleware/auth');
const recommendationController = require('../controllers/recommendationController');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '../../uploads/resumes');
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    // Allow PDF and DOCX files
    const allowedMimes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'application/x-docx'
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed'), false);
    }
  }
});

// Routes
// Specific routes first
// Get candidates for job (admin) - GET /api/recommendations/candidates/:jobId
router.get('/candidates/:jobId', auth, recommendationController.getCandidatesForJob);

// Get resume analysis - GET /api/recommendations/resume-analysis
router.get('/resume-analysis', auth, recommendationController.getResumeAnalysis);

// General routes after specific ones
// Upload resume - POST /api/recommendations/upload-resume
router.post('/upload-resume', auth, upload.single('resume'), recommendationController.uploadResume);

// Get job recommendations - GET /api/recommendations
router.get('/', auth, recommendationController.getJobRecommendations);

// Re-analyze resume - POST /api/recommendations/analyze
router.post('/analyze', auth, recommendationController.reanalyzeResume);

// Delete resume - DELETE /api/recommendations/resume
router.delete('/resume', auth, recommendationController.deleteResume);

module.exports = router;
