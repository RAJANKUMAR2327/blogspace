import { createContext, useState, useEffect, useContext } from 'react'
import { authAPI } from '../services/api'

// 1. Create the context
export const AuthContext = createContext()

// Helper function to safely parse localStorage on initial load
const getInitialUser = () => {
  const token = localStorage.getItem('token')
  const savedUser = localStorage.getItem('user')

  if (token && savedUser) {
    try {
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

  // Note: the token itself is only ever attached to requests via the scoped
  // `API` axios instance's interceptor in services/api.js (reads it fresh
  // from localStorage on every call). We deliberately don't set it as a
  // global default on the bare `axios` module here — that would silently
  // attach the user's bearer token to ANY plain `axios.get(...)` call
  // anywhere in the app, including requests to third-party URLs.
  const login = (userData, token) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  // Revokes the refresh token server-side (so it can't be used to silently
  // mint new access tokens later) and clears the httpOnly cookie, THEN
  // clears local state. Local state is still cleared even if the network
  // call fails (e.g. offline), so the user is never stuck unable to sign out.
  const logout = async () => {
    try {
      await authAPI.logout()
    } catch {
      // best-effort — proceed to clear local session regardless
    }
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  // Merges a partial update into the cached user (e.g. after enabling 2FA)
  // without needing a full re-login. Keeps localStorage in sync too, so a
  // page refresh doesn't show stale data.
  const updateUser = (partial) => {
    setUser(prev => {
      const updated = { ...prev, ...(typeof partial === 'function' ? partial(prev) : partial) }
      localStorage.setItem('user', JSON.stringify(updated))
      return updated
    })
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

// 3. Custom hook for easier consumption across your app
export const useAuth = () => useContext(AuthContext)