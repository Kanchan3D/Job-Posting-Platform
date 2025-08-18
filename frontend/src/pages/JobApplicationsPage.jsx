import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { ArrowLeft, Mail, Calendar, FileText, ExternalLink, ChevronDown } from 'lucide-react'
import { applicationService } from '../services/api'

const JobApplicationsPage = () => {
  const { jobId } = useParams()
  const [statusFilter, setStatusFilter] = useState('all')
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery(
    ['jobApplications', jobId],
    () => applicationService.getJobApplications(jobId)
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
  
  const filteredApplications = statusFilter === 'all' 
    ? applications 
    : applications.filter(app => app.status === statusFilter)

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
