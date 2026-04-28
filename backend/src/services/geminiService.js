const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
const visionModel = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

/**
 * Analyze resume PDF directly using Gemini Vision and extract structured insights
 * @param {Buffer} pdfBuffer - PDF file buffer
 * @returns {Promise<Object>} Resume analysis with skills, experience, strengths, gaps
 */
const analyzeResumePDF = async (pdfBuffer) => {
  try {
    const base64PDF = pdfBuffer.toString('base64');
    
    const prompt = `Analyze this resume PDF and provide structured insights in JSON format.

Please analyze the resume and return a JSON object with the following structure:
{
  "extractedSkills": ["skill1", "skill2", "skill3", ...],
  "experienceLevel": "entry|junior|mid|senior|expert",
  "yearsOfExperience": <number>,
  "topStrengths": ["strength1", "strength2", "strength3"],
  "technicalExpertise": ["tech1", "tech2", ...],
  "potentialGaps": ["gap1", "gap2"],
  "summary": "Brief professional summary",
  "jobTitle": "Current or most recent job title if available",
  "education": "Education level and relevant degrees"
}

Be specific and accurate. Extract all skills mentioned, assess experience level based on work history, and identify both strengths and areas for improvement.`;

    const result = await visionModel.generateContent([
      {
        inlineData: {
          data: base64PDF,
          mimeType: 'application/pdf',
        },
      },
      prompt,
    ]);
    
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse Gemini response');
    }
    
    const analysis = JSON.parse(jsonMatch[0]);
    return analysis;
  } catch (error) {
    console.error('Error analyzing resume PDF with Gemini:', error);
    throw new Error(`Failed to analyze resume: ${error.message}`);
  }
};

/**
 * Analyze resume content and extract structured insights (fallback for text)
 * @param {string} resumeText - Extracted text from resume
 * @returns {Promise<Object>} Resume analysis with skills, experience, strengths, gaps
 */
const analyzeResume = async (resumeText) => {
  try {
    const prompt = `Analyze the following resume and provide structured insights in JSON format.

Resume:
${resumeText}

Please analyze and return a JSON object with the following structure:
{
  "extractedSkills": ["skill1", "skill2", ...],
  "experienceLevel": "entry|junior|mid|senior|expert",
  "yearsOfExperience": <number>,
  "topStrengths": ["strength1", "strength2", "strength3"],
  "technicalExpertise": ["tech1", "tech2", ...],
  "potentialGaps": ["gap1", "gap2"],
  "summary": "Brief professional summary"
}

Be specific and accurate. If information is unclear, make reasonable inferences.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse Gemini response');
    }
    
    const analysis = JSON.parse(jsonMatch[0]);
    return analysis;
  } catch (error) {
    console.error('Error analyzing resume with Gemini:', error);
    throw new Error(`Failed to analyze resume: ${error.message}`);
  }
};

/**
 * Score job match between resume and job description
 * @param {Object} resumeAnalysis - Analyzed resume data
 * @param {Object} job - Job object with description and requirements
 * @returns {Promise<Object>} Match score and reasoning
 */
const scoreJobMatch = async (resumeAnalysis, job) => {
  try {
    const prompt = `You are an expert recruiter. Score the match between a candidate's resume and a job posting.

Candidate Profile:
Skills: ${resumeAnalysis.extractedSkills.join(', ')}
Experience Level: ${resumeAnalysis.experienceLevel}
Years of Experience: ${resumeAnalysis.yearsOfExperience}
Top Strengths: ${resumeAnalysis.topStrengths.join(', ')}
Technical Expertise: ${resumeAnalysis.technicalExpertise.join(', ')}

Job Details:
Title: ${job.title}
Company: ${job.company}
Description: ${job.description}
Requirements: ${job.requirements.join(', ')}
Benefits: ${job.benefits.join(', ')}
Experience Level Required: ${job.experienceLevel}

Provide a JSON response with:
{
  "matchScore": <0-100>,
  "matchReasoning": "Explanation of why this score",
  "matchedSkills": ["skill1", "skill2", ...],
  "missingSkills": ["skill1", "skill2", ...],
  "strengths": ["why candidate is good fit"],
  "concerns": ["potential concerns"],
  "recommendation": "brief recommendation"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse job match response');
    }
    
    const match = JSON.parse(jsonMatch[0]);
    return match;
  } catch (error) {
    console.error('Error scoring job match:', error);
    throw new Error(`Failed to score job match: ${error.message}`);
  }
};

/**
 * Generate personalized job recommendations
 * @param {Object} resumeAnalysis - Analyzed resume data
 * @param {Array} allJobs - Array of job objects
 * @returns {Promise<Array>} Ranked jobs with scores
 */
const generateRecommendations = async (resumeAnalysis, allJobs) => {
  try {
    if (!allJobs || allJobs.length === 0) {
      return [];
    }

    // Score each job
    const scoredJobs = await Promise.all(
      allJobs.map(async (job) => {
        try {
          const match = await scoreJobMatch(resumeAnalysis, job);
          return {
            jobId: job._id,
            title: job.title,
            company: job.company,
            location: job.location,
            salary: job.salary,
            ...match
          };
        } catch (error) {
          console.error(`Error scoring job ${job._id}:`, error);
          return {
            jobId: job._id,
            title: job.title,
            company: job.company,
            location: job.location,
            matchScore: 0,
            matchReasoning: 'Error calculating match'
          };
        }
      })
    );

    // Sort by match score descending
    return scoredJobs.sort((a, b) => b.matchScore - a.matchScore);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    throw new Error(`Failed to generate recommendations: ${error.message}`);
  }
};

/**
 * Analyze candidate fit for specific job (admin view)
 * @param {Object} resumeAnalysis - Resume analysis data
 * @param {Object} job - Job object
 * @param {Object} userProfile - User profile data
 * @returns {Promise<Object>} Detailed candidate analysis
 */
const analyzeCandidateFit = async (resumeAnalysis, job, userProfile) => {
  try {
    const prompt = `As a senior recruiter, provide a detailed candidate assessment for hiring decision.

Candidate:
Name: ${userProfile.firstName} ${userProfile.lastName}
Email: ${userProfile.email}
Profile: ${JSON.stringify(resumeAnalysis)}

Job Opening:
Title: ${job.title}
Company: ${job.company}
Description: ${job.description}
Requirements: ${job.requirements.join(', ')}

Provide a JSON response with:
{
  "overallAssessment": "Quick assessment",
  "cultureFit": <0-10>,
  "technicalFit": <0-10>,
  "experienceFit": <0-10>,
  "hireable": true|false,
  "nextSteps": ["action1", "action2"],
  "interviewFocus": ["topic1", "topic2"],
  "redFlags": ["flag1"],
  "certifications": "any relevant certs to ask about"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse candidate fit response');
    }
    
    const fit = JSON.parse(jsonMatch[0]);
    return fit;
  } catch (error) {
    console.error('Error analyzing candidate fit:', error);
    throw new Error(`Failed to analyze candidate fit: ${error.message}`);
  }
};

module.exports = {
  analyzeResume,
  analyzeResumePDF,
  scoreJobMatch,
  generateRecommendations,
  analyzeCandidateFit
};
