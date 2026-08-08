import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { userAPI } from '../../services/api'
import { FiTrendingUp, FiSearch, FiAward } from 'react-icons/fi'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

export default function PlatformAnalytics() {
  const { data, isLoading } = useQuery({
    queryKey: ['platformAnalytics'],
    queryFn: async () => {
      const res = await userAPI.getPlatformAnalytics()
      return res.data
    }
  })

  const dau = data?.dau || []
  const topSearches = data?.topSearches || []
  const topAuthors = data?.topAuthors || []

  const chartTooltipStyle = {
    background: 'var(--bg-surface)', border: '1px solid var(--border-strong)',
    borderRadius: 8, fontSize: 12, color: 'var(--text-primary)'
  }

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', paddingTop: 64, fontFamily: 'var(--font-ui)' }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }
        .pa-skeleton { background: var(--bg-surface-2); border-radius: 14px; animation: pulse 1.5s ease-in-out infinite; }
        .pa-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; }
        @media (max-width: 900px) { .pa-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div style={{ padding: 48 }}>
        <Link to="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', textDecoration: 'none', marginBottom: 8 }}>
          ← Back to dashboard
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <FiTrendingUp size={22} style={{ color: '#a78bfa' }} />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, color: 'var(--text-primary)' }}>Platform Analytics</h1>
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-tertiary)', marginBottom: 32 }}>
          Engagement, search trends, and top creators
        </p>

        {/* DAU Chart */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-soft)', borderRadius: 16, padding: 24, marginBottom: 16 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>
            Daily Active Users — Last 14 Days
          </h3>
          {isLoading ? (
            <div className="pa-skeleton" style={{ height: 240 }} />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={dau}>
                <defs>
                  <linearGradient id="colorDau" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" />
                <XAxis dataKey="date" stroke="var(--text-tertiary)" fontSize={10} />
                <YAxis stroke="var(--text-tertiary)" fontSize={10} allowDecimals={false} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Area type="monotone" dataKey="count" stroke="#a78bfa" fill="url(#colorDau)" name="Active users" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="pa-grid">
          {/* Top Searches */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-soft)', borderRadius: 16, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <FiSearch size={15} style={{ color: '#60a5fa' }} />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)' }}>
                Top Searches — Last 30 Days
              </h3>
            </div>
            {isLoading ? (
              <div className="pa-skeleton" style={{ height: 200 }} />
            ) : topSearches.length === 0 ? (
              <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)', padding: '20px 0', textAlign: 'center' }}>
                No searches recorded yet
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {topSearches.map((s, i) => (
                  <div key={s.query} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < topSearches.length - 1 ? '1px solid var(--border-soft)' : 'none' }}>
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{s.query}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 500 }}>{s.count}×</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Authors */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-soft)', borderRadius: 16, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <FiAward size={15} style={{ color: '#fbbf24' }} />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)' }}>
                Top Authors
              </h3>
            </div>
            {isLoading ? (
              <div className="pa-skeleton" style={{ height: 200 }} />
            ) : topAuthors.length === 0 ? (
              <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)', padding: '20px 0', textAlign: 'center' }}>
                No published articles yet
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {topAuthors.map(author => (
                  <div key={author.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: '50%',
                      background: author.profileImage ? 'transparent' : '#a78bfa',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700, color: '#fff', overflow: 'hidden', flexShrink: 0
                    }}>
                      {author.profileImage
                        ? <img src={author.profileImage} alt={author.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : author.name?.[0]?.toUpperCase()
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{author.name}</p>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{author.articleCount} articles</p>
                    </div>
                    <span style={{ fontSize: 12, color: '#34d399', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {author.totalViews.toLocaleString()} views
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
