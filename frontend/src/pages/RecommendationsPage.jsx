import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ResumeUploadComponent from '../components/ResumeUploadComponent'
import { recommendationService, applicationService } from '../services/api'

export default function RecommendationsPage() {
  const navigate = useNavigate()
  const [uploadedResume, setUploadedResume] = useState(false)
  const [resumeAnalysis, setResumeAnalysis] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [appliedJobs, setAppliedJobs] = useState(new Set())

  useEffect(() => {
    fetchResumeAnalysis()
  }, [])

  const fetchResumeAnalysis = async () => {
    try {
      const response = await recommendationService.getResumeAnalysis()
      setResumeAnalysis(response.data.analysis)
      setUploadedResume(true)
      await fetchRecommendations()
    } catch (err) {
      // No resume uploaded yet
      setUploadedResume(false)
    }
  }

  const fetchRecommendations = async () => {
    setLoading(true)
    try {
      const response = await recommendationService.getJobRecommendations()
      setRecommendations(response.data.recommendations)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch recommendations')
    } finally {
      setLoading(false)
    }
  }

  const handleUploadSuccess = (data) => {
    setResumeAnalysis(data.resumeAnalysis)
    setUploadedResume(true)
    setError(null)
    // Fetch recommendations after upload
    setTimeout(() => fetchRecommendations(), 1000)
  }

  const handleReanalyze = async () => {
    setLoading(true)
    try {
      await recommendationService.reanalyzeResume()
      setResumeAnalysis(null)
      setRecommendations([])
      await fetchResumeAnalysis()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to re-analyze resume')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteResume = async () => {
    if (!window.confirm('Are you sure you want to delete your resume? You can upload a new one anytime.')) {
      return
    }
    try {
      await recommendationService.deleteResume()
      setResumeAnalysis(null)
      setRecommendations([])
      setUploadedResume(false)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete resume')
    }
  }

  const handleApplyToJob = async (jobId) => {
    try {
      await applicationService.createApplication({
        job: jobId,
        resumeUrl: 'AI Upload',
        coverLetter: 'Recommended by AI matching system'
      })
      setAppliedJobs(prev => new Set(prev).add(jobId))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to apply to job')
    }
  }

  const getMatchColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50'
    return 'text-orange-600 bg-orange-50'
  }

  const getMatchBgColor = (score) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-yellow-500'
    return 'bg-orange-500'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AI Job Recommendations</h1>
          <p className="text-gray-600 mt-2">
            Upload your resume and let our AI find the best job matches for you
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Resume Upload Section */}
        {!uploadedResume ? (
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Upload Your Resume</h2>
            <ResumeUploadComponent 
              onUploadSuccess={handleUploadSuccess} 
              isLoading={loading}
            />
          </div>
        ) : (
          <>
            {/* Resume Analysis Section */}
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Your Profile Analysis</h2>
                  <p className="text-gray-600 text-sm mt-1">Last analyzed: {new Date(resumeAnalysis?.analyzedAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleReanalyze}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 text-sm font-medium"
                  >
                    Re-analyze
                  </button>
                  <button
                    onClick={handleDeleteResume}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                  >
                    Delete Resume
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Experience Level */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Experience Level</h3>
                  <p className="text-lg text-blue-600 font-semibold capitalize">
                    {resumeAnalysis?.experienceLevel}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {resumeAnalysis?.yearsOfExperience} years of experience
                  </p>
                </div>

                {/* Skills */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Top Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {resumeAnalysis?.extractedSkills?.slice(0, 5).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                    {resumeAnalysis?.extractedSkills?.length > 5 && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                        +{resumeAnalysis.extractedSkills.length - 5} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Strengths */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Strengths</h3>
                  <ul className="space-y-1">
                    {resumeAnalysis?.topStrengths?.map((strength, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Potential Gaps */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Areas to Develop</h3>
                  <ul className="space-y-1">
                    {resumeAnalysis?.potentialGaps?.map((gap, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start">
                        <span className="text-yellow-500 mr-2">→</span>
                        {gap}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Professional Summary */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Professional Summary</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {resumeAnalysis?.summary}
                </p>
              </div>
            </div>

            {/* Recommendations Section */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Recommended Jobs ({recommendations.length})
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  Based on your profile and skills
                </p>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin">
                    <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full"></div>
                  </div>
                  <p className="text-gray-600 mt-4">Analyzing jobs...</p>
                </div>
              ) : recommendations.length > 0 ? (
                <div className="space-y-4">
                  {recommendations.map((job) => (
                    <div key={job.jobId} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                          <p className="text-gray-600">{job.company} • {job.location}</p>
                          {job.salary && (
                            <p className="text-sm text-green-600 font-medium mt-1">
                              ${job.salary.min?.toLocaleString()} - ${job.salary.max?.toLocaleString()}
                            </p>
                          )}
                        </div>

                        {/* Match Score */}
                        <div className="flex flex-col items-center">
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${getMatchColor(job.matchScore)}`}>
                            <div className="text-center">
                              <div className="text-2xl font-bold">{job.matchScore}</div>
                              <div className="text-xs font-medium">Match</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-gray-700 mb-3">{job.matchReasoning}</p>

                        <div className="grid grid-cols-2 gap-4">
                          {/* Matched Skills */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">Matched Skills</h4>
                            <div className="flex flex-wrap gap-2">
                              {job.matchedSkills?.slice(0, 3).map((skill, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Missing Skills */}
                          {job.missingSkills?.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 mb-2">Could Learn</h4>
                              <div className="flex flex-wrap gap-2">
                                {job.missingSkills?.slice(0, 3).map((skill, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Strengths & Concerns */}
                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <p className="font-semibold text-green-700 mb-1">✓ Why you fit:</p>
                          <ul className="space-y-1">
                            {job.strengths?.slice(0, 2).map((str, idx) => (
                              <li key={idx} className="text-gray-700">{str}</li>
                            ))}
                          </ul>
                        </div>
                        {job.concerns?.length > 0 && (
                          <div>
                            <p className="font-semibold text-yellow-700 mb-1">⚠ Considerations:</p>
                            <ul className="space-y-1">
                              {job.concerns?.slice(0, 2).map((con, idx) => (
                                <li key={idx} className="text-gray-700">{con}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => navigate(`/jobs/${job.jobId}`)}
                          className="flex-1 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleApplyToJob(job.jobId)}
                          disabled={appliedJobs.has(job.jobId)}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
                        >
                          {appliedJobs.has(job.jobId) ? 'Applied' : 'Apply Now'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">No job recommendations available yet.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
