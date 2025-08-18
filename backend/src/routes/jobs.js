const express = require('express');
const { body } = require('express-validator');
const { 
  createJob, 
  getAllJobs, 
  getJobById, 
  updateJob, 
  deleteJob, 
  getMyJobs 
} = require('../controllers/jobController');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const jobValidation = [
  body('title').trim().isLength({ min: 3 }),
  body('company').trim().isLength({ min: 2 }),
  body('location').trim().isLength({ min: 2 }),
  body('description').trim().isLength({ min: 10 }),
  body('salary.min').isNumeric(),
  body('salary.max').isNumeric()
];

// Routes
router.get('/', getAllJobs);
router.get('/my-jobs', auth, getMyJobs);
router.get('/:id', getJobById);
router.post('/', adminAuth, jobValidation, createJob);
router.put('/:id', auth, jobValidation, updateJob);
router.delete('/:id', auth, deleteJob);

module.exports = router;
