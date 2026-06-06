import { useState, useContext, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { ThemeContext } from '../../context/ThemeContext'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationAPI } from '../../services/api'
import { FiSun, FiMoon, FiMenu, FiX, FiSearch, FiUser, FiBell } from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'

export default function Navbar() {
  const { user, logout } = useContext(AuthContext)
  const { theme, toggleTheme } = useContext(ThemeContext)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const notifRef = useRef(null)

  // Close notification dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Unread count — poll every 30s
  const { data: unreadData } = useQuery({
    queryKey: ['unreadNotifications'],
    queryFn: () => notificationAPI.getUnread().then(r => r.data),
    enabled: !!user,
    refetchInterval: 30000,
  })

  // All notifications
  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationAPI.getAll().then(r => r.data),
    enabled: !!user && showNotifications,
  })

  const markReadMutation = useMutation({
    mutationFn: () => notificationAPI.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries(['unreadNotifications'])
      queryClient.invalidateQueries(['notifications'])
    }
  })

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
    }
  }

  const handleBellClick = () => {
    setShowNotifications(v => !v)
    if (!showNotifications && unreadData?.count > 0) {
      markReadMutation.mutate()
    }
  }

  const notifIcon = (type) => {
    const map = { like: '❤️', comment: '💬', follow: '👤', reply: '↩️', clap: '👏' }
    return map[type] || '🔔'
  }

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">BlogSpace</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Home</Link>
            <Link to="/blogs" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Blogs</Link>
            <Link to="/categories" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Categories</Link>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text" value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="pl-10 pr-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 w-52"
              />
            </div>
          </form>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            <button onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              {theme === 'dark'
                ? <FiSun className="text-yellow-400 text-xl" />
                : <FiMoon className="text-gray-600 text-xl" />
              }
            </button>

            {/* Notification Bell */}
            {user && (
              <div className="relative" ref={notifRef}>
                <button onClick={handleBellClick}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative">
                  <FiBell className="text-gray-600 dark:text-gray-300 text-xl" />
                  {unreadData?.count > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium">
                      {unreadData.count > 9 ? '9+' : unreadData.count}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                      <button onClick={() => markReadMutation.mutate()}
                        className="text-xs text-purple-600 dark:text-purple-400 hover:underline">
                        Mark all read
                      </button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {!notifData?.notifications?.length ? (
                        <div className="p-6 text-center text-gray-400 text-sm">
                          🔔 No notifications yet
                        </div>
                      ) : (
                        notifData.notifications.map(n => (
                          <div key={n._id}
                            className={`p-4 flex gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-50 dark:border-gray-700/50 ${!n.read ? 'bg-purple-50/50 dark:bg-purple-900/10' : ''}`}>
                            <span className="text-lg flex-shrink-0">{notifIcon(n.type)}</span>
                            <div className="min-w-0">
                              <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">{n.message}</p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Auth Buttons */}
            {user ? (
              <div className="hidden md:flex items-center gap-3 ml-1">
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-sm text-purple-600 dark:text-purple-400 hover:underline">
                    Dashboard
                  </Link>
                )}
                <Link to="/profile"
                  className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600">
                  {user.profileImage
                    ? <img src={user.profileImage} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
                    : <FiUser />
                  }
                  <span className="truncate max-w-20">{user.name}</span>
                </Link>
                <button onClick={logout} className="text-sm text-red-500 hover:underline">Logout</button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3 ml-1">
                <Link to="/login" className="text-sm text-gray-600 dark:text-gray-300 hover:text-purple-600">Login</Link>
                <Link to="/register"
                  className="text-sm bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 transition-colors">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 pt-2 space-y-2 border-t border-gray-100 dark:border-gray-800">
            <form onSubmit={handleSearch} className="px-2 mb-3">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text" value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
            </form>
            {[
              { to: '/', label: 'Home' },
              { to: '/blogs', label: 'Blogs' },
              { to: '/categories', label: 'Categories' },
            ].map(({ to, label }) => (
              <Link key={to} to={to}
                className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-purple-600"
                onClick={() => setMenuOpen(false)}>
                {label}
              </Link>
            ))}
            {user ? (
              <>
                <Link to="/profile" className="block px-4 py-2 hover:text-purple-600" onClick={() => setMenuOpen(false)}>Profile</Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="block px-4 py-2 hover:text-purple-600" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                )}
                <button onClick={() => { logout(); setMenuOpen(false) }}
                  className="block w-full text-left px-4 py-2 text-red-500">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-4 py-2 hover:text-purple-600" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link to="/register" className="block px-4 py-2 text-purple-600 font-medium" onClick={() => setMenuOpen(false)}>Sign Up</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}