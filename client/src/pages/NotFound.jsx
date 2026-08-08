import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import SEO from '../components/common/SEO'
import { FiSearch } from 'react-icons/fi'

export default function NotFound() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <>
      <SEO title="Page Not Found" noIndex={true} />
      
      <div style={{ background: 'var(--bg-page)', minHeight: '100vh', paddingTop: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter',sans-serif", position: 'relative', overflow: 'hidden' }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@300;400;500&display=swap');
          @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
          @keyframes pulse { 0%,100%{opacity:0.5}50%{opacity:1} }
        `}</style>

        {/* Background */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(color-mix(in srgb, var(--text-primary) 4%, transparent) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '600px', height: '600px', background: 'radial-gradient(circle,rgba(124,58,237,0.08),transparent 70%)', borderRadius: '50%' }} />

        <div style={{ position: 'relative', textAlign: 'center', padding: '20px' }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(80px,15vw,160px)', fontWeight: 800, lineHeight: 1, marginBottom: 16, background: 'linear-gradient(135deg,rgba(167,139,250,0.3),rgba(96,165,250,0.1))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'float 4s ease-in-out infinite' }}>
            404
          </div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(24px,4vw,36px)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '-0.5px' }}>
            Page not found
          </h1>
          <p style={{ fontSize: 'var(--text-md)', color: 'var(--text-tertiary)', marginBottom: 28, fontWeight: 300, maxWidth: 400 }}>
            The page you're looking for doesn't exist or has been moved.
          </p>

          <form onSubmit={handleSearch} style={{ position: 'relative', maxWidth: 380, margin: '0 auto 28px' }}>
            <FiSearch size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try searching for something else..."
              style={{
                width: '100%', padding: '13px 16px 13px 44px', borderRadius: 12,
                border: '1px solid var(--border-strong)', background: 'var(--bg-surface)',
                color: 'var(--text-primary)', fontSize: 'var(--text-base)', fontFamily: "'Inter',sans-serif",
                outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s'
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
            />
          </form>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', background: 'linear-gradient(135deg,#7c3aed,#2563eb)', color: 'white', borderRadius: 12, textDecoration: 'none', fontSize: 'var(--text-base)', fontWeight: 500, boxShadow: '0 8px 24px rgba(124,58,237,0.3)' }}>
              ← Back to home
            </Link>
            <Link to="/blogs" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', background: 'var(--bg-surface-2)', border: '1px solid var(--border-soft)', color: 'var(--text-secondary)', borderRadius: 12, textDecoration: 'none', fontSize: 'var(--text-base)', fontWeight: 500, transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--border-soft)'; e.currentTarget.style.color = 'var(--text-primary)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-surface-2)'; e.currentTarget.style.color = 'var(--text-secondary)' }}>
              Browse stories →
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}