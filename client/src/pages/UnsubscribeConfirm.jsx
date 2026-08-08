import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { newsletterAPI } from '../services/api'
import { FiCheckCircle, FiXCircle, FiMail } from 'react-icons/fi'

export default function UnsubscribeConfirm() {
  const { token } = useParams()
  const [status, setStatus] = useState('processing') // 'processing' | 'success' | 'error'
  const [message, setMessage] = useState('')
  const ranRef = useRef(false)

  useEffect(() => {
    if (ranRef.current) return
    ranRef.current = true

    newsletterAPI.unsubscribeByToken(token)
      .then((res) => {
        setStatus('success')
        setMessage(res.data.message || "You've been unsubscribed.")
      })
      .catch((err) => {
        setStatus('error')
        setMessage(err.response?.data?.message || 'This unsubscribe link is invalid or has already been used.')
      })
  }, [token])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-page)', fontFamily: 'var(--font-ui)', padding: 24
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        .unsub-spinner {
          width: 32px; height: 32px; border-radius: 50%;
          border: 3px solid var(--border-soft); border-top-color: var(--accent);
          animation: spin 0.8s linear infinite; margin: 0 auto 20px;
        }
      `}</style>

      <div style={{
        maxWidth: 420, width: '100%', textAlign: 'center',
        background: 'var(--bg-surface)', border: '1px solid var(--border-soft)',
        borderRadius: 'var(--radius-lg)', padding: '48px 32px', boxShadow: 'var(--shadow-card)'
      }}>
        {status === 'processing' && (
          <>
            <div className="unsub-spinner" />
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)' }}>Processing your request…</p>
          </>
        )}

        {status === 'success' && (
          <>
            <FiCheckCircle size={48} style={{ color: 'var(--success)', marginBottom: 16 }} />
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
              Unsubscribed
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>{message}</p>
            <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <FiMail size={14} /> Changed your mind? You can resubscribe anytime from the homepage.
            </p>
            <Link to="/" style={{
              display: 'inline-block', padding: '12px 28px', background: 'var(--accent)',
              color: 'var(--text-on-accent)', borderRadius: 10, textDecoration: 'none',
              fontSize: 14, fontWeight: 500
            }}>
              Back to BlogSpace
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <FiXCircle size={48} style={{ color: 'var(--danger)', marginBottom: 16 }} />
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
              Something Went Wrong
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>{message}</p>
            <Link to="/" style={{
              display: 'inline-block', padding: '12px 28px', background: 'var(--bg-surface-2)',
              color: 'var(--text-primary)', border: '1px solid var(--border-strong)', borderRadius: 10,
              textDecoration: 'none', fontSize: 14, fontWeight: 500
            }}>
              Back to BlogSpace
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
