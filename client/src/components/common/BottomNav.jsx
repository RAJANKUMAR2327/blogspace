import { useContext } from 'react'
import { NavLink } from 'react-router-dom'
import { FiHome, FiGrid, FiSearch, FiBookmark, FiUser } from 'react-icons/fi'
import { AuthContext } from '../../context/AuthContext'

const ITEMS = [
  { to: '/',           icon: FiHome,   label: 'Home' },
  { to: '/blogs',      icon: FiGrid,   label: 'Blogs' },
  { to: '/search',     icon: FiSearch, label: 'Search' },
]

// Mobile-only bottom tab bar. Hidden on desktop via CSS (index.css already
// reserves 70px of bottom padding on <768px viewports for this).
export default function BottomNav() {
  const { user } = useContext(AuthContext)

  const items = [
    ...ITEMS,
    user
      ? { to: '/profile', icon: FiUser, label: 'Profile' }
      : { to: '/login',   icon: FiUser, label: 'Login' }
  ]

  return (
    <>
      <style>{`
        .bs-bottom-nav { display: none; }
        @media (max-width: 768px) {
          .bs-bottom-nav {
            display: flex;
            position: fixed; bottom: 0; left: 0; right: 0; z-index: 1000;
            background: color-mix(in srgb, var(--bg-page) 92%, transparent);
            backdrop-filter: blur(20px);
            border-top: 1px solid var(--border-soft);
            padding: 8px 0 max(8px, env(safe-area-inset-bottom));
            font-family: var(--font-ui);
          }
        }
        .bs-bn-item {
          flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px;
          text-decoration: none; color: var(--text-tertiary); font-size: 10px;
          padding: 4px 0; transition: color 0.2s;
        }
        .bs-bn-item.active { color: var(--accent); }
      `}</style>
      <nav className="bs-bottom-nav">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `bs-bn-item ${isActive ? 'active' : ''}`}
            end={to === '/'}
          >
            <Icon size={19} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  )
}
