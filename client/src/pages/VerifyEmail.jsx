import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { authAPI } from '../services/api'
import { FiCheckCircle, FiXCircle } from 'react-icons/fi'

export default function VerifyEmail() {
  const { token } = useParams()
  const [status, setStatus] = useState('verifying') // 'verifying' | 'success' | 'error'
  const [message, setMessage] = useState('')
  const ranRef = useRef(false)

  useEffect(() => {
    if (ranRef.current) return
    ranRef.current = true

    authAPI.verifyEmail(token)
      .then((res) => {
        setStatus('success')
        setMessage(res.data.message || 'Email verified successfully!')
      })
      .catch((err) => {
        setStatus('error')
        setMessage(err.response?.data?.message || 'Invalid or expired verification link')
      })
  }, [token])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-page)', fontFamily: 'var(--font-ui)', padding: 24
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        .verify-spinner {
          width: 32px; height: 32px; border-radius: 50%;
          border: 3px solid var(--border-soft); border-top-color: var(--accent);
          animation: spin 0.8s linear infinite; margin: 0 auto 20px;
        }
      `}</style>

      <div style={{
        maxWidth: 400, width: '100%', textAlign: 'center',
        background: 'var(--bg-surface)', border: '1px solid var(--border-soft)',
        borderRadius: 'var(--radius-lg)', padding: '48px 32px', boxShadow: 'var(--shadow-card)'
      }}>
        {status === 'verifying' && (
          <>
            <div className="verify-spinner" />
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)' }}>Verifying your email…</p>
          </>
        )}

        {status === 'success' && (
          <>
            <FiCheckCircle size={48} style={{ color: 'var(--success)', marginBottom: 16 }} />
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
              Email Verified
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>{message}</p>
            <Link to="/" style={{
              display: 'inline-block', padding: '12px 28px', background: 'var(--accent)',
              color: 'var(--text-on-accent)', borderRadius: 10, textDecoration: 'none',
              fontSize: 14, fontWeight: 500
            }}>
              Continue to BlogSpace
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <FiXCircle size={48} style={{ color: 'var(--danger)', marginBottom: 16 }} />
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
              Verification Failed
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>{message}</p>
            <Link to="/profile" style={{
              display: 'inline-block', padding: '12px 28px', background: 'var(--bg-surface-2)',
              color: 'var(--text-primary)', border: '1px solid var(--border-strong)', borderRadius: 10,
              textDecoration: 'none', fontSize: 14, fontWeight: 500
            }}>
              Go to Profile to resend
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
