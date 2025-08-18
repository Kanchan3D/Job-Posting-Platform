import { useState } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { X, Upload, FileText } from 'lucide-react'
import { applicationService } from '../services/api'

const JobApplicationModal = ({ isOpen, onClose, job }) => {
  const [formData, setFormData] = useState({
    coverLetter: '',
    resumeUrl: ''
  })
  const [errors, setErrors] = useState({})

  const queryClient = useQueryClient()

  const applyMutation = useMutation(
    (applicationData) => applicationService.createApplication(applicationData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['applicationStatus', job._id])
        queryClient.invalidateQueries(['job', job._id])
        onClose()
        setFormData({ coverLetter: '', resumeUrl: '' })
        alert('Application submitted successfully!')
      },
      onError: (error) => {
        const errorMessage = error.response?.data?.message || 'Failed to submit application'
        setErrors({ submit: errorMessage })
      }
    }
  )

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validation
    const newErrors = {}
    if (!formData.coverLetter.trim()) {
      newErrors.coverLetter = 'Cover letter is required'
    } else if (formData.coverLetter.length < 10) {
      newErrors.coverLetter = 'Cover letter must be at least 10 characters'
    } else if (formData.coverLetter.length > 1000) {
      newErrors.coverLetter = 'Cover letter must be less than 1000 characters'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Submit application
    applyMutation.mutate({
      jobId: job._id,
      coverLetter: formData.coverLetter,
      resumeUrl: formData.resumeUrl || 'Not provided'
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Apply for Position</h2>
            <p className="text-gray-600 mt-1">{job?.title} at {job?.company}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Cover Letter */}
          <div>
            <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 mb-2">
              Cover Letter *
            </label>
            <div className="relative">
              <FileText className="absolute top-3 left-3 w-5 h-5 text-gray-400" />
              <textarea
                id="coverLetter"
                name="coverLetter"
                value={formData.coverLetter}
                onChange={handleInputChange}
                rows={8}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                  errors.coverLetter ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Why are you interested in this position? What makes you a great fit?"
                required
              />
            </div>
            {errors.coverLetter && (
              <p className="text-red-500 text-sm mt-1">{errors.coverLetter}</p>
            )}
            <p className="text-gray-500 text-sm mt-1">
              {formData.coverLetter.length}/1000 characters
            </p>
          </div>

          {/* Resume URL */}
          <div>
            <label htmlFor="resumeUrl" className="block text-sm font-medium text-gray-700 mb-2">
              Resume/CV URL (optional)
            </label>
            <div className="relative">
              <Upload className="absolute top-3 left-3 w-5 h-5 text-gray-400" />
              <input
                type="url"
                id="resumeUrl"
                name="resumeUrl"
                value={formData.resumeUrl}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.resumeUrl ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="https://drive.google.com/file/your-resume"
              />
            </div>
            {errors.resumeUrl && (
              <p className="text-red-500 text-sm mt-1">{errors.resumeUrl}</p>
            )}
            <p className="text-gray-500 text-sm mt-1">
              Link to your resume on Google Drive, Dropbox, or your portfolio website
            </p>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={applyMutation.isLoading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {applyMutation.isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Submitting...
                </div>
              ) : (
                'Submit Application'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default JobApplicationModal
