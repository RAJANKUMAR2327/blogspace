import { Link } from 'react-router-dom'
import { FiChevronRight, FiHome } from 'react-icons/fi'

/**
 * items: [{ label: 'Technology', to: '/blogs?category=Technology' }, { label: 'Some Article Title' }]
 * The last item is treated as the current page (no link, aria-current="page").
 */
export default function Breadcrumbs({ items = [] }) {
  return (
    <nav aria-label="Breadcrumb" style={{ fontFamily: 'var(--font-ui)', marginBottom: 20 }}>
      <ol style={{
        display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6,
        listStyle: 'none', padding: 0, margin: 0, fontSize: 'var(--text-sm)'
      }}>
        <li style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Link to="/" aria-label="Home" style={{ display: 'flex', alignItems: 'center', color: 'var(--text-tertiary)', textDecoration: 'none' }}>
            <FiHome size={13} />
          </Link>
        </li>
        {items.map((item, i) => {
          const isLast = i === items.length - 1
          return (
            <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
              <FiChevronRight size={12} aria-hidden="true" style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
              {isLast || !item.to ? (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  style={{
                    color: 'var(--text-secondary)', fontWeight: isLast ? 500 : 400,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 280
                  }}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.to}
                  style={{ color: 'var(--text-tertiary)', textDecoration: 'none', whiteSpace: 'nowrap' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
                >
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
