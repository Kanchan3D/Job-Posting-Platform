import React, { useState } from 'react'
import { recommendationService } from '../services/api'

export default function ResumeUploadComponent({ onUploadSuccess, isLoading }) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleFileInputChange = (e) => {
    if (e.target.files.length > 0) {
      handleFileUpload(e.target.files[0])
    }
  }

  const handleFileUpload = async (file) => {
    setError(null)
    setUploadProgress(0)

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword']
    if (!allowedTypes.includes(file.type)) {
      setError('Only PDF and DOCX files are allowed')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    try {
      setUploadProgress(30)
      const response = await recommendationService.uploadResume(file)
      setUploadProgress(100)
      onUploadSuccess(response.data)
      setUploadProgress(0)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload resume')
      setUploadProgress(0)
    }
  }

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input
          type="file"
          id="resume-upload"
          onChange={handleFileInputChange}
          disabled={isLoading}
          className="hidden"
          accept=".pdf,.docx,.doc"
        />

        <label htmlFor="resume-upload" className="cursor-pointer">
          <div className="space-y-3">
            <div className="text-4xl">📄</div>
            <div className="text-lg font-semibold text-gray-700">
              {isLoading ? 'Uploading...' : 'Drag & drop your resume here'}
            </div>
            <div className="text-sm text-gray-500">
              or click to select a file
            </div>
            <div className="text-xs text-gray-400">
              PDF or DOCX, up to 5MB
            </div>
          </div>
        </label>

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">{uploadProgress}%</p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  )
}
