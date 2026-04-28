const mongoose = require('mongoose');

const recommendationAnalysisSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  resumeText: {
    type: String,
    required: true
  },
  resumeAnalysis: {
    extractedSkills: [String],
    experienceLevel: String,
    yearsOfExperience: Number,
    topStrengths: [String],
    technicalExpertise: [String],
    potentialGaps: [String],
    summary: String
  },
  jobRecommendations: [{
    jobId: mongoose.Schema.Types.ObjectId,
    title: String,
    company: String,
    matchScore: Number,
    matchReasoning: String,
    matchedSkills: [String],
    missingSkills: [String],
    strengths: [String],
    concerns: [String],
    recommendation: String
  }],
  analyzedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries and auto-deletion of old analyses (30 days)
recommendationAnalysisSchema.index({ user: 1 });
recommendationAnalysisSchema.index({ analyzedAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days

module.exports = mongoose.model('RecommendationAnalysis', recommendationAnalysisSchema);
