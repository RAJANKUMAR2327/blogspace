import { Link } from 'react-router-dom'
import SEO from '../components/common/SEO'

export default function NotFound() {
  return (
    <>
      <SEO title="Page Not Found" noIndex={true} />
      
      <div style={{ background: '#080810', minHeight: '100vh', paddingTop: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter',sans-serif", position: 'relative', overflow: 'hidden' }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@300;400;500&display=swap');
          @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
          @keyframes pulse { 0%,100%{opacity:0.5}50%{opacity:1} }
        `}</style>

        {/* Background */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '600px', height: '600px', background: 'radial-gradient(circle,rgba(124,58,237,0.08),transparent 70%)', borderRadius: '50%' }} />

        <div style={{ position: 'relative', textAlign: 'center', padding: '20px' }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(80px,15vw,160px)', fontWeight: 800, lineHeight: 1, marginBottom: 16, background: 'linear-gradient(135deg,rgba(167,139,250,0.3),rgba(96,165,250,0.1))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'float 4s ease-in-out infinite' }}>
            404
          </div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(24px,4vw,36px)', fontWeight: 800, color: '#fff', marginBottom: 12, letterSpacing: '-0.5px' }}>
            Page not found
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.35)', marginBottom: 40, fontWeight: 300, maxWidth: 400 }}>
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', background: 'linear-gradient(135deg,#7c3aed,#2563eb)', color: 'white', borderRadius: 12, textDecoration: 'none', fontSize: 15, fontWeight: 500, boxShadow: '0 8px 24px rgba(124,58,237,0.3)' }}>
              ← Back to home
            </Link>
            <Link to="/blogs" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', borderRadius: 12, textDecoration: 'none', fontSize: 15, fontWeight: 500, transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}>
              Browse stories →
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}