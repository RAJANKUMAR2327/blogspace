import { createContext, useState, useEffect, useContext } from 'react'
import axios from 'axios'

// 1. Create the context
export const AuthContext = createContext()

// Helper function to safely parse localStorage on initial load
const getInitialUser = () => {
  const token = localStorage.getItem('token')
  const savedUser = localStorage.getItem('user')
  
  if (token && savedUser) {
    try {
      // Set the axios token immediately during initialization
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      return JSON.parse(savedUser)
    } catch {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      return null
    }
  }
  return null
}

export function AuthProvider({ children }) {
  // 2. Initialize state synchronously (No more useEffect cascading renders!)
  const [user, setUser] = useState(getInitialUser)
  const [loading, setLoading] = useState(false) // Can default to false since we check sync

  const login = (userData, token) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

// 3. Custom hook for easier consumption across your app
export const useAuth = () => useContext(AuthContext)