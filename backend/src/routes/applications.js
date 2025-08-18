const express = require('express');
const { body } = require('express-validator');
const { 
  createApplication, 
  getMyApplications, 
  getJobApplications, 
  updateApplicationStatus, 
  deleteApplication 
} = require('../controllers/applicationController');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const applicationValidation = [
  body('jobId').isMongoId(),
  body('resumeUrl').isURL(),
  body('coverLetter').trim().isLength({ min: 10, max: 1000 })
];

// Routes
router.post('/', auth, applicationValidation, createApplication);
router.get('/my-applications', auth, getMyApplications);
router.get('/job/:jobId', auth, getJobApplications);
router.put('/:applicationId/status', auth, updateApplicationStatus);
router.delete('/:applicationId', auth, deleteApplication);

module.exports = router;
