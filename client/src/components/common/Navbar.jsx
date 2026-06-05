import { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { ThemeContext } from '../../context/ThemeContext'
import { FiSun, FiMoon, FiMenu, FiX, FiSearch } from 'react-icons/fi'

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
    }
  }

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 48px', height: '70px',
      background: theme === 'dark' ? 'rgba(10,10,15,0.9)' : 'rgba(250,249,246,0.9)',
      backdropFilter: 'blur(20px)',
      borderBottom: theme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
      fontFamily: "'DM Sans', sans-serif"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        .nav-link { font-size: 14px; color: ${theme === 'dark' ? 'rgba(255,255,255,0.6)' : '#3a3a4a'}; text-decoration: none; transition: color 0.2s; }
        .nav-link:hover { color: ${theme === 'dark' ? 'white' : '#0a0a0f'}; }
        .nav-btn-ghost { padding: 8px 20px; border: 1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}; border-radius: 100px; font-size: 14px; background: none; color: ${theme === 'dark' ? 'white' : '#0a0a0f'}; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
        .nav-btn-ghost:hover { background: ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#0a0a0f'}; color: ${theme === 'dark' ? 'white' : 'white'}; }
        .nav-btn-solid { padding: 8px 20px; border-radius: 100px; font-size: 14px; background: #c9a84c; color: #0a0a0f; border: none; cursor: pointer; font-family: 'DM Sans', sans-serif; font-weight: 500; transition: all 0.2s; }
        .nav-btn-solid:hover { background: #e8c96a; transform: translateY(-1px); }
        .search-input { background: ${theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}; border: 1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}; border-radius: 100px; padding: 8px 16px 8px 36px; font-size: 14px; color: ${theme === 'dark' ? 'white' : '#0a0a0f'}; outline: none; width: 200px; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
        .search-input:focus { width: 240px; border-color: #c9a84c; }
        .search-input::placeholder { color: ${theme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}; }
      `}</style>

      {/* Logo */}
      <Link to="/" style={{ fontFamily: "'Fraunces', serif", fontSize: '22px', fontWeight: 700, color: theme === 'dark' ? 'white' : '#0a0a0f', textDecoration: 'none', letterSpacing: '-0.5px' }}>
        Blog<span style={{ color: '#c9a84c' }}>Space</span>
      </Link>

      {/* Desktop Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }} className="hide-mobile">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/blogs" className="nav-link">Stories</Link>
        <Link to="/categories" className="nav-link">Topics</Link>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} style={{ position: 'relative' }} className="hide-mobile">
        <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#7a7a8a', fontSize: '14px' }} />
        <input
          className="search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search articles..."
        />
      </form>

      {/* Right Side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={toggleTheme} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme === 'dark' ? '#c9a84c' : '#3a3a4a', fontSize: '18px', display: 'flex', alignItems: 'center' }}>
          {theme === 'dark' ? <FiSun /> : <FiMoon />}
        </button>

        {user ? (
          <>
            {user.role === 'admin' && (
              <Link to="/admin" className="nav-link">Dashboard</Link>
            )}
            <Link to="/profile" className="nav-btn-ghost" style={{ textDecoration: 'none', display: 'inline-block', padding: '8px 20px' }}>
              {user.name.split(' ')[0]}
            </Link>
            <button onClick={logout} className="nav-btn-solid">Sign out</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Sign in</Link>
            <Link to="/register" className="nav-btn-solid" style={{ textDecoration: 'none' }}>Get started</Link>
          </>
        )}

        {/* Mobile Menu */}
        <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme === 'dark' ? 'white' : '#0a0a0f', fontSize: '20px', display: 'none' }} className="show-mobile">
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div style={{
          position: 'absolute', top: '70px', left: 0, right: 0,
          background: theme === 'dark' ? '#0a0a0f' : '#faf9f6',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px'
        }}>
          <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/blogs" className="nav-link" onClick={() => setMenuOpen(false)}>Stories</Link>
          <Link to="/categories" className="nav-link" onClick={() => setMenuOpen(false)}>Topics</Link>
          {user ? (
            <>
              <Link to="/profile" className="nav-link" onClick={() => setMenuOpen(false)}>Profile</Link>
              <button onClick={() => { logout(); setMenuOpen(false) }} style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', color: '#c4506a', fontSize: '14px', fontFamily: "'DM Sans', sans-serif" }}>Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link" onClick={() => setMenuOpen(false)}>Sign in</Link>
              <Link to="/register" className="nav-link" onClick={() => setMenuOpen(false)}>Get started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}