const fs = require('fs');
const fileService = require('../services/fileService');
const geminiService = require('../services/geminiService');
const User = require('../models/User');
const Job = require('../models/Job');
const RecommendationAnalysis = require('../models/RecommendationAnalysis');
const Application = require('../models/Application');

/**
 * Upload resume and trigger analysis
 * POST /api/recommendations/upload-resume
 */
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const userId = req.user.userId;

    // Save resume file
    const fileInfo = await fileService.saveResumeFile(req.file, userId);

    // Read PDF buffer for direct analysis
    const pdfBuffer = fs.readFileSync(fileInfo.filePath);

    // Analyze resume PDF directly with Gemini Vision
    const resumeAnalysis = await geminiService.analyzeResumePDF(pdfBuffer);

    // Update user with resume info and analysis
    const user = await User.findByIdAndUpdate(
      userId,
      {
        resumeFile: {
          fileName: fileInfo.fileName,
          filePath: fileInfo.filePath,
          originalName: fileInfo.originalName,
          mimeType: fileInfo.mimeType,
          size: fileInfo.size,
          uploadedAt: fileInfo.uploadedAt
        },
        resumeAnalysis: {
          ...resumeAnalysis,
          analyzedAt: new Date()
        }
      },
      { new: true }
    );

    res.status(201).json({
      message: 'Resume uploaded and analyzed successfully',
      resumeAnalysis: user.resumeAnalysis,
      file: {
        originalName: fileInfo.originalName,
        size: fileInfo.size,
        uploadedAt: fileInfo.uploadedAt
      }
    });
  } catch (error) {
    console.error('Upload resume error:', error);
    res.status(500).json({ message: error.message || 'Failed to upload resume' });
  }
};

/**
 * Get job recommendations for user
 * GET /api/recommendations
 */
const getJobRecommendations = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user and their resume analysis
    const user = await User.findById(userId);
    if (!user || !user.resumeAnalysis) {
      return res.status(400).json({ message: 'Please upload resume first' });
    }

    // Check if we have cached recommendations (less than 24 hours old)
    const existingAnalysis = await RecommendationAnalysis.findOne({ user: userId });
    if (existingAnalysis && 
        new Date() - existingAnalysis.analyzedAt < 24 * 60 * 60 * 1000) {
      return res.json({
        message: 'Job recommendations (cached)',
        resumeAnalysis: existingAnalysis.resumeAnalysis,
        recommendations: existingAnalysis.jobRecommendations
      });
    }

    // Get all active jobs
    const allJobs = await Job.find({ status: 'active' }).populate('postedBy', 'firstName lastName');

    if (allJobs.length === 0) {
      return res.json({
        message: 'No jobs available',
        resumeAnalysis: user.resumeAnalysis,
        recommendations: []
      });
    }

    // Generate recommendations using Gemini
    const recommendations = await geminiService.generateRecommendations(
      user.resumeAnalysis,
      allJobs
    );

    // Cache recommendations
    await RecommendationAnalysis.findOneAndUpdate(
      { user: userId },
      {
        user: userId,
        resumeText: fileService.getResumeText(user.resumeFile?.filePath) || '',
        resumeAnalysis: user.resumeAnalysis,
        jobRecommendations: recommendations,
        analyzedAt: new Date()
      },
      { upsert: true }
    );

    res.json({
      message: 'Job recommendations generated',
      resumeAnalysis: user.resumeAnalysis,
      recommendations: recommendations.slice(0, 20) // Return top 20
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ message: error.message || 'Failed to get recommendations' });
  }
};

/**
 * Get detailed candidate analysis for specific job (admin view)
 * GET /api/recommendations/candidates/:jobId
 */
const getCandidatesForJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Verify admin or job poster access
    const job = await Job.findById(jobId).populate('postedBy');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user is admin or job poster
    if (job.postedBy._id.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Get all applications for this job with user data
    const applications = await Application.find({ job: jobId })
      .populate('applicant')
      .sort({ aiAnalysis: -1, createdAt: -1 });

    // Enrich applications with candidate analysis
    const candidatesWithAnalysis = await Promise.all(
      applications.map(async (app) => {
        // If AI analysis not present, generate it
        if (!app.aiAnalysis || !app.aiAnalysis.matchScore) {
          const applicant = app.applicant;
          if (applicant.resumeAnalysis) {
            const analysis = await geminiService.analyzeCandidateFit(
              applicant.resumeAnalysis,
              job,
              applicant
            );
            
            app.aiAnalysis = {
              matchScore: analysis.technicalFit * 10,
              cultureFit: analysis.cultureFit,
              technicalFit: analysis.technicalFit,
              experienceFit: analysis.experienceFit,
              hireable: analysis.hireable,
              nextSteps: analysis.nextSteps,
              interviewFocus: analysis.interviewFocus,
              redFlags: analysis.redFlags,
              analyzedAt: new Date()
            };
            
            await Application.findByIdAndUpdate(app._id, { aiAnalysis: app.aiAnalysis });
          }
        }

        return {
          applicationId: app._id,
          candidateName: `${app.applicant.firstName} ${app.applicant.lastName}`,
          candidateEmail: app.applicant.email,
          status: app.status,
          appliedAt: app.appliedAt,
          resumeAnalysis: app.applicant.resumeAnalysis,
          aiAnalysis: app.aiAnalysis,
          coverLetter: app.coverLetter
        };
      })
    );

    // Sort by match score descending
    candidatesWithAnalysis.sort((a, b) => 
      (b.aiAnalysis?.matchScore || 0) - (a.aiAnalysis?.matchScore || 0)
    );

    res.json({
      message: 'Candidates retrieved and ranked',
      job: {
        id: job._id,
        title: job.title,
        company: job.company,
        applicationCount: applications.length
      },
      candidates: candidatesWithAnalysis
    });
  } catch (error) {
    console.error('Get candidates error:', error);
    res.status(500).json({ message: error.message || 'Failed to get candidates' });
  }
};

/**
 * Get user's resume analysis
 * GET /api/recommendations/resume-analysis
 */
const getResumeAnalysis = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user || !user.resumeAnalysis) {
      return res.status(404).json({ message: 'No resume analysis found' });
    }

    res.json({
      message: 'Resume analysis retrieved',
      analysis: user.resumeAnalysis,
      fileInfo: user.resumeFile ? {
        originalName: user.resumeFile.originalName,
        uploadedAt: user.resumeFile.uploadedAt
      } : null
    });
  } catch (error) {
    console.error('Get resume analysis error:', error);
    res.status(500).json({ message: error.message || 'Failed to get resume analysis' });
  }
};

/**
 * Re-analyze resume (refresh recommendations)
 * POST /api/recommendations/analyze
 */
const reanalyzeResume = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user || !user.resumeFile) {
      return res.status(400).json({ message: 'No resume file found' });
    }

    // Read PDF buffer for direct analysis
    const pdfBuffer = fs.readFileSync(user.resumeFile.filePath);

    // Re-analyze with Gemini Vision
    const resumeAnalysis = await geminiService.analyzeResumePDF(pdfBuffer);

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        resumeAnalysis: {
          ...resumeAnalysis,
          analyzedAt: new Date()
        }
      },
      { new: true }
    );

    // Clear cached recommendations to force refresh
    await RecommendationAnalysis.deleteOne({ user: userId });

    res.json({
      message: 'Resume re-analyzed successfully',
      analysis: updatedUser.resumeAnalysis
    });
  } catch (error) {
    console.error('Re-analyze error:', error);
    res.status(500).json({ message: error.message || 'Failed to re-analyze resume' });
  }
};

/**
 * Delete user's resume
 * DELETE /api/recommendations/resume
 */
const deleteResume = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user || !user.resumeFile) {
      return res.status(404).json({ message: 'No resume found' });
    }

    // Delete file from filesystem
    await fileService.deleteResumeFile(user.resumeFile.filePath);

    // Clear user resume data
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $unset: {
          resumeFile: 1,
          resumeAnalysis: 1
        }
      },
      { new: true }
    );

    // Clear cached recommendations
    await RecommendationAnalysis.deleteOne({ user: userId });

    res.json({
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({ message: error.message || 'Failed to delete resume' });
  }
};

module.exports = {
  uploadResume,
  getJobRecommendations,
  getCandidatesForJob,
  getResumeAnalysis,
  reanalyzeResume,
  deleteResume
};
