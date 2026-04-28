import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { ArrowLeft, Mail, Calendar, FileText, ExternalLink, ChevronDown, Zap } from 'lucide-react'
import { applicationService, recommendationService } from '../services/api'

const JobApplicationsPage = () => {
  const { jobId } = useParams()
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortByAI, setSortByAI] = useState(false)
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery(
    ['jobApplications', jobId],
    () => applicationService.getJobApplications(jobId)
  )

  // Fetch AI ranked candidates
  const { data: aiData } = useQuery(
    ['aiCandidates', jobId],
    () => recommendationService.getCandidatesForJob(jobId),
    { 
      enabled: !!jobId,
      staleTime: 5 * 60 * 1000 // 5 minutes
    }
  )

  const updateStatusMutation = useMutation(
    ({ applicationId, status }) => applicationService.updateApplicationStatus(applicationId, status),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['jobApplications', jobId])
      }
    }
  )

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading applications...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-600 text-lg">Error loading applications</p>
        <p className="text-gray-600 mt-2">Please try again later</p>
      </div>
    </div>
  )

  const { applications = [], job } = data?.data || {}
  
  // Build map of AI candidates for quick lookup
  const aiCandidatesMap = {}
  if (aiData?.data?.candidates) {
    aiData.data.candidates.forEach(candidate => {
      aiCandidatesMap[candidate.applicationId] = candidate
    })
  }

  // Merge applications with AI data
  const applicationsWithAI = applications.map(app => ({
    ...app,
    aiAnalysis: aiCandidatesMap[app._id]?.aiAnalysis
  }))
  
  let filteredApplications = statusFilter === 'all' 
    ? applicationsWithAI 
    : applicationsWithAI.filter(app => app.status === statusFilter)

  // Sort by AI match score if enabled
  if (sortByAI) {
    filteredApplications = [...filteredApplications].sort((a, b) =>
      (b.aiAnalysis?.matchScore || 0) - (a.aiAnalysis?.matchScore || 0)
    )
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'reviewed': return 'bg-blue-100 text-blue-800'
      case 'shortlisted': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'hired': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleStatusChange = (applicationId, newStatus) => {
    updateStatusMutation.mutate({ applicationId, status: newStatus })
  }

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'reviewed', label: 'Reviewed' },
    { value: 'shortlisted', label: 'Shortlisted' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'hired', label: 'Hired' }
  ]

  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Applications</h1>
            <div className="text-gray-600">
              <h2 className="text-xl font-semibold">{job?.title}</h2>
              <p className="mt-1">{job?.company}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div 
            className={`bg-white rounded-lg shadow-md p-4 cursor-pointer transition-colors ${
              statusFilter === 'all' ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setStatusFilter('all')}
          >
            <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
            <p className="text-gray-600 text-sm">Total</p>
          </div>
          {statusOptions.map(status => (
            <div 
              key={status.value}
              className={`bg-white rounded-lg shadow-md p-4 cursor-pointer transition-colors ${
                statusFilter === status.value ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setStatusFilter(status.value)}
            >
              <p className="text-2xl font-bold text-gray-900">{statusCounts[status.value] || 0}</p>
              <p className="text-gray-600 text-sm">{status.label}</p>
            </div>
          ))}
        </div>

        {/* Sort Options */}
        {aiData?.data?.candidates && (
          <div className="mb-6 flex items-center">
            <button
              onClick={() => setSortByAI(!sortByAI)}
              className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                sortByAI 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Zap className="w-4 h-4 mr-2" />
              {sortByAI ? 'Sorted by AI Match' : 'Sort by AI Match'}
            </button>
            <span className="ml-3 text-sm text-gray-600">
              AI analysis available for {aiData.data.candidates.length} candidates
            </span>
          </div>
        )}

        {/* Applications List */}
        <div className="space-y-6">
          {filteredApplications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {statusFilter === 'all' ? 'No Applications Yet' : `No ${statusFilter} Applications`}
              </h3>
              <p className="text-gray-600">
                {statusFilter === 'all' 
                  ? 'No one has applied for this job yet.' 
                  : `No applications with ${statusFilter} status.`
                }
              </p>
            </div>
          ) : (
            filteredApplications.map((application) => (
              <div key={application._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-xl font-semibold text-gray-900 mr-3">
                        {application.applicant?.firstName} {application.applicant?.lastName}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-gray-600 mb-2">
                      <Mail className="w-4 h-4 mr-2" />
                      <a
                        href={`mailto:${application.applicant?.email}`}
                        className="text-blue-600 hover:text-blue-700 underline"
                      >
                        {application.applicant?.email}
                      </a>
                    </div>
                    
                    <div className="flex items-center text-gray-600 text-sm">
                      <Calendar className="w-4 h-4 mr-2" />
                      Applied {formatDate(application.appliedAt)}
                    </div>

                    {/* AI Analysis */}
                    {application.aiAnalysis && (
                      <div className="mt-3 flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Zap className="w-4 h-4 text-amber-500" />
                          <span className="text-sm font-medium text-gray-700">AI Match:</span>
                          <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold">
                            {application.aiAnalysis?.matchScore || application.aiAnalysis?.technicalFit * 10 || 'N/A'}%
                          </div>
                        </div>
                        {application.aiAnalysis?.hireable && (
                          <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                            Recommended
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-6">
                    <div className="relative">
                      <select
                        value={application.status}
                        onChange={(e) => handleStatusChange(application._id, e.target.value)}
                        className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={updateStatusMutation.isLoading}
                      >
                        {statusOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 absolute right-2 top-3 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Cover Letter */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Cover Letter:</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">{application.coverLetter}</p>
                  </div>
                </div>

                {/* Resume */}
                {application.resumeUrl && application.resumeUrl !== 'Not provided' && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Resume:</h4>
                    <a
                      href={application.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 underline"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      View Resume
                    </a>
                  </div>
                )}

                {/* Application Timeline */}
                <div className="border-t pt-4">
                  <div className="text-sm text-gray-500">
                    <p>Applied: {formatDate(application.appliedAt)}</p>
                    {application.updatedAt !== application.appliedAt && (
                      <p>Last updated: {formatDate(application.updatedAt)}</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default JobApplicationsPage
