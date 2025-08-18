import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from 'react-query'
import { jobService } from '../services/api'
import toast from 'react-hot-toast'
import { Briefcase, MapPin, DollarSign, FileText, Users, Clock } from 'lucide-react'

const CreateJobPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm()

  const createJobMutation = useMutation(jobService.createJob, {
    onSuccess: () => {
      queryClient.invalidateQueries('jobs')
      toast.success('Job posted successfully!')
      reset()
      navigate('/admin')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create job')
    }
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      // Convert salary to numbers and structure the data
      const jobData = {
        ...data,
        salary: {
          min: parseInt(data.minSalary),
          max: parseInt(data.maxSalary),
          currency: 'USD'
        },
        requirements: data.requirements ? data.requirements.split('\n').filter(req => req.trim()) : [],
        benefits: data.benefits ? data.benefits.split('\n').filter(benefit => benefit.trim()) : []
      }
      
      // Remove the individual salary fields
      delete jobData.minSalary
      delete jobData.maxSalary
      
      await createJobMutation.mutateAsync(jobData)
    } catch (error) {
      console.error('Error creating job:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Job Posting</h1>
          <p className="text-gray-600">Fill in the details below to post a new job opportunity</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Job Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Briefcase className="inline h-4 w-4 mr-1" />
                Job Title *
              </label>
              <input
                {...register('title', {
                  required: 'Job title is required',
                  minLength: { value: 3, message: 'Title must be at least 3 characters' }
                })}
                type="text"
                className="input-field"
                placeholder="e.g. Senior Frontend Developer"
                style={{ backgroundColor: '#ffffff', color: '#1f2937' }}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Company */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Users className="inline h-4 w-4 mr-1" />
                Company *
              </label>
              <input
                {...register('company', {
                  required: 'Company name is required',
                  minLength: { value: 2, message: 'Company name must be at least 2 characters' }
                })}
                type="text"
                className="input-field"
                placeholder="e.g. Tech Solutions Inc."
                style={{ backgroundColor: '#ffffff', color: '#1f2937' }}
              />
              {errors.company && (
                <p className="mt-1 text-sm text-red-600">{errors.company.message}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="inline h-4 w-4 mr-1" />
                Location *
              </label>
              <input
                {...register('location', {
                  required: 'Location is required',
                  minLength: { value: 2, message: 'Location must be at least 2 characters' }
                })}
                type="text"
                className="input-field"
                placeholder="e.g. New York, NY or Remote"
                style={{ backgroundColor: '#ffffff', color: '#1f2937' }}
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
              )}
            </div>

            {/* Salary Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <DollarSign className="inline h-4 w-4 mr-1" />
                Salary Range (USD) *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Minimum Salary</label>
                  <input
                    {...register('minSalary', {
                      required: 'Minimum salary is required',
                      min: { value: 1000, message: 'Minimum salary must be at least $1,000' }
                    })}
                    type="number"
                    className="input-field"
                    placeholder="50000"
                    style={{ backgroundColor: '#ffffff', color: '#1f2937' }}
                  />
                  {errors.minSalary && (
                    <p className="mt-1 text-sm text-red-600">{errors.minSalary.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Maximum Salary</label>
                  <input
                    {...register('maxSalary', {
                      required: 'Maximum salary is required',
                      min: { value: 1000, message: 'Maximum salary must be at least $1,000' }
                    })}
                    type="number"
                    className="input-field"
                    placeholder="80000"
                    style={{ backgroundColor: '#ffffff', color: '#1f2937' }}
                  />
                  {errors.maxSalary && (
                    <p className="mt-1 text-sm text-red-600">{errors.maxSalary.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Job Type and Experience Level */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Job Type
                </label>
                <select
                  {...register('jobType')}
                  className="input-field"
                  style={{ backgroundColor: '#ffffff', color: '#1f2937' }}
                >
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="freelance">Freelance</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experience Level
                </label>
                <select
                  {...register('experienceLevel')}
                  className="input-field"
                  style={{ backgroundColor: '#ffffff', color: '#1f2937' }}
                >
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                  <option value="executive">Executive</option>
                </select>
              </div>
            </div>

            {/* Job Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FileText className="inline h-4 w-4 mr-1" />
                Job Description *
              </label>
              <textarea
                {...register('description', {
                  required: 'Job description is required',
                  minLength: { value: 50, message: 'Description must be at least 50 characters' }
                })}
                rows={6}
                className="input-field"
                placeholder="Describe the role, responsibilities, and what you're looking for in a candidate..."
                style={{ backgroundColor: '#ffffff', color: '#1f2937' }}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Requirements (Optional)
              </label>
              <textarea
                {...register('requirements')}
                rows={4}
                className="input-field"
                placeholder="Enter each requirement on a new line&#10;• Bachelor's degree in Computer Science&#10;• 3+ years of React experience&#10;• Strong communication skills"
                style={{ backgroundColor: '#ffffff', color: '#1f2937' }}
              />
              <p className="mt-1 text-sm text-gray-500">Enter each requirement on a new line</p>
            </div>

            {/* Benefits */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Benefits (Optional)
              </label>
              <textarea
                {...register('benefits')}
                rows={4}
                className="input-field"
                placeholder="Enter each benefit on a new line&#10;• Health insurance&#10;• 401(k) matching&#10;• Flexible work hours&#10;• Remote work options"
                style={{ backgroundColor: '#ffffff', color: '#1f2937' }}
              />
              <p className="mt-1 text-sm text-gray-500">Enter each benefit on a new line</p>
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-4 pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Job...
                  </div>
                ) : (
                  'Post Job'
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateJobPage
