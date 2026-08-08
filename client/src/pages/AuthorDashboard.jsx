import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { userAPI } from '../services/api'
import { FiFileText, FiEye, FiHeart, FiMessageSquare, FiUsers, FiEdit2 } from 'react-icons/fi'

export default function AuthorDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['authorStats'],
    queryFn: async () => {
      const res = await userAPI.getAuthorStats()
      return res.data
    }
  })

  const stats = data?.stats
  const topArticles = data?.topArticles || []

  const STAT_CARDS = [
    { label: 'Total Articles', value: stats?.totalArticles, icon: FiFileText,      color: '#a78bfa' },
    { label: 'Published',      value: stats?.publishedCount, icon: FiFileText,     color: '#34d399' },
    { label: 'Drafts',         value: stats?.draftCount,     icon: FiEdit2,        color: '#fbbf24' },
    { label: 'Total Views',    value: stats?.totalViews,     icon: FiEye,          color: '#60a5fa' },
    { label: 'Total Likes',    value: stats?.totalLikes,     icon: FiHeart,        color: '#f472b6' },
    { label: 'Comments',       value: stats?.commentCount,   icon: FiMessageSquare, color: '#fb923c' },
    { label: 'Followers',      value: stats?.followersCount, icon: FiUsers,        color: '#818cf8' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', paddingTop: 64, fontFamily: 'var(--font-ui)' }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }
        .adash-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
        @media (max-width: 900px) { .adash-stats-grid { grid-template-columns: repeat(2, 1fr); } }
        .adash-row:hover { background: var(--bg-surface-2); }
      `}</style>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
          My Stats
        </h1>
        <p style={{ color: 'var(--text-tertiary)', fontSize: 14, marginBottom: 32 }}>
          Performance across all your articles
        </p>

        {isLoading ? (
          <div className="adash-stats-grid" style={{ marginBottom: 32 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ height: 100, borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-2)', animation: 'pulse 1.5s ease infinite' }} />
            ))}
          </div>
        ) : (
          <div className="adash-stats-grid" style={{ marginBottom: 32 }}>
            {STAT_CARDS.map(({ label, value, icon: Icon, color }) => (
              <div key={label} style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border-soft)',
                borderRadius: 'var(--radius-md)', padding: 18
              }}>
                <Icon size={16} style={{ color, marginBottom: 10 }} />
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                  {(value || 0).toLocaleString()}
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Top Articles */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-soft)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-soft)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>
              Top Performing Articles
            </h2>
          </div>

          {isLoading ? (
            <div style={{ padding: 24 }}>
              {[...Array(3)].map((_, i) => (
                <div key={i} style={{ height: 44, marginBottom: 10, borderRadius: 8, background: 'var(--bg-surface-2)', animation: 'pulse 1.5s ease infinite' }} />
              ))}
            </div>
          ) : topArticles.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-tertiary)', marginBottom: 16 }}>
                You haven't published anything yet.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-soft)' }}>
                    {['Title', 'Views', 'Likes', 'Read Time'].map(h => (
                      <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--text-tertiary)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {topArticles.map(article => (
                    <tr key={article._id} className="adash-row" style={{ borderBottom: '1px solid var(--border-soft)', transition: 'background 0.2s' }}>
                      <td style={{ padding: '14px 20px' }}>
                        <Link to={`/blog/${article.slug}`} style={{ color: 'var(--text-primary)', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>
                          {article.title}
                        </Link>
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{article.views || 0}</td>
                      <td style={{ padding: '14px 20px', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{article.likes || 0}</td>
                      <td style={{ padding: '14px 20px', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{article.readTime ? `${article.readTime} min` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
