import { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { ThemeContext } from '../../context/ThemeContext'
import { FiSearch, FiMenu, FiX, FiSun, FiMoon } from 'react-icons/fi'
import NotificationBell from './NotificationBell'

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
        .bs-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 48px; height: 64px;
          background: color-mix(in srgb, var(--bg-page) 85%, transparent);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border-soft);
          font-family: var(--font-ui);
          transition: background 0.25s ease, border-color 0.25s ease;
        }
        .bs-logo {
          font-family: var(--font-display); font-size: 20px; font-weight: 700;
          color: var(--accent);
          text-decoration: none;
        }
        .bs-nav-links { display: flex; align-items: center; gap: 28px; }
        .bs-nav-link {
          font-size: 13px; color: var(--text-secondary);
          text-decoration: none; transition: color 0.2s; letter-spacing: 0.3px;
          position: relative; padding: 4px 0;
        }
        .bs-nav-link:hover { color: var(--text-primary); }
        .bs-nav-link.active { color: var(--text-primary); font-weight: 500; }
        .bs-nav-link.active::after {
          content: ''; position: absolute; left: 0; right: 0; bottom: -6px;
          height: 2px; background: var(--accent); border-radius: 2px;
        }
        .bs-search-wrap { position: relative; }
        .bs-search-input {
          background: var(--bg-surface-2);
          border: 1px solid var(--border-soft);
          border-radius: var(--radius-sm); padding: 8px 14px 8px 34px;
          font-size: 13px; color: var(--text-primary); outline: none;
          width: 180px; font-family: var(--font-ui);
          transition: all 0.2s;
        }
        .bs-search-input:focus { width: 220px; border-color: var(--accent); }
        .bs-search-input::placeholder { color: var(--text-tertiary); }
        .bs-search-icon {
          position: absolute; left: 10px; top: 50%; transform: translateY(-50%);
          color: var(--text-tertiary); font-size: 14px; pointer-events: none;
        }
        .bs-btn-ghost {
          padding: 7px 16px; border: 1px solid var(--border-strong);
          border-radius: var(--radius-sm); font-size: 13px; background: none;
          color: var(--text-secondary); cursor: pointer;
          font-family: var(--font-ui); transition: all 0.2s;
          text-decoration: none; display: inline-block;
        }
        .bs-btn-ghost:hover { border-color: var(--text-tertiary); color: var(--text-primary); }
        .bs-btn-solid {
          padding: 7px 16px; border-radius: var(--radius-sm); font-size: 13px;
          background: var(--accent);
          color: var(--text-on-accent); border: none; cursor: pointer;
          font-family: var(--font-ui); font-weight: 500;
          transition: all 0.2s; text-decoration: none; display: inline-block;
        }
        .bs-btn-solid:hover { background: var(--accent-strong); transform: translateY(-1px); }
        .bs-write-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 7px 16px; border-radius: var(--radius-sm); font-size: 13px;
          background: var(--accent-soft); color: var(--accent-strong);
          border: 1px solid var(--accent); font-weight: 500;
          text-decoration: none; transition: all 0.2s;
        }
        .bs-write-btn:hover { background: var(--accent); color: var(--text-on-accent); }
        .bs-theme-btn {
          background: none; border: none; cursor: pointer;
          color: var(--text-secondary); font-size: 18px;
          display: flex; align-items: center; padding: 4px;
          transition: color 0.2s;
        }
        .bs-theme-btn:hover { color: var(--accent); }
        .bs-mobile-btn {
          background: none; border: none; cursor: pointer;
          color: var(--text-secondary); font-size: 22px;
          display: none; align-items: center; padding: 4px;
        }
        .bs-mobile-menu {
          position: fixed; top: 64px; left: 0; right: 0; bottom: 0;
          background: var(--bg-page); backdrop-filter: blur(20px);
          padding: 32px 48px; display: flex; flex-direction: column; gap: 20px;
          z-index: 999; border-top: 1px solid var(--border-soft);
        }
        .bs-mobile-link {
          font-size: 20px; color: var(--text-secondary);
          text-decoration: none; font-family: var(--font-display);
          font-weight: 600; transition: color 0.2s;
          padding: 8px 0; border-bottom: 1px solid var(--border-soft);
          display: flex; align-items: center; justify-content: space-between;
        }
        .bs-mobile-link:hover { color: var(--accent); }
        .bs-right { display: flex; align-items: center; gap: 10px; }
        @media (max-width: 768px) {
          .bs-nav { padding: 0 20px; }
          .bs-nav-links, .bs-search-wrap { display: none !important; }
          .bs-btn-ghost, .bs-btn-solid, .bs-write-btn { display: none !important; }
          .bs-mobile-btn { display: flex !important; }
        }
      `}</style>

      <nav className="bs-nav">
        <Link to="/" className="bs-logo">BlogSpace</Link>

        {/* Desktop Links */}
        <div className="bs-nav-links">
          <Link to="/" className="bs-nav-link">Home</Link>
          <Link to="/blogs" className="bs-nav-link">Stories</Link>
          <Link to="/categories" className="bs-nav-link">Topics</Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className="bs-nav-link">Dashboard</Link>
          )}
          {user && (
            <Link to="/author-dashboard" className="bs-nav-link">My Stats</Link>
          )}
        </div>

        {/* Desktop Search */}
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

        {/* Desktop Actions */}
        <div className="bs-right">
          <button onClick={toggleTheme} className="bs-theme-btn" aria-label="Toggle theme">
            {theme === 'dark' ? <FiSun /> : <FiMoon />}
          </button>

          {/* Render notification bell for logged-in desktop users */}
          {user && <NotificationBell />}

          {user?.role === 'admin' && (
            <Link to="/admin/create" className="bs-write-btn">Write</Link>
          )}

          {user ? (
            <>
              <Link to="/profile" className="bs-btn-ghost">{user.name.split(' ')[0]}</Link>
              <button onClick={logout} className="bs-btn-solid">Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="bs-btn-ghost">Sign in</Link>
              <Link to="/register" className="bs-btn-solid">Get started</Link>
            </>
          )}

          <button
            className="bs-mobile-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      {menuOpen && (
        <div className="bs-mobile-menu">
          <form onSubmit={handleSearch} style={{ position: 'relative' }}>
            <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
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
              {/* Added notification support to mobile layout */}
              <div className="bs-mobile-link" style={{ cursor: 'default' }}>
                <span>Notifications</span>
                <NotificationBell />
              </div>
              <Link to="/profile" className="bs-mobile-link" onClick={() => setMenuOpen(false)}>Profile</Link>
              <Link to="/author-dashboard" className="bs-mobile-link" onClick={() => setMenuOpen(false)}>My Stats</Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="bs-mobile-link" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              )}
              <button onClick={() => { logout(); setMenuOpen(false) }}
                style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', color: 'var(--danger)', fontSize: '20px', fontFamily: 'var(--font-display)', fontWeight: 600, padding: '8px 0' }}>
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