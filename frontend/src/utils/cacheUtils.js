// Utility function to clear all user-related cache and storage
export const clearUserCache = () => {
  // Clear specific localStorage items
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('authData')
  
  // Clear sessionStorage items that might contain user data
  sessionStorage.removeItem('userSession')
  sessionStorage.removeItem('jobFilters')
  sessionStorage.removeItem('applicationDrafts')
  
  // Clear any other user-specific storage items
  localStorage.removeItem('userPreferences')
  localStorage.removeItem('recentJobs')
  localStorage.removeItem('savedJobs')
  
  console.log('User cache cleared successfully')
}

// Clear all application cache
export const clearAppCache = () => {
  clearUserCache()
  
  // Clear all localStorage if needed (use with caution)
  // localStorage.clear()
  
  // Clear all sessionStorage
  sessionStorage.clear()
  
  console.log('Application cache cleared successfully')
}

// Clear specific cache keys
export const clearCacheByKeys = (keys) => {
  keys.forEach(key => {
    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
  })
  
  console.log(`Cleared cache for keys: ${keys.join(', ')}`)
}

export default { clearUserCache, clearAppCache, clearCacheByKeys }
