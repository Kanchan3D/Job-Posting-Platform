import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import JobsPage from './pages/JobsPage'
import JobDetailPage from './pages/JobDetailPage'
import MyApplicationsPage from './pages/MyApplicationsPage'
import AdminDashboard from './pages/AdminDashboard'
import CreateJobPage from './pages/CreateJobPage'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="jobs" element={<JobsPage />} />
        <Route path="jobs/:id" element={<JobDetailPage />} />
        
        {/* Public routes */}
        <Route 
          path="login" 
          element={!user ? <LoginPage /> : <Navigate to="/jobs" replace />} 
        />
        <Route 
          path="register" 
          element={!user ? <RegisterPage /> : <Navigate to="/jobs" replace />} 
        />
        
        {/* Protected routes */}
        <Route 
          path="my-applications" 
          element={user ? <MyApplicationsPage /> : <Navigate to="/login" replace />} 
        />
        
        {/* Admin routes */}
        <Route 
          path="admin" 
          element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="admin/create-job" 
          element={user?.role === 'admin' ? <CreateJobPage /> : <Navigate to="/" replace />} 
        />
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
