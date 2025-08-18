import { createContext, useContext, useReducer, useEffect } from 'react'
import { useQueryClient } from 'react-query'
import { authService } from '../services/api'
import { clearUserCache } from '../utils/cacheUtils'

const AuthContext = createContext()

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_USER':
      return { ...state, user: action.payload, loading: false }
    case 'SET_TOKEN':
      return { ...state, token: action.payload }
    case 'LOGOUT':
      return { user: null, token: null, loading: false }
    default:
      return state
  }
}

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient()
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: localStorage.getItem('token'),
    loading: true
  })

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const response = await authService.getProfile()
          dispatch({ type: 'SET_USER', payload: response.data.user })
        } catch (error) {
          console.log('🔄 Token invalid, clearing cache...')
          // Clear React Query cache
          queryClient.clear()
          // Clear user cache
          clearUserCache()
          dispatch({ type: 'LOGOUT' })
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    initAuth()
  }, [queryClient])

  const login = async (email, password) => {
    try {
      const response = await authService.login({ email, password })
      const { token, user } = response.data
      
      localStorage.setItem('token', token)
      dispatch({ type: 'SET_TOKEN', payload: token })
      dispatch({ type: 'SET_USER', payload: user })
      
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      }
    }
  }

  const register = async (userData) => {
    try {
      const response = await authService.register(userData)
      const { token, user } = response.data
      
      localStorage.setItem('token', token)
      dispatch({ type: 'SET_TOKEN', payload: token })
      dispatch({ type: 'SET_USER', payload: user })
      
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      }
    }
  }

  const logout = () => {
    console.log('🔄 Starting logout process...')
    
    // Clear React Query cache
    console.log('🗑️ Clearing React Query cache...')
    queryClient.clear()
    
    // Clear user-related cache and storage
    console.log('🗑️ Clearing user cache and storage...')
    clearUserCache()
    
    // Dispatch logout action
    console.log('📤 Dispatching logout action...')
    dispatch({ type: 'LOGOUT' })
    
    console.log('✅ Logout process completed!')
  }

  const value = {
    user: state.user,
    token: state.token,
    loading: state.loading,
    login,
    register,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
