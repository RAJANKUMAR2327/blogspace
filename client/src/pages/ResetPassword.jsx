import { useState, useContext } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi'

export default function ResetPassword() {
  const { token }   = useParams()
  const { login }   = useContext(AuthContext)
  const navigate    = useNavigate()

  const [formData, setFormData]         = useState({ password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]           = useState(false)

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match')
    }
    if (formData.password.length < 6) {
      return toast.error('Password must be at least 6 characters')
    }

    setLoading(true)
    try {
      // authAPI.resetPassword(token, password) wraps password into { password }
      // itself — passing an object here (as this used to) double-nests the body
      // and corrupts the saved hash. Pass the raw string.
      const res = await authAPI.resetPassword(token, formData.password)
      login(res.data.user, res.data.token)
      toast.success('Password reset successfully! You are now logged in.')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-page)', fontFamily: 'var(--font-ui)', padding: 24
    }}>
      <style>{`
        .rp-input {
          width: 100%; padding: 12px 40px 12px 40px; border-radius: 10px;
          border: 1px solid var(--border-strong); background: var(--bg-surface-2);
          color: var(--text-primary); font-size: 14px; font-family: var(--font-ui);
          outline: none; transition: border-color 0.2s; box-sizing: border-box;
        }
        .rp-input:focus { border-color: var(--accent); }
        .rp-input::placeholder { color: var(--text-tertiary); }
        .rp-btn {
          width: 100%; padding: 13px; border-radius: 10px; border: none;
          background: var(--accent); color: var(--text-on-accent);
          font-size: 14px; font-weight: 500; cursor: pointer; transition: background 0.2s;
        }
        .rp-btn:hover:not(:disabled) { background: var(--accent-strong); }
        .rp-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .rp-eye {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; color: var(--text-tertiary);
          display: flex; padding: 2px;
        }
      `}</style>

      <div style={{
        maxWidth: 420, width: '100%', background: 'var(--bg-surface)',
        border: '1px solid var(--border-soft)', borderRadius: 'var(--radius-lg)',
        padding: '40px 36px', boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 'var(--text-3xl)', marginBottom: 10 }}>🔑</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
            Set new password
          </h1>
          <p style={{ color: 'var(--text-tertiary)', fontSize: 14 }}>
            Choose a strong password for your account
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              New Password
            </label>
            <div style={{ position: 'relative' }}>
              <FiLock size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                className="rp-input"
                type={showPassword ? 'text' : 'password'}
                name="password" value={formData.password}
                onChange={handleChange} required placeholder="Min 6 characters"
              />
              <button type="button" className="rp-eye" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
              </button>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              Confirm New Password
            </label>
            <div style={{ position: 'relative' }}>
              <FiLock size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                className="rp-input"
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword" value={formData.confirmPassword}
                onChange={handleChange} required placeholder="Repeat new password"
              />
            </div>
          </div>

          <button type="submit" className="rp-btn" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
          <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
            Back to login
          </Link>
        </p>
      </div>
    </div>
  )
}
