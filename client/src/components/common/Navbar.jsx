import { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { ThemeContext } from '../../context/ThemeContext'
import { FiSearch, FiMenu, FiX, FiSun, FiMoon } from 'react-icons/fi'

export default function Navbar() {
  const { user, logout } = useContext(AuthContext)
  const { theme, toggleTheme } = useContext(ThemeContext)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
      setMenuOpen(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500&display=swap');
        .bs-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 48px; height: 64px;
          background: rgba(8,8,16,0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          font-family: 'Inter', sans-serif;
        }
        .bs-logo {
          font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800;
          background: linear-gradient(135deg, #a78bfa, #60a5fa, #34d399);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          text-decoration: none;
        }
        .bs-nav-links { display: flex; align-items: center; gap: 28px; }
        .bs-nav-link {
          font-size: 13px; color: rgba(255,255,255,0.5);
          text-decoration: none; transition: color 0.2s; letter-spacing: 0.3px;
        }
        .bs-nav-link:hover { color: #fff; }
        .bs-search-wrap { position: relative; }
        .bs-search-input {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px; padding: 8px 14px 8px 34px;
          font-size: 13px; color: #fff; outline: none;
          width: 180px; font-family: 'Inter', sans-serif;
          transition: all 0.2s;
        }
        .bs-search-input:focus { width: 220px; border-color: rgba(167,139,250,0.4); }
        .bs-search-input::placeholder { color: rgba(255,255,255,0.25); }
        .bs-search-icon {
          position: absolute; left: 10px; top: 50%; transform: translateY(-50%);
          color: rgba(255,255,255,0.3); font-size: 14px; pointer-events: none;
        }
        .bs-btn-ghost {
          padding: 7px 16px; border: 1px solid rgba(255,255,255,0.12);
          border-radius: 8px; font-size: 13px; background: none;
          color: rgba(255,255,255,0.6); cursor: pointer;
          font-family: 'Inter', sans-serif; transition: all 0.2s;
          text-decoration: none; display: inline-block;
        }
        .bs-btn-ghost:hover { border-color: rgba(255,255,255,0.25); color: #fff; }
        .bs-btn-glow {
          padding: 7px 16px; border-radius: 8px; font-size: 13px;
          background: linear-gradient(135deg, #7c3aed, #2563eb);
          color: white; border: none; cursor: pointer;
          font-family: 'Inter', sans-serif; font-weight: 500;
          transition: all 0.2s; text-decoration: none; display: inline-block;
          box-shadow: 0 0 16px rgba(124,58,237,0.35);
        }
        .bs-btn-glow:hover { box-shadow: 0 0 28px rgba(124,58,237,0.6); transform: translateY(-1px); }
        .bs-theme-btn {
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.5); font-size: 18px;
          display: flex; align-items: center; padding: 4px;
          transition: color 0.2s;
        }
        .bs-theme-btn:hover { color: #a78bfa; }
        .bs-mobile-btn {
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.7); font-size: 22px;
          display: none; align-items: center; padding: 4px;
        }
        .bs-mobile-menu {
          position: fixed; top: 64px; left: 0; right: 0; bottom: 0;
          background: rgba(8,8,16,0.97); backdrop-filter: blur(20px);
          padding: 32px 48px; display: flex; flex-direction: column; gap: 20px;
          z-index: 999; border-top: 1px solid rgba(255,255,255,0.06);
        }
        .bs-mobile-link {
          font-size: 20px; color: rgba(255,255,255,0.7);
          text-decoration: none; font-family: 'Syne', sans-serif;
          font-weight: 600; transition: color 0.2s;
          padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .bs-mobile-link:hover { color: #a78bfa; }
        .bs-right { display: flex; align-items: center; gap: 10px; }
        @media (max-width: 768px) {
          .bs-nav { padding: 0 20px; }
          .bs-nav-links, .bs-search-wrap { display: none !important; }
          .bs-btn-ghost, .bs-btn-glow { display: none !important; }
          .bs-mobile-btn { display: flex !important; }
        }
      `}</style>

      <nav className="bs-nav">
        <Link to="/" className="bs-logo">BlogSpace</Link>

        <div className="bs-nav-links">
          <Link to="/" className="bs-nav-link">Home</Link>
          <Link to="/blogs" className="bs-nav-link">Stories</Link>
          <Link to="/categories" className="bs-nav-link">Topics</Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className="bs-nav-link">Dashboard</Link>
          )}
        </div>

        <form onSubmit={handleSearch} className="bs-search-wrap">
          <FiSearch className="bs-search-icon" />
          <input
            className="bs-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stories..."
          />
        </form>

        <div className="bs-right">
          <button onClick={toggleTheme} className="bs-theme-btn">
            {theme === 'dark' ? <FiSun /> : <FiMoon />}
          </button>

          {user ? (
            <>
              <Link to="/profile" className="bs-btn-ghost">{user.name.split(' ')[0]}</Link>
              <button onClick={logout} className="bs-btn-glow">Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="bs-btn-ghost">Sign in</Link>
              <Link to="/register" className="bs-btn-glow">Get started</Link>
            </>
          )}

          <button
            className="bs-mobile-btn"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="bs-mobile-menu">
          <form onSubmit={handleSearch} style={{ position: 'relative' }}>
            <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
            <input
              className="bs-search-input"
              style={{ width: '100%' }}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stories..."
            />
          </form>
          <Link to="/" className="bs-mobile-link" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/blogs" className="bs-mobile-link" onClick={() => setMenuOpen(false)}>Stories</Link>
          <Link to="/categories" className="bs-mobile-link" onClick={() => setMenuOpen(false)}>Topics</Link>
          {user ? (
            <>
              <Link to="/profile" className="bs-mobile-link" onClick={() => setMenuOpen(false)}>Profile</Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="bs-mobile-link" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              )}
              <button onClick={() => { logout(); setMenuOpen(false) }}
                style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', color: '#f87171', fontSize: '20px', fontFamily: "'Syne', sans-serif", fontWeight: 600, padding: '8px 0' }}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="bs-mobile-link" onClick={() => setMenuOpen(false)}>Sign in</Link>
              <Link to="/register" className="bs-mobile-link" onClick={() => setMenuOpen(false)}>Get started</Link>
            </>
          )}
        </div>
      )}
    </>
  )
}
