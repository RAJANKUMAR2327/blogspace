import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { blogAPI, userAPI, newsletterAPI } from '../../services/api'
import { 
  FiUsers, FiFileText, FiEye, FiHeart, FiPlus, FiEdit2, 
  FiTrash2, FiMessageSquare, FiUserX, FiTrendingUp, FiMail 
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import { AnimatePresence, motion } from 'framer-motion'
import {
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

const PIE_COLORS = ['#a78bfa', '#60a5fa', '#34d399', '#f472b6', '#fbbf24', '#fb923c', '#f87171', '#c084fc', '#4ade80', '#94a3b8']

export default function Dashboard() {
  const queryClient = useQueryClient()

  const { data: blogsData } = useQuery({
    queryKey: ['adminBlogs'],
    queryFn: async () => {
      const res = await blogAPI.getAll({ limit: 100 })
      return res.data
    }
  })

  const { data: platformData, isLoading: statsLoading } = useQuery({
    queryKey: ['platformStats'],
    queryFn: async () => {
      const res = await userAPI.getStats()
      return res.data
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => blogAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminBlogs'])
      toast.success('Blog deleted')
    }
  })

  const sendDigestMutation = useMutation({
    mutationFn: () => newsletterAPI.sendDigestNow(),
    onSuccess: (res) => toast.success(res.data.message || 'Digest sent successfully!'),
    onError: () => toast.error('Failed to send digest')
  })

  const stats = platformData?.stats
  const growth = platformData?.growth
  const categoryDist = platformData?.categoryDistribution || []

  const STAT_CARDS = [
    { label: 'Total Users',     value: stats?.totalUsers || 0,    icon: FiUsers,         color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
    { label: 'Total Articles', value: stats?.totalBlogs || 0,    icon: FiFileText,      color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
    { label: 'Total Views',    value: stats?.totalViews || 0,    icon: FiEye,           color: '#34d399', bg: 'rgba(52,211,153,0.1)' },
    { label: 'Total Likes',    value: stats?.totalLikes || 0,    icon: FiHeart,         color: '#f472b6', bg: 'rgba(244,114,182,0.1)' },
    { label: 'Comments',       value: stats?.totalComments || 0, icon: FiMessageSquare, color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
    { label: 'Banned Users',   value: stats?.bannedUsers || 0,   icon: FiUserX,         color: '#f87171', bg: 'rgba(248,113,113,0.1)' },
  ]

  const chartTooltipStyle = {
    background: 'var(--bg-surface)', border: '1px solid var(--border-strong)',
    borderRadius: 8, fontSize: 12, color: 'var(--text-primary)'
  }

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', paddingTop: 64, fontFamily: "'Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@300;400;500&display=swap');
        @keyframes pulse { 0%,100%{opacity:0.5}50%{opacity:1} }
        .skeleton { background:var(--bg-surface-2);border-radius:14px;animation:pulse 1.5s ease-in-out infinite; }
        .dash-row { transition:background 0.2s; }
        .dash-row:hover { background:var(--bg-surface-2); }
        .dash-action { padding:6px;border-radius:6px;border:none;cursor:pointer;display:flex;align-items:center;transition:all 0.2s;background:var(--bg-surface-2); }
        .dash-action.edit { color:rgba(96,165,250,0.7); }
        .dash-action.edit:hover { color:#60a5fa;background:rgba(96,165,250,0.1); }
        .dash-action.del { color:rgba(248,113,113,0.5); }
        .dash-action.del:hover { color:#f87171;background:rgba(248,113,113,0.1); }
        .quick-btn { transition: all 0.2s; }
      `}</style>

      <div style={{ padding: '48px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 'var(--text-xs)', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(167,139,250,0.6)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 16, height: 1, background: 'rgba(167,139,250,0.4)', display: 'inline-block' }} />
              Admin Panel
            </div>
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>Dashboard</h1>
          </div>
          <Link to="/admin/create" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '12px 24px', background: 'linear-gradient(135deg,#7c3aed,#2563eb)', color: 'white', borderRadius: 12, textDecoration: 'none', fontSize: 14, fontWeight: 500, boxShadow: '0 8px 24px rgba(124,58,237,0.3)' }}>
            <FiPlus /> New Story
          </Link>
        </div>

        {/* Stats Grid */}
        <AnimatePresence mode="wait">
        {statsLoading ? (
          <motion.div key="skeleton" exit={{ opacity: 0 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 14, marginBottom: 32 }}>
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 110 }} />)}
          </motion.div>
        ) : (
          <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 14, marginBottom: 32 }}>
            {STAT_CARDS.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-soft)', borderRadius: 14, padding: 18, transition: 'border-color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = color + '30'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-soft)'}>
                <div style={{ display: 'inline-flex', padding: 9, borderRadius: 9, background: bg, marginBottom: 12 }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2 }}>
                  {value.toLocaleString()}
                </p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{label}</p>
              </div>
            ))}
          </motion.div>
        )}
        </AnimatePresence>

        {/* Growth Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 32 }}>
          {/* User + Article Growth */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-soft)', borderRadius: 16, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <FiTrendingUp size={15} style={{ color: '#a78bfa' }} />
              <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)' }}>
                Growth — Last 30 Days
              </h3>
            </div>
            <AnimatePresence mode="wait">
            {statsLoading ? (
              <motion.div key="skeleton" exit={{ opacity: 0 }} className="skeleton" style={{ height: 240 }} />
            ) : (
              <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={growth?.users?.map((u, i) => ({
                  date: u.date.slice(5),
                  users: u.count,
                  articles: growth.articles[i]?.count || 0
                }))}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorArticles" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34d399" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" />
                  <XAxis dataKey="date" stroke="var(--text-tertiary)" fontSize={10} />
                  <YAxis stroke="var(--text-tertiary)" fontSize={10} allowDecimals={false} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Area type="monotone" dataKey="users" stroke="#a78bfa" fill="url(#colorUsers)" name="New users" strokeWidth={2} />
                  <Area type="monotone" dataKey="articles" stroke="#34d399" fill="url(#colorArticles)" name="New articles" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
              </motion.div>
            )}
            </AnimatePresence>
            <div style={{ display: 'flex', gap: 20, marginTop: 12, justifyContent: 'center' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#a78bfa' }} /> New users
              </span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399' }} /> New articles
              </span>
            </div>
          </div>

          {/* Category Distribution Pie */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-soft)', borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>
              Content by Category
            </h3>
            <AnimatePresence mode="wait">
            {statsLoading ? (
              <motion.div key="skeleton" exit={{ opacity: 0 }} className="skeleton" style={{ height: 240 }} />
            ) : categoryDist.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>
                No published articles yet
              </motion.div>
            ) : (
              <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={categoryDist} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
                    {categoryDist.map((entry, i) => (
                      <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={chartTooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              </motion.div>
            )}
            </AnimatePresence>
          </div>
        </div>

        {/* Quick Links */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 32 }}>
          {[
            { to: '/admin/users',     label: 'Manage Users',      icon: FiUsers,         color: '#60a5fa' },
            { to: '/admin/comments',  label: 'Manage Comments',   icon: FiMessageSquare, color: '#34d399' },
            { to: '/admin/analytics', label: 'Platform Analytics', icon: FiTrendingUp,    color: '#fbbf24' },
            { to: '/admin/create',    label: 'Write New Story',   icon: FiPlus,          color: '#a78bfa' },
          ].map(({ to, label, icon: Icon, color }) => (
            <Link key={to} to={to} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', background: 'var(--bg-surface)', border: '1px solid var(--border-soft)', borderRadius: 12, textDecoration: 'none', color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500, transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = color + '40'; e.currentTarget.style.color = 'var(--text-primary)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-soft)'; e.currentTarget.style.color = 'var(--text-secondary)' }}>
              <Icon size={18} style={{ color }} /> {label}
            </Link>
          ))}

          {/* Send Digest Button */}
          <button 
            className="quick-btn"
            onClick={() => { if (window.confirm('Send the weekly digest to all subscribers right now?')) sendDigestMutation.mutate() }}  
            disabled={sendDigestMutation.isPending}  
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(52,211,153,0.4)'; e.currentTarget.style.color = 'var(--text-primary)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-soft)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', background: 'var(--bg-surface)', border: '1px solid var(--border-soft)', borderRadius: 12, color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500, cursor: sendDigestMutation.isPending ? 'not-allowed' : 'pointer', fontFamily: "'Inter',sans-serif", opacity: sendDigestMutation.isPending ? 0.6 : 1 }}
          >  
            <FiMail size={18} style={{ color: '#34d399' }} /> 
            {sendDigestMutation.isPending ? 'Sending...' : 'Send Digest Now'}
          </button>
        </div>

        {/* Blog Table */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-soft)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)' }}>All Stories</h2>
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{blogsData?.blogs?.length || 0} total</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-soft)' }}>
                  {['Title','Category','Status','Views','Likes','Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--text-tertiary)', letterSpacing: '1px', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {blogsData?.blogs?.map(blog => (
                  <tr key={blog._id} className="dash-row" style={{ borderBottom: '1px solid var(--border-soft)' }}>
                    <td style={{ padding: '14px 20px' }}>
                      <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{blog.title}</p>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>{blog.author?.name}</p>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ fontSize: 'var(--text-xs)', letterSpacing: '1px', textTransform: 'uppercase', padding: '4px 10px', borderRadius: 6, background: 'rgba(167,139,250,0.1)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.2)' }}>
                        {blog.category}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        fontSize: 'var(--text-xs)', letterSpacing: '1px', textTransform: 'uppercase', padding: '4px 10px', borderRadius: 6,
                        background: blog.status === 'published' ? 'rgba(52,211,153,0.1)' : blog.status === 'archived' ? 'rgba(148,163,184,0.1)' : 'rgba(251,146,60,0.1)',
                        color: blog.status === 'published' ? '#34d399' : blog.status === 'archived' ? '#94a3b8' : '#fb923c',
                        border: `1px solid ${blog.status === 'published' ? 'rgba(52,211,153,0.2)' : blog.status === 'archived' ? 'rgba(148,163,184,0.2)' : 'rgba(251,146,60,0.2)'}`
                      }}>
                        {blog.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 14, color: 'var(--text-secondary)' }}>{blog.views || 0}</td>
                    <td style={{ padding: '14px 20px', fontSize: 14, color: 'var(--text-secondary)' }}>{blog.likes?.length || 0}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Link to={`/admin/edit/${blog._id}`} className="dash-action edit" style={{ textDecoration: 'none' }}>
                          <FiEdit2 size={15} />
                        </Link>
                        <button className="dash-action del"
                          onClick={() => window.confirm('Delete this story?') && deleteMutation.mutate(blog._id)}>
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!blogsData?.blogs?.length) && (
              <div style={{ textAlign: 'center', padding: '48px 20px' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
                <p style={{ color: 'var(--text-tertiary)', marginBottom: 16 }}>No stories yet</p>
                <Link to="/admin/create" style={{ display: 'inline-block', padding: '10px 24px', background: 'linear-gradient(135deg,#7c3aed,#2563eb)', color: 'white', borderRadius: 10, textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
                  Write your first story
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}