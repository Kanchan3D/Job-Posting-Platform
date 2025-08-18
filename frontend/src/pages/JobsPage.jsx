import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { jobService } from '../services/api'
import { Search, MapPin, Clock, DollarSign } from 'lucide-react'

const JobsPage = () => {
  const [searchParams, setSearchParams] = useState({
    search: '',
    location: '',
    jobType: '',
    experienceLevel: '',
    page: 1
  })

  const {
    data: jobsData,
    isLoading,
    error
  } = useQuery(
    ['jobs', searchParams],
    () => jobService.getAllJobs(searchParams),
    {
      keepPreviousData: true
    }
  )

  const handleSearch = (e) => {
    e.preventDefault()
    setSearchParams(prev => ({ ...prev, page: 1 }))
  }

  const formatSalary = (salary) => {
    if (salary.min === salary.max) {
      return `$${salary.min.toLocaleString()}`
    }
    return `$${salary.min.toLocaleString()} - $${salary.max.toLocaleString()}`
  }

  const getJobTypeColor = (type) => {
    const colors = {
      'full-time': 'badge-green',
      'part-time': 'badge-blue',
      'contract': 'badge-yellow',
      'freelance': 'badge-red',
      'internship': 'badge-blue'
    }
    return colors[type] || 'badge-blue'
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error loading jobs</h2>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Find Your Dream Job</h1>
          
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title or Keywords
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchParams.search}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10 input-field"
                    placeholder="e.g. Frontend Developer"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchParams.location}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, location: e.target.value }))}
                    className="pl-10 input-field"
                    placeholder="e.g. New York"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Type
                </label>
                <select
                  value={searchParams.jobType}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, jobType: e.target.value }))}
                  className="input-field"
                >
                  <option value="">All Types</option>
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="freelance">Freelance</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex space-x-4">
                <select
                  value={searchParams.experienceLevel}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, experienceLevel: e.target.value }))}
                  className="input-field"
                >
                  <option value="">All Levels</option>
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                  <option value="executive">Executive</option>
                </select>
              </div>
              
              <button type="submit" className="btn-primary">
                Search Jobs
              </button>
            </div>
          </form>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading jobs...</p>
          </div>
        ) : (
          <div>
            {jobsData?.data?.jobs?.length > 0 ? (
              <>
                <div className="mb-6">
                  <p className="text-gray-600">
                    Showing {jobsData.data.jobs.length} of {jobsData.data.pagination.totalJobs} jobs
                  </p>
                </div>
                
                <div className="space-y-4">
                  {jobsData.data.jobs.map((job) => (
                    <div key={job._id} className="card hover:shadow-lg transition-shadow duration-200">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900">
                              <Link 
                                to={`/jobs/${job._id}`}
                                className="hover:text-primary-600 transition-colors duration-200"
                              >
                                {job.title}
                              </Link>
                            </h3>
                            <span className={`badge ${getJobTypeColor(job.jobType)}`}>
                              {job.jobType.replace('-', ' ')}
                            </span>
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
                              <Clock className="h-4 w-4" />
                              <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          <p className="text-gray-600 line-clamp-2">{job.description}</p>
                        </div>
                        
                        <div className="ml-6">
                          <Link 
                            to={`/jobs/${job._id}`}
                            className="btn-outline"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {jobsData.data.pagination.totalPages > 1 && (
                  <div className="mt-8 flex justify-center space-x-2">
                    {jobsData.data.pagination.hasPrev && (
                      <button
                        onClick={() => setSearchParams(prev => ({ ...prev, page: prev.page - 1 }))}
                        className="btn-secondary"
                      >
                        Previous
                      </button>
                    )}
                    
                    <span className="px-4 py-2 text-gray-600">
                      Page {jobsData.data.pagination.currentPage} of {jobsData.data.pagination.totalPages}
                    </span>
                    
                    {jobsData.data.pagination.hasNext && (
                      <button
                        onClick={() => setSearchParams(prev => ({ ...prev, page: prev.page + 1 }))}
                        className="btn-secondary"
                      >
                        Next
                      </button>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">No jobs found matching your criteria.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default JobsPage
