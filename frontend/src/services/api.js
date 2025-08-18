import axios from 'axios'
import { clearUserCache } from '../utils/cacheUtils'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear user cache when unauthorized
      clearUserCache()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth services
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
}

// Job services
export const jobService = {
  getAllJobs: (params = {}) => api.get('/jobs', { params }),
  getJobById: (id) => api.get(`/jobs/${id}`),
  createJob: (jobData) => api.post('/jobs', jobData),
  updateJob: (id, jobData) => api.put(`/jobs/${id}`, jobData),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
  getMyJobs: (params = {}) => api.get('/jobs/my-jobs', { params }),
}

// Application services
export const applicationService = {
  createApplication: (applicationData) => api.post('/applications', applicationData),
  getMyApplications: (params = {}) => api.get('/applications/my-applications', { params }),
  getJobApplications: (jobId, params = {}) => api.get(`/applications/job/${jobId}`, { params }),
  updateApplicationStatus: (applicationId, status) => 
    api.put(`/applications/${applicationId}/status`, { status }),
  deleteApplication: (applicationId) => api.delete(`/applications/${applicationId}`),
  checkApplicationStatus: (jobId) => api.get(`/applications/job/${jobId}/status`),
}

export default api
