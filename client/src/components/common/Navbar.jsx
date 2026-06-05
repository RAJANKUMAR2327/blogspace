import { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { ThemeContext } from '../../context/ThemeContext'
import { FiSun, FiMoon, FiMenu, FiX, FiSearch, FiUser } from 'react-icons/fi'

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
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              BlogSpace
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              Home
            </Link>
            <Link to="/blogs" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              Blogs
            </Link>
            <Link to="/categories" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              Categories
            </Link>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="pl-10 pr-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 w-52"
              />
            </div>
          </form>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {theme === 'dark'
                ? <FiSun className="text-yellow-400 text-xl" />
                : <FiMoon className="text-gray-600 text-xl" />
              }
            </button>

            {/* Auth Buttons */}
            {user ? (
              <div className="hidden md:flex items-center gap-3">
                {user.role === 'admin' && (
                  <Link to="/admin"
                    className="text-sm text-purple-600 dark:text-purple-400 hover:underline">
                    Dashboard
                  </Link>
                )}
                <Link to="/profile"
                  className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600">
                  <FiUser /> {user.name}
                </Link>
                <button
                  onClick={logout}
                  className="text-sm text-red-500 hover:underline">
                  Logout
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link to="/login"
                  className="text-sm text-gray-600 dark:text-gray-300 hover:text-purple-600">
                  Login
                </Link>
                <Link to="/register"
                  className="text-sm bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 transition-colors">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 pt-2 space-y-3 border-t border-gray-100 dark:border-gray-800">
            <form onSubmit={handleSearch} className="flex items-center gap-2 px-2">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles..."
                  className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
            </form>
            <Link to="/" className="block px-4 py-2 hover:text-purple-600" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link to="/blogs" className="block px-4 py-2 hover:text-purple-600" onClick={() => setMenuOpen(false)}>Blogs</Link>
            <Link to="/categories" className="block px-4 py-2 hover:text-purple-600" onClick={() => setMenuOpen(false)}>Categories</Link>
            {user ? (
              <>
                <Link to="/profile" className="block px-4 py-2 hover:text-purple-600" onClick={() => setMenuOpen(false)}>Profile</Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="block px-4 py-2 hover:text-purple-600" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                )}
                <button onClick={() => { logout(); setMenuOpen(false) }} className="block w-full text-left px-4 py-2 text-red-500">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-4 py-2 hover:text-purple-600" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link to="/register" className="block px-4 py-2 hover:text-purple-600" onClick={() => setMenuOpen(false)}>Sign Up</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}