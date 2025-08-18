import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { MapPin, Calendar, DollarSign, Briefcase, Eye, Trash2 } from 'lucide-react'
import { applicationService } from '../services/api'

const MyApplicationsPage = () => {
  const { data, isLoading, error } = useQuery(
    ['myApplications'],
    () => applicationService.getMyApplications()
  )

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your applications...</p>
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

  const applications = data?.data?.applications || []

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
      day: 'numeric'
    })
  }

  const formatSalary = (salary) => {
    if (!salary) return 'Not specified'
    const { min, max, currency = 'USD' } = salary
    if (min && max) {
      return `$${min.toLocaleString()} - $${max.toLocaleString()}`
    }
    return 'Competitive'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Applications</h1>
          <p className="text-gray-600">Track the status of your job applications</p>
        </div>

        {/* Applications List */}
        {applications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Briefcase className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Applications Yet</h3>
            <p className="text-gray-600 mb-6">You haven't applied for any jobs yet. Start exploring opportunities!</p>
            <Link
              to="/jobs"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              Browse Jobs
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {applications.map((application) => (
              <div key={application._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {application.job?.title}
                    </h3>
                    <p className="text-lg text-gray-700 mb-1">{application.job?.company}</p>
                    <div className="flex flex-wrap gap-4 text-gray-600 text-sm">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {application.job?.location}
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {formatSalary(application.job?.salary)}
                      </div>
                      <div className="flex items-center">
                        <Briefcase className="w-4 h-4 mr-1" />
                        {application.job?.jobType || 'Full-time'}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Applied {formatDate(application.appliedAt)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Cover Letter Preview */}
                {application.coverLetter && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Cover Letter:</h4>
                    <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">
                      {application.coverLetter.length > 200 
                        ? `${application.coverLetter.substring(0, 200)}...` 
                        : application.coverLetter
                      }
                    </p>
                  </div>
                )}

                {/* Resume Link */}
                {application.resumeUrl && application.resumeUrl !== 'Not provided' && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Resume:</h4>
                    <a
                      href={application.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm underline"
                    >
                      View Resume
                    </a>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="text-sm text-gray-500">
                    Status updated: {formatDate(application.updatedAt)}
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/jobs/${application.job?._id}`}
                      className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Job
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyApplicationsPage
