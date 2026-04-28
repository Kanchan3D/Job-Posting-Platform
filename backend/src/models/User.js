const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  profile: {
    phone: String,
    location: String,
    resume: String,
    bio: String
  },
  // Resume file information
  resumeFile: {
    fileName: String,
    filePath: String,
    originalName: String,
    mimeType: String,
    size: Number,
    uploadedAt: Date
  },
  // Cached resume analysis
  resumeAnalysis: {
    extractedSkills: [String],
    experienceLevel: String,
    yearsOfExperience: Number,
    topStrengths: [String],
    technicalExpertise: [String],
    potentialGaps: [String],
    summary: String,
    analyzedAt: Date
  },
  // Rate limiting for analysis
  analysisUsage: {
    count: { type: Number, default: 0 },
    resetDate: Date
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password || !candidatePassword) {
    throw new Error('Password is missing');
  }
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
