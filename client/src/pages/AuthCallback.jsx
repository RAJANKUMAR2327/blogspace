import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'

// GitHub OAuth lands here: server/controllers/authController.js's
// githubCallback redirects to `${CLIENT_URL}/auth/callback?token=${token}`.
// We only get a bare token (no user object), so we stash it, ask /auth/me
// for the profile, then finish logging in the same way Login.jsx does.
export default function AuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { login } = useContext(AuthContext)
  const ranRef = useRef(false)

  useEffect(() => {
    if (ranRef.current) return // StrictMode double-invoke guard
    ranRef.current = true

    const token = searchParams.get('token')
    const error = searchParams.get('error')

    if (error) {
      toast.error('GitHub sign-in failed. Please try again.')
      navigate('/login', { replace: true })
      return
    }

    if (!token) {
      navigate('/login', { replace: true })
      return
    }

    ;(async () => {
      try {
        // getMe() reads the token via the request interceptor, which pulls
        // from localStorage — so it must be set before this call fires.
        localStorage.setItem('token', token)
        const res = await authAPI.getMe()
        login(res.data.user, token)
        toast.success(`Welcome, ${res.data.user.name.split(' ')[0]}!`)
        navigate(res.data.user.role === 'admin' ? '/admin' : '/', { replace: true })
      } catch (err) {
        localStorage.removeItem('token')
        toast.error('Sign-in failed. Please try again.')
        navigate('/login', { replace: true })
      }
    })()
  }, [searchParams, navigate, login])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 16,
      background: 'var(--bg-page)', fontFamily: 'var(--font-ui)'
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        .auth-callback-spinner {
          width: 32px; height: 32px; border-radius: 50%;
          border: 3px solid var(--border-soft); border-top-color: var(--accent);
          animation: spin 0.8s linear infinite;
        }
      `}</style>
      <div className="auth-callback-spinner" />
      <p style={{ color: 'var(--text-tertiary)', fontSize: 14 }}>Signing you in…</p>
      <Link to="/login" style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
        Taking too long? Back to login
      </Link>
    </div>
  )
}
