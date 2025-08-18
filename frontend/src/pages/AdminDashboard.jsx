import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { jobService } from '../services/api'
import { Plus, Briefcase, Users, FileText, MapPin, DollarSign, Edit, Trash2, Eye } from 'lucide-react'

const AdminDashboard = () => {
  // Fetch admin's jobs
  const { data: myJobsData, isLoading: jobsLoading } = useQuery(
    'myJobs',
    () => jobService.getMyJobs(),
    {
      onError: (error) => {
        console.error('Error fetching jobs:', error)
      }
    }
  )

  const jobs = myJobsData?.data?.jobs || []
  const totalJobs = jobs.length
  const activeJobs = jobs.filter(job => job.isActive).length
  const totalApplications = jobs.reduce((sum, job) => sum + (job.applicationCount || 0), 0)

  const formatSalary = (salary) => {
    if (salary.min === salary.max) {
      return `$${salary.min.toLocaleString()}`
    }
    return `$${salary.min.toLocaleString()} - $${salary.max.toLocaleString()}`
  }

  const getJobTypeColor = (type) => {
    const colors = {
      'full-time': 'bg-green-100 text-green-800',
      'part-time': 'bg-blue-100 text-blue-800',
      'contract': 'bg-yellow-100 text-yellow-800',
      'freelance': 'bg-purple-100 text-purple-800',
      'internship': 'bg-orange-100 text-orange-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your job postings and applications</p>
          </div>
          <Link
            to="/admin/create-job"
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Post New Job</span>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-primary-100">
                <Briefcase className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Total Jobs</h3>
                <p className="text-3xl font-bold text-primary-600">{totalJobs}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Total Applications</h3>
                <p className="text-3xl font-bold text-green-600">{totalApplications}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Active Jobs</h3>
                <p className="text-3xl font-bold text-blue-600">{activeJobs}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Your Job Postings</h2>
          </div>
          
          <div className="p-6">
            {jobsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading jobs...</p>
              </div>
            ) : jobs.length > 0 ? (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div key={job._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getJobTypeColor(job.jobType)}`}>
                            {job.jobType.replace('-', ' ')}
                          </span>
                          {!job.isActive && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Inactive
                            </span>
                          )}
                        </div>
                        
                        <p className="text-lg font-medium text-gray-700 mb-2">{job.company}</p>
                        
                        <div className="flex items-center space-x-4 text-gray-600 mb-3">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4" />
                            <span>{formatSalary(job.salary)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{job.applicationCount || 0} applications</span>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 line-clamp-2">{job.description}</p>
                      </div>
                      
                      <div className="ml-6 flex space-x-2">
                        <Link
                          to={`/jobs/${job._id}`}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"
                          title="View Job"
                        >
                          <Eye className="h-5 w-5" />
                        </Link>
                        <button
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                          title="Edit Job"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          title="Delete Job"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No jobs posted yet</h3>
                <p className="text-gray-600 mb-6">Start by creating your first job posting</p>
                <Link
                  to="/admin/create-job"
                  className="btn-primary inline-flex items-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span>Post Your First Job</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
