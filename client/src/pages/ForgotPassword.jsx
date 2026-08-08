import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'
import { FiMail, FiArrowLeft } from 'react-icons/fi'

export default function ForgotPassword() {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return toast.error('Please enter your email')
    setLoading(true)
    try {
      await authAPI.forgotPassword(email)
      setSent(true)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong')
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
        .fp-input {
          width: 100%; padding: 12px 14px 12px 40px; border-radius: 10px;
          border: 1px solid var(--border-strong); background: var(--bg-surface-2);
          color: var(--text-primary); font-size: 14px; font-family: var(--font-ui);
          outline: none; transition: border-color 0.2s; box-sizing: border-box;
        }
        .fp-input:focus { border-color: var(--accent); }
        .fp-input::placeholder { color: var(--text-tertiary); }
        .fp-btn {
          width: 100%; padding: 13px; border-radius: 10px; border: none;
          background: var(--accent); color: var(--text-on-accent);
          font-size: 14px; font-weight: 500; cursor: pointer; transition: background 0.2s;
        }
        .fp-btn:hover:not(:disabled) { background: var(--accent-strong); }
        .fp-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      <div style={{
        maxWidth: 420, width: '100%', background: 'var(--bg-surface)',
        border: '1px solid var(--border-soft)', borderRadius: 'var(--radius-lg)',
        padding: '40px 36px', boxShadow: 'var(--shadow-card)'
      }}>
        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 44, marginBottom: 16 }}>📧</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
              Check your email
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
              We sent a reset link to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>.
              The link expires in 15 minutes.
            </p>
            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--accent)', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
              <FiArrowLeft size={14} /> Back to login
            </Link>
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ fontSize: 'var(--text-3xl)', marginBottom: 10 }}>🔐</div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                Forgot password?
              </h1>
              <p style={{ color: 'var(--text-tertiary)', fontSize: 14 }}>
                Enter your email and we'll send you a reset link
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <FiMail size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                  <input
                    className="fp-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <button type="submit" className="fp-btn" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', textDecoration: 'none' }}>
                <FiArrowLeft size={13} /> Back to login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
