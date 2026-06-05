import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'

// ✅ FIX 1: Default value prevents crash when used outside Provider
export const AuthContext = createContext({
  user: null,
  loading: true,
  isAdmin: false,
  login: () => {},
  logout: () => {},
  updateUser: () => {}
})

// ✅ Custom hook — use this everywhere instead of useContext(AuthContext)
export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  // ✅ FIX 2: useRef prevents React 19 StrictMode double-run race condition
  const didRun = useRef(false)

  useEffect(() => {
    if (didRun.current) return
    didRun.current = true

    const restoreSession = async () => {
      const token     = localStorage.getItem('token')
      const savedUser = localStorage.getItem('user')

      if (!token || !savedUser) {
        setLoading(false)
        return
      }

      try {
        setUser(JSON.parse(savedUser))

        // ✅ FIX 3: Inline fetch — no circular import from api.js
        const res = await fetch(
          (import.meta.env.VITE_API_URL || 'http://localhost:5000/api') + '/auth/me',
          { headers: { Authorization: `Bearer ${token}` } }
        )

        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
          localStorage.setItem('user', JSON.stringify(data.user))
        } else {
          // Token invalid/expired
          throw new Error('Token invalid')
        }
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    restoreSession()
  }, [])

  const login = useCallback((userData, token) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAdmin: user?.role === 'admin',
      login,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  )
}
