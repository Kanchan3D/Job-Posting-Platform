import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import { MapPin, DollarSign, Clock, Users, Briefcase, Award, CheckCircle, Calendar } from 'lucide-react'
import { jobService, applicationService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import JobApplicationModal from '../components/JobApplicationModal'

const JobDetailPage = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  
  const { data, isLoading, error } = useQuery(
    ['job', id],
    () => jobService.getJobById(id)
  )

  const { data: applicationStatus } = useQuery(
    ['applicationStatus', id],
    () => applicationService.checkApplicationStatus(id),
    {
      enabled: !!user && !!id,
      retry: false
    }
  )

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading job details...</p>
      </div>
    </div>
  )
  
  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-600 text-lg">Error loading job details</p>
        <p className="text-gray-600 mt-2">Please try again later</p>
      </div>
    </div>
  )

  const job = data?.data?.job
  const hasApplied = applicationStatus?.data?.hasApplied

  const handleApplyClick = () => {
    if (!user) {
      alert('Please login to apply for jobs')
      return
    }
    setShowApplicationModal(true)
  }

  const formatSalary = (salary) => {
    if (!salary) return 'Not specified'
    const { min, max, currency = 'USD' } = salary
    if (min && max) {
      return `$${min.toLocaleString()} - $${max.toLocaleString()} ${currency}`
    }
    return 'Competitive salary'
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">{job?.title}</h1>
                <p className="text-xl text-blue-100 mb-4">{job?.company}</p>
                <div className="flex flex-wrap gap-4 text-blue-100">
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    {job?.location}
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" />
                    {formatSalary(job?.salary)}
                  </div>
                  <div className="flex items-center">
                    <Briefcase className="w-5 h-5 mr-2" />
                    {job?.jobType || 'Full-time'}
                  </div>
                  <div className="flex items-center">
                    <Award className="w-5 h-5 mr-2" />
                    {job?.experienceLevel || 'Not specified'}
                  </div>
                </div>
              </div>
              
              {/* Apply Button */}
              <div className="flex flex-col items-end">
                {hasApplied ? (
                  <div className="bg-green-100 text-green-800 px-6 py-3 rounded-lg flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Applied
                  </div>
                ) : (
                  <button
                    onClick={handleApplyClick}
                    className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                  >
                    Apply Now
                  </button>
                )}
                <div className="flex items-center text-blue-100 mt-3 text-sm">
                  <Calendar className="w-4 h-4 mr-1" />
                  Posted {formatDate(job?.createdAt)}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Job Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{job?.applicationCount || 0}</p>
                <p className="text-gray-600">Applications</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{job?.jobType || 'Full-time'}</p>
                <p className="text-gray-600">Job Type</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <Award className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{job?.experienceLevel || 'Any'}</p>
                <p className="text-gray-600">Experience</p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Description</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {job?.description || 'No description available.'}
                </p>
              </div>
            </div>

            {/* Requirements */}
            {job?.requirements && job.requirements.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Requirements</h2>
                <ul className="space-y-2">
                  {job.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            {job?.benefits && job.benefits.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Benefits</h2>
                <ul className="space-y-2">
                  {job.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Apply Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Interested in this position?
              </h3>
              <p className="text-gray-600 mb-4">
                Join our team and be part of something amazing!
              </p>
              {hasApplied ? (
                <div className="bg-green-100 text-green-800 px-6 py-3 rounded-lg inline-flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Application Submitted
                  {applicationStatus?.data?.appliedAt && (
                    <span className="ml-2 text-sm">
                      on {formatDate(applicationStatus.data.appliedAt)}
                    </span>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleApplyClick}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Apply Now
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Application Modal */}
      <JobApplicationModal
        isOpen={showApplicationModal}
        onClose={() => setShowApplicationModal(false)}
        job={job}
      />
    </div>
  )
}

export default JobDetailPage
